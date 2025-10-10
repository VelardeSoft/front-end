export class Subscription {
    constructor({
                    id = null, type_plan = '', number_card = '',
                    date = '', cvv = ''
                }) {
        this.id = id;
        this.type_plan = type_plan;
        this.number_card = number_card;
        this.date = date;
        this.cvv = cvv;
    }
}