const User = require("../models/User");

const userController = {
    getAllUsers: async(req,res) =>{
        try{
            const user = await User.find();
            res.status(200).json(user);
        }catch(err){
            res.status(500).json(err);
        }
    },

    updateUsers: async(req,res) =>{
        try {
            if (req.user.admin) {
                await User.findByIdAndUpdate(req.params.id,req.body, { new: true });
                return res.status(200).json("Update successfully")
            } else {
                return res.status(403).json("ban khong phai admin")
            }
        } catch (error) {
            return res.status(500).json(error)
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
    }
}

module.exports = userController;