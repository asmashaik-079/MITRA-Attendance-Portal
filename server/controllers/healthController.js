const { isInitialized, initializationError } = require('../config/firebaseAdmin');

exports.checkHealth = (req, res) => {
  if (isInitialized) {
    return res.json({
      success: true,
      message: "MITRA Attendance Portal API is running",
      firebaseAdmin: true
    });
  } else {
    return res.status(500).json({
      success: false,
      message: "MITRA Attendance Portal API is running but Firebase Admin failed to initialize",
      error: initializationError || "Unknown Firebase Admin initialization error"
    });
  }
};
