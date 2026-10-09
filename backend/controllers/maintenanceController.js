import Maintenance from '../models/Maintenance.js';
import User from '../models/User.js';

/**
 * @desc    Create a new maintenance issue/ticket (Tenant only)
 * @route   POST /api/maintenance
 * @access  Private (Tenant)
 */
export const createMaintenanceIssue = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description for the issue.',
      });
    }

    if (req.user.role !== 'tenant') {
      return res.status(403).json({
        success: false,
        message: 'Only registered tenants can report maintenance problems.',
      });
    }

    if (!req.user.roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'You are not assigned to any room.',
      });
    }

    const issue = await Maintenance.create({
      title: title.trim(),
      description: description.trim(),
      roomNumber: req.user.roomNumber,
      tenantId: req.user._id,
      status: 'Open',
    });

    const populatedIssue = await Maintenance.findById(issue._id)
      .populate('tenantId', 'name email roomNumber')
      .populate('assignedWorkerId', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Maintenance ticket created successfully',
      issue: populatedIssue,
    });
  } catch (error) {
    console.error('Create maintenance issue error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating maintenance issue',
    });
  }
};

/**
 * @desc    Get all maintenance issues (Admin gets all, Worker gets assigned, Tenant gets own)
 * @route   GET /api/maintenance
 * @access  Private
 */
export const getMaintenanceIssues = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'tenant') {
      query.tenantId = req.user._id;
    } else if (req.user.role === 'worker') {
      query.assignedWorkerId = req.user._id;
    }
    // Admin sees all

    const issues = await Maintenance.find(query)
      .populate('tenantId', 'name email roomNumber')
      .populate('assignedWorkerId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error('Get maintenance issues error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching maintenance issues',
    });
  }
};

/**
 * @desc    Update ticket status (Open -> In Progress -> Resolved)
 * @route   PUT /api/maintenance/:id/status
 * @access  Private (Admin or Assigned Worker)
 */
export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required: Open, In Progress, or Resolved',
      });
    }

    const issue = await Maintenance.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found',
      });
    }

    // Check authorization: Admin or assigned worker
    if (
      req.user.role !== 'admin' &&
      (!issue.assignedWorkerId || issue.assignedWorkerId.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update status for this ticket',
      });
    }

    issue.status = status;
    await issue.save();

    const updatedIssue = await Maintenance.findById(id)
      .populate('tenantId', 'name email roomNumber')
      .populate('assignedWorkerId', 'name email');

    return res.status(200).json({
      success: true,
      message: `Status updated to ${status}`,
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error updating ticket status',
    });
  }
};

/**
 * @desc    Assign worker to ticket (Admin only)
 * @route   PUT /api/maintenance/:id/assign
 * @access  Private (Admin)
 */
export const assignWorkerToIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    const issue = await Maintenance.findById(id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance ticket not found',
      });
    }

    if (workerId) {
      const worker = await User.findOne({ _id: workerId, role: 'worker' });
      if (!worker) {
        return res.status(404).json({
          success: false,
          message: 'Worker not found with given ID',
        });
      }
      issue.assignedWorkerId = worker._id;
      if (issue.status === 'Open') {
        issue.status = 'In Progress';
      }
    } else {
      issue.assignedWorkerId = null;
    }

    await issue.save();

    const updatedIssue = await Maintenance.findById(id)
      .populate('tenantId', 'name email roomNumber')
      .populate('assignedWorkerId', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Worker assigned successfully',
      issue: updatedIssue,
    });
  } catch (error) {
    console.error('Assign worker error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error assigning worker',
    });
  }
};
