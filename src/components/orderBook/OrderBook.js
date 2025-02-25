import React, { useEffect, useState, useRef } from 'react'
import './OrderBook.css'
import OrderBookBox from './OrderBookBox'
import useCacheContext from '../context/Context'
import useApiContext from '../context/ApiContext'
import { SPOT_SIGN, FUT_SIGN } from '../../utils/Utils'

function areArraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    const sortedArr1 = arr1.slice().sort();
    const sortedArr2 = arr2.slice().sort();
    return sortedArr1.every((value, index) => value === sortedArr2[index]);   
}

function union(arr1, arr2) {
    return [...new Set([...arr1, ...arr2])];
}

function checkDensity(trade, settings, tickerProps) {
    if (!settings || !tickerProps) return false;
    
    let level3 = settings.level3;
    if (level3 === -1) return trade.density === 3;

    let isDollar = settings.isDollar;
    let symbol = trade.symbol;
    let maxBidQty = trade.maxBidQty;
    let maxAskQty = trade.maxAskQty;

    if (isDollar) {
        let props = tickerProps.get(symbol);
        if (!props) return false;
        let price = tickerProps.get(symbol).price;
        maxBidQty = maxBidQty * price;
        maxAskQty = maxAskQty * price;
    }

    return maxBidQty > level3 || maxAskQty > level3;
}

function getPrioritizedTickers(severityMap) {
    return [...severityMap].sort((a, b) => b[1] - a[1]).map(e => e[0]);
}

const OrderBook = () => {
    const {setMarketTickers, getSettings, tickerProps} = useCacheContext();
    const {maxOrdersUpdate} = useApiContext();
    const [maxTickers, setMaxTickers] = useState([]);
    const [severityMap, setSeverityMap] = useState(new Map());

    useEffect(() => {
        if (!maxTickers || !Array.isArray([...maxTickers]) || maxTickers.length === 0) return;
        console.log('Updated market tickers: ', maxTickers);
        let newSeverityMap = new Map();
        maxTickers.forEach(ticker => {
            newSeverityMap.set(ticker, severityMap.get(ticker) || 0);
        })
        setSeverityMap(newSeverityMap);
        setMarketTickers(maxTickers);
    }, [maxTickers]);

    useEffect(() => {
        if (!maxOrdersUpdate) return;
        const maxSymbols = maxOrdersUpdate.filter(item => {
            let marketSymbol = item.symbol.endsWith(FUT_SIGN) ? item.symbol : item.symbol + SPOT_SIGN;
            let settings = getSettings(marketSymbol);
            return checkDensity(item, settings, tickerProps);
        }).map(item => item.symbol.endsWith(FUT_SIGN) ? item.symbol : item.symbol + SPOT_SIGN);

        if (!areArraysEqual(maxTickers, maxSymbols)) {
            setMaxTickers(maxSymbols);
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
        <div className='order-book-container menu-scroller'>
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