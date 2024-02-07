import dayjs from "dayjs";
import { ChatProfileModel, OneToOneChatModel, UserModel } from "../models/index.js";
import { JwtService, newFrinedDto } from "../services/index.js";

function mark(text, socket) {
    const { id, user } = socket;
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');

    const date = `${hours}:${minutes}:${seconds}`;

    console.log(`---${text.substring(0, 6)}--> ${id.substring(id.length - 8)} > ${user?.username || ''} > ${date}`)
}
function generateUniqueNumber() {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000); // You can adjust the range as needed
    return `${timestamp}${random}`;
}

// controllers------------------------------------
export const isAuthSocket = (socket, next) => {
    mark('verifying', socket);
    // take token
    const { token } = socket.handshake.auth;
    // jwt verify
    try {
        let user = JwtService.verify(token);
        socket.user = user;
        next();
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const createChatProfile = async (socket, next) => {
    mark('creating', socket);
    // take uid 
    const { username } = socket.user;
    try {

        // 1)get user from ChatProfileModel
        let user = await ChatProfileModel.findOne({ username })
            .populate({
                path: 'friends._id',
                select: 'socketId'
            })

        // 2.1) if user profile is present ->update lastSeen,socketID,and emit all it's friend that it is online
        if (user) {
            // update user
            user.socketId = socket.id;
            user.lastSeen = 'ONLINE';
            // emit lastSeen ONLINE
            user.friends.forEach(friend => {
                if (friend._id.socketId) {
                    socket.to(friend._id.socketId).emit('update-lastSeen', { user: user.username, lastSeen: user.lastSeen });
                }
            })
            await user.save();
        }
        // 2.2) create new profile
        else {
            user = await UserModel.findById(socket.user.uid);
            if (!user)
                throw new Error('No record with this usename is present');
            user = await ChatProfileModel.create({
                name: `${user.firstName} ${user.lastName}`,
                avatar: user.avatar,
                username: user.username,
                lastSeen: 'ONLINE',
                about: "",
                socketId: socket.id,
            })
        }
        // user = await UserModel.findById(uid);
        // user = await ChatProfileModel.findOneAndUpdate(
        //     { username: user.username },
        //     {
        //         $set: {
        //             name: `${user.firstName} ${user.lastName}`,
        //             avatar: user.avatar,
        //             socketId: socket.id,
        //             lastSeen: 'ONLINE'
        //         }
        //     },
        //     { upsert: true, new: true }
        // );
        socket.user = { _id: user._id, username: user.username };

        // TODO :: send it's friend that it's online
    } catch (error) {
        console.log(error);
    }
    next();
}

export const disconnectController = async (socket) => {
    mark('disconnecting', socket);

    // retrieve the username, then make socket id as null , and last seen as date,now
    try {
        let { _id } = socket.user;
        let user = await ChatProfileModel.findById(_id)
            .populate({
                path: 'friends._id',
                select: 'socketId'
            })
        // update user
        user.socketId = "";
        user.lastSeen = dayjs().format('[Last Seen at ] MMM D, hh:mm a');
        // emit lastSeen
        user.friends.forEach(friend => {
            if (friend._id.socketId) {
                socket.to(friend._id.socketId).emit('update-lastSeen', { user: user.username, lastSeen: user.lastSeen });
            }
        })
        await user.save();

    } catch (error) {
        console.log(error);
    }
}

export const friendRequest = async (socket, data, cb) => {
    mark('friendRequest', socket);
    const { to } = data;

    try {
        // 1) take cur_user, to_user;
        let cur_user = await ChatProfileModel.findById(socket.user._id);
        let to_user = await ChatProfileModel.findOne({ username: to });
        if (!to_user)
            throw new Error('User no exist');

        // 2) check already friend
        let isAlreadyFriend = false;
        for (const friend of cur_user.friends) {
            if (friend._id.toString() == to_user._id.toString()) {
                isAlreadyFriend = true;
                break;
            }
        }
        // 2.1) if already friend then thorw
        if (isAlreadyFriend)
            throw new Error('Already Friend');

        // 2.2) if not friend then push it in friend list of both doc
        to_user.friends.push({ status: 'IN', _id: cur_user._id });
        await to_user.save();
        cur_user.friends.push({ status: 'OUT', _id: to_user._id });
        await cur_user.save();

        // 3) if the to_user is online, then emit the friend request
        if (to_user.socketId) {
            console.log(to_user.socketId);
            socket.to(to_user.socketId).emit('new-friend', newFrinedDto(cur_user, 'IN'));
        }

        socket.emit('new-friend', newFrinedDto(to_user, 'OUT'));

        cb({
            status: 'OK',
            message: 'Sent Successfully'
        });

    } catch (error) {
        console.log(error);
        cb({
            status: 'ERROR',
            message: error.message || 'Something went wrong'
        });
    }
}

export const acceptFriendRequest = async (socket, data, cb) => {
    mark('acFrnd', socket);
    const { to } = data;
    try {
        // 1) take to_user, cur_user
        let to_doc = await ChatProfileModel.findOne({ username: to });
        let cur_doc = await ChatProfileModel.findById(socket.user._id);

        if (!to_doc)
            throw new Error('User not exist');
        if (!cur_doc)
            throw new Error('Something went Wrong');

        // 2) update staus as 'NEW' for both doc
        to_doc.friends = to_doc.friends.map(e => {
            if (e._id.toString() == cur_doc._id.toString()) {
                return { ...e, status: 'NEW' }
            } else
                return e;
        })
        cur_doc.friends = cur_doc.friends.map(e => {
            if (e._id.toString() == to_doc._id.toString()) {
                return { ...e, status: 'NEW' }
            } else
                return e;
        })

        await to_doc.save();
        await cur_doc.save();

        // 3) if to_user is online emit the confirmation
        if (to_doc.socketId)
            socket.to(to_doc.socketId).emit('accept-friend', { username: cur_doc.username });
        socket.emit('accept-friend', { username: to_doc.username, status: 'IN' });

        // 4)cb()
        cb({
            status: 'OK',
            message: 'Done !'
        })
    } catch (error) {
        console.log(error);
        cb({
            status: 'ERROR',
            message: error.message || 'Something went wrong !'
        })
    }
}

export const textMessage = async (socket, data, cb) => {
    mark('textMessage', socket);
    const to = data.to;
    const from = socket.user.username;

    try {
        // 1) get to_user,cur_user, chat_doc[to_user,cur_user]
        const to_user = await ChatProfileModel.findOne({ username: to });
        const cur_user = await ChatProfileModel.findOne({ username: from });
        let chat_doc = await OneToOneChatModel.findOne({
            participants: { $all: [to, from] }
        });

        if (!to_user) throw new Error('reciever not exist');
        if (!cur_user) throw new Error('sender not exist');

        // 2) if not found create new chat doc, mark freind for both, and then insert
        if (!chat_doc) {
            chat_doc = await OneToOneChatModel.create({
                participants: [to, from],
                messageCount: [{ username: to }, { username: from }]
            });
            to_user.friends = to_user.friends.map(e => {
                if (e._id.toString() == cur_user._id.toString())
                    return { ...e, status: 'FRIEND' };
                else return e;
            })
            cur_user.friends = cur_user.friends.map(e => {
                if (e._id.toString() == to_user._id.toString())
                    return { ...e, status: 'FRIEND' };
                else return e;
            })

            to_user.save();
            cur_user.save();
        }

        // 3)push this text message.
        chat_doc.chats.push({ from, type: 'TEXT', message: data.text });

        // 4.1) if to_user is online send the message.
        if (to_user.socketId) {
            socket.to(to_user.socketId).emit('new-message', { from, type: 'TEXT', message: data.text, _id: generateUniqueNumber() });
        }
        // 4.2) if to_user is not online set messge count +1;
        else {
            chat_doc.messageCount = chat_doc.messageCount.map(e => {
                if (e.username == to)
                    return { ...e, count: e.count + 1 };
                else return e;
            })
        }
        await chat_doc.save();

        cb({
            status: 'OK'
        })
    } catch (error) {
        console.log(error);
        cb({
            status: 'ERROR',
            messge: 'message not send'
        })
    }
}

export const FileMessage = async (socket, data, cb) => {
    mark('FileMessage', socket);
    const { to, type, key } = data;
    const from = socket.user.username;

    try {
        // 1) get to_user,cur_user, chat_doc[to_user,cur_user]
        const to_user = await ChatProfileModel.findOne({ username: to });
        const cur_user = await ChatProfileModel.findOne({ username: from });
        let chat_doc = await OneToOneChatModel.findOne({
            participants: { $all: [to, from] }
        });

        if (!to_user) throw new Error('reciever not exist');
        if (!cur_user) throw new Error('sender not exist');

        // 2) if not found create new chat doc, mark freind for both, and then insert
        if (!chat_doc) {
            chat_doc = await OneToOneChatModel.create({
                participants: [to, from],
                messageCount: [{ username: to }, { username: from }]
            });
            to_user.friends = to_user.friends.map(e => {
                if (e._id.toString() == cur_user._id.toString())
                    return { ...e, status: 'FRIEND' };
                else return e;
            })
            cur_user.friends = cur_user.friends.map(e => {
                if (e._id.toString() == to_user._id.toString())
                    return { ...e, status: 'FRIEND' };
                else return e;
            })

            to_user.save();
            cur_user.save();
        }

        // 3)push this text message.
        chat_doc.chats.push({ from, type, key });

        // 4.1) if to_user is online send the message.
        if (to_user.socketId) {
            socket.to(to_user.socketId).emit('new-message', { from, type, key, _id: generateUniqueNumber() });
        }
        // 4.2) if to_user is not online set messge count +1;
        else {
            chat_doc.messageCount = chat_doc.messageCount.map(e => {
                if (e.username == to)
                    return { ...e, count: e.count + 1 };
                else return e;
            })
        }
        await chat_doc.save();

        cb({
            status: 'OK'
        })
    } catch (error) {
        console.log(error);
        cb({
            status: 'ERROR',
            messge: 'message not send'
        })
    }
}