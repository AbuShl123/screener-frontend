import React from 'react'
import { useState, useEffect } from 'react'
import { DEFAULT_SETTINGS } from '../../utils/Utils';
import { useCacheContext } from '../context/Context.js';

const OrderBookSettings = ({ ticker, isSettings, onSubmit }) => {
    const RANGE_PLACEHOLDER = "%";
    const LOW_BOUND_DEFAULT = -10;
    const HIGH_BOUND_DEFAULT = 10;
    const LEVEL_PLACEHOLDER = "auto";
    const LEVEL_DEFAULT = "";

    const {settingsMap, getSettings, setSettings} = useCacheContext();
    const [lowBound, setLowBound] = useState();
    const [highBound, setHighBound] = useState();
    const [level1, setLevel1] = useState();
    const [level2, setLevel2] = useState();
    const [level3, setLevel3] = useState();

    useEffect(() => {
        const settings = getSettings(ticker);
        setLowBound(settings.lowBound);
        setHighBound(settings.highBound)
        setLevel1(settings.level1 < 0 ? '' : settings.level1);
        setLevel2(settings.level2 < 0 ? '' : settings.level2);
        setLevel3(settings.level3 < 0 ? '' : settings.level3);
    }, [settingsMap]);

    const handleReset = () => {
        setLowBound(LOW_BOUND_DEFAULT);
        setHighBound(HIGH_BOUND_DEFAULT);
        setLevel1(LEVEL_DEFAULT);
        setLevel2(LEVEL_DEFAULT);
        setLevel3(LEVEL_DEFAULT);
        let newSettings = {
            lowBound: LOW_BOUND_DEFAULT,
            highBound: HIGH_BOUND_DEFAULT,
            level1: -1,
            level2: -1,
            level3: -1,
            audio: false,
            isDollar: false
        };
        setSettings(ticker, newSettings);
        onSubmit();
    }

    const submitSettings = () => {
        let low = Number(lowBound);
        let high = Number(highBound);

        if (isNaN(lowBound) || isNaN(highBound) || lowBound > highBound) {
            setLowBound(LOW_BOUND_DEFAULT);
            setHighBound(HIGH_BOUND_DEFAULT);
            low = LOW_BOUND_DEFAULT;
            high = HIGH_BOUND_DEFAULT;
        }

        const lev1 = level1 === '' ? -1 : level1;
        const lev2 = level2 === '' ? -1 : level2;
        const lev3 = level3 === '' ? -1 : level3;

        let newSettings = {
            lowBound: low,
            highBound: high,
            level1: lev1,
            level2: lev2,
            level3: lev3,
            audio: false,
            isDollar: true
        };

        setSettings(ticker, newSettings);
        onSubmit();
    }

    const handleRangeChange = (event, isLowBound) => {
        let value = event.target.value.replace(/[^0-9-]/g, '');
        if (isLowBound) {
            setLowBound(value);
        } else {
            setHighBound(value);
        }
    }

    const handleRangeBlur = (isLowBound) => {
        let value = Number(isLowBound ? lowBound : highBound);
        if (isNaN(value)) {
            if (isLowBound) {
                setLowBound(LOW_BOUND_DEFAULT);
            } else {
                setHighBound(HIGH_BOUND_DEFAULT);
            }
            return;
        }

        let anotherValue = isLowBound ? highBound : lowBound;
        if (isLowBound && value > anotherValue) {
            setLowBound(LOW_BOUND_DEFAULT);
            return;
        } 

        if (!isLowBound && value < anotherValue) {
            setHighBound(HIGH_BOUND_DEFAULT);
            return;
        }

        if (isLowBound) {
            setLowBound(value);
        } else {
            setHighBound(value);
        }
    };

    const handleLevelChange = (event, level) => {
        let value = event.target.value;
        value = value.replace(/[^0-9 ]/g, '');
        switch (level) {
            case 1: setLevel1(value); break;
            case 2: setLevel2(value); break;
            case 3: setLevel3(value); break;
        }
    }

    // this function doesn't allow users to enter letters
    const handleLevelBlur = (event, level) => {
        let inputValue = event.target.value.replace(/[^0-9]/g, '');
        let value = Number(inputValue);

        if (isNaN(value) || inputValue === '') {
            value = LEVEL_DEFAULT;
        }

        switch (level) {
            case 1: setLevel1(value); break;
            case 2: setLevel2(value); break;
            case 3: setLevel3(value); break;
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
                                Диапазон
                                <span className='range-constraints'>
                                    (мин: –30
                                </span>
                                <span className='range-constraints'>
                                    макс: 30)
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
                                <span className="form-title">Ур. 1</span>

                                <hr className='settings-line' />

                                <input className='settings-input level-input'
                                    type="text"
                                    value={level1}
                                    placeholder={LEVEL_PLACEHOLDER}
                                    onChange={e => handleLevelChange(e, 1)}
                                    onBlur={(e) => handleLevelBlur(e, 1)}
                                />
                            </div>
                            <div className='level-entry'>
                                <span className="form-title">Ур. 2</span>

                                <hr className='settings-line' />
                                
                                <input className='settings-input level-input'
                                    type="text"
                                    value={level2}
                                    placeholder={LEVEL_PLACEHOLDER}
                                    onChange={e => handleLevelChange(e, 2)}
                                    onBlur={(e) => handleLevelBlur(e, 2)}
                                />
                            </div>
                            <div className='level-entry'>
                                <span className="form-title">Ур. 3</span>

                                <hr className='settings-line' />
                                
                                <input className='settings-input level-input'
                                    type="text"
                                    value={level3}
                                    placeholder={LEVEL_PLACEHOLDER}
                                    onChange={e => handleLevelChange(e, 3)}
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