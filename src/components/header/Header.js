import { useCallback } from 'react'
import { useState, useEffect } from 'react'
import Menu from '../menu/Menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import './Header.css'
import useCacheContext from '../context/Context';
import useUserContext from '../context/UserContext';
import SortDropdown from './SortDropdown';
import cache from '../../utils/CacheUtils';

const Header = ({ onMenuSelection, onSettings }) => {
    const navigate = useNavigate();
    const {isDollar, setIsDollar, isVoiceOn, setIsVoiceOn} = useCacheContext();
    const {user} = useUserContext();
    const [activeMenu, setActiveMenu] = useState(localStorage.getItem('screener-active-menu') || Menu.tickers);

    const handleDollarToggle = () => {
        setIsDollar(!isDollar);
    }

    const handleVoiceToggle = () => {
        setIsVoiceOn(!isVoiceOn);
    }

    const handleSignOut = useCallback(() => {
        cache.removeToken();
        navigate('/login');
    }, [localStorage]);

    const handleGoToAccount = useCallback(() => {
        navigate('/account');
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
                        <div className="logo-title-container montserrat-font" style={{fontSize: '14px'}}>
                            <span className="logo-title" style={{padding: '9px'}}>
                                clerk screener
                            </span>
                        </div>
                        <div className='menu-button multi-el-header-item header-item profile-nav tooltip-container' >
                            <button className='relative-button' onClick={handleGoToAccount}/>
                            <span className="material-symbols-outlined header-google-icon-item">
                                account_circle
                            </span>
                            <div> {user.firstname} </div>
                            <div className='advanced-tooltip profile-overview-container'> 
                                <div className='profile-header'>
                                    <div className='profile-image'>
                                        <span className="material-symbols-outlined large-icon">
                                            person
                                        </span>
                                    </div>
                                    <div className='profile-quick-info'>
                                        <p className='account-email'> {user.email} </p>
                                        <span className='highlighted-text'> обычный пользователь </span>
                                    </div>
                                </div>
                                <div className='profile-nav-action'>
                                    <button className='profile-window-button multi-el-header-item' onClick={handleGoToAccount}> 
                                        <span className="material-symbols-outlined header-google-icon-item">
                                            loyalty
                                        </span>
                                        Подписки
                                    </button>
                                    <button className='profile-window-button multi-el-header-item' style={{color: '#ff6b6b'}} onClick={handleSignOut}> 
                                        <span className="material-symbols-outlined header-google-icon-item">
                                            logout
                                        </span>
                                        Выйти
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button className='menu-button multi-el-header-item header-item' onClick={onSettings}> 
                            <span className="material-symbols-outlined header-google-icon-item">
                                settings
                            </span>
                            <div> Настройки </div>
                        </button>
                        <SortDropdown />
                    </div>
                    <div className='header-right-elements'>
                        <button className='toggle-icon header-item tooltip-container' onClick={handleDollarToggle}>
                            {isDollar ? (
                                <FontAwesomeIcon icon={faDollarSign} style={{ color: "#FFD43B", }} />
                            ) : (
                                <FontAwesomeIcon icon={faCoins} style={{ color: "#FFD43B", }} />
                            )}
                            <span className='simple-tooltip'> значения в долларах/монетах </span>
                        </button>
                        <button className='toggle-icon header-item tooltip-container' onClick={handleVoiceToggle} style={{ color: "white", }}>
                            {isVoiceOn ? (
                                <span className="material-symbols-outlined volume-icon">
                                    volume_up
                                </span>
                            ) : (
                                <span className="material-symbols-outlined volume-icon">
                                    volume_off
                                </span>
                            )}
                            <span className='simple-tooltip'> озвучка плотностей </span>
                        </button>

                        <button className='menu-button header-item trns-border'
                            onClick={() => setActiveMenu(Menu.notifications)}
                            id={Menu.notifications + 'MenuSelection'}
                        > уведомления </button>

                        <button className='menu-button header-item trns-border'
                            onClick={() => setActiveMenu(Menu.tickers)}
                            id={Menu.tickers + 'MenuSelection'}
                        > тикеры </button>

                        <button className='menu-button header-item trns-border'
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