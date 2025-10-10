import {BaseApi} from "../../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";

const usersEndpointPath    = import.meta.env.VITE_USERS_ENDPOINT_PATH;

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
export class UsersApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #usersEndpoint;

    /**
     * Initializes endpoints for categories and tutorials.
     */
    constructor() {
        super();
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
    }

    /**
     * Fetches all categories.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the categories' response.
     */
    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    /**
     * Fetches a category by its ID.
     * @param {number|string} id - The ID of the category.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the category response.
     */
    getCategoryById(id) {
        return this.#usersEndpoint.getById(id);
    }

    /**
     * Creates a new category.
     * @param {Object} resource - The category data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created category response.
     */
    createUsers(resource) {
        return this.#usersEndpoint.create(resource);
    }

    /**
     * Updates an existing category.
     * @param {Object} resource - The category data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated category response.
     */
    updateCategory(resource) {
        return this.#usersEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a category by its ID.
     * @param {number|string} id - The ID of the category to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteCategory(id) {
        return this.#usersEndpoint.delete(id);
    }
}
