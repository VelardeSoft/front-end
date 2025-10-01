import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint";
import { BaseApi } from "../../../shared/infrastructure/base-api";
import { Subscription } from "../domain/model/Subscription";

/**
 * SubscriptionRepository for accessing subscription data from API
 */
export class SubscriptionRepository {
    constructor() {
        const baseApi = new BaseApi();
        this.endpoint = new BaseEndpoint(
            baseApi,
            import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH
        );
    }

    /**
     * Get all subscriptions
     * @returns {Promise<Subscription[]>} Array of Subscription entities
     */
    async findAll() {
        try {
            const response = await this.endpoint.getAll();
            return response.data.map(subscription =>
                Subscription.fromPrimitives(subscription)
            );
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            return [];
        }
    }

    /**
     * Get subscription by id
     * @param {number} id - Subscription identifier
     * @returns {Promise<Subscription|null>} Subscription entity
     */
    async findById(id) {
        try {
            const response = await this.endpoint.getById(id);
            return Subscription.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error fetching subscription with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Get subscription plans (templates) without user assignment
     * @returns {Promise<Subscription[]>} Array of Subscription plan entities
     */
    async findAllPlans() {
        try {
            const subscriptions = await this.findAll();
            return subscriptions.filter(sub => !sub.userId);
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
            return [];
        }
    }

    /**
     * Get active subscriptions for a user
     * @param {number} userId - User identifier
     * @returns {Promise<Subscription|null>} User's active subscription
     */
    async findByUserId(userId) {
        try {
            const subscriptions = await this.findAll();
            const userSubscription = subscriptions.find(
                sub => sub.userId === userId && sub.status === 'active'
            );
            return userSubscription || null;
        } catch (error) {
            console.error(`Error fetching subscriptions for user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Create a new subscription
     * @param {Object} subscriptionData - Subscription data
     * @returns {Promise<Subscription|null>} Created Subscription entity
     */
    async create(subscriptionData) {
        try {
            const response = await this.endpoint.create(subscriptionData);
            return Subscription.fromPrimitives(response.data);
        } catch (error) {
            console.error('Error creating subscription:', error);
            return null;
        }
    }

    /**
     * Update an existing subscription
     * @param {number} id - Subscription identifier
     * @param {Object} subscriptionData - Subscription data to update
     * @returns {Promise<Subscription|null>} Updated Subscription entity
     */
    async update(id, subscriptionData) {
        try {
            const response = await this.endpoint.update(id, subscriptionData);
            return Subscription.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error updating subscription with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Subscribe a user to a plan
     * @param {number} userId - User identifier
     * @param {number} planId - Plan identifier
     * @returns {Promise<Subscription|null>} Created user subscription
     */
    async subscribeToPlan(userId, planId) {
        try {
            // Get the plan details
            const plan = await this.findById(planId);
            if (!plan) {
                throw new Error(`Plan with id ${planId} not found`);
            }

            // Calculate start and end dates
            const startDate = new Date().toISOString();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.duration_months);

            // Create the new subscription
            const subscriptionData = {
                userId,
                plan: plan.plan,
                cant_rooms: plan.cant_rooms,
                duration_months: plan.duration_months,
                startDate,
                endDate: endDate.toISOString(),
                status: 'active',
                price: plan.price
            };

            return await this.create(subscriptionData);
        } catch (error) {
            console.error(`Error subscribing user ${userId} to plan ${planId}:`, error);
            return null;
        }
    }

    /**
     * Check if user has an active subscription
     * @param {number} userId - User identifier
     * @returns {Promise<boolean>} True if user has an active subscription
     */
    async hasActiveSubscription(userId) {
        const subscription = await this.findByUserId(userId);
        return subscription !== null && subscription.isActive();
    }
}
