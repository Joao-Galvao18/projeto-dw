const { getDatabase } = require('../database');
const { ObjectId } = require('mongodb');

//GET LINKS FOR USER
async function getLinks(userEmail) {
    const databaseConnection = getDatabase();
    const linksCollection = databaseConnection.collection('links');
    return await linksCollection.find({ userEmail: userEmail }).sort({ createdAt: -1 }).toArray();
}

//CREATE NEW LINK
async function createLink(linkData) {
    const databaseConnection = getDatabase();
    const linksCollection = databaseConnection.collection('links');

    //VALIDATE REQUIRED FIELDS
    if (!linkData.title || !linkData.url) {
        throw new Error('Title and URL are required.');
    }

    const newLink = {
        userEmail: linkData.userEmail,
        title: linkData.title,
        url: linkData.url,
        category: linkData.category || 'Other',
        createdAt: new Date()
    };

    const result = await linksCollection.insertOne(newLink);
    
    return { success: true, link: { ...newLink, _id: result.insertedId } };
}

//DELETE LINK
async function deleteLink(linkId) {
    const databaseConnection = getDatabase();
    const linksCollection = databaseConnection.collection('links');

    //CHECK FOR VALID ID
    if (!ObjectId.isValid(linkId)) {
        return { success: false, message: 'Invalid Link ID' };
    }

    //DELETE THE LINK
    await linksCollection.deleteOne({ _id: new ObjectId(linkId) });
    return { success: true };
}

//EXPORTING THE FUNCTIONS
module.exports = { getLinks, createLink, deleteLink };