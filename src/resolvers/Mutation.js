const { prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, getUserId } = require("../utils");
const { book } = require("./Query");


async function post(parent, args, context, info) {
  const { userId } = getUserId(context);

  return await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: { connect: { id: userId } },
    },
  });
}

async function signup(parent, args, context, info) {

  const password = await bcrypt.hash(args.password, 10);

  const user = await context.prisma.user.create({
    data: { ...args, password },
  });

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
    message: "토큰이 발급되었습니다.",
  };
}

async function login(parent, args, context, info) {
  const user = await context.prisma.user.findUnique({
    where: { email: args.email },
  });
  if (!user) {
    throw new Error("유저가 존재하지 않습니다.");
  }
  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error("패스워드가 틀렸습니다.");
  }

  const token = jwt.sign({ userId: user.id }, APP_SECRET);
  return {
    token,
    user,
  };
}

async function createBook(parent, args, context) {
  return await context.prisma.book.create({
    data: {
      title: args.title,
      author: args.author,
      year: args.year,
      genre: args.genre,
    },
  });
}

async function updateBook(parent, args, context) {
  return await context.prisma.book.update({
    where: { id: args.id },
    data: {
      title: args.title,
      author: args.author,
      year: args.year,
      genre: args.genre,
    },
  });
}

async function deleteBook(parent, args, context) {
  return await context.prisma.book.delete({
    where: { id: args.id },
  });
}

module.exports = {
  signup,
  login,
  post,
  createBook,
  deleteBook,
  updateBook,
};