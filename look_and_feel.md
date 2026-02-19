# Stonebound Look and Feel: Asset Rendering Reference

This document contains the exact drawing logic for all visual assets in Stonebound. Refer to this code before making any changes to ensure the aesthetic remains consistent.

## 1. Environment Tiles

### Grass
```javascript
Assets.tiles.grass = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#4da862'; 
    ctx.fillRect(0,0, TILE_SIZE, TILE_SIZE);
    for(let i=0; i<15; i++) {
        let ox = (i * 17) % 32;
        let oy = (i * 23) % 32;
        let move = Math.sin(time * 0.005 + i) * 1;
        ctx.fillStyle = '#3d8c50'; 
        ctx.fillRect((ox + move)*4, oy*4, 4, 8);
        ctx.fillStyle = '#63c77d'; 
        ctx.fillRect((ox + move)*4, oy*4, 4, 4);
    }
};
```

### Water
```javascript
Assets.tiles.water = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = '#1e3a8a'; 
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    const drawWave = (x: number, y: number, color: string) => {
        ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.beginPath();
        ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 4, y + 6, x + 8, y);
        ctx.moveTo(x + 8, y); ctx.quadraticCurveTo(x + 12, y + 6, x + 16, y); ctx.stroke();
    };
    const waveColors = ['#4287f5', '#3461c1', '#2a52be'];
    for (let i = 0; i < 12; i++) {
        const baseX = (i * 47) % TILE_SIZE; const baseY = (i * 31) % TILE_SIZE;
        const xShift = Math.sin(time * 0.001 + i) * 12; const yShift = Math.cos(time * 0.0015 + i) * 4;
        const color = waveColors[i % 3];
        drawWave(baseX + xShift, baseY + yShift, color);
        drawWave((baseX + xShift + 40) % TILE_SIZE, (baseY + yShift + 20) % TILE_SIZE, color);
    }
};
```

### Path
```javascript
Assets.tiles.path = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#8b6b4d'; ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    const dirtColors = ['#765a41', '#a68564', '#5d4632'];
    for(let i=0; i<64; i++) {
        const x = (i * 37) % TILE_SIZE; const y = (i * 53) % TILE_SIZE;
        const size = (i % 3 === 0) ? 8 : 4; ctx.fillStyle = dirtColors[i % 3]; ctx.fillRect(x, y, size, size);
    }
};
```

### Bridge
```javascript
Assets.tiles.bridge = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#5c4033'; ctx.fillRect(0, 10, TILE_SIZE, TILE_SIZE - 20);
    for(let i = 0; i < TILE_SIZE; i += 16) {
        ctx.fillStyle = '#3d2b22'; ctx.fillRect(i, 10, 2, TILE_SIZE - 20);
        ctx.fillStyle = '#7a5a4a'; ctx.fillRect(i + 4, 15, 8, 4);
    }
    ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 5, TILE_SIZE, 5); ctx.fillRect(0, TILE_SIZE - 10, TILE_SIZE, 5);
};
```

### Volcanic Ground
```javascript
Assets.tiles.volcanicGround = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#2c2c2c'; // Dark Ash
    ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    ctx.fillStyle = '#1a1a1a';
    for(let i=0; i<8; i++) {
        const x = (i * 37) % TILE_SIZE; 
        const y = (i * 53) % TILE_SIZE;
        ctx.fillRect(x, y, 6, 6);
    }
    ctx.fillStyle = '#3e2723'; // Scorch marks
    ctx.fillRect(20, 20, 15, 5);
    ctx.fillRect(80, 80, 10, 10);
};
```

## 2. World Objects

