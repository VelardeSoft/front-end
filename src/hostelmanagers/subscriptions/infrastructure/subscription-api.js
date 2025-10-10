import {BaseApi} from "../../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";

const subscriptionsEndpointPath = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH;

/**
 * SubscriptionsApi class to handle API operations for Subscriptions context.
 * @class
 * @extends BaseApi
 */
export class SubscriptionsApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #subscriptionsEndpoint;

    /**
     * Initializes endpoints for subscriptions.
     */
    constructor() {
        super();
        this.#subscriptionsEndpoint = new BaseEndpoint(this, subscriptionsEndpointPath);
    }

    /**
     * Fetches all subscriptions.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the subscriptions' response.
     */
    getSubscriptions() {
        return this.#subscriptionsEndpoint.getAll();
    }

    /**
     * Fetches a subscription by its ID.
     * @param {number|string} id - The ID of the subscription.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the subscription response.
     */
    getSubscriptionById(id) {
        return this.#subscriptionsEndpoint.getById(id);
    }

    /**
     * Creates a new subscription.
     * @param {Object} resource - The subscription data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created subscription response.
     */
    createSubscription(resource) {
        return this.#subscriptionsEndpoint.create(resource);
    }

    /**
     * Updates an existing subscription.
     * @param {Object} resource - The subscription data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated subscription response.
     */
    updateSubscription(resource) {
        return this.#subscriptionsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a subscription by its ID.
     * @param {number|string} id - The ID of the subscription to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteSubscription(id) {
        return this.#subscriptionsEndpoint.delete(id);
    }
}
