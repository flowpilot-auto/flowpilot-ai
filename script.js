document.getElementById("year").textContent = new Date().getFullYear();

document.getElementById("trialForm").addEventListener("submit", function (event) {
  event.preventDefault();
  const button = this.querySelector("button");
  const original = button.innerHTML;
  button.innerHTML = "Demo form received ✓";
  button.disabled = true;
  setTimeout(() => {
    button.innerHTML = original;
    button.disabled = false;
  }, 3000);
});