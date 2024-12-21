import React from 'react'
import { useState, useEffect } from 'react'

const OrderBookSettings = ({ isSettings, onNewSettings, onSubmit }) => {
    const RANGE_PLACEHOLDER = "%";
    const LOW_BOUND_DEFAULT = "-10%";
    const HIGH_BOUND_DEFAULT = "10%";
    const LEVEL_PLACEHOLDER = "auto";
    const LEVEL_DEFAULT = "";
    const DEFAULT_SETTINGS = {
        lowBound: -10,
        highBound: 10,
        level1: -1,
        level2: -1,
        level3: -1
    };

    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [lowBound, setLowBound] = useState(LOW_BOUND_DEFAULT);
    const [highBound, setHighBound] = useState(HIGH_BOUND_DEFAULT);
    const [level1, setLevel1] = useState(LEVEL_DEFAULT);
    const [level2, setLevel2] = useState(LEVEL_DEFAULT);
    const [level3, setLevel3] = useState(LEVEL_DEFAULT);

    useEffect(() => {
        onNewSettings(settings);
    }, [settings]);

    const handleReset = () => {
        setLowBound(LOW_BOUND_DEFAULT);
        setHighBound(HIGH_BOUND_DEFAULT);
        setLevel1(LEVEL_DEFAULT);
        setLevel2(LEVEL_DEFAULT);
        setLevel3(LEVEL_DEFAULT);
        setSettings(DEFAULT_SETTINGS);
        onSubmit();
    }

    const submitSettings = () => {
        if (lowBound > highBound) {
            setLowBound(LOW_BOUND_DEFAULT);
            setHighBound(HIGH_BOUND_DEFAULT);
        } else {
            handleRangeBlur(true);
            handleRangeBlur(false);
        }

        let L = lowBound.replace(/[^0-9-]/g, '');
        let H = highBound.replace(/[^0-9-]/g, '');
        let lev1 = !level1 ? -1 : level1.replace(/[^0-9-]/g, '');
        let lev2 = !level2 ? -1 : level2.replace(/[^0-9-]/g, '');
        let lev3 = !level3 ? -1 : level3.replace(/[^0-9-]/g, '');

        setSettings({
            lowBound: L,
            highBound: H,
            level1: lev1,
            level2: lev2,
            level3: lev3
        });
        onSubmit();
    }

    // this function doesn't allow users to enter letters
    const handleRangeChange = (event, isLowBound) => {
        let inputValue = event.target.value;
        inputValue = inputValue.replace(/[^0-9-% ]/g, '');
        
        if (isLowBound) {
            setLowBound(inputValue);
        } else {
            setHighBound(inputValue);
        }
    }

    // this function checks the constraints of the entered value
    const handleRangeBlur = (isLowBound) => {
        let inputValue = isLowBound ? lowBound : highBound;
        inputValue = inputValue.replace(/[^0-9-]/g, '');
        if (inputValue < -30) inputValue = -30;
        if (inputValue > 30) inputValue = 30;

        if (isLowBound && lowBound) {
            setLowBound(`${inputValue}%`);
        }
        else if (isLowBound && !lowBound) {
            setLowBound(LOW_BOUND_DEFAULT);
        }
        else if (!isLowBound && highBound) {
            setHighBound(`${inputValue}%`);
        }
        else if (!isLowBound && !highBound) {
            setHighBound(HIGH_BOUND_DEFAULT);
        }
    };

    // this function doesn't allow users to enter letters
    const handleLevelBlur = (event, level) => {
        let inputValue = event.target.value;

        inputValue = inputValue.replace(/[^0-9 -]/g, '');
        let value = (!inputValue || inputValue < 0) ? LEVEL_DEFAULT : inputValue;

        switch (level) {
            case 1: 
                setLevel1(value)
                break;
            case 2: 
                setLevel2(value)
                break;
            case 3: 
                setLevel3(value)
                break;
            default:
                console.warn("Invalid level");
       }
    }

    return (
        <>
            {isSettings && (
                <div className='settings-popup'>
                    <form className='settings-form'
                        onSubmit={(e) => {
                            e.preventDefault();
                            submitSettings();
                        }}
                    >

                        <div className='form-container'>
                            <div className='form-title'>
                                Range
                                <span className='range-constraints'>
                                    (min: –30
                                </span>
                                <span className='range-constraints'>
                                    max: 30)
                                </span>
                            </div>

                            <div className='range-inputs'>
                                <input className='settings-input'
                                    type="text"
                                    value={lowBound}
                                    placeholder={RANGE_PLACEHOLDER}
                                    onFocus={() => setLowBound('')}
                                    onChange={(e) => handleRangeChange(e, true)}
                                    onBlur={(e) => handleRangeBlur(true)}
                                />

                                <hr className='settings-line' />

                                <input className='settings-input'
                                    type="text"
                                    value={highBound}
                                    placeholder={RANGE_PLACEHOLDER}
                                    onFocus={() => setHighBound('')}
                                    onChange={(e) => handleRangeChange(e, false)}
                                    onBlur={(e) => handleRangeBlur(false)}
                                />
                            </div>
                        </div>
                        
                        <div className='form-container'>
                            <div className='level-entry'>
                                <span className='form-title'>
                                    Level 1
                                </span>

                                <hr className='settings-line' />

                                <input className='settings-input level-input'
                                    type="text"
                                    value={level1}
                                    placeholder={LEVEL_PLACEHOLDER}
                                    onChange={e => setLevel1(e.target.value)}
                                    onBlur={(e) => handleLevelBlur(e, 1)}
                                />
                            </div>
                            <div className='level-entry'>
                                <span className='form-title'>
                                    Level 2
                                </span>

                                <hr className='settings-line' />
                                
                                <input className='settings-input level-input'
                                    type="text"
                                    value={level2}
                                    placeholder={LEVEL_PLACEHOLDER}
                                    onChange={e => setLevel2(e.target.value)}
                                    onBlur={(e) => handleLevelBlur(e, 2)}
                                />
                            </div>
                            <div className='level-entry'>
                                <span className='form-title'>
                                    Level 3
                                </span>

                                <hr className='settings-line' />
                                
                                <input className='settings-input level-input'
                                    type="text"
                                    value={level3}
                                    placeholder={LEVEL_PLACEHOLDER}
                                    onChange={e => setLevel3(e.target.value)}
                                    onBlur={(e) => handleLevelBlur(e, 3)}
                                />
                            </div>
                        </div>
                        
                        <div className='form-container'> 
                            <div className='submit-buttons'>
                                <button type="submit" className='settings-submit-input'>Submit</button>
                                <button className='settings-submit-input' onClick={handleReset}>Reset</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </>
    )
}

export default OrderBookSettings;