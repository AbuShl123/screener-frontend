import './Menu.css'
import useCacheContext from '../context/Context.js';
import { FUT_SIGN } from '../../utils/Utils.js';
import useApiContext from '../context/ApiContext.js';
import { useCallback, useEffect, useState } from 'react';

const TickersMenu = ({ onTickerSettings }) => {
    const { getSettings, setSettings } = useCacheContext();
    const [currentTickers, setCurrentTickers] = useState(new Map());
    const { orderBookEvent } = useApiContext();

    useEffect(() => {
        if (!orderBookEvent) return;
        setCurrentTickers(prevTickers => {
            const updated = new Map();
            for (const event of orderBookEvent) {
                let symbol = event.s.replace(FUT_SIGN, "");
                let id = symbol === event.s ? 1 : 2;
                let val = updated.has(symbol) ? updated.get(symbol) : 0;
                updated.set(symbol, val + id);
            }
            return updated;
        });
    }, [orderBookEvent]);

    const toggleAudio = (symbol) => {
        const settings = getSettings(symbol);
        const settingsFut = getSettings(symbol + FUT_SIGN);

        let newAudio = !settings.audio;

        const newSettings = { ...settings, audio: newAudio };
        const newSettingsFut = { ...settingsFut, audio: newAudio };

        setSettings(symbol, newSettings);
        setSettings(symbol + FUT_SIGN, newSettingsFut);
    }

    const getMarketDots = useCallback((number) => {
        const spotStyle = number === 1 || number === 3 ? 'spot-selected' : '';
        const futStyle = number === 2 || number === 3 ? 'futures-selected' : '';
        return (
            <>
                <div className={'market-checkbox ' + spotStyle}> </div>
                <div className={'market-checkbox ' + futStyle}> </div>
            </>
        )
    }, []);

    
    const getAudioIcon = useCallback((settings) => {
        return (
            <>
                {settings.audio ? (
                    <span className="material-symbols-outlined volume audio-on">
                        volume_up
                    </span>
                ) : (
                    <span className="material-symbols-outlined volume audio-off">
                        volume_off
                    </span>
                )}
            </>
        )
    }, []);

    return (
        <>
            <div className='menu-container'>
                <div className='menu-title'>
                    Нынешние тикеры
                </div>
                <div className='connected-tickers-list menu-scroller'>
                    {[...currentTickers].map(([symbol, number]) => (
                        <div key={symbol} className='connected-ticker-container'>

                            <div className='ticker-action-buttons ticker-name-audio' onClick={() => toggleAudio(symbol)}>
                                {getAudioIcon(getSettings(symbol))}
                                <p className='ticker-name'> {symbol.toUpperCase().replace("USDT", "") + "/USDT"} </p>
                            </div>

                            <div className='ticker-action-buttons'>
                                {getMarketDots(number)}
                                <span className="material-symbols-outlined ticker-settings settings-icon" onClick={() => onTickerSettings(symbol)}>
                                    Settings
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default TickersMenu;