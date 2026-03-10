const { dialog, BrowserWindow } = require('electron');

let hasPrompted = false;

module.exports = {
    name: 'X/Y Squaring Guide',
    onStateUpdate: async (storeName, state) => {
        // We will prompt the user the first time the machine enters an 'Idle' state
        if (!hasPrompted && storeName === 'machineStore' && state.machineState && state.machineState.status === 'Idle') {
            hasPrompted = true;

            // Get the main window so the dialogs are spawned as modal overlays to the app
            const mainWindow = BrowserWindow.getAllWindows()[0];

            const { response } = await dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['Yes, start guide', 'No, not right now'],
                title: 'Square Machine Axes',
                message: 'Your machine is Idle. Would you like to run the X/Y Squaring Calibration Guide?'
            });

            if (response === 0) { // User clicked 'Yes'
                // Step 1: Requirements
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['Next Step'],
                    title: 'Squaring Guide: Step 1',
                    message: 'To ensure your X and Y axes are perfectly 90 degrees, we will use the 3-4-5 rule (Pythagorean theorem).\n\nYou will need:\n- A fine-tipped marker or a V-bit on your spindle\n- A ruler or tape measure (metric or imperial)'
                });

                // Step 2: Point A
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['Next Step'],
                    title: 'Squaring Guide: Step 2',
                    message: '1. Using the mycnc sender, jog your machine to the bottom-left of your stock or wasteboard.\n2. Lower the Z-axis to make a small, precise mark (Point A).\n3. Zero your X and Y work coordinates here.'
                });

                // Step 3: Point B
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['Next Step'],
                    title: 'Squaring Guide: Step 3',
                    message: '1. Jog ONLY the X axis to exactly X300 (or X30 if using inches). Do not move Y.\n2. Lower the Z-axis to make a second mark (Point B).'
                });

                // Step 4: Point C
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['Next Step'],
                    title: 'Squaring Guide: Step 4',
                    message: '1. Jog back to X0 Y0.\n2. Jog ONLY the Y axis to exactly Y400 (or Y40 if using inches).\n3. Lower the Z-axis to make a third mark (Point C).'
                });

                // Step 5: Verification and Adjustment
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    buttons: ['Finish'],
                    title: 'Squaring Guide: Verify and Adjust',
                    message: 'Calculation Phase:\n\nMeasure the diagonal distance directly between Point B and Point C on your wasteboard.\n\nIf your axes are perfectly 90-degrees square, the distance should be EXACTLY 500mm (or 50 inches).\n\nIf the distance is longer or shorter, your frame is out of square. Loosen your gantry or base mounting bolts, physical bump the frame to compensate, re-tighten, and repeat this test until the diagonal is perfect!'
                });
            }
        }
    }
};
