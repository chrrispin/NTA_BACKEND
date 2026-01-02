const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connection = require('../models/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Signup (Create admin user)
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        if (results.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already registered' 
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        connection.query(
          'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
          [name, email, hashedPassword, 'admin'],
          (insertError, insertResults) => {
            if (insertError) {
              console.error('Insert error:', insertError);
              return res.status(500).json({ 
                success: false, 
                message: 'Failed to create user' 
              });
            }

            // Generate JWT token
            const token = jwt.sign(
              { id: insertResults.insertId, email, role: 'admin' },
              JWT_SECRET,
              { expiresIn: '24h' }
            );

            res.status(201).json({
              success: true,
              message: 'User created successfully',
              data: {
                token,
                user: { id: insertResults.insertId, name, email, role: 'admin' }
              }
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
      async (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        if (results.length === 0) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }

        const user = results[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
          });
        }

        // Generate JWT token
        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: { 
              id: user.id, 
              name: user.name, 
              email: user.email, 
              role: user.role 
            }
          }
        });
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};