### Tree
```javascript
Assets.tiles.tree = (ctx: CanvasRenderingContext2D, time: number) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 40, 15, 0, 0, Math.PI*2); ctx.fill();
    const trunkX = 52, trunkY = 75, trunkW = 24, trunkH = 45;
    ctx.fillStyle = '#5c4033'; ctx.fillRect(trunkX, trunkY, trunkW, trunkH);
    ctx.fillStyle = '#3d2b22'; ctx.fillRect(trunkX, trunkY, 6, trunkH); ctx.fillRect(trunkX + 12, trunkY + 10, 4, 8); ctx.fillRect(trunkX + 8, trunkY + 30, 4, 12);
    ctx.fillStyle = '#7a5a4a'; ctx.fillRect(trunkX + trunkW - 4, trunkY, 4, trunkH); ctx.fillRect(trunkX - 4, trunkY + trunkH - 8, 8, 8); ctx.fillRect(trunkX + trunkW - 4, trunkY + trunkH - 8, 8, 8);
    const leafDark = '#1a3d17', leafMid = '#2d5a27', leafBright = '#4da862', leafHighlight = '#7ed98f';
    let sway = Math.sin(time * 0.003) * 4;
    const drawClump = (x: number, y: number, w: number, h: number) => {
        ctx.fillStyle = leafDark; ctx.fillRect(x + sway, y, w, h);
        ctx.fillStyle = leafMid; ctx.fillRect(x + sway + 4, y + 4, w - 8, h - 8);
        ctx.fillStyle = leafBright; ctx.fillRect(x + sway + 8, y + 4, 8, 8);
        ctx.fillStyle = leafHighlight; ctx.fillRect(x + sway + w - 12, y + 4, 4, 4);
    };
    drawClump(20, 50, 32, 32); drawClump(76, 50, 32, 32); drawClump(40, 55, 48, 32); drawClump(28, 30, 36, 32); drawClump(64, 30, 36, 32); drawClump(44, 35, 40, 32); drawClump(48, 15, 32, 28);
    ctx.fillStyle = leafHighlight; ctx.fillRect(56 + sway, 15, 4, 4); ctx.fillRect(64 + sway, 19, 4, 4);
};
```

### Boulder
```javascript
Assets.tiles.boulder = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 105, 45, 18, 0, 0, Math.PI*2); ctx.fill();
    const base = '#4a4a4a', dark = '#2d2d2d', mid = '#6b6b6b', light = '#919191', spec = '#b0b0b0';
    ctx.fillStyle = dark; ctx.beginPath(); ctx.moveTo(25, 100); ctx.lineTo(15, 80); ctx.lineTo(30, 50); ctx.lineTo(60, 40); ctx.lineTo(95, 55); ctx.lineTo(110, 85); ctx.lineTo(100, 105); ctx.closePath(); ctx.fill();
    ctx.fillStyle = base; ctx.beginPath(); ctx.moveTo(35, 95); ctx.lineTo(25, 75); ctx.lineTo(40, 55); ctx.lineTo(65, 48); ctx.lineTo(90, 60); ctx.lineTo(100, 80); ctx.lineTo(90, 95); ctx.closePath(); ctx.fill();
    ctx.fillStyle = dark; ctx.fillRect(45, 65, 4, 12); ctx.fillRect(75, 75, 12, 4); ctx.fillRect(60, 55, 4, 4);
    ctx.fillStyle = mid; ctx.fillRect(35, 65, 8, 4); ctx.fillRect(70, 55, 15, 4);
    ctx.fillStyle = light; ctx.fillRect(55, 48, 20, 4); ctx.fillRect(40, 58, 4, 4);
    ctx.fillStyle = spec; ctx.fillRect(62, 48, 6, 2);
};
```

### Broken Boulder / Debris
```javascript
Assets.tiles.brokenBoulder = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#6b6b6b';
    ctx.fillRect(20, 80, 20, 15);
    ctx.fillRect(50, 90, 15, 10);
    ctx.fillRect(80, 85, 25, 15);
    ctx.fillRect(35, 60, 15, 12);
    
    ctx.fillStyle = '#4a4a4a';
    ctx.fillRect(25, 85, 10, 5);
    ctx.fillRect(55, 92, 5, 5);
    ctx.fillRect(85, 90, 15, 5);
    
    ctx.fillStyle = '#919191';
    ctx.fillRect(25, 80, 10, 3);
    ctx.fillRect(52, 90, 8, 2);
};
```

