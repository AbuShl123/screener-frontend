import { createContext, useContext, useEffect, useState } from "react";
import cache from "../../utils/CacheUtils";
import apiService from "../../api/ApiService";
import LoadingCard from "../cards/LoadingCard";
import ErrorCard from "../cards/ErrorCard";


export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {

    const [token] = useState(cache.getToken());
    const [user, setUser] = useState({});
    const [subscriptionPlans, setSubscriptionPlans] = useState({});
    const [appState, setAppState] = useState({isLoading: true, error: undefined});

    useEffect(() => {
        const fetchSubscriptionPlans = async () => setPlanData();
        fetchSubscriptionPlans();
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => setUserData();
        fetchUserInfo();
    }, [token]);

    async function setUserData() {
        const response = await apiService.fetchUserInfo(token);
        if (response && response.status === 200) {
            setUser(response.data);
            setAppState(prev => ({
                ...prev,
                isLoading: false,
                error: undefined,
            }));
        } else {
            setAppState(prev => ({
                ...prev,
                isLoading: false,
                error: 'Что-то пошло не так.'
            }));
        }
    }

    async function setPlanData() {
        const response = await apiService.fetchSubscriptionPlans();
        if (response && response.status === 200) {
            setSubscriptionPlans(response.data);
        }
    }

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
        <UserContext.Provider value={{ user, token, subscriptionPlans}}>
            {children}
        </UserContext.Provider>
    )
}

export default function useUserContext() {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error("useUserContext must be used within a UserProvider.");
    }

    return context;
}