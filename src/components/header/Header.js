import React from 'react'
import { useState, useEffect } from 'react'
import Menu from '../menu/Menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faDollarSign, faFilter } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Header.css'
import useCacheContext from '../context/Context';

const Header = ({ onNewDollar, onVoiceToggle, onMenuSelection, onSettings }) => {
    const navigate = useNavigate();
    const {isDollar, setIsDollar} = useCacheContext();
    const [isVoiceOn, setIsVoiceOn] = useState(localStorage.getItem('screener-isVoiceOn') === 'true');
    const [activeMenu, setActiveMenu] = useState(localStorage.getItem('screener-active-menu') || Menu.tickers);

    const handleDollarToggle = () => {
        let newIsDollar = !isDollar;
        setIsDollar(newIsDollar);
    }

    const handleVoiceToggle = () => {
        setIsVoiceOn(prev => !prev);
        onVoiceToggle(!isVoiceOn);
        localStorage.setItem('screener-isVoiceOn', !isVoiceOn);
    }

    const handleSignOut = () => {
        localStorage.removeItem('token');
        navigate('/login');
    }

    useEffect(() => {
        onVoiceToggle(isVoiceOn);
    }, []);

    useEffect(() => {
        const elements = document.querySelectorAll('button[id*="MenuSelection"]');
        elements.forEach(el => el.classList.remove('menu-selected'));

        const element = document.querySelector('#' + activeMenu + 'MenuSelection');
        if (element) {
            element.classList.add('menu-selected');
        }

        onMenuSelection(activeMenu);
        localStorage.setItem('screener-active-menu', activeMenu);
    }, [activeMenu]);

    return (
        <>
            <header className='header'>
                <div className='header-container'>
                    <div className='header-left-elements'>
                        <button className='menu-button header-item' onClick={handleSignOut}> выйти </button>
                        <button className='menu-button header-item' onClick={onSettings}> настройки </button>
                        <div className='toggle-icon header-item' onClick={handleDollarToggle}>
                            {isDollar ? (
                                <FontAwesomeIcon icon={faDollarSign} style={{ color: "#FFD43B", }} />
                            ) : (
                                <FontAwesomeIcon icon={faCoins} style={{ color: "#FFD43B", }} />
                            )}
                        </div>
                        <div className='toggle-icon header-item'>
                            <FontAwesomeIcon icon={faFilter} style={{ color: "#ffffff", }} />
                        </div>
                    </div>
                    <div className='header-right-elements'>
                        <div className='toggle-icon header-item' onClick={handleVoiceToggle}>
                            {isVoiceOn ? (
                                <span className="material-symbols-outlined volume-icon">
                                    volume_up
                                </span>
                            ) : (
                                <span className="material-symbols-outlined volume-icon">
                                    volume_off
                                </span>
                            )}
                        </div>
                        <button className='menu-button header-item'
                            onClick={() => setActiveMenu(Menu.notifications)}
                            id={Menu.notifications + 'MenuSelection'}
                        > уведомления </button>

                        <button className='menu-button header-item'
                            onClick={() => setActiveMenu(Menu.tickers)}
                            id={Menu.tickers + 'MenuSelection'}
                        > тикеры </button>

                        <button className='menu-button header-item'
                            onClick={() => setActiveMenu(Menu.oi)}
                            id={Menu.oi + 'MenuSelection'}
                        > ОИ </button>
                    </div>
                </div>
            </header>
        </>
    )
}

export default Header;