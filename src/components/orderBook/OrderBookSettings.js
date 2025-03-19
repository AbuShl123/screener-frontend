import React, { useCallback, useEffect, useState } from 'react'
import useCacheContext from '../context/Context.js';
import { DEFAULT_SETTINGS } from '../../utils/Utils.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCoins } from '@fortawesome/free-solid-svg-icons';

const OrderBookSettings = ({ ticker, onSubmit }) => {
    const {settingsMap, getSettings, setSettings} = useCacheContext();
    const [form, setForm] = useState(DEFAULT_SETTINGS);

    useEffect(() => {
        const settings = getSettings(ticker);
        setForm(settings)
    }, [settingsMap]);

    const handleChange = useCallback((field, value) => {
        setForm((prevForm) => ({
            ...prevForm,
            [field]: value,
        }));
    }, []);

    const handleReset = useCallback(() => {
        setForm(DEFAULT_SETTINGS);
        setSettings(ticker, DEFAULT_SETTINGS);
        onSubmit();
    }, []);

    const submitSettings = () => {
        const lev1 = form.level1 === '' ? -1 : form.level1;
        const lev2 = form.level2 === '' ? -1 : form.level2;
        const lev3 = form.level3 === '' ? -1 : form.level3;

        const isAscending = form.level3 > form.level2 && form.level2 > form.level1;
        const isAllNegatice = lev1 < 0 && lev2 < 0 && lev3 < 0;
        if (!isAscending && !isAllNegatice) {
            let locator = "form[id='settingsPopupForm-" + ticker + "'] .hint-container";
            let warning = document.querySelector(locator);
            warning.classList.add('warning');
            return;
        }

        const settings = getSettings(ticker);
        let newSettings = {
            ...settings,
            level1: lev1,
            level2: lev2,
            level3: lev3,
            isDollar: form.isDollar
        };
        setSettings(ticker, newSettings);
        onSubmit();
    }

    const getCoinOrDollar = useCallback(() => {
        return form.isDollar ? (
            <div onClick={() => handleChange('isDollar', false)} className="dollar-coin-icon">
                <FontAwesomeIcon icon={faDollarSign} />
            </div>
        ) : (
            <div onClick={() => handleChange('isDollar', true)} className="dollar-coin-icon">
                <FontAwesomeIcon icon={faCoins} />
            </div>
        )
    }, [form.isDollar]);

    const handleLevelChange = useCallback((event, level) => {
        let value = event.target.value;
        value = value.replace(/[^0-9 ]/g, '');
        switch (level) {
            case 1: handleChange('level1', value); break;
            case 2: handleChange('level2', value); break;
            case 3: handleChange('level3', value); break;
        }
    }, []);

    const handleLevelBlur = useCallback((event, level) => {
        let inputValue = event.target.value.replace(/[^0-9]/g, '');
        let value = Number(inputValue);
        if (isNaN(value) || inputValue === '') {
            value = -1;
        }
        switch (level) {
            case 1: handleChange('level1', value); break;
            case 2: handleChange('level2', value); break;
            case 3: handleChange('level3', value); break;
        }
    }, []);

    return (
        <>
            <div className='settings-popup'>
                <form className='settings-form' id={'settingsPopupForm-' + ticker}
                    onSubmit={(e) => {
                        e.preventDefault();
                        submitSettings();
                    }}
                >
                    <div className='form-container settings-container-popup'>
                        <div className='level-entry'>
                            <div className='small-circle-container'>
                                <div className="small-circle green-circle" />
                            </div>
                            <input className='settings-input'
                                type="text"
                                value={form.level1 < 0 ? '' : form.level1}
                                placeholder={'Ур.1 - автоматически'}
                                onChange={e => handleLevelChange(e, 1)}
                                onBlur={(e) => handleLevelBlur(e, 1)}
                            />
                            {form.level1 !== '' && form.level1 >= 0 &&
                                <span className="material-symbols-outlined clear-input" onClick={() => handleChange('level1', '')}>
                                    close
                                </span>
                            }
                            {getCoinOrDollar()}
                        </div>

                        <div className='level-entry'>
                            <div className='small-circle-container'>
                                <div className="small-circle yellow-circle" />
                            </div>
                            <input className='settings-input'
                                type="text"
                                value={form.level2 < 0 ? '' : form.level2}
                                placeholder={'Ур.2 - автоматически'}
                                onChange={e => handleLevelChange(e, 2)}
                                onBlur={(e) => handleLevelBlur(e, 2)}
                            />
                            {form.level2 !== '' && form.level2 >= 0 &&
                                <span className="material-symbols-outlined clear-input" onClick={() => handleChange('level2', '')}>
                                    close
                                </span>
                            }
                            {getCoinOrDollar()}
                        </div>

                        <div className='level-entry'>
                            <div className='small-circle-container'>
                                <div className="small-circle red-circle" />
                            </div>
                            <input className='settings-input'
                                type="text"
                                value={form.level3 < 0 ? '' : form.level3}
                                placeholder={'Ур.3 - автоматически'}
                                onChange={e => handleLevelChange(e, 3)}
                                onBlur={(e) => handleLevelBlur(e, 3)}
                            />
                            {form.level3 !== '' && form.level3 >= 0 &&
                                <span className="material-symbols-outlined clear-input" onClick={() => handleChange('level3', '')}>
                                    close
                                </span>
                            }
                            {getCoinOrDollar()}
                        </div>
                    </div>

                    <div className='hint-container'>
                        <span className="material-symbols-outlined small-icon">
                            error
                        </span>
                        <span>
                            Убедитесь, что значения идут в порядке возрастания.
                            Если оставить хоть одно поле пустым, то цвета
                            будут определяться автоматически.
                        </span>
                    </div>

                    <div className='form-container settings-container-popup'>
                        <div className='submit-buttons'>
                            <button type="submit" className='settings-submit-button'>Готово</button>
                            <button className='settings-submit-button' onClick={handleReset}>Сбросить</button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}

export default OrderBookSettings;