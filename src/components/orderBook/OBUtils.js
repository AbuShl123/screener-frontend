import { roundNumber, getShortFormNumber } from '../../utils/Utils'

export {
    processDensities, balanceFigures, getVolume, getLevelStyle, getTickerLife
}

function processDensities(asks, bids, settings, isDollar) {
    const asksData = processTrades(asks, settings, true, isDollar);
    const bidsData = processTrades(bids, settings, false, isDollar);
    return [...asksData, ...bidsData];
}

// indexes:             0      1       2        3      4
// bid/ask data ===== [price, qty, distance, level, life]
function processTrades(data, settings, isAsk, isDollar) {
    let densities = [];
    let dataArray = sortTrades(data);

    for (const data of dataArray) {
        let p = parseFloat(data[0]);
        let d = parseFloat(data[2]);
        let q = data[1];
        let l = data[3];

        const level = getLevel(p, q, l, settings);
        const qty = getQty(p, q, isDollar);

        let density = {
            price: p,
            qty: qty,
            distance: d,
            level: level,
            life: data[4],
            isAsk: isAsk
        }
        densities = [density, ...densities];
    }

    return densities;
}

function balanceFigures(densities) {
    let prices = getBalancedPrices(densities);
    let distances = getBalancedDistances(densities);

    for (let i = 0; i < densities.length; i++) {
        densities[i].price = prices[i];
        densities[i].distance = distances[i];
    }

    return densities;
}

function sortTrades(trades) {
    if (!trades || !Array.isArray([...trades]) || trades.length <= 0) return [];
    return trades.sort((a, b) => b[1] - a[1]).slice(0, 5)
                 .sort((a, b) => parseFloat(a[2]) - parseFloat(b[2]));
}

function getVolume(isDollar, volumeData) {
    let volumePer5M = volumeData.volume;
    let price = volumeData.price;
    let volume = isDollar ? volumePer5M * price : volumePer5M;
    return (isDollar ? '$' : '') + getShortFormNumber(volume);
}

function getQty(price, qty, isDollar) {
    let value = isDollar ? qty * price : qty;
    let formattedQty = getShortFormNumber(value);
    return formattedQty;
}

function getBalancedPrices(densities) {
    if (densities.length === 0) return [];
    let prices = densities.map(data => roundNumber(data.price));
    let maxDigits = getMaxDigits(prices);
    let balancedPrices = prices.map(p => roundToDigits(p, maxDigits));
    return balancedPrices;
}

function getBalancedDistances(densities) {
    if (densities.length === 0) return [];
    let distances = densities.map(data => Math.abs(data.distance));
    let maxDigits = getMaxDigits(distances);
    return distances.map(i => roundToDigits(i, maxDigits));
}

function getMaxDigits(nums) {
    return Math.max(...nums.map( num => num.toString().replace('.', '').length ));
};

function roundToDigits(num, digits) {
    let numStr = num.toString();
    let dotIndex = numStr.indexOf('.');
    let numLength = numStr.replace('.', '').length;
    let decimalLength = numStr.substring(dotIndex+1).length;

    let digitsToFix = 0;
    if (dotIndex == -1) {
        digitsToFix = Math.abs(numLength - digits);
    } else {
        digitsToFix = Math.abs(numLength - digits) + decimalLength;
    }
    
    if (digitsToFix <= 0) return num;
    let result = num.toFixed(digitsToFix);
    return result;
}

function getLevel(price, qty, level, settings) {
    const lev1 = settings.level1;
    const lev2 = settings.level2;
    const lev3 = settings.level3;
    const isDollar = settings.isDollar;

    if (lev1 < 0 || lev2 < 0 || lev3 < 0) {
        return level;
    }

    // if is dollar, then value = qty * price, else value = qty;
    let value = isDollar ? qty * price : qty;

    if (value < lev1) {
        return 0;
    }
    if (value < lev2) {
        return 1;
    }
    if (value < lev3) {
        return 2;
    }

    return 3;
}

function getLevelStyle(data) {
    const styleLevel = 'quantity-level-';
    const level = data.level;
    return styleLevel + level;
}

function getTickerLife(data) {
    let life = data.life;
    let currentTime = Date.now();
    let duration = (currentTime - life) / 1000;
    if (duration >= 3600 * 24 * 30) {
        return roundNumber(duration / (3600 * 24 * 30), 0) + 'мес'
    }
    else if (duration >= 3600 * 24 * 7) {
        return roundNumber(duration / (3600 * 24 * 7), 0) + 'нед'
    }
    else if (duration >= 3600 * 24) {
        return roundNumber(duration / (3600 * 24), 0) + 'д'
    }
    else if (duration >= 3600) {
        return roundNumber(duration / 3600, 0) + 'ч';
    }
    else if (duration >= 60) {
        return roundNumber(duration / 60, 0) + 'мин';
    }
    else {
        return roundNumber(duration, 0) + 'сек';
    }
}