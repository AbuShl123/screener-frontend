import React, { useState, useEffect } from "react";
import './SettingsModal.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWrench, faStar, faSearch } from '@fortawesome/free-solid-svg-icons';
import { SPOT_SIGN, FUT_SIGN, DEFAULT_SETTINGS } from "../../utils/Utils";
import { getMarketStyle, switchMarketStatus } from "../../utils/TickerActions";
import { useCacheContext } from "../context/Context";
import TickerSettings from "./TickerSettings";

const SettingsModal = ({onClose}) => {

    const {allTickers, tickerProps} = useCacheContext();
    const {selectedTickers, setSelectedTickers} = useCacheContext();
    const {marketTickers, setMarketTickers} = useCacheContext();
    const {settingsMap, setSettingsMap} = useCacheContext();
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [currentTicker, setCurrentTicker] = useState('');
    
    useEffect(() => {
        setIsOpen(true);
        let parent = document.getElementById('settingsSearchInput');
        let child = document.getElementById('searchItems');
        var marginVal = (parent.offsetHeight);
        child.style.marginTop = marginVal+"px";
    }, []);

    function updateSelectedTickers(value) {
        setSelectedTickers(value);
    }
    
    function updateMarketTickers(value) {
        setMarketTickers(value);
    }
    
    function updateSettings(value) {
        setSettingsMap(value);
    }

    const handleMarketSelection = (ticker, element, isSpot) => {
        if (!element || element.classList.contains('disabled')) {
            return;
        }

        let hasActivated = switchMarketStatus(element, isSpot);
        let marketSymbol = ticker + ( isSpot ? SPOT_SIGN : FUT_SIGN);
        if (hasActivated) {
            let newValue = [...marketTickers, marketSymbol];
            updateMarketTickers(newValue);
        } else {
            let newValue = marketTickers.filter((t) => t !== marketSymbol);
            updateMarketTickers(newValue);
        }
    }

    const handleSearchSuggesstions = (event) => {
        let query = event.target.value;
        const filteredSuggestions = allTickers.filter(ticker =>
            ticker.includes(query.toLowerCase())
            && !selectedTickers.includes(ticker)
        ).slice(0, 5);
        setSuggestions(filteredSuggestions);
    }

    const handleNewSetting = (newSetting, ticker, isSpot) => {
        let sign = isSpot ? SPOT_SIGN : FUT_SIGN;
        let marketTicker = ticker + sign;
        console.log(`${marketTicker} - new settings here: `, newSetting);

        let newSettingsMap = new Map(settingsMap);
        newSettingsMap.set(marketTicker, newSetting);
        updateSettings(newSettingsMap);
    }

    const handleCloseSelectedTicker = () => {
        let element = document.getElementById(`favorite-${currentTicker}`);
        if (element?.classList.contains('selected')) {
            element.classList.remove('selected');
        }
        setCurrentTicker('');
    }

    const handleDelete = (ticker) => {
        let newSelectedTickers = selectedTickers.filter(t => t !== ticker);
        let newMarketTickers = marketTickers.filter(t => !t.includes(ticker));
        let newSettings = new Map(settingsMap);
        newSettings.delete(ticker + SPOT_SIGN);
        newSettings.delete(ticker + FUT_SIGN);

        updateSelectedTickers(newSelectedTickers);
        updateMarketTickers(newMarketTickers);
        if (currentTicker === ticker) handleCloseSelectedTicker();
        updateSettings(newSettings);
    }

    const handleNewTicker = (ticker) => {
        let props = tickerProps.get(ticker);
        if (!props || !allTickers.includes(ticker)) return;
        let newSelectedTickers = [ticker, ...selectedTickers];
        updateSelectedTickers(newSelectedTickers);

        let newMarketTickers = [...marketTickers];
        let newSettingsMap = new Map(settingsMap);

        if (props.hasSpot) {
            newSettingsMap.set(ticker + SPOT_SIGN, DEFAULT_SETTINGS);
            newMarketTickers = [ticker + SPOT_SIGN, ...newMarketTickers];    
        } 

        if (props.hasFut) {
            newSettingsMap.set(ticker + FUT_SIGN, DEFAULT_SETTINGS);
            newMarketTickers = [ticker + FUT_SIGN, ...newMarketTickers];
        }

        updateMarketTickers(newMarketTickers);
        updateSettings(newSettingsMap);
        setCurrentTicker(ticker);
    }

    return (
        <>
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
                                    onBlur={() => setTimeout(() => setSuggestions([]), 100)}
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
                                    {suggestions.map((value, index) => (
                                        <div key={index} className="search-item" onClick={() => {handleNewTicker(value)}}>
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
                                        onNewSettings={handleNewSetting}
                                        onMarketSelection={handleMarketSelection}
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
                            <span style={{ padding: '0 5px 0 0' }}> Избранные Тикеры </span>
                            <FontAwesomeIcon icon={faStar} style={{ color: "yellow" }}/>
                        </div>
                        <div className="modal-content-body menu-scroller">
                            {selectedTickers?.length > 0 && selectedTickers.map((ticker, index) => (
                                <div 
                                    key={index} 
                                    className={'connected-ticker-container chosen-one ' + (currentTicker === ticker ? 'selected' : '')} 
                                    id={`favorite-${ticker}`} 
                                    onClick={() => {
                                        if (currentTicker === '' || currentTicker !== ticker) setCurrentTicker(ticker);
                                        else setCurrentTicker('');
                                    }}
                                >
                                    <p> {ticker.toUpperCase()} </p>
                                    <div className='ticker-action-buttons'>
                                        <div
                                            className={
                                                'market-checkbox spot-checkbox ' +
                                                getMarketStyle(ticker, tickerProps, marketTickers, true)
                                            }
                                            onClick={(e) => {
                                                handleMarketSelection(ticker, e.currentTarget, true)
                                                e.stopPropagation();
                                            }}
                                        >
                                            <p>spot</p>
                                        </div>

                                        <div
                                            className={
                                                'market-checkbox futures-checkbox ' +
                                                getMarketStyle(ticker, tickerProps, marketTickers, false)
                                            }
                                            onClick={(e) => {
                                                handleMarketSelection(ticker, e.currentTarget, false)
                                                e.stopPropagation();
                                            }}
                                        >
                                            <p>futures</p>
                                        </div>

                                        <span className="material-symbols-outlined close-icon close-chosen-one" 
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
            <div className={`background-cover ${isOpen ? 'activated' : ''}`}></div>
        </>
    )
}

export default SettingsModal;