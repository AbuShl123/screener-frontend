import React, { useState, useEffect } from 'react'
import { getShortFormNumber, getDate } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import apiService from '../../api/ApiService';
import useCacheContext from '../context/Context';
import useApiContext from '../context/ApiContext';
import Menu from './Menu';
import cache from '../../utils/CacheUtils';

const OIMenu = ({activeMenu}) => {
    const [notifications, setNotifications] = useState([])
    const {isDollar, addNotification} = useCacheContext();
    const {openInterestEvent} = useApiContext();
    const level0 = 100_000;
    const level1 = 250_000;
    const level2 = 1_000_000;

    useEffect(() => {
        const fetchOpenInterest = async () => {
            const data = await apiService.fetchOpenInterest(cache.getToken());
            let notifications = [];
            try {
                for (const event of data) {
                    const newNotification = {
                        symbol: event.symbol,
                        percentage: event.deltaPercentage,
                        coins: event.deltaCoins,
                        dollars: event.deltaDollars,
                        timestamp: event.timestamp
                    };
                    notifications = [newNotification, ...notifications];
                }
                setNotifications(notifications);
            } catch (error) {
                console.error(`Error while reading open interest: ${data}`, error);
            }
        }
        fetchOpenInterest();
    }, [])

    useEffect(() => {
        if (!openInterestEvent) {
            return;
        }

        if (openInterestEvent.n === 'price') {
            addNotification(openInterestEvent);
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
        return dollars < level0 ? 'notif-level-0' :
               dollars < level1 ? 'notif-level-1' :
               dollars < level2 ? 'notif-level-2' :
               'notif-level-3';
    }

    const getPercentage = (data) => {
        let percentage = Math.abs(data.percentage);
        return percentage + "%";
    }

    return (
        <>
            <div className='menu-container' style={{ 'display': activeMenu !== Menu.oi ? 'none' : ''}}>
                <div className='menu-title'>
                    Открытый Интерес - BitGet
                </div>
                <div className='menu-notification-container menu-scroller'>
                    {notifications.map((data, index) => (
                        <div key={index} className={'notification-container ' + getOILevelClass(data)}>
                            <div className='notification-1 notification-line'>
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