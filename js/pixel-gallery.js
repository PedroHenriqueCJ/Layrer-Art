const GALERIA_CONFIG = {
    maxProjetos: 50,             
    autoSave: true,               
    previewSize: 150,              
    localStorageKey: 'pixelArtProjetos'  
};

// ========== GLOBAL VARS ==========
let galeriaAberta = false;         
let projetosCache = [];   


// ========== SAVE PROJECT ==========

function salvarProjetoPixelArt() {
    console.log(' Saving project...');

    const nomeProjeto = prompt('Project name:', `PixelArt_${new Date().getTime()}`);
    if (!nomeProjeto || nomeProjeto.trim() === '') return;
    
    const nomeFinal = nomeProjeto.trim();
    

    if (window.editor && window.editor.canvas) {
        console.log('Using editor to save...');
        salvarComEditor(nomeFinal);
        return;
    }
    
    // Try direct canvas
    const canvas = encontrarCanvasAtivo();
    if (canvas) {
        console.log('Using canvas to save...');
        salvarComCanvas(canvas, nomeFinal);
        return;
    }
    
    // Fallback
    console.log('Using fallback...');
    salvarFallback(nomeFinal);
}

// Save with editor
function salvarComEditor(nomeProjeto) {
    try {
        const editor = window.editor;
        const canvas = editor.canvas;
        
        const imagemDataURL = canvas.toDataURL('image/png');
        
        const projeto = {
            id: Date.now(),
            nome: nomeProjeto,
            data: new Date().toLocaleString('pt-BR'),
            imagem: imagemDataURL,
            width: canvas.width,
            height: canvas.height,
            pixelSize: editor.pixelSize || 8,
            timestamp: Date.now(),
            layers: editor.layers ? editor.layers.length : 1,
            frames: editor.frames ? editor.frames.length : 1
        };
        
        salvarNoStorage(projeto);
        mostrarNotificacao(` "${nomeProjeto}" saved!`, 'success');
        
        if (galeriaAberta) {
            atualizarGaleriaPixelArt();
        }
        
    } catch (erro) {
        console.error('Save error:', erro);
        mostrarNotificacao('Error saving', 'error');
    }
}

// Save with canvas
function salvarComCanvas(canvas, nomeProjeto) {
    try {
        const imagemDataURL = canvas.toDataURL('image/png');
        
        const projeto = {
            id: Date.now(),
            nome: nomeProjeto,
            data: new Date().toLocaleString('pt-BR'),
            imagem: imagemDataURL,
            width: canvas.width,
            height: canvas.height,
            timestamp: Date.now()
        };
        
        salvarNoStorage(projeto);
        mostrarNotificacao(` "${nomeProjeto}" saved!`, 'success');
        
        if (galeriaAberta) atualizarGaleriaPixelArt();
        
    } catch (erro) {
        console.error('Save error:', erro);
        mostrarNotificacao('Error saving', 'error');
    }
}

// Fallback save
function salvarFallback(nomeProjeto) {
    try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 64;
        tempCanvas.height = 64;
        const ctx = tempCanvas.getContext('2d');
        
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(10, 10, 44, 44);
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(20, 20, 24, 24);
        
        const imagemDataURL = tempCanvas.toDataURL('image/png');
        
        const projeto = {
            id: Date.now(),
            nome: nomeProjeto,
            data: new Date().toLocaleString('pt-BR'),
            imagem: imagemDataURL,
            width: 64,
            height: 64,
            timestamp: Date.now(),
            note: 'Fallback mode'
        };
        
        salvarNoStorage(projeto);
        mostrarNotificacao(` "${nomeProjeto}" saved (fallback)!`, 'warning');
        
    } catch (erro) {
        console.error('Fallback error:', erro);
        mostrarNotificacao(' Critical error', 'error');
    }
}

