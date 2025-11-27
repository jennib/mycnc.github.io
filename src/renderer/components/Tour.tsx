import React from 'react';
import Joyride, { Step } from 'react-joyride';

export const Tour: React.FC<{ run: boolean; callback: (data: any) => void }> = ({ run, callback }) => {
    const steps: Step[] = [
        {
            target: '.serial-connector',
            content: 'First, connect to your machine using the WebSerial API or the simulator.',
            title: 'Connect to Your Machine',
            placement: 'bottom',
        },
        {
            target: '.gcode-panel',
            content: 'Load your G-code file here. You can also edit it directly.',
            title: 'Load G-Code',
            placement: 'top',
        },
        {
            target: '.jog-panel',
            content: 'Use these controls to manually move your machine.',
            title: 'Jog Controls',
            placement: 'bottom',
        },
        {
            target: '.job-controls',
            content: 'Once you are ready, you can start, pause, and stop your job from here.',
            title: 'Job Controls',
            placement: 'top',
        },
    ];

    return (
        <Joyride
            steps={steps}
            run={run}
            callback={callback}
            continuous
            showProgress
            showSkipButton
            styles={{
                options: {
                    zIndex: 10000,
                },
            }}
        />
    );
};
