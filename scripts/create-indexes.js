// MongoDB Index Creation Script
// Run with: node scripts/create-indexes.js

const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI or MONGO_URI environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Settings collection indexes
    console.log('\nCreating indexes for Settings collection...');
    await db.collection('settings').createIndex({ 'banners.home': 1 });
    await db.collection('settings').createIndex({ 'addons': 1 });
    await db.collection('settings').createIndex({ 'logos': 1 });
    console.log('✓ Settings indexes created');

    // Users collection indexes (if exists)
    console.log('\nCreating indexes for Users collection...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ status: 1 });
    console.log('✓ Users indexes created');

    // Orders collection indexes (if exists)
    console.log('\nCreating indexes for Orders collection...');
    await db.collection('orders').createIndex({ userId: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ userId: 1, createdAt: -1 });
    console.log('✓ Orders indexes created');

    // Channels collection indexes (if exists)
    console.log('\nCreating indexes for Channels collection...');
    await db.collection('channels').createIndex({ name: 1 });
    await db.collection('channels').createIndex({ category: 1 });
    await db.collection('channels').createIndex({ status: 1 });
    console.log('✓ Channels indexes created');

    // Print all indexes
    console.log('\n=== All Indexes ===');
    const collections = ['settings', 'users', 'orders', 'channels'];

    for (const collectionName of collections) {
      try {
        const indexes = await db.collection(collectionName).indexes();
        console.log(`\n${collectionName}:`);
        indexes.forEach(index => {
          console.log(`  - ${JSON.stringify(index.key)}`);
        });
      } catch (error) {
        console.log(`  Collection '${collectionName}' not found or has no indexes`);
      }
    }

    console.log('\n✅ All indexes created successfully!');

  } catch (error) {
    console.error('❌ Error creating indexes:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    process.exit(0);
  }
};

createIndexes();
