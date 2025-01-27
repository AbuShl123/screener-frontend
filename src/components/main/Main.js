import React from 'react'
import { useState, useEffect } from 'react'
import './Main.css'
import { CacheProvider } from '../context/Context';
import Header from '../header/Header'
import { Menu } from '../menu/Menu'
import TickersMenu from '../menu/TickersMenu'
import NotificationsMenu from '../menu/NotificationsMenu'
import OIMenu from '../menu/OIMenu'
import OrderBook from '../orderBook/OrderBook'
import SettingsModal from '../settings/SettingsModal'
import api from '../../api/AxiosConfig'
import { setSpeech, speak, DEFAULT_MARKET_TICKERS } from '../../utils/Utils'
import { cache } from '../../utils/CacheUtils'

const Main = () => {
    const token = localStorage.getItem('screener-auth-token');
    const [tickers, setTickers] = useState([]);
    const [tickerProps, setTickerProps] = useState(new Map());
    const [activeMenu, setActiveMenu] = useState(Menu.tickers);
    const [isDollar, setIsDollar] = useState(true);
    const [isVoiceOn, setIsVoiceOn] = useState(true);
    const [marketTickers, setMarketTickers] = useState([]);
    const [tickerToDelete, setTickerToDelete] = useState("");
    const [notification, setNotification] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            let fetchedTickers = [];
            let fetchedProps = new Map();

            await api.get('/tickers', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(response => {
                    fetchedTickers = response.data.map(t => t.symbol);
                    response.data.forEach(item => {
                        let symbol = item.symbol;
                        let hasSpot = item.hasSpot;
                        let hasFut = item.hasFut;
                        fetchedProps.set(symbol, { hasSpot, hasFut });
                    });
                })
                .catch(error => {
                    console.error('Error fetching tickers:', error);
                });

            setTickers(fetchedTickers);
            setTickerProps(fetchedProps);
        }

        const waitForVoicesToLoad = async () => await setSpeech();

        fetchData();
        waitForVoicesToLoad();
    }, []);

    useEffect(() => {
        if (!isVoiceOn) {
            window.speechSynthesis.cancel();
        }
    }, [isVoiceOn]);

    useEffect(() => {
        console.log('Main called useEffect for updating marketTickers');
        setMarketTickers(cache.getMarketTickers() || DEFAULT_MARKET_TICKERS, false);
    }, [cache.marketTickersUpdate]);

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
            <CacheProvider>
                {isModalOpen &&
                    <SettingsModal onClose={switchSettingsModal} allTickers={tickers} props={tickerProps} />
                }
                <div className='main' style={{ filter: isModalOpen ? 'blur(.8px)' : 'none' }}>
                    <div className='content-left'>
                        <Header
                            onNewDollar={setIsDollar}
                            onVoiceToggle={setIsVoiceOn}
                            onMenuSelection={setActiveMenu}
                            onSettings={switchSettingsModal}
                        />
                        <OrderBook
                            isDollar={isDollar}
                            connectedTickers={marketTickers}
                            onNotification={addNewNotification}
                            onClose={setTickerToDelete}
                        />
                    </div>
                    <div className='content-right'>
                        {activeMenu === Menu.tickers &&
                            <TickersMenu
                                deleteTicker={tickerToDelete}
                                deleteionCompleted={() => setTickerToDelete("")}
                                allTickers={tickers}
                                props={tickerProps}
                            />
                        }
                        {activeMenu === Menu.notifications &&
                            <NotificationsMenu isDollar={isDollar} isVoiceOn={isVoiceOn} newNotifications={notification} />
                        }
                        {activeMenu === Menu.oi &&
                            <OIMenu isDollar={isDollar} />
                        }
                    </div>
                </div>
            </CacheProvider>
        </>
    )
}

export default Main