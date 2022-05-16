// ../src/resolvers/User.js

// type User의 links 필드
function links(parent, args, context) {
    return context.prisma.user.findUnique({ where: { id: parent.id } }).links()
}

module.exports = {
    links,
}