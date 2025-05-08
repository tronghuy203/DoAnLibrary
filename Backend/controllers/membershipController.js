require("dotenv").config();
const Membership = require("../models/Membership");
const UserMembership = require("../models/UserMembership");
const User = require("../models/User");
const Payment = require("../models/Payment");
const vnpayConfig = require("../config/vnpayMembership");
const querystring = require("qs");
const crypto = require("crypto");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let i = 0; i < keys.length; i++) {
    sorted[keys[i]] = obj[keys[i]];
  }
  return sorted;
}

function createVnpayUrl(paymentData, ipAddr) {
  let vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: vnpayConfig.vnp_TmnCode,
    vnp_Amount: paymentData.amount * 100,
    vnp_CreateDate: new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14),
    vnp_CurrCode: "VND",
    vnp_IpAddr: ipAddr,
    vnp_Locale: "vn",
    vnp_OrderInfo: `Thanhtoangoi${paymentData.membershipId}`,
    vnp_OrderType: "128000",
    vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
    vnp_TxnRef: paymentData.vnp_TxnRef,
  };

  vnpParams = sortObject(vnpParams);
  let signData = querystring.stringify(vnpParams);
  let hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnpParams["vnp_SecureHash"] = signed;

  return `${vnpayConfig.vnp_Url}?${querystring.stringify(vnpParams)}`;
}

const membershipController = {
  getMemberships: async (req, res) => {
    try {
      const memberships = await Membership.find();
      res.status(200).json(memberships);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách gói", error: err.message });
    }
  },

  purchaseMembership: async (req, res) => {
    try {
      const { membershipId, method } = req.body;
      const userId = req.user.id;
      const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      const membership = await Membership.findById(membershipId);
      if (!membership) {
        return res.status(404).json({ message: "Không tìm thấy gói thành viên" });
      }

      if (method === "vnpay" && membership.price > 0) {
        const vnp_TxnRef = `${membershipId}_${Date.now()}`;
        const paymentData = { amount: membership.price, membershipId, vnp_TxnRef };
        const vnpayUrl = createVnpayUrl(paymentData, ipAddr);

        const payment = new Payment({
          userId,
          amount: membership.price,
          paymentType: "membership",
          method,
          status: "pending",
          vnpayTxnRef: vnp_TxnRef,
          membershipId,
        });
        await payment.save();

        return res.status(200).json({
          message: "Vui lòng hoàn tất thanh toán qua VNPay",
          paymentUrl: vnpayUrl,
          payment,
        });
      } else {
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + membership.duration * 24 * 60 * 60 * 1000);

        const userMembership = new UserMembership({
          userId,
          membershipId,
          startDate,
          endDate,
          viewCount: [{ date: startDate, count: 0 }],
          downloadCount: [{ date: startDate, count: 0 }],
        });
        await userMembership.save();

        await User.findByIdAndUpdate(userId, {
          membership: { membershipId, userMembershipId: userMembership._id },
        });

        const payment = new Payment({
          userId,
          amount: membership.price,
          paymentType: "membership",
          method: method || "free",
          status: "success",
          membershipId,
        });
        await payment.save();

        res.status(201).json({ message: "Đăng ký gói thành viên thành công", userMembership });
      }
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi mua gói", error: err.message });
    }
  },

  vnpayReturn: async (req, res) => {
    try {
      let vnpParams = req.query;
      let secureHash = vnpParams["vnp_SecureHash"];

      delete vnpParams["vnp_SecureHash"];
      delete vnpParams["vnp_SecureHashType"];

      vnpParams = sortObject(vnpParams);
      let signData = querystring.stringify(vnpParams);
      let hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
      let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

      if (secureHash !== signed) {
        return res.status(400).json({ message: "Chữ ký không hợp lệ" });
      }

      const txnRef = vnpParams["vnp_TxnRef"];
      const responseCode = vnpParams["vnp_ResponseCode"];
      const payment = await Payment.findOne({ vnpayTxnRef: txnRef });

      if (!payment) {
        return res.status(404).json({ message: "Không tìm thấy giao dịch" });
      }

      if (responseCode === "00") {
        payment.status = "success";
        await payment.save();

        const membership = await Membership.findById(payment.membershipId);
        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + membership.duration * 24 * 60 * 60 * 1000);

        const userMembership = new UserMembership({
          userId: payment.userId,
          membershipId: payment.membershipId,
          startDate,
          endDate,
          viewCount: [{ date: startDate, count: 0 }],
          downloadCount: [{ date: startDate, count: 0 }],
        });
        await userMembership.save();

        await User.findByIdAndUpdate(payment.userId, {
          membership: { membershipId: payment.membershipId, userMembershipId: userMembership._id },
        });

        res.redirect(`${process.env.CLIENT_URL}/payment-redirect?txnRef=${txnRef}`);
      } else {
        payment.status = "failed";
        await payment.save();
        res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
      }
    } catch (err) {
      res.status(500).json({ message: "Lỗi xử lý callback", error: err.message });
    }
  },

  checkMembershipStatus: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).populate("membership.membershipId membership.userMembershipId");

      if (!user || !user.membership) {
        const freeMembership = await Membership.findOne({ name: "Free" });
        if (!freeMembership) {
          return res.status(500).json({ message: "Không tìm thấy gói miễn phí" });
        }

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + freeMembership.duration * 24 * 60 * 60 * 1000);

        const userMembership = new UserMembership({
          userId,
          membershipId: freeMembership._id,
          startDate,
          endDate,
          viewCount: [{ date: startDate, count: 0 }],
          downloadCount: [{ date: startDate, count: 0 }],
        });
        await userMembership.save();

        user.membership = { membershipId: freeMembership._id, userMembershipId: userMembership._id };
        await user.save();

        return res.status(200).json({
          membershipId: freeMembership,
          userMembershipId: userMembership,
        });
      }

      const userMembership = await UserMembership.findById(user.membership.userMembershipId);
      const today = new Date();

      if (today > userMembership.endDate) {
        const freeMembership = await Membership.findOne({ name: "Free" });
        if (!freeMembership) {
          return res.status(500).json({ message: "Không tìm thấy gói miễn phí" });
        }

        const startDate = new Date();
        const endDate = new Date(startDate.getTime() + freeMembership.duration * 24 * 60 * 60 * 1000);

        const newUserMembership = new UserMembership({
          userId,
          membershipId: freeMembership._id,
          startDate,
          endDate,
          viewCount: [{ date: startDate, count: 0 }],
          downloadCount: [{ date: startDate, count: 0 }],
        });
        await newUserMembership.save();

        user.membership = { membershipId: freeMembership._id, userMembershipId: newUserMembership._id };
        await user.save();

        return res.status(200).json({
          membershipId: freeMembership,
          userMembershipId: newUserMembership,
        });
      }

      res.status(200).json(user.membership);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi kiểm tra trạng thái", error: err.message });
    }
  },
};

module.exports = membershipController;