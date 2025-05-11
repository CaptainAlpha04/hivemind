import { MongoClient } from "mongodb";

// If this is a production environment, you may want more sophisticated connection handling
const uri = process.env.MONGODB_URI!;
const options = {};

// Global variable to maintain connection across hot reloads in development
const globalWithMongo = global as typeof global & {
  _mongoClientPromise?: Promise<MongoClient>;
};

let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve connection across reloads
  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production, create a new client for each instance
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;