import {Hotel} from "../../../hotels/domain/model/hotel.entity.js";

export class Room {
    constructor({ id = null, price = 0, type_room = '',
                hotels_id = null, hotels = null }){
        this.id = id;
        this.price = price;
        this.type_room = type_room;
        this.hotels_id = hotels_id;
        this.hotels = hotels instanceof Hotel ? hotels : null;
    }
}