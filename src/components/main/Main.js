import React from 'react'
import { useState, useEffect } from 'react'
import './Main.css'
import {useCacheContext } from '../context/Context';
import Header from '../header/Header'
import { Menu } from '../menu/Menu'
import TickersMenu from '../menu/TickersMenu'
import NotificationsMenu from '../menu/NotificationsMenu'
import OIMenu from '../menu/OIMenu'
import OrderBook from '../orderBook/OrderBook'
import SettingsModal from '../settings/SettingsModal'
import { setSpeech, speak } from '../../utils/Utils'

const Main = () => {
    const [activeMenu, setActiveMenu] = useState(Menu.tickers);
    const [isVoiceOn, setIsVoiceOn] = useState(true);
    const [tickerToDelete, setTickerToDelete] = useState("");
    const [notification, setNotification] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {isDollar} = useCacheContext();

    useEffect(() => {
        const waitForVoicesToLoad = async () => await setSpeech();
        waitForVoicesToLoad();
    }, []);

    useEffect(() => {
        if (!isVoiceOn) {
            window.speechSynthesis.cancel();
        }
    }, [isVoiceOn]);

    const addNewNotification = (newNotification) => {
        if (isVoiceOn) {
            speak(newNotification, isDollar);
        }
        setNotification(prev => [newNotification, ...prev]);
    }

    const switchSettingsModal = () => {
        setIsModalOpen(prev => !prev);
    }

    return (
        <>
            {isModalOpen && <SettingsModal onClose={switchSettingsModal} />}

            <div className='main' style={{ filter: isModalOpen ? 'blur(.8px)' : 'none' }}>
                <div className='content-left'>
                    <Header
                        onVoiceToggle={setIsVoiceOn}
                        onMenuSelection={setActiveMenu}
                        onSettings={switchSettingsModal}
                    />
                    <OrderBook
                        onNotification={addNewNotification}
                        onClose={setTickerToDelete}
                    />
                </div>
                <div className='content-right'>
                    {activeMenu === Menu.tickers &&
                        <TickersMenu deleteTicker={tickerToDelete} deleteionCompleted={() => setTickerToDelete("")} />
                    }
                    {activeMenu === Menu.notifications &&
                        <NotificationsMenu isVoiceOn={isVoiceOn} newNotifications={notification} />
                    }
                    {activeMenu === Menu.oi &&
                        <OIMenu />
                    }
                </div>
            </div>
        </>
    )
}

export default Main