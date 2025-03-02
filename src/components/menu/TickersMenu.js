import React from 'react'
import { useState, useEffect } from 'react'
import './Menu.css'
import useCacheContext from '../context/Context.js';
import { FUT_SIGN } from '../../utils/Utils.js';
import { getMarketStyle } from '../../utils/TickerActions.js';

const TickersMenu = ({deleteTicker, deleteionCompleted}) => {
    const {tickers} = useCacheContext();
    const [suggestions, setSuggestions] = useState(Array.from(tickers.keys()));
    const [selectedTickers, setSelectedTickers] = useState([]);
    const {marketTickers, setMarketTickers, getSettings, setSettings} = useCacheContext();

    useEffect(() => {
        if (deleteTicker) {
            activateMarket(deleteTicker, false, true);
            let newMarketTickers = marketTickers.filter((t) => t !== deleteTicker);
            updateMarketTickers(newMarketTickers);
            deleteionCompleted();
        }
    }, [deleteTicker]);

    useEffect(() => {
        let tickers = marketTickers.map(t => t.replace(FUT_SIGN, ''));
        let set = new Set([...tickers]);
        setSelectedTickers([...set]);
    }, [marketTickers]);

    function updateSelectedTickers(value) {
        setSelectedTickers(value);
    }

    function updateMarketTickers(value) {
        setMarketTickers(value);
    }

    const activateMarket = (ticker, activate=false, deactivate=false) => {
        let locator = `div[id='${ticker}']`;
        let market = ticker.endsWith(FUT_SIGN) ? 'futures' : 'spot';
        let element = document.querySelector(locator);
        let marketSelected = `${market}-selected`;
        let classList = element.classList;   
        if (classList.contains(marketSelected)) {
            if (activate) return true;
            classList.remove(marketSelected);
            return false;
        } else {
            if (deactivate) return false;
            classList.add(marketSelected);
            return true;
        }
    }

    const handleMarketSelection = (symbol, isSpot) => {
        let ticker = isSpot ? symbol : symbol + FUT_SIGN;
        let el = document.querySelector(`div[id='${ticker}']`);
        if (!el || el.classList.contains('disabled')) {
            return;
        }

        let hasActivated = activateMarket(ticker);
        let newMarketTickers;
        if (hasActivated) {
            newMarketTickers = [...marketTickers, ticker];
        } else {
            newMarketTickers = marketTickers.filter((t) => t !== ticker);
        }

        updateMarketTickers(newMarketTickers)
    }

    const handleClose = (symbol) => {
        let tickerf = symbol + FUT_SIGN;
        activateMarket(tickerf, false, true);
        activateMarket(symbol, false, true);
        let newSelectedTickers = selectedTickers.filter((t) => t !== symbol);
        let newMarketTickers = marketTickers.filter((t) => t !== symbol && t !== tickerf);
        updateSelectedTickers(newSelectedTickers);
        updateMarketTickers(newMarketTickers);
    }

    const handleInputChange = (event) => {
        const query = event.target.value;
        let ticker = tickers.keys();
        const filteredSuggestions = ticker.filter(ticker =>
            ticker.toLowerCase().includes(query.toLowerCase()) 
            && !selectedTickers.includes(ticker)
        );
        setSuggestions(Array.from(filteredSuggestions));
    }

    const handleNewSymbol = (symbol) => {
        if (!selectedTickers.includes(symbol)) {
            let newSelectedTickers = [...selectedTickers, symbol];
            updateSelectedTickers(newSelectedTickers);
        }
    }

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
                    Выбранные тикеры 
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

                                <span className="material-symbols-outlined ticker-settings settings-icon">
                                    Settings
                                </span>

                                {/* <span className="material-symbols-outlined close-icon" onClick={() => handleClose(ticker)}>close</span> */}
                            </div>
                        </div>
                    ))}
                </div>
                <input 
                    className='add-ticker-container' 
                    placeholder='+ добавить тикер'
                    onChange={handleInputChange}
                />
                <div className='search-list menu-scroller'>
                    {suggestions.slice(0, 20).map((ticker, index) => (
                        <div key={index} className='search-container' onClick={() => handleNewSymbol(ticker.toLowerCase())}>
                            <p className='search-name'> {ticker.toUpperCase()} </p>
                            <span className="material-symbols-outlined">
                                add
                            </span>
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