### Volcano
```javascript
Assets.tiles.volcano = (ctx: CanvasRenderingContext2D, time: number) => {
    Assets.tiles.volcanicGround(ctx);
    const centerX = 64;
    const baseY = 110;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX, baseY, 90, 30, 0, 0, Math.PI*2);
    ctx.fill();
    const mountainHeight = 220;
    const mountainWidth = 180;
    const grad = ctx.createLinearGradient(centerX, baseY - mountainHeight, centerX, baseY);
    grad.addColorStop(0, '#5d4037');
    grad.addColorStop(1, '#2c2c2c');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(centerX - mountainWidth/2, baseY);
    ctx.quadraticCurveTo(centerX - mountainWidth/4, baseY - mountainHeight/2, centerX - 40, baseY - mountainHeight);
    ctx.lineTo(centerX + 40, baseY - mountainHeight);
    ctx.quadraticCurveTo(centerX + mountainWidth/4, baseY - mountainHeight/2, centerX + mountainWidth/2, baseY);
    ctx.closePath();
    ctx.fill();
    const lavaGlow = Math.sin(time * 0.002) * 10;
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.ellipse(centerX, baseY - mountainHeight, 40, 10, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.ellipse(centerX, baseY - mountainHeight + 2, 30 + (lavaGlow/5), 6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(100, 100, 100, 0.4)';
    for(let i=0; i<3; i++) {
        const offset = (time / 1000 + i) % 3;
        const yPos = (baseY - mountainHeight) - (offset * 40);
        const width = 20 + (offset * 15);
        const alpha = 1 - (offset/3);
        if (alpha > 0) {
            ctx.globalAlpha = alpha * 0.4;
            ctx.beginPath();
            ctx.arc(centerX + Math.sin(time * 0.001 + i)*10, yPos, width, 0, Math.PI*2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1.0;
};
```

## 3. NPCs

