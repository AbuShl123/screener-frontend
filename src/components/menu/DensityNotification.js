import React, { useCallback } from 'react'
import { getDate, FUT_SIGN } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';

const DensityNotification = ({data, isDollar}) => {

    // 'data' content is following: {ticker, price, qty, distance, level, isAsk, life}

    const formatSymbol = useCallback((data) => {
        return (data.ticker.replace(FUT_SIGN, "").replace("usdt", "") + "/usdt").toUpperCase();
    }, []);

    const getQty = useCallback((data, isDollar) => {
        let qty = isDollar ? '$' + data.qty : data.qty;

        return (
            <>
                {qty + ' '}
                {!isDollar && <FontAwesomeIcon icon={faCoins} style={{ color: "rgb(255 255 255 / 80%)", fontSize: '12px' }} />}
            </>
        );
    }, []);

    return (
        <>
            <div className='notification-1 notification-line'>
                <p> {formatSymbol(data)} </p>
                <p> {getQty(data, isDollar)} </p>
                <p> {data.isAsk ? 'short' : 'long'} </p>
                <p> {data.ticker.endsWith(FUT_SIGN) ? 'perp' : 'spot'} </p>
            </div>

            <div className='notification-fact notification-line'>
                <p> цена: </p>
                <p> {data.price} </p>
            </div>

            <div className='notification-line notification-time-container'>
                <div className='notification-fact'>
                    <p> дистанция: </p>
                    <p> {Math.abs(data.distance)}% </p>
                </div>
                <div className='notification-time'>
                    <p> {getDate(data.life)} </p>
                </div>
            </div>
        </>
    )
}

export default DensityNotification;