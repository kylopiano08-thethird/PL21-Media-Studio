// Weather Generator Graphic
window.PL21_Graphics_Weather = async function(state) {
    const container = document.getElementById('weather-graphic-container');
    const canvas = document.getElementById('unified-canvas');
    
    // Hide canvas, show container
    canvas.style.display = 'none';
    container.style.display = 'flex';
    document.getElementById('grid-graphic-container').style.display = 'none';
    
    // Initialize weather state if not exists
    if (!window._weatherState) {
        window._weatherState = {
            isSprintMode: false,
            savedQ2Time: '17:15 – 17:10',
            rainState: {
                q1: { active: false, intensity: 'medium' },
                q2: { active: false, intensity: 'medium' },
                race: { active: false, intensity: 'medium' }
            },
            tempRange: 'mid-hot',
            date: '04-06 APR',
            q1Time: '17:00 – 17:15',
            q2Time: '17:15 – 17:10',
            raceTime: 'LIGHTS OUT - 17:25'
        };
    }
    
    const ws = window._weatherState;
    
    // Temperature ranges
    const tempRangeMap = {
        'hot': { min: 28, max: 36 },
        'mid-hot': { min: 22, max: 28 },
        'mid': { min: 16, max: 22 },
        'mid-cold': { min: 10, max: 16 },
        'cold': { min: 4, max: 10 }
    };
    
    // Rain intensity multipliers
    const rainIntensityMap = {
        'light': { chance: [30, 50], humidity: [60, 75], wind: [10, 20], pressure: [1000, 1010], color: '#87CEEB', icon: 'fa-cloud-rain' },
        'medium': { chance: [50, 75], humidity: [70, 85], wind: [15, 30], pressure: [995, 1005], color: '#60a5fa', icon: 'fa-cloud-rain' },
        'heavy': { chance: [70, 95], humidity: [80, 95], wind: [25, 45], pressure: [985, 998], color: '#3b82f6', icon: 'fa-cloud-showers-heavy' }
    };
    
    const sunnyRanges = {
        humidity: [30, 55],
        wind: [5, 20],
        pressure: [1010, 1025]
    };
    
    // Helper functions
    function roundToNearest5(num) { return Math.round(num / 5) * 5; }
    function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function randomFromArray(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function getWindDirection() { return randomFromArray(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']); }
    
    function generateWeatherForSession(tempRange, isRainy, intensity) {
        if (isRainy) {
            const rainSettings = rainIntensityMap[intensity];
            const condition = intensity === 'heavy' ? 'HEAVY RAIN' : (intensity === 'medium' ? 'RAIN' : 'LIGHT RAIN');
            const rainChance = roundToNearest5(randomInt(rainSettings.chance[0], rainSettings.chance[1]));
            const temp = randomInt(tempRange.min, tempRange.max);
            const humidity = randomInt(rainSettings.humidity[0], rainSettings.humidity[1]);
            const windSpeed = randomInt(rainSettings.wind[0], rainSettings.wind[1]);
            const windDir = getWindDirection();
            const pressure = randomInt(rainSettings.pressure[0], rainSettings.pressure[1]);
            
            return {
                condition,
                temp,
                humidity,
                windSpeed,
                windDir,
                pressure,
                rainChance,
                icon: rainSettings.icon,
                color: rainSettings.color,
                isRainy: true,
                intensity
            };
        } else {
            const condition = 'SUNNY';
            const temp = randomInt(tempRange.min, tempRange.max);
            const humidity = randomInt(sunnyRanges.humidity[0], sunnyRanges.humidity[1]);
            const windSpeed = randomInt(sunnyRanges.wind[0], sunnyRanges.wind[1]);
            const windDir = getWindDirection();
            const pressure = randomInt(sunnyRanges.pressure[0], sunnyRanges.pressure[1]);
            
            return {
                condition,
                temp,
                humidity,
                windSpeed,
                windDir,
                pressure,
                rainChance: 0,
                icon: 'fa-sun',
                color: '#fbbf24',
                isRainy: false,
                intensity: null
            };
        }
    }
    
    const tempRange = tempRangeMap[ws.tempRange];
    const q1 = generateWeatherForSession(tempRange, ws.rainState.q1.active, ws.rainState.q1.intensity);
    const q2 = generateWeatherForSession(tempRange, ws.rainState.q2.active, ws.rainState.q2.intensity);
    const race = generateWeatherForSession(tempRange, ws.rainState.race.active, ws.rainState.race.intensity);
    
    const session2Name = ws.isSprintMode ? 'SPRINT' : 'QUALIFYING 2';
    const session2TimeClass = ws.isSprintMode ? 'weather-session-time-dark sprint-time' : 'weather-session-time-dark';
    const session2CardClass = ws.isSprintMode ? 'weather-quali-card-dark sprint-mode' : 'weather-quali-card-dark';
    const session2IconHtml = ws.isSprintMode ? '<i class="fas fa-bolt" style="color:#00d4ff;"></i>' : '<i class="fas fa-stopwatch"></i>';
    const session2TitleStyle = ws.isSprintMode ? 'style="color:#00d4ff;"' : '';
    
    let raceSubText = '';
    if (race.isRainy) {
        if (race.intensity === 'heavy') raceSubText = 'wet · full wets likely';
        else if (race.intensity === 'medium') raceSubText = 'wet · intermediates likely';
        else raceSubText = 'damp · slick conditions';
    } else {
        raceSubText = 'clear · ideal track';
    }
    
    const q1CondShort = q1.isRainy ? 'rain' : 'sunny';
    const q2CondShort = q2.isRainy ? 'rain' : 'sunny';
    const raceCondShort = race.isRainy ? 'rain' : 'sunny';
    const weatherIcon = race.isRainy ? 'fa-cloud-rain' : 'fa-sun';
    
    // Build graphic HTML only (no controls)
    const graphicHtml = `
        <div class="weather-dark-card" id="weather-graphic">
            <div class="weather-dark-header">
                <div class="weather-logo-dark">
                    <i class="fas fa-flag-checkered"></i>
                    <span>PL21</span>
                </div>
                <div class="weather-badge-dark">WEATHER REPORT</div>
            </div>
            
            <div class="weather-event-bar-dark">
                <span class="weather-live-dark"><i class="fas fa-circle"></i> LIVE</span>
                <span id="weather-footer-date">${ws.date}</span>
            </div>

            <div class="weather-quali-grid-dark">
                <div class="weather-quali-card-dark">
                    <div class="weather-session-title-dark">
                        <i class="fas fa-stopwatch"></i> 
                        <span>QUALIFYING 1</span>
                    </div>
                    <div class="weather-session-time-dark" id="weather-q1-time-display">${ws.q1Time}</div>
                    <div class="weather-main-dark">
                        <i class="fas ${q1.icon}" style="color:${q1.color};"></i>
                        <span class="weather-temp-dark">${q1.temp}<small>°C</small></span>
                    </div>
                    <div class="weather-condition-dark">${q1.condition}</div>
                    <ul class="weather-details-dark">
                        <li><i class="fas fa-droplet"></i> ${q1.rainChance}% rain · ${q1.humidity}% humidity</li>
                        <li><i class="fas fa-wind"></i> ${q1.windSpeed} km/h · ${q1.windDir}</li>
                        <li><i class="fas fa-gauge-high"></i> ${q1.pressure} hPa</li>
                    </ul>
                </div>

                <div class="${session2CardClass}" id="weather-session2-card">
                    <div class="weather-session-title-dark" id="weather-session2-header">
                        ${session2IconHtml}
                        <span ${session2TitleStyle} id="weather-session2-title">${session2Name}</span>
                    </div>
                    <div class="${session2TimeClass}" id="weather-q2-time-display">${ws.q2Time}</div>
                    <div class="weather-main-dark">
                        <i class="fas ${q2.icon}" style="color:${q2.color};"></i>
                        <span class="weather-temp-dark">${q2.temp}<small>°C</small></span>
                    </div>
                    <div class="weather-condition-dark">${q2.condition}</div>
                    <ul class="weather-details-dark">
                        <li><i class="fas fa-droplet"></i> ${q2.rainChance}% rain · ${q2.humidity}% humidity</li>
                        <li><i class="fas fa-wind"></i> ${q2.windSpeed} km/h · ${q2.windDir}</li>
                        <li><i class="fas fa-gauge-high"></i> ${q2.pressure} hPa</li>
                    </ul>
                </div>
            </div>

            <div class="weather-race-section-dark">
                <div class="weather-race-header-dark">
                    <h2><i class="fas fa-trophy"></i> RACE</h2>
                    <div class="weather-race-time-dark" id="weather-race-time-display">${ws.raceTime}</div>
                </div>
                <div class="weather-race-weather-dark">
                    <div class="weather-race-icon-temp-dark">
                        <i class="fas ${race.icon}" style="color:${race.color};"></i>
                        <span class="weather-race-temp-dark">${race.temp}<small>°C</small></span>
                    </div>
                    <div class="weather-race-condition-box-dark">
                        <div class="weather-condition-dark-lg">${race.condition}</div>
                        <div class="weather-sub-dark">${raceSubText}</div>
                    </div>
                </div>
                <div class="weather-race-stats-dark">
                    <div class="weather-stat-dark"><i class="fas fa-droplet"></i> ${race.rainChance}% rain · ${race.humidity}%</div>
                    <div class="weather-stat-dark"><i class="fas fa-wind"></i> ${race.windSpeed} km/h · ${race.windDir}</div>
                    <div class="weather-stat-dark"><i class="fas fa-gauge-high"></i> ${race.pressure} hPa</div>
                    <div class="weather-stat-dark"><i class="fas fa-sun"></i> UV ${race.isRainy ? randomInt(0,2) : randomInt(6,9)}</div>
                </div>
            </div>

            <div class="weather-footer-dark">
                <span id="weather-footer-summary"><i class="fas ${weatherIcon}"></i> Q1 ${q1CondShort} · ${session2Name} ${q2CondShort} · RACE ${raceCondShort}</span>
                <span><i class="fas fa-map-pin"></i> TRACK FORECAST</span>
            </div>
        </div>
    `;
    
    container.innerHTML = graphicHtml;
    
    // Store reference for PNG capture
    window._currentWeatherGraphic = document.getElementById('weather-graphic');
};

// Function to refresh the weather display (called from main when controls change)
window.PL21_Weather_Refresh = function() {
    return window.PL21_Graphics_Weather({});
};

// Build weather controls for side panel
window.PL21_Weather_BuildControls = function() {
    const ws = window._weatherState || {
        isSprintMode: false,
        savedQ2Time: '17:15 – 17:10',
        rainState: {
            q1: { active: false, intensity: 'medium' },
            q2: { active: false, intensity: 'medium' },
            race: { active: false, intensity: 'medium' }
        },
        tempRange: 'mid-hot',
        date: '04-06 APR',
        q1Time: '17:00 – 17:15',
        q2Time: '17:15 – 17:10',
        raceTime: 'LIGHTS OUT - 17:25'
    };
    
    if (!window._weatherState) {
        window._weatherState = ws;
    }
    
    const session2Label = ws.isSprintMode ? 'SPRINT' : 'Q2';
    
    return `
        <div class="panel-header">
            <h2>Weather Generator</h2>
            <p>configure forecast</p>
        </div>
        <div class="form-section">
            <div class="form-group">
                <label>Date</label>
                <input type="text" class="form-control" id="weather-dateInput" value="${ws.date}">
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label>Q1 Time</label>
                    <input type="text" class="form-control" id="weather-q1TimeInput" value="${ws.q1Time}">
                </div>
                <div class="form-group">
                    <label>${session2Label} Time</label>
                    <input type="text" class="form-control" id="weather-q2TimeInput" value="${ws.q2Time}">
                </div>
            </div>
            
            <div class="form-group">
                <label>Race Time</label>
                <input type="text" class="form-control" id="weather-raceTimeInput" value="${ws.raceTime}">
            </div>
            
            <div class="form-group">
                <label>Temperature Range</label>
                <select class="form-control" id="weather-tempRangeSelect">
                    <option value="hot" ${ws.tempRange === 'hot' ? 'selected' : ''}>Hot (28-36°C)</option>
                    <option value="mid-hot" ${ws.tempRange === 'mid-hot' ? 'selected' : ''}>Mid-Hot (22-28°C)</option>
                    <option value="mid" ${ws.tempRange === 'mid' ? 'selected' : ''}>Mid (16-22°C)</option>
                    <option value="mid-cold" ${ws.tempRange === 'mid-cold' ? 'selected' : ''}>Mid-Cold (10-16°C)</option>
                    <option value="cold" ${ws.tempRange === 'cold' ? 'selected' : ''}>Cold (4-10°C)</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>🏁 SPRINT WEEKEND</label>
                <div class="weather-sprint-toggle-container">
                    <span style="color: #888; font-size: 13px;">${ws.isSprintMode ? 'Sprint format active' : 'Standard format'}</span>
                    <div class="weather-sprint-toggle-wrapper">
                        <span class="weather-sprint-label" id="weather-sprintStatus">${ws.isSprintMode ? 'ON' : 'OFF'}</span>
                        <div class="weather-toggle-switch ${ws.isSprintMode ? 'active' : ''}" id="weather-sprintToggle"></div>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label>Q1 Conditions</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="weather-rain-toggle-btn ${ws.rainState.q1.active ? 'active' : ''}" id="weather-q1RainToggle" style="flex: 1;">
                        <i class="fas fa-cloud-rain"></i> ${ws.rainState.q1.active ? 'RAIN ON' : 'RAIN OFF'}
                    </button>
                    <select class="form-control" id="weather-q1RainIntensity" style="width: 100px;">
                        <option value="light" ${ws.rainState.q1.intensity === 'light' ? 'selected' : ''}>Light</option>
                        <option value="medium" ${ws.rainState.q1.intensity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="heavy" ${ws.rainState.q1.intensity === 'heavy' ? 'selected' : ''}>Heavy</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>${session2Label} Conditions</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="weather-rain-toggle-btn ${ws.rainState.q2.active ? 'active' : ''}" id="weather-q2RainToggle" style="flex: 1;">
                        <i class="fas fa-cloud-rain"></i> ${ws.rainState.q2.active ? 'RAIN ON' : 'RAIN OFF'}
                    </button>
                    <select class="form-control" id="weather-q2RainIntensity" style="width: 100px;">
                        <option value="light" ${ws.rainState.q2.intensity === 'light' ? 'selected' : ''}>Light</option>
                        <option value="medium" ${ws.rainState.q2.intensity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="heavy" ${ws.rainState.q2.intensity === 'heavy' ? 'selected' : ''}>Heavy</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label>Race Conditions</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="weather-rain-toggle-btn ${ws.rainState.race.active ? 'active' : ''}" id="weather-raceRainToggle" style="flex: 1;">
                        <i class="fas fa-cloud-rain"></i> ${ws.rainState.race.active ? 'RAIN ON' : 'RAIN OFF'}
                    </button>
                    <select class="form-control" id="weather-raceRainIntensity" style="width: 100px;">
                        <option value="light" ${ws.rainState.race.intensity === 'light' ? 'selected' : ''}>Light</option>
                        <option value="medium" ${ws.rainState.race.intensity === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="heavy" ${ws.rainState.race.intensity === 'heavy' ? 'selected' : ''}>Heavy</option>
                    </select>
                </div>
            </div>
            
            <button class="generate-btn weather" id="weather-applyBtn">
                <i class="fas fa-sync-alt"></i> Apply Changes
            </button>
        </div>
    `;
};

// Attach weather control event listeners
window.PL21_Weather_AttachEvents = function(refreshCallback) {
    const ws = window._weatherState;
    
    function refresh() {
        if (refreshCallback) refreshCallback();
    }
    
    function toggleRain(session) {
        ws.rainState[session].active = !ws.rainState[session].active;
        const btn = document.getElementById(`weather-${session}RainToggle`);
        if (btn) {
            btn.classList.toggle('active', ws.rainState[session].active);
            btn.innerHTML = `<i class="fas fa-cloud-rain"></i> ${ws.rainState[session].active ? 'RAIN ON' : 'RAIN OFF'}`;
        }
        refresh();
    }
    
    // Rain toggles
    document.getElementById('weather-q1RainToggle')?.addEventListener('click', () => toggleRain('q1'));
    document.getElementById('weather-q2RainToggle')?.addEventListener('click', () => toggleRain('q2'));
    document.getElementById('weather-raceRainToggle')?.addEventListener('click', () => toggleRain('race'));
    
    // Intensity changes
    document.getElementById('weather-q1RainIntensity')?.addEventListener('change', (e) => {
        ws.rainState.q1.intensity = e.target.value;
        refresh();
    });
    document.getElementById('weather-q2RainIntensity')?.addEventListener('change', (e) => {
        ws.rainState.q2.intensity = e.target.value;
        refresh();
    });
    document.getElementById('weather-raceRainIntensity')?.addEventListener('change', (e) => {
        ws.rainState.race.intensity = e.target.value;
        refresh();
    });
    
    // Sprint toggle
    document.getElementById('weather-sprintToggle')?.addEventListener('click', function() {
        ws.isSprintMode = !ws.isSprintMode;
        this.classList.toggle('active', ws.isSprintMode);
        const statusEl = document.getElementById('weather-sprintStatus');
        if (statusEl) statusEl.textContent = ws.isSprintMode ? 'ON' : 'OFF';
        
        // Update status text
        const container = this.closest('.weather-sprint-toggle-container');
        if (container) {
            const statusTextEl = container.querySelector('span:first-child');
            if (statusTextEl) statusTextEl.textContent = ws.isSprintMode ? 'Sprint format active' : 'Standard format';
        }
        
        if (ws.isSprintMode) {
            ws.savedQ2Time = ws.q2Time;
            ws.q2Time = '17:15 – 17:30';
        } else {
            ws.q2Time = ws.savedQ2Time;
        }
        
        // Update input value
        const q2Input = document.getElementById('weather-q2TimeInput');
        if (q2Input) q2Input.value = ws.q2Time;
        
        // Find and update labels
        const formGroups = document.querySelectorAll('#control-panel .form-group');
        formGroups.forEach(group => {
            const label = group.querySelector('label');
            if (label) {
                if (label.textContent.includes('Time') && label.textContent !== 'Q1 Time' && label.textContent !== 'Race Time' && label.textContent !== 'Date') {
                    label.textContent = ws.isSprintMode ? 'SPRINT Time' : 'Q2 Time';
                }
                if (label.textContent.includes('Conditions') && label.textContent !== 'Q1 Conditions' && label.textContent !== 'Race Conditions') {
                    label.textContent = ws.isSprintMode ? 'SPRINT Conditions' : 'Q2 Conditions';
                }
            }
        });
        
        refresh();
    });
    
    // Apply button
    document.getElementById('weather-applyBtn')?.addEventListener('click', function() {
        ws.date = document.getElementById('weather-dateInput')?.value || ws.date;
        ws.q1Time = document.getElementById('weather-q1TimeInput')?.value || ws.q1Time;
        ws.q2Time = document.getElementById('weather-q2TimeInput')?.value || ws.q2Time;
        ws.raceTime = document.getElementById('weather-raceTimeInput')?.value || ws.raceTime;
        ws.tempRange = document.getElementById('weather-tempRangeSelect')?.value || ws.tempRange;
        refresh();
    });
};

// PNG capture for weather
window.PL21_Graphics_Weather.capturePNG = async function() {
    const element = window._currentWeatherGraphic;
    if (!element) return null;
    
    const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#1a1a22'
    });
    return canvas;
};