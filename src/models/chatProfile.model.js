import mongoose from 'mongoose';

const frindsSchmea = new mongoose.Schema({
    status: { type: String, enum: ['IN', 'OUT', 'FRIEND', 'NEW'] },
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatProfile' }
})

const chatProfileSchema = mongoose.Schema({
    username: { type: String, unique: true },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    lastSeen: { type: String, default: "" },
    about: { type: String, default: "" },
    socketId: { type: String, default: "" },
    friends: [frindsSchmea],
})

const ChatProfileModel = new mongoose.model('ChatProfile', chatProfileSchema);

export default ChatProfileModel;