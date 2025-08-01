import { BASE_WS_URL } from '../utils/EnvParams';
import api from './AxiosConfig.js'

const clientSideReason = "client initiated closure";
const MAX_RECONNECT_ATTEMPTS = 20;
const RECONNECT_BASE_DELAY = 1000; // in ms

class ApiService {
    oiSocket = undefined;
    obSocket = undefined;
    oiReconnectAttempts = 0;
    obReconnectAttempts = 0;
    oiReconnectTimeout = null;
    obReconnectTimeout = null;


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

        this.oiSocket.onopen = () => {
            console.log(`Connected to Open Interest websocket: ${oiUrl}`);
            this.oiReconnectAttempts = 0;
            if (this.oiReconnectTimeout) {
                clearTimeout(this.oiReconnectTimeout);
                this.oiReconnectTimeout = null;
            }
        }

        this.oiSocket.onerror = (error) => {
            console.warn('Open Interest websocket threw error: ', error);
            this.closeOIConnection(3000, 'Open Interest websocket threw error');
        }


        this.oiSocket.onclose = (event) => {
            console.log('Disconnected from Open Interest', event.code, event.reason);
            if (event.code !== 1000 && event.reason !== clientSideReason && this.oiReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                const delay = RECONNECT_BASE_DELAY * 2 ** this.oiReconnectAttempts; // Exponential backoff
                this.oiReconnectAttempts++;

                this.oiReconnectTimeout = setTimeout(() => {
                    console.log(`Reconnecting... attempt ${this.oiReconnectAttempts}`);
                    this.createOIConnection(callback, token);
                }, delay);
            }
        }
    }

    createOBConnection(callback, token) {
        const obUrl = `${BASE_WS_URL}/binance/depth?token=${token}`;
        this.obSocket = new WebSocket(obUrl);

        this.obSocket.onmessage = (event) => this.handleMessage(event, callback);

        this.obSocket.onopen = () => {
            console.log(`Connected to order book: ${obUrl}`);
            this.obReconnectAttempts = 0;
            if (this.obReconnectTimeout) {
                clearTimeout(this.obReconnectTimeout);
                this.obReconnectTimeout = null;
            }
        }

        this.obSocket.onerror = (error) => {
            console.log('Order book websocket threw error: ', error);
            this.closeOBConnection(3000, 'Order book websocket threw error');
        }

        this.obSocket.onclose = (event) => {
            console.log('Disconnected from order book', event.code, event.reason);
            if (event.code !== 1000 && event.reason !== clientSideReason && this.obReconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
                const delay = RECONNECT_BASE_DELAY * 2 ** this.obReconnectAttempts; // Exponential backoff
                this.obReconnectAttempts++;

                this.obReconnectTimeout = setTimeout(() => {
                    console.log(`Reconnecting... attempt ${this.obReconnectAttempts}`);
                    this.createOBConnection(callback, token);
                }, delay);
            }
        }
    }

    setOBCallback(callback) {
        if (this.obSocket) {
            this.obSocket.onmessage = (event) => this.handleMessage(event, callback);
        }
    }

    closeOIConnection(code=1000, reason=clientSideReason) {
        if (this.oiReconnectTimeout) {
            clearTimeout(this.oiReconnectTimeout);
            this.oiReconnectTimeout = null;
        }
        if (this.oiSocket) {
            this.oiSocket.close(code, reason);
            this.oiSocket = undefined;
        }
    }

    closeOBConnection(reason = clientSideReason) {
        if (this.obReconnectTimeout) {
            clearTimeout(this.obReconnectTimeout);
            this.obReconnectTimeout = null;
        }
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

    async subscribe(token, planId) {
        return await api.post(`subscribe/${planId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
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

    async fetch5MVolume(symbol, token) {
        try {
            const response = await api.get(`/kilnes/5m-volume/` + symbol, { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            console.error("Error whilte fetching klines data: ", error);
        }
    }

    async fetchOpenInterest(token) {
        try {
            const response = await api.get('/openInterest', { headers: { Authorization: `Bearer ${token}` } });
            return response.data;
        } catch (error) {
            console.error("Error while fetching open interest data: ", error);
        }
    }

    async fetchAllTickers(token) {
        try {
            const response = await api.get('/tickers', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response;
        } catch (error) {
            console.error("Error while fetching tickers: ", error);
        }
    }

    // Settings endpoints

    async fetchCurrentSettings(token) {
        return await api.get('/settings', { headers: { Authorization: `Bearer ${token}` } });
    }

    async postSettings(token, settingsRequest) {
        return await api.post('/settings', settingsRequest, { headers: { Authorization: `Bearer ${token}` } });
    }

    async resetSettings(token) {
        return await api.post('/settings/reset', {}, { headers: { Authorization: `Bearer ${token}` } });
    }

    async resetOneSettings(token, mSymbol) {
        return await api.post('/settings/reset/' + mSymbol, {}, { headers: { Authorization: `Bearer ${token}` } });
    }

    async deleteSettings(token, mSymbol) {
        return await api.delete('/settings/' + mSymbol, { headers: { Authorization: `Bearer ${token}` } });
    }

    // kline endpoints

    async fetchGVolume(token) {
        return await api.get('/klines/gvolume', { headers: { Authorization: `Bearer ${token}` } });
    }
};

const apiService = new ApiService();
export default apiService;