import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Integrated Science starter banks for matter, energy and earth-space.
 * Written by hand, checked by the validator.
 * Eight questions per level, twenty four per topic. The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  ref: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "SCI";
const OUT = path.resolve("src/server/data/questions/10-12/science");
const BAND = bandById("10-12")!;
const AUTHOR = "AI draft v1";

const REFS = {
  matter: "NERDC Primary 5 Integrated Science, matter and materials",
  energy: "NERDC Primary 5 Integrated Science, energy and force",
  "earth-space": "NERDC Primary 5 Integrated Science, earth and space",
};

const MATTER_BRONZE: Draft[] = [
  {
    text: "Which of these is a solid?",
    correct: "A stone",
    distractors: ["Water", "Air", "Steam"],
    explanation: "A stone keeps its shape, so it is a solid.",
    ref: REFS["matter"],
  },
  {
    text: "Which of these is a liquid?",
    correct: "Palm oil",
    distractors: ["Ice", "Salt", "Sand"],
    explanation: "Palm oil flows and takes the shape of its container.",
    ref: REFS["matter"],
  },
  {
    text: "Which of these is a gas?",
    correct: "Air",
    distractors: ["Milk", "Wood", "Coal"],
    explanation: "Air is a mix of gases all around us.",
    ref: REFS["matter"],
  },
  {
    text: "What do we call the change from water to ice?",
    correct: "Freezing",
    distractors: ["Melting", "Boiling", "Drying"],
    explanation: "Water turns to ice when it freezes.",
    ref: REFS["matter"],
  },
  {
    text: "What happens when ice is heated?",
    correct: "It melts into water",
    distractors: ["It turns to dust", "It stays exactly the same", "It becomes salt"],
    explanation: "Heat turns ice into liquid water.",
    ref: REFS["matter"],
  },
  {
    text: "Which material is hard and used to build houses?",
    correct: "Cement",
    distractors: ["Cloth", "Paper", "Rubber"],
    explanation: "Cement is hard and strong, so builders use it.",
    ref: REFS["matter"],
  },
  {
    text: "Which of these does not mix with water?",
    correct: "Sand",
    distractors: ["Sugar", "Salt", "Honey"],
    explanation: "Sand does not dissolve in water.",
    ref: REFS["matter"],
  },
  {
    text: "What is a mixture?",
    correct: "Two or more things mixed together",
    distractors: ["A pure metal", "A new element", "A hot liquid"],
    explanation: "A mixture holds two or more things together.",
    ref: REFS["matter"],
  },
];

const MATTER_SILVER: Draft[] = [
  {
    text: "Why does sugar disappear in hot tea?",
    correct: "It dissolves",
    distractors: ["It melts", "It freezes", "It burns"],
    explanation: "Sugar dissolves in hot water.",
    ref: REFS["matter"],
  },
  {
    text: "Why do we use rubber for car tyres?",
    correct: "It bends without breaking",
    distractors: ["It is very hard", "It melts in the sun", "It floats on water"],
    explanation: "Rubber is stretchy and grips the road.",
    ref: REFS["matter"],
  },
  {
    text: "How can you separate sand from water?",
    correct: "By filtering it",
    distractors: ["By freezing it", "By boiling it", "By shaking it"],
    explanation: "A filter stops the sand and lets water through.",
    ref: REFS["matter"],
  },
  {
    text: "Why does steam rise from a boiling pot?",
    correct: "Water turns to vapour",
    distractors: ["The pot is dirty", "Salt makes it rise", "Oil pushes it up"],
    explanation: "Boiling turns liquid water into water vapour.",
    ref: REFS["matter"],
  },
  {
    text: "Which of these changes can be reversed?",
    correct: "Melting chocolate",
    distractors: ["Burning wood", "Baking a cake", "Rusting iron"],
    explanation: "Melted chocolate sets hard again when it cools.",
    ref: REFS["matter"],
  },
  {
    text: "Why is glass used for windows?",
    correct: "It is clear and solid",
    distractors: ["It is soft", "It is a gas", "It soaks up water"],
    explanation: "Glass lets in light and stays solid.",
    ref: REFS["matter"],
  },
  {
    text: "How do you get salt back from salt water?",
    correct: "By heating it to dry",
    distractors: ["By filtering it", "By freezing it", "By shaking it"],
    explanation: "Heating dries the water and leaves the salt behind.",
    ref: REFS["matter"],
  },
  {
    text: "Why do iron roofs rust in the rain?",
    correct: "Iron reacts with water and air",
    distractors: ["The sun burns them", "Rain melts the iron", "Wind wears them out"],
    explanation: "Iron reacts with water and air to form rust.",
    ref: REFS["matter"],
  },
];

