(() => {
  const data = window.LRL_DATA;

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  document.querySelectorAll("[data-link]").forEach(link => {
    const key = link.dataset.link;
    if (data.links[key]) {
      link.href = data.links[key];
      if (key !== "regulations") {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    }
  });

  const calendarGrid = document.getElementById("calendarGrid");
  data.calendar.forEach(item => {
    const card = document.createElement("article");
    card.className = "round-card";
    card.dataset.round = String(item.round).padStart(2, "0");
    card.innerHTML = `
      <div class="round-top">
        <span class="round-number">Round ${item.round}</span>
        <span class="status-pill ${item.vote ? "status-pill--vote" : ""}">${escapeHtml(item.status)}</span>
      </div>
      <h3>${escapeHtml(item.event)}</h3>
      <p>${escapeHtml(item.venue)}</p>
      <span class="round-date">${escapeHtml(item.date)}</span>
    `;
    calendarGrid.appendChild(card);
  });

  const teamGrid = document.getElementById("teamGrid");

  function renderTeams(teams) {
    teamGrid.innerHTML = "";
    teams.forEach(team => {
      const open = team.open === true || String(team.status || "").toLowerCase() === "open";
      const detail = team.detail || (open ? "Applications available" : "Active Season 1 team");
      const card = document.createElement("article");
      card.className = `team-card ${open ? "team-card--open" : ""}`;

      const people = [
        team.owner_name ? `<span><strong>Owner:</strong> ${escapeHtml(team.owner_name)}</span>` : "",
        team.driver_1 ? `<span><strong>Driver 1:</strong> ${escapeHtml(team.driver_1)}</span>` : "",
        team.driver_2 ? `<span><strong>Driver 2:</strong> ${escapeHtml(team.driver_2)}</span>` : "",
        team.reserve_driver ? `<span><strong>Reserve:</strong> ${escapeHtml(team.reserve_driver)}</span>` : ""
      ].filter(Boolean).join("");

      card.innerHTML = `
        <div class="team-color" style="background:${escapeHtml(team.color || "#596170")}"></div>
        <h3>${escapeHtml(team.name)}</h3>
        <p>${escapeHtml(detail)}</p>
        ${people ? `<div class="team-card__people">${people}</div>` : ""}
        <span class="team-card__status">${escapeHtml(team.status || "Active")}</span>
      `;
      teamGrid.appendChild(card);
    });
  }

  renderTeams(data.teams);

  const staffGrid = document.getElementById("staffGrid");
  data.staff.forEach(member => {
    const card = document.createElement("article");
    card.className = `staff-card ${member.open ? "staff-card--open" : ""}`;
    card.innerHTML = `
      <span class="staff-role">${escapeHtml(member.role)}</span>
      <h3>${escapeHtml(member.name)}</h3>
      <p>${escapeHtml(member.description)}</p>
    `;
    staffGrid.appendChild(card);
  });

  const sponsorGrid = document.getElementById("sponsorGrid");
  data.sponsors.forEach(packageItem => {
    const card = document.createElement("article");
    card.className = "sponsor-card";
    card.innerHTML = `
      <h3>${escapeHtml(packageItem.name)}</h3>
      <div class="sponsor-price">${escapeHtml(packageItem.price)} <span>${escapeHtml(packageItem.suffix)}</span></div>
      <p>${escapeHtml(packageItem.description)}</p>
    `;
    sponsorGrid.appendChild(card);
  });

  const standingsTable = document.getElementById("standingsTable");
  const standingsStatus = document.getElementById("standingsStatus");

  function renderStandings(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
      standingsStatus.textContent = "PRE-SEASON";
      standingsTable.innerHTML = `
        <div class="empty-standings">
          <strong>No points awarded yet</strong>
          <span>The first classification will appear here after Round 1.</span>
        </div>
      `;
      return;
    }

    const sorted = [...rows].sort((a, b) =>
      Number(b.points || 0) - Number(a.points || 0) ||
      Number(b.wins || 0) - Number(a.wins || 0) ||
      Number(b.podiums || 0) - Number(a.podiums || 0) ||
      Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );

    standingsStatus.textContent = "LIVE";
    standingsTable.innerHTML = `
      <div class="standings-row standings-row--header">
        <span>Pos</span><span>Driver</span><span>Team</span>
        <span>Pts</span><span>Wins</span><span>Pod.</span><span>Races</span>
      </div>
      ${sorted.map((row, index) => `
        <div class="standings-row">
          <span class="standings-position">${index + 1}</span>
          <strong>${escapeHtml(row.driver_name)}</strong>
          <span>${escapeHtml(row.team_name || "Independent")}</span>
          <span class="standings-points">${Number(row.points || 0)}</span>
          <span>${Number(row.wins || 0)}</span>
          <span>${Number(row.podiums || 0)}</span>
          <span>${Number(row.races || 0)}</span>
        </div>
      `).join("")}
      <div class="data-source-note">Updated through the official LRL admin panel.</div>
    `;
  }

  async function loadLiveData() {
    const client = window.getLRLSupabase?.();
    if (!client) return;

    const [teamsResult, standingsResult] = await Promise.all([
      client.from("teams").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }),
      client.from("standings").select("*")
    ]);

    if (!teamsResult.error && teamsResult.data?.length) {
      renderTeams(teamsResult.data);
    }

    if (!standingsResult.error) {
      renderStandings(standingsResult.data || []);
    }
  }

  loadLiveData().catch(error => {
    console.warn("LRL live data could not be loaded. Static website data remains active.", error);
  });

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
