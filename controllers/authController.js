const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../config/db');

// Generates a JWT
const generateToken = (id, username) => {
  // Make sure to add JWT_SECRET to your .env file
  return jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT secret is not set in .env file.");
    return res.status(500).json({ message: "Server configuration error." });
  }

  try {
    // 1. Find the user in the database
    const [users] = await db.query('SELECT id, username, password FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // 2. Compare the provided password with the hashed password from the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // 3. If passwords match, generate a token
      res.json({
        token: generateToken(user.id, user.username),
      });
    } else {
      // If passwords do not match
      res.status(401).json({ message: 'Invalid credentials' });
    }

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error during authentication." });
  }
};


// @desc    Update user credentials
// @route   PUT /api/auth/update-credentials
// @access  Private
exports.updateCredentials = async (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    const userId = req.user.id; // from protect middleware

    if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to make changes.' });
    }
    if (!newUsername && !newPassword) {
        return res.status(400).json({ message: 'Please provide a new username or a new password.' });
    }

    try {
        const [users] = await db.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = users[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect current password.' });
        }

        // If password is correct, proceed with updates
        if (newUsername) {
            await db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, userId]);
        }

        if (newPassword) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);
            await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
        }

        res.json({ message: 'Credentials updated successfully.' });

    } catch (error) {
        console.error("Error updating credentials:", error);
        // Check for unique constraint violation on username
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(409).json({ message: 'That username is already taken. Please choose another.' });
        }
        res.status(500).json({ message: 'Server error while updating credentials.' });
    }
};