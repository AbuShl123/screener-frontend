import React from 'react'
import { useState, useEffect } from 'react'
import { SPOT_SIGN, FUT_SIGN, roundNumber, getShortFormNumber } from '../../utils/Utils'
import OrderBookSettings from './OrderBookSettings'
import { TailSpin } from 'react-loader-spinner'
import axios from '../../api/AxiosConfig.js'
import { useCacheContext } from '../context/Context.js'
import { websocket } from '../../api/WebSocketManager.js'

const OrderBookBox = ({ ticker, isDollar, onNotification, onClose }) => {
    const isSpot = ticker.endsWith(SPOT_SIGN);
    const symbolText = ticker.replace(SPOT_SIGN, "").replace(FUT_SIGN, "");

    const [pastOrderBook, setPastOrderBook] = useState(new Map());
    const [tickerPrice, setTickerPrice] = useState(0);
    const [volumePer5M, setVolumePer5M] = useState(0);
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [isSettings, setIsSettings] = useState(false);
    const {getSettings} = useCacheContext();
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                let baseUrl = 'https://api.binance.com/api/v3';
                const response = await axios.get(`${baseUrl}/klines?symbol=${symbolText.toUpperCase()}&interval=5m&limit=1`)
                let price = response.data[0][4];
                let volume = response.data[0][5];
                setTickerPrice(price);
                setVolumePer5M(volume);
            } catch (error) {
                console.log("there is error ", error);
            }
        }

        fetchData();
        const intervalId = setInterval(fetchData, 300000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        websocket.subscribe([ticker], handleData);
    }, [ticker]);

     useEffect(() => {
        let dataContainer = document.querySelector(`div[id='data_container_${ticker}']`);
        if (isSettings) {
            dataContainer.style = 'filter: blur(3px)';
        } else {
            dataContainer.style = 'filter: blur(0)';
        }
    }, [isSettings])
    
    const handleData = (lastJsonMessage) => {
        if (lastJsonMessage === undefined) return;

        const { symbol: symbol, b: bidsData, a: asksData } = lastJsonMessage;

        if (symbol !== ticker.replace(SPOT_SIGN, "")) return;
        if (!bidsData || !asksData || bidsData.length == 0 || asksData.length == 0) return;

        try {
            const settings = getSettings(ticker);
            let lowBound = settings.lowBound;
            let highBound = settings.highBound;
            let bids = bidsData.filter(trade => parseFloat(trade[2]) >= lowBound && parseFloat(trade[2]) <= highBound);
            let asks = asksData.filter(trade => parseFloat(trade[2]) >= lowBound && parseFloat(trade[2]) <= highBound);
            const sortedBids = bids.sort((a, b) => b[1] - a[1]).slice(0, 5).sort((a, b) => a[2] - b[2]);
            const sortedAsks = asks.sort((a, b) => b[1] - a[1]).slice(0, 5).sort((a, b) => b[2] - a[2]);
            checkNotifications(sortedAsks, sortedBids);
            setBids(sortedBids || []);
            setAsks(sortedAsks || []);
        } catch (error) {
            console.warn("Failed to read bids and/or ask data, ", error);
        }
    }

    const checkNotifications = (asks, bids) => {
        const currentOrderBook = new Map(pastOrderBook);
        findNewSignificantLevels(asks, currentOrderBook);
        findNewSignificantLevels(bids, currentOrderBook, false);
        saveNewTrades([...bids, ...asks]);
    }

    const findNewSignificantLevels = (trades, pastOrderBookState, isAsk=true) => {
        for (const trade of trades) {
            let price = trade[0];
            let oldLevel = pastOrderBookState.get(price);
            let level = getDensity(trade);
            if (oldLevel !== level && level === 3) {
                onNotification([ticker, isAsk, ...trade]);
            }
        }
    }

    const saveNewTrades = (trades) => {
        let currentOrderBook = new Map();
        for (const trade of trades) {
            let price = trade[0];
            currentOrderBook.set(price, getDensity(trade));
        }
        setPastOrderBook(currentOrderBook);
    }

    const getPrices = (arr) => {
        if (!arr) return [];
        let prices = arr.map(data => roundNumber(data[0]));
        let maxDigits = getMaxDigits(prices);
        let balancedPrices = prices.map(p => roundToDigits(p, maxDigits));
        return balancedPrices;
    }

    const getInclinces = (arr) => {
        if (arr == [] || arr.length == 0) return [];
        let inclines = arr.map(data => Math.abs(parseFloat(data[2])));
        let maxDigits = getMaxDigits(inclines);
        return inclines.map(i => roundToDigits(i, maxDigits));
    }

    const getVolume = () => {
        let volume = isDollar ? volumePer5M * tickerPrice : volumePer5M;
        return (isDollar ? '$' : '') + getShortFormNumber(volume);
    }

    const getQuantity = (data) => {
        let qty = isDollar ? data[0] * data[1] : data[1];
        let formattedQty = getShortFormNumber(qty);
        return <span> {formattedQty} </span>
    }

    const getDensityStyle = (data) => {
        const styleLevel0 = 'quantity-level-0';
        const styleLevel1 = 'quantity-level-1';
        const styleLevel2 = 'quantity-level-2';
        const styleLevel3 = 'quantity-level-3';
        let density = getDensity(data);

        if (density == 0) {
            return styleLevel0;
        }
        if (density == 1) {
            return styleLevel1;
        }
        if (density == 2) {
            return styleLevel2;
        }

        return styleLevel3;
    }

    const getDensity = (data) => {
        const settings = getSettings(ticker);
        let lev1 = settings.level1;
        let lev2 = settings.level2;
        let lev3 = settings.level3;

        if (lev1 < 0 || lev2 < 0 || lev3 < 0 || lev1 === '' || lev2 === '' || lev3 == '') {
            return data[3];
        }

        let qty = parseFloat(data[1]);
        if (qty < lev1) {
            return 0;
        }
        if (qty < lev2) {
            return 1;
        }
        if (qty < lev3) {
            return 2;
        }
        return 3;
    }

    const getMaxDigits = (nums) => {
        return Math.max(...nums.map( num => num.toString().replace('.', '').length ));
    };

    const roundToDigits = (num, digits) => {
        let numStr = num.toString();
        let dotIndex = numStr.indexOf('.');
        let numLength = numStr.replace('.', '').length;
        let decimalLength = numStr.substring(dotIndex+1).length;

        let digitsToFix = 0;
        if (dotIndex == -1) {
            digitsToFix = Math.abs(numLength - digits);
        } else {
            digitsToFix = Math.abs(numLength - digits) + decimalLength;
        }

        if (digitsToFix <= 0) return num;
        return num.toFixed(digitsToFix);
    }

    const getTickerLife = (data) => {
        let life = data[4];
        let currentTime = Date.now();
        let duration = (currentTime - life) / 1000;
        if (duration > 3600) {
            return roundNumber((duration / 3600), 0) + 'ч';
        }
        else if (duration > 60) {
            return roundNumber((duration / 60), 0) + 'мин';
        }
        else {
            return roundNumber(duration, 0) + 'сек';
        }
    }

    const onSettingsSubmit = () => {
        if (isSettings) {
            let settingIcon = document.querySelector(`span[id='setting_icon_${ticker}']`);
            settingIcon.click();
        }
    }

    const askPrices = getPrices(asks);
    const askInclindes = getInclinces(asks);
    const bidPrices = getPrices(bids);
    const bidInclines = getInclinces(bids);

    return (
        <>
            <div className='ob__container'>
                <div className='ob__header'>
                    <div> {isSpot ? "spot" : "perp"} </div>
                    <span className={'ob__symbol-name ' + (isSpot ? 'ob__spot-symbol' : 'ob__perp-symbol')}>
                        <div>{symbolText.toUpperCase()}</div>
                    </span>

                    <div className='ob__icons'>
                        <span className="material-symbols-outlined settings-icon" id={`setting_icon_${ticker}`} onClick={() => setIsSettings(prev => !prev)}>
                            Settings
                        </span>
                        {/* <span className="material-symbols-outlined delete-cup-icon" onClick={() => onClose(ticker)}>close</span> */}
                    </div>
                </div>
                <div className='ob__body'>
                    <OrderBookSettings ticker={ticker} isSettings={isSettings} onSubmit={onSettingsSubmit} />
                    <hr className='ob__line'></hr>
                    <div className='ob__data-container' id={"data_container_" + ticker}>
                        {asks.length <= 0 && (
                            <TailSpin
                                height="100px"
                                width="100%"
                                color="#00BFFF"
                                ariaLabel="loading"
                            />
                        )}

                        {asks.map((data, index) => (
                            <div className="ob__each-data tooltip-container" key={index}>
                                <span className='tooltip'>
                                    Плотность обнаружена: {getTickerLife(data)} назад
                                </span>
                                <div className={getDensityStyle(data)}>
                                    {getQuantity(data)}
                                </div>
                                <div className='ob__price-data-box'>
                                    <div className='ob__price-data' style={{color: 'rgba(200, 70, 70)'}}>
                                        <span> {askPrices[index]} </span>
                                    </div>
                                    <div className='ob__percentage-data'>
                                        <span> {askInclindes[index]}% </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className='ob__separator'><p></p></div>

                        {bids.map((data, index) => (
                            <div className="ob__each-data tooltip-container" key={index}>
                                <span className='tooltip'>
                                    Плотность обнаружена: {getTickerLife(data)} назад
                                </span>
                                <div className={getDensityStyle(data)}>
                                    {getQuantity(data)}
                                </div>
                                <div className='ob__price-data-box'>
                                    <div className='ob__price-data' style={{color: 'rgba(60, 145, 60)'}}>
                                        <span>{bidPrices[index]}</span>
                                    </div>
                                    <div className='ob__percentage-data'>
                                        <span>{bidInclines[index]} %</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <hr className='ob__footer__line'></hr>
                <div className='ob__footer'>
                    Объем за 5 мин: 
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <b>{getVolume()}</b>
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderBookBox;