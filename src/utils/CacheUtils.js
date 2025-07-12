
const TOKEN_CACHE_ID = 'screener-auth-token';

class Cache {
    cacheUpdate = false;
    tokenUpdate = false;

    notifyAll() {
        this.cacheUpdate = !this.cacheUpdate;
    }

    getToken() {
        return localStorage.getItem(TOKEN_CACHE_ID);
    }

    setToken( token ) {
        localStorage.setItem(TOKEN_CACHE_ID, token);
    }

    removeToken() {
        localStorage.removeItem(TOKEN_CACHE_ID);
    }

    notifyTokenUpdate() {
        this.tokenUpdate = !this.tokenUpdate;
    }
}

const cache = new Cache();
export default cache;