require("dotenv").config();
module.exports = {
    vnp_TmnCode: process.env.VNP_TMNCODE,
    vnp_HashSecret: process.env.VNP_HASH_SECRET,
    vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html", 
    vnp_ReturnUrl: `${process.env.SERVER_URL}/v1/membership/vnpay_return`,
  };