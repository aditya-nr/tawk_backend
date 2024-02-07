export function AccessTokenDto(doc) {
    return {
        uid: doc._id,
        username: doc.username,
    }
}

export function UserDto(doc) {
    return {
        username: doc.username,
        name: `${doc.firstName} ${doc.lastName}`
    }
}

export function ChatUserDto(doc) {
    return {
        username: doc.username,
        name: doc.name,
        lastSeen: doc.lastSeen,
        avatar: doc.avatar,
    }
}

export function newFrinedDto(doc, status) {
    return {
        name: doc.name,
        username: doc.username,
        avatar: doc.avatar,
        lastSeen: doc.lastSeen,
        about: doc.about,
        msgCount: doc.msgCount,
        status: status || doc.status
    }
}
