import { useCallback, useEffect, useState } from 'react';
import './Menu.css'
import useApiContext from '../context/ApiContext.js';
import { FUT_SIGN } from '../../utils/Utils.js';

const TickersMenu = ({ onTickerSettings }) => {
    const [currentSymbols, setCurrentSymbols] = useState(new Map());
    const { orderBookEvent, settings } = useApiContext();

    useEffect(() => {
        if (!orderBookEvent) return;
        setCurrentSymbols(prevTickers => {
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

    
    const getAudioIcon = useCallback((symbol) => {
        const setting = settings.get(symbol) || settings.get('all');
        return (
            <>
                {setting.audio ? (
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
    }, [settings]);

    return (
        <>
            <div className='menu-container'>
                <div className='menu-title'>
                    Нынешние тикеры
                </div>
                <div className='connected-tickers-list menu-scroller'>
                    {[...currentSymbols].map(([symbol, number]) => (
                        <div key={symbol} className='connected-ticker-container'>

                            <div className='ticker-action-buttons ticker-name-audio'>
                                {getAudioIcon(symbol)}
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