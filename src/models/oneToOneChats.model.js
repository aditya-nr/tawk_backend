import { Schema, model } from 'mongoose';

const chatsSchmea = new Schema({
    from: String,
    type: { type: String, enum: ['TEXT', 'IMAGE'], default: 'TEXT' },
    message: { type: String, default: "" },
    key: String
})

const oneToOneChatsSchmea = new Schema({
    participants: [String],
    chats: [chatsSchmea],
    messageCount: [{ username: String, count: { type: Number, default: 0 } }]
})

const OneToOneChatModel = model('OneToOneChats', oneToOneChatsSchmea);
export default OneToOneChatModel;

