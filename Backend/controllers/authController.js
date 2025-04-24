require("dotenv").config();
const User = require("../models/User");
const Membership = require("../models/Membership");
const UserMembership = require("../models/UserMembership");
const TempUser = require("../models/TempUser");
const ResetCode = require("../models/ResetCode");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");

let refreshTokens = [];

const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "http://localhost:8000/v1/auth/google/callback",
});

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const assignFreeMembership = async (userId) => {
  const freeMembership = await Membership.findOne({ name: "Free" });
  if (!freeMembership) {
    throw new Error("Không tìm thấy gói Free");
  }

  const startDate = new Date();
  const endDate = new Date(
    startDate.getTime() + freeMembership.duration * 24 * 60 * 60 * 1000
  );

  const userMembership = new UserMembership({
    userId,
    membershipId: freeMembership._id,
    startDate,
    endDate,
    viewCount: [{ date: startDate, count: 0 }],
    downloadCount: [{ date: startDate, count: 0 }],
  });
  await userMembership.save();

  await User.findByIdAndUpdate(userId, {
    membership: {
      membershipId: freeMembership._id,
      userMembershipId: userMembership._id,
    },
  });

  return userMembership;
};

const authController = {
  registerUser: async (req, res) => {
    try {

      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json("Email đã tồn tại");
      }

      const { username, email, password, confirmPassword } = req.body;

      if (!username || !email || !password || !confirmPassword) {
        return res
          .status(400)
          .json("Thiếu thông tin: username, email, password, confirmPassword");
      }

      if (username.length < 6) {
        return res.status(400).json("Tên tài khoản phải ít nhất 6 ký tự");
      }

      if (password.length < 6) {
        return res.status(400).json("Mật khẩu phải có ít nhất 6 ký tự");
      }

      if (password !== confirmPassword) {
        return res.status(400).json("Sai mật khẩu");
      }

      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);

      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      // Kiểm tra và cập nhật hoặc tạo mới TempUser
      const tempUserData = {
        username,
        email,
        password: hashed,
        verificationCode,
        createdAt: new Date(), // Cập nhật thời gian tạo để tránh hết hạn sớm
      };

      await TempUser.findOneAndUpdate(
        { email }, // Tìm theo email
        tempUserData, // Dữ liệu cần cập nhật
        {
          upsert: true, // Tạo mới nếu không tìm thấy
          new: true, // Trả về bản ghi sau khi cập nhật
          setDefaultsOnInsert: true, // Áp dụng giá trị mặc định nếu tạo mới
        }
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã xác thực đăng ký",
        text: `Mã xác thực của bạn là: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Lỗi gửi email:", err);
          return res
            .status(500)
            .json({
              message: "Lỗi server",
              error: "Không thể gửi email xác thực",
            });
        }
        console.log("Email gửi thành công:", info.response);
        return res
          .status(200)
          .json({
            message: "Mã xác thực đã được gửi, vui lòng kiểm tra email.",
          });
      });
    } catch (err) {
      console.error("Lỗi server:", err);
      return res
        .status(500)
        .json({ message: "Lỗi server", error: err.message });
    }
  },

  verifyEmail: async (req, res) => {
    try {
      const { email, code } = req.body;
      const tempUser = await TempUser.findOne({ email });
      if (!tempUser) {
        console.log("Không tìm thấy tempUser cho email:", email);
        return res.status(404).json("Không tìm thấy thông tin đăng ký");
      }

      console.log("So sánh:", tempUser.verificationCode, "với", code);
      if (tempUser.verificationCode !== code) {
        return res.status(400).json("Mã xác thực không đúng");
      }

      const newUser = new User({
        username: tempUser.username,
        email: tempUser.email,
        password: tempUser.password,
        isVerified: true,
        verificationCode: null,
      });
      const user = await newUser.save();
      await assignFreeMembership(user._id);

      // Xóa TempUser sau khi xác thực
      await TempUser.deleteOne({ email });

      return res.status(200).json("Xác thực thành công! Tài khoản đã được tạo.");
    } catch (err) {
      console.error("Lỗi chi tiết trong verifyEmail:", err);
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  // Hàm gửi lại mã xác thực
  resendVerificationCode: async (req, res) => {
    try {
      const { email } = req.body;

      const tempUser = await TempUser.findOne({ email });
      if (!tempUser) {
        return res.status(404).json("Không tìm thấy thông tin đăng ký");
      }

      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      tempUser.verificationCode = verificationCode;
      await tempUser.save();

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã xác thực đăng ký (Gửi lại)",
        text: `Mã xác thực mới của bạn là: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Lỗi gửi email:", err);
          return res.status(500).json({ message: "Lỗi server", error: "Không thể gửi email xác thực" });
        }
        console.log("Email gửi lại thành công:", info.response);
        return res.status(200).json({ message: "Mã xác thực đã được gửi lại." });
      });
    } catch (err) {
      console.error("Lỗi server:", err);
      return res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(404).json("Email không tồn tại.");

      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Lưu hoặc cập nhật mã OTP vào ResetCode
      await ResetCode.findOneAndUpdate(
        { email },
        {
          email,
          code: resetCode,
          createdAt: new Date(), // Cập nhật thời gian để tránh hết hạn sớm
        },
        {
          upsert: true, // Tạo mới nếu không tìm thấy
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Mã xác thực đặt lại mật khẩu",
        text: `Mã xác thực của bạn là: ${resetCode}`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Lỗi gửi email:", err);
          return res.status(500).json("Lỗi gửi email.");
        }
        res.status(200).json("Mã xác thực đặt lại mật khẩu đã được gửi.");
      });
    } catch (err) {
      console.error("Lỗi server:", err);
      res.status(500).json("Lỗi server.");
    }
  },

  // Xác thực OTP quên mật khẩu
  verifyResetCode: async (req, res) => {
    try {
      const { email, code } = req.body;
      const resetCode = await ResetCode.findOne({ email });
      if (!resetCode || resetCode.code !== code) {
        return res.status(400).json({ success: false, message: "Mã xác thực không đúng." });
      }
      res.status(200).json({ success: true, message: "Xác thực thành công. Nhập mật khẩu mới." });
    } catch (err) {
      console.error("Lỗi server:", err);
      res.status(500).json({ success: false, message: "Lỗi server." });
    }
  },

  // Đặt lại mật khẩu mới
  resetPassword: async (req, res) => {
    try {
      const { email, newPassword, confirmNewPassword } = req.body;
      const resetCode = await ResetCode.findOne({ email });
      if (!resetCode) return res.status(400).json("Email không hợp lệ hoặc mã đã hết hạn.");
  
      if (newPassword !== confirmNewPassword) {
        return res.status(400).json("Mật khẩu xác nhận không khớp.");
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      await User.findOneAndUpdate({ email }, { password: hashedPassword });
  
      // Xóa ResetCode sau khi đặt lại mật khẩu
      await ResetCode.deleteOne({ email });
  
      res.status(200).json("Mật khẩu đã được cập nhật.");
    } catch (err) {
      console.error("Lỗi server:", err);
      res.status(500).json("Lỗi server.");
    }
  },

  generateAccessToken: (user) => {
    return jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_ACCESS_KEY,
      { expiresIn: "1d" }
    );
  },

  generateRefreshToken: (user) => {
    return jwt.sign(
      { id: user.id, admin: user.admin },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "365d" }
    );
  },

  googleLogin: async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Thiếu token Google" });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const { email, name, sub: googleId } = payload;

      // Tìm user bằng email hoặc googleId
      let user = await User.findOne({ $or: [{ email }, { googleId }] });

      if (!user) {
        // Nếu không có tài khoản, tạo mới và đăng nhập luôn
        user = new User({
          username: name || `user_${googleId}`, // Nếu không có name, dùng googleId để tạo username
          email,
          googleId,
          isVerified: true, // Google đã xác thực email
        });
        await user.save();
        await assignFreeMembership(user._id);
      } else if (!user.googleId) {
        // Nếu tài khoản đã tồn tại qua đăng ký thường, liên kết với googleId
        user.googleId = googleId;
        user.isVerified = true; // Đánh dấu đã xác thực nếu chưa
        await user.save();
        if (!user.membership) {
          await assignFreeMembership(user._id);
        }
      }

      const accessToken = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // Đặt true nếu dùng HTTPS
        path: "/",
        sameSite: "strict",
      });

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken });
    } catch (err) {
      console.error("Google login error:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  facebookLogin: async (req, res) => {
    try {
      const { accessToken } = req.body;
      if (!accessToken)
        return res.status(400).json({ message: "Thiếu access token Facebook" });

      // Gửi yêu cầu đến Facebook Graph API để xác thực token và lấy thông tin user
      const fbResponse = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`
      );
      const fbUser = await fbResponse.json();

      if (!fbUser.id) {
        return res.status(400).json({ message: "Token Facebook không hợp lệ" });
      }

      const { id: facebookId, name, email } = fbUser;

      // Tìm user bằng email hoặc facebookId
      let user = await User.findOne({ $or: [{ email }, { facebookId }] });

      if (!user) {
        // Tạo tài khoản mới nếu chưa tồn tại
        user = new User({
          username: name || `user_${facebookId}`,
          email: email || `${facebookId}@facebook.com`, // Nếu không có email, tạo email giả
          facebookId,
          isVerified: true,
        });
        await user.save();
        await assignFreeMembership(user._id);
      } else if (!user.facebookId) {
        // Liên kết facebookId nếu tài khoản đã tồn tại qua cách khác
        user.facebookId = facebookId;
        user.isVerified = true;
        await user.save();
        if (!user.membership) {
          await assignFreeMembership(user._id);
        }
      }

      const accessTokenJwt = authController.generateAccessToken(user);
      const refreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(refreshToken);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      const { password, ...others } = user._doc;
      res.status(200).json({ ...others, accessToken: accessTokenJwt });
    } catch (err) {
      console.error("Facebook login error:", err);
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  loginUser: async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        return res.status(404).json("Wrong email");
      }
      const validPassword = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (!validPassword) {
        return res.status(404).json("Wrong password");
      }
      if (user && validPassword) {
        const accessToken = authController.generateAccessToken(user);
        const refreshToken = authController.generateRefreshToken(user);
        refreshTokens.push(refreshToken);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        const { password, ...others } = user._doc;
        res.status(200).json({ ...others, accessToken });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  },

  requestRefreshToken: async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json("You're not authenticated");
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json("Refresh token is not valid");
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, user) => {
      if (err) {
        console.log(err);
      }
      refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

      const newAccessToken = authController.generateAccessToken(user);
      const newRefreshToken = authController.generateRefreshToken(user);
      refreshTokens.push(newRefreshToken);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res.status(200).json({ accessToken: newAccessToken });
    });
  },

  userLogout: async (req, res) => {
    res.clearCookie("refreshToken");
    refreshTokens = refreshTokens.filter(
      (token) => token !== req.cookies.refreshToken
    );
    res.status(200).json("Logged out");
  },
};

module.exports = authController;
