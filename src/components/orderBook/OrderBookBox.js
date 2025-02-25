import React from 'react'
import { useState, useEffect } from 'react'
import { SPOT_SIGN, FUT_SIGN, roundNumber, getShortFormNumber } from '../../utils/Utils'
import apiService from '../../api/ApiService.js'
import OrderBookSettings from './OrderBookSettings'
import useCacheContext from '../context/Context.js'
import useApiContext from '../context/ApiContext.js'

function filterTrades(trades, lowBound, highBound) {
    if (!trades || !Array.isArray([...trades]) || trades.length <= 0) return [];
    return trades.filter(trade => parseFloat(trade[2]) >= lowBound && parseFloat(trade[2]) <= highBound);
}

function sortTrades(trades, isAsk=true) {
    if (!trades || !Array.isArray([...trades]) || trades.length <= 0) return [];
    if (isAsk) {
        return trades.sort((a, b) => b[1] - a[1]).slice(0, 5).sort((a, b) => b[2] - a[2]);
    } else {
        return trades.sort((a, b) => b[1] - a[1]).slice(0, 5).sort((a, b) => a[2] - b[2]);
    }
}

const OrderBookBox = ({ ticker, onSeverityChange }) => {

    const isSpot = !ticker.endsWith(FUT_SIGN);
    const [pastOrderBook, setPastOrderBook] = useState(new Map());
    const [severity, setSeverity] = useState(0);
    const [tickerPrice, setTickerPrice] = useState(0);
    const [volumePer5M, setVolumePer5M] = useState(0);
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [isSettings, setIsSettings] = useState(false);

    const {getSettings, isDollar, setNotifications} = useCacheContext();
    const {orderBookEvent} = useApiContext();

    // indexes:             0      1      2        3      4
    // bid/ask data ===== [price, qty,2 incline, density, time]

    useEffect(() => {
        if (!orderBookEvent) return;
        const {symbol, bidsData, asksData} = orderBookEvent;
        if (symbol !== ticker.replace(SPOT_SIGN, "")) return;
        const settings = getSettings(ticker);
        let lowBound = settings.lowBound;
        let highBound = settings.highBound;
        let asks = sortTrades(filterTrades(asksData, lowBound, highBound), true);
        let bids = sortTrades(filterTrades(bidsData, lowBound, highBound), false);
        checkNotifications(asks, bids);
        setAsks(asks);
        setBids(bids);
    }, [orderBookEvent]);

    useEffect(() => {
        const fetchVolumeData = async () => {
            const volumeUpdate = await apiService.fetch5MVolume(ticker.replace(SPOT_SIGN, '').replace(FUT_SIGN, ''))
            if (!volumeUpdate) return;
            let price = volumeUpdate[0][4];
            let volume = volumeUpdate[0][5];
            setTickerPrice(price);
            setVolumePer5M(volume);
        }
        fetchVolumeData();
        const interval = setInterval(fetchVolumeData, 300_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let dataContainer = document.querySelector(`div[id='data_container_${ticker}']`);
        if (isSettings) {
            dataContainer.style = 'filter: blur(3px)';
        } else {
            dataContainer.style = 'filter: blur(0)';
        }
    }, [isSettings])

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
                const newNotification = [ticker, isAsk, ...trade];
                setNotifications(prev => [newNotification, ...prev]);
            }
        }
    }

    const saveNewTrades = (trades) => {
        let sev = 0;
        let currentOrderBook = new Map();
        for (const trade of trades) {
            let price = trade[0];
            let density = getDensity(trade);
            if (density === 3) sev++;
            currentOrderBook.set(price, density);
        }
        setPastOrderBook(currentOrderBook);
        if (sev !== severity) {
            onSeverityChange(ticker, sev);
        }
        setSeverity(sev);
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
        const isDollar = settings.isDollar;

        if (lev1 < 0 || lev2 < 0 || lev3 < 0 || lev1 === '' || lev2 === '' || lev3 == '') {
            return data[3];
        }

        // if is dollar, then value = qty * price, else value = qty;
        let value = isDollar ? parseFloat(data[1]) * parseFloat(data[0]) : parseFloat(data[0]);

        if (value < lev1) {
            return 0;
        }
        if (value < lev2) {
            return 1;
        }
        if (value < lev3) {
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
        let result = num.toFixed(digitsToFix);
        return result;
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

    return (
        <>
            <div className='ob__container' id={`obContainer_${ticker}`}>
                <div className='ob__header'>
                    <div> {isSpot ? "spot" : "perp"} </div>
                    <span className={'ob__symbol-name ' + (isSpot ? 'ob__spot-symbol' : 'ob__perp-symbol')}>
                        <div>{ticker.replace(SPOT_SIGN, "").replace(FUT_SIGN, "").toUpperCase()}</div>
                    </span>

                    <div className='ob__icons'>
                        <span className="material-symbols-outlined settings-icon" id={`setting_icon_${ticker}`} onClick={() => setIsSettings(prev => !prev)}>
                            Settings
                        </span>
                    </div>
                </div>
                <div className='ob__body'>
                    <OrderBookSettings ticker={ticker} isSettings={isSettings} onSubmit={onSettingsSubmit} />
                    <hr className='ob__line'></hr>
                    <div className='ob__data-container' id={"data_container_" + ticker}>

                        <div className='data-section'>
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
                                            <span> {getPrices(asks)[index]} </span>
                                        </div>
                                        <div className='ob__percentage-data'>
                                            <span> {getInclinces(asks)[index]}% </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className='ob__separator'><p></p></div>

                        <div className='data-section'>
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
                                            <span>{getPrices(bids)[index]}</span>
                                        </div>
                                        <div className='ob__percentage-data'>
                                            <span>{getInclinces(bids)[index]} %</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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