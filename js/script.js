class PixelArtEditor {
    constructor() {
        this.canvas = document.getElementById('pixel-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initial settings
        this.canvasWidth = 64;
        this.canvasHeight = 64;
        this.canvasSize = 64;
        this.pixelSize = 8;
        this.zoom = 1;
        this.backgroundColor = 'transparent';
        this.showGrid = true;
        

        this.debugMode = false
        
        // Editor's state
        this.currentTool = 'pencil';
        this.currentColor = '#000000';
        this.brushSize = 1;
        this.isDrawing = false;
        
        // variables for the pencil
        this.pencilLastX = 0;
        this.pencilLastY = 0; 
        
        // General variables (used by other tools)
        this.lastX = 0; 
        this.lastY = 0; 
        
        this.renderQueued = false;
        this.drawStraightLine = false;
        
        
        // Layered system
        this.layers = [];
        this.currentLayerIndex = 0;
        
        // Animation system
        this.frames = [];
        this.currentFrameIndex = 0;
        this.animationInterval = null;
        this.fps = 12;
        this.isPlaying = false;
        
        // History 
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // Reference
        this.referenceImage = null;
        this.referenceOpacity = 0.5;
        
        
        // tile grid
        this.tileGrid = {
        enabled: false,
        rows: 2,
        cols: 2,
        color: 'rgba(90, 140, 255, 0.45)',
        thickness: 1
};
        
        
        
        
        // Rectangular Selection System
        this.selection = {
            active: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            content: null,
            contentCanvas: null,
            contentCtx: null,
            isMoving: false,
            isResizing: false,
            drawing: false,
            resizingHandle: null,
            overlay: null,
            startX: 0,
            startY: 0,
            moveStartX: 0,
            moveStartY: 0,
            originalX: 0,
            originalY: 0,
            originalRect: null,
            clipboard: null,
            tools: null,
            mode: 'rectangular'
        };
        
        
        
        this.pan = {
            isActive: false,
            startX: 0,
            startY: 0,
            lastX: 0, 
            lastY: 0, 
            offsetX: 0,
            offsetY: 0,
            maxOffset: 500
        };
    
    


        this.touch = {
            lastDistance: 0,
            initialDistance: 0,
            isPinching: false
        };




this.ignoreNextClick = false;

        // Palette System
        this.palettes = {
            default: [
                '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', 
                '#FFFF00', '#FF00FF', '#00FFFF', '#FF8800', '#8800FF',
                '#0088FF', '#FF0088', '#888888', '#444444', '#FF8888',
                '#88FF88', '#8888FF', '#FFFF88', '#FF88FF', '#88FFFF',
                '#8B4513', '#FFA500', '#800080', '#FFC0CB', '#00FF7F'
            ],
            gameboy: [
                '#0f380f', '#306230', '#8bac0f', '#9bbc0f'
            ],
            nes: [
                '#7c7c7c', '#0000fc', '#0000bc', '#4428bc',
                '#940084', '#a80020', '#a81000', '#881400',
                '#503000', '#007800', '#006800', '#005800',
                '#004058', '#000000', '#000000', '#000000'
            ],
            pastel: [
                '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf',
                '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'
            ]
        };
        
        this.currentPalette = 'default';
        
        // Onion System
        this.onionSkin = {
            enabled: false,
            framesBefore: 2,
            framesAfter: 2,
            opacity: 0.3,
            overlays: []
        };
        
        // Mirror Tool
        this.mirror = {
            enabled: false,
            axis: 'x',
            overlay: null,
            originalDrawPixel: null
        };
        
        
      // all the tools

this.tools = {
    pencil: { name: 'Pencil', icon: 'fas fa-pencil-alt', shortcut: '1' },
    eraser: { name: 'Rubber', icon: 'fas fa-eraser', shortcut: '2' },
    fill: { name: 'Bucket', icon: 'fas fa-fill-drip', shortcut: '3' },
    line: { name: 'Line', icon: 'fas fa-slash', shortcut: '4' },
    picker: { name: 'Dropper', icon: 'fas fa-eye-dropper', shortcut: '5' },
    selection: { name: 'Selection', icon: 'fas fa-vector-square', shortcut: '6' },
    blur: { name: 'Blur', icon: 'fas fa-circle', shortcut: '7' }, 
    gradient: { name: 'Gradient', icon: 'fas fa-fill', shortcut: '8' },
    stamp: { name: 'Stamp', icon: 'fas fa-stamp', shortcut: '9' },
    colorReplace: { name: 'Replace Color', icon: 'fas fa-exchange-alt', shortcut: 'R' },
    dither: { name: 'Dotted', icon: 'fas fa-th-large', shortcut: 'D' },
    glow: { name: 'Shine', icon: 'fas fa-star', shortcut: 'G' },
    noise: { name: 'Noise', icon: 'fas fa-wave-square', shortcut: 'N' },
    texture: { name: 'Texture', icon: 'fas fa-texture', shortcut: 'T' },
    warp: { name: 'Distortion', icon: 'fas fa-expand-alt', shortcut: 'W' },
    shape: { name: 'Forms', icon: 'fas fa-shapes', shortcut: 'F' },
    rectangle: { name: 'Rectangle', icon: 'fas fa-square', shortcut: 'B', hasFill: true },
    triangle: { name: 'Triangle', icon: 'fas fa-play', shortcut: 'A', hasFill: true },
    polygon: { name: 'Polygon', icon: 'fas fa-draw-polygon', shortcut: 'P', hasFill: true }
};
        
       
        this.gradientTool = {
            type: 'linear',
            startColor: '#FF0000',
            endColor: '#0000FF',
            angle: 0,
            reverse: false
        };
        
        this.blurTool = {
            radius: 2,
            intensity: 1
        };
        
        this.stampTool = {
            pattern: 'circle',
            size: 4,
            spacing: 2,
            randomRotation: false
        };
        
        this.ditherTool = {
            pattern: 'checker',
            size: 2,
            colors: ['#000000', '#FFFFFF']
        };
        
        this.glowTool = {
            radius: 3,
            intensity: 0.5,
            color: '#FFFFFF'
        };
        
        this.noiseTool = {
            intensity: 10,
            monochrome: false
        };
        
        this.textureTool = {
            pattern: 'canvas',
            scale: 2,
            opacity: 0.3
        };
        

this.warpTool = {
    strength: 10,
    brushSize: 8
};


// System of Geometric Shapes
this.shapeTool = {
    type: 'rectangle',
    filled: true,
    strokeWidth: 1,
    strokeColor: '#000000',
    fillColor: '#000000',
    sides: 6, 
    radius: 10 
};

// Shape Menu System
this.shapeMenu = {
    visible: false,
    element: null,
    position: { x: 0, y: 0 },


shapes: [
    { id: 'rectangle', icon: 'fas fa-square', name: 'Retângulo', hasFill: true },
    { id: 'ellipse', icon: 'fas fa-egg', name: 'Elipse', hasFill: true }, 
    { id: 'triangle', icon: 'fas fa-play', name: 'Triângulo', hasFill: true },
    { id: 'polygon', icon: 'fas fa-draw-polygon', name: 'Polígono', hasFill: true },
    { id: 'star', icon: 'fas fa-star', name: 'Estrela', hasFill: true },
    { id: 'heart', icon: 'fas fa-heart', name: 'Coração', hasFill: true },
    { id: 'arrow', icon: 'fas fa-arrow-right', name: 'Seta', hasFill: true },
    { id: 'cross', icon: 'fas fa-times', name: 'Cruz', hasFill: false }

    ]
};


// control active forms
this.activeShapes = [];
this.activeShape = null;
        
        // Sprite Sheet
        this.spriteSheetConfig = {
            columns: 4,
            spacing: 2,
            background: 'transparent'
        };
        
        // Grid 
        this.isometricGrid = {
            enabled: false,
            angle: 30,
            size: 16,
            color: 'rgba(255, 255, 255, 0.2)',
            overlay: null
        };
        
        // Loop System
        this.lasso = {
            active: false,
            mode: 'polygon',
            points: [],
            isDrawing: false,
            selection: null,
            transformMode: null,
            transformHistory: [],
            snapToGrid: true,
            snapSize: 8,
            alignmentGuides: [],
            overlay: null,
            previewCanvas: null,
            previewCtx: null,
            handles: [],
            currentHandle: null,
            transformMatrix: [1, 0, 0, 1, 0, 0],
            originalPoints: [],
            originalContent: null,
            transformStart: null
        };
        
        // Color Wheel System
        this.colorPicker = {
            mode: 'wheel',
            hue: 0,
            saturation: 100,
            lightness: 50,
            alpha: 1,
            isDragging: false,
            wheelElement: null,
            selectorElement: null
        };
        
        // Altiline (Border) System
        this.outline = {
            enabled: false,
            thickness: 2,
            color: '#ffffff',
            style: 'solid',
            gradient: ['#ffffff', '#000000'],
            position: 'outside',
            applyTo: 'layer'
        };
        
        // Layer Adjustment System
        this.layerAdjustments = {
            opacity: 100,
            brightness: 0,
            contrast: 0,
            hue: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            vibrance: 0
        };
        
        // Snap and Alignment System
        this.snapSystem = {
            enabled: false,
            grid: true,
            guides: true,
            boundingBox: true,
            center: true,
            thirds: false,
            goldenRatio: false,
            margin: 8,
            overlay: null
        };
        
        // Advanced Presets
        this.presets = {
            pixelart: {
                gridSize: 1,
                pixelSize: 8,
                palette: 'nes',
                backgroundColor: '#1a1a1a',
                defaultTools: ['pencil', 'fill', 'picker']
            },
            isometric: {
                gridSize: 16,
                pixelSize: 8,
                gridAngle: 30,
                backgroundColor: '#2d2d2d',
                defaultTools: ['pencil', 'line', 'shape']
            },
            ui: {
                gridSize: 8,
                pixelSize: 4,
                backgroundColor: '#f0f0f0',
                defaultTools: ['rectangle', 'line', 'fill']
            },
            animation: {
                gridSize: 1,
                pixelSize: 8,
                fps: 24,
                onionSkin: true,
                defaultTools: ['pencil', 'eraser', 'picker']
            }
        };
        
        // Advanced History System
        this.advancedHistory = {
            actions: [],
            redoStack: [],
            maxUndoSteps: 100,
            groupedActions: false,
            currentGroup: null
        };
        
        // High Resolution Export
        this.exportSettings = {
            scale: 4,
            format: 'png',
            quality: 1.0,
            exportType: 'single'
        };
        
        // Timeline 
        this.timeline = {
            playing: false,
            loop: true,
            pingPong: false,
            currentTime: 0,
            duration: 0
        };

        // Performance
        this.performance = {
            lastRender: 0,
            frameCount: 0,
            fps: 60,
            throttleMouse: false
        };

        this.init();
    }

    init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupDefaultColors();
    

    
    // Save initial empty state in history.
    setTimeout(() => {
        // Clear existing history
        this.history = [];
        this.historyIndex = -1;
        
        // Save initial state
        this.saveState();
        
        console.log('Initial state saved in history');
    }, 500);


    
    // Initialize systems
    this.initPalettesSystem();
    this.initSelectionTool();
    this.initPickerTool();
    this.initIsometricGrid();
    this.initNewTools();
    this.initAdvancedFeatures();
    this.initPreviewSystem();
    
    // Create the preview canvas first.
    this.createPreviewCanvas();
    
    // Critical Initializations
    if (this.layers.length === 0) {
        this.createNewLayer('Camada 1');
    }
    
    if (this.frames.length === 0) {
        this.createNewFrame();
    }
    
    this.updateUI();
    
    // Grid visible by default
    this.toggleGrid();
    
    // Create the UI for the new tools.
    this.createNewToolsUI();
    

    this.setupNewToolsListeners();
    
    
    setTimeout(() => {
        this.updateCanvasPosition();
        
    }, 100);
    


    
    // Force render first
    this.updateCanvas();
}





setupNewToolsListeners() {

    setTimeout(() => {
        this.setupBlurListeners();
        this.setupGradientListeners();
        this.setupStampListeners();
        this.setupDitherListeners();
        this.setupGlowListeners();
        this.setupNoiseListeners();
        this.setupTextureListeners();
        this.setupWarpListeners();
    }, 200);
}





    // ========== ORIGINAL BASIC FUNCTIONS ==========
  setupCanvas() {
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;
    
    this.applyZoom();
    this.clearCanvas();
}

    setupEventListeners() {
        

window.addEventListener('resize', () => {
    this.applyZoom();
    this.updateCanvasPosition();
    
    if (this.previewSystem.active) {
        this.drawPreview();
    }
    
    if (this.showGrid) {
        this.updateGridOverlay();
    }
});

    // PAN events for PC (mouse)
    this.canvas.addEventListener('mousedown', (e) => this.handlePanStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.handlePanMove(e));
    this.canvas.addEventListener('mouseup', () => this.handlePanEnd());
    this.canvas.addEventListener('mouseleave', () => this.handlePanEnd());
    
    // PAN Events for Mobile (Ring)
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));


this.canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    this.handleTouchEnd(e);
});
    

        // Original mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Original Touch Events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', () => {
            this.stopDrawing();
        });

        // Original controllers
        document.getElementById('color-input')?.addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.updateCurrentColor();
            this.updateWheelPositionFromColor(this.currentColor);
        });

        document.getElementById('brush-size')?.addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
            document.getElementById('brush-size-value').textContent = this.brushSize;
        });

        document.getElementById('fps-slider')?.addEventListener('input', (e) => {
            this.fps = parseInt(e.target.value);
            document.getElementById('fps-value').textContent = this.fps;
            if (this.isPlaying) {
                this.playAnimation();
            }
        });

        document.getElementById('reference-opacity')?.addEventListener('input', (e) => {
            this.referenceOpacity = parseInt(e.target.value) / 100;
            this.updateCanvas();
        });



this.canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    
    // Determine zoom direction.
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    
    // Zoom centered on the cursor.
    this.adjustZoom(delta, e.clientX, e.clientY);
    
    // Do not draw while zooming.
    this.ignoreNextClick = true;
    setTimeout(() => {
        this.ignoreNextClick = false;
    }, 100);
});




   // Keyboard shortcuts
document.addEventListener('keydown', (e) => {
 
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Tool shortcuts (1-9, 0, F, R, D, G, N, T, W)
    if (!e.ctrlKey && !e.altKey && !e.shiftKey) {
        switch(e.key.toLowerCase()) {
            case '1': e.preventDefault(); this.selectTool('pencil'); break;
            case '2': e.preventDefault(); this.selectTool('eraser'); break;
            case '3': e.preventDefault(); this.selectTool('fill'); break;
            case '4': e.preventDefault(); this.selectTool('line'); break;
            case '5': e.preventDefault(); this.selectTool('picker'); break;
            case '6': e.preventDefault(); this.selectTool('selection'); break;
            case '7': e.preventDefault(); this.selectTool('blur'); break;
            case '8': e.preventDefault(); this.selectTool('gradient'); break;
            case '9': e.preventDefault(); this.selectTool('stamp'); break;
           
            
            case 'r': e.preventDefault(); this.selectTool('colorReplace'); break;
            case 'd': e.preventDefault(); this.selectTool('dither'); break;
            case 'g': e.preventDefault(); this.selectTool('glow'); break;
            case 'n': e.preventDefault(); this.selectTool('noise'); break;
            case 't': e.preventDefault(); this.selectTool('texture'); break;
            case 'w': e.preventDefault(); this.selectTool('warp'); break;
            case '[': e.preventDefault(); this.previousFrame(); break;
            case ']': e.preventDefault(); this.nextFrame(); break;
            case ' ': e.preventDefault(); this.playAnimation(); break;
        }
    }
    
    // Ctrl+Z e Ctrl+Y ORIGINALS
    if (e.ctrlKey) {
        switch(e.key.toLowerCase()) {
            case 'z':
                e.preventDefault();
                this.undo();
                break;
            case 'y':
                e.preventDefault();
                this.redo();
                break;
            case 'c':
                e.preventDefault();
                if (this.selection.active) this.copySelection();
                break;
            case 'v':
                e.preventDefault();
                if (this.selection.clipboard) this.pasteSelection();
                break;
            case 'x':
                e.preventDefault();
                if (this.selection.active) this.cutSelection();
                break;
            case 'g':
                e.preventDefault();
                this.toggleSnapSystem();
                break;
            case 'o':
                e.preventDefault();
                this.toggleOutlinePanel();
                break;
            case 'p':
                e.preventDefault();
                this.applyPreset('pixelart');
                break;
            case 's':
                e.preventDefault();
                this.saveCurrentPalette();
                break;
        }
    }
    
    // Alignment shortcuts 
    if ((e.ctrlKey || e.altKey) && this.selection.active) {
        switch(e.key.toLowerCase()) {
            case 'l':
                this.alignSelection('left');
                break;
            case 'c':
                this.alignSelection('center');
                break;
            case 'r':
                this.alignSelection('right');
                break;
            case 't':
                this.alignSelection('top');
                break;
            case 'm':
                this.alignSelection('middle');
                break;
            case 'b':
                this.alignSelection('bottom');
                break;
        }
    }
    
    // Delete to clear the ORIGINAL selection.
    if (e.key === 'Delete' && this.selection.active) {
        e.preventDefault();
        this.deleteSelection();
    }
    
    // Escape to cancel selection ORIGINAL
    if (e.key === 'Escape') {
        if (this.selection.active) {
            this.clearSelection();
        }
        if (this.lasso.active) {
            this.clearLassoSelection();
        }
        this.hideShapeMenu();
    }
    
    // Arrow keys to move selection 
    if (this.selection.active && !this.selection.isMoving) {
        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.nudgeSelection(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nudgeSelection(1, 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.nudgeSelection(0, -1);
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.nudgeSelection(0, 1);
                break;
        }
    }
    
    // Shift to draw straight lines 
    if (e.shiftKey && this.isDrawing && (this.currentTool === 'pencil' || this.currentTool === 'line')) {
        this.drawStraightLine = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' && this.drawStraightLine) {
        this.drawStraightLine = false;
    }
});
    }


    
    
  // ========== PAN SYSTEM ==========
isPanEvent(e) {

    if (!e) return false;
    
    // For mouse:
    if (e.type === 'mousedown' || e.type === 'mousemove') {
        // PAN active ONLY when:
        // 1. The middle button (wheel) is pressed
        
        // 2. Right button is pressed 
        
        // 3. Ctrl + left mouse button is pressed
        if (e.button === 1 || e.button === 2) {
            return true;
        }
        
        if (e.button === 0 && e.ctrlKey) {
            return true;
        }
        
        return false;
    }
    
    // For touch (mobile):
    if (e.type === 'touchstart' || e.type === 'touchmove') {
        // Active PAN only with 2 fingers (pinch/zoom)
        // OR with 1 finger + a special button (which we will implement)
        if (e.touches && e.touches.length >= 2) {
            return true;
        }
        return false;
    }
    
    return false;
}  
    
    
    
    



// to switch tile grid
toggleTileGrid() {
    this.tileGrid.enabled = !this.tileGrid.enabled;
    
    const btn = document.getElementById('tile-grid-toggle');
    if (btn) {
        btn.classList.toggle('active', this.tileGrid.enabled);
        btn.innerHTML = this.tileGrid.enabled ?
            '<i class="fas fa-th-large"></i> Grid: ON' :
            '<i class="fas fa-th-large"></i> Grid: OFF';
    }
    
    this.updateCanvas();
    this.showNotification(this.tileGrid.enabled ?
        `Tile Grid ${this.tileGrid.rows}x${this.tileGrid.cols} activated!` :
        'Tile Grid disabled');
}

// Simple method to adjust size.
setTileGridSize(rows, cols) {
    this.tileGrid.rows = rows;
    this.tileGrid.cols = cols;
    
    if (this.tileGrid.enabled) {
        this.updateCanvas();
        this.showNotification(`Tile Grid adjusted for ${rows}x${cols}`);
    }
}

// A SIMPLE method for drawing the grid
drawTileGrid() {
    if (!this.tileGrid.enabled) return;
    
    const ctx = this.ctx;
    const { rows, cols, color, thickness } = this.tileGrid;
    
    const tileW = this.canvas.width / cols;
    const tileH = this.canvas.height / rows;
    
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    // COLORS
    const baseColor = color.replace(/[\d.]+\)$/g, '');
    const minorAlpha = Math.min(1, 0.6);
    const majorAlpha = Math.min(1, 0.95);
    
    const minorColor = `${baseColor}${minorAlpha})`;
    const majorColor = `${baseColor}${majorAlpha})`;
    const majorStep = 4;
    
    
    for (let i = 1; i < cols; i++) {
        const x = Math.round(i * tileW) + 0.5;
        
        ctx.strokeStyle = (i % majorStep === 0) ?
            majorColor :
            minorColor;
        
        ctx.lineWidth = (i % majorStep === 0) ?
            thickness + 0.5 :
            thickness;
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, this.canvas.height);
        ctx.stroke();
    }
    
    // Horizontal
    for (let i = 1; i < rows; i++) {
        const y = Math.round(i * tileH) + 0.5;
        
        ctx.strokeStyle = (i % majorStep === 0) ?
            majorColor :
            minorColor;
        
        ctx.lineWidth = (i % majorStep === 0) ?
            thickness + 0.5 :
            thickness;
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(this.canvas.width, y);
        ctx.stroke();
    }
    
    ctx.restore();
}


    // ========== NEW TOOLS ==========
    initNewTools() {
        this.setupNewToolsListeners();
    }
    
    createNewToolsUI() {
        this.createToolSettingsPanel();
    }
    
    createToolSettingsPanel() {
        const controlsPanel = document.querySelector('.tools-panel');
        if (!controlsPanel) return;
        
        const oldPanels = controlsPanel.querySelectorAll('.tool-settings');
        oldPanels.forEach(panel => panel.remove());
        
        this.createBlurSettings();
        this.createGradientSettings();
        this.createStampSettings();
        this.createDitherSettings();
        this.createGlowSettings();
        this.createNoiseSettings();
        this.createTextureSettings();
        this.createWarpSettings();
    }
    
    createBlurSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings blur-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Raio:</label>
                <input type="range" id="blur-radius" min="1" max="10" value="${this.blurTool.radius}">
                <span id="blur-radius-value">${this.blurTool.radius}</span>
            </div>
            <div class="tool-setting">
                <label>Intensidade:</label>
                <input type="range" id="blur-intensity" min="1" max="10" value="${this.blurTool.intensity}">
                <span id="blur-intensity-value">${this.blurTool.intensity}</span>
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    createGradientSettings() {
    const panel = document.createElement('div');
    panel.className = 'tool-settings gradient-settings';
    panel.style.display = 'none';
    panel.innerHTML = `
        <div class="tool-setting">
            <label>Tipo:</label>
            <select id="gradient-type">
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
                <option value="angular">Angular</option>
            </select>
        </div>
        <div class="tool-setting">
            <label>Cor Inicial:</label>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" id="gradient-start-color" value="${this.gradientTool.startColor}">
                <span id="start-color-preview" style="width: 30px; height: 20px; background: ${this.gradientTool.startColor}; border: 1px solid #ccc;"></span>
                <input type="text" id="gradient-start-hex" value="${this.gradientTool.startColor}" style="width: 80px; font-family: monospace;">
            </div>
        </div>
        <div class="tool-setting">
            <label>Cor Final:</label>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" id="gradient-end-color" value="${this.gradientTool.endColor}">
                <span id="end-color-preview" style="width: 30px; height: 20px; background: ${this.gradientTool.endColor}; border: 1px solid #ccc;"></span>
                <input type="text" id="gradient-end-hex" value="${this.gradientTool.endColor}" style="width: 80px; font-family: monospace;">
            </div>
        </div>
        <div class="tool-setting">
            <label>Ângulo:</label>
            <input type="range" id="gradient-angle" min="0" max="360" value="${this.gradientTool.angle}">
            <span id="gradient-angle-value">${this.gradientTool.angle}°</span>
        </div>
        <div class="tool-setting">
            <label>
                <input type="checkbox" id="gradient-reverse" ${this.gradientTool.reverse ? 'checked' : ''}>
                Inverter direção
            </label>
        </div>
        <div class="tool-setting">
            <button onclick="applyQuickGradient()" style="width: 100%; padding: 5px; background: #4CAF50; color: white; border: none; border-radius: 4px;">
                <i class="fas fa-bolt"></i> Apply Fast Gradient
            </button>
        </div>
    `;
    
    document.querySelector('.tools-panel')?.appendChild(panel);
    
    // Add extra listeners
    setTimeout(() => {
        const startHex = document.getElementById('gradient-start-hex');
        const endHex = document.getElementById('gradient-end-hex');
        
        if (startHex) {
            startHex.addEventListener('change', (e) => {
                if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                    this.gradientTool.startColor = e.target.value;
                    document.getElementById('gradient-start-color').value = e.target.value;
                    document.getElementById('start-color-preview').style.background = e.target.value;
                }
            });
        }
        
        if (endHex) {
            endHex.addEventListener('change', (e) => {
                if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(e.target.value)) {
                    this.gradientTool.endColor = e.target.value;
                    document.getElementById('gradient-end-color').value = e.target.value;
                    document.getElementById('end-color-preview').style.background = e.target.value;
                }
            });
        }
    }, 100);
}
    
    createStampSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings stamp-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Padrão:</label>
                <select id="stamp-pattern">
                    <option value="circle">Círculo</option>
                    <option value="square">Quadrado</option>
                    <option value="star">Estrela</option>
                    <option value="heart">Coração</option>
                </select>
            </div>
            <div class="tool-setting">
                <label>Tamanho:</label>
                <input type="range" id="stamp-size" min="1" max="10" value="${this.stampTool.size}">
                <span id="stamp-size-value">${this.stampTool.size}</span>
            </div>
            <div class="tool-setting">
                <label>Espaçamento:</label>
                <input type="range" id="stamp-spacing" min="1" max="10" value="${this.stampTool.spacing}">
                <span id="stamp-spacing-value">${this.stampTool.spacing}</span>
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    createDitherSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings dither-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Padrão:</label>
                <select id="dither-pattern">
                    <option value="checker">Xadrez</option>
                    <option value="dots">Pontos</option>
                    <option value="lines">Linhas</option>
                </select>
            </div>
            <div class="tool-setting">
                <label>Tamanho:</label>
                <input type="range" id="dither-size" min="1" max="8" value="${this.ditherTool.size}">
                <span id="dither-size-value">${this.ditherTool.size}</span>
            </div>
            <div class="tool-setting colors">
                <label>Cores:</label>
                <input type="color" id="dither-color1" value="${this.ditherTool.colors[0]}">
                <input type="color" id="dither-color2" value="${this.ditherTool.colors[1]}">
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    createGlowSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings glow-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Raio:</label>
                <input type="range" id="glow-radius" min="1" max="10" value="${this.glowTool.radius}">
                <span id="glow-radius-value">${this.glowTool.radius}</span>
            </div>
            <div class="tool-setting">
                <label>Intensidade:</label>
                <input type="range" id="glow-intensity" min="0" max="100" value="${this.glowTool.intensity * 100}">
                <span id="glow-intensity-value">${Math.round(this.glowTool.intensity * 100)}%</span>
            </div>
            <div class="tool-setting">
                <label>Cor:</label>
                <input type="color" id="glow-color" value="${this.glowTool.color}">
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    createNoiseSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings noise-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Intensidade:</label>
                <input type="range" id="noise-intensity" min="1" max="50" value="${this.noiseTool.intensity}">
                <span id="noise-intensity-value">${this.noiseTool.intensity}</span>
            </div>
            <div class="tool-setting">
                <label>
                    <input type="checkbox" id="noise-monochrome" ${this.noiseTool.monochrome ? 'checked' : ''}>
                    Monocromático
                </label>
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    createTextureSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings texture-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Padrão:</label>
                <select id="texture-pattern">
                    <option value="canvas">Tela</option>
                    <option value="paper">Papel</option>
                    <option value="metal">Metal</option>
                    <option value="wood">Madeira</option>
                </select>
            </div>
            <div class="tool-setting">
                <label>Escala:</label>
                <input type="range" id="texture-scale" min="1" max="10" value="${this.textureTool.scale}">
                <span id="texture-scale-value">${this.textureTool.scale}</span>
            </div>
            <div class="tool-setting">
                <label>Opacidade:</label>
                <input type="range" id="texture-opacity" min="0" max="100" value="${this.textureTool.opacity * 100}">
                <span id="texture-opacity-value">${Math.round(this.textureTool.opacity * 100)}%</span>
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    createWarpSettings() {
        const panel = document.createElement('div');
        panel.className = 'tool-settings warp-settings';
        panel.style.display = 'none';
        panel.innerHTML = `
            <div class="tool-setting">
                <label>Força:</label>
                <input type="range" id="warp-strength" min="1" max="20" value="${this.warpTool.strength}">
                <span id="warp-strength-value">${this.warpTool.strength}</span>
            </div>
            <div class="tool-setting">
                <label>Tamanho do Pincel:</label>
                <input type="range" id="warp-brush-size" min="1" max="20" value="${this.warpTool.brushSize}">
                <span id="warp-brush-size-value">${this.warpTool.brushSize}</span>
            </div>
        `;
        
        document.querySelector('.tools-panel')?.appendChild(panel);
    }
    
    setupNewToolsListeners() {
        this.setupBlurListeners();
        this.setupGradientListeners();
        this.setupStampListeners();
        this.setupDitherListeners();
        this.setupGlowListeners();
        this.setupNoiseListeners();
        this.setupTextureListeners();
        this.setupWarpListeners();
    }
    
    setupBlurListeners() {
        const radiusInput = document.getElementById('blur-radius');
        const intensityInput = document.getElementById('blur-intensity');
        
        if (radiusInput) {
            radiusInput.addEventListener('input', (e) => {
                this.blurTool.radius = parseInt(e.target.value);
                document.getElementById('blur-radius-value').textContent = this.blurTool.radius;
            });
        }
        
        if (intensityInput) {
            intensityInput.addEventListener('input', (e) => {
                this.blurTool.intensity = parseInt(e.target.value);
                document.getElementById('blur-intensity-value').textContent = this.blurTool.intensity;
            });
        }
    }
    
    setupGradientListeners() {
    const typeSelect = document.getElementById('gradient-type');
    const startColorInput = document.getElementById('gradient-start-color');
    const endColorInput = document.getElementById('gradient-end-color');
    const angleInput = document.getElementById('gradient-angle');
    const reverseCheckbox = document.getElementById('gradient-reverse');
    
    if (typeSelect) {
        typeSelect.value = this.gradientTool.type;
        typeSelect.addEventListener('change', (e) => {
            this.gradientTool.type = e.target.value;
            console.log('Gradient type changed to:', e.target.value);
        });
    }
    
    if (startColorInput) {
        startColorInput.value = this.gradientTool.startColor;
        startColorInput.addEventListener('input', (e) => {
            this.gradientTool.startColor = e.target.value;
            console.log('Initial color changed to:', e.target.value);
            
           
            if (this.isDrawing && this.currentTool === 'gradient') {
                this.updateCanvas();
                this.drawGradientPreview(this.shapeStartX, this.shapeStartY, this.lastX, this.lastY);
            }
        });
    }
    
    if (endColorInput) {
        endColorInput.value = this.gradientTool.endColor;
        endColorInput.addEventListener('input', (e) => {
            this.gradientTool.endColor = e.target.value;
            console.log('Final color changed to:', e.target.value);
            
            if (this.isDrawing && this.currentTool === 'gradient') {
                this.updateCanvas();
                this.drawGradientPreview(this.shapeStartX, this.shapeStartY, this.lastX, this.lastY);
            }
        });
    }
    
    if (angleInput) {
        angleInput.value = this.gradientTool.angle;
        angleInput.addEventListener('input', (e) => {
            this.gradientTool.angle = parseInt(e.target.value);
            document.getElementById('gradient-angle-value').textContent = this.gradientTool.angle + '°';
            console.log('Angle changed to:', this.gradientTool.angle);
        });
    }
    
   
    if (!reverseCheckbox) {

        const gradientSettings = document.querySelector('.gradient-settings');
        if (gradientSettings) {
            const reverseDiv = document.createElement('div');
            reverseDiv.className = 'tool-setting';
            reverseDiv.innerHTML = `
                <label>
                    <input type="checkbox" id="gradient-reverse" ${this.gradientTool.reverse ? 'checked' : ''}>
                    Inverter direção
                </label>
            `;
            gradientSettings.appendChild(reverseDiv);
            
            document.getElementById('gradient-reverse').addEventListener('change', (e) => {
                this.gradientTool.reverse = e.target.checked;
                console.log('Inverted gradient:', this.gradientTool.reverse);
            });
        }
    }
}
    
    setupStampListeners() {
        const patternSelect = document.getElementById('stamp-pattern');
        const sizeInput = document.getElementById('stamp-size');
        const spacingInput = document.getElementById('stamp-spacing');
        
        if (patternSelect) {
            patternSelect.addEventListener('change', (e) => {
                this.stampTool.pattern = e.target.value;
            });
        }
        
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                this.stampTool.size = parseInt(e.target.value);
                document.getElementById('stamp-size-value').textContent = this.stampTool.size;
            });
        }
        
        if (spacingInput) {
            spacingInput.addEventListener('input', (e) => {
                this.stampTool.spacing = parseInt(e.target.value);
                document.getElementById('stamp-spacing-value').textContent = this.stampTool.spacing;
            });
        }
    }
    
    
    
    
    setupDitherListeners() {
        const patternSelect = document.getElementById('dither-pattern');
        const sizeInput = document.getElementById('dither-size');
        const color1 = document.getElementById('dither-color1');
        const color2 = document.getElementById('dither-color2');
        
        if (patternSelect) {
            patternSelect.addEventListener('change', (e) => {
                this.ditherTool.pattern = e.target.value;
            });
        }
        
        if (sizeInput) {
            sizeInput.addEventListener('input', (e) => {
                this.ditherTool.size = parseInt(e.target.value);
                document.getElementById('dither-size-value').textContent = this.ditherTool.size;
            });
        }
        
        if (color1) {
            color1.addEventListener('input', (e) => {
                this.ditherTool.colors[0] = e.target.value;
            });
        }
        
        if (color2) {
            color2.addEventListener('input', (e) => {
                this.ditherTool.colors[1] = e.target.value;
            });
        }
    }
    
    setupGlowListeners() {
    console.log('Setting up brightness listeners...');
    
    // Ray of brilliance
    const radiusInput = document.getElementById('glow-radius');
    if (radiusInput) {
        console.log('Found: glow-radius');
        radiusInput.value = this.glowTool.radius;
        radiusInput.addEventListener('input', (e) => {
            this.glowTool.radius = parseInt(e.target.value);
            const valueElement = document.getElementById('glow-radius-value');
            if (valueElement) {
                valueElement.textContent = this.glowTool.radius;
            }
            console.log('Updated brightness ray:', this.glowTool.radius);
        });
    } else {
        console.error('Glow-radius element not found!');
    }
    
    // Brightness intensity
    const intensityInput = document.getElementById('glow-intensity');
    if (intensityInput) {
        console.log('Found: glow-intensity');
        intensityInput.value = this.glowTool.intensity * 100;
        intensityInput.addEventListener('input', (e) => {
            this.glowTool.intensity = parseInt(e.target.value) / 100;
            const valueElement = document.getElementById('glow-intensity-value');
            if (valueElement) {
                valueElement.textContent = Math.round(this.glowTool.intensity * 100) + '%';
            }
            console.log('Updated brightness intensity:', this.glowTool.intensity);
        });
    } else {
        console.error('Glow-intensity element not found.!');
    }
    
    // Glow color
    const colorInput = document.getElementById('glow-color');
    if (colorInput) {
        console.log('Found: glow-color');
        colorInput.value = this.glowTool.color;
        colorInput.addEventListener('input', (e) => {
            this.glowTool.color = e.target.value;
            console.log('Updated brightness color:', this.glowTool.color);
        });
    } else {
        console.error('Glow-color element not found!');
    }
}
    
    setupNoiseListeners() {
        const intensityInput = document.getElementById('noise-intensity');
        const monochromeInput = document.getElementById('noise-monochrome');
        
        if (intensityInput) {
            intensityInput.addEventListener('input', (e) => {
                this.noiseTool.intensity = parseInt(e.target.value);
                document.getElementById('noise-intensity-value').textContent = this.noiseTool.intensity;
            });
        }
        
        if (monochromeInput) {
            monochromeInput.addEventListener('change', (e) => {
                this.noiseTool.monochrome = e.target.checked;
            });
        }
    }
    
    setupTextureListeners() {
        const patternSelect = document.getElementById('texture-pattern');
        const scaleInput = document.getElementById('texture-scale');
        const opacityInput = document.getElementById('texture-opacity');
        
        if (patternSelect) {
            patternSelect.addEventListener('change', (e) => {
                this.textureTool.pattern = e.target.value;
            });
        }
        
        if (scaleInput) {
            scaleInput.addEventListener('input', (e) => {
                this.textureTool.scale = parseInt(e.target.value);
                document.getElementById('texture-scale-value').textContent = this.textureTool.scale;
            });
        }
        
        if (opacityInput) {
            opacityInput.addEventListener('input', (e) => {
                this.textureTool.opacity = parseInt(e.target.value) / 100;
                document.getElementById('texture-opacity-value').textContent = Math.round(this.textureTool.opacity * 100) + '%';
            });
        }
    }
    
    setupWarpListeners() {
        const strengthInput = document.getElementById('warp-strength');
        const brushSizeInput = document.getElementById('warp-brush-size');
        
        if (strengthInput) {
            strengthInput.addEventListener('input', (e) => {
                this.warpTool.strength = parseInt(e.target.value);
                document.getElementById('warp-strength-value').textContent = this.warpTool.strength;
            });
        }
        
        if (brushSizeInput) {
            brushSizeInput.addEventListener('input', (e) => {
                this.warpTool.brushSize = parseInt(e.target.value);
                document.getElementById('warp-brush-size-value').textContent = this.warpTool.brushSize;
            });
        }
    }
    
    showToolSettings(tool) {
        document.querySelectorAll('.tool-settings').forEach(panel => {
            panel.style.display = 'none';
        });
        
        const panel = document.querySelector(`.${tool}-settings`);
        if (panel) {
            panel.style.display = 'block';
        }
    }

    // ========== CORRECTED RECTANGULAR SELECTION ==========
  initSelectionTool() {
    this.setupSelectionToolsUI(); // Create the buttons
    this.setupSelectionEventListeners(); // Mouse + touch events
}

