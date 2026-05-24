let tablesData = [];

fetch("data/tables.json")
  .then(res => res.json())
  .then(data => {
    tablesData = data;
    renderList(data);
  });

const list = document.getElementById("list");
const result = document.getElementById("result");

function renderList(data) {
  list.innerHTML = "";

  data.forEach(t => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerText = t.table;

    div.onclick = () => showTable(t.table);

    list.appendChild(div);
  });
}

function showTable(name) {
  document.getElementById("inputTable").value = name;
  convertTable();
}

function convertTable() {
  const input = document.getElementById("inputTable").value.toUpperCase();

  const found = tablesData.find(t => t.table === input);

  if (!found) {
    result.innerHTML = `
      <div class="result-box">
        ❌ Table not found<br>
        Try: MARA, KNA1, VBAP
      </div>
    `;
    return;
  }

  result.innerHTML = `
    <div class="result-box">
      <h3>${found.table}</h3>
      <p><b>Description:</b> ${found.description}</p>
      <p><b>Cloud View:</b> ${found.cloud}</p>
      <p><b>Type:</b> ${found.type}</p>
      <p><b>Notes:</b> ${found.notes}</p>
      <p><b>CDS Hint:</b> ${found.cds_hint}</p>
    </div>
  `;
}