import React from 'react'
import api from '../../api/axiosConfig'

import { useState, useEffect } from 'react';

const Home = ({username}) => {

  const[tickers, setTickers] = useState(); 

  const getTickers = async() => {

    try 
    {
      const response = await api.get('/api/v3/ticker/price?symbol=BTCUSDT');
      setTickers(response.data);
    } 
    catch(err) 
    {
      console.log(err);
    }

  }

  useEffect(() => {
    getTickers();

    // Set up an interval to fetch data every second
    const intervalId = setInterval(getTickers, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);

  }, []);

  return (
    <div>
        { tickers ? (
          <div> 
            <p></p>
            <p>{tickers.symbol} : {tickers.price}$</p>
          </div> 
        ) : (
          <p> Loading... </p>
        )}
    </div>
  )
}

export default Home