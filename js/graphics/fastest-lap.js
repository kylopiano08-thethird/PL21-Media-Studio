// Fastest Lap Graphic
window.PL21_Graphics_FastestLap = async function(state) {
    const utils = window.PL21_Utils;
    const ctx = utils.getCtx();
    const canvas = utils.getCanvas();
    const width = canvas.width, height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const driver = window.PL21_DATA?.drivers.find(d => d.name === state.selectedDriver);
    const round = window.PL21_DATA?.raceRounds[state.selectedRound];
    if (!driver || !round) {
        ctx.fillStyle = '#fff';
        ctx.font = '24px Inter';
        ctx.fillText('Select driver and round', 300, 110);
        return;
    }
    
    const roundNum = parseInt(round.round.replace(/\D/g, '')) || 1;
    const teamForRound = window.PL21_DATA.getDriverTeamForRound(driver, roundNum);
    const teamColors = window.PL21_DATA.getTeamColors(teamForRound);
    const colors = utils.getColorPalette(teamColors);
    
    // 1. BACKGROUND GRADIENT
    const gradient = ctx.createRadialGradient(550, 110, 0, 550, 110, 500);
    gradient.addColorStop(0, colors.light);
    gradient.addColorStop(0.3, colors.primary);
    gradient.addColorStop(0.6, colors.dark);
    gradient.addColorStop(1, '#000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // 2. HEX PATTERN
    ctx.strokeStyle = colors.secondary + '26';
    ctx.lineWidth = 1;
    
    const hexSize = 25;
    const hexHeight = hexSize * Math.sqrt(3);
    
    for (let row = -2; row < height / hexHeight + 2; row++) {
        for (let col = -2; col < width / (hexSize * 1.5) + 2; col++) {
            const x = col * hexSize * 1.5;
            const y = row * hexHeight + (col % 2) * hexHeight / 2;
            
            if (y < height && y > 0 && x < width && x > 0) {
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3;
                    const hx = x + hexSize * Math.cos(angle);
                    const hy = y + hexSize * Math.sin(angle);
                    if (i === 0) ctx.moveTo(hx, hy);
                    else ctx.lineTo(hx, hy);
                }
                ctx.closePath();
                ctx.stroke();
            }
        }
    }
    
    // 3. BACKGROUND NUMBER
    ctx.save();
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 30;
    ctx.font = '800 200px Inter, sans-serif';
    ctx.fillStyle = colors.secondary + '40';
    const numberText = '#' + driver.number;
    const numberWidth = ctx.measureText(numberText).width;
    ctx.fillText(numberText, 200 - numberWidth/2, height - 30);
    ctx.shadowBlur = 0;
    ctx.restore();
    
    // 4. DRIVER INFO
    ctx.save();
    ctx.shadowColor = colors.dark;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    const maxNameWidth = 280;
    const nameSize = utils.getDynamicFontSize(driver.name, maxNameWidth, 38, 18);
    ctx.font = `bold ${nameSize}px Inter, sans-serif`;
    const driverNameWidth = ctx.measureText(driver.name).width;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(driver.name, 200 - driverNameWidth/2, 95);
    
    const teamName = teamForRound.toUpperCase();
    const maxTeamWidth = 260;
    const teamSize = utils.getDynamicFontSize(teamName, maxTeamWidth, 20, 14);
    ctx.font = `500 ${teamSize}px Inter, sans-serif`;
    const teamNameWidth = ctx.measureText(teamName).width;
    ctx.fillStyle = colors.secondary;
    ctx.fillText(teamName, 200 - teamNameWidth/2, 130);
    ctx.restore();
    
    // 5. FASTEST LAP TEXT
    ctx.save();
    ctx.shadowColor = colors.dark;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.font = '800 28px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.secondary;
    ctx.fillText('FASTEST LAP', 550, 75);
    ctx.restore();
    
    // 6. LAP TIME
    ctx.save();
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.font = '800 75px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    const timeText = state.lapTime;
    const timeWidth = ctx.measureText(timeText).width;
    ctx.fillText(timeText, 550 - timeWidth/2, 145);
    ctx.restore();
    
    // 7. ROUND INFO
    ctx.save();
    ctx.shadowColor = colors.dark;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    const rightEdgeX = 960;
    
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    const roundText = round.round.toUpperCase();
    const roundWidth = ctx.measureText(roundText).width;
    ctx.fillText(roundText, rightEdgeX - roundWidth, 70);
    
    ctx.font = 'bold 34px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    const gpText = round.gp.split(' ')[0].toUpperCase();
    const gpWidth = ctx.measureText(gpText).width;
    ctx.fillText(gpText, rightEdgeX - gpWidth, 115);
    
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = colors.secondary;
    const gpFullText = 'GRAND PRIX';
    const gpFullWidth = ctx.measureText(gpFullText).width;
    ctx.fillText(gpFullText, rightEdgeX - gpFullWidth, 145);
    ctx.restore();
    
    // 8. CROSSHAIRS
    ctx.strokeStyle = colors.secondary + '60';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(950, 20); ctx.lineTo(970, 20);
    ctx.moveTo(960, 10); ctx.lineTo(960, 30);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(30, 195); ctx.lineTo(50, 195);
    ctx.moveTo(40, 185); ctx.lineTo(40, 205);
    ctx.stroke();
};