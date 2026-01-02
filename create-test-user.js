require('dotenv').config();
const bcrypt = require('bcryptjs');
const connection = require('./models/db');

const testUser = {
  name: 'Admin User',
  email: 'admin@newtimeafrica.com',
  password: 'Admin123!'
};

async function createTestUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(testUser.password, 10);
    
    // Insert user
    connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [testUser.name, testUser.email, hashedPassword, 'admin'],
      (error, results) => {
        if (error) {
          if (error.code === 'ER_DUP_ENTRY') {
            console.log('✅ Test user already exists');
            console.log(`Email: ${testUser.email}`);
            console.log(`Password: ${testUser.password}`);
          } else {
            console.error('❌ Error creating user:', error.message);
          }
        } else {
          console.log('✅ Test user created successfully!');
          console.log(`Email: ${testUser.email}`);
          console.log(`Password: ${testUser.password}`);
        }
        process.exit(0);
      }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();
