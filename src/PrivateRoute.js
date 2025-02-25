import { Navigate } from 'react-router-dom';
import { checkTokenExpiration } from './components/login/Authentication'
import cache from './utils/CacheUtils';
import { CacheProvider } from './components/context/Context';
import { ApiProvider } from './components/context/ApiContext';

const PrivateRoute = ({ Component }) => {
	const token = cache.getToken();
	const isAuthenticated = !!token && checkTokenExpiration(token);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return (
		<CacheProvider>
			<ApiProvider> 
				<Component />
			</ApiProvider>
		</CacheProvider>
	);
};

export default PrivateRoute; 