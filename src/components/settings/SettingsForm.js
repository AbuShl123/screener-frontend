import { useState, useEffect, useCallback } from "react";
import LevelEntry from "./LevelEntry";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faCoins } from '@fortawesome/free-solid-svg-icons';
import { getShortFormNumber } from "../../utils/Utils";

const SettingsForm = ({
    mSymbol, 
    isSpot, 
    settings, 
    onSubmit, 
    onReset
}) => {

    const [submitted, setSubmitted] = useState({});
    const [form, setForm] = useState({
        msymbol: '',
        type: '',
        audio: true,
        entries: [{}, {}, {}, {}],
    });

    useEffect(() => {
        if (settings) {
            let formattedEntries = [];
            for (const entry of settings.entries) {
                let d = entry.distance + '';
                let v = getShortFormNumber(entry.value);
                formattedEntries = [...formattedEntries, {distance: d, value: v}]
            }
            setForm({ 
                msymbol: settings.msymbol,
                type: settings.type, 
                audio: settings.audio,
                entries: formattedEntries,
            });
        }
    }, [settings]);

    const switchAudio = useCallback((value) => {
        setForm(prev => ({...prev, audio: value}));
    }, []);
    
    const switchType = useCallback((value) => {
        setForm(prev => ({...prev, type: value}));
    }, []);

    const getAudio = useCallback(() => {
        return form.audio ? (
            <span className="material-symbols-outlined medium-icon" onClick={() => switchAudio(false)}>
                volume_up
            </span>
        ) : (
            <span className="material-symbols-outlined medium-icon" onClick={() => switchAudio(true)}>
                volume_off
            </span>
        )
    }, [form]);
    
    const getType = useCallback(() => {
        return form.type === 'DOLLAR' ? (
            <button type="button" className="s-type-dollar" onClick={() => switchType('COINS')}>
                {"USD "}
                <FontAwesomeIcon icon={faDollarSign}/>
            </button>
        ) : (
            <button type="button" className="s-type-coins" onClick={() => switchType('DOLLAR')}>
                {"монетам "}
                <FontAwesomeIcon icon={faCoins}/>
            </button>
        )
    }, [form]);

    const handleSubmit = () => {
        setSubmitted({});
        let success = true;

        const checkedEntries = [{}, {}, {}, {}];
        for (let i = 0; i < 4; i++) {
            success = success && extractEntryValue(i, checkedEntries) && extractEntryDistance(i, checkedEntries);
        }

        if (!success) return;

        if (typeof form.audio !== 'boolean' || (form.type !== 'COINS' && form.type !== 'DOLLAR')) {
            console.error("Form audio and/or type properties are invalid.", form);
            return;
        }

        const settingsRequest = {
            mSymbol: form.msymbol,
            type: form.type,
            audio: form.audio,
            entries: checkedEntries
        }

        onSubmit(settingsRequest);
    }

    const extractEntryDistance = (i, entries) => {
        const raw = form.entries[i].distance;
        const val = parseFloat(raw);

        if (isNaN(val)) {
            setSubmitted({ warning: true });
            return false;
        }

        entries[i].distance = val;
        return true;
    }

    const extractEntryValue = (i, entries) => {
        const raw = form.entries[i]?.value;
        if (!raw) {
            setSubmitted({ warning: true });
            console.error('entry raw value is empty');
            return false;
        }

        let str = raw.replace(/\s+/g, ""); // remove all whitespace
        if (!str || str === '') {
            setSubmitted({ warning: true });
            console.error('str value is empty');
            return false;
        }
 
        const suffix = str.slice(-1).toUpperCase();
        const suffixes = ['K', 'M', 'B'];

        let hasSuffix = suffixes.includes(suffix);
        let prefix = hasSuffix ? str.slice(0, -1) : str;

        let val = parseFloat(prefix);
        if (hasSuffix && prefix === '') {
            val = 1;
        }

        if (isNaN(val)) {
            setSubmitted({ warning: true });
            console.error('val is NaN');
            return false;
        }
        
        if (hasSuffix) {
            switch (suffix) {
                case 'K': val *= 1_000; break;
                case 'M': val *= 1_000_000; break;
                case 'B': val *= 1_000_000_000; break;
            }
        }

        entries[i].value = val;
        return true;
    }

    const handleValueChange = (event, i) => {
        const raw = event.target.value;
        setForm(prevForm => {
            const entry = prevForm.entries[i];
            if (!entry) return prevForm;

            const newEntries = [...prevForm.entries];
            newEntries[i] = { ...entry, value: raw };

            return {
                ...prevForm,
                entries: newEntries,
            };
        });
    };

    const handleDistanceChange = (event, i) => {
        const raw = event.target.value.trim();
        setForm(prevForm => {
            const entry = prevForm.entries[i];
            if (!entry) return prevForm;

            const newEntries = [...prevForm.entries];
            newEntries[i] = { ...entry, distance: raw };

            return {
                ...prevForm,
                entries: newEntries,
            };
        });
    };

    if (!form || !form.entries || form.entries.length ===  0) {
        return null;
    }

    return (
        <form className="settings-container" id={mSymbol + '_ModalSpotSettings'}
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
            }}
        >
            <div className="settings-market-type">
                <span className="market-name">
                    {isSpot ? 'spot' : 'futures'}
                </span>
                <div className="reset-icon-layer">
                    <button type="button" className="settings-icon-container tooltip-container" onClick={() => onReset(mSymbol)}>
                        <span className="material-symbols-outlined">
                            undo
                        </span>
                        <span className="tooltip reset-settings-tooltip">
                            Сбросить настройки
                        </span>
                    </button>
                </div>
                <div className="audio-icon-layer">
                    <button type="button" className="settings-icon-container tooltip-container">
                        {getAudio()}
                        <span className="tooltip reset-settings-tooltip">
                            озвучка и уведомления монеты: вкл/выкл
                        </span>
                    </button>
                </div>
            </div>

            <div className="header-footer-container" style={{height: '100%'}}>
                <div className="form-container-parent">
                    <div className="settings-section form-container">
                        <p className="caption"> Расчет значимости плотностей: </p>

                        {[0, 1, 2, 3].map(i => (
                            <LevelEntry key={i} entries={form.entries} i={i} isSpot={isSpot} onValueChange={handleValueChange} onDistanceChange={handleDistanceChange}/>
                        ))}
                    </div>

                    <div className="settings-section form-container">
                        <div className="s-type">
                            <p className="caption">Расчитывать по: </p>
                            {getType()}
                        </div>
                    </div>

                    <div className="form-container-parent">
                        <div className="hint-container">
                            <span className="material-symbols-outlined small-icon" style={{color: !submitted.warning ? '' : 'rgb(202, 97, 97)'}}>
                                error
                            </span>
                            <span>
                                <b style={{color: !submitted.warning ? '' : 'rgb(202, 97, 97)'}}> Пожалуйста не оставляйте поля пустыми и вводите только цифровые значения. </b>
                                Можно сокращать числа используя буквы: K (тыс), M (млн), B (млрд).
                            </span>
                        </div>
                    </div> 
                </div>

                <div className="settings-section form-container" style={{marginBottom: '1.3rem'}}>
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
                            type="button"
                            className={'settings-reset-button' + (submitted.spotReset ? ' submitted-successfully' : '')}
                            disabled={submitted.spotReset}
                            onClick={() => onReset(mSymbol)}
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
    )
}

export default SettingsForm;