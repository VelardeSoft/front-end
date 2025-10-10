import {Subscription} from "../../../subscriptions/domain/model/subscription.entity.js";

export class User {
    constructor({ id = null, name = '', email = '', password = '',
                type_user = '', subscriptions_id = null, subscription = null }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.type_user = type_user;
        this.subscriptions_id = subscriptions_id; // Corregido para que coincida con db.json
        this.subscription = subscription instanceof Subscription ? subscription : null;
    }
}