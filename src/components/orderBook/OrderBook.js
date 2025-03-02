import React, { useEffect, useState, useRef } from 'react'
import './OrderBook.css'
import OrderBookBox from './OrderBookBox'
import useCacheContext from '../context/Context'
import useApiContext from '../context/ApiContext'
import { FUT_SIGN } from '../../utils/Utils'

const OrderBook = () => {

    // set market tickers and settings 
    const {marketTickers, setMarketTickers, getSettings} = useCacheContext();

    // update event to set max tickers
    const {maxOrdersUpdate} = useApiContext();

    // holds ticker->severity values. Determines the cup order 
    const [severityMap, setSeverityMap] = useState(new Map());

    useEffect(() => {
        if (marketTickers.length === 0) return;
        let newSeverityMap = new Map();
        marketTickers.forEach(ticker => newSeverityMap.set(ticker, severityMap.get(ticker) || 0));
        setSeverityMap(newSeverityMap);
    }, [marketTickers]);

    useEffect(() => {
        if (!maxOrdersUpdate) return;

        try {
            const maxSymbols = maxOrdersUpdate.filter(item => checkDensity(item, getSettings(item.symbol)))
                .map(item => item.symbol.endsWith(FUT_SIGN) ? item.symbol : item.symbol);
    
            if (!areArraysEqual(marketTickers, maxSymbols)) setMarketTickers(maxSymbols);

        } catch (error) {
            console.error(`couldn't process ${maxOrdersUpdate} becase `, error);
        }
        
    }, [maxOrdersUpdate]);

    const handleNewSeverity = (ticker, severity) => {
        setSeverityMap(prev => {
            const newMap = new Map(prev);
            newMap.set(ticker, severity);
            return newMap;
        })
    }

    return (
        <div className='order-book-container menu-invisible-scroller'>
            <div className='order-book'>
                {getPrioritizedTickers(severityMap).map((symbol) => (
                    <div className='order-book-cup' key={symbol}>
                        <OrderBookBox ticker={symbol} onSeverityChange={handleNewSeverity} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderBook

function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);   
}

function checkDensity(trade, settings) {
    let level3 = settings.level3;
    if (level3 === -1) return trade.density === 3;

    let isDollar = settings.isDollar;
    let maxBidQty = trade.maxBidQty;
    let maxAskQty = trade.maxAskQty;
    let price = trade.price;

    if (isDollar) {
        maxBidQty = maxBidQty * price;
        maxAskQty = maxAskQty * price;
    }

    return maxBidQty > level3 || maxAskQty > level3;
}

function getPrioritizedTickers(severityMap) {
    return [...severityMap].sort((a, b) => b[1] - a[1]).map(e => e[0]);
}