// ../src/script.js

// 1 Prisma Client에서 생성자를 가져오기
const { PrismaClient } = require("@prisma/client");

// 2 모듈을 인스턴스화
const prisma = new PrismaClient();

// 3 데이터베이스에 쿼리를 보내기 위한 async로 호출되는 main함수 정의
async function main() {
  const newLink = await prisma.link.create({
    data: {
      description: "Fullstack tutorial for GraphQL",
      url: "www.howtographql.com",
    },
  });

  const allLinks = await prisma.link.findMany();
  console.log(allLinks);
}

// 4 main 함수 호출
main()
  .catch((e) => {
    throw e;
  })
  // 5 연결 끊기
  .finally(async () => {
    await prisma.$disconnect();
  });