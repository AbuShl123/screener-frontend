const FUT_SIGN = '.f';

const DEFAULT_SETTINGS = {
    lowBound: -15,
    highBound: 15,
    level1: -1,
    level2: -1,
    level3: -1,
    isDollar: false,
    audio: true
}
const DEFAULT_TICKERS = ['btcusdt', 'bnbusdt', 'ethusdt', 'dogeusdt', 'xrpusdt', 'bnxusdt', 'avaxusdt'];
const DEFAULT_MARKET_TICKERS = DEFAULT_TICKERS;
const DEFAULT_SETTINGS_MAP = new Map(
    DEFAULT_TICKERS.flatMap(t => [
        [t, DEFAULT_SETTINGS],
        [t + FUT_SIGN, DEFAULT_SETTINGS]
    ])
);

const vowels = 'aeiou';
window.utterances = [];

const roundNumber = (num, dec = 5) => {
    let result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    if (result === 0) return Number(num);
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
    // notification content is following: [ticker, price, qty, distance, level, isAsk, life]
    let symbol = data.ticker;
    let symbolName = symbol.replace(FUT_SIGN, "").replace('usdt', '');
    let coin = convertSymbolToRussian(symbolName);
    let spotFut = symbol.endsWith(FUT_SIGN) ? 'фьючерс' :  'спот';
    let longShort = data.isAsk ? 'лонг' : 'шорт';

    let qty = data.qty;
    let number = convertNumberToRussian(qty);
    let dollars = isDollar ? ' долларов' : '';

    // пример: моента биткоин спот - в лонг обнаружено 2тыс (долларов)
    let message = coin + ' ' + spotFut + ' ' + number + dollars + ' - в ' + longShort;
    
    // Find the Russian female voice
    const synth = window.speechSynthesis;
    const voices = synth.getVoices();
    let russianFemaleVoice = voices[0];

    const russianVoices = voices.filter((voice) => voice.lang.startsWith('ru'));
    const googleVoice = russianVoices.find((voice) => voice.name.toLowerCase().includes('google'));
    const irinaVoice = russianVoices.find((voice) => voice.name.toLowerCase().includes('irina'));
    if (googleVoice) russianFemaleVoice = googleVoice;
    else if (irinaVoice) russianFemaleVoice = irinaVoice;
    else if (russianVoices.length > 0) russianFemaleVoice = russianVoices[0];
    console.log('Russian voices are ', russianVoices);

    // Speak the text
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'ru-RU';
    utterance.voice = russianFemaleVoice; 
    utterance.pitch = 1; // Range: 0 to 2
    utterance.rate = 1; // Range: 0.1 to 10
    utterance.onstart = () => console.log('starting to talk.');
    console.log("Voicing: ", message);
    console.log("Utterance is ", utterance);
    window.utterances.push(utterance);
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

export { 
    FUT_SIGN, DEFAULT_SETTINGS, 
    DEFAULT_TICKERS, DEFAULT_MARKET_TICKERS, DEFAULT_SETTINGS_MAP, 
    setSpeech, roundNumber, getShortFormNumber, 
    getDate, speak 
}