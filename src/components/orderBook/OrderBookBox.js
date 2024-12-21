import React from 'react'
import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import OrderBooKHeader from './OrderBookHeader'
import OrderBookSettings from './OrderBookSettings'
import { TailSpin } from 'react-loader-spinner';

const OrderBookBox = ({ ticker }) => {
    const SPOT_SIGN = '.p';
    const FUT_SIGN = '.f';

    const TOKEN = localStorage.getItem('token');
    const symbol = ticker.replace(SPOT_SIGN, "");

    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [isDollar, setDollar] = useState(false);
    const [isSettings, setIsSettings] = useState(false);

    const [settings, setSettings] = useState({
        lowBound: -10,
        highBound: 10,
        level1: -1,
        level2: -1,
        level3: -1
    });

    const queryParams = new URLSearchParams({
        symbol: symbol,
        token: TOKEN,
        L: settings.lowBound,
        H: settings.highBound
    });

    const wsUrl = `ws://localhost:1105/depth?${queryParams.toString()}`;

    const {lastJsonMessage} = useWebSocket(wsUrl, {
        shouldReconnect: () => true,
        onOpen: () => { console.log(`Websocket connection established for ${symbol} - ${wsUrl}`)},
        onError: (error) => console.error(`WebSocket Error with ${symbol}: `, error),
        onClose: () => console.warn(`WebSocket closed for ${symbol}`)
    });

    useEffect(() => {
        if (lastJsonMessage) {
            const { b: bidsData, a: asksData } = lastJsonMessage;
            setBids(bidsData || []);
            setAsks(asksData || []);
        }
    }, [lastJsonMessage]);

    const formatNumber = (number) => {
        return Math.round(parseFloat(number));
    }

    const roundNumber = (num) => {
        let dec = 5;
        return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    }

    const getQuantity = (data) => {
        let price = data.price;
        let quantity = data.quantity;
        let qtyInDollar = price * quantity;

        let qtyInDollarText = '';
        if (isDollar) {
            if (qtyInDollar >= 1_000_000) {
                qtyInDollarText = (qtyInDollar / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
            } else if (qtyInDollar >= 1_000) {
                qtyInDollarText = (qtyInDollar / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
            } else {
                qtyInDollarText = qtyInDollar.toFixed(2).toString();
            }
        }

        return isDollar ? (
            <span>
                <span style={{ color: 'white' }}>$</span> {qtyInDollarText}
            </span>
        ) : (
            <span>{formatNumber(quantity)}</span>
        );
    }

    const getDensityStyle = (data) => {
        const styleLevel0 = 'ob__price-data-box quantity-level-0';
        const styleLevel1 = 'ob__price-data-box quantity-level-1';
        const styleLevel2 = 'ob__price-data-box quantity-level-2';
        const styleLevel3 = 'ob__price-data-box quantity-level-3';
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
        let lev1 = settings.level1;
        let lev2 = settings.level2;
        let lev3 = settings.level3;
        
        if (lev1 < 0 || lev2 < 0 || lev3 < 0) {
            return data.density;
        }

        let qty = parseFloat(data.quantity);
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

    const handleDollar = (isDollar) => {
        setDollar(isDollar);
    }

    const handleSettingsPopup = (isSettings) => {
        setIsSettings(isSettings);
        let dataContainer = document.querySelector(`div[id='data_container_${ticker}']`);
        if (isSettings) {
            dataContainer.style = 'filter: blur(3px)';
        } else {
            dataContainer.style = 'filter: blur(0)';
        }
    }

    const handleNewSettings = (newSettings) => {
        setSettings(newSettings);
        console.log("Settings have changed: ", newSettings);
    }

    const onSettingsSubmit = () => {
        let settingIcon = document.querySelector(`span[id='setting_icon_${symbol}']`);
        console.log("locator is ", `#setting_icon_${symbol}`);
        settingIcon.click();
    }

    return (
        <div className='ob__container'>

            <OrderBooKHeader ticker={ticker} onDollar={handleDollar} onSettings={handleSettingsPopup}></OrderBooKHeader>

            <div className='ob__body'>
                <OrderBookSettings isSettings={isSettings} onNewSettings={handleNewSettings} onSubmit={() => onSettingsSubmit()} />
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
                        <div className="ob__each-data" key={index}>
                            <div className='ob__quantity-ask'>
                                <span>
                                    {getQuantity(data)}
                                </span>
                            </div>
                            <div
                                className={getDensityStyle(data)}
                            >
                                <div className='ob__price-data'>
                                    <span> {roundNumber(data.price)} </span>
                                </div>
                                <div className='ob__percentage-data'>
                                    <span> {data.incline}% </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className='ob__separator'><p></p></div>

                    {bids.map((data, index) => (
                        <div className="ob__each-data" key={index}>
                            <div className='ob__quantity-bid'>
                                <span>
                                    {getQuantity(data)}
                                </span>
                            </div>
                            <div
                                className={getDensityStyle(data)}
                            >
                                <div className='ob__price-data'>
                                    <span> {roundNumber(data.price)} </span>
                                </div>
                                <div className='ob__percentage-data'>
                                    <span>{data.incline}%</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}

export default OrderBookBox;