// ========== LOAD PROJECT ==========
// Load project from gallery
function carregarProjetoPixelArt(index) {
    console.log(` Loading project #${index}...`);
    
    const projetos = obterProjetosStorage();
    
    if (index < 0 || index >= projetos.length) {
        mostrarNotificacao('Project not found!', 'error');
        return;
    }
    
    const projeto = projetos[index];
    
    if (!projeto.imagem) {
        mostrarNotificacao('No image in this project!', 'error');
        return;
    }
    
    mostrarDialogoCarregamento(projeto, index);
}

// Show load dialog
function mostrarDialogoCarregamento(projeto, index) {
    const dialog = document.createElement('div');
    dialog.className = 'galeria-dialogo';
    dialog.innerHTML = `
        <div class="dialogo-conteudo">
            <h3><i class="fas fa-download"></i> Load Project</h3>
            <div class="projeto-info-dialogo">
                <strong>${projeto.nome}</strong>
                <div class="projeto-metadados">
                    <span><i class="fas fa-calendar"></i> ${projeto.data}</span>
                    <span><i class="fas fa-expand-alt"></i> ${projeto.width || '?'}x${projeto.height || '?'}</span>
                </div>
                <img src="${projeto.imagem}" alt="Preview" class="projeto-preview-dialogo">
            </div>
            <div class="dialogo-opcoes">
                <button class="btn-dialogo btn-nova-camada" onclick="executarCarregamento(${index}, true)">
                    <i class="fas fa-layer-group"></i> New Layer
                </button>
                <button class="btn-dialogo btn-substituir" onclick="executarCarregamento(${index}, false)">
                    <i class="fas fa-redo"></i> Replace All
                </button>
                <button class="btn-dialogo btn-cancelar" onclick="fecharDialogo(this)">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
}

// Execute loading
function executarCarregamento(index, comoNovaCamada) {
    document.querySelectorAll('.galeria-dialogo').forEach(d => d.remove());
    
    const projetos = obterProjetosStorage();
    const projeto = projetos[index];
    
    console.log(`Loading: ${projeto.nome}, New layer: ${comoNovaCamada}`);
    
    if (tentarCarregamentoEditor(projeto, comoNovaCamada)) {
        return;
    }
    
    if (tentarCarregamentoCanvas(projeto, comoNovaCamada)) {
        return;
    }
    
    carregamentoFallback(projeto);
}

// Try editor load
function tentarCarregamentoEditor(projeto, comoNovaCamada) {
    console.log('Trying editor load...');
    
    if (!window.editor) {
        console.log('Editor not found');
        return false;
    }
    
    try {
        if (typeof window.editor.loadProjectFromGallery === 'function') {
            console.log('Using loadProjectFromGallery()');
            window.editor.loadProjectFromGallery(projeto.imagem, projeto.nome);
            
            mostrarNotificacao(` "${projeto.nome}" loaded!`, 'success');
            fecharGaleriaPixelArt();
            return true;
        }
    } catch (e) {
        console.error('Method 1 error:', e);
    }
    
    try {
        console.log('Using fallback method');
        const img = new Image();
        img.onload = function() {
            const currentFrame = window.editor.frames[window.editor.currentFrameIndex];
            const currentLayer = currentFrame.layers[window.editor.currentLayerIndex];
            
            currentLayer.ctx.clearRect(0, 0,
                window.editor.canvasSize,
                window.editor.canvasSize);
            
            currentLayer.ctx.drawImage(img, 0, 0,
                window.editor.canvasSize,
                window.editor.canvasSize);
            
            window.editor.updateCanvas();
            window.editor.updateAllThumbnails();
            
            console.log('Image drawn on canvas');
        };
        
        img.src = projeto.imagem;
        
        mostrarNotificacao(`"${projeto.nome}" loaded!`, 'success');
        fecharGaleriaPixelArt();
        return true;
        
    } catch (e) {
        console.error('Method 2 error:', e);
        return false;
    }
}

// Try canvas load
function tentarCarregamentoCanvas(projeto, comoNovaCamada) {
    const canvas = encontrarCanvasAtivo();
    if (!canvas) return false;
    
    console.log('Using direct canvas');
    
    try {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            if (!comoNovaCamada) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            if (window.editor && window.editor.updateCanvas) {
                window.editor.updateCanvas();
            }
            
            mostrarNotificacao(` "${projeto.nome}" loaded!`, 'success');
            fecharGaleriaPixelArt();
        };
        
        img.onerror = function() {
            mostrarNotificacao('Error loading image', 'error');
        };
        
        img.src = projeto.imagem;
        return true;
        
    } catch (e) {
        console.error('Canvas error:', e);
        return false;
    }
}

// Fallback load
function carregamentoFallback(projeto) {
    console.log('Using fallback load');
    
    const win = window.open();
    win.document.write(`
        <html>
            <head><title>${projeto.nome}</title></head>
            <body style="margin:0; background:#222; display:flex; justify-content:center; align-items:center; height:100vh;">
                <img src="${projeto.imagem}" alt="${projeto.nome}" style="max-width:90%; max-height:90%; image-rendering:pixelated; border:2px solid white;">
                <div style="position:fixed; bottom:20px; color:white;">
                    <p>${projeto.nome}</p>
                    <p>Save this image and import manually.</p>
                </div>
            </body>
        </html>
    `);
    
    mostrarNotificacao('Image opened in new window', 'info');
    fecharGaleriaPixelArt();
}

// ========== GALLERY UI ==========
// Open gallery
function abrirGaleriaPixelArt() {
    console.log(' Opening gallery...');
    
    if (galeriaAberta) {
        fecharGaleriaPixelArt();
        return;
    }
    
    if (!document.getElementById('galeriaPixelArt')) {
        criarGaleriaUI();
    }
    
    const galeria = document.getElementById('galeriaPixelArt');
    galeria.classList.add('active');
    galeria.style.display = 'flex';
    galeriaAberta = true;
    
    setTimeout(() => {
        atualizarGaleriaPixelArt();
        adicionarEventosGaleria();
    }, 100);
    
    document.addEventListener('keydown', fecharGaleriaComEsc);
}

// Close gallery
function fecharGaleriaPixelArt() {
    console.log('Closing gallery...');
    
    const galeria = document.getElementById('galeriaPixelArt');
    if (galeria) {
        galeria.classList.remove('active');
        setTimeout(() => {
            galeria.style.display = 'none';
        }, 300);
    }
    
    galeriaAberta = false;
    document.removeEventListener('keydown', fecharGaleriaComEsc);
}

// Close with ESC
function fecharGaleriaComEsc(event) {
    if (event.key === 'Escape' && galeriaAberta) {
        fecharGaleriaPixelArt();
    }
}

// Create gallery UI
function criarGaleriaUI() {
    console.log(' Creating gallery interface...');
    
    if (document.getElementById('galeriaPixelArt')) return;
    
    const galeriaHTML = `
        <div id="galeriaPixelArt" class="galeria-overlay">
            <div class="galeria-content">
                <div class="galeria-header">
                    <h2><i class="fas fa-images"></i> Project Gallery</h2>
                    <div class="galeria-header-actions">
                        <button class="galeria-btn-refresh" onclick="atualizarGaleriaPixelArt()" title="Refresh">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                        <button class="galeria-close-btn" onclick="fecharGaleriaPixelArt()" title="Close (ESC)">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                
                <div class="galeria-controls">
                    <div class="galeria-search">
                        <input type="text" id="galeria-search-input" placeholder="🔍 Search projects..." 
                               oninput="filtrarProjetosGaleria(this.value)">
                    </div>
                    <div class="galeria-stats" id="galeria-stats">
                        Loading...
                    </div>
                </div>
                
                <div class="galeria-body">
                    <div id="galeria-projetos" class="projetos-container">
                        <div class="loading-projetos">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Loading projects...</p>
                        </div>
                    </div>
                </div>
                
                <div class="galeria-footer">
                    <div class="galeria-actions">
                        <button onclick="exportarTodosProjetos()" class="btn-galeria btn-export">
                            <i class="fas fa-download"></i> Export All
                        </button>
                        <button onclick="importarProjetos()" class="btn-galeria btn-import">
                            <i class="fas fa-upload"></i> Import
                        </button>
                        <button onclick="limparTodosProjetos()" class="btn-galeria btn-clear">
                            <i class="fas fa-trash"></i> Clear All
                        </button>
                    </div>
                    <div class="galeria-info">
                        <span id="galeria-contador">0 projects</span>
                        <span class="galeria-hint">Click to load • Right click for menu</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', galeriaHTML);
}

