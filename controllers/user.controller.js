import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { catchAsync, AppError } from "../middleware/error.middleware.js";
import crypto from "crypto";
import sendEmail from "../utils/email.js";
/**
 * Create a new user account
 * @route POST /api/v1/users/signup
 */
export const createUserAccount = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  
  // Create user
  const newUser = await User.create({ name, email, password });
  
  // Remove password from the response
  newUser.password = undefined;
  
  res.status(201).json({
    success: true,
    message: 'User created successfully. Welcome email sent!',
    data: newUser
  });
});

/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
 */
export const authenticateUser = catchAsync(async (req, res) => {
  // TODO: Implement user authentication functionality
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  console.log(user);
  await user.comparePassword(password);
  generateToken(res, user, "User is authenticated");
});

/**
 * Sign out user and clear cookie
 * @route POST /api/v1/users/signout
 */
export const signOutUser = catchAsync(async (_, res) => {
  // TODO: Implement sign out functionality
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message: "user is signed out successfully",
  });
});

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  // TODO: Implement get current user profile functionality
  res.status(200).json({
    success: true,
    message: "user profile  fetched successfully",
    user: req.user,
  });
});

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  // TODO: Implement update user profile functionality
  const { name, email, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, {
    name,
    email,
    avatar,
  });
  res.status(200).json({
    success: " true",
    message: "user is updates successfully",
    data: user,
  });
});

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {
  // TODO: Implement change user password functionality
  const { currentPassword, newPassword } = req.body;
  
  if (!newPassword) {
    throw new AppError("New password is required", 400);
  }
  
  const user = await User.findById(req.user.id).select("+password");
  
  if (!user) {
    throw new AppError("User not found", 404);
  }
  
  const isPasswordCorrect = await user.comparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new AppError("Current password is incorrect", 401);
  }
  
  user.password = newPassword;
  await user.save(); // Let the pre-save hook handle password hashing
  
  res.status(200).json({
    success: true,
    message: "password changed succesfully",
  });
});

/**
 * Request password reset
 * @route POST /api/v1/users/forgot-password
 */

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  
  // 1) Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  // 2) Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) has requested a password reset. Please make a PUT request to: \n\n ${resetUrl}\n\nThis password reset link will expire in 10 minutes.`;

  const subject = "Password Reset Request (Valid for 10 Minutes)";
  try {
    // 4) Send email
    sendEmail({to : user.email,message : message,subject:subject})
    res.status(200).json({
      status: 'success',
      message: 'Password reset link sent to email!'
    });
  } catch (err) {
    // 5) If error sending email, clear the reset token
    return next(
      new AppError('There was an error sending the email. Please try again later!'),
      500
    );
  }
});

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  // TODO: Implement reset password functionality
});

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  // TODO: Implement delete user account functionality
});
