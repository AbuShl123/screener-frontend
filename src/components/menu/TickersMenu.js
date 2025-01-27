import React from 'react'
import { useState, useEffect } from 'react'
import './Menu.css'
import { useCacheContext } from '../context/Context.js';
import { SPOT_SIGN, FUT_SIGN } from '../../utils/Utils.js';

const TickersMenu = ({deleteTicker, deleteionCompleted, allTickers, props}) => {
    const tickerProperties = props;
    const tickers = allTickers;
    const [suggestions, setSuggestions] = useState([]);
    const {selectedTickers, setSelectedTickers} = useCacheContext();
    const {marketTickers, setMarketTickers} = useCacheContext();

    useEffect(() => {
        if (deleteTicker) {
            activateMarket(deleteTicker, false, true);
            let newMarketTickers = marketTickers.filter((t) => t !== deleteTicker);
            updateMarketTickers(newMarketTickers);
            deleteionCompleted();
        }
    }, [deleteTicker]);

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
        let ticker = isSpot ? `${symbol}${SPOT_SIGN}` : `${symbol}${FUT_SIGN}`;
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
        let tickerp = symbol + SPOT_SIGN;
        activateMarket(tickerf, false, true);
        activateMarket(tickerp, false, true);
        let newSelectedTickers = selectedTickers.filter((t) => t !== symbol);
        let newMarketTickers = marketTickers.filter((t) => t !== tickerp && t !== tickerf);
        updateSelectedTickers(newSelectedTickers);
        updateMarketTickers(newMarketTickers);
    }

    const handleInputChange = (event) => {
        const query = event.target.value;
        const filteredSuggestions = tickers.filter(ticker =>
            ticker.toLowerCase().includes(query.toLowerCase()) 
            && !selectedTickers.includes(ticker)
        );
        setSuggestions(filteredSuggestions);
    }

    const handleNewSymbol = (symbol) => {
        if (!selectedTickers.includes(symbol)) {
            let newSelectedTickers = [...selectedTickers, symbol];
            updateSelectedTickers(newSelectedTickers);
        }
    }

    const getMarketStyle = (ticker, isSpot=true) => {
        let props = tickerProperties.get(ticker);
        if (props) {
            let marketExists = (props.hasSpot && isSpot) || (props.hasFut && !isSpot);
            if (!marketExists) return 'disabled';
        }

        let marketSymbol = ticker + (isSpot ? SPOT_SIGN : FUT_SIGN);
        if (marketTickers.includes(marketSymbol)) {
            let classValue = (isSpot ? 'spot' : 'futures') + '-selected';
            return classValue;
        }

        return '';
    }
 
    return (
        <>
            <div className='menu-container'>
                <div className='menu-title'>
                    Выбранные тикеры 
                </div>
                <div className='connected-tickers-list menu-scroller'>
                    {selectedTickers.length > 0 && selectedTickers.map((ticker, index) => (       
                        <div key={index} className='connected-ticker-container'>
                            <p> {ticker.toUpperCase()} </p>
                            <div className='ticker-action-buttons'>
                                <div
                                    className={'market-checkbox spot-checkbox ' + getMarketStyle(ticker)}
                                    id={`${ticker}${SPOT_SIGN}`}
                                    onClick={() => handleMarketSelection(ticker, true)}
                                >
                                    <p>spot</p>
                                </div>

                                <div
                                    className={'market-checkbox futures-checkbox ' + getMarketStyle(ticker, false)}
                                    id={`${ticker}${FUT_SIGN}`}
                                    onClick={() => handleMarketSelection(ticker, false)}
                                >
                                    <p>futures</p>
                                </div>

                                <span className="material-symbols-outlined close-icon" onClick={() => handleClose(ticker)}>close</span>
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