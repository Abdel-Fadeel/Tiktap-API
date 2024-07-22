import User from "../models/User.js";

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().populate("profiles");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("profiles");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const updateUser = async (req, res) => {
  const { email, password } = req.body;
  const updates = { email, password };
  try {
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Server error");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    res.status(200).json({ msg: "User deleted" });
  } catch (err) {
    res.status(500).send("Server error");
  }
};
