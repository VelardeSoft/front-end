/**
 * User entity representing a user in the system
 * @class
 */
export class User {
    /**
     * @param {number} id - User identifier
     * @param {string} name - User name
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} user_type - User type (Owner, Visitor)
     * @param {string} phone - User phone number
     * @param {string} address - User address
     * @param {number|null} subscription_id - Subscription identifier
     */
    constructor(id, name, email, password, user_type, phone, address, subscription_id) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.user_type = user_type;
        this.phone = phone;
        this.address = address;
        this.subscription_id = subscription_id;
    }

    /**
     * Creates a new User instance from raw data
     * @param {Object} data - Raw user data
     * @returns {User} User instance
     */
    static fromPrimitives(data) {
        return new User(
            data.id,
            data.name,
            data.email,
            data.password,
            data.user_type,
            data.phone || '',
            data.address || '',
            data.subscription_id || null
        );
    }

    /**
     * Converts User instance to primitive object
     * @returns {Object} Plain object representation
     */
    toPrimitives() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            password: this.password,
            user_type: this.user_type,
            phone: this.phone,
            address: this.address,
            subscription_id: this.subscription_id
        };
    }

    /**
     * Checks if the user is an owner
     * @returns {boolean} True if user is an owner
     */
    isOwner() {
        return this.user_type === 'Owner';
    }

    /**
     * Checks if the user is a visitor
     * @returns {boolean} True if user is a visitor
     */
    isVisitor() {
        return this.user_type === 'Visitor';
    }

    /**
     * Checks if the user has an active subscription
     * @returns {boolean} True if user has a subscription
     */
    hasSubscription() {
        return this.subscription_id !== null;
    }
}
