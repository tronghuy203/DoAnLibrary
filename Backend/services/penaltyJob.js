require("dotenv").config();
const cron = require('node-cron');
const BorrowRecord = require('../models/BorrowRecord');
const Penalty = require('../models/Penalty');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Chạy hàng ngày lúc 00:00
// */1 * * * *
cron.schedule('0 0 * * *', async () => {
  console.log('Running penalty check job...');
  try {
    const currentDate = new Date();
    const overdueRecords = await BorrowRecord.find({
      status: { $in: ['borrowing', 'overdue'] },
      dueDate: { $lt: currentDate },
      returnDate: null,
    });

    for (const record of overdueRecords) {
      const existingPenalty = await Penalty.findOne({
        borrowRecordId: record._id,
      });

      if (!existingPenalty) {
        if (!record.userId) {
          console.error("BorrowRecord missing userId:", { borrowId: record._id, record });
          continue;
        }

        const delayDays = Math.ceil(
          (currentDate - record.dueDate) / (1000 * 60 * 60 * 24)
        );
        const penaltyAmount = delayDays * 10000;

        const penalty = new Penalty({
          userId: record.userId,
          borrowRecordId: record._id,
          amount: penaltyAmount,
          paidAmount: 0,
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'pending',
        });
        await penalty.save();
        console.log(`Penalty created for borrowId: ${record._id}, amount: ${penaltyAmount}`);

        if (record.status !== 'overdue') {
          record.status = 'overdue';
          await record.save();
          console.log(`BorrowRecord ${record._id} updated to overdue`);
        }

        const user = await User.findById(record.userId);
        if (user && user.email) {
          await transporter.sendMail({
            from: '"Library System" <your-email@gmail.com>',
            to: user.email,
            subject: 'Thông báo phạt trễ hạn',
            text: `Bạn đã trễ hạn trả sách. Số tiền phạt: ${penaltyAmount} VND. Vui lòng thanh toán trước ${penalty.dueAt}.`,
          });
          console.log(`Email sent to ${user.email} for penalty ${penalty._id}`);
        } else {
          console.warn(`No user or email found for userId: ${record.userId}`);
        }
      } else {
        const delayDays = Math.ceil(
          (currentDate - record.dueDate) / (1000 * 60 * 60 * 24)
        );
        const totalPenaltyAmount = delayDays * 10000;
        const newPenaltyAmount = totalPenaltyAmount - (existingPenalty.paidAmount || 0);

        if (newPenaltyAmount !== existingPenalty.amount) {
          existingPenalty.amount = newPenaltyAmount;
          existingPenalty.status = newPenaltyAmount > 0 ? 'pending' : 'paid';
          existingPenalty.dueAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          await existingPenalty.save();
          console.log(`Penalty updated for borrowId: ${record._id}, total: ${totalPenaltyAmount}, paid: ${existingPenalty.paidAmount}, remaining: ${newPenaltyAmount}, status: ${existingPenalty.status}`);

          const user = await User.findById(record.userId);
          if (user && user.email && newPenaltyAmount > 0) {
            await transporter.sendMail({
              from: '"Library System" <your-email@gmail.com>',
              to: user.email,
              subject: 'Cập nhật phạt trễ hạn',
              text: `Số tiền phạt trễ hạn của bạn đã được cập nhật: ${newPenaltyAmount} VND (Tổng phạt: ${totalPenaltyAmount} VND, Đã thanh toán: ${existingPenalty.paidAmount} VND). Vui lòng thanh toán số còn lại trước ${existingPenalty.dueAt}.`,
            });
            console.log(`Email sent to ${user.email} for updated penalty ${existingPenalty._id}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error in penalty job:', {
      message: err.message,
      stack: err.stack,
    });
  }
});

console.log('Penalty job scheduled');