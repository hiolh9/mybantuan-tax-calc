/**
 * MyBantuan & Tax Calc — Homepage Logic
 * -------------------------------------
 * Data: data/programs.json
 * Status ditentukan secara dinamik berdasarkan tarikh hari ini vs startDate / endDate.
 * Tidak hardcode status.
 *
 * Logik status:
 *   - ongoing  : startDate ≤ hari ini  DAN  (endDate null ATAU endDate ≥ hari ini)
 *   - upcoming : startDate > hari ini
 *   - ended    : endDate < hari ini
 *
 * Paparan lalai: 30 program terkini (susun ikut priority DESC, kemudian startDate DESC)
 */

(function () {
  const MAX_DISPLAY = 30;
  const DATA_URL = 'data/programs.json';

  function todayISO() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }

  function getStatus(program, today) {
    const start = program.startDate;
    const end = program.endDate;

    if (start > today) return 'upcoming';
    if (end && end < today) return 'ended';
    return 'ongoing';
  }

  function statusLabel(status) {
    const map = {
      ongoing: 'Sedang Berjalan',
      upcoming: 'Akan Datang',
      ended: 'Telah Tamat'
    };
    return map[status] || status;
  }

  function createCard(program, index) {
    const status = program._status;
    const a = document.createElement('a');
    a.href = program.detailPage || '#';
    a.className = 'card';

    if (index === 0 || program.priority >= 9) {
      a.classList.add('card--large');
    } else if (index % 5 === 2) {
      a.classList.add('card--wide');
    } else if (index % 7 === 3) {
      a.classList.add('card--tall');
    }

    a.innerHTML = `
      <span class="card-status status-${status}">${statusLabel(status)}</span>
      <h3 class="card-title">${escapeHtml(program.name)}</h3>
      <p class="card-desc">${escapeHtml(program.shortDesc)}</p>
      <div class="card-meta">
        <span class="card-amount">${escapeHtml(program.amountSummary)}</span>
        <span class="card-target">${escapeHtml(program.target)}</span>
      </div>
    `;
    return a;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function render(programs, filter) {
    const grid = document.getElementById('bento-grid');
    const empty = document.getElementById('empty-state');
    grid.innerHTML = '';

    let list = programs;
    if (filter && filter !== 'all') {
      list = programs.filter(p => p._status === filter);
    }

    if (list.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    list.forEach((p, i) => {
      grid.appendChild(createCard(p, i));
    });
  }

  async function init() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error('Gagal muat data');
      const data = await res.json();

      const updatedEl = document.getElementById('last-updated');
      if (data.lastUpdated) {
        updatedEl.textContent = `Dikemaskini: ${data.lastUpdated}`;
      }

      const today = todayISO();
      let programs = (data.programs || []).map(p => {
        return { ...p, _status: getStatus(p, today) };
      });

      programs.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return (b.startDate || '').localeCompare(a.startDate || '');
      });

      programs = programs.slice(0, MAX_DISPLAY);

      window.__programs = programs;

      render(programs, 'all');

      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          render(window.__programs, btn.dataset.filter);
        });
      });
    } catch (err) {
      console.error(err);
      document.getElementById('bento-grid').innerHTML =
        '<p style="grid-column:1/-1;text-align:center;color:#6b7280;padding:40px 0;">Gagal memuatkan data. Sila cuba semula.</p>';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
