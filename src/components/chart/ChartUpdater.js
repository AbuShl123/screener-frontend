import { useCallback, useEffect } from "react";
import useApiContext from "../context/ApiContext";

const N = 9;
const RED = '#ef53506b';
const GREEN = '#26a69974';

const ChartUpdater = ({ charts, onSymbolsUpdate }) => {

    const { gVolume, setGVolume, openInterestEvent } = useApiContext();

    const extractCandleAndVolume = useCallback((kline) => {
        const candle = {
            time: kline[0] / 1000,
            open: parseFloat(kline[1]),
            high: parseFloat(kline[2]),
            low: parseFloat(kline[3]),
            close: parseFloat(kline[4]),
        };

        const volume = {
            time: candle.time,
            value: parseFloat(kline[5]),
            color: candle.close > candle.open ? GREEN : RED,
        }

        return { candle, volume }
    }, []);

    const formatData = useCallback((klines) => {
        const candleData = [];
        const volumeData = [];

        for (const kline of klines) {
            const { candle, volume } = extractCandleAndVolume(kline);
            candleData.push(candle);
            volumeData.push(volume);
        }

        return { candleData, volumeData }
    }, [extractCandleAndVolume]);

    const updateCharts = useCallback((data) => {

        let i = N - 1;

        Object.entries(data).forEach(([key, values]) => {
            if (key === "n") return;
            
            const { candleSeries, volumeSeries } = charts[i];
            const { candleData, volumeData } = formatData(values);
        
            candleSeries.setData(candleData);
            volumeSeries.setData(volumeData);
            onSymbolsUpdate(key, i);

            i--;
        });

    }, [formatData, extractCandleAndVolume]);

    useEffect(() => {
        if (!gVolume) return;
        console.log("GVolume changed");
        updateCharts(gVolume);
    }, [gVolume, updateCharts]);

    useEffect(() => {
        if (!openInterestEvent || openInterestEvent.n !== 'kline') return;
        console.log("Open Interest event is here");
        setGVolume(openInterestEvent);
    }, [openInterestEvent, updateCharts]);

    return null;
}

export default ChartUpdater;