const { app, BrowserWindow } = require('electron');

// Import the server configuration to start it automatically when the app launches
require('./src/backend/server.js'); 

function createMainWindow() {
    // Create the browser window
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "Organizer",
        webPreferences: {
            // nodeIntegration is disabled for security (best practice)
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Load the local server URL instead of a file directly
    mainWindow.loadURL('http://localhost:8000');
}

// Wait until Electron is ready before creating the window
app.whenReady().then(createMainWindow);

// Quit the application when all windows are closed (standard behavior on Windows/Linux)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});