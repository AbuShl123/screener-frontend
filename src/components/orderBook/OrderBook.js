import { useCallback, useEffect, useState } from 'react'
import './OrderBook.css'
import OrderBookBox from './OrderBookBox'
import useApiContext from '../context/ApiContext'
import useCacheContext from '../context/Context'
import { getQty } from './OBUtils'

const OrderBook = () => {

     // listening to orderbook events
    const {orderBookEvent} = useApiContext();

    const [askSnapshot, setAskSnapshot] = useState(new Map());
    const [bidSnapshot, setBidSnapshot] = useState(new Map());

    // to add notifications  
    const {addNotification, isDollar} = useCacheContext();

    useEffect(() => {
        if (!orderBookEvent) return;

        const bidMap = new Map();
        const askMap = new Map();

        for (const event of orderBookEvent) {
            const mSymbol = event.s;
            
            const newBids = checkNotifications(mSymbol, event.b, bidSnapshot, false);
            const newAsks = checkNotifications(mSymbol, event.a, askSnapshot, true);

            if (newBids.size != 0) bidMap.set(mSymbol, newBids);
            if (newAsks.size != 0) askMap.set(mSymbol, newAsks);
        }

        setAskSnapshot(askMap);
        setBidSnapshot(bidMap);
    }, [orderBookEvent]);

    const checkNotifications = useCallback((mSymbol, trades, pastSnapshot, isAsk) => {
        // bid/ask -> [price, quantity, incline, level, timestamp]
        let tradeMap = new Map();

        for (const trade of trades) {
            const level = trade[3];
            if (level < 1) continue;

            const price = trade[0];
            tradeMap.set(price, level);

            let isRecent = Date.now() - trade[4] <= 5_000;
            if (!isRecent) continue;

            if (!pastSnapshot.has(mSymbol)) {
                sendToNotification(mSymbol, trade, isAsk);
                continue;
            }

            const pastTradesMap = pastSnapshot.get(mSymbol);
            if (!pastTradesMap.has(price)) {
                sendToNotification(mSymbol, trade, isAsk);
                continue;
            }

            const previousLevel = pastTradesMap.get(price);
            if (previousLevel < level) {
                sendToNotification(mSymbol, trade, isAsk);
                continue;
            }
        }

        return tradeMap;
    }, [])

    const sendToNotification = useCallback((mSymbol, trade, isAsk) => {
        addNotification({
            ticker: mSymbol,
            price: trade[0],
            qty: getQty(trade[0], trade[1], isDollar),
            distance: trade[2],
            level: trade[3],
            isAsk: isAsk,
            life: trade[4],
        });
    }, [])

    return (
        <div className='order-book-container'>
            <div className='order-book'>
                {orderBookEvent && orderBookEvent.map((event) => (
                    <div className='order-book-cup' key={event.s}>
                        <OrderBookBox ticker={event.s} bids={event.b} asks={event.a} />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderBook