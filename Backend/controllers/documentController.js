const Document = require("../models/Document");
const multer = require("multer");
const path = require("path");
const User = require("../models/User");
const Membership = require("../models/Membership");
const UserMembership = require("../models/UserMembership");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); 
  },
});

const upload = multer({ storage }).fields([
  { name: "file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

const assignFreeMembership = async (userId) => {
  const freeMembership = await Membership.findOne({ name: "Free" });
  if (!freeMembership) {
    throw new Error("Không tìm thấy gói Free");
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

  await User.findByIdAndUpdate(userId, {
    membership: {
      membershipId: freeMembership._id,
      userMembershipId: userMembership._id,
    },
  });

  return { userMembership, membership: freeMembership };
};

const checkMembershipLimits = async (userId, action) => {
  try {
    const user = await User.findById(userId).populate("membership.userMembershipId membership.membershipId");

    if (user.admin) {
      return { userMembership: null, countField: null, today: null };
    }

    if (!user || !user.membership) {
      const { userMembership, membership } = await assignFreeMembership(userId);
      const today = new Date().toISOString().split("T")[0];
      const countField = action === "view" ? "viewCount" : "downloadCount";
      return { userMembership, countField, today, membership };
    }

    const userMembership = await UserMembership.findById(user.membership.userMembershipId);
    const membership = await Membership.findById(user.membership.membershipId);
    const today = new Date().toISOString().split("T")[0];

    const countField = action === "view" ? "viewCount" : "downloadCount";
    const limitField = action === "view" ? "viewLimit" : "downloadLimit";

    userMembership[countField] = userMembership[countField].filter(
      (entry) => entry.date.toISOString().split("T")[0] === today
    );

    let countEntry = userMembership[countField].find(
      (entry) => entry.date.toISOString().split("T")[0] === today
    );

    if (!countEntry) {
      countEntry = { date: new Date(), count: 0 };
      userMembership[countField].push(countEntry);
    }

    if (countEntry.count >= membership[limitField]) {
      throw Object.assign(new Error(`Đã vượt quá giới hạn ${action === "view" ? "xem" : "tải"} trong ngày`), {
        status: 403,
      });
    }

    await userMembership.save();
    return { userMembership, countField, today, membership };
  } catch (err) {
    err.status = err.status || 500;
    throw err;
  }
};

const documentController = {
  uploadDocument: async (req, res) => {
    try {
      const { title, description } = req.body;
      const fileUrl = req.files?.file ? `/uploads/${req.files.file[0].filename}` : "";
      const thumbnailUrl = req.files?.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : "";

      if (!fileUrl) {
        return res.status(400).json({ message: "Vui lòng tải lên file tài liệu" });
      }

      const newDocument = new Document({
        title,
        description,
        fileUrl,
        thumbnailUrl,
        uploadedBy: req.user.id,
        status: 'pending',
      });

      const savedDocument = await newDocument.save();
      res.status(201).json({message: 'Tài liệu đã được tải lên và đang chờ duyệt', document: savedDocument });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi tải tài liệu!", error: err.message });
    }
  },


  getAllDocuments: async (req, res) => {
    try {
      let query = {};
      if (!req.user.admin) {
        query.status = 'approved';
      }
      const documents = await Document.find(query).populate("uploadedBy", "username");
      res.status(200).json(documents);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  approveDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Tài liệu không tồn tại" });
      }
      
      document.status = 'approved';
      await document.save();
      
      res.status(200).json({ 
        message: 'Tài liệu đã được duyệt thành công',
        document 
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi duyệt tài liệu", error: err });
    }
  },

  rejectDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Tài liệu không tồn tại" });
      }
      
      document.status = 'rejected';
      await document.save();
      
      res.status(200).json({ 
        message: 'Tài liệu đã bị từ chối',
        document 
      });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi từ chối tài liệu", error: err });
    }
  },

  getDocumentById: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json("Không tìm thấy tài liệu");
      }
      res.status(200).json(document);
    } catch (err) {
      res.status(500).json(err);
    }
  },



  viewDocument: async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Không thể xác thực người dùng" });
      }

      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ message: "Tài liệu không tồn tại" });
      }
      if (document.status !== "approved" && !req.user.admin) {
        return res.status(403).json({ message: "Tài liệu chưa được duyệt" });
      }

      let userMembership, countField, today;
      if (!req.user.admin && document.uploadedBy.toString() !== req.user.id) {
        const limits = await checkMembershipLimits(req.user.id, "view");
        userMembership = limits.userMembership;
        countField = limits.countField;
        today = limits.today;

        if (userMembership) {
          const viewEntry = userMembership[countField].find(
            (v) => v.date.toISOString().split("T")[0] === today
          );
          if (viewEntry) {
            viewEntry.count += 1;
          } else {
            userMembership[countField].push({ date: new Date(), count: 1 });
          }
          await userMembership.save();
        }
      }

      const docViewEntry = document.viewHistory.find(
        (v) => v.date.toISOString().split("T")[0] === today
      );
      if (docViewEntry) {
        docViewEntry.count += 1;
      } else {
        document.viewHistory.push({ date: new Date(), count: 1 });
      }
      document.views += 1;
      await document.save();

      const filePath = path.join(__dirname, "../uploads", path.basename(document.fileUrl));
      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File tài liệu không tồn tại" });
      }
      res.sendFile(filePath, (err) => {
        if (err) {
          res.status(500).json({ message: "Lỗi khi gửi file", error: err.message });
        }
      });
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  },

  downloadDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) return res.status(404).json({ message: "Tài liệu không tồn tại" });
      if (document.status !== "approved" && !req.user.admin) {
        return res.status(403).json({ message: "Tài liệu chưa được duyệt" });
      }

      let userMembership, countField, today;
      if (!req.user.admin && document.uploadedBy.toString() !== req.user.id) {
        const limits = await checkMembershipLimits(req.user.id, "download");
        userMembership = limits.userMembership;
        countField = limits.countField;
        today = limits.today;

        if (userMembership) {
          const downloadEntry = userMembership[countField].find(
            (d) => d.date.toISOString().split("T")[0] === today
          );
          if (downloadEntry) {
            downloadEntry.count += 1;
          } else {
            userMembership[countField].push({ date: new Date(), count: 1 });
          }
          await userMembership.save();
        }
      }

      const docDownloadEntry = document.downloadHistory.find(
        (d) => d.date.toISOString().split("T")[0] === today
      );
      if (docDownloadEntry) {
        docDownloadEntry.count += 1;
      } else {
        document.downloadHistory.push({ date: new Date(), count: 1 });
      }
      document.downloads += 1;
      await document.save();

      res.download(path.join(__dirname, "../uploads", path.basename(document.fileUrl)));
    } catch (err) {
      res.status(err.status || 500).json({ message: err.message });
    }
  },

  getPendingDocuments: async (req, res) => {
    try {
      const documents = await Document.find({ status: 'pending' })
        .populate("uploadedBy", "username");
      res.status(200).json(documents);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy danh sách tài liệu chờ duyệt", error: err });
    }
  },

  deleteDocument: async (req, res) => {
    try {
      await Document.findByIdAndDelete(req.params.id);
      res.status(200).json("Tài liệu đã được xóa thành công");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getTotalStats: async (req, res) => {
    try {
      const stats = await Document.aggregate([
        {
          $group: {
            _id: null,
            totalViews: { $sum: "$views" },
            totalDownloads: { $sum: "$downloads" },
          },
        },
      ]);
      res.status(200).json(stats[0] || { totalViews: 0, totalDownloads: 0 });
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê tổng", error: err });
    }
  },

  getDocumentStats: async (req, res) => {
    try {
      const stats = await Document.find({}, "title views downloads");
      res.status(200).json(stats);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy thống kê", error: err });
    }
  },
  getUserDocuments: async (req, res) => {
    try {
      const userId = req.params.userId;
      if (req.user.id !== userId && !req.user.admin) {
        return res.status(403).json({ message: "Bạn không có quyền xem tài liệu của người dùng này" });
      }
      const documents = await Document.find({ uploadedBy: userId }).select('title fileUrl status createdAt');
      res.status(200).json(documents);
    } catch (err) {
      res.status(500).json({ message: "Lỗi khi lấy tài liệu", error: err.message });
    }
  },  
};

module.exports = { documentController, upload };
