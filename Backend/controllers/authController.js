require("dotenv").config();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

let refreshTokens = [];
let tempUsers = {};

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const authController = {
    registerUser: async (req, res) => {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Kiểm tra các trường bắt buộc
            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).json("Thiếu thông tin: username, email, password, confirmPassword");
            }

            if (password !== confirmPassword) {
                return res.status(400).json("Sai mật khẩu");
            }

            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Lưu tạm thông tin user
            tempUsers[email] = {
                username,
                email,
                password: hashed,
                verificationCode,
            };

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Mã xác thực đăng ký",
                text: `Mã xác thực của bạn là: ${verificationCode}`,
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.error("Lỗi gửi email:", err);
                    return res.status(500).json({ message: "Lỗi server", error: "Không thể gửi email xác thực" });
                }
                console.log("Email gửi thành công:", info.response);
                return res.status(200).json({ message: "Mã xác thực đã được gửi, vui lòng kiểm tra email." });
            });
        } catch (err) {
            console.error("Lỗi server:", err);
            return res.status(500).json({ message: "Lỗi server", error: err.message });
        }
    },

    verifyEmail: async (req, res) => {
        try {
            const { email, code } = req.body;

            // Kiểm tra thông tin tạm
            const tempUser = tempUsers[email];
            if (!tempUser) {
                return res.status(404).json("Không tìm thấy thông tin đăng ký");
            }

            if (tempUser.verificationCode !== code) {
                return res.status(400).json("Mã xác thực không đúng");
            }

            // Lưu user vào MongoDB sau khi xác thực thành công
            const newUser = new User({
                username: tempUser.username,
                email: tempUser.email,
                password: tempUser.password,
                isVerified: true,
                verificationCode: null,
            });

            const user = await newUser.save();
            console.log("User đã lưu:", user);

            // Xóa thông tin tạm
            delete tempUsers[email];

            return res.status(200).json("Xác thực thành công! Tài khoản đã được tạo.");
        } catch (err) {
            console.error("Lỗi server:", err);
            return res.status(500).json({ message: "Lỗi server", error: err.message });
        }
    },

    // Hàm gửi lại mã xác thực
    resendVerificationCode: async (req, res) => {
        try {
            const { email } = req.body;

            const tempUser = tempUsers[email];
            if (!tempUser) {
                return res.status(404).json("Không tìm thấy thông tin đăng ký");
            }

            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            tempUser.verificationCode = verificationCode;

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

    generateAccessToken: (user) => {
        return jwt.sign(
            { id: user.id, admin: user.admin },
            process.env.JWT_ACCESS_KEY,
            { expiresIn: "30s" }
        );
    },

    generateRefreshToken: (user) => {
        return jwt.sign(
            { id: user.id, admin: user.admin },
            process.env.JWT_REFRESH_KEY,
            { expiresIn: "365d" }
        );
    },

    loginUser: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) {
                return res.status(404).json("Wrong email");
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password);
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
        refreshTokens = refreshTokens.filter((token) => token !== req.cookies.refreshToken);
        res.status(200).json("Logged out");
    },
};

module.exports = authController;