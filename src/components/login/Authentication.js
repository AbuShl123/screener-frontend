import axios from '../../api/AxiosConfig.js'
import { jwtDecode }     from 'jwt-decode';

const signUpUser = async (firstname, lastname, email, password) => {
    try {
        const response = await axios.post('/auth/register', {
            firstname,
            lastname,
            email,
            password,
        });

        let token = response.data.token;

        localStorage.setItem('token', token);

        window.location.href = '/main';
    } catch (error) {
        console.log('Sign-up failed: ', error);
    }
}

const logInUser = async (email, password) => {
    try {   
        const response = await axios.post('/auth/authenticate', {
            email,
            password,
        });

        let token = response.data.token;

        localStorage.setItem('token', token);

        window.location.href = '/main';
    } catch (error) {
        console.log('Login failed: ', error);
    }
};

const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');

  if (token) {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decodedToken.exp < currentTime) {
      localStorage.removeItem('token');
      console.log('Token expired.');
      return false;
    }

    return true;
  }

  return false;
};

const checkConnection = async () => {
    const token = localStorage.getItem('token');
    
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