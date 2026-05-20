(() => {
  const CARD_VERSION = '0.6.2';

  function getColor(pct) {
    if (pct <= 20) return { fill: '#ff2020', glow: 'rgba(255,32,32,0.7)', dark: '#4d0000' };
    if (pct <= 50) return { fill: '#ffaa00', glow: 'rgba(255,170,0,0.7)', dark: '#4d3300' };
    return { fill: '#39ff14', glow: 'rgba(57,255,20,0.7)', dark: '#004d00' };
  }

  function buildSVG(pct, color, kwh) {
    const W = 80, H = 140;
    const termW = 24, termH = 8;
    const bodyR = 6;
    const fillH = Math.round((H - 4) * (pct / 100));
    const fillY = 4 + (H - 4) - fillH;
    const bodyCenterY = termH + 2 + (H - 4) / 2;

    const fillCoversCenter = fillY <= bodyCenterY;
    const kwhTextColor = fillCoversCenter ? color.dark : 'white';
    const kwhLabel = (kwh !== null && !isNaN(kwh))
      ? `
  <text x="${W / 2}" y="${bodyCenterY + 4}" text-anchor="middle"
        font-size="13" font-family="sans-serif" font-weight="600"
        fill="${kwhTextColor}" style="pointer-events:none">${kwh.toFixed(2)} kWh</text>`
      : '';

    return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + termH}" viewBox="0 0 ${W} ${H + termH}" style="display:block;overflow:visible">
  <defs>
    <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#0d0d1a"/>
    </linearGradient>
    <linearGradient id="fill-grad-${pct}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color.fill}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${color.fill}" stop-opacity="0.7"/>
    </linearGradient>
    <filter id="glow-${pct}" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="body-clip-${pct}">
      <rect x="2" y="${termH + 2}" width="${W - 4}" height="${H - 4}" rx="${bodyR}" ry="${bodyR}"/>
    </clipPath>
  </defs>

  <!-- Terminal nub -->
  <rect x="${(W - termW) / 2}" y="0" width="${termW}" height="${termH + 2}"
        rx="5" ry="5" fill="#333355"/>

  <!-- Battery body background -->
  <rect x="2" y="${termH + 2}" width="${W - 4}" height="${H - 4}"
        rx="${bodyR}" ry="${bodyR}"
        fill="url(#bg-grad)" stroke="#334" stroke-width="2"/>

  <!-- Fill level -->
  <rect x="2" y="${fillY}" width="${W - 4}" height="${fillH}"
        fill="url(#fill-grad-${pct})"
        clip-path="url(#body-clip-${pct})"
        filter="url(#glow-${pct})"
        class="battery-fill"/>

  <!-- Shine overlay -->
  <rect x="2" y="${termH + 2}" width="${(W - 4) / 2}" height="${H - 4}"
        rx="${bodyR}" ry="${bodyR}"
        fill="rgba(255,255,255,0.04)"
        clip-path="url(#body-clip-${pct})"/>

  <!-- Border glow when charged -->
  ${pct > 20 ? `<rect x="2" y="${termH + 2}" width="${W - 4}" height="${H - 4}"
        rx="${bodyR}" ry="${bodyR}"
        fill="none" stroke="${color.fill}" stroke-width="1.5" stroke-opacity="0.5"
        filter="url(#glow-${pct})"/>` : ''}

  <!-- kWh label centred in body -->
  ${kwhLabel}
</svg>`;
  }

  function buildCell(battery, hass) {
    const pctState = hass && battery.percentage_entity
      ? hass.states[battery.percentage_entity] : null;
    const kwhState = hass && battery.energy_entity
      ? hass.states[battery.energy_entity] : null;

    const pct = pctState ? Math.min(100, Math.max(0, parseFloat(pctState.state) || 0)) : 0;
    const kwh = kwhState ? parseFloat(kwhState.state) : null;
    const color = getColor(pct);

    return `
<div class="battery-cell">
  <div class="battery-svg-wrap">${buildSVG(pct, color, kwh)}</div>
  <div class="battery-pct" style="color:${color.fill};text-shadow:0 0 8px ${color.glow}">${pct.toFixed(2)}%</div>
  <div class="battery-name">${battery.name || ''}</div>
</div>`;
  }

  const STYLES = `
    :host { display: block; }
    ha-card { overflow: hidden; }
    .card-header {
      padding: 14px 16px 4px;
      font-size: 1.1em;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #aab;
    }
    .battery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
      gap: 20px;
      padding: 16px;
    }
    .battery-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .battery-svg-wrap {
      filter: drop-shadow(0 0 6px rgba(0,0,0,0.8));
    }
    .battery-pct {
      font-size: 1.6em;
      font-weight: 700;
      letter-spacing: 0.02em;
      line-height: 1;
    }
    .battery-name {
      font-size: 0.78em;
      color: #778;
      text-align: center;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    @keyframes glow-pulse {
      0%, 100% { opacity: 1; }
      50%       { opacity: 0.75; }
    }
    .battery-fill { animation: glow-pulse 2.4s ease-in-out infinite; }
    .total-kwh {
      text-align: center;
      padding: 4px 16px 16px;
      font-size: 1em;
      font-weight: 600;
      letter-spacing: 0.04em;
      color: #99a;
    }
    .total-kwh span {
      color: #39ff14;
      text-shadow: 0 0 8px rgba(57,255,20,0.6);
    }
  `;

  // ── Editor ──────────────────────────────────────────────────────────────────

  const EDITOR_STYLES = `
    :host { display: block; padding: 4px 0; }
    .battery-row {
      border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
      border-radius: 8px;
      padding: 12px;
      margin: 8px 0;
    }
    .row-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 4px;
    }
    .remove-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--error-color, #f44336);
      font-size: 0.85em;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .remove-btn:hover { background: var(--error-color, #f44336); color: white; }
    .add-row {
      margin-top: 8px;
      display: flex;
      justify-content: flex-end;
    }
  `;

  const TITLE_SCHEMA = [
    { name: 'title', label: 'Card title', selector: { text: {} } },
    { name: 'show_total', label: 'Show total kWh', selector: { boolean: {} } },
  ];

  const BATTERY_SCHEMA = [
    { name: 'name', label: 'Battery name', selector: { text: {} } },
    { name: 'percentage_entity', label: 'Battery Percentage', selector: { entity: { domain: 'sensor' } } },
    { name: 'energy_entity', label: 'Battery Power (kWh)', selector: { entity: { domain: 'sensor' } } },
  ];

  class HaBatteryCardEditor extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = null;
      this._hass = null;
    }

    set hass(hass) {
      this._hass = hass;
      this.shadowRoot.querySelectorAll('ha-form').forEach(f => { f.hass = hass; });
    }

    setConfig(config) {
      const newConfig = { batteries: [], ...JSON.parse(JSON.stringify(config)) };
      const needsRender = !this._config ||
        newConfig.batteries.length !== this._config.batteries.length;
      this._config = newConfig;
      if (needsRender) this._render();
    }

    _fire() {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: { config: this._config },
        bubbles: true, composed: true,
      }));
    }

    _render() {
      const shadow = this.shadowRoot;
      shadow.innerHTML = `<style>${EDITOR_STYLES}</style>`;

      // Title form
      const titleForm = document.createElement('ha-form');
      titleForm.hass = this._hass;
      titleForm.data = { title: this._config.title || '' };
      titleForm.schema = TITLE_SCHEMA;
      titleForm.computeLabel = s => s.label || s.name;
      titleForm.addEventListener('value-changed', e => {
        this._config = { ...this._config, ...e.detail.value };
        this._fire();
      });
      shadow.appendChild(titleForm);

      // Per-battery rows
      this._config.batteries.forEach((battery, i) => {
        const row = document.createElement('div');
        row.className = 'battery-row';

        const header = document.createElement('div');
        header.className = 'row-header';
        const label = document.createElement('span');
        label.textContent = `Battery ${i + 1}`;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          this._config.batteries.splice(i, 1);
          this._fire();
          this._render();
        });
        header.appendChild(label);
        header.appendChild(removeBtn);
        row.appendChild(header);

        const form = document.createElement('ha-form');
        form.hass = this._hass;
        form.data = {
          name: battery.name || '',
          percentage_entity: battery.percentage_entity || '',
          energy_entity: battery.energy_entity || '',
        };
        form.schema = BATTERY_SCHEMA;
        form.computeLabel = s => s.label || s.name;
        form.addEventListener('value-changed', e => {
          this._config.batteries[i] = { ...this._config.batteries[i], ...e.detail.value };
          this._fire();
        });
        row.appendChild(form);
        shadow.appendChild(row);
      });

      // Add battery button
      const addRow = document.createElement('div');
      addRow.className = 'add-row';
      const addBtn = document.createElement('button');
      addBtn.textContent = '+ Add Battery';
      addBtn.style.cssText = 'background:#1976d2;color:white;border:none;border-radius:4px;padding:8px 16px;font-size:0.875em;font-weight:500;cursor:pointer;letter-spacing:0.04em;';
      addBtn.addEventListener('click', () => {
        this._config.batteries.push({ name: '', percentage_entity: '', energy_entity: '' });
        this._fire();
        this._render();
      });
      addRow.appendChild(addBtn);
      shadow.appendChild(addRow);
    }
  }

  if (!customElements.get('ha-battery-card-editor')) {
    customElements.define('ha-battery-card-editor', HaBatteryCardEditor);
  }

  // ── Card ────────────────────────────────────────────────────────────────────

  class HaBatteryCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = null;
      this._hass = null;
    }

    setConfig(config) {
      if (!config.batteries || !Array.isArray(config.batteries)) {
        throw new Error('ha-battery-card: "batteries" must be a list');
      }
      this._config = config;
      this._buildDOM();
      if (this._hass) this._update();
    }

    set hass(hass) {
      this._hass = hass;
      if (this._config) this._update();
    }

    getCardSize() { return 3; }

    _buildDOM() {
      const shadow = this.shadowRoot;
      shadow.innerHTML = `
<style>${STYLES}</style>
<ha-card>
  ${this._config.title ? `<div class="card-header">${this._config.title}</div>` : ''}
  <div class="battery-grid"></div>
  <div class="total-kwh" style="display:none"></div>
</ha-card>`;
    }

    _update() {
      const grid = this.shadowRoot.querySelector('.battery-grid');
      if (!grid) return;
      grid.innerHTML = this._config.batteries.map(b => buildCell(b, this._hass)).join('');
      grid.querySelectorAll('.battery-cell').forEach((cell, i) => {
        cell.addEventListener('click', () => this._handleClick(i));
      });

      const totalEl = this.shadowRoot.querySelector('.total-kwh');
      if (totalEl) {
        if (this._config.show_total) {
          const values = this._config.batteries
            .map(b => b.energy_entity && this._hass?.states[b.energy_entity])
            .filter(s => s && s.state !== 'unavailable' && s.state !== 'unknown')
            .map(s => parseFloat(s.state))
            .filter(v => !isNaN(v));
          if (values.length) {
            const total = values.reduce((a, b) => a + b, 0);
            totalEl.innerHTML = `Total remaining: <span>${total.toFixed(2)} kWh</span>`;
            totalEl.style.display = '';
          } else {
            totalEl.style.display = 'none';
          }
        } else {
          totalEl.style.display = 'none';
        }
      }
    }

    _handleClick(index) {
      const battery = this._config.batteries[index];
      const entity = battery.percentage_entity || battery.energy_entity;
      if (!entity) return;
      this.dispatchEvent(new CustomEvent('hass-more-info', {
        bubbles: true, composed: true, detail: { entityId: entity },
      }));
    }

    static getConfigElement() {
      return document.createElement('ha-battery-card-editor');
    }

    static getStubConfig() {
      return { batteries: [] };
    }
  }

  if (!customElements.get('ha-battery-card')) {
    customElements.define('ha-battery-card', HaBatteryCard);
    console.info(`%c HA-BATTERY-CARD %c v${CARD_VERSION} `,
      'background:#39ff14;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px',
      'background:#1a1a2e;color:#39ff14;font-weight:700;padding:2px 4px;border-radius:0 3px 3px 0');
  }

  window.customCards = window.customCards || [];
  window.customCards.push({
    type: 'ha-battery-card',
    name: 'Battery Card',
    description: 'Displays battery charge level and energy with a glowing SVG graphic.',
    preview: true,
  });
})();
