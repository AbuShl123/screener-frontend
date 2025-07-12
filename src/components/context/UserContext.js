import { createContext, useCallback, useContext, useEffect, useState } from "react";
import cache from "../../utils/CacheUtils";
import apiService from "../../api/ApiService";
import LoadingCard from "../cards/LoadingCard";
import ErrorCard from "../cards/ErrorCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

export const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {

    const [token] = useState(cache.getToken());
    const [user, setUser] = useState({});
    const [subscriptionPlans, setSubscriptionPlans] = useState({});
    const [appState, setAppState] = useState({isLoading: true, error: undefined});
    const [messages, setMessages] = useState(new Map());
    
    useEffect(() => {
        const fetchSubscriptionPlans = async () => setPlanData();
        fetchSubscriptionPlans();
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => setUserData();
        fetchUserInfo();
    }, [token]);

    const closeMessage = useCallback((id) => {
        setMessages(prev => {
            const map = new Map(prev);
            map.delete(id);
            return map;
        });
    }, []);

    const showSuccessMessage = useCallback((message) => {
        const id = crypto.randomUUID();
        const msg = {id, content: message, success: true};

        setMessages(prev => {
            const map = new Map(prev);
            map.set(id, msg);
            return map;
        });

        setTimeout(() => {
            setMessages(prev => {
                const map = new Map(prev);
                map.delete(id);
                return map;
            });
        }, 5000);
    }, [])

    const showErrorMessage = useCallback((message) => {
        const id = crypto.randomUUID();
        const msg = {id, content: message, success: false};

        setMessages(prev => {
            const map = new Map(prev);
            map.set(id, msg);
            return map;
        });

        setTimeout(() => {
            setMessages(prev => {
                const map = new Map(prev);
                map.delete(id);
                return map;
            });
        }, 5000);
    }, [])

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
        <UserContext.Provider value={{ user, token, subscriptionPlans, showSuccessMessage, showErrorMessage}}>
            {children}
            <div className="message-container">
                <AnimatePresence>
                    {Array.from(messages.entries()).map(([id, message]) => (
                        <motion.div 
                            key={id}
                            layout // enables automatic layout animation
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className={"message " + (message.success ? 'success-message' : 'error-message')}
                            onClick={() => closeMessage(id)}
                        >
                            <div className="message-inner">
                                {message.success ? (
                                    <FontAwesomeIcon icon={faCircleCheck} style={{fontSize: '1.2rem'}} />
                                ) : (
                                    <FontAwesomeIcon icon={faCircleExclamation} className="message-icon" />
                                )}
                                <p className="message-content"> {message.content} </p>
                                <div className="reset-icon-layer" style={{right: "15px"}}>
                                    <span className="material-symbols-outlined close-icon clear-search message-close">
                                        close
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
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