// Update gallery
function atualizarGaleriaPixelArt() {
    console.log(' Updating gallery...');
    
    const projetos = obterProjetosStorage();
    const container = document.getElementById('galeria-projetos');
    const contador = document.getElementById('galeria-contador');
    const stats = document.getElementById('galeria-stats');
    
    if (!container) return;
    
    projetosCache = projetos;
    
    if (contador) {
        contador.textContent = `${projetos.length} project(s)`;
    }
    
    if (stats) {
        const totalKB = projetos.reduce((acc, p) => {
            if (p.imagem) {
                return acc + Math.ceil(p.imagem.length * 0.75 / 1024);
            }
            return acc;
        }, 0);
        
        stats.innerHTML = `
            <span>${projetos.length} projects</span> • 
            <span>${totalKB} KB</span> • 
            <span>${new Date().toLocaleTimeString()}</span>
        `;
    }
    
    if (projetos.length === 0) {
        container.innerHTML = `
            <div class="galeria-vazia">
                <i class="fas fa-palette"></i>
                <h3>No projects saved</h3>
                <p>Use "Save" button to start your collection!</p>
                <div style="margin-top: 20px;">
                    <button onclick="criarProjetoExemplo()" class="btn-galeria" style="background: #4CAF50;">
                        <i class="fas fa-plus"></i> Create Example
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    let html = '<div class="projetos-grid">';
    
    projetos.forEach((projeto, index) => {
        const dataFormatada = projeto.data || new Date(projeto.timestamp).toLocaleDateString();
        const tamanho = projeto.width && projeto.height ? 
            `${projeto.width}×${projeto.height}` : '?×?';
        
        html += `
            <div class="projeto-card" 
                 onclick="carregarProjetoPixelArt(${index})"
                 oncontextmenu="mostrarMenuProjeto(event, ${index})">
                
                <div class="projeto-card-header">
                    <h4 class="projeto-titulo" title="${projeto.nome}">
                        ${projeto.nome.length > 18 ? projeto.nome.substring(0, 18) + '...' : projeto.nome}
                    </h4>
                    <button class="projeto-excluir-btn" 
                            onclick="excluirProjetoPixelArt(${index}, event)" 
                            title="Delete">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="projeto-preview">
                    ${projeto.imagem ? 
                        `<img src="${projeto.imagem}" 
                              alt="${projeto.nome}" 
                              class="projeto-miniatura"
                              loading="lazy">` :
                        `<div class="projeto-sem-imagem">
                            <i class="fas fa-image"></i>
                            <span>No image</span>
                        </div>`
                    }
                </div>
                
                <div class="projeto-info">
                    <div class="projeto-data" title="${dataFormatada}">
                        <i class="fas fa-calendar"></i> ${dataFormatada.split(' ')[0]}
                    </div>
                    <div class="projeto-tamanho" title="${tamanho} pixels">
                        <i class="fas fa-expand-alt"></i> ${tamanho}
                    </div>
                </div>
                
                ${projeto.note ? `
                    <div style="padding: 5px 10px; background: #333; font-size: 10px; color: #888;">
                        <i class="fas fa-info-circle"></i> ${projeto.note}
                    </div>
                ` : ''}
                
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Add gallery events
function adicionarEventosGaleria() {
    const searchInput = document.getElementById('galeria-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            filtrarProjetosGaleria(e.target.value);
        });
    }
}

