import React, { useState, useEffect, useCallback } from "react";
import './SettingsModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faSearch } from '@fortawesome/free-solid-svg-icons';
import { DEFAULT_SETTINGS, FUT_SIGN } from "../../utils/Utils";
import useCacheContext from "../context/Context";
import TickerSettings from "./TickerSettings";

const SettingsModal = ({onClose, desiredTicker=''}) => {
    const {tickers} = useCacheContext();
    const {settingsMap, setSettingsMap} = useCacheContext();
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [currentTicker, setCurrentTicker] = useState(desiredTicker);
    const [modifiedTickers, setModifiedTickers] = useState([]);
    
    useEffect(() => {
        setIsOpen(true);
        let parent = document.getElementById('settingsSearchInput');
        let child = document.getElementById('searchItems');
        var marginVal = (parent.offsetHeight);
        child.style.marginTop = marginVal+"px";
    }, []);

    useEffect(() => {
        if (desiredTicker !== '') {
            let newSettingsMap = new Map(settingsMap);
            if (!newSettingsMap.has(desiredTicker)) {
                newSettingsMap.set(desiredTicker, DEFAULT_SETTINGS);
            } 
            if (!newSettingsMap.has(desiredTicker + FUT_SIGN)) {
                newSettingsMap.set(desiredTicker + FUT_SIGN, DEFAULT_SETTINGS);
            }
            setSettingsMap(newSettingsMap)
        }
    }, [desiredTicker]);

    useEffect(() => {
        let tickers = [...settingsMap.keys()];
        let uniqueTickers = tickers.map(t => t.replace(FUT_SIGN, ""));
        let setOfTickers = new Set(uniqueTickers);
        setModifiedTickers(Array.from(setOfTickers));
    }, [settingsMap]);

    const handleSearchSuggesstions = useCallback((event) => {
        let query = event.target.value;
        let allTickers = Array.from(tickers.keys());
        const filteredSuggestions = allTickers
            .filter(ticker => ticker.includes(query.toLowerCase()))
            .slice(0, 5);
        setSuggestions(Array.from(filteredSuggestions));
    }, []);

    const handleCloseSelectedTicker = useCallback(() => {
        let element = document.getElementById(`favorite-${currentTicker}`);
        if (element?.classList.contains('selected')) {
            element.classList.remove('selected');
        }
        setCurrentTicker('');
    }, []);

    const handleDelete = (ticker) => {
        let newSettingsMap = new Map(settingsMap);
        newSettingsMap.delete(ticker);
        newSettingsMap.delete(ticker + FUT_SIGN);
        setSettingsMap(newSettingsMap);
        if (currentTicker === ticker) handleCloseSelectedTicker();
    }

    const handleNewTicker = (ticker) => {
        if (![...tickers.keys()].includes(ticker)) return;
        if (!modifiedTickers.includes(ticker)) {
            setModifiedTickers(prev => [ticker, ...prev]);
        };
        setCurrentTicker(ticker);
    };

    return (
        <>
            <div className="modal-container">
                <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
                    <div className="modal-header">
                        <div className="modal-title">
                            Настроить Тикеры
                        </div>
                        <button onClick={onClose} className="close-modal"> 
                            <span className="material-symbols-outlined">close</span>  
                        </button>
                    </div>
                    <div className="modal-content">
                        <div className="modal-left-content">
                            <div className="modal-search-container">
                                <div className="search-input-container">
                                    <input
                                        className='ticker-search-input'
                                        placeholder='добавить тикер'
                                        onClick={handleSearchSuggesstions}
                                        onChange={handleSearchSuggesstions}
                                        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                                        autoComplete="off"
                                        id='settingsSearchInput'
                                    />
                                    <div className='clear-search-container'>
                                        <span
                                            className="material-symbols-outlined close-icon clear-search"
                                            onClick={(e) => { document.getElementById('settingsSearchInput').value = '' }}
                                        >
                                            close
                                        </span>
                                    </div>
                                    <div className="search-icon-container">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </div>
                                </div>
                                <div 
                                    style={{ display: suggestions?.length > 0 ? 'block' : 'none' }} 
                                    className="search-suggesstions-container"
                                    id="searchSuggesstionsContainer"
                                >
                                    <div id="searchItems" className="search-items-container">
                                        <hr></hr>
                                        {suggestions.map((value) => (
                                            <div key={value} className="search-item" 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleNewTicker(value)
                                                }}
                                            >
                                                <span className="material-symbols-outlined"> add </span>
                                                <p> {value} </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="ticker-settings-container">
                                {currentTicker !== undefined && currentTicker !== '' ? (
                                        <TickerSettings
                                            ticker={currentTicker}
                                            onClose={handleCloseSelectedTicker}
                                            onDelete={handleDelete}
                                        />
                                    ) : (
                                        <div className="noTickerSelected-background">
                                            <div className="noTickerSelected-container">
                                                <div className="noTickerSelected-icons">
                                                    <span className="material-symbols-outlined settings-background">
                                                        settings
                                                    </span>
                                                    <FontAwesomeIcon icon={faWrench} className="wrench-icon" />
                                                </div>
                                                <div>
                                                    <p className="noTickerSelected-text">
                                                        Здесь можно настроить тикеры
                                                    </p>
                                                    <p className="noTickerSelected-text">
                                                        Нажмите на нужный символ
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        <div className="modal-right-content">
                            <div className="modal-content-title">
                                <span style={{ padding: '0 5px 0 0' }}> Настроенные Тикеры </span>
                                <FontAwesomeIcon icon={faWrench} />
                            </div>
                            <div className="modal-content-body menu-scroller">
                                {modifiedTickers.map((ticker, index) => (
                                    <div 
                                        key={ticker} 
                                        className={'modified-ticker-container' + (currentTicker === ticker ? ' selected' : '')} 
                                        id={`favorite-${ticker}`} 
                                        onClick={() => {
                                            if (currentTicker === '' || currentTicker !== ticker) setCurrentTicker(ticker);
                                            else setCurrentTicker('');
                                        }}
                                    >
                                        <p className="modified-ticker-name"> {ticker.toUpperCase().replace("USDT", '') + " / USDT"} </p>
                                        <div className='ticker-action-buttons'>
                                            <span className="material-symbols-outlined close-icon" 
                                                onClick={(e) => {
                                                    handleDelete(ticker)
                                                    e.stopPropagation();
                                                }
                                            }>
                                                close
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`background-cover ${isOpen ? 'activated' : ''}`}></div>
        </>
    )
}

export default SettingsModal;