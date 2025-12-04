function LoginScreen(props) {
    const { 
        email, setEmail, 
        password, setPassword, 
        handleLogin, 
        switchToRegister, 
        statusMessage 
    } = props;

    return (
        <div className="login-wrapper">
            <div className="auth-card">
                <div className="logo-center"><i className="ph-fill ph-notebook"></i></div>
                <h2>Welcome back</h2>
                <p>Sign in to access your personal workspace</p>
                
                <div className="input-group">
                    <label>Email</label>
                    <input 
                        className="input-field" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>

                <button className="btn-primary" onClick={handleLogin}>Sign in</button>
                
                <div className="link-text" onClick={switchToRegister}>
                    Don't have an account? Sign up
                </div>
                
                {statusMessage && <div className="error-msg">{statusMessage}</div>}
            </div>
        </div>
    );
}