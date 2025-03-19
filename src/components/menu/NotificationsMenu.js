import React from 'react'
import { getDate, FUT_SIGN } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import useCacheContext from '../context/Context';
import Menu from './Menu';

const NotificationsMenu = ({activeMenu}) => {

    // notification content is following: [ticker, price, qty, distance, level, isAsk, life]
    const {notifications, isDollar} = useCacheContext();

    return (
        <>
            <div className='menu-container' style={{ 'display': activeMenu !== Menu.notifications ? 'none' : ''}}>
                <div className='menu-title'>
                    Уведомления
                </div>
                <div className='menu-notification-container menu-scroller'>
                    {notifications.map((data, index) => (    
                        <div className={'notification-container ' + getNotifLevel(data)} key={index}>
                            <div className='notification-1 notification-line'>
                                <p> {formatSymbol(data)} </p>
                                <p> {getQty(data, isDollar)} </p>
                                <p> {data.isAsk ? 'long' : 'short'} </p>
                                <p> {data.ticker.endsWith(FUT_SIGN) ? 'perp' : 'spot'} </p>
                            </div>
                            <div className='notification-fact notification-line'>
                                <p> цена: </p>
                                <p> {data.price} </p>
                            </div>

                            <div className='notification-line notification-time-container'> 
                                <div className='notification-fact'>
                                    <p> уклон: </p>
                                    <p> {Math.abs(data.distance)}% </p>
                                </div>
                                <div className='notification-time'>
                                    <p> {getDate(data.life)} </p>
                                </div>
                            </div>
                        </div>
                    ))} 
                </div>
            </div>
        </>
    )
}

export default NotificationsMenu;

function getNotifLevel(data) {
    return 'notif-level-' + data.level;
}

function formatSymbol(data) {
    return (data.ticker.replace(FUT_SIGN, "").replace("usdt", "") + "/usdt").toUpperCase();
}

function getQty(data, isDollar) {
    let qty = isDollar ? '$' + data.qty : data.qty;

    return (
        <>
            {qty + ' '}
            {!isDollar && <FontAwesomeIcon icon={faCoins} style={{ color: "rgb(255 255 255 / 80%)", fontSize: '12px'}} />}
        </>
    );
}