setupSelectionEventListeners() {
    // Mouse (desktop)
    this.canvas.addEventListener('mousedown', (e) => this.handleSelectionMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleSelectionMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleSelectionMouseUp());
    
    // Touch (mobile) – converts touch to mouse events
    this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        }
    });
    
    this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        }
    });
    
    this.canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.handleSelectionMouseUp();
    });
}
    

handleSelectionMouseDown(e) {
    if (this.currentTool !== 'selection') return;
    
    const coords = this.getCanvasCoordinates(e);
    

    if (this.selection.active && this.selection.isMoving) {
        this.startMovingSelection(e);
        return;
    }

    if (this.selection.active) {
        const handle = this.checkResizeHandle(coords.x, coords.y);
        if (handle !== null) {
            this.startResizingSelection(coords.x, coords.y, handle);
            return;
        }
        
        if (this.isPointInSelection(coords.x, coords.y)) {
            this.startMovingSelection(e);
            return;
        }
    }
    
    this.startSelection(coords.x, coords.y);
}

handleSelectionMouseMove(e) {
    if (this.currentTool !== 'selection') return;
    
    const coords = this.getCanvasCoordinates(e);
    
    // Dynamic cursor
    if (this.selection.active) {
        const handle = this.checkResizeHandle(coords.x, coords.y);
        if (handle !== null) {
            this.canvas.style.cursor = this.getResizeCursor(handle);
        } else if (this.isPointInSelection(coords.x, coords.y)) {
            this.canvas.style.cursor = 'move';
        } else {
            this.canvas.style.cursor = 'crosshair';
        }
    }
    
    // Updates in progress
    if (this.selection.drawing) {
        this.updateSelectionDrawing(coords.x, coords.y);
    } else if (this.selection.isMoving) {
        this.updateSelectionMoving(coords.x, coords.y);
    } else if (this.selection.isResizing) {
        this.updateSelectionResizing(coords.x, coords.y);
    }
}


handleSelectionMouseUp() {
    if (this.currentTool !== 'selection') return;
    
    if (this.selection.drawing) {
        this.finishSelection();
    }
    

    if (this.selection.isMoving) {
        this.applySelectionMove();
    }
    
    this.selection.isMoving = false;
    this.selection.isResizing = false;
    this.selection.resizingHandle = null;
    
    this.canvas.style.cursor = 'default';
    
    this.updateCanvas();
}

applySelectionMove() {
    if (!this.selection.active || !this.selection.contentCanvas) return;
    
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    

    currentLayer.ctx.clearRect(
        this.selection.originalX, this.selection.originalY,
        this.selection.width, this.selection.height
    );
    
    
    currentLayer.ctx.drawImage(
        this.selection.contentCanvas,
        this.selection.x, this.selection.y
    );
    
    this.captureSelectionContent();
}
    
    startSelection(x, y) {
        this.selection.drawing = true;
        this.selection.startX = x;
        this.selection.startY = y;
        this.selection.x = x;
        this.selection.y = y;
        this.selection.width = 0;
        this.selection.height = 0;
        
        this.saveState();
        this.updateCanvas();
    }
    
    updateSelectionDrawing(x, y) {
        if (!this.selection.drawing) return;
        
        const minX = Math.min(this.selection.startX, x);
        const minY = Math.min(this.selection.startY, y);
        const maxX = Math.max(this.selection.startX, x);
        const maxY = Math.max(this.selection.startY, y);
        
        this.selection.x = minX;
        this.selection.y = minY;
        this.selection.width = maxX - minX;
        this.selection.height = maxY - minY;
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }
    
    finishSelection() {
        this.selection.drawing = false;
        
        if (this.selection.width > 0 && this.selection.height > 0) {
            this.selection.active = true;
            this.captureSelectionContent();
            this.showSelectionTools(true);
        } else {
            this.clearSelection();
        }
        
        this.updateCanvas();
    }
    
    drawSelectionOverlay() {
    if (!this.selection.active && !this.selection.drawing) return;
    
    const overlay = this.getSelectionOverlay();
    if (!overlay) return;
    
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    if (this.selection.drawing || this.selection.active) {

        const canvasRect = this.canvas.getBoundingClientRect();
        const container = document.querySelector('.canvas-container');
        const containerRect = container.getBoundingClientRect();
        
        // Calculate the actual offset considering the pan and zoom.
        const offsetX = canvasRect.left - containerRect.left;
        const offsetY = canvasRect.top - containerRect.top;
        
        // Draws a selection rectangle with the coordinates.
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        
        const x = offsetX + (this.selection.x * this.pixelSize * this.zoom);
        const y = offsetY + (this.selection.y * this.pixelSize * this.zoom);
        const width = this.selection.width * this.pixelSize * this.zoom;
        const height = this.selection.height * this.pixelSize * this.zoom;
        
        ctx.strokeRect(x + 0.5, y + 0.5, width, height);
        
        // Draw resizing handles
        if (this.selection.active) {
            ctx.setLineDash([]);
            ctx.fillStyle = '#00FF00';
            
            const handles = this.getResizeHandles();
            handles.forEach(handle => {
                const handleX = offsetX + handle.x;
                const handleY = offsetY + handle.y;
                ctx.fillRect(handleX - 3, handleY - 3, 6, 6);
            });
        }
    }
}

getSelectionOverlay() {
    const container = document.querySelector('.canvas-container');
    if (!container) return null;
    
    if (!this.selection.overlay) {
        const overlay = document.createElement('canvas');
        overlay.className = 'selection-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '10';
        container.appendChild(overlay);
        this.selection.overlay = overlay;
    }
    
    // ALWAYS update the overlay size
    const containerRect = container.getBoundingClientRect();
    this.selection.overlay.width = containerRect.width;
    this.selection.overlay.height = containerRect.height;
    this.selection.overlay.style.width = containerRect.width + 'px';
    this.selection.overlay.style.height = containerRect.height + 'px';
    
    return this.selection.overlay;
}



    getResizeHandles() {
        const x = this.selection.x * this.pixelSize * this.zoom;
        const y = this.selection.y * this.pixelSize * this.zoom;
        const width = this.selection.width * this.pixelSize * this.zoom;
        const height = this.selection.height * this.pixelSize * this.zoom;
        
        return [
            { x: x, y: y }, // top-left
            { x: x + width / 2, y: y }, // top-center
            { x: x + width, y: y }, // top-right
            { x: x, y: y + height / 2 }, // middle-left
            { x: x + width, y: y + height / 2 }, // middle-right
            { x: x, y: y + height }, // bottom-left
            { x: x + width / 2, y: y + height }, // bottom-center
            { x: x + width, y: y + height } // bottom-right
        ];
    }
    
    checkResizeHandle(x, y) {
        if (!this.selection.active) return null;
        
        const pixelX = x * this.pixelSize * this.zoom;
        const pixelY = y * this.pixelSize * this.zoom;
        const handles = this.getResizeHandles();
        
        for (let i = 0; i < handles.length; i++) {
            const handle = handles[i];
            const distance = Math.sqrt(
                Math.pow(pixelX - handle.x, 2) + 
                Math.pow(pixelY - handle.y, 2)
            );
            
            if (distance <= 6) {
                return i;
            }
        }
        
        return null;
    }
    
    getResizeCursor(handleIndex) {
        switch(handleIndex) {
            case 0: return 'nw-resize';
            case 1: return 'n-resize';
            case 2: return 'ne-resize';
            case 3: return 'w-resize';
            case 4: return 'e-resize';
            case 5: return 'sw-resize';
            case 6: return 's-resize';
            case 7: return 'se-resize';
            default: return 'default';
        }
    }
    
    startResizingSelection(x, y) {
        this.selection.isResizing = true;
        this.selection.resizingHandle = this.checkResizeHandle(x, y);
        this.selection.moveStartX = x;
        this.selection.moveStartY = y;
        this.selection.originalRect = {
            x: this.selection.x,
            y: this.selection.y,
            width: this.selection.width,
            height: this.selection.height
        };
        
        this.saveState();
    }
    
    updateSelectionResizing(x, y) {
        if (!this.selection.isResizing || this.selection.resizingHandle === null) return;
        
        const deltaX = x - this.selection.moveStartX;
        const deltaY = y - this.selection.moveStartY;
        
        const original = this.selection.originalRect;
        
        switch(this.selection.resizingHandle) {
            case 0: // top-left
                this.selection.x = original.x + deltaX;
                this.selection.y = original.y + deltaY;
                this.selection.width = original.width - deltaX;
                this.selection.height = original.height - deltaY;
                break;
            case 1: // top-center
                this.selection.y = original.y + deltaY;
                this.selection.height = original.height - deltaY;
                break;
            case 2: // top-right
                this.selection.y = original.y + deltaY;
                this.selection.width = original.width + deltaX;
                this.selection.height = original.height - deltaY;
                break;
            case 3: // middle-left
                this.selection.x = original.x + deltaX;
                this.selection.width = original.width - deltaX;
                break;
            case 4: // middle-right
                this.selection.width = original.width + deltaX;
                break;
            case 5: // bottom-left
                this.selection.x = original.x + deltaX;
                this.selection.width = original.width - deltaX;
                this.selection.height = original.height + deltaY;
                break;
            case 6: // bottom-center
                this.selection.height = original.height + deltaY;
                break;
            case 7: // bottom-right
                this.selection.width = original.width + deltaX;
                this.selection.height = original.height + deltaY;
                break;
        }
        
        if (this.selection.width < 1) this.selection.width = 1;
        if (this.selection.height < 1) this.selection.height = 1;
        
        this.selection.x = Math.max(0, Math.min(this.canvasSize - 1, this.selection.x));
        this.selection.y = Math.max(0, Math.min(this.canvasSize - 1, this.selection.y));
        this.selection.width = Math.min(this.canvasSize - this.selection.x, this.selection.width);
        this.selection.height = Math.min(this.canvasSize - this.selection.y, this.selection.height);
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }
    
    startMovingSelection(e) {
    const coords = this.getCanvasCoordinates(e);
    
    this.selection.isMoving = true;
    this.selection.moveStartX = coords.x;
    this.selection.moveStartY = coords.y;
    this.selection.originalX = this.selection.x;
    this.selection.originalY = this.selection.y;
    
    this.saveState();
    
    // Change cursor
    this.canvas.style.cursor = 'grabbing';
}
    
    updateSelectionMoving(x, y) {
        if (!this.selection.isMoving) return;
        
        const deltaX = x - this.selection.moveStartX;
        const deltaY = y - this.selection.moveStartY;
        
        this.selection.x = Math.max(0, Math.min(this.canvasSize - this.selection.width, 
            this.selection.originalX + deltaX));
        this.selection.y = Math.max(0, Math.min(this.canvasSize - this.selection.height,
            this.selection.originalY + deltaY));
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }
    
    isPointInSelection(x, y) {
        return x >= this.selection.x && 
               x <= this.selection.x + this.selection.width &&
               y >= this.selection.y && 
               y <= this.selection.y + this.selection.height;
    }
    
    captureSelectionContent() {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = Math.max(1, this.selection.width);
        tempCanvas.height = Math.max(1, this.selection.height);
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(
            currentLayer.canvas,
            this.selection.x, this.selection.y,
            this.selection.width, this.selection.height,
            0, 0,
            this.selection.width, this.selection.height
        );
        
        this.selection.contentCanvas = tempCanvas;
        this.selection.contentCtx = tempCtx;
    }
    

setupSelectionToolsUI() {
    const workspaceControls = document.querySelector('.workspace-controls');
    if (!workspaceControls) return;
    
    let selectionTools = document.querySelector('.selection-tools');
    if (selectionTools) selectionTools.remove();
    
    selectionTools = document.createElement('div');
    selectionTools.className = 'selection-tools';
    selectionTools.style.display = 'none';
    selectionTools.style.position = 'fixed';
    selectionTools.style.top = '10px';
    selectionTools.style.right = '10px';
    selectionTools.style.background = '#2d2d2d';
    selectionTools.style.padding = '8px';
    selectionTools.style.borderRadius = '8px';
    selectionTools.style.zIndex = '1000';
    selectionTools.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    selectionTools.style.gap = '5px';
    selectionTools.style.flexWrap = 'wrap';
    
    selectionTools.innerHTML = `
        <button class="btn-small" onclick="copySelection()" title="Ctrl+C">
            <i class="fas fa-copy"></i> Copiar
        </button>
        <button class="btn-small" onclick="pasteSelection()" title="Ctrl+V">
            <i class="fas fa-paste"></i> Colar
        </button>
        <button class="btn-small" onclick="cutSelection()" title="Ctrl+X">
            <i class="fas fa-cut"></i> Recortar
        </button>
        <button class="btn-small" onclick="deleteSelection()" title="Delete">
            <i class="fas fa-trash"></i> Apagar
        </button>
        <button class="btn-small" onclick="clearSelection()" title="Esc">
            <i class="fas fa-times"></i> Cancelar
        </button>
        <div style="width: 100%; height: 1px; background: #555; margin: 5px 0;"></div>
        <button class="btn-small" onclick="flipSelectionHorizontal()" title="Flip Horizontal">
            <i class="fas fa-arrows-alt-h"></i> Horizontal
        </button>
        <button class="btn-small" onclick="flipSelectionVertical()" title="Flip Vertical">
            <i class="fas fa-arrows-alt-v"></i> Vertical
        </button>
        <button class="btn-small" onclick="rotateSelection90()" title="Rotate 90°">
            <i class="fas fa-redo"></i> Girar 90°
        </button>
    `;
    
    document.body.appendChild(selectionTools);
    this.selection.tools = selectionTools;
}
    
    showSelectionTools(show) {
        if (this.selection.tools) {
            this.selection.tools.style.display = show ? 'flex' : 'none';
        }
    }

    // ========== SELECTION FUNCTIONS (ORIGINALS) ==========

copySelection() {
    if (!this.selection.active || !this.selection.contentCanvas) {
        this.showNotification('No selections to copy!', 'error');
        return;
    }
    
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.selection.width;
    tempCanvas.height = this.selection.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Copy the selection content directly from the contentCanvas.
    if (this.selection.contentCanvas) {
        tempCtx.drawImage(this.selection.contentCanvas, 0, 0);
        
        // Save to clipboard
        this.selection.clipboard = {
            canvas: tempCanvas,
            width: this.selection.width,
            height: this.selection.height,
            
            timestamp: Date.now()
        };
        
        this.showNotification(`Copied selection (${this.selection.width}x${this.selection.height})!`);
    } else {
        this.showNotification('Error: No content in the selection!', 'error');
    }
}
    
    
pasteSelection() {
    if (!this.selection.clipboard) {
        this.showNotification('Nothing to paste! Copy something first.', 'error');
        return;
    }
    
    
    if (this.selection.active) {
        this.clearSelection();
    }
    
    // Save state to history
    this.saveState();
    
    // Enable selection
    this.selection.active = true;
    
    // Position in the center of the canvas
    this.selection.x = Math.max(0, Math.floor(this.canvasSize / 2 - this.selection.clipboard.width / 2));
    this.selection.y = Math.max(0, Math.floor(this.canvasSize / 2 - this.selection.clipboard.height / 2));
    this.selection.width = this.selection.clipboard.width;
    this.selection.height = this.selection.clipboard.height;
    
    // Create a new canvas for the content.
    this.selection.contentCanvas = document.createElement('canvas');
    this.selection.contentCanvas.width = this.selection.width;
    this.selection.contentCanvas.height = this.selection.height;
    this.selection.contentCtx = this.selection.contentCanvas.getContext('2d');
    

    this.selection.contentCtx.drawImage(this.selection.clipboard.canvas, 0, 0);
    
    // Show the selection pasted onto the main canvas.
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    // Draw the selection on the main canvas.
    currentLayer.ctx.drawImage(
        this.selection.contentCanvas,
        this.selection.x,
        this.selection.y
    );
    
    // Show selection tools
    this.showSelectionTools(true);
    
    // Update view
    this.updateCanvas();
    this.drawSelectionOverlay();
    
    this.showNotification('Selection pasted! Drag to move.');
    
    // Switch to selection tool automatically
    this.selectTool('selection');
}
    
    cutSelection() {
        if (!this.selection.active) {
            this.showNotification('No selection to cut out!', 'error');
            return;
        }
        
        this.copySelection();
        this.deleteSelection();
    }
    
    deleteSelection() {
        if (!this.selection.active) {
            this.showNotification('No selections to delete!', 'error');
            return;
        }
        
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        currentLayer.ctx.clearRect(
            this.selection.x, this.selection.y,
            this.selection.width, this.selection.height
        );
        
        this.updateCanvas();
        this.clearSelection();
    }
    
    clearSelection() {
        this.selection.active = false;
        this.selection.drawing = false;
        this.selection.isMoving = false;
        this.selection.isResizing = false;
        this.selection.resizingHandle = null;
        
        this.showSelectionTools(false);
        
        if (this.selection.overlay) {
            this.selection.overlay.remove();
            this.selection.overlay = null;
        }
        
        this.updateCanvas();
    }
    
    nudgeSelection(dx, dy) {
        if (!this.selection.active) return;
        
        this.selection.x = Math.max(0, 
            Math.min(this.canvasSize - this.selection.width, this.selection.x + dx));
        this.selection.y = Math.max(0, 
            Math.min(this.canvasSize - this.selection.height, this.selection.y + dy));
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }
    
    flipSelectionHorizontal() {
        if (!this.selection.active || !this.selection.contentCanvas) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.selection.width;
        tempCanvas.height = this.selection.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.translate(this.selection.width, 0);
        tempCtx.scale(-1, 1);
        tempCtx.drawImage(this.selection.contentCanvas, 0, 0);
        
        this.selection.contentCanvas = tempCanvas;
        
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        currentLayer.ctx.clearRect(
            this.selection.x, this.selection.y,
            this.selection.width, this.selection.height
        );
        
        currentLayer.ctx.drawImage(
            this.selection.contentCanvas,
            this.selection.x, this.selection.y
        );
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }
    
    flipSelectionVertical() {
        if (!this.selection.active || !this.selection.contentCanvas) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.selection.width;
        tempCanvas.height = this.selection.height;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.translate(0, this.selection.height);
        tempCtx.scale(1, -1);
        tempCtx.drawImage(this.selection.contentCanvas, 0, 0);
        
        this.selection.contentCanvas = tempCanvas;
        
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        currentLayer.ctx.clearRect(
            this.selection.x, this.selection.y,
            this.selection.width, this.selection.height
        );
        
        currentLayer.ctx.drawImage(
            this.selection.contentCanvas,
            this.selection.x, this.selection.y
        );
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }
    
    rotateSelection90() {
        if (!this.selection.active || !this.selection.contentCanvas) return;
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.selection.height;
        tempCanvas.height = this.selection.width;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.translate(this.selection.height / 2, this.selection.width / 2);
        tempCtx.rotate(Math.PI / 2);
        tempCtx.drawImage(
            this.selection.contentCanvas,
            -this.selection.width / 2,
            -this.selection.height / 2
        );
        
        this.selection.contentCanvas = tempCanvas;
        
        const oldWidth = this.selection.width;
        const oldHeight = this.selection.height;
        this.selection.width = oldHeight;
        this.selection.height = oldWidth;
        
        this.selection.x = Math.max(0, 
            Math.min(this.canvasSize - this.selection.width, 
            this.selection.x - (this.selection.width - oldWidth) / 2));
        this.selection.y = Math.max(0, 
            Math.min(this.canvasSize - this.selection.height,
            this.selection.y - (this.selection.height - oldHeight) / 2));
        
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        currentLayer.ctx.clearRect(
            this.selection.x, this.selection.y,
            Math.max(oldWidth, this.selection.width),
            Math.max(oldHeight, this.selection.height)
        );
        
        currentLayer.ctx.drawImage(
            this.selection.contentCanvas,
            this.selection.x, this.selection.y
        );
        
        this.updateCanvas();
        this.drawSelectionOverlay();
    }

    // ========== BASIC DRAWING FUNCTIONS (ORIGINAL) ==========
    startDrawing(e) {
  
    if (!this.canDraw(e)) {
        return;
    }
    
    if (this.needsPreview(this.currentTool)) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);
        this.shapeStartX = coords.x;
        this.shapeStartY = coords.y;
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        
        this.showPreview(this.currentTool, coords.x, coords.y);
        
        this.saveState();
        return;
    }
    
    
    
    
    if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
        this.isDrawing = true;
        
        const coords = this.getCanvasCoordinates(e);
        
        // Use the SPECIFIC variables of the pencil.
        this.pencilLastX = coords.x;
        this.pencilLastY = coords.y;
        
        // The general variables can also be updated.
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        this.drawPixel(coords.x, coords.y);
        
        this.saveState();
        return;
    }
    
    
    
    
    
    // For gradient tool
    if (this.currentTool === 'gradient') {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);
        this.shapeStartX = coords.x;
        this.shapeStartY = coords.y;
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        // Enable preview
        this.showPreview('gradient', coords.x, coords.y);
        
        this.saveState();
        return;
    }
    

    
    // For geometric shape tools
    if (['rectangle', 'triangle', 'polygon', 'ellipse', 'star', 'heart', 'arrow', 'cross'].includes(this.currentTool)) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);
        this.shapeStartX = coords.x;
        this.shapeStartY = coords.y;
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        this.saveState();
        return;
    }


    
    if (this.currentTool === 'fill') {
        console.log('Flood fill activated');
        const coords = this.getCanvasCoordinates(e);
        console.log('Coordinates:', coords.x, coords.y);
        console.log('Current color:', this.currentColor);
        this.floodFill(coords.x, coords.y);
        return;
    }

    // VERIFICATION: If PAN is active, NEVER draw.
    if (this.pan.isActive) {
        return; 
    }
    

    if (this.needsPreview(this.currentTool)) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(e);
        this.shapeStartX = coords.x;
        this.shapeStartY = coords.y;
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        // Enable preview
        this.showPreview(this.currentTool, coords.x, coords.y);
        
        this.saveState();
        return;
    }
    
    

        if (this.currentTool === 'picker') {
            this.pickColor(e);
            return;
        }
        
        if (this.currentTool === 'selection') {
            return;
        }
        
     
