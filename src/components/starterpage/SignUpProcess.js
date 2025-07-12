import React, { useCallback, useState } from 'react'
import StarterPage from './StarterPage';
import SubscriptionPlans from './SubscriptionPlans';
import SignUp from './SignUp';

const SignUpProcess = () => {

    const [form, setForm] = useState({
        subscription: undefined,
        account: undefined,
    });

    const setSubscription = useCallback((plan) => {
        setForm(prev => ({
            ...prev,
            subscription: plan,
        }));
    }, []);

    return (
        <>
            {
                form.subscription === undefined ? (
                    <StarterPage>
                        <SubscriptionPlans onSelection={(plan) => setSubscription(plan)}/>
                    </StarterPage>
                ) : (
                    <StarterPage>
                        <SignUp plan={form.subscription}/>
                    </StarterPage>
                )
            }
        </>
    )
}

export default SignUpProcess;