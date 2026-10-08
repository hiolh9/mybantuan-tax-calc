/**
 * MyBantuan — Bantuan listing logic
 * Status from dates; max 30 items by priority then startDate.
 */
(function () {
  const DATA_URL = 'data/programs.json';
  const MAX_DISPLAY = 30;
  const STATUS_LABEL = {
    ongoing: 'Sedang Berjalan',
    upcoming: 'Akan Datang',
    ended: 'Tamat'
  };

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function computeStatus(p) {
    const today = todayISO();
    const start = p.startDate || '1970-01-01';
    const end = p.endDate;
    if (start > today) return 'upcoming';
    if (end && end < today) return 'ended';
    return 'ongoing';
  }

  function renderCard(p) {
    const status = p._status;
    const statusClass = 'status-' + status;
    const href = p.detailPage || p.applyLink || p.officialLink || '#';
    const isExternal = href.startsWith('http');
    return `
      <a class="card card-medium" href="${href}" ${isExternal ? 'target="_blank" rel="noopener"' : ''}>
        <div class="card-top">
          <span class="card-status ${statusClass}">${STATUS_LABEL[status] || status}</span>
        </div>
        <h2 class="card-title">${p.name}</h2>
        <p class="card-desc">${p.shortDesc || ''}</p>
        <div class="card-meta">
          <span class="card-amount">${p.amountSummary || ''}</span>
          <span>${p.target || ''}</span>
        </div>
      </a>
    `;
  }

  function render(programs, filter) {
    const grid = document.getElementById('program-grid');
    let list = programs;
    if (filter && filter !== 'all') {
      list = programs.filter(p => p._status === filter);
    }
    grid.innerHTML = list.map(renderCard).join('') ||
      '<p style="color:var(--text-muted)">Tiada program untuk penapis ini.</p>';
  }

  async function init() {
    try {
      const res = await fetch(DATA_URL);
      const data = await res.json();
      const updated = document.getElementById('last-updated');
      if (updated && data.lastUpdated) {
        updated.textContent = 'Dikemaskini: ' + data.lastUpdated;
      }

      let programs = (data.programs || []).map(p => {
        p._status = computeStatus(p);
        return p;
      });

      programs.sort((a, b) => {
        const pr = (b.priority || 0) - (a.priority || 0);
        if (pr !== 0) return pr;
        return (b.startDate || '').localeCompare(a.startDate || '');
      });
      programs = programs.slice(0, MAX_DISPLAY);
      window.__programs = programs;

      render(programs, 'all');

      document.getElementById('filters').addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render(window.__programs, btn.dataset.filter);
      });
    } catch (err) {
      console.error(err);
      document.getElementById('program-grid').innerHTML =
        '<p style="color:var(--text-muted)">Gagal memuat data. Pastikan data/programs.json wujud.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