if (['rectangle', 'triangle', 'polygon', 'ellipse', 'star', 'heart', 'arrow', 'cross'].includes(this.currentTool)) {
    // Check if you are clicking on an existing shape.
    const shape = this.selectShape(coords.x, coords.y);
    if (shape) {
        // Start movemento/resizing
        this.startShapeManipulation(coords.x, coords.y, shape);
        return;
    }
    
    // Otherwise, start designing a new shape.
    this.isDrawing = true;
    this.shapeStartX = coords.x;
    this.shapeStartY = coords.y;
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    // Enable preview
    this.showPreview(this.currentTool, coords.x, coords.y);
    this.saveState();
    return;
}
        
        
        
        // New tools
        if (this.tools[this.currentTool] && this.currentTool !== 'shape' && this.currentTool !== 'selection') {
            this.isDrawing = true;
            const coords = this.getCanvasCoordinates(e);
            this.lastX = coords.x;
            this.lastY = coords.y;
            
            this.saveState();
            
            switch(this.currentTool) {
                case 'blur':
                    this.applyBlur(coords.x, coords.y);
                    break;
                case 'gradient':
                    this.shapeStartX = coords.x;
                    this.shapeStartY = coords.y;
                    break;
                case 'stamp':
                    this.applyStamp(coords.x, coords.y);
                    break;
                case 'dither':
                    this.applyDither(coords.x, coords.y);
                    break;
                case 'glow':
                    this.applyGlow(coords.x, coords.y);
                    break;
                case 'noise':
                    this.applyNoise(coords.x, coords.y);
                    break;
                case 'texture':
                    this.applyTexture(coords.x, coords.y);
                    break;
                case 'warp':
                    this.applyWarp(coords.x, coords.y);
                    break;
                case 'colorReplace':
                    const oldColor = this.pickColorFromCanvas(coords.x, coords.y);
                    if (oldColor) {
                        this.replaceColor(oldColor, this.currentColor);
                    }
                    break;
               
            }
            
            return;
        }
        
        this.isDrawing = true;
        
        const coords = this.getCanvasCoordinates(e);
        this.lastX = coords.x;
        this.lastY = coords.y;

        this.saveState();

        if (this.currentTool === 'fill') {
            this.floodFill(coords.x, coords.y);
        } else if (this.currentTool === 'line') {
            this.shapeStartX = coords.x;
            this.shapeStartY = coords.y;
        } else {
            this.drawPixel(coords.x, coords.y);
        }

        this.updateCursorPosition(coords.x, coords.y);
    }

    draw(e) {
    // VERIFICATION: If PAN is active, NEVER draw.
    if (this.pan.isActive) {
        return;
    }
    

    if (!this.isDrawing) return;
    
    const coords = this.getCanvasCoordinates(e);
    
    // Update general coordinates (for other tools)
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    // Update preview for tools that need it.
    if (this.previewSystem.active) {
        this.updatePreview(coords.x, coords.y);
        return;
    }
    
    // For line tool
    if (this.currentTool === 'line') {
        this.updateCanvas();
        this.drawLinePreview(this.shapeStartX, this.shapeStartY, coords.x, coords.y);
        return;
    }
    
    // For gradient
    if (this.currentTool === 'gradient') {
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.updateCanvas();
        this.drawGradientPreview(this.shapeStartX, this.shapeStartY, coords.x, coords.y);
        return;
    }
    
    // For shape tools
    if (['rectangle', 'triangle', 'polygon', 'ellipse', 'star', 'heart', 'arrow', 'cross'].includes(this.currentTool)) {
        this.lastX = coords.x;
        this.lastY = coords.y;
        this.updateCanvas();
        this.drawShapePreview();
        return;
    }
    
    // for the pencil and eraser 
    if (this.currentTool === 'pencil' || this.currentTool === 'eraser') {
        if (this.drawStraightLine) {
            this.updateCanvas();
            this.drawLinePreview(this.shapeStartX || this.pencilLastX, 
                                this.shapeStartY || this.pencilLastY, 
                                coords.x, coords.y);
        } else {
            
            this.drawLine(this.pencilLastX, this.pencilLastY, coords.x, coords.y);
        }
        

        this.pencilLastX = coords.x;
        this.pencilLastY = coords.y;
        
        this.updateCursorPosition(coords.x, coords.y);
        return;
    }
    
    
    if (this.tools[this.currentTool] && 
        ['blur', 'stamp', 'dither', 'glow', 'noise', 'texture', 'warp'].includes(this.currentTool)) {
        switch(this.currentTool) {
            case 'blur':
                this.applyBlur(coords.x, coords.y);
                break;
            case 'stamp':
                this.applyStamp(coords.x, coords.y);
                break;
            case 'dither':
                this.applyDither(coords.x, coords.y);
                break;
            case 'glow':
                this.applyGlow(coords.x, coords.y);
                break;
            case 'noise':
                this.applyNoise(coords.x, coords.y);
                break;
            case 'texture':
                this.applyTexture(coords.x, coords.y);
                break;
            case 'warp':
                this.applyWarp(coords.x, coords.y);
                break;
        }
    }

    this.updateCursorPosition(coords.x, coords.y);
}
    
    
    
    showShapeTools(show) {
    const shapeTools = document.getElementById('shape-tools');
    if (!shapeTools) {

        this.createShapeToolsUI();
    }
    
    const tools = document.getElementById('shape-tools');
    if (tools) {
        tools.style.display = show ? 'flex' : 'none';
    }
}

