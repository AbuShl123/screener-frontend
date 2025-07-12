import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { CacheProvider } from './components/context/Context';
import { ApiProvider } from './components/context/ApiContext';
import VoicingComponent from './components/context/VoicingComponent';
import useUserContext from './components/context/UserContext';
import { useEffect } from 'react';

const SubscribedRoute = ({ Component }) => {
	const { user } = useUserContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        if (user.subscription?.status !== 'ACTIVE') {
            navigate('/account');
        } else {
            setIsLoading(false);
        }
    }, [user]);

    if (isLoading) return null;

	return (
        <CacheProvider>
            <ApiProvider>
                <VoicingComponent>
                    <Component />
                </VoicingComponent>
            </ApiProvider>
        </CacheProvider>
	);
};

export default SubscribedRoute; 