import React, {useEffect} from "react";
import { setSpeech, getUtterance, getUtteranceForPriceChange } from '../../utils/Utils'
import useCacheContext from "./Context";

const synth = window.speechSynthesis

const VoicingComponent = ({children}) => {

    const {notifications, getSettings, isDollar, isVoiceOn} = useCacheContext();

    useEffect(() => {
        const waitForVoicesToLoad = async () => await setSpeech();
        waitForVoicesToLoad();
    }, []);

    useEffect(() => {
        for (const notif of notifications) {
            if (notif.announced) continue;
            notif.announced = true;
            if (!isVoiceOn) continue;

            let utterance;

            if (notif.n === 'price') {
                utterance = getUtteranceForPriceChange(notif);
            } else {
                const ticker = notif.ticker;
                const settings = getSettings(ticker);
                if (!settings.audio) continue;
                utterance = getUtterance(notif, isDollar);
            }

            synth.speak(utterance);
        }
    }, [notifications]);

    return (
        <>{children}</>
    )
}

export default VoicingComponent;