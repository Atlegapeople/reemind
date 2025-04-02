import { MongoClient } from 'mongodb';
import clientPromise from '../db';

export async function initializeDatabase() {
  let client: MongoClient | null = null;
  
  try {
    console.log("🚀 Starting database initialization...");
    
    client = await clientPromise;
    console.log("✅ Connected to MongoDB");
    
    // List all databases to verify connection
    const dbs = await client.db().admin().listDatabases();
    console.log("📚 Available databases:", dbs.databases.map(db => db.name));
    
    const db = client.db("reemind");
    console.log("📁 Accessing reemind database");
    
    // Explicitly create the database by creating a collection
    try {
      console.log("🆕 Creating reminders collection...");
      await db.createCollection("reminders", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "month", "day", "reminder"],
            properties: {
              name: {
                bsonType: "string",
                description: "Name of the person"
              },
              email: {
                bsonType: "string",
                description: "Email address"
              },
              month: {
                bsonType: "int",
                minimum: 1,
                maximum: 12,
                description: "Month of the reminder"
              },
              day: {
                bsonType: "int",
                minimum: 1,
                maximum: 31,
                description: "Day of the reminder"
              },
              reminder: {
                bsonType: "int",
                minimum: 1,
                description: "Days before to remind"
              },
              createdAt: {
                bsonType: "date",
                description: "Creation timestamp"
              }
            }
          }
        }
      });
      
      // Create indexes for better query performance
      await db.collection("reminders").createIndex({ email: 1 });
      await db.collection("reminders").createIndex({ month: 1, day: 1 });
      console.log("📊 Created indexes for reminders collection");
      
      // Insert a test document to verify write permissions
      const testResult = await db.collection("reminders").insertOne({
        name: "Test Reminder",
        email: "test@example.com",
        month: 12,
        day: 25,
        reminder: 7,
        createdAt: new Date()
      });
      console.log("✅ Test document inserted with ID:", testResult.insertedId);
      
      // Verify we can read the test document
      const testDoc = await db.collection("reminders").findOne({ _id: testResult.insertedId });
      console.log("✅ Test document retrieved:", testDoc);
      
      // Clean up test document
      await db.collection("reminders").deleteOne({ _id: testResult.insertedId });
      console.log("🧹 Test document cleaned up");
      
    } catch (err) {
      if ((err as any)?.code === 48) { // Collection already exists
        console.log("✓ Reminders collection already exists");
      } else {
        throw err;
      }
    }
    
    // Verify the collection exists
    const collections = await db.listCollections().toArray();
    console.log("📋 Collections in reemind database:", collections.map(col => col.name));
    
    console.log("✨ Database initialization complete!");
    return true;
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw error;
  }
} 