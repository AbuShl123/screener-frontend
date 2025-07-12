import {useEffect} from "react";
import { setSpeech, getUtterance, getUtteranceForPriceChange } from '../../utils/Utils'
import useCacheContext from "./Context";
import useApiContext from "./ApiContext";

const synth = window.speechSynthesis

const VoicingComponent = ({children}) => {

    const {settings} = useApiContext();
    const {notifications, isDollar, isVoiceOn} = useCacheContext();

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
                const mSymbol = notif.ticker;
                const setting = settings.get(mSymbol) || settings.get('all');
                if (!setting.audio) continue;
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