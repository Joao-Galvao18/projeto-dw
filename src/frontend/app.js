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
                <div className="login-wrapper">
                    <div className="auth-card">
                        <div className="logo-center"><i className="ph-fill ph-notebook"></i></div>
                        <h2>Welcome back</h2>
                        <p>Sign in to access your personal workspace</p>
                        
                        <div className="input-group">
                            <label>Email</label>
                            <input className="input-field" type="email" placeholder="Enter your email" 
                                value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input className="input-field" type="password" placeholder="Enter your password" 
                                value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="btn-primary" onClick={handleLogin}>Sign in</button>
                        <div className="link-text" onClick={() => setCurrentScreen('register')}>
                            Don't have an account? Sign up
                        </div>
                        {statusMessage && <div className="error-msg">{statusMessage}</div>}
                    </div>
                </div>
            );
        }

        if (currentScreen === 'register') {
            return (
                <div className="login-wrapper">
                    <div className="auth-card">
                        <h2>Create Account</h2>
                        <p>Join Organizer today</p>
                        
                        <div className="input-group">
                            <label>Name</label>
                            <input className="input-field" type="text" placeholder="Your Name" 
                                value={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Email</label>
                            <input className="input-field" type="email" placeholder="Email" 
                                value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label>Password</label>
                            <input className="input-field" type="password" placeholder="Password" 
                                value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <button className="btn-primary" onClick={handleRegister}>Create Account</button>
                        <div className="link-text" onClick={() => setCurrentScreen('login')}>Back to Login</div>
                        {statusMessage && <div className="error-msg">{statusMessage}</div>}
                    </div>
                </div>
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