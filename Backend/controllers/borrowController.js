require("dotenv").config();
const vnpayConfig = require("../config/vnpay");
const BorrowRequest = require("../models/BorrowRequest");
const BorrowRecord = require("../models/BorrowRecord");
const Penalty = require("../models/Penalty");
const Payment = require("../models/Payment");
const Book = require("../models/Book");

function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  for (let i = 0; i < keys.length; i++) {
    sorted[keys[i]] = obj[keys[i]];
  }
  return sorted;
}

function createVnpayUrl(paymentData, ipAddr) {
  let vnpParams = {};
  vnpParams["vnp_Version"] = "2.1.0";
  vnpParams["vnp_Command"] = "pay";
  vnpParams["vnp_TmnCode"] = vnpayConfig.vnp_TmnCode;
  vnpParams["vnp_Amount"] = paymentData.amount * 100;
  vnpParams["vnp_CreateDate"] = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, 14);
  vnpParams["vnp_CurrCode"] = "VND";
  vnpParams["vnp_IpAddr"] = ipAddr;
  vnpParams["vnp_Locale"] = "vn";
  vnpParams["vnp_OrderInfo"] = `Thanhtoanphimuonsach${paymentData.requestId}`;
  vnpParams["vnp_OrderType"] = "128000";
  vnpParams["vnp_ReturnUrl"] = vnpayConfig.vnp_ReturnUrl;
  vnpParams["vnp_TxnRef"] = paymentData.vnp_TxnRef;

  vnpParams = sortObject(vnpParams);

  const querystring = require("qs");
  const crypto = require("crypto");
  let signData = querystring.stringify(vnpParams,{ encode: false });
  let hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  vnpParams["vnp_SecureHash"] = signed;

  return `${vnpayConfig.vnp_Url}?${querystring.stringify(vnpParams)}`;
}

