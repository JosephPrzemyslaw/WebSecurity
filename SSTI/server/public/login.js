const error = document.getElementById("error");

const messages = {
  invalid: "Invalid login or password",
  server: "Something went wrong. Try again.",
};

const params = new URLSearchParams(location.search);
const code = params.get("error");
if (error && code && messages[code]) {
  error.hidden = false;
  error.textContent = messages[code];
}

const nextField = document.getElementById("next");
const nextParam = params.get("next");
if (nextField && typeof nextParam === "string") {
  nextField.value = nextParam;
}

const toggle = document.getElementById("toggle-password");
const password = document.getElementById("password");

toggle.addEventListener("click", () => {
  const showing = password.type === "text";
  password.type = showing ? "password" : "text";
  toggle.textContent = showing ? "Show" : "Hide";
});