const MATTER_GOLD: Draft[] = [
  {
    text: "Why can we squeeze air more easily than water?",
    correct: "Gas particles are far apart",
    distractors: ["Water is very heavy", "Air is thicker than water", "Water is a gas too"],
    explanation: "Gas particles are far apart, so they squeeze closer.",
    ref: REFS["matter"],
  },
  {
    text: "A metal spoon in hot soup gets hot. Why?",
    correct: "Metal passes heat quickly",
    distractors: ["Metal stores cold", "Soup pushes heat down", "The spoon makes heat"],
    explanation: "Metal is a good conductor of heat.",
    ref: REFS["matter"],
  },
  {
    text: "Why does a wet cloth dry faster in the sun?",
    correct: "Heat speeds up drying",
    distractors: ["The sun eats water", "The cloth shrinks", "Shade keeps it wet"],
    explanation: "The sun's heat makes water escape faster.",
    ref: REFS["matter"],
  },
  {
    text: "Why do we keep cooking oil in a closed bottle?",
    correct: "To keep out air and dust",
    distractors: ["To make it colder", "To keep it frozen", "To make it heavier"],
    explanation: "A closed bottle keeps the oil fresh and clean.",
    ref: REFS["matter"],
  },
  {
    text: "Which fact shows that water is matter?",
    correct: "It has mass and takes space",
    distractors: ["It is colourless", "It flows downhill", "It is wet"],
    explanation: "All matter has mass and takes up space.",
    ref: REFS["matter"],
  },
  {
    text: "Why does a balloon shrink in cold weather?",
    correct: "The gas inside contracts",
    distractors: ["Air leaks out slowly", "Rubber melts in cold", "The balloon gets heavier"],
    explanation: "Cold makes gas particles move slower and take less space.",
    ref: REFS["matter"],
  },
  {
    text: "In a solution, what happens to the parts?",
    correct: "One part dissolves evenly in another",
    distractors: ["Mixtures are always solid", "Solutions cannot be poured", "Mixtures never change"],
    explanation: "A solution is a mixture where one part dissolves fully.",
    ref: REFS["matter"],
  },
  {
    text: "Why does gold keep its shine for years?",
    correct: "It does not rust or tarnish easily",
    distractors: ["It is always polished", "It melts in the sun", "It soaks up oil"],
    explanation: "Gold is unreactive, so it stays shiny.",
    ref: REFS["matter"],
  },
];

const ENERGY_BRONZE: Draft[] = [
  {
    text: "What is the main source of energy for Earth?",
    correct: "The sun",
    distractors: ["The moon", "Wind", "Coal"],
    explanation: "The sun gives light and heat to Earth.",
    ref: REFS["energy"],
  },
  {
    text: "Which of these gives us light?",
    correct: "A bulb",
    distractors: ["A drum", "A chair", "A fan"],
    explanation: "A bulb changes electrical energy into light.",
    ref: REFS["energy"],
  },
  {
    text: "What energy does a beating drum produce?",
    correct: "Sound",
    distractors: ["Heat", "Light", "Wind"],
    explanation: "A drum vibrates to make sound.",
    ref: REFS["energy"],
  },
  {
    text: "Which fuel do most Nigerian cars use?",
    correct: "Petrol",
    distractors: ["Charcoal", "Firewood", "Candle wax"],
    explanation: "Most cars in Nigeria run on petrol.",
    ref: REFS["energy"],
  },
  {
    text: "Why do homes need power?",
    correct: "To power appliances",
    distractors: ["To grow plants", "To paint walls", "To make salt"],
    explanation: "Electricity powers lights, fans, fridges and TVs.",
    ref: REFS["energy"],
  },
  {
    text: "Which of these is a source of heat?",
    correct: "A match flame",
    distractors: ["A mirror", "A bell", "A stone"],
    explanation: "A match gives off heat and light.",
    ref: REFS["energy"],
  },
  {
    text: "What does a fan do with power?",
    correct: "Turns it into movement",
    distractors: ["Turns it into light", "Turns it into sound only", "Stores it in water"],
    explanation: "A fan changes electrical energy into movement.",
    ref: REFS["energy"],
  },
  {
    text: "Which energy do our ears detect?",
    correct: "Sound",
    distractors: ["Light", "Heat", "Gravity"],
    explanation: "Sound is the energy our ears detect.",
    ref: REFS["energy"],
  },
];

