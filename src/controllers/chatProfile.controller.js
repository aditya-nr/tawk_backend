import { ChatProfileModel, OneToOneChatModel } from "../models/index.js";
import { ChatUserDto } from "../services/dto.service.js";
import { FileServie } from "../services/file.service.js";

export const ChatProfileController = {
    findUsers: async (req, res, next) => {
        const { username } = req.body;
        const user = req.user.username;
        try {
            const regex = new RegExp(username, 'i'); // 'i' for case-insensitive
            let users = await ChatProfileModel.find({ username: regex }, "username -_id");
            users = users.map(el => el.username).filter(el => el != user);
            res.json({ status: 'OK', users });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    getUserDetails: async (req, res, next) => {
        const { username } = req.body;
        try {
            let user = await ChatProfileModel.findOne({ username });
            if (!user)
                throw new Error(`User "${username}" does't exist`)
            user = ChatUserDto(user);
            res.json({ status: 'OK', user });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    getFreinds: async (req, res, next) => {
        const { username } = req.user;
        try {
            let user = await ChatProfileModel.findOne({ username }, 'friends')
                .populate({
                    path: 'friends._id',
                    select: 'username name avatar lastSeen about -_id'
                });
            let messageCount = await OneToOneChatModel.find({ participants: { $in: [username] } }, 'messageCount');

            const messageCountMap = {};
            messageCount.forEach(e => {
                if (e.messageCount[0].username == username) {
                    messageCountMap[e.messageCount[1].username] = e.messageCount[0].count;
                }
                else if (e.messageCount[1].username == username) {
                    messageCountMap[e.messageCount[0].username] = e.messageCount[1].count;
                }
            })
            let data = user?.friends.map(e => {
                const status = e.status;
                const { username, name, avatar, lastSeen, about } = e._id;
                return {
                    status, username, name, avatar, lastSeen, about,
                    messageCount: messageCountMap[username]
                }
            })

            res.json({ status: 'OK', data: data || [] });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    getChats: async (req, res, next) => {
        const to_user = req.body.username;
        const cur_user = req.user.username;
        try {
            let doc = await OneToOneChatModel.findOne(
                {
                    participants: {
                        $all: [to_user, cur_user]
                    }
                }
            )
            const data = doc ? doc.chats : [];
            doc.messageCount = doc.messageCount.map(e => {
                if (e.username == cur_user)
                    return { ...e, count: 0 };
                else return e;
            })
            await doc.save();
            return res.json({ status: 'OK', data: data });
        } catch (error) {
            next(error);
        }
    },
    getUploadURL: async (req, res, next) => {
        const { filename, type } = req.body;
        try {
            const ext = filename.split('.').at(-1);
            const fileName = `${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`
            const path = "private"
            let { url, key } = await FileServie.putObjectUrl(path, fileName, type);
            res.json({ status: 'OK', url, key })
        } catch (error) {
            next(error)
        }
    },
    getFileURL: async (req, res, next) => {
        const { key } = req.body;
        console.log('key :::: ', key);
        try {
            let url = await FileServie.getObjectUrl(key);
            res.json({ status: 'OK', url })
        } catch (error) {
            next(error)
        }
    }

}