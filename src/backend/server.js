const http = require('http');
const fileSystem = require('fs');
const path = require('path');

const SERVER_PORT = 8000;
// Define the absolute path to the frontend directory
const FRONTEND_DIRECTORY_PATH = path.join(__dirname, '../frontend');

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
};

const server = http.createServer((incomingRequest, serverResponse) => {
    console.log(`[Server] Received request for: ${incomingRequest.url}`);

    // 1. API Route Handling (Backend Logic)
    // We check if the URL starts with /api to separate data requests from file requests
    if (incomingRequest.url.startsWith('/api')) {
        serverResponse.writeHead(200, { 'Content-Type': 'application/json' });
        serverResponse.end(JSON.stringify({ message: "Hello from the Native Node.js Server!" }));
        return;
    }

    // 2. Static File Serving (Frontend)
    // Default to index.html if the root is requested
    let requestedFilePath = incomingRequest.url === '/' ? 'index.html' : incomingRequest.url;
    
    // Remove the leading slash to ensure path.join works correctly relative to the current folder
    if (requestedFilePath.startsWith('/')) {
        requestedFilePath = requestedFilePath.slice(1);
    }
    
    // Construct the full absolute path to the file on the computer
    const fullFilePath = path.join(FRONTEND_DIRECTORY_PATH, requestedFilePath);

    // Read the file from the disk
    fileSystem.readFile(fullFilePath, (error, fileContent) => {
        if (error) {
            // File not found or error reading file
            console.error(`[Server] Error serving file: ${fullFilePath}`, error);
            serverResponse.writeHead(404, { 'Content-Type': 'text/plain' });
            serverResponse.end('File not found');
        } else {
            // File found, send it to the browser with the correct Content-Type
            const fileExtension = path.extname(fullFilePath);
            const contentType = mimeTypes[fileExtension] || 'text/plain';
            
            serverResponse.writeHead(200, { 'Content-Type': contentType });
            serverResponse.end(fileContent);
        }
    });
});

server.listen(SERVER_PORT, () => {
    console.log(`[Server] Running and listening on http://localhost:${SERVER_PORT}`);
});