// Filter projects
function filtrarProjetosGaleria(termo) {
    const container = document.getElementById('galeria-projetos');
    if (!container || !projetosCache.length) return;
    
    const cards = container.querySelectorAll('.projeto-card');
    if (!cards.length) return;
    
    const termoLower = termo.toLowerCase().trim();
    
    cards.forEach(card => {
        const titulo = card.querySelector('.projeto-titulo')?.textContent.toLowerCase() || '';
        const isVisible = termoLower === '' || titulo.includes(termoLower);
        card.style.display = isVisible ? 'block' : 'none';
    });
}

// ========== PROJECT OPERATIONS ==========
// Delete project
function excluirProjetoPixelArt(index, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const projetos = obterProjetosStorage();
    
    if (index < 0 || index >= projetos.length) {
        mostrarNotificacao('Project not found!', 'error');
        return;
    }
    
    const nomeProjeto = projetos[index].nome;
    
    if (confirm(`Delete "${nomeProjeto}"?\n\nThis cannot be undone!`)) {
        projetos.splice(index, 1);
        salvarProjetosStorage(projetos);
        
        mostrarNotificacao(` "${nomeProjeto}" deleted!`, 'success');
        
        if (galeriaAberta) {
            atualizarGaleriaPixelArt();
        }
    }
}

