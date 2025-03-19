import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faDollarSign, faCoins } from '@fortawesome/free-solid-svg-icons';
import { getMarketStyle } from "../../utils/TickerActions";
import { DEFAULT_SETTINGS, FUT_SIGN } from "../../utils/Utils";
import useCacheContext from "../context/Context";

const LEVEL_PLACEHOLDER = 'auto';

// params: 
// ticker, String - symbol name, without fut sign
// onClose, func - action to do when settings closed
// onDelete, func - action to do when settings deleted
const TickerSettings = ({
    ticker,
    onClose,
    onDelete
}) => {

    const {settingsMap, getSettings, setSettings} = useCacheContext();
    const [spotForm, setSpotForm] = useState(DEFAULT_SETTINGS);
    const [futForm, setFutForm] = useState(DEFAULT_SETTINGS);
    const [submitted, setSubmitted] = useState({});
    
    useEffect(() => {
        let settings = getSettings(ticker);
        setSpotForm(settings)
        settings = getSettings(ticker + FUT_SIGN);
        setFutForm(settings)
    }, [settingsMap, ticker]);

    const submitSettings = (isSpot) => {
        const form = isSpot ? spotForm : futForm;

        const lev1 = form.level1 === '' ? -1 : form.level1;
        const lev2 = form.level2 === '' ? -1 : form.level2;
        const lev3 = form.level3 === '' ? -1 : form.level3;

        const isAscending = form.level3 > form.level2 && form.level2 > form.level1;
        const isAllNegatice = lev1 < 0 && lev2 < 0 && lev3 < 0;
        
        if (!isAscending && !isAllNegatice) {
            if (isSpot) {
                setSubmitted({spotWarning: true});
                setTimeout(() => setSubmitted({spotWarning: false}), 2_000);
            } else {
                setSubmitted({futWarning: true});
                setTimeout(() => setSubmitted({futWarning: false}), 2_000);
            }
            return;
        }

        const marketTicker = ticker + (!isSpot ? FUT_SIGN : '');
        const settings = getSettings(marketTicker);

        if (JSON.stringify(form) === JSON.stringify(settings)) {
            return;
        }

        let newSettings = {
            ...settings,
            level1: lev1,
            level2: lev2,
            level3: lev3,
            isDollar: form.isDollar,
            audio: form.audio,
        };
        setSettings(marketTicker, newSettings);

        if (isSpot) {
            setSubmitted({spot: true});
            setTimeout(() => setSubmitted({spot: false}), 5_000);
        } else {
            setSubmitted({fut: true});
            setTimeout(() => setSubmitted({fut: false}), 5_000);
        }
    }

    const handleReset = useCallback((isSpot) => {
        if (isSpot) {
            setSpotForm(DEFAULT_SETTINGS);
            setSettings(ticker, DEFAULT_SETTINGS);
            setSubmitted({spotReset: true});
            setTimeout(() => setSubmitted({spotReset: false}), 2_000);
        } else {
            setFutForm(DEFAULT_SETTINGS);
            setSettings(ticker + FUT_SIGN, DEFAULT_SETTINGS);
            setSubmitted({futReset: true});
            setTimeout(() => setSubmitted({futReset: false}), 2_000);
        }
    }, [ticker]);

    const handleSpotChange = useCallback((field, value) => {
        setSpotForm((prevForm) => ({
            ...prevForm,
            [field]: value,
        }));
    }, []);

    const handleFutChange = useCallback((field, value) => {
        setFutForm((prevForm) => ({
            ...prevForm,
            [field]: value,
        }));
    }, []);

    const handleChange = useCallback((field, value, isSpot) => {
        if (isSpot) {
            handleSpotChange(field, value);
        } else {
            handleFutChange(field, value);
        }
    }, []);

    const switchDollar = useCallback((newValue) => {
        handleChange('isDollar', newValue, true);
        handleChange('isDollar', newValue, false);
    }, []);

    const switchAudio = useCallback((newValue) => {
        handleChange('audio', newValue, true);
        handleChange('audio', newValue, false);
    }, []);

    const setLevel = useCallback((level, value, isSpot) => {
        switch (level) {
            case 1: handleChange('level1', value, isSpot); break;
            case 2: handleChange('level2', value, isSpot); break;
            case 3: handleChange('level3', value, isSpot); break;
        }
    }, []);

    const getCoinOrDollar = useCallback((form) => {
        return form.isDollar ? (
            <div onClick={() => switchDollar(false)} className="dollar-coin-icon">
                <FontAwesomeIcon icon={faDollarSign}/>
            </div>
        ) : (
            <div onClick={() => switchDollar(true)} className="dollar-coin-icon">
                <FontAwesomeIcon icon={faCoins}/>
            </div>
        )
    }, []);

    const getAudio = useCallback((form) => {
        return form.audio ? (
            <span className="material-symbols-outlined medium-icon" onClick={() => switchAudio(false)}>
                volume_up
            </span>
        ) : (
            <span className="material-symbols-outlined medium-icon" onClick={() => switchAudio(true)}>
                volume_off
            </span>
        )
    }, []);

    const handleLevelChange = useCallback((event, level, isSpot) => {
        let value = event.target.value.replace(/[^0-9 ]/g, '');
        setLevel(level, value, isSpot);
    }, []);

    const handleLevelBlur = useCallback((event, level, isSpot) => {
        let inputValue = event.target.value.replace(/[^0-9]/g, '');
        let value = Number(inputValue);
        if (isNaN(value) || inputValue === '') {
            value = -1;
        }
        setLevel(level, value, isSpot);
    }, []);

    return (
        <>
            <div className="settings-header">
                <div className="selected-ticker">
                    <div className="pill-container">
                        <div className="delete-icon" onClick={() => onDelete(ticker)}>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </div>
                        <div className="small-vertical-separator" />

                        <span className="selected-ticker-name">
                            {ticker.toUpperCase().replace("USDT", '') + " / USDT"}
                        </span>
                    </div>
                    <div className="close-ticker-settings">
                        <span className="material-symbols-outlined close-icon close-selected-ticker" onClick={onClose}>close</span>
                    </div>
                </div>
            </div>

            <div className="settings-body">
                <form className="settings-container" id={ticker + 'ModalSpotSettings'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitSettings(true);
                    }}
                >
                    <div className="settings-market-type">
                        spot
                        <div className="reset-icon-layer">
                            <div className="settings-icon-container tooltip-container" onClick={() => handleReset(true)}>
                                <span className="material-symbols-outlined">
                                    undo
                                </span>
                                <span className="tooltip reset-settings-tooltip">
                                    Сбросить настройки
                                </span>
                            </div>
                        </div>
                        <div className="audio-icon-layer">
                            <div className="settings-icon-container tooltip-container">
                                {getAudio(spotForm)}
                                <span className="tooltip reset-settings-tooltip">
                                    озвучка и уведомления монеты: вкл/выкл
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-container-parent">

                        <div className="settings-section form-container">
                            <div className='level-entry'>
                                <div className='small-circle-container'>
                                    <div className="small-circle green-circle"/>
                                </div>
                                <input className='settings-input'
                                    type="text"
                                    value={spotForm.level1 < 0 ? '' : spotForm.level1}
                                    placeholder={'Ур.1 - автоматически'}
                                    onChange={e => handleLevelChange(e, 1, true)}
                                    onBlur={(e) => handleLevelBlur(e, 1, true)}
                                />
                                {spotForm.level1 !== '' && spotForm.level1 >= 0 &&
                                    <span className="material-symbols-outlined clear-input" onClick={() => handleSpotChange('level1', '')}>
                                        close
                                    </span>
                                }
                                {getCoinOrDollar(spotForm)}
                            </div>
                            <div className='level-entry'>
                            <div className='small-circle-container'>
                                    <div className="small-circle yellow-circle"/>
                                </div>
                                <input className='settings-input'
                                    type="text"
                                    value={spotForm.level2 < 0 ? '' : spotForm.level2}
                                    placeholder={'Ур.2 - автоматически'}
                                    onChange={e => handleLevelChange(e, 2, true)}
                                    onBlur={(e) => handleLevelBlur(e, 2, true)}
                                />
                                {spotForm.level2 !== '' && spotForm.level2 >= 0 &&
                                    <span className="material-symbols-outlined clear-input" onClick={() => handleSpotChange('level2', '')}>
                                        close
                                    </span>
                                }
                                {getCoinOrDollar(spotForm)}
                            </div>
                            <div className='level-entry'>
                            <div className='small-circle-container'>
                                    <div className="small-circle red-circle"/>
                                </div>
                                <input className='settings-input'
                                    type="text"
                                    value={spotForm.level3 < 0 ? '' : spotForm.level3}
                                    placeholder={'Ур.3 - автоматически'}
                                    onChange={e => handleLevelChange(e, 3, true)}
                                    onBlur={(e) => handleLevelBlur(e, 3, true)}
                                />
                                {spotForm.level3 !== '' && spotForm.level3 >= 0 &&
                                    <span className="material-symbols-outlined clear-input" onClick={() => handleSpotChange('level3', '')}>
                                        close
                                    </span>
                                }
                                {getCoinOrDollar(spotForm)}
                            </div>
                        </div>

                        <div className={'hint-container' + (submitted.spotWarning ? ' warning' : '')}>
                            <span className="material-symbols-outlined small-icon">
                                error
                            </span>
                            <span>
                                Убедитесь, что значения идут в порядке возрастания.
                                Если оставить хоть одно поле пустым, то цвета
                                будут определяться автоматически.
                            </span>
                        </div>

                        <div className='settings-section form-container'>
                            <div className='submit-buttons'>
                                <button 
                                    type="submit" 
                                    className={'settings-submit-button' + (submitted.spot ? ' submitted-successfully' : '')}
                                    disabled={submitted.spot}
                                >
                                    Готово
                                    {submitted.spot && 
                                        <span className="material-symbols-outlined small-icon success-icon">
                                            check_circle
                                        </span>
                                    }
                                </button>
                                <button 
                                    className={'settings-submit-button' + (submitted.spotReset ? ' submitted-successfully' : '')}
                                    disabled={submitted.spotReset}
                                    onClick={() => handleReset(true)}
                                >
                                    Сбросить
                                    {submitted.spotReset && 
                                        <span className="material-symbols-outlined small-icon success-icon">
                                            check_circle
                                        </span>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="vertical-line" />

                <form className="settings-container" id={ticker + 'ModalFutSettings'}
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitSettings(false);
                    }}
                >
                    <div className="settings-market-type">
                        futures
                        <div className="reset-icon-layer">
                            <div className="settings-icon-container tooltip-container" onClick={() => handleReset(false)}>
                                <span className="material-symbols-outlined">
                                    undo
                                </span>
                                <span className="tooltip reset-settings-tooltip">
                                    Сбросить настройки
                                </span>
                            </div>
                        </div>
                        <div className="audio-icon-layer">
                            <div className="settings-icon-container tooltip-container">
                                {getAudio(spotForm)}
                                <span className="tooltip reset-settings-tooltip">
                                    озвучка и уведомления монеты: вкл/выкл
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="form-container-parent">
                        <div className="settings-section form-container">
                            <div className='level-entry'>
                                <div className='small-circle-container'>
                                    <div className="small-circle green-circle"/>
                                </div>
                                <input className='settings-input'
                                    type="text"
                                    value={futForm.level1 < 0 ? '' : futForm.level1}
                                    placeholder={'Ур.1 - автоматически'}
                                    onChange={e => handleLevelChange(e, 1, false)}
                                    onBlur={(e) => handleLevelBlur(e, 1, false)}
                                />
                                {futForm.level1 !== '' && futForm.level1 >= 0 &&
                                    <span className="material-symbols-outlined clear-input" onClick={() => handleFutChange('level1', '')}>
                                        close
                                    </span>
                                }
                                {getCoinOrDollar(spotForm)}
                            </div>
                            <div className='level-entry'>
                            <div className='small-circle-container'>
                                    <div className="small-circle yellow-circle"/>
                                </div>
                                <input className='settings-input'
                                    type="text"
                                    value={futForm.level2 < 0 ? '' : futForm.level2}
                                    placeholder={'Ур.2 - автоматически'}
                                    onChange={e => handleLevelChange(e, 2, false)}
                                    onBlur={(e) => handleLevelBlur(e, 2, false)}
                                />
                                {futForm.level2 !== '' && futForm.level2 >= 0 &&
                                    <span className="material-symbols-outlined clear-input" onClick={() => handleFutChange('level2', '')}>
                                        close
                                    </span>
                                }
                                {getCoinOrDollar(spotForm)}
                            </div>
                            <div className='level-entry'>
                            <div className='small-circle-container'>
                                    <div className="small-circle red-circle"/>
                                </div>
                                <input className='settings-input'
                                    type="text"
                                    value={futForm.level3 < 0 ? '' : futForm.level3}
                                    placeholder={'Ур.3 - автоматически'}
                                    onChange={e => handleLevelChange(e, 3, false)}
                                    onBlur={(e) => handleLevelBlur(e, 3, false)}
                                />
                                {futForm.level3 !== '' && futForm.level3 >= 0 &&
                                    <span className="material-symbols-outlined clear-input" onClick={() => handleFutChange('level3', '')}>
                                        close
                                    </span>
                                }
                                {getCoinOrDollar(spotForm)}
                            </div>
                        </div>

                        <div className={'hint-container' + (submitted.futWarning ? ' warning' : '')}>
                            <span className="material-symbols-outlined small-icon">
                                error
                            </span>
                            <span>
                                Убедитесь, что значения идут в порядке возрастания.
                                Если оставить хоть одно поле пустым, то цвета
                                будут определяться автоматически.
                            </span>
                        </div>

                        <div className='settings-section form-container'>
                            <div className='submit-buttons'>
                                <button
                                    type="submit"
                                    className={'settings-submit-button' + (submitted.fut ? ' submitted-successfully' : '')}
                                    disabled={submitted.fut}
                                >
                                    Готово
                                    {submitted.fut &&
                                        <span className="material-symbols-outlined small-icon success-icon">
                                            check_circle
                                        </span>
                                    }
                                </button>
                                <button
                                    className={'settings-submit-button' + (submitted.futReset ? ' submitted-successfully' : '')}
                                    disabled={submitted.futReset}
                                    onClick={() => handleReset(false)}
                                >
                                    Сбросить
                                    {submitted.futReset &&
                                        <span className="material-symbols-outlined small-icon success-icon">
                                            check_circle
                                        </span>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default TickerSettings;