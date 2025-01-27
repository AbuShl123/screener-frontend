const SPOT_SIGN = '.p';
const FUT_SIGN = '.f';

const DEFAULT_SETTINGS = {
    lowBound: -10,
    highBound: 10,
    level1: -1,
    level2: -1,
    level3: -1,
    isDollar: false,
    audio: false
}
const DEFAULT_TICKERS = ['btcusdt', 'bnbusdt', 'ethusdt', 'dogeusdt', 'xrpusdt', 'bnxusdt', 'avaxusdt'];
const DEFAULT_MARKET_TICKERS = DEFAULT_TICKERS.map(t => t + SPOT_SIGN);
const DEFAULT_SETTINGS_MAP = new Map(
    DEFAULT_TICKERS.flatMap(t => [
        [t + SPOT_SIGN, DEFAULT_SETTINGS],
        [t + FUT_SIGN, DEFAULT_SETTINGS]
    ])
);

const vowels = 'aeiou';
window.utterances = [];

const roundNumber = (num, dec = 5) => {
    return Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
}

const getShortFormNumber = (number, dec = 1) => {
    let shortNumber = '';
    let value = Math.abs(number);
    if (value >= 1_000_000) {
        shortNumber = roundNumber((value / 1_000_000), dec) + 'M';
    } else if (value >= 1_000) {
        shortNumber = roundNumber((value / 1_000).toFixed(1), dec) + 'K';
    } else {
        shortNumber = roundNumber(value, 0) + '';
    }
    return number < 0 ? "-" + shortNumber : shortNumber;
}

const getDate = (timestamp) => {
    let date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const militaryTime = `${hours}:${minutes}`;
    return militaryTime;
}

const getMarketStyle = (ticker, tickerProperties, marketTickers, isSpot=true) => {
    let props = tickerProperties.get(ticker);
    if (props) {
        let marketExists = (props.hasSpot && isSpot) || (props.hasFut && !isSpot);
        if (!marketExists) return 'disabled';
    }

    let marketSymbol = ticker + (isSpot ? SPOT_SIGN : FUT_SIGN);
    if (marketTickers.includes(marketSymbol)) {
        let classValue = (isSpot ? 'spot' : 'futures') + '-selected';
        return classValue;
    }

    return '';
}

function setSpeech() {
    return new Promise(
        function (resolve, reject) {
            let synth = window.speechSynthesis;
            let id;

            id = setInterval(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                    clearInterval(id);
                }
            }, 10);
        }
    )
}

const speak = (data, isDollar) => {
    let symbol = data[0];
    let symbolName = symbol.replace(SPOT_SIGN, "").replace(FUT_SIGN, "").replace('usdt', '');
    let coin = convertSymbolToRussian(symbolName);
    let spotFut = symbol.endsWith(SPOT_SIGN) ? 'спот' : 'фьючерс';
    let longShort = data[1] ? 'лонг' : 'шорт';

    let qty = data[3];
    let price = data[2];
    let value = isDollar ? getShortFormNumber(qty * price) : getShortFormNumber(qty);
    let number = convertNumberToRussian(value);
    let dollars = isDollar ? ' долларов' : '';

    // пример: моента биткоин спот - в лонг обнаружено 2тыс (долларов)
    let message = 'монета ' + coin + ' ' + spotFut + ' - в ' + longShort + ' обнаружено ' + number + dollars;
    
    // Speak the text
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = synth.getVoices()[3]; // Select a voice
    utterance.pitch = 1; // Range: 0 to 2
    utterance.rate = 1; // Range: 0.1 to 10
    utterance.onstart = () => console.log('starting to talk.');
    console.log("Voicing: ", message);
    console.log('utterance is: ', utterance);
    window.utterances.push( utterance );
    synth.speak(utterance);
}

const convertSymbolToRussian = (symbolName) => {
    // some coins have recognizable names, so: 
    switch(symbolName) {
        case 'btc': return 'биткоин';
        case 'eth': return 'эфир';
        case 'bnb': return 'байнанс коин';
        case 'ltc': return 'лайткоин';
    }

    // if symbol is easily readable, then just return it (ex: 'avax' -> 'авакс')
    if (isReadbable(symbolName)) {
        return symbolName;
    }

    // in all other situtations, symbols will be read letter-by-letter (ex: bnx -> b n x -> б н икс)
    return symbolName.split('').join(' ');         
}

const convertNumberToRussian = (number) => {
    let whole = number.split('.')[0].replace('M', '').replace('K', '');
    
    let ending = '';
    if (number.endsWith('M')) {
        if (Number(whole) % 10 == 1) {
            ending = ' миллион';
        } else if (Number(whole) % 10 < 5) {
            ending = ' миллиона';
        } else {
            ending = ' миллионов';
        }
    } else if (number.endsWith('K')) {
        ending = ' тысяч';
    }

    return whole + ending;
}

const isReadbable = (symbolName) => {
    if (symbolName.length <= 2) return false; // should be longer than 2 characters    
    
    // if vowels and consonants are alternating in the string, then it is readable in russian (ex: avax -> авакс)
    let isLastLetterVowel = vowels.includes(symbolName[0]);
    for (let i = 1; i < symbolName.length; i++) {
        let isCurrentLetterVowel = vowels.includes(symbolName[i]);
        if (isLastLetterVowel === isCurrentLetterVowel) {
            return false;
        }
        isLastLetterVowel = isCurrentLetterVowel;
    }

    return true;
}

export { SPOT_SIGN, FUT_SIGN, DEFAULT_SETTINGS, DEFAULT_TICKERS, DEFAULT_MARKET_TICKERS, DEFAULT_SETTINGS_MAP, setSpeech, roundNumber, getShortFormNumber, getDate, getMarketStyle, speak }