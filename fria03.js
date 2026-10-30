(() => {
  const panelId = 'lsp-fria03-helper';
  if (document.getElementById(panelId)) return;

  let activeRow = null;
  const activeClass = 'lsp-fria03-active-row';
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

  const host = document.createElement('div');
  host.id = panelId;
  host.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:2147483647;';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `
    <style>
      :host { all: initial; }
      .panel { font: 14px/1.4 Arial, sans-serif; color: #172033; }
      .actions { display: flex; flex-wrap: wrap; gap: 7px; }
      button, select {
        border: 0; border-radius: 8px; padding: 10px 12px;
        color: #fff; background: #2457a7; font: 600 13px Arial, sans-serif;
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
      select { color: #172033; background: #fff; border: 1px solid #aeb8c7; }
      .feedback { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 7px; }
      .status {
        display: none; max-width: 390px; margin-top: 8px; padding: 10px 12px;
        white-space: pre-line; border-radius: 7px; background: #fff;
        box-shadow: 0 2px 8px #0003;
      }
      .status.visible { display: block; }
    </style>
    <div class="panel">
      <div class="tools">
        <div class="actions">
          <button type="button" class="next">Sorot baris yang perlu dilengkapi</button>
          <button type="button" class="yes secondary" disabled>Ya untuk baris aktif</button>
          <button type="button" class="response secondary" disabled>Isi tanggapan kosong baris ini</button>
        </div>
        <div class="feedback">
          <select aria-label="Pilihan umpan balik">
            <option value="">Pilih umpan balik...</option>
            <option value="Sudah bagus">Sudah bagus</option>
            <option value="Cukup">Cukup</option>
            <option value="Kurang">Kurang</option>
          </select>
          <button type="button" class="fill-feedback secondary">Terapkan ke semua umpan balik</button>
        </div>
        <div class="status" role="status" aria-live="polite"></div>
      </div>
      <button type="button" class="minimize" aria-expanded="true">Minimalkan alat bantu</button>
    </div>
  `;
  document.documentElement.append(host);

  const nextButton = shadow.querySelector('.next');
  const yesButton = shadow.querySelector('.yes');
  const responseButton = shadow.querySelector('.response');
  const feedbackSelect = shadow.querySelector('select');
  const fillFeedbackButton = shadow.querySelector('.fill-feedback');
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

  function getQuestionTables() {
    return [...document.querySelectorAll('table')].filter((table) => {
      const headers = [...table.querySelectorAll('th')]
        .map((header) => normalize(header.innerText || header.textContent));
      return headers.includes('pertanyaan')
        && headers.includes('tanggapan')
        && headers.includes('pencapaian')
        && headers.includes('ya')
        && headers.includes('tidak');
    });
  }

  function getQuestionRows() {
    return getQuestionTables().flatMap((table) =>
      [...table.rows].filter((row) =>
        row.querySelector('textarea')
        && row.querySelector('input[type="checkbox"][data-kbnav-col="ya"]')
        && row.querySelector('input[type="checkbox"][data-kbnav-col="tidak"]')
      )
    );
  }

  function getIncompleteRows() {
    return getQuestionRows().filter((row) => {
      const yes = row.querySelector('input[type="checkbox"][data-kbnav-col="ya"]');
      const no = row.querySelector('input[type="checkbox"][data-kbnav-col="tidak"]');
      const response = row.querySelector('textarea');
      return (!yes.checked && !no.checked) || !response.value.trim();
    });
  }

  function updateActiveActions() {
    const yes = activeRow?.querySelector('input[type="checkbox"][data-kbnav-col="ya"]');
    const no = activeRow?.querySelector('input[type="checkbox"][data-kbnav-col="tidak"]');
    const response = activeRow?.querySelector('textarea');
    yesButton.disabled = !yes || !no || yes.checked || no.checked;
    responseButton.disabled = !response || Boolean(response.value.trim());
  }

  function clearActiveRow() {
    activeRow?.classList.remove(activeClass);
    activeRow = null;
    yesButton.disabled = true;
    responseButton.disabled = true;
  }

  function focusNextBlankRow() {
    const incompleteRows = getIncompleteRows();
    if (incompleteRows.length === 0) {
      clearActiveRow();
      showStatus('Tidak ada pencapaian atau tanggapan kosong yang ditemukan.');
      return;
    }

    const currentIndex = incompleteRows.indexOf(activeRow);
    const nextIndex = (currentIndex + 1 + incompleteRows.length) % incompleteRows.length;
    clearActiveRow();
    activeRow = incompleteRows[nextIndex];
    activeRow.classList.add(activeClass);
    updateActiveActions();
    activeRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    (activeRow.querySelector('textarea')?.value.trim()
      ? activeRow.querySelector('input[type="checkbox"][data-kbnav-col="ya"]')
      : activeRow.querySelector('textarea'))
      ?.focus({ preventScroll: true });
    showStatus(`Baris disorot (${incompleteRows.length} baris masih perlu dilengkapi). Periksa butir dan bukti sebelum mengisi tanggapan atau menentukan pencapaian.`);
  }

  function setFieldValue(field, value) {
    const prototype = field instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (!setter) throw new Error('Setter nilai field tidak tersedia.');
    setter.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }

  nextButton.addEventListener('click', focusNextBlankRow);

  yesButton.addEventListener('click', () => {
    if (!activeRow?.isConnected) {
      clearActiveRow();
      showStatus('Baris aktif tidak tersedia. Sorot pencapaian kosong terlebih dahulu.');
      return;
    }

    const yes = activeRow.querySelector('input[type="checkbox"][data-kbnav-col="ya"]');
    const no = activeRow.querySelector('input[type="checkbox"][data-kbnav-col="tidak"]');
    if (!yes || !no || yes.checked || no.checked) {
      clearActiveRow();
      showStatus('Baris ini tidak lagi kosong. Periksa pilihan sebelum melanjutkan.');
      return;
    }

    yes.click();
    if (!yes.checked) {
      showStatus('Pilihan “Ya” belum berubah. Periksa baris secara manual.');
      return;
    }

    clearActiveRow();
    showStatus('“Ya” dipilih hanya untuk satu baris. Tidak ada penyimpanan otomatis.');
  });

  responseButton.addEventListener('click', () => {
    if (!activeRow?.isConnected) {
      clearActiveRow();
      showStatus('Sorot pencapaian kosong terlebih dahulu.');
      return;
    }

    const response = activeRow.querySelector('textarea');
    if (!response || response.value.trim()) {
      showStatus('Tanggapan baris aktif sudah berisi teks atau field tidak ditemukan; tidak ditimpa.');
      return;
    }

    if (!window.confirm('Isi tanggapan “Sudah terwakilkan saat observasi” hanya pada baris yang disorot?')) {
      return;
    }

    setFieldValue(response, 'Sudah terwakilkan saat observasi');
    if (response.value.trim() === 'Sudah terwakilkan saat observasi') {
      updateActiveActions();
      showStatus('Tanggapan diisi hanya pada baris aktif. Tinjau sebelum menyimpan manual.');
    } else {
      showStatus('Tanggapan belum berhasil diisi; periksa baris secara manual.');
    }
  });

  fillFeedbackButton.addEventListener('click', async () => {
    const selectedFeedback = feedbackSelect.value;
    if (!selectedFeedback) {
      showStatus('Pilih “Sudah bagus”, “Cukup”, atau “Kurang” terlebih dahulu.');
      return;
    }

    const feedbackFields = [...document.querySelectorAll('textarea[placeholder="Tulis umpan balik"]')];
    if (feedbackFields.length === 0) {
      showStatus('Field umpan balik tidak ditemukan. Tidak ada perubahan.');
      return;
    }
    const fieldsToUpdate = feedbackFields.filter((field) => field.value.trim() !== selectedFeedback);
    if (fieldsToUpdate.length === 0) {
      showStatus(`Semua ${feedbackFields.length} field umpan balik sudah berisi “${selectedFeedback}”. Tidak ada perubahan.`);
      return;
    }

    if (!window.confirm(`Terapkan “${selectedFeedback}” ke semua field umpan balik? ${fieldsToUpdate.length} dari ${feedbackFields.length} field akan diisi atau diganti. Nilai umpan balik yang sudah ada pada field tersebut akan ditimpa.`)) {
      return;
    }

    let changed = 0;
    let failed = 0;
    for (const field of fieldsToUpdate) {
      try {
        if (!field.isConnected) {
          failed += 1;
          continue;
        }
        if (field.value.trim() === selectedFeedback) continue;
        setFieldValue(field, selectedFeedback);
        if (field.value.trim() === selectedFeedback) changed += 1;
        else failed += 1;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      } catch (error) {
        failed += 1;
        console.error('Gagal mengisi field umpan balik FRIA03.', error);
      }
    }

    showStatus(`Selesai: ${changed} field umpan balik diisi “${selectedFeedback}”.`
      + (failed ? ` ${failed} field gagal; periksa manual.` : '')
      + ' Tidak ada penyimpanan otomatis.');
  });
})();
