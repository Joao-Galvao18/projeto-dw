const { getDatabase } = require('../database');

async function updateUserTheme(userEmail, newTheme) {
    const database = getDatabase();
    const usersCollection = database.collection('users');

    await usersCollection.updateOne(
        { email: userEmail },
        { $set: { theme: newTheme } }
    );

    return { success: true, theme: newTheme };
}

module.exports = { updateUserTheme };