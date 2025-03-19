import { createContext, useContext, useEffect, useState } from "react";
import apiService from "../../api/ApiService.js";
import useCacheContext from './Context.js'
import cache from "../../utils/CacheUtils.js";

export const APIContext = createContext(undefined);

export const ApiProvider = ({children}) => {
    const [orderBookEvent, setOrderBookEvent] = useState(null);
    const [openInterestEvent, setOpenInterestEvent] = useState([]);
    const [maxOrdersUpdate, setMaxOrdersUpdate] = useState(null);
    const {token, marketTickers} = useCacheContext();
    
    useEffect(() => {
        const token = cache.getToken();
        const handleOpenInterestUpdates = (event) => setOpenInterestEvent(event);
        apiService.createOIConnection(handleOpenInterestUpdates, token);

        const handleMaxOrdersUpdates = (event) => setMaxOrdersUpdate(event);
        const fetchMaxOrders = async () => apiService.fetchMaxOrders(handleMaxOrdersUpdates, token);
        fetchMaxOrders();
        const interval = setInterval(fetchMaxOrders, 10_000);

        return () => {
            apiService.closeOBConnection();
            apiService.closeOIConnection();
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        apiService.closeOBConnection();
        if (!marketTickers || !Array.isArray(marketTickers)) return;
        if (marketTickers.length === 0) return;
    
        const handleOrderBookUpdates = (event) => {
            const { symbol, b: bidsData, a: asksData } = event;
            setOrderBookEvent({symbol, bidsData, asksData});
        };
        apiService.createOBConnection(marketTickers, handleOrderBookUpdates, token);
    }, [marketTickers]);

    return (
        <APIContext.Provider value={{orderBookEvent, openInterestEvent, maxOrdersUpdate}}>
            {children}
        </APIContext.Provider>
    )
}

export default function useApiContext() {
    const context = useContext(APIContext);

    if (!context) {
        throw new Error("useApiContext must be used within an ApiProvider.");
    }

    return context;
}