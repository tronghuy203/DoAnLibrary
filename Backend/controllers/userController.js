const User = require("../models/User");

const userController = {
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find();
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateUser: async (req, res) => {
        try {
            if (req.user.id === req.params.id || req.user.admin) {
                const updatedUser = await User.findByIdAndUpdate(
                    req.params.id,
                    req.body,
                    { new: true }
                );
                return res.status(200).json(updatedUser);
            } else {
                return res.status(403).json("Bạn chỉ có thể cập nhật thông tin của mình!");
            }
        } catch (error) {
            return res.status(500).json(error);
        }
    },
    

    deleteUser: async (req, res) => {
        try {
            if (req.user.id === req.params.id) {
                await User.findByIdAndDelete(req.params.id);
                return res.status(200).json({ message: "Deleted successfully", selfDeleted: true });
            } else if (req.user.admin) {
                await User.findByIdAndDelete(req.params.id);
                return res.status(200).json({ message: "User deleted by admin", selfDeleted: false });
            } else {
                return res.status(403).json("You can only delete your own account!");
            }
        } catch (err) {
            res.status(500).json(err);
        }
    },

    updateProfile: async (req, res) => {
        try {
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id,
                {
                    fullName: req.body.fullName,
                    dob: req.body.dob,
                    gender: req.body.gender,
                    phone: req.body.phone,
                    avatar: req.body.avatar
                },
                { new: true }
            );
            res.status(200).json(updatedUser);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};

module.exports = userController;