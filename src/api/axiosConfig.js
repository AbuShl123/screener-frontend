import axios from 'axios';

export default axios.create({
    baseURL: 'http://localhost:1105/api/v1/',
    // headers: {"Access-Control-Allow-Origin": "true"}
});