import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, FUT_SIGN } from "../../utils/Utils";
import api from '../../api/AxiosConfig'

const TOKEN_CACHE_ID = 'screener-auth-token';
const SELECTED_TICKERS_CACHE_ID = 'screener-selectedTickers';
const MARKET_TICKERS_CACHE_ID = 'screener-marketTickers';
const SETTINGS_CACHE_ID = 'screener-settings';
const IS_DOLLAR_CACHE_ID = 'screener-is-dollar';
const IS_VOICE_ON_CACHE_ID = 'screener-isVoiceOn';

export const ScreenerContext = createContext(undefined);

export const CacheProvider = ({ children }) => {
    const [token, updateToken] = useState('');
    const [selectedTickers, updateSelectedTickers] = useState([]);
    const [marketTickers, updateMarketTickers] = useState([]);
    const [settingsMap, updateSettingsMap] = useState(null);
    const [isDollar, updateIsDollar] = useState(true);
    const [isVoiceOn, updateIsVoiceOn] = useState(true);
    const [tickers, updateTickers] = useState(new Map());
    const [notifications, setNotifications] = useState([]);
    const [processedNotifications, setProcessedNotifications] = useState([]);

    useEffect(() => {
        const initialTickers = [];
        updateSelectedTickers(initialTickers);

        const initialMarketTickers = [];
        updateMarketTickers(initialMarketTickers);

        const initialSettnings = getSettingsMap() || new Map();
        updateSettingsMap(initialSettnings);

        const initialToken = getToken() || '';
        updateToken(initialToken);

        let isDollar = getIsDollar();
        updateIsDollar(isDollar === undefined ? true : isDollar);

        let isVoiceOn = getIsVoiceOn();
        updateIsVoiceOn(isVoiceOn === undefined ? true : isVoiceOn);

        const setTickers = async () => {
            const fetchedTickers = await getTickers();
            updateTickers(fetchedTickers);
        }

        setTickers();
    }, []);

    function setIsDollar(value) {
        updateIsDollar(value);
        localStorage.setItem(IS_DOLLAR_CACHE_ID, value);
    }

    function setIsVoiceOn(value) {
        updateIsVoiceOn(value);
        localStorage.setItem(IS_VOICE_ON_CACHE_ID, value);
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
        updateSettingsMap(prevMap => {
            const newSettingsMap = new Map(prevMap); 
            newSettingsMap.set(ticker, newSetting); 
    
            localStorage.setItem(SETTINGS_CACHE_ID, JSON.stringify(Array.from(newSettingsMap)));
    
            return newSettingsMap;
        });
    }

    function getSettings(ticker) {
        let setting = settingsMap.get(ticker);
        if (setting === undefined) return DEFAULT_SETTINGS;
        return setting;
    }

    async function getTickers() {
        const token = getToken();
        let fetchedTickers = new Map();

        await api.get('/tickers', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        .then(response => {
            response.data.forEach(item => {
                fetchedTickers.set(item.symbol, parseFloat(item.price));
            });
        })
        .catch(error => {
            console.error('Error fetching tickers:', error);
        });

        return fetchedTickers;
    }

    // following getters retrieve values from a localstorage, but if they are not present, then they return undefined

    function getToken() {
        let token = localStorage.getItem(TOKEN_CACHE_ID);
        if (!token || token === 'undefined') return undefined;
        return token;
    }

    function getIsDollar() {
        let rawValue = localStorage.getItem(IS_DOLLAR_CACHE_ID);
        if (!rawValue || rawValue === 'undefined') return undefined;
        return rawValue === 'true';
    }

    function getIsVoiceOn() {
        let rawValue = localStorage.getItem(IS_VOICE_ON_CACHE_ID);
        if (!rawValue || rawValue === 'undefined') return undefined;
        return rawValue === 'true';
    }

    function getSelectedTickers() {
        let rawValue = localStorage.getItem(SELECTED_TICKERS_CACHE_ID);
        if (rawValue && rawValue !== "undefined") {
            return JSON.parse(rawValue);
        } else {
            return undefined;
        };
    }
    
    function getMarketTickers() {
        let rawValue = localStorage.getItem(MARKET_TICKERS_CACHE_ID);
        if (rawValue && rawValue !== "undefined") {
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
            if (!map.has(ticker)) {
                map.set(ticker, DEFAULT_SETTINGS);
            }
            if (!map.has(ticker + FUT_SIGN)) {
                map.set(ticker + FUT_SIGN, DEFAULT_SETTINGS);
            }
        }
        return map;
    }

    function addNotification(message) {
        setNotifications((prev) => {
            let notifs = [message, ...prev];
    
            if (notifs.length > 40) {
                notifs = notifs.slice(0, 40);
            }
    
            return notifs;
        });
    };

    return (
        <ScreenerContext.Provider value={{ 
            token, setToken,
            tickers,
            selectedTickers, setSelectedTickers, 
            marketTickers, setMarketTickers, 
            settingsMap, setSettingsMap, getSettings, setSettings,
            isDollar, setIsDollar,
            isVoiceOn, setIsVoiceOn,
            notifications, addNotification,
            processedNotifications, setProcessedNotifications
        }}>
            {children}
        </ScreenerContext.Provider>
    )
}

export default function useCacheContext() {
    const context = useContext(ScreenerContext);

    if (!context) {
        throw new Error("useCacheContext must be used within a CacheProvider.");
    }


    return context;
}