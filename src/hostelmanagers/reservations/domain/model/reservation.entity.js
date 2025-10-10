import {User} from "../../../users/domain/model/user.entity.js";
import {Room} from "../../../rooms/domain/model/room.entity.js";

export class Reservation {
    constructor({ id = null, start_date = '', end_date = '',
                users_id = null, rooms_id = null, users = null, rooms = null }) {
        this.id = id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.users_id = users_id;
        this.rooms_id = rooms_id;
        this.users = users instanceof User ? users : null;
        this.rooms = rooms instanceof Room ? rooms : null;
    }
}