// Clear all projects
function limparTodosProjetos() {
    const projetos = obterProjetosStorage();
    
    if (projetos.length === 0) {
        mostrarNotificacao('Gallery is empty!', 'info');
        return;
    }
    
    if (!confirm(`DELETE ALL ${projetos.length} PROJECTS?\n\nThis CANNOT be undone!`)) {
        return;
    }
    
    localStorage.removeItem(GALERIA_CONFIG.localStorageKey);
    projetosCache = [];
    
    mostrarNotificacao(`${projetos.length} projects deleted!`, 'success');
    
    if (galeriaAberta) {
        atualizarGaleriaPixelArt();
    }
}

// Rename project
function renomearProjeto(index) {
    const projetos = obterProjetosStorage();
    if (index < 0 || index >= projetos.length) return;
    
    const novoNome = prompt('New project name:', projetos[index].nome);
    if (!novoNome || novoNome.trim() === '') return;
    
    projetos[index].nome = novoNome.trim();
    projetos[index].data = new Date().toLocaleString('pt-BR');
    
    salvarProjetosStorage(projetos);
    mostrarNotificacao('Project renamed!', 'success');
    
    if (galeriaAberta) {
        atualizarGaleriaPixelArt();
    }
}

// Duplicate project
function duplicarProjeto(index) {
    const projetos = obterProjetosStorage();
    if (index < 0 || index >= projetos.length) return;
    
    const projetoOriginal = projetos[index];
    const projetoDuplicado = {
        ...projetoOriginal,
        id: Date.now(),
        nome: `${projetoOriginal.nome} (copy)`,
        data: new Date().toLocaleString('pt-BR'),
        timestamp: Date.now()
    };
    
    projetos.unshift(projetoDuplicado);
    salvarProjetosStorage(projetos);
    
    mostrarNotificacao('Project duplicated!', 'success');
    
    if (galeriaAberta) {
        atualizarGaleriaPixelArt();
    }
}

