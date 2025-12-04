const { MongoClient } = require('mongodb');
const MONGODB_CONNECTION_URL = 'mongodb://localhost:27017';
const DATABASE_NAME = 'organizer-db';
let databaseInstance = null;

async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_CONNECTION_URL);
        await client.connect();
        console.log('Successfully connected to MongoDB');
        databaseInstance = client.db(DATABASE_NAME);
        return databaseInstance;

    } catch (error) {

        console.error('Failed to connect to MongoDB:', error);
        throw error;
    }
}

function getDatabase() {
    if (!databaseInstance) {
        throw new Error('Call connectToDatabase() before requesting the database instance.');
    }
    return databaseInstance;
}

//EXPORTING THE FUNCTIONS TO BE USED IN SERVER.JS E CONTROLLER.JS
module.exports = { connectToDatabase, getDatabase };