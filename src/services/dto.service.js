export function AccessTokenDto(doc) {
    return {
        uid: doc._id,
        username: doc.username,
    }
}
