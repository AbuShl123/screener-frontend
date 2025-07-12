
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';
import useApiContext from '../context/ApiContext';


const SymbolsList = ({ modifiedSymbols, currentTicker, onTickerClick, onDelete, onResetAll }) => {

    const {refreshSettings} = useApiContext();

    return (
        <>
            <div className="modal-content-title" style={{position: 'relative'}}>
                <span style={{ padding: '0 5px 0 0' }}> Настроенные монеты </span>
                <FontAwesomeIcon icon={faWrench} />
                <div className='reset-icon-layer' onClick={refreshSettings}>
                    <button className='settings-icon-container tooltip-container'>
                        <FontAwesomeIcon icon={faArrowRotateRight} />
                        <span className="tooltip reset-settings-tooltip" style={{top: '80%', left: '-190%'}}>
                            Перезагрузить
                        </span>
                    </button>
                </div>
            </div>
            <div className="modal-content-body menu-scroller">
                {Array.from(modifiedSymbols).map((symbol) => (
                    <div
                        key={symbol}
                        className={'modified-ticker-container' + (currentTicker === symbol ? ' selected' : '')}
                        id={`favorite-${symbol}`}
                        onClick={() => {
                            if (currentTicker === '' || currentTicker !== symbol) onTickerClick(symbol);
                            else onTickerClick('');
                        }}
                    >
                        <p className="modified-ticker-name"> {symbol.toUpperCase().replace("USDT", '') + " / USDT"} </p>
                        <div className='ticker-action-buttons'>
                            <span className="material-symbols-outlined close-icon"
                                onClick={(e) => {
                                    onDelete(symbol)
                                    e.stopPropagation();
                                }}
                            >
                                close
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="reset-settings">
                <button className="reset-settings-button" onClick={onResetAll}>
                    Сбросить все настройки
                </button>
            </div>
        </>
    )
}

export default SymbolsList;