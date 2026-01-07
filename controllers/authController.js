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
                user: { 
                  id: insertResults.insertId, 
                  name, 
                  email, 
                  role: 'admin',
                  profile_picture: null
                }
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
              role: user.role,
              profile_picture: user.profile_picture
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

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    if (!name || !email || !password || !role) {
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path); // Delete uploaded file if validation fails
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, password, and role are required' 
      });
    }

    if (password.length < 6) {
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
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
          if (req.file) {
            const fs = require('fs');
            fs.unlinkSync(req.file.path);
          }
          console.error('Database error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        if (results.length > 0) {
          if (req.file) {
            const fs = require('fs');
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ 
            success: false, 
            message: 'Email already registered' 
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        connection.query(
          'INSERT INTO users (name, email, password, role, profile_picture, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
          [name, email, hashedPassword, role, profilePicture],
          (insertError, insertResults) => {
            if (insertError) {
              if (req.file) {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
              }
              console.error('Insert error:', insertError);
              return res.status(500).json({ 
                success: false, 
                message: 'Failed to create user' 
              });
            }

            res.status(201).json({
              success: true,
              message: 'User created successfully',
              data: {
                id: insertResults.insertId,
                name,
                email,
                role,
                profile_picture: profilePicture
              }
            });
          }
        );
      }
    );
  } catch (error) {
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get all users (admin only)
exports.getAllUsers = (req, res) => {
  try {
    connection.query(
      'SELECT id, name, email, role, profile_picture, created_at FROM users ORDER BY created_at DESC',
      (error, results) => {
        if (error) {
          console.error('Database error:', error);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch users' 
          });
        }

        res.json({
          success: true,
          data: results,
          message: 'Users fetched successfully'
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    const profilePicture = req.file ? `/uploads/profiles/${req.file.filename}` : null;

    if (!name || !email || !role) {
      if (req.file) {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and role are required' 
      });
    }

    // If updating profile picture, we need to get the old one first to delete it
    if (profilePicture) {
      connection.query(
        'SELECT profile_picture FROM users WHERE id = ?',
        [id],
        (selectError, selectResults) => {
          if (selectError) {
            if (req.file) {
              const fs = require('fs');
              fs.unlinkSync(req.file.path);
            }
            console.error('Select error:', selectError);
            return res.status(500).json({ 
              success: false, 
              message: 'Failed to update user' 
            });
          }

          const oldPicture = selectResults[0]?.profile_picture;

          connection.query(
            'UPDATE users SET name = ?, email = ?, role = ?, profile_picture = ? WHERE id = ?',
            [name, email, role, profilePicture, id],
            (updateError) => {
              if (updateError) {
                if (req.file) {
                  const fs = require('fs');
                  fs.unlinkSync(req.file.path);
                }
                console.error('Update error:', updateError);
                return res.status(500).json({ 
                  success: false, 
                  message: 'Failed to update user' 
                });
              }

              // Delete old profile picture if it exists
              if (oldPicture) {
                const path = require('path');
                const fs = require('fs');
                const oldPicturePath = path.join(__dirname, '../uploads/profiles/', path.basename(oldPicture));
                if (fs.existsSync(oldPicturePath)) {
                  fs.unlinkSync(oldPicturePath);
                }
              }

              res.json({
                success: true,
                message: 'User updated successfully',
                data: {
                  id,
                  profile_picture: profilePicture
                }
              });
            }
          );
        }
      );
    } else {
      // No new profile picture, just update other fields
      connection.query(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, id],
        (updateError) => {
          if (updateError) {
            console.error('Update error:', updateError);
            return res.status(500).json({ 
              success: false, 
              message: 'Failed to update user' 
            });
          }

          res.json({
            success: true,
            message: 'User updated successfully'
          });
        }
      );
    }
  } catch (error) {
    if (req.file) {
      const fs = require('fs');
      fs.unlinkSync(req.file.path);
    }
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Delete user (admin only)
exports.deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    connection.query(
      'DELETE FROM users WHERE id = ?',
      [id],
      (deleteError) => {
        if (deleteError) {
          console.error('Delete error:', deleteError);
          return res.status(500).json({ 
            success: false, 
            message: 'Failed to delete user' 
          });
        }

        res.json({
          success: true,
          message: 'User deleted successfully'
        });
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Request access (public)
exports.requestAccess = (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Ensure access_requests table exists then insert
    const createTableSql = `CREATE TABLE IF NOT EXISTS access_requests (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT NOW()
    )`;

    connection.query(createTableSql, (ctErr) => {
      if (ctErr) {
        console.error('Failed to ensure access_requests table:', ctErr);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      connection.query(
        'INSERT INTO access_requests (name, email, message, created_at) VALUES (?, ?, ?, NOW())',
        [name, email, message || null],
        (insertErr, insertResults) => {
          if (insertErr) {
            console.error('Insert access request error:', insertErr);
            return res.status(500).json({ success: false, message: 'Failed to submit request' });
          }

          res.json({ success: true, message: 'Request submitted successfully' });
        }
      );
    });
  } catch (error) {
    console.error('requestAccess error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};