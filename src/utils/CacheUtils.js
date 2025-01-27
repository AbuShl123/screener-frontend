
const TOKEN_CACHE_ID = 'screener-auth-token';
const SELECTED_TICKERS_CACHE_ID = 'screener-selectedTickers';
const MARKET_TICKERS_CACHE_ID = 'screener-marketTickers';
const SETTINGS_CACHE_ID = 'screener-settings';

class Cache {
    cacheUpdate = false;
    tokenUpdate = false;
    selectedTickersUpdate = false;
    marketTickersUpdate = false;
    settingsUpdate = false;

    notifyAll() {
        this.cacheUpdate = !this.cacheUpdate;
    }

    notifyTokenUpdate() {
        this.tokenUpdate = !this.tokenUpdate;
    }

    notifySelectedTickersUpdate() {
        this.selectedTickersUpdate = !this.selectedTickersUpdate;
    }

    notifyMarketTickersUpdate() {
        this.marketTickersUpdate = !this.marketTickersUpdate;
    }

    notifySettingsUpdate() {
        this.settingsUpdate = !this.settingsUpdate;
    }

    getToken() {
        return localStorage.getItem(TOKEN_CACHE_ID);
    }

    getSelectedTickers() {
        let rawValue = localStorage.getItem(SELECTED_TICKERS_CACHE_ID);
        if (rawValue !== "undefined") {
            return JSON.parse(rawValue);
        } else {
            return undefined;
        }
    }
    
    getMarketTickers() {
        let rawValue = localStorage.getItem(MARKET_TICKERS_CACHE_ID);
        if (rawValue !== "undefined") {
            return JSON.parse(rawValue);
        } else {
            return undefined;
        }
    }

    getSettings() {
        let rawValue = localStorage.getItem(SETTINGS_CACHE_ID);
        if (rawValue === 'undefined') return undefined;

        let map = new Map(JSON.parse(localStorage.getItem(SETTINGS_CACHE_ID)));
        if (map.size > 0) return map;
        else return undefined;
    }

    setToken( token ) {
        localStorage.setItem(TOKEN_CACHE_ID, token);
    }

    setSelectedTickers( selectedTickers ) {
        localStorage.setItem(SELECTED_TICKERS_CACHE_ID , JSON.stringify(selectedTickers));
    }

    setMarketTickers( marketTickers ) {
        localStorage.setItem(MARKET_TICKERS_CACHE_ID, JSON.stringify(marketTickers));
    }

    setSettings( settings ) {
        localStorage.setItem(SETTINGS_CACHE_ID, JSON.stringify(Array.from(settings)));
    }
}

const cache = new Cache();
export { cache };