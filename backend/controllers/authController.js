import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Room from '../models/Room.js';
import { sendEmail } from '../utils/sendEmail.js';

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d',
    }
  );
};

/**
 * @desc    Tenant Signup
 * @route   POST /api/auth/tenant-signup
 * @access  Public
 */
export const tenantSignup = async (req, res) => {
  try {
    const { name, email, password, roomSecretKey } = req.body;

    // Validation
    if (!name || !email || !password || !roomSecretKey) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, roomSecretKey.',
      });
    }

    const cleanKey = roomSecretKey.trim().toUpperCase();

    // 1. Find Room by secretKey
    const room = await Room.findOne({ secretKey: cleanKey });
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Invalid Room Secret Key',
      });
    }

    // 2. Check if room is already occupied
    if (room.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        message: 'Room already occupied',
      });
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // 4. Hash password with bcrypt 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create User with role tenant
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'tenant',
      roomNumber: room.roomNumber,
      roomId: room._id,
    });

    // 6. Update Room status to Occupied and set tenant
    room.status = 'Occupied';
    room.tenant = user._id;
    await room.save();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Tenant account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber,
        roomId: user.roomId,
      },
    });
  } catch (error) {
    console.error('Tenant signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during tenant signup',
    });
  }
};

/**
 * @desc    Admin Signup
 * @route   POST /api/auth/admin-signup
 * @access  Public (Requires adminSecretCode)
 */
export const adminSignup = async (req, res) => {
  try {
    const { name, email, password, adminSecretCode } = req.body;

    // Validation
    if (!name || !email || !password || !adminSecretCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, adminSecretCode.',
      });
    }

    // Check adminSecretCode against process.env.ADMIN_SECRET_CODE
    const envAdminCode = process.env.ADMIN_SECRET_CODE || 'PROP360ADMIN2024';
    if (adminSecretCode.trim() !== envAdminCode.trim()) {
      return res.status(403).json({
        success: false,
        message: 'Invalid Admin Secret Code',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Hash password with bcrypt 10 salt rounds
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create Admin user
    const admin = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
    });

    const token = generateToken(admin);

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during admin signup',
    });
  }
};

/**
 * @desc    Login for all roles (tenant, admin, worker)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const query = { email: cleanEmail };

    // If role provided (from frontend pills: Tenant/Admin/Worker), match case-insensitively
    if (role) {
      query.role = role.toLowerCase().trim();
    }

    // Find User
    const user = await User.findOne(query);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or role mismatch',
      });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roomNumber: user.roomNumber,
        roomId: user.roomId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

/**
 * @desc    Create Worker Account (Admin only)
 * @route   POST /api/auth/create-worker
 * @access  Private/Admin
 */
export const createWorker = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and initial password for the worker.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const worker = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'worker',
    });

    return res.status(201).json({
      success: true,
      message: 'Worker account created successfully',
      worker: {
        id: worker._id,
        name: worker.name,
        email: worker.email,
        role: worker.role,
        createdAt: worker.createdAt,
      },
    });
  } catch (error) {
    console.error('Create worker error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating worker',
    });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error retrieving user',
    });
  }
};

/**
 * @desc    Get all workers (Admin only, e.g. for task assignment)
 * @route   GET /api/auth/workers
 * @access  Private/Admin
 */
export const getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: workers.length,
      workers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching workers',
    });
  }
};

// In-memory token store as fallback for standalone or resilient deployment
const memoryResetTokens = new Map();

/**
 * @desc    Forgot Password - Send reset email with token
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Generate random 32-byte token (64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expireTime = Date.now() + 60 * 60 * 1000; // 1 hour validity

    // Store in memory map as fallback
    memoryResetTokens.set(cleanEmail, {
      token: resetToken,
      expiresAt: expireTime,
    });

    // Also attempt to update MongoDB User record if available
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpire = new Date(expireTime);
        await user.save({ validateBeforeSave: false });
      }
    } catch (dbErr) {
      console.warn('[Forgot Password] DB lookup notice:', dbErr.message);
    }

    // Determine the frontend base URL
    const frontendUrl =
      process.env.FRONTEND_URL ||
      req.headers.origin ||
      req.headers.referer?.replace(/\/$/, '') ||
      'http://localhost:5173';

    // Construct the direct password reset URL containing the secure token
    const resetUrl = `${frontendUrl}/?action=reset-password&token=${resetToken}&email=${encodeURIComponent(cleanEmail)}`;

    // Compose high-quality responsive email HTML
    const html = `
      <div style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">PropMate 360</h1>
          <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 14px;">Enterprise Property & PG Issue Tracking</p>
        </div>

        <div style="padding: 32px 28px;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 600; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Hello,
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            We received a request to reset the password for your PropMate 360 Admin account (<strong>${cleanEmail}</strong>).
          </p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Click the button below to choose a new password. This link is secure and will remain active for <strong>60 minutes</strong>:
          </p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background: #2563eb; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.3);">
              Reset My Password →
            </a>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin-top: 24px; font-size: 13px; color: #64748b; line-height: 1.5;">
            <strong>Link not clickable?</strong> Copy and paste this URL into your browser:<br />
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.5; margin-top: 28px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            If you did not request this password reset, please ignore this email or contact support. Your password will remain unchanged.
          </p>
        </div>

        <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          © ${new Date().getFullYear()} PropMate 360. All rights reserved.
        </div>
      </div>
    `;

    const text = `PropMate 360 - Password Reset Request\n\nHello,\n\nWe received a request to reset your password for ${cleanEmail}.\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 60 minutes.\nIf you did not make this request, you can safely ignore this email.`;

    const emailResult = await sendEmail({
      to: cleanEmail,
      subject: '🔐 Reset your PropMate 360 Admin Password',
      html,
      text,
    });

    return res.status(200).json({
      success: true,
      message: `A password reset link has been dispatched to ${cleanEmail}. Please check your email inbox.`,
      previewUrl: emailResult.previewUrl || null,
      resetUrl, // Provided for direct verification if needed
    });
  } catch (error) {
    console.error('[Forgot Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to dispatch password reset email. Please try again.',
    });
  }
};

/**
 * @desc    Reset Password with token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, reset token, and your new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify token validity from memory fallback or database
    let isValidToken = false;

    // Check memory store
    const memRecord = memoryResetTokens.get(cleanEmail);
    if (memRecord && memRecord.token === token && memRecord.expiresAt > Date.now()) {
      isValidToken = true;
      memoryResetTokens.delete(cleanEmail);
    }

    // Check MongoDB user record
    try {
      const user = await User.findOne({
        email: cleanEmail,
        resetPasswordToken: token,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (user) {
        isValidToken = true;
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpire = null;
        await user.save();
      }
    } catch (dbErr) {
      console.warn('[Reset Password] DB update notice:', dbErr.message);
    }

    if (!isValidToken) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password has been updated successfully. You can now log in with your new credentials.',
    });
  } catch (error) {
    console.error('[Reset Password Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while resetting password.',
    });
  }
};

