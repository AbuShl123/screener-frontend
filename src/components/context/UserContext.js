import React, { createContext, useContext, useEffect, useState } from "react";
import cache from "../../utils/CacheUtils";
import apiService from "../../api/ApiService";


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
        const delay = setTimeout(() => fetchUserInfo(), 1000);
        return () => clearTimeout(delay);
    }, [token]);

    async function setUserData() {
        const response = await apiService.fetchUserInfo(token);
        if (response && response.status === 200) {
            setUser(response.data);
            setAppState({
                isLoading: false,
                error: undefined,
            });
        } else {
            setAppState({
                isLoading: false,
                error: 'Что-то пошло не так.'
            })
        }
    }

    async function setPlanData() {
        const response = await apiService.fetchSubscriptionPlans();
        if (response && response.status === 200) {
            setSubscriptionPlans(response.data);
        }
    }

    if (appState.isLoading) {
        return (
            <div className="frame-container">
                <div className="frame-element-up-right" />
                <div className="frame-element-bottom-left" />
                <div className="modal-layout">
                    <div className='content-container animated-box-fadeInUp'>
                        <div className='dynamic-container modal-content-2'>
                            <div className="logo-title-container">
                                <span className="logo-title">
                                    clerk-screener.com
                                </span>
                            </div>
                            <div>
                                <h5 style={{textAlign: 'center'}}>
                                    Загрузка...
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (appState.error) {
        return (
            <div className="frame-container">
                <div className="frame-element-up-right" />
                <div className="frame-element-bottom-left" />
                <div className="modal-layout">
                    <div className='content-container animated-box-fadeInUp'>
                        <div className='dynamic-container modal-content-2'>
                            <div className="logo-title-container">
                                <span className="logo-title">
                                    clerk-screener.com
                                </span>
                            </div>
                            <div>
                                <h5 className="multi-el-header-item">
                                    Упс, что-то пошло не так
                                    <span className="material-symbols-outlined med-bold-icon warning-icon">
                                        warning
                                    </span>
                                </h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <UserContext.Provider value={{user, subscriptionPlans, appState}}>
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