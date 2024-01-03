import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
import { env } from '../constant.js';

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        validate: {
            validator: async function (username) {
                // check if  already exist in db
                let user = await UserModel.findOne({ username }, '_id');
                env.NODE_ENV && console.log(user);
                if (user) return false;
                else return true;
            },
            message: props => `${props.value} is not avilable`
        },
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    Avatar: {
        type: String
    },
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
    },
    phone: {
        type: String,
        validate: {
            validator: async function (phone) {
                // check if  already exist in db
                let user = await UserModel.findOne({ phone }, '_id');
                env.NODE_ENV && console.log(user);
                if (user) return false;
                else return true;
            },
            message: props => `${props.value} is already associated with another account`
        },
    },
    email: {
        type: String,
        validate: {
            validator: async function (email) {
                // check if  already exist in db
                let user = await UserModel.findOne({ email }, '_id');
                env.NODE_ENV && console.log(user);
                if (user) return false;
                else return true;
            },
            message: props => `${props.value} is already associated with another account`
        },
    },

});

// hooks
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
})

// methods
userSchema.method('isValidPassword', async function (password) {
    return await bcrypt.compare(password, this.password);
})

const UserModel = new model('User', userSchema);

export default UserModel;