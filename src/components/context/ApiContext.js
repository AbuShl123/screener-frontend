import { createContext, useCallback, useContext, useEffect, useState } from "react";
import apiService from "../../api/ApiService.js";
import useUserContext from "./UserContext.js";
import useCacheContext from "./Context.js";
import SortingRule from "../header/SortingRule.js";

export const APIContext = createContext(undefined);

export const ApiProvider = ({ children }) => {
    const [orderBookEvent, setOrderBookEvent] = useState([]);
    const [openInterestEvent, setOpenInterestEvent] = useState([]);
    const [settings, setSettings] = useState(new Map());
    const [settingsUpdate, setSettingsUpdate] = useState(true);
    const [gVolume, setGVolume] = useState();

    const { token } = useUserContext();
    const { sortingRule } = useCacheContext();

    useEffect(() => {
        apiService.createOBConnection((e) => handleDepthEvents(e, sortingRule), token);
        apiService.createOIConnection(setOpenInterestEvent, token);
        return () => {
            apiService.closeOBConnection();
            apiService.closeOIConnection();
        };
    }, []);

    useEffect(() => {
        fetchGVolume();
    }, [token]);

    useEffect(() => {
        fetchSettings();
        apiService.closeOBConnection();
        apiService.createOBConnection((e) => handleDepthEvents(e, sortingRule), token);
    }, [settingsUpdate]);

    useEffect(() => {
        apiService.setOBCallback((e) => handleDepthEvents(e, sortingRule));
    }, [sortingRule])

    const refreshSettings = useCallback(() => {
        setSettingsUpdate(prev => !prev);
    });

    const fetchGVolume = useCallback(async () => {
        try {
            const response = await apiService.fetchGVolume(token);
            const responseData = response.data;
            if (responseData) {
                setGVolume(responseData);
            }
        } catch (error) {
            console.error("Couldn't fetch gVolume", error);
        }
    }, [token]);

    const fetchSettings = useCallback(async () => {
        try {
            const response = await apiService.fetchCurrentSettings(token);
            const responseData = response.data;
            if (responseData?.settings && Array.isArray(responseData?.settings)) {
                const settingsMap = new Map();
                for (const settings of response.data.settings) {
                    if (settings?.msymbol != null) {
                        settingsMap.set(settings.msymbol, settings);
                    }
                }
                setSettings(settingsMap);
            }
        } catch (error) {
            console.error("Couldn't fetch user settings", error);
        }
    }, [token]);

    const handleDepthEvents = useCallback((events, sortingRule) => {
        if (sortingRule === SortingRule.alphabet) {
            events.sort((a, b) => a.s.localeCompare(b.s));
        }

        else if (sortingRule === SortingRule.levels) {
            events.sort((a, b) => {
                return getEventPriority(b) - getEventPriority(a);
            });
        }

        else if (sortingRule === SortingRule.futThenSpot) {
            events.sort((a, b) => {
                const aHasDot = a.s.includes('.');
                const bHasDot = b.s.includes('.');
                if (aHasDot && !bHasDot) return -1;     // If only one has a dot, prioritize the one with the dot
                if (!aHasDot && bHasDot) return 1;
                return a.s.localeCompare(b.s);          // If both or neither have a dot, sort lexicographically
            });
        }

        else if (sortingRule === SortingRule.spotThenFut) {
            events.sort((a, b) => {
                const aHasDot = a.s.includes('.');
                const bHasDot = b.s.includes('.');
                if (aHasDot && !bHasDot) return 1;      // If only one has a dot, prioritize the one without the dot
                if (!aHasDot && bHasDot) return -1;
                return a.s.localeCompare(b.s);          // If both or neither have a dot, sort lexicographically
            });
        }

        setOrderBookEvent(events);
    })

    const getEventPriority = useCallback((event) => {
        let priority = 0;
        for (const ask of event.a) {
            priority += getTradePriority(ask);
        }

        for (const bid of event.b) {
            priority += getTradePriority(bid);
        }
        return priority;
    }, [])

    const getTradePriority = useCallback((trade) => {
        let level = Number(trade[3]);
        switch (level) {
            case 1: return 1;
            case 2: return 11;
            case 3: return 120;
            case 4: return 1300;
            default: return 0;
        }
    }, [])

    return (
        <APIContext.Provider value={{
            orderBookEvent, openInterestEvent, 
            settings, refreshSettings, 
            gVolume, setGVolume
        }}>
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