createShapeToolsUI() {
    const workspaceControls = document.querySelector('.workspace-controls');
    if (!workspaceControls) return;
    
    const shapeTools = document.createElement('div');
    shapeTools.id = 'shape-tools';
    shapeTools.className = 'shape-tools';
    shapeTools.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: #2d2d2d;
        padding: 8px;
        border-radius: 8px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: none;
        flex-direction: column;
        gap: 5px;
    `;
    
    shapeTools.innerHTML = `
        <button class="btn-small" onclick="deleteActiveShape()" title="Delete">
            <i class="fas fa-trash"></i> Delete Shape
        </button>
        <button class="btn-small" onclick="duplicateShape()" title="Duplicate">
            <i class="fas fa-copy"></i> Duplicate
        </button>
        <button class="btn-small" onclick="toggleShapeFill()" title="Toggle Fill">
            <i class="fas fa-fill"></i> Toggle Fill
        </button>
        <button class="btn-small" onclick="changeShapeColor()" title="Change Color">
            <i class="fas fa-palette"></i> Change Color
        </button>
        <button class="btn-small" onclick="clearAllShapes()" title="Clear All">
            <i class="fas fa-times"></i> Clear All
        </button>
    `;
    
    document.body.appendChild(shapeTools);
}

    stopDrawing() {
    if (this.isDrawing) {
        // For shape tools
        if (['rectangle', 'circle', 'triangle', 'polygon', 'ellipse', 'star', 'heart', 'arrow', 'cross'].includes(this.currentTool)) {
            this.drawFinalShape();
        }
        
        if (this.currentTool === 'line') {
            this.drawFinalLine();
        } else if (this.currentTool === 'gradient') {
            this.drawFinalGradient();
        } else if (['rectangle', 'circle', 'triangle', 'polygon', 'ellipse', 'star', 'heart', 'arrow', 'cross'].includes(this.currentTool)) {
            this.drawFinalShape();
        } else if (this.currentTool === 'pencil' && this.drawStraightLine) {
            this.drawFinalStraightLine();
        }
    }
    
    this.isDrawing = false;
    this.drawStraightLine = false;
    
    // reset pencil variables
    this.pencilLastX = 0;
    this.pencilLastY = 0;
    
    // Hide preview if active
    if (this.previewSystem.active) {
        this.hidePreview();
    }
    
    this.updateCanvas();
}

selectShape(x, y) {
    // Check if you clicked on any form.
    for (let i = this.activeShapes.length - 1; i >= 0; i--) {
        const shape = this.activeShapes[i];
        if (this.isPointInShape(shape, x, y)) {
            this.activeShape = shape;
            this.showShapeTools(true);
            this.updateCanvas();
            return shape;
        }
    }
    this.activeShape = null;
    this.showShapeTools(false);
    return null;
}

isPointInShape(shape, x, y) {
    // Check if the point is inside the bounding box of the shape.
    const minX = Math.min(shape.x1, shape.x2);
    const minY = Math.min(shape.y1, shape.y2);
    const maxX = Math.max(shape.x1, shape.x2);
    const maxY = Math.max(shape.y1, shape.y2);
    
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

moveShape(shape, dx, dy) {
    shape.x1 += dx;
    shape.y1 += dy;
    shape.x2 += dx;
    shape.y2 += dy;
    
    // Redesign
    this.redrawAllShapes();
}

resizeShape(shape, handleIndex, dx, dy) {
    
    switch (handleIndex) {
        case 0: // top-left
            shape.x1 += dx;
            shape.y1 += dy;
            break;
        case 1: // top-center
            shape.y1 += dy;
            break;
        case 2: // top-right
            shape.x2 += dx;
            shape.y1 += dy;
            break;
        case 3: // middle-left
            shape.x1 += dx;
            break;
        case 4: // middle-right
            shape.x2 += dx;
            break;
        case 5: // bottom-left
            shape.x1 += dx;
            shape.y2 += dy;
            break;
        case 6: // bottom-center
            shape.y2 += dy;
            break;
        case 7: // bottom-right
            shape.x2 += dx;
            shape.y2 += dy;
            break;
    }
    
    this.redrawAllShapes();
}

redrawAllShapes() {
    // Clean canvas
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    currentLayer.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    
    // Redesign all forms
    this.activeShapes.forEach(shape => {
        this.drawShapePermanently(shape);
    });
    
    this.updateCanvas();
}




    drawPixel(x, y) {
        if (x < 0 || x >= this.canvasWidth || y < 0 || y >= this.canvasHeight) return;
        
        const frame = this.frames[this.currentFrameIndex];
        if (!frame || !frame.layers[this.currentLayerIndex]) return;
        
        const layer = frame.layers[this.currentLayerIndex];
        
        if (this.currentTool === 'pencil') {
            layer.ctx.fillStyle = this.currentColor;
            this.drawBrush(x, y, layer.ctx);
        } else if (this.currentTool === 'eraser') {
            this.drawEraserBrush(x, y, layer.ctx);
        }
        
        if (this.currentTool === 'pencil') {
            this.ctx.fillStyle = this.currentColor;
            this.drawBrush(x, y, this.ctx);
        } else if (this.currentTool === 'eraser') {
            this.drawEraserBrush(x, y, this.ctx);
        }
    }

    drawBrush(x, y, context) {
    if (this.brushSize === 1) {
        context.fillRect(x, y, 1, 1);
    } else {
        const halfSize = Math.ceil((this.brushSize - 1) / 2);
        const start = -Math.floor(this.brushSize / 2);
        const end = Math.ceil(this.brushSize / 2) - 1;
        
        for (let i = start; i <= end; i++) {
            for (let j = start; j <= end; j++) {
                const px = x + i;
                const py = y + j;
                if (px >= 0 && px < this.canvasSize && py >= 0 && py < this.canvasSize) {
                    context.fillRect(px, py, 1, 1);
                }
            }
        }
    }
}

    drawEraserBrush(x, y, context) {
        if (this.brushSize === 1) {
            context.clearRect(x, y, 1, 1);
        } else {
            const halfSize = Math.floor(this.brushSize / 2);
            for (let i = -halfSize; i <= halfSize; i++) {
                for (let j = -halfSize; j <= halfSize; j++) {
                    const px = x + i;
                    const py = y + j;
                    if (px >= 0 && px < this.canvasSize && py >= 0 && py < this.canvasSize) {
                        context.clearRect(px, py, 1, 1);
                    }
                }
            }
        }
    }

    drawLine(x1, y1, x2, y2) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = (x1 < x2) ? 1 : -1;
        const sy = (y1 < y2) ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.drawPixel(x1, y1);
            
            if (x1 === x2 && y1 === y2) break;
            
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

  
    // ========== IMPLEMENTATION OF NEW TOOLS ==========
    applyBlur(x, y) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const radius = this.blurTool.radius;
        const intensity = this.blurTool.intensity / 10;
        
        const imageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const tempData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= radius) {
                        const weight = (1 - distance / radius) * intensity;
                        
                        const idx = (ny * this.canvasSize + nx) * 4;
                        const targetIdx = (y * this.canvasSize + x) * 4;
                        
                        for (let i = 0; i < 3; i++) {
                            tempData.data[targetIdx + i] = Math.min(255, 
                                tempData.data[targetIdx + i] * (1 - weight) + 
                                imageData.data[idx + i] * weight
                            );
                        }
                    }
                }
            }
        }
        
        currentLayer.ctx.putImageData(tempData, 0, 0);
        this.updateCanvas();
    }
    
    applyGradient(x1, y1, x2, y2) {
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame) return;
    
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    if (!currentLayer) return;
    
    // Calculate bounding box
    const minX = Math.max(0, Math.min(x1, x2));
    const minY = Math.max(0, Math.min(y1, y2));
    const maxX = Math.min(this.canvasSize - 1, Math.max(x1, x2));
    const maxY = Math.min(this.canvasSize - 1, Math.max(y1, y2));
    
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    
    if (width <= 0 || height <= 0) return;
    
    // Convert hexadecimal colors to RGB.
    const startColor = this.hexToRgb(this.gradientTool.startColor || '#FF0000');
    const endColor = this.hexToRgb(this.gradientTool.endColor || '#0000FF');
    
    // Apply gradient pixel by pixel
    for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
            // Calculate interpolation based on gradient type.
            let t;
            
            if (this.gradientTool.type === 'linear') {
                // Linear gradient from left to right
                t = (x - minX) / width;
            } else if (this.gradientTool.type === 'radial') {
                // Radial gradient from the center outwards
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const maxDistance = Math.max(
                    Math.abs(maxX - centerX),
                    Math.abs(maxY - centerY)
                );
                const distance = Math.sqrt(dx * dx + dy * dy);
                t = distance / maxDistance;
                t = Math.min(1, Math.max(0, t));
            } else if (this.gradientTool.type === 'angular') {
                // Angular gradient (rainbow)
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                const angle = Math.atan2(y - centerY, x - centerX);
                t = (angle + Math.PI) / (2 * Math.PI);
            }
            
            // Reverse if necessary.
            if (this.gradientTool.reverse) {
                t = 1 - t;
            }
            
            if (this.gradientTool.type === 'linear' && this.gradientTool.angle !== 0) {
                const angleRad = (this.gradientTool.angle * Math.PI) / 180;
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                
                // Rotate the point
                const dx = x - centerX;
                const dy = y - centerY;
                const rotatedX = dx * Math.cos(angleRad) - dy * Math.sin(angleRad);
                const rotatedY = dx * Math.sin(angleRad) + dy * Math.cos(angleRad);
                
               
                t = (rotatedX + maxX - minX) / (2 * (maxX - minX));
                t = Math.max(0, Math.min(1, t));
            }
            
            // Interpolate colors
            const r = Math.round(startColor.r * (1 - t) + endColor.r * t);
            const g = Math.round(startColor.g * (1 - t) + endColor.g * t);
            const b = Math.round(startColor.b * (1 - t) + endColor.b * t);
            
            // Draw pixel
            currentLayer.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            currentLayer.ctx.fillRect(x, y, 1, 1);
        }
    }
    
    // Success notification
    this.showNotification(`Gradiente ${this.gradientTool.type} applied!`);
}


applyQuickGradient() {
    if (!this.selection.active) {
        this.showNotification('Select an area first!', 'warning');
        return;
    }
    this.applyGradient(
        this.selection.x,
        this.selection.y,
        this.selection.x + this.selection.width,
        this.selection.y + this.selection.height
    );
}

    applyStamp(x, y) {
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame || !currentFrame.layers[this.currentLayerIndex]) return;
    
    const layer = currentFrame.layers[this.currentLayerIndex];
    const size = this.stampTool.size
    const spacing = this.stampTool.spacing; 
    const pattern = this.stampTool.pattern;
    
    layer.ctx.fillStyle = this.currentColor;
    

    for (let dy = -size; dy <= size; dy += spacing) {
        for (let dx = -size; dx <= size; dx += spacing) {
            const nx = Math.round(x + dx);
            const ny = Math.round(y + dy);
            
            if (nx < 0 || nx >= this.canvasSize || ny < 0 || ny >= this.canvasSize) continue;
            
            let shouldDraw = false;
            
            switch (pattern) {
                
                
                case 'square':
                    shouldDraw = Math.abs(dx) <= size && Math.abs(dy) <= size;
                    break;
                case 'star':
                    const angle = Math.atan2(dy, dx);
                    const starRadius = size * (0.5 + 0.5 * Math.sin(5 * angle + Math.PI));
                    shouldDraw = Math.sqrt(dx * dx + dy * dy) <= starRadius;
                    break;
                case 'heart':
                    const hx = dx / size;
                    const hy = dy / size;
                    shouldDraw = (hx * hx + (hy - Math.sqrt(Math.abs(hx))) * (hy - Math.sqrt(Math.abs(hx)))) <= 1;
                    break;
                default:
                    shouldDraw = true;
            }
            
            if (shouldDraw) {
                layer.ctx.fillRect(nx, ny, 1, 1);
            }
        }
    }
    
    this.updateCanvas();
}
    
    applyDither(x, y) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const size = this.ditherTool.size;
        const color1 = this.ditherTool.colors[0];
        const color2 = this.ditherTool.colors[1];
        
        for (let dy = -size; dy <= size; dy++) {
            for (let dx = -size; dx <= size; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {
                    let useColor1 = false;
                    
                    switch(this.ditherTool.pattern) {
                        case 'checker':
                            useColor1 = ((nx + ny) % (size * 2)) < size;
                            break;
                        case 'dots':
                            useColor1 = (dx * dx + dy * dy) <= (size * size) / 4;
                            break;
                        case 'lines':
                            useColor1 = (nx % (size * 2)) < size;
                            break;
                    }
                    
                    currentLayer.ctx.fillStyle = useColor1 ? color1 : color2;
                    currentLayer.ctx.fillRect(nx, ny, 1, 1);
                }
            }
        }
        
        this.updateCanvas();
    }
    
    applyGlow(x, y) {
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    const radius = this.glowTool.radius;
    const intensity = this.glowTool.intensity;
    const glowColor = this.hexToRgb(this.glowTool.color);
    
    console.log('Applying color with glitter:', this.glowTool.color, 'RGB:', glowColor);
    
    // Create a temporary canvas for the glow effect.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvasSize;
    tempCanvas.height = this.canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the highlights as concentric circles.
    for (let r = radius; r > 0; r--) {
        const opacity = (r / radius) * intensity;
        
        tempCtx.fillStyle = `rgba(${glowColor.r}, ${glowColor.g}, ${glowColor.b}, ${opacity})`;
        tempCtx.beginPath();
        tempCtx.arc(x, y, r, 0, Math.PI * 2);
        tempCtx.fill();
    }
    
    // Apply brightness to the current image using compositing.
    currentLayer.ctx.globalCompositeOperation = 'screen'; 
    currentLayer.ctx.drawImage(tempCanvas, 0, 0);
    currentLayer.ctx.globalCompositeOperation = 'source-over';
    
    this.updateCanvas();
}
    
    applyNoise(x, y) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const intensity = this.noiseTool.intensity;
        
        for (let dy = -3; dy <= 3; dy++) {
            for (let dx = -3; dx <= 3; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {
                    const noiseValue = (Math.random() - 0.5) * intensity;
                    
                    const imageData = currentLayer.ctx.getImageData(nx, ny, 1, 1);
                    
                    if (this.noiseTool.monochrome) {
                        const gray = (imageData.data[0] + imageData.data[1] + imageData.data[2]) / 3;
                        const newGray = Math.max(0, Math.min(255, gray + noiseValue * 255));
                        
                        currentLayer.ctx.fillStyle = `rgb(${newGray}, ${newGray}, ${newGray})`;
                    } else {
                        const r = Math.max(0, Math.min(255, imageData.data[0] + noiseValue * 255));
                        const g = Math.max(0, Math.min(255, imageData.data[1] + noiseValue * 255));
                        const b = Math.max(0, Math.min(255, imageData.data[2] + noiseValue * 255));
                        
                        currentLayer.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    }
                    
                    currentLayer.ctx.fillRect(nx, ny, 1, 1);
                }
            }
        }
        
        this.updateCanvas();
    }
    
    applyTexture(x, y) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const scale = this.textureTool.scale;
        const opacity = this.textureTool.opacity;
        
        const textureCanvas = document.createElement('canvas');
        textureCanvas.width = this.canvasSize;
        textureCanvas.height = this.canvasSize;
        const textureCtx = textureCanvas.getContext('2d');
        
        for (let i = 0; i < this.canvasSize; i += scale) {
            for (let j = 0; j < this.canvasSize; j += scale) {
                const value = Math.random() * 255;
                
                switch(this.textureTool.pattern) {
                    case 'canvas':
                        textureCtx.fillStyle = `rgba(${value}, ${value}, ${value}, ${opacity})`;
                        break;
                    case 'paper':
                        textureCtx.fillStyle = `rgba(220, 200, 180, ${opacity})`;
                        break;
                    case 'metal':
                        textureCtx.fillStyle = `rgba(150, 150, 150, ${opacity})`;
                        break;
                    case 'wood':
                        textureCtx.fillStyle = `rgba(139, 90, 43, ${opacity})`;
                        break;
                }
                
                textureCtx.fillRect(i, j, scale, scale);
            }
        }
        
        const imageData = currentLayer.ctx.getImageData(x - 5, y - 5, 10, 10);
        const textureData = textureCtx.getImageData(x - 5, y - 5, 10, 10);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            for (let j = 0; j < 3; j++) {
                imageData.data[i + j] = Math.min(255,
                    imageData.data[i + j] * (1 - opacity) +
                    textureData.data[i + j] * opacity
                );
            }
        }
        
        currentLayer.ctx.putImageData(imageData, x - 5, y - 5);
        this.updateCanvas();
    }
    
    applyWarp(x, y) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const strength = this.warpTool.strength;
        const brushSize = this.warpTool.brushSize;
        
        const imageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const tempData = new ImageData(
            new Uint8ClampedArray(imageData.data),
            imageData.width,
            imageData.height
        );
        
        for (let dy = -brushSize; dy <= brushSize; dy++) {
            for (let dx = -brushSize; dx <= brushSize; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance <= brushSize) {
                        const warpFactor = (1 - distance / brushSize) * strength;
                        
                        const angle = Math.random() * Math.PI * 2;
                        const warpX = Math.round(nx + Math.cos(angle) * warpFactor);
                        const warpY = Math.round(ny + Math.sin(angle) * warpFactor);
                        
                        if (warpX >= 0 && warpX < this.canvasSize && warpY >= 0 && warpY < this.canvasSize) {
                            const srcIdx = (ny * this.canvasSize + nx) * 4;
                            const dstIdx = (warpY * this.canvasSize + warpX) * 4;
                            
                            for (let i = 0; i < 4; i++) {
                                tempData.data[dstIdx + i] = imageData.data[srcIdx + i];
                            }
                        }
                    }
                }
            }
        }
        
        currentLayer.ctx.putImageData(tempData, 0, 0);
        this.updateCanvas();
    }
    
    replaceColor(oldColor, newColor) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const imageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const targetRgb = this.hexToRgb(oldColor);
        const newRgb = this.hexToRgb(newColor);
        
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i] === targetRgb.r &&
                imageData.data[i + 1] === targetRgb.g &&
                imageData.data[i + 2] === targetRgb.b) {
                
                imageData.data[i] = newRgb.r;
                imageData.data[i + 1] = newRgb.g;
                imageData.data[i + 2] = newRgb.b;
            }
        }
        
        currentLayer.ctx.putImageData(imageData, 0, 0);
        this.updateCanvas();
    }
    
    
    

// ========== PAN/DRAG SYSTEM ==========
handlePanStart(e) {
    // DETERMINE whether to activate PAN based on the event
    let shouldActivatePan = false;
    
    // For mouse:
    if (e.type.includes('mouse')) {
        // PAN active ONLY when:
        // 1. The middle button (wheel) is pressed.
        // 2. Right button is pressed  
        // 3. Ctrl + left mouse button is pressed
        shouldActivatePan =
            e.button === 1 || // Middle button
            e.button === 2 || // Right-click
            (e.button === 0 && e.ctrlKey); // Ctrl + left button
    }
    
    // For touch (mobile):
    if (e.type.includes('touch')) {
        // Active PAN only with 2 fingers (pinch/zoom)
        shouldActivatePan = (e.touches && e.touches.length >= 2);
    }
    
    // If you shouldn't activate PAN, allow normal drawing.
    if (!shouldActivatePan) {
        return; // Allows other handlers (such as startDrawing) to process
    }
    
    // If you've arrived here, activate PAN and PREVENT any other behavior.
    e.preventDefault();
    e.stopPropagation();
    
    this.pan.isActive = true;
    
    // Capture coordinates
    let clientX, clientY;
    
    if (e.type.includes('mouse')) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    
    
    this.pan.startX = clientX;
    this.pan.startY = clientY;
    this.pan.lastX = clientX;
    this.pan.lastY = clientY;
    this.canvas.style.cursor = 'grabbing';
    
    // stop any drawing in progress
    this.isDrawing = false;
    this.drawStraightLine = false;
    
    // If preview is enabled, hide
    if (this.previewSystem.active) {
        this.hidePreview();
    }
}

handlePanMove(e) {
    // Only process if PAN is active.
    if (!this.pan.isActive) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Capture current coordinates.
    let clientX, clientY;
    
    if (e.type.includes('mouse')) {
        clientX = e.clientX;
        clientY = e.clientY;
    } else if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    }
    
    
    const deltaX = clientX - this.pan.lastX;
    const deltaY = clientY - this.pan.lastY;
    
    // Update offset based on delta.
    this.pan.offsetX += deltaX;
    this.pan.offsetY += deltaY;
    
    // Limit movement to avoid leaving the screen too much.
    this.pan.offsetX = Math.max(-this.pan.maxOffset,
        Math.min(this.pan.maxOffset, this.pan.offsetX));
    this.pan.offsetY = Math.max(-this.pan.maxOffset,
        Math.min(this.pan.maxOffset, this.pan.offsetY));
    
    // Update last position
    this.pan.lastX = clientX;
    this.pan.lastY = clientY;
    
    // Apply transformation
    this.updateCanvasTransform();
}

handlePanEnd() {
    if (this.pan.isActive) {
        this.pan.isActive = false;
        this.canvas.style.cursor = this.getCurrentCursor();
    }
}


canDraw(e) {
    // if pan is active, it cannot draw.
    if (this.pan.isActive) {
        return false;
    }
    
    // If you just zoomed in, ignore next click.
    if (this.ignoreNextClick) {
        return false;
    }
    

    
    // If it's a PAN event (for example, Ctrl+click), you CANNOT draw.
    if (e.type.includes('mouse')) {
        if (e.button === 1 || e.button === 2) {
            return false;
        }
        
        if (e.button === 0 && e.ctrlKey) {
            return false;
        }
    }
    
    // If it's a multi-finger touch, you CANNOT draw.
    if (e.type.includes('touch') && e.touches && e.touches.length >= 2) {
        return false;
    }
    
    return true;
}


// For mobile phones (ringtone)
handleTouchStart(e) {
    // For touch input: just PAN if you have 2 fingers.
    if (e.touches && e.touches.length >= 2) {
        e.preventDefault();
        this.pan.isActive = true;
        const touch = e.touches[0];
        this.pan.startX = touch.clientX;
        this.pan.startY = touch.clientY;
        this.pan.lastX = touch.clientX;
        this.pan.lastY = touch.clientY;
        this.canvas.style.cursor = 'grabbing';
        return true; // Prevents it from continuing to other handlers.
    }
    return false; // Allows for normal drawing with 1 finger.
}


handleTouchMove(e) {

    // Pinch zoom support (2 fingers)
    if (e.touches.length === 2) {
        e.preventDefault();
        
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        
        // Calculate the current distance between the fingers.
        const currentDistance = Math.sqrt(
            Math.pow(touch2.clientX - touch1.clientX, 2) +
            Math.pow(touch2.clientY - touch1.clientY, 2)
        );
        
        // If it's the beginning of the pinch
        if (!this.touch.isPinching) {
            this.touch.isPinching = true;
            this.touch.lastDistance = currentDistance;
            return;
        }
        
        // Calculate the center of the pinch.
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Calculate the change in distance.
        const deltaDistance = currentDistance - this.touch.lastDistance;
        
        const zoomFactor = deltaDistance * 0.005;
        
        if (Math.abs(zoomFactor) > 0.01) {
            // Zoom in centered on the midpoint.
            this.adjustZoom(zoomFactor, centerX, centerY);
        }
        
        this.touch.lastDistance = currentDistance;
        return;
    }
    
    this.touch.isPinching = false;

    
    
    if (!this.pan.isActive) return;
    
    e.preventDefault();
    
    if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const clientX = touch.clientX;
        const clientY = touch.clientY;
        
        // Calculate delta
        const deltaX = clientX - this.pan.lastX;
        const deltaY = clientY - this.pan.lastY;
        
        // Update offset
        this.pan.offsetX += deltaX;
        this.pan.offsetY += deltaY;
        
        // Limit
        this.pan.offsetX = Math.max(-this.pan.maxOffset,
            Math.min(this.pan.maxOffset, this.pan.offsetX));
        this.pan.offsetY = Math.max(-this.pan.maxOffset,
            Math.min(this.pan.maxOffset, this.pan.offsetY));
        
        // Update last position
        this.pan.lastX = clientX;
        this.pan.lastY = clientY;
        
        // Apply transformation
        this.updateCanvasTransform();
    }
}


handleTouchEnd(e) {
    this.touch.isPinching = false;
    this.touch.lastDistance = 0;
    
    // If no more touches remain, finish the PAN as well.
    if (e.touches.length === 0) {
        this.handlePanEnd();
    }
}




updateCanvasTransform() {
    
    this.updateCanvasPosition();

    this.canvas.style.transform = `
        translate(${this.pan.offsetX}px, ${this.pan.offsetY}px)
        scale(${this.zoom})
    `;
    
    
    this.canvas.style.willChange = 'transform';
    this.updatePreviewCanvasSize();
}

resetPan() {
    // Soft reset to the center
    this.pan.offsetX = 0;
    this.pan.offsetY = 0;
    
    // Use the unified function
    this.updateCanvasPosition();
    
    // Force smooth animation
    this.canvas.style.transition = 'transform 0.3s ease';
    
    this.showNotification(' Centered canvas!');
}

getCurrentCursor() {
    switch(this.currentTool) {
        case 'picker': return 'crosshair';
        case 'selection': return 'default';
        default: return 'crosshair';
    }
}
    

togglePanMode(forceMode = null) {
    if (forceMode !== null) {
        this.pan.isActive = forceMode;
    } else {
        this.pan.isActive = !this.pan.isActive;
    }
    

    if (this.pan.isActive) {
        this.canvas.style.cursor = 'grabbing';
        this.showNotification(' MOVE mode activated (drag to move)', 'info');
    } else {
        this.canvas.style.cursor = this.getCurrentCursor();
        this.showNotification('Drawing mode activated', 'success');
    }
    

    const panToggle = document.querySelector('#mobile-controls button:first-child');
    if (panToggle) {
        if (this.pan.isActive) {
            panToggle.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            panToggle.style.borderColor = '#4CAF50';
        } else {
            panToggle.innerHTML = '<i class="fas fa-hand-paper"></i>';
            panToggle.style.borderColor = '#666';
        }
    }
}
    // ========== PREVIEW FUNCTIONS ==========
    drawLinePreview(x1, y1, x2, y2) {
    
    this.updateCanvas();
    
    // Create a temporary context for the preview.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvasSize;
    tempCanvas.height = this.canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    
    const currentFrame = this.frames[this.currentFrameIndex];
    if (currentFrame && currentFrame.layers[this.currentLayerIndex]) {
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        tempCtx.drawImage(currentLayer.canvas, 0, 0);
    }
    
    // Draw the preview line
    tempCtx.strokeStyle = this.currentColor;
    tempCtx.lineWidth = this.brushSize;
    tempCtx.beginPath();
    tempCtx.moveTo(x1, y1);
    tempCtx.lineTo(x2, y2);
    tempCtx.stroke();
    
    // Show on main canvas
    this.ctx.drawImage(tempCanvas, 0, 0);
}
    
    
    
    drawLineOnLayer(x1, y1, x2, y2, layer) {
    // Bresenham's algorithm for line
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = (x1 < x2) ? 1 : -1;
    const sy = (y1 < y2) ? 1 : -1;
    let err = dx - dy;
    

    layer.ctx.fillStyle = this.currentColor;
    
    while (true) {
        // Draw pixel
        this.drawPixelOnLayer(x1, y1, layer);
        
        if (x1 === x2 && y1 === y2) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x1 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y1 += sy;
        }
    }
}

drawPixelOnLayer(x, y, layer) {
    if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) return;
    
    if (this.brushSize === 1) {
        layer.ctx.fillRect(x, y, 1, 1);
    } else {
        const halfSize = Math.floor(this.brushSize / 2);
        for (let i = -halfSize; i <= halfSize; i++) {
            for (let j = -halfSize; j <= halfSize; j++) {
                const px = x + i;
                const py = y + j;
                if (px >= 0 && px < this.canvasSize && py >= 0 && py < this.canvasSize) {
                    layer.ctx.fillRect(px, py, 1, 1);
                }
            }
        }
    }
}
    
    
    
    drawFinalLine() {
    const x1 = this.shapeStartX;
    const y1 = this.shapeStartY;
    const x2 = this.lastX;
    const y2 = this.lastY;
    
    
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) {
        console.log('Invalid coordinates for line');
        return;
    }
    
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame) {
        console.error('Current frame not found');
        return;
    }
    
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    if (!currentLayer) {
        console.error('Current layer not found');
        return;
    }
    
    // Save state to history
    this.saveState();
    
    // Draw the line using Bresenham's algorithm.
    this.drawLineOnLayer(x1, y1, x2, y2, currentLayer);
    
    // Update canvas
    this.updateCanvas();
    this.updateFrameThumbnail(this.currentFrameIndex);
    
    console.log(`Line drawn from (${x1},${y1}) to (${x2},${y2})`);
}
    
    drawGradientPreview(x1, y1, x2, y2) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasSize;
        tempCanvas.height = this.canvasSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(this.canvas, 0, 0);
        
        const minX = Math.min(x1, x2);
        const minY = Math.min(y1, y2);
        const maxX = Math.max(x1, x2);
        const maxY = Math.max(y1, y2);
        const width = maxX - minX;
        const height = maxY - minY;
        
        if (width > 0 && height > 0) {
            const startColor = this.hexToRgb(this.gradientTool.startColor);
            const endColor = this.hexToRgb(this.gradientTool.endColor);
            
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    let t = (x - minX) / width;
                    const r = Math.round(startColor.r * (1 - t) + endColor.r * t);
                    const g = Math.round(startColor.g * (1 - t) + endColor.g * t);
                    const b = Math.round(startColor.b * (1 - t) + endColor.b * t);
                    
                    tempCtx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
                    tempCtx.fillRect(x, y, 1, 1);
                }
            }
        }
        
        this.ctx.drawImage(tempCanvas, 0, 0);
    }
    
    drawFinalGradient() {
    if (!this.isDrawing) return;
    
    const x1 = this.shapeStartX;
    const y1 = this.shapeStartY;
    const x2 = this.lastX;
    const y2 = this.lastY;
    
    // Ensure valid coordinates.
    if (x1 === undefined || y1 === undefined ||
        x2 === undefined || y2 === undefined) return;
    
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame) return;
    
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    if (!currentLayer) return;
    
    // Save state to history
    this.saveState();
    
    // Apply the gradient
    this.applyGradient(x1, y1, x2, y2);
    
    // Update canvas
    this.updateCanvas();
    this.updateFrameThumbnail(this.currentFrameIndex);
}

    
    
    
    drawFinalStraightLine() {
    const x1 = this.shapeStartX || this.pencilLastX;
    const y1 = this.shapeStartY || this.pencilLastY;
    const x2 = this.lastX; 
    const y2 = this.lastY;
    
    this.drawLine(x1, y1, x2, y2);
    this.updateCanvas();
}

// ========== GRADIENT TOOL ==========
selectTool(tool) {
    // Hide preview if visible.
    if (this.previewSystem.active) {
        this.hidePreview();
    }
    

    this.currentTool = tool;
    
    document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
    

    const toolElements = document.querySelectorAll('.tool');
    toolElements.forEach(toolElement => {
        const onclick = toolElement.getAttribute('onclick');
        if (onclick && onclick.includes(`selectTool('${tool}')`)) {
            toolElement.classList.add('active');
        } else if (toolElement.dataset.tool === tool) {
            toolElement.classList.add('active');
        
        }
    });
    
    // Show tool settings
    this.showToolSettings(tool);
    

    if (tool === 'gradient' || tool === 'stamp') {
        document.querySelectorAll('.tool-settings').forEach(panel => {
            panel.style.display = 'none';
        });
        const toolPanel = document.querySelector(`.${tool}-settings`);
        if (toolPanel) {
            toolPanel.style.display = 'block';
        }
    }
    
    // Update cursor
    this.updateCursorForTool(tool);
    
    this.updateUI();
}

updateCursorForTool(tool) {
    switch (tool) {
        case 'picker':
            this.canvas.style.cursor = 'crosshair';
            break;
        case 'selection':
            this.canvas.style.cursor = 'default';
            break;
        case 'gradient':
            this.canvas.style.cursor = 'crosshair';
            break;
        default:
            this.canvas.style.cursor = 'crosshair';
    }
}
      floodFill(x, y) {
    // Basic security check
    if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) {
        console.warn('Coordinates outside the canvas');
        return;
    }
    
    const currentFrame = this.frames[this.currentFrameIndex];
    if (!currentFrame) {
        console.error('Current frame not found');
        return;
    }
    
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    if (!currentLayer) {
        console.error('Current layer not found');
        return;
    }
    
    // Get current image
    const imageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    
    // Tool color
    const fillColor = this.hexToRgb(this.currentColor);
    if (!fillColor) {
        console.error('Invalid color:', this.currentColor);
        return;
    }
    
    // Clicked pixel index
    const clickedIndex = (y * this.canvasSize + x) * 4;
    
    // Original color of the clicked pixel (RGBA)
    const originalR = imageData.data[clickedIndex];
    const originalG = imageData.data[clickedIndex + 1];
    const originalB = imageData.data[clickedIndex + 2];
    const originalA = imageData.data[clickedIndex + 3];
    

    if (originalR === fillColor.r && 
        originalG === fillColor.g && 
        originalB === fillColor.b && 
        originalA === 255) {
     
        return;
    }
    


    let targetR, targetG, targetB, targetA;
    
    if (originalA === 0) {

        targetR = 0;
        targetG = 0;
        targetB = 0;
        targetA = 0;
    } else {

        targetR = originalR;
        targetG = originalG;
        targetB = originalB;
        targetA = originalA;
    }
    
    // Save state to history
    this.saveState();
    
    // Simple flood fill algorithm using stack
    const stack = [[x, y]];
    const visited = new Set();
    
    while (stack.length > 0) {
        const [cx, cy] = stack.pop();
        const key = `${cx},${cy}`;
        
        if (visited.has(key)) continue;
        if (cx < 0 || cx >= this.canvasSize || cy < 0 || cy >= this.canvasSize) continue;
        
        const index = (cy * this.canvasSize + cx) * 4;
        const r = imageData.data[index];
        const g = imageData.data[index + 1];
        const b = imageData.data[index + 2];
        const a = imageData.data[index + 3];
        
        // Check if this pixel matches the target.
        if (targetA === 0) {
            // Filling transparent area
            if (a === 0) {
                imageData.data[index] = fillColor.r;
                imageData.data[index + 1] = fillColor.g;
                imageData.data[index + 2] = fillColor.b;
                imageData.data[index + 3] = 255; 
                
                visited.add(key);
                
                //  neighbors (4-way)
                stack.push([cx + 1, cy]);
                stack.push([cx - 1, cy]);
                stack.push([cx, cy + 1]);
                stack.push([cx, cy - 1]);
            }
        } else {
            // Filling a specific opaque area
            if (r === targetR && g === targetG && b === targetB && a === targetA) {
                imageData.data[index] = fillColor.r;
                imageData.data[index + 1] = fillColor.g;
                imageData.data[index + 2] = fillColor.b;
                imageData.data[index + 3] = 255;
                
                visited.add(key);
                
                //  neighbors (4-way)
                stack.push([cx + 1, cy]);
                stack.push([cx - 1, cy]);
                stack.push([cx, cy + 1]);
                stack.push([cx, cy - 1]);
            }
        }
    }
    
    // Apply the changes
    currentLayer.ctx.putImageData(imageData, 0, 0);
    
    // Update view
    this.updateCanvas();
    this.updateFrameThumbnail(this.currentFrameIndex);
    
    console.log(`Flood fill applied: ${visited.size} changed pixels`);
}




    getPixelColor(imageData, x, y) {
        if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) return null;
        const index = (y * this.canvasSize + x) * 4;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3]
        };
    }

    

    // ========== LAYER SYSTEM (ORIGINAL) ==========
    createNewLayer(name) {
        const layerIndex = this.layers.length;
        const layerCanvas = document.createElement('canvas');
        layerCanvas.width = this.canvasSize;
        layerCanvas.height = this.canvasSize;
        const layerCtx = layerCanvas.getContext('2d');
        
        layerCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        const layer = {
            canvas: layerCanvas,
            ctx: layerCtx,
            name: name || `Camada ${layerIndex + 1}`,
            index: layerIndex,
            visible: true
        };
        
        this.layers.push(layer);
        this.addLayerToUI(layer);
        
        this.updateFramesLayers();
        
        return layer;
    }

    addLayerToUI(layer) {
        const layerList = document.getElementById('layer-list');
        if (!layerList) return;
        
        const layerElement = document.createElement('div');
        layerElement.className = 'layer';
        layerElement.dataset.layerId = layer.index;
        
        if (layer.index === this.currentLayerIndex) {
            layerElement.classList.add('active');
        }
        
        if (layer.isBackground) {
            layerElement.classList.add('background-layer');
        }
        
        layerElement.innerHTML = `
            <span class="layer-visibility" onclick="toggleLayerVisibility(${layer.index})">
                ${layer.visible ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>'}
            </span>
            <span class="layer-icon">
                <i class="fas ${layer.isBackground ? 'fa-image' : 'fa-layer-group'}"></i>
            </span>
            <span class="layer-name">${layer.name}</span>
            <div class="layer-controls">
                ${layer.isBackground ? 
                    `<span class="layer-locked" title="Camada protegida">
                        <i class="fas fa-lock"></i>
                    </span>` : 
                    `<button class="layer-btn" onclick="moveLayerUp(${layer.index})">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <button class="layer-btn" onclick="moveLayerDown(${layer.index})">
                        <i class="fas fa-arrow-down"></i>
                    </button>`
                }
            </div>
        `;
        
        layerElement.addEventListener('click', (e) => {
            if (!e.target.closest('.layer-btn') && !e.target.closest('.layer-visibility')) {
                if (layer.isBackground) {
                    this.showBackgroundLayerWarning();
                } else {
                    this.switchLayer(layer.index);
                }
            }
        });
        
        layerList.appendChild(layerElement);
    }

    switchLayer(index) {
        this.currentLayerIndex = index;
        document.querySelectorAll('.layer').forEach((layerEl, i) => {
            layerEl.classList.toggle('active', i === index);
        });
        this.updateCanvas();
    }

    toggleLayerVisibility(index) {
        if (index >= 0 && index < this.layers.length) {
            this.layers[index].visible = !this.layers[index].visible;
            const visibilityIcon = document.querySelectorAll('.layer')[index]?.querySelector('.layer-visibility');
            if (visibilityIcon) {
                visibilityIcon.innerHTML = this.layers[index].visible 
                    ? '<i class="fas fa-eye"></i>' 
                    : '<i class="fas fa-eye-slash"></i>';
            }
            this.updateCanvas();
            this.updateAllThumbnails();
        }
    }




    

// ========== togglePanMode function ==========
togglePanMode() {
    // Switches between DRAW mode and MOVE mode.
    this.pan.isActive = !this.pan.isActive;
    
    // Update cursor
    if (this.pan.isActive) {
        this.canvas.style.cursor = 'grabbing';
        this.showNotification('MOVE mode enabled (drag to move) • Ctrl+P to toggle', 'info');
    } else {
        this.canvas.style.cursor = this.getCurrentCursor();
        this.showNotification('Drawing mode activated • Ctrl+P to toggle', 'success');
    }
}


// ========== CANVA POSITIONING CORRECTIONS ==========
updateCanvasPosition() {

    const displayWidth = this.canvasWidth * this.pixelSize * this.zoom;
    const displayHeight = this.canvasHeight * this.pixelSize * this.zoom;
    this.canvas.style.width = displayWidth + 'px';
    this.canvas.style.height = displayHeight + 'px';
    
    
    

    this.canvas.style.transformOrigin = '0 0'; 
    this.canvas.style.transform = `translate(${this.pan.offsetX}px, ${this.pan.offsetY}px) scale(${this.zoom})`;
    

    if (this.pan.isActive) {
        this.canvas.style.transition = 'none';
    } else {
        this.canvas.style.transition = 'transform 0.2s ease';
    }
    
    // Update Zoom info
    const zoomLevel = document.getElementById('zoom-level');
    const zoomInfo = document.getElementById('zoom-info');
    
    if (zoomLevel) zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
    if (zoomInfo) zoomInfo.textContent = `Zoom: ${Math.round(this.zoom * 100)}%`;
    
    
    this.updateGridPosition();
}


    moveLayerUp(index) {
        if (index > 0) {
            [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
            this.layers.forEach((layer, i) => layer.index = i);
            this.currentLayerIndex = index - 1;
            this.updateLayersUI();
            this.updateFramesLayers();
            this.updateCanvas();
        }
    }

    moveLayerDown(index) {
        if (index < this.layers.length - 1) {
            [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
            this.layers.forEach((layer, i) => layer.index = i);
            this.currentLayerIndex = index + 1;
            this.updateLayersUI();
            this.updateFramesLayers();
            this.updateCanvas();
        }
    }

    updateLayersUI() {
        const layerList = document.getElementById('layer-list');
        if (!layerList) return;
        
        layerList.innerHTML = '';
        this.layers.forEach(layer => this.addLayerToUI(layer));
        
        const layerElements = document.querySelectorAll('.layer');
        layerElements.forEach((element, index) => {
            const layer = this.layers[index];
            if (layer && layer.isBackground) {
                element.classList.add('background-layer');
                const icon = element.querySelector('.layer-icon i') ||
                    element.querySelector('.layer-name i') ||
                    element.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-image';
                    icon.style.color = '#4CAF50';
                }
                
                const lockIndicator = element.querySelector('.layer-locked');
                if (!lockIndicator) {
                    const lock = document.createElement('span');
                    lock.className = 'layer-locked';
                    lock.innerHTML = '<i class="fas fa-lock"></i>';
                    lock.title = 'Protected background layer';
                    element.appendChild(lock);
                }
            }
        });
    }

    addLayer() {
        this.createNewLayer();
        this.switchLayer(this.layers.length - 1);
    }

    removeLayer() {
        if (this.layers.length > 1) {
            this.layers.splice(this.currentLayerIndex, 1);
            this.layers.forEach((layer, index) => layer.index = index);
            
            if (this.currentLayerIndex >= this.layers.length) {
                this.currentLayerIndex = this.layers.length - 1;
            }
            
            this.updateLayersUI();
            this.updateFramesLayers();
            this.updateCanvas();
        } else {
            alert('It is not possible to remove the last layer!');
        }
    }

    // ========== ANIMATION SYSTEM ==========
    createNewFrame() {
        const frameIndex = this.frames.length;
        const frame = {
            layers: [],
            index: frameIndex
        };
        
        this.layers.forEach(layer => {
            const frameLayerCanvas = document.createElement('canvas');
            frameLayerCanvas.width = this.canvasSize;
            frameLayerCanvas.height = this.canvasSize;
            const frameLayerCtx = frameLayerCanvas.getContext('2d');
            
            if (frameIndex > 0) {
                const prevFrame = this.frames[frameIndex - 1];
                const prevLayer = prevFrame.layers[layer.index];
                if (prevLayer) {
                    frameLayerCtx.drawImage(prevLayer.canvas, 0, 0);
                }
            } else {
                frameLayerCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
            }
            
            frame.layers.push({
                canvas: frameLayerCanvas,
                ctx: frameLayerCtx
            });
        });
        
        this.frames.push(frame);
        this.addFrameToUI(frame);
        return frame;
    }

    addFrameToUI(frame) {
        const framesContainer = document.getElementById('frames-container');
        if (!framesContainer) return;
        
        const frameElement = document.createElement('div');
        frameElement.className = 'frame';
        if (frame.index === this.currentFrameIndex) frameElement.classList.add('active');
        
        const thumbnail = document.createElement('canvas');
        thumbnail.width = 58;
        thumbnail.height = 58;
        const thumbnailCtx = thumbnail.getContext('2d');
        
        this.drawCheckerboard(thumbnailCtx, 58, 58);
        
        frameElement.innerHTML = `
            <span class="frame-number">${frame.index + 1}</span>
        `;
        frameElement.appendChild(thumbnail);
        frameElement.addEventListener('click', () => this.switchFrame(frame.index));
        framesContainer.appendChild(frameElement);
        
        this.updateFrameThumbnail(frame.index);
    }

    switchFrame(index) {
        this.currentFrameIndex = index;
        this.updateCanvas();
        
        document.querySelectorAll('.frame').forEach((frameEl, i) => {
            frameEl.classList.toggle('active', i === index);
        });
        
        const frameCounter = document.getElementById('frame-counter');
        if (frameCounter) {
            frameCounter.textContent = `${index + 1}/${this.frames.length}`;
        }
        
        if (this.onionSkin.enabled) {
            this.updateOnionSkin();
        }
    }

    addFrame() {
        this.createNewFrame();
        this.switchFrame(this.frames.length - 1);
    }

    removeFrame() {
        if (this.frames.length > 1) {
            this.frames.splice(this.currentFrameIndex, 1);
            this.frames.forEach((frame, index) => frame.index = index);
            
            const framesContainer = document.getElementById('frames-container');
            if (framesContainer) {
                framesContainer.innerHTML = '';
                this.frames.forEach(frame => this.addFrameToUI(frame));
            }
            
            if (this.currentFrameIndex >= this.frames.length) {
                this.currentFrameIndex = this.frames.length - 1;
            }
            
            this.switchFrame(this.currentFrameIndex);
        } else {
            alert('It is not possible to remove the last frame!');
        }
    }

    playAnimation() {
        if (this.isPlaying) {
            this.stopAnimation();
            return;
        }
        
        this.isPlaying = true;
        this.timeline.playing = true;
        
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            playBtn.classList.add('active');
        }
        
        let currentFrame = this.currentFrameIndex;
        const totalFrames = this.frames.length;
        let direction = 1;
        
        this.animationInterval = setInterval(() => {
            this.switchFrame(currentFrame);
            
            if (this.timeline.pingPong) {
                currentFrame += direction;
                
                if (currentFrame >= totalFrames - 1) {
                    direction = -1;
                    currentFrame = totalFrames - 2;
                } else if (currentFrame <= 0) {
                    direction = 1;
                    currentFrame = 1;
                }
            } else {
                currentFrame = (currentFrame + 1) % totalFrames;
            }
            
            const frameCounter = document.getElementById('frame-counter');
            if (frameCounter) {
                frameCounter.textContent = `${currentFrame + 1}/${totalFrames}`;
            }
            
        }, 1000 / this.fps);
    }

    stopAnimation() {
        this.isPlaying = false;
        this.timeline.playing = false;
        
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            playBtn.classList.remove('active');
        }
    }

    previousFrame() {
        if (this.frames.length === 0) return;
        
        const newIndex = (this.currentFrameIndex - 1 + this.frames.length) % this.frames.length;
        this.switchFrame(newIndex);
        
        const frameCounter = document.getElementById('frame-counter');
        if (frameCounter) {
            frameCounter.textContent = `${newIndex + 1}/${this.frames.length}`;
        }
    }
    
    nextFrame() {
        if (this.frames.length === 0) return;
        
        const newIndex = (this.currentFrameIndex + 1) % this.frames.length;
        this.switchFrame(newIndex);
        
        const frameCounter = document.getElementById('frame-counter');
        if (frameCounter) {
            frameCounter.textContent = `${newIndex + 1}/${this.frames.length}`;
        }
    }
    
    toggleLoop() {
        this.timeline.loop = !this.timeline.loop;
        const btn = document.getElementById('loop-btn');
        if (btn) {
            btn.classList.toggle('active', this.timeline.loop);
        }
    }
    
    togglePingPong() {
        this.timeline.pingPong = !this.timeline.pingPong;
        const btn = document.getElementById('pingpong-btn');
        if (btn) {
            btn.classList.toggle('active', this.timeline.pingPong);
        }
    }

    // ========== HISTORY ==========
saveState() {

    if (this._savingState) return;
    this._savingState = true;
    
    console.log('Saving state in history...');
    
    try {
        const state = {
            frames: [],
            currentFrameIndex: this.currentFrameIndex,
            currentLayerIndex: this.currentLayerIndex,
            timestamp: Date.now()
        };
        
        // Save each frame
        this.frames.forEach(frame => {
            const frameState = {
                layers: []
            };
            
            // Save each layer of the frame.
            frame.layers.forEach(layer => {
                if (layer && layer.canvas) {
                    const imageData = layer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
                    frameState.layers.push({
                        width: this.canvasSize,
                        height: this.canvasSize,
                        data: Array.from(imageData.data) // Convert to a simple array
                    });
                } else {
                    frameState.layers.push(null);
                }
            });
            
            state.frames.push(frameState);
        });
        
        // Cutting off historical future when saving a new state
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Limit history size
        if (this.history.length >= this.maxHistory) {
            this.history.shift();
            if (this.historyIndex > 0) this.historyIndex--;
        }
        
        // Save state
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
        
        console.log(`State saved (índice: ${this.historyIndex}, total: ${this.history.length})`);
        
    } catch (error) {
        console.error('Error saving state.:', error);
    } finally {
        setTimeout(() => {
            this._savingState = false;
        }, 50);
    }
}

    undo() {
    console.log('Trying to undo...');
    
    if (this.history.length === 0) {
        console.log('Empty history');
        this.showNotification('Nothing to undo.', 'warning');
        return;
    }
    
    if (this.historyIndex > 0) {
        this.historyIndex--;
        console.log(` History: going to index ${this.historyIndex}`);
        
        const state = this.history[this.historyIndex];
        if (state) {
            this.restoreState(state);
            this.showNotification(`Undone (${this.historyIndex + 1}/${this.history.length})`);
        }
    } else {
        console.log('History at the beginning');
        this.showNotification('Nothing to undo', 'warning');
    }
}

redo() {
    console.log('Trying to redo...');
    
    if (this.history.length === 0) {
        console.log('Empty history');
        this.showNotification('Nothing to redo', 'warning');
        return;
    }
    
    if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        console.log(` History: going to index ${this.historyIndex}`);
        
        const state = this.history[this.historyIndex];
        if (state) {
            this.restoreState(state);
            this.showNotification(`Remade (${this.historyIndex + 1}/${this.history.length})`);
        }
    } else {
        console.log('Historical ending');
        this.showNotification('Nothing to redo', 'warning');
    }
}

    restoreState(state) {
    try {
        if (!state || !state.frames) {
            console.error('Invalid state data');
            return;
        }
        
        console.log(` Restoring state... Frame: ${state.currentFrameIndex}, Layer: ${state.currentLayerIndex}`);
        
        // Restores frames
        const newFrames = [];
        
        state.frames.forEach((frameData, frameIndex) => {
            const frame = {
                layers: [],
                index: frameIndex
            };
            
            // Restores layers
            frameData.layers.forEach((layerData, layerIndex) => {
                const layerCanvas = document.createElement('canvas');
                layerCanvas.width = this.canvasSize;
                layerCanvas.height = this.canvasSize;
                const layerCtx = layerCanvas.getContext('2d');
                
                if (layerData && layerData.data) {

                    const imageData = new ImageData(
                        new Uint8ClampedArray(layerData.data),
                        layerData.width || this.canvasSize,
                        layerData.height || this.canvasSize
                    );
                    layerCtx.putImageData(imageData, 0, 0);
                } else {
                    layerCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
                }
                
                frame.layers.push({
                    canvas: layerCanvas,
                    ctx: layerCtx
                });
            });
            
            newFrames[frameIndex] = frame;
        });
        

        this.frames = newFrames;
        

        this.currentFrameIndex = Math.min(state.currentFrameIndex, this.frames.length - 1);
        this.currentLayerIndex = Math.min(state.currentLayerIndex,
            this.frames[this.currentFrameIndex]?.layers.length - 1 || 0);
        

        this.updateCanvas();
        this.updateAllThumbnails();
        

        this.checkCanvasContent();
        
        console.log(`State successfully restored!`);
        
    } catch (error) {
        console.error('Error restoring state:', error);
        this.emergencyRecovery();
    }
}

emergencyRecovery() {
    console.log('Performing emergency recovery...');
    
    // Creates a new basic frame.
    this.frames = [];
    this.createNewFrame();
    
    // Create a new layer.
    if (this.layers.length === 0) {
        this.createNewLayer('Recovered');
    }
    

    this.currentFrameIndex = 0;
    this.currentLayerIndex = 0;
    

    this.updateFramesUI();
    this.updateLayersUI();
    this.updateCanvas();
    this.updateAllThumbnails();
    
    this.showNotification('Emergency recovery performed', 'warning');
}

    // ========== Auxiliary Functions ==========
    updateCanvas() {
    if (this.renderQueued) return;
    
    this.renderQueued = true;
    
    requestAnimationFrame(() => {
        this.renderQueued = false;
        
        const ctx = this.ctx;
        const currentFrame = this.frames[this.currentFrameIndex];
        
        if (!currentFrame) {
            console.error('Current frame not found!');
            this.createNewFrame(); 
            this.renderQueued = false;
            return this.updateCanvas();
        }
        
        // VERIFICATION: Ensure there are layers.
        if (!currentFrame.layers || currentFrame.layers.length === 0) {
            console.error('No layers in the current frame.!');
            this.createNewLayer('Camada 1'); 

            this.renderQueued = false;
            return this.updateCanvas();
        }
        
        // Clear the main canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw all visible layers
        currentFrame.layers.forEach((layer, index) => {
            if (layer && layer.canvas && this.layers[index] && this.layers[index].visible) {
                try {
                    ctx.drawImage(layer.canvas, 0, 0);
                } catch (error) {
                    console.error('Error drawing layer:', error);
                }
            }
        });
        
        // Draw a reference image if one exists.
        if (this.referenceImage && this.referenceImage.complete) {
            try {
                ctx.save();
                ctx.globalAlpha = this.referenceOpacity;
                ctx.drawImage(
                    this.referenceImage,
                    0,
                    0,
                    this.canvasSize,
                    this.canvasSize
                );
                ctx.restore();
            } catch (error) {
                console.error('Error when drawing reference.:', error);
            }
        }
        
                if (this.tileGrid.enabled) {
            this.drawTileGrid();
        }

        
        this.updatePerformance();
    });
}

    updateFrameThumbnail(frameIndex) {
        const frameElements = document.querySelectorAll('.frame');
        if (frameIndex >= frameElements.length) return;
        
        const frameElement = frameElements[frameIndex];
        const thumbnail = frameElement.querySelector('canvas');
        if (!thumbnail) return;
        
        const thumbnailCtx = thumbnail.getContext('2d');
        const frame = this.frames[frameIndex];
        
        thumbnailCtx.clearRect(0, 0, 58, 58);
        
        this.drawCheckerboard(thumbnailCtx, 58, 58);
        
        frame.layers.forEach((layer, index) => {
            if (this.layers[index].visible) {
                thumbnailCtx.drawImage(layer.canvas, 0, 0, 58, 58);
            }
        });
    }

    updateAllThumbnails() {
        this.frames.forEach((frame, index) => {
            this.updateFrameThumbnail(index);
        });
    }

    drawCheckerboard(ctx, width, height) {
        const size = 8;
        for (let y = 0; y < height; y += size) {
            for (let x = 0; x < width; x += size) {
                const isDark = ((x / size) + (y / size)) % 2 === 0;
                ctx.fillStyle = isDark ? '#333' : '#555';
                ctx.fillRect(x, y, size, size);
            }
        }
    }

    updateFramesLayers() {
        this.frames.forEach(frame => {
            while (frame.layers.length < this.layers.length) {
                const newLayerCanvas = document.createElement('canvas');
                newLayerCanvas.width = this.canvasSize;
                newLayerCanvas.height = this.canvasSize;
                const newLayerCtx = newLayerCanvas.getContext('2d');
                newLayerCtx.clearRect(0, 0, this.canvasSize, this.canvasSize);
                frame.layers.push({
                    canvas: newLayerCanvas,
                    ctx: newLayerCtx
                });
            }
            
            while (frame.layers.length > this.layers.length) {
                frame.layers.pop();
            }
        });
        
        this.updateAllThumbnails();
    }

    updateFramesUI() {
        const framesContainer = document.getElementById('frames-container');
        if (!framesContainer) return;
        
        framesContainer.innerHTML = '';
        this.frames.forEach(frame => this.addFrameToUI(frame));
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    }

    applyZoom() {

    if (window.innerWidth <= 768 && this.pixelSize > 5.7) {
        this.pixelSize = 5.7; 
    }
    
    const displaySize = this.canvasSize * this.pixelSize * this.zoom;
    this.canvas.style.width = displaySize + 'px';
    this.canvas.style.height = displaySize + 'px';
    
    this.canvas.style.transform = `
        translate(${this.pan.offsetX}px, ${this.pan.offsetY}px)
        scale(${this.zoom})
    `;
    
    const zoomLevel = document.getElementById('zoom-level');
    const zoomInfo = document.getElementById('zoom-info');
    
    if (zoomLevel) zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
    if (zoomInfo) zoomInfo.textContent = `Zoom: ${Math.round(this.zoom * 100)}%`;
    
    this.updateCanvasPosition();
    this.updateGridOverlay();
    if (this.isometricGrid.enabled) {
        this.updateIsometricGrid();
    }
}



    // adjustZoom method
adjustZoom(delta, clientX = null, clientY = null) {
    const oldZoom = this.zoom;
    

    this.zoom = Math.max(0.1, Math.min(5, this.zoom + delta));
    

    if (clientX !== null && clientY !== null) {
        const rect = this.canvas.getBoundingClientRect();
        

        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        

        const worldX = (mouseX - this.pan.offsetX) / oldZoom;
        const worldY = (mouseY - this.pan.offsetY) / oldZoom;
        

        this.pan.offsetX = mouseX - worldX * this.zoom;
        this.pan.offsetY = mouseY - worldY * this.zoom;
    }
    
    this.applyZoom();
    this.updatePreviewCanvasSize();
}

    fitToScreen() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        const scaleX = containerWidth / (this.canvasSize * this.pixelSize);
        const scaleY = containerHeight / (this.canvasSize * this.pixelSize);
        
        this.zoom = Math.min(scaleX, scaleY, 5);
        this.zoom = Math.max(0.1, this.zoom);
        this.applyZoom();
    }

    toggleGrid() {
    this.showGrid = !this.showGrid;
    const gridOverlay = document.getElementById('grid-overlay');
    const gridToggle = document.getElementById('grid-toggle');
    
    if (gridOverlay) {
        while (gridOverlay.firstChild) {
            gridOverlay.removeChild(gridOverlay.firstChild);
        }
        
        gridOverlay.style.display = this.showGrid ? 'block' : 'none';
        if (this.showGrid) {

            this.updateGridOverlay();
        }
    }
    
    if (gridToggle) {
        gridToggle.innerHTML = this.showGrid ?
            '<i class="fas fa-th"></i> Grade: ON' :
            '<i class="fas fa-square"></i> Grade: OFF';
    }
    

}

    updateGridOverlay() {
    const gridOverlay = document.getElementById('grid-overlay');
    if (!gridOverlay || !this.showGrid) return;
    
    
    while (gridOverlay.firstChild) {
        gridOverlay.removeChild(gridOverlay.firstChild);
    }
    
    // Create new canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '5';
    

    const pixelCanvas = document.getElementById('pixel-canvas');
    const pixelCanvasRect = pixelCanvas.getBoundingClientRect();
    

    canvas.width = pixelCanvasRect.width;
    canvas.height = pixelCanvasRect.height;
    
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    
    gridOverlay.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate cell size based on zoom.
    const cellSize = this.pixelSize * this.zoom;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Drawing vertical lines
    for (let x = 0; x <= canvas.width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= canvas.height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}


updateGridPosition() {
    const pixelCanvas = document.getElementById('pixel-canvas');
    const pixelCanvasRect = pixelCanvas.getBoundingClientRect();
    const container = document.querySelector('.canvas-container');
    
    // Position grids on the pixel canvas.
    const gridOverlay = document.getElementById('grid-overlay');
    const isometricGrid = this.isometricGrid.overlay;
    
    if (gridOverlay) {
        gridOverlay.style.position = 'absolute';
        gridOverlay.style.top = pixelCanvas.offsetTop + 'px';
        gridOverlay.style.left = pixelCanvas.offsetLeft + 'px';
        gridOverlay.style.zIndex = '5';
    }
    
    if (isometricGrid) {
        isometricGrid.style.position = 'absolute';
        isometricGrid.style.top = pixelCanvas.offsetTop + 'px';
        isometricGrid.style.left = pixelCanvas.offsetLeft + 'px';
        isometricGrid.style.zIndex = '6';
    }
}




    updateCurrentColor() {
        const preview = document.getElementById('current-color-preview');
        if (preview) {
            preview.style.backgroundColor = this.currentColor;
        }
    }

    updateCursorPosition(x, y) {
        const cursorPos = document.getElementById('cursor-position');
        if (cursorPos) {
            cursorPos.textContent = `X: ${x}, Y: ${y}`;
        }
    }

    updateUI() {
    const documentSize = document.getElementById('document-size');
    const toolInfo = document.getElementById('tool-info');
    
    if (documentSize) {
        
        documentSize.textContent = `${this.canvasWidth}x${this.canvasHeight} pixels`;
    }
    
    if (toolInfo) {
        const toolName = this.tools[this.currentTool]?.name || this.getToolName(this.currentTool);
        toolInfo.textContent = `Tool: ${toolName}`;
    }
    
    this.updateCurrentColor();
}

    getToolName(tool) {
        const toolNames = {
            'pencil': 'Lápis',
            'eraser': 'Borracha',
            'fill': 'Balde de Tinta',
            'line': 'Linha',
            'picker': 'Conta-gotas',
            'selection': 'Seleção Retangular',
            'blur': 'Desfoque',
            'gradient': 'Gradiente',
            'stamp': 'Carimbo',
            'colorReplace': 'Subst. Cor',
            'dither': 'Pontilhado',
            'glow': 'Brilho',
            'noise': 'Ruído',
            'texture': 'Textura',
            'warp': 'Distorção'
        };
        return toolNames[tool] || tool;
    }

    getCanvasCoordinates(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    let clientX, clientY;
    
    if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const x = Math.floor((clientX - rect.left) * scaleX);
    const y = Math.floor((clientY - rect.top) * scaleY);
    
    return {
        x: Math.max(0, Math.min(this.canvas.width - 1, x)),
        y: Math.max(0, Math.min(this.canvas.height - 1, y))
    };
}

    // ========== UTILITY FUNCTIONS ==========
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#4CAF50'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10000;
            animation: slideIn 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
            font-family: Arial, sans-serif;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    pickColorFromCanvas(x, y) {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const imageData = currentLayer.ctx.getImageData(x, y, 1, 1);
        return this.rgbToHex(imageData.data[0], imageData.data[1], imageData.data[2]);
    }
    
    hexToRgb(hex) {
        hex = hex.replace(/^#/, '');
        
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
    
    rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
    
    pickColor(e) {
    const coords = this.getCanvasCoordinates(e);
    

    const imageData = this.ctx.getImageData(coords.x, coords.y, 1, 1);
    
    // If the pixel is transparent (alpha = 0), do not pick the color.
    if (imageData.data[3] === 0) {
        this.showNotification('Pixel transparente! No color to pick.', 'warning');
        return;
    }
    
    // Convert to hex
    const color = this.rgbToHex(imageData.data[0], imageData.data[1], imageData.data[2]);
    
    // Set as current color
    this.currentColor = color;
    
    // Update the color input
    const colorInput = document.getElementById('color-input');
    if (colorInput) {
        colorInput.value = color;
    }
    
    this.updateCurrentColor();
    
    // Update the color wheel
    this.updateWheelPositionFromColor(color);
    
    // the selection in the color palette (section "Colors")
    this.selectColorInPalette(color);
    
    // Visual feedback - flash on the pixel
    this.flashColorPick(coords.x, coords.y);
    
    // Automatically return to the previous tool or to the pencil.
    setTimeout(() => {
        this.selectTool('pencil');
        this.showNotification(`Color ${color} selected!`, 'success');
    }, 300);
}

// Select the color from the "Colors" palette.
selectColorInPalette(colorHex) {

    const colorElements = document.querySelectorAll('.color-palette .color, #color-palette .color');
    
    colorElements.forEach(colorEl => {
        colorEl.classList.remove('active');
    });
    

    let foundElement = null;
    
    colorElements.forEach(colorEl => {

        const elementColor = colorEl.getAttribute('data-color') ||
            this.rgbToHexString(colorEl.style.backgroundColor);
        
        const normalizedElementColor = this.normalizeHexColor(elementColor);
        const normalizedTargetColor = this.normalizeHexColor(colorHex);
        
        if (normalizedElementColor === normalizedTargetColor) {
            foundElement = colorEl;
        }
    });
    
    if (foundElement) {
        foundElement.classList.add('active');
    } else {

        console.log('Color not found in the palette:', colorHex);

    }
}

// Auxiliary method for normalizing hexadecimal colors.
normalizeHexColor(color) {
    if (!color) return '';
    

    color = color.replace('#', '');
    

    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }
    
    return color.toLowerCase();
}

// Auxiliary method to convert rgb() to hex string
rgbToHexString(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return '#000000';
    
    // Extract RGB values
    const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return this.rgbToHex(r, g, b);
    }
    
    return '#000000';
}
    
    flashColorPick(x, y) {
    // Save the original pixel state.
    const imageData = this.ctx.getImageData(x, y, 3, 3);
    
    // Draw a white circle around the pixel.
    this.ctx.save();
    this.ctx.fillStyle = '#FFFFFF';
    
    // Draw a highlighted circle.
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= 2 && distance > 1) {
                const px = x + dx;
                const py = y + dy;
                if (px >= 0 && px < this.canvasSize && py >= 0 && py < this.canvasSize) {
                    this.ctx.fillRect(px, py, 1, 1);
                }
            }
        }
    }
    this.ctx.restore();
    
    
    setTimeout(() => {
        this.ctx.putImageData(imageData, x - 1, y - 1);
        this.updateCanvas();
    }, 200);
}




    // ========== PERFORMANCE FUNCTIONS ==========
    updatePerformance() {
        const now = performance.now();
        this.performance.frameCount++;
        
        if (now - this.performance.lastRender >= 1000) {
            this.performance.fps = Math.round(
                (this.performance.frameCount * 1000) / (now - this.performance.lastRender)
            );
            this.performance.frameCount = 0;
            this.performance.lastRender = now;
            
            const fpsDisplay = document.getElementById('performance-fps');
            if (fpsDisplay) {
                fpsDisplay.textContent = `FPS: ${this.performance.fps}`;
            }
        }
    }


    loadReferenceImage(file) {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.referenceImage = new Image();
                this.referenceImage.onload = () => {
                    const refImage = document.getElementById('reference-image');
                    const refPanel = document.getElementById('reference-panel');
                    
                    if (refImage) refImage.src = e.target.result;
                    if (refPanel) refPanel.style.display = 'block';
                    
                    this.updateCanvas();
                };
                this.referenceImage.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    hideReference() {
        this.referenceImage = null;
        const refPanel = document.getElementById('reference-panel');
        if (refPanel) refPanel.style.display = 'none';
        this.updateCanvas();
    }
    
    
    
    exportHighResolutionImage() {
    const scale = parseInt(document.getElementById('export-scale').value) || 4;
    const format = this.exportSettings.format || 'png';
    
    // Create a canvas at a larger scale.
    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = this.canvasSize * scale;
    scaledCanvas.height = this.canvasSize * scale;
    const scaledCtx = scaledCanvas.getContext('2d');
    
    // Disable anti-aliasing to maintain sharp pixels.
    scaledCtx.imageSmoothingEnabled = false;
    scaledCtx.webkitImageSmoothingEnabled = false;
    scaledCtx.mozImageSmoothingEnabled = false;
    
    // Draw each frame/layer on the scaled canvas.
    const currentFrame = this.frames[this.currentFrameIndex];
    
    // Transparent background for PNG, white for JPEG.
    if (format === 'jpeg') {
        scaledCtx.fillStyle = '#ffffff';
        scaledCtx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    } else {
        scaledCtx.clearRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    }
    
    // Draw all visible layers
    currentFrame.layers.forEach((layer, index) => {
        if (this.layers[index] && this.layers[index].visible) {
            scaledCtx.drawImage(
                layer.canvas,
                0, 0, this.canvasSize, this.canvasSize,
                0, 0, scaledCanvas.width, scaledCanvas.height
            );
        }
    });
    
    // Create download link
    const link = document.createElement('a');
    link.download = `pixel-art-${scale}x-${new Date().getTime()}.${format}`;
    
    // Configure quality based on format.
    let dataURL;
    const quality = parseFloat(document.getElementById('export-quality').value) || 0.9;
    
    if (format === 'jpeg') {
        dataURL = scaledCanvas.toDataURL('image/jpeg', quality);
    } else if (format === 'webp') {
        dataURL = scaledCanvas.toDataURL('image/webp', quality);
    } else {
        dataURL = scaledCanvas.toDataURL('image/png');
    }
    
    link.href = dataURL;
    link.click();
    
    this.showNotification(`Exported in ${scale}x (${scaledCanvas.width}×${scaledCanvas.height}px)`);
}
    

    exportImage() {
        const link = document.createElement('a');
        link.download = `pixel-art-${new Date().getTime()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    exportSpriteSheet() {
        if (this.frames.length === 0) {
            alert('No frames to export!');
            return;
        }
        
        const columns = parseInt(prompt('Number of columns:', this.spriteSheetConfig.columns)) || 4;
        const spacing = parseInt(prompt('Spacing between sprites (px):', this.spriteSheetConfig.spacing)) || 2;
        
        const rows = Math.ceil(this.frames.length / columns);
        const sheetWidth = (this.canvasSize + spacing) * columns - spacing;
        const sheetHeight = (this.canvasSize + spacing) * rows - spacing;
        
        const sheetCanvas = document.createElement('canvas');
        sheetCanvas.width = sheetWidth;
        sheetCanvas.height = sheetHeight;
        const sheetCtx = sheetCanvas.getContext('2d');
        
        sheetCtx.clearRect(0, 0, sheetWidth, sheetHeight);
        
        for (let i = 0; i < this.frames.length; i++) {
            const frame = this.frames[i];
            const col = i % columns;
            const row = Math.floor(i / columns);
            const x = col * (this.canvasSize + spacing);
            const y = row * (this.canvasSize + spacing);
            
            frame.layers.forEach((layer, layerIndex) => {
                if (this.layers[layerIndex].visible) {
                    sheetCtx.drawImage(layer.canvas, x, y);
                }
            });
        }
        
        const link = document.createElement('a');
        link.download = `sprite-sheet-${new Date().getTime()}.png`;
        link.href = sheetCanvas.toDataURL();
        link.click();
    }

    toggleOnionSkin() {
        this.onionSkin.enabled = !this.onionSkin.enabled;
        
        if (this.onionSkin.enabled) {
            this.createOnionOverlay();
        } else {
            this.removeOnionOverlay();
        }
        
        this.updateCanvas();
    }

    createOnionOverlay() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        this.removeOnionOverlay();
        
        this.onionSkin.overlays = [];
        
        for (let i = 1; i <= this.onionSkin.framesBefore; i++) {
            const frameIndex = (this.currentFrameIndex - i + this.frames.length) % this.frames.length;
            if (frameIndex !== this.currentFrameIndex) {
                this.createSingleOnionOverlay(frameIndex, 'before');
            }
        }
        
        for (let i = 1; i <= this.onionSkin.framesAfter; i++) {
            const frameIndex = (this.currentFrameIndex + i) % this.frames.length;
            if (frameIndex !== this.currentFrameIndex) {
                this.createSingleOnionOverlay(frameIndex, 'after');
            }
        }
    }

    createSingleOnionOverlay(frameIndex, type) {
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        const overlay = document.createElement('canvas');
        overlay.className = 'onion-overlay';
        overlay.width = this.canvasSize;
        overlay.height = this.canvasSize;
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.imageRendering = 'pixelated';
        
        const ctx = overlay.getContext('2d');
        const frame = this.frames[frameIndex];
        
        let opacity = this.onionSkin.opacity;
        
        frame.layers.forEach((layer, layerIndex) => {
            if (this.layers[layerIndex].visible) {
                const imageData = layer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.canvasSize;
                tempCanvas.height = this.canvasSize;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.putImageData(imageData, 0, 0);
                
                if (type === 'before') {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(tempCanvas, 0, 0);
                    
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
                } else {
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.globalAlpha = opacity;
                    ctx.drawImage(tempCanvas, 0, 0);
                    
                    ctx.globalCompositeOperation = 'source-atop';
                    ctx.fillStyle = 'rgba(0, 0, 255, 0.5)';
                    ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
                }
                
                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = 'source-over';
            }
        });
        
        container.appendChild(overlay);
        this.onionSkin.overlays.push(overlay);
    }
    
    removeOnionOverlay() {
        if (this.onionSkin.overlays) {
            this.onionSkin.overlays.forEach(overlay => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            });
            this.onionSkin.overlays = [];
        }
    }
    
    updateOnionSkin() {
        if (this.onionSkin.enabled) {
            this.removeOnionOverlay();
            this.createOnionOverlay();
        }
    }

    toggleMirror(axis = 'x') {
        this.mirror.enabled = !this.mirror.enabled;
        this.mirror.axis = axis;
        
        if (this.mirror.enabled) {
            this.createMirrorOverlay();
            this.setupMirrorDrawing();
        } else {
            this.removeMirrorOverlay();
            this.restoreOriginalDrawing();
        }
    }
    
    createMirrorOverlay() {
        this.removeMirrorOverlay();
        
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        const overlay = document.createElement('div');
        overlay.className = `mirror-overlay ${this.mirror.axis === 'y' ? 'vertical' : ''}`;
        
        if (this.mirror.axis === 'x') {
            overlay.style.position = 'absolute';
            overlay.style.left = '50%';
            overlay.style.top = '0';
            overlay.style.height = '100%';
            overlay.style.width = '2px';
            overlay.style.borderLeft = '2px dashed rgba(255, 255, 0, 0.7)';
            overlay.style.pointerEvents = 'none';
        } else {
            overlay.style.position = 'absolute';
            overlay.style.top = '50%';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '2px';
            overlay.style.borderTop = '2px dashed rgba(255, 255, 0, 0.7)';
            overlay.style.pointerEvents = 'none';
        }
        
        container.appendChild(overlay);
        this.mirror.overlay = overlay;
    }
    
    removeMirrorOverlay() {
        if (this.mirror.overlay) {
            this.mirror.overlay.remove();
            this.mirror.overlay = null;
        }
    }
    
    setupMirrorDrawing() {
        this.mirror.originalDrawPixel = this.drawPixel.bind(this);
        
        this.drawPixel = (x, y) => {
            if (this.mirror.enabled) {
                const currentFrame = this.frames[this.currentFrameIndex];
                const currentLayer = currentFrame.layers[this.currentLayerIndex];
                
                if (this.currentTool === 'pencil') {
                    currentLayer.ctx.fillStyle = this.currentColor;
                    this.drawBrush(x, y, currentLayer.ctx);
                } else if (this.currentTool === 'eraser') {
                    currentLayer.ctx.clearRect(x, y, 1, 1);
                    if (this.brushSize > 1) {
                        this.drawEraserBrush(x, y, currentLayer.ctx);
                    }
                }
                
                let mirroredX = x;
                let mirroredY = y;
                
                if (this.mirror.axis === 'x') {
                    mirroredX = this.canvasSize - 1 - x;
                } else {
                    mirroredY = this.canvasSize - 1 - y;
                }
                
                if (this.currentTool === 'pencil') {
                    currentLayer.ctx.fillStyle = this.currentColor;
                    this.drawBrush(mirroredX, mirroredY, currentLayer.ctx);
                } else if (this.currentTool === 'eraser') {
                    currentLayer.ctx.clearRect(mirroredX, mirroredY, 1, 1);
                    if (this.brushSize > 1) {
                        this.drawEraserBrush(mirroredX, mirroredY, currentLayer.ctx);
                    }
                }
            } else {
                this.mirror.originalDrawPixel(x, y);
            }
            
            this.updateCanvas();
            this.updateFrameThumbnail(this.currentFrameIndex);
        };
    }
    
    restoreOriginalDrawing() {
        if (this.mirror.originalDrawPixel) {
            this.drawPixel = this.mirror.originalDrawPixel;
        }
    }

    // ========== PALLET SYSTEM  ==========
    initPalettesSystem() {
        this.setupPalettesUI();
        this.loadPalettesFromStorage();
    }
    
    setupPalettesUI() {
        const colorsSection = document.querySelector('.panel-section:first-child');
        if (!colorsSection) return;
        
        let palettesContainer = document.getElementById('palettes-container');
        if (!palettesContainer) {
            palettesContainer = document.createElement('div');
            palettesContainer.id = 'palettes-container';
            palettesContainer.className = 'palettes-container';
            colorsSection.appendChild(palettesContainer);
        }
        
        this.renderPalettes();
    }
    
    renderPalettes() {
        const container = document.getElementById('palettes-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        Object.keys(this.palettes).forEach(paletteName => {
            const palette = this.palettes[paletteName];
            const paletteItem = document.createElement('div');
            paletteItem.className = `palette-item ${paletteName === this.currentPalette ? 'active' : ''}`;
            
            const preview = document.createElement('div');
            preview.className = 'palette-preview';
            
            const colorsToShow = palette.slice(0, 8);
            colorsToShow.forEach(color => {
                const colorDiv = document.createElement('div');
                colorDiv.className = 'palette-preview-color';
                colorDiv.style.backgroundColor = color;
                preview.appendChild(colorDiv);
            });
            
            paletteItem.innerHTML = `
                ${preview.outerHTML}
                <span class="palette-name">${paletteName}</span>
                <div class="palette-actions">
                    <button class="palette-btn-small" onclick="editor.loadPalette('${paletteName}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="palette-btn-small" onclick="editor.deletePalette('${paletteName}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(paletteItem);
        });
    }
    
    loadPalette(paletteName) {
        if (this.palettes[paletteName]) {
            this.currentPalette = paletteName;
            this.updateColorPaletteFromCurrentPalette();
            this.renderPalettes();
        }
    }
    
    updateColorPaletteFromCurrentPalette() {
        const palette = this.palettes[this.currentPalette];
        const container = document.getElementById('color-palette');
        if (!container) return;
        
        container.innerHTML = '';
        
        palette.forEach(color => {
            const colorElement = document.createElement('div');
            colorElement.className = 'color';
            colorElement.style.backgroundColor = color;
            colorElement.setAttribute('data-color', color);
            colorElement.addEventListener('click', () => {
                this.currentColor = color;
                document.getElementById('color-input').value = color;
                this.updateCurrentColor();
                this.updateWheelPositionFromColor(color);
                
                document.querySelectorAll('.color').forEach(c => c.classList.remove('active'));
                colorElement.classList.add('active');
            });
            container.appendChild(colorElement);
        });
        
        if (container.firstChild) {
            container.firstChild.classList.add('active');
        }
    }
    
    createNewPalette() {
        const name = prompt('Name of the new palette:', `Paleta ${Object.keys(this.palettes).length + 1}`);
        if (name && !this.palettes[name]) {
            const colors = [];
            const colorElements = document.querySelectorAll('#color-palette .color');
            colorElements.forEach(el => {
                colors.push(el.style.backgroundColor || el.getAttribute('data-color'));
            });
            
            this.palettes[name] = colors;
            this.currentPalette = name;
            this.savePalettesToStorage();
            this.renderPalettes();
        }
    }
    
    saveCurrentPalette() {
        const colors = [];
        const colorElements = document.querySelectorAll('#color-palette .color');
        colorElements.forEach(el => {
            colors.push(el.style.backgroundColor || el.getAttribute('data-color'));
        });
        
        this.palettes[this.currentPalette] = colors;
        this.savePalettesToStorage();
        this.showNotification('Palette saved successfully!');
    }
    
    deletePalette(paletteName) {
        if (paletteName === 'default') {
            this.showNotification('It is not possible to delete the default palette!', 'error');
            return;
        }
        
        if (confirm(`Are you sure you want to delete the palette? "${paletteName}"?`)) {
            delete this.palettes[paletteName];
            if (this.currentPalette === paletteName) {
                this.currentPalette = 'default';
            }
            this.savePalettesToStorage();
            this.renderPalettes();
            this.updateColorPaletteFromCurrentPalette();
        }
    }
    
    savePalettesToStorage() {
        try {
            localStorage.setItem('pixelArtPalettes', JSON.stringify(this.palettes));
        } catch (e) {
            console.error('Error saving palettes:', e);
        }
    }
    
    loadPalettesFromStorage() {
        try {
            const saved = localStorage.getItem('pixelArtPalettes');
            if (saved) {
                const loadedPalettes = JSON.parse(saved);
                Object.assign(this.palettes, loadedPalettes);
                this.renderPalettes();
            }
        } catch (e) {
            console.error('Error loading palettes:', e);
        }
    }

initPickerTool() {

    }
    
    initShapeTools() {
    }
    
    initIsometricGrid() {
    const container = document.querySelector('.canvas-container');
    if (!container) return;
    
    if (this.isometricGrid.overlay) {
        this.isometricGrid.overlay.remove();
    }
    
    const overlay = document.createElement('canvas');
    overlay.className = 'isometric-grid-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        z-index: 6;
        opacity: 0.3;
        display: none;
        will-change: transform;
        transform-origin: 0 0;
    `;
    
    container.appendChild(overlay);
    this.isometricGrid.overlay = overlay;
}

    toggleIsometricGrid() {
        this.isometricGrid.enabled = !this.isometricGrid.enabled;
        
        if (this.isometricGrid.overlay) {
            this.isometricGrid.overlay.style.display = this.isometricGrid.enabled ? 'block' : 'none';
        }
        
        if (this.isometricGrid.enabled) {
            this.updateIsometricGrid();
        }
    }

    updateIsometricGrid() {
    if (!this.isometricGrid.enabled || !this.isometricGrid.overlay) return;
    
    const overlay = this.isometricGrid.overlay;
    const container = document.querySelector('.canvas-container');
    

    overlay.width = container.clientWidth;
    overlay.height = container.clientHeight;
    
    overlay.style.width = overlay.width + 'px';
    overlay.style.height = overlay.height + 'px';
    
    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    
    const size = this.isometricGrid.size * this.pixelSize * this.zoom;
    const angle = this.isometricGrid.angle * Math.PI / 180;
    const color = this.isometricGrid.color;
    
    // PIXEL-CANVAS CENTER
    const pixelCanvas = document.getElementById('pixel-canvas');
    const pixelCanvasRect = pixelCanvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate the canvas offset within the container.
    const canvasOffsetX = pixelCanvasRect.left - containerRect.left;
    const canvasOffsetY = pixelCanvasRect.top - containerRect.top;
    
    // Center of the canvas considering PAN
    const canvasCenterX = canvasOffsetX + (this.canvasSize * this.pixelSize * this.zoom) / 2;
    const canvasCenterY = canvasOffsetY + (this.canvasSize * this.pixelSize * this.zoom) / 2;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    
    // Draw horizontal lines (X-axis)
    for (let i = -20; i <= 20; i++) {
        const y = canvasCenterY + i * size;
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(overlay.width, y);
        ctx.stroke();
    }
    
    // Drawing diagonal lines
    for (let i = -20; i <= 20; i++) {
        const x = canvasCenterX + i * size;
        
        // Right diagonal line
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + overlay.width * Math.cos(angle), overlay.height);
        ctx.stroke();
        
        // Left diagonal line
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x - overlay.width * Math.cos(angle), overlay.height);
        ctx.stroke();
    }
    
    // Highlighted center lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    
    // Central horizontal line
    ctx.beginPath();
    ctx.moveTo(0, canvasCenterY);
    ctx.lineTo(overlay.width, canvasCenterY);
    ctx.stroke();
    
    // Central vertical line
    ctx.beginPath();
    ctx.moveTo(canvasCenterX, 0);
    ctx.lineTo(canvasCenterX, overlay.height);
    ctx.stroke();
}

    // ========== ADVANCED FUNCTIONS ==========
    initAdvancedFeatures() {
        this.initColorWheel();
        this.setupLayerAdjustmentListeners();
        this.setupOutlineListeners();
        this.initSnapSystem();
    }
    
    
    // ========== SEMI-TRANSPARENT BLUE PREVIEW SYSTEM ==========
