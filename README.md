# HA Battery Card

A Home Assistant Lovelace custom card that displays battery charge level and energy (kWh) with a glowing, colour-coded SVG graphic. Supports multiple batteries in a responsive grid layout.

![Battery Card Preview](preview.png)

---

## Features

- Animated neon SVG battery graphic — fill level reflects real charge
- Colour shifts automatically: red (0–20 %), amber (21–50 %), green (51–100 %)
- Subtle glow-pulse animation
- Responsive grid — fits 1 to many batteries on one card
- Tap a battery to open the entity's more-info dialog
- No build step — single JS file

---

## Installation

### Manual

1. Download `dist/ha-battery-card.js` and copy it to your Home Assistant `/config/www/` directory.
2. In Home Assistant go to **Settings → Dashboards → Resources** and add:
   - **URL:** `/local/ha-battery-card.js`
   - **Type:** JavaScript module
3. Reload the browser, then add the card via the dashboard editor.

### HACS

1. In HACS go to **Frontend → Custom repositories**.
2. Add this repository URL and select **Lovelace** as the category.
3. Install **HA Battery Card**, then add the resource as above.

---

## Configuration

```yaml
type: custom:ha-battery-card
title: Battery Status         # optional — card header text
batteries:
  - name: Home Battery
    percentage_entity: sensor.battery_level      # entity with 0–100 state
    energy_entity: sensor.battery_energy_kwh     # entity with kWh state
  - name: Solar Store
    percentage_entity: sensor.solar_battery_level
    energy_entity: sensor.solar_battery_kwh
  - name: EV
    percentage_entity: sensor.ev_battery_level
    # energy_entity is optional — omit if you only have %
```

### Options

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `title` | string | No | Card header text |
| `batteries` | list | Yes | One or more battery definitions (see below) |

**Battery definition**

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `name` | string | No | Display label shown below the graphic |
| `percentage_entity` | string | Yes* | Entity ID whose state is the charge percentage (0–100) |
| `energy_entity` | string | No | Entity ID whose state is energy in kWh |

\* At least one of `percentage_entity` or `energy_entity` is required per entry.

---

## Colour thresholds

| Range | Colour |
|-------|--------|
| 0 – 20 % | Red `#ff2020` |
| 21 – 50 % | Amber `#ffaa00` |
| 51 – 100 % | Green `#39ff14` |

---

## Contributing

Issues and pull requests are welcome. Please update `CHANGELOG.md` and bump the version in `dist/ha-battery-card.js` before opening a release PR.

---

## License

MIT
