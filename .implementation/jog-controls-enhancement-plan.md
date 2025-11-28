# Jog Controls Implementation Review & Enhancement Plan

## Current State Analysis

### Issues Identified

1. **Continuous Jogging Not Implemented**
   - Current: Only sends single jog commands on key press
   - Problem: Holding a key sends ONE command, doesn't continuously jog
   - Line 107-111 in JogPanel.tsx: `pressedJogKey.current !== event.key` prevents repeat commands

2. **No Jog Cancellation on Key Release**
   - Current: Line 125 has `onJogStop()` commented out
   - Problem: Machine doesn't stop when key is released
   - Jog commands complete their full distance even if user releases key

3. **Command Buffering Issues**
   - Current: GrblController.jog() uses `sendCommand()` which waits for 'ok'
   - Problem: Commands queue up, causing delayed response
   - Line 174 in GrblController: Rejects new commands if one is pending

4. **No Gamepad Support**
   - Current: Only keyboard and UI button support
   - Missing: Gamepad API integration

5. **Alarm State Not Properly Handled**
   - Current: `isControlDisabled` checks for alarm, but doesn't cancel ongoing jogs
   - Problem: Buffered commands may execute after alarm

## GRBL Jogging Fundamentals

### GRBL Jog Command Format
```
$J=G91 X10 Y5 Z0 F1000
```
- `$J=` : Jog command prefix
- `G91`: Incremental mode
- `X/Y/Z`: Distance to move
- `F`: Feed rate

### GRBL Jog Behavior
1. **Jog commands CAN be cancelled** with jog cancel realtime command (`0x85`)
2. **Jog commands buffer** in GRBL's planner (up to ~15 commands)
3. **Continuous jogging** = send small incremental jogs repeatedly
4. **Stopping** = send jog cancel + drain buffer

## Proposed Solution

### Architecture

```
User Input (Keyboard/UI/Gamepad)
  ↓
JogManager (New Service)
  ├─ Continuous Jog Loop
  ├─ Command Queue Management  
  ├─ Alarm State監視
  └─ Jog Cancel on Release
  ↓
Controller (sendRealtimeCommand for jog cancel, sendCommand for jog)
  ↓
GRBL
```

### Implementation Strategy

#### 1. Create JogManager Service

**Responsibilities:**
- Manage continuous jogging (send commands in loop while button held)
- Track active jog direction/axis
- Cancel jog immediately on button release
- Prevent buffering during continuous jog
- Allow buffering for quick tap movements
- Monitor alarm state and cancel all jogs

**States:**
- `idle`: No jogging
- `continuous`: Button held, sending continuous small jogs
- `discrete`: Single jog command (tap), allow  buffering

#### 2. Modify JogPanel.tsx

**Keyboard Handling:**
```typescript
// Detect hold vs tap
const keyDownTime = useRef<number>(0);
const HOLD_THRESHOLD = 150ms; // If held longer than this = continuous

handleKeyDown:
  - Record keyDownTime
  - Start continuous jog after threshold
  
handleKeyUp:
  - If held < threshold: Send single buffered jog
  - If held >= threshold: Cancel continuous jog
```

**UI Button Handling:**
```typescript
onMouseDown / onTouchStart:
  - Start continuous jog after short delay
  
onMouseUp / onTouchEnd / onMouseLeave:
  - Cancel continuous jog or send single jog
```

#### 3. Gamepad Integration

**New useGamepad Hook:**
```typescript
useGamepad():
  - Poll gamepad state (60Hz)
  - Map axes to X/Y/Z movement
  - Map triggers/buttons to jog speed multiplier
  - Deadzone handling (ignore small stick movements)
  - Smooth analog → digital conversion
```

**Supported Controls:**
- Left stick: X/Y movement
- Right stick: Z movement (or rotation if implemented)
- Triggers: Speed control (slow/fast)
- D-pad: Discrete step jogs

#### 4. Enhanced Controller Method

**New: `jogContinuous()` method**
```typescript
jogContinuous(axis, direction, feedRate):
  - Send small incremental jog (e.g., 1mm)
  - Don't wait for 'ok' (use realtime if possible)
  - Repeat every ~100ms while active
```

**Enhanced: `jogStop()` method**
```typescript
jogStop():
  - Send 0x85 (jog cancel) realtime command
  - Clear any internal jog state
  - Flush command queue
```

### Safety Features

1. **Alarm Detection**
   - Monitor machine state in JogManager
   - If state becomes 'Alarm': immediately cancel all jogs
   - Prevent new jog commands if in alarm

2. **Connection Loss**
   - Cancel all jogs if connection drops
   - Don't allow jogging while disconnected

3. **Job Running**
   -  Don't allow jogging during active job

4. **Limit Override Safety**
   - Respect soft limits
   - Warn before approaching limits

### Configuration

**New Settings:**
```typescript
{
  jogContinuousInterval: 100, // ms between continuous jog commands
  jogContinuousDistance: 1, // mm per continuous jog step
  jogHoldThreshold: 150, // ms to detect hold vs tap
  gamepadDeadzone: 0.15, // Ignore stick input below this
  gamepadPollRate: 60 // Hz
}
```

## Implementation Order

1. ✅ **Phase 1: Fix Current Issues** (CRITICAL)
   - Uncomment jog stop on key release
   - Implement tap vs hold detection
   - Test basic jog cancellation

2. **Phase 2: Continuous Jogging** (HIGH)
   - Create JogManager service
   - Implement continuous jog loop
   - Integrate with keyboard/UI

3. **Phase 3: Buffer Management** (HIGH)
   - Distinguish continuous vs discrete jogs
   - Implement proper buffering for taps
   - Add alarm state monitoring

4. **Phase 4: Gamepad Support** (MEDIUM)
   - Create useGamepad hook
   - Map gamepad inputs to jog commands
   - Test with various gamepad types

5. **Phase 5: Polish** (LOW)
   - Add jog speed indicators
   - Visual feedback for active jog direction  
   - Settings UI for jog parameters

## Testing Strategy

### Manual Testing
1. Hold arrow key - machine should jog continuously
2. Release arrow key - machine should stop immediately
3. Tap arrow key quickly multiple times - commands should buffer/execute in sequence
4. Trigger alarm during jog - all jogs should cancel
5. Unplug during jog - graceful handling

### Edge Cases
- Rapid key presses
- Multiple keys simultaneously
- Connection loss mid-jog
- Alarm triggered mid-jog
- Soft limit approach
- Very large jog steps

## Files to Modify

1. `src/renderer/services/JogManager.ts` (NEW)
2. `src/renderer/components/JogPanel.tsx` (MODIFY)
3. `src/renderer/controllers/GrblController.ts` (MODIFY)
4. `src/renderer/hooks/useGamepad.ts` (NEW)
5. `src/renderer/stores/machineStore.ts` (MODIFY)
6. `src/renderer/types.ts` (ADD jog types)

## Risk Assessment

**High Risk:**
- Continuous jogging could cause runaway if cancel fails
- Buffer overflow if commands sent too fast
- Gamepad stick drift could cause unintended movement

**Mitigation:**
- Always send jog cancel on cleanup
- Rate limit jog commands
- Implement deadzone for gamepad
- Emergency stop always accessible
- Watchdog timer for continuous jogs

## Success Criteria

✅ Hold button/key → continuous smooth jogging  
✅ Release button/key → immediate stop (< 100ms)  
✅ Quick taps → buffered discrete movements  
✅ Alarm state → all jogs cancelled immediately  
✅ Gamepad → smooth analog control  
✅ No runaway movements  
✅ Responsive feel (no lag)  
✅ Works reliably across all input methods  
