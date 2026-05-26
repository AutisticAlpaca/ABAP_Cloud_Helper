// =====================================================
// GLOBAL STATE
// =====================================================

let currentView = "tables";
let tablesData = [];
let functionModulesData = [];
let snippetsData = [];

const results = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const tabs = document.querySelectorAll(".tab");
const resultCount = document.getElementById("resultCount");

// =====================================================
// LOAD DATA
// =====================================================

async function loadData() {

  const tablesResponse = await fetch("data/tables.json");
  tablesData = await tablesResponse.json();

  const fmResponse = await fetch("data/functionModules.json");
  functionModulesData = await fmResponse.json();

  const snippetsResponse = await fetch("data/snippets.json");
  snippetsData = await snippetsResponse.json();

  renderTables(tablesData);
}

// =====================================================
// TAB SWITCHING
// =====================================================

tabs.forEach(tab => {

  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"));

    tab.classList.add("active");

    currentView = tab.dataset.view;

    searchInput.value = "";

    renderCurrentView();
  });
});

// =====================================================
// SEARCH
// =====================================================

searchInput.addEventListener("input", () => {
  renderCurrentView();
});

// =====================================================
// ROUTER
// =====================================================

function renderCurrentView() {

  const search = searchInput.value.toLowerCase();

  if (currentView === "tables") {

    const filtered = tablesData.filter(item =>
      item.table.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search)
    );

    renderTables(filtered);
  }

  else if (currentView === "fm") {

    const filtered = functionModulesData.filter(item =>
      item.name.toLowerCase().includes(search)
    );

    renderFunctionModules(filtered);
  }

  else if (currentView === "snippets") {

    const filtered = snippetsData.filter(item =>
      item.title.toLowerCase().includes(search)
    );

    renderSnippets(filtered);
  }

  else if (currentView === "rap") {

    renderRAP();
  }
}

// =====================================================
// TABLES VIEW
// =====================================================

function renderTables(data) {

  results.innerHTML = "";

  updateResultCount(data.length);

  if (data.length === 0) {
    renderEmpty();
    return;
  }

  data.forEach(item => {

    const statusClass = getStatusClass(item.status);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `

      <div class="card-header">
        <div class="card-title">${item.table}</div>
        <div class="status ${statusClass}">
          ${item.status}
        </div>
      </div>

      <div class="card-section">
        <div class="label">Description</div>
        <div>${item.description}</div>
      </div>

      <div class="card-section">
        <div class="label">Cloud View</div>
        <div>${item.cloud}</div>
      </div>

      <div class="card-section">
        <div class="label">Recommendation</div>
        <div>${item.notes}</div>
      </div>

      <div class="card-section">
        <div class="label">Suggested CDS</div>

        <div class="code-box">
          ${item.cds}
        </div>
      </div>

      <div class="button-row">
        <button class="action-button copy-btn" data-copy="${item.cds}">
          Copy CDS
        </button>

        <button class="action-button">
          Migration Notes
        </button>
      </div>
    `;

    results.appendChild(card);
  });
}

// =====================================================
// FUNCTION MODULES VIEW
// =====================================================

