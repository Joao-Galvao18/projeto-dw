function SettingsScreen({ currentUser, currentTheme, onThemeChange }) {
    
    const handleToggle = async (e) => {
    const newTheme = e.target.checked ? 'dark' : 'light';
        
//UPDATE FRONTEND IMEDIATLY TO MAKE IT FASTER
        onThemeChange(newTheme);

//SAVES IN BACKEND
        try {
            await fetch('/api/settings/theme', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userEmail: currentUser.email, 
                    theme: newTheme 
                })
            });
        } catch (error) {
            console.error("Failed to save theme preference", error);
        }
    };

    return (
        <div className="dashboard-padding">
            <h1 style={{marginBottom: '30px'}}>Settings</h1>

            <div className="settings-card">
                <div className="setting-item">
                    <div className="setting-info">
                        <h3>Dark Mode</h3>
                        <p>Turn on Dark Mode</p>
                    </div>
                    
                    <label className="theme-switch">
                        <input 
                            type="checkbox" 
                            checked={currentTheme === 'dark'}
                            onChange={handleToggle}
                        />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>
        </div>
    );
}