initPreviewSystem() {
    this.previewSystem = {
        active: false,
        type: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        color: 'rgba(0, 120, 255, 0.3)',
        strokeColor: 'rgba(0, 150, 255, 0.6)', 
        canvas: null,
        ctx: null,
        needsPreview: ['rectangle', 'triangle', 'polygon', 'ellipse', 
                      'star', 'heart', 'arrow', 'cross', 'line', 'gradient']
    };
    
    this.createPreviewCanvas();
}

// ========== SISTEMA DE PREVIEW  ==========
createPreviewCanvas() {

    const container = document.querySelector('.canvas-container');
    if (!container) return;
    
   
    const oldPreview = container.querySelector('.preview-overlay');
    if (oldPreview) oldPreview.remove();
    
    
    this.previewSystem.canvas = document.createElement('canvas');
    this.previewSystem.canvas.className = 'preview-overlay';
    

    this.previewSystem.canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 5; 
        display: none;
        image-rendering: pixelated;
    `;
    
    
    container.appendChild(this.previewSystem.canvas);
    this.previewSystem.ctx = this.previewSystem.canvas.getContext('2d');
    
    // Ensure that it follows the zoom/pan
    this.updatePreviewCanvasSize();
}

updatePreviewCanvasSize() {
    if (!this.previewSystem.canvas) return;
    
    const container = document.querySelector('.canvas-container');
    if (!container) return;
    
    // GET CONTAINER DIMENSIONS
    const containerRect = container.getBoundingClientRect();
    
    // Update canvas size
    this.previewSystem.canvas.width = containerRect.width;
    this.previewSystem.canvas.height = containerRect.height;
    
    this.previewSystem.canvas.style.width = '100%';
    this.previewSystem.canvas.style.height = '100%';
}



showPreview(type, x, y) {
    this.previewSystem.active = true;
    this.previewSystem.type = type;
    this.previewSystem.startX = x;
    this.previewSystem.startY = y;
    this.previewSystem.currentX = x;
    this.previewSystem.currentY = y;
    
    if (this.previewSystem.canvas) {
        this.previewSystem.canvas.style.display = 'block';
        this.updatePreviewCanvasSize();
    }
}

updatePreview(x, y) {
    if (!this.previewSystem.active) return;
    
    this.previewSystem.currentX = x;
    this.previewSystem.currentY = y;
    this.drawPreview();
}

hidePreview() {
    this.previewSystem.active = false;
    if (this.previewSystem.canvas) {
        this.previewSystem.canvas.style.display = 'none';
        this.clearPreview();
    }
}




clearPreview() {
    if (!this.previewSystem.ctx) return;
    
    const ctx = this.previewSystem.ctx;
    ctx.clearRect(0, 0, this.previewSystem.canvas.width, this.previewSystem.canvas.height);
}

drawPreview() {
    this.clearPreview();
    
    if (!this.previewSystem.active || !this.previewSystem.ctx) return;
    
    const ctx = this.previewSystem.ctx;
    const type = this.previewSystem.type;
    const startX = this.previewSystem.startX;
    const startY = this.previewSystem.startY;
    const currentX = this.previewSystem.currentX;
    const currentY = this.previewSystem.currentY;
    

    ctx.clearRect(0, 0, this.previewSystem.canvas.width, this.previewSystem.canvas.height);
    

    const pixelCanvas = document.getElementById('pixel-canvas');
    const container = document.querySelector('.canvas-container');
    
    if (!pixelCanvas || !container) return;
    

    const pixelCanvasRect = pixelCanvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    

    const canvasOffsetX = pixelCanvasRect.left - containerRect.left;
    const canvasOffsetY = pixelCanvasRect.top - containerRect.top;
    
    const startScreenX = canvasOffsetX + (startX * this.pixelSize * this.zoom);
    const startScreenY = canvasOffsetY + (startY * this.pixelSize * this.zoom);
    const currentScreenX = canvasOffsetX + (currentX * this.pixelSize * this.zoom);
    const currentScreenY = canvasOffsetY + (currentY * this.pixelSize * this.zoom);
    

    const panAdjustedStartX = startScreenX + this.pan.offsetX;
    const panAdjustedStartY = startScreenY + this.pan.offsetY;
    const panAdjustedCurrentX = currentScreenX + this.pan.offsetX;
    const panAdjustedCurrentY = currentScreenY + this.pan.offsetY;
    
 
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.8)';
    ctx.fillStyle = 'rgba(0, 120, 255, 0.3)';
    ctx.lineWidth = 2;
    

    const width = panAdjustedCurrentX - panAdjustedStartX;
    const height = panAdjustedCurrentY - panAdjustedStartY;
    
    switch (type) {
        case 'rectangle':
            ctx.fillRect(panAdjustedStartX, panAdjustedStartY, width, height);
            ctx.strokeRect(panAdjustedStartX, panAdjustedStartY, width, height);
            break;
            
        case 'line':
            ctx.beginPath();
            ctx.moveTo(panAdjustedStartX, panAdjustedStartY);
            ctx.lineTo(panAdjustedCurrentX, panAdjustedCurrentY);
            ctx.stroke();
            break;
            
        case 'ellipse':
            const centerX = panAdjustedStartX + width / 2;
            const centerY = panAdjustedStartY + height / 2;
            const radiusX = Math.abs(width) / 2;
            const radiusY = Math.abs(height) / 2;
            
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
            
        case 'gradient':
            // Show gradient direction line
            ctx.beginPath();
            ctx.moveTo(panAdjustedStartX, panAdjustedStartY);
            ctx.lineTo(panAdjustedCurrentX, panAdjustedCurrentY);
            ctx.stroke();
            
            // Show gradient area
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = this.gradientTool.startColor || '#FF0000';
            ctx.fillRect(panAdjustedStartX, panAdjustedStartY, width, height);
            ctx.globalAlpha = 1.0;
            break;
            
        default:
            // Generic preview for other forms
            ctx.fillRect(panAdjustedStartX, panAdjustedStartY, width, height);
            ctx.strokeRect(panAdjustedStartX, panAdjustedStartY, width, height);
    }
    
    console.log('Updated preview:', {
        startPixel: { x: startX, y: startY },
        currentPixel: { x: currentX, y: currentY },
        startScreen: { x: panAdjustedStartX, y: panAdjustedStartY },
        currentScreen: { x: panAdjustedCurrentX, y: panAdjustedCurrentY },
        pan: { x: this.pan.offsetX, y: this.pan.offsetY },
        zoom: this.zoom
    });
}


drawLinePreviewOnCanvas(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw circles at the ends.
    ctx.fillStyle = this.previewSystem.strokeColor;
    ctx.beginPath();
    ctx.arc(x1, y1, 4, 0, Math.PI * 2);
    ctx.arc(x2, y2, 4, 0, Math.PI * 2);
    ctx.fill();
}

drawRectanglePreview(ctx, x1, y1, x2, y2) {
    const width = x2 - x1;
    const height = y2 - y1;
    
    // Filling
    ctx.fillRect(x1, y1, width, height);
    
    // Edge
    ctx.strokeRect(x1, y1, width, height);
    
    // Draw handles on the corners.
    this.drawPreviewHandles(ctx, x1, y1, x2, y2);
}



drawEllipsePreview(ctx, x1, y1, x2, y2) {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
}

drawTrianglePreview(ctx, x1, y1, x2, y2) {
    const centerX = (x1 + x2) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, y1); // Top
    ctx.lineTo(x1, y2); // Bottom left
    ctx.lineTo(x2, y2); // Bottom right
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

drawPolygonPreview(ctx, x1, y1, x2, y2) {
    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radius = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
    const sides = this.shapeTool.sides || 6;
    
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

drawGradientPreviewOnCanvas(ctx, x1, y1, x2, y2) {
    // Draws the gradient direction line.
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw circles at the ends.
    ctx.fillStyle = this.gradientTool.startColor + '80';
    ctx.beginPath();
    ctx.arc(x1, y1, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = this.gradientTool.endColor + '80';
    ctx.beginPath();
    ctx.arc(x2, y2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw gradient area
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = this.gradientTool.startColor;
    ctx.fillRect(minX, minY, width, height);
    ctx.globalAlpha = 1.0;
}

drawGenericPreview(ctx, x1, y1, x2, y2) {
    // Generic preview - rectangle with dashed border
    const width = x2 - x1;
    const height = y2 - y1;
    
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(x1, y1, width, height);
    ctx.setLineDash([]);
    
    // Very transparent filler
    ctx.globalAlpha = 0.1;
    ctx.fillRect(x1, y1, width, height);
    ctx.globalAlpha = 1.0;
}

drawPreviewHandles(ctx, x1, y1, x2, y2) {
    const handles = [
        { x: x1, y: y1 }, // top-left
        { x: (x1 + x2) / 2, y: y1 }, // top-center
        { x: x2, y: y1 }, // top-right
        { x: x1, y: (y1 + y2) / 2 }, // middle-left
        { x: x2, y: (y1 + y2) / 2 }, // middle-right
        { x: x1, y: y2 }, // bottom-left
        { x: (x1 + x2) / 2, y: y2 }, // bottom-center
        { x: x2, y: y2 } // bottom-right
    ];
    
    ctx.fillStyle = this.previewSystem.strokeColor;
    handles.forEach(handle => {
        ctx.beginPath();
        ctx.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

needsPreview(tool) {
    return this.previewSystem.needsPreview.includes(tool);
}

    initColorWheel() {
        const colorWheel = document.getElementById('color-wheel');
        const selector = document.getElementById('color-wheel-selector');
        const preview = document.getElementById('color-preview-wheel');
        
        if (!colorWheel || !selector || !preview) return;
        
        this.colorPicker.wheelElement = colorWheel;
        this.colorPicker.selectorElement = selector;
        
        colorWheel.addEventListener('mousedown', (e) => {
            this.colorPicker.isDragging = true;
            this.updateColorFromWheel(e);
        });
        
        colorWheel.addEventListener('mousemove', (e) => {
            if (this.colorPicker.isDragging) {
                this.updateColorFromWheel(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.colorPicker.isDragging = false;
        });
        
        colorWheel.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.colorPicker.isDragging = true;
            this.updateColorFromWheel(e.touches[0]);
        });
        
        colorWheel.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.colorPicker.isDragging) {
                this.updateColorFromWheel(e.touches[0]);
            }
        });
        
        colorWheel.addEventListener('touchend', () => {
            this.colorPicker.isDragging = false;
        });
        
        const hexInput = document.getElementById('color-hex');
        const rgbInput = document.getElementById('color-rgb');
        
        if (hexInput) {
            hexInput.addEventListener('change', (e) => {
                this.setColorFromHex(e.target.value);
            });
        }
        
        if (rgbInput) {
            rgbInput.addEventListener('change', (e) => {
                this.setColorFromRGB(e.target.value);
            });
        }
        
        this.updateWheelPositionFromColor(this.currentColor);
    }

    updateColorFromWheel(event) {
        const wheel = this.colorPicker.wheelElement;
        const selector = this.colorPicker.selectorElement;
        
        if (!wheel || !selector) return;
        
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        let clientX, clientY;
        if (event.touches && event.touches[0]) {
            clientX = event.touches[0].clientX - rect.left;
            clientY = event.touches[0].clientY - rect.top;
        } else {
            clientX = event.clientX - rect.left;
            clientY = event.clientY - rect.top;
        }
        
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const radius = Math.min(centerX, centerY) - 10;
        
        const clampedDistance = Math.min(distance, radius);
        
        let angle = Math.atan2(dy, dx);
        let hue = (angle * 180 / Math.PI);
        
        if (hue < 0) hue += 360;
        
        hue = (hue - 270 + 360) % 360;
        
        const saturation = (clampedDistance / radius) * 100;
        
        const color = this.hslToHex(hue, saturation, 50);
        
        this.currentColor = color;
        document.getElementById('color-input').value = color;
        this.updateCurrentColor();
        
        const selectorX = centerX + (dx / distance) * clampedDistance;
        const selectorY = centerY + (dy / distance) * clampedDistance;
        
        selector.style.left = (selectorX - 8) + 'px';
        selector.style.top = (selectorY - 8) + 'px';
        
        const preview = document.getElementById('color-preview-wheel');
        if (preview) preview.style.backgroundColor = color;
        
        const hexInput = document.getElementById('color-hex');
        const rgbInput = document.getElementById('color-rgb');
        
        if (hexInput) hexInput.value = color;
        if (rgbInput) rgbInput.value = this.hexToRGBString(color);
        
        this.colorPicker.hue = hue;
        this.colorPicker.saturation = saturation;
        this.colorPicker.lightness = 50;
    }

    updateWheelPositionFromColor(hexColor) {
        const hsl = this.hexToHSL(hexColor);
        
        const wheel = this.colorPicker.wheelElement;
        const selector = this.colorPicker.selectorElement;
        
        if (!wheel || !selector) return;
        
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        
        let cssAngle = (hsl.h + 270) % 360;
        
        const angleRad = (cssAngle * Math.PI) / 180;
        
        const distance = (hsl.s / 100) * radius;
        const selectorX = centerX + Math.cos(angleRad) * distance;
        const selectorY = centerY + Math.sin(angleRad) * distance;
        
        selector.style.left = (selectorX - 8) + 'px';
        selector.style.top = (selectorY - 8) + 'px';
        
        const preview = document.getElementById('color-preview-wheel');
        if (preview) preview.style.backgroundColor = hexColor;
        
        const hexInput = document.getElementById('color-hex');
        const rgbInput = document.getElementById('color-rgb');
        
        if (hexInput) hexInput.value = hexColor;
        if (rgbInput) rgbInput.value = this.hexToRGBString(hexColor);
        
        this.colorPicker.hue = hsl.h;
        this.colorPicker.saturation = hsl.s;
        this.colorPicker.lightness = hsl.l;
    }

    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    hexToHSL(hex) {
        hex = hex.replace(/^#/, '');
        
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }

    hexToRGBString(hex) {
        hex = hex.replace(/^#/, '');
        
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    setColorFromHex(hex) {
        if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)) {
            this.currentColor = hex;
            document.getElementById('color-input').value = hex;
            this.updateCurrentColor();
            this.updateWheelPositionFromColor(hex);
        }
    }

    setColorFromRGB(rgbString) {
        const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            const hex = this.rgbToHex(r, g, b);
            this.setColorFromHex(hex);
        }
    }

    setupDefaultColors() {
        this.updateColorPaletteFromCurrentPalette();
    }

    // ========== FUNÇÕES RESTANTES ==========
    alignSelection(alignment) {
        if (!this.selection.active) return;
        
        const bounds = {
            minX: this.selection.x,
            minY: this.selection.y,
            maxX: this.selection.x + this.selection.width,
            maxY: this.selection.y + this.selection.height
        };
        
        const canvasCenterX = this.canvasSize / 2;
        const canvasCenterY = this.canvasSize / 2;
        
        let newX = bounds.minX;
        let newY = bounds.minY;
        
        switch(alignment) {
            case 'left':
                newX = 0;
                break;
            case 'center':
                newX = canvasCenterX - (bounds.maxX - bounds.minX) / 2;
                break;
            case 'right':
                newX = this.canvasSize - (bounds.maxX - bounds.minX);
                break;
            case 'top':
                newY = 0;
                break;
            case 'middle':
                newY = canvasCenterY - (bounds.maxY - bounds.minY) / 2;
                break;
            case 'bottom':
                newY = this.canvasSize - (bounds.maxY - bounds.minY);
        }
        
        this.selection.x = newX;
        this.selection.y = newY;
        this.updateCanvas();
        this.drawSelectionOverlay();
    }

    applyPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) return;
        
        if (preset.gridSize) {
            this.canvasSize = preset.gridSize * 64;
        }
        
        if (preset.pixelSize) {
            this.pixelSize = preset.pixelSize;
        }
        
        if (preset.backgroundColor) {
            this.backgroundColor = preset.backgroundColor;
        }
        
        if (preset.palette) {
            this.currentPalette = preset.palette;
            this.updateColorPaletteFromCurrentPalette();
        }
        
        if (preset.defaultTools) {
            this.selectTool(preset.defaultTools[0]);
        }
        
        switch(presetName) {
            case 'isometric':
                this.isometricGrid.enabled = true;
                if (preset.gridAngle) {
                    this.isometricGrid.angle = preset.gridAngle;
                }
                this.updateIsometricGrid();
                break;
                
            case 'animation':
                if (preset.fps) {
                    this.fps = preset.fps;
                    const fpsValue = document.getElementById('fps-value');
                    const fpsSlider = document.getElementById('fps-slider');
                    if (fpsValue) fpsValue.textContent = this.fps;
                    if (fpsSlider) fpsSlider.value = this.fps;
                }
                if (preset.onionSkin) {
                    this.onionSkin.enabled = true;
                    this.createOnionOverlay();
                }
                break;
        }
        
        this.setupCanvas();
        this.updateCanvas();
        this.updateUI();
    }

    toggleOutlinePanel() {
        const outlineSection = document.querySelector('.outline-controls');
        if (outlineSection) {
            outlineSection.style.display = outlineSection.style.display === 'none' ? 'block' : 'none';
        }
    }

    clearLassoSelection() {
        this.lasso.active = false;
        this.lasso.points = [];
        this.lasso.isDrawing = false;
        this.lasso.selection = null;
        this.lasso.transformMode = null;
        this.lasso.handles = [];
    }

    selectOutlineStyle(style) {
        this.outline.style = style;
        
        document.querySelectorAll('.outline-option').forEach(option => {
            option.classList.remove('active');
        });
        
        const target = event.currentTarget;
        if (target) {
            target.classList.add('active');
        }
    }

    applyOutlineToLayer() {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        this.saveState();
        
        const outlinePixels = this.findOutlinePixels(currentLayer);
        this.drawOutline(outlinePixels, currentLayer);
        
        this.updateCanvas();
    }

    findOutlinePixels(layer) {
        const imageData = layer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const outlinePixels = [];
        
        for (let y = 0; y < this.canvasSize; y++) {
            for (let x = 0; x < this.canvasSize; x++) {
                const alpha = this.getPixelAlpha(imageData, x, y);
                
                if (alpha > 0) {
                    const neighbors = [
                        [x-1, y], [x+1, y], [x, y-1], [x, y+1],
                        [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
                    ];
                    
                    for (const [nx, ny] of neighbors) {
                        if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {
                            const neighborAlpha = this.getPixelAlpha(imageData, nx, ny);
                            if (neighborAlpha === 0) {
                                outlinePixels.push({ x, y, nx, ny });
                                break;
                            }
                        } else {
                            outlinePixels.push({ x, y, nx, ny });
                            break;
                        }
                    }
                }
            }
        }
        
        return outlinePixels;
    }

    getPixelAlpha(imageData, x, y) {
        if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) return 0;
        const index = (y * this.canvasSize + x) * 4 + 3;
        return imageData.data[index];
    }

    drawOutline(outlinePixels, layer) {
        layer.ctx.save();
        
        switch(this.outline.style) {
            case 'solid':
                layer.ctx.fillStyle = this.outline.color;
                break;
            case 'dashed':
                layer.ctx.fillStyle = this.outline.color;
                break;
            case 'double':
                break;
            case 'gradient':
                const gradient = layer.ctx.createLinearGradient(0, 0, this.canvasSize, this.canvasSize);
                gradient.addColorStop(0, this.outline.gradient[0]);
                gradient.addColorStop(1, this.outline.gradient[1]);
                layer.ctx.fillStyle = gradient;
                break;
        }
        
        outlinePixels.forEach(pixel => {
            const { x, y } = this.outline.position === 'outside' ? 
                { x: pixel.nx, y: pixel.ny } : 
                { x: pixel.x, y: pixel.y };
            
            if (x >= 0 && x < this.canvasSize && y >= 0 && y < this.canvasSize) {
                layer.ctx.fillRect(x, y, 1, 1);
            }
        });
        
        layer.ctx.restore();
    }

    applyOutlineToSelection() {
        if (!this.lasso.selection && !this.selection.active) {
            this.showNotification('Select an area first!', 'error');
            return;
        }
        
        this.saveState();
        this.updateCanvas();
    }

    updateLayerAdjustment(property, value) {
        this.layerAdjustments[property] = value;
        
        const valueElement = document.getElementById(`layer-${property}-value`);
        if (valueElement) {
            if (property === 'opacity') {
                valueElement.textContent = `${value}%`;
            } else if (property === 'hue') {
                valueElement.textContent = `${value}°`;
            } else {
                valueElement.textContent = `${value}%`;
            }
        }
        
        this.applyLayerAdjustments();
    }

    applyLayerAdjustments() {
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        const adjustedCanvas = this.createAdjustedLayer(currentLayer);
        
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        currentFrame.layers.forEach((layer, index) => {
            if (this.layers[index].visible) {
                if (index === this.currentLayerIndex) {
                    this.ctx.drawImage(adjustedCanvas, 0, 0);
                } else {
                    this.ctx.drawImage(layer.canvas, 0, 0);
                }
            }
        });
    }

    createAdjustedLayer(layer) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = this.canvasSize;
        tempCanvas.height = this.canvasSize;
        const tempCtx = tempCanvas.getContext('2d');
        
        tempCtx.drawImage(layer.canvas, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, this.canvasSize, this.canvasSize);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] > 0) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                const hsl = this.rgbToHSL(r, g, b);
                
                hsl.h = (hsl.h + this.layerAdjustments.hue) % 360;
                if (hsl.h < 0) hsl.h += 360;
                
                hsl.s = Math.max(0, Math.min(100, hsl.s + this.layerAdjustments.saturation));
                
                hsl.l = Math.max(0, Math.min(100, hsl.l + this.layerAdjustments.brightness));
                
                const rgb = this.hslToRGB(hsl.h, hsl.s, hsl.l);
                
                data[i] = rgb.r;
                data[i + 1] = rgb.g;
                data[i + 2] = rgb.b;
                
                data[i + 3] = data[i + 3] * (this.layerAdjustments.opacity / 100);
            }
        }
        
        tempCtx.putImageData(imageData, 0, 0);
        
        return tempCanvas;
    }

    rgbToHSL(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: h * 360,
            s: s * 100,
            l: l * 100
        };
    }

    hslToRGB(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    resetLayerAdjustments() {
        this.layerAdjustments = {
            opacity: 100,
            brightness: 0,
            contrast: 0,
            hue: 0,
            saturation: 0,
            temperature: 0,
            tint: 0,
            vibrance: 0
        };
        
        Object.keys(this.layerAdjustments).forEach(property => {
            const slider = document.getElementById(`layer-${property}`);
            const valueElement = document.getElementById(`layer-${property}-value`);
            
            if (slider) {
                slider.value = property === 'opacity' ? 100 : 0;
            }
            
            if (valueElement) {
                valueElement.textContent = property === 'opacity' ? '100%' : 
                                         property === 'hue' ? '0°' : '0%';
            }
        });
        
        this.applyLayerAdjustments();
    }

    setupLayerAdjustmentListeners() {
        const adjustments = ['opacity', 'brightness', 'contrast', 'hue', 'saturation'];
        
        adjustments.forEach(property => {
            const slider = document.getElementById(`layer-${property}`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = property === 'hue' ? 
                        parseInt(e.target.value) : 
                        parseInt(e.target.value);
                    this.updateLayerAdjustment(property, value);
                });
            }
        });
    }

    setupOutlineListeners() {
        const thicknessSlider = document.getElementById('outline-thickness');
        const colorInput = document.getElementById('outline-color');
        
        if (thicknessSlider) {
            thicknessSlider.addEventListener('input', (e) => {
                this.outline.thickness = parseInt(e.target.value);
                const valueElement = document.getElementById('outline-thickness-value');
                if (valueElement) {
                    valueElement.textContent = `${this.outline.thickness}px`;
                }
            });
        }
        
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                this.outline.color = e.target.value;
            });
        }
    }

    initSnapSystem() {
        this.createSnapOverlay();
    }

    createSnapOverlay() {
        const container = document.querySelector('.canvas-container');
        if (!container) return;
        
        const overlay = document.createElement('canvas');
        overlay.className = 'snap-grid';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '5';
        overlay.style.display = 'none';
        container.appendChild(overlay);
        
        this.snapSystem.overlay = overlay;
    }

    toggleSnapSystem() {
        this.snapSystem.enabled = !this.snapSystem.enabled;
        
        if (this.snapSystem.enabled) {
            this.showSnapOverlay();
        } else {
            this.hideSnapOverlay();
        }
    }

    showSnapOverlay() {
        if (!this.snapSystem.overlay) return;
        
        const overlay = this.snapSystem.overlay;
        const container = document.querySelector('.canvas-container');
        const rect = container.getBoundingClientRect();
        
        overlay.width = rect.width;
        overlay.height = rect.height;
        
        const ctx = overlay.getContext('2d');
        ctx.clearRect(0, 0, overlay.width, overlay.height);
        
        const snapSize = 8 * this.zoom;
        const offset = 0.5;
        
        ctx.strokeStyle = 'rgba(100, 149, 237, 0.3)';
        ctx.lineWidth = 1;
        
        for (let x = 0; x < rect.width; x += snapSize) {
            ctx.beginPath();
            ctx.moveTo(x + offset, 0);
            ctx.lineTo(x + offset, rect.height);
            ctx.stroke();
        }
        
        for (let y = 0; y < rect.height; y += snapSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + offset);
            ctx.lineTo(rect.width, y + offset);
            ctx.stroke();
        }
        
        ctx.fillStyle = 'rgba(100, 149, 237, 0.5)';
        for (let x = 0; x < rect.width; x += snapSize) {
            for (let y = 0; y < rect.height; y += snapSize) {
                ctx.beginPath();
                ctx.arc(x + offset, y + offset, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        overlay.style.display = 'block';
    }

    hideSnapOverlay() {
        if (this.snapSystem.overlay) {
            this.snapSystem.overlay.style.display = 'none';
        }
    }

    showBackgroundLayerWarning() {
        const warning = document.createElement('div');
        warning.innerHTML = '⚠️ <strong>Protected background layer!</strong><br>Create a new layer for drawing.';
        warning.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 152, 0, 0.95);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
            z-index: 10000;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            animation: fadeInOut 2s ease;
            pointer-events: none;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -40%); }
                15% { opacity: 1; transform: translate(-50%, -50%); }
                85% { opacity: 1; transform: translate(-50%, -50%); }
                100% { opacity: 0; transform: translate(-50%, -60%); }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(warning);
        
        setTimeout(() => {
            if (warning.parentNode) warning.parentNode.removeChild(warning);
            if (style.parentNode) style.parentNode.removeChild(style);
        }, 2000);
    }
    
        // ========== EXPORT METHODS  ==========
    exportSingleFrameHighRes(format, scale, customName) {
        const currentFrame = this.frames[this.currentFrameIndex];
        if (!currentFrame) return;
        
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = this.canvasSize * scale;
        outputCanvas.height = this.canvasSize * scale;
        const outputCtx = outputCanvas.getContext('2d');
        outputCtx.imageSmoothingEnabled = false;
        
        currentFrame.layers.forEach((layer, index) => {
            if (this.layers[index].visible) {
                outputCtx.drawImage(
                    layer.canvas,
                    0, 0, this.canvasSize, this.canvasSize,
                    0, 0, outputCanvas.width, outputCanvas.height
                );
            }
        });
        
        const link = document.createElement('a');
        const fileName = customName || `pixel-art-${scale}x`;
        
        if (format === 'jpeg') {
            link.download = `${fileName}.jpg`;
            link.href = outputCanvas.toDataURL('image/jpeg', this.exportSettings.quality);
        } else if (format === 'webp') {
            link.download = `${fileName}.webp`;
            link.href = outputCanvas.toDataURL('image/webp', this.exportSettings.quality);
        } else {
            link.download = `${fileName}.png`;
            link.href = outputCanvas.toDataURL('image/png');
        }
        
        link.click();
    }
    
    

// ========== SHAPE MENU METHODS ==========
showShapeMenu(x, y) {

    if (this.shapeMenu.visible) {
        this.hideShapeMenu();
        return;
    }
    
    if (!this.shapeMenu.element) {
        this.createShapeMenu();
    }
    

    this.shapeMenu.position.x = x;
    this.shapeMenu.position.y = y;
    
    const menu = this.shapeMenu.element;
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'grid';
    
    this.shapeMenu.visible = true;
    

    setTimeout(() => {
        document.addEventListener('click', this.handleClickOutsideShapeMenu.bind(this));
    }, 10);
}

hideShapeMenu() {
    if (this.shapeMenu.element) {
        this.shapeMenu.element.style.display = 'none';
    }
    this.shapeMenu.visible = false;
    
    
}

handleClickOutsideShapeMenu(e) {
    const menu = this.shapeMenu.element;
    if (menu && !menu.contains(e.target) && 
        !e.target.closest('.tool[onclick*="selectTool(\'shape\')"]') &&
        !e.target.closest('.tool[data-tool="shape"]')) {
        this.hideShapeMenu();
    }
}

createShapeMenu() {
    const menu = document.createElement('div');
    menu.className = 'shape-menu';
    menu.style.cssText = `
        position: fixed;
        display: none;
        
        border: 1px solid #555;
        border-radius: 8px;
        padding: 8px;
        z-index: 10000;
        margin-left: -105px !important;
        grid-template-columns: repeat(5, 40px);
        gap: 4px;
                background: rgba(32, 33, 37, 0.75) !important;
        backdrop - filter: blur(3 px) !important; -
        webkit - backdrop - filter: blur(10 px) !important;
        border: 3 px solid rgba(0, 0, 0, 0.3) !important;
        box - shadow:
            inset 0 0 0 2 px rgba(73, 75, 78, 0.3),
            0 3 px 0 rgba(0, 0, 0, 0.3) !important;
    `;
    
    // buttons for each shape
    this.shapeMenu.shapes.forEach(shape => {
        const button = document.createElement('button');
        button.className = 'shape-btn';
        button.dataset.shape = shape.id;
        button.title = shape.name;
        button.innerHTML = `<i class="${shape.icon}"></i>`;
        button.style.cssText = `
            width: 40px;
            height: 40px;
            border: 2px solid transparent;
            border-radius: 4px;
            background: #282A30;
            color: #AEAEAE;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        `;
        
        button.addEventListener('mouseenter', () => {
            button.style.background = '#4d4d4d';
            button.style.borderColor = '#666';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.background = '#3d3d3d';
            button.style.borderColor = 'transparent';
        });
        
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectShapeTool(shape.id);
            this.hideShapeMenu();
        });
        
        menu.appendChild(button);
    });
    
    // Adds fill controls
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'shape-controls';
    controlsContainer.style.cssText = `
        grid-column: 1 / -1;
        display: flex;
        gap: 8px;
        align-items: center;
        padding: 8px 0;
        border-top: 1px solid #555;
        margin-top: 8px;
    `;
    
    // Fill button
    const fillToggle = document.createElement('button');
    fillToggle.className = 'shape-fill-toggle';
    fillToggle.innerHTML = `
        <i class="fas fa-fill"></i>
        <span>${this.shapeTool.filled ? 'Filled' : 'Leaked'}</span>
    `;
    fillToggle.style.cssText = `
        background: ${this.shapeTool.filled ? '#282A30' : '#666'};
        color: white;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
    `;
    
    fillToggle.addEventListener('click', () => {
        this.shapeTool.filled = !this.shapeTool.filled;
        fillToggle.style.background = this.shapeTool.filled ? '#4CAF50' : '#666';
        fillToggle.innerHTML = `
            <i class="fas ${this.shapeTool.filled ? 'fa-fill' : 'fa-square'}"></i>
            <span>${this.shapeTool.filled ? 'Filled' : 'Leaked'}</span>
        `;
    });
    
    // Controlling the sides for a polygon
    const sidesControl = document.createElement('div');
    sidesControl.className = 'shape-sides-control';
    sidesControl.style.cssText = `
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #ccc;
    `;
    
    const sidesLabel = document.createElement('span');
    sidesLabel.textContent = 'Lados:';
    
    const sidesInput = document.createElement('input');
    sidesInput.type = 'number';
    sidesInput.min = '3';
    sidesInput.max = '20';
    sidesInput.value = this.shapeTool.sides;
    sidesInput.style.cssText = `
        width: 40px;
        background: #3d3d3d;
        border: 1px solid #555;
        color: white;
        padding: 2px 4px;
        border-radius: 3px;
    `;
    
    sidesInput.addEventListener('change', (e) => {
        this.shapeTool.sides = parseInt(e.target.value);
    });
    
    sidesControl.appendChild(sidesLabel);
    sidesControl.appendChild(sidesInput);
    
    controlsContainer.appendChild(fillToggle);
    controlsContainer.appendChild(sidesControl);
    menu.appendChild(controlsContainer);
    
    document.body.appendChild(menu);
    this.shapeMenu.element = menu;
}

