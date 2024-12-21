import { Route, Navigate } from 'react-router-dom';
import { checkTokenExpiration } from './components/login/Authentication'

const PrivateRoute = ({ Component }) => {
  const token = localStorage.getItem('token');

  const isAuthenticated = !!token && checkTokenExpiration(token);

  if ( !isAuthenticated ) {
    return <Navigate to="/login" replace/>
  }
 
  return <Component/>;
};

export default PrivateRoute; 