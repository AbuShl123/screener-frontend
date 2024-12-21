import React from 'react'
import { useState, useEffect } from 'react'

const MarketHeader = ({ticker, onClose}) => {
    const SPOT_SIGN = '.p';
    const FUT_SIGN = '.f';
    let isFutures = ticker.endsWith(FUT_SIGN);

    return (
        <div className='market-header'>
            <div>
                <div className={isFutures ? 'market-text futures-header' : 'market-text spot-header'}>
                    {isFutures ? (
                        <> futures </>
                    ) : (
                        <> spot </>
                    )}
                </div>
            </div>
            <div className='delete-cup'>
                <span className="material-symbols-outlined delete-cup-icon" onClick={() => onClose(ticker)}>close</span>
            </div>
        </div>
    )
}

export default MarketHeader;