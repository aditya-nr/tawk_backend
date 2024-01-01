export class UserDto {
    constructor(doc) {
        this.uid = doc._id;
    }
};
