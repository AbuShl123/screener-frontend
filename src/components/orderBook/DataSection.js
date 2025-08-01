import { useMemo } from 'react';
import DataList from './DataList';

const DataSection = ({ densities }) => {

    const asks = useMemo(() => densities.filter(d => d.isAsk), [densities]);
    const bids = useMemo(() => densities.filter(d => !d.isAsk), [densities]);

    return (
        <>
            <DataList items={asks}/>
            <div className='ob__separator'></div>
            <DataList items={bids}/>
        </>
    )
}

export default DataSection;