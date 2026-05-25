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
        <button class="action-button" onclick="copyText(\`${item.cds}\)">
          Copy CDS
        </button>

        <button class="action-button">
          Migration Notes
        </button>
      </div>
    `;

    results.appendChild(card);

    // setTimeout(() => {

    // document.querySelectorAll(".copy-btn").forEach(btn => {
    //   btn.addEventListener("click", () => {

    //     const text = decodeURIComponent(btn.dataset.text);
    //     copyText(text);

    //     });
    //   });

    // }, 0);
  });
}

// =====================================================
// FUNCTION MODULES VIEW
// =====================================================

function renderFunctionModules(data) {

  results.innerHTML = "";

  if (data.length === 0) {
    renderEmpty();
    return;
  }

  data.forEach(item => {

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
        <div class="label">Recommendation</div>
        <div>${item.notes}</div>
      </div>
    `;

    results.appendChild(card);
  });
}

// =====================================================
// SNIPPETS VIEW
// =====================================================

function renderSnippets(data) {

  results.innerHTML = "";

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
    `;

    results.appendChild(card);
  });
}

// =====================================================
// RAP VIEW
// =====================================================

function renderRAP() {

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

// =====================================================
// COPY TEXT
// =====================================================

function copyText(text) {

  navigator.clipboard.writeText(text)
    .then(() => {
      alert("Copied to clipboard");
      // btn.innerText = "Copied ✔";
      // setTimeout(() => {
      //   btn.innerText = "Copy Cloud Code";
      // }, 1500);
    })
    .catch(err => {
      console.error("Copy failed:", err);
    });
}

// =====================================================
// START APP
// =====================================================

loadData();