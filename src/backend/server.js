const http = require('http');
const fileSystem = require('fs');
const path = require('path');

const { connectToDatabase } = require('./database');
const { registerUser, loginUser } = require('./controllers');

const SERVER_PORT = 8000;
const FRONTEND_DIRECTORY_PATH = path.join(__dirname, '../frontend');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
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
        server.listen(SERVER_PORT, () => {
            console.log(`Online at http://localhost:${SERVER_PORT}`);
        });
    } catch (error) {
        console.error('Critical Error:', error);
    }
}

startServer();