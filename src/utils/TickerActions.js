import { FUT_SIGN } from "./Utils";

const getMarketStyle = (ticker, marketTickers, isSpot=true) => {
    let marketSymbol = ticker + (isSpot ? '' : FUT_SIGN);
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