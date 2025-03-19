import React from 'react'
import { useState, useEffect } from 'react'
import './Menu.css'
import useCacheContext from '../context/Context.js';
import { FUT_SIGN } from '../../utils/Utils.js';
import { getMarketStyle } from '../../utils/TickerActions.js';

const TickersMenu = ({onTickerSettings}) => {
    const [selectedTickers, setSelectedTickers] = useState([]);
    const {marketTickers, getSettings, setSettings} = useCacheContext();

    useEffect(() => {
        let tickers = marketTickers.map(t => t.replace(FUT_SIGN, ''));
        let set = new Set([...tickers]);
        setSelectedTickers([...set]);
    }, [marketTickers]);

    const toggleAudio = (symbol) => {
        const settings = getSettings(symbol);
        const settingsFut = getSettings(symbol + FUT_SIGN);

        let newAudio = !settings.audio;

        const newSettings = { ...settings, audio: newAudio }; 
        const newSettingsFut = { ...settingsFut, audio: newAudio };

        setSettings(symbol, newSettings);
        setSettings(symbol + FUT_SIGN, newSettingsFut);
    }
 
    return (
        <>
            <div className='menu-container'> 
                <div className='menu-title'>
                    Нынешние тикеры 
                </div>
                <div className='connected-tickers-list menu-scroller'>
                    {selectedTickers.map((ticker) => (       
                        <div key={ticker} className='connected-ticker-container'>

                            <div className='ticker-action-buttons ticker-name-audio' onClick={() => toggleAudio(ticker)}>
                                {getAudioIcon(getSettings(ticker))}
                                <p className='ticker-name'> {ticker.toUpperCase().replace("USDT", "") + "/USDT"} </p>
                            </div>

                            <div className='ticker-action-buttons'>

                                <div className={'market-checkbox ' + getMarketStyle(ticker, marketTickers)}> </div> 

                                <div className={'market-checkbox ' + getMarketStyle(ticker, marketTickers, false)}> </div>

                                <span className="material-symbols-outlined ticker-settings settings-icon" onClick={() => onTickerSettings(ticker)}>
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

function getAudioIcon(settings) {
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
}