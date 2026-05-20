# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.3] - 2026-05-20

### Fixed
- Show total kWh toggle now reflects its saved state when re-opening the editor

### Added
- Screenshots added to README (single battery, two batteries, total kWh view)
- `show_total` documented in README options table

## [0.6.2] - 2026-05-20

### Changed
- kWh label inside battery uses a dark hue-matched colour when the fill covers it, white when over the dark background

## [0.6.1] - 2026-05-20

### Fixed
- Show total kWh toggle now works — title form handler was only saving `title`, dropping `show_total`
- Battery corner radius reverted to 6 (16 looked too rounded)

## [0.6.0] - 2026-05-20

### Added
- Optional total kWh display — enable "Show total kWh" in the editor to show combined remaining energy below the grid
- `show_total` toggle added to card editor

### Changed
- Battery body corners rounded (radius 16) for a softer look
- New card added via UI starts empty — no pre-filled placeholder entity names

### Fixed
- Card no longer throws when batteries list is empty

## [0.5.1] - 2026-05-20

### Fixed
- Title input no longer loses focus after each keystroke — editor now only re-renders when battery count changes, not on every value update

## [0.5.0] - 2026-05-20

### Fixed
- Add Battery button replaced with a plain styled `<button>` — mwc-button CSS vars were unreliable in shadow DOM
- kWh label inside battery SVG increased from 11px to 13px

## [0.4.0] - 2026-05-20

### Fixed
- Editor field labels now display correctly — set `computeLabel` on ha-form so it uses the `label` property instead of falling back to the field name
- Add Battery button is now correctly styled blue using inline CSS custom properties and the `raised` attribute

## [0.3.0] - 2026-05-20

### Changed
- Editor entity picker labels renamed to "Battery Percentage" and "Battery Power (kWh)"
- Add Battery button styled blue
- Removed background pill from kWh label inside battery SVG

## [0.2.0] - 2026-05-20

### Added
- Visual card editor using `ha-form` with entity pickers — add/remove batteries via the UI
- kWh value now displayed inside the battery graphic (centred), not below it

## [0.1.0] - 2026-05-20

### Fixed
- Percentage value now rounds to 2 decimal places instead of showing raw float
- Card background is now transparent, inheriting the HA theme

### Added
- Initial release
- Glowing neon SVG battery graphic with animated fill level
- Colour transitions: red (0–20 %), amber (21–50 %), green (51–100 %)
- Glow-pulse CSS animation on the fill
- Support for multiple battery entities displayed in a responsive grid
- Displays charge percentage and energy (kWh) per battery
- Tap-to-more-info on each battery cell
- Optional card title
- `getStubConfig` for Lovelace card picker preview
- HACS-compatible `hacs.json`
