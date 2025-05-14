import apiService from "./ApiService";

class SubscriptionService {

    async subscribeUser(email, planId) {
        try {
            const response = apiService.subscribe(email, planId);
        } catch (error) {
            
        }
    }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;