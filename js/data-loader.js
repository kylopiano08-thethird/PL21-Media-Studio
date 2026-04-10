// Data Loader Module
(function() {
    const SHEET_ID = '1ECRV_5PiAFGBx9lfgKU_ZYdRSgUG4OpTEm9YzrxBvMI';
    
    // Proper CSV parser that handles all edge cases
    function parseCSV(csv) {
        const rows = [];
        let currentRow = [];
        let currentField = '';
        let insideQuotes = false;
        
        for (let i = 0; i < csv.length; i++) {
            const char = csv[i];
            const nextChar = csv[i + 1];
            
            if (char === '"') {
                if (insideQuotes) {
                    if (nextChar === '"') {
                        // Escaped quote
                        currentField += '"';
                        i++;
                    } else {
                        // End of quoted field
                        insideQuotes = false;
                    }
                } else {
                    // Start of quoted field
                    insideQuotes = true;
                }
            } else if (char === ',' && !insideQuotes) {
                // End of field
                currentRow.push(currentField);
                currentField = '';
            } else if (char === '\n' && !insideQuotes) {
                // End of row
                currentRow.push(currentField);
                if (currentRow.some(f => f.trim() !== '')) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = '';
            } else if (char === '\r' && !insideQuotes) {
                // Skip carriage return
                // Do nothing
            } else {
                currentField += char;
            }
        }
        
        // Don't forget the last field and row
        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField);
            if (currentRow.some(f => f.trim() !== '')) {
                rows.push(currentRow);
            }
        }
        
        if (rows.length < 2) return [];
        
        // First row is headers
        const headers = rows[0].map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = row[index] || '';
            });
            data.push(obj);
        }
        
        return data;
    }

    async function fetchSheetCSV(sheetName) {
        const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
        try {
            const res = await fetch(url);
            const csv = await res.text();
            return parseCSV(csv);
        } catch (e) {
            console.warn(`Failed to load ${sheetName}`, e);
            return [];
        }
    }

    // Fallback colors
    const fallbackColors = {
        'Red Bull': { primary: '#1E5BC6', secondary: '#FF1E1E', logo: '' },
        'Ferrari': { primary: '#ED1C24', secondary: '#FFD800', logo: '' },
        'Mercedes': { primary: '#6CD3BF', secondary: '#00A0E0', logo: '' },
        'McLaren': { primary: '#F58020', secondary: '#1E3F6E', logo: '' },
        'Alpine': { primary: '#2293D1', secondary: '#FF69B4', logo: '' },
        'Alpha Tauri': { primary: '#4E7C9B', secondary: '#B22222', logo: '' },
        'Racing Bulls': { primary: '#4E7C9B', secondary: '#B22222', logo: '' },
        'Haas': { primary: '#B6BABD', secondary: '#D52B1E', logo: '' },
        'Alfa Romeo': { primary: '#B12039', secondary: '#8B8C8D', logo: '' },
        'Williams': { primary: '#37BEDD', secondary: '#041E42', logo: '' },
        'Aston Martin': { primary: '#2D826D', secondary: '#B6FF3A', logo: '' },
        'Cadillac': { primary: '#C0C0C0', secondary: '#000000', logo: '' },
        'Audi': { primary: '#000000', secondary: '#FF0000', logo: '' },
        'Unknown': { primary: '#888888', secondary: '#AAAAAA', logo: '' }
    };

    window.PL21_DATA = { 
        drivers: [], 
        raceRounds: [], 
        sprintRounds: [], 
        teamColors: {},
        
        getDriverTeamForRound: function(driver, roundNum) {
            if (!driver || !roundNum) return driver?.defaultTeam || 'Unknown';
            if (driver.movement && driver.movement[`round${roundNum}`]) {
                return driver.movement[`round${roundNum}`];
            }
            if (driver.movement) {
                for (let r = roundNum - 1; r >= 1; r--) {
                    if (driver.movement[`round${r}`]) {
                        return driver.movement[`round${r}`];
                    }
                }
            }
            return driver.defaultTeam || 'Unknown';
        },
        
        getTeamColors: function(team) {
            return this.teamColors[team] || fallbackColors[team] || fallbackColors.Unknown;
        }
    };

    async function loadAllData() {
        console.log('Loading data...');
        
        // Load Team Master
        const teamSheet = await fetchSheetCSV('Team Master');
        
        if (teamSheet && teamSheet.length > 0) {
            teamSheet.forEach((row) => {
                const teamName = row['Team Name'] || row['Team'] || '';
                const primary = row['Primary Color'] || row['Primary'] || row['PrimaryColor'] || '';
                const secondary = row['Secondary Color'] || row['Secondary'] || row['SecondaryColor'] || '';
                const logo = row['Logo'] || row['Team Logo'] || row['logo'] || row['Logo URL'] || row['LogoURL'] || '';
                
                if (teamName && primary) {
                    window.PL21_DATA.teamColors[teamName] = {
                        primary: primary,
                        secondary: secondary || '#FFFFFF',
                        logo: logo || ''
                    };
                }
            });
        }
        
        console.log('Team colors loaded:', Object.keys(window.PL21_DATA.teamColors).length, 'teams');

        // Load Calendar
        const calendarSheet = await fetchSheetCSV('Calendar');
        const raceRounds = [];
        const sprintRounds = [];
        
        if (calendarSheet.length > 0) {
            const headerRow = calendarSheet[0];
            Object.keys(headerRow).forEach(key => {
                if (key === 'Round Date') return;
                const roundMatch = key.match(/Round (\d+)/i);
                if (!roundMatch) return;
                const roundNum = parseInt(roundMatch[1]);
                let gpName = key.replace(/Round \d+.*$/, '').trim();
                
                const roundObj = { round: `Round ${roundNum}`, gp: gpName, roundNum };
                
                const sprintRow = calendarSheet[2];
                const isSprint = sprintRow && sprintRow[key] && sprintRow[key].toLowerCase().includes('yes');
                
                if (isSprint) {
                    roundObj.gp = gpName.includes('Sprint') ? gpName : gpName + ' Sprint';
                    sprintRounds.push(roundObj);
                } else {
                    roundObj.gp = gpName.includes('Grand Prix') ? gpName : gpName + ' Grand Prix';
                    raceRounds.push(roundObj);
                }
            });
        }
        
        raceRounds.sort((a, b) => a.roundNum - b.roundNum);
        sprintRounds.sort((a, b) => a.roundNum - b.roundNum);
        
        console.log('Rounds loaded:', raceRounds.length, 'races,', sprintRounds.length, 'sprints');

        // Load Driver Master
        const driverSheet = await fetchSheetCSV('Driver Master');
        const drivers = [];
        driverSheet.forEach((row) => {
            const name = row['Driver'] || row['Name'] || '';
            if (!name) return;
            
            const headshot = row['Headshot'] || row['Headshots'] || '';
            const f1Photo = row['F1 Photo'] || row['Photo'] || row['Driver Photo'] || row['Portrait'] || '';
            
            drivers.push({
                name: name,
                number: row['Number'] || row['Driver Number'] || '0',
                defaultTeam: row['Team'] || row['Default Team'] || 'Unknown',
                photo: f1Photo,
                headshot: headshot,
                movement: {}
            });
        });
        
        console.log('Drivers loaded:', drivers.length);
        console.log('Sample driver headshot:', drivers[0]?.headshot);

        // Load Driver Movement
        const movementSheet = await fetchSheetCSV('Driver Movement');
        movementSheet.forEach((row) => {
            const driverName = row['Driver'] || row['Name'] || '';
            if (!driverName) return;
            const movement = {};
            for (let r = 1; r <= 24; r++) {
                movement[`round${r}`] = row[`Round ${r}`] || row[`R${r}`] || '';
            }
            const driver = drivers.find(d => d.name === driverName);
            if (driver) driver.movement = movement;
        });

        window.PL21_DATA.drivers = drivers;
        window.PL21_DATA.raceRounds = raceRounds;
        window.PL21_DATA.sprintRounds = sprintRounds;
        
        document.getElementById('driver-count').textContent = drivers.length;
        document.getElementById('round-count').textContent = raceRounds.length + sprintRounds.length;
        document.getElementById('data-ready-badge').textContent = `loaded · ${drivers.length} drivers, ${raceRounds.length} races, ${sprintRounds.length} sprints`;
        
        console.log('Data loading complete');
        
        window.dispatchEvent(new CustomEvent('pl21-data-ready'));
    }

    loadAllData();
})();