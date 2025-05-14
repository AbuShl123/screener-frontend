import React, { useCallback } from "react";
import { getCurrentDate } from "../../utils/Utils";

const PriceChangeNotification = ({notif}) => {

    const getSymbol = useCallback((notif) => {
        if (!notif.s) return 'unknown';
        return (notif.s.replace("usdt", '') + "/" + 'usdt').toUpperCase();
    }, []);

    const getPriceChange = useCallback((notif) => {
        let change = Math.abs(notif.d);
        if (notif.d > 0) {
            return (
                <span className="icon-text-container" style={{color: 'rgb(143 249 143)'}}>
                    <span className="material-symbols-outlined small-icon" style={{marginRight: '0px'}}>
                        stat_2
                    </span>
                    <span>{change}%</span>
                </span>
            )
        } else {
            return (
                <span className="icon-text-container" style={{color: 'rgb(255 66 66)'}}>
                    <span className="material-symbols-outlined small-icon" style={{marginRight: '0px'}}>
                        stat_minus_2
                    </span>
                    <span>{change}%</span>
                </span>
            )
        }
    }, []);
    
    return (
        <>
            <div className="multi-el-header-item notification-line">
                {getSymbol(notif)} 
                {getPriceChange(notif)}
            </div>
            <div className="notification-line notification-time-container">
                <div className="notification-fact">
                    <p>Нынешняя цена:</p>
                    <p>{notif.p}</p>
                </div>
                <div className="notification-time">
                    {getCurrentDate()}
                </div>
            </div>
        </>
    )
}

export default PriceChangeNotification;