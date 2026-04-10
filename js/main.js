// Main Application Controller
(function() {
    const canvas = document.getElementById('unified-canvas');
    let ctx = canvas.getContext('2d', { willReadFrequently: true });
    let currentTab = 'fastest';
    
    // DOM elements
    const controlPanel = document.getElementById('control-panel');
    const previewTitle = document.getElementById('preview-title');
    const downloadPngBtn = document.getElementById('download-png-btn');
    const copyBtn = document.getElementById('copy-btn');
    const weatherContainer = document.getElementById('weather-graphic-container');
    const gridContainer = document.getElementById('grid-graphic-container');
    
    // State
    const state = {
        selectedDriver: null,
        selectedRound: null,
        lapTime: '1:27.345',
        startPos: 'P10',
        finishPos: 'P3',
        votePercent: '43%',
        voteCount: '124,567 votes',
        qualifyingTime: '1:26.345',
        driverSize: 85
    };

    // Canvas vs DOM graphics
    const canvasGraphics = ['fastest', 'dotd', 'pole', 'winner'];
    const domGraphics = ['grid', 'weather'];

    // Update preview
    async function updatePreview() {
        if (!window.PL21_DATA?.drivers?.length) {
            // Wait for data
            return;
        }
        
        // Hide all containers first
        canvas.style.display = 'none';
        if (weatherContainer) weatherContainer.style.display = 'none';
        if (gridContainer) gridContainer.style.display = 'none';
        
        if (canvasGraphics.includes(currentTab)) {
            canvas.style.display = 'block';
        }
        
        const graphicsFunc = window.PL21_Graphics[currentTab];
        if (graphicsFunc) {
            await graphicsFunc(state);
        }
    }

    // ========== PNG DOWNLOAD ==========
    async function downloadAsPng() {
        if (domGraphics.includes(currentTab)) {
            // For DOM-based graphics, use html2canvas
            let element = null;
            
            if (currentTab === 'weather') {
                element = window._currentWeatherGraphic;
            } else if (currentTab === 'grid') {
                element = window._currentGraphicElement;
            }
            
            if (!element) {
                alert('No graphic to capture');
                return;
            }
            
            try {
                const captureCanvas = await html2canvas(element, {
                    scale: 2,
                    backgroundColor: currentTab === 'grid' ? '#15151e' : '#1a1a22'
                });
                const link = document.createElement('a');
                link.download = `pl21_${currentTab}.png`;
                link.href = captureCanvas.toDataURL('image/png');
                link.click();
            } catch (e) {
                console.error('Capture failed:', e);
                alert('Failed to capture image');
            }
        } else {
            // Canvas-based graphics
            if (!state.selectedDriver || state.selectedRound === null) {
                alert('Please select a driver and round first');
                return;
            }
            
            const link = document.createElement('a');
            link.download = `pl21_${currentTab}_${state.selectedDriver.replace(/\s+/g, '_')}_Round${state.selectedRound + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }

    // ========== COPY TO CLIPBOARD ==========
    async function copyToClipboard() {
        if (domGraphics.includes(currentTab)) {
            alert('Copy not supported for this graphic type. Use Download PNG instead.');
            return;
        }
        
        if (!state.selectedDriver || state.selectedRound === null) {
            alert('Please select a driver and round first');
            return;
        }
        
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve));
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            alert('Image copied to clipboard!');
        } catch (err) {
            console.error('Copy failed:', err);
            alert('Failed to copy image');
        }
    }

    // ========== BUILD FORM ==========
    function buildForm() {
        if (!window.PL21_DATA?.drivers?.length) {
            controlPanel.innerHTML = '<div class="panel-header"><h2>Loading data...</h2></div>';
            return;
        }
        
        // Weather has controls in side panel
        if (currentTab === 'weather') {
            if (window.PL21_Weather_BuildControls) {
                controlPanel.innerHTML = window.PL21_Weather_BuildControls();
                if (window.PL21_Weather_AttachEvents) {
                    window.PL21_Weather_AttachEvents(() => {
                        if (window.PL21_Weather_Refresh) {
                            window.PL21_Weather_Refresh();
                        }
                    });
                }
            } else {
                controlPanel.innerHTML = '<div class="panel-header"><h2>Weather</h2><p>Loading controls...</p></div>';
            }
            return;
        }
        
        // Grid has controls in side panel
        if (currentTab === 'grid') {
            if (window.PL21_Grid_BuildControls) {
                controlPanel.innerHTML = window.PL21_Grid_BuildControls();
                if (window.PL21_Grid_AttachEvents) {
                    window.PL21_Grid_AttachEvents(() => {
                        if (window.PL21_Grid_Refresh) {
                            window.PL21_Grid_Refresh();
                        }
                    });
                }
            } else {
                controlPanel.innerHTML = '<div class="panel-header"><h2>Starting Grid</h2><p>Loading controls...</p></div>';
            }
            return;
        }
        
        let html = `
            <div class="panel-header">
                <h2>${currentTab === 'fastest' ? 'Fastest Lap' : currentTab === 'dotd' ? 'Driver of the Day' : currentTab === 'pole' ? 'Pole Position' : 'Winner'}</h2>
                <p>customize your graphic</p>
            </div>
            <div class="form-section">
                <div class="form-group">
                    <label>Driver</label>
                    <select class="form-control" id="driver-select">
                        <option value="">Select driver...</option>
                        ${window.PL21_DATA.drivers.sort((a, b) => a.name.localeCompare(b.name)).map(d => 
                            `<option value="${d.name}" ${d.name === state.selectedDriver ? 'selected' : ''}>${d.name} · #${d.number} · ${d.defaultTeam}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Round</label>
                    <select class="form-control" id="round-select">
                        <option value="">Select round...</option>
                        ${window.PL21_DATA.raceRounds.map((r, i) => 
                            `<option value="${i}" ${state.selectedRound === i ? 'selected' : ''}>${r.round} · ${r.gp}</option>`
                        ).join('')}
                        ${window.PL21_DATA.sprintRounds.map((r, i) => 
                            `<option value="${i + window.PL21_DATA.raceRounds.length}" ${state.selectedRound === i + window.PL21_DATA.raceRounds.length ? 'selected' : ''}>${r.round} · ${r.gp}</option>`
                        ).join('')}
                    </select>
                </div>
        `;
        
        if (currentTab === 'fastest') {
            html += `
                <div class="form-group">
                    <label>Lap Time</label>
                    <input type="text" class="form-control" id="lap-time" value="${state.lapTime}">
                </div>
            `;
        } else if (currentTab === 'dotd') {
            html += `
                <div class="form-row">
                    <div class="form-group">
                        <label>Start Pos</label>
                        <input type="text" class="form-control" id="start-pos" value="${state.startPos}">
                    </div>
                    <div class="form-group">
                        <label>Finish Pos</label>
                        <input type="text" class="form-control" id="finish-pos" value="${state.finishPos}">
                    </div>
                </div>
                <div class="form-group">
                    <label>Vote Percentage</label>
                    <input type="text" class="form-control" id="vote-percent" value="${state.votePercent}">
                </div>
                <div class="form-group">
                    <label>Vote Count</label>
                    <input type="text" class="form-control" id="vote-count" value="${state.voteCount}">
                </div>
                <div class="form-group">
                    <label>Driver Size <span id="driver-size-value" class="range-value">${state.driverSize}%</span></label>
                    <div class="range-slider">
                        <input type="range" id="driver-size" min="50" max="300" value="${state.driverSize}" step="1">
                    </div>
                </div>
            `;
        } else if (currentTab === 'pole') {
            html += `
                <div class="form-group">
                    <label>Qualifying Time</label>
                    <input type="text" class="form-control" id="qualifying-time" value="${state.qualifyingTime}">
                </div>
                <div class="form-group">
                    <label>Driver Size <span id="driver-size-value" class="range-value">${state.driverSize}%</span></label>
                    <div class="range-slider">
                        <input type="range" id="driver-size" min="50" max="300" value="${state.driverSize}" step="1">
                    </div>
                </div>
            `;
        } else if (currentTab === 'winner') {
            html += `
                <div class="form-group">
                    <label>Driver Size <span id="driver-size-value" class="range-value">${state.driverSize}%</span></label>
                    <div class="range-slider">
                        <input type="range" id="driver-size" min="50" max="300" value="${state.driverSize}" step="1">
                    </div>
                </div>
            `;
        }
        
        html += `<button class="generate-btn ${currentTab}" id="generate-btn">Generate</button></div>`;
        controlPanel.innerHTML = html;

        // Event listeners for canvas graphics
        if (canvasGraphics.includes(currentTab)) {
            document.getElementById('driver-select')?.addEventListener('change', (e) => {
                state.selectedDriver = e.target.value;
                updatePreview();
            });
            
            document.getElementById('round-select')?.addEventListener('change', (e) => {
                state.selectedRound = e.target.value === '' ? null : parseInt(e.target.value);
                updatePreview();
            });
            
            if (currentTab === 'fastest') {
                document.getElementById('lap-time')?.addEventListener('input', (e) => {
                    state.lapTime = e.target.value;
                    updatePreview();
                });
            } else if (currentTab === 'dotd') {
                document.getElementById('start-pos')?.addEventListener('input', (e) => {
                    state.startPos = e.target.value;
                    updatePreview();
                });
                document.getElementById('finish-pos')?.addEventListener('input', (e) => {
                    state.finishPos = e.target.value;
                    updatePreview();
                });
                document.getElementById('vote-percent')?.addEventListener('input', (e) => {
                    state.votePercent = e.target.value;
                    updatePreview();
                });
                document.getElementById('vote-count')?.addEventListener('input', (e) => {
                    state.voteCount = e.target.value;
                    updatePreview();
                });
                document.getElementById('driver-size')?.addEventListener('input', (e) => {
                    state.driverSize = e.target.value;
                    const valueSpan = document.getElementById('driver-size-value');
                    if (valueSpan) valueSpan.textContent = state.driverSize + '%';
                    updatePreview();
                });
            } else if (currentTab === 'pole') {
                document.getElementById('qualifying-time')?.addEventListener('input', (e) => {
                    state.qualifyingTime = e.target.value;
                    updatePreview();
                });
                document.getElementById('driver-size')?.addEventListener('input', (e) => {
                    state.driverSize = e.target.value;
                    const valueSpan = document.getElementById('driver-size-value');
                    if (valueSpan) valueSpan.textContent = state.driverSize + '%';
                    updatePreview();
                });
            } else if (currentTab === 'winner') {
                document.getElementById('driver-size')?.addEventListener('input', (e) => {
                    state.driverSize = e.target.value;
                    const valueSpan = document.getElementById('driver-size-value');
                    if (valueSpan) valueSpan.textContent = state.driverSize + '%';
                    updatePreview();
                });
            }
            
            document.getElementById('generate-btn')?.addEventListener('click', updatePreview);
        }
    }

    // ========== TAB SWITCHING ==========
    document.querySelectorAll('.graphic-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.graphic-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            previewTitle.innerText = `Preview · ${btn.innerText}`;
            
            // Set canvas dimensions for canvas graphics
            if (canvasGraphics.includes(currentTab)) {
                if (currentTab === 'fastest') {
                    canvas.width = 1000;
                    canvas.height = 220;
                    canvas.className = 'canvas-landscape';
                } else {
                    canvas.width = 800;
                    canvas.height = 1067;
                    canvas.className = 'canvas-portrait';
                }
                ctx = canvas.getContext('2d', { willReadFrequently: true });
            }
            
            buildForm();
            updatePreview();
        });
    });

    // ========== BUTTON EVENT LISTENERS ==========
    downloadPngBtn.addEventListener('click', downloadAsPng);
    copyBtn.addEventListener('click', copyToClipboard);

    // ========== INITIALIZE ==========
    window.addEventListener('pl21-data-ready', () => {
        console.log('Data ready, building form...');
        buildForm();
        updatePreview();
    });
    
    // If data is already loaded
    if (window.PL21_DATA?.drivers?.length) {
        console.log('Data already loaded, building form...');
        buildForm();
        updatePreview();
    }
})();