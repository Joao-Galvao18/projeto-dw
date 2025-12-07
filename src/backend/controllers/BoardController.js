const { getDatabase } = require('../database');
const { ObjectId } = require('mongodb');

//GET BOARDS FOR USER
async function getBoards(targetUserEmail) {
    const databaseConnection = getDatabase();
    const boardsCollection = databaseConnection.collection('boards');
    
    const foundBoards = await boardsCollection.find({ userEmail: targetUserEmail }).toArray();
    
    //IF NO BOARDS EXIST, CREATE DEFAULT
    if (foundBoards.length === 0) {
        const defaultBoardRecord = { 
            userEmail: targetUserEmail, 
            name: 'My Board', 
            createdAt: new Date() 
        };
        const result = await boardsCollection.insertOne(defaultBoardRecord);
        return [{ ...defaultBoardRecord, _id: result.insertedId }];
    }
    
    return foundBoards;
}

//CREATE NEW BOARD
async function createBoard(incomingBoardData) {
    const databaseConnection = getDatabase();
    const boardsCollection = databaseConnection.collection('boards');

    const newBoardRecord = {
        userEmail: incomingBoardData.userEmail,
        name: incomingBoardData.name,
        createdAt: new Date()
    };

    const result = await boardsCollection.insertOne(newBoardRecord);
    return { success: true, board: { ...newBoardRecord, _id: result.insertedId } };
}

//DELETE BOARD AND RELATED NOTES
async function deleteBoard(boardIdToDelete) {
    const databaseConnection = getDatabase();
    const boardsCollection = databaseConnection.collection('boards');
    const notesCollection = databaseConnection.collection('notes');

    if (!ObjectId.isValid(boardIdToDelete)) {
        return { success: false, message: 'Invalid Board ID.' };
    }
    
    //DELETE THE BOARD
    await boardsCollection.deleteOne({ _id: new ObjectId(boardIdToDelete) });
    
    //DELETE ALL NOTES LINKED TO THIS BOARD (CLEANUP)
    await notesCollection.deleteMany({ boardId: boardIdToDelete });
    
    return { success: true };
}

//GET NOTES FOR SPECIFIC BOARD
async function getNotes(targetBoardId) {
    const databaseConnection = getDatabase();
    const notesCollection = databaseConnection.collection('notes');
    
    return await notesCollection.find({ boardId: targetBoardId }).toArray();
}

//CREATE NEW NOTE
async function createNote(incomingNoteData) {
    const databaseConnection = getDatabase();
    const notesCollection = databaseConnection.collection('notes');

    const newNoteRecord = {
        boardId: incomingNoteData.boardId,
        type: incomingNoteData.type || 'text',
        content: incomingNoteData.content || '', 
        color: incomingNoteData.color || '#FEF3C7',
        width: incomingNoteData.width,
        height: incomingNoteData.height,
        x: incomingNoteData.x || 100, 
        y: incomingNoteData.y || 100, 
        zIndex: 1,
        createdAt: new Date()
    };

    const result = await notesCollection.insertOne(newNoteRecord);
    return { success: true, note: { ...newNoteRecord, _id: result.insertedId } };
}

//UPDATE NOTE PROPERTIES
async function updateNote(noteIdToUpdate, incomingUpdateData) {
    const databaseConnection = getDatabase();
    const notesCollection = databaseConnection.collection('notes');

    if (!ObjectId.isValid(noteIdToUpdate)) {
        return { success: false, message: 'Invalid Note ID.' };
    }

    //PREVENT OVERWRITING OF _id
    const { _id, ...safeUpdateData } = incomingUpdateData;

    await notesCollection.updateOne(
        { _id: new ObjectId(noteIdToUpdate) }, 
        { $set: safeUpdateData }
    );
    return { success: true };
}

//DELETE NOTE
async function deleteNote(noteIdToDelete) {
    const databaseConnection = getDatabase();
    const notesCollection = databaseConnection.collection('notes');

    if (!ObjectId.isValid(noteIdToDelete)) {
        return { success: false, message: 'Invalid Note ID.' };
    }

    await notesCollection.deleteOne({ _id: new ObjectId(noteIdToDelete) });
    return { success: true };
}

//EXPORTING THE FUNCTIONS TO BE USED IN SERVER.JS
module.exports = { 
    getBoards, 
    createBoard, 
    deleteBoard, 
    getNotes, 
    createNote, 
    updateNote, 
    deleteNote 
};