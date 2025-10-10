import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { SubscriptionsApi } from "../infrastructure/subscription-api.js";
import { SubscriptionAssembler } from "../infrastructure/subscription.assembler.js";
import { Subscription } from "../domain/model/subscription.entity.js";

const subscriptionsApi = new SubscriptionsApi();

const useSubscriptionStore = defineStore('subscriptions', () => {
    const subscriptions = ref([]);
    const currentSubscription = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    // Opciones para los planes de suscripción
    const planTypes = [
        { label: 'Mensual', value: 'mensual' },
        { label: 'Semestral', value: 'semestral' },
        { label: 'Anual', value: 'anual' }
    ];

    const fetchSubscriptions = async () => {
        loading.value = true;
        try {
            const response = await subscriptionsApi.getSubscriptions();
            subscriptions.value = SubscriptionAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            errors.value.push(err);
        } finally {
            loading.value = false;
        }
    };

    const getSubscriptionById = async (id) => {
        loading.value = true;
        try {
            const response = await subscriptionsApi.getSubscriptionById(id);
            return SubscriptionAssembler.toEntityFromResource(response.data);
        } catch (err) {
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const createSubscription = async (subscriptionData) => {
        loading.value = true;
        try {
            console.log("Creando suscripción:", subscriptionData);
            const subscription = new Subscription(subscriptionData);
            const response = await subscriptionsApi.createSubscription(subscription);
            const created = SubscriptionAssembler.toEntityFromResource(response.data);
            subscriptions.value.push(created);
            return created;
        } catch (err) {
            console.error("Error al crear suscripción:", err);
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const updateSubscription = async (subscriptionData) => {
        loading.value = true;
        try {
            const subscription = new Subscription(subscriptionData);
            const response = await subscriptionsApi.updateSubscription(subscription);
            const updated = SubscriptionAssembler.toEntityFromResource(response.data);
            const index = subscriptions.value.findIndex(s => s.id === updated.id);
            if (index !== -1) {
                subscriptions.value[index] = updated;
            }
            return updated;
        } catch (err) {
            errors.value.push(err);
            return null;
        } finally {
            loading.value = false;
        }
    };

    const deleteSubscription = async (id) => {
        loading.value = true;
        try {
            await subscriptionsApi.deleteSubscription(id);
            const index = subscriptions.value.findIndex(s => s.id === id);
            if (index !== -1) {
                subscriptions.value.splice(index, 1);
            }
            return true;
        } catch (err) {
            errors.value.push(err);
            return false;
        } finally {
            loading.value = false;
        }
    };

    const getPlanTypeLabel = (value) => {
        const plan = planTypes.find(plan => plan.value === value);
        return plan ? plan.label : value;
    };

    return {
        subscriptions,
        currentSubscription,
        errors,
        loading,
        planTypes,
        fetchSubscriptions,
        getSubscriptionById,
        createSubscription,
        updateSubscription,
        deleteSubscription,
        getPlanTypeLabel
    };
});

export default useSubscriptionStore;
