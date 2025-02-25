import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import Main from './components/main/Main';
import Login from './components/login/Login';
import SignUp from './components/login/SignUp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route index element={
                    <PrivateRoute Component={Main} />
                }
                />
                <Route path="login" element={<Login />} />
                <Route path="signup" element={<SignUp />} />
                <Route path="main" element={
                    <PrivateRoute Component={Main} />
                }
                />
                <Route path="*" element={<h1>There's nothing here: 404!</h1>} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);