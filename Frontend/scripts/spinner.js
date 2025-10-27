function showSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.classList.remove("hidden");
}

function hideSpinner(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.classList.add("hidden");
}