const ENERGY_SILVER: Draft[] = [
  {
    text: "Why do we put food in a fridge?",
    correct: "To keep it cold and fresh",
    distractors: ["To cook it faster", "To dry it out", "To make it sweeter"],
    explanation: "Cold slows spoilage, so food lasts longer.",
    ref: REFS["energy"],
  },
  {
    text: "What energy does a moving car have?",
    correct: "Kinetic energy",
    distractors: ["Heat energy", "Light energy", "Chemical energy"],
    explanation: "Moving things have kinetic energy.",
    ref: REFS["energy"],
  },
  {
    text: "Why do solar panels work best in full sun?",
    correct: "They need sunlight to make power",
    distractors: ["They store rain", "They need wind", "They like the heat"],
    explanation: "Solar panels change sunlight into electricity.",
    ref: REFS["energy"],
  },
  {
    text: "How does a torch work?",
    correct: "Batteries push current to a bulb",
    distractors: ["Sunlight charges it", "Gas burns inside", "It stores sound"],
    explanation: "A torch battery sends current through the bulb.",
    ref: REFS["energy"],
  },
  {
    text: "How does sound travel through a drum skin?",
    correct: "The skin vibrates",
    distractors: ["The skin is hot", "The skin is shiny", "The skin is heavy"],
    explanation: "Vibration carries sound through materials.",
    ref: REFS["energy"],
  },
  {
    text: "What change happens when firewood burns?",
    correct: "Chemical energy turns to heat",
    distractors: ["Light to sound", "Heat to light", "Movement to heat"],
    explanation: "Burning firewood changes stored chemical energy to heat.",
    ref: REFS["energy"],
  },
  {
    text: "Why do we wear light clothes in hot weather?",
    correct: "They reflect sunlight",
    distractors: ["They absorb heat", "They are cheaper", "They are thicker"],
    explanation: "Light surfaces reflect light and keep us cooler.",
    ref: REFS["energy"],
  },
  {
    text: "What happens to your shadow on a cloudy day?",
    correct: "It fades or disappears",
    distractors: ["It turns blue", "It doubles in size", "It moves behind you"],
    explanation: "A shadow needs direct light to show.",
    ref: REFS["energy"],
  },
];

const ENERGY_GOLD: Draft[] = [
  {
    text: "Why do we hear thunder after we see lightning?",
    correct: "Light travels faster than sound",
    distractors: ["Thunder forms later", "Sound is louder at night", "Light is slower in rain"],
    explanation: "Light reaches our eyes before sound reaches our ears.",
    ref: REFS["energy"],
  },
  {
    text: "How do hydro dams like Kainji make power?",
    correct: "Moving water turns turbines",
    distractors: ["Dams store sunlight", "Dams make wind", "Heat boils the water"],
    explanation: "Moving water spins turbines linked to generators.",
    ref: REFS["energy"],
  },
  {
    text: "How can a house save electricity?",
    correct: "Using LED bulbs and switching off unused appliances",
    distractors: ["Opening all the windows", "Painting the walls white", "Buying more fans"],
    explanation: "LEDs use little power, and unused appliances waste none.",
    ref: REFS["energy"],
  },
  {
    text: "Why does a bicycle dynamo light the lamp?",
    correct: "Movement makes electric current",
    distractors: ["Friction makes fire", "The chain stores charge", "Pedalling cools the lamp"],
    explanation: "A dynamo turns movement into electrical energy.",
    ref: REFS["energy"],
  },
  {
    text: "Why do people cook with firewood?",
    correct: "It is cheap and easy to get",
    distractors: ["It gives no smoke", "It burns cold", "It is found underground"],
    explanation: "Firewood is widely available and affordable for cooking.",
    ref: REFS["energy"],
  },
  {
    text: "Which one shows energy turning to motion?",
    correct: "A ball falling from a roof",
    distractors: ["A still stone", "A burning candle", "A glowing bulb"],
    explanation: "A high ball stores energy it releases as it falls.",
    ref: REFS["energy"],
  },
  {
    text: "Why does a steel cup feel hotter than a wooden one with tea?",
    correct: "Steel passes heat faster",
    distractors: ["Wood stores more heat", "Steel reflects heat away", "Wood blocks all cold"],
    explanation: "Steel passes heat quickly to your hand.",
    ref: REFS["energy"],
  },
  {
    text: "Why should we switch off lights when leaving a room?",
    correct: "To save electricity",
    distractors: ["To rest the bulb", "To keep the room warm", "To stop insects"],
    explanation: "Switching off saves power and money.",
    ref: REFS["energy"],
  },
];

