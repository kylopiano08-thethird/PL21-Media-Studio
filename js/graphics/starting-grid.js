// Starting Grid Graphic
window.PL21_Graphics_Grid = async function(state) {
    const container = document.getElementById('grid-graphic-container');
    const canvas = document.getElementById('unified-canvas');
    
    canvas.style.display = 'none';
    container.style.display = 'block';
    if (document.getElementById('weather-graphic-container')) {
        document.getElementById('weather-graphic-container').style.display = 'none';
    }
    
    // Initialize grid state
    if (!window._gridState) {
        window._gridState = {
            selectedRound: 0,
            gpName: 'AUSTRALIA',
            gridOrder: []
        };
    }
    
    const gs = window._gridState;
    
    // Get round info
    const round = window.PL21_DATA?.raceRounds?.[gs.selectedRound];
    const roundNum = round ? round.roundNum : 1;
    const gpName = gs.gpName || (round ? round.gp.split(' ')[0].toUpperCase() : 'AUSTRALIA');
    
    // Initialize grid order - 10 drivers
    if (gs.gridOrder.length === 0 && window.PL21_DATA?.drivers) {
        const drivers = window.PL21_DATA.drivers;
        gs.gridOrder = drivers.slice(0, 10).map((d, i) => ({ name: d.name, position: i + 1 }));
        while (gs.gridOrder.length < 10) {
            gs.gridOrder.push({ name: '', position: gs.gridOrder.length + 1 });
        }
    }
    
    const sortedGrid = [...gs.gridOrder].sort((a, b) => a.position - b.position);
    
    // Build cards
    const cardsHtml = sortedGrid.map((item, index) => {
        const position = index + 1;
        const driver = window.PL21_DATA?.drivers?.find(d => d.name === item.name);
        
        // If driver not found or empty, use placeholder
        if (!driver || !item.name) {
            return `
                <div style="display: grid; grid-template-columns: 126px 286px 100px 1fr; height: 100px; width: 1036px; background-color: #888888;">
                    <div style="display: flex; align-items: center; justify-content: center; background-color: #e8e8e8;">
                        <span style="font-size: 55px; font-weight: 900; color: #1d1d1f;">${position}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; padding: 8px;">
                        <span style="color: white; font-size: 12px;">-</span>
                    </div>
                    <div style="overflow: hidden;">
                        <div style="width: 100%; height: 100%; background: #333;"></div>
                    </div>
                    <div style="display: flex; align-items: center; padding-left: 24px; padding-right: 24px; color: #ffffff; overflow: hidden;">
                        <span style="font-size: 42px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; white-space: nowrap;">-</span>
                    </div>
                </div>
            `;
        }
        
        // Get team for current round
        const teamForRound = window.PL21_DATA.getDriverTeamForRound(driver, roundNum);
        
        // Get team colors and logo from the data
        const teamData = window.PL21_DATA.getTeamColors(teamForRound);
        const teamColor = teamData.primary;
        const teamLogo = teamData.logo || '';
        
        // Get last name
        let lastName = driver.name.split(' ').pop();
        
        // Determine text color
        let r = 136, g = 136, b = 136;
        if (teamColor && teamColor !== '#888888' && teamColor.startsWith('#')) {
            const hex = teamColor.replace('#', '');
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        const textColor = luminance > 140 ? '#1d1d1f' : '#ffffff';
        
        // Dynamic font sizing
        const nameLength = lastName.length;
        let fontSize = 42;
        if (nameLength > 15) fontSize = 22;
        else if (nameLength > 12) fontSize = 26;
        else if (nameLength > 10) fontSize = 30;
        else if (nameLength > 8) fontSize = 34;
        else if (nameLength > 6) fontSize = 38;
        
        // Use driver.photo which now contains the Headshot URL from column I
        // In starting-grid.js, change this line:
        const headshotUrl = driver.headshot || driver.photo || '';
        
        return `
            <div style="display: grid; grid-template-columns: 126px 286px 100px 1fr; height: 100px; width: 1036px; background-color: ${teamColor};">
                <div style="display: flex; align-items: center; justify-content: center; background-color: #e8e8e8;">
                    <span style="font-size: 55px; font-weight: 900; color: #1d1d1f;">${position}</span>
                </div>
                <div style="display: flex; align-items: center; justify-content: center; padding: 8px;">
                    ${teamLogo ? `<img src="${teamLogo}" alt="${teamForRound}" style="height: 80px; width: auto; max-width: 200px; object-fit: contain;" onerror="this.style.display='none'">` : `<span style="color: white; font-size: 12px;">${teamForRound}</span>`}
                </div>
                <div style="overflow: hidden;">
                    ${headshotUrl ? `<img src="${headshotUrl}" alt="${driver.name}" style="width: 100%; height: 100%; object-fit: cover; object-position: top;" onerror="this.style.backgroundColor='#333'">` : `<div style="width: 100%; height: 100%; background: #333; display: flex; align-items: center; justify-content: center; color: #666; font-size: 10px;">No photo</div>`}
                </div>
                <div style="display: flex; align-items: center; padding-left: 24px; padding-right: 24px; color: ${textColor}; overflow: hidden;">
                    <span style="font-size: ${fontSize}px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.02em; white-space: nowrap;">${lastName}</span>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="width: 1440px; height: 1880px; background: #15151e; position: relative; overflow: hidden; font-family: 'Inter', sans-serif; border-radius: 16px; transform: scale(0.5); transform-origin: top left;" id="grid-graphic">
            
            <svg viewBox="0 0 1440 1880" preserveAspectRatio="none" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;">
                <polygon points="287 0, 420 0, 0 420, 0 287" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="433 0, 567 0, 367 200, 240 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="633 111, 727 111, 640 200, 547 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="739 111, 825 111, 739 200, 652 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="943 45, 977 45, 823 200, 788 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="983 45, 1017 45, 863 200, 828 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1060 0, 1125 0, 1081 45, 1016 45" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1135 0, 1197 0, 1156 45, 1091 45" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1331 0, 1440 0, 1440 25, 1264 200, 1131 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 41, 1440 165, 1407 200, 1281 200" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="109 1587, 175 1587, 140 1615, 75 1615" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="184 1587, 249 1587, 215 1615, 149 1615" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="5 1707, 67 1707, 0 1777, 0 1713" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="167 1707, 203 1707, 35 1880, 0 1880, 0 1879" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="208 1707, 241 1707, 73 1880, 40 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="459 1587, 525 1587, 245 1880, 179 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="533 1587, 596 1587, 316 1880, 253 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="441 1835, 508 1835, 468 1880, 401 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="517 1835, 579 1835, 539 1880, 477 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 943, 1440 1042, 673 1835, 579 1835" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 1059, 1440 1146, 772 1835, 689 1835" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 1265, 1440 1331, 1096 1690, 1031 1690" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 1341, 1440 1407, 1167 1690, 1104 1690" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1167 1690, 1213 1690, 1035 1880, 988 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1219 1690, 1263 1690, 1084 1880, 1040 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 1814, 1440 1860, 1424 1880, 1377 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
                <polygon points="1440 1868, 1440 1880, 1431 1880" fill="rgba(255, 255, 255, 0.04)"></polygon>
            </svg>
            
            <svg viewBox="0 0 1440 160" height="160" preserveAspectRatio="xMidYMin slice" style="position: absolute; top: 0; left: 0; width: 100%; z-index: 10;">
                <defs>
                    <pattern id="hs" patternUnits="userSpaceOnUse" width="50" height="50" patternTransform="rotate(-40)">
                        <rect width="25" height="50" fill="#1a1a24"></rect>
                        <rect x="25" width="25" height="50" fill="#15151e"></rect>
                    </pattern>
                </defs>
                <polygon points="420,64 1520,74 1520,35 440,25" fill="#e10600"></polygon>
                <polygon points="400,111 1500,121 1500,82 420,72" fill="#e10600"></polygon>
            </svg>
            
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/F1_logo.svg/800px-F1_logo.svg.png" alt="F1" style="position: absolute; top: 30px; left: 40px; width: 296px; z-index: 20;" onerror="this.style.display='none'">
            
            <div style="position: absolute; top: 131px; right: 60px; font-size: 55px; font-weight: 900; color: #e10600; z-index: 20; letter-spacing: 0.18em;">${gpName}</div>
            
            <div style="position: absolute; top: 55%; left: 167px; transform: translateX(-50%) translateY(-50%) rotate(-90deg); z-index: 10;">
                <span style="font-size: 330px; font-weight: 900; color: white; white-space: nowrap; letter-spacing: -0.02em; line-height: 1;">THE GRID</span>
            </div>
            
            <div style="position: absolute; top: 234px; left: 334px; display: flex; flex-direction: column; gap: 45px; z-index: 5;">
                ${cardsHtml}
            </div>
            
            <div style="position: absolute; bottom: 40px; right: 40px; display: flex; align-items: center; gap: 12px; color: #e10600; font-size: 28px; letter-spacing: 0.05em; z-index: 10;">
                <span style="font-weight: 700;">1ST - 10TH</span>
                <span style="font-weight: 900; letter-spacing: 0.1em;">▶▶▶▶</span>
            </div>
        </div>
    `;
    
    window._currentGraphicElement = document.getElementById('grid-graphic');
};

window.PL21_Grid_Refresh = function() {
    return window.PL21_Graphics_Grid({});
};

function parseTextInputToGrid(text) {
    const drivers = window.PL21_DATA?.drivers || [];
    const lines = text.trim().split('\n').filter(l => l.trim());
    const newGrid = [];
    
    lines.forEach((line, i) => {
        if (i >= 10) return;
        const trimmed = line.trim();
        const match = drivers.find(d => 
            d.name.toLowerCase().includes(trimmed.toLowerCase()) ||
            trimmed.toLowerCase().includes(d.name.toLowerCase()) ||
            d.name.split(' ').pop().toLowerCase() === trimmed.toLowerCase()
        );
        newGrid.push({ name: match ? match.name : '', position: i + 1 });
    });
    
    while (newGrid.length < 10) {
        newGrid.push({ name: '', position: newGrid.length + 1 });
    }
    
    return newGrid;
}

function generateTextFromGrid(gridOrder) {
    const sorted = [...gridOrder].sort((a, b) => a.position - b.position);
    return sorted.map(item => item.name || '').join('\n');
}

window.PL21_Grid_BuildControls = function() {
    const gs = window._gridState || { selectedRound: 0, gpName: 'AUSTRALIA', gridOrder: [] };
    if (!window._gridState) window._gridState = gs;
    
    if (gs.gridOrder.length === 0 && window.PL21_DATA?.drivers) {
        const drivers = window.PL21_DATA.drivers;
        gs.gridOrder = drivers.slice(0, 10).map((d, i) => ({ name: d.name, position: i + 1 }));
        while (gs.gridOrder.length < 10) {
            gs.gridOrder.push({ name: '', position: gs.gridOrder.length + 1 });
        }
    }
    
    const sortedGrid = [...gs.gridOrder].sort((a, b) => a.position - b.position);
    const drivers = window.PL21_DATA?.drivers || [];
    
    // Build dropdown rows for each position
    const dropdownRows = sortedGrid.map((item) => {
        const pos = item.position;
        const selectedName = item.name || '';
        
        return `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 8px; margin-bottom: 6px;">
                <div style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: #e10600; color: white; font-weight: 700; border-radius: 8px; font-size: 14px;">P${pos}</div>
                <select class="form-control grid-driver-dropdown" data-position="${pos}" style="flex: 1;">
                    <option value="">- Select driver -</option>
                    ${drivers.sort((a, b) => a.name.localeCompare(b.name)).map(d => `<option value="${d.name}" ${d.name === selectedName ? 'selected' : ''}>${d.name}</option>`).join('')}
                </select>
            </div>
        `;
    }).join('');
    
    const textRep = generateTextFromGrid(gs.gridOrder);
    
    return `
        <div class="panel-header">
            <h2>Starting Grid</h2>
            <p>configure positions (P1-P10)</p>
        </div>
        <div class="form-section">
            <div class="form-group">
                <label>Round</label>
                <select class="form-control" id="grid-round-select">
                    ${window.PL21_DATA?.raceRounds?.map((r, i) => `<option value="${i}" ${gs.selectedRound === i ? 'selected' : ''}>${r.round} · ${r.gp}</option>`).join('') || ''}
                </select>
            </div>
            <div class="form-group">
                <label>GP Title</label>
                <input type="text" class="form-control" id="grid-gp-name" value="${gs.gpName}">
            </div>
            <div class="form-group">
                <label>Select Drivers for Each Position</label>
                <div style="max-height: 500px; overflow-y: auto; padding-right: 4px;">
                    ${dropdownRows}
                </div>
            </div>
            <div class="form-group">
                <label>Or Paste Results (one per line, P1-P10)</label>
                <textarea class="form-control" id="grid-text-input" rows="6" style="font-family: monospace; font-size: 13px; line-height: 1.5;">${textRep}</textarea>
                <button class="generate-btn" id="grid-parse-text-btn" style="margin-top: 8px; background: #3a3a48;">
                    <i class="fas fa-arrow-down"></i> Parse & Apply
                </button>
            </div>
            <button class="generate-btn grid" id="grid-apply-btn">
                <i class="fas fa-sync-alt"></i> Update Preview
            </button>
            <button class="generate-btn" id="grid-reset-btn" style="margin-top: 8px; background: #3a3a48;">
                <i class="fas fa-undo"></i> Reset to Default
            </button>
        </div>
    `;
};

window.PL21_Grid_AttachEvents = function(refreshCallback) {
    const gs = window._gridState;
    const refresh = () => refreshCallback?.();
    
    document.getElementById('grid-round-select')?.addEventListener('change', e => {
        gs.selectedRound = parseInt(e.target.value);
        const round = window.PL21_DATA?.raceRounds?.[gs.selectedRound];
        if (round) {
            gs.gpName = round.gp.split(' ')[0].toUpperCase();
            document.getElementById('grid-gp-name').value = gs.gpName;
        }
        refresh();
    });
    
    document.getElementById('grid-gp-name')?.addEventListener('input', e => {
        gs.gpName = e.target.value.toUpperCase();
    });
    
    // Driver dropdown changes
    document.querySelectorAll('.grid-driver-dropdown').forEach(select => {
        select.addEventListener('change', e => {
            const position = parseInt(e.target.dataset.position);
            const driverName = e.target.value;
            const item = gs.gridOrder.find(i => i.position === position);
            if (item) {
                item.name = driverName;
            }
            // Update textarea
            const textInput = document.getElementById('grid-text-input');
            if (textInput) {
                textInput.value = generateTextFromGrid(gs.gridOrder);
            }
            // Refresh preview immediately
            refresh();
        });
    });
    
    document.getElementById('grid-parse-text-btn')?.addEventListener('click', () => {
        const input = document.getElementById('grid-text-input');
        if (input) {
            gs.gridOrder = parseTextInputToGrid(input.value);
            refresh();
        }
    });
    
    document.getElementById('grid-apply-btn')?.addEventListener('click', refresh);
    
    document.getElementById('grid-reset-btn')?.addEventListener('click', () => {
        const drivers = window.PL21_DATA?.drivers || [];
        gs.gridOrder = drivers.slice(0, 10).map((d, i) => ({ name: d.name, position: i + 1 }));
        while (gs.gridOrder.length < 10) {
            gs.gridOrder.push({ name: '', position: gs.gridOrder.length + 1 });
        }
        refresh();
    });
};

window.PL21_Graphics_Grid.capturePNG = async function() {
    const el = window._currentGraphicElement;
    if (!el) return null;
    return await html2canvas(el, { scale: 2, backgroundColor: '#15151e' });
};