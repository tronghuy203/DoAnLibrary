require("dotenv").config();
module.exports = {
    vnp_TmnCode: process.env.VNP_TMNCODE, // Mã website do VNPay cung cấp
    vnp_HashSecret: process.env.VNP_HASH_SECRET, // Chuỗi bí mật do VNPay cung cấp
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", // URL sandbox để test
    vnp_ReturnUrl: "http://localhost:8000/v1/membership/vnpay_return", // URL callback sau thanh toán
  };