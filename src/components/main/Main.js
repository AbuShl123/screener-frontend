import React, { useState, useEffect, useCallback } from 'react'
import { setSpeech, speak } from '../../utils/Utils'
import './Main.css'
import Header from '../header/Header'
import Menu from '../menu/Menu'
import TickersMenu from '../menu/TickersMenu'
import NotificationsMenu from '../menu/NotificationsMenu'
import OIMenu from '../menu/OIMenu'
import OrderBook from '../orderBook/OrderBook'
import SettingsModal from '../settings/SettingsModal'
import useCacheContext from '../context/Context'

const Main = () => {
    const [activeMenu, setActiveMenu] = useState(Menu.tickers);
    const [settingsModal, setSettingsModal] = useState({isOpen: false, desiredTicker: ''});
    const {notifications, isVoiceOn, getSettings, isDollar} = useCacheContext();

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

    const openSettingsModal = useCallback(() => {
        setSettingsModal({isOpen: true, desiredTicker: ''});
    }, []);

    const closeSettingsModal = useCallback(() => {
        setSettingsModal({isOpen: false, desiredTicker: ''});
    }, []);

    const openSettingsModalForTicker = useCallback((desiredTicker) => {
        setSettingsModal({isOpen: true, desiredTicker});
    }, []);

    return (
        <>
            {settingsModal.isOpen && <SettingsModal onClose={closeSettingsModal} desiredTicker={settingsModal.desiredTicker} />}

            <div className='main' style={{ filter: settingsModal.isOpen ? 'blur(.8px)' : 'none' }}>
                <div className='content-left'>
                    <Header onMenuSelection={setActiveMenu} onSettings={openSettingsModal} />
                    <OrderBook />
                </div>
                <div className='content-right'>
                    {activeMenu === Menu.tickers &&
                        <TickersMenu onTickerSettings={openSettingsModalForTicker}/>
                    }
                    <NotificationsMenu activeMenu={activeMenu} />
                    <OIMenu activeMenu={activeMenu}/>
                </div>
            </div>
        </>
    )
}

export default Main