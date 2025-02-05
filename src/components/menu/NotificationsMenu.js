import React, { useEffect } from 'react'
import { getShortFormNumber, roundNumber, getDate, SPOT_SIGN, FUT_SIGN } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { useCacheContext } from '../context/Context';

const NotificationsMenu = ({isVoiceOn}) => {

    // indexes:                              0       1      2     3      4        5      6
    // notification content is following: [symbol, isAsk, price, qty, incline, density, time]
    const {notifications, setNotifications} = useCacheContext();
    const {isDollar} = useCacheContext();

    useEffect(() => {
        if (notifications.length > 15) {
            const pastNotifications = notifications.slice(0, 15);
            setNotifications(pastNotifications)
        }
    }, [notifications]);

    const formatSymbol = (ticker) => {
        return (ticker.replace(SPOT_SIGN, "").replace(FUT_SIGN, "").replace("usdt", "") + "/usdt").toUpperCase();
    }

    const getQty = (data) => {
        let value = getShortFormNumber(data[3]);
        if (isDollar) {
            value = '$' + getShortFormNumber(data[3] * data[2]);
        }
        return (
            <>
                {value + ' '}
                {!isDollar && <FontAwesomeIcon icon={faCoins} style={{ color: "rgb(255 255 255 / 80%)", fontSize: '12px'}} />}
            </>
        );
    }

    const getSymbolStyle = (data) => {
        let ticker = data[0];
        if (ticker.endsWith(SPOT_SIGN)) {
            return 'spot-notification';
        } else {
            return 'perp-notification';
        }
    }

    return (
        <>
            <div className='menu-container'>
                <div className='menu-title'>
                    Уведомления
                </div>
                <div className='menu-notification-container menu-invisible-scroller'>
                    {notifications.map((data, index) => (    
                        <div key={index}>
                            <div className='notification-container'>
                                <div className={'notification-1 notification-line ' + getSymbolStyle(data)}>
                                    <p> {formatSymbol(data[0])} </p>
                                    <p> {getQty(data)} </p>
                                    <p> {data[1] ? 'long' : 'short'} </p>
                                    <p> {data[0].endsWith(SPOT_SIGN) ? 'spot' : 'perp'} </p>
                                </div>
                                <div>
                                    <div className='notification-fact notification-line'>
                                        <p> цена: </p>
                                        <p> {roundNumber(data[2])} </p>
                                    </div>
                                    <div className='notification-fact notification-line'>
                                        <p> уклон: </p>
                                        <p> {Math.abs(data[4])}% </p>
                                    </div>
                                </div>
                                <div className='notification-time'>
                                    <p> {getDate(data[6])} </p>
                                </div>
                            </div>
                            {index != notifications.length - 1 ? <hr style={{ margin: '0' }}></hr> : <></>}
                        </div>
                    ))} 
                </div>
            </div>
        </>
    )
}

export default NotificationsMenu;