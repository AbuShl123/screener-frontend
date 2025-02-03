import React, { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import { getShortFormNumber, getDate } from '../../utils/Utils';
import { BASE_WS_URL } from '../../utils/EnvParams';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { useCacheContext } from '../context/Context';

const OIMenu = () => {
    const {token, isDollar} = useCacheContext();
    const [notifications, setNotifications] = useState(JSON.parse(localStorage.getItem('openInterest')) || [])
    const [level1, setLevel1] = useState(100_000);
    const [level2, setLevel2] = useState(250_000);
    const [level3, setLevel3] = useState(1_000_000);
    
    const wsUrl = `${BASE_WS_URL}/bitget/openInterest?token=${token}`;
    const { lastJsonMessage } = useWebSocket(wsUrl, {
        shouldReconnect: () => true,
        onOpen: () => console.log('Connected to open interest websocket'),
        onError: (error) => console.error('Error while connecting to open interest websocket: ', error),
        onClose: () => console.warn('Disconnected from open interest websocket')
    });

    useEffect(() => {
        if (lastJsonMessage) {
            const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
            // remove notifications that appeared more than 30m ago:
            let filteredNotifications = notifications.filter( n => !n || n.timestamp > thirtyMinutesAgo).slice(0, 50);
            let newNotifications = [{
                symbol: lastJsonMessage.symbol,
                percentage: lastJsonMessage.deltaPercentage,
                coins: lastJsonMessage.deltaCoins,
                dollars: lastJsonMessage.deltaDollars,
                timestamp: lastJsonMessage.timestamp
            }, ...filteredNotifications];
            setNotifications(newNotifications);
            localStorage.setItem('openInterest', JSON.stringify(newNotifications));
        }
    }, [lastJsonMessage]);

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
            <div className='menu-container'>
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