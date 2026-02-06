require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const { body, validationResult } = require("express-validator");

const Chat = require("./models/Chat");
const Faq = require("./models/Faq");
const Organization = require("./models/Organization");
const User = require("./models/User");
const Pending = require("./models/Pending");
const cors = require("cors");


const app = express();
app.set("trust proxy", 1);

const CLIENT_URL = process.env.CLIENT_URL;
const SERVER_URL = process.env.SERVER_URL;
const isProd = process.env.NODE_ENV === "production";
/*----------------------Auth Routes----------------------------*/
const passport = require("passport");
require("./passport");
const authRoutes = require("./routes/auth");
app.use(passport.initialize());

const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // higher limit for OAuth redirects
  message: "Too many OAuth requests. Try again later."
});

/* -------------------- GLOBAL MIDDLEWARE -------------------- */

app.use(helmet());
app.use(express.json());
app.use(cookieParser());






// -------------------- CORS --------------------
// 🔐 Private APIs (dashboard, auth)
const privateCors = cors({
  origin: CLIENT_URL,
  credentials: true,
  allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
});

// 🌍 Public Chatbot Embed API
const publicCors = cors({
  origin: "*",
  methods: ["POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
});

app.use("/auth/google/callback", privateCors, oauthLimiter);
app.use("/auth", privateCors, authRoutes);

// Handle preflight OPTIONS requests globally
app.options("/", privateCors);


/* -------------------- RATE LIMITING -------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true
});

app.use("/login", privateCors, authLimiter);
app.use("/signup", privateCors, authLimiter);
app.use("/refresh", privateCors, authLimiter);
app.use("/forgot-password", privateCors, authLimiter);
app.use("/reset-password", privateCors, authLimiter);

/* -------------------- CSRF -------------------- */
const csrfProtection = csrf({
  cookie: true,
  ignoreMethods: ["GET", "HEAD", "OPTIONS"]
});

app.get("/csrf-token", privateCors, csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

/* -------------------- UTILS -------------------- */
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "None" : "Lax"
};

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

const sendAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("token", accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });
  res.cookie("refreshToken", refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

function generateEmbedCode(botId) {
  return `<script 
    src="${process.env.CLIENT_URL}/chatbot.js" 
    data-bot-id="${botId}"
    data-api="${process.env.SERVER_URL}"
    data-assets="${process.env.CLIENT_URL}"
    >
  </script>`;
}

const checkBotStatus = async () => {
  const threshold = new Date(Date.now() - 1 * 60 * 1000); // if a bot is offline for timemore then threshold (1s)
  const botsToOffline = await Organization.updateMany(
    { "bot.lastSeen": { $lt: threshold } },
    { $set: { "bot.isLive": false } }
  );
};

// Run every 3 minutes
setInterval(checkBotStatus, 3 * 60 * 1000);



/* -------------------- AUTH MIDDLEWARE -------------------- */
const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user || user.tokenVersion !== payload.tv)
      return res.sendStatus(401);

    req.user = user;
    next();
  } catch {
    res.sendStatus(401);
  }
};

const dashboardRoutes = require("./routes/dashboard");
const userchatRoutes = require("./routes/userchat");
const botsettingsRoutes = require("./routes/botsettings");
const faqRoutes = require("./routes/faq");
const descriptionRoutes = require("./routes/description");
const chathistoryRoutes = require("./routes/chathistory");
app.use("/api/dashboard", privateCors, auth, dashboardRoutes);
app.use("/api/botsettings", privateCors, auth, botsettingsRoutes);
app.use("/api/faqs", privateCors, auth, faqRoutes);
app.use("/api/description", privateCors, auth, descriptionRoutes);
app.use("/api/chathistory", privateCors, auth, chathistoryRoutes);
app.use("/api/chat", publicCors, userchatRoutes);




