(() => {
  const CARD_VERSION = '0.1.0';

  function getColor(pct) {
    if (pct <= 20) return { fill: '#ff2020', glow: 'rgba(255,32,32,0.7)' };
    if (pct <= 50) return { fill: '#ffaa00', glow: 'rgba(255,170,0,0.7)' };
    return { fill: '#39ff14', glow: 'rgba(57,255,20,0.7)' };
  }

  function buildSVG(pct, color) {
    const W = 80, H = 140;
    const termW = 24, termH = 8;
    const bodyR = 6;
    const fillH = Math.round((H - 4) * (pct / 100));
    const fillY = 4 + (H - 4) - fillH;

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
        rx="3" ry="3" fill="#333355"/>

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

    const kwhStr = kwh !== null && !isNaN(kwh)
      ? `<div class="battery-kwh">${kwh.toFixed(1)} kWh</div>` : '';

    return `
<div class="battery-cell">
  <div class="battery-svg-wrap">${buildSVG(pct, color)}</div>
  <div class="battery-pct" style="color:${color.fill};text-shadow:0 0 8px ${color.glow}">${pct.toFixed(2)}%</div>
  ${kwhStr}
  <div class="battery-name">${battery.name || ''}</div>
</div>`;
  }

  const STYLES = `
    :host {
      display: block;
    }
    ha-card {
      overflow: hidden;
    }
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
    .battery-kwh {
      font-size: 0.85em;
      color: #99a;
      letter-spacing: 0.03em;
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
    .battery-fill {
      animation: glow-pulse 2.4s ease-in-out infinite;
    }
  `;

  class HaBatteryCard extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._config = null;
      this._hass = null;
    }

    setConfig(config) {
      if (!config.batteries || !Array.isArray(config.batteries) || config.batteries.length === 0) {
        throw new Error('ha-battery-card: provide at least one entry in "batteries"');
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
</ha-card>`;

      shadow.querySelectorAll('.battery-cell').forEach((cell, i) => {
        cell.addEventListener('click', () => this._handleClick(i));
      });
    }

    _update() {
      const grid = this.shadowRoot.querySelector('.battery-grid');
      if (!grid) return;
      grid.innerHTML = this._config.batteries
        .map(b => buildCell(b, this._hass))
        .join('');

      grid.querySelectorAll('.battery-cell').forEach((cell, i) => {
        cell.addEventListener('click', () => this._handleClick(i));
      });
    }

    _handleClick(index) {
      const battery = this._config.batteries[index];
      const entity = battery.percentage_entity || battery.energy_entity;
      if (!entity) return;
      const event = new CustomEvent('hass-more-info', {
        bubbles: true, composed: true,
        detail: { entityId: entity }
      });
      this.dispatchEvent(event);
    }

    static getConfigElement() {
      const editor = document.createElement('hui-card-element-editor');
      editor.cardConfig = {};
      return editor;
    }

    static getStubConfig() {
      return {
        title: 'Battery Status',
        batteries: [
          { name: 'Home Battery', percentage_entity: 'sensor.battery_level', energy_entity: 'sensor.battery_energy_kwh' }
        ]
      };
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
