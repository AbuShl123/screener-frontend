import React, { useEffect } from 'react'
import { roundNumber, getDate, FUT_SIGN, setSpeech, speak } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import useCacheContext from '../context/Context';

const NotificationsMenu = () => {

    // notification content is following: [ticker, price, qty, distance, level, isAsk, life]
    const {notifications, isDollar, isVoiceOn, getSettings} = useCacheContext();

    useEffect(() => {
        const waitForVoicesToLoad = async () => await setSpeech();
        waitForVoicesToLoad();
    }, []);

    useEffect(() => {
        if (!isVoiceOn) {
            window.speechSynthesis.cancel();
        }
    }, [isVoiceOn]);

    useEffect(() => {
        for (const notif of notifications) {
            if (notif.announced) continue;
            notif.announced = true;
            const ticker = notif.ticker;
            const settings = getSettings(ticker);
            if (!settings.audio || !isVoiceOn) continue;
            speak(notif, isDollar);
        }
    }, [notifications]);

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
                                    <p> {formatSymbol(data)} </p>
                                    <p> {getQty(data, isDollar)} </p>
                                    <p> {data.isAsk ? 'long' : 'short'} </p>
                                    <p> {data.ticker.endsWith(FUT_SIGN) ? 'perp' : 'spot'} </p>
                                </div>
                                <div>
                                    <div className='notification-fact notification-line'>
                                        <p> цена: </p>
                                        <p> {roundNumber(data.price)} </p>
                                    </div>
                                    <div className='notification-fact notification-line'>
                                        <p> уклон: </p>
                                        <p> {Math.abs(data.distance)}% </p>
                                    </div>
                                </div>
                                <div className='notification-time'>
                                    <p> {getDate(data.life)} </p>
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



function formatSymbol (data) {
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

function getSymbolStyle(data) {
    let ticker = data.ticker;
    if (ticker.endsWith(FUT_SIGN)) {
        return 'perp-notification';
    } else {
        return 'spot-notification';
    }
}