### Mr. Pense (Player)
```javascript
const renderChar = (dir: string, frame: number) => {
    return (ctx: CanvasRenderingContext2D) => {
        const bob = (frame % 2 === 0 && player.isMoving) ? 4 : 0;
        const walkOffset = (frame === 1) ? -8 : (frame === 3 ? 8 : 0);
        const p = 4; 
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath(); ctx.ellipse(16*p, 28.5*p, 5*p, 2*p, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111'; 
        const isSide = dir === 'left' || dir === 'right';
        const lx = isSide ? (14.5*p) : (12*p + walkOffset);
        const rx = isSide ? (14.5*p) : (16*p - walkOffset);
        if (isSide) {
            ctx.fillRect(lx - 2*p, 26*p - bob + (walkOffset/2), 3*p, 3*p);
            ctx.fillRect(rx + 2*p, 26*p - bob - (walkOffset/2), 3*p, 3*p);
            ctx.fillStyle = '#263238'; 
            ctx.fillRect(lx - 2*p, 21*p - bob + (walkOffset/2), 3*p, 5*p);
            ctx.fillRect(rx + 2*p, 21*p - bob - (walkOffset/2), 3*p, 5*p);
        } else {
            ctx.fillRect(lx, 26*p - bob, 3*p, 3*p);
            ctx.fillRect(rx, 26*p - bob, 3*p, 3*p);
            ctx.fillStyle = '#263238'; 
            ctx.fillRect(lx, 21*p - bob, 3*p, 5*p);
            ctx.fillRect(rx, 21*p - bob, 3*p, 5*p);
        }
        const coatY = 13*p - bob, coatH = 10*p;
        ctx.fillStyle = '#eeeeee'; 
        if (isSide) {
            ctx.beginPath(); ctx.moveTo(14*p, coatY + p); ctx.quadraticCurveTo(16*p, coatY - 0.5*p, 18*p, coatY + p); ctx.lineTo(19*p, coatY + coatH); ctx.lineTo(13*p, coatY + coatH); ctx.closePath(); ctx.fill();
        } else {
            ctx.beginPath(); ctx.moveTo(11*p, coatY + 1.5*p); ctx.quadraticCurveTo(11*p, coatY, 13*p, coatY); ctx.lineTo(19*p, coatY); ctx.quadraticCurveTo(21*p, coatY, 21*p, coatY + 1.5*p); ctx.lineTo(22.5*p, coatY + coatH); ctx.lineTo(9.5*p, coatY + coatH); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = '#cfd8dc'; if (isSide) ctx.fillRect(13*p, coatY + coatH - p, 6*p, p); else ctx.fillRect(9.5*p, coatY + coatH - p, 13*p, p);
        if (dir === 'down') {
            ctx.fillStyle = '#e65100'; ctx.beginPath(); ctx.moveTo(14.5*p, coatY); ctx.lineTo(17.5*p, coatY); ctx.lineTo(16*p, coatY + 6*p); ctx.fill();
            ctx.fillStyle = '#ff9800'; ctx.beginPath(); ctx.moveTo(15*p, coatY); ctx.lineTo(17*p, coatY); ctx.lineTo(16*p, coatY + 4*p); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(14.5*p, coatY); ctx.lineTo(15.5*p, coatY + 7*p); ctx.lineTo(14*p, coatY + 7*p); ctx.fill();
            ctx.beginPath(); ctx.moveTo(17.5*p, coatY); ctx.lineTo(16.5*p, coatY + 7*p); ctx.lineTo(18*p, coatY + 7*p); ctx.fill();
        } else if (dir === 'up') {
            ctx.fillStyle = '#cfd8dc'; ctx.fillRect(15.5*p, coatY + p, p, 7*p);
            ctx.fillStyle = '#b0bec5'; ctx.fillRect(11.5*p, coatY + 5.5*p, 9*p, 1*p);
        }
        ctx.fillStyle = '#ffffff'; const armWidth = 2.2*p, lArmOff = walkOffset/2, rArmOff = -walkOffset/2;
        if (dir === 'down' || dir === 'up') {
            ctx.save(); ctx.translate(11*p, coatY + 1.5*p); ctx.rotate(0.1 * (lArmOff/4)); ctx.fillRect(-armWidth, 0, armWidth, 6.5*p); ctx.fillStyle = '#ffdbac'; ctx.fillRect(-armWidth + 0.1*p, 6.5*p, 2*p, 2*p); ctx.restore();
            ctx.fillStyle = '#ffffff'; ctx.save(); ctx.translate(21*p, coatY + 1.5*p); ctx.rotate(-0.1 * (rArmOff/4)); ctx.fillRect(0, 0, armWidth, 6.5*p); ctx.fillStyle = '#ffdbac'; ctx.fillRect(0.1*p, 6.5*p, 2*p, 2*p); ctx.restore();
        } else {
            const isR = dir === 'right'; ctx.save(); ctx.translate(16*p, coatY + 1.5*p); ctx.rotate(isR ? (0.2 * (lArmOff/4)) : (-0.2 * (lArmOff/4))); ctx.fillRect(-armWidth/2, 0, armWidth, 7*p); ctx.fillStyle = '#ffdbac'; ctx.fillRect(-armWidth/2 + 0.1*p, 7*p, 2*p, 2*p); ctx.restore();
        }
        ctx.fillStyle = '#ffdbac'; ctx.beginPath(); ctx.ellipse(16*p, 8*p - bob, isSide ? 3*p : 3.5*p, 4.5*p, 0, 0, Math.PI * 2); ctx.fill();
        if (dir === 'down') {
            ctx.fillStyle = '#008080'; ctx.fillRect(13.25*p, 7.5*p - bob, 2.5*p, 2*p); ctx.fillRect(15.75*p, 8*p - bob, 0.5*p, 0.5*p); ctx.fillRect(16.25*p, 7.5*p - bob, 2.5*p, 2*p);
            ctx.fillStyle = '#00f2f2'; ctx.fillRect(13.75*p, 8*p - bob, 0.75*p, 0.75*p); ctx.fillRect(16.75*p, 8*p - bob, 0.75*p, 0.75*p);
        } else if (isSide) {
            const isL = dir === 'left'; ctx.fillStyle = '#008080'; ctx.fillRect(isL ? 13*p : 16.5*p, 7.5*p - bob, 2.5*p, 2*p); 
            ctx.fillStyle = '#00f2f2'; ctx.fillRect(isL ? 13.25*p : 18.25*p, 8*p - bob, 0.5*p, 0.5*p);
        }
        ctx.fillStyle = '#3e2723';
        if (dir === 'down') {
            ctx.beginPath(); ctx.arc(16*p, 6.5*p - bob, 3.8*p, Math.PI, 0); ctx.fill(); ctx.fillRect(12.5*p, 6.5*p - bob, 0.75*p, 1.5*p); ctx.fillRect(18.75*p, 6.5*p - bob, 0.75*p, 1.5*p);
        } else if (dir === 'up') {
            ctx.beginPath(); ctx.arc(16*p, 6.5*p - bob, 3.8*p, Math.PI, 0); ctx.fill(); ctx.fillRect(12.5*p, 6.5*p - bob, 7*p, 2.5*p); ctx.fillStyle = '#2d1b15'; ctx.fillRect(12.5*p, 8.5*p - bob, 7*p, 0.5*p);
        } else if (isSide) {
            const isL = dir === 'left'; ctx.beginPath(); ctx.arc(16*p, 6.5*p - bob, 3.3*p, Math.PI, 0); ctx.fill(); if (isL) ctx.fillRect(15*p, 6.5*p - bob, 4*p, 2.8*p); else ctx.fillRect(13*p, 6.5*p - bob, 4*p, 2.8*p);
            ctx.fillStyle = '#2d1b15'; if (isL) ctx.fillRect(17.5*p, 8.8*p - bob, 1.5*p, 0.5*p); else ctx.fillRect(13*p, 8.8*p - bob, 1.5*p, 0.5*p); ctx.fillStyle = '#f1c27d'; ctx.fillRect(14*p, 9.3*p - bob, 4*p, 0.7*p);
        }
    };
};
```

