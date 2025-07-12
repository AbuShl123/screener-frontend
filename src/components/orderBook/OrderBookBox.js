import { useState, useEffect } from 'react'
import { FUT_SIGN } from '../../utils/Utils.js'
import { processDensities, balanceFigures, getVolume } from './OBUtils.js'
import apiService from '../../api/ApiService.js'
import useCacheContext from '../context/Context.js'
import DataSection from './DataSection.js'
import useUserContext from '../context/UserContext.js'

const OrderBookBox = ({ onTickerSettings, ticker, bids, asks }) => {

    const isSpot = !ticker.endsWith(FUT_SIGN);
    
    /*
        density: {
            price, qty, distance, level, life, isAsk
        }
        densities: density[] 
    */
    const [densities, setDensities] = useState([]);

    // volumeData: {price, volume}
    const [volumeData, setVolumeData] = useState({price: 0.0, volume: 0.0});

    // function to get settings for a ticker and isDollar
    const { isDollar } = useCacheContext();

    // authentication token
    const {token} = useUserContext();

    useEffect(() => {
        const fetchVolumeData = async () => {
            const volumeUpdate = await apiService.fetch5MVolume(ticker, token);
            if (!volumeUpdate) return;
            let price = volumeUpdate[0][4];
            let volume = volumeUpdate[0][5];
            setVolumeData({price, volume})
        }
        fetchVolumeData();
        const interval = setInterval(fetchVolumeData, 300_000);
        return () => {clearInterval(interval)};
    }, [ticker]);

    useEffect(() => {
        let densities;
        try {
            densities = processDensities(asks, bids, isDollar);
            setDensities(balanceFigures(densities));
        } catch (error) {
            console.error(`couldn't process orderbook event ${densities}`, error);
        }
    }, [asks, bids]);

    return (
        <>
            <div className='ob__header'>
                <div> {isSpot ? "spot" : "perp"} </div>
                <span className={'ob__symbol-name ' + (isSpot ? 'ob__spot-symbol' : 'ob__perp-symbol')}>
                    <div>{ticker.replace(FUT_SIGN, "").toUpperCase().replace("USDT", "") + " / USDT"}</div>
                </span>

                <button className='ob__icons' onClick={() => onTickerSettings(ticker.replace(FUT_SIGN, ""))}>
                    <span className="material-symbols-outlined settings-icon">
                        Settings
                    </span>
                </button>
            </div>

            <div className='ob__content'>
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