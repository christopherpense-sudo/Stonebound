// Define QuestionData interface at the top to ensure it can be used for explicit typing
export interface QuestionData {
    q: string;
    options: string[];
    a: string;
    img: string | null;
}

// Explicitly type scienceQuestions as QuestionData[] to avoid property 'img' errors when unioning with caveQuestions in App.tsx
export const scienceQuestions: QuestionData[] = [
    { q: "What does a plant need to grow?", options: ["Sunlight", "Candy", "Toys"], a: "Sunlight", img: null },
    { q: "Which one is hot?", options: ["Ice cube", "Sun", "Snow"], a: "Sun", img: null },
    { q: "What do we breathe?", options: ["Water", "Air", "Sand"], a: "Air", img: null },
    { q: "Where do fish live?", options: ["In a tree", "In the water", "In the sky"], a: "In the water", img: null },
    { q: "How many legs does a spider have?", options: ["Two", "Four", "Eight"], a: "Eight", img: null },
    { q: "What color is the sky on a sunny day?", options: ["Green", "Blue", "Purple"], a: "Blue", img: null },
    { q: "What freezes into ice?", options: ["Water", "Milk", "Juice"], a: "Water", img: null },
    { q: "What do bees make?", options: ["Honey", "Jam", "Butter"], a: "Honey", img: null }
];

export const caveQuestions: Record<number, QuestionData> = {
    1: {
        q: "Which layer is the oldest? A, B, F, or D.",
        options: ["A", "B", "F", "D"],
        a: "A",
        img: "https://lh3.googleusercontent.com/d/1W7jbLT8cZ-loqAKRsJOPAz-YaC8VpAFh"
    },
    2: {
        q: "Rock layer X at location B is most likely the same relative as which rock layer at location A?",
        options: ["1", "2", "3", "4"],
        a: "3",
        img: "https://lh3.googleusercontent.com/d/1Xmsz3vj_s7f7pnAAgZPd8evSW4a74CLt"
    },
    3: {
        q: "The Law of Superposition is most commonly applied to which type of rock?",
        options: ["Igneous", "Metamorphic", "Sedimentary", "Volcanic"],
        a: "Sedimentary",
        img: null
    },
    4: {
        q: "What is the 3rd oldest thing that happened?",
        options: ["Layer R", "Layer E", "The Lava", "The Earthquake"],
        a: "The Earthquake",
        img: "https://lh3.googleusercontent.com/d/1jvhwZ75c9Iq7bKZ5NoiX5FUOONet2o_d"
    },
    5: {
        q: "Which of these fossils is the Index Fossil?",
        options: ["Ammonite", "Brachiopod", "Trilobite", "Crinoid Stem"],
        a: "Ammonite",
        img: "https://lh3.googleusercontent.com/d/1tWMKVDHXNpCflkVvwYNNKUbqQkY2OhM8"
    },
    6: {
        q: "Which of these is the Index Fossil?",
        options: ["A", "B", "C", "D"],
        a: "B",
        img: "https://lh3.googleusercontent.com/d/1wN2KerNTMZfjosk7z0rI4IudHfSXRcUb"
    },
    7: {
        q: "According to the Law of Superposition, where would you find the oldest rock layer in an undisturbed sequence of sedimentary rocks?",
        options: ["In the middle of the sequence", "The age cannot be determined by position", "At the very bottom", "At the very top"],
        a: "At the very bottom",
        img: null
    },
    8: {
        q: "Relative dating using superposition provides:",
        options: ["The exact age of a rock in years", "The temperature at which the rock formed", "The order of events without providing specific dates", "The chemical composition of the rock"],
        a: "The order of events without providing specific dates",
        img: null
    },
    9: {
        q: "If an igneous intrusion cuts through several sedimentary layers, is the intrusion older or younger than the layers it cuts through?",
        options: ["It depends on the type of magma", "The same age", "Older", "Younger"],
        a: "Younger",
        img: null
    },
    10: {
        q: "What is \"D\"?",
        options: ["The oldest Layer", "An Intrusion", "An Earthquake", "The Youngest Layer"],
        a: "An Intrusion",
        img: "https://lh3.googleusercontent.com/d/1yXVGsXRhdwF2GOahvBqjePsqtWFNikjU"
    }
};