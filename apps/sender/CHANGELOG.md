# Changelog

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
