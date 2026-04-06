const mongoose = require('mongoose');
require('dotenv').config();

const Business = require('./src/models/Business');
const Booking = require('./src/models/Booking');

async function cleanupTestData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // Remove all test businesses
    const testEmails = [
      'test@apitesting.com',
      'testchat@example.com', 
      'debug@example.com',
      'simple@test.com'
    ];
    
    const result = await Business.deleteMany({ 
      email: { $in: testEmails }
    });
    console.log(`Deleted ${result.deletedCount} test business(es)`);
    
    console.log('✅ Test data cleanup completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanupTestData();