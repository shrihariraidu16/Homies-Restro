#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');

async function main() {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    // require compiled model
    const User = require('../dist/models/User').default || require('../dist/models/User');

    const users = await User.find({}, '-password').lean();
    if (!users || users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users:');
      console.log(JSON.stringify(users, null, 2));
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error fetching users:', err.message || err);
    process.exit(1);
  }
}

main();
