import React, { useEffect, useRef, useState } from 'react';
import { applyCheat } from './cheats';
import { scienceQuestions, caveQuestions } from './questions';
import { DIALOGUE, MAGNUS_FACTS } from './dialogue';
import { baseWorldMap, baseInteriorMap, caveMap } from './maps';
import { TILE_SIZE, generateAssets, AssetsType } from './assets';
import { caveSong, overworldSong } from './songs';
import { SeededRNG, encodeSave, decodeSave } from './utils';

const App: React.FC = () => {
    const animationFrameRef = useRef<number>(0);
    const [resetKey, setResetKey] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);
    const shakeTimer = useRef(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winSequenceActive, setWinSequenceActive] = useState(false);
    const winTimerRef = useRef(0);
    const [isMobile, setIsMobile] = useState(false);
    const keysRef = useRef<{[key:string]: boolean}>({});
    const initAudioRef = useRef<() => void>(null);

    useEffect(() => {
        const checkMobile = () => {
            const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            const isSmall = window.innerWidth < 1024;
            setIsMobile(isTouch || isSmall);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleVirtualDown = (code: string) => {
        if (initAudioRef.current) initAudioRef.current();
        keysRef.current[code] = true;
    };
    const handleVirtualUp = (code: string) => {
        keysRef.current[code] = false;
    };
    const simulateKey = (code: string) => {
        if (initAudioRef.current) initAudioRef.current();
        window.dispatchEvent(new KeyboardEvent('keydown', { code }));
    };

    // Component-scope reset function to trigger a fresh start via useEffect re-run
    const triggerReset = () => {
        setIsGameOver(false);
        setWinSequenceActive(false);
        winTimerRef.current = 0;
        setResetKey(prev => prev + 1);
    };

    const toggleMute = () => {
        const newVal = !isMutedRef.current;
        isMutedRef.current = newVal;
        setIsMuted(newVal);
    };

    const gamepadConfig = useRef<{
        up: number | null;
        down: number | null;
        left: number | null;
        right: number | null;
        interact: number | null;
        menu: number | null;
        configured: boolean;
    }>({
        up: null,
        down: null,
        left: null,
        right: null,
        interact: null,
        menu: null,
        configured: false
    });
    const gamepadState = useRef<{[key: number]: boolean} & { lastNav?: number }>({});

    useEffect(() => {
        const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const questionModal = document.getElementById('questionModal') as HTMLDivElement;
        const qText = document.getElementById('qText') as HTMLDivElement;
        const qOptions = document.getElementById('qOptions') as HTMLDivElement;
        const qImage = document.getElementById('qImage') as HTMLImageElement;
        const invList = document.getElementById('invList') as HTMLDivElement;
        const sideMenu = document.getElementById('sideMenu') as HTMLDivElement;
        const inventoryModal = document.getElementById('inventoryModal') as HTMLDivElement;
        
        const saveModal = document.getElementById('saveModal') as HTMLDivElement;
        const loadModal = document.getElementById('loadModal') as HTMLDivElement;
        const settingsModal = document.getElementById('settingsModal') as HTMLDivElement;
        const wizardOverlay = document.getElementById('wizardOverlay') as HTMLDivElement;
        const wizardText = document.getElementById('wizardText') as HTMLDivElement;

        const saveCodeOutput = document.getElementById('saveCodeOutput') as HTMLTextAreaElement;
        const loadCodeInput = document.getElementById('loadCodeInput') as HTMLTextAreaElement;
        const closeSaveBtn = document.getElementById('closeSaveBtn') as HTMLButtonElement;
        const confirmLoadBtn = document.getElementById('confirmLoadBtn') as HTMLButtonElement;
        const cancelLoadBtn = document.getElementById('cancelLoadBtn') as HTMLButtonElement;
        
        const startScreen = document.getElementById('startScreen') as HTMLDivElement;
        const startBtn = document.getElementById('startBtn') as HTMLDivElement;
        const loadBtn = document.getElementById('loadBtn') as HTMLDivElement;
        const settingsBtn = document.getElementById('settingsBtn') as HTMLDivElement;
        const configControllerBtn = document.getElementById('configControllerBtn') as HTMLButtonElement;
        const closeSettingsBtn = document.getElementById('closeSettingsBtn') as HTMLButtonElement;

        const VIEW_WIDTH = 5;
        const VIEW_HEIGHT = 5;

        canvas.width = TILE_SIZE * VIEW_WIDTH;
        canvas.height = TILE_SIZE * VIEW_HEIGHT;

        const keys = keysRef.current;

        // --- Audio Engine ---
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        let noiseBuffer: AudioBuffer | null = null;
        const getNoiseBuffer = () => {
            if (!noiseBuffer) {
                const bufferSize = audioCtx.sampleRate * 2;
                noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
            }
            return noiseBuffer;
        };

        const playSound = (type: string) => {
            if (isMutedRef.current) return;
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const gain = audioCtx.createGain();
            gain.connect(audioCtx.destination);
            const now = audioCtx.currentTime;

            if (type === 'menu_move') {
                const osc = audioCtx.createOscillator();
                osc.connect(gain);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(300, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
            } else if (type === 'menu_select') {
                const osc = audioCtx.createOscillator();
                osc.connect(gain);
                osc.type = 'square';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'pickup') {
                const osc = audioCtx.createOscillator();
                osc.connect(gain);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'smash') {
                const osc = audioCtx.createBufferSource();
                osc.buffer = getNoiseBuffer();
                osc.connect(gain);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'dig') {
                const osc = audioCtx.createBufferSource();
                osc.buffer = getNoiseBuffer();
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                osc.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
            } else if (type === 'success') {
                const osc = audioCtx.createOscillator();
                osc.connect(gain);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
            } else if (type === 'win') {
                const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
                notes.forEach((freq, i) => {
                    const osc = audioCtx.createOscillator();
                    const g = audioCtx.createGain();
                    osc.connect(g);
                    g.connect(audioCtx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + i * 0.15);
                    g.gain.setValueAtTime(0, now + i * 0.15);
                    g.gain.linearRampToValueAtTime(0.15, now + i * 0.15 + 0.05);
                    g.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.5);
                    osc.start(now + i * 0.15);
                    osc.stop(now + i * 0.15 + 0.5);
                });
            } else if (type === 'fail') {
                const osc = audioCtx.createOscillator();
                osc.connect(gain);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.3);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
            } else if (type === 'earthquake') {
                const osc = audioCtx.createBufferSource();
                osc.buffer = getNoiseBuffer();
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(150, now);
                filter.frequency.exponentialRampToValueAtTime(40, now + 4);
                osc.connect(filter);
                const eqGain = audioCtx.createGain();
                filter.connect(eqGain);
                eqGain.connect(audioCtx.destination);
                eqGain.gain.setValueAtTime(0, now);
                eqGain.gain.linearRampToValueAtTime(0.6, now + 0.5);
                eqGain.gain.linearRampToValueAtTime(0.4, now + 3.5);
                eqGain.gain.linearRampToValueAtTime(0, now + 4);
                osc.start(now);
                osc.stop(now + 4);
            }
        };

        const getNoteFreq = (note: string | null) => {
            if (!note) return 0;
            const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            const octave = parseInt(note.slice(-1));
            const key = note.slice(0, -1);
            const idx = notes.indexOf(key);
            return 440 * Math.pow(2, ((octave * 12 + idx + 12) - 69) / 12);
        };

        let nextNoteTime = audioCtx.currentTime;
        let currentStep = 0;
        let schedulerTimer: number | null = null;

        const scheduleNote = (step: number, time: number, song: any) => {
            if (isMutedRef.current) return;
            song.tracks.forEach((track: any) => {
                const notes = track.notes.filter((n: any) => n.startStep === step);
                notes.forEach((note: any) => {
                    const osc = track.wave === 'noise' ? audioCtx.createBufferSource() : audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    const panner = audioCtx.createStereoPanner();

                    if (track.wave === 'noise') {
                        (osc as AudioBufferSourceNode).buffer = getNoiseBuffer();
                    } else {
                        (osc as OscillatorNode).type = track.wave as OscillatorType;
                        (osc as OscillatorNode).frequency.value = getNoteFreq(note.note);
                    }

                    panner.pan.value = track.pan;
                    
                    osc.connect(gain);
                    gain.connect(panner);
                    panner.connect(audioCtx.destination);

                    const vel = note.velocity || 0.5;
                    const duration = note.durationSteps * (60 / song.bpm / 4); 
                    
                    const atk = track.attack;
                    const dec = track.decay;
                    const sus = track.sustain;
                    const rel = track.release;

                    gain.gain.setValueAtTime(0, time);
                    gain.gain.linearRampToValueAtTime(track.volume * vel, time + atk);
                    const sustainLevel = Math.max(0.001, track.volume * vel * sus);
                    gain.gain.exponentialRampToValueAtTime(sustainLevel, time + atk + dec);
                    osc.start(time);
                    const stopTime = time + duration;
                    gain.gain.setValueAtTime(sustainLevel, stopTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, stopTime + rel);
                    osc.stop(stopTime + rel + 0.1);
                });
            });
        };

        const scheduler = () => {
            let activeSong = null;
            if (gameState === 'cave') activeSong = caveSong;
            else if (gameState === 'overworld') activeSong = overworldSong;

            if (!activeSong) {
                const secondsPerBeat = 60.0 / 100;
                const secondsPerStep = secondsPerBeat / 4;
                if (nextNoteTime < audioCtx.currentTime + 0.1) {
                    nextNoteTime += secondsPerStep;
                }
                schedulerTimer = window.setTimeout(scheduler, 25);
                return;
            }

            const secondsPerBeat = 60.0 / activeSong.bpm;
            const secondsPerStep = secondsPerBeat / 4; 

            while (nextNoteTime < audioCtx.currentTime + 0.1) {
                scheduleNote(currentStep, nextNoteTime, activeSong);
                nextNoteTime += secondsPerStep;
                currentStep = (currentStep + 1) % activeSong.totalSteps;
            }
            schedulerTimer = window.setTimeout(scheduler, 25);
        };

        const initAudio = () => {
            initAudioRef.current = initAudio;
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
            if (schedulerTimer === null) {
                nextNoteTime = audioCtx.currentTime + 0.1;
                scheduler();
            }
        };

        const worldMap = JSON.parse(JSON.stringify(baseWorldMap));
        worldMap[16][1] = 26;
        const interiorMap = JSON.parse(JSON.stringify(baseInteriorMap));
        const caveLevels = [caveMap]; 

        function generateRandomLevel(depth: number) {
            const map: number[][] = [];
            const height = 8;
            const width = 10;
            for(let y=0; y<height; y++) {
                const row: number[] = [];
                for(let x=0; x<width; x++) {
                    if (y===0 || y===height-1 || x===0 || x===width-1) row.push(12);
                    else row.push(13);
                }
                map.push(row);
            }
            for(let i=0; i<6; i++) {
                const rx = 1 + Math.floor(Math.random() * (width-2));
                const ry = 1 + Math.floor(Math.random() * (height-2));
                if (depth === 10) {
                        if ((rx === width-2 && ry === 1) || (rx === 1 && ry === 1) || (rx === 1 && ry === height-2)) {
                            continue;
                        }
                }
                map[ry][rx] = 12;
            }
            if (depth === 10) {
                map[1][width-2] = 21;
                map[1][1] = 22;
                map[height-2][1] = 29;
            } else {
                let upPlaced = false;
                let upX = -1, upY = -1;
                while(!upPlaced) {
                    const rx = 1 + Math.floor(Math.random() * (width-2));
                    const ry = 1 + Math.floor(Math.random() * (height-2));
                    if(map[ry][rx] === 13) {
                        map[ry][rx] = 21;
                        upPlaced = true; upX = rx; upY = ry;
                    }
                }
                if (depth < 10) {
                    let downPlaced = false;
                    while(!downPlaced) {
                        const rx = 1 + Math.floor(Math.random() * (width-2));
                        const ry = 1 + Math.floor(Math.random() * (height-2));
                        if(map[ry][rx] === 13) {
                            map[ry][rx] = 20;
                            downPlaced = true;
                        }
                    }
                }
                let crystalPlaced = false;
                while(!crystalPlaced) {
                    const rx = 1 + Math.floor(Math.random() * (width-2));
                    const ry = 1 + Math.floor(Math.random() * (height-2));
                    const distToUp = Math.abs(rx - upX) + Math.abs(ry - upY);
                    if(map[ry][rx] === 13 && distToUp > 1) {
                        map[ry][rx] = 22;
                        crystalPlaced = true;
                    }
                }
                if ([2, 5, 6, 9].includes(depth)) {
                    let dirtPlaced = false;
                    while(!dirtPlaced) {
                        const rx = 1 + Math.floor(Math.random() * (width-2));
                        const ry = 1 + Math.floor(Math.random() * (height-2));
                        if(map[ry][rx] === 13) {
                            map[ry][rx] = 30; 
                            dirtPlaced = true;
                        }
                    }
                }
            }
            return map;
        }

        for (let i = 1; i <= 10; i++) {
            caveLevels.push(generateRandomLevel(i));
        }

        let currentMap = worldMap;
        let gameState = 'start'; 
        let currentCaveDepth = 0;
        let isMenuOpen = false, isQuestionOpen = false, isInventoryOpen = false;
        let isSaveModalOpen = false, isLoadModalOpen = false, isSettingsOpen = false;
        let isControllerWizardActive = false;
        let selectedOption = 0, selectedInventoryIndex = 0, selectedQuestionIndex = 0;
        let selectedStartOption = 0, selectedSettingsOption = 0, selectedLoadOption = 0;
        let wizardStep = 0;
        let keyLocation = {x: -1, y: -1};

        const MAP_COLS = () => currentMap[0].length;
        const MAP_ROWS = () => currentMap.length;

        const player = {
            screenX: 6 * TILE_SIZE,
            screenY: 15 * TILE_SIZE, 
            dir: 'down', frame: 0, isMoving: false, speed: 5, animTimer: 0,
            inventory: { echoPrisms: 0, quickEscapes: 0, hammer: 0, key: 0, sediment: 0, shovel: 0, fossils: 0, indexFossil: 0, explorerHat: 0, metamorphicPebble: 0, arcaneEye: 0, instantTeleport: 0 } as any,
            hasPickupAbility: false, foundDigSite: false, hasActivatedStonehenge: false, wearingHat: false,
            reachedDepth10: false
        };

        function generateKeyLocation() {
            let boulders = [];
            for(let y=0; y<worldMap.length; y++) {
                for(let x=0; x<worldMap[y].length; x++) {
                    if(worldMap[y][x] === 5) {
                        if (x === 26 && y === 24) continue;
                        boulders.push({x, y});
                    }
                }
            }
            if(boulders.length > 0) {
                keyLocation = boulders[Math.floor(Math.random() * boulders.length)];
            }
        }

        function resetPlayer() {
            gameState = 'overworld'; currentMap = worldMap; currentCaveDepth = 0;
            player.screenX = 6 * TILE_SIZE; player.screenY = 15 * TILE_SIZE;
            player.dir = 'down'; player.frame = 0; player.isMoving = false;
            player.inventory.echoPrisms = 0; player.inventory.quickEscapes = 0;
            player.inventory.hammer = 0; player.inventory.key = 0; player.inventory.sediment = 0;
            player.inventory.shovel = 0; player.inventory.fossils = 0; player.inventory.indexFossil = 0;
            player.inventory.explorerHat = 0; player.inventory.metamorphicPebble = 0; player.inventory.arcaneEye = 0;
            player.inventory.instantTeleport = 0; player.hasPickupAbility = false;
            player.foundDigSite = false; player.hasActivatedStonehenge = false; player.wearingHat = false;
            player.reachedDepth10 = false;
             if (worldMap[16][1] === 27) worldMap[16][1] = 26;
             worldMap[24][26] = 5;
             for(let y=0; y<worldMap.length; y++) {
                for(let x=0; x<worldMap[y].length; x++) {
                    if(worldMap[y][x] === 25 || worldMap[y][x] === 28) worldMap[y][x] = 5;
                }
            }
            generateKeyLocation();
            setIsGameOver(false);
            setWinSequenceActive(false);
            winTimerRef.current = 0;
        }

        function openSaveModalFunc() {
            const dataToSave = { w: worldMap, c: caveLevels, i: interiorMap, p: player, gs: gameState, d: currentCaveDepth, k: keyLocation };
            saveCodeOutput.value = encodeSave(dataToSave);
            saveModal.style.display = 'flex'; isSaveModalOpen = true;
        }

        function closeSaveModalFunc() { saveModal.style.display = 'none'; isSaveModalOpen = false; }
        function openLoadModalFunc() { loadModal.style.display = 'flex'; loadCodeInput.value = ""; selectedLoadOption = 0; updateLoadModalUI(); isLoadModalOpen = true; }
        function closeLoadModalFunc() { loadModal.style.display = 'none'; isLoadModalOpen = false; }

        function confirmLoadFunc() {
            const input = loadCodeInput.value.trim();
            if(!input) return;
            if (applyCheat(input, { worldMap, caveLevels, interiorMap, player })) {
                closeLoadModalFunc();
                if (gameState === 'start') { gameState = 'overworld'; currentMap = worldMap; startScreen.style.display = 'none'; }
                return;
            }
            const data = decodeSave(input);
            if (!data) { alert("Invalid or corrupt save code."); return; }
            for(let r=0; r<worldMap.length; r++) worldMap[r] = data.w[r];
            for(let r=0; r<interiorMap.length; r++) interiorMap[r] = data.i[r];
            for(let l=0; l<caveLevels.length; l++) caveLevels[l] = data.c[l];
            Object.assign(player, data.p);
            gameState = data.gs; currentCaveDepth = data.d; keyLocation = data.k;
            if (gameState === 'overworld') currentMap = worldMap;
            else if (gameState === 'interior') currentMap = interiorMap;
            else if (gameState === 'cave') currentMap = caveLevels[currentCaveDepth];
            closeLoadModalFunc(); startScreen.style.display = 'none'; if(isMenuOpen) toggleMenu();
        }

        function openSettingsFunc() { startScreen.style.display = 'none'; settingsModal.style.display = 'flex'; selectedSettingsOption = 0; updateSettingsUI(); isSettingsOpen = true; }
        function updateSettingsUI() {
            if (selectedSettingsOption === 0) { configControllerBtn.classList.add('selected'); closeSettingsBtn.classList.remove('selected'); }
            else { configControllerBtn.classList.remove('selected'); closeSettingsBtn.classList.add('selected'); }
        }
        function updateLoadModalUI() {
            if (selectedLoadOption === 0) { confirmLoadBtn.classList.add('selected'); cancelLoadBtn.classList.remove('selected'); }
            else { confirmLoadBtn.classList.remove('selected'); cancelLoadBtn.classList.add('selected'); }
        }
        function closeSettingsFunc() { settingsModal.style.display = 'none'; startScreen.style.display = 'flex'; isSettingsOpen = false; }
        function startControllerWizard() { isControllerWizardActive = true; wizardStep = 0; settingsModal.style.display = 'none'; wizardOverlay.style.display = 'flex'; wizardText.textContent = "PRESS BUTTON FOR UP"; }

        function updateStartScreenUI() {
             const startEl = document.getElementById('startBtn'), loadEl = document.getElementById('loadBtn'), setEl = document.getElementById('settingsBtn');
             if(startEl) startEl.classList.remove('selected'); if(loadEl) loadEl.classList.remove('selected'); if(setEl) setEl.classList.remove('selected');
             if(selectedStartOption === 0 && startEl) startEl.classList.add('selected');
             if(selectedStartOption === 1 && loadEl) loadEl.classList.add('selected');
             if(selectedStartOption === 2 && setEl) setEl.classList.add('selected');
        }

        const keyHandler = (e: KeyboardEvent) => {
            initAudio();
            if (isControllerWizardActive) return; 
            if (isSettingsOpen) {
                if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'KeyW' || e.code === 'KeyS') { selectedSettingsOption = (selectedSettingsOption === 0) ? 1 : 0; updateSettingsUI(); playSound('menu_move'); }
                else if (e.code === 'Enter') { if (selectedSettingsOption === 0) configControllerBtn.click(); else closeSettingsBtn.click(); playSound('menu_select'); }
                return;
            }
            if (isLoadModalOpen) {
                if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') { selectedLoadOption = (selectedLoadOption === 0) ? 1 : 0; updateLoadModalUI(); playSound('menu_move'); }
                else if (e.code === 'Enter') { if (selectedLoadOption === 0) confirmLoadBtn.click(); else cancelLoadBtn.click(); playSound('menu_select'); }
                return;
            }
            if (isSaveModalOpen) { if (e.code === 'Enter') { closeSaveBtn.click(); playSound('menu_select'); } return; }
            if (e.code === 'Space') {
                if (gameState !== 'start' && !isSaveModalOpen && !isLoadModalOpen && !isSettingsOpen) {
                    if (!isQuestionOpen && !isInventoryOpen) { toggleMenu(); playSound('menu_select'); }
                    else if (isInventoryOpen) { closeInventory(); playSound('menu_select'); }
                }
                return;
            }
            if (gameState === 'start') {
                if (e.code === 'ArrowLeft' || e.code === 'KeyA') { selectedStartOption = (selectedStartOption - 1 + 3) % 3; updateStartScreenUI(); playSound('menu_move'); }
                else if (e.code === 'ArrowRight' || e.code === 'KeyD') { selectedStartOption = (selectedStartOption + 1) % 3; updateStartScreenUI(); playSound('menu_move'); }
                if (e.code === 'Enter') {
                    playSound('menu_select');
                    if (selectedStartOption === 0) startBtn.click();
                    else if (selectedStartOption === 1) loadBtn.click();
                    else if (selectedStartOption === 2) settingsBtn.click();
                }
                return;
            }
            if (isMenuOpen) {
                const visibleOptions: number[] = [];
                for(let i=0; i<=4; i++) { if(document.getElementById('opt-'+i)!.style.display !== 'none') visibleOptions.push(i); }
                const currentIndex = visibleOptions.indexOf(selectedOption);
                if (e.code === 'ArrowUp' || e.code === 'KeyW') { selectedOption = visibleOptions[(currentIndex - 1 + visibleOptions.length) % visibleOptions.length]; updateMenuUI(); playSound('menu_move'); }
                else if (e.code === 'ArrowDown' || e.code === 'KeyS') { selectedOption = visibleOptions[(currentIndex + 1) % visibleOptions.length]; updateMenuUI(); playSound('menu_move'); }
                else if (e.code === 'Enter') { playSound('menu_select'); handleMenuSelection(); }
                return;
            }
            if (isInventoryOpen) {
                const count = invList.children.length; if (count === 0) return;
                if (e.code === 'ArrowLeft' || e.code === 'KeyA') { selectedInventoryIndex = (selectedInventoryIndex - 1 + count) % count; updateInventoryUI(); playSound('menu_move'); }
                else if (e.code === 'ArrowRight' || e.code === 'KeyD') { selectedInventoryIndex = (selectedInventoryIndex + 1) % count; updateInventoryUI(); playSound('menu_move'); }
                else if (e.code === 'ArrowUp' || e.code === 'KeyW') { selectedInventoryIndex = (selectedInventoryIndex - 2 + count) % count; updateInventoryUI(); playSound('menu_move'); }
                else if (e.code === 'ArrowDown' || e.code === 'KeyS') { const next = selectedInventoryIndex + 2; selectedInventoryIndex = (next >= count) ? count - 1 : next; updateInventoryUI(); playSound('menu_move'); }
                else if (e.code === 'Enter') { playSound('menu_select'); (invList.children[selectedInventoryIndex] as HTMLElement).click(); }
                return;
            }
            if (isQuestionOpen) {
                const count = qOptions.children.length; if (count === 0) return;
                if (e.code === 'ArrowUp' || e.code === 'KeyW') { selectedQuestionIndex = (selectedQuestionIndex - 1 + count) % count; updateQuestionUI(); playSound('menu_move'); }
                else if (e.code === 'ArrowDown' || e.code === 'KeyS') { selectedQuestionIndex = (selectedQuestionIndex + 1) % count; updateQuestionUI(); playSound('menu_move'); }
                else if (e.code === 'Enter') { (qOptions.children[selectedQuestionIndex] as HTMLElement).click(); }
                return; 
            }
            if (e.code === 'Enter' && !isMenuOpen && !isQuestionOpen) { checkInteraction(); return; }
            keys[e.code] = true;
        }
        const keyUpHandler = (e: KeyboardEvent) => keys[e.code] = false;
        window.addEventListener('keydown', keyHandler);
        window.addEventListener('keyup', keyUpHandler);
        window.addEventListener('mousedown', initAudio);
        window.addEventListener('touchstart', initAudio);

        startBtn.onclick = () => { resetPlayer(); startScreen.style.display = 'none'; };
        loadBtn.onclick = () => openLoadModalFunc();
        settingsBtn.onclick = () => openSettingsFunc();
        configControllerBtn.onclick = startControllerWizard;
        closeSettingsBtn.onclick = closeSettingsFunc;
        confirmLoadBtn.onclick = confirmLoadFunc;
        cancelLoadBtn.onclick = closeLoadModalFunc;
        updateStartScreenUI();

        function toggleMenu() {
            isMenuOpen = !isMenuOpen; sideMenu.style.display = isMenuOpen ? 'flex' : 'none';
            const pickUpOpt = document.getElementById('opt-1');
            if (pickUpOpt) pickUpOpt.style.display = player.hasPickupAbility ? 'block' : 'none';
            selectedOption = 0; updateMenuUI();
        }

        function updateMenuUI() {
            for(let i=0; i<=4; i++) {
                const el = document.getElementById('opt-'+i);
                if(el) { if (i === selectedOption) el.classList.add('selected'); else el.classList.remove('selected'); }
            }
        }

        function handleMenuSelection() {
            if (selectedOption === 0) { toggleMenu(); openInventory(); }
            else if (selectedOption === 1) { toggleMenu(); performPickup(); }
            else if (selectedOption === 2) { toggleMenu(); }
            else if (selectedOption === 3) { openSaveModalFunc(); }
            else if (selectedOption === 4) { triggerReset(); }
        }

        function performPickup() {
            const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE);
            const gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
            const dirs = [ { x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 } ];
            let picked = false;
            for (const d of dirs) {
                const cx = gridX + d.x, cy = gridY + d.y;
                if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS()) {
                    if (currentMap[cy][cx] === 25) {
                        currentMap[cy][cx] = (gameState === 'cave') ? 13 : 0;
                        const amount = Math.floor(Math.random() * 7) + 3; player.inventory.sediment += amount;
                        alert(`Picked up ${amount} Sediment!`); playSound('pickup'); picked = true; break;
                    }
                }
            }
            if(!picked) alert("Nothing to pick up here.");
        }

        function openInventory() {
            isInventoryOpen = true; inventoryModal.style.display = 'flex'; invList.innerHTML = '';
            const createItem = (text: string, action: () => void, fullWidth = false) => {
                const d = document.createElement('div'); d.className = 'inv-item'; d.textContent = text; d.onclick = action;
                if (fullWidth) d.style.gridColumn = '1 / -1';
                invList.appendChild(d);
            };
            if (player.inventory.echoPrisms > 0) createItem(`Echo Prism (x${player.inventory.echoPrisms})`, () => useItem('echoPrism'));
            if (player.inventory.quickEscapes > 0) createItem(`Quick Escape (x${player.inventory.quickEscapes})`, () => useItem('quickEscape'));
            if (player.inventory.instantTeleport > 0) createItem(`Instant Teleport (x${player.inventory.instantTeleport})`, () => useItem('instantTeleport'));
            if (player.inventory.hammer > 0) createItem(`Hammer (x${player.inventory.hammer})`, () => useItem('hammer'));
            if (player.inventory.shovel > 0) createItem(`Shovel (x${player.inventory.shovel})`, () => useItem('shovel'));
            if (player.inventory.key > 0) createItem(`Key (x${player.inventory.key})`, () => useItem('key'));
            if (player.inventory.sediment > 0) createItem(`Sediment (x${player.inventory.sediment})`, () => alert("Just some dirt and rocks."));
            if (player.inventory.fossils > 0) createItem(`Fossils (x${player.inventory.fossils})`, () => alert("A curious ancient fossil."));
            if (player.inventory.indexFossil > 0) createItem(`Index Fossil`, () => alert("An extremely rare fossil that helps date rock layers precisely."));
            if (player.inventory.explorerHat > 0) createItem(`${player.wearingHat ? 'Unequip' : 'Equip'} Explorer Hat`, () => useItem('explorerHat'));
            if (player.inventory.metamorphicPebble > 0) createItem(`Metamorphic Pebble`, () => useItem('metamorphicPebble'));
            if (player.inventory.arcaneEye > 0) createItem(`Arcane Eye`, () => useItem('arcaneEye'));
            createItem('Close', closeInventory, true);
            selectedInventoryIndex = 0; updateInventoryUI();
        }

        function updateInventoryUI() {
            const items = invList.children;
            for (let i = 0; i < items.length; i++) { if (i === selectedInventoryIndex) items[i].classList.add('selected'); else items[i].classList.remove('selected'); }
        }

        function updateQuestionUI() {
            const items = qOptions.children;
            for (let i = 0; i < items.length; i++) { if (i === selectedQuestionIndex) items[i].classList.add('selected'); else items[i].classList.remove('selected'); }
        }

        function closeInventory() { inventoryModal.style.display = 'none'; isInventoryOpen = false; }

        function getActiveCrystalCount() {
            let count = 0;
            caveLevels.forEach(level => level.forEach(row => row.forEach(tile => { if (tile === 23) count++; })));
            return count;
        }

        function useItem(itemName: string) {
            if (itemName === 'echoPrism') {
                const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
                const dirs = [ { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 } ];
                let used = false;
                for (const d of dirs) {
                    const cx = gridX + d.x, cy = gridY + d.y;
                    if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS() && currentMap[cy][cx] === 24) {
                        currentMap[cy][cx] = 22; player.inventory.echoPrisms--;
                        showMessage("You used an Echo Prism! The crystal is active again."); playSound('success'); used = true; break;
                    }
                }
                if (!used) showMessage("You need to be next to a dormant (red) crystal to use this."); else closeInventory();
            } else if (itemName === 'quickEscape') {
                player.inventory.quickEscapes--; gameState = 'overworld'; currentMap = worldMap; currentCaveDepth = 0; 
                player.screenX = 26 * TILE_SIZE; player.screenY = 25 * TILE_SIZE; 
                showMessage("Used Quick Escape! Returned to surface."); playSound('success'); closeInventory();
            } else if (itemName === 'instantTeleport') {
                player.inventory.instantTeleport--; gameState = 'cave'; currentCaveDepth = 10; currentMap = caveLevels[10];
                player.screenX = 8 * TILE_SIZE; player.screenY = 2 * TILE_SIZE;
                showMessage("Used Instant Teleport! Arrived at Cave Depth 10."); playSound('success'); closeInventory();
            } else if (itemName === 'explorerHat') {
                player.wearingHat = !player.wearingHat;
                playSound('success');
                closeInventory();
                // Regenerate assets to reflect hat change
                generateAssets(Assets, getActiveCrystalCount, player);
            } else if (itemName === 'key') {
                const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
                let opened = false;
                for (const d of [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
                    const cx = gridX + d.x, cy = gridY + d.y;
                    if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS() && currentMap[cy][cx] === 26) {
                        currentMap[cy][cx] = 27; player.inventory.key = 0; player.hasPickupAbility = true;
                        showMessage("Erosion is the physical act of moving materials like soil, rocks, or sediment from the location they were at to another. You have now helped Mr. Pense gain that ability.");
                        playSound('success'); opened = true; break;
                    }
                }
                if (!opened) showMessage("You need to stand next to a closed chest to use the key."); else closeInventory();
            } else if (itemName === 'hammer') {
                const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
                let smashed = false;
                for (const d of [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
                    const cx = gridX + d.x, cy = gridY + d.y;
                    if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS()) {
                        const tile = currentMap[cy][cx];
                        if (tile === 5) {
                            if (gameState === 'overworld' && cx === 26 && cy === 24) {
                                 currentMap[cy][cx] = 11; player.screenX = 26 * TILE_SIZE; player.screenY = 25 * TILE_SIZE;
                                 showMessage("You smashed the boulder revealing a cave entrance!");
                            } else if (gameState === 'overworld' && cx === keyLocation.x && cy === keyLocation.y) {
                                    currentMap[cy][cx] = 28; showMessage("You smashed the boulder and found a key!");
                            } else { currentMap[cy][cx] = 25; showMessage("You smashed the boulder!"); }
                            playSound('smash'); smashed = true; break;
                        } else if (tile === 12 && cx > 0 && cx < MAP_COLS() - 1 && cy > 0 && cy < MAP_ROWS() - 1) {
                            currentMap[cy][cx] = 25; showMessage("You smashed the wall!"); playSound('smash'); smashed = true; break;
                        }
                    }
                }
                if (!smashed) showMessage("Nothing to smash here."); else closeInventory();
            } else if (itemName === 'shovel') {
                const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
                let dug = false;
                for (const d of [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
                    const cx = gridX + d.x, cy = gridY + d.y;
                    if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS() && currentMap[cy][cx] === 30) {
                        currentMap[cy][cx] = 13; player.inventory.fossils++;
                        showMessage("You found a fossil!"); playSound('dig'); dug = true; break;
                    }
                }
                if (!dug) showMessage("Nothing to dig here."); else closeInventory();
            } else if (itemName === 'arcaneEye') {
                showMessage("The Arcane Eye pulses with a deep violet light! It detects magic nearby... Wait. It's actually detecting its own powerful magical aura. It will always tell you magic is nearby. Mr. Arnold really got you on this one!");
                closeInventory();
            } else if (itemName === 'metamorphicPebble') {
                if (gameState === 'cave' && currentCaveDepth === 10) {
                    const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
                    let nearStones = false;
                    for (const d of [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
                        const cx = gridX + d.x, cy = gridY + d.y;
                        if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS() && currentMap[cy][cx] === 29) { nearStones = true; break; }
                    }
                    if (nearStones) {
                        player.hasActivatedStonehenge = true; player.inventory.metamorphicPebble = 0;
                        shakeTimer.current = 240; playSound('earthquake');
                        showMessage("You placed the Metamorphic Pebble onto the pile of stones... Suddenly, the earth begins to rumble with a massive earthquake! You must have done something to cause this. I wonder if something might have happened on the surface?");
                        closeInventory(); return;
                    }
                }
                showMessage("A rare pebble that has undergone intense heat and pressure, changing its very form. It pulses with a strange energy from the statue.");
                closeInventory();
            }
        }

        function update() {
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const gp = gamepads[0], cfg = gamepadConfig.current, gpState = gamepadState.current;
            if (gp) {
                if (!cfg.configured && (gp.mapping === 'standard' || gp.id.toLowerCase().includes('xbox'))) {
                    cfg.interact = 0; cfg.menu = 2; cfg.up = 12; cfg.down = 13; cfg.left = 14; cfg.right = 15; cfg.configured = true;
                }
                if (isControllerWizardActive) {
                     let pressedBtn = -1;
                     for (let i = 0; i < gp.buttons.length; i++) { if (gp.buttons[i].pressed && !gpState[i]) { pressedBtn = i; break; } }
                     for (let i = 0; i < gp.buttons.length; i++) gpState[i] = gp.buttons[i].pressed;
                     if (pressedBtn !== -1) {
                        if (wizardStep === 0) { cfg.up = pressedBtn; wizardText.textContent = "PRESS BUTTON FOR DOWN"; wizardStep++; }
                        else if (wizardStep === 1) { cfg.down = pressedBtn; wizardText.textContent = "PRESS BUTTON FOR LEFT"; wizardStep++; }
                        else if (wizardStep === 2) { cfg.left = pressedBtn; wizardText.textContent = "PRESS BUTTON FOR RIGHT"; wizardStep++; }
                        else if (wizardStep === 3) { cfg.right = pressedBtn; wizardText.textContent = "PRESS BUTTON FOR INTERACT"; wizardStep++; }
                        else if (wizardStep === 4) { cfg.interact = pressedBtn; wizardText.textContent = "PRESS BUTTON FOR MENU"; wizardStep++; }
                        else if (wizardStep === 5) {
                             cfg.menu = pressedBtn; wizardText.textContent = "CONFIGURATION SAVED"; wizardText.style.color = "#4da862"; cfg.configured = true;
                             setTimeout(() => { isControllerWizardActive = false; wizardOverlay.style.display = 'none'; settingsModal.style.display = 'flex'; wizardText.style.color = "#fff"; }, 2000);
                        }
                     }
                     return;
                } 
                if (!isControllerWizardActive) {
                     const interactPressed = cfg.interact !== null && gp.buttons[cfg.interact].pressed;
                     const menuPressed = (cfg.menu !== null && gp.buttons[cfg.menu].pressed) || (gp.mapping === 'standard' && gp.buttons[1].pressed);
                     const upPressed = (cfg.up !== null && gp.buttons[cfg.up].pressed) || (gp.axes[1] < -0.5), downPressed = (cfg.down !== null && gp.buttons[cfg.down].pressed) || (gp.axes[1] > 0.5);
                     const leftPressed = (cfg.left !== null && gp.buttons[cfg.left].pressed) || (gp.axes[0] < -0.5), rightPressed = (cfg.right !== null && gp.buttons[cfg.right].pressed) || (gp.axes[0] > 0.5);
                     if (interactPressed && !gpState[100]) {
                        initAudio();
                        if (isGameOver) { triggerReset(); return; }
                        if (gameState === 'start') {
                            playSound('menu_select');
                            if (selectedStartOption === 0) startBtn.click(); else if (selectedStartOption === 1) loadBtn.click(); else settingsBtn.click();
                        } else if (isSettingsOpen) { playSound('menu_select'); if (selectedSettingsOption === 0) configControllerBtn.click(); else closeSettingsBtn.click(); }
                        else if (isSaveModalOpen) { closeSaveBtn.click(); playSound('menu_select'); }
                        else if (isLoadModalOpen) { playSound('menu_select'); if (selectedLoadOption === 0) confirmLoadBtn.click(); else cancelLoadBtn.click(); }
                        else if (isMenuOpen) { playSound('menu_select'); handleMenuSelection(); }
                        else if (isInventoryOpen) { playSound('menu_select'); (invList.children[selectedInventoryIndex] as HTMLElement).click(); }
                        else if (isQuestionOpen) (qOptions.children[selectedQuestionIndex] as HTMLElement).click();
                        else checkInteraction();
                     }
                     gpState[100] = interactPressed;
                     if (menuPressed && !gpState[101]) {
                        initAudio();
                        if (gameState !== 'start' && !isSettingsOpen && !isSaveModalOpen && !isLoadModalOpen) {
                            if (!isQuestionOpen && !isInventoryOpen) { toggleMenu(); playSound('menu_select'); }
                            else if (isInventoryOpen) { closeInventory(); playSound('menu_select'); }
                        }
                     }
                     gpState[101] = menuPressed;
                     const now = Date.now(), navThrottle = 150; 
                     if (!gpState.lastNav || now - (gpState.lastNav as any) > navThrottle) {
                         if (upPressed) {
                             if (isSettingsOpen) { selectedSettingsOption = (selectedSettingsOption === 0) ? 1 : 0; updateSettingsUI(); playSound('menu_move'); }
                             else if (isMenuOpen) {
                                 const vis: number[] = []; for(let i=0; i<=4; i++) if(document.getElementById('opt-'+i)!.style.display !== 'none') vis.push(i);
                                 selectedOption = vis[(vis.indexOf(selectedOption) - 1 + vis.length) % vis.length]; updateMenuUI(); playSound('menu_move');
                             } else if (isInventoryOpen) { selectedInventoryIndex = (selectedInventoryIndex - 2 + invList.children.length) % invList.children.length; updateInventoryUI(); playSound('menu_move'); }
                             else if (isQuestionOpen) { selectedQuestionIndex = (selectedQuestionIndex - 1 + qOptions.children.length) % qOptions.children.length; updateQuestionUI(); playSound('menu_move'); }
                             gpState.lastNav = now as any;
                         } else if (downPressed) {
                             if (isSettingsOpen) { selectedSettingsOption = (selectedSettingsOption === 0) ? 1 : 0; updateSettingsUI(); playSound('menu_move'); }
                             else if (isMenuOpen) {
                                 const vis: number[] = []; for(let i=0; i<=4; i++) if(document.getElementById('opt-'+i)!.style.display !== 'none') vis.push(i);
                                 selectedOption = vis[(vis.indexOf(selectedOption) + 1) % vis.length]; updateMenuUI(); playSound('menu_move');
                             } else if (isInventoryOpen) { const n = selectedInventoryIndex + 2; selectedInventoryIndex = (n >= invList.children.length) ? invList.children.length - 1 : n; updateInventoryUI(); playSound('menu_move'); }
                             else if (isQuestionOpen) { selectedQuestionIndex = (selectedQuestionIndex + 1) % qOptions.children.length; updateQuestionUI(); playSound('menu_move'); }
                             gpState.lastNav = now as any;
                         } else if (leftPressed) {
                             if (gameState === 'start') { selectedStartOption = (selectedStartOption - 1 + 3) % 3; updateStartScreenUI(); playSound('menu_move'); }
                             else if (isInventoryOpen) { selectedInventoryIndex = (selectedInventoryIndex - 1 + invList.children.length) % invList.children.length; updateInventoryUI(); playSound('menu_move'); }
                             else if (isLoadModalOpen) { selectedLoadOption = (selectedLoadOption === 0) ? 1 : 0; updateLoadModalUI(); playSound('menu_move'); }
                             gpState.lastNav = now as any;
                         } else if (rightPressed) {
                             if (gameState === 'start') { selectedStartOption = (selectedStartOption + 1) % 3; updateStartScreenUI(); playSound('menu_move'); }
                             else if (isInventoryOpen) { selectedInventoryIndex = (selectedInventoryIndex + 1) % invList.children.length; updateInventoryUI(); playSound('menu_move'); }
                             else if (isLoadModalOpen) { selectedLoadOption = (selectedLoadOption === 0) ? 1 : 0; updateLoadModalUI(); playSound('menu_move'); }
                             gpState.lastNav = now as any;
                         }
                     }
                }
            }
            
            if (isGameOver || winSequenceActive || gameState === 'start' || isMenuOpen || isQuestionOpen || isInventoryOpen || isSaveModalOpen || isLoadModalOpen || isSettingsOpen || isControllerWizardActive) {
                return; 
            }

            let dx = 0, dy = 0; player.isMoving = false;
            const upInput = keys['ArrowUp'] || keys['KeyW'] || (gp && cfg.up !== null && gp.buttons[cfg.up].pressed);
            const downInput = keys['ArrowDown'] || keys['KeyS'] || (gp && cfg.down !== null && gp.buttons[cfg.down].pressed);
            const leftInput = keys['ArrowLeft'] || keys['KeyA'] || (gp && cfg.left !== null && gp.buttons[cfg.left].pressed);
            const rightInput = keys['ArrowRight'] || keys['KeyD'] || (gp && cfg.right !== null && gp.buttons[cfg.right].pressed);
            const joyX = (gp && Math.abs(gp.axes[0]) > 0.2) ? gp.axes[0] : 0, joyY = (gp && Math.abs(gp.axes[1]) > 0.2) ? gp.axes[1] : 0;
            if (upInput || joyY < -0.2) { dy = -player.speed; player.dir = 'up'; player.isMoving = true; }
            else if (downInput || joyY > 0.2) { dy = player.speed; player.dir = 'down'; player.isMoving = true; }
            if (leftInput || joyX < -0.2) { dx = -player.speed; player.dir = 'left'; player.isMoving = true; }
            else if (rightInput || joyX > 0.2) { dx = player.speed; player.dir = 'right'; player.isMoving = true; }
            if (player.isMoving) {
                let nextX = player.screenX + dx, nextY = player.screenY + dy;
                let gridX = Math.floor((nextX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((nextY + TILE_SIZE * 0.95) / TILE_SIZE);
                if (gridY >= 0 && gridY < MAP_ROWS() && gridX >= 0 && gridX < MAP_COLS()) {
                    const targetTile = currentMap[gridY][gridX];
                    let canPass = true;
                    if ([2,9,12,15,16,17,18,19,22,23,24,26,27,32,33,34,35,36,37,38,39].includes(targetTile) || (targetTile === 29 && (gameState === 'cave' || player.hasActivatedStonehenge))) canPass = false; 
                    if (targetTile === 3) { const lx = (nextX + TILE_SIZE/2) % TILE_SIZE, ly = (nextY + TILE_SIZE*0.95) % TILE_SIZE; if (lx > 45 && lx < 85 && ly > 80 && ly < 120) canPass = false; }
                    if (targetTile === 5) { const lx = (nextX + TILE_SIZE/2) % TILE_SIZE, ly = (nextY + TILE_SIZE*0.95) % TILE_SIZE; if (lx > 30 && lx < 100 && ly > 60 && ly < 105) canPass = false; }
                    if (targetTile === 7) { 
                        const lx = (nextX + TILE_SIZE/2) % TILE_SIZE, ly = (nextY + TILE_SIZE*0.95) % TILE_SIZE;
                        if (player.dir === 'up' && ly > 100 && lx > 20 && lx < 108) { gameState = 'interior'; currentMap = interiorMap; player.screenX = 5 * TILE_SIZE; player.screenY = 9 * TILE_SIZE; return; }
                        if (ly > 60) canPass = false;
                    }
                    if (targetTile === 11) { 
                        const lx = (nextX + TILE_SIZE/2) % TILE_SIZE, ly = (nextY + TILE_SIZE*0.95) % TILE_SIZE;
                        if (player.dir === 'up' && ly > 100 && lx > 30 && lx < 90) { gameState = 'cave'; currentMap = caveLevels[0]; currentCaveDepth = 0; player.screenX = 4 * TILE_SIZE; player.screenY = 6 * TILE_SIZE; return; }
                        if (ly > 70) canPass = false;
                    }
                    if (targetTile === 10) { gameState = 'overworld'; currentMap = worldMap; player.screenX = 27 * TILE_SIZE; player.screenY = 15 * TILE_SIZE; return; }
                    if (targetTile === 14) { gameState = 'overworld'; currentMap = worldMap; player.screenX = 26 * TILE_SIZE; player.screenY = 25 * TILE_SIZE; return; }
                    if (targetTile === 20 && currentCaveDepth < 10) {
                        currentCaveDepth++; 
                        if (currentCaveDepth === 10) player.reachedDepth10 = true;
                        currentMap = caveLevels[currentCaveDepth];
                        for(let r=0; r<currentMap.length; r++) for(let c=0; c<currentMap[0].length; c++) if (currentMap[r][c] === 21) { player.screenX = c * TILE_SIZE; player.screenY = (r < currentMap.length - 1 && currentMap[r+1][c] !== 12) ? (r+1)*TILE_SIZE : (r>0 && currentMap[r-1][c] !== 12) ? (r-1)*TILE_SIZE : r*TILE_SIZE; return; }
                        return;
                    }
                    if (targetTile === 21 && currentCaveDepth > 0) {
                        currentCaveDepth--; currentMap = caveLevels[currentCaveDepth];
                        for(let r=0; r<currentMap.length; r++) for(let c=0; c<currentMap[0].length; c++) if (currentMap[r][c] === 20) { player.screenX = c * TILE_SIZE; player.screenY = (r < currentMap.length - 1 && currentMap[r+1][c] !== 12) ? (r+1)*TILE_SIZE : (r>0 && currentMap[r-1][c] !== 12) ? (r-1)*TILE_SIZE : r*TILE_SIZE; return; }
                        return;
                    }
                    if (canPass) { player.screenX = nextX; player.screenY = nextY; }
                }
                player.animTimer++; if (player.animTimer > 8) { player.frame = (player.frame + 1) % 4; player.animTimer = 0; }
            } else player.frame = 0;

            // Check End Game Condition
            if (gameState === 'overworld' && player.hasActivatedStonehenge && !winSequenceActive && !isGameOver) {
                const gx = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE);
                const gy = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
                if (gx === 48 && gy === 14) {
                    setIsGameOver(true);
                    playSound('win');
                }
            }
        }

        function checkInteraction() {
            if (isGameOver || winSequenceActive) return;
            const gridX = Math.floor((player.screenX + TILE_SIZE / 2) / TILE_SIZE), gridY = Math.floor((player.screenY + TILE_SIZE * 0.95) / TILE_SIZE);
            for (const d of [{ x: 0, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }]) {
                const cx = gridX + d.x, cy = gridY + d.y;
                if (cy >= 0 && cy < MAP_ROWS() && cx >= 0 && cx < MAP_COLS()) {
                    const tile = currentMap[cy][cx];
                    if (tile === 30) { showMessage("It looks like you might be able to dig here."); player.foundDigSite = true; return; }
                    if (tile === 22) { showQuestion(cx, cy); return; }
                    if (tile === 23) { showMessage("The crystal hums peacefully."); return; }
                    if (tile === 24) { showMessage("This crystal is dormant. You might need an Echo Prism to revive its energy."); return; }
                    if (tile === 37) { 
                        if (getActiveCrystalCount() >= 10) {
                             if (player.inventory.metamorphicPebble === 0 && !player.hasActivatedStonehenge) { player.inventory.metamorphicPebble = 1; showMessage("The Monster Statue's eyes blaze with inner light! As you reach out, a strange stone materializes in your hands: The Metamorphic Pebble."); playSound('success'); }
                             else showMessage("The statue watches you with ancient, glowing eyes. You have already received its reward.");
                        } else showMessage("The statue of the monster stands silent. It seems to be waiting for something... perhaps the activation of all the crystals deep below?");
                        return; 
                    }
                    if (tile === 19) { showRockyDialog(); return; }
                    if (tile === 33) { showMagnusDialog(); return; }
                    if (tile === 34) { showChipDialog(); return; }
                    if (tile === 38) { showMrArnoldDialog(); return; }
                    if (tile === 39) { showDinoDialog(); return; }
                    if (tile === 15) { 
                        if (player.foundDigSite && player.inventory.shovel === 0) { player.inventory.shovel = 1; showMessage(DIALOGUE.INDIANA_BONES.GIVE_SHOVEL); }
                        else showIndianaBonesDialog();
                        return;
                    }
                    if (tile === 28) { player.inventory.key = 1; currentMap[cy][cx] = 25; showMessage("You picked up a Key!"); return; }
                    if (tile === 26) { showMessage("The chest is locked. Use the Key from your inventory to open it."); return; }
                    if (tile === 5) { showMessage("It's a heavy boulder."); return; }
                    if (tile === 29) { 
                        if (gameState === 'overworld') showMessage(player.hasActivatedStonehenge ? "Ancient spirits dwell within these stones." : "The grass here feels... odd. As if something is missing.");
                        else showMessage("A strange pile of ancient stones. They pulse with a deep connection to the surface.");
                        return;
                    }
                }
            }
        }
        
        function showMessage(text: string) {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; qText.textContent = text; qOptions.innerHTML = '';
            const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Close"; closeBtn.onclick = closeQuestion;
            qOptions.appendChild(closeBtn); selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showMrArnoldDialog() {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; qOptions.innerHTML = '';
            if (player.inventory.arcaneEye > 0) {
                qText.textContent = DIALOGUE.ARNOLD.ALREADY_HAS;
                const btn = document.createElement('button'); btn.className = 'q-btn'; btn.textContent = "It sure is... something."; btn.onclick = closeQuestion; qOptions.appendChild(btn);
            } else {
                qText.textContent = DIALOGUE.ARNOLD.PUZZLE;
                DIALOGUE.ARNOLD.OFFERS.forEach(val => {
                    const btn = document.createElement('button'); btn.className = 'q-btn'; btn.textContent = `${val} Sediments`;
                    btn.onclick = () => {
                        if (player.inventory.sediment >= val) {
                            if (val >= 30) { player.inventory.sediment -= val; player.inventory.arcaneEye = 1; showMessage(val === 30 ? DIALOGUE.ARNOLD.SUCCESS : DIALOGUE.ARNOLD.GENEROUS); playSound('success'); }
                            else showMessage(DIALOGUE.ARNOLD.POOR_CALC);
                        } else showMessage(DIALOGUE.ARNOLD.TOO_POOR);
                    };
                    qOptions.appendChild(btn);
                });
                const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Maybe later."; closeBtn.onclick = closeQuestion; qOptions.appendChild(closeBtn);
            }
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showRockyDialog() {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; 
            qText.textContent = DIALOGUE.ROCKY.GREETING; qOptions.innerHTML = '';
            DIALOGUE.ROCKY.ITEMS.forEach(item => {
                if (item.reqDepth && !player.reachedDepth10) return;
                
                const btn = document.createElement('button'); btn.className = 'q-btn'; 
                btn.textContent = `${item.name} (${item.cost} Sediment)`;
                btn.onclick = () => { 
                    if (player.inventory.sediment >= item.cost) {
                        player.inventory.sediment -= item.cost;
                        player.inventory[item.key as keyof typeof player.inventory]++; 
                        playSound('success');
                        showMessage(`You bought an ${item.name}! ${DIALOGUE.ROCKY.SUCCESS}`); 
                    } else {
                        showMessage(DIALOGUE.ROCKY.TOO_POOR);
                    }
                };
                qOptions.appendChild(btn);
            });
            const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Nothing, thanks."; closeBtn.onclick = closeQuestion; qOptions.appendChild(closeBtn);
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showDinoDialog() {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; qOptions.innerHTML = '';
            if (player.inventory.fossils > 0) {
                if (player.inventory.indexFossil === 0) {
                    player.inventory.indexFossil = 1;
                    qText.textContent = DIALOGUE.DINO.EXCITED;
                    playSound('success');
                } else {
                    qText.textContent = DIALOGUE.DINO.ALREADY_GIVEN;
                }
            } else {
                qText.textContent = DIALOGUE.DINO.NO_FOSSILS;
            }
            const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Rawr!"; closeBtn.onclick = closeQuestion;
            qOptions.appendChild(closeBtn);
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showMagnusTopics() {
             qText.textContent = DIALOGUE.MAGNUS.TOPICS_PROMPT; qOptions.innerHTML = '';
             DIALOGUE.MAGNUS.TOPICS.forEach(t => {
                 const btn = document.createElement('button'); btn.className = 'q-btn'; btn.textContent = t.label;
                 btn.onclick = () => showMagnusFact(t.key); qOptions.appendChild(btn);
             });
             const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "No thanks, bye."; closeBtn.onclick = closeQuestion; qOptions.appendChild(closeBtn);
             selectedQuestionIndex = 0; updateQuestionUI();
        }

        function showMagnusFact(key: string) {
            const facts = MAGNUS_FACTS[key as keyof typeof MAGNUS_FACTS];
            const fact = facts[Math.floor(Math.random() * facts.length)];
            qText.textContent = `Magnus Obsidia: ${fact}`; qOptions.innerHTML = '';
            const anotherBtn = document.createElement('button'); anotherBtn.className = 'q-btn'; anotherBtn.textContent = "Tell me another fact."; anotherBtn.onclick = () => showMagnusFact(key); 
            const backBtn = document.createElement('button'); backBtn.className = 'q-btn'; backBtn.textContent = "Back to topics"; backBtn.onclick = showMagnusTopics;
            const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Thanks, see ya."; closeBtn.onclick = closeQuestion;
            qOptions.appendChild(anotherBtn); qOptions.appendChild(backBtn); qOptions.appendChild(closeBtn);
            selectedQuestionIndex = 0; updateQuestionUI();
        }

        function showMagnusDialog() {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; qText.textContent = DIALOGUE.MAGNUS.GREETING; qOptions.innerHTML = '';
            const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Cool, thanks."; closeBtn.onclick = showMagnusTopics; qOptions.appendChild(closeBtn);
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showChipDialog() {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; qOptions.innerHTML = '';
            if (player.inventory.hammer === 0) {
                qText.textContent = DIALOGUE.CHIP.GREETING;
                const btn = document.createElement('button'); btn.className = 'q-btn'; btn.textContent = "Can I borrow a Hammer?";
                btn.onclick = () => { player.inventory.hammer++; showMessage(DIALOGUE.CHIP.GIVE_HAMMER); };
                qOptions.appendChild(btn);
            } else qText.textContent = DIALOGUE.CHIP.ALREADY_HAS;
            const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Take care, Chip."; closeBtn.onclick = closeQuestion; qOptions.appendChild(closeBtn);
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showIndianaBonesDialog() {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false); qImage.style.display = 'none'; qOptions.innerHTML = '';
            
            if (player.inventory.explorerHat > 0) {
                qText.textContent = DIALOGUE.INDIANA_BONES.ALREADY_TRADED;
                const btn = document.createElement('button'); btn.className = 'q-btn'; btn.textContent = "I love it!"; btn.onclick = closeQuestion; qOptions.appendChild(btn);
            } else if (player.inventory.indexFossil > 0) {
                qText.textContent = DIALOGUE.INDIANA_BONES.TRADE_PROMPT;
                const tradeBtn = document.createElement('button'); tradeBtn.className = 'q-btn'; tradeBtn.textContent = "Yes, let's trade!"; 
                tradeBtn.onclick = () => {
                    player.inventory.indexFossil = 0;
                    player.inventory.explorerHat = 1;
                    playSound('success');
                    showMessage(DIALOGUE.INDIANA_BONES.GIVE_HAT);
                };
                qOptions.appendChild(tradeBtn);
                const declineBtn = document.createElement('button'); declineBtn.className = 'q-btn'; declineBtn.textContent = "Not right now."; declineBtn.onclick = closeQuestion;
                qOptions.appendChild(declineBtn);
            } else {
                qText.textContent = DIALOGUE.INDIANA_BONES.GREETING;
                const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "I'll be careful."; closeBtn.onclick = closeQuestion; qOptions.appendChild(closeBtn);
            }
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function showQuestion(tx: number, ty: number) {
            isQuestionOpen = true; Object.keys(keys).forEach(key => keys[key] = false);
            let qData = caveQuestions[currentCaveDepth] || scienceQuestions[Math.floor(Math.random() * scienceQuestions.length)];
            if (qData.img) { qImage.src = qData.img; qImage.style.display = 'block'; } else { qImage.style.display = 'none'; qImage.src = ''; }
            qText.textContent = qData.q; qOptions.innerHTML = '';
            qData.options.forEach((opt: string) => {
                const btn = document.createElement('button'); btn.className = 'q-btn'; btn.textContent = opt;
                btn.onclick = () => {
                    currentMap[ty][tx] = (opt === qData.a) ? 23 : 24; qText.textContent = (opt === qData.a) ? "Correct! The crystal glows green." : "Incorrect. The crystal is dormant (red).";
                    qOptions.innerHTML = ''; const closeBtn = document.createElement('button'); closeBtn.className = 'q-btn'; closeBtn.textContent = "Close"; closeBtn.onclick = closeQuestion; qOptions.appendChild(closeBtn);
                    selectedQuestionIndex = 0; updateQuestionUI();
                };
                qOptions.appendChild(btn);
            });
            selectedQuestionIndex = 0; updateQuestionUI(); questionModal.style.display = 'flex';
        }

        function closeQuestion() { questionModal.style.display = 'none'; isQuestionOpen = false; }
        const Assets: AssetsType = { character: { down: [], up: [], left: [], right: [] }, tiles: {} };

        function gameLoop() {
            update(); const time = Date.now();
            const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement; if (!canvas) return; 
            const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
            ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save();
            let shakeX = 0, shakeY = 0; if (shakeTimer.current > 0) { shakeX = (Math.random() - 0.5) * 20; shakeY = (Math.random() - 0.5) * 20; shakeTimer.current--; }
            let camX = -player.screenX + (canvas.width / 2) - (TILE_SIZE / 2), camY = -player.screenY + (canvas.height / 2) - (TILE_SIZE / 2);
            ctx.translate(camX + shakeX, camY + shakeY);
            const startCol = Math.floor(-camX / TILE_SIZE) - 1, endCol = startCol + VIEW_WIDTH + 2, startRow = Math.floor(-camY / TILE_SIZE) - 1, endRow = startRow + VIEW_HEIGHT + 2;
            const ySort: any[] = [];
            for (let y = startRow; y <= endRow; y++) {
                for (let x = startCol; x <= endCol; x++) {
                    if (y < 0 || y >= MAP_ROWS() || x < 0 || x >= MAP_COLS()) { if (gameState === 'overworld') { ctx.save(); ctx.translate(x * TILE_SIZE, y * TILE_SIZE); Assets.tiles.water(ctx, time); ctx.restore(); } else if (gameState === 'cave') { ctx.fillStyle = '#111'; ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE); } continue; }
                    ctx.save(); ctx.translate(x * TILE_SIZE, y * TILE_SIZE);
                    let t = currentMap[y][x];
                    if ([0,3,5,7,11,37].includes(t)) Assets.tiles.grass(ctx, time); else if (t === 4) Assets.tiles.path(ctx); else if (t === 2) Assets.tiles.water(ctx, time); else if (t === 6) Assets.tiles.bridge(ctx); else if ([8,16,17,18,19,39].includes(t)) Assets.tiles.intFloor(ctx); else if (t === 9) Assets.tiles.intWall(ctx); else if (t === 10) Assets.tiles.intExit(ctx); else if (t === 12) Assets.tiles.caveWall(ctx); else if ([13,15,20,21,22,23,24,25,28,29,30].includes(t)) { if (gameState === 'overworld') Assets.tiles.grass(ctx, time); else Assets.tiles.caveFloor(ctx); } else if (t === 14) Assets.tiles.caveExit(ctx); else if ([31,32,33].includes(t)) Assets.tiles.volcanicGround(ctx); else if ([34,35,36,38].includes(t)) Assets.tiles.grass(ctx, time); 
                    if (t === 3) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.tree(c, time); c.restore(); } });
                    else if (t === 5) ySort.push({ y: y*TILE_SIZE+105, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.boulder(c); c.restore(); } });
                    else if (t === 7) ySort.push({ y: y*TILE_SIZE+115, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.building(c); c.restore(); } });
                    else if (t === 11) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.caveEntrance(c); c.restore(); } });
                    else if (t === 15) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.skeletonNpc(c, time); c.restore(); } });
                    else if (t === 16) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.table(c); c.restore(); } });
                    else if (t === 17) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.chair(c); c.restore(); } });
                    else if (t === 18) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.counter(c); c.restore(); } });
                    else if (t === 19) { ySort.push({ y: y*TILE_SIZE+85, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE-30); Assets.tiles.rocky(c, time); c.restore(); } }); ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.counter(c); c.restore(); } }); }
                    else if (t === 39) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.dino(c, time); c.restore(); } });
                    else if (t === 20) Assets.tiles.stairsDown(ctx); else if (t === 21) Assets.tiles.stairsUp(ctx); else if (t === 22) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.crystal(c, time, 'normal'); c.restore(); } }); else if (t === 23) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.crystal(c, time, 'green'); c.restore(); } }); else if (t === 24) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.crystal(c, time, 'red'); c.restore(); } });
                    else if (t === 25) { if (gameState === 'cave') Assets.tiles.caveFloor(ctx); else Assets.tiles.grass(ctx, time); Assets.tiles.brokenBoulder(ctx); }
                    else if (t === 26) { Assets.tiles.grass(ctx, time); ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.chestClosed(c); c.restore(); } }); }
                    else if (t === 27) { Assets.tiles.grass(ctx, time); ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.chestOpen(c); c.restore(); } }); }
                    else if (t === 28) { if (gameState === 'cave') Assets.tiles.caveFloor(ctx); else Assets.tiles.grass(ctx, time); Assets.tiles.key(ctx); }
                    else if (t === 29) { if (gameState === 'cave') { Assets.tiles.caveFloor(ctx); ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.pileOfStones(c); c.restore(); } }); } else { Assets.tiles.grass(ctx, time); if (player.hasActivatedStonehenge) ySort.push({ y: y*TILE_SIZE+100, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.stonehenge(c, (isGameOver || winSequenceActive) ? time : null); c.restore(); } }); } }
                    else if (t === 30) Assets.tiles.darkDirt(ctx); else if (t === 32) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.volcano(c, time); c.restore(); } }); else if (t === 33) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.magnus(c, time); c.restore(); } }); else if (t === 34) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.chip(c, time); c.restore(); } }); else if (t === 35) ySort.push({ y: y*TILE_SIZE+105, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.brokenPillar(c); c.restore(); } }); else if (t === 36) ySort.push({ y: y*TILE_SIZE+105, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.smashedPot(c); c.restore(); } }); else if (t === 37) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.monsterStatue(c, time); c.restore(); } }); else if (t === 38) ySort.push({ y: y*TILE_SIZE+110, render: (c: any) => { c.save(); c.translate(x*TILE_SIZE, y*TILE_SIZE); Assets.tiles.mrArnold(c, time); c.restore(); } });
                    ctx.restore();
                }
            }
            ySort.push({ y: player.screenY+TILE_SIZE*0.9, render: (c: any) => { c.save(); c.translate(player.screenX, player.screenY); Assets.character[player.dir as keyof typeof Assets.character][player.frame](c); c.restore(); } });
            ySort.sort((a,b) => a.y-b.y); ySort.forEach(o => o.render(ctx)); ctx.restore();
            animationFrameRef.current = requestAnimationFrame(gameLoop);
        }

        generateAssets(Assets, getActiveCrystalCount, player); generateKeyLocation(); gameLoop();
        return () => { window.removeEventListener('keydown', keyHandler); window.removeEventListener('keyup', keyUpHandler); window.removeEventListener('mousedown', initAudio); window.removeEventListener('touchstart', initAudio); if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); if (schedulerTimer) clearTimeout(schedulerTimer); if (audioCtx) audioCtx.close(); };
    }, [resetKey, isGameOver, winSequenceActive]);

    return (
        <div className="game-wrapper" key={resetKey}>
            <style>{`
                .game-wrapper { margin: 0; background: #1a1a1a; display: flex; flex-direction: row; align-items: center; justify-content: center; height: 100vh; width: 100vw; color: #eee; font-family: 'Courier New', Courier, monospace; overflow: hidden; touch-action: none; }
                .main-container { display: flex; flex-direction: column; align-items: center; position: relative; }
                canvas { image-rendering: pixelated; border: 4px solid #333; box-shadow: 0 0 20px rgba(0,0,0,0.5); max-width: 95vw; max-height: 80vh; background: #1e3a8a; }
                .controls { margin-top: 20px; text-align: center; background: #333; padding: 10px 20px; border-radius: 8px; }
                kbd { background: #eee; color: #333; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
                #sideMenu { position: absolute; left: 20px; top: 20px; width: 180px; background: rgba(30, 30, 30, 0.95); border: 2px solid #555; padding: 15px; border-radius: 8px; display: none; flex-direction: column; gap: 10px; box-shadow: 5px 0 15px rgba(0,0,0,0.5); z-index: 100; }
                .menu-title { font-size: 1.2rem; border-bottom: 1px solid #555; padding-bottom: 5px; margin-bottom: 10px; color: #4da862; text-align: center; }
                .menu-option { padding: 10px; cursor: pointer; border-radius: 4px; transition: background 0.2s; }
                .menu-option.selected { background: #4da862; color: #fff; }
                #questionModal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); min-width: 600px; width: auto; max-width: 900px; background: rgba(30, 30, 30, 0.98); border: 4px solid #4da862; padding: 20px; border-radius: 12px; display: none; flex-direction: row; align-items: center; gap: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.8); z-index: 200; text-align: center; }
                #inventoryModal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 600px; height: 500px; background: rgba(30, 30, 30, 0.98); border: 4px solid #4287f5; padding: 20px; border-radius: 12px; display: none; flex-direction: column; gap: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.8); z-index: 200; text-align: center; }
                #saveModal, #loadModal, #settingsModal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; background: rgba(30, 30, 30, 0.98); border: 4px solid #fbc02d; padding: 20px; border-radius: 12px; display: none; flex-direction: column; gap: 15px; box-shadow: 0 0 20px rgba(0,0,0,0.8); z-index: 210; text-align: center; }
                #settingsModal { border-color: #8b6b4d; }
                #wizardOverlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: none; flex-direction: column; justify-content: center; align-items: center; z-index: 500; color: #fff; font-size: 2rem; }
                #winModal { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://lh3.googleusercontent.com/d/1RuaMdSzB66mVnwl-jMEGkm85j5f8pVeA') center/cover no-repeat; display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 600; color: #fff; text-align: center; padding: 40px; backdrop-filter: blur(4px); }
                #winModal::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: -1; }
                #invList { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; width: 100%; }
                .inv-item { background: #444; padding: 10px; cursor: pointer; border-radius: 4px; border: 1px solid #666; margin: 0; text-align: center; }
                .inv-item:hover { background: #555; border-color: #4287f5; }
                .inv-item.selected { background: #4da862; color: #fff; border-color: #fff; }
                .inv-item.full-width { grid-column: 1 / -1; text-align: center; }
                .q-text { font-size: 1.1rem; color: #fff; margin-bottom: 10px; }
                .q-btn { background: #333; border: 2px solid #555; color: #eee; padding: 10px; cursor: pointer; font-family: inherit; border-radius: 4px; transition: all 0.2s; }
                .q-btn:hover, .q-btn.selected { background: #4da862; border-color: #4da862; color: #fff; }
                #startScreen { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: url('https://lh3.googleusercontent.com/d/1a-IHtvf47Pc1JhBdcPnVo0XeqIXXLlXV') center/cover no-repeat; display: flex; flex-direction: row; justify-content: center; align-items: center; z-index: 300; gap: 20px; }
                #startScreen::before { content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); z-index: -1; }
                .start-btn { font-size: 1.5rem; padding: 15px 30px; background: rgba(0, 0, 0, 0.5); border: 4px solid rgba(77, 168, 98, 0.8); color: #fff; cursor: pointer; transition: transform 0.2s; border-radius: 4px; backdrop-filter: blur(4px); text-shadow: 2px 2px 0 #000; }
                .start-btn:hover, .start-btn.selected { transform: scale(1.1); background: rgba(0, 0, 0, 0.7); border-color: #fff; }
                textarea { width: 100%; height: 100px; background: #222; color: #4da862; border: 1px solid #555; padding: 10px; font-family: monospace; resize: none; }
                .sound-toggle { margin-right: 20px; padding: 15px; background: #333; border: 4px solid #4da862; color: #fff; cursor: pointer; font-family: inherit; font-size: 1.1rem; border-radius: 8px; transition: all 0.2s; z-index: 400; align-self: flex-end; margin-bottom: 50px; }
                .sound-toggle:hover { background: #4da862; }

                .mobile-controller { display: none; width: 100%; padding: 20px; background: #222; border-top: 2px solid #444; justify-content: space-around; align-items: center; user-select: none; -webkit-tap-highlight-color: transparent; }
                .dpad { display: grid; grid-template-areas: ". up ." "left . right" ". down ."; gap: 8px; }
                .dbtn { width: 60px; height: 60px; background: #333; border: 2px solid #555; border-radius: 12px; color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .dbtn:active { background: #4da862; }
                .dbtn-up { grid-area: up; } .dbtn-down { grid-area: down; } .dbtn-left { grid-area: left; } .dbtn-right { grid-area: right; }
                .action-buttons { display: flex; gap: 20px; }
                .abtn { width: 80px; height: 80px; border-radius: 50%; border: 4px solid #4da862; background: #333; color: white; font-weight: bold; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
                .abtn:active { background: #4da862; }
                .abtn.menu { border-color: #fbc02d; width: 70px; height: 70px; font-size: 0.9rem; }

                @media (max-width: 1024px) {
                    .game-wrapper { flex-direction: column; height: auto; min-height: 100vh; overflow-y: auto; align-items: center; }
                    .main-container { width: 100%; }
                    canvas { max-width: 100%; height: auto; }
                    .mobile-controller { display: flex; }
                    .controls { display: none; }
                    .sound-toggle { align-self: center; margin-right: 0; margin-bottom: 20px; margin-top: 20px; }
                    #questionModal, #inventoryModal, #saveModal, #loadModal, #settingsModal { width: 95%; min-width: 0; max-width: none; }
                }
                @media (orientation: landscape) and (max-width: 1024px) {
                    .game-wrapper { flex-direction: row; align-items: stretch; }
                    .main-container { flex: 1; }
                    .mobile-controller { width: 280px; height: 100vh; flex-direction: column; border-top: none; border-left: 2px solid #444; }
                    .action-buttons { flex-direction: column; }
                }
            `}</style>
            <button className="sound-toggle" onClick={(e) => { toggleMute(); e.currentTarget.blur(); }} onKeyDown={(e) => { if (e.code === 'Space') e.preventDefault(); }}>{isMuted ? '🔇 Sound Off' : '🔊 Sound On'}</button>
            <div className="main-container">
                {isGameOver && (
                    <div id="winModal">
                        <h1 style={{ fontSize: '3rem', color: '#4da862', marginBottom: '20px', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>CONGRATULATIONS!</h1>
                        <p style={{ fontSize: '1.4rem', maxWidth: '800px', marginBottom: '40px', lineHeight: '1.6', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                            You've harnessed the power of the Metamorphic Pebble and aligned the ancient stones. 
                            Congratulations! Now we finally know how Stonehenge was created—it was synchronized by a brilliant geologist!
                        </p>
                        <button className="start-btn" onClick={triggerReset}>Play Again</button>
                    </div>
                )}
                <div id="startScreen"><div id="startBtn" className="start-btn">New Game</div><div id="loadBtn" className="start-btn">Load Game</div><div id="settingsBtn" className="start-btn">Settings</div></div>
                <div id="sideMenu"><div className="menu-title">PAUSED</div><div id="opt-0" className="menu-option selected">Open Inventory</div><div id="opt-1" className="menu-option" style={{display:'none'}}>Pick up</div><div id="opt-2" className="menu-option">Return to Gameplay</div><div id="opt-3" className="menu-option">Save Game</div><div id="opt-4" className="menu-option" onClick={triggerReset}>Reset Game</div></div>
                <div id="questionModal"><img id="qImage" style={{maxWidth: '250px', maxHeight: '400px', display: 'none', borderRadius: '4px'}} alt="Question" referrerPolicy="no-referrer" /><div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%'}}><div id="qText" className="q-text">Question goes here?</div><div id="qOptions" style={{display: 'flex', flexDirection: 'column', gap: '8px'}}></div></div></div>
                <div id="inventoryModal"><div className="menu-title" style={{color: '#4287f5'}}>INVENTORY</div><div id="invList"></div></div>
                <div id="saveModal"><div className="menu-title">SAVE GAME</div><p>Write down or copy this code to save your progress:</p><textarea id="saveCodeOutput" readOnly></textarea><button className="q-btn" id="closeSaveBtn">Close</button></div>
                <div id="loadModal"><div className="menu-title">LOAD GAME</div><p>Paste your save code here:</p><textarea id="loadCodeInput"></textarea><div style={{display:'flex', gap:'10px', justifyContent: 'center'}}><button className="q-btn" id="confirmLoadBtn">Load</button><button className="q-btn" id="cancelLoadBtn">Cancel</button></div></div>
                <div id="settingsModal"><div className="menu-title" style={{color: '#8b6b4d'}}>SETTINGS</div><button className="q-btn" id="configControllerBtn" style={{padding: '15px', fontSize:'1.2rem'}}>Configure Controller</button><button className="q-btn" id="closeSettingsBtn">Back</button></div>
                <div id="wizardOverlay"><div id="wizardText">PRESS BUTTON FOR UP</div></div>
                <canvas id="gameCanvas"></canvas>
                <div className="controls">Use <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>Arrows</kbd> to explore. <kbd>Space</kbd> for Menu. <kbd>Enter</kbd> to Interact.</div>
                {isMobile && (
                    <div className="mobile-controller">
                        <div className="dpad">
                            <button className="dbtn dbtn-up" 
                                onTouchStart={(e) => { e.preventDefault(); handleVirtualDown('ArrowUp'); }} 
                                onTouchEnd={(e) => { e.preventDefault(); handleVirtualUp('ArrowUp'); }}>▲</button>
                            <button className="dbtn dbtn-left" 
                                onTouchStart={(e) => { e.preventDefault(); handleVirtualDown('ArrowLeft'); }} 
                                onTouchEnd={(e) => { e.preventDefault(); handleVirtualUp('ArrowLeft'); }}>◀</button>
                            <button className="dbtn dbtn-right" 
                                onTouchStart={(e) => { e.preventDefault(); handleVirtualDown('ArrowRight'); }} 
                                onTouchEnd={(e) => { e.preventDefault(); handleVirtualUp('ArrowRight'); }}>▶</button>
                            <button className="dbtn dbtn-down" 
                                onTouchStart={(e) => { e.preventDefault(); handleVirtualDown('ArrowDown'); }} 
                                onTouchEnd={(e) => { e.preventDefault(); handleVirtualUp('ArrowDown'); }}>▼</button>
                        </div>
                        <div className="action-buttons">
                            <button className="abtn menu" 
                                onTouchStart={(e) => { e.preventDefault(); simulateKey('Space'); }}>MENU</button>
                            <button className="abtn" 
                                onTouchStart={(e) => { e.preventDefault(); simulateKey('Enter'); }}>ACTION</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;