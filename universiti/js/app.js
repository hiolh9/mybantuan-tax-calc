(function () {
  const TYPE_LABEL = { awam: "Awam", swasta: "Swasta", foreign: "Cawangan Asing" };
  const TYPE_CLASS = { awam: "status-ongoing", swasta: "status-upcoming", foreign: "status-ended" };

  function renderCard(u) {
    const strengths = (u.strengths || []).slice(0, 4).map(s =>
      `<span class="tag">${s}</span>`
    ).join("");
    const href = u.detailPage || u.website;
    const ext = (href || "").startsWith("http");
    const campusHint = (u.campuses && u.campuses.length > 1)
      ? ` · ${u.campuses.length} kampus`
      : "";
    return `
      <a class="card card-medium" href="${href}" ${ext ? 'target="_blank" rel="noopener"' : ''}>
        <div class="card-top">
          <span class="card-status ${TYPE_CLASS[u.type] || ""}">${TYPE_LABEL[u.type] || u.type}</span>
        </div>
        <h2 class="card-title">${u.shortName}</h2>
        <p class="card-desc">${u.name}</p>
        <div class="card-meta">
          <span>📍 ${u.city}, ${u.state}${campusHint}</span>
        </div>
        <div class="card-tags" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">
          ${strengths}
        </div>
      </a>
    `;
  }

  async function init() {
    const grid = document.getElementById("uni-grid");
    const filterType = document.getElementById("filter-type");
    const filterState = document.getElementById("filter-state");
    const searchInput = document.getElementById("search-uni");
    let all = [];

    try {
      const res = await fetch("data/universities.json");
      const data = await res.json();
      all = data.universities || [];
    } catch (e) {
      grid.innerHTML = "<p>Gagal memuat data universiti.</p>";
      return;
    }

    const states = [...new Set(all.map(u => u.state))].sort();
    states.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      filterState.appendChild(opt);
    });

    function apply() {
      const type = filterType.value;
      const state = filterState.value;
      const q = (searchInput.value || "").toLowerCase().trim();
      let list = all.slice();
      if (type) list = list.filter(u => u.type === type);
      if (state) {
        list = list.filter(u =>
          u.state === state ||
          (u.campuses || []).some(c => c.state === state) ||
          (u.state || "").includes(state)
        );
      }
      if (q) {
        list = list.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          (u.strengths || []).some(s => s.toLowerCase().includes(q)) ||
          u.city.toLowerCase().includes(q) ||
          (u.campuses || []).some(c =>
            (c.city || "").toLowerCase().includes(q) ||
            (c.state || "").toLowerCase().includes(q) ||
            (c.name || "").toLowerCase().includes(q)
          )
        );
      }
      list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      grid.innerHTML = list.map(renderCard).join("") || "<p>Tiada universiti dijumpai.</p>";
      document.getElementById("uni-count").textContent = list.length;
    }

    filterType.addEventListener("change", apply);
    filterState.addEventListener("change", apply);
    searchInput.addEventListener("input", apply);
    apply();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