selectShapeTool(shapeType) {
    // Switch to the shapes tool
    this.currentTool = shapeType;
    this.shapeTool.type = shapeType;
    
    // Update UI
    document.querySelectorAll('.tool').forEach(t => t.classList.remove('active'));
    
    // Find and activate the shape tool button.
    const shapeToolElement = document.querySelector('[data-tool="shape"]') || 
                           document.querySelector('.tool[onclick*="selectTool(\'shape\')"]');
    if (shapeToolElement) {
        shapeToolElement.classList.add('active');
    }
    
    // Update cursor
    this.canvas.style.cursor = 'crosshair';
    
    // Show specific shape settings
    this.showToolSettings('shape');
    
    this.showNotification(`Tool ${this.getShapeName(shapeType)} selected!`);
}

getShapeName(shapeType) {
    const shapeNames = {
        'rectangle': 'Retângulo',
        'triangle': 'Triângulo',
        'polygon': 'Polígono',
        'ellipse': 'Elipse',
        'star': 'Estrela',
        'heart': 'Coração',
        'arrow': 'Seta',
        'cross': 'Cruz'
    };
    return shapeNames[shapeType] || shapeType;
}


drawShapePreview() {
    if (!this.isDrawing || !this.shapeStartX || !this.shapeStartY) return;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvasSize;
    tempCanvas.height = this.canvasSize;
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw the current content
    tempCtx.drawImage(this.canvas, 0, 0);
    
    // Calculate bounding box for the preview as well.
    const minX = Math.min(this.shapeStartX, this.lastX);
    const minY = Math.min(this.shapeStartY, this.lastY);
    const maxX = Math.max(this.shapeStartX, this.lastX);
    const maxY = Math.max(this.shapeStartY, this.lastY);
    
    // Draw the shape in preview using the bounding box.
    this.drawShapeOnContext(tempCtx, minX, minY, maxX, maxY, true);
    
    // Update canvas
    this.ctx.drawImage(tempCanvas, 0, 0);
}

 
drawShapeOnContext(ctx, x1, y1, x2, y2, isPreview = false) {

    const minX = Math.min(x1, x2);
    const minY = Math.min(y1, y2);
    const maxX = Math.max(x1, x2);
    const maxY = Math.max(y1, y2);
    const width = maxX - minX;
    const height = maxY - minY;
    

    if (width === 0 || height === 0) return;
    
    if (isPreview) {
        ctx.strokeStyle = this.currentColor + '80'; 
        ctx.fillStyle = this.currentColor + '40'; 
        ctx.lineWidth = 1;
    } else {
        ctx.strokeStyle = this.shapeTool.strokeColor;
        ctx.fillStyle = this.currentColor;
        ctx.lineWidth = this.shapeTool.strokeWidth;
    }
    
    // Draw the shape based on the type.
    switch (this.shapeTool.type) {
        case 'rectangle':
            if (this.shapeTool.filled) {
                ctx.fillRect(minX, minY, width, height);
            }
            ctx.strokeRect(minX, minY, width, height);
            break;
            
            
        case 'ellipse':
            this.drawEllipseWithHitbox(ctx, minX, minY, maxX, maxY);
            break;
            
        case 'triangle':
            this.drawTriangleWithHitbox(ctx, minX, minY, maxX, maxY);
            break;
            
        case 'polygon':
            this.drawPolygonWithHitbox(ctx, minX, minY, maxX, maxY);
            break;
            
        case 'star':
            this.drawStarWithHitbox(ctx, minX, minY, maxX, maxY);
            break;
            
        case 'heart':
            this.drawHeartWithHitbox(ctx, minX, minY, maxX, maxY);
            break;
            
        case 'arrow':
            this.drawArrow(ctx, x1, y1, x2, y2, width / 10);
            if (this.shapeTool.filled) {
                ctx.fill();
            }
            ctx.stroke();
            break;
            
        case 'cross':
            ctx.beginPath();
            // Vertical line
            ctx.moveTo(minX + width / 2, minY);
            ctx.lineTo(minX + width / 2, maxY);
            // Horizontal line
            ctx.moveTo(minX, minY + height / 2);
            ctx.lineTo(maxX, minY + height / 2);
            ctx.stroke();
            break;
    }
}



