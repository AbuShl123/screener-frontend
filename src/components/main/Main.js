import React from 'react'
import { useState } from 'react'
import './Main.css'
import Header from '../header/Header'
import TickersMenu from '../menu/TickersMenu'
import OrderBook from '../orderBook/OrderBook'

const Main = () => {
    const [tickers, setTickers] = useState([]);
    const [tickerToDelete, setTickerToDelete] = useState("");
    
    const handleClose = (ticker) => {
        setTickerToDelete(ticker);
    }

    const handleDeletionCompleted = () => {
        setTickerToDelete("");
    }

    return (
        <div className='main'>
            <div className='content-left'>
                <Header />
                <OrderBook connectedTickers={tickers} onClose={handleClose} />
            </div>
            <TickersMenu onTickersUpdate={setTickers} deleteTicker={tickerToDelete} deleteionCompleted={handleDeletionCompleted}/>
        </div>
    )
}

export default Main