const DATA_URL = "../data/final.json";

const sectionAccentClass = {
  "01": "section-accent-gold",
  "02": "section-accent-blue",
  "03": "section-accent-violet",
  "04": "section-accent-red",
  "05": "section-accent-orange",
  "06": "section-accent-green",
  "08": "section-accent-gold",
};

const appRoot = document.querySelector("#app");
const metaPanel = document.querySelector("#meta-panel");
const titleEl = document.querySelector("#dashboard-title");
const summaryEl = document.querySelector("#dashboard-summary");
const reloadButton = document.querySelector("#reload-button");

reloadButton.addEventListener("click", async () => {
  reloadButton.disabled = true;
  reloadButton.textContent = "Reloading...";
  try {
    await renderDashboard({ bustCache: true });
  } finally {
    reloadButton.disabled = false;
    reloadButton.textContent = "Reload data";
  }
});

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(dateString) {
  if (!dateString) return "Ongoing";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - today) / 86400000);
}

function countdownPill(dateString, fallbackLabel = "Ongoing") {
  const days = daysUntil(dateString);
  if (days === null) {
    return `<span class="pill">${escapeHtml(fallbackLabel)}</span>`;
  }
  if (days < 0) {
    return `<span class="pill">${Math.abs(days)}d ago</span>`;
  }
  if (days === 0) {
    return `<span class="pill impact-high">Today</span>`;
  }
  return `<span class="pill">${days}d</span>`;
}

function impactPill(level) {
  const label = level || "low";
  return `<span class="pill impact-${escapeHtml(label)}">${escapeHtml(label)}</span>`;
}

function trendGlyph(trend) {
  if (trend === "up") return '<span class="trend-up">▲</span>';
  if (trend === "down") return '<span class="trend-down">▼</span>';
  return '<span class="trend-flat">■</span>';
}

