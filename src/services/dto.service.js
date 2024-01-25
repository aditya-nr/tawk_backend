export function AccessTokenDto(doc) {
    return {
        uid: doc._id,
        username: doc.username,
    }
}

export function UserDto(doc) {
    return {
        username: doc.username,
        firstName: doc.firstName,
        lastName: doc.lastName,
        email: doc.email
    }
}