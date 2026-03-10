# Changelog

## [1.0.34] - 2026-03-10

### Fixed
- **Web Serial Connectivity**: Restored ability to trigger the browser's serial port picker by fixing Electron shim delegation.
- **Remote vs Standalone Logic**: Improved detection of active remote sessions to ensure local hardware access works correctly when running as a standalone web app.

## [1.0.33] - 2026-03-10

### Added
- **Dado & Rabbet Generator**: Support for creating slots and edge recesses with automatic pocketing.
- **Improved Joinery Categorization**: Grouped Joinery projects (Drawer, Mortise & Tenon, Dado & Rabbet) into a dedicated section.

### Fixed
- **Drawer Generator refinement**: Fixed part selection logic to correctly generate Front, Back, Side, and Bottom panels.
- **Drawer Bottom Layout**: Implemented automatic layout for all drawer panels on the work surface.
- **Joinery Mating**: Refined finger joint mating logic for better fit.
- **Mortise & Tenon Defaults**: Set optimal default dimensions (50x20x10) and tolerance (0.1mm).
- **Generator Scaling/Typing**: Fixed issue where some generator string fields (like orientation) were being incorrectly parsed as numbers.

## [1.0.7] - 2025-11-28

### Added
- **Variable Speed Jogging**: Gamepad analog sticks now control jog speed dynamically based on deflection.
- **Smart Buffering**: Discrete jog commands (keyboard/buttons) are buffered (max 3) to prevent queue buildup while maintaining responsiveness.
- **Soft Limits**: Added checks against machine work area to prevent jogging beyond limits when homed.
- **Dominant Axis Control**: Gamepad input now filters for the dominant axis to prevent accidental diagonal movement and stuttering.

### Changed
- **JogManager**: Refactored to support continuous analog jogging and improved state management.
- **JogPanel**: Updated to pass `machineSettings` and `isHomed` to `JogManager` and handle gamepad input with variable feed rates.
- **MachineStore**: Updated `handleJog` to accept an optional `feedRate` parameter.
