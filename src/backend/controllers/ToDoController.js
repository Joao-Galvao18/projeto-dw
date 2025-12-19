const { getDatabase } = require('../database');
const { ObjectId } = require('mongodb');

// GET TASKS FOR USER
async function getTasks(targetUserEmail) {
    const databaseConnection = getDatabase();
    return await databaseConnection.collection('todos')
        .find({ userEmail: targetUserEmail })
        .sort({ order: 1 }) 
        .toArray();
}

// CREATE NEW TASK
async function createTask(incomingTaskData) {
    const databaseConnection = getDatabase();
    
    const count = await databaseConnection.collection('todos').countDocuments({ userEmail: incomingTaskData.userEmail });

    const newTaskRecord = {
        userEmail: incomingTaskData.userEmail,
        content: incomingTaskData.content,
        isCompleted: false,
        order: count,
        createdAt: new Date()
    };

    const result = await databaseConnection.collection('todos').insertOne(newTaskRecord);
    return { success: true, task: { ...newTaskRecord, _id: result.insertedId } };
}

// TOGGLE TASK STATUS
async function toggleTask(taskId, isCompleted) {
    const databaseConnection = getDatabase();
    
    if (!ObjectId.isValid(taskId)) return { success: false };

    await databaseConnection.collection('todos').updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { isCompleted: isCompleted } }
    );
    return { success: true };
}

async function reorderTasks(taskIds) {
    const databaseConnection = getDatabase();
    
    const updatePromises = taskIds.map((id, index) => {
        if (!ObjectId.isValid(id)) return Promise.resolve();
        return databaseConnection.collection('todos').updateOne(
            { _id: new ObjectId(id) },
            { $set: { order: index } }
        );
    });

    await Promise.all(updatePromises);
    return { success: true };
}

// DELETE TASK
async function deleteTask(taskId) {
    const databaseConnection = getDatabase();
    
    if (!ObjectId.isValid(taskId)) return { success: false };

    await databaseConnection.collection('todos').deleteOne({ _id: new ObjectId(taskId) });
    return { success: true };
}

module.exports = { getTasks, createTask, toggleTask, reorderTasks, deleteTask };