// ========== EXPORT/IMPORT ==========
// Export all as JSON
function exportarTodosProjetos() {
    const projetos = obterProjetosStorage();
    
    if (projetos.length === 0) {
        mostrarNotificacao('No projects to export!', 'info');
        return;
    }
    
    const dataStr = JSON.stringify(projetos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pixelart-projects-${new Date().getTime()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    mostrarNotificacao(` ${projetos.length} projects exported!`, 'success');
}

// Export single as PNG
function exportarProjetoIndividual(index) {
    const projetos = obterProjetosStorage();
    if (index < 0 || index >= projetos.length) return;
    
    const projeto = projetos[index];
    
    if (!projeto.imagem) {
        mostrarNotificacao('No image to export!', 'error');
        return;
    }
    
    const link = document.createElement('a');
    link.href = projeto.imagem;
    link.download = `pixelart-${projeto.nome.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}.png`;
    link.click();
    
    mostrarNotificacao('Image exported!', 'success');
}

// Import from JSON
function importarProjetos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.multiple = false;
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const projetosImportados = JSON.parse(e.target.result);
                
                if (!Array.isArray(projetosImportados)) {
                    throw new Error('Invalid format');
                }
                
                const projetosAtuais = obterProjetosStorage();
                const novosProjetos = [...projetosImportados, ...projetosAtuais];
                
                if (novosProjetos.length > GALERIA_CONFIG.maxProjetos) {
                    novosProjetos.length = GALERIA_CONFIG.maxProjetos;
                    mostrarNotificacao(`Limited to ${GALERIA_CONFIG.maxProjetos} projects`, 'warning');
                }
                
                salvarProjetosStorage(novosProjetos);
                mostrarNotificacao(` ${projetosImportados.length} projects imported!`, 'success');
                
                if (galeriaAberta) {
                    atualizarGaleriaPixelArt();
                }
                
            } catch (erro) {
                console.error('Import error:', erro);
                mostrarNotificacao('Error importing file!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// ========== UTILITIES ==========
// Show context menu
function mostrarMenuProjeto(event, index) {
    event.preventDefault();
    
    const menu = document.createElement('div');
    menu.className = 'projeto-context-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${event.clientX}px;
        top: ${event.clientY}px;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        z-index: 10001;
        min-width: 200px;
    `;
    
    const projeto = projetosCache[index];
    
    menu.innerHTML = `
        <div style="padding: 10px; background: #333; border-bottom: 1px solid #444; font-weight: bold; color: #4CAF50;">
            ${projeto.nome}
        </div>
        <div style="padding: 5px 0;">
            <button onclick="renomearProjeto(${index})" 
                    style="width:100%; text-align:left; padding:8px 15px; background:transparent; border:none; color:#ccc; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-edit"></i> Rename
            </button>
            <button onclick="duplicarProjeto(${index})" 
                    style="width:100%; text-align:left; padding:8px 15px; background:transparent; border:none; color:#ccc; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-copy"></i> Duplicate
            </button>
            <button onclick="exportarProjetoIndividual(${index})" 
                    style="width:100%; text-align:left; padding:8px 15px; background:transparent; border:none; color:#ccc; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-download"></i> Export PNG
            </button>
            <hr style="border:none; border-top:1px solid #444; margin:5px 0;">
            <button onclick="excluirProjetoPixelArt(${index})" 
                    style="width:100%; text-align:left; padding:8px 15px; background:transparent; border:none; color:#ff6b6b; cursor:pointer; display:flex; align-items:center; gap:8px;">
                <i class="fas fa-trash"></i> Delete
            </button>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    const fecharMenu = function(e) {
        if (!menu.contains(e.target)) {
            menu.remove();
            document.removeEventListener('click', fecharMenu);
        }
    };
    
    setTimeout(() => {
        document.addEventListener('click', fecharMenu);
    }, 100);
}

// Find active canvas
function encontrarCanvasAtivo() {
    let canvas = document.getElementById('pixel-canvas');
    
    if (!canvas) {
        const canvases = document.querySelectorAll('canvas');
        canvas = canvases[0];
    }
    
    return canvas;
}

// Get projects from storage
function obterProjetosStorage() {
    try {
        const dados = localStorage.getItem(GALERIA_CONFIG.localStorageKey);
        return dados ? JSON.parse(dados) : [];
    } catch (erro) {
        console.error('Storage read error:', erro);
        return [];
    }
}

// Save projects to storage
function salvarProjetosStorage(projetos) {
    try {
        localStorage.setItem(GALERIA_CONFIG.localStorageKey, JSON.stringify(projetos));
        projetosCache = projetos;
        return true;
    } catch (erro) {
        console.error('Storage save error:', erro);
        return false;
    }
}

// Save single project to storage
function salvarNoStorage(projeto) {
    const projetos = obterProjetosStorage();
    projetos.unshift(projeto);
    
    if (projetos.length > GALERIA_CONFIG.maxProjetos) {
        projetos.length = GALERIA_CONFIG.maxProjetos;
        mostrarNotificacao(`Limited to ${GALERIA_CONFIG.maxProjetos} projects`, 'warning');
    }
    
    salvarProjetosStorage(projetos);
}

// Show notification
function mostrarNotificacao(mensagem, tipo = 'info') {
    const cores = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#FF9800',
        info: '#2196F3'
    };
    
    const notificacao = document.createElement('div');
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    const estilo = document.createElement('style');
    estilo.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(estilo);
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notificacao.parentNode) notificacao.parentNode.removeChild(notificacao);
            if (estilo.parentNode) estilo.parentNode.removeChild(estilo);
        }, 300);
    }, 3000);
}

