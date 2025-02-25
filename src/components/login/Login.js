import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logInUser } from './Authentication';
import './Login.css'

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {

            await logInUser(username, password);
            navigate('/main')

        } catch (err) {
            if (err.message === "Request failed with status code 403") {
                setError('Не удалось войти в аккаунт. Нерпавильный имейл или пароль.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        navigate('/signup')
    }

    const handleInputFocus = (id) => {
        let placeholder = null;
        if (id) {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        } else {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        }
        placeholder.classList.add('active');
    }

    const handleInputChange = (event, id) => {
        let placeholder = null;
        if (id) {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        } else {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        }

        let value = event.target.value;
        if (value !== '') placeholder.classList.add('active');
        else placeholder.classList.remove('active');
    }

    const handleInputBlur = (event, id) => {
        let placeholder = null;
        if (id) {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        } else {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        }
        let currentValue = event.target.value;
        if (currentValue !== '') return;
        placeholder.classList.remove('active');
    }

    return (
        <div className="login-layout">
            <form className='login-container' onSubmit={handleSubmit}>
                <h3 className='login-title'> Войти в аккаунт</h3>
                {error && <p className='login-error-message'> {error} </p>}

                <div className='login-input-elements'>
                    <div className='form-input' id='emailInput'>
                        <input className='login-input' type='text' required
                            onChange={e => {
                                setUsername(e.target.value)
                                handleInputChange(e, 'emailInput')
                            }}
                            onFocus={() => handleInputFocus('emailInput')}
                            onBlur={(e) => handleInputBlur(e, 'emailInput')}
                        />
                        <span className='form-placeholder'> Email </span>
                        <span className="material-symbols-outlined form-icon"> mail </span>
                    </div>  
                    <div className='form-input' id='passwordInput'>
                        <input className='login-input' type='password' required
                            onChange={e => {
                                setPassword(e.target.value)
                                handleInputChange(e, 'passwordInput')
                            }}
                            onFocus={() => handleInputFocus('passwordInput')}
                            onBlur={(e) => handleInputBlur(e, 'passwordInput')}
                        />
                        <span className='form-placeholder'> Пароль </span>
                        <span className="material-symbols-outlined form-icon"> lock </span>
                    </div>
                </div>

                <button className='form-button submit-button' type='submit'>
                    {loading ? 'Вход...' : 'Войти'}
                </button>

                <div className='secondary-button-container'>
                    <span style={{ color: 'grey' }}> Еще не зарегистрированы? </span>
                    <button className='form-button secondary-button' type="button" onClick={handleSignUp}> Зарегистрироваться </button>
                </div>
            </form>
        </div>
    );
};

export default Login;