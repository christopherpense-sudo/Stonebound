import { renderMrPense } from './player';

export const TILE_SIZE = 128;

export interface AssetsType {
    character: { down: any[], up: any[], left: any[], right: any[] };
    tiles: Record<string, any>;
}

export function generateAssets(
    Assets: AssetsType, 
    getActiveCrystalCount: () => number, 
    player: { isMoving: boolean, wearingHat: boolean }
) {
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

    Assets.tiles.path = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#8b6b4d'; ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        const dirtColors = ['#765a41', '#a68564', '#5d4632'];
        for(let i=0; i<64; i++) {
            const x = (i * 37) % TILE_SIZE; const y = (i * 53) % TILE_SIZE;
            const size = (i % 3 === 0) ? 8 : 4; ctx.fillStyle = dirtColors[i % 3]; ctx.fillRect(x, y, size, size);
        }
    };

    Assets.tiles.bridge = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#5c4033'; ctx.fillRect(0, 10, TILE_SIZE, TILE_SIZE - 20);
        for(let i = 0; i < TILE_SIZE; i += 16) {
            ctx.fillStyle = '#3d2b22'; ctx.fillRect(i, 10, 2, TILE_SIZE - 20);
            ctx.fillStyle = '#7a5a4a'; ctx.fillRect(i + 4, 15, 8, 4);
        }
        ctx.fillStyle = '#8d6e63'; ctx.fillRect(0, 5, TILE_SIZE, 5); ctx.fillRect(0, TILE_SIZE - 10, TILE_SIZE, 5);
    };

    Assets.tiles.volcanicGround = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#1a1a1a';
        for(let i=0; i<8; i++) {
            const x = (i * 37) % TILE_SIZE; 
            const y = (i * 53) % TILE_SIZE;
            ctx.fillRect(x, y, 6, 6);
        }
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(20, 20, 15, 5);
        ctx.fillRect(80, 80, 10, 10);
    };

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

    Assets.tiles.chip = (ctx: CanvasRenderingContext2D, time: number) => {
        const bob = Math.sin(time * 0.005) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 20, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#8d6e63';
        ctx.fillRect(40, 60 + bob, 4, 50); 
        ctx.fillRect(36, 60 + bob, 12, 4); 
        ctx.fillRect(40, 85 + bob, 8, 2); 
        ctx.fillRect(84, 60 + bob, 4, 50);
        ctx.fillRect(80, 60 + bob, 12, 4);
        ctx.fillRect(80, 85 + bob, 8, 2);
        ctx.fillStyle = '#1565c0'; 
        ctx.fillRect(56, 80, 6, 30); 
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(66, 80, 8, 28); 
        ctx.fillStyle = '#eeeeee'; 
        ctx.fillRect(66, 85, 8, 2);
        ctx.fillStyle = '#1565c0'; 
        ctx.fillRect(52, 50 + bob, 24, 35);
        ctx.fillStyle = '#1565c0';
        ctx.beginPath(); ctx.moveTo(52, 55 + bob); ctx.lineTo(44, 85 + bob); ctx.stroke(); 
        ctx.fillRect(46, 55 + bob, 6, 25); 
        ctx.fillRect(76, 55 + bob, 6, 25); 
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(44, 80 + bob, 6, 6);
        ctx.fillRect(78, 80 + bob, 6, 6);
        ctx.fillStyle = '#ffdbac';
        ctx.fillRect(56, 30 + bob, 16, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(54, 32 + bob, 20, 8);
        ctx.fillStyle = '#000';
        ctx.fillRect(60, 40 + bob, 2, 2); ctx.fillRect(68, 40 + bob, 2, 2);
        ctx.fillStyle = '#d32f2f'; 
        ctx.fillRect(62, 46 + bob, 6, 2);
    };

    Assets.tiles.brokenPillar = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 25, 10, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#9e9e9e';
        ctx.fillRect(44, 80, 40, 30);
        ctx.fillStyle = '#616161';
        ctx.beginPath(); ctx.moveTo(50, 80); ctx.lineTo(55, 95); ctx.lineTo(60, 85); ctx.lineTo(65, 100); ctx.stroke();
        ctx.fillStyle = '#bdbdbd';
        ctx.fillRect(20, 100, 15, 10);
        ctx.fillRect(90, 105, 10, 8);
        ctx.fillRect(60, 60, 30, 15);
    };

    Assets.tiles.smashedPot = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
        ctx.beginPath(); ctx.ellipse(64, 105, 25, 8, 0, 0, Math.PI*2); ctx.fill();
        const ceramic = '#e3f2fd', pattern = '#1565c0';
        ctx.fillStyle = ceramic;
        ctx.beginPath();
        ctx.moveTo(50, 105);
        ctx.lineTo(50, 90);
        ctx.lineTo(60, 95);
        ctx.lineTo(70, 85);
        ctx.lineTo(78, 90);
        ctx.lineTo(78, 105);
        ctx.quadraticCurveTo(64, 115, 50, 105);
        ctx.fill();
        ctx.fillStyle = pattern;
        ctx.fillRect(55, 100, 18, 2);
        ctx.beginPath(); ctx.arc(64, 105, 4, 0, Math.PI*2); ctx.fill();
        const drawShard = (x: number, y: number, w: number, h: number, rot: number) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rot);
            ctx.fillStyle = ceramic;
            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(w, h/2); ctx.lineTo(0, h); ctx.closePath(); ctx.fill();
            ctx.fillStyle = pattern;
            ctx.fillRect(2, 2, 2, 2);
            ctx.restore();
        };
        drawShard(40, 100, 10, 8, 0.5);
        drawShard(85, 95, 12, 10, -0.2);
        drawShard(60, 80, 8, 6, 2.0);
        ctx.save();
        ctx.translate(30, 90);
        ctx.rotate(-0.5);
        ctx.fillStyle = ceramic;
        ctx.fillRect(0, 0, 15, 4);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 1, 15, 1);
        ctx.restore();
    };

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

    Assets.tiles.pileOfStones = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#6b6b6b';
        ctx.fillRect(30, 90, 30, 20);
        ctx.fillRect(65, 95, 25, 15);
        ctx.fillRect(45, 75, 25, 20);
        ctx.fillRect(60, 80, 20, 15);
        ctx.fillRect(55, 60, 20, 15);
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(30, 105, 30, 5);
        ctx.fillRect(45, 90, 25, 5);
        ctx.fillStyle = '#919191';
        ctx.fillRect(35, 90, 10, 5);
        ctx.fillRect(60, 60, 10, 5);
    };

    Assets.tiles.stonehenge = (ctx: CanvasRenderingContext2D, time: number | null) => {
        const stoneColor = '#8c8c8c', shadowColor = '#5a5a5a', highlightColor = '#b0b0b0';
        const isWinGlow = time !== null;
        
        ctx.save();
        if (isWinGlow) {
            const pulse = Math.sin(time! * 0.005) * 0.5 + 0.5;
            ctx.shadowBlur = 15 + pulse * 10;
            ctx.shadowColor = '#00f2f2';
            ctx.fillStyle = `rgba(0, 242, 242, ${0.1 + pulse * 0.2})`;
            ctx.fillRect(-10, -10, TILE_SIZE+20, TILE_SIZE+20);
        }

        ctx.fillStyle = stoneColor;
        ctx.fillRect(35, 60, 18, 50);
        ctx.fillRect(75, 60, 18, 50);
        ctx.fillRect(30, 45, 68, 15);
        ctx.fillRect(20, 100, 12, 10);
        ctx.fillRect(100, 105, 10, 5);
        ctx.fillStyle = shadowColor;
        ctx.fillRect(48, 60, 5, 50);
        ctx.fillRect(88, 60, 5, 50);
        ctx.fillRect(30, 57, 68, 3);
        ctx.fillRect(35, 105, 18, 5);
        ctx.fillRect(75, 105, 18, 5);
        ctx.fillStyle = isWinGlow ? '#00f2f2' : highlightColor;
        ctx.fillRect(30, 45, 68, 4);
        ctx.fillRect(35, 60, 4, 40);
        ctx.fillRect(75, 60, 4, 40);
        ctx.fillRect(20, 100, 6, 3);
        ctx.restore();
    };

    Assets.tiles.building = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(10, 80, 108, 40);
        ctx.fillStyle = '#6d4c41'; ctx.fillRect(20, 50, 88, 70);
        ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.moveTo(10, 60); ctx.lineTo(64, 10); ctx.lineTo(118, 60); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#2d1b15'; for(let i=0; i<5; i++) { ctx.fillRect(30 + i*16, 40 - i*2, 8, 4); }
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(52, 90, 24, 30);
        ctx.fillStyle = '#00f2f2'; ctx.globalAlpha = 0.3; ctx.fillRect(54, 92, 20, 28); ctx.globalAlpha = 1.0;
    };

    Assets.tiles.intWall = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#2d1b15'; ctx.fillRect(0,0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#3e2723'; ctx.fillRect(4, 4, TILE_SIZE-8, TILE_SIZE-8);
        ctx.fillStyle = '#4e342e'; ctx.fillRect(20, 20, 24, 12); ctx.fillRect(80, 60, 16, 20);
    };

    Assets.tiles.intFloor = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#6d4c41'; ctx.fillRect(0,0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#5d4037'; for(let i=0; i<TILE_SIZE; i+=32) { ctx.fillRect(i, 0, 2, TILE_SIZE); }
    };

    Assets.tiles.intExit = (ctx: CanvasRenderingContext2D) => {
        Assets.tiles.intFloor(ctx); ctx.fillStyle = '#000'; ctx.fillRect(32, 110, 64, 18);
        ctx.fillStyle = '#00f2f2'; ctx.globalAlpha = 0.2; ctx.fillRect(32, 90, 64, 38); ctx.globalAlpha = 1.0;
    };

    Assets.tiles.caveEntrance = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 50, 20, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4a4a4a'; ctx.beginPath(); ctx.arc(64, 80, 50, Math.PI, 0); ctx.lineTo(114, 110); ctx.lineTo(14, 110); ctx.fill();
        ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(64, 110, 30, Math.PI, 0); ctx.fill();
        ctx.fillStyle = '#6b6b6b'; ctx.fillRect(30, 60, 10, 10); ctx.fillRect(80, 50, 15, 5);
    };

    Assets.tiles.caveWall = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#2d2d2d'; ctx.fillRect(0,0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(0, 0, TILE_SIZE, 20); 
        ctx.fillStyle = '#3d3d3d'; ctx.fillRect(20, 40, 30, 30); ctx.fillRect(80, 70, 20, 20);
    };

    Assets.tiles.caveFloor = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#3e2723'; ctx.fillRect(0,0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#281a17'; for(let i=0; i<5; i++) { ctx.fillRect(Math.random()*100, Math.random()*100, 10, 5); }
    };

    Assets.tiles.darkDirt = (ctx: CanvasRenderingContext2D) => {
        Assets.tiles.caveFloor(ctx);
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; 
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = '#222';
        ctx.fillRect(30, 30, 10, 10);
        ctx.fillRect(80, 80, 15, 15);
        ctx.fillRect(50, 100, 8, 8);
        ctx.fillStyle = '#4a3b36';
        ctx.fillRect(40, 40, 6, 6);
        ctx.fillRect(90, 20, 8, 8);
    };

    Assets.tiles.caveExit = (ctx: CanvasRenderingContext2D) => {
        Assets.tiles.caveFloor(ctx); ctx.fillStyle = '#000'; ctx.fillRect(20, 80, 88, 48); 
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; ctx.beginPath(); ctx.moveTo(20, 128); ctx.lineTo(40, 0); ctx.lineTo(88, 0); ctx.lineTo(108, 128); ctx.fill();
    };

    Assets.tiles.stairsDown = (ctx: CanvasRenderingContext2D) => {
        Assets.tiles.caveFloor(ctx);
        ctx.fillStyle = '#111';
        ctx.fillRect(20, 20, 88, 88);
        ctx.fillStyle = '#222';
        for(let i=0; i<4; i++) {
            ctx.fillRect(20 + (i*10), 20 + (i*10), 88 - (i*20), 88 - (i*20));
            ctx.fillStyle = (i%2===0) ? '#1a1a1a' : '#2a2a2a';
        }
    };
    
    Assets.tiles.stairsUp = (ctx: CanvasRenderingContext2D) => {
        Assets.tiles.caveFloor(ctx);
        ctx.fillStyle = '#333';
        ctx.fillRect(20, 20, 88, 88);
        ctx.fillStyle = '#444'; 
        for(let i=0; i<4; i++) {
            ctx.fillRect(20 + (i*10), 20 + (i*10), 88 - (i*20), 88 - (i*20));
            ctx.fillStyle = (i%2===0) ? '#3a3a3a' : '#4a4a4a';
        }
    };

    Assets.tiles.monsterStatue = (ctx: CanvasRenderingContext2D, time: number) => {
        const activeCount = getActiveCrystalCount();
        const eyesAwakened = activeCount >= 10;
        ctx.save();
        ctx.translate(64, 110);
        ctx.scale(3, 3);
        ctx.translate(-64, -110);
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath(); ctx.ellipse(64, 110, 45, 12, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#424242';
        ctx.fillRect(44, 55, 40, 55);
        ctx.fillRect(36, 60, 56, 20);
        ctx.fillRect(30, 65, 10, 45);
        ctx.fillRect(88, 65, 10, 45);
        ctx.fillStyle = '#212121';
        ctx.fillRect(28, 105, 14, 5);
        ctx.fillRect(86, 105, 14, 5);
        ctx.fillStyle = '#424242';
        ctx.fillRect(48, 25, 32, 35);
        ctx.fillStyle = '#212121';
        ctx.beginPath(); ctx.moveTo(48, 30); ctx.lineTo(40, 5); ctx.lineTo(55, 25); ctx.fill();
        ctx.beginPath(); ctx.moveTo(80, 30); ctx.lineTo(88, 5); ctx.lineTo(73, 25); ctx.fill();
        if (eyesAwakened) {
            const pulse = Math.sin(time * 0.01) * 0.2 + 0.8;
            ctx.fillStyle = `rgba(255, 109, 0, ${pulse})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff6d00';
            ctx.fillRect(54, 42, 6, 4);
            ctx.fillRect(68, 42, 6, 4);
            ctx.shadowBlur = 0;
        } else {
            ctx.fillStyle = '#ff6d00';
            ctx.globalAlpha = 0.5;
            ctx.fillRect(54, 42, 6, 4);
            ctx.fillRect(68, 42, 6, 4);
            ctx.globalAlpha = 1.0;
        }
        ctx.restore();
    };

    Assets.tiles.crystal = (ctx: CanvasRenderingContext2D, time: number, state: string) => {
        const glow = Math.sin(time * 0.005) * 0.2 + 0.8;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 100, 20, 8, 0, 0, Math.PI*2); ctx.fill();
        let outerColor, innerColor;
        if (state === 'green') {
            outerColor = `rgba(0, 255, 0, ${0.7 * glow})`;
            innerColor = 'rgba(200, 255, 200, 0.9)';
        } else if (state === 'red') {
            outerColor = `rgba(244, 67, 54, ${0.7 * glow})`;
            innerColor = 'rgba(255, 205, 210, 0.9)';
        } else {
            outerColor = `rgba(0, 255, 255, ${0.7 * glow})`;
            innerColor = 'rgba(200, 255, 200, 0.9)';
        }
        ctx.save();
        ctx.translate(64, 70);
        ctx.scale(glow, glow);
        ctx.fillStyle = outerColor;
        ctx.beginPath();
        ctx.moveTo(0, -40); ctx.lineTo(20, 0); ctx.lineTo(0, 40); ctx.lineTo(-20, 0); ctx.closePath();
        ctx.fill();
        ctx.fillStyle = innerColor;
        ctx.beginPath();
        ctx.moveTo(0, -40); ctx.lineTo(10, 0); ctx.lineTo(0, 40); ctx.lineTo(-5, 0); ctx.closePath();
        ctx.fill();
        ctx.restore();
    };

    Assets.tiles.skeletonNpc = (ctx: CanvasRenderingContext2D, time: number) => {
        const bob = Math.sin(time * 0.005) * 2, armSway = Math.sin(time * 0.005) * 0.15;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 20, 8, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(56, 80, 6, 25); ctx.fillRect(66, 80, 6, 25);
        ctx.save(); ctx.translate(54, 58); ctx.rotate(armSway); ctx.fillRect(-4, 0, 4, 20); ctx.restore();
        ctx.save(); ctx.translate(74, 58); ctx.rotate(-armSway); ctx.fillRect(0, 0, 4, 20); ctx.restore();
        ctx.fillRect(54, 75, 20, 8); ctx.fillRect(62, 55, 4, 20);
        ctx.fillRect(56, 58, 16, 2); ctx.fillRect(56, 62, 16, 2); ctx.fillRect(58, 66, 12, 2);
        ctx.fillRect(54, 35 + bob, 20, 18);
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(58, 40 + bob, 4, 4); ctx.fillRect(66, 40 + bob, 4, 4);
        ctx.fillStyle = '#5d4037'; ctx.fillRect(44, 32 + bob, 40, 4);
        ctx.fillStyle = '#6d4c41'; ctx.fillRect(54, 18 + bob, 20, 14);
        ctx.fillStyle = '#3e2723'; ctx.fillRect(54, 28 + bob, 20, 4);
    };

    Assets.tiles.table = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(20, 60, 10, 40); ctx.fillRect(98, 60, 10, 40);
        ctx.fillRect(20, 30, 10, 10); ctx.fillRect(98, 30, 10, 10); 
        ctx.fillStyle = '#5d4037';
        ctx.beginPath(); ctx.ellipse(64, 50, 48, 24, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#4e342e'; 
        ctx.beginPath(); ctx.ellipse(64, 54, 48, 24, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#6d4c41'; 
        ctx.beginPath(); ctx.ellipse(64, 48, 46, 22, 0, 0, Math.PI*2); ctx.fill();
    };

    Assets.tiles.chair = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#3e2723';
        ctx.fillRect(30, 60, 8, 30); ctx.fillRect(90, 60, 8, 30);
        ctx.fillRect(30, 40, 8, 10); ctx.fillRect(90, 40, 8, 10);
        ctx.fillStyle = '#5d4037'; ctx.fillRect(25, 50, 78, 15);
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(25, 10, 8, 40); ctx.fillRect(95, 10, 8, 40);
        ctx.fillRect(33, 15, 62, 10); ctx.fillRect(33, 30, 62, 10);
    };

    Assets.tiles.counter = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = '#4e342e'; ctx.fillRect(0, 40, TILE_SIZE, 88);
        ctx.fillStyle = '#3e2723'; ctx.fillRect(10, 50, TILE_SIZE-20, 68);
        ctx.fillStyle = '#8d6e63';
        ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(10, 30); ctx.lineTo(TILE_SIZE+10, 30); ctx.lineTo(TILE_SIZE, 40); ctx.fill();
        ctx.fillRect(0, 40, TILE_SIZE, 10);
    };

    Assets.tiles.rocky = (ctx: CanvasRenderingContext2D, time: number) => {
        const bob = Math.sin(time * 0.003) * 2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 25, 10, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#757575'; ctx.fillRect(44, 50 + bob, 40, 50);
        ctx.fillStyle = '#616161'; ctx.fillRect(48, 20 + bob, 32, 30);
        ctx.fillStyle = '#ffeb3b'; ctx.fillRect(54, 30 + bob, 6, 6); ctx.fillRect(68, 30 + bob, 6, 6);
        ctx.fillStyle = '#9e9e9e'; ctx.fillRect(34, 55 + bob, 10, 35); ctx.fillRect(84, 55 + bob, 10, 35);
    };

    Assets.tiles.dino = (ctx: CanvasRenderingContext2D, time: number) => {
        const bob = Math.sin(time * 0.005) * 3;
        const tailSway = Math.sin(time * 0.003) * 0.2;
        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(64, 110, 30, 10, 0, 0, Math.PI*2); ctx.fill();
        
        // Body (Tail to head)
        ctx.fillStyle = '#4da862';
        // Tail
        ctx.save();
        ctx.translate(35, 90 + bob);
        ctx.rotate(tailSway);
        ctx.fillRect(-15, -5, 20, 10);
        ctx.restore();
        
        // Main Body
        ctx.fillRect(35, 60 + bob, 40, 40);
        // Legs
        ctx.fillStyle = '#3d8c50';
        ctx.fillRect(40, 95, 8, 15);
        ctx.fillRect(62, 95, 8, 15);
        
        // Head
        ctx.fillStyle = '#4da862';
        ctx.fillRect(65, 40 + bob, 30, 25);
        // Eye
        ctx.fillStyle = '#000';
        ctx.fillRect(85, 45 + bob, 4, 4);
        
        // Arms (Little)
        ctx.fillStyle = '#3d8c50';
        ctx.fillRect(72, 70 + bob, 8, 4);
        
        // Belly (Light green)
        ctx.fillStyle = '#81c784';
        ctx.fillRect(45, 75 + bob, 15, 20);
    };

    Assets.tiles.chestClosed = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(64, 105, 38, 12, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3e2723'; ctx.fillRect(24, 55, 80, 45);
        ctx.fillStyle = '#4e342e'; ctx.fillRect(28, 55, 72, 4); 
        ctx.fillStyle = '#212121';
        ctx.fillRect(24, 50, 6, 50); ctx.fillRect(98, 50, 6, 50); ctx.fillRect(58, 50, 12, 50);
        ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.moveTo(24, 55); ctx.quadraticCurveTo(64, 30, 104, 55); ctx.fill();
        ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.moveTo(24, 55); ctx.quadraticCurveTo(27, 30, 30, 55); ctx.fill();
        ctx.beginPath(); ctx.moveTo(98, 55); ctx.quadraticCurveTo(101, 30, 104, 55); ctx.fill();
        ctx.beginPath(); ctx.moveTo(58, 55); ctx.quadraticCurveTo(64, 30, 70, 55); ctx.fill();
        ctx.fillStyle = '#fbc02d'; ctx.fillRect(60, 65, 8, 10);
        ctx.fillStyle = '#000'; ctx.fillRect(63, 68, 2, 4);
    };

    Assets.tiles.chestOpen = (ctx: CanvasRenderingContext2D) => {
        ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.beginPath(); ctx.ellipse(64, 105, 38, 12, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#212121'; ctx.fillRect(24, 25, 80, 30);
        ctx.fillStyle = '#1a0f0d'; ctx.fillRect(28, 55, 72, 40);
        ctx.fillStyle = '#3e2723'; ctx.fillRect(24, 75, 80, 25);
        ctx.fillStyle = '#212121'; ctx.fillRect(24, 75, 6, 25); ctx.fillRect(98, 75, 6, 25); ctx.fillRect(58, 75, 12, 25);
        ctx.fillStyle = '#ffd700'; ctx.fillRect(40, 65, 5, 5); ctx.fillRect(55, 68, 4, 4); ctx.fillRect(80, 62, 6, 6);
    };

    Assets.tiles.key = (ctx: CanvasRenderingContext2D) => {
        Assets.tiles.brokenBoulder(ctx);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); 
        ctx.arc(64, 40, 6, 0, Math.PI*2);
        ctx.fillRect(62, 46, 4, 14); ctx.fillRect(66, 50, 6, 3); ctx.fillRect(66, 56, 4, 3); 
        ctx.fill();
    };

    ['up', 'down', 'left', 'right'].forEach(d => {
        for(let f=0; f<4; f++) { 
            Assets.character[d as keyof typeof Assets.character][f] = renderMrPense(d, f, player.isMoving, player.wearingHat); 
        }
    });
}