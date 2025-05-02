const Payment = require("../models/Payment");

const paymentController = {
  getRevenueByType: async (req, res) => {
    try {
      const revenueByType = await Payment.aggregate([
        {
          $match: {
            status: "success",
          },
        },
        {
          $group: {
            _id: "$paymentType",
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            paymentType: "$_id",
            totalAmount: 1,
            _id: 0,
          },
        },
      ]);

      const revenueMap = {
        rental_fee: 0,
        penalty: 0,
        membership: 0,
      };

      revenueByType.forEach((item) => {
        revenueMap[item.paymentType] = item.totalAmount;
      });

      res.status(200).json(revenueMap);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy doanh thu", error: err.message });
    }
  },
};

module.exports = paymentController;