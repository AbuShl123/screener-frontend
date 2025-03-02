import React from 'react'
import { useState } from 'react'
import './Main.css'
import Header from '../header/Header'
import Menu from '../menu/Menu'
import TickersMenu from '../menu/TickersMenu'
import NotificationsMenu from '../menu/NotificationsMenu'
import OIMenu from '../menu/OIMenu'
import OrderBook from '../orderBook/OrderBook'
import SettingsModal from '../settings/SettingsModal'

const Main = () => {
    const [activeMenu, setActiveMenu] = useState(Menu.tickers);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const switchSettingsModal = () => {
        setIsModalOpen(prev => !prev);
    }

    return (
        <>
            {isModalOpen && <SettingsModal onClose={switchSettingsModal} />}

            <div className='main' style={{ filter: isModalOpen ? 'blur(.8px)' : 'none' }}>
                <div className='content-left'>
                    <Header onMenuSelection={setActiveMenu} onSettings={switchSettingsModal} />
                    <OrderBook />
                </div>
                <div className='content-right'>
                    {activeMenu === Menu.tickers &&
                        <TickersMenu />
                    }
                    {activeMenu === Menu.notifications &&
                        <NotificationsMenu />
                    }
                    <OIMenu activeMenu={activeMenu}/>
                </div>
            </div>
        </>
    )
}

export default Main