import { BaseEndpoint } from "../../../shared/infrastructure/base-endpoint";
import { BaseApi } from "../../../shared/infrastructure/base-api";
import { User } from "../domain/model/User";

/**
 * UserRepository for accessing user data from API
 */
export class UserRepository {
    constructor() {
        const baseApi = new BaseApi();
        this.endpoint = new BaseEndpoint(
            baseApi,
            import.meta.env.VITE_USERS_ENDPOINT_PATH
        );
        this.localStorageKey = 'currentUser';
    }

    /**
     * Get all users
     * @returns {Promise<User[]>} Array of User entities
     */
    async findAll() {
        try {
            const response = await this.endpoint.getAll();
            return response.data.map(user => User.fromPrimitives(user));
        } catch (error) {
            console.error('Error fetching users:', error);
            return [];
        }
    }

    /**
     * Get user by id
     * @param {number} id - User identifier
     * @returns {Promise<User|null>} User entity
     */
    async findById(id) {
        try {
            const response = await this.endpoint.getById(id);
            return User.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error fetching user with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<User|null>} Created User entity
     */
    async create(userData) {
        try {
            const response = await this.endpoint.create(userData);
            return User.fromPrimitives(response.data);
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    }

    /**
     * Update an existing user
     * @param {number} id - User identifier
     * @param {Object} userData - User data to update
     * @returns {Promise<User|null>} Updated User entity
     */
    async update(id, userData) {
        try {
            const response = await this.endpoint.update(id, userData);
            return User.fromPrimitives(response.data);
        } catch (error) {
            console.error(`Error updating user with id ${id}:`, error);
            return null;
        }
    }

    /**
     * Delete a user
     * @param {number} id - User identifier
     * @returns {Promise<boolean>} True if deleted successfully
     */
    async delete(id) {
        try {
            await this.endpoint.delete(id);
            return true;
        } catch (error) {
            console.error(`Error deleting user with id ${id}:`, error);
            return false;
        }
    }

    /**
     * Login a user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<User|null>} User entity if login successful
     */
    async login(email, password) {
        try {
            const users = await this.findAll();
            const user = users.find(
                u => u.email === email && u.password === password
            );

            if (user) {
                this.saveToLocalStorage(user.toPrimitives());
                return user;
            }
            return null;
        } catch (error) {
            console.error('Error logging in:', error);
            return null;
        }
    }

    /**
     * Register a new user
     * @param {Object} userData - User data for registration
     * @returns {Promise<User|null>} Created User entity
     */
    async register(userData) {
        return this.create(userData);
    }

    /**
     * Save user data to local storage
     * @param {Object} userData - User data
     * @private
     */
    saveToLocalStorage(userData) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(userData));
    }

    /**
     * Get current user from local storage
     * @returns {User|null} User entity if found
     */
    getCurrentUser() {
        try {
            const userData = localStorage.getItem(this.localStorageKey);
            if (userData) {
                return User.fromPrimitives(JSON.parse(userData));
            }
            return null;
        } catch (error) {
            console.error('Error getting current user from localStorage:', error);
            return null;
        }
    }

    /**
     * Logout current user
     */
    logout() {
        localStorage.removeItem(this.localStorageKey);
    }
}
