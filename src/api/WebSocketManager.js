
import { BINANCE_WS_URL } from "../utils/EnvParams";
import { SPOT_SIGN } from "../utils/Utils";

const LIMIT_PER_CONNECTION = 30;

function getDifference(set1, set2) {
	const difference = [...set2].filter(value => !set1.has(value));
	return difference.length > 0 ? new Set(difference) : null;
}

class WebSocketManager {

	constructor() {
		this.connections = new Map();    // Map<Set<String>, Connection>
		this.subscriptions = new Map();  // Map<Connection, Set<Callback>> 	
	}

	addNewConnection(tickers, callbacks) {
		let token = localStorage.getItem('screener-auth-token');
		let wsUrl = `${BINANCE_WS_URL}/depth?token=${token}&symbols=`;
		wsUrl += [...tickers].map(symbol => symbol.replace(SPOT_SIGN, "")).join("/");

		const ws = new WebSocket(wsUrl);

		ws.onmessage = (event) => {
			let callbacks = this.subscriptions.get(ws);
			if (callbacks === undefined) return;

			const message = JSON.parse(event.data);
			for (const callback of callbacks) {
				callback(message);
			}
		}

		ws.onopen = () => console.log('connected to orderbook');
		ws.onclose = () => console.log('disconnected from orderbook');

		let tickersSet = new Set(tickers);
		let callbackSet = new Set(callbacks);
		this.connections.set(tickersSet, ws);
		this.subscriptions.set(ws, callbackSet);
	}

	addCallback(tickers, callback) {
		let ws = this.connections.get(tickers);
		if (ws) {
			let callbacks = this.subscriptions.get(ws);
			callbacks?.add(callback);
		} 
	}

	addNewTickers(pastTickers, tickersToAdd, newCallback) {
		let previousWS = this.connections.get(pastTickers);
		let callbacks = new Set([...this.subscriptions.get(previousWS), newCallback]);
		let newTickers = [...pastTickers, ...tickersToAdd];

		this.closeConnection(pastTickers);
		this.addNewConnection(newTickers, callbacks);
	}

	closeConnection(tickers) {
		let ws = this.connections.get(tickers);
		if (!ws) return;
		this.connections.delete(tickers);
		this.subscriptions.delete(ws); 
		ws.close();
	}

	connect(tickers, callback) {
		let difference = tickers;

		for (const pastTickers of this.connections.keys()) {
			let pastDifferenceLength = difference.size;
			difference = getDifference(pastTickers, difference);

			// if ALL tickers are already included in the past tickers then:
			if (difference === null) {
				this.addCallback(pastTickers, callback);
				return;
			}

			// if there was no match between new tickers and past tickers then:
			if (difference.size === pastDifferenceLength) {
				if (pastTickers.size < LIMIT_PER_CONNECTION) {
					this.addNewTickers(pastTickers, difference, callback);
					return;
				}
				continue;
			}

			// if there is some partial match between new tickers and past tickers then: 
			if (pastTickers.size >= LIMIT_PER_CONNECTION) {
				this.addCallback(pastTickers, callback);
			} else {
				this.addNewTickers(pastTickers, difference, callback);
				return;
			}
		}

		// finally if all past tickers are fully packed OR there are no past tickers then: 
		if (difference?.size > 0) {
			this.addNewConnection(difference, [callback]);
		}
	}

	removeCallback(callback) {
		let allCallbacks = this.subscriptions.values();
		for (const callbacks of allCallbacks) {
			callbacks.delete(callback);
		}
	}

	isCallbackExists(callback) {
		let allCallbacks = this.subscriptions.values();
		for (const callbacks of allCallbacks) {
			if (callbacks.has(callback)) return true;
		}
		return false;
	}

	subscribe(tickers, callback) {
		if (tickers === null || tickers === undefined || tickers.length === 0) {
			return;
		}

		if (this.isCallbackExists(callback)) {
			this.removeCallback(callback);
		}

		let tickersSet = new Set(tickers);
		this.connect(tickersSet, callback);
	}

	unsubscribe(callback) {
		this.removeCallback(callback);

		for (const [ws, callbacks] of this.subscriptions.entries()) {
			if (callbacks.size !== 0) continue;

			for (const [tickers, wss] of this.connections.entries()) {
				if (ws === wss) this.connections.delete(tickers);
			}
			this.subscriptions.delete(ws);
			ws.close();
		}
	}

	printState() {
		console.log('connections are ', this.connections);
		console.log('subscribers are ', this.subscriptions);
	}

}

const websocket = new WebSocketManager();
export { websocket }