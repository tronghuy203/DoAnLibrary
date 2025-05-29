require("dotenv").config();
const cron = require("node-cron");
const BorrowRecord = require("../models/BorrowRecord");
const Penalty = require("../models/Penalty");
const User = require("../models/User");
const nodemailer = require("nodemailer");

process.env.TZ = 'Asia/Ho_Chi_Minh';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatVietnamDateTime = (date) => {
  return new Date(date).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const calculateDelayDays = (currentDate, dueDate) => {
  const startOfCurrentDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const startOfDueDate = new Date(
    dueDate.getFullYear(),
    dueDate.getMonth(),
    dueDate.getDate()
  );

  const timeDiff = startOfCurrentDate - startOfDueDate;
  let delayDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (startOfCurrentDate > startOfDueDate) {
    delayDays = Math.max(1, delayDays);
  } else {
    delayDays = 0;
  }

  return delayDays;
};

// Chạy hàng ngày lúc 00:00
// */2 * * * *
cron.schedule("0 0 * * *", async () => {
  console.log("Running penalty check job at:", new Date().toString());
  try {
    const currentDate = new Date();

    const overdueRecords = await BorrowRecord.find({
      status: { $in: ["borrowing", "overdue"] },
      dueDate: { $lt: currentDate },
      returnDate: null,
    }).lean();

    if (overdueRecords.length === 0) {
      console.warn(
        "No overdue records found. Check database or query conditions."
      );
    }

    for (const record of overdueRecords) {
      console.log(
        `Processing borrowId: ${record._id}, dueDate: ${new Date(
          record.dueDate
        ).toString()}, userId: ${record.userId}`
      );

      const existingPenalty = await Penalty.findOne({
        borrowRecordId: record._id.toString(),
      });

      if (!existingPenalty) {
        if (!record.userId) {
          console.error(`BorrowRecord missing userId: ${record._id}`);
          continue;
        }

        const delayDays = calculateDelayDays(
          currentDate,
          new Date(record.dueDate)
        );
        const penaltyAmount = delayDays * 5000;

        const penalty = new Penalty({
          userId: record.userId,
          borrowRecordId: record._id,
          amount: penaltyAmount,
          paidAmount: 0,
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: "pending",
        });
        await penalty.save();
        console.log(
          `Penalty created for borrowId: ${record._id}, amount: ${penaltyAmount}, penaltyId: ${penalty._id}, delayDays: ${delayDays}`
        );

        if (record.status !== "overdue") {
          await BorrowRecord.updateOne(
            { _id: record._id },
            { status: "overdue" }
          );
          console.log(`BorrowRecord ${record._id} updated to overdue`);
        }

        const user = await User.findById(record.userId);
        if (user && user.email) {
          await transporter.sendMail({
            from: '"Library System" <your-email@gmail.com>',
            to: user.email,
            subject: "Thông báo phạt trễ hạn",
            text: `Bạn đã trễ hạn trả sách. Số tiền phạt: ${penaltyAmount} VND. Vui lòng thanh toán trước ${formatVietnamDateTime(penalty.dueAt)}.`,
          });
          console.log(`Email sent to ${user.email} for penalty ${penalty._id}`);
        } else {
          console.warn(`No user or email found for userId: ${record.userId}`);
        }
      } else {
        const delayDays = calculateDelayDays(
          currentDate,
          new Date(record.dueDate)
        );
        const totalPenaltyAmount = delayDays * 5000;
        const newPenaltyAmount =
          totalPenaltyAmount - (existingPenalty.paidAmount || 0);

        existingPenalty.amount = newPenaltyAmount > 0 ? newPenaltyAmount : 0;
        existingPenalty.status = newPenaltyAmount > 0 ? "pending" : "paid";
        existingPenalty.dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await existingPenalty.save();
        console.log(
          `Penalty updated for borrowId: ${record._id}, total: ${totalPenaltyAmount}, paid: ${existingPenalty.paidAmount}, remaining: ${newPenaltyAmount}, status: ${existingPenalty.status}, penaltyId: ${existingPenalty._id}, delayDays: ${delayDays}`
        );

        const user = await User.findById(record.userId);
        if (user && user.email && newPenaltyAmount > 0) {
          await transporter.sendMail({
            from: '"Library System" <your-email@gmail.com>',
            to: user.email,
            subject: "Cập nhật phạt trễ hạn",
            text: `Số tiền phạt trễ hạn của bạn đã được cập nhật: ${newPenaltyAmount} VND (Tổng phạt: ${totalPenaltyAmount} VND, Đã thanh toán: ${existingPenalty.paidAmount} VND). Vui lòng thanh toán số còn lại trước ${formatVietnamDateTime(existingPenalty.dueAt)}.`,
          });
          console.log(
            `Email sent to ${user.email} for updated penalty ${existingPenalty._id}`
          );
        }
      }
    }
  } catch (err) {
    console.error("Error in penalty job:", {
      message: err.message,
      stack: err.stack,
    });
  }
});

console.log("Penalty job scheduled at:", new Date().toString());