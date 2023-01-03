// 미들웨어를 사용하기 위해 필요한것
// 1. jwt
// 2. 모델
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  try {
    // jwt 가져오기
    const { authorization } = req.headers;
    // 검증
    console.log(authorization);
    // 분리
    const [authType, authToken] = authorization.split(" ");
    // authType : Bearer
    // authToken : 실제 jwt 값
    console.log([authType, authToken]);

    if (authType !== "Bearer" || !authToken) {
      res.status(401).json({
        errorMessage: "로그인 후 사용 가능합니다.",
      });
    }

    //jwt가 유효한가 복호화 및 검증
    const { userId } = jwt.verify(authToken, "sparta-secret-key");
    const user = await User.findByPk(userId);
    // res.locals.user : DB에 가지 않고도 변수로 따로 저장해 둬서 데이터 가져옴
    res.locals.user = user;
    console.log(user);
    // 미들웨어를 다음으로 넘김
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
