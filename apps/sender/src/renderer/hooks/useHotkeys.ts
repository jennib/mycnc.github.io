import { useEffect, useRef } from 'react';
import { useConnectionStore } from '../stores/connectionStore';
import { useSettingsStore } from '../stores/settingsStore';

interface HotkeyHandlers {
  handleEmergencyStop: () => void;
  handleManualCommand: (command: string) => void;
  handleJogStop: () => void;
}

export const useHotkeys = (handlers: HotkeyHandlers) => {
  const { handleEmergencyStop, handleManualCommand, handleJogStop } = handlers;
  const { machineSettings } = useSettingsStore();
  const connectionActions = useConnectionStore((state) => state.actions);
  const activeJogKeyRef = useRef<string | null>(null);
  const lastJogStopTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.repeat ||
        (document.activeElement &&
          (document.activeElement.tagName === 'INPUT' ||
            document.activeElement.tagName === 'TEXTAREA'))
      ) {
        return;
      }

      if (activeJogKeyRef.current) {
        return;
      }

      if (Date.now() - lastJogStopTimeRef.current < 50) {
        return;
      }

      let axis: string | null = null;
      let direction = 0;

      switch (event.key) {
        case 'ArrowUp':
          axis = 'Y';
          direction = 1;
          break;
        case 'ArrowDown':
          axis = 'Y';
          direction = -1;
          break;
        case 'ArrowLeft':
          axis = 'X';
          direction = -1;
          break;
        case 'ArrowRight':
          axis = 'X';
          direction = 1;
          break;
        case 'PageUp':
          axis = 'Z';
          direction = 1;
          break;
        case 'PageDown':
          axis = 'Z';
          direction = -1;
          break;
      }

      if (axis && direction !== 0) {
        event.preventDefault();
        activeJogKeyRef.current = event.key;
        const { jogFeedRate } = machineSettings;
        const distance = direction * 99999;
        const command = `$J=G91 ${axis}${distance} F${jogFeedRate}`;
        connectionActions.sendLine(command).catch((err) => {
          console.error('Failed to start jog:', err);
          activeJogKeyRef.current = null;
        });
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === activeJogKeyRef.current) {
        event.preventDefault();
        handleJogStop();
        activeJogKeyRef.current = null;
        lastJogStopTimeRef.current = Date.now();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (activeJogKeyRef.current) {
        handleJogStop();
      }
    };
  }, [machineSettings, connectionActions, handleJogStop]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        document.activeElement &&
        (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      let handled = false;
      switch (event.key) {
        case 'Escape':
          handleEmergencyStop();
          handled = true;
          break;
        case 'x':
          handleManualCommand('$X');
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleEmergencyStop, handleManualCommand]);
};
