export const MAGNUS_FACTS: Record<string, string[]> = {
    rockCycle: [
        "Igneous = \"Fire Rock\": It’s made from cooled-down magma or lava. If it’s frozen fire, it’s igneous.",
        "Sedimentary = \"Layer Rock\": It’s made from tiny bits of sand, dirt, and shells glued together over a long time.",
        "Metamorphic = \"Change Rock\": It’s a rock that got squished and baked by heat and pressure until it turned into something new.",
        "Magma vs. Lava: If it’s inside the Earth, it’s magma. If it shoots out of a volcano, it’s lava. Same stuff, different name.",
        "The Big Melt: Any rock—no matter what type—will turn back into liquid magma if it gets hot enough.",
        "Super Slow: You won’t see a rock change in your lifetime. These changes usually take millions of years.",
        "Pressure: Deep underground, the weight of the Earth is so heavy it can actually bend and change solid rock without melting it.",
        "The Cycle Never Stops: Rocks are always moving, breaking, melting, and reforming. Earth never runs out of \"new\" rocks."
    ],
    erosion: [
        "Weathering = Breaking: This is when nature uses \"tools\" like ice, rain, and plant roots to crack and crumble big rocks into tiny pieces (sediment).",
        "Erosion = Moving: This is the \"getaway car.\" It’s when water, wind, or ice picks up those tiny pieces and carries them away to a new spot.",
        "Deposition = Dropping: This is when the wind or water slows down and \"deposits\" (drops) the sediment. It's like the rock bits finally finding a place to sit down.",
        "Water is the Boss: Flowing water (like rivers and rain) is the #1 cause of erosion on Earth. It is way more powerful than wind!",
        "Ice Can Move Mountains: Glaciers are giant \"ice rivers.\" As they crawl along, they act like giant bulldozers, scraping up rocks and moving them miles away.",
        "Gravity Plays a Part: Gravity is the silent helper. It pulls rocks down hills (landslides) and makes sure sediment eventually settles at the bottom of lakes and oceans.",
        "Roots are Stronger than Rock: Have you ever seen a sidewalk crack because of a tree root? That’s \"biological weathering.\" Plants can actually grow through solid stone!",
        "Building New Land: Deposition isn't just \"dropping trash\"—it builds things! Beaches, sand dunes, and river deltas are all created because of deposition."
    ],
    superposition: [
        "Fossils: Only sedimentary rocks have fossils. If you tried to put a fossil in the other two, it would either melt or get crushed!",
        "Oldest at the Bottom: In a stack of rock layers, the oldest layer is always at the bottom and the youngest is at the top. It’s like a stack of pancakes—you had to put the first one down before you could stack others on top.",
        "The Law of Superposition is most commonly applied to which type of rock?",
        "Relative dating using superposition provides:",
        "Relative Dating: This law doesn't tell us the exact \"birthday\" of a rock (like \"this rock is 50 million years old\"). Instead, it tells us the relative age (like \"this rock is older than the one above it\").",
        "Index fossils: The “Short-Lived Stars: An index fossil comes from a creature that lived for a short time in Earth’s history. If it lived for billions of years, it wouldn't be helpful for telling time!",
        "The \"One Layer\" Rule: In a perfect world, an index fossil shows up in only one specific layer of rock. If it shows up in every single layer from bottom to top, it’s not a good index fossil.",
        "Easy to Recognize: A good index fossil has a unique shape. It needs to be easy for a scientist to look at and say, \"Aha! That’s definitely a Trilobite!\""
    ]
};

export const DIALOGUE = {
    INDIANA_BONES: {
        GREETING: "Indiana Bones: Careful where you step. History is fragile, and so are my ribs.",
        GIVE_SHOVEL: "Indiana Bones: You found some soft earth? Here, take this Shovel. I seem to have lost my fossils down there. If you find them, let me know!",
        TRADE_PROMPT: "Indiana Bones: That... is an Index Fossil! Truly remarkable. I've been looking for one of those my whole career! Trade you my spare hat for it?",
        GIVE_HAT: "Indiana Bones: It suits you! Wear it with pride, fellow explorer.",
        ALREADY_TRADED: "Indiana Bones: How's the hat? Looking sharp!"
    },
    ROCKY: {
        GREETING: "Rocky: Need some supplies for your journey? I've got items for sale for Sediment!",
        SUCCESS: "Rocky: Pleasure doing business with you!",
        TOO_POOR: "Rocky: You don't have enough Sediment for that!",
        ITEMS: [
            { name: "Echo Prism", key: "echoPrisms", cost: 2 },
            { name: "Quick Escape", key: "quickEscapes", cost: 25 },
            { name: "Instant Teleport", key: "instantTeleport", cost: 50, reqDepth: 10 }
        ]
    },
    CHIP: {
        GREETING: "Chip: I love breaking stuff! Weathering is my passion. Ouch, my leg... I guess I weather easily too.",
        ALREADY_HAS: "Chip: Keep up the good work weathering those rocks!",
        GIVE_HAMMER: "Chip gave you a Hammer! 'This will help you weather those rocks!'"
    },
    ARNOLD: {
        PUZZLE: "Mr. Arnold: Greetings! I am Mr. Arnold, the Math Wizard. I have a spectacular item for you: The Arcane Eye! It can detect powerful magical energy in your vicinity. It's an essential tool for any serious explorer! I'll sell it for sediments. The price is hidden in this puzzle: (7 x 4) + (12 / 4) - 1. How many do you offer?",
        ALREADY_HAS: "Mr. Arnold: I hope that Arcane Eye is serving you well! It's one of a kind, crafted with my finest mathematical magic!",
        SUCCESS: "Mr. Arnold: Excellent! A perfect calculation. The Arcane Eye is yours!",
        GENEROUS: "Mr. Arnold: That is... quite generous! A deal is a deal. The Arcane Eye is yours!",
        POOR_CALC: "Mr. Arnold: Hmm, no. That is a poor calculation. My magic is worth more than that paltry sum!",
        TOO_POOR: "Mr. Arnold: Alas, you simply cannot afford my brilliance. Come back when you have more sediment!",
        OFFERS: [20, 30, 45, 60]
    },
    MAGNUS: {
        GREETING: "Magnus Obsidia: Behold the power of the inner earth! Igneous rocks are born from fire itself.",
        TOPICS_PROMPT: "Magnus Obsidia: What rock wisdom do you seek?",
        TOPICS: [
            { label: "The Rock Cycle", key: 'rockCycle' },
            { label: "Weathering, Erosion, & Deposition", key: 'erosion' },
            { label: "The Law of Superposition", key: 'superposition' }
        ]
    },
    DINO: {
        GREETING: "Rex: *RAWR!* I mean... hello! I am Rex. Do you have any fossils? I LOVE FOSSILS!",
        EXCITED: "Rex: OH MY! Is that a real fossil? It's magnificent! Here, take this as a token of my appreciation. It's a very rare Index Fossil!",
        ALREADY_GIVEN: "Rex: Thank you for showing me your fossils! That Index Fossil I gave you is very important for telling time in the rock layers!",
        NO_FOSSILS: "Rex: You don't have any fossils yet? Keep digging in the caves! I'll be here waiting!"
    }
};