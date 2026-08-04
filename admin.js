(() => {
  const client = window.getLRLSupabase?.();
  const statusBox = document.getElementById("adminStatus");
  const identity = document.getElementById("adminIdentity");

  function showStatus(message, type = "") {
    statusBox.textContent = message;
    statusBox.className = `status-box is-visible ${type ? `is-${type}` : ""}`;
    window.setTimeout(() => {
      statusBox.className = "status-box";
    }, 4500);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  if (!client) {
    window.location.replace("admin-login.html");
    return;
  }

  let teams = [];
  let standings = [];

  async function requireAdmin() {
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) {
      window.location.replace("admin-login.html");
      return false;
    }

    const user = sessionData.session.user;
    const { data: adminRow, error } = await client
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !adminRow) {
      await client.auth.signOut();
      alert("This account is not authorized as an LRL admin.");
      window.location.replace("admin-login.html");
      return false;
    }

    identity.textContent = `Signed in as ${user.email}`;
    return true;
  }

  document.getElementById("logoutButton").addEventListener("click", async () => {
    await client.auth.signOut();
    window.location.replace("admin-login.html");
  });

  document.querySelectorAll(".admin-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".admin-tab").forEach(item => item.classList.remove("is-active"));
      document.querySelectorAll(".admin-panel").forEach(panel => panel.classList.remove("is-active"));
      tab.classList.add("is-active");
      document.getElementById(tab.dataset.panel).classList.add("is-active");
    });
  });

  function resetTeamForm() {
    document.getElementById("teamForm").reset();
    document.getElementById("teamId").value = "";
    document.getElementById("teamColor").value = "#596170";
    document.getElementById("teamOrder").value = "0";
    document.getElementById("teamFormTitle").textContent = "Add Team";
  }

  function resetStandingForm() {
    document.getElementById("standingForm").reset();
    document.getElementById("standingId").value = "";
    document.getElementById("driverPoints").value = "0";
    document.getElementById("driverWins").value = "0";
    document.getElementById("driverPodiums").value = "0";
    document.getElementById("driverRaces").value = "0";
    document.getElementById("standingOrder").value = "0";
    document.getElementById("standingFormTitle").textContent = "Add Driver";
  }

  document.getElementById("cancelTeamEdit").addEventListener("click", resetTeamForm);
  document.getElementById("cancelStandingEdit").addEventListener("click", resetStandingForm);

  function renderTeams() {
    const list = document.getElementById("teamList");
    if (!teams.length) {
      list.innerHTML = `<div class="empty-state">No teams in the database yet.</div>`;
      return;
    }

    list.innerHTML = teams.map(team => `
      <article class="record">
        <span class="record-color" style="background:${escapeHtml(team.color || "#596170")}"></span>
        <div>
          <h3>${escapeHtml(team.name)}</h3>
          <p>
            ${escapeHtml(team.status || "Active")} ·
            Owner: ${escapeHtml(team.owner_name || "TBA")} ·
            Drivers: ${escapeHtml(team.driver_1 || "TBA")} / ${escapeHtml(team.driver_2 || "TBA")}
          </p>
        </div>
        <div class="record-buttons">
          <button class="button" data-edit-team="${team.id}" type="button">EDIT</button>
          <button class="button button--danger" data-delete-team="${team.id}" type="button">DELETE</button>
        </div>
      </article>
    `).join("");

    list.querySelectorAll("[data-edit-team]").forEach(button => {
      button.addEventListener("click", () => editTeam(button.dataset.editTeam));
    });
    list.querySelectorAll("[data-delete-team]").forEach(button => {
      button.addEventListener("click", () => deleteTeam(button.dataset.deleteTeam));
    });
  }

  function renderStandings() {
    const list = document.getElementById("standingList");
    if (!standings.length) {
      list.innerHTML = `<div class="empty-state">No championship entries yet.</div>`;
      return;
    }

    const sorted = [...standings].sort((a, b) =>
      Number(b.points || 0) - Number(a.points || 0) ||
      Number(b.wins || 0) - Number(a.wins || 0) ||
      Number(b.podiums || 0) - Number(a.podiums || 0) ||
      Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );

    list.innerHTML = sorted.map((row, index) => `
      <article class="record">
        <span class="record-color" style="background:${index === 0 ? "#b51bd7" : "#596170"}"></span>
        <div>
          <h3>P${index + 1} · ${escapeHtml(row.driver_name)}</h3>
          <p>
            ${escapeHtml(row.team_name || "Independent")} ·
            ${Number(row.points || 0)} pts · ${Number(row.wins || 0)} wins ·
            ${Number(row.podiums || 0)} podiums · ${Number(row.races || 0)} races
          </p>
        </div>
        <div class="record-buttons">
          <button class="button" data-edit-standing="${row.id}" type="button">EDIT</button>
          <button class="button button--danger" data-delete-standing="${row.id}" type="button">DELETE</button>
        </div>
      </article>
    `).join("");

    list.querySelectorAll("[data-edit-standing]").forEach(button => {
      button.addEventListener("click", () => editStanding(button.dataset.editStanding));
    });
    list.querySelectorAll("[data-delete-standing]").forEach(button => {
      button.addEventListener("click", () => deleteStanding(button.dataset.deleteStanding));
    });
  }

  async function loadTeams() {
    const { data, error } = await client
      .from("teams")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      showStatus(`Could not load teams: ${error.message}`, "error");
      return;
    }
    teams = data || [];
    renderTeams();
  }

  async function loadStandings() {
    const { data, error } = await client.from("standings").select("*");
    if (error) {
      showStatus(`Could not load standings: ${error.message}`, "error");
      return;
    }
    standings = data || [];
    renderStandings();
  }

  document.getElementById("teamForm").addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("teamId").value;
    const payload = {
      name: document.getElementById("teamName").value.trim(),
      color: document.getElementById("teamColor").value,
      status: document.getElementById("teamStatus").value,
      owner_name: document.getElementById("teamOwner").value.trim() || null,
      driver_1: document.getElementById("teamDriver1").value.trim() || null,
      driver_2: document.getElementById("teamDriver2").value.trim() || null,
      reserve_driver: document.getElementById("teamReserve").value.trim() || null,
      sort_order: Number(document.getElementById("teamOrder").value || 0)
    };

    const result = id
      ? await client.from("teams").update(payload).eq("id", id)
      : await client.from("teams").insert(payload);

    if (result.error) {
      showStatus(`Team could not be saved: ${result.error.message}`, "error");
      return;
    }

    showStatus("Team saved. The public website will update automatically.", "success");
    resetTeamForm();
    await loadTeams();
  });

  document.getElementById("standingForm").addEventListener("submit", async event => {
    event.preventDefault();

    const id = document.getElementById("standingId").value;
    const payload = {
      driver_name: document.getElementById("driverName").value.trim(),
      team_name: document.getElementById("driverTeam").value.trim() || null,
      points: Number(document.getElementById("driverPoints").value || 0),
      wins: Number(document.getElementById("driverWins").value || 0),
      podiums: Number(document.getElementById("driverPodiums").value || 0),
      races: Number(document.getElementById("driverRaces").value || 0),
      sort_order: Number(document.getElementById("standingOrder").value || 0)
    };

    const result = id
      ? await client.from("standings").update(payload).eq("id", id)
      : await client.from("standings").insert(payload);

    if (result.error) {
      showStatus(`Driver could not be saved: ${result.error.message}`, "error");
      return;
    }

    showStatus("Standings updated. The public website will update automatically.", "success");
    resetStandingForm();
    await loadStandings();
  });

  function editTeam(id) {
    const team = teams.find(item => item.id === id);
    if (!team) return;

    document.getElementById("teamId").value = team.id;
    document.getElementById("teamName").value = team.name || "";
    document.getElementById("teamColor").value = team.color || "#596170";
    document.getElementById("teamStatus").value = team.status || "Active";
    document.getElementById("teamOwner").value = team.owner_name || "";
    document.getElementById("teamDriver1").value = team.driver_1 || "";
    document.getElementById("teamDriver2").value = team.driver_2 || "";
    document.getElementById("teamReserve").value = team.reserve_driver || "";
    document.getElementById("teamOrder").value = String(team.sort_order || 0);
    document.getElementById("teamFormTitle").textContent = "Edit Team";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editStanding(id) {
    const row = standings.find(item => item.id === id);
    if (!row) return;

    document.getElementById("standingId").value = row.id;
    document.getElementById("driverName").value = row.driver_name || "";
    document.getElementById("driverTeam").value = row.team_name || "";
    document.getElementById("driverPoints").value = String(row.points || 0);
    document.getElementById("driverWins").value = String(row.wins || 0);
    document.getElementById("driverPodiums").value = String(row.podiums || 0);
    document.getElementById("driverRaces").value = String(row.races || 0);
    document.getElementById("standingOrder").value = String(row.sort_order || 0);
    document.getElementById("standingFormTitle").textContent = "Edit Driver";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTeam(id) {
    const team = teams.find(item => item.id === id);
    if (!team || !confirm(`Delete ${team.name}?`)) return;

    const { error } = await client.from("teams").delete().eq("id", id);
    if (error) {
      showStatus(`Team could not be deleted: ${error.message}`, "error");
      return;
    }
    showStatus("Team deleted.", "success");
    await loadTeams();
  }

  async function deleteStanding(id) {
    const row = standings.find(item => item.id === id);
    if (!row || !confirm(`Delete ${row.driver_name} from the standings?`)) return;

    const { error } = await client.from("standings").delete().eq("id", id);
    if (error) {
      showStatus(`Driver could not be deleted: ${error.message}`, "error");
      return;
    }
    showStatus("Driver removed from standings.", "success");
    await loadStandings();
  }

  (async () => {
    if (!(await requireAdmin())) return;
    await Promise.all([loadTeams(), loadStandings()]);
  })();
})();
