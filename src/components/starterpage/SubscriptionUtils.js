
function getSubscriptionStatus(subscription) {
    switch (subscription.status) {
        case 'ACTIVE': return (
            <span className='green-highlighted-text'> активен </span>   
        )

        case 'EXPIRED': return (
            <span className='red-highlighted-text'> просрочен </span>
        )

        case 'CANCELED': return (
            <span className='red-highlighted-text'> отменен </span>
        )

        case 'IDLE': return (
            <span className='yellow-highlighted-text'> ожидание оплаты </span>
        )

        default: 
            console.error('Unknown subscription status: ', subscription.status);
            return (
                <span className='red-highlighted-text'> ошибка </span>
            )
    }
}

const getRenewRate = (plan) => {
    switch (plan.duration) {
        case "DAY" : return 'День'
        case "WEEK" : return 'Неделю'
        case "MONTH" : return 'Месяц'
        case "YEAR" : return 'Год'
        default: 
            console.error('Unknown subscription plan duration: ', plan.duration);
            return 'Месяц'
    }
}

export { getSubscriptionStatus, getRenewRate }