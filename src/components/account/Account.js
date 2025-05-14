import './Account.css'
import React, { useCallback, useState } from "react";
import { getDateTime } from '../../utils/Utils';
import { getRenewRate, getSubscriptionStatus } from '../starterpage/SubscriptionUtils';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../context/UserContext';

const Account = () => {

    const navigate = useNavigate();
    const { user } = useUserContext();
    const [subscription] = useState(user.subscription);
    const [plan] = useState(subscription?.subscriptionPlan);
    const [action, setAction] = useState({ name: '', filename: '' });

    const handleSignOut = useCallback(() => {
        localStorage.removeItem('token');
        navigate('/login');
    }, [localStorage]);

    const handleGoToScreener = useCallback(() => {
        navigate('/main');
    }, [localStorage]);

    const handlePayment = () => {
        const filename = `../public/images/${plan.id}_${plan.price}_payment.png`;
        setAction({
            name: 'payment',
            filename: filename
        })
    }

    const getNextPayDate = useCallback((subscription) => {
        const status = subscription.status;
        if (status === 'ACTIVE') {
            return (
                <p className='plan-state'>
                    <span>Следующая оплата: </span>
                    <span>
                        {" " + getDateTime(subscription.expiresAt)}
                    </span>
                </p>
            )
        } else return (<></>)
    }, []);

    const getUserEmail = useCallback((user) => {
        const email = user.email;
        const parts = email.split("@");
        const username = parts[0];
        if (username.length > 5) {
            const beginning = username.substring(0, 5);
            const masked = "*".repeat(5);
            return beginning + masked + "@" + parts[1];
        }
        return email;
    }, []);

    const getActionButton = useCallback((subscription) => {
        const status = subscription.status;

        if (status === 'IDLE') {
            return (
                <>
                    <button className='black-button' onClick={handlePayment}>
                        оплатить
                    </button>
                    <button className='full-width-container text-button'>
                        выбрать другой план
                    </button>
                </>
            )
        }

        if (status === 'ACTIVE') {
            return (
                <>
                    <button className='full-width-container black-greyed-button'>
                        отменить подписку
                    </button>
                    <button className='full-width-container text-button'>
                        выбрать другой план
                    </button>
                </>
            )
        }

        if (status === 'EXPIRED') {
            return (
                <>
                    <button className='black-button'>
                        возобновить
                    </button>
                    <button className='full-width-container text-button'>
                        выбрать другой план
                    </button>
                </>
            )
        }

        if (status === 'CANCELED') {
            return (
                <button className='full-width-container black-greyed-button'>
                    оформить подписку
                </button>
            )
        }
    }, []);

    return (
        <div className="frame-container">
            <div className="frame-element-up-right" />
            <div className="frame-element-bottom-left" />
            <div className="scrollable-content menu-scroller">
                <div className="modal-layout">
                    <div className="content-container animated-box-fadeInLeft">
                        {action.name === 'payment' ? (
                            <div className='left-content-container header-footer-container' style={{ padding: '0' }}>
                                <img src={action.filename} alt="Testing payment" style={{ borderRadius: '10px' }} />
                            </div>
                        ) : (
                            <div className='two-col-container' style={{ height: '450px' }}>
                                <div className="left-content-container header-footer-container">
                                    <div className='profile-data'>
                                        <div className='profile-header'>
                                            <div className='profile-image'>
                                                <span className="material-symbols-outlined large-icon">
                                                    person
                                                </span>
                                            </div>
                                            <div className='profile-quick-info'>
                                                <p className='account-email'> {getUserEmail(user)} </p>
                                                <span className='highlighted-text'> обычный пользователь </span>
                                            </div>
                                        </div>
                                        <div className='profile-field'>
                                            {user.firstname}
                                        </div>
                                        <div className='profile-field'>
                                            {user.lastname}
                                        </div>
                                        {user.enabled ? (
                                            <span className='green-highlighted-text'> Аккаунт подтвержден </span>
                                        ) : (
                                            <span className='red-highlighted-text'> Требуется подтверждение почты! </span>
                                        )}
                                    </div>
                                </div>
                                <div className="plan-container header-footer-container">
                                    {
                                        subscription === null ? (
                                            <>
                                                <div className='plan-inner-container'>
                                                    <h5 className='login-title multi-el-header-item' style={{justifyContent: 'center'}}>
                                                        У вас нет подписки
                                                        <span className="material-symbols-outlined med-bold-icon" style={{color: '#a12000'}}>
                                                            warning
                                                        </span>
                                                    </h5>
                                                    <div className='full-width-container'>
                                                        <p className='plan-state'>
                                                            Оформите подписку, чтобы пользоваться скринером! Вам будут доступны премиум функции:
                                                        </p>
                                                        <p></p>
                                                        <ul className='dotted-list'>
                                                            <li> скринер всех монет на рынке </li>
                                                            <li> spot & futures </li>
                                                            <li> статистика ОИ </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                                <div className='plan-inner-container' style={{ justifyContent: 'end' }}>
                                                    <button className='black-button'>
                                                        Перейти к планам
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className='plan-inner-container'>
                                                    <h5 className='login-title'>
                                                        {plan.name.includes('Бесплатный') ? 'Установлен' : 'Установлена'}
                                                        {' ' + plan.name.toLowerCase()}
                                                    </h5>
                                                    <div className='full-width-container'>
                                                        <ul className='dotted-list'>
                                                            <li> скринер всех монет на рынке </li>
                                                            <li> spot & futures </li>
                                                            <li> статистика ОИ </li>
                                                        </ul>
                                                        <div className='full-width-container plan-state-container'>
                                                            {getNextPayDate(subscription)}
                                                            <p className='plan-state'>
                                                                <span>{"Статус подписки: "}</span>
                                                                {getSubscriptionStatus(subscription)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className='plan-inner-container' style={{ justifyContent: 'end' }}>
                                                    <div className='full-width-container plan-price-container'>
                                                        <span className='plan-price-big'>
                                                            ${plan.price + ' '}
                                                            <span className='plan-duration'>
                                                                / {getRenewRate(plan)}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {getActionButton(subscription)}
                                                </div>
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='rel-top-left-container account-header'>
                        {subscription != undefined && subscription.status === 'ACTIVE' ? (
                            <button className='large-button open-screener-button multi-el-header-item a-header-item' onClick={handleGoToScreener}>
                                <span className="material-symbols-outlined bold-icon">
                                    keyboard_double_arrow_left
                                </span>
                                Перейти к скринеру
                            </button>
                        ) : (
                            <></>
                        )}
                        <button className='profile-window-button multi-el-header-item greyed-button a-header-item' onClick={handleSignOut}>
                            <span className="material-symbols-outlined header-google-icon-item">
                                logout
                            </span>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

Account.displayName = 'Account';
export default Account;