import {BaseApi} from "../../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";

const hotelsEndpointPath = import.meta.env.VITE_HOTELS_ENDPOINT_PATH;

/**
 * HotelsApi class to handle API operations for Hotels context.
 * @class
 * @extends BaseApi
 */
export class HotelsApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #hotelsEndpoint;

    /**
     * Initializes endpoints for hotels.
     */
    constructor() {
        super();
        this.#hotelsEndpoint = new BaseEndpoint(this, hotelsEndpointPath);
    }

    /**
     * Fetches all hotels.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the hotels' response.
     */
    getHotels() {
        return this.#hotelsEndpoint.getAll();
    }

    /**
     * Fetches a hotel by its ID.
     * @param {number|string} id - The ID of the hotel.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the hotel response.
     */
    getHotelById(id) {
        return this.#hotelsEndpoint.getById(id);
    }

    /**
     * Creates a new hotel.
     * @param {Object} resource - The hotel data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created hotel response.
     */
    createHotel(resource) {
        return this.#hotelsEndpoint.create(resource);
    }

    /**
     * Updates an existing hotel.
     * @param {Object} resource - The hotel data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated hotel response.
     */
    updateHotel(resource) {
        return this.#hotelsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a hotel by its ID.
     * @param {number|string} id - The ID of the hotel to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteHotel(id) {
        return this.#hotelsEndpoint.delete(id);
    }
}
