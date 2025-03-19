import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logInUser } from './Authentication';
import './Login.css'
import '../menu/Menu.css'
import cache from '../../utils/CacheUtils';

const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await logInUser(username, password);
            if (response?.data?.message === 'Email is sent successfully.') {
                setIsEmailSent(true);
                return;
            }

            const token = response.data.token;
            cache.setToken(token);
            navigate('/main')

        } catch (error) {
            let message = error.response?.data?.message || "Произошла ошибка.";

            if (message === 'User is disabled') {
                setError('Пользователь не активирован. Вам отправили письмо на почту, пожалуйста следуйте инструкциям там чтобы активировать аккаунт.');
            } else {
                setError('Не удалось войти в аккаунт. Нерпавильный имейл или пароль.');
            }

        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = useCallback((e) => {
        e.preventDefault();
        navigate('/signup')
    }, []);

    const handleInputFocus = useCallback((id) => {
        let placeholder = null;
        if (id) {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        } else {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        }
        placeholder.classList.add('active');
    }, []);

    const handleInputChange = useCallback((event, id) => {
        let placeholder = null;
        if (id) {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        } else {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        }

        let value = event.target.value;
        if (value !== '') placeholder.classList.add('active');
        else placeholder.classList.remove('active');
    }, []);

    const handleInputBlur = useCallback((event, id) => {
        let placeholder = null;
        if (id) {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        } else {
            placeholder = document.querySelector(`#${id} .form-placeholder`);
        }
        let currentValue = event.target.value;
        if (currentValue !== '') return;
        placeholder.classList.remove('active');
    }, []);

    return (
        <>
            <div className="login-layout" style={{ alignItems: 'center', filter: isEmailSent ? 'blur(3px)' : 'blur(0)'}}>
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

                    <button className='form-button submit-button' type='submit' disabled={isEmailSent}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>

                    <div className='secondary-button-container'>
                        <span style={{ color: 'grey' }}> Еще не зарегистрированы? </span>
                        <button className='form-button secondary-button' type="button" onClick={handleSignUp} disabled={isEmailSent}> 
                            Зарегистрироваться 
                        </button>
                    </div>
                </form>
            </div>
            {isEmailSent ? (
                <div className={'modal-overlay small-modal' + (isEmailSent ? ' open' : '')}>
                    <div className="modal-title-middle">
                        <span className="material-symbols-outlined" style={{ fontSize: '3vw' }}>
                            mail
                        </span>
                        <br />
                        Вам отправлено письмо на почту
                    </div>
                    <div className='modal-content simple-content-container'>
                        <p className='text-container'>
                            Мы вам повторно отправили письмо на почту.
                            Пожалуйста подтвердите свой имейл -
                            откройте письмо присланное вам на почту и следуйте инструкциям для активации аккаунта.
                        </p>
                        <div className='submit-buttons-middle'>
                            <button type="submit" className='screener-submit-button' onClick={() => setIsEmailSent(false)}>
                                Готово
                            </button>
                        </div>
                    </div>
                </div>
            ) : (<></>)}
        </>
    );
};

export default Login;