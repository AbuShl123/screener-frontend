import React from 'react'
import { useState, useEffect } from 'react'

const OrderBookHeader = ({symbol, onDollar, onRange}) => {
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    const [range, setRange] = useState();
    const [isDollar, setDollar] = useState(false);

    const toggleSettings = () => {
        setIsSettingsVisible((prevState) => !prevState);
        console.log("Setting is ", !isSettingsVisible)
    };

    const checkDollar = () => {
        setDollar((prevState) => !prevState);
        console.log('Dollar is ', !isDollar);
        onDollar(!isDollar);
    }

    return (
        <div className='ob__header'>

            <span className="material-symbols-outlined dollar-icon" onClick={checkDollar}>
                {isDollar ? "attach_money" : "money_off"}
            </span>

            <span className='ob__symbol-name'>
                <div>{symbol.toUpperCase()}</div>
            </span>

            <div className='dollar-container'> 
                <span className="material-symbols-outlined settings-icon" onClick={toggleSettings}>
                        Settings
                </span>
                {isSettingsVisible && (
                    <div className='settings-popup'>
                        <div className='settings-header-title'> 
                            <span>%</span>
                        </div>
                        <form className='settings-form'
                            onSubmit = {(e) => {
                                e.preventDefault();
                                onRange(range);
                            }}
                        >
            
                            <input className='settings-input'
                                type="text"
                                value={range}
                                placeholder="range %"
                                onChange={(e) => setRange(e.target.value)}
                            />
                            
                        </form>
                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderBookHeader;