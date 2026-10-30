(() => {
  const panelId = 'lsp-fria01-fill-follow-up';
  if (document.getElementById(panelId)) return;

  let activeRow = null;
  const activeClass = 'lsp-fria01-active-blank';
  const highlightStyle = document.createElement('style');
  highlightStyle.textContent = `
    tr.${activeClass} > td {
      outline: 2px solid #e09b00;
      outline-offset: -2px;
      background-color: #fff4cf !important;
    }
  `;
  document.head.append(highlightStyle);

  const normalize = (value) => String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  const isDash = (value) => normalize(value).replace(/[–—−]/g, '-') === '-';

  const host = document.createElement('div');
  host.id = panelId;
  host.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .panel { font: 14px/1.4 Arial, sans-serif; color: #172033; }
      .actions { display: flex; flex-wrap: wrap; gap: 7px; }
      button {
        border: 0; border-radius: 8px; padding: 11px 15px;
        color: #fff; background: #2457a7; font: 600 14px Arial, sans-serif;
        box-shadow: 0 2px 8px #0003; cursor: pointer;
      }
      button:hover { background: #194784; }
      button.secondary { background: #536276; }
      button.secondary:hover { background: #39475a; }
      button:disabled { opacity: .55; cursor: not-allowed; }
      .tools.hidden { display: none; }
      button.minimize {
        display: block; width: 100%; margin-top: 7px;
        color: #172033; background: #fff; border: 1px solid #aeb8c7;
      }
      button.minimize:hover { background: #f0f3f8; }
      .status {
        display: none; max-width: 330px; margin-top: 8px; padding: 10px 12px;
        white-space: pre-line;
        border-radius: 7px; background: #fff; box-shadow: 0 2px 8px #0003;
      }
      .status.visible { display: block; }
    </style>
    <div class="panel">
      <div class="tools">
        <div class="actions">
          <button type="button" class="next">Sorot pencapaian kosong</button>
          <button type="button" class="yes secondary" disabled>Ya untuk baris aktif</button>
          <button type="button" class="dash secondary">Isi “-” Penilaian Lanjut</button>
        </div>
        <div class="status" role="status" aria-live="polite"></div>
      </div>
      <button type="button" class="minimize" aria-expanded="true">Minimalkan alat bantu</button>
    </div>
  `;
  document.documentElement.append(host);

  const nextButton = shadow.querySelector('.next');
  const yesButton = shadow.querySelector('.yes');
  const dashButton = shadow.querySelector('.dash');
  const tools = shadow.querySelector('.tools');
  const minimizeButton = shadow.querySelector('.minimize');
  const status = shadow.querySelector('.status');

  minimizeButton.addEventListener('click', () => {
    const minimized = tools.classList.toggle('hidden');
    minimizeButton.setAttribute('aria-expanded', String(!minimized));
    minimizeButton.textContent = minimized
      ? 'Bantuan'
      : 'Minimalkan alat bantu';
  });

  function showStatus(message) {
    status.textContent = message;
    status.classList.add('visible');
  }

  function getApplicableTables() {
    return [...document.querySelectorAll('table')].filter((table) => {
      const headers = [...table.querySelectorAll('th')]
        .map((header) => normalize(header.innerText || header.textContent));
      return headers.includes('penilaian lanjut') && headers.includes('pencapaian');
    });
  }

  function getBlankRows() {
    return getApplicableTables().flatMap((table) =>
      [...table.rows].filter((row) => {
        const yes = row.querySelector('input[type="checkbox"][data-kbnav-col="ya"]');
        const no = row.querySelector('input[type="checkbox"][data-kbnav-col="tidak"]');
        return yes && no && !yes.checked && !no.checked;
      })
    );
  }

  function clearActiveRow() {
    activeRow?.classList.remove(activeClass);
    activeRow = null;
    yesButton.disabled = true;
  }

  function focusNextBlankRow() {
    const blankRows = getBlankRows();
    if (blankRows.length === 0) {
      clearActiveRow();
      showStatus('Tidak ada pencapaian kosong yang ditemukan.');
      return;
    }

    const currentIndex = blankRows.indexOf(activeRow);
    const nextIndex = (currentIndex + 1 + blankRows.length) % blankRows.length;
    clearActiveRow();
    activeRow = blankRows[nextIndex];
    activeRow.classList.add(activeClass);
    yesButton.disabled = false;
    activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    activeRow.querySelector('input[type="checkbox"][data-kbnav-col="ya"]')
      ?.focus({ preventScroll: true });
    showStatus(`Pencapaian kosong disorot (${blankRows.length} masih kosong). Periksa butir ini, lalu pilih “Ya untuk baris aktif” hanya jika memenuhi kriteria.`);
  }

  nextButton.addEventListener('click', focusNextBlankRow);

  yesButton.addEventListener('click', () => {
    if (!activeRow || !activeRow.isConnected) {
      clearActiveRow();
      showStatus('Baris aktif tidak tersedia. Sorot pencapaian kosong terlebih dahulu.');
      return;
    }

    const yes = activeRow.querySelector('input[type="checkbox"][data-kbnav-col="ya"]');
    const no = activeRow.querySelector('input[type="checkbox"][data-kbnav-col="tidak"]');
    if (!yes || !no || yes.checked || no.checked) {
      clearActiveRow();
      showStatus('Baris ini sudah berubah atau tidak lagi kosong. Periksa pilihan sebelum melanjutkan.');
      return;
    }

    yes.click();
    if (!yes.checked) {
      showStatus('Pilihan “Ya” belum berubah. Periksa baris secara manual.');
      return;
    }

    clearActiveRow();
    showStatus('“Ya” dipilih hanya untuk satu baris. Periksa pencapaian berikutnya; tidak ada penyimpanan otomatis.');
  });

  function getFollowUpInputs(table) {
    return [...table.rows]
      .map((row, rowIndex) => {
        const cell = row.cells[row.cells.length - 1];
        const input = cell?.querySelector('input[type="text"], textarea');
        return input ? { rowIndex, input } : null;
      })
      .filter(Boolean);
  }

  function setInputValue(input, value) {
    const prototype = input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (!setter) throw new Error('Setter nilai field tidak tersedia.');
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  dashButton.addEventListener('click', async () => {
    const tables = getApplicableTables();
    const fields = tables.flatMap((table, tableIndex) =>
      getFollowUpInputs(table).map(({ rowIndex, input }) => ({
        tableIndex,
        rowIndex,
        value: input.value
      }))
    );

    if (fields.length === 0) {
      showStatus('Kolom “Penilaian Lanjut” tidak ditemukan. Tidak ada perubahan.');
      return;
    }

    const toFill = fields.filter(({ value }) => !isDash(value) && !value.trim());
    if (toFill.length === 0) {
      showStatus(`Ditemukan ${fields.length} kolom; semuanya sudah berisi “-”. Tidak ada perubahan.`);
      return;
    }

    const message = [
      `Isi tanda “-” pada ${toFill.length} kolom “Penilaian Lanjut”?`,
      `${fields.length - toFill.length} kolom yang sudah berisi nilai akan dibiarkan.`,
      'Checklist “Ya/Tidak” dan tombol simpan tidak akan diubah.'
    ].join('\n');
    if (!window.confirm(message)) return;

    let changed = 0;
    let failed = 0;
    for (const { tableIndex, rowIndex } of toFill) {
      try {
        const currentTable = getApplicableTables()[tableIndex];
        const row = currentTable?.rows[rowIndex];
        const input = row?.cells[row.cells.length - 1]
          ?.querySelector('input[type="text"], textarea');
        if (!input || input.value.trim()) {
          failed += 1;
          continue;
        }
        setInputValue(input, '-');
        if (input.value.trim() === '-') changed += 1;
        else failed += 1;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      } catch (error) {
        failed += 1;
        console.error('Gagal mengisi tanda "-" pada Penilaian Lanjut.', error);
      }
    }

    showStatus(`Selesai: ${changed} kolom diisi “-”.`
      + (failed ? ` ${failed} kolom gagal; periksa manual.` : '')
      + ' Checklist dan tombol simpan tidak diubah.');
  });
})();
