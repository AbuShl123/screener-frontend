import axios from '../../api/AxiosConfig.js'
import { jwtDecode } from 'jwt-decode';
import cache from '../../utils/CacheUtils.js'

const signUpUser = async (firstname, lastname, email, password) => {
    const response = await axios.post('/auth/register', {
        firstname,
        lastname,
        email,
        password,
    });
    return response;
}

const logInUser = async (email, password) => {
    const response = await axios.post('/auth/authenticate', {
        email,
        password,
    });
    return response;
};

const checkTokenExpiration = () => {
  const token = cache.getToken();

  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      cache.removeToken();
      console.log('Token expired.');
      return false;
    }

    return true;
  }

  return false;
};

const checkConnection = async () => {
    const token = cache.getToken();
    
    if (token) {
        const response = await axios.get('/demo', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
        });

        console.log(response.data);
    }

    console.log('Failed to verify connection. Token is null.');
};

export { signUpUser, logInUser, checkTokenExpiration, checkConnection };