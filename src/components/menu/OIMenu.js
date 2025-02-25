import React, { useState, useEffect } from 'react'
import { getShortFormNumber, getDate } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import useCacheContext from '../context/Context';
import useApiContext from '../context/ApiContext';
import Menu from './Menu';

const OIMenu = ({activeMenu}) => {
    const [notifications, setNotifications] = useState([])
    const {isDollar} = useCacheContext();
    const {openInterestEvent} = useApiContext();
    const level1 = 100_000;
    const level2 = 250_000;
    const level3 = 1_000_000;

    useEffect(() => {
        if (!openInterestEvent || !openInterestEvent.symbol) {
            return;
        }
        
        const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
        const filteredNotifications = notifications.filter(n => !n || n.timestamp > thirtyMinutesAgo).slice(0, 50);
        const newNotification = {
            symbol: openInterestEvent.symbol,
            percentage: openInterestEvent.deltaPercentage,
            coins: openInterestEvent.deltaCoins,
            dollars: openInterestEvent.deltaDollars,
            timestamp: openInterestEvent.timestamp
        };

        let newNotifications = [newNotification, ...filteredNotifications];
        setNotifications(newNotifications);
    }, [openInterestEvent]);

    const getQty = (data) => {
        let coins = data.coins;
        let dollars = data.dollars;
        if (isDollar) {
            return "$" + getShortFormNumber(parseFloat(Math.abs(dollars)));
        } else {
            return (
                <>
                    {getShortFormNumber(Math.abs(coins)) + " "}
                    <FontAwesomeIcon icon={faCoins} style={{ color: "rgb(255 255 255 / 80%)", }} />
                </>
            )
        }
    }

    const getOILevelClass = (data) => {
        let dollars = Math.abs(parseFloat(data.dollars));
        return dollars < level1 ? 'oi-level-1' :
               dollars < level2 ? 'oi-level-2' :
               dollars < level3 ? 'oi-level-3' :
               'oi-level-4';
    }

    const getPercentage = (data) => {
        let percentage = Math.abs(data.percentage);
        return percentage + "%";
    }

    return (
        <>
            <div className='menu-container' style={{ 'display': activeMenu !== Menu.oi ? 'none' : 'block'}}>
                <div className='menu-title'>
                    Открытый Интерес - BitGet
                </div>
                <div className='menu-notification-container menu-invisible-scroller'>
                    {notifications.map((data, index) => (
                        <div key={index} className={'notification-container ' + getOILevelClass(data)}>
                            <div className='notification-1'>
                                <div> {data.symbol?.replace("USDT", "") + "/USDT"} </div>
                                <div> {getDate(data.timestamp)} </div>
                            </div>
                            <div className='notification-2'>
                                <div> {getPercentage(data)} </div>
                                <div> {getQty(data)} </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default OIMenu;