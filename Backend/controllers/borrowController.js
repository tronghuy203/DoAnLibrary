const BorrowRequest = require("../models/BorrowRequest");
const BorrowRecord = require("../models/BorrowRecord");
const Penalty = require("../models/Penalty");
const Payment = require("../models/Payment");
const Book = require("../models/Book");
const { v4: uuidv4 } = require("uuid");

const borrowController = {
  requestBorrow: async (req, res) => {
    try {
      const { bookId } = req.body;
      const userId = req.user.id;

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

      // Kiểm tra nếu đang có đơn mượn chưa hoàn tất
      const activeBorrow = await BorrowRecord.findOne({
        userId,
        bookId,
        status: { $in: ["waiting_pickup", "borrowing"] },
      });

      if (activeBorrow) {
        return res.status(400).json({
          message:
            "Bạn đang mượn hoặc đã thanh toán sách này. Không thể gửi yêu cầu mới.",
        });
      }

      // Kiểm tra sách còn không
      const book = await Book.findById(bookId);
      if (!book) {
        return res.status(404).json({ message: "Không tìm thấy sách." });
      }

      if (book.quantity <= 0) {
        return res.status(400).json({ message: "Sách đã hết, không thể mượn." });
      }

      // Tạo yêu cầu mới
      const request = new BorrowRequest({ userId, bookId, status: "pending" });
      const savedRequest = await request.save();

      res.status(201).json(savedRequest);
    } catch (err) {
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
      res.status(500).json({ message: "Lỗi khi lấy danh sách yêu cầu", error: err.message });
    }
  },

  getBorrowRequestById: async (req, res) => {
    try {
      const { requestId } = req.params;
      const userId = req.user.id;
  
      const request = await BorrowRequest.findOne({ _id: requestId, userId })
        .populate("bookId", "title price"); // Lấy thêm thông tin sách nếu cần
      if (!request) {
        return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn" });
      }
  
      res.status(200).json(request);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy thông tin yêu cầu", error: err.message });
    }
  },
  // Người dùng thanh toán phí mượn và hệ thống tự tạo BorrowRecord
  payRentalFeeAndCreateBorrow: async (req, res) => {
    try {
      const { requestId } = req.params;
      const { method } = req.body;
      const userId = req.user.id;

      const request = await BorrowRequest.findById(requestId);
      if (!request)
        return res.status(404).json({ message: "Không tìm thấy yêu cầu mượn" });
      if (request.status === "paid")
        return res.status(400).json({ message: "Yêu cầu đã thanh toán" });

      const book = await Book.findById(request.bookId);
      if (!book)
        return res.status(404).json({ message: "Không tìm thấy sách" });

      // Kiểm tra sách còn không
      if (book.quantity <= 0) {
        return res.status(400).json({ message: "Sách đã hết, không thể mượn." });
      }

      // Số tiền thanh toán chính là giá sách
      const rentalFee = book.price;

      // Tạo bản ghi thanh toán
      const payment = new Payment({
        userId,
        amount: rentalFee,
        paymentType: "rental_fee",
        method,
        status: "success",
      });

      await payment.save();

      // Tạo đơn mượn
      const borrowRecord = new BorrowRecord({
        userId: request.userId,
        bookId: request.bookId,
        borrowDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày
        status: "waiting_pickup",
      });

      await borrowRecord.save();

      // Cập nhật trạng thái yêu cầu
      request.status = "paid";
      await request.save();

      // Giảm số lượng sách
      book.quantity -= 1;
      await book.save();

      res.status(201).json({
        message: "Thanh toán thành công, đã tạo đơn mượn",
        borrowRecord,
        payment,
      });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Lỗi thanh toán và tạo đơn", error: err.message });
    }
  },

  // Admin xác nhận người dùng đến lấy sách
  confirmPickup: async (req, res) => {
    try {
      const { borrowId } = req.params;
      const record = await BorrowRecord.findById(borrowId);
      if (!record)
        return res.status(404).json({ message: "Không tìm thấy đơn mượn" });

      // Kiểm tra đã thanh toán chưa
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

  // Trả sách + tính phạt nếu trễ
  confirmReturn: async (req, res) => {
    try {
      const { borrowId } = req.params;

      const record = await BorrowRecord.findById(borrowId);
      if (!record) {
        return res.status(404).json({ message: "Không tìm thấy đơn mượn." });
      }

      if (record.status !== "borrowing") {
        return res.status(400).json({ message: "Trạng thái không hợp lệ để xác nhận trả sách." });
      }

      const returnDate = new Date();
      record.returnDate = returnDate;

      // Tăng lại số lượng sách
      const book = await Book.findById(record.bookId);
      if (book) {
        book.quantity += 1;
        await book.save();
      }

      // Tính tiền phạt nếu trễ
      if (returnDate > record.dueDate) {
        record.status = "overdue";

        const delayDays = Math.ceil(
          (returnDate - record.dueDate) / (1000 * 60 * 60 * 24)
        );
        const penaltyAmount = delayDays * 10000;

        const penalty = new Penalty({
          borrowRecordId: record._id,
          amount: penaltyAmount,
          code: uuidv4(),
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // hạn đóng phạt 7 ngày
          status: "unpaid"
        });

        await penalty.save();
      } else {
        record.status = "returned";
      }

      await record.save();

      res.status(200).json({ message: "Đã xác nhận trả sách thành công", record });
    } catch (err) {
      res.status(500).json({ message: "Lỗi xác nhận trả sách", error: err.message });
    }
  },

  // Thanh toán tiền phạt
  payPenalty: async (req, res) => {
    try {
      const { penaltyId } = req.params;
      const { method } = req.body;
      const userId = req.user.id;

      const penalty = await Penalty.findById(penaltyId);
      if (!penalty)
        return res.status(404).json({ message: "Không tìm thấy mã phạt" });
      if (penalty.status === "paid")
        return res.status(400).json({ message: "Đã thanh toán rồi" });

      const payment = new Payment({
        userId,
        amount: penalty.amount,
        paymentType: "penalty",
        penaltyId: penalty._id,
        method,
        status: "success",
      });

      await payment.save();
      penalty.status = "paid";
      await penalty.save();

      res.status(200).json({ message: "Đã thanh toán phạt", payment });
    } catch (err) {
      res.status(500).json({ message: "Lỗi thanh toán", error: err.message });
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

  getTotalRevenue: async (req, res) => {
    try {
      const result = await Payment.aggregate([
        { $match: { status: "success" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" }
          }
        }
      ]);

      const total = result[0]?.totalRevenue || 0;
      res.status(200).json({ totalRevenue: total });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tính tổng doanh thu", error: err.message });
    }
  },

    // Tổng doanh thu theo ngày
    getDailyRevenue: async (req, res) => {
      try {
        const result = await Payment.aggregate([
          {
            $match: { status: "success" }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              totalRevenue: { $sum: "$amount" }
            }
          },
          {
            $sort: { _id: 1 } // Sắp xếp theo ngày tăng dần
          }
        ]);
  
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ message: "Lỗi khi tính tổng doanh thu theo ngày", error: err.message });
      }
    },
  
};

module.exports = borrowController;
