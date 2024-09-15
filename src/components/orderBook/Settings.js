import { useState } from 'react'

const Settings = ({ onSubmit }) => {
    const [ticker, setTicker] = useState("");
    const [size, setSize] = useState("");
    const [range, setRange] = useState("");

    return (
        <>
            <form className='settings-form'
                onSubmit = {(e) => {
                    e.preventDefault();
                    onSubmit(ticker, size, range);
                }}
            >
                <input className='settings-input'
                    type="text"
                    value={ticker}
                    placeholder="Ticker"
                    onChange={(e) => setTicker(e.target.value)}
                />

                <input className='settings-input'
                    type="text"
                    value={size}
                    placeholder="Size"
                    onChange={(e) => setSize(e.target.value)}
                />

                <input className='settings-input'
                    type="text"
                    value={range}
                    placeholder="range %"
                    onChange={(e) => setRange(e.target.value)}
                />

                <div className='settings-submit-container settings-input'> 
                    <input type="submit" className='settings-submit-input'/>
                </div>

            </form>
        </>
    )
}

export default Settings;