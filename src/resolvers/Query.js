function feed(parent, args, context) {
    return context.prisma.link.findMany();
  }
  
function Users(parent, args, context) {
  return context.prisma.user.findMany();
}
  
function books(parent, args, context) {
  return context.prisma.book.findMany();
}
  
  // function book(parent, args, context) {
  //   return context.prisma.book.findUnique({ where: { id: parent.id } }).books();
  // }
module.exports = {
  feed,
  Users,
  books,
};