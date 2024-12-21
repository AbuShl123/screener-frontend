import React from 'react'
import { useState, useEffect } from 'react'
import api from '../../api/AxiosConfig.js'
import './TickersMenu.css'

const TickersMenu = ( {onTickersUpdate, deleteTicker, deleteionCompleted} ) => {
    const SPOT_SIGN = ".p";
    const FUT_SIGN  = ".f";

    const DEFAULT_TICKERS = ["btcusdt", "xrpusdt", "trxusdt", "ethusdt", "avaxusdt", "bnxusdt"];
    const DEFAULT_MARKET_TICKERS = [`btcusdt${SPOT_SIGN}`, `xrpusdt${SPOT_SIGN}`, `trxusdt${SPOT_SIGN}`, 
                                    `ethusdt${SPOT_SIGN}`, `avaxusdt${SPOT_SIGN}`, `bnxusdt${SPOT_SIGN}`];

    const [tickers, setTickers] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedTickers, setSelectedTickers] = useState(DEFAULT_TICKERS);
    const [marketTickers, setMarketTickers] = useState(DEFAULT_MARKET_TICKERS);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchTickers = async () => {
            try {
                const response = await api.get('/tickers', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const arr = response.data.map(item => item.symbol);
                setTickers(arr);
                setSuggestions(arr);
            } catch (error) {
                console.error('Error fetching tickers:', error);
            }
        };

        fetchTickers();
    }, [token]);

    useEffect(() => {
        console.log(marketTickers);
        marketTickers.forEach((t) => activateMarket(t, true));
        onTickersUpdate(marketTickers);
    }, [marketTickers]);

    useEffect(() => {
        if (deleteTicker) {
            console.log("Deleting cup ", deleteTicker);
            activateMarket(deleteTicker, false, true);
            setMarketTickers( (prevMarketTickers) => prevMarketTickers.filter((t) => t !== deleteTicker));
            deleteionCompleted();
        }
    }, [deleteTicker]);

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
        let hasActivated = activateMarket(ticker);
        if (hasActivated) {
            setMarketTickers( (prevMarketTickers) => [...prevMarketTickers, ticker]);
        } else {
            setMarketTickers( (prevMarketTickers) => prevMarketTickers.filter((t) => t !== ticker));
        }
    }

    const handleClose = (symbol) => {
        let tickerf = symbol + FUT_SIGN;
        let tickerp = symbol + SPOT_SIGN;
        activateMarket(tickerf, false, true);
        activateMarket(tickerp, false, true);
        setMarketTickers( (prevMarketTickers) => prevMarketTickers.filter((t) => t !== tickerp && t !== tickerf));
        setSelectedTickers( (prevSelectedTicker) => prevSelectedTicker.filter((t) => t !== symbol));
    }

    const handleInputChange = (event) => {
        const query = event.target.value;
        const filteredSuggestions = tickers.filter(ticker =>
            ticker.toLowerCase().includes(query.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    }

    const handleNewSymbol = (symbol) => {
        if (!selectedTickers.includes(symbol)) {
            setSelectedTickers( tickers => [...tickers, symbol]);
        }
    }

    return (
        <div className='tickers-menu'>
            <div className='menu-container'>
                <div className='connected-tickers-title'>
                    Connected symbols 
                </div>
                <div className='connected-tickers-list menu-scroller'>
                    {selectedTickers.length > 0 && selectedTickers.map((ticker, index) => (       
                        <div key={index} className='connected-ticker-container'>
                            <p> {ticker.toUpperCase()} </p>
                            <div className='ticker-action-buttons'>
                                <div
                                    className='market-checkbox spot-checkbox'
                                    id={`${ticker}${SPOT_SIGN}`}
                                    onClick={() => handleMarketSelection(ticker, true)}
                                >
                                    <p>spot</p>
                                </div>

                                <div
                                    className='market-checkbox futures-checkbox'
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
                    placeholder='+ add ticker'
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
        </div>
    )
}

export default TickersMenu;