const borrowController = {
  requestBorrow: async (req, res) => {
    try {
      const { bookId } = req.body;
      const userId = req.user.id;

      const pendingPenalties = await Penalty.find({
        userId,
        status: 'pending',
        amount: { $gt: 0 },
      });

      if (pendingPenalties.length > 0) {
        return res.status(403).json({
          message: "Bạn có khoản phạt chưa thanh toán. Vui lòng thanh toán trước khi mượn sách.",
        });
      }

      const existingRequest = await BorrowRequest.findOne({
        userId,
        bookId,
        status: "pending",
      });

      if (existingRequest) {
        return res.status(400).json({
          message: "Bạn đã gửi yêu cầu mượn sách này và đang chờ xử lý.",
        });
      }

      const activeBorrow = await BorrowRecord.findOne({
        userId,
        bookId,
        status: { $in: ["waiting_pickup", "borrowing", "overdue"] },
      });

      if (activeBorrow) {
        return res.status(400).json({
          message:
            "Bạn đang mượn hoặc có đơn mượn chưa hoàn tất cho sách này. Không thể gửi yêu cầu mới.",
        });
      }

      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: "Không tìm thấy sách." });
      }

      if (book.quantity <= 0) {
        return res.status(400).json({ message: "Sách đã hết, không thể mượn." });
      }

      const request = new BorrowRequest({ userId, bookId, status: "pending" });
      const savedRequest = await request.save();

      res.status(201).json(savedRequest);
    } catch (err) {
      console.error("Lỗi gửi yêu cầu mượn:", err);
      res.status(500).json({
        message: "Lỗi gửi yêu cầu mượn",
        error: err.message,
      });
    }
  },

  getMyBorrowRequests: async (req, res) => {
    try {
      const userId = req.user.id;
      const requests = await BorrowRequest.find({ userId });
      res.status(200).json(requests);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách yêu cầu", error: err.message });
    }
  },

  getBorrowRequestById: async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;

      const request = await BorrowRequest.findOne({
        _id: requestId,
        userId,
      }).populate("bookId", "title price");
      if (!request) {
        return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn" });
      }

      res.status(200).json(request);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy thông tin yêu cầu", error: err.message });
    }
  },
  payRentalFeeAndCreateBorrow: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { method } = req.body;
      const userId = req.user.id;
      const ipAddr =
        req.headers["x-forwarded-for"] || req.connection.remoteAddress;

      const request = await BorrowRequest.findById(requestId);
      if (!request)
        return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn" });
      if (request.status === "paid")
        return res.status(400).json({ message: "Yêu cầu đã thanh toán" });

      const book = await Book.findById(request.bookId);
      if (!book)
        return res.status(404).json({ message: "Không tìm thấy sách" });
      if (book.quantity <= 0)
        return res.status(400).json({ message: "Sách đã hết, không thể mượn" });

      const rentalFee = book.price;

      if (method === "vnpay") {
        const vnp_TxnRef = `${requestId}_${Date.now()}`;
        const paymentData = {
          amount: rentalFee,
          requestId: requestId,
          vnp_TxnRef: vnp_TxnRef,
        };
        const vnpayUrl = createVnpayUrl(paymentData, ipAddr);

        const payment = new Payment({
          userId,
          amount: rentalFee,
          paymentType: "rental_fee",
          method,
          status: "pending",
          vnpayTxnRef: vnp_TxnRef,
        });
        await payment.save();

        return res.status(200).json({
          message: "Vui lòng hoàn tất thanh toán qua VNPay",
          paymentUrl: vnpayUrl,
          payment,
        });
      } else {
        const borrowRecord = new BorrowRecord({
          userId: request.userId,
          bookId: request.bookId,
          borrowDate: new Date(),
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "waiting_pickup",
        });
        await borrowRecord.save();

        const payment = new Payment({
          userId,
          amount: rentalFee,
          paymentType: "rental_fee",
          method,
          status: "success",
          borrowRecordId: borrowRecord._id,
        });
        await payment.save();

        const populatedBorrowRecord = await BorrowRecord.findById(
          borrowRecord._id
        ).populate("bookId");

        request.status = "paid";
        await request.save();

        book.quantity -= 1;
        book.sold = (book.sold || 0) + 1;
        await book.save();

        res.status(201).json({
          message: "Thanh toán thành công, đã tạo đơn mượn",
          borrowRecord: populatedBorrowRecord,
          payment,
        });
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi thanh toán và tạo đơn", error: err.message });
    }
  },

  vnpayReturn: async (req, res) => {
    try {
      let vnpParams = req.query;
      let secureHash = vnpParams["vnp_SecureHash"];
  
      delete vnpParams["vnp_SecureHash"];
      delete vnpParams["vnp_SecureHashType"];
  
      vnpParams = sortObject(vnpParams);
  
      const querystring = require("qs");
      const crypto = require("crypto");
      let signData = querystring.stringify(vnpParams, { encode: false });
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
  
        if (payment.paymentType === "penalty") {
          const penalty = await Penalty.findById(payment.penaltyId);
          if (penalty) {
            penalty.paidAmount += payment.amount;
            penalty.status = penalty.paidAmount >= penalty.amount ? 'paid' : 'pending';
            await penalty.save();
          }
        } else if (payment.paymentType === "rental_fee") {
          const request = await BorrowRequest.findById(txnRef.split("_")[0]);
          const book = await Book.findById(request.bookId);
  
          const borrowRecord = new BorrowRecord({
            userId: request.userId,
            bookId: request.bookId,
            borrowDate: new Date(),
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: "waiting_pickup",
          });
          await borrowRecord.save();
  
          payment.borrowRecordId = borrowRecord._id;
          await payment.save();
  
          request.status = "paid";
          await request.save();
  
          book.quantity -= 1;
          book.sold = (book.sold || 0) + 1;
          await book.save();
        }
  
        res.redirect(`${process.env.CLIENT_URL}/payment-redirect?txnRef=${txnRef}`);
      } else {
        payment.status = "failed";
        await payment.save();
        res.redirect(`${process.env.CLIENT_URL}/payment-failed`);
      }
    } catch (err) {
      console.error("Error in vnpayReturn:", err);
      res.status(500).json({ message: "Lỗi xử lý callback", error: err.message });
    }
  },

  // Admin xác nhận người dùng đến lấy sách
  confirmPickup: async (req, res) => {
    try {
      const { borrowId } = req.params;
      const record = await BorrowRecord.findById(borrowId);
      if (!record)
        return res.status(404).json({ message: "Không tìm thấy đơn mượn" });

      const hasPaid = await Payment.exists({
        userId: record.userId,
        paymentType: "rental_fee",
        status: "success",
      });

      if (!hasPaid) {
        return res
          .status(400)
          .json({ message: "Người dùng chưa thanh toán phí mượn sách." });
      }

      record.status = "borrowing";
      record.adminConfirmed = true;
      await record.save();

      res.status(200).json({ message: "Đã xác nhận lấy sách", record });
    } catch (err) {
      res.status(500).json({ message: "Lỗi xác nhận", error: err.message });
    }
  },

  // Trả sách
  confirmReturn: async (req, res) => {
    try {
      const { borrowId } = req.params;
  
      const record = await BorrowRecord.findById(borrowId);
      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy đơn mượn." });
      }
  
      if (record.status !== "borrowing" && record.status !== "overdue") {
        return res
          .status(400)
          .json({ message: "Trạng thái không hợp lệ để xác nhận trả sách." });
      }
  
      const returnDate = new Date();
      record.returnDate = returnDate;
      record.status = "returned";
  
      const book = await Book.findById(record.bookId);
      if (book) {
        book.quantity += 1;
        await book.save();
      }
  
      await record.save();
  
      res
        .status(200)
        .json({ message: "Đã xác nhận trả sách thành công", record });
    } catch (err) {
      console.error(`Error in confirmReturn for borrowId: ${borrowId}`, err.stack);
      res
        .status(500)
        .json({ message: "Lỗi xác nhận trả sách", error: err.message });
    }
  },

  // Thanh toán tiền phạt
  payPenalty: async (req, res) => {
    try {
      const { penaltyId } = req.params;
      const { method } = req.body;
      const userId = req.user.id;
      const ipAddr = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  
      const penalty = await Penalty.findById(penaltyId);
      if (!penalty) {
        return res.status(404).json({ message: "Không tìm thấy mã phạt" });
      }
      if (penalty.status === "paid") {
        return res.status(400).json({ message: "Đã thanh toán rồi" });
      }
      if (penalty.userId.toString() !== userId) {
        return res.status(403).json({ message: "Không có quyền thanh toán khoản phạt này" });
      }
  
      if (method !== "vnpay") {
        return res.status(400).json({ message: "Chỉ hỗ trợ thanh toán qua VNPay" });
      }
  
      const vnp_TxnRef = `${penaltyId}_${Date.now()}`;
      const paymentData = {
        amount: penalty.amount,
        requestId: penaltyId,
        vnp_TxnRef: vnp_TxnRef,
      };
      const vnpayUrl = createVnpayUrl(paymentData, ipAddr);
  
      const payment = new Payment({
        userId,
        amount: penalty.amount,
        paymentType: "penalty",
        penaltyId: penalty._id,
        method,
        status: "pending",
        vnpayTxnRef: vnp_TxnRef,
      });
      await payment.save();
  
      return res.status(200).json({
        message: "Vui lòng hoàn tất thanh toán qua VNPay",
        paymentUrl: vnpayUrl,
        payment,
      });
    } catch (err) {
      console.error("Error in payPenalty:", err);
      res.status(500).json({ message: "Lỗi thanh toán", error: err.message });
    }
  },

  getPenaltyByBorrow: async (req, res) => {
    try {
      const { borrowId } = req.params;
      const penalty = await Penalty.findOne({ borrowRecordId: borrowId });
      if (!penalty) {
        return res.status(404).json({ message: "Không tìm thấy khoản phạt" });
      }
      res.status(200).json(penalty);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy khoản phạt", error: err.message });
    }
  },
  // Danh sách đơn mượn cho admin
  getAllBorrowRecords: async (req, res) => {
    try {
      const records = await BorrowRecord.find().populate("userId bookId");
      res.status(200).json(records);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi lấy danh sách", error: err.message });
    }
  },

  checkPaymentStatus: async (req, res) => {
    try {
      const { txnRef } = req.query;
      const payment = await Payment.findOne({ vnpayTxnRef: txnRef }).populate(
        "userId",
        "username email"
      );
      if (!payment) {
        console.error("Không tìm thấy payment với txnRef:", txnRef);
        return res.status(404).json({ message: "Không tìm thấy giao dịch" });
      }

      if (payment.status === "success") {
        const borrowRecord = await BorrowRecord.findOne({
          userId: payment.userId,
          createdAt: { $gte: payment.createdAt },
        }).populate("bookId", "title price");

        return res.status(200).json({
          message: "Thanh toán thành công",
          payment,
          borrowRecord,
        });
      } else if (payment.status === "failed") {
        return res.status(400).json({ message: "Thanh toán thất bại" });
      } else {
        return res.status(202).json({ message: "Giao dịch đang xử lý" });
      }
    } catch (err) {
      console.error("Lỗi trong checkPaymentStatus:", err.message);
      res
        .status(500)
        .json({ message: "Lỗi kiểm tra trạng thái", error: err.message });
    }
  },
  getTotalRevenue: async (req, res) => {
    try {
      const result = await Payment.aggregate([
        { $match: { status: "success" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
          },
        },
      ]);

      const total = result[0]?.totalRevenue || 0;
      res.status(200).json({ totalRevenue: total });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi khi tính tổng doanh thu", error: err.message });
    }
  },
  historyPayment: async (req, res) => {
    try {
      const { userId } = req.params;
  
      if (req.user.id !== userId && !req.user.admin) {
        return res.status(403).json({ message: "Không có quyền truy cập" });
      }
  
      const payments = await Payment.find({ userId })
        .populate({
          path: "borrowRecordId",
          populate: { path: "bookId", select: "title" },
        })
        .sort({ createdAt: -1 });
  
      res.status(200).json(payments);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy lịch sử thanh toán", error: err.message });
    }
  },

  // Tổng doanh thu theo ngày
  getDailyRevenue: async (req, res) => {
    try {
      const result = await Payment.aggregate([
        {
          $match: { status: "success" },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            totalRevenue: { $sum: "$amount" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      res.status(200).json(result);
    } catch (err) {
      res
        .status(500)
        .json({
          message: "Lỗi khi tính tổng doanh thu theo ngày",
          error: err.message,
        });
    }
  },
};

module.exports = borrowController;
