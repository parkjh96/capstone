const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const http = require("http");
const jwt = require("jsonwebtoken");
const path = require("path");
const serveStatic = require("serve-static");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const superAwesomeCode = "차은우";

app.set("port", 3000);

app.use(serveStatic(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(cookieParser());

app.use(
  expressSession({
    secret: "차은우",
    resave: true,
    saveUninitialized: true,
  })
);

app.get("https://news.hada.io/", async (req, res) => {
  let accessToken;
  accessToken = req.cookies["at"];
  const decoded = jwt.verify(accessToken, superAwesomeCode);
  console.log(decoded);
  const dbuser = await prisma.user.findUnique({
    where: { email: decoded.email },
  });
  console.log(dbuser);
  if (dbuser) {
    // db에 cookie에 있는 accesstoken을 가지고 있는 데이터가 있다면
    res.redirect("https://news.hada.io/"); // 예시
  } else {
    res.redirect("/login.html"); // fhrmdlsdmfh
  }
});

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.post("/process/login", async (req, res) => {
  console.log("실행!");
  const paramID = req.body.id;
  const pw = req.body.password;
  const prismaUser = await prisma.User.findUnique({
    where: { email: paramID },
  });
  if (prismaUser && prismaUser.password == pw) {
    // db에 아이디가 있다면
    const loginUser = {
      id: prismaUser.id,
      password: prismaUser.password,
      name: prismaUser.name,
      email: prismaUser.email,
    };
    if (!req.cookies["rt"]) {
      if (loginUser && loginUser.password === pw) {
        const refreshToken = jwt.sign(loginUser, superAwesomeCode, {
          expiresIn: "1d",
        });
        const accessToken = jwt.sign(loginUser, superAwesomeCode, {
          expiresIn: "1h",
        });
        await prisma.user.update({
          where: {
            email: paramID,
          },
          data: {
            rftoken: refreshToken,
            actoken: accessToken,
          },
        });
        res.cookie("rt", refreshToken);
        res.cookie("at", accessToken);
        res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
        res.write("<h1>Login Success</h1>");
        res.write(`[ID] : ${paramID} [PW] : ${pw}`);
        res.write('<a href="https://news.hada.io/">뉴스피드로~!</a>');
        res.end();
      } else {
        res.send("The password is incorrect.");
      }
    } else {
      const rtconfirm = req.cookies["rt"];
      const decoded = jwt.verify(rtconfirm, superAwesomeCode);
      if (loginUser.email == decoded.email) {
        let cookierefreshToken;
        if (req.body.rt) {
          cookierefreshToken = req.body.rt;
        } else {
          cookierefreshToken = req.cookies["rt"];
        }
        try {
          const decoded = jwt.verify(cookierefreshToken, superAwesomeCode);
          const user = {
            id: decoded.id,
            name: decoded.name,
            email: decoded.email,
            password: decoded.password,
          };
          const accessToken = jwt.sign(user, superAwesomeCode, {
            expiresIn: "1h",
          });
          await prisma.User.update({
            where: {
              email: user.email,
            },
            data: {
              actoken: accessToken,
            },
          });
          res.cookie("at", accessToken);
          res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
          res.write("<h1>refreshtoken은 있고 accesstoken만 만듬!</h1>");
          res.write(`[ID] : ${paramID} [PW] : ${pw}`);
          res.write('<a href="https://news.hada.io/">뉴스피드로~!</a>');
          res.end();
        } catch (e) {
          res.status(401);
          res.send("no.......");
        }
      } else {
        if (loginUser && loginUser.password === pw) {
          const refreshToken = jwt.sign(loginUser, superAwesomeCode, {
            expiresIn: "1d",
          });
          const accessToken = jwt.sign(loginUser, superAwesomeCode, {
            expiresIn: "1h",
          });
          await prisma.user.update({
            where: {
              email: paramID,
            },
            data: {
              rftoken: refreshToken,
              actoken: accessToken,
            },
          });
          res.cookie("rt", refreshToken);
          res.cookie("at", accessToken);
          res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
          res.write("<h1>Login Success</h1>");
          res.write(`[ID] : ${paramID} [PW] : ${pw}`);
          res.write('<a href="https://news.hada.io/">Move</a>');
          res.end();
        }
      }
    }
  } else {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf8" });
    res.write("<h1> The ID or Password is incorrect </h1>");
    res.write('<a href="/">다시 로그인 화면으로 가기</a>');
    res.end();
  }
});

app.get("/process/logout", (req, res) => {
  console.log("로그아웃");
  if (req.cookies["at"]) {
    console.log("로그아웃중입니다!");
    res.clearCookie("at");
    console.log("accesstoken 삭제 완료!");
    res.redirect("/login.html");
  } else {
    console.log("로그인이 안돼있으시네요?");
    res.redirect("/login.html");
  }
});

const appServer = http.createServer(app);

appServer.listen(app.get("port"), () => {
  console.log(`${app.get("port")}에서 서버실행중.`);
});
