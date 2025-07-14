const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.registerUser = async ({ name, email, password }) => {
  // Check for exisitng account with that email
  if (await User.findOne({ email })) {
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password });
  return user;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No account found with that email");
  }

  // Compare password entered and password in database
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Password is incorrect");
  }

  if (!user.isActive) {
    throw new Error("Account has been deactivated");
  }

  return user;
};

exports.generatePasswordReset = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("No account found with that email");
  }

  // Generate a random token and expiry date
  const resetToken = crypto.randomBytes(20).toString("hex");
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = Date.now() + 1000 * 60 * 60;

  await user.save();

  return resetToken;
};

exports.resetPassword = async ({ token, newPassword }) => {
  // Find the user with this token and for who token has not expired
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Reset token is invalid or has expired");
  }

  // Set their password to the new one
  user.password = newPassword;

  // Remove the reset token and expiry to prevent reuse
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Save the updated user back to database
  await user.save();

  return user;
};

exports.sendOtp = async ({ email, code }) => {
  const user = await User.findOne({ email }).select("+otpCode +otpExpires");
  if (!user) {
    throw new Error("No account with that email");
  }

  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set it for user with a 10-minute expiry
  user.otpCode = code;
  user.otpExpires = Date.now() + 1000 * 10 * 60;
  await user.save();

  //Send via mail
  const transporter = nodemailer.createTransport({
    /* your SMTP settings */
  });
  await transporter.sendMail({
    to: email,
    subject: "Your verification code",
    text: `Your code is ${code}. It expires in 10 minutes.`,
  });

  return true;
};

exports.verifyOtp = async ({ email }) => {
  const user = await User.findOne({ email }).select("+otpCode +otpExpires");
  if (!user) {
    throw new Error("No account with that email");
  }

  if (user.otpCode !== code || Date.now() > user.otpExpires) {
    throw new Error("Code is invalid or expired");
  }

  // Clear out OTP and expiry to prevent reuse
  user.otpCode = undefined;
  user.otpExpires = undefined;

  await user.save();

  return user;
};