function renderMetaCards(data) {
  const cards = [
    ["Generated", data.generatedAt || "Unknown"],
    ["Manual Updated", data.sources?.manualUpdatedAt || "Unknown"],
    ["Auto Updated", data.sources?.autoUpdatedAt || "Unknown"],
    ["Manual Refresh", data.refresh?.mode || "Unknown"],
  ];

  metaPanel.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="meta-card">
          <p class="meta-label">${escapeHtml(label)}</p>
          <p class="meta-value">${escapeHtml(value)}</p>
        </article>
      `,
    )
    .join("");
}

function sectionFrame(section, innerHtml) {
  return `
    <section class="card ${sectionAccentClass[section.number] || ""}">
      <div class="card-header">
        <div>
          <span class="section-number">${escapeHtml(section.number)}</span>
          <h2 class="card-title">${escapeHtml(section.title)}</h2>
          <p class="card-subtitle">${escapeHtml(section.subtitle || "")}</p>
        </div>
        <div class="badge-row">
          ${(section.badges || []).map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join("")}
        </div>
      </div>
      ${innerHtml}
      ${section.sourceNote ? `<div class="source-strip">${escapeHtml(section.sourceNote)}</div>` : ""}
    </section>
  `;
}

function renderManualTable(section, columns, rows) {
  const table = rows.length
    ? `
      <table class="table">
        <thead>
          <tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${rows
            .map(
              (row) => `
                <tr>
                  ${columns
                    .map((column) => `<td>${escapeHtml(row[column.key] || "")}</td>`)
                    .join("")}
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    `
    : document.querySelector("#empty-state-template").innerHTML;

  return sectionFrame(section, table);
}

function renderEventsSection(section, items) {
  const body = items.length
    ? `
      <div class="event-list">
        ${items
          .map(
            (item) => `
              <article class="event-item">
                <div class="event-topline">
                  <div>
                    <p class="item-title">${escapeHtml(item.event)}</p>
                    <p class="item-meta">${escapeHtml(item.label || formatDate(item.date))}${item.tickers ? ` | ${escapeHtml(item.tickers)}` : ""}</p>
                    ${item.timeSgt ? `<p class="item-note">${escapeHtml(item.timeSgt)}</p>` : ""}
                  </div>
                  <div class="badge-row">
                    ${countdownPill(item.date, item.label)}
                    ${impactPill(item.impact)}
                  </div>
                </div>
                ${item.note ? `<p class="item-note">${escapeHtml(item.note)}</p>` : ""}
              </article>
            `,
          )
          .join("")}
      </div>
    `
    : document.querySelector("#empty-state-template").innerHTML;

  return sectionFrame(section, body);
}

function renderPotentialSection(section, items) {
  const body = items.length
    ? `
      <div class="event-list">
        ${items
          .map(
            (item) => `
              <article class="event-item">
                <div class="event-topline">
                  <div>
                    <p class="item-title">${trendGlyph(item.trend)} ${escapeHtml(item.event)}</p>
                    ${item.note ? `<p class="item-note">${escapeHtml(item.note)}</p>` : ""}
                  </div>
                  <div class="badge-row">
                    <span class="pill">${escapeHtml(item.odds || "---")}</span>
                    ${item.link ? `<a class="button-like" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">Source</a>` : ""}
                  </div>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `
    : document.querySelector("#empty-state-template").innerHTML;

  return sectionFrame(section, body);
}

function renderGoldSection(section, items, summary) {
  const summaryRow = `
    <div class="badge-row">
      <span class="badge">Latest reserves: ${escapeHtml(summary?.latestReserves ?? "--")}</span>
      <span class="badge">YTD change: ${escapeHtml(summary?.ytdChange ?? "--")}</span>
      <span class="badge">Buying streak: ${escapeHtml(summary?.buyingStreak ?? "--")}</span>
    </div>
  `;

  const list = items.length
    ? `
      <div class="gold-list">
        ${items
          .map(
            (item) => `
              <article class="gold-item">
                <div class="gold-topline">
                  <div>
                    <p class="item-title">${escapeHtml(item.month)}</p>
                    <p class="item-meta">${escapeHtml(formatDate(item.date))}</p>
                  </div>
                  <div class="badge-row">
                    <span class="pill ${item.status === "bought" ? "positive" : item.status === "sold" ? "impact-high" : ""}">
                      ${escapeHtml(item.tonnesDisplay)}
                    </span>
                    <span class="pill">${escapeHtml(item.totalReservesDisplay)}</span>
                  </div>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `
    : document.querySelector("#empty-state-template").innerHTML;

  return sectionFrame(section, `${summaryRow}${list}`);
}

function renderNotes(section, notes) {
  const body = notes.length
    ? `
      <div class="note-list">
        ${notes
          .map(
            (note) => `
              <article class="note-item">
                <p class="item-title">${escapeHtml(note.title)}</p>
                <p class="item-note">${escapeHtml(note.body)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    `
    : document.querySelector("#empty-state-template").innerHTML;

  return sectionFrame(section, body);
}

function renderSections(data) {
  const sections = data.sections || {};
  appRoot.innerHTML = [
    renderManualTable(sections.s1, sections.s1.columns, sections.s1.rows),
    renderManualTable(sections.s2, sections.s2.columns, sections.s2.rows),
    renderManualTable(sections.s3, sections.s3.columns, sections.s3.rows),
    renderEventsSection(sections.s4, sections.s4.items),
    renderEventsSection(sections.s5, sections.s5.items),
    renderPotentialSection(sections.s6, sections.s6.items),
    renderGoldSection(sections.s8, sections.s8.items, sections.s8.summary),
    renderNotes(sections.notes, sections.notes.items),
  ].join("");
}

async function loadData({ bustCache = false } = {}) {
  const cacheSuffix = bustCache ? `?t=${Date.now()}` : "";
  const response = await fetch(`${DATA_URL}${cacheSuffix}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load dashboard data (${response.status})`);
  }
  return response.json();
}

async function renderDashboard({ bustCache = false } = {}) {
  try {
    const data = await loadData({ bustCache });
    titleEl.textContent = data.title || "Finance Dashboard";
    summaryEl.textContent = data.summary || "";
    renderMetaCards(data);
    renderSections(data);
  } catch (error) {
    titleEl.textContent = "Finance Dashboard";
    summaryEl.textContent = "The dashboard data could not be loaded.";
    metaPanel.innerHTML = "";
    appRoot.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
  }
}

renderDashboard();
