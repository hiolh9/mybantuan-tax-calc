(function () {
  const TYPE_LABEL = { awam: "Awam", swasta: "Swasta", foreign: "Cawangan Asing" };
  const TYPE_CLASS = { awam: "status-ongoing", swasta: "status-upcoming", foreign: "status-ended" };

  function allStatesOf(u) {
    const set = new Set();
    if (u.state) {
      String(u.state).split(/[/+,]/).forEach(part => {
        const s = part.replace(/\([^)]*\)/g, "").trim();
        if (s && !s.startsWith("+") && s.length > 1) set.add(s);
      });
    }
    (u.campuses || []).forEach(c => {
      if (c.state) set.add(String(c.state).trim());
    });
    return [...set];
  }

  function locationLine(u) {
    const campuses = u.campuses || [];
    if (campuses.length > 1) {
      const parts = campuses.map(c => {
        const city = (c.city || "").split("(")[0].trim();
        return city ? `${city} (${c.state})` : c.state;
      });
      if (parts.length <= 3) return "📍 " + parts.join(" · ");
      return "📍 " + parts.slice(0, 2).join(" · ") + ` · +${parts.length - 2} lagi`;
    }
    return `📍 ${u.city}, ${u.state}`;
  }

  function renderCard(u) {
    const strengths = (u.strengths || []).slice(0, 4).map(s =>
      `<span class="tag">${s}</span>`
    ).join("");
    // Always go to local detail page first (not official website)
    const href = u.detailPage || (u.id + ".html");
    const n = (u.campuses || []).length;
    const badge = n > 1
      ? `<span class="card-status status-ongoing" style="margin-left:6px">${n} kampus</span>`
      : "";
    return `
      <a class="card card-medium" href="${href}">
        <div class="card-top">
          <span class="card-status ${TYPE_CLASS[u.type] || ""}">${TYPE_LABEL[u.type] || u.type}</span>
          ${badge}
        </div>
        <h2 class="card-title">${u.shortName}</h2>
        <p class="card-desc">${u.name}</p>
        <div class="card-meta" style="font-size:13px;line-height:1.4">
          <span>${locationLine(u)}</span>
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

    const stateSet = new Set();
    all.forEach(u => allStatesOf(u).forEach(s => stateSet.add(s)));
    const skip = new Set(["pelbagai negeri", "cawangan seluruh negara"]);
    const states = [...stateSet]
      .filter(s => s && !skip.has(s.toLowerCase()) && !s.includes("+"))
      .sort((a, b) => a.localeCompare(b, "ms"));

    while (filterState.options.length > 1) filterState.remove(1);
    states.forEach(s => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s;
      filterState.appendChild(opt);
    });

    function matchesState(u, state) {
      if (!state) return true;
      const statesOf = allStatesOf(u);
      if (statesOf.some(s => s === state || s.includes(state) || state.includes(s))) return true;
      if ((u.campuses || []).some(c => c.state === state)) return true;
      if ((u.state || "").includes(state)) return true;
      return false;
    }

    function apply() {
      const type = filterType.value;
      const state = filterState.value;
      const q = (searchInput.value || "").toLowerCase().trim();
      let list = all.slice();
      if (type) list = list.filter(u => u.type === type);
      if (state) list = list.filter(u => matchesState(u, state));
      if (q) {
        list = list.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.shortName.toLowerCase().includes(q) ||
          (u.strengths || []).some(s => s.toLowerCase().includes(q)) ||
          (u.city || "").toLowerCase().includes(q) ||
          (u.state || "").toLowerCase().includes(q) ||
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
