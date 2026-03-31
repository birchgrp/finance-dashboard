const DATA_URL = "../data/final.json";
const DEFAULT_REPO = {
  owner: "birchgrp",
  repo: "finance-dashboard",
  branch: "main",
};
const AUTO_SECTION_KEYS = new Set(["s4", "s5", "s6", "s8"]);

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
const workflowLink = document.querySelector("#workflow-link");
const reloadStatus = document.querySelector("#reload-status");
const refreshGuide = document.querySelector("#refresh-guide");

let currentGeneratedAt = null;

const repoContext = resolveRepoContext();
const repoUrl = `https://github.com/${repoContext.owner}/${repoContext.repo}`;
const autoSourceUrl = `${repoUrl}/blob/${repoContext.branch}/data/auto.json`;
const autoEditUrl = `${repoUrl}/edit/${repoContext.branch}/data/auto.json`;
const refreshWorkflowUrl = `${repoUrl}/actions/workflows/refresh-dashboard.yml`;

workflowLink.href = refreshWorkflowUrl;

reloadButton.addEventListener("click", async () => {
  reloadButton.disabled = true;
  reloadButton.textContent = "Reloading...";
  setReloadStatus("Checking the latest deployed dashboard payload...", "neutral");
  try {
    await renderDashboard({ bustCache: true, manualReload: true });
  } finally {
    reloadButton.disabled = false;
    reloadButton.textContent = "Reload published data";
  }
});

renderRefreshGuide();

function resolveRepoContext() {
  const host = window.location.hostname || "";
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (host.endsWith(".github.io") && pathParts.length > 0) {
    return {
      owner: host.replace(".github.io", ""),
      repo: pathParts[0],
      branch: DEFAULT_REPO.branch,
    };
  }

  return DEFAULT_REPO;
}

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
    timeZone: "Asia/Singapore",
  }).format(date);
}

function formatDateTime(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return `${new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Singapore",
  }).format(date)} SGT`;
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - today) / 86400000);
}

function setReloadStatus(message, tone = "neutral") {
  reloadStatus.textContent = message;
  reloadStatus.dataset.tone = tone;
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
  if (trend === "up") return '<span class="trend-up">&#9650;</span>';
  if (trend === "down") return '<span class="trend-down">&#9660;</span>';
  return '<span class="trend-flat">&#9632;</span>';
}

function renderRefreshGuide() {
  refreshGuide.innerHTML = `
    <p class="refresh-guide-title">How sections 04 to 08 refresh now</p>
    <ul class="refresh-guide-list">
      <li><strong>Reload published data</strong> only refetches the latest deployed <code>final.json</code>.</li>
      <li>Sections <code>04</code>, <code>05</code>, <code>06</code>, and <code>08</code> are sourced from <code>data/auto.json</code>.</li>
      <li>To update one of them, edit the matching entry in <code>auto.json</code>, publish that repo change, then reload the dashboard here.</li>
    </ul>
    <div class="section-action-row">
      <a class="button-like button-like-secondary" href="${escapeHtml(autoEditUrl)}" target="_blank" rel="noreferrer">Edit auto.json</a>
      <a class="button-like button-like-secondary" href="${escapeHtml(refreshWorkflowUrl)}" target="_blank" rel="noreferrer">Open publish workflow</a>
    </div>
  `;
}

