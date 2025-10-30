import { MongoClient } from 'mongodb';

const uri = process.env.PROD_MONGODB_URI || '';
if (!uri) {
  throw new Error('PROD_MONGODB_URI environment variable is required');
}
const dbName = 'sendpulse';

// Cache the client across invocations (serverless best practice)
let clientPromise = globalThis._mongoClientPromise;
if (!clientPromise) {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000
  });
  clientPromise = client.connect();
  globalThis._mongoClientPromise = clientPromise;
}

async function getDb() {
  const client = await clientPromise;
  return client.db(dbName);
}

async function ensureIndexes() {
  const db = await getDb();
  const col = db.collection('user_bank_accounts');
   await col.createIndex(
    { phone: 1, created_at: 1 },
    { unique: true }
  );
  // await col.createIndex({ phone: 1 }, { unique: true });
}

export async function upsertBankAccount(phone, bankAccountId) {
  if (!phone || !bankAccountId) {
    throw new Error('phone and bank_account_id are required');
  }
  const db = await getDb();
  const col = db.collection('user_bank_accounts');
  await ensureIndexes();

  await col.updateOne(
    { phone },
    {
      $set: {
        bank_account_id: bankAccountId,
        updated_at: new Date()
      },
      $setOnInsert: {
        created_at: new Date()
      }
    },
    { upsert: true }
  );
}

export async function getBankAccountByPhone(phone) {
  if (!phone) {
    throw new Error('phone is required');
  }
  const db = await getDb();
  const col = db.collection('user_bank_accounts');
  
  // Calculate cutoff time (5 mins ago)
  const cutoff = new Date(Date.now() -   5 * 60 * 1000);

   const docs = await col.find({
    phone: phoneNumber,
    created_at: { $gt: cutoff }
  }).toArray();
  return doc?.bank_account_id ?? null;

}


