const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { User } = require("./models");

mongoose.connect("mongodb://127.0.0.1:27017/spa_mall", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();

// 회원가입 API
router.post('/users', async (req, res) => {
  try{
    const {nickname, email, password, confirmPassword} = req.body;

    // 1. 패스워드가 일치하는가
    if (password !== confirmPassword) {
      return res.status(400).json({
        errorMessage: "패스워드가 일치하지 않습니다."
      });
    }

    // 2. email 및 nickname에 해당하는 사용자가 있는가?

    const existUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { nickname }],
      },
    });

    if (existUser) {
      return res.status(400).json({
        errorMessage: "중복된 email 혹은 닉네임입니다."
      });
    };
    // 3. DB에 데이터 삽입

    return await User.create({nickname, email, password}),
    res.status(201).json({});
    
  } catch(error) {

    console.error(error);

    res.status(500).json({message: error.Message})
  }
  
});


//로그인 API
router.post('/auth', async (req, res) =>{
  try{
    const {email, password} = req.body;

    const user = await User.findOne({
      where: {email}
    });
    
  if (!user || password !== user.password) {
    return res.status(400).json({
      errorMessage: "사용자가 존재하지 않거나 비밀번호가 틀렸습니다."
    })
  }
  const token = jwt.sign({userId:user._id}, "sparta-secret-key")

  return res.status(200).json({
    "token": token
  })

  } catch(error) {

    console.error(error);

    res.status(500).json({message: error.Message})
  }
  
})

const authMiddleware = require("./middlewares/auth-middleware.js");
router.get('/users/me', authMiddleware, async (req, res) => {
  res.send({user: res.locals.user});
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});