function clearBlacklist() {
  const input = document.getElementById("blacklistInput");
  const resultsBody = document.getElementById("blacklistResultsBody");
  const resultsContainer = document.getElementById("blacklistResults");
  const error = document.getElementById("blacklistError");
  const spinner = document.getElementById("blacklistSpinner");

  input.value = "";
  resultsBody.innerHTML = "";
  resultsContainer.classList.add("hidden");
  spinner.classList.add("hidden");
  error.classList.add("hidden");

  localStorage.removeItem("blacklistInput");
  localStorage.removeItem("blacklistResults");
}
