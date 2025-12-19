const { useState, useEffect, useRef } = React;

function BoardScreen({ currentUser }) {
    
    const [userBoardsList, setUserBoardsList] = useState([]);
    const [activeBoard, setActiveBoard] = useState(null);
    const [boardNotes, setBoardNotes] = useState([]);
    
    const [showBoardMenu, setShowBoardMenu] = useState(false);

    const [isCreatingBoard, setIsCreatingBoard] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    
    // DELETE POPUP STATE
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [boardToDelete, setBoardToDelete] = useState(null);

    // VIEWPORT STATE (ZOOM AND PAN)
    const [viewportState, setViewportState] = useState({ 
        xPosition: 0, 
        yPosition: 0, 
        zoomLevel: 1 
    });

    const imageInputRef = useRef(null);

    useEffect(() => {
        if (!currentUser) return;

        fetch('/api/boards', { headers: { 'user-email': currentUser.email } })
            .then(response => response.json())
            .then(fetchedBoards => {
                setUserBoardsList(fetchedBoards);
                if (fetchedBoards.length > 0) {
                    setActiveBoard(fetchedBoards[0]);
                }
            });
    }, [currentUser]);

    // FETCH NOTES WHEN ACTIVE BOARD CHANGES
    useEffect(() => {
        if (!activeBoard) return;

        fetch('/api/notes', { headers: { 'board-id': activeBoard._id } })
            .then(response => response.json())
            .then(fetchedNotes => {
                setBoardNotes(fetchedNotes);
                setViewportState({ xPosition: 0, yPosition: 0, zoomLevel: 1 });
            });
    }, [activeBoard]);

    const handleCreateNewBoard = async () => {
        if (!newBoardName.trim()) return;

        const apiResponse = await fetch('/api/boards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userEmail: currentUser.email, 
                name: newBoardName 
            })
        });

        const creationResult = await apiResponse.json();
        
        setUserBoardsList([...userBoardsList, creationResult.board]);
        setActiveBoard(creationResult.board);
        setNewBoardName('');
        setIsCreatingBoard(false);
    };

    // REQUEST TO DELETE BOARD
    const handleDeleteBoardRequest = (event, boardIdToDelete) => {
        event.stopPropagation();
        setBoardToDelete(boardIdToDelete);
        setIsDeleteModalOpen(true);
        setShowBoardMenu(false);
    };

    // CONFIRM DELETION
    const confirmDeleteBoard = async () => {
        if (!boardToDelete) return;

        await fetch(`/api/boards/${boardToDelete}`, { method: 'DELETE' });

        const remainingBoards = userBoardsList.filter(board => board._id !== boardToDelete);
        setUserBoardsList(remainingBoards);

        if (activeBoard && activeBoard._id === boardToDelete) {
            setActiveBoard(remainingBoards.length > 0 ? remainingBoards[0] : null);
            setBoardNotes([]);
        }

        setIsDeleteModalOpen(false);
        setBoardToDelete(null);
    };

    // NOTE API ACTIONS

    const createNewNote = async (noteType = 'text', noteContent = '') => {
        if (!activeBoard) return;
        
        const canvasContainer = document.querySelector('.board-canvas');
        const screenCenterX = canvasContainer ? canvasContainer.offsetWidth / 2 : window.innerWidth / 2;
        const screenCenterY = canvasContainer ? canvasContainer.offsetHeight / 2 : window.innerHeight / 2;
        
        const calculatedX = (-viewportState.xPosition + screenCenterX) / viewportState.zoomLevel; 
        const calculatedY = (-viewportState.yPosition + screenCenterY) / viewportState.zoomLevel;

        const noteWidth = noteType === 'image' ? 300 : 250;
        const noteHeight = 200;

        const newNoteData = {
            boardId: activeBoard._id,
            type: noteType,
            content: noteContent,
            color: noteType === 'text' ? '#FEF3C7' : 'transparent',
            width: noteWidth,
            height: noteType === 'text' || noteType === 'plaintext' ? 200 : 'auto',
            x: calculatedX - (noteWidth / 2),
            y: calculatedY - (noteHeight / 2)
        };

        const apiResponse = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newNoteData)
        });

        const creationResult = await apiResponse.json();
        
        if (creationResult.success) {
            setBoardNotes(currentNotes => [...currentNotes, creationResult.note]);
        }
    };

    const handleImageUpload = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            createNewNote('image', fileReader.result);
        };
        fileReader.readAsDataURL(selectedFile);
    };

    const updateNoteProperties = async (noteId, dataToUpdate) => {
        setBoardNotes(currentNotes => 
            currentNotes.map(note => note._id === noteId ? { ...note, ...dataToUpdate } : note)
        );
        
        await fetch(`/api/notes/${noteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataToUpdate)
        });
    };

    const deleteNote = async (noteId) => {
        await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
        setBoardNotes(currentNotes => currentNotes.filter(note => note._id !== noteId));
    };

    // PANNING LOGIC
    const handlePanStart = (mouseDownEvent) => {
        if (mouseDownEvent.target.closest('.sticky-note') || mouseDownEvent.target.closest('.no-drag')) return;
        
        const startMouseX = mouseDownEvent.clientX;
        const startMouseY = mouseDownEvent.clientY;
        const initialViewX = viewportState.xPosition;
        const initialViewY = viewportState.yPosition;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startMouseX;
            const deltaY = moveEvent.clientY - startMouseY;
            
            setViewportState(prevState => ({ 
                ...prevState, 
                xPosition: initialViewX + deltaX, 
                yPosition: initialViewY + deltaY 
            }));
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // NOTE DRAGGING LOGIC
    const handleNoteDragStart = (mouseDownEvent, noteId, initialNoteX, initialNoteY) => {
        mouseDownEvent.stopPropagation();
        
        if (mouseDownEvent.target.tagName === 'TEXTAREA' || 
            mouseDownEvent.target.closest('.no-drag') || 
            mouseDownEvent.target.classList.contains('resize-handle')) return;

        const startMouseX = mouseDownEvent.clientX;
        const startMouseY = mouseDownEvent.clientY;

        const handleMouseMove = (moveEvent) => {

            const deltaX = (moveEvent.clientX - startMouseX) / viewportState.zoomLevel; 
            const deltaY = (moveEvent.clientY - startMouseY) / viewportState.zoomLevel;
            
            setBoardNotes(currentNotes => currentNotes.map(note => {
                if (note._id === noteId) {
                    return { 
                        ...note, 
                        x: initialNoteX + deltaX, 
                        y: initialNoteY + deltaY, 
                        zIndex: 100
                    };
                }
                return note;
            }));
        };

        const handleMouseUp = (upEvent) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            const deltaX = (upEvent.clientX - startMouseX) / viewportState.zoomLevel;
            const deltaY = (upEvent.clientY - startMouseY) / viewportState.zoomLevel;
            
            updateNoteProperties(noteId, { 
                x: initialNoteX + deltaX, 
                y: initialNoteY + deltaY, 
                zIndex: 1 
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // NOTE RESIZING LOGIC
    const handleResizeStart = (mouseDownEvent, noteId, initialWidth, initialHeight) => {
        mouseDownEvent.stopPropagation();
        
        const startMouseX = mouseDownEvent.clientX;
        const startMouseY = mouseDownEvent.clientY;

        const handleMouseMove = (moveEvent) => {
            const deltaX = (moveEvent.clientX - startMouseX) / viewportState.zoomLevel;
            const deltaY = (moveEvent.clientY - startMouseY) / viewportState.zoomLevel;
            
            setBoardNotes(currentNotes => currentNotes.map(note => {
                if (note._id === noteId) {
                    return { 
                        ...note, 
                        width: Math.max(100, initialWidth + deltaX), 
                        height: Math.max(100, initialHeight + deltaY)
                    };
                }
                return note;
            }));
        };

        const handleMouseUp = (upEvent) => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            
            const deltaX = (upEvent.clientX - startMouseX) / viewportState.zoomLevel;
            const deltaY = (upEvent.clientY - startMouseY) / viewportState.zoomLevel;
            
            updateNoteProperties(noteId, { 
                width: Math.max(100, initialWidth + deltaX), 
                height: Math.max(100, initialHeight + deltaY) 
            });
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const adjustZoomLevel = (zoomDelta) => {
        setViewportState(prevState => {
            const newZoomLevel = Math.min(Math.max(prevState.zoomLevel + zoomDelta, 0.2), 3); 
            return { ...prevState, zoomLevel: newZoomLevel };
        });
    };

    return (
        <div className="content-area">
            <div className="board-header">
                
                <div className="board-header-left">
                    <div className="board-dropdown-wrapper">
                        <div className="current-board-btn" onClick={() => setShowBoardMenu(!showBoardMenu)}>
                            <span>{activeBoard ? activeBoard.name : 'Select Board'}</span>
                            <i className="ph-bold ph-caret-down"></i>
                        </div>

                        {showBoardMenu && (
                            <div className="board-dropdown-menu">
                                {userBoardsList.map(board => (
                                    <div 
                                        key={board._id} 
                                        className="dropdown-item"
                                        onClick={() => { setActiveBoard(board); setShowBoardMenu(false); }}
                                    >
                                        <span style={{flex:1}}>{board.name}</span>
                                        <span 
                                            className="dropdown-delete" 
                                            onClick={(e) => handleDeleteBoardRequest(e, board._id)}
                                        >
                                            <i className="ph ph-trash"></i>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="create-board-wrapper">
                        {isCreatingBoard ? (
                            <input 
                                className="new-board-input"
                                autoFocus 
                                placeholder="Name..." 
                                value={newBoardName} 
                                onChange={e => setNewBoardName(e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && handleCreateNewBoard()} 
                            />
                        ) : (
                            <button className="new-board-btn" onClick={() => setIsCreatingBoard(true)}>+</button>
                        )}
                    </div>
                </div>

                <div className="board-tools">
                    <div className="zoom-controls">
                        <button className="tool-btn" onClick={() => adjustZoomLevel(-0.1)}>-</button>
                        <span style={{fontSize:12, width:35, textAlign:'center'}}>
                            {Math.round(viewportState.zoomLevel * 100)}%
                        </span>
                        <button className="tool-btn" onClick={() => adjustZoomLevel(0.1)}>+</button>
                    </div>
                    
                    <div className="divider"></div>

                    <button className="tool-btn" onClick={() => createNewNote('text')}>
                        <i className="ph ph-note"></i> Sticky
                    </button>
                    <button className="tool-btn" onClick={() => createNewNote('plaintext')}>
                        <i className="ph ph-text-t"></i> Text
                    </button>
                    <button className="tool-btn" onClick={() => imageInputRef.current.click()}>
                        <i className="ph ph-image"></i> Image
                    </button>
                    
                    <input 
                        type="file" 
                        ref={imageInputRef} 
                        style={{display:'none'}} 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                    />
                </div>
            </div>

            <div className="board-canvas" onMouseDown={handlePanStart}>
                
                <div className="transform-layer" style={{ 
                    transform: `translate(${viewportState.xPosition}px, ${viewportState.yPosition}px) scale(${viewportState.zoomLevel})`,
                }}>
                    {activeBoard ? boardNotes.map(note => {
                        const isPlainMode = note.type === 'plaintext';
                        const isImageMode = note.type === 'image';
                        
                        return (
                            <div 
                                key={note._id}
                                className={`sticky-note ${isPlainMode ? 'plain-text-mode' : ''}`}
                                style={{ 
                                    left: note.x, 
                                    top: note.y, 
                                    zIndex: note.zIndex,
                                    width: note.width || 250, 
                                    height: note.height || (isImageMode ? 'auto' : 200),
                                    backgroundColor: isPlainMode ? 'transparent' : note.color,
                                    boxShadow: isPlainMode ? 'none' : undefined,
                                    border: isPlainMode ? '1px dashed transparent' : undefined
                                }}
                                onMouseDown={(e) => handleNoteDragStart(e, note._id, note.x, note.y)}
                            >
                                <div className="note-header">
                                    <i className="ph ph-dots-six-vertical note-drag-handle"></i>
                                    
                                    {!isPlainMode && !isImageMode && (
                                        <div className="color-picker no-drag">
                                            {['#FEF3C7', '#FCE7F3', '#DBEAFE', '#DCFCE7'].map(colorCode => (
                                                <span 
                                                    key={colorCode} 
                                                    className="color-dot" 
                                                    style={{background: colorCode}} 
                                                    onClick={() => updateNoteProperties(note._id, {color: colorCode})}
                                                ></span>
                                            ))}
                                        </div>
                                    )}
                                    
                                    <i className="ph ph-x note-close no-drag" onClick={() => deleteNote(note._id)}></i>
                                </div>

                                {isImageMode ? (
                                    <img 
                                        src={note.content} 
                                        className="note-image no-drag" 
                                        draggable="false" 
                                        style={{width: '100%', height:'100%'}} 
                                    />
                                ) : (
                                    <textarea 
                                        className="note-content no-drag"
                                        style={{
                                            fontSize: isPlainMode ? '18px' : '14px', 
                                            fontWeight: isPlainMode ? '500' : 'normal'
                                        }}
                                        defaultValue={note.content} 
                                        placeholder={isPlainMode ? "Type..." : "Write..."}
                                        onBlur={(e) => updateNoteProperties(note._id, { content: e.target.value })}
                                    />
                                )}
                                
                                <div 
                                    className="resize-handle no-drag" 
                                    onMouseDown={(e) => handleResizeStart(e, note._id, note.width || 250, note.height || 200)}
                                ></div>
                            </div>
                        );
                    }) : (
                        <div style={{padding:40, color:'#999'}}>
                            No board selected. Please create or select a board.
                        </div>
                    )}
                </div>
            </div>

            {/*DELETE CONFIRMATION POP UP*/}
            {isDeleteModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{width: '320px'}}>
                        <div className="modal-danger-header">
                            <div className="danger-icon-circle">
                                <i className="ph-bold ph-warning"></i>
                            </div>
                            <h3>Delete Board?</h3>
                        </div>
                        
                        <p style={{color:'#666', fontSize:'14px', margin:0}}>
                            Are you sure you want to delete this board? 
                            <br/><strong>All sticky notes inside it will be lost.</strong>
                        </p>

                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
                            <button className="btn-danger" onClick={confirmDeleteBoard}>Delete Board</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}