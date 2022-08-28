const { handleErrorAsync } = require("../utils/errorHandler");
const passport = require("passport");

const authController = {
  google: {
    auth: handleErrorAsync(async (req, res, next) => {
      /* passport authenticate is a middleware */
      passport.authenticate("google", {
        scope: ["profile", "email"]
      })(req, res, next);
    }),
    execCallback: handleErrorAsync(async (req, res, next) => {
      passport.authenticate("google")(req, res, next);
    })
  },
  line: {
    auth: handleErrorAsync(async (req, res, next) => {
      /* passport authenticate is a middleware */
      passport.authenticate("line",{
        scope: ["profile","openid", "email"]
      })(req, res, next);
    }),
    execCallback: handleErrorAsync(async (req, res, next) => {
      passport.authenticate("line")(req, res, next);
    })
  }
};

module.exports = authController;