/* -------------------- EMAIL -------------------- */
const transporter = nodemailer.createTransport({
  host: 'mail.privateemail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/* -------------------- ROUTES -------------------- */

// Signup
app.post("/signup", csrfProtection, body("email").isEmail(), body("password").custom((value) => {
  if (!value || value.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  return true;
}),
  async (req, res) => {
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid input" });

    const email = req.body.email.toLowerCase().trim();
    const { name, password } = req.body;

    if (await User.findOne({ email }))
      return res.json({ message: "If an account exists, check your email." });

    if (await Pending.findOne({ email }))
      return res.json({ message: "Verification email already sent. Check your inbox." });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    await Pending.create({
      name,
      email,
      hashedPassword: await bcrypt.hash(password, 12),
      verificationToken,
      expiresAt: Date.now() + 30 * 60 * 1000 // 30 min
    });

    const link = `${SERVER_URL}/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: `"Zelt-O" <info@zelt-o.com>`,
      to: email,
      subject: "Verify your account",
      html: `  <p>Please verify your email address by clicking the button below:</p>
      <a href="${link}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: white; background-color: black; text-align: center; text-decoration: none; border-radius: 5px;">Verify Email</a>`
    });

    res.json({ message: "Verification email sent" });
  }
);

// Verify email
app.get("/verify", async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid token");

  try {
    const pending = await Pending.findOne({ verificationToken: token });
    if (!pending) return res.status(400).send("Invalid or expired token");

    const { name, email, hashedPassword } = pending;

    // double-check user doesn't already exist
    if (await User.findOne({ email })) {
      await Pending.deleteOne({ _id: pending._id });
      return res.status(400).send("User already exists");
    }

    // assign organizationNumber
    const lastUser = await User.findOne().sort({ organizationNumber: -1 });
    const newOrgNum = lastUser ? lastUser.organizationNumber + 1 : 1;

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      organizationNumber: newOrgNum
    });

    const botId = crypto.randomUUID();

    const user = await User.findOne({ email });//finding this because we have to find the mongodb id of that user
    await Organization.create({
      organizationNumber: user.organizationNumber,
      owner: user._id,
      businessName: "My Business",
      businessDescription: "My Description",
      bot: {
        botId,
        embedCode: generateEmbedCode(botId),
        isLive: false,
      }
    });

    // cleanup pending
    await Pending.deleteOne({ _id: pending._id });

    // issue JWT cookie
    const authToken = signAccessToken(newUser);
    res.cookie("token", authToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Login
app.post("/login", csrfProtection, async (req, res) => {
  const email = req.body.email?.toLowerCase().trim();
  const { password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken(user);
  const refreshToken = generateRefreshToken();

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  sendAuthCookies(res, accessToken, refreshToken);
  res.json({ success: true });
});

// Refresh
app.post("/refresh", csrfProtection, async (req, res) => {
  const refresh = req.cookies.refreshToken;
  if (!refresh) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken: hashToken(refresh) });
  if (!user) return res.sendStatus(401);

  const newRefresh = generateRefreshToken();
  user.refreshToken = hashToken(newRefresh);
  await user.save();

  sendAuthCookies(res, signAccessToken(user), newRefresh);
  res.json({ success: true });
});

app.options("/logout", privateCors);

// Logout
app.post("/logout", privateCors, auth, csrfProtection, async (req, res) => {
  req.user.tokenVersion += 1;
  req.user.refreshToken = undefined;
  await req.user.save();

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.json({ success: true });
});

app.options("/userprofile", privateCors);
// Get user profile
app.get("/userprofile", privateCors, auth, csrfProtection, (req, res) => {
  res.json({ email: req.user.email });
});

app.post("/forgot-password",async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    if (!email) return res.json({ message: "If this email exists, a reset link was sent." });

    const user = await User.findOne({ email });
    if (!user) {
      // NEVER reveal if account exists
      return res.json({ message: "If this email exists, a reset link was sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const hashed = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutes
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Reset your Zelt-o password",
      html: `
        <h3>Password Reset</h3>
        <p>You requested a password reset.</p>
        <a href="${resetLink}" style="padding:10px 16px;background:black;color:white;text-decoration:none;border-radius:5px">
          Reset Password
        </a>
        <p>This link expires in 30 minutes.</p>
      `
    });

    res.json({ message: "A reset link is sent to this Email." });

  } catch (err) {
    console.error(err);
    res.json({ message: "An Error occurred" });
  }
});
app.post("/reset-password",async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: "Invalid request" });

    const hashed = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ error: "Token invalid or expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ success: true, message: "Password updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


/* -------------------- DATABASE + SERVER -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Server running securely on port ${port}`)
);
