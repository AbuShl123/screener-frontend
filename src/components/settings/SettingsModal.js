import { useState, useEffect, useCallback } from "react";
import './SettingsModal.css'
import { FUT_SIGN } from "../../utils/Utils";
import TickerSettings from "./TickerSettings";
import useApiContext from "../context/ApiContext";
import apiService from "../../api/ApiService";
import useUserContext from "../context/UserContext";
import SymbolSearch from "./SymbolSearch";
import SymbolsList from "./SymbolsList";

const SettingsModal = ({onClose, desiredTicker=''}) => {

    const {token, showSuccessMessage, showErrorMessage} = useUserContext();
    const {settings, refreshSettings} = useApiContext();

    const [isOpen, setIsOpen] = useState(false);
    const [currentTicker, setCurrentTicker] = useState(desiredTicker);
    const [modifiedSymbols, setModifiedSymbols] = useState(new Set());
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsOpen(true);
        let parent = document.getElementById('settingsSearchInput');
        let child = document.getElementById('searchItems');
        var marginVal = (parent.offsetHeight);
        child.style.marginTop = marginVal+"px";
    }, []);

    useEffect(() => {
        if (!settings) return;
        setIsLoading(true);
        const symbols = new Set();
        for (const mSymbol of settings.keys()) {
            if (!mSymbol || mSymbol === 'all') continue;
            const symbol = mSymbol.replace(FUT_SIGN, "");
            symbols.add(symbol);
        }
        setModifiedSymbols(symbols);
        setIsLoading(false);
    }, [settings]);

    const closeSelectedSymbol = useCallback(() => {
        let element = document.getElementById(`favorite-${currentTicker}`);
        if (element?.classList.contains('selected')) {
            element.classList.remove('selected');
        }
        setCurrentTicker('');
    }, []);

    const updateSettings = useCallback(async (settingsRequest) => {
        try {
            setIsLoading(true);
            console.log('submitting settings: ', settingsRequest);
            await apiService.postSettings(token, settingsRequest);
            let symbol = settingsRequest.mSymbol.replace(FUT_SIGN, "").replace("usdt", "") + '/usdt';
            showSuccessMessage(`Настройки для ${symbol.toUpperCase()} сохранены`);
            refreshSettings();
        } catch (error) {
            showErrorMessage(`Ошибка! Не удалось сохранить настройки`);
            console.error('Failed to submit settings: ' + settingsRequest, error);
        }
        setIsLoading(false);
    }, [token]);

    const resetOneTicker = useCallback(async (mSymbol) => {
        try {
            setIsLoading(true);
            let symbol = mSymbol.replace(FUT_SIGN, "").replace("usdt", "") + '/usdt';
            await apiService.resetOneSettings(token, mSymbol);
            showSuccessMessage(`Настройки cброшены для ${symbol.toUpperCase()}`);
            refreshSettings();
        } catch (error) {
            showErrorMessage(`Ошибка! Не удалось сбросить настройки`);
            console.error("Coudln't reset settings for ", mSymbol)
        }
        setIsLoading(false);
    }, [token]);

    const resetAllSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            await apiService.resetSettings(token);
            if (currentTicker !== '') closeSelectedSymbol();
            showSuccessMessage(`Настройки сброшены`);
            refreshSettings();
        } catch (error) {
            console.error("Failed to reset settings", error);
            showErrorMessage(`Ошибка! Не удалось сбросить настройки`);
        }
        setIsLoading(false);
    }, [refreshSettings, closeSelectedSymbol]);

    const deleteMSymbol = useCallback(async (mSymbol) => {
        try {
            let symbol = mSymbol.replace(FUT_SIGN, "").replace("usdt", "") + '/usdt';
            await apiService.deleteSettings(token, mSymbol);
            showSuccessMessage(`Настройки удалены для ${symbol.toUpperCase()} ${mSymbol.endsWith(FUT_SIGN) ? 'спот' : 'фьючерс'}`);
            return true;
        } catch (error) {
            showErrorMessage(`Ошибка! Не удалось удалить настройки`);
            console.error(`Couldn't delete settings for mSymbol ${mSymbol}`, error);
            return false;
        }
    }, [token, currentTicker, closeSelectedSymbol]);

    const handleDelete = useCallback(async (symbol) => {
        setIsLoading(true);
        if (currentTicker === symbol) closeSelectedSymbol();
        if (settings.has(symbol)) {
            await deleteMSymbol(symbol);
        }
        if (settings.has(symbol + FUT_SIGN)) {
            await deleteMSymbol(symbol + FUT_SIGN);
        }
        refreshSettings();
        setIsLoading(false);
    }, [deleteMSymbol]);

    const handleNewTicker = (ticker) => {
        if (!modifiedSymbols.has(ticker)) {
            setModifiedSymbols(prev => [ticker, ...prev]);
        };
        setCurrentTicker(ticker);
    };

    return (
        <>
            <div className="modal-container">
                <div className={`modal-overlay ${isOpen ? 'open' : ''}`}>
                    <div className="modal-header">
                        <div className="modal-title">
                            Настроить монеты
                        </div>
                        <button onClick={onClose} className="close-modal"> 
                            <span className="material-symbols-outlined">close</span>  
                        </button>
                    </div>

                    <div className="modal-content">
                        <div className="modal-left-content">
                            <SymbolSearch onSelect={handleNewTicker} />
                            <TickerSettings symbol={currentTicker} onSubmit={updateSettings} onReset={resetOneTicker} onClose={closeSelectedSymbol} onDelete={handleDelete}/>
                        </div>

                        <div className="modal-right-content">
                            <SymbolsList 
                                modifiedSymbols={modifiedSymbols}
                                currentTicker={currentTicker}
                                onTickerClick={setCurrentTicker}
                                onDelete={handleDelete}
                                onResetAll={resetAllSettings}
                            />
                        </div>
                    </div>

                    {isLoading && (
                        <div className="modal-spinner">
                            <div className="spinner"></div>
                        </div>
                    )}
                </div>
            </div>
            <div className={`background-cover ${isOpen ? 'activated' : ''}`}></div>
        </>
    )
}

export default SettingsModal;