// Close dialog
function fecharDialogo(elemento) {
    const dialogo = elemento.closest('.galeria-dialogo');
    if (dialogo) {
        dialogo.remove();
    }
}

// Create example project
function criarProjetoExemplo() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, 64, 64);
    
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(10, 10, 44, 44);
    
    ctx.fillStyle = '#4CAF50';
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            ctx.fillRect(12 + i * 8, 12 + j * 8, 6, 6);
        }
    }
    
    const imagemDataURL = canvas.toDataURL('image/png');
    
    const projeto = {
        id: Date.now(),
        nome: 'Example Project',
        data: new Date().toLocaleString('pt-BR'),
        imagem: imagemDataURL,
        width: 64,
        height: 64,
        timestamp: Date.now(),
        note: 'Example project'
    };
    
    salvarNoStorage(projeto);
    mostrarNotificacao('Example project created!', 'success');
    
    if (galeriaAberta) {
        atualizarGaleriaPixelArt();
    }
}

// ========== INIT ==========
// Initialize gallery
function inicializarGaleria() {
    console.log(' Initializing Pixel Art Gallery...');
    
    if (typeof localStorage === 'undefined') {
        console.error(' localStorage not supported!');
        alert('Your browser does not support local storage.');
        return;
    }
    
    const projetos = obterProjetosStorage();
    console.log(` ${projetos.length} projects loaded`);
    
    criarBotaoGaleria();
    configurarAtalhos();
    
    console.log('Gallery ready!');
}

// Create floating button
function criarBotaoGaleria() {
    if (document.getElementById('galeria-main-btn')) return;
    
    const botao = document.createElement('button');
    botao.id = 'galeria-main-btn';
    botao.innerHTML = '<i class="fas fa-images"></i>';
    botao.title = 'Open Gallery (Ctrl+G)';
    
    botao.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        z-index: 9998;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    botao.onmouseover = function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.6)';
    };
    
    botao.onmouseout = function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.4)';
    };
    
    botao.onclick = abrirGaleriaPixelArt;
    
    document.body.appendChild(botao);
}

// Setup keyboard shortcuts
function configurarAtalhos() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+G: Open gallery
        if (e.ctrlKey && e.key.toLowerCase() === 'g') {
            e.preventDefault();
            abrirGaleriaPixelArt();
        }
        
        // Ctrl+S: Save
        if (e.ctrlKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            salvarProjetoPixelArt();
        }
        
        // ESC: Close gallery
        if (e.key === 'Escape' && galeriaAberta) {
            fecharGaleriaPixelArt();
        }
    });
}

// ========== EXPORT GLOBALLY ==========
window.salvarProjetoPixelArt = salvarProjetoPixelArt;
window.carregarProjetoPixelArt = carregarProjetoPixelArt;
window.abrirGaleriaPixelArt = abrirGaleriaPixelArt;
window.fecharGaleriaPixelArt = fecharGaleriaPixelArt;
window.limparTodosProjetos = limparTodosProjetos;
window.exportarTodosProjetos = exportarTodosProjetos;
window.importarProjetos = importarProjetos;
window.executarCarregamento = executarCarregamento;
window.fecharDialogo = fecharDialogo;
window.renomearProjeto = renomearProjeto;
window.duplicarProjeto = duplicarProjeto;
window.exportarProjetoIndividual = exportarProjetoIndividual;
window.criarProjetoExemplo = criarProjetoExemplo;

// ========== AUTO-START ==========
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(inicializarGaleria, 500);
    });
} else {
    setTimeout(inicializarGaleria, 500);
}


console.log('PIXEL ART GALLERY - READY!');
console.log('Shortcuts: Ctrl+G (Open) • Ctrl+S (Save) • ESC (Close)');