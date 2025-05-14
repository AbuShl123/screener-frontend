import { BASE_WS_URL } from '../utils/EnvParams';
import api from './AxiosConfig'

const clientSideReason = "client initiated closure";
class ApiService {
    oiSocket = undefined;
    obSocket = undefined;

    handleMessage(event, callback) {
        try {
            const data = JSON.parse(event.data);
            if (callback) callback(data);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', event.data, error);
        }
    }

    handleClose(event) {
        let reason = event.reason;
        if (reason !== clientSideReason) {
            
        }
    }

    createOIConnection(callback, token) {
        const oiUrl = `${BASE_WS_URL}/bitget/openInterest?token=${token}`;

        this.oiSocket = new WebSocket(oiUrl);

        this.oiSocket.onmessage = (event) => this.handleMessage(event, callback);
        this.oiSocket.onopen = () => console.log(`Connected to Open Interest websocket: ${oiUrl}`);
        this.oiSocket.onclose = (event) => console.log('Disconnected from Open Interest', event.code, event.reason);
        this.oiSocket.onerror = (error) => console.log('Open Interest websocket threw error: ', error);
    }

    createOBConnection(marketTickers, callback, token) {
        let obUrl = `${BASE_WS_URL}/binance/depth?token=${token}&symbols=`;
        obUrl += marketTickers.join("/");

        this.obSocket = new WebSocket(obUrl);
        this.obSocket.onmessage = (event) => this.handleMessage(event, callback);
        this.obSocket.onopen = () => console.log(`Connected to order book: ${obUrl}`);
        this.obSocket.onclose = (event) => console.log('Disconnected from order book', event.code, event.reason);
        this.obSocket.onerror = (error) => console.log('Order book websocket threw error: ', error);
    }

    closeOIConnection(reason = clientSideReason) {
        if (this.oiSocket) {
            this.oiSocket.close(1000, reason);
            this.oiSocket = undefined;
        }
    }

    closeOBConnection(reason = clientSideReason) {
        if (this.obSocket) {
            this.obSocket.close(1000, reason);
            this.obSocket = undefined;
        }
    }

    async fetchUserInfo(token) {
        try {
            const response = await api.get('/user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            return response;
        } catch (error) {
            console.error('Error while fetching user info: ', error);
        }
    }

    async fetchSubscriptionPlans() {
        try {
            const response = await api.get('/subscribe/plans');
            return response;
        } catch (error) {
            console.error('Error while fetching subscription plans: ', error);
        }
    }

    async subscribe(email, planId) {
        return await api.post(`subscribe/${planId}/${email}`);
    }

    async fetchMaxOrders(callback, token) {
        try {
            const response = await api.get('/max-orders', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = response.data;
            callback(data);
        } catch (error) {
            console.error("Error whilte fetching max tickers: ", error);
        }
    }

    async fetch5MVolume(symbol) {
        try {
            let baseUrl = 'https://api.binance.com/api/v3';
            const response = await api.get(`${baseUrl}/klines?symbol=${symbol.toUpperCase()}&interval=5m&limit=1`)
            return response.data;
        } catch (error) {
            console.error("Error whilte fetching klines data: ", error);
        }
    }

    async fetchOpenInterest(token) {
        try {
            const response = await api.get('/openInterest', { headers: { Authorization: `Bearer ${token}` }, });
            return response.data;
        } catch (error) {
            console.error("Erro while fetching open interest data: ", error);
        }
    }

    async fetchSubscriptionPlans() {
        try {
            const response = await api.get('/subscribe/plans');
            return response;
        } catch (error) {
            console.error("Erro while fetching subscribe plans data: ", error);
            return undefined;
        }
    }
};

const apiService = new ApiService();
export default apiService;