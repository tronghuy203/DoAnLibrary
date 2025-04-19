const mongoose = require("mongoose");

const userMembershipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  viewCount: [
    {
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],
  downloadCount: [
    {
      date: { type: Date, required: true },
      count: { type: Number, default: 0 },
    },
  ],
},{timestamps:true});

module.exports = mongoose.model("UserMembership", userMembershipSchema);