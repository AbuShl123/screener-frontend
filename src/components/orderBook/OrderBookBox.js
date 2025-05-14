import React, { useState, useEffect } from 'react'
import { FUT_SIGN } from '../../utils/Utils.js'
import { processDensities, balanceFigures, getVolume } from './OBUtils.js'
import apiService from '../../api/ApiService.js'
import OrderBookSettings from './OrderBookSettings.js'
import useCacheContext from '../context/Context.js'
import useApiContext from '../context/ApiContext.js'
import DataSection from './DataSection.js'

const OrderBookBox = ({ ticker, onSeverityChange, readyToNotify }) => {

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
    const [pastDensities, setPastDensities] = useState(new Set());

    // function to get settings for a ticker and isDollar
    const {getSettings, isDollar} = useCacheContext();

    // to add notifications  
    const {addNotification} = useCacheContext();

    // listening to orderbook events
    const {orderBookEvent} = useApiContext();

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
        return () => {clearInterval(interval)};
    }, []);

    // indexes:             0      1      2        3      4
    // bid/ask data ===== [price, qty, incline, density, time]
    useEffect(() => {
        let densities;
        try {
            if (!orderBookEvent) return;
            const { price, symbol, bidsData, asksData } = orderBookEvent;
            if (symbol !== ticker) return;
            const settings = getSettings(ticker);
            densities = processDensities(price, asksData, bidsData, settings, isDollar);
            checkNotifications(densities);
            iterateLevels(densities);
            setDensities(balanceFigures(densities));
        } catch (error) {
            console.error(`couldn't process orderbook event ${densities}`, error);
        }
    }, [orderBookEvent]);

    // checks whether there are any notifications
    const checkNotifications = (trades) => {
        if (!readyToNotify) return;
        const settings = getSettings(ticker);
        for (const trade of trades) {
            let isRecent = Date.now() - trade.life <= 30_000;
            let hashcode = trade.price + ' ' + trade.distance;
            if (isRecent && !pastDensities.has(hashcode) && trade.level >= 1 && settings.audio) {
                addNotification({ticker, ...trade});
            }
        }
    }

    // sets the levelsSet and determines the severity
    const iterateLevels = (trades) => {
        let sev = 0;
        let newDensities = new Set();
        for (const trade of trades) {
            if (trade.level === 3) sev++;
            if (trade.level === 4) sev += 10;
            let hashcode = trade.price + ' ' + trade.distance;
            newDensities.add(hashcode);
        }
        setPastDensities(newDensities);
        if (severity === sev) return;
        onSeverityChange(ticker, sev);
        setSeverity(sev);
    }

    const handleSettingsToggle = () => {
        setIsSettings(prev => !prev);
    };

    return (
        <>
            <div className='ob__header'>
                <div> {isSpot ? "spot" : "perp"} </div>
                <span className={'ob__symbol-name ' + (isSpot ? 'ob__spot-symbol' : 'ob__perp-symbol')}>
                    <div>{ticker.replace(FUT_SIGN, "").toUpperCase()}</div>
                </span>

                <div className='ob__icons' onClick={() => handleSettingsToggle()}>
                    <span className="material-symbols-outlined settings-icon">
                        Settings
                    </span>
                </div>
            </div>

            <div className='ob__content'>
                {isSettings && <OrderBookSettings ticker={ticker} onSubmit={() => setIsSettings(false)}/>}
                <div>
                    <hr className='ob__line'></hr>
                    <div className='ob__data-container'>
                        <DataSection densities={densities} />
                    </div>
                </div>

                {/* <hr className='ob__line_footer'></hr> */}
                <div className='ob__footer'>
                    объем за 5м:
                    <div style={{paddingLeft: '10px'}}>
                        {getVolume(isDollar, volumeData)}
                    </div>
                    {/* <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <b>{getVolume(isDollar, volumeData)}</b>
                    </div> */}
                </div>
            </div>
        </>
    )
}

export default OrderBookBox;