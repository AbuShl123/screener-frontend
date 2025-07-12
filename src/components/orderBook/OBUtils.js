import { roundNumber, getShortFormNumber } from '../../utils/Utils'

export {
    processDensities, balanceFigures, getVolume, getLevelStyle, getTickerLife, getQty
}

function processDensities(asks, bids, isDollar) {
    const asksData = processTrades(asks, true, isDollar);
    const bidsData = processTrades(bids, false, isDollar);
    return [...asksData, ...bidsData];
}

// indexes:                       0     1       2       3      4
// output: bid/ask array ===== [price, qty, distance, level, life]
function processTrades(trades, isAsk, isDollar) {
    let densities = [];
    let dataArray = sortTrades(trades, isAsk);

    for (const data of dataArray) {
        let p = parseFloat(data[0]);
        let d = roundNumber(data[2], 2);
        let q = data[1];
        let l = data[3];

        const level = data[3];
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

function sortTrades(trades, isAsk) {
    if (isAsk) {
        return trades.sort((a, b) => a[2] - b[2]);
    } else {
        return trades.sort((a, b) => b[2] - a[2]);
    }
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