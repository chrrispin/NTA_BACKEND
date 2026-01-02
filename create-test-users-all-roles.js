require('dotenv').config();
const bcrypt = require('bcryptjs');
const connection = require('./models/db');

const testUsers = [
  {
    name: 'Super Admin User',
    email: 'superadmin@newtimeafrica.com',
    password: 'SuperAdmin123!',
    role: 'super_admin'
  },
  {
    name: 'Admin User',
    email: 'admin@newtimeafrica.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    name: 'Editor User',
    email: 'editor@newtimeafrica.com',
    password: 'Editor123!',
    role: 'editor'
  },
  {
    name: 'Viewer User',
    email: 'viewer@newtimeafrica.com',
    password: 'Viewer123!',
    role: 'viewer'
  }
];

async function createTestUsers() {
  try {
    for (const user of testUsers) {
      // Hash password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Insert user
      connection.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [user.name, user.email, hashedPassword, user.role],
        (error, results) => {
          if (error) {
            if (error.code === 'ER_DUP_ENTRY') {
              console.log(`✅ ${user.role.toUpperCase()} test user already exists`);
              console.log(`   Email: ${user.email}`);
              console.log(`   Password: ${user.password}`);
            } else {
              console.error(`❌ Error creating ${user.role} user:`, error.message);
            }
          } else {
            console.log(`✅ ${user.role.toUpperCase()} test user created successfully!`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Password: ${user.password}`);
          }
        }
      );
    }

    // Give it time to process all queries before exiting
    setTimeout(() => {
      console.log('\n✅ All test users processed!');
      process.exit(0);
    }, 2000);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUsers();
