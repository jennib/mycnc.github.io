// (imports)
// ...
import { useMachineStore, ActiveJog } from "./stores/machineStore"; // Import ActiveJog type
// ...

const App: React.FC = () => {
    // ... (stores and state)

    // Global Hotkey Handling
    const lastJogStopTimeRef = useRef<number>(0);
    useEffect(() => {
        const jogHotkeys: { [key: string]: { axis: string; direction: number; id: ActiveJog } } = {
            ArrowUp: { axis: "Y", direction: 1, id: "jog-y-plus" },
            ArrowDown: { axis: "Y", direction: -1, id: "jog-y-minus" },
            ArrowLeft: { axis: "X", direction: -1, id: "jog-x-minus" },
            ArrowRight: { axis: "X", direction: 1, id: "jog-x-plus" },
            PageUp: { axis: "Z", direction: 1, id: "jog-z-plus" },
            PageDown: { axis: "Z", direction: -1, id: "jog-z-minus" },
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.repeat ||
                (document.activeElement &&
                    (document.activeElement.tagName === "INPUT" ||
                        document.activeElement.tagName === "TEXTAREA"))
            ) {
                return;
            }

            if (activeJogKeyRef.current) {
                return;
            }

            if (Date.now() - lastJogStopTimeRef.current < 50) {
                return;
            }

            const hotkey = jogHotkeys[event.key];

            if (hotkey) {
                event.preventDefault();
                activeJogKeyRef.current = event.key;

                const { setActiveJog } = useMachineStore.getState().actions;
                setActiveJog(hotkey.id);

                const { jogFeedRate } = machineSettings;
                const distance = hotkey.direction * 99999;
                const command = `$J=G91 ${hotkey.axis}${distance} F${jogFeedRate}`;

                connectionActions.sendLine(command).catch((err) => {
                    console.error("Failed to start jog:", err);
                    activeJogKeyRef.current = null;
                    setActiveJog(null);
                });
            }
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (event.key === activeJogKeyRef.current) {
                event.preventDefault();
                handleJogStop(); // This already sets activeJog to null
                activeJogKeyRef.current = null;
                lastJogStopTimeRef.current = Date.now();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            if (activeJogKeyRef.current) {
                handleJogStop();
            }
        };
    }, [machineSettings, connectionActions, handleJogStop]);

    // ... (rest of the component)
}