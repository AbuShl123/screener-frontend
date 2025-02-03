import axios from 'axios';
import { BASE_URL } from '../utils/EnvParams';

export default axios.create({
    baseURL: BASE_URL
});