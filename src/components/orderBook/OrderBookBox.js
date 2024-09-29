import React from 'react'
import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'
import OrderBooKHeader from './OrderBookHeader'

const OrderBookBox = ({symbol}) => {
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);
    const [isDollar, setDollar] = useState(false);
    const [range, setRange] = useState(10);

    const WS_URL = `ws://localhost:8080/orderbook/${symbol.toLowerCase()}?priceSpan=${range}`;

    const {lastJsonMessage} = useWebSocket(WS_URL, {
        shouldReconnect: () => true,
        onError: (error) => console.error('WebSocket Error: ', error),
    });

    useEffect(() => {
        if (lastJsonMessage) {
            const { b: bidsData, a: asksData } = lastJsonMessage;
            setBids(bidsData);
            setAsks(asksData);
        }
    }, [lastJsonMessage]);

    const formatNumber = (number) => {
        return Math.round(number);
    }

    // data[0] = price, data[1] = quantity, data[2] = percentage
    const getData = (data) => {
        return isDollar ? "$ " + formatNumber(data[0] * data[1])
                        : formatNumber(data[1])
    }

    const handleDollar = (isDollar) => {
        setDollar(isDollar);
    }

    const handleRange = (newRange) => {
        setRange(newRange);
        console.log('Range has changed: ', newRange);
    }
    
    return (
        <div className='ob__container'>
            
            <OrderBooKHeader symbol={symbol} onDollar={handleDollar} onRange={handleRange}></OrderBooKHeader>

            <hr className='ob__line'></hr>

            <div className='ob__data-container'>
                {asks.map((data, index) => (
                    <div className="ob__each-data" key={index}>
                        <div className='ob__quantity-ask'> 
                            <span>{getData(data)}</span>
                        </div>
                        <div className='ob__price-data-box'>
                            <div className='ob__price-data'>
                                <span> {data[0]} </span>
                            </div>
                            <div className='ob__percentage-data'> 
                                <span> {data[2]}% </span>
                            </div>
                        </div>                        
                    </div>
                ))}
                <div className='ob__separator'><p></p></div>
                {bids.map((data, index) => (
                    <div className="ob__each-data" key={index}>
                        <div className='ob__quantity-bid'> 
                            <span>{getData(data)}</span>
                        </div>
                        <div className='ob__price-data-box'>
                            <div className='ob__price-data'>
                                <span> {data[0]} </span>
                            </div>
                            <div className='ob__percentage-data'> 
                                <span>{data[2]}%</span>
                            </div>
                        </div>                        
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderBookBox;