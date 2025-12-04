const { useState } = React;

function App() {

    const [currentScreen, setCurrentScreen] = useState('login'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userName, setUserName] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    async function handleLogin() {
        setStatusMessage('');
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (result.success) {
                setCurrentUser(result.user);
                setCurrentScreen('dashboard');
            } else { setStatusMessage(result.message); }
        } catch (error) { setStatusMessage('Server error'); }
    }

    async function handleRegister() {
        setStatusMessage('');
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: userName, email, password })
            });
            const result = await response.json();
            if (result.success) {
                setStatusMessage('Success! Please log in.');
                setCurrentScreen('login');
                setPassword('');
            } else { setStatusMessage(result.message); }
        } catch (error) { setStatusMessage('Server error'); }
    }

    function handleLogout() {
        setCurrentUser(null);
        setCurrentScreen('login');
        setEmail('');
        setPassword('');
    }

    function getPageTitle() {
        if (currentScreen === 'login') return 'Login';
        if (currentScreen === 'register') return 'Create Account';
        if (currentScreen === 'dashboard') return 'My Board';
        return 'Organizer';
    }

    function renderSidebar() {
        return (
            <div className="sidebar">
                <div className="brand-section">
                    <div className="brand-icon"><i className="ph-fill ph-notebook"></i></div>
                    <div className="brand-info">
                        <h3>Organizer</h3>
                        <p>{currentUser ? currentUser.name : 'Guest'}</p>
                    </div>
                </div>

                <div className="nav-menu">
                    <div className={`nav-item ${currentScreen === 'dashboard' ? 'active' : ''}`}
                         onClick={() => currentUser && setCurrentScreen('dashboard')}>
                        <i className="ph ph-squares-four"></i><span>Board</span>
                    </div>
                    <div className="nav-item"><i className="ph ph-check-square-offset"></i><span>To-Do</span></div>
                    <div className="nav-item"><i className="ph ph-link"></i><span>Links</span></div>
                    <div className="nav-spacer"></div>
                    <div className="nav-item"><i className="ph ph-gear"></i><span>Settings</span></div>

                    {currentUser ? (
                        <div className="nav-item nav-logout" onClick={handleLogout}>
                            <i className="ph ph-sign-out"></i><span>Log out</span>
                        </div>
                    ) : (
                        <div className="nav-item nav-logout" onClick={() => setCurrentScreen('login')}>
                            <i className="ph ph-sign-in"></i><span>Log in</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    function renderMainContent() {
        if (currentScreen === 'login') {
            return (
                <LoginScreen 
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    handleLogin={handleLogin}
                    switchToRegister={() => setCurrentScreen('register')}
                    statusMessage={statusMessage}
                />
            );
        }

        if (currentScreen === 'register') {
            return (
                <RegisterScreen 
                    userName={userName}
                    setUserName={setUserName}
                    email={email}
                    setEmail={setEmail}
                    password={password}
                    setPassword={setPassword}
                    handleRegister={handleRegister}
                    switchToLogin={() => setCurrentScreen('login')}
                    statusMessage={statusMessage}
                />
            );
        }

        if (currentScreen === 'dashboard') {
            return (
                <div className="dashboard-padding">
                    <h1>My Board</h1>
                    <p style={{color: '#666'}}>Welcome back, {currentUser.name}.</p>
                </div>
            );
        }
    }

    return (
        <div className="app-layout">
            {renderSidebar()}         
            <div className="content-area">            
                <div className="top-window-bar">
                    <span className="page-title">{getPageTitle()}</span>
                </div>

                <div className="page-content">
                    {renderMainContent()}
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(<App />);