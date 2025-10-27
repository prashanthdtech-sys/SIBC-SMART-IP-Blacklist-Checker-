//Each object in the dnsblLists array represents a DNSBL provider.
//domains is an array of DNSBL domain names that your backend will query using DNS.
//removal is a function that generates a link to the provider’s removal page for a given IP.
//Export it using module.exports so the backend can use it.

const dnsblList = [
  {
    name: "SampleDNSBL1",
    domains: ["sbl1.example.com"],
    removal: (ip) => `https://sbl1.example.com/remove?ip=${ip}`,
  },
  {
    name: "SampleDNSBL2",
    domains: ["sbl2.example.com"],
    removal: (ip) => `https://sbl2.example.com/remove?ip=${ip}`,
  },
];

module.exports = { dnsblList };