async function renderFunctionModules(data) {
  results.innerHTML = "";

  updateResultCount(data.length);

  if (data.length === 0) {
    renderEmpty();
    return;
  }

  for (const item of data) {

    let snippet = "";
    let hasSnippet = false;

    if (item.snippetFile) {
      try {
        const response = await fetch(item.snippetFile);

        if (response.ok) {
          snippet = await response.text();
          hasSnippet = snippet.trim().length > 0;
        } else {
          snippet = "No code snippet available.";
        }
      } catch (error) {
        console.error("Could not load snippet file:", item.snippetFile, error);
        snippet = "No code snippet available.";
      }
    } else if (item.snippet && item.snippet.trim().length > 0) {
      snippet = item.snippet;
      hasSnippet = true;
    } else {
      snippet = "No code snippet available.";
    }

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${item.name}</div>
        <div class="status warning">
          Classic ABAP
        </div>
      </div>

      <div class="card-section">
        <div class="label">Description</div>
        <div>${item.description}</div>
      </div>

      <div class="card-section">
        <div class="label">Cloud Alternative</div>
        <div>${item.cloud}</div>
      </div>

      <div class="card-section">
        <div class="label">Cloud Snippet</div>

        ${
          hasSnippet
            ? `<pre class="code-box"><code>${escapeHtml(snippet)}</code></pre>`
            : `<div class="no-snippet">No code snippet available.</div>`
        }
      </div>

      <div class="card-section">
        <div class="label">Recommendation</div>
        <div>${item.notes}</div>
      </div>

      ${
        hasSnippet
          ? `<div class="button-row">
              <button class="action-button" onclick="copyText(\`${snippet.replaceAll("`", "\\`")}\`, this)">
                Copy Snippet
              </button>
            </div>`
          : ""
      }
    `;

    results.appendChild(card);
  }
}

// =====================================================
// SNIPPETS VIEW
// =====================================================

function renderSnippets(data) {

  results.innerHTML = "";

  updateResultCount(data.length);

  if (data.length === 0) {
    renderEmpty();
    return;
  }

  data.forEach(item => {

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `

      <div class="card-header">
        <div class="card-title">${item.title}</div>
      </div>

      <div class="card-section">
        <div class="label">Classic ABAP</div>

        <div class="code-box">
          ${item.classic}
        </div>
      </div>

      <div class="card-section">
        <div class="label">Cloud ABAP</div>

        <div class="code-box">
          ${item.cloud}
        </div>
      </div>

      <div class="button-row">
        <button class="action-button copy-btn" data-copy="${item.classic}">
          Copy Classic
        </button>

        <button class="action-button copy-btn" data-copy="${item.cloud}">
          Copy Cloud
        </button>
      </div>
    `;

    results.appendChild(card);
  });
}

// =====================================================
// RAP VIEW
// =====================================================

function renderRAP() {
  updateResultCount("");

  results.innerHTML = `

    <div class="card">

      <div class="card-header">
        <div class="card-title">
          RAP Generator
        </div>
      </div>

      <div class="card-section">
        Generate:

        <ul>
          <li>Root CDS</li>
          <li>Projection CDS</li>
          <li>Behavior Definition</li>
          <li>Service Definition</li>
          <li>Service Binding</li>
        </ul>
      </div>

      <div class="button-row">
        <button class="action-button">
          Generate RAP Skeleton
        </button>
      </div>

    </div>
  `;
}

// =====================================================
// HELPERS
// =====================================================

function renderEmpty() {

  results.innerHTML = `

    <div class="empty-state">
      <h2>No Results Found</h2>
      <p>Try another SAP object.</p>
    </div>
  `;
}

function getStatusClass(status) {
  if (status === "Released") {
    return "success";
  }

  if (status === "Partial") {
    return "warning";
  }
  return "error";
}

function updateResultCount(count) {
  if (count === "") {
    resultCount.textContent = "";
    return;
  }

  const label = count === 1 ? "result" : "results";
  resultCount.textContent = `${count} ${label} found`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// =====================================================
// COPY FUNCTION
// =====================================================

document.addEventListener("click", event => {
  if (!event.target.classList.contains("copy-btn")) {
    return;
  }

  const button = event.target;
  const text = button.dataset.copy;

  copyText(text, button);
});

function copyText(text, button) {
  navigator.clipboard.writeText(text)
    .then(() => {
      const originalText = button.textContent;

      button.textContent = "Copied!";
      button.classList.add("copied");

      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove("copied");
      }, 1500);
    })
    .catch(err => {
      console.error("Copy failed:", err);
    });
}

// =====================================================
// START APP
// =====================================================

loadData();