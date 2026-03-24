const { MongoClient } = require('mongodb');

const url = 'mongodb://backend_spontime_dev:gUuJtjQKPKNpwlF[PCDctQVD@tst-ka-ara-mon-ela-2.maslocal.net:27017/backend_spontime_dev?authSource=backend_spontime_dev';
const client = new MongoClient(url, { 
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 5000 
});

async function testConnection() {
  try {
    console.log('⏳ Testing connection to MongoDB...');
    console.log(`Host: tst-ka-ara-mon-ela-2.maslocal.net:27017`);
    
    await client.connect();
    console.log('✅ SUCCESS: Connected to MongoDB!');
    
    // Test authentication
    const db = client.db('backend_spontime_dev');
    await db.command({ ping: 1 });
    console.log('✅ SUCCESS: Authentication successful');
    
    await client.close();
  } catch (error) {
    console.error('❌ FAILED:', error.message);
    
    if (error.message.includes('getaddrinfo')) {
      console.log('🔍 Issue: Cannot resolve hostname - DNS problem');
    } else if (error.message.includes('timed out')) {
      console.log('🔍 Issue: Connection timeout - likely need VPN or network access');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('🔍 Issue: Connection refused - MongoDB not running or firewall blocking');
    } else if (error.message.includes('Authentication failed')) {
      console.log('🔍 Issue: Invalid username or password');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🔍 Issue: Hostname not found - check if you\'re on VPN');
    }
  }
}

testConnection();