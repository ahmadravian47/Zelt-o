const router = require("express").Router();
const passport = require("passport");
const Chat = require("../models/Chat");
const Faq = require("../models/Faq");
const Message = require("../models/Message");
const Organization = require("../models/Organization");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

function generateEmbedCode(botId) {
  return `<script 
    src="${process.env.CLIENT_URL}/chatbot.js" 
    data-bot-id="${botId}"
    data-api="${process.env.SERVER_URL}"
    data-assets="${process.env.CLIENT_URL}"
    >
  </script>`;
}

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login/failed", session: false }),
  async (req, res) => {
    if (!req.user) {
      return res.status(403).json({ error: true, message: "Not Authorized" });
    }

    try {
      const { email, name, id: googleId } = req.user;

      // check if user exists
      let user = await User.findOne({ email });

      // if new user, create
      if (!user) {
        const lastUser = await User.findOne().sort({ organizationNumber: -1 });
        const newOrgNum = lastUser ? lastUser.organizationNumber + 1 : 1;

        user = await User.create({
          name,
          email,
          googleId,
          organizationNumber: newOrgNum,
        });

        const botId = crypto.randomUUID();
        const user_from_db = await User.findOne({ email });//finding this because we have to find the mongodb id of that user
        await Organization.create({
          organizationNumber: user_from_db.organizationNumber,
          owner: user_from_db._id,
          businessName: "My Business", // placeholder
          bot: {
            botId,
            embedCode: generateEmbedCode(botId),
            isLive: false,
          }
        });
      }

      // ------------------------ JWT / Refresh Token ------------------------
      const signAccessToken = (user) =>
        jwt.sign(
          { sub: user._id.toString(), tv: user.tokenVersion },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

      const generateRefreshToken = () =>
        crypto.randomBytes(40).toString("hex");

      const hashToken = (token) =>
        crypto.createHash("sha256").update(token).digest("hex");

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      };

      const sendAuthCookies = (res, accessToken, refreshToken) => {
        res.cookie("token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
        res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
      };

      const accessToken = signAccessToken(user);
      const refreshToken = generateRefreshToken();

      user.refreshToken = hashToken(refreshToken);
      await user.save();

      sendAuthCookies(res, accessToken, refreshToken);

      // redirect to client dashboard
      return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    } catch (error) {
      console.error("❌ [Google Callback] ERROR:", error);
      return res.redirect("/login/failed");
    }
  }
);



router.get("/google", (req, res, next) => {
  next();
},
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get("/login/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      error: false,
      message: "Successfully Logged In",
      user: req.user,
    });
  } else {
    res.status(403).json({ error: true, message: "Not Authorized" });
  }
});

router.get("/login/failed", (req, res) => {
  res.status(401).json({
    error: true,
    message: "Login failed",
  });
});

router.get("/logout", (req, res) => {
  req.logout();
  res.redirect(`${process.env.CLIENT_URL}`);
});




module.exports = router;