import {User} from "../../../users/domain/model/user.entity.js";

export class Hotel {
    constructor({ id = null, name = '', imagen = '',
                address = '', phone = '', users_id = null, users = null }) {
        this.id = id;
        this.name = name;
        this.imagen = imagen;
        this.address = address;
        this.phone = phone;
        this.users_id = users_id;
        this.users = users instanceof User ? users : null;
    }
}