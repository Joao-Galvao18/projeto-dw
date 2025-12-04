function RegisterScreen(props) {
    const { 
        userName, setUserName,
        email, setEmail, 
        password, setPassword, 
        handleRegister, 
        switchToLogin, 
        statusMessage 
    } = props;

    return (
        <div className="login-wrapper">
            <div className="auth-card">
                <h2>Create Account</h2>
                <p>Join Organizer today</p>
                
                <div className="input-group">
                    <label>Name</label>
                    <input 
                        className="input-field" 
                        type="text" 
                        placeholder="Your Name" 
                        value={userName} 
                        onChange={(e) => setUserName(e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label>Email</label>
                    <input 
                        className="input-field" 
                        type="email" 
                        placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                    />
                </div>
                <div className="input-group">
                    <label>Password</label>
                    <input 
                        className="input-field" 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>

                <button className="btn-primary" onClick={handleRegister}>Create Account</button>
                
                <div className="link-text" onClick={switchToLogin}>
                    Back to Login
                </div>
                
                {statusMessage && <div className="error-msg">{statusMessage}</div>}
            </div>
        </div>
    );
}