import React from 'react'
import { useState, useEffect } from 'react'
import OrderBookBox from './OrderBookBox'
import MarketHeader from './MarketHeader'
import './OrderBook.css'

const OrderBook = ({ connectedTickers, onClose }) => {
    const [selectedTickers, setSelectedTickers] = useState([]);

    useEffect(() => {
        setSelectedTickers(connectedTickers);
    }, [connectedTickers]);

    return (
        <div className='order-book-container'>
            <div className='order-book'>
                {selectedTickers.map((symbol, index) => (
                    <div className='order-book-cup' key={index}>
                        <MarketHeader ticker={symbol} onClose={onClose}/>
                        <OrderBookBox ticker={symbol} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderBook