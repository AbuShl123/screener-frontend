import { Navigate } from 'react-router-dom';
import { checkTokenExpiration } from './components/login/Authentication'
import { cache } from './utils/CacheUtils';
import { CacheProvider } from './components/context/Context';

const PrivateRoute = ({ Component }) => {
	const token = cache.getToken();
	const isAuthenticated = !!token && checkTokenExpiration(token);

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return (
		<CacheProvider>
			<Component />
		</CacheProvider>
	);
};

export default PrivateRoute; 