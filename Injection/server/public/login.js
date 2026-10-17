const error = document.getElementById("error");

if (error !== null && new URLSearchParams(location.search).get("error") === "1") {
  error.hidden = false;
}

const toggle = document.getElementById("toggle-password");
const password = document.getElementById("password");

toggle.addEventListener("click", () => {
  const showing = password.type === "text";
  password.type = showing ? "password" : "text";
  toggle.textContent = showing ? "Show" : "Hide";
});
