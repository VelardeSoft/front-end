import {BaseApi} from "../../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../../shared/infrastructure/base-endpoint.js";

const roomsEndpointPath = import.meta.env.VITE_ROOMS_ENDPOINT_PATH;

/**
 * RoomApi class to handle API operations for Rooms context.
 * @class
 * @extends BaseApi
 */
export class RoomApi extends BaseApi {
    /**
     * @type {BaseEndpoint}
     * @private
     */
    #roomsEndpoint;

    /**
     * Initializes endpoints for rooms.
     */
    constructor() {
        super();
        this.#roomsEndpoint = new BaseEndpoint(this, roomsEndpointPath);
    }

    /**
     * Fetches all rooms.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the rooms' response.
     */
    getRooms() {
        return this.#roomsEndpoint.getAll();
    }

    /**
     * Fetches a room by its ID.
     * @param {number|string} id - The ID of the room.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the room response.
     */
    getRoomById(id) {
        return this.#roomsEndpoint.getById(id);
    }

    /**
     * Creates a new room.
     * @param {Object} resource - The room data to create.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the created room response.
     */
    createRoom(resource) {
        return this.#roomsEndpoint.create(resource);
    }

    /**
     * Updates an existing room.
     * @param {Object} resource - The room data to update (must include id).
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the updated room response.
     */
    updateRoom(resource) {
        return this.#roomsEndpoint.update(resource.id, resource);
    }

    /**
     * Deletes a room by its ID.
     * @param {number|string} id - The ID of the room to delete.
     * @returns {Promise<import('axios').AxiosResponse>} Promise resolving to the delete response.
     */
    deleteRoom(id) {
        return this.#roomsEndpoint.delete(id);
    }
}
