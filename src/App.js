import './App.css';
import React, {useEffect} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Main from './components/main/Main';
import Login from './components/starterpage/Login';
import StarterPage from './components/starterpage/StarterPage';
import SignUpProcess from './components/starterpage/SignUpProcess';
import Account from './components/account/Account';
import PlanSelection from './components/account/PlanSelection';

function App() {

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--dynamic-bg',
      `url('/images/dynamic${Math.floor(Math.random() * 2) + 1}.webp')`
    );
  }, []);

  return (
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={<PrivateRoute Component={Main} />}/>
                <Route path="login" element={
                        <StarterPage>
                            <Login />
                        </StarterPage>
                }/>
                <Route path="account" element={<PrivateRoute Component={Account}/>}/>
                <Route path="account/planselection" element={<PrivateRoute Component={PlanSelection}/>}/>
                <Route path="signup" element={<SignUpProcess/>}/>
                <Route path="subscribe" element={<SignUpProcess/>}/>
                <Route path="main" element={<PrivateRoute Component={Main} />}/>
                <Route path="*" element={<h1>There's nothing here: 404!</h1>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
  )
}

export default App;
