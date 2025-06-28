import { useState, useEffect } from 'react'
import { FUT_SIGN } from '../../utils/Utils.js'
import { processDensities, balanceFigures, getVolume } from './OBUtils.js'
import apiService from '../../api/ApiService.js'
import OrderBookSettings from './OrderBookSettings.js'
import useCacheContext from '../context/Context.js'
import DataSection from './DataSection.js'

const OrderBookBox = ({ ticker, bids, asks }) => {

    const isSpot = !ticker.endsWith(FUT_SIGN);
    
    /*
        density: {
            price, qty, distance, level, life, isAsk
        }
        densities: density[] 
    */
    const [densities, setDensities] = useState([]);

    // volumeData: {volume, price}
    const [volumeData, setVolumeData] = useState({price: 0.0, volume: 0.0});

    // cup properties: isSettings & severity
    const [isSettings, setIsSettings] = useState(false);

    // function to get settings for a ticker and isDollar
    const {getSettings, isDollar} = useCacheContext();

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

    useEffect(() => {
        let densities;
        try {
            const settings = getSettings(ticker);
            densities = processDensities(asks, bids, settings, isDollar);
            setDensities(balanceFigures(densities));
        } catch (error) {
            console.error(`couldn't process orderbook event ${densities}`, error);
        }
    }, [asks, bids]);

    const handleSettingsToggle = () => {
        setIsSettings(prev => !prev);
    };

    return (
        <>
            <div className='ob__header'>
                <div> {isSpot ? "spot" : "perp"} </div>
                <span className={'ob__symbol-name ' + (isSpot ? 'ob__spot-symbol' : 'ob__perp-symbol')}>
                    <div>{ticker.replace(FUT_SIGN, "").toUpperCase().replace("USDT", "") + " / USDT"}</div>
                </span>

                <button className='ob__icons' onClick={() => handleSettingsToggle()}>
                    <span className="material-symbols-outlined settings-icon">
                        Settings
                    </span>
                </button>
            </div>

            <div className='ob__content'>
                {isSettings && <OrderBookSettings ticker={ticker} onSubmit={() => setIsSettings(false)}/>}
                <div>
                    <hr className='ob__line'></hr>
                    <div className='ob__data-container'>
                        <DataSection densities={densities} />
                    </div>
                </div>
                <div className='ob__footer'>
                    объем за 5м:
                    <div style={{paddingLeft: '10px'}}>
                        {getVolume(isDollar, volumeData)}
                    </div>
                </div>
            </div>
        </>
    )
}

export default OrderBookBox;