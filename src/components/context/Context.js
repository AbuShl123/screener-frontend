import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_TICKERS, DEFAULT_MARKET_TICKERS, DEFAULT_SETTINGS, DEFAULT_SETTINGS_MAP, SPOT_SIGN, FUT_SIGN } from "../../utils/Utils";
import api from '../../api/AxiosConfig'

const TOKEN_CACHE_ID = 'screener-auth-token';
const SELECTED_TICKERS_CACHE_ID = 'screener-selectedTickers';
const MARKET_TICKERS_CACHE_ID = 'screener-marketTickers';
const SETTINGS_CACHE_ID = 'screener-settings';
const IS_DOLLAR_CACHE_ID = 'screener-is-dollar';

export const ScreenerContext = createContext(undefined);

export const CacheProvider = ({ children }) => {
    const [token, updateToken] = useState('');
    const [selectedTickers, updateSelectedTickers] = useState(DEFAULT_TICKERS);
    const [marketTickers, updateMarketTickers] = useState(DEFAULT_MARKET_TICKERS);
    const [settingsMap, updateSettingsMap] = useState(DEFAULT_SETTINGS_MAP);
    const [isDollar, updateIsDollar] = useState(true);
    const [allTickers, updateAllTickers] = useState([]);
    const [tickerProps, updateTickerProps] = useState(new Map());

    useEffect(() => {
        const initialTickers = getSelectedTickers() || DEFAULT_TICKERS;
        updateSelectedTickers(initialTickers);

        const initialMarketTickers = getMarketTickers() || DEFAULT_MARKET_TICKERS;
        updateMarketTickers(initialMarketTickers);

        const initialSettnings = getSettingsMap() || DEFAULT_SETTINGS_MAP;
        updateSettingsMap(initialSettnings);

        const initialToken = getToken() || '';
        updateToken(initialToken);

        let isDollar = getIsDollar();
        const initialIsDollar = isDollar === undefined ? true : isDollar;
        updateIsDollar(initialIsDollar);

        const setAllTickersAndProps = async () => {
            const { fetchedTickers, fetchedProps } = await getAllTickersAndProps();
            updateAllTickers(fetchedTickers);
            updateTickerProps(fetchedProps);
        }

        setAllTickersAndProps();
    }, []);

    function setIsDollar(value) {
        updateIsDollar(value);
        localStorage.setItem(IS_DOLLAR_CACHE_ID, value);
    }

    function setToken(value) {
        updateToken(value);
        localStorage.setItem(TOKEN_CACHE_ID, value);
    }

    function setSelectedTickers(value) {
        updateSelectedTickers(value);
        localStorage.setItem(SELECTED_TICKERS_CACHE_ID , JSON.stringify(value));
    }

    function setMarketTickers(value) {
        updateMarketTickers(value);
        localStorage.setItem(MARKET_TICKERS_CACHE_ID, JSON.stringify(value));
    }

    function setSettingsMap(value) {
        updateSettingsMap(value);
        localStorage.setItem(SETTINGS_CACHE_ID, JSON.stringify(Array.from(value)));
    }

    function setSettings(ticker, newSetting) {
        let newSettingsMap = new Map(settingsMap);
        newSettingsMap.set(ticker, newSetting);
        setSettingsMap(newSettingsMap);
    }

    function getSettings(ticker) {
        let setting = settingsMap.get(ticker);
        if (setting === undefined) return DEFAULT_SETTINGS;
        return setting;
    }

    async function getAllTickersAndProps() {
        const token = getToken();
        console.log("token is here: ", token);
        let fetchedTickers = [];
        let fetchedProps = new Map();

        await api.get('/tickers', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(response => {
                fetchedTickers = response.data.map(t => t.symbol);
                response.data.forEach(item => {
                    let symbol = item.symbol;
                    let hasSpot = item.hasSpot;
                    let hasFut = item.hasFut;
                    fetchedProps.set(symbol, { hasSpot, hasFut });
                });
            })
            .catch(error => {
                console.error('Error fetching tickers:', error);
            });

        return {fetchedTickers, fetchedProps}
    }

    // following getters retrieve values from a localstorage, but if they are not present, then they return undefined

    function getToken() {
        let token = localStorage.getItem(TOKEN_CACHE_ID);
        if (token === 'undefined') return undefined;
        return token;
    }

    function getIsDollar() {
        let rawValue = localStorage.getItem(IS_DOLLAR_CACHE_ID);
        if (rawValue === 'undefined') return undefined;
        return rawValue === 'true';
    }

    function getSelectedTickers() {
        let rawValue = localStorage.getItem(SELECTED_TICKERS_CACHE_ID);
        if (rawValue !== "undefined") {
            return JSON.parse(rawValue);
        } else {
            return undefined;
        };
    }
    
    function getMarketTickers() {
        let rawValue = localStorage.getItem(MARKET_TICKERS_CACHE_ID);
        if (rawValue !== "undefined") {
            return JSON.parse(rawValue);
        } else {
            return undefined;
        }
    }

    function getSettingsMap() {
        let rawValue = localStorage.getItem(SETTINGS_CACHE_ID);
        if (rawValue === 'undefined') return undefined;

        let map = new Map(JSON.parse(localStorage.getItem(SETTINGS_CACHE_ID)));
        if (map.size === 0) return undefined;

        const selectedTickers = getSelectedTickers();
        if (selectedTickers === undefined) return map;

        for (const ticker of selectedTickers) {
            if (!map.has(ticker + SPOT_SIGN)) {
                map.set(ticker + SPOT_SIGN, DEFAULT_SETTINGS);
            }
            if (!map.has(ticker + FUT_SIGN)) {
                map.set(ticker + FUT_SIGN, DEFAULT_SETTINGS);
            }
        }
        return map;
    }

    return (
        <ScreenerContext.Provider value={{ 
            token, setToken,
            allTickers, tickerProps,
            selectedTickers, setSelectedTickers, 
            marketTickers, setMarketTickers, 
            settingsMap, setSettingsMap, getSettings, setSettings,
            isDollar, setIsDollar
        }}>
            {children}
        </ScreenerContext.Provider>
    )
}

export function useCacheContext() {
    const context = useContext(ScreenerContext);

    if (!context) {
        throw new Error("useCacheContext must be used within a CacheProvider.");
    }

    const { 
        token, setToken,
        allTickers, tickerProps,
        selectedTickers, setSelectedTickers, 
        marketTickers, setMarketTickers,
        settingsMap, setSettingsMap, getSettings, setSettings,
        isDollar, setIsDollar
    } = context;

    if (selectedTickers === undefined || marketTickers === undefined || settingsMap === undefined) {
        throw new Error("context variables have not beed initialized yet.");
    }

    return {
        token, setToken,
        allTickers, tickerProps,
        selectedTickers, setSelectedTickers, 
        marketTickers, setMarketTickers, 
        settingsMap, setSettingsMap, getSettings, setSettings,
        isDollar, setIsDollar
    };
}