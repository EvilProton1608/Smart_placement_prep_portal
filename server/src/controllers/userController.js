const prisma = require("../config/db");
const bcryptjs = require("bcryptjs");
const { computeAndUpsertUserProgress } = require("../services/userProgressService");

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  profilePhotoUrl: true,
  branch: true,
  college: true,
  graduationYear: true,
  targetCompanies: true,
  createdAt: true
};

exports.getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: PROFILE_SELECT
  });
  res.json(user);
};

exports.getAnalytics = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const payload = await buildAnalyticsPayload(userId);
    res.json(payload);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

exports.getMyAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const progress = await computeAndUpsertUserProgress(userId);
    res.json({
      success: true,
      progress
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

async function buildAnalyticsPayload(userId) {
  const [quizAttempts, codingSubs] = await Promise.all([
    prisma.quizAttempt.findMany({
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
      orderBy: { attemptedAt: "desc" }
    }),
    prisma.codingSubmission.findMany({
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
      orderBy: { submittedAt: "desc" }
    })
  ]);

  const aptitudeAttempts = quizAttempts.filter((a) => a.question?.type === "aptitude");
  const aptitudeCorrect = aptitudeAttempts.filter((a) => a.isCorrect).length;
  const aptitudeAccuracy = aptitudeAttempts.length > 0 ? (aptitudeCorrect / aptitudeAttempts.length) * 100 : 0;

  const codingAttemptsCount = codingSubs.length;
  const codingCorrect = codingSubs.filter((s) => s.status === "passed").length;
  const codingAccuracy = codingAttemptsCount > 0 ? (codingCorrect / codingAttemptsCount) * 100 : 0;

  const totalAttempts = aptitudeAttempts.length + codingAttemptsCount;
  const correctAnswers = aptitudeCorrect + codingCorrect;
  const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

  const mergedAttempts = [
    ...quizAttempts.map((a) => ({
      attemptedAt: a.attemptedAt,
      isCorrect: a.isCorrect,
      question: a.question
    })),
    ...codingSubs.map((s) => ({
      attemptedAt: s.submittedAt,
      isCorrect: s.status === "passed",
      question: s.question
    }))
  ]
    .sort((a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime())
    .slice(0, 20);

  const progress = await computeAndUpsertUserProgress(userId);

  return {
    success: true,
    stats: {
      totalAttempts,
      correctAnswers,
      accuracy,
      codingAttempts: codingAttemptsCount,
      aptitudeAttempts: aptitudeAttempts.length,
      codingAccuracy,
      aptitudeAccuracy
    },
    progress,
    attempts: mergedAttempts
  };
}

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
      },
      select: PROFILE_SELECT
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

exports.updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No photo uploaded"
      });
    }

    const userId = req.user.id;
    const profilePhotoUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePhotoUrl },
      select: PROFILE_SELECT
    });

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile photo:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile photo",
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
