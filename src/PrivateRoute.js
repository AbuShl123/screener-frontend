import { Navigate } from 'react-router-dom';
import { checkTokenExpiration } from './components/starterpage/Authentication'
import cache from './utils/CacheUtils';
import { UserProvider } from './components/context/UserContext';
import SubscribedRoute from './SubscribedRoute';

const PrivateRoute = ({ Component }) => {
	const token = cache.getToken();
	const isAuthenticated = !!token && checkTokenExpiration(token);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	if (Component.displayName?.includes('Account')) {
		return (
			<UserProvider>
				<Component />
			</UserProvider>
		)
	}

	return (
		<UserProvider>
			<SubscribedRoute Component={Component}/>
		</UserProvider>
	);
};

export default PrivateRoute; 