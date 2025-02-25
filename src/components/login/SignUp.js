import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logInUser } from './Authentication';
import './Login.css'

const SignUp = () => {
    const navigate = useNavigate();
    const [lastname, setLastname] = useState('');
    const [firstname, setFirstname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [retypePassword, setRetypePassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('Пока что в разработке :(');
    };

    const handleSignIn = (e) => {
        e.preventDefault();
        navigate('/login')
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
                <h3 className='login-title'>Создать аккаунт</h3>
                {error && <p className='login-error-message'> {error} </p>}

                <div className='login-input-elements'>
                    <div className='form-input' id='firstnameInput'>
                        <input className='login-input' type='text' required
                            onChange={e => {
                                setFirstname(e.target.value)
                                handleInputChange(e, 'firstnameInput')
                            }} 
                            onFocus={() => handleInputFocus('firstnameInput')}
                            onBlur={(e) => handleInputBlur(e, 'firstnameInput')}
                        />
                        <span className='form-placeholder'> Имя </span>
                    </div>
                    <div className='form-input' id='lastnameInput'>
                        <input className='login-input' type='text' required
                            onChange={e => {
                                setLastname(e.target.value)
                                handleInputChange(e, 'lastnameInput')
                            }} 
                            onFocus={() => handleInputFocus('lastnameInput')}
                            onBlur={(e) => handleInputBlur(e, 'lastnameInput')}
                        />
                        <span className='form-placeholder'> Фамилия </span>
                    </div>
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
                    <div className='form-input' id='retypePasswordInput'>
                        <input className='login-input' type='password' required 
                                onChange={e => {
                                    setRetypePassword(e.target.value)
                                    handleInputChange(e, 'retypePasswordInput')
                                }} 
                                onFocus={() => handleInputFocus('retypePasswordInput')}
                                onBlur={(e) => handleInputBlur(e, 'retypePasswordInput')}
                        />
                        <span className='form-placeholder'> Повторите пароль </span>
                        <span className="material-symbols-outlined form-icon"> lock </span>
                    </div>
                </div>

                <button className='form-button submit-button' type="submit"> Зарегистрироваться </button>

                <div className='secondary-button-container'>
                    <span style={{color: 'grey'}}> Уже есть аккаунт? </span>
                    <button className='form-button secondary-button' type="button" onClick={handleSignIn}> Войти </button>
                </div>
            </form>
        </div>
    );
}

export default SignUp;