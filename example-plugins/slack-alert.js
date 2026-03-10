module.exports = {
    name: 'Slack Alarm Notification',
    onStateUpdate: async (storeName, state) => {
        // We listen to the machineStore to check if the machine enters an 'Alarm' status.
        // state.machineState contains the GRBL machine state (status, mpos, wpos, etc.)
        if (storeName === 'machineStore' && state.machineState && state.machineState.status === 'Alarm') {
            console.log('[Slack Plugin] Machine entered ALARM state! Sending webhook...');

            const webhookUrl = 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL';
            const alarmCode = state.machineState.code || 'Unknown';
            const message = `🚨 *CNC Alarm Triggered!* \nAlarm Code: ${alarmCode}\nMachine Position: X:${state.machineState.mpos.x}, Y:${state.machineState.mpos.y}, Z:${state.machineState.mpos.z}`;

            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: message })
                });
                console.log('[Slack Plugin] Webhook sent successfully.');
            } catch (error) {
                console.error('[Slack Plugin] Failed to send webhook:', error);
            }
        }
    }
};
