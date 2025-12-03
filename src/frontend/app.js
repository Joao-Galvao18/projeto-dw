// Destructure hooks from the global React object
const { useState, useEffect } = React;

function Application() {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1 style={{ color: '#333' }}>Organizer</h1>
            <p style={{ color: '#666' }}>
                System Status: <strong>Online</strong>
            </p>
            
            <div style={{ 
                marginTop: '30px', 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '10px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <h3>Project Initialization</h3>
                <p>React is running successfully with Babel (JIT).</p>
                <p>Backend is reachable at port 8000.</p>
            </div>
        </div>
    );
}

// Find the root element in index.html and mount the React application
const rootElement = document.getElementById('react-root');
const reactRoot = ReactDOM.createRoot(rootElement);

reactRoot.render(<Application />);