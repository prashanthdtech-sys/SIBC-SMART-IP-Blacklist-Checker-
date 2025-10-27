const blacklistInput = document.getElementById("blacklistInput");
const blacklistBtn = document.getElementById("blacklistCheckBtn");
const resultsBody = document.getElementById("blacklistResultsBody");
const resultsContainer = document.getElementById("blacklistResults");
const blacklistError = document.getElementById("blacklistError");

// restore previous input + last results if they exist
blacklistInput.value = localStorage.getItem("blacklistInput") || "";
const savedResults = localStorage.getItem("blacklistResults");
if (savedResults) {
  resultsContainer.classList.remove("hidden");
  resultsBody.innerHTML = savedResults;
}

// update localStorage while typing
blacklistInput.addEventListener("input", () => {
  localStorage.setItem("blacklistInput", blacklistInput.value);
});

async function checkBlacklist() {
  const ip = blacklistInput.value.trim();
  if (!ip) {
    showError("Please enter an IP or CIDR");
    return;
  }

  // reset UI before new lookup
  resultsBody.innerHTML = "";
  resultsContainer.classList.add("hidden");
  hideError();
  showSpinner("blacklistSpinner");

  try {
    // hit backend endpoint for blacklist check
    const response = await fetch(
      `http://localhost:5000/api/blacklist?ip=${encodeURIComponent(ip)}`
    );
    if (!response.ok) throw new Error("Network error");

    const data = await response.json();

    // render table rows
    if (!data.results || data.results.length === 0) {
      resultsBody.innerHTML = `<tr><td colspan="2">No blacklisted IPs found.</td></tr>`;
    } else {
      resultsBody.innerHTML = data.results
        .map((ipData) => {
          const sites = ipData.blacklistedOn
            .map(
              (s) => `<a href="${s.removalUrl}" target="_blank">${s.site}</a>`
            )
            .join(", ");
          return `<tr><td>${ipData.ip}</td><td>${sites || "None"}</td></tr>`;
        })
        .join("");
    }

    // reveal + store results
    resultsContainer.classList.remove("hidden");
    localStorage.setItem("blacklistResults", resultsBody.innerHTML);
  } catch (err) {
    console.error(err);
    showError("Error checking blacklist. Please try again later.");
  } finally {
    hideSpinner("blacklistSpinner");
  }
}

// quick UI helpers for error messages
function showError(msg) {
  blacklistError.textContent = msg;
  blacklistError.classList.remove("hidden");
}

function hideError() {
  blacklistError.textContent = "";
  blacklistError.classList.add("hidden");
}

// button + Enter key both trigger the check
blacklistBtn.addEventListener("click", checkBlacklist);
blacklistInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkBlacklist();
});
