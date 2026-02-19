export const caveSong = {
    title: "Deep Cavern Echoes",
    bpm: 85,
    totalSteps: 64,
    tracks: [
        {
            name: "Sub Bass",
            wave: "triangle",
            volume: 0.8,
            pan: 0,
            attack: 0.1,
            decay: 0.2,
            sustain: 0.8,
            release: 0.2,
            notes: [
                { durationSteps: 8, startStep: 0, note: "B1", velocity: 0.7 },
                { durationSteps: 8, startStep: 8, note: "D2", velocity: 0.7 },
                { durationSteps: 8, startStep: 16, note: "E1", velocity: 0.7 },
                { durationSteps: 8, startStep: 24, note: "G1", velocity: 0.7 },
                { durationSteps: 8, startStep: 32, note: "B1", velocity: 0.7 },
                { durationSteps: 8, startStep: 40, note: "D2", velocity: 0.7 },
                { durationSteps: 8, startStep: 48, note: "F#1", velocity: 0.7 },
                { durationSteps: 8, startStep: 56, note: "E1", velocity: 0.7 }
            ]
        },
        {
            name: "Echo Melody",
            wave: "square",
            volume: 0.6,
            pan: 0.2,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.5,
            release: 0.4,
            notes: [
                { durationSteps: 4, startStep: 0, note: "B4", velocity: 0.5 },
                { durationSteps: 4, startStep: 8, note: "D5", velocity: 0.5 },
                { durationSteps: 4, startStep: 12, note: "F#5", velocity: 0.5 },
                { durationSteps: 8, startStep: 16, note: "B5", velocity: 0.6 },
                { durationSteps: 4, startStep: 32, note: "A4", velocity: 0.5 },
                { durationSteps: 4, startStep: 36, note: "G4", velocity: 0.5 },
                { durationSteps: 8, startStep: 40, note: "F#4", velocity: 0.6 },
                { durationSteps: 4, startStep: 48, note: "E4", velocity: 0.4 },
                { durationSteps: 4, startStep: 52, note: "D4", velocity: 0.4 },
                { durationSteps: 4, startStep: 56, note: "C#4", velocity: 0.4 },
                { durationSteps: 4, startStep: 60, note: "B3", velocity: 0.4 }
            ]
        },
        {
            name: "Ambient Pad",
            wave: "triangle",
            volume: 0.4,
            pan: -0.5,
            attack: 0.5,
            decay: 0.5,
            sustain: 0.9,
            release: 0.8,
            notes: [
                { durationSteps: 16, startStep: 0, note: "F#3", velocity: 0.3 },
                { durationSteps: 16, startStep: 16, note: "G3", velocity: 0.3 },
                { durationSteps: 16, startStep: 32, note: "D3", velocity: 0.3 },
                { durationSteps: 16, startStep: 48, note: "C#3", velocity: 0.3 }
            ]
        },
        {
            name: "Water Drip",
            wave: "noise",
            volume: 0.3,
            pan: 0.8,
            attack: 0.01,
            decay: 0.05,
            sustain: 0,
            release: 0.05,
            notes: [
                { durationSteps: 1, startStep: 0, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 8, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 16, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 24, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 32, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 40, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 48, note: null, velocity: 0.2 },
                { durationSteps: 1, startStep: 56, note: null, velocity: 0.2 }
            ]
        }
    ]
};

export const overworldSong = {
    title: "Overworld Breeze",
    bpm: 110,
    totalSteps: 64,
    tracks: [
        {
            name: "Melody",
            wave: "square",
            volume: 0.12,
            pan: 0,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.2,
            release: 0.1,
            notes: [
                { durationSteps: 4, startStep: 0, note: "C5", velocity: 0.6 },
                { durationSteps: 4, startStep: 4, note: "D5", velocity: 0.6 },
                { durationSteps: 8, startStep: 8, note: "E5", velocity: 0.6 },
                { durationSteps: 8, startStep: 16, note: "C5", velocity: 0.6 },
                { durationSteps: 4, startStep: 24, note: "D5", velocity: 0.6 },
                { durationSteps: 4, startStep: 28, note: "E5", velocity: 0.6 },
                { durationSteps: 8, startStep: 32, note: "F5", velocity: 0.6 },
                { durationSteps: 40, startStep: 40, note: "E5", velocity: 0.6 },
                { durationSteps: 8, startStep: 48, note: "D5", velocity: 0.6 },
                { durationSteps: 8, startStep: 56, note: "C5", velocity: 0.6 }
            ]
        },
        {
            name: "Harmony",
            wave: "triangle",
            volume: 0.1,
            pan: 0.2,
            attack: 0.1,
            decay: 0.2,
            sustain: 0.5,
            release: 0.2,
            notes: [
                { durationSteps: 16, startStep: 0, note: "C4", velocity: 0.5 },
                { durationSteps: 16, startStep: 16, note: "A3", velocity: 0.5 },
                { durationSteps: 16, startStep: 32, note: "F3", velocity: 0.5 },
                { durationSteps: 16, startStep: 48, note: "G3", velocity: 0.5 }
            ]
        },
        {
            name: "Bass",
            wave: "triangle",
            volume: 0.2,
            pan: -0.2,
            attack: 0.05,
            decay: 0.1,
            sustain: 0.8,
            release: 0.1,
            notes: [
                { durationSteps: 4, startStep: 0, note: "C3", velocity: 0.7 },
                { durationSteps: 4, startStep: 8, note: "C3", velocity: 0.7 },
                { durationSteps: 4, startStep: 16, note: "A2", velocity: 0.7 },
                { durationSteps: 4, startStep: 24, note: "A2", velocity: 0.7 },
                { durationSteps: 4, startStep: 32, note: "F2", velocity: 0.7 },
                { durationSteps: 4, startStep: 40, note: "F2", velocity: 0.7 },
                { durationSteps: 4, startStep: 48, note: "G2", velocity: 0.7 },
                { durationSteps: 4, startStep: 56, note: "G2", velocity: 0.7 }
            ]
        },
        {
            name: "Percussion",
            wave: "noise",
            volume: 0.08,
            pan: 0,
            attack: 0.01,
            decay: 0.05,
            sustain: 0,
            release: 0.05,
            notes: [
                { durationSteps: 1, startStep: 0, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 8, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 16, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 24, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 32, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 40, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 48, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 56, note: null, velocity: 0.5 },
                { durationSteps: 1, startStep: 4, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 12, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 20, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 28, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 36, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 44, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 52, note: null, velocity: 0.3 },
                { durationSteps: 1, startStep: 60, note: null, velocity: 0.3 }
            ]
        }
    ]
};
