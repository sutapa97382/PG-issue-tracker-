import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Room from '../models/Room.js';

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
