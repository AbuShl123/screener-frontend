import { useState, useCallback } from "react";
import useCacheContext from "../context/Context";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SymbolSearch = ({onSelect}) => {

    const {tickers} = useCacheContext();
    const [suggestions, setSuggestions] = useState([]);

    const handleSelection = useCallback((symbol) => {
        if (!tickers.has(symbol)) return;
        onSelect(symbol);
    }, [tickers]);

    const handleSearchSuggesstions = useCallback((event) => {
        let query = event.target.value;
        let allTickers = Array.from(tickers.keys());
        const filteredSuggestions = allTickers
            .filter(ticker => ticker.includes(query.toLowerCase()))
            .slice(0, 5);
        setSuggestions(Array.from(filteredSuggestions));
    }, [tickers]);

    return (
        <div className="modal-search-container">
            <div className="search-input-container">
                <input
                    className='ticker-search-input'
                    placeholder='найти валюту'
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
                                handleSelection(value)
                            }}
                        >
                            <span className="material-symbols-outlined"> add </span>
                            <p> {value} </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


export default SymbolSearch;