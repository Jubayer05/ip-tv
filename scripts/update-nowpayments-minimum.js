/**
 * Update NOWPayments Minimum Amount
 * 
 * This script updates the minimum amount for NOWPayments from $10 to $1
 * Run this to fix the minimum deposit requirement
 * 
 * Usage:
 * node scripts/update-nowpayments-minimum.js
 */

import mongoose from 'mongoose';
import PaymentSettings from '../src/models/PaymentSettings.js';

async function updateNOWPaymentsMinimum() {
  try {
    // Connect to database
    const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in environment variables');
      process.exit(1);
    }

    console.log('🔌 Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database');

    // Find NOWPayments settings
    const nowPaymentSettings = await PaymentSettings.findOne({ gateway: 'nowpayment' });

    if (!nowPaymentSettings) {
      console.log('❌ NOWPayments settings not found in database');
      console.log('ℹ️  Please create NOWPayments payment settings in admin panel first');
      process.exit(1);
    }

    console.log('\n📋 Current NOWPayments Settings:');
    console.log('   Gateway:', nowPaymentSettings.gateway);
    console.log('   Name:', nowPaymentSettings.name);
    console.log('   Current Minimum:', `$${nowPaymentSettings.minAmount}`);
    console.log('   Is Active:', nowPaymentSettings.isActive);

    // Update minimum amount
    const oldMinimum = nowPaymentSettings.minAmount;
    nowPaymentSettings.minAmount = 1.00;

    await nowPaymentSettings.save();

    console.log('\n✅ Successfully updated NOWPayments minimum amount');
    console.log(`   Changed from: $${oldMinimum} → $${nowPaymentSettings.minAmount}`);
    console.log('\n💡 Users can now deposit as low as $1 USD');
    console.log('   (Actual minimum varies by cryptocurrency - typically $1-$2)');

    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    
  } catch (error) {
    console.error('\n❌ Error updating NOWPayments settings:', error);
    process.exit(1);
  }
}

// Run the update
updateNOWPaymentsMinimum();
