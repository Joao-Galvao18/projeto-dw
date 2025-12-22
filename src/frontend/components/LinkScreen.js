const { useState, useEffect } = React;

function LinkScreen({ currentUser }) {
    //STATE MANAGEMENT
    const [links, setLinks] = useState([]);
    const [filterCategory, setFilterCategory] = useState('All'); 

    //MODAL VISIBILITY STATES
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [linkToDelete, setLinkToDelete] = useState(null);

    //FORM INPUT STATES
    const [newTitle, setNewTitle] = useState('');
    const [newUrl, setNewUrl] = useState('');
    const [newCategory, setNewCategory] = useState('Website'); 

    //FETCH LINKS FOR USER ON LOAD
    useEffect(() => {
        if (!currentUser) return;
        fetch('/api/links', { headers: { 'user-email': currentUser.email } })
            .then(res => res.json())
            .then(data => setLinks(data))
            .catch(err => console.error("Error loading links:", err));
    }, [currentUser]);

    //HANDLE ADD NEW LINK
    const handleAddLink = async () => {
        //VALIDATE INPUTS
        if (!newTitle || !newUrl) {
            alert("Please fill in both Title and URL.");
            return;
        }

        try {
            //SEND POST REQUEST
            const response = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userEmail: currentUser.email, 
                    title: newTitle, 
                    url: newUrl,
                    category: newCategory 
                })
            });

            const result = await response.json();
            
            //UPDATE STATE AND CLOSE MODAL ON SUCCESS
            if (result.success) {
                setLinks([result.link, ...links]);
                closeAddModal();
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            alert("Server Error. Check terminal.");
        }
    };

    //TRIGGER DELETE CONFIRMATION
    const requestDelete = (id) => {
        setLinkToDelete(id);
        setIsDeleteModalOpen(true);
    };

    //EXECUTE DELETION
    const confirmDelete = async () => {
        if (!linkToDelete) return;

        try {
            //SEND DELETE REQUEST
            await fetch(`/api/links/${linkToDelete}`, { method: 'DELETE' });
            
            //UPDATE LOCAL STATE
            setLinks(links.filter(link => link._id !== linkToDelete));
            setIsDeleteModalOpen(false);
            setLinkToDelete(null);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    //RESET FORM AND CLOSE MODAL
    const closeAddModal = () => {
        setIsAddModalOpen(false);
        setNewTitle('');
        setNewUrl('');
        setNewCategory('Website');
    };

    //HELPER: GET ICON BASED ON CATEGORY
    const getIconForCategory = (category) => {
        switch(category) {
            case 'Video': return 'ph-video';
            case 'Website': return 'ph-globe';
            case 'Document': return 'ph-file-text';
            case 'Other': return 'ph-link';
            default: return 'ph-link';
        }
    };

    //FILTER LINKS LOGIC
    const filteredLinks = filterCategory === 'All' 
        ? links 
        : links.filter(link => link.category === filterCategory);

    const categories = ['All', 'Website', 'Video', 'Document', 'Other'];

    return (
        <div className="dashboard-padding">
            
            {/* PAGE HEADER */}
            <h1 style={{marginBottom: '20px'}}>Important Links</h1>

            {/* CONTROLS SECTION */}
            <div style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '30px',
                gap: '20px'
            }}>

            {/* CATEGORY FILTERS */}
            <div className="filter-section" style={{marginBottom: 0, paddingBottom: 0}}>
                {categories.map(cat => (
                    <button 
                        key={cat}
                        className={`filter-pill ${filterCategory === cat ? 'active' : ''}`}
                        onClick={() => setFilterCategory(cat)}
                    >
                    {cat}
                    </button>
                    ))}
            </div>

                {/* ADD BUTTON */}
                <button 
                    className="btn-primary" 
                    style={{width: 'auto', margin: 0, whiteSpace: 'nowrap', padding: '10px 20px'}} 
                    onClick={() => setIsAddModalOpen(true)}
                >
                    + Add Link
                </button>
            </div>

            {/* LINKS GRID DISPLAY */}
            <div className="links-grid">
                {filteredLinks.length > 0 ? (
                    filteredLinks.map(link => (
                        <div key={link._id} className="link-card">
                            <div className="link-card-header">
                                <div className="link-icon">
                                    <i className={`ph ${getIconForCategory(link.category)}`}></i>
                                </div>
                                <i className="ph ph-trash link-delete-btn" onClick={() => requestDelete(link._id)}></i>
                            </div>
                            
                            <div style={{fontSize:'11px', color:'#999', textTransform:'uppercase', fontWeight:'bold', marginBottom:'4px'}}>
                                {link.category}
                            </div>

                            <h3>{link.title}</h3>
                            <p className="link-url">{link.url}</p>
                            
                            <a href={link.url} target="_blank" className="link-action">
                                Open link <i className="ph-bold ph-arrow-square-out"></i>
                            </a>
                        </div>
                    ))
                ) : (
                    <p style={{color: '#999', gridColumn: '1 / -1'}}>No links found in this category.</p>
                )}
            </div>

            {/* ADD LINK MODAL */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Add New Link</h3>
                            <i className="ph ph-x" onClick={closeAddModal} style={{cursor:'pointer'}}></i>
                        </div>
                        
                        <div className="input-group">
                            <label>Category</label>
                            <select 
                                className="input-field" 
                                value={newCategory} 
                                onChange={e => setNewCategory(e.target.value)}
                            >
                                <option value="Website">Website</option>
                                <option value="Video">Video</option>
                                <option value="Document">Document</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Title</label>
                            <input 
                                className="input-field" 
                                placeholder="e.g. Course Syllabus" 
                                value={newTitle} 
                                onChange={e => setNewTitle(e.target.value)} 
                            />
                        </div>
                        
                        <div className="input-group">
                            <label>URL</label>
                            <input 
                                className="input-field" 
                                placeholder="https://..." 
                                value={newUrl} 
                                onChange={e => setNewUrl(e.target.value)} 
                            />
                        </div>

                        <button className="btn-primary" onClick={handleAddLink}>Save Link</button>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '320px'}}>
                        <div className="modal-danger-header">
                            <div className="danger-icon-circle">
                                <i className="ph-bold ph-warning"></i>
                            </div>
                            <h3>Delete Link?</h3>
                        </div>
                        
                        <p style={{color:'#666', fontSize:'14px', margin:0}}>
                            Are you sure you want to delete this link?
                        </p>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}