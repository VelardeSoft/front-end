import {BaseApi} from "../../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";

const subscriptionsEndpointPath    = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH;

/**
 * PublishingApi class to handle API operations for Publishing context.
 * Extends BaseApi and provides CRUD operations for categories and tutorials.
 *
 * @class
 * @extends BaseApi
 * @example
 * const publishingApi = new PublishingApi();
 * publishingApi.getCategories().then(response => console.log(response.data));
 */
export class SubscriptionsApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #subscriptionsEndpoint;

    /**
     * Initializes endpoints for categories and tutorials.
     */
    constructor() {
        super();
        this.#subscriptionsEndpoint = new BaseEndpoint(this, subscriptionsEndpointPath);
    }

    /**
     * Fetches all categories.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the categories' response.
     */
    getCategories() {
        return this.#subscriptionsEndpoint.getAll();
    }

    /**
     * Fetches a category by its ID.
     * @param {number|string} id - The ID of the category.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the category response.
     */
    getCategoryById(id) {
        return this.#subscriptionsEndpoint.getById(id);
    }

    /**
     * Creates a new category.
     * @param {Object} resource - The category data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created category response.
     */
    createCategory(resource) {
        return this.#subscriptionsEndpoint.create(resource);
    }

    /**
     * Updates an existing category.
     * @param {Object} resource - The category data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated category response.
     */
    updateCategory(resource) {
        return this.#subscriptionsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a category by its ID.
     * @param {number|string} id - The ID of the category to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteCategory(id) {
        return this.#subscriptionsEndpoint.delete(id);
    }
}
