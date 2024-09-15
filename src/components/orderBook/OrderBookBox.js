import React from 'react'
import { useState, useEffect } from 'react'
import useWebSocket from 'react-use-websocket'

const OrderBookBox = ({symbol, size, range}) => {
    const [bids, setBids] = useState([]);
    const [asks, setAsks] = useState([]);

    const WS_URL = `ws://localhost:8080/orderbook/${symbol.toLowerCase()}?dataSize=${size}&priceSpan=${range}`;

    console.log(WS_URL)

    const {lastJsonMessage} = useWebSocket(WS_URL, {
        shouldReconnect: () => true,
        onError: (error) => console.error('WebSocket Error: ', error),
    });

    useEffect(() => {
        if (lastJsonMessage) {
            const { b: bidsData } = lastJsonMessage;
            setBids(bidsData);
            console.log("recevied bids data: " + bidsData)
        }
    }, [lastJsonMessage]);

    const formatNumber = (number) => {
        const prasedNumber = parseFloat(number);
        return prasedNumber.toFixed(2);
    }
    
    return (
        <div className='ob__container'>
            <span className='ob__symbol-name'><div>{symbol.toUpperCase()}</div></span>
            <div className='ob__data-container'>
                {bids.map((data, index) => (
                    <div className="ob__each-data" key={index}>
                        <span className='ob__quantity-data'> {formatNumber(data[1])} </span>
                        <div className='ob__price-data'>
                            <span className='ob__data order-price'> {formatNumber(data[0])} </span>
                            <span className='ob__data'> {formatNumber(data[2])}% </span>
                        </div>                        
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderBookBox;