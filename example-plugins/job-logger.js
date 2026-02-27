const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'Job History Logger',
    onStateUpdate: async (storeName, state) => {
        // Monitor job status passing from 'running' to 'complete' for example
        if (storeName === 'jobStore' && state.jobStatus === 'complete') {
            const logFile = path.join(__dirname, 'job-history.csv');

            const timestamp = new Date().toISOString();

            // Format some basic stats: timestamp, estimated time, real time, etc.
            const stats = `${timestamp}, Completed\n`;

            try {
                // Determine if we need to write the header
                if (!fs.existsSync(logFile)) {
                    fs.writeFileSync(logFile, "Date,Status\n", 'utf8');
                }

                // Append the job
                fs.appendFileSync(logFile, stats, 'utf8');
                console.log(`[Job Logger] Saved job execution stats to ${logFile}`);
            } catch (err) {
                console.error(`[Job Logger] Failed to write log:`, err);
            }
        }
    }
};