const EARTH_BRONZE: Draft[] = [
  {
    text: "What planet do we live on?",
    correct: "Earth",
    distractors: ["Mars", "Venus", "Jupiter"],
    explanation: "Humans live on planet Earth.",
    ref: REFS["earth-space"],
  },
  {
    text: "What is the shape of the Earth?",
    correct: "A sphere",
    distractors: ["A cube", "A flat disc", "A triangle"],
    explanation: "Earth is round like a sphere.",
    ref: REFS["earth-space"],
  },
  {
    text: "What force pulls objects towards the ground?",
    correct: "Gravity",
    distractors: ["Friction", "Magnetism", "Tension"],
    explanation: "Gravity pulls everything towards Earth.",
    ref: REFS["earth-space"],
  },
  {
    text: "How long does Earth take to go round the sun?",
    correct: "One year",
    distractors: ["One day", "One month", "One week"],
    explanation: "Earth orbits the sun in about 365 days.",
    ref: REFS["earth-space"],
  },
  {
    text: "What makes day and night?",
    correct: "Earth spinning on its axis",
    distractors: ["The sun circling Earth", "The moon blocking the sun", "Clouds covering the sky"],
    explanation: "Earth spins, so the sun lights half at a time.",
    ref: REFS["earth-space"],
  },
  {
    text: "What is the sun?",
    correct: "A star",
    distractors: ["A planet", "A moon", "A comet"],
    explanation: "The sun is the star nearest to Earth.",
    ref: REFS["earth-space"],
  },
  {
    text: "Which of these travels around the Earth?",
    correct: "The moon",
    distractors: ["A rocket", "A plane", "A cloud"],
    explanation: "The moon orbits the Earth.",
    ref: REFS["earth-space"],
  },
  {
    text: "What do we call water that falls from clouds?",
    correct: "Rain",
    distractors: ["Dew", "Steam", "Mist"],
    explanation: "Rain is water that falls from clouds.",
    ref: REFS["earth-space"],
  },
];

const EARTH_SILVER: Draft[] = [
  {
    text: "Why does the moon seem to change shape?",
    correct: "We see different amounts of its lit side",
    distractors: ["Clouds hide parts of it", "It blocks the sun", "It spins very fast"],
    explanation: "The moon reflects light, and we see it from changing angles.",
    ref: REFS["earth-space"],
  },
  {
    text: "What causes the seasons?",
    correct: "Earth tilts as it orbits the sun",
    distractors: ["Earth stops spinning", "The sun burns out", "The moon pulls Earth"],
    explanation: "Earth's tilt changes how sunlight falls on each half.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why is the sky usually blue by day?",
    correct: "Air scatters sunlight",
    distractors: ["The sea reflects up", "Clouds are blue", "Dust blocks other colours"],
    explanation: "Air scatters blue light more than other colours.",
    ref: REFS["earth-space"],
  },
  {
    text: "How do we know rain may fall soon?",
    correct: "Dark clouds gather and wind rises",
    distractors: ["Birds sing louder", "The sun turns red", "Stars appear"],
    explanation: "Dark, gathering clouds often bring rain.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why do we have daytime and night-time?",
    correct: "Earth spins on its axis",
    distractors: ["The sun travels round Earth", "The moon covers the sky", "Seasons change"],
    explanation: "As Earth spins, each side faces the sun in turn.",
    ref: REFS["earth-space"],
  },
  {
    text: "What is a crater?",
    correct: "A hole made by a rock from space",
    distractors: ["A volcano top", "A deep river", "A mountain peak"],
    explanation: "Craters form when space rocks hit a surface.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why does the moon have no weather like Earth?",
    correct: "It has almost no air",
    distractors: ["It spins too fast", "It is too small", "It has no sunlight"],
    explanation: "Weather needs air, and the moon has almost none.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why does a solar eclipse happen?",
    correct: "The moon blocks the sun's light",
    distractors: ["Clouds block the sun", "Earth blocks the moon", "A planet hides the sun"],
    explanation: "A solar eclipse happens when the moon passes in front of the sun.",
    ref: REFS["earth-space"],
  },
];