### Mr. Arnold
```javascript
Assets.tiles.mrArnold = (ctx: CanvasRenderingContext2D, time: number) => {
    const bob = Math.sin(time * 0.004) * 2;
    const p = 4; const cX = 16 * p; const bY = 28.5 * p;
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cX, bY, 5*p, 2*p, 0, 0, Math.PI * 2); ctx.fill();
    const skin = '#5d4037', robe = '#4a148c', gold = '#ffd700', shoes = '#111';
    ctx.fillStyle = shoes; ctx.fillRect(cX - 4 * p, 26 * p - bob, 3 * p, 3 * p); ctx.fillRect(cX + p, 26 * p - bob, 3 * p, 3 * p);
    const rY = 13 * p - bob, rH = 14 * p;
    ctx.fillStyle = robe; ctx.beginPath(); ctx.moveTo(cX - 6 * p, rY + rH); ctx.lineTo(cX + 6 * p, rY + rH); ctx.lineTo(cX + 3.5 * p, rY); ctx.lineTo(cX - 3.5 * p, rY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = gold; ctx.fillRect(cX - 6 * p, rY + rH - 1.5 * p, 12 * p, 1.5 * p); ctx.beginPath(); ctx.moveTo(cX - 3 * p, rY); ctx.lineTo(cX + 3 * p, rY); ctx.lineTo(cX, rY + 6 * p); ctx.fill();
    ctx.fillStyle = robe; ctx.fillRect(cX - 8 * p, rY + 2 * p, 3 * p, 7 * p); ctx.fillRect(cX + 5 * p, rY + 2 * p, 3 * p, 7 * p);
    ctx.fillStyle = gold; ctx.fillRect(cX - 8 * p, rY + 8 * p, 3 * p, p); ctx.fillRect(cX + 5 * p, rY + 8 * p, 3 * p, p);
    ctx.fillStyle = skin; ctx.fillRect(cX - 7.8 * p, rY + 9 * p, 2.2 * p, 2.2 * p); ctx.fillRect(cX + 5.6 * p, rY + 9 * p, 2.2 * p, 2.2 * p);
    ctx.beginPath(); ctx.ellipse(cX, 8 * p - bob, 3.5 * p, 4.5 * p, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillRect(cX - 2.8 * p, 7.5 * p - bob, 2.5 * p, 2.5 * p); ctx.fillRect(cX + 0.3 * p, 7.5 * p - bob, 2.5 * p, 2.5 * p);
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.strokeRect(cX - 2.8 * p, 7.5 * p - bob, 2.5 * p, 2.5 * p); ctx.strokeRect(cX + 0.3 * p, 7.5 * p - bob, 2.5 * p, 2.5 * p);
    ctx.beginPath(); ctx.moveTo(cX - 0.3 * p, 8.5 * p - bob); ctx.lineTo(cX + 0.3 * p, 8.5 * p - bob); ctx.stroke();
    ctx.fillStyle = robe; ctx.beginPath(); ctx.moveTo(cX - 5 * p, 4 * p - bob); ctx.lineTo(cX, -7 * p - bob); ctx.lineTo(cX + 5 * p, 4 * p - bob); ctx.closePath(); ctx.fill();
    ctx.fillRect(cX - 7 * p, 3.5 * p - bob, 14 * p, 1.5 * p); ctx.fillStyle = gold; ctx.fillRect(cX - 4 * p, 2.5 * p - bob, 8 * p, p);
};
```

