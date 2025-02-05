import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faDollarSign, faCoins } from '@fortawesome/free-solid-svg-icons';
import { getMarketStyle } from "../../utils/TickerActions";
import { DEFAULT_SETTINGS, FUT_SIGN, SPOT_SIGN } from "../../utils/Utils";
import { useCacheContext } from "../context/Context";

const TickerSettings = ({
    ticker, 
    onNewSettings,
    onMarketSelection,
    onClose,
    onDelete
}) => {
    const LEVEL_PLACEHOLDER = 'auto';
    const RANGE_PLACEHOLDER = "%";
    const LOW_RANGE_LIMIT = -30;
    const HIGH_RANGE_LIMIT = 30;

    const {tickerProps} = useCacheContext();
    const {marketTickers} = useCacheContext();
    const {settingsMap} = useCacheContext();

    const [settingsSpot, setSettingsSpot] = useState({});
    const [settingsFut, setSettingsFut] = useState({});
    const [currentTicker, setCurrentTicker] = useState('');
    const [isDollar, setIsDollar] = useState(false);

    const [spotLowBound, setSpotLowBound] = useState('');
    const [spotHighBound, setSpotHighBound] = useState('');
    const [futLowBound, setFutLowBound] = useState('');
    const [futHighBound, setFutHighBound] = useState('');

    const [spotLevel1, setSpotLevel1] = useState();
    const [spotLevel2, setSpotLevel2] = useState();
    const [spotLevel3, setSpotLevel3] = useState();

    const [futLevel1, setFutLevel1] = useState();
    const [futLevel2, setFutLevel2] = useState();
    const [futLevel3, setFutLevel3] = useState();
    
    useEffect(() => {
        console.log('ticker settings useEffect called');
        
        const spotSettings = settingsMap.get(ticker + SPOT_SIGN);
        const futSettings = settingsMap.get(ticker + FUT_SIGN);

        setSettingsSpot(spotSettings);
        setSettingsFut(futSettings);
        setCurrentTicker(ticker);

        setSpotLowBound(spotSettings?.lowBound !== undefined ? spotSettings.lowBound + '%' : '');
        setSpotHighBound(spotSettings?.highBound !== undefined ? spotSettings.highBound + '%' : '');
        
        setFutLowBound(futSettings?.lowBound !== undefined ? futSettings.lowBound + '%' : '');
        setFutHighBound(futSettings?.highBound !== undefined ? futSettings.highBound + '%' : '');

        const getLevel = (settings, level) => {
            if (!settings) return '';

            let val = -1;

            if (level === 1) {
                val = settings.level1;
            } else if (level === 2) {
                val = settings.level2;
            } else if (level === 3) {
                val = settings.level3;
            }

            if (val < 0) {
                return '';
            }

            return val;
        }

        setSpotLevel1(getLevel(spotSettings, 1));
        setSpotLevel2(getLevel(spotSettings, 2));
        setSpotLevel3(getLevel(spotSettings, 3));

        setFutLevel1(getLevel(futSettings, 1));
        setFutLevel2(getLevel(futSettings, 2));
        setFutLevel3(getLevel(futSettings, 3));
        
        setIsDollar(spotSettings.isDollar || true);
    }, [ticker]);

    const setSettingsProperty = (property, value, isSpot) => {
        let newSpotSettings = {...settingsSpot};
        let newFutSettings = {...settingsFut};

        const setSpot = () => {
            if (!tickerProps.get(currentTicker).hasSpot) return;
            setSettingsSpot(newSpotSettings);
            onNewSettings(newSpotSettings, currentTicker, true);
        }
        const setFut = () => {
            if (!tickerProps.get(currentTicker).hasFut) return;
            setSettingsFut(newFutSettings);
            onNewSettings(newFutSettings, currentTicker, false);
        }

        switch( property ) {
            case 'audio': {
                newSpotSettings.audio = value;
                newFutSettings.audio = value;
                setSpot();
                setFut();
                break;
            }

            case 'isDollar': {
                newSpotSettings.isDollar = value;
                newFutSettings.isDollar = value;
                setSpot();
                setFut();
                break;
            }

            case 'level1': {
                if (isSpot) {
                    newSpotSettings.level1 = value < 0 ? -1 : value;
                    setSpot();
                } else {
                    newFutSettings.level1 = value < 0 ? -1 : value;
                    setFut();
                }
                break;
            }

            case 'level2': {
                if (isSpot) {
                    newSpotSettings.level2 = value < 0 ? -1 : value;
                    setSpot();
                } else {
                    newFutSettings.level2 = value < 0 ? -1 : value;
                    setFut();
                }
                break;
            }

            case 'level3': {
                if (isSpot) {
                    newSpotSettings.level3 = value;
                    setSpot();
                } else {
                    newFutSettings.level3 = value;
                    setFut();
                }
                break;
            }

            case 'lowBound': {
                if (isSpot) {
                    newSpotSettings.lowBound = value;
                    setSpot();
                } else {
                    newFutSettings.lowBound = value;
                    setFut();
                }
                break;
            }

            case 'highBound': {
                if (isSpot) {
                    newSpotSettings.highBound = value;
                    setSpot();
                } else {
                    newFutSettings.highBound = value;
                    setFut();
                }
                break;
            }

            default: console.warn('invalid property value passed: ', property);
        }
    }

    const handleVoiceToggle = () => {
        setSettingsProperty('audio', !settingsSpot.audio, true);
    }

    const switchDollar = () => {
        let newValue = !isDollar;
        setIsDollar(newValue);
        setSettingsProperty('isDollar', newValue, true);
    }

    const getCoinOrDollar = () => {
        return isDollar ? (
            <div onClick={() => switchDollar()} className="modal-dollar-coin-icon">
                <FontAwesomeIcon icon={faDollarSign}/>
            </div>
        ) : (
            <div onClick={() => switchDollar()} className="modal-dollar-coin-icon">
                <FontAwesomeIcon icon={faCoins}/>
            </div>
        )
    }

    const resetRangeValue = (isSpot, isLowBound) => {
        let settings = isSpot ? settingsSpot : settingsFut;
        if (!settings) return '';

        let bound = isLowBound ? settings?.lowBound : settings?.highBound;
        if (bound === undefined) return '';

        updateRangeStates(bound + '%', isSpot, isLowBound);
    }

    const handleRangeFocus = (event) => {
        event.target.value = event.target.value.replace('%', '');
    }

    const handleRangeBlur = (event, isSpot, isLowBound) => {
        let val = Number(event.target.value);

        if (isNaN(val)) {
            resetRangeValue(isSpot, isLowBound);
            return;
        }
        
        if (val < LOW_RANGE_LIMIT || val > HIGH_RANGE_LIMIT) {
            resetRangeValue(isSpot, isLowBound);
            return;
        }

        let settings = isSpot ? settingsSpot : settingsFut;
        let anotherBound = isLowBound ? settings.highBound : settings.lowBound;
        if ((isLowBound && val > anotherBound) || (!isLowBound && val < anotherBound)) {
            resetRangeValue(isSpot, isLowBound);
            return;
        }

        updateRangeStates(val + '%', isSpot, isLowBound);

        if (isLowBound) {
            setSettingsProperty('lowBound', val, isSpot);
        } else {
            setSettingsProperty('highBound', val, isSpot);
        }
    }

    const handleRangeChange = (event, isSpot, isLowBound) => {
        let inputValue = event.target.value;
        inputValue = inputValue.replace(/[^0-9-]/g, '');
        updateRangeStates(inputValue, isSpot, isLowBound);
    }

    const updateRangeStates = (value, isSpot, isLowBound) => {
        if (isSpot) {
            if (isLowBound) setSpotLowBound(value);
            else setSpotHighBound(value);
        } else {
            if (isLowBound) setFutLowBound(value);
            else setFutHighBound(value);
        }
    }

    const handleLevelChange = (event, isSpot, level) => {
        let inputValue = event.target.value;
        inputValue = inputValue.replace(/[^0-9 ]/g, '');
        switch(level) {
            case 1: isSpot ? setSpotLevel1(inputValue) : setFutLevel1(inputValue); break;
            case 2: isSpot ? setSpotLevel2(inputValue) : setFutLevel2(inputValue); break;
            case 3: isSpot ? setSpotLevel3(inputValue) : setFutLevel3(inputValue); break;
        }
    }

    const handleLevelBlur = (e, isSpot, level) => {
        let rawValue = e.target.value.replace(/[^0-9]/g, '');
        const value = Number(rawValue === '' ? -1 : rawValue);
        switch (level) {
            case 1:
                setSettingsProperty('level1', value, isSpot);
                isSpot ? setSpotLevel1(rawValue) : setFutLevel1(rawValue);
                break;
            case 2:
                setSettingsProperty('level2', value, isSpot);
                isSpot ? setSpotLevel2(rawValue) : setFutLevel2(rawValue);
                break;
            case 3: 
                setSettingsProperty('level3', value, isSpot); 
                isSpot ? setSpotLevel3(rawValue) : setFutLevel3(rawValue);
                break;
        }
    }

    const handleReset = (isSpot) => {
        if (isSpot) {
            setSettingsSpot(DEFAULT_SETTINGS);
            setSpotHighBound(DEFAULT_SETTINGS.highBound + '%');
            setSpotLowBound(DEFAULT_SETTINGS.lowBound + '%');
            setSpotLevel1('');
            setSpotLevel2('');
            setSpotLevel3('');
            onNewSettings(DEFAULT_SETTINGS, currentTicker, true)
        } else {
            setSettingsFut(DEFAULT_SETTINGS);
            setFutHighBound(DEFAULT_SETTINGS.highBound + '%');
            setFutLowBound(DEFAULT_SETTINGS.lowBound + '%');
            setFutLevel1('');
            setFutLevel2('');
            setFutLevel3('');
            onNewSettings(DEFAULT_SETTINGS, currentTicker, false)
        }
    }

    return (
        <>
            <div className="settings-header">
                <div className="selected-ticker">
                    <div className="pill-container">
                        <span className="selected-ticker-name">
                            {currentTicker.toUpperCase().replace("USDT", '') + " / USDT"}
                        </span>

                        <div className="small-vertical-separator" />

                        <div className="selected-ticker-right-elements">
                            <div className="swtich-elements">
                                <div className='audio-toggle' onClick={handleVoiceToggle}>
                                    {settingsSpot?.audio ? (
                                        <span className="material-symbols-outlined volume-icon audio-setting">
                                            volume_up
                                        </span>
                                    ) : (
                                        <span className="material-symbols-outlined volume-icon audio-setting">
                                            volume_off
                                        </span>
                                    )}
                                </div>

                                <div className={'market-checkbox spot-checkbox ' + getMarketStyle(currentTicker, tickerProps, marketTickers, true)}
                                    onClick={(e) => onMarketSelection(currentTicker, e.currentTarget, true)}
                                >
                                    <p>spot</p>
                                </div>
                                <div className={'market-checkbox futures-checkbox ' + getMarketStyle(currentTicker, tickerProps, marketTickers, false)}
                                    onClick={(e) => onMarketSelection(currentTicker, e.currentTarget, false)}
                                >
                                    <p>futures</p>
                                </div>
                            </div>

                            <div className="small-vertical-separator" />
                            <div className="delete-icon" onClick={() => onDelete(currentTicker)}>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </div>
                    </div>
                    <div className="close-ticker-settings">
                        <span className="material-symbols-outlined close-icon close-selected-ticker" onClick={onClose}>close</span>
                    </div>
                </div>
            </div>

            <div className="settings-body">
                <div className="settings-container">
                    <div className="settings-market-type">
                        spot
                        <div className="reset-icon-layer">
                            <div className="reset-icon-container tooltip-container" onClick={() => handleReset(true)}>
                                <span className="material-symbols-outlined">
                                    undo
                                </span>
                                <span className="tooltip reset-settings-tooltip">
                                    Сбросить настройки
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="settings-section form-container-2">
                        <div className="setting-mini-title">
                            Диапазон
                            <span className="range-constraints">
                                (мин: {LOW_RANGE_LIMIT}%
                            </span>
                            <span className="range-constraints">
                                макс: {HIGH_RANGE_LIMIT}%)
                            </span>
                        </div>

                        <div className='modal-range-inputs settings-element'>
                            <input className='modal-input range-input'
                                type="text"
                                value={spotLowBound}
                                placeholder={RANGE_PLACEHOLDER}
                                onFocus={handleRangeFocus}
                                onChange={(e) => handleRangeChange(e, true, true)}
                                onBlur={(e) => handleRangeBlur(e, true, true)}
                            />

                            <hr className='settings-line' />

                            <input className='modal-input range-input'
                                type="text"
                                value={spotHighBound}
                                placeholder={RANGE_PLACEHOLDER}
                                onFocus={handleRangeFocus}
                                onChange={(e) => handleRangeChange(e, true, false)}
                                onBlur={(e) => handleRangeBlur(e, true, false)}
                            />
                        </div>
                    </div>
                    <div className="settings-section section-after form-container-2">
                        <div className="setting-mini-title">
                            Отоброжение плотностей
                        </div>
                        <div className="level-entry">
                            <div className="small-circle" style={{ backgroundColor: 'green' }} />
                            <span className="form-title">Ур. 1</span>
                            <input className="modal-input level-input"
                                value={spotLevel1}
                                placeholder={LEVEL_PLACEHOLDER}
                                onChange={(e) => handleLevelChange(e, true, 1)}
                                onBlur={(e) => handleLevelBlur(e, true, 1)}
                            />
                            {getCoinOrDollar()}
                        </div>
                        <div className="level-entry">
                            <div className="small-circle" style={{ backgroundColor: '#bdbd07' }} />
                            <span className="form-title">Ур. 2</span>
                            <input className="modal-input level-input"
                                value={spotLevel2}
                                placeholder={LEVEL_PLACEHOLDER}
                                onChange={(e) => handleLevelChange(e, true, 2)}
                                onBlur={(e) => handleLevelBlur(e, true, 2)}
                            />
                            {getCoinOrDollar()}
                        </div>
                        <div className="level-entry">
                            <div className="small-circle" style={{ backgroundColor: '#df3838' }} />
                            <span className="form-title">Ур. 3</span>
                            <input className="modal-input level-input"
                                value={spotLevel3}
                                placeholder={LEVEL_PLACEHOLDER}
                                onChange={(e) => handleLevelChange(e, true, 3)}
                                onBlur={(e) => handleLevelBlur(e, true, 3)}
                            />
                            {getCoinOrDollar()}
                        </div>
                    </div>
                    {!tickerProps.get(currentTicker)?.hasSpot && <div className="disable-cover" />}
                </div>

                <div className="vertical-line" />

                <div className="settings-container">
                    <div className="settings-market-type">
                        futures
                        <div className="reset-icon-layer">
                            <div className="reset-icon-container tooltip-container" onClick={() => handleReset(false)}>
                                <span className="material-symbols-outlined">
                                    undo
                                </span>
                                <span className="tooltip reset-settings-tooltip">
                                    Сбросить настройки
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="settings-section form-container-2">
                        <div className="setting-mini-title">
                            Диапазон
                            <span className="range-constraints">
                                (мин: {LOW_RANGE_LIMIT}%
                            </span>
                            <span className="range-constraints">
                                макс: {HIGH_RANGE_LIMIT}%)
                            </span>
                        </div>

                        <div className='modal-range-inputs settings-element'>
                            <input className='modal-input range-input'
                                type="text"
                                value={futLowBound}
                                placeholder={RANGE_PLACEHOLDER}
                                onFocus={handleRangeFocus}
                                onChange={(e) => handleRangeChange(e, false, true)}
                                onBlur={(e) => handleRangeBlur(e, false, true)}
                            />

                            <hr className='settings-line' />

                            <input className='modal-input range-input'
                                type="text"
                                value={futHighBound}
                                placeholder={RANGE_PLACEHOLDER}
                                onFocus={handleRangeFocus}
                                onChange={(e) => handleRangeChange(e, false, false)}
                                onBlur={(e) => handleRangeBlur(e, false, false)}
                            />
                        </div>
                    </div>
                    <div className="settings-section section-after form-container-2">
                        <div className="setting-mini-title">
                            Отоброжение плотностей
                        </div>
                        <div className="level-entry">
                            <div className="small-circle" style={{ backgroundColor: 'green' }} />
                            <span className="form-title">Ур. 1</span>
                            <input className="modal-input level-input"
                                value={futLevel1}
                                placeholder={LEVEL_PLACEHOLDER}
                                onChange={(e) => handleLevelChange(e, false, 1)}
                                onBlur={(e) => handleLevelBlur(e, false, 1)}
                            />
                            {getCoinOrDollar()}
                        </div>
                        <div className="level-entry">
                            <div className="small-circle" style={{ backgroundColor: '#bdbd07' }} />
                            <span className="form-title">Ур. 2</span>
                            <input className="modal-input level-input"
                                value={futLevel2}
                                placeholder={LEVEL_PLACEHOLDER}
                                onChange={(e) => handleLevelChange(e, false, 2)}
                                onBlur={(e) => handleLevelBlur(e, false, 2)}
                            />
                            {getCoinOrDollar()}
                        </div>
                        <div className="level-entry">
                            <div className="small-circle" style={{ backgroundColor: '#df3838' }} />
                            <span className="form-title">Ур. 3</span>
                            <input className="modal-input level-input"
                                value={futLevel3}
                                placeholder={LEVEL_PLACEHOLDER}
                                onChange={(e) => handleLevelChange(e, false, 3)}
                                onBlur={(e) => handleLevelBlur(e, false, 3)}
                            />
                            {getCoinOrDollar()}
                        </div>
                    </div>
                    {!tickerProps.get(currentTicker)?.hasFut && <div className="disable-cover" />}
                </div>
            </div>
        </>
    )
}

export default TickerSettings;