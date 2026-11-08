const error = document.getElementById("error");

const messages = {
  invalid: "Invalid login or password",
  server: "Something went wrong. Try again.",
};

const code = new URLSearchParams(location.search).get("error");
if (error && code && messages[code]) {
  error.hidden = false;
  error.textContent = messages[code];
}

const toggle = document.getElementById("toggle-password");
const password = document.getElementById("password");

toggle.addEventListener("click", () => {
  const showing = password.type === "text";
  password.type = showing ? "password" : "text";
  toggle.textContent = showing ? "Show" : "Hide";
});
