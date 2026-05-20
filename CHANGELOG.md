# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
