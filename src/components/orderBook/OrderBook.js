import React from 'react'
import { useState, useEffect } from 'react'
import OrderBookBox from './OrderBookBox'
import './/OrderBook.css'

const OrderBook = () => {

    const tickers = ["BTCUSDT", "BNXUSDT", "ETHUSDT", "AVAXUSDT", "TRXUSDT"];

    return (
        <>
            <div className='order-book__container'>
                {tickers.map((symbol, index) => (
                    <div className='order-book' key={index}>
                        <OrderBookBox symbol={symbol}/>
                    </div>  
                ))}
            </div>
        </>
    )
}

export default OrderBook