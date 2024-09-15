import { useState } from 'react'

const Login = ({ onSubmit }) => {
    const [ticker, setTicker] = useState("");
    const [size, setSize] = useState("");
    const [range, setRange] = useState("");

    return (
        <div>
            <h1> Settings </h1>
            <form
                onSubmit = {(e) => {
                    e.preventDefault();
                    onSubmit(ticker, size, range);
                }}
            >
                <input
                    type="text"
                    value={ticker}
                    placeholder="Ticker"
                    onChange={(e) => setTicker(e.target.value)}
                />

                <input
                    type="text"
                    value={size}
                    placeholder="Size"
                    onChange={(e) => setSize(e.target.value)}
                />

                <input
                    type="text"
                    value={range}
                    placeholder="range %"
                    onChange={(e) => setRange(e.target.value)}
                />

                <input type="submit"></input>
            </form>
        </div>
    )
}

export default Login;