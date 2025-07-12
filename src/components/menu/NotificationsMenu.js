import React, { useCallback } from 'react'
import useCacheContext from '../context/Context';
import Menu from './Menu';
import DensityNotification from './DensityNotification';
import PriceChangeNotification from './PriceChangeNotification';

const NotificationsMenu = ({ activeMenu }) => {

    const { notifications, isDollar } = useCacheContext();

    const getNotifLevel = useCallback((data) => {
        return 'notif-level-' + (data.level ? data.level : 'pricechange');
    }, []);

    return (
        <>
            <div className='menu-container' style={{ 'display': activeMenu !== Menu.notifications ? 'none' : '' }}>
                <div className='menu-title'>
                    Уведомления
                </div>
                <div className='menu-notification-container menu-scroller'>
                    {notifications.map((data, index) => (
                        data.n ? (
                            <div className={'notification-container ' + getNotifLevel(data)} key={index}>
                                <PriceChangeNotification notif={data}/>
                            </div>
                        ) : (
                            <div className={'notification-container ' + getNotifLevel(data)} key={index}>
                                <DensityNotification data={data} isDollar={isDollar} />
                            </div>
                        )
                    ))}
                </div>
            </div>
        </>
    )
}

export default NotificationsMenu;

