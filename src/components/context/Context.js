import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_TICKERS, DEFAULT_MARKET_TICKERS, DEFAULT_SETTINGS, DEFAULT_SETTINGS_MAP } from "../../utils/Utils";

const TOKEN_CACHE_ID = 'screener-auth-token';
const SELECTED_TICKERS_CACHE_ID = 'screener-selectedTickers';
const MARKET_TICKERS_CACHE_ID = 'screener-marketTickers';
const SETTINGS_CACHE_ID = 'screener-settings';

export const ScreenerContext = createContext(undefined);

export const CacheProvider = ({ children }) => {
    const [selectedTickers, updateSelectedTickers] = useState(DEFAULT_TICKERS);
    const [marketTickers, updateMarketTickers] = useState(DEFAULT_MARKET_TICKERS);
    const [settingsMap, updateSettingsMap] = useState(DEFAULT_SETTINGS_MAP);
    const [isDollar, setIsDollar] = useState(false);

    useEffect(() => {
        const initialTickers = getSelectedTickers() || DEFAULT_TICKERS;
        console.log('initialTickers are: ', initialTickers);
        updateSelectedTickers(initialTickers);

        const initialMarketTickers = getMarketTickers() || DEFAULT_MARKET_TICKERS;
        updateMarketTickers(initialMarketTickers);

        const initialSettnings = getSettingsMap() || DEFAULT_SETTINGS_MAP;
        updateSettingsMap(initialSettnings);
    }, []);

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

    // following getters retrieve values from a localstorage, but if they are not present, then they return undefined

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
        if (map.size > 0) return map;
        else return undefined;
    }

    return (
        <ScreenerContext.Provider value={{ 
            selectedTickers, setSelectedTickers, 
            marketTickers, setMarketTickers, 
            settingsMap, setSettingsMap, getSettings, setSettings
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
        selectedTickers, setSelectedTickers, 
        marketTickers, setMarketTickers,
        settingsMap, setSettingsMap, getSettings, setSettings
    } = context;

    if (selectedTickers === undefined || marketTickers === undefined || settingsMap === undefined) {
        throw new Error("context variables have not beed initialized yet.");
    }

    return {
        selectedTickers, setSelectedTickers, 
        marketTickers, setMarketTickers, 
        settingsMap, setSettingsMap, getSettings, setSettings
    };
}