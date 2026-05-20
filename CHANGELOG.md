# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
