import {BaseApi} from "../../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";

const reservationsEndpointPath = import.meta.env.VITE_RESERVATIONS_ENDPOINT_PATH;

/**
 * ReservationApi class to handle API operations for Reservations context.
 * @class
 * @extends BaseApi
 */
export class ReservationApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #reservationsEndpoint;

    /**
     * Initializes endpoints for reservations.
     */
    constructor() {
        super();
        this.#reservationsEndpoint = new BaseEndpoint(this, reservationsEndpointPath);
    }

    /**
     * Fetches all reservations.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the reservations' response.
     */
    getReservations() {
        return this.#reservationsEndpoint.getAll();
    }

    /**
     * Fetches a reservation by its ID.
     * @param {number|string} id - The ID of the reservation.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the reservation response.
     */
    getReservationById(id) {
        return this.#reservationsEndpoint.getById(id);
    }

    /**
     * Creates a new reservation.
     * @param {Object} resource - The reservation data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created reservation response.
     */
    createReservation(resource) {
        return this.#reservationsEndpoint.create(resource);
    }

    /**
     * Updates an existing reservation.
     * @param {Object} resource - The reservation data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated reservation response.
     */
    updateReservation(resource) {
        return this.#reservationsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a reservation by its ID.
     * @param {number|string} id - The ID of the reservation to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteReservation(id) {
        return this.#reservationsEndpoint.delete(id);
    }
}