### Magnus Obsidia
```javascript
Assets.tiles.magnus = (ctx: CanvasRenderingContext2D, time: number) => {
    const bob = Math.sin(time * 0.003) * 2;
    const glow = Math.abs(Math.sin(time * 0.002));
    Assets.tiles.volcanicGround(ctx);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; 
    ctx.beginPath(); ctx.ellipse(64, 110, 25, 10, 0, 0, Math.PI*2); ctx.fill();
    const obsidian = '#1a1a1a';
    const magma = `rgba(255, 87, 34, ${0.6 + glow * 0.4})`;
    const magmaBright = `rgba(255, 171, 64, ${0.7 + glow * 0.3})`;
    ctx.fillStyle = obsidian;
    ctx.fillRect(50, 80, 10, 30);
    ctx.fillRect(68, 80, 10, 30);
    ctx.fillStyle = magma;
    ctx.fillRect(54, 85, 2, 8);
    ctx.fillRect(72, 95, 2, 6);
    ctx.fillStyle = obsidian;
    ctx.fillRect(44, 50 + bob, 40, 40); 
    ctx.fillStyle = magmaBright;
    ctx.beginPath();
    ctx.moveTo(55, 60 + bob);
    ctx.lineTo(64, 75 + bob);
    ctx.lineTo(73, 60 + bob);
    ctx.lineTo(64, 65 + bob);
    ctx.fill();
    ctx.fillStyle = obsidian;
    ctx.fillRect(52, 25 + bob, 24, 28);
    ctx.fillStyle = '#ffeb3b';
    ctx.fillRect(56, 35 + bob, 6, 4);
    ctx.fillRect(66, 35 + bob, 6, 4);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(52, 25 + bob); ctx.lineTo(56, 15 + bob); ctx.lineTo(60, 25 + bob);
    ctx.lineTo(64, 12 + bob); ctx.lineTo(68, 25 + bob);
    ctx.lineTo(72, 15 + bob); ctx.lineTo(76, 25 + bob);
    ctx.fill();
    ctx.fillStyle = obsidian;
    ctx.fillRect(34, 50 + bob, 10, 35); 
    ctx.fillRect(84, 50 + bob, 10, 35);
    ctx.fillStyle = magma;
    ctx.fillRect(36, 52 + bob, 6, 6);
    ctx.fillRect(86, 52 + bob, 6, 6);
};
```

### Chip
```javascript
Assets.tiles.chip = (ctx: CanvasRenderingContext2D, time: number) => {
    const bob = Math.sin(time * 0.005) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 20, 8, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(40, 60 + bob