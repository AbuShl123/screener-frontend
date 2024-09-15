import React from 'react'
import { useState, useEffect } from 'react'
import OrderBookBox from './OrderBookBox'
import Settings from './Settings'
import './/OrderBook.css'

const OrderBook = () => {

    const [formData, setFormData] = useState({
        ticker: '',
        size: '',
        range: ''
    })

    const hadnleSettingsInput = (ticker, size, range) => {
        setFormData({
            ticker: ticker, 
            size: size, 
            range: range
        })
    }

    const getTicker = () => {
        return formData.ticker ? formData.ticker : "BTCUSDT";
    }

    const getSize = () => {
        return formData.size ? formData.size : "10";
    }

    const getRange = () => {
        return formData.range ? formData.range : "10";
    }

    return (
        <div className='order-book__container'>
            <div className='order-book'>
                <OrderBookBox symbol={getTicker()} size={getSize()} range={getRange()}/>
                <Settings onSubmit={hadnleSettingsInput}/>
            </div>            
        </div>
    )
}

export default OrderBook