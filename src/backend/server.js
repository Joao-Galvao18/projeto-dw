const http = require('http');
const fileSystem = require('fs');
const path = require('path');

const { connectToDatabase } = require('./database');

const { registerUser, loginUser } = require('./controllers/LoginRegisterController');
const { getLinks, createLink, deleteLink } = require('./controllers/LinkController.js');

const { 
    getBoards, 
    createBoard, 
    deleteBoard, 
    getNotes, 
    createNote, 
    updateNote, 
    deleteNote 
} = require('./controllers/BoardController');

const { getTasks, createTask, toggleTask, reorderTasks, deleteTask } = require('./controllers/ToDoController');
const { updateUserTheme } = require('./controllers/SettingsController');

const SERVER_PORT = 3001;
const FRONTEND_DIRECTORY_PATH = path.join(__dirname, '../frontend');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png', 
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

//FUNCTION THAT READS DATA SENT BY THE FRONTEND
function getRequestData(incomingRequest) {
    return new Promise((resolve, reject) => {
        let bodyData = '';
        
        incomingRequest.on('data', (chunk) => {
            bodyData += chunk.toString();
        });

        incomingRequest.on('end', () => {
            try {
                //CONVERTS STRING INTO A JS OBJECT
                const parsedData = bodyData ? JSON.parse(bodyData) : {};
                resolve(parsedData);
            } catch (error) {
                resolve({});
            }
        });
        
        incomingRequest.on('error', (error) => reject(error));
    });
}

const server = http.createServer(async (incomingRequest, serverResponse) => {
//HANDLES API REQUESTS
    if (incomingRequest.url.startsWith('/api')) {
        serverResponse.setHeader('Content-Type', 'application/json');

//REGISTER A NEW USER
        if (incomingRequest.url === '/api/register' && incomingRequest.method === 'POST') {
            const userData = await getRequestData(incomingRequest);
            const result = await registerUser(userData);
            
            serverResponse.writeHead(result.success ? 201 : 400);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//LOGIN A USER
        if (incomingRequest.url === '/api/login' && incomingRequest.method === 'POST') {
            const loginData = await getRequestData(incomingRequest);
            const result = await loginUser(loginData);
            
            serverResponse.writeHead(result.success ? 200 : 401);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//GET BOARDS
        if (incomingRequest.url === '/api/boards' && incomingRequest.method === 'GET') {
            const userEmail = incomingRequest.headers['user-email'];
            const result = await getBoards(userEmail);
            
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//CREATE BOARD
        if (incomingRequest.url === '/api/boards' && incomingRequest.method === 'POST') {
            const boardData = await getRequestData(incomingRequest);
            const result = await createBoard(boardData);
            
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//DELETE BOARD
        if (incomingRequest.url.startsWith('/api/boards/') && incomingRequest.method === 'DELETE') {
            const boardIdToDelete = incomingRequest.url.split('/').pop();
            const result = await deleteBoard(boardIdToDelete);
            
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//GET NOTES
        if (incomingRequest.url.startsWith('/api/notes') && incomingRequest.method === 'GET') {
            const boardId = incomingRequest.headers['board-id'];
            
            if (!boardId) {
                serverResponse.writeHead(400);
                serverResponse.end(JSON.stringify({ error: 'Missing board-id header' }));
                return;
            }

            const result = await getNotes(boardId);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//CREATE NOTE
        if (incomingRequest.url === '/api/notes' && incomingRequest.method === 'POST') {
            const noteData = await getRequestData(incomingRequest);
            const result = await createNote(noteData);
            
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//UPDATE NOTE
        if (incomingRequest.url.startsWith('/api/notes/') && incomingRequest.method === 'PUT') {
            const noteIdToUpdate = incomingRequest.url.split('/').pop();
            const updateData = await getRequestData(incomingRequest);
            const result = await updateNote(noteIdToUpdate, updateData);
            
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//DELETE NOTE
        if (incomingRequest.url.startsWith('/api/notes/') && incomingRequest.method === 'DELETE') {
            const noteIdToDelete = incomingRequest.url.split('/').pop();
            const result = await deleteNote(noteIdToDelete);
            
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//GET LINKS
        if (incomingRequest.url === '/api/links' && incomingRequest.method === 'GET') {
            const userEmail = incomingRequest.headers['user-email'];
            const result = await getLinks(userEmail);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//CREATE LINK
        if (incomingRequest.url === '/api/links' && incomingRequest.method === 'POST') {
            const linkData = await getRequestData(incomingRequest);
            const result = await createLink(linkData);
            serverResponse.writeHead(result.success ? 201 : 400);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//DELETE LINK
        if (incomingRequest.url.startsWith('/api/links/') && incomingRequest.method === 'DELETE') {
            const linkId = incomingRequest.url.split('/').pop();
            const result = await deleteLink(linkId);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }
        
//GET TASKS
        if (incomingRequest.url === '/api/todos' && incomingRequest.method === 'GET') {
            const userEmail = incomingRequest.headers['user-email'];
            const result = await getTasks(userEmail);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//CREATE TASK
        if (incomingRequest.url === '/api/todos' && incomingRequest.method === 'POST') {
            const taskData = await getRequestData(incomingRequest);
            const result = await createTask(taskData);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//TOGGLE TASK
        if (incomingRequest.url.startsWith('/api/todos/') && incomingRequest.method === 'PUT') {
            const taskId = incomingRequest.url.split('/').pop();
            const updateData = await getRequestData(incomingRequest);
            const result = await toggleTask(taskId, updateData.isCompleted);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//REORDER TASKS
        if (incomingRequest.url === '/api/todos/reorder' && incomingRequest.method === 'PUT') {
            const { taskIds } = await getRequestData(incomingRequest);
            const result = await reorderTasks(taskIds);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }

//DELETE TASK
        if (incomingRequest.url.startsWith('/api/todos/') && incomingRequest.method === 'DELETE') {
            const taskId = incomingRequest.url.split('/').pop();
            const result = await deleteTask(taskId);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }
        
//SETTINGS ROUTES
        if (incomingRequest.url === '/api/settings/theme' && incomingRequest.method === 'PUT') {
            const { userEmail, theme } = await getRequestData(incomingRequest);
            const result = await updateUserTheme(userEmail, theme);
            serverResponse.writeHead(200);
            serverResponse.end(JSON.stringify(result));
            return;
        }
        
        return;
    }

//HANDLES HTML, CSS, JS FILES
    let requestedFilePath = incomingRequest.url === '/' ? 'index.html' : incomingRequest.url;
    if (requestedFilePath.startsWith('/')) requestedFilePath = requestedFilePath.slice(1);
    
    const fullFilePath = path.join(FRONTEND_DIRECTORY_PATH, requestedFilePath);

    fileSystem.readFile(fullFilePath, (error, fileContent) => {
        if (error) {
            serverResponse.writeHead(404);
            serverResponse.end('File not found');
        } else {
            const extension = path.extname(fullFilePath);
            serverResponse.writeHead(200, { 'Content-Type': mimeTypes[extension] || 'text/plain' });
            serverResponse.end(fileContent);
        }
    });
});

//CONNECTS TO DATABASE AND STARTS SERVER
async function startServer() {
    try {
        await connectToDatabase();
        server.listen(SERVER_PORT, "0.0.0.0", () => {
            console.log(`Online at http://'0.0.0.0':${SERVER_PORT}`);
        });
    } catch (error) {
        console.error('Critical Error:', error);
    }
}

startServer();