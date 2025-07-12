import { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faWrench } from '@fortawesome/free-solid-svg-icons';
import { FUT_SIGN } from "../../utils/Utils";
import useApiContext from "../context/ApiContext";
import SettingsForm from "./SettingsForm";

// params: 
// symbol, String - symbol name, without fut sign
// onClose, func - action to do when settings closed
// onDelete, func - action to do when settings deleted
const TickerSettings = ({
    symbol,
    onSubmit,
    onReset,
    onClose,
    onDelete
}) => {

    const {settings} = useApiContext();
    const [spotForm, setSpotForm] = useState(undefined);
    const [futForm, setFutForm] = useState(undefined);

    useEffect(() => {
        if (!settings || settings?.size === 0 || !settings.has('all')) {
            console.error('settings are empty.');
            return;
        }

        if (typeof symbol !== 'string' || symbol.trim() === '') return;

        const spotSettings = settings.has(symbol)
            ? settings.get(symbol)
            : Object.assign(structuredClone(settings.get('all')), { msymbol: symbol });

        const futSettings = settings.has(symbol + FUT_SIGN)
            ? settings.get(symbol + FUT_SIGN)
            : Object.assign(structuredClone(settings.get('all')), { msymbol: symbol + FUT_SIGN });

        setSpotForm(spotSettings)
        setFutForm(futSettings)
    }, [settings, symbol]);

    if (typeof symbol === 'string' && symbol.trim() !== '') {
        return (
            <div className="ticker-settings-container">
                <div className="settings-header">
                    <div className="selected-ticker">
                        <div className="pill-container">
                            <div className="delete-icon" onClick={() => onDelete(symbol)}>
                                <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                            <div className="small-vertical-separator" />

                            <span className="selected-ticker-name">
                                {symbol.toUpperCase().replace("USDT", '') + " / USDT"}
                            </span>
                        </div>
                        <div className="close-ticker-settings">
                            <span className="material-symbols-outlined close-icon close-selected-ticker" onClick={onClose}>close</span>
                        </div>
                    </div>
                </div>

                <div className="settings-body">
                    {spotForm != null && symbol && settings ? (
                        <SettingsForm mSymbol={symbol} isSpot={true} settings={spotForm} onSubmit={onSubmit} onReset={onReset} />
                    ) : (<></>)}

                    <div className="vertical-line" />

                    {futForm != null && symbol && settings ? (
                        <SettingsForm mSymbol={symbol + FUT_SIGN} isSpot={false} settings={futForm} onSubmit={onSubmit} onReset={onReset} />
                    ) : (<></>)}
                </div>
            </div>
        )
    }

    return (
        <div className="ticker-settings-container">
            <div className="noTickerSelected-background">
                <div className="noTickerSelected-container">
                    <div className="noTickerSelected-icons">
                        <span className="material-symbols-outlined settings-background">
                            settings
                        </span>
                        <FontAwesomeIcon icon={faWrench} className="wrench-icon" />
                    </div>
                    <div>
                        <p className="noTickerSelected-text">
                            Здесь можно настроить монеты
                        </p>
                        <p className="noTickerSelected-text">
                            Нажмите на нужный символ справа или ищите в поиске
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TickerSettings;