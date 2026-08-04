(() => {
  const form = document.getElementById("loginForm");
  const button = document.getElementById("loginButton");
  const status = document.getElementById("loginStatus");
  const warning = document.getElementById("setupWarning");
  const client = window.getLRLSupabase?.();

  function showStatus(message, type = "") {
    status.textContent = message;
    status.className = `status-box is-visible ${type ? `is-${type}` : ""}`;
  }

  if (!client) {
    warning.hidden = false;
    form.querySelectorAll("input, button").forEach(element => element.disabled = true);
    return;
  }

  client.auth.getSession().then(({ data }) => {
    if (data.session) {
      window.location.replace("admin.html");
    }
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    button.disabled = true;
    showStatus("Signing in…");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      button.disabled = false;
      showStatus(error.message || "Login failed.", "error");
      return;
    }

    showStatus("Login successful. Opening LRL Admin…", "success");
    window.location.replace("admin.html");
  });
})();