drawEllipseWithHitbox(ctx, minX, minY, maxX, maxY) {
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const radiusX = width / 2;
    const radiusY = height / 2;
    
    // Draw an ellipse
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (this.shapeTool.filled) {
        ctx.fill();
    }
    ctx.stroke();
}


drawTriangleWithHitbox(ctx, minX, minY, maxX, maxY) {

    const width = maxX - minX;
    const height = maxY - minY;
    

    const topX = minX + width / 2;
    const topY = minY;
    const leftX = minX;
    const leftY = maxY;
    const rightX = maxX;
    const rightY = maxY;
    
    // Draw a triangle
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    
    if (this.shapeTool.filled) {
        ctx.fill();
    }
    ctx.stroke();
}


drawPolygonWithHitbox(ctx, minX, minY, maxX, maxY) {
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const radius = Math.min(width, height) / 2;
    const sides = this.shapeTool.sides || 6;
    
    // Draw a polygon
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    
    if (this.shapeTool.filled) {
        ctx.fill();
    }
    ctx.stroke();
}



drawStarWithHitbox(ctx, minX, minY, maxX, maxY) {
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const outerRadius = Math.min(width, height) / 2;
    const innerRadius = outerRadius / 2;
    const points = 5;
    
    // Draw a star
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI / points) - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    
    if (this.shapeTool.filled) {
        ctx.fill();
    }
    ctx.stroke();
}


drawHeartWithHitbox(ctx, minX, minY, maxX, maxY) {
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const size = Math.min(width, height) / 2;
    
    // Draw a heart
    ctx.beginPath();
    // Left side of the heart
    ctx.moveTo(centerX, centerY + size / 2);
    ctx.bezierCurveTo(
        centerX - size, centerY - size,
        centerX - size * 2, centerY + size,
        centerX, centerY + size * 2
    );
    // Right side of the heart
    ctx.bezierCurveTo(
        centerX + size * 2, centerY + size,
        centerX + size, centerY - size,
        centerX, centerY + size / 2
    );
    ctx.closePath();
    
    if (this.shapeTool.filled) {
        ctx.fill();
    }
    ctx.stroke();
}



// Auxiliary methods for drawing complex shapes
drawPolygon(ctx, centerX, centerY, radius, sides) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
}

drawStar(ctx, centerX, centerY, radius, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI / points) - Math.PI / 2;
        const r = i % 2 === 0 ? radius : radius / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
}

drawHeart(ctx, centerX, centerY, size) {
    ctx.beginPath();
    // Left side of the heart
    ctx.moveTo(centerX, centerY + size / 2);
    ctx.bezierCurveTo(
        centerX - size, centerY - size,
        centerX - size * 2, centerY + size,
        centerX, centerY + size * 2
    );
    // Right side of the heart
    ctx.bezierCurveTo(
        centerX + size * 2, centerY + size,
        centerX + size, centerY - size,
        centerX, centerY + size / 2
    );
    ctx.closePath();
}

drawArrow(ctx, x1, y1, x2, y2, arrowSize) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    
    ctx.beginPath();
    // Main line
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    // Arrowhead
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowSize * Math.cos(angle - Math.PI / 6),
        y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowSize * Math.cos(angle + Math.PI / 6),
        y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
}

drawFinalShape() {
    if (!this.isDrawing || !this.shapeStartX || !this.shapeStartY) return;
    
    // Create a new shape object
    const shape = {
        type: this.currentTool,
        x1: this.shapeStartX,
        y1: this.shapeStartY,
        x2: this.lastX,
        y2: this.lastY,
        filled: this.shapeTool.filled,
        color: this.currentColor,
        strokeColor: this.shapeTool.strokeColor,
        strokeWidth: this.shapeTool.strokeWidth,
        sides: this.shapeTool.sides,
        active: true,
        isMoving: false,
        isResizing: false
    };
    
    // Add to list of active forms
    this.activeShapes.push(shape);
    this.activeShape = shape;
    
    // To draw the shape permanently
    this.drawShapePermanently(shape);
    
    this.updateCanvas();
    this.updateFrameThumbnail(this.currentFrameIndex);
}


drawShapePermanently(shape) {
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    // Calculate bounding box
    const minX = Math.min(shape.x1, shape.x2);
    const minY = Math.min(shape.y1, shape.y2);
    const maxX = Math.max(shape.x1, shape.x2);
    const maxY = Math.max(shape.y1, shape.y2);
    
    
    currentLayer.ctx.strokeStyle = shape.strokeColor || '#000000';
    currentLayer.ctx.lineWidth = shape.strokeWidth || 1;
    
    if (shape.filled) {
        currentLayer.ctx.fillStyle = shape.color || '#000000';
    }
    
    // Draw the shape based on the type.
    switch (shape.type) {
        case 'rectangle':
            if (shape.filled) {
                currentLayer.ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
            }
            currentLayer.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
            break;
            
        case 'triangle':
            this.drawTrianglePermanently(currentLayer.ctx, minX, minY, maxX, maxY, shape.filled);
            break;
            
        case 'polygon':
            this.drawPolygonPermanently(currentLayer.ctx, minX, minY, maxX, maxY, shape.filled, shape.sides || 6);
            break;
            
        case 'ellipse':
            this.drawEllipsePermanently(currentLayer.ctx, minX, minY, maxX, maxY, shape.filled);
            break;
            
        case 'star':
            this.drawStarPermanently(currentLayer.ctx, minX, minY, maxX, maxY, shape.filled);
            break;
            
        case 'heart':
            this.drawHeartPermanently(currentLayer.ctx, minX, minY, maxX, maxY, shape.filled);
            break;
            
        case 'arrow':
            this.drawArrowPermanently(currentLayer.ctx, shape.x1, shape.y1, shape.x2, shape.y2, shape.filled);
            break;
            
        case 'cross':
            this.drawCrossPermanently(currentLayer.ctx, minX, minY, maxX, maxY);
            break;
    }
}




drawTrianglePermanently(ctx, minX, minY, maxX, maxY, filled) {
    const topX = (minX + maxX) / 2;
    const topY = minY;
    const leftX = minX;
    const leftY = maxY;
    const rightX = maxX;
    const rightY = maxY;
    
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.closePath();
    if (filled) ctx.fill();
    ctx.stroke();
}

drawPolygonPermanently(ctx, minX, minY, maxX, maxY, filled, sides) {
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radius = Math.min(maxX - minX, maxY - minY) / 2;
    
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (filled) ctx.fill();
    ctx.stroke();
}


drawEllipsePermanently(ctx, minX, minY, maxX, maxY, filled) {
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const radiusX = (maxX - minX) / 2;
    const radiusY = (maxY - minY) / 2;
    
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
    if (filled) ctx.fill();
    ctx.stroke();
}

drawStarPermanently(ctx, minX, minY, maxX, maxY, filled) {
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const outerRadius = Math.min(maxX - minX, maxY - minY) / 2;
    const innerRadius = outerRadius / 2;
    const points = 5;
    
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI / points) - Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    if (filled) ctx.fill();
    ctx.stroke();
}

drawHeartPermanently(ctx, minX, minY, maxX, maxY, filled) {
    const width = maxX - minX;
    const height = maxY - minY;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const size = Math.min(width, height) / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + size / 2);
    ctx.bezierCurveTo(
        centerX - size, centerY - size,
        centerX - size * 2, centerY + size,
        centerX, centerY + size * 2
    );
    ctx.bezierCurveTo(
        centerX + size * 2, centerY + size,
        centerX + size, centerY - size,
        centerX, centerY + size / 2
    );
    ctx.closePath();
    if (filled) ctx.fill();
    ctx.stroke();
}

drawArrowPermanently(ctx, x1, y1, x2, y2, filled) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const arrowSize = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 4;
    
    ctx.beginPath();
    // Main line
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    
    // Arrowhead
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowSize * Math.cos(angle - Math.PI / 6),
        y2 - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    
    ctx.moveTo(x2, y2);
    ctx.lineTo(
        x2 - arrowSize * Math.cos(angle + Math.PI / 6),
        y2 - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
}

drawCrossPermanently(ctx, minX, minY, maxX, maxY) {
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const size = Math.min(maxX - minX, maxY - minY) / 3;
    
    ctx.beginPath();
    // Vertical line
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX, centerY + size);
    // Horizontal line
    ctx.moveTo(centerX - size, centerY);
    ctx.lineTo(centerX + size, centerY);
    ctx.stroke();
}


// ========== OUTLINE SYSTEM ==========
initOutlineSystem() {
    this.setupOutlineListeners();
    this.createOutlinePreviewCanvas();
}

setupOutlineListeners() {
    // Listener for thickness
    const thicknessSlider = document.getElementById('outline-thickness');
    if (thicknessSlider) {
        thicknessSlider.addEventListener('input', (e) => {
            this.outline.thickness = parseInt(e.target.value);
            const valueElement = document.getElementById('outline-thickness-value');
            if (valueElement) {
                valueElement.textContent = `${this.outline.thickness}px`;
            }
            console.log('Updated border thickness:', this.outline.thickness);
        });
    }
    
    // Listener for color
    const colorInput = document.getElementById('outline-color');
    if (colorInput) {
        colorInput.addEventListener('input', (e) => {
            this.outline.color = e.target.value;
            console.log('Updated border color:', this.outline.color);
        });
    }
    
    // Listener for position
    const positionSelect = document.getElementById('outline-position');
    if (positionSelect) {
        positionSelect.addEventListener('change', (e) => {
            this.outline.position = e.target.value;
            console.log('Updated edge position:', this.outline.position);
        });
    }
    
    // Listener for style
    const styleSelect = document.getElementById('outline-style');
    if (styleSelect) {
        styleSelect.addEventListener('change', (e) => {
            this.outline.style = e.target.value;
            console.log('Estilo da borda atualizado:', this.outline.style);
        });
    }
    
    const applyToSelect = document.getElementById('outline-apply-to');
    if (applyToSelect) {
        applyToSelect.addEventListener('change', (e) => {
            this.outline.applyTo = e.target.value;
            console.log('Aplicar a:', this.outline.applyTo);
        });
    }
}

createOutlinePreviewCanvas() {
    // Canvas for preview
    this.outline.previewCanvas = document.createElement('canvas');
    this.outline.previewCanvas.width = this.canvasSize;
    this.outline.previewCanvas.height = this.canvasSize;
    this.outline.previewCtx = this.outline.previewCanvas.getContext('2d');
}

applyOutline() {
    this.saveState();
    
    const applyTo = this.outline.applyTo || 'layer';
    
    switch(applyTo) {
        case 'layer':
            this.applyOutlineToCurrentLayer();
            break;
        case 'selection':
            this.applyOutlineToSelection();
            break;
        case 'all':
            this.applyOutlineToAllLayers();
            break;
    }
    
    this.updateCanvas();
    this.showNotification(`Border applied to ${applyTo === 'layer' ? 'current layer' : applyTo}`);
}

applyOutlineToCurrentLayer() {
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    

    const outlinePixels = this.findOutlinePixels(currentLayer);
    

    this.drawOutline(outlinePixels, currentLayer);
}

applyOutlineToSelection() {
    if (!this.selection.active) {
        this.showNotification('No active selection!', 'error');
        return;
    }
    
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    // Create a copy of the selected area
    const selectionImage = currentLayer.ctx.getImageData(
        this.selection.x, this.selection.y,
        this.selection.width, this.selection.height
    );
    
    // Find borders in the selection
    const outlinePixels = this.findOutlinePixelsInImageData(selectionImage, 
        this.selection.width, this.selection.height);
    
    // Apply border to selected area.
    this.drawOutlineOnSelection(outlinePixels, currentLayer);
}

applyOutlineToAllLayers() {
    const currentFrame = this.frames[this.currentFrameIndex];
    
    currentFrame.layers.forEach((layer, index) => {
        if (this.layers[index].visible) {
            const outlinePixels = this.findOutlinePixels(layer);
            this.drawOutline(outlinePixels, layer);
        }
    });
}

findOutlinePixels(layer) {
    const imageData = layer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const outlinePixels = [];
    
    // Go through all the pixels
    for (let y = 0; y < this.canvasSize; y++) {
        for (let x = 0; x < this.canvasSize; x++) {
            // Check if the current pixel is not transparent.
            if (this.getPixelAlpha(imageData, x, y) > 0) {
                // Check neighbors (4 directions)
                const neighbors = [
                    [x-1, y], [x+1, y], [x, y-1], [x, y+1]
                ];
                
                let isOutlinePixel = false;
                
                for (const [nx, ny] of neighbors) {
                    // If the neighbor is off-limits OR transparent
                    if (nx < 0 || nx >= this.canvasSize || ny < 0 || ny >= this.canvasSize) {
                        isOutlinePixel = true;
                        break;
                    }
                    
                    if (this.getPixelAlpha(imageData, nx, ny) === 0) {
                        isOutlinePixel = true;
                        break;
                    }
                }
                
                if (isOutlinePixel) {
                    outlinePixels.push({ x, y });
                }
            }
        }
    }
    
    return outlinePixels;
}

findOutlinePixelsInImageData(imageData, width, height) {
    const outlinePixels = [];
    const data = imageData.data;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            

            if (data[index + 3] > 0) {
                let isOutlinePixel = false;
                

                const neighbors = [
                    [x-1, y], [x+1, y], [x, y-1], [x, y+1]
                ];
                
                for (const [nx, ny] of neighbors) {

                    if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
                        isOutlinePixel = true;
                        break;
                    }
                    

                    const neighborIndex = (ny * width + nx) * 4;
                    if (data[neighborIndex + 3] === 0) {
                        isOutlinePixel = true;
                        break;
                    }
                }
                
                if (isOutlinePixel) {
                    outlinePixels.push({ x, y });
                }
            }
        }
    }
    
    return outlinePixels;
}

drawOutline(outlinePixels, layer) {
    layer.ctx.save();
    

    switch(this.outline.style) {
        case 'solid':
            layer.ctx.fillStyle = this.outline.color;
            break;
        case 'dashed':
            
            layer.ctx.fillStyle = this.outline.color;
            break;
        case 'double':

            layer.ctx.fillStyle = this.outline.color;
            break;
        case 'gradient':
            const gradient = layer.ctx.createLinearGradient(0, 0, this.canvasSize, this.canvasSize);
            gradient.addColorStop(0, this.outline.color);
            gradient.addColorStop(1, this.outline.color + '80'); 
            layer.ctx.fillStyle = gradient;
            break;
        default:
            layer.ctx.fillStyle = this.outline.color;
    }
    
    
    outlinePixels.forEach(pixel => {
        const { x, y } = pixel;
        
        if (this.outline.position === 'outside') {
            
            const neighbors = [
                [x-1, y], [x+1, y], [x, y-1], [x, y+1],
                [x-1, y-1], [x+1, y-1], [x-1, y+1], [x+1, y+1]
            ];
            
            neighbors.forEach(([nx, ny]) => {
                if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {

                    const currentFrame = this.frames[this.currentFrameIndex];
                    const currentLayer = currentFrame.layers[this.currentLayerIndex];
                    const neighborAlpha = this.getPixelAlphaFromLayer(currentLayer, nx, ny);
                    
                    if (neighborAlpha === 0) {
                        layer.ctx.fillRect(nx, ny, 1, 1);
                     
                     
                        if (this.outline.thickness > 1) {
                            for (let t = 2; t <= this.outline.thickness; t++) {
                                
                                const thickNeighbors = [
                                    [nx-t+1, ny], [nx+t-1, ny], [nx, ny-t+1], [nx, ny+t-1]
                                ];
                                
                                thickNeighbors.forEach(([tnx, tny]) => {
                                    if (tnx >= 0 && tnx < this.canvasSize && tny >= 0 && tny < this.canvasSize) {
                                        const thickAlpha = this.getPixelAlphaFromLayer(currentLayer, tnx, tny);
                                        if (thickAlpha === 0) {
                                            layer.ctx.fillRect(tnx, tny, 1, 1);
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            });
        } 

        else if (this.outline.position === 'inside') {

            layer.ctx.fillRect(x, y, 1, 1);
            
            
            if (this.outline.thickness > 1) {
                for (let t = 1; t < this.outline.thickness; t++) {
                    const innerPixels = [
                        [x-t, y], [x+t, y], [x, y-t], [x, y+t]
                    ];
                    
                    innerPixels.forEach(([ix, iy]) => {
                        if (ix >= 0 && ix < this.canvasSize && iy >= 0 && iy < this.canvasSize) {
                            const innerAlpha = this.getPixelAlphaFromLayer(layer, ix, iy);
                            if (innerAlpha > 0) {
                                layer.ctx.fillRect(ix, iy, 1, 1);
                            }
                        }
                    });
                }
            }
        }
        
        else {

            layer.ctx.fillRect(x, y, 1, 1);
        }
    });
    
    layer.ctx.restore();
}

drawOutlineOnSelection(outlinePixels, layer) {
    layer.ctx.save();
    layer.ctx.fillStyle = this.outline.color;
    
    outlinePixels.forEach(pixel => {
        const { x, y } = pixel;
        const canvasX = this.selection.x + x;
        const canvasY = this.selection.y + y;
        

        if (this.outline.position === 'outside') {

            const neighbors = [
                [canvasX-1, canvasY], [canvasX+1, canvasY],
                [canvasX, canvasY-1], [canvasX, canvasY+1]
            ];
            
            neighbors.forEach(([nx, ny]) => {
                if (nx >= this.selection.x && nx < this.selection.x + this.selection.width &&
                    ny >= this.selection.y && ny < this.selection.y + this.selection.height) {
                    
                    const neighborIndex = ((ny - this.selection.y) * this.selection.width + 
                                          (nx - this.selection.x)) * 4;
                    const imageData = layer.ctx.getImageData(
                        this.selection.x, this.selection.y,
                        this.selection.width, this.selection.height
                    );
                    
                    if (imageData.data[neighborIndex + 3] === 0) {
                        layer.ctx.fillRect(nx, ny, 1, 1);
                    }
                } else {

                    layer.ctx.fillRect(nx, ny, 1, 1);
                }
            });
        } else {
            // Inner edge
            layer.ctx.fillRect(canvasX, canvasY, 1, 1);
        }
    });
    
    layer.ctx.restore();
}

getPixelAlphaFromLayer(layer, x, y) {
    if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) {
        return 0;
    }
    
    const imageData = layer.ctx.getImageData(x, y, 1, 1);
    return imageData.data[3];
}

previewOutline() {
    // Create preview
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    // Save original state
    const originalImageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    
    // Temporarily applies border
    const outlinePixels = this.findOutlinePixels(currentLayer);
    this.drawOutline(outlinePixels, currentLayer);
    
    // Update canvas
    this.updateCanvas();
    
    // Restore after 2 seconds
    setTimeout(() => {
        currentLayer.ctx.putImageData(originalImageData, 0, 0);
        this.updateCanvas();
        this.showNotification('Preview of the completed border');
    }, 2000);
}

clearOutline() {

    this.saveState();
    
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    
    const imageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const borderColor = this.hexToRgb(this.outline.color);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === borderColor.r &&
            imageData.data[i + 1] === borderColor.g &&
            imageData.data[i + 2] === borderColor.b) {

            const x = (i / 4) % this.canvasSize;
            const y = Math.floor((i / 4) / this.canvasSize);
            
            const neighbors = [
                [x-1, y], [x+1, y], [x, y-1], [x, y+1]
            ];
            
            let hasTransparentNeighbor = false;
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < this.canvasSize && ny >= 0 && ny < this.canvasSize) {
                    const neighborIndex = (ny * this.canvasSize + nx) * 4;
                    if (imageData.data[neighborIndex + 3] === 0) {
                        hasTransparentNeighbor = true;
                        break;
                    }
                }
            }
            

            if (hasTransparentNeighbor) {
                imageData.data[i + 3] = 0;
            }
        }
    }
    
    currentLayer.ctx.putImageData(imageData, 0, 0);
    this.updateCanvas();
    this.showNotification('Borda removida');
}

// Auxiliary function
getPixelAlpha(imageData, x, y) {
    if (x < 0 || x >= this.canvasSize || y < 0 || y >= this.canvasSize) {
        return 0;
    }
    const index = (y * this.canvasSize + x) * 4;
    return imageData.data[index + 3];
}


// ========== METHOD FOR UPLOADING GALLERY PROJECTS ==========
loadProjectFromGallery(imageDataURL, projectName = "Gallery Project") {
    console.log('Loading gallery project:', projectName);
    
    //  Saves current state in history.
    this.saveState();
    
    //  Make sure you have at least 1 frame and 1 layer.
    if (this.frames.length === 0) {
        this.createNewFrame();
    }
    if (this.layers.length === 0) {
        this.createNewLayer('Base');
    }
    
    //  Reset to the first layer and first frame.
    this.currentFrameIndex = 0;
    this.currentLayerIndex = 0;
    
    // Load the image
    const img = new Image();
    img.onload = () => {
        console.log('Image uploaded, size:', img.width, 'x', img.height);
        
        const currentFrame = this.frames[this.currentFrameIndex];
        const currentLayer = currentFrame.layers[this.currentLayerIndex];
        
        //  Clears only the current layer (not all layers).
        currentLayer.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        //  Draw the image on the current layer.
        currentLayer.ctx.drawImage(img, 0, 0, this.canvasSize, this.canvasSize);
        
        //  Update UI
        this.updateCanvas();
        this.updateFrameThumbnail(this.currentFrameIndex);
        this.updateAllThumbnails();
        

        
        //  Check if the image was actually drawn.
        const imageData = currentLayer.ctx.getImageData(0, 0, 10, 10);
        const hasPixels = Array.from(imageData.data).some(value => value !== 0);
        console.log(' Loaded pixels?', hasPixels ? 'YES' : 'NO');
        
    };
    
    img.onerror = (error) => {
        console.error(' Error loading image:', error);
        this.showNotification(' Error loading project!', 'error');
    };
    
    img.src = imageDataURL;
}

// ========== METHOD FOR VERIFYING CONTENT ==========
checkCanvasContent() {
    const currentFrame = this.frames[this.currentFrameIndex];
    const currentLayer = currentFrame.layers[this.currentLayerIndex];
    
    const imageData = currentLayer.ctx.getImageData(0, 0, this.canvasSize, this.canvasSize);
    const nonTransparentPixels = Array.from(imageData.data).filter((value, index) => {
        return (index + 1) % 4 === 0 && value > 0; // Alpha channel
    }).length;
    
    console.log(` Canvas has ${nonTransparentPixels} non-transparent pixels`);
    return nonTransparentPixels > 0;
}



   // ========== METHOD FOR RESIZING A PROJECT ==========
resizeProject(newWidth, newHeight) {
    // Saved status in history
    this.saveState();
    
    //  Retrieves data from all current frames and layers.
    const oldFramesData = [];
    this.frames.forEach(frame => {
        const frameData = {
            layers: frame.layers.map(layer => {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = this.canvasSize;
                tempCanvas.height = this.canvasSize;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(layer.canvas, 0, 0);
                return tempCanvas;
            })
        };
        oldFramesData.push(frameData);
    });
    
    //  Update canvas size
    this.canvasSize = Math.max(newWidth, newHeight);
    this.canvas.width = newWidth;
    this.canvas.height = newHeight;
    
    //  Clear and recreate frames with new size.
    this.frames = [];
    oldFramesData.forEach((frameData, frameIndex) => {
        const newFrame = {
            layers: [],
            index: frameIndex
        };
        
        // For each layer of the old frame
        frameData.layers.forEach((oldLayerCanvas, layerIndex) => {
            const newLayerCanvas = document.createElement('canvas');
            newLayerCanvas.width = newWidth;
            newLayerCanvas.height = newHeight;
            const newLayerCtx = newLayerCanvas.getContext('2d');
            
            // Preserve transparency
            newLayerCtx.clearRect(0, 0, newWidth, newHeight);
            
            // Redesign old (centralized) content
            const xOffset = Math.floor((newWidth - this.canvasSize) / 2);
            const yOffset = Math.floor((newHeight - this.canvasSize) / 2);
            newLayerCtx.drawImage(oldLayerCanvas, xOffset, yOffset);
            
            newFrame.layers.push({
                canvas: newLayerCanvas,
                ctx: newLayerCtx
            });
        });
        
        this.frames.push(newFrame);
    });
    
    // Update layer sizes in the main array.
    this.layers.forEach(layer => {
        layer.canvas.width = newWidth;
        layer.canvas.height = newHeight;
    });
    
    //  Update UI
    this.updateCanvas();
    this.updateAllThumbnails();
    this.updateUI();
    
    //  Zoom in
    this.applyZoom();
    
    //  Reset PAN
    this.pan.offsetX = 0;
    this.pan.offsetY = 0;
    this.updateCanvasPosition();
    
    this.showNotification(`Project resized to ${newWidth}×${newHeight}px`);
}
   
   
    
    // CLOSING THE PixelArtEditor CLASS
}


// ========== TILE GRID FUNCTIONS ==========

// Global function to switch tile grid
function toggleTileGrid() {
    if (editor) {
        editor.toggleTileGrid();
    }
}

// Global function to change size
function changeTileGridSize(size) {
    if (!editor) return;
    
    const [rows, cols] = size.split('x').map(Number);
    editor.setTileGridSize(rows, cols);
}

// Global function for exporting tile set 
function exportTileSet() {
    if (!editor || !editor.tileGrid.enabled) {
        alert('Activate the Tile Grid first!');
        return;
    }
    
    const rows = editor.tileGrid.rows;
    const cols = editor.tileGrid.cols;
    const tileWidth = editor.canvasSize / cols;
    const tileHeight = editor.canvasSize / rows;
    
    // Create canvas for tile set
    const tileSetCanvas = document.createElement('canvas');
    tileSetCanvas.width = tileWidth * cols;
    tileSetCanvas.height = tileHeight * rows;
    const tileSetCtx = tileSetCanvas.getContext('2d');
    
    // Draw a transparent background.
    tileSetCtx.clearRect(0, 0, tileSetCanvas.width, tileSetCanvas.height);
    
    // Draw each tile
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * tileWidth;
            const y = row * tileHeight;
            
            // Draw the tile on the main canvas.
            tileSetCtx.drawImage(
                editor.canvas,
                x, y, tileWidth, tileHeight,
                col * tileWidth, row * tileHeight, tileWidth, tileHeight
            );
        }
    }
    
    // To go down
    const link = document.createElement('a');
    link.download = `tile-set-${rows}x${cols}-${new Date().getTime()}.png`;
    link.href = tileSetCanvas.toDataURL('image/png');
    link.click();
    
    alert(`Tile Set ${rows}x${cols} exportado!`);
}



