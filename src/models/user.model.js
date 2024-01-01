const { Schema, model } = require("mongoose");
import bcrypt from 'bcrypt';
import { constant } from '../constant.js';

const userSchema = new Schema({
    firstName: {
        type: String,
        required: [true, 'First Name is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name is required']
    },
    Avatar: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        validate: {
            validator: function (email) {
                return constant.emailRegEx.test(email);
            },
            message: props => `${props.value} is not a valid Email!`
        },
    },
    password: {
        // unselect
        type: String,
    },
    passwordChangedAt: {
        // unselect
        type: Date,
    },
    passwordResetToken: {
        // unselect
        type: String,
    },
    passwordResetExpires: {
        // unselect
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    updatedAt: {
        // unselect
        type: Date,
    },
    // verified: {
    //     type: Boolean,
    //     default: false,
    // },
    // otp: {
    //     type: String,
    // },
    // otp_expiry_time: {
    //     type: Date,
    // },
    // friends: [
    //     {
    //         type: mongoose.Schema.ObjectId,
    //         ref: "User",
    //     },
    // ],
    // socket_id: {
    //     type: String
    // },
    // status: {
    //     type: String,
    //     enum: ["Online", "Offline"]
    // }

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