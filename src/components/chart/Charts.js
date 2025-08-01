import React, { useCallback, useEffect, useMemo, useState } from "react";
import './Charts.css';
import { createChart, CandlestickSeries, CrosshairMode, HistogramSeries, createTextWatermark } from 'lightweight-charts';
import ChartUpdater from "./ChartUpdater";

const N = 9;
const RED = '#ff27236b';
const GREEN = '#1acbba74';

const Charts = () => {

    const [charts, setCharts] = useState([]);
    const [mSymbols, setMSymbols] = useState(Array.from({ length: N }, () => ''));
    const refs = useMemo(() => Array.from({ length: N }, () => React.createRef()), []);

    useEffect(() => {
        if (!charts.length) return;

        const observer = new ResizeObserver(() => {
            charts.forEach(({ chart }, i) => {
                const ref = refs[i]?.current;
                if (chart && ref) {
                    chart.resize(ref.clientWidth, ref.clientHeight);
                }
            });
        });

        const container = document.querySelector('.charts-container');
        if (container) {
            observer.observe(container);
        }

        return () => {
            if (container) observer.unobserve(container);
        };
    }, [charts, refs]);

    const initChart = useCallback((ref) => {
        if (!ref.current) return null;

        const chart = createChart(ref.current, {
            width: ref.current.clientWidth,
            height: ref.current.height,
            attributionLogo: false,
            layout: {
                background: { color: '#0a0910ff' },
                textColor: '#ffffffaa'
            },
            grid: {
                vertLines: { color: '#24242dff' },
                horzLines: { color: '#24242dff' }
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            watermark: {
                visible: false
            },
        });

        const candleSeries = chart.addSeries(CandlestickSeries, {
            priceScaleId: 'right',
            upColor: GREEN,
            downColor: RED,
            borderVisible: false,
            wickUpColor: GREEN,
            wickDownColor: RED,
            priceFormat: {
                type: 'price',
                precision: 6,
                minMove: 0.000001, 
            },
            lastValueVisible: true,
            priceLineVisible: false,
            priceLineColor: '#c2c2c2ff',
        });

        candleSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.1, // highest point of the series will be 10% away from the top
                bottom: 0.4, // lowest point will be 40% away from the bottom
            },
        });

        const volumeSeries = chart.addSeries(HistogramSeries, {
            priceScaleId: '',
            priceFormat: {
                type: 'volume',
            },
            lastValueVisible: false,
            priceLineVisible: false,
        });

        volumeSeries.priceScale().applyOptions({
            scaleMargins: {
                top: 0.8,
                bottom: 0,
            },
        });

        return { chart, candleSeries, volumeSeries };
    }, []);

    useEffect(() => {
        console.log("Running init chart");
        const chartObjs = refs.map(ref => initChart(ref)).filter(Boolean);
        setCharts(chartObjs);
        return () => {
            chartObjs.forEach(obj => obj?.chart?.remove());
        };
    }, [initChart]);

    const updateSymbols = useCallback((mSymbol, i) => {
        setMSymbols(prev => {
            const copy = [...prev];
            copy[i] = mSymbol;
            return copy;
        })
    }, []);

    useEffect(() => {
        if (!charts || !Array.isArray(charts) || charts.length !== N) return;
        for (let i = 0; i < N; i++) {
            const ch = charts[i];
            const chart = ch.chart;

            if (ch.watermark) ch.watermark.detach();;

            const firstPane = chart.panes()[0];
            const watermark = createTextWatermark(firstPane, {
                horzAlign: 'center',
                vertAlign: 'top',
                lines: [
                    {
                        text: `${mSymbols[i].replace('usdt', '').toUpperCase()}`,
                        color: '#494753',
                        fontSize: 30,
                    },
                ],
            });
            
            setCharts(prev => {
                const ch = [...prev];
                ch[i] = {...ch[i], watermark};
                return ch;
            });
        }
    }, [mSymbols]);

    return (
        <div className='charts-container'>
            {Array.from({ length: N }, (_, i) => (
                <div key={i} className="chart-box">
                    <div ref={refs[i]} className="chart"></div>
                </div>
            ))}
            {charts && Array.isArray(charts) && charts.length === N && 
                <ChartUpdater charts={charts} onSymbolsUpdate={updateSymbols}/>
            }
        </div>
    )
}

export default Charts;