// ========== GLOBAL INITIALIZATION ==========
let editor = null;

window.addEventListener('DOMContentLoaded', () => {
   
    // Initialize editor
    editor = new PixelArtEditor();
    window.editor = editor;
    

    
    
    // Resize window
    window.addEventListener('resize', () => {
        if (editor) {
            editor.updateCanvas();
        }
    });
});



// ========== RESET PAN ==========
function resetPanPosition() {
    if (!editor) return;
    
    // Reset the canvas position.
    editor.pan.offsetX = 0;
    editor.pan.offsetY = 0;
    
    // Apply the transformation
    editor.canvas.style.transform = 'translate(0px, 0px)';
    editor.canvas.style.transition = 'transform 0.3s ease';
    
    // Keep PAN mode active/inactive 
    if (editor.pan.isActive) {
        editor.canvas.style.cursor = 'grabbing';
    } else {
        editor.canvas.style.cursor = 'crosshair';
    }
    
    console.log('Centered canvas!');
}




document.addEventListener('mousedown', function(e) {
    if (editor && editor.pan && editor.pan.isActive) {
        // If you click on anything other than the canvas, it will pan.
        if (!e.target.closest('#pixel-canvas') &&
            !e.target.closest('.canvas-container')) {
            editor.pan.isActive = false;
            editor.canvas.style.cursor = editor.getCurrentCursor();
        }
    }
}, true); 



// ========== GLOBAL FUNCTIONS ==========

function deleteActiveShape() {
    if (editor && editor.activeShape) {
        const index = editor.activeShapes.indexOf(editor.activeShape);
        if (index > -1) {
            editor.activeShapes.splice(index, 1);
            editor.redrawAllShapes();
            editor.showShapeTools(false);
        }
    }
}

function duplicateShape() {
    if (editor && editor.activeShape) {
        const original = editor.activeShape;
        const duplicate = {
            ...original,
            x1: original.x1 + 5,
            y1: original.y1 + 5,
            x2: original.x2 + 5,
            y2: original.y2 + 5
        };
        
        editor.activeShapes.push(duplicate);
        editor.activeShape = duplicate;
        editor.redrawAllShapes();
    }
}

function toggleShapeFill() {
    if (editor && editor.activeShape) {
        editor.activeShape.filled = !editor.activeShape.filled;
        editor.redrawAllShapes();
    }
}

function clearAllShapes() {
    if (editor) {
        if (confirm('Are you sure you want to erase all forms??')) {
            editor.activeShapes = [];
            editor.activeShape = null;
            editor.redrawAllShapes();
            editor.showShapeTools(false);
        }
    }
}

// ========== GLOBAL SELECTION FUNCTIONS ==========
function copySelection() {
    if (editor) {
        editor.copySelection();
        console.log("Copied to clipboard");
    }
}



function cutSelection() {
    if (editor) editor.cutSelection();
}

function deleteSelection() {
    if (editor) editor.deleteSelection();
}

function clearSelection() {
    if (editor) editor.clearSelection();
}



function selectTool(tool) {
    if (editor) {
        if (tool === 'shape') {
            const canvas = document.getElementById('pixel-canvas');
            if (canvas) {
                const rect = canvas.getBoundingClientRect();
                editor.showShapeMenu(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }
        } else {
            editor.selectTool(tool);
        }
    }
}




function pasteSelection() {
    if (editor) editor.pasteSelection();
}

function flipSelectionHorizontal() {
    if (editor) editor.flipSelectionHorizontal();
}

function flipSelectionVertical() {
    if (editor) editor.flipSelectionVertical();
}

function rotateSelection90() {
    if (editor) editor.rotateSelection90();
}



function toggleLayerVisibility(index) {
    if (editor) editor.toggleLayerVisibility(index);
}

function moveLayerUp(index) {
    if (editor) editor.moveLayerUp(index);
}

function moveLayerDown(index) {
    if (editor) editor.moveLayerDown(index);
}

function addLayer() {
    if (editor) editor.addLayer();
}

function removeLayer() {
    if (editor) editor.removeLayer();
}

function addFrame() {
    if (editor) editor.addFrame();
}

function removeFrame() {
    if (editor) editor.removeFrame();
}

function previousFrame() {
    if (editor) editor.previousFrame();
}

function nextFrame() {
    if (editor) editor.nextFrame();
}

function playAnimation() {
    if (editor) editor.playAnimation();
}

function stopAnimation() {
    if (editor) editor.stopAnimation();
}

function undo() {
    if (editor) editor.undo();
}

function redo() {
    if (editor) editor.redo();
}

function addCustomColor() {
    const color = prompt('Enter a color in hexadecimal (ex: #FF0000):', '#000000');
    if (color && /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
        const palette = document.getElementById('color-palette');
        if (palette) {
            const colorElement = document.createElement('div');
            colorElement.className = 'color';
            colorElement.style.backgroundColor = color;
            colorElement.setAttribute('data-color', color);
            colorElement.addEventListener('click', () => {
                if (editor) {
                    editor.currentColor = color;
                    const colorInput = document.getElementById('color-input');
                    if (colorInput) colorInput.value = color;
                    editor.updateCurrentColor();
                    editor.updateWheelPositionFromColor(color);
                    
                    document.querySelectorAll('.color').forEach(c => c.classList.remove('active'));
                    colorElement.classList.add('active');
                }
            });
            palette.appendChild(colorElement);
        }
    } else if (color) {
        alert('Invalid color! Use hexadecimal format. (ex: #FF0000)');
    }
}

function loadReferenceImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        if (e.target.files[0] && editor) {
            editor.loadReferenceImage(e.target.files[0]);
        }
    };
    input.click();
}

function hideReference() {
    if (editor) editor.hideReference();
}

function exportImage() {
    if (editor) editor.exportImage();
}

function exportSpriteSheet() {
    if (editor) editor.exportSpriteSheet();
}

function toggleOnionSkin() {
    if (editor) editor.toggleOnionSkin();
}

function toggleMirror(axis) {
    if (editor) editor.toggleMirror(axis);
}

function zoomIn() {
    if (editor) editor.adjustZoom(0.2);
}

function zoomOut() {
    if (editor) editor.adjustZoom(-0.2);
}

function fitToScreen() {
    if (editor) editor.fitToScreen();
}

function toggleGrid() {
    if (editor) editor.toggleGrid();
}

function toggleIsometricGrid() {
    if (editor) editor.toggleIsometricGrid();
}

function createNewPalette() {
    if (editor) editor.createNewPalette();
}

function saveCurrentPalette() {
    if (editor) editor.saveCurrentPalette();
}

function toggleLoop() {
    if (editor) editor.toggleLoop();
}

function togglePingPong() {
    if (editor) editor.togglePingPong();
}

function selectOutlineStyle(style) {
    if (editor) editor.selectOutlineStyle(style);
}

function applyOutlineToLayer() {
    if (editor) editor.applyOutlineToLayer();
}

function applyOutlineToSelection() {
    if (editor) editor.applyOutlineToSelection();
}

function resetLayerAdjustments() {
    if (editor) editor.resetLayerAdjustments();
}

function applyPreset(presetName) {
    if (editor) editor.applyPreset(presetName);
}

function toggleSnapSystem() {
    if (editor) editor.toggleSnapSystem();
}

function updateColorFromWheel(event) {
    if (editor) editor.updateColorFromWheel(event);
}

function setColorFromHex() {
    const hexInput = document.getElementById('color-hex');
    if (hexInput && editor) {
        editor.setColorFromHex(hexInput.value);
    }
}

function setColorFromRGB() {
    const rgbInput = document.getElementById('color-rgb');
    if (rgbInput && editor) {
        editor.setColorFromRGB(rgbInput.value);
    }
}


// ========== FUNCTIONS FOR MODALS ==========
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // For the New Project model
        if (modalId === 'new-project-modal') {
            updateProjectPreview();
        }
        
        // For the High Resolution mode
        if (modalId === 'high-res-export-modal') {
            updateResolutionValue();
            updateQualityValue();
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}


function exportAllFramesAsSpriteSheet() {
    if (!editor) return;
    
    const scale = parseInt(document.getElementById('export-scale').value) || 4;
    const columns = 4; 
    const spacing = 2 * scale;
    
    const totalFrames = editor.frames.length;
    const rows = Math.ceil(totalFrames / columns);
    
    const frameWidth = editor.canvasSize * scale;
    const frameHeight = editor.canvasSize * scale;
    
    const sheetWidth = (frameWidth * columns) + (spacing * (columns - 1));
    const sheetHeight = (frameHeight * rows) + (spacing * (rows - 1));
    
    const sheetCanvas = document.createElement('canvas');
    sheetCanvas.width = sheetWidth;
    sheetCanvas.height = sheetHeight;
    const sheetCtx = sheetCanvas.getContext('2d');
    
    
    sheetCtx.clearRect(0, 0, sheetWidth, sheetHeight);
    

    editor.frames.forEach((frame, index) => {
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        const x = col * (frameWidth + spacing);
        const y = row * (frameHeight + spacing);
        

        const frameCanvas = document.createElement('canvas');
        frameCanvas.width = frameWidth;
        frameCanvas.height = frameHeight;
        const frameCtx = frameCanvas.getContext('2d');
        frameCtx.imageSmoothingEnabled = false;
        
        // Draw all visible layers
        frame.layers.forEach((layer, layerIndex) => {
            if (editor.layers[layerIndex] && editor.layers[layerIndex].visible) {
                frameCtx.drawImage(
                    layer.canvas,
                    0, 0, editor.canvasSize, editor.canvasSize,
                    0, 0, frameWidth, frameHeight
                );
            }
        });
        
        sheetCtx.drawImage(frameCanvas, x, y);
    });
    
    // To go down
    const link = document.createElement('a');
    link.download = `sprite-sheet-${scale}x.png`;
    link.href = sheetCanvas.toDataURL('image/png');
    link.click();
    
    editor.showNotification(`Sprite sheet exportado em ${scale}x`);
}

function exportLayersSeparately() {
    if (!editor) return;
    
    const scale = parseInt(document.getElementById('export-scale').value) || 4;
    const currentFrame = editor.frames[editor.currentFrameIndex];
    
    currentFrame.layers.forEach((layer, index) => {
        if (editor.layers[index].visible) {
            const layerCanvas = document.createElement('canvas');
            layerCanvas.width = editor.canvasSize * scale;
            layerCanvas.height = editor.canvasSize * scale;
            const layerCtx = layerCanvas.getContext('2d');
            layerCtx.imageSmoothingEnabled = false;
            
            layerCtx.drawImage(
                layer.canvas,
                0, 0, editor.canvasSize, editor.canvasSize,
                0, 0, layerCanvas.width, layerCanvas.height
            );
            
            // Download each layer
            setTimeout(() => {
                const link = document.createElement('a');
                link.download = `layer-${index + 1}-${scale}x.png`;
                link.href = layerCanvas.toDataURL('image/png');
                link.click();
            }, index * 100);
        }
    });
    
    editor.showNotification(`${currentFrame.layers.length} camadas exportadas`);
}



// ========== FUNCTIONS FOR THE NEW PROJECT MODAL ==========
function updateProjectPreview() {
    const width = parseInt(document.getElementById('project-width').value) || 64;
    const height = parseInt(document.getElementById('project-height').value) || 64;
    const preview = document.getElementById('project-preview');
    const previewInfo = document.getElementById('preview-info');
    
    if (preview) {
        preview.style.backgroundColor = document.getElementById('project-bg-color').value;
        
        if (previewInfo) {
            const memory = Math.round((width * height * 4) / 1024);
            previewInfo.textContent = `Tamanho: ${width}×${height}px | Memória: ${memory}KB`;
        }
    }
}

function toggleAdvancedSettings() {
    const advancedSettings = document.getElementById('advanced-settings');
    if (advancedSettings) {
        const isVisible = advancedSettings.style.display !== 'none';
        advancedSettings.style.display = isVisible ? 'none' : 'block';
        
        const toggleBtn = document.querySelector('.advanced-toggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = isVisible ?
                '<i class="fas fa-sliders-h"></i> Advanced Settings' :
                '<i class="fas fa-sliders-h"></i> Hide Advanceds';
        }
    }
}



function createNewProject() {
    const width = parseInt(document.getElementById('project-width').value) || 64;
    const height = parseInt(document.getElementById('project-height').value) || 64;
    
    console.log(' Criando novo projeto:', width, 'x', height);
    
    if (editor) {
        // Close modal first
        hideModal('new-project-modal');
        
        // Call the REAL resizing function
        resizePixelArtCanvas(width, height);
        

        setTimeout(() => {
            editor.updateCanvas();
            editor.applyZoom();
            

            console.log(' Dimensões finais:', {
                canvasWidth: editor.canvas.width,
                canvasHeight: editor.canvas.height,
                canvasStyle: {
                    width: editor.canvas.style.width,
                    height: editor.canvas.style.height
                }
            });
        }, 100);
    }
}


// ========== FUNCTIONS FOR THE HIGH-RESOLUTION MODAL ==========
function selectExportOption(element, type) {
    document.querySelectorAll('.export-option').forEach(option => {
        option.classList.remove('active');
    });
    
    element.classList.add('active');
    
    if (editor) {
        editor.exportSettings.exportType = type;
    }
}


document.getElementById('export-scale')?.addEventListener('input', function(e) {
    const scale = parseInt(e.target.value);
    const resolutionValue = document.getElementById('resolution-value');
    
    if (editor && resolutionValue) {
        const width = editor.canvasSize * scale;
        const height = editor.canvasSize * scale;
        
        // Format for readable values
        let sizeText = '';
        if (width >= 1024) {
            sizeText = `${(width/1024).toFixed(1)}K×${(height/1024).toFixed(1)}K`;
        } else {
            sizeText = `${width}×${height}`;
        }
        
        resolutionValue.textContent = `${scale}x (${sizeText}px)`;
    }
});




function selectFormat(element, format) {
    document.querySelectorAll('.format-option').forEach(option => {
        option.classList.remove('active');
    });
    
    element.classList.add('active');
    
    if (editor) {
        editor.exportSettings.format = format;
        
        const qualityControls = document.getElementById('quality-controls');
        if (qualityControls) {
            if (format === 'jpeg' || format === 'webp') {
                qualityControls.style.display = 'block';
            } else {
                qualityControls.style.display = 'none';
            }
        }
    }
}

function updateResolutionValue() {
    const scaleInput = document.getElementById('export-scale');
    const resolutionValue = document.getElementById('resolution-value');
    
    if (scaleInput && resolutionValue && editor) {
        const scale = parseInt(scaleInput.value);
        const newWidth = editor.canvasSize * scale;
        const newHeight = editor.canvasSize * scale;
        resolutionValue.textContent = `${scale}x (${newWidth}×${newHeight})`;
    }
}

function updateQualityValue() {
    const qualityInput = document.getElementById('export-quality');
    const qualityValue = document.getElementById('quality-value');
    
    if (qualityInput && qualityValue) {
        const quality = parseFloat(qualityInput.value) * 100;
        qualityValue.textContent = `${Math.round(quality)}%`;
    }
}

function exportHighResolution() {
    if (!editor) {
        alert('Editor not initialized!');
        return;
    }
    
    const type = editor.exportSettings.exportType || 'single';
    
    if (type === 'single') {
        editor.exportHighResolutionImage();
    } else if (type === 'all') {
      
        exportAllFramesAsSpriteSheet();
    } else if (type === 'animation') {

        exportAsAnimatedGIF();
    } else if (type === 'layers') {

        exportLayersSeparately();
    }
    
    hideModal('high-res-export-modal');
}

const DOM = {
    header: null,
    menuToggle: null,
    rightPanel: null,
    panelToggle: null
};


let panelState = {
    isActive: false,
    initialized: false
};


// ========== MOBILE PANEL TOGGLE ==========
function initMobilePanelToggle() {
    const panelToggle = document.getElementById('simple-panel-toggle');
    const rightPanel = document.querySelector('.right-panel');
    
    if (!panelToggle || !rightPanel) {
        console.warn('Mobile dashboard elements not found');
        return;
    }


    const newToggle = panelToggle.cloneNode(true);
    panelToggle.parentNode.replaceChild(newToggle, panelToggle);
    

    newToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        rightPanel.classList.toggle('active');
        

        const icon = this.querySelector('i');
        if (icon) {
            if (rightPanel.classList.contains('active')) {
                icon.className = 'fas fa-chevron-down';
                this.setAttribute('aria-expanded', 'true');
                this.setAttribute('title', 'Fechar painel');
            } else {
                icon.className = 'fas fa-chevron-up';
                this.setAttribute('aria-expanded', 'false');
                this.setAttribute('title', 'Abrir painel');
            }
        }


        try {
            localStorage.setItem('rightPanelState', rightPanel.classList.contains('active'));
        } catch (e) {
            console.warn('It was not possible to save the dashboard state');
        }
    });
    

    try {
        const savedState = localStorage.getItem('rightPanelState');
        if (savedState === 'true') {
            rightPanel.classList.add('active');
            const icon = newToggle.querySelector('i');
            if (icon) icon.className = 'fas fa-chevron-down';
        }
    } catch (e) {
        console.warn('It was not possible to restore the panels state');
    }
    
    console.log('Mobile dashboard initialized successfully');
}


if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobilePanelToggle);
} else {
    initMobilePanelToggle();
}



// Adjust canvas for mobile
function adjustCanvasForMobile() {
    const canvas = document.getElementById('pixel-canvas');
    const container = document.querySelector('.canvas-container');
    
    if (window.innerWidth <= 768) {

        const maxWidth = container.clientWidth - 20;
        const maxHeight = window.innerHeight * 0.4;
        
        if (canvas.width > maxWidth || canvas.height > maxHeight) {
            const scale = Math.min(
                maxWidth / canvas.width,
                maxHeight / canvas.height
            );
            canvas.style.transform = `scale(${scale})`;
        }
    } else {
        canvas.style.transform = 'none';
    }
}

// Detect orientation
function handleOrientationChange() {
    adjustCanvasForMobile();
    
    if (window.innerWidth <= 768) {
        
        if (window.matchMedia("(orientation: landscape)").matches) {
            document.body.classList.add('landscape');
        } else {
            document.body.classList.remove('landscape');
        }
    }
}

// Initialize responsiveness
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= 768) {
        
    }
    
    adjustCanvasForMobile();
    
    // Event listeners
    window.addEventListener('resize', () => {
        adjustCanvasForMobile();
        handleOrientationChange();
    });
    
    window.addEventListener('orientationchange', handleOrientationChange);
    
    
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
        

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
});

// Utility for displaying notifications on mobile devices.
function showMobileToast(message, duration = 3000) {
    if (window.innerWidth > 768) return;
    
    const toast = document.createElement('div');
    toast.className = 'mobile-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, duration);
}



// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');
    const menuOverlay = document.createElement('div');
    menuOverlay.className = 'menu-overlay';
    document.body.appendChild(menuOverlay);
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            mainMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            menuOverlay.classList.toggle('active');
        });
        
        // Close menu by clicking outside
        menuOverlay.addEventListener('click', function() {
            mainMenu.classList.remove('active');
            menuToggle.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
        
        
        const menuItems = mainMenu.querySelectorAll('.menu-btn, .dropdown-content a');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    mainMenu.classList.remove('active');
                    menuToggle.classList.remove('active');
                    menuOverlay.classList.remove('active');
                }
            });
        });
        
        // Close menu when resizing to desktop.
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                mainMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuOverlay.classList.remove('active');
            }
        });
    }
});



// ========== PAN GLOBAL FUNCTIONS ==========

function togglePanMode() {
    if (!editor) return;
    
    // Switches between PAN mode.
    editor.pan.isActive = !editor.pan.isActive;
    
    // Update cursor
    if (editor.pan.isActive) {
        editor.canvas.style.cursor = 'grabbing';
        editor.showNotification('MOVE mode enabled (drag to move) • Ctrl+P to toggle', 'info');
    } else {
        editor.canvas.style.cursor = editor.getCurrentCursor();
        editor.showNotification('Drawing mode activated • Ctrl+P to toggle', 'success');
    }
    
    
    updatePanButton();
}

function resetPanPosition() {
    if (!editor) return;
    
    // Reset canvas position
    editor.pan.offsetX = 0;
    editor.pan.offsetY = 0;
    
    // Apply transformation
    editor.canvas.style.transform = 'translate(0px, 0px)';
    editor.canvas.style.transition = 'transform 0.3s ease';
    
    editor.showNotification('Centered canvas!');
}

function updatePanButton() {
    if (!editor) return;
    
    const panBtn = document.getElementById('pan-toggle-btn');
    if (panBtn) {
        if (editor.pan.isActive) {
            
            panBtn.title = 'Disable move mode (Ctrl+P)';
        } else {
            panBtn.innerHTML = '<i class="fas fa-hand-paper"></i> Move';
            panBtn.classList.remove('active');
            panBtn.title = 'Activate move mode (Ctrl+P)';
        }
    }
}


// ========== GLOBAL FUNCTION FOR RESIZING  ==========
function resizePixelArtCanvas(width, height) {
    if (!editor) return;
    
    console.log(' RESIZING CANVAS for:', width, 'x', height);
    
    //  STOP ANIMATION IF RUNNING
    if (editor.isPlaying) {
        editor.stopAnimation();
    }
    
    // SAVE THE CURRENT CONTENT (if any)
    let oldContent = null;
    if (editor.frames.length > 0 && editor.frames[0].layers.length > 0) {
        const currentLayer = editor.frames[0].layers[0];
        oldContent = currentLayer.ctx.getImageData(0, 0,
            editor.canvas.width,
            editor.canvas.height
        );
    }
    
    // Resize the main (physical) canvas.
    editor.canvas.width = width;
    editor.canvas.height = height;
    
    //  UPDATE VARIABLES
    editor.canvasSize = Math.max(width, height); 
    editor.canvasWidth = width;
    editor.canvasHeight = height;
    
    // CLEAN AND RECREATE LAYERS AND FRAMES
    editor.layers = [];
    editor.frames = [];
    
    //  Create a new layer and frame with the new size.
    const newLayerCanvas = document.createElement('canvas');
    newLayerCanvas.width = width;
    newLayerCanvas.height = height;
    const newLayerCtx = newLayerCanvas.getContext('2d');
    newLayerCtx.clearRect(0, 0, width, height);
    

    if (oldContent) {

        const xOffset = Math.floor((width - oldContent.width) / 2);
        const yOffset = Math.floor((height - oldContent.height) / 2);
        newLayerCtx.putImageData(oldContent, xOffset, yOffset);
    }
    

    const newLayer = {
        canvas: newLayerCanvas,
        ctx: newLayerCtx,
        name: 'Layer 1',
        index: 0,
        visible: true
    };
    
    editor.layers.push(newLayer);
    editor.currentLayerIndex = 0;
    
    const newFrame = {
        layers: [{
            canvas: newLayerCanvas,
            ctx: newLayerCtx
        }],
        index: 0
    };
    
    editor.frames.push(newFrame);
    editor.currentFrameIndex = 0;
    
    //  UPDATE UI
    editor.updateLayersUI();
    editor.updateFramesUI();
    
    // Apply zoom and position
    editor.zoom = 1;
    editor.pan.offsetX = 0;
    editor.pan.offsetY = 0;
    
    //  REDESIGN EVERYTHING
    editor.updateCanvas();
    editor.applyZoom();
    editor.updateCanvasPosition();
    
    // UPDATE DISPLAY
    const docSizeElement = document.getElementById('document-size');
    if (docSizeElement) {
        docSizeElement.textContent = `${width}×${height} pixels`;
    }
    
    console.log('CANVAS RESIZED! New size:',
        editor.canvas.width, 'x', editor.canvas.height);
    
    editor.showNotification(` Resized canvas: ${width}×${height}px`);
}


// ========== EVENT LISTENERS GLOBAIS ==========
document.addEventListener('DOMContentLoaded', function() {
   
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            hideModal(event.target.id);
        }
    });
    

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const width = parseInt(this.dataset.width);
            const height = parseInt(this.dataset.height);
            
            const widthInput = document.getElementById('project-width');
            const heightInput = document.getElementById('project-height');
            
            if (widthInput) widthInput.value = width;
            if (heightInput) heightInput.value = height;
            
            updateProjectPreview();
        });
    });
    
    // Update preview when values change.
    const projectWidth = document.getElementById('project-width');
    const projectHeight = document.getElementById('project-height');
    const projectBgColor = document.getElementById('project-bg-color');
    
    if (projectWidth) projectWidth.addEventListener('input', updateProjectPreview);
    if (projectHeight) projectHeight.addEventListener('input', updateProjectPreview);
    if (projectBgColor) projectBgColor.addEventListener('input', updateProjectPreview);
    
    // Export scale
    const exportScale = document.getElementById('export-scale');
    if (exportScale) {
        exportScale.addEventListener('input', updateResolutionValue);
    }
    
    // Export quality
    const exportQuality = document.getElementById('export-quality');
    if (exportQuality) {
        exportQuality.addEventListener('input', updateQualityValue);
    }
});


function applyQuickGradient() {
    if (editor) editor.applyQuickGradient();
}