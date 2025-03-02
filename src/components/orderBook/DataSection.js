
import React from "react";
import { getLevelStyle, getTickerLife } from './OBUtils'
import useCacheContext from "../context/Context";

function getQty(isDollar, data) {
    let qty = data.qty;

    if (isDollar) {
        qty = '$ ' + qty;
    }

    return qty;
}

function displayData(data, index, isDollar) {
    return (
        <div className="ob__each-data tooltip-container" key={index}>

            <span className='tooltip'> Плотность обнаружена: {getTickerLife(data)} назад </span>

            <div className={getLevelStyle(data)}> {getQty(isDollar, data)} </div>

            <div className='ob__price-data-box'>
                <div className={'ob__price-data ' + (data.isAsk ? 'ask-color' : 'bid-color')}>
                    <span> {data.price} </span>
                </div>
                <div className='ob__percentage-data'>
                    <span> {data.distance}%</span>
                </div>
            </div>

        </div>
    )
}

const DataSection = ({densities}) => {

    const {isDollar} = useCacheContext();

    return (
        <>
            <div className='data-section'>
                {densities.map((data, index) => (
                    data.isAsk && displayData(data, index, isDollar)
                ))}
            </div>
            <div className='ob__separator'><p></p></div>
            <div className='data-section'>
                {densities.map((data, index) => (
                    !data.isAsk && displayData(data, index, isDollar)
                ))}
            </div>
        </>
    )
}

export default DataSection;