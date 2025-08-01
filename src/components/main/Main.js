import { useState, useEffect, useCallback } from 'react'
import './Main.css'
import Header from '../header/Header'
import OrderBook from '../orderBook/OrderBook'
import SettingsModal from '../settings/SettingsModal'
import useCacheContext from '../context/Context'
import RightMenu from '../menu/RightMenu'
import Mode from '../context/Mode'
import Charts from '../chart/Charts'
import SingleChart from '../chart/SingleChart'

const Main = () => {
    const [settingsModal, setSettingsModal] = useState({isOpen: false, desiredTicker: ''});
    const {isVoiceOn, mode, isRightMenu, singleChart} = useCacheContext();

    useEffect(() => {
        if (!isVoiceOn) {
            window.speechSynthesis.cancel();
        }
    }, [isVoiceOn]);

    const openSettingsModal = useCallback(() => {
        setSettingsModal({isOpen: true, desiredTicker: ''});
    }, []);

    const closeSettingsModal = useCallback(() => {
        setSettingsModal({isOpen: false, desiredTicker: ''});
    }, []);

    const openSettingsModalForTicker = useCallback((desiredTicker) => {
        setSettingsModal({isOpen: true, desiredTicker});
    }, []);

    return (
        <>
            {settingsModal.isOpen && <SettingsModal onClose={closeSettingsModal} desiredTicker={settingsModal.desiredTicker} />}

            <div className='main'>
                <div className='content-left menu-invisible-scroller'>
                    <Header onSettings={openSettingsModal} />
                    { singleChart ? (
                        <SingleChart />
                    ) : mode === Mode.cups ? (
                        <OrderBook onTickerSettings={openSettingsModalForTicker}/>
                    ) : (
                        <Charts />
                    )}
                </div>
                <div className={'content-right' + (isRightMenu ? '' : ' closed')}>
                    <RightMenu onSettings={openSettingsModalForTicker}/>
                </div>
            </div>
        </>
    )
}

export default Main