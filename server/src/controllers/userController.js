const prisma = require("../config/db");
const bcryptjs = require("bcryptjs");

exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });
  res.json(user);
};

exports.getAnalytics = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    // Get all quiz attempts for the user
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        question: {
          select: {
            id: true,
            title: true,
            type: true
          }
        }
      },
      orderBy: { attemptedAt: 'desc' }
    });

    // Calculate overall stats
    const totalAttempts = attempts.length;
    const correctAnswers = attempts.filter(a => a.isCorrect).length;
    const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

    // Separate by type
    const codingAttempts = attempts.filter(a => a.question?.type === 'coding');
    const aptitudeAttempts = attempts.filter(a => a.question?.type === 'aptitude');

    const codingCorrect = codingAttempts.filter(a => a.isCorrect).length;
    const aptitudeCorrect = aptitudeAttempts.filter(a => a.isCorrect).length;

    const codingAccuracy = codingAttempts.length > 0 ? (codingCorrect / codingAttempts.length) * 100 : 0;
    const aptitudeAccuracy = aptitudeAttempts.length > 0 ? (aptitudeCorrect / aptitudeAttempts.length) * 100 : 0;

    res.json({
      success: true,
      stats: {
        totalAttempts,
        correctAnswers,
        accuracy,
        codingAttempts: codingAttempts.length,
        aptitudeAttempts: aptitudeAttempts.length,
        codingAccuracy,
        aptitudeAccuracy
      },
      attempts: attempts.slice(0, 20) // Return last 20 attempts
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, branch, college, graduationYear, targetCompanies } = req.body;
    const userId = req.user.id;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        branch: branch || null,
        college: college || null,
        graduationYear: graduationYear ? parseInt(graduationYear) : null,
        targetCompanies: Array.isArray(targetCompanies) ? targetCompanies : []
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};
