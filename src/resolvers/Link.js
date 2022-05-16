// ../src/resolvers/Link.js

/*  Prisma CLI를 사용하여 Link 불러오기
    Link에 대해 postedBy 메서드 호출
    postedBy 필드 리졸브 */

function postedBy(parent, args, context) {
        return context.prisma.link.findUnique({ where: { id: parent.id } }).postedBy()
}
    
module.exports = {
        postedBy,
}