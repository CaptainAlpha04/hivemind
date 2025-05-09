import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

// Neo4j connection settings
const URI = process.env.NEO4J_URI || 'neo4j://localhost:7687';
const USER = process.env.NEO4J_USER || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD || 'password';

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD), {
  maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
  maxConnectionPoolSize: 50,
  connectionAcquisitionTimeout: 2 * 60 * 1000, // 120 seconds
});

// Verify connectivity
const verifyConnectivity = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('✅ Connected to Neo4j database');
  } catch (error) {
    console.error('❌ Could not connect to Neo4j database:', error);
  }
};

export { driver, verifyConnectivity };