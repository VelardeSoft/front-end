/**
 * Subscription entity representing a subscription plan
 * @class
 */
export class Subscription {
    /**
     * @param {number} id - Subscription identifier
     * @param {string} plan - Plan type (Basic, Standard, Premium)
     * @param {number} cant_rooms - Maximum number of rooms allowed
     * @param {number} duration_months - Duration in months
     * @param {number} price - Price in local currency
     * @param {string[]|null} features - Features included in this subscription
     * @param {number|null} userId - User ID if this is an active subscription
     * @param {string|null} startDate - Start date of the subscription
     * @param {string|null} endDate - End date of the subscription
     * @param {string|null} status - Status of the subscription
     */
    constructor(id, plan, cant_rooms, duration_months, price, features = null, userId = null, startDate = null, endDate = null, status = null) {
        this.id = id;
        this.plan = plan;
        this.cant_rooms = cant_rooms;
        this.duration_months = duration_months;
        this.price = price;
        this.features = features;
        this.userId = userId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }

    /**
     * Creates a new Subscription instance from raw data
     * @param {Object} data - Raw subscription data
     * @returns {Subscription} Subscription instance
     */
    static fromPrimitives(data) {
        return new Subscription(
            data.id,
            data.plan,
            data.cant_rooms,
            data.duration_months,
            data.price,
            data.features || null,
            data.userId || null,
            data.startDate || null,
            data.endDate || null,
            data.status || null
        );
    }

    /**
     * Converts Subscription instance to primitive object
     * @returns {Object} Plain object representation
     */
    toPrimitives() {
        return {
            id: this.id,
            plan: this.plan,
            cant_rooms: this.cant_rooms,
            duration_months: this.duration_months,
            price: this.price,
            features: this.features,
            userId: this.userId,
            startDate: this.startDate,
            endDate: this.endDate,
            status: this.status
        };
    }

    /**
     * Checks if the subscription is active
     * @returns {boolean} True if subscription is active
     */
    isActive() {
        if (!this.status || !this.endDate) {
            return false;
        }
        return this.status === 'active' && new Date(this.endDate) > new Date();
    }

    /**
     * Gets the remaining days of subscription
     * @returns {number} Number of days remaining
     */
    getRemainingDays() {
        if (!this.isActive()) {
            return 0;
        }

        const today = new Date();
        const endDate = new Date(this.endDate);
        const diff = endDate.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
}
