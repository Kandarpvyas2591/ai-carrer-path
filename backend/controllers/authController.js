import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Simple demo cookie settings (no prod/dev branching)
const cookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: "This username is already taken. Please choose a different one." });
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "This email is already registered. Please use a different email or try logging in." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hashedPassword });

    // Issue JWT cookie (demo)
    const token = jwt.sign({ uid: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res
      .cookie("token", token, cookieOptions)
      .status(201)
      .json({
        message: "Signup successful",
        user: { id: user._id, username: user.username, email: user.email },
      });
  } catch (err) {
    console.error("Signup error:", err);
    
    // Handle MongoDB duplicate key errors (code 11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];
      if (field === 'username') {
        return res.status(409).json({ message: "This username is already taken. Please choose a different one." });
      }
      if (field === 'email') {
        return res.status(409).json({ message: "This email is already registered. Please use a different email or try logging in." });
      }
      return res.status(409).json({ message: `This ${field} is already in use. Please choose a different value.` });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages || "Validation failed. Please check your input." });
    }
    
    // Generic server error for unexpected issues
    return res.status(500).json({ message: "Something went wrong. Please try again later or contact support if the problem persists." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Email" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid Password" });
    }

    const token = jwt.sign({ uid: String(user._id) }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res
      .cookie("token", token, cookieOptions)
      .status(200)
      .json({
        message: "Login successful",
        user: { id: user._id, username: user.username, email: user.email },
      });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (_req, res) => {
  try {
    res.clearCookie("token", { ...cookieOptions, maxAge: 0 });
    return res.json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("username email profile");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (err) {
    console.error("Get me error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profile } = req.body || {};
    if (!profile || typeof profile !== "object") {
      return res.status(400).json({ message: "Provide a profile object" });
    }

    const update = {};
    if (profile.currentRole !== undefined) update["profile.currentRole"] = profile.currentRole;
    if (profile.experience !== undefined) update["profile.experience"] = profile.experience;
    if (Array.isArray(profile.skills)) update["profile.skills"] = profile.skills;
    if (Array.isArray(profile.interests)) update["profile.interests"] = profile.interests;
    if (Array.isArray(profile.goals)) update["profile.goals"] = profile.goals;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: update },
      { new: true }
    ).select("username email profile");

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};