const EARTH_GOLD: Draft[] = [
  {
    text: "Why do we see stars only at night?",
    correct: "The sun is too bright by day",
    distractors: ["Stars move away by day", "Clouds always hide them", "Stars sleep by day"],
    explanation: "Sunlight outshines the stars during the day.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why does the same side of the moon face Earth?",
    correct: "It spins once in the time it orbits",
    distractors: ["It does not spin", "Earth pulls it still", "Magnets lock it in place"],
    explanation: "The moon's spin and orbit take the same time.",
    ref: REFS["earth-space"],
  },
  {
    text: "About how many Earths would fit across the sun?",
    correct: "About 109",
    distractors: ["About 3", "About 12", "About 1000"],
    explanation: "The sun is about 109 times wider than Earth.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why is space travel hard for humans?",
    correct: "There is no air or gravity there",
    distractors: ["Space is only cold", "Rockets cannot fly high", "Space has too much water"],
    explanation: "Space lacks air, so astronauts need special suits.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why do planets stay in orbit round the sun?",
    correct: "The sun's gravity pulls them",
    distractors: ["Wind pushes them", "They float on gas", "Magnets hold them"],
    explanation: "Gravity keeps the planets circling the sun.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why does Nigeria have a wet season?",
    correct: "Moist ocean winds carry rain inland",
    distractors: ["The sun melts more water", "Mountains make rain daily", "The moon pulls rain down"],
    explanation: "Moist ocean winds bring rain in the wet season.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why is the moon not a star?",
    correct: "It shines by reflected sunlight",
    distractors: ["It is too small", "It is too far away", "It is made of ice"],
    explanation: "The moon gives off no light of its own.",
    ref: REFS["earth-space"],
  },
  {
    text: "Why do astronauts float inside a space station?",
    correct: "Everything falls round Earth together",
    distractors: ["There is no gravity there", "The station pushes them", "They are lighter in space"],
    explanation: "The station and the astronauts fall round Earth together.",
    ref: REFS["earth-space"],
  },
];

function optionsFor(correct: string, pool: readonly string[], index: number): string[] {
  const seen = new Set([correct]);
  const wrong: string[] = [];
  for (const candidate of pool) {
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    wrong.push(candidate);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) throw new Error(`not enough distractors for ${correct}`);
  const options = [...wrong];
  options.splice(index, 0, correct);
  return options;
}

const LEVEL_NUM: Record<Level, number[]> = {
  bronze: [1, 2, 3, 4, 5, 6, 7, 8],
  silver: [1, 2, 3, 4, 5, 6, 7, 8],
  gold: [1, 2, 3, 4, 5, 6, 7, 8],
};

function toQuestions(topicId: string, prefix: string, levels: Record<Level, Draft[]>): Question[] {
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${BAND.token}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: BAND.id,
        subject: "science",
        topic: topicId as Question["topic"],
        level,
        text: d.text,
        options: optionsFor(d.correct, d.distractors, index),
        correctIndex: index,
        explanation: d.explanation,
        curriculumRef: d.ref,
        author: AUTHOR,
        reviewer: null,
        status: "draft",
      });
    });
  }
  return out;
}

interface TopicDef {
  id: string;
  prefix: string;
  levels: Record<Level, Draft[]>;
}

const BUILDERS: Record<string, TopicDef> = {
  matter: {
    id: "matter",
    prefix: "MAT",
    levels: { bronze: MATTER_BRONZE, silver: MATTER_SILVER, gold: MATTER_GOLD },
  },
  energy: {
    id: "energy",
    prefix: "ENE",
    levels: { bronze: ENERGY_BRONZE, silver: ENERGY_SILVER, gold: ENERGY_GOLD },
  },
  "earth-space": {
    id: "earth-space",
    prefix: "EAR",
    levels: { bronze: EARTH_BRONZE, silver: EARTH_SILVER, gold: EARTH_GOLD },
  },
};

let errors = 0;
mkdirSync(OUT, { recursive: true });
for (const topicId of Object.keys(BUILDERS)) {
  const builder = BUILDERS[topicId]!;
  const topic = TOPICS.find((t) => t.id === builder.id);
  if (!topic) throw new Error(`unknown topic ${builder.id}`);
  const questions = toQuestions(builder.id, builder.prefix, builder.levels);
  const file: TopicFile = { band: BAND.id, subject: "science", topic: builder.id as never, title: topic.label, questions };
  const issues = validateTopicFile(file, {});
  const bad = issues.filter((i) => i.severity === "error");
  if (!isClean(issues)) {
    errors += bad.length;
    console.error(`\n${builder.id}: ${bad.length} errors`);
    for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
  } else {
    console.log(`${builder.id}: ${questions.length} questions clean`);
  }
  writeFileSync(path.join(OUT, `${builder.id}.json`), JSON.stringify(file, null, 2) + "\n");
}

if (errors > 0) process.exitCode = 1;
