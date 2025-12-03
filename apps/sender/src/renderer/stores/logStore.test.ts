import { describe, it, expect, beforeEach } from 'vitest';
import { useLogStore } from './logStore';

describe('useLogStore', () => {
  // Reset store before each test to ensure isolation
  beforeEach(() => {
    useLogStore.getState().actions.clearLogs();
    useLogStore.getState().actions.setIsVerbose(false);
  });

  it('should add a new log entry', () => {
    const { actions } = useLogStore.getState();
    const initialLogs = useLogStore.getState().logs;
    expect(initialLogs.length).toBe(0);

    actions.addLog({ type: 'info', message: 'Test log' });

    const newLogs = useLogStore.getState().logs;
    expect(newLogs.length).toBe(1);
    expect(newLogs[0].message).toBe('Test log');
    expect(newLogs[0].type).toBe('info');
  });

  it('should clear all log entries', () => {
    const { actions } = useLogStore.getState();
    actions.addLog({ type: 'info', message: 'Test log 1' });
    actions.addLog({ type: 'info', message: 'Test log 2' });

    let logs = useLogStore.getState().logs;
    expect(logs.length).toBe(2);

    actions.clearLogs();

    logs = useLogStore.getState().logs;
    expect(logs.length).toBe(0);
  });

  it('should set the verbose flag', () => {
    const { actions } = useLogStore.getState();
    let isVerbose = useLogStore.getState().isVerbose;
    expect(isVerbose).toBe(false);

    actions.setIsVerbose(true);

    isVerbose = useLogStore.getState().isVerbose;
    expect(isVerbose).toBe(true);
  });

  it('should add an explanation to GRBL error codes', () => {
    const { actions } = useLogStore.getState();
    actions.addLog({ type: 'error', message: 'Something failed error:22' });

    const log = useLogStore.getState().logs[0];
    expect(log.message).toContain('Feed rate has not yet been set or is undefined');
  });

  it('should not consolidate "ok" messages when in verbose mode', () => {
    const { actions } = useLogStore.getState();
    actions.setIsVerbose(true);

    actions.addLog({ type: 'received', message: 'ok' });
    actions.addLog({ type: 'received', message: 'ok' });

    const logs = useLogStore.getState().logs;
    expect(logs.length).toBe(2);
    expect(logs[0].message).toBe('ok');
    expect(logs[1].message).toBe('ok');
  });

  it('should consolidate repeated "ok" messages when not in verbose mode', () => {
    const { actions } = useLogStore.getState();

    actions.addLog({ type: 'received', message: 'ok' });
    actions.addLog({ type: 'received', message: 'ok' });
    actions.addLog({ type: 'received', message: 'ok' });

    const logs = useLogStore.getState().logs;
    expect(logs.length).toBe(1);
    expect(logs[0].message).toBe('ok..');
  });
});
