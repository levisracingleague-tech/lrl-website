(() => {
  const data = window.LRL_DATA;

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
        <span class="status-pill ${item.vote ? "status-pill--vote" : ""}">${item.status}</span>
      </div>
      <h3>${item.event}</h3>
      <p>${item.venue}</p>
      <span class="round-date">${item.date}</span>
    `;
    calendarGrid.appendChild(card);
  });

  const teamGrid = document.getElementById("teamGrid");
  data.teams.forEach(team => {
    const card = document.createElement("article");
    card.className = `team-card ${team.open ? "team-card--open" : ""}`;
    card.innerHTML = `
      <div class="team-color" style="background:${team.color}"></div>
      <h3>${team.name}</h3>
      <p>${team.detail}</p>
      <span class="team-card__status">${team.status}</span>
    `;
    teamGrid.appendChild(card);
  });

  const staffGrid = document.getElementById("staffGrid");
  data.staff.forEach(member => {
    const card = document.createElement("article");
    card.className = `staff-card ${member.open ? "staff-card--open" : ""}`;
    card.innerHTML = `
      <span class="staff-role">${member.role}</span>
      <h3>${member.name}</h3>
      <p>${member.description}</p>
    `;
    staffGrid.appendChild(card);
  });

  const sponsorGrid = document.getElementById("sponsorGrid");
  data.sponsors.forEach(packageItem => {
    const card = document.createElement("article");
    card.className = "sponsor-card";
    card.innerHTML = `
      <h3>${packageItem.name}</h3>
      <div class="sponsor-price">${packageItem.price} <span>${packageItem.suffix}</span></div>
      <p>${packageItem.description}</p>
    `;
    sponsorGrid.appendChild(card);
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
