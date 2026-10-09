import Room from '../models/Room.js';
import User from '../models/User.js';
import { generateRoomSecretKey } from '../utils/generateKey.js';

/**
 * @desc    Create a new Room (auto-generates secretKey)
 * @route   POST /api/rooms/create
 * @access  Private/Admin
 */
export const createRoom = async (req, res) => {
  try {
    const { roomNumber, propertyName } = req.body;

    if (!roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a room number (e.g., R101, R202).',
      });
    }

    const cleanRoomNumber = roomNumber.trim().toUpperCase();

    // Format validation: A-101, B-204, R102, 101 are all valid
    const roomNumberRegex = /^[A-Za-z0-9-]+$/;
    if (!roomNumberRegex.test(cleanRoomNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid room number format. Room number can only contain letters, numbers, and hyphens (e.g., A-101, B-204, R102, 101).',
      });
    }

    // Check if room number already exists
    const existingRoom = await Room.findOne({ roomNumber: cleanRoomNumber });
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: `Room ${cleanRoomNumber} already exists.`,
      });
    }

    // Generate guaranteed unique key
    let secretKey = generateRoomSecretKey(cleanRoomNumber);
    let keyExists = await Room.findOne({ secretKey });
    while (keyExists) {
      secretKey = generateRoomSecretKey(cleanRoomNumber);
      keyExists = await Room.findOne({ secretKey });
    }

    const room = await Room.create({
      roomNumber: cleanRoomNumber,
      propertyName: propertyName ? propertyName.trim() : 'PropMate Residency',
      secretKey,
      status: 'Vacant',
      tenant: null,
    });

    return res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} created successfully`,
      room,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating room',
    });
  }
};

/**
 * @desc    Get all rooms with populated tenant details
 * @route   GET /api/rooms/all
 * @access  Private/Admin
 */
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate({
        path: 'tenant',
        select: 'name email role createdAt',
      })
      .sort({ roomNumber: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error('Get all rooms error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching rooms',
    });
  }
};

/**
 * @desc    Reset room key: clears tenant, sets status Vacant, generates new secretKey
 * @route   PUT /api/rooms/reset-key/:id
 * @access  Private/Admin
 */
export const resetRoomKey = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // If room had a tenant, clear user's room linkage
    if (room.tenant) {
      await User.findByIdAndUpdate(room.tenant, {
        roomId: null,
        roomNumber: null,
      });
    }

    // Generate new unique secret key
    let newSecretKey = generateRoomSecretKey(room.roomNumber);
    let keyExists = await Room.findOne({ secretKey: newSecretKey });
    while (keyExists) {
      newSecretKey = generateRoomSecretKey(room.roomNumber);
      keyExists = await Room.findOne({ secretKey: newSecretKey });
    }

    // Clear tenant, set status Vacant, update secretKey
    room.tenant = null;
    room.status = 'Vacant';
    room.secretKey = newSecretKey;

    await room.save();

    return res.status(200).json({
      success: true,
      message: `Secret key for room ${room.roomNumber} has been reset successfully`,
      room,
    });
  } catch (error) {
    console.error('Reset room key error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error resetting room key',
    });
  }
};

/**
 * @desc    Delete a room
 * @route   DELETE /api/rooms/:id
 * @access  Private/Admin
 */
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // If assigned to a tenant, clear their room ref
    if (room.tenant) {
      await User.findByIdAndUpdate(room.tenant, {
        roomId: null,
        roomNumber: null,
      });
    }

    await Room.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting room',
    });
  }
};

/**
 * @desc    Validate secret key (public endpoint for tenant signup form check)
 * @route   GET /api/rooms/validate-key/:key
 * @access  Public
 */
export const validateRoomKey = async (req, res) => {
  try {
    const { key } = req.params;
    const cleanKey = key.trim().toUpperCase();

    const room = await Room.findOne({ secretKey: cleanKey });
    if (!room) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Invalid Room Secret Key',
      });
    }

    if (room.status === 'Occupied') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Room is already occupied',
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      roomNumber: room.roomNumber,
      propertyName: room.propertyName,
      message: `Valid key for Room ${room.roomNumber}`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Error validating key',
    });
  }
};
