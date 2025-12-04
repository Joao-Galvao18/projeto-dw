const crypto = require('crypto');
const { getDatabase } = require('./database');

//PASSWORD ENCRIPTOR
function encryptPassword(passwordToEncrypt) {
    return crypto.createHash('sha256').update(passwordToEncrypt).digest('hex');
}

async function registerUser(incomingUserData) {

    const databaseConnection = getDatabase();
    const usersCollection = databaseConnection.collection('users');
    const existingUser = await usersCollection.findOne({ email: incomingUserData.email });
    
    if (existingUser) {
        return { success: false, message: 'Email is already registered.' };
    }

//NEW USER PREPARATIONS
    const newUserRecord = {
        name: incomingUserData.name,
        email: incomingUserData.email,
        password: encryptPassword(incomingUserData.password), 
        createdAt: new Date()
    };

//SAVES NEW USER
    await usersCollection.insertOne(newUserRecord);
    
    console.log(`New user registered: ${incomingUserData.email}`);
    return { success: true, message: 'User created successfully.' };
}

//LOGIN
async function loginUser(loginCredentials) {
    const databaseConnection = getDatabase();
    const usersCollection = databaseConnection.collection('users');
    const foundUser = await usersCollection.findOne({ email: loginCredentials.email });

    if (!foundUser) {
        return { success: false, message: 'User not found.' };
    }

    const inputPasswordHash = encryptPassword(loginCredentials.password);
    
    if (inputPasswordHash === foundUser.password) {
        const { password, ...userDataWithoutPassword } = foundUser;
        return { success: true, user: userDataWithoutPassword };
    } else {
        return { success: false, message: 'Incorrect password.' };
    }
}

//EXPORTING THE FUNCTIONS TO BE USED IN SERVER.JS
module.exports = { registerUser, loginUser };