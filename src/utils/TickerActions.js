import { SPOT_SIGN, FUT_SIGN } from "./Utils";


const getMarketStyle = (ticker, tickerProperties, marketTickers, isSpot=true) => {
    let props = tickerProperties.get(ticker);
    if (!props) return 'disabled';
    let marketExists = (props.hasSpot && isSpot) || (props.hasFut && !isSpot);
    if (!marketExists) return 'disabled';

    let marketSymbol = ticker + (isSpot ? SPOT_SIGN : FUT_SIGN);
    if (marketTickers.includes(marketSymbol)) {
        let classValue = (isSpot ? 'spot' : 'futures') + '-selected';
        return classValue;
    }
    return '';
}

const switchMarketStatus = (element, isSpot) => {
    let selectedStatus = ( isSpot ? 'spot' : 'futures') + '-selected';
    if (element.classList.contains(selectedStatus)) {
        element.classList.remove(selectedStatus);
        return false;
    } else {
        element.classList.add(selectedStatus);
        return true;
    }
}

export { getMarketStyle, switchMarketStatus }