import React, { useState, useEffect } from 'react'
import { FUT_SIGN } from '../../utils/Utils.js'
import { processDensities, getVolume } from './OBUtils.js'
import apiService from '../../api/ApiService.js'
import OrderBookSettings from './OrderBookSettings.js'
import useCacheContext from '../context/Context.js'
import useApiContext from '../context/ApiContext.js'
import DataSection from './DataSection.js'

const OrderBookBox = ({ ticker, onSeverityChange }) => {

    const isSpot = !ticker.endsWith(FUT_SIGN);
    
    /*
        density: {
            price, qty, distance, level, life, isAsk
        }
        densities: density[] 
    */
    const [densities, setDensities] = useState([]);

    // volumeData: {volume, price}
    const [volumeData, setVolumeData] = useState({});

    // cup properties: isSettings & severity
    const [isSettings, setIsSettings] = useState(false);
    const [severity, setSeverity] = useState(0);

    // stores the price->level pairs
    const [levelsMap, setLevelsMap] = useState(new Map());

    // function to get settings for a ticker and isDollar
    const {getSettings, isDollar} = useCacheContext();

    // to add notifications  
    const {addNotification} = useCacheContext();

    // listening to orderbook events
    const {orderBookEvent} = useApiContext();

    // status to check whether order book is ready to send notifications 
    const [readyToNotify, setReadyToNotify] = useState(false);

    useEffect(() => {
        const fetchVolumeData = async () => {
            const volumeUpdate = await apiService.fetch5MVolume(ticker.replace(FUT_SIGN, ''))
            if (!volumeUpdate) return;
            let price = volumeUpdate[0][4];
            let volume = volumeUpdate[0][5];
            setVolumeData({price, volume})
        }
        fetchVolumeData();
        const interval = setInterval(fetchVolumeData, 300_000);
        const timer = setTimeout(() => setReadyToNotify(true), 20_000);
        return () => {clearInterval(interval); clearTimeout(timer)};
    }, []);

    // indexes:             0      1      2        3      4
    // bid/ask data ===== [price, qty, incline, density, time]
    useEffect(() => {
        let densities;
        try {
            if (!orderBookEvent) return;
            const { symbol, bidsData, asksData } = orderBookEvent;
            if (symbol !== ticker) return;

            const settings = getSettings(ticker);
            densities = processDensities(asksData, bidsData, settings, isDollar);
            checkNotifications(densities);
            iterateLevels(densities);
            setDensities(densities);
        } catch (error) {
            console.error(`couldn't process orderbook event ${densities}`, error);
        }
    }, [orderBookEvent]);

    // checks whether there are any notifications
    const checkNotifications = (trades) => {
        if (!readyToNotify) return;
        if (levelsMap.size === 0) return;
        const settings = getSettings(ticker);
        for (const trade of trades) {
            let level = trade.level;
            let oldLevel = levelsMap.get(trade.price);

            if (oldLevel !== level && level === 3 && settings.audio) {
                addNotification({
                    ticker,
                    ...trade,
                });
            }
        }
    }

    // sets the levelsMap and determines the severity
    const iterateLevels = (trades) => {
        let sev = 0;
        const levelsMap = new Map();
        for (const trade of trades) {
            let price = trade.price;
            let level = trade.level
            if (level === 3) sev++;
            levelsMap.set(price, level);
        }

        setLevelsMap(levelsMap);
        if (severity === sev) return;
        onSeverityChange(ticker, sev);
        setSeverity(sev);
    }

    return (
        <>
            <div className='ob__container' id={`obContainer_${ticker}`}>

                <div className='ob__header'>
                    <div> {isSpot ? "spot" : "perp"} </div>
                    <span className={'ob__symbol-name ' + (isSpot ? 'ob__spot-symbol' : 'ob__perp-symbol')}>
                        <div>{ticker.replace(FUT_SIGN, "").toUpperCase()}</div>
                    </span>

                    <div className='ob__icons'>
                        <span className="material-symbols-outlined settings-icon" onClick={() => setIsSettings(prev => !prev)}>
                            Settings
                        </span>
                    </div>
                </div>

                <div className='ob__body'>
                    <hr className='ob__line'></hr>
                    <div className='ob__data-container'>
                        <DataSection densities={densities}/>
                    </div>
                </div>

                <hr style={{margin: '0'}}></hr>
                <div className='ob__footer'>
                    Объем за 5 мин: 
                    <div style={{width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <b>{getVolume(isDollar, volumeData)}</b>
                    </div>
                </div>

            </div>
        </>
    )
}

export default OrderBookBox;