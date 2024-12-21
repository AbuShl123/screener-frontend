import React from 'react'
import { useState } from 'react'

const OrderBookHeader = ({ ticker, onDollar, onSettings }) => {
    const SPOT_SIGN = '.p';
    const FUT_SIGN = '.f';

    const symbolText = ticker.replace(SPOT_SIGN, "").replace(FUT_SIGN, "");
    const symbol = ticker.replace(SPOT_SIGN, "");

    const [isSettings, setIsSettings] = useState(false);
    const [isDollar, setDollar] = useState(false);

    const toggleSettings = () => {
        setIsSettings((prevState) => !prevState);
        onSettings(!isSettings);
    }

    const checkDollar = () => {
        setDollar((prevState) => !prevState);
        onDollar(!isDollar);
    }

    return (
        <div className='ob__header'>
            <span className="material-symbols-outlined dollar-icon" onClick={checkDollar}>
                {isDollar ? "attach_money" : "money_off"}
            </span>

            <span className='ob__symbol-name'>
                <div>{symbolText.toUpperCase()}</div>
            </span>

            <div className='dollar-container'>
                <span className="material-symbols-outlined settings-icon" id={`setting_icon_${symbol}`} onClick={toggleSettings}>
                    Settings
                </span>
            </div>
        </div>
    )
}

export default OrderBookHeader;