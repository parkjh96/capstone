const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();
const port = 3000; //port 생성
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const superAwesomeCode = "차은우";

app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", function (req, res) {
  res.send("hello world!");
});

app.post("/token", async (req, res) => {
  let refreshToken;
  if (req.body.rt) {
    refreshToken = req.body.rt;
  } else {
    refreshToken = req.cookies["rt"];
  }
  try {
    if (!refreshToken) {
      throw "refreshtoken이 없습니다.";
    }
    const decoded = jwt.verify(refreshToken, superAwesomeCode);
    const user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      password: decoded.password
    };
    const accessToken = jwt.sign(user, superAwesomeCode, {
      expiresIn: "1h",
    });
    await prisma.User.update({
      where : {
        email : user.email
      },
      data : {
        actoken : accessToken
      }
    })
    res.send({ token: accessToken });
  } catch (e) {
    res.status(401);
    res.send("no.......");
  }
});

app.post("/vertify", (req, res) => {
  const token = req.body.token;
  if (!token) {
    res.status(402);
    res.send("검증 대상인 token 이 없습니다.");
    return;
  }
  try {
    const decoded = jwt.verify(token, superAwesomeCode);
    const { id, name } = decoded;
    res.send({ id, name });
  } catch (e) {
    res.status(401);
    res.send("token이 유효하지 않습니다.");
  }
});

app.post("/login", async (req, res) => {
  const useremail = req.body.id;
  const prismaUser = await prisma.User.findUnique({where: { email : useremail }});
  const loginUser = {
    id: prismaUser.id,
    name: prismaUser.name,
    password: prismaUser.password,
    email: prismaUser.email
  }
  if (loginUser && loginUser.password === req.body.password) {
    const refreshToken = jwt.sign(loginUser, superAwesomeCode, {
      expiresIn: "1d",
    });
    await prisma.user.update({
      where: {
        email : useremail
      },
      data: {
        rftoken : refreshToken
      }
    })
    res.cookie("rt", refreshToken);
    res.send({
      token: refreshToken,
    });
  } else {
    res.status(401);
    res.send("해당 User가 없거나, Password가 맞지 않습니다.");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});