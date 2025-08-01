import useCacheContext from "../context/Context";
import { getLevelStyle, getTickerLife } from "./OBUtils";

function getQty(isDollar, data) {
    return isDollar ? `$ ${data.qty}` : data.qty;
}

const DataList = ({ items }) => {

    const { isDollar } = useCacheContext();

    return (
        <div className='data-section'>
            {items.map((data, index) => (
                <div className="ob__each-data tooltip-container" key={index}>
                    <span className={index === 4 ? 'tooltip-up' : 'tooltip'}>
                        Плотность обнаружена: {getTickerLife(data)} назад
                    </span>
                    <div className={getLevelStyle(data)}> {getQty(isDollar, data)} </div>
                    <div className='ob__price-data-box'>
                        <div className={'ob__price-data ' + (data.isAsk ? 'ask-color' : 'bid-color')}>
                            <span>{data.price}</span>
                        </div>
                        <div className='ob__percentage-data'>
                            <span>{data.distance}%</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
export default DataList;