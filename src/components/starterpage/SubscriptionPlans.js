import React, { useCallback, useEffect, useState } from 'react';
import './Subscription.css'
import apiService from '../../api/ApiService';

const SubscriptionPlans = ({onSelection}) => {

    const [plans, setPlans] = useState([]);

    useEffect(() => {
        const setSubscripionPlans = async () => {
            try {
                const response = await apiService.fetchSubscriptionPlans();
                setPlans(response.data);
            } catch (error) {
                console.error("Failed to fetch subscription plans: ", error);
            }
        }
        setSubscripionPlans();
    }, []);

    const getPlanName = useCallback((name) => {
        if (name.includes('скидка')) {
            let firstPart = name.substring(0, name.indexOf('скидка'));
            let discountPart = name.substring(name.indexOf('скидка'));
            return (
                <span className='plan-name'>
                    {firstPart}
                    <b style={{color: 'rgb(255 145 145)'}}> {discountPart} </b>
                </span>
            )
        } else {
            return (
                <span className='plan-name'> {name} </span>
            )
        }
    }, []);

    const handleSelection = useCallback((plan) => {
        onSelection(plan)
    }, []);

    return (
        <>
            <div className='plans-container'>
                <div className='plans-upper-content'>
                    <h3>Выберите свой план</h3>
                    <p>
                        Оформите подписку и создайте аккаунт
                    </p>
                </div>
                <div className='plans-middle-container'>
                    <div className='grid-container'>
                        {plans.map((data, index) => (
                           <div key={index} className='subscription-plan animated-box-fadeInLeft'> 
                                <div>
                                    {getPlanName(data.name)}
                                    <h3 className='plan-price'> ${data.price} </h3>
                                    <p className='plan-description'> {data.description} </p>
                                </div>
                                <div className='plan-buttons'> 
                                    <button className='transparent-submit-button' onClick={() => handleSelection(data)}>
                                        Выбрать План 
                                        <span className='material-symbols-outlined small-icon button-icon'> 
                                            arrow_forward_ios
                                        </span>
                                    </button>
                                </div>
                           </div>                         
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
};

export default SubscriptionPlans;