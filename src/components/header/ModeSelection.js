import useCacheContext from "../context/Context";
import Mode from "../context/Mode";


const ModeSelection = () => {

    const { mode, setMode } = useCacheContext();

    const toggleMode = () => {
        if (mode === Mode.charts) setMode(Mode.cups);
        else setMode(Mode.charts);
    }

    return (
        <>
            <label className="switch">
                <input type="checkbox" id="mode-toggle" name="mode-toggle" onClick={toggleMode}/>
                <span className="slider">
                    <button className="knob">
                        {mode === Mode.cups ? (
                            <span className="material-symbols-outlined cup-icon">
                                water_full
                            </span>
                        ) : (
                            <span className="material-symbols-outlined chart-icon">
                                area_chart
                            </span>
                        )}
                    </button>
                </span>
            </label>
        </>
    )
}

export default ModeSelection;