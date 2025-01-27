import React from 'react'
import { useState } from 'react'
import useWebSocket from 'react-use-websocket'
import { SPOT_SIGN } from '../../utils/Utils'
import OrderBookBox from './OrderBookBox'
import './OrderBook.css'
import '../../index.css'
import { useCacheContext } from '../context/Context'

const OrderBook = ({ isDollar, onNotification, onClose }) => {
    const {marketTickers} = useCacheContext();

    let token = localStorage.getItem('screener-auth-token');
    let wsUrl = `ws://localhost:1105/binance/depth?token=${token}&symbols=`;
    wsUrl += [...marketTickers].map(symbol => symbol.replace(SPOT_SIGN, "")).join("/");

    const { lastJsonMessage } = useWebSocket(wsUrl, {
        shouldReconnect: () => marketTickers.length > 0,
        onOpen: () => console.log('connecting to ', wsUrl),
        onError: (error) => console.error(`OB WebSocket Error `, error)
    });

    return (
        <div className='order-book-container menu-scroller'>
            <div className='order-book'>
                {marketTickers.map((symbol, index) => (
                    <div className='order-book-cup' key={index}>
                        <OrderBookBox lastJsonMessage={lastJsonMessage} ticker={symbol} isDollar={isDollar} onNotification={onNotification} onClose={onClose} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderBook