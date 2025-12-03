import React, { useState } from 'react';
import { GCodeEditorModal, GCodeVisualizer, MachineSettings } from '@mycnc/shared';
import GCodeVisualizerWorker from './renderer/workers/gcodeVisualizerWorker?worker';

// Mock machine settings for now
const defaultMachineSettings: MachineSettings = {
    workArea: { x: 300, y: 300, z: 50 },
    jogFeedRate: 1000,
    controllerType: 'GRBL',
    spindle: { min: 0, max: 10000, warmupDelay: 0 },
    probe: { xOffset: 0, yOffset: 0, zOffset: 0, feedRate: 50, probeTravelDistance: 10 },
    scripts: { startup: '', shutdown: '', toolChange: '', jobPause: '', jobResume: '', jobStop: '' }
};

function App() {
    const [gcode, setGcode] = useState('G0 X0 Y0\nG1 X10 Y10 F1000');
    const [isEditorOpen, setIsEditorOpen] = useState(false);

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h1 className="text-xl font-bold">G-Code Editor</h1>
                <button
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
                    onClick={() => setIsEditorOpen(true)}
                >
                    Open Editor
                </button>
            </div>

            <div className="flex-1 relative">
                <GCodeVisualizer
                    gcodeLines={gcode.split('\n')}
                    machineSettings={defaultMachineSettings}
                    currentLine={0}
                    hoveredLineIndex={null}
                    unit="mm"
                    createWorker={() => new GCodeVisualizerWorker()}
                />
            </div>

            <GCodeEditorModal
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                initialContent={gcode}
                fileName="untitled.gcode"
                onSaveToApp={(content: string) => {
                    setGcode(content);
                    setIsEditorOpen(false);
                }}
                onSaveToDisk={(content: string, filename: string) => {
                    console.log('Save to disk:', filename);
                }}
                machineSettings={defaultMachineSettings}
                unit="mm"
                isLightMode={false}
            />
        </div>
    )
}
export default App;
