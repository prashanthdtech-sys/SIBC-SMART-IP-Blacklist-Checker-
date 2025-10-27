const dns = require("dns").promises;
const pLimit = require("p-limit");
const { dnsblLists } = require("../DNSBLS/dnsblLists");

// Concurrency cap for DNS lookups (200 async requests at a time)
const CONCURRENCY_LIMIT = 200;
const limit = pLimit(CONCURRENCY_LIMIT);
const cache = new Map(); // simple in-memory cache to avoid redundant lookups


// reverse an IP address (e.g. 1.2.3.4 -> 4.3.2.1)
const reversed = (ip) => ip.split(".").reverse().join(".");

// expands a CIDR block into a list of individual IPs
function expandCIDR(cidr) {
  const [base, mask] = cidr.split("/");
  if (!base || !mask) return null;

  const maskInt = parseInt(mask, 10);
  if (maskInt < 0 || maskInt > 32) return null;

  // break base IP into numeric parts
  const parts = base.split(".").map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return null;

  // convert base IP to 32-bit integer
  const baseInt =
    (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
  const size = 2 ** (32 - maskInt); // number of IPs in this block

  // generate each IP by incrementing the base integer
  return Array.from({ length: size }, (_, i) => {
    const ipInt = baseInt + i;
    return [
      (ipInt >> 24) & 0xff,
      (ipInt >> 16) & 0xff,
      (ipInt >> 8) & 0xff,
      ipInt & 0xff,
    ].join(".");
  });
}

// ---------- Check IP ----------

// performs DNSBL lookups for a given IP across all listed DNSBL providers
async function checkIP(ip, queriedDomains) {
  const rev = reversed(ip);
  const tasks = [];

  for (const list of dnsblLists) {
    for (const domain of list.domains) {
      // skip already queried domains in this batch
      if (queriedDomains.has(domain)) {
        continue;
      }

      const key = `${ip}-${domain}`;

      // use cache if result already exists
      if (cache.has(key)) {
        if (cache.get(key).listed) {
          tasks.push(Promise.resolve(cache.get(key)));
        }
        continue;
      }

      // queue the actual DNS query with concurrency limit
      tasks.push(
        limit(async () => {
          try {
            await dns.resolve4(`${rev}.${domain}`); // lookup reversed IP in DNSBL
            const result = {
              ip,
              dnsbl: domain,
              listed: true,
              removal: list.removal(ip), // link to removal instructions if available
            };
            cache.set(key, result);
            return result;
          } catch {
            // if not found, mark as not listed
            cache.set(key, { ip, dnsbl: domain, listed: false });
            return null;
          } finally {
            queriedDomains.add(domain);
          }
        })
      );
    }
  }

  // wait for all lookups to finish
  const results = await Promise.allSettled(tasks);

  // filter successful and positive listings
  return results
    .filter((r) => r.status === "fulfilled" && r.value && r.value.listed)
    .map((r) => r.value);
}

// ----------Format----------

// reformat results so frontend can easily display them
function formatForFrontend(arr) {
  const map = new Map();

  arr.forEach((item) => {
    if (!map.has(item.ip)) map.set(item.ip, []);
    map.get(item.ip).push({ site: item.dnsbl, removalUrl: item.removal });
  });

  return Array.from(map.entries()).map(([ip, blacklistedOn]) => ({
    ip,
    blacklistedOn,
  }));
}

// ---------- Query Handler ----------

// main Express handler for /blacklist endpoint
async function blacklistHandler(req, res) {
  const query = req.query.ip;
  if (!query) return res.status(400).json({ error: "IP or CIDR required" });

  // handle single IP or CIDR range
  let ips = query.includes("/") ? expandCIDR(query) : [query];
  if (!ips) return res.status(400).json({ error: "Invalid CIDR block" });

  try {
    const queriedDomains = new Set();
    const allResults = await Promise.all(
      ips.map((ip) => checkIP(ip, queriedDomains))
    );
    const blacklisted = allResults.flat();

    // dedupe results (avoid same IP/list pair showing twice)
    const unique = blacklisted.filter(
      (v, i, a) =>
        i === a.findIndex((t) => t.ip === v.ip && t.dnsbl === v.dnsbl)
    );

    res.json({ results: formatForFrontend(unique), checkedIPs: ips.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = { blacklistHandler };
