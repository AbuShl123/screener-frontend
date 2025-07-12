import { createContext, useContext, useEffect, useState } from "react";
import useUserContext from "./UserContext";
import apiService from "../../api/ApiService";
import ErrorCard from "../cards/ErrorCard";
import LoadingCard from "../cards/LoadingCard";
import SortingRule from "../header/SortingRule";

const IS_DOLLAR_CACHE_ID = 'screener-is-dollar';
const IS_VOICE_ON_CACHE_ID = 'screener-isVoiceOn';
const SORTING_RULE_CACHE_ID = 'screener-sortRule';

export const ScreenerContext = createContext(undefined);

export const CacheProvider = ({ children }) => {
    const {token} = useUserContext();
    const [appState, setAppState] = useState({isLoading: true, error: undefined});

    const [sortingRule, updateSortingRule] = useState("");
    const [isDollar, updateIsDollar] = useState(true);
    const [isVoiceOn, updateIsVoiceOn] = useState(true);
    const [tickers, updateTickers] = useState(new Map());
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        let sortingRule = getSortingRule();
        updateSortingRule(sortingRule ? sortingRule : SortingRule.futThenSpot);

        let isDollar = getIsDollar();
        updateIsDollar(isDollar === undefined ? true : isDollar);

        let isVoiceOn = getIsVoiceOn();
        updateIsVoiceOn(isVoiceOn === undefined ? true : isVoiceOn);

        const fetchTickers = async () => setTickers();
        fetchTickers();
    }, []);

    async function setTickers() {
        const response = await apiService.fetchAllTickers(token);

        if (!response || response.status !== 200) {
            setAppState({
                isLoading: false,
                error: 'Что-то пошло не так.'
            });
            return;   
        }

        let fetchedTickers = new Map();
        response.data.forEach(item => {
            fetchedTickers.set(item.symbol, parseFloat(item.price));
        });
        updateTickers(fetchedTickers);

        setAppState({
            isLoading: false,
            error: undefined
        });
    }

    function setSortingRule(value) {
        updateSortingRule(value);
        localStorage.setItem(SORTING_RULE_CACHE_ID, value);
    }

    function setIsDollar(value) {
        updateIsDollar(value);
        localStorage.setItem(IS_DOLLAR_CACHE_ID, value);
    }

    function setIsVoiceOn(value) {
        updateIsVoiceOn(value);
        localStorage.setItem(IS_VOICE_ON_CACHE_ID, value);
    }

    function getSortingRule() {
        let rawValue = localStorage.getItem(SORTING_RULE_CACHE_ID);
        if (!rawValue || rawValue === 'undefined') return undefined;
        return rawValue;
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

    function addNotification(message) {
        setNotifications((prev) => {
            let notifs = [message, ...prev];
    
            if (notifs.length > 40) {
                notifs = notifs.slice(0, 40);
            }
    
            return notifs;
        });
    };

    if (appState.error) {
        return (
            <ErrorCard />
        )
    }

    if (appState.isLoading) {
        return (
            <LoadingCard />
        )
    }

    return (
        <ScreenerContext.Provider value={{ 
            tickers,
            sortingRule, setSortingRule,
            isDollar, setIsDollar,
            isVoiceOn, setIsVoiceOn,
            notifications, addNotification
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