function renderMetaCards(data) {
  const cards = [
    ["Generated", formatDateTime(data.generatedAt || "Unknown")],
    ["Manual Updated", data.sources?.manualUpdatedAt || "Unknown"],
    ["Auto Updated", data.sources?.autoUpdatedAt || "Unknown"],
    ["Refresh Mode", data.refresh?.mode || "Unknown"],
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

function renderSectionFooter(section, sectionKey) {
  const blocks = [];

  if (section.sourceNote) {
    blocks.push(`<p class="source-note">${escapeHtml(section.sourceNote)}</p>`);
  }

  if (AUTO_SECTION_KEYS.has(sectionKey)) {
    blocks.push(`
      <p class="section-refresh-note">
        Refresh this section by editing <code>sections.${escapeHtml(sectionKey)}</code> in <code>data/auto.json</code>,
        publishing the repo change, then using <strong>Reload published data</strong>.
      </p>
    `);
    blocks.push(`
      <div class="section-action-row">
        <a class="button-like button-like-secondary" href="${escapeHtml(autoSourceUrl)}" target="_blank" rel="noreferrer">View auto source</a>
        <a class="button-like button-like-secondary" href="${escapeHtml(refreshWorkflowUrl)}" target="_blank" rel="noreferrer">Publish changes</a>
      </div>
    `);
  }

  if (!blocks.length) {
    return "";
  }

  return `<div class="source-strip">${blocks.join("")}</div>`;
}

function sectionFrame(section, sectionKey, innerHtml) {
  return `
    <section class="card ${sectionAccentClass[section.number] || ""}">
      <div class="card-header">
        <div class="card-header-copy">
          <span class="section-number">${escapeHtml(section.number)}</span>
          <h2 class="card-title">${escapeHtml(section.title)}</h2>
          <p class="card-subtitle">${escapeHtml(section.subtitle || "")}</p>
        </div>
        <div class="badge-row">
          ${(section.badges || []).map((badge) => `<span class="badge">${escapeHtml(badge)}</span>`).join("")}
        </div>
      </div>
      ${innerHtml}
      ${renderSectionFooter(section, sectionKey)}
    </section>
  `;
}

function renderManualTable(sectionKey, section, columns, rows) {
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

  return sectionFrame(section, sectionKey, table);
}

function renderEventsSection(sectionKey, section, items) {
  const body = items.length
    ? `
      <div class="event-list">
        ${items
          .map(
            (item) => `
              <article class="event-item">
                <div class="event-topline">
                  <div class="event-copy">
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

  return sectionFrame(section, sectionKey, body);
}

function renderPotentialSection(sectionKey, section, items) {
  const body = items.length
    ? `
      <div class="event-list">
        ${items
          .map(
            (item) => `
              <article class="event-item">
                <div class="event-topline">
                  <div class="event-copy">
                    <p class="item-title">${trendGlyph(item.trend)} ${escapeHtml(item.event)}</p>
                    ${item.note ? `<p class="item-note">${escapeHtml(item.note)}</p>` : ""}
                  </div>
                  <div class="badge-row">
                    <span class="pill">${escapeHtml(item.odds || "---")}</span>
                    ${item.link ? `<a class="button-like button-like-secondary" href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">Source</a>` : ""}
                  </div>
                </div>
              </article>
            `,
          )
          .join("")}
      </div>
    `
    : document.querySelector("#empty-state-template").innerHTML;

  return sectionFrame(section, sectionKey, body);
}

function renderGoldSection(sectionKey, section, items, summary) {
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
                  <div class="event-copy">
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

  return sectionFrame(section, sectionKey, `${summaryRow}${list}`);
}

function renderNotes(sectionKey, section, notes) {
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

  return sectionFrame(section, sectionKey, body);
}

function renderSections(data) {
  const sections = data.sections || {};
  appRoot.innerHTML = [
    renderManualTable("s1", sections.s1, sections.s1.columns, sections.s1.rows),
    renderManualTable("s2", sections.s2, sections.s2.columns, sections.s2.rows),
    renderManualTable("s3", sections.s3, sections.s3.columns, sections.s3.rows),
    renderEventsSection("s4", sections.s4, sections.s4.items),
    renderEventsSection("s5", sections.s5, sections.s5.items),
    renderPotentialSection("s6", sections.s6, sections.s6.items),
    renderGoldSection("s8", sections.s8, sections.s8.items, sections.s8.summary),
    renderNotes("notes", sections.notes, sections.notes.items),
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

async function renderDashboard({ bustCache = false, manualReload = false } = {}) {
  try {
    const previousGeneratedAt = currentGeneratedAt;
    const data = await loadData({ bustCache });
    currentGeneratedAt = data.generatedAt || null;

    titleEl.textContent = data.title || "Finance Dashboard";
    summaryEl.textContent = data.summary || "";
    renderMetaCards(data);
    renderSections(data);

    if (manualReload) {
      if (previousGeneratedAt && previousGeneratedAt !== currentGeneratedAt) {
        setReloadStatus(`Loaded a newer published build from ${formatDateTime(currentGeneratedAt)}.`, "success");
      } else {
        setReloadStatus(`Reloaded the current published build. No newer deploy was detected.`, "neutral");
      }
    } else {
      setReloadStatus(`Published data last generated ${formatDateTime(currentGeneratedAt)}.`, "neutral");
    }
  } catch (error) {
    titleEl.textContent = "Finance Dashboard";
    summaryEl.textContent = "The dashboard data could not be loaded.";
    metaPanel.innerHTML = "";
    appRoot.innerHTML = `<div class="error-state">${escapeHtml(error.message)}</div>`;
    setReloadStatus("Could not load the published dashboard data.", "error");
  }
}

renderDashboard();
