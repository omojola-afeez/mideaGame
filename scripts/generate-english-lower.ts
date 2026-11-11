import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * English starter bank for the lower age bands: Sprouts (4-6) and Explorers (7-9).
 * Written by hand, checked by the validator. Eight questions per level, twenty four per topic.
 * The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  ref: string;
  passage?: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "ENG";
const AUTHOR = "AI draft v1";

const REF4 = {
  bronze: "NERDC Nursery 2 English",
  silver: "NERDC Nursery 2 English",
  gold: "NERDC Primary 1 English",
} as const;
const REF7 = {
  bronze: "NERDC Primary 3 English",
  silver: "NERDC Primary 3 English",
  gold: "NERDC Primary 3 English",
} as const;

const BANDS = [bandById("4-6")!, bandById("7-9")!];

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

function toQuestions(bandToken: string, bandId: string, topicId: string, prefix: string, levels: Record<Level, Draft[]>): Question[] {
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${bandToken}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: bandId as Question["band"],
        subject: "english",
        topic: topicId as Question["topic"],
        level,
        text: d.text,
        ...(d.passage ? { passage: d.passage } : {}),
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

// ===========================================================================
// BAND 4-6 (Sprouts). Reading grade must stay at or below 1.5.
// ===========================================================================
const C46_COM_BRONZE: Draft[] = [
  { text: "What does Ada have?", passage: "Ada has a red bag. She goes to the farm.", correct: "A red bag", distractors: ["A blue cap", "A big fish", "A new yam"], explanation: "Ada has a red bag.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "What does Musa eat?", passage: "Musa likes mangoes. He eats one mango.", correct: "A mango", distractors: ["An orange", "A banana", "A plum"], explanation: "Musa eats one mango.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "Which one is hot?", passage: "The sun is hot. The rain is wet.", correct: "The sun", distractors: ["The rain", "The wind", "The night"], explanation: "The sun is hot.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "How many cats does Bola have?", passage: "Bola has two cats. One cat is black.", correct: "Two", distractors: ["One", "Three", "Four"], explanation: "Bola has two cats.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "What does Tunde ride?", passage: "Tunde rides a bike. He rides fast.", correct: "A bike", distractors: ["A car", "A boat", "A bus"], explanation: "Tunde rides a bike.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "Who cooks the rice?", passage: "Mama cooks rice. Papa eats rice.", correct: "Mama", distractors: ["Papa", "Tunde", "Ada"], explanation: "Mama is the one who cooks.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "What does the dog see?", passage: "The dog barks. The dog sees a cat.", correct: "A cat", distractors: ["A bird", "A fish", "A goat"], explanation: "The dog sees a cat.", ref: `${REF4.bronze}, reading comprehension` },
  { text: "How old is Chidi?", passage: "Chidi is six. His sister is four.", correct: "Six", distractors: ["Four", "Five", "Seven"], explanation: "Chidi is six.", ref: `${REF4.bronze}, reading comprehension` },
];

const C46_COM_SILVER: Draft[] = [
  { text: "Why does Kemi take her raincoat?", passage: "It is raining. Kemi wears a raincoat.", correct: "To stay dry", distractors: ["To look nice", "To sell it", "To hide"], explanation: "A raincoat keeps her dry.", ref: `${REF4.silver}, reading comprehension` },
  { text: "Where does Bola look?", passage: "Bola lost her shoe. She looks under the bed.", correct: "Under the bed", distractors: ["On the table", "In the box", "In the garden"], explanation: "She looks under the bed.", ref: `${REF4.silver}, reading comprehension` },
  { text: "Why is Emeka sad?", passage: "Emeka is sad. His ball fell in the well.", correct: "He lost his ball", distractors: ["He is ill", "He is hungry", "He is tired"], explanation: "Lose means to have something no more.", ref: `${REF4.silver}, reading comprehension` },
  { text: "What does the baby want?", passage: "The baby cries. She wants her milk.", correct: "Her milk", distractors: ["Her toy", "Her shoes", "A book"], explanation: "The baby wants her milk.", ref: `${REF4.silver}, reading comprehension` },
  { text: "How does Tayo feel?", passage: "Ngozi shares her snacks. Tayo is glad.", correct: "Glad", distractors: ["Angry", "Sad", "Tired"], explanation: "Tayo is glad when he gets snacks.", ref: `${REF4.silver}, reading comprehension` },
  { text: "Why does the hen sit on the eggs?", passage: "The hen sits on her eggs. She keeps them warm.", correct: "To keep them warm", distractors: ["To hide them", "To sell them", "To count them"], explanation: "The hen sits on the eggs to warm them.", ref: `${REF4.silver}, reading comprehension` },
  { text: "Why does Ayo drink water?", passage: "Ayo drinks water. He is thirsty.", correct: "He is thirsty", distractors: ["He is hungry", "He is cold", "He is sleepy"], explanation: "Thirsty means you want water.", ref: `${REF4.silver}, reading comprehension` },
  { text: "What is Funke doing?", passage: "Funke helps her mum. She washes the plates.", correct: "Washing plates", distractors: ["Cooking rice", "Sweeping the floor", "Selling food"], explanation: "Funke washes the plates.", ref: `${REF4.silver}, reading comprehension` },
];

const C46_COM_GOLD: Draft[] = [
  { text: "What does Papa use on the fire?", passage: "A fire starts in the yard. Papa gets a pail.", correct: "Water", distractors: ["Paper", "Oil", "Bread"], explanation: "Water can put out a fire.", ref: `${REF4.gold}, reading comprehension` },
  { text: "Why does Dele share his book?", passage: "Uzoma has no book. Dele shares his own.", correct: "Uzoma has none", distractors: ["He wants to sell it", "He lost it", "He hates it"], explanation: "Dele shares because Uzoma has none.", ref: `${REF4.gold}, reading comprehension` },
  { text: "When do the children play?", passage: "The rain stops. The children come out to play.", correct: "When the rain stops", distractors: ["In the rain", "At night", "In class"], explanation: "They play when the rain has stopped.", ref: `${REF4.gold}, reading comprehension` },
  { text: "What does Ada pull out?", passage: "Ada helps in the garden. She pulls the weeds.", correct: "The weeds", distractors: ["The flowers", "The beans", "The sand"], explanation: "Ada pulls the weeds.", ref: `${REF4.gold}, reading comprehension` },
  { text: "What time of day is it?", passage: "Bola wakes up. The sun is up.", correct: "Morning", distractors: ["Night", "Late evening", "Midnight"], explanation: "The sun rises in the morning.", ref: `${REF4.gold}, reading comprehension` },
  { text: "Where does the cat sit?", passage: "The cat sat on the mat. The mat is soft.", correct: "On the mat", distractors: ["On the chair", "On the bed", "On the table"], explanation: "The cat sits on the mat.", ref: `${REF4.gold}, reading comprehension` },
  { text: "What did Tunde do first?", passage: "Tunde washed his hands. Then he ate.", correct: "He washed his hands", distractors: ["He ate his food", "He slept", "He played"], explanation: "He washed first, then ate.", ref: `${REF4.gold}, reading comprehension` },
  { text: "Where does Ngozi look for her pen?", passage: "Ngozi lost her pen. She looks in her bag.", correct: "In her bag", distractors: ["Under her bed", "On the desk", "In the kitchen"], explanation: "Ngozi looks in her bag.", ref: `${REF4.gold}, reading comprehension` },
];

const C46_GRA_BRONZE: Draft[] = [
  { text: "Which word names a girl?", correct: "Mama", distractors: ["Run", "Big", "Slowly"], explanation: "Mama names a girl. Nouns name people.", ref: `${REF4.bronze}, grammar: nouns` },
  { text: "Which word names a place?", correct: "School", distractors: ["Jumps", "Red", "Sings"], explanation: "School names a place.", ref: `${REF4.bronze}, grammar: nouns` },
  { text: "Which word names a pet?", correct: "Goat", distractors: ["Table", "Book", "Pencil"], explanation: "A goat is a pet. Nouns name animals.", ref: `${REF4.bronze}, grammar: nouns` },
  { text: "Which word shows action?", correct: "Run", distractors: ["Chair", "Tall", "Blue"], explanation: "Run tells what you do. Verbs show action.", ref: `${REF4.bronze}, grammar: verbs` },
  { text: "Which word names a thing you eat?", correct: "Rice", distractors: ["Chair", "Shoe", "Lamp"], explanation: "Rice is a thing you eat.", ref: `${REF4.bronze}, grammar: nouns` },
  { text: "Which word names a thing?", correct: "Cup", distractors: ["Happy", "Sing", "Fast"], explanation: "A cup is a thing.", ref: `${REF4.bronze}, grammar: nouns` },
  { text: "Which names a boy in the family?", correct: "Brother", distractors: ["River", "Tree", "Stone"], explanation: "Brother is a boy in the family.", ref: `${REF4.bronze}, grammar: nouns` },
  { text: "Which word shows what you do?", correct: "Swim", distractors: ["House", "Red", "Happy"], explanation: "Swim shows an action.", ref: `${REF4.bronze}, grammar: verbs` },
];

const C46_GRA_SILVER: Draft[] = [
  { text: "Which word can take the place of Bola?", correct: "She", distractors: ["He", "It", "They"], explanation: "Bola is a girl, so we use she.", ref: `${REF4.silver}, grammar: pronouns` },
  { text: "Which word can take the place of Tunde?", correct: "He", distractors: ["She", "It", "We"], explanation: "Tunde is a boy, so we use he.", ref: `${REF4.silver}, grammar: pronouns` },
  { text: "Fill the gap: ___ is my brother.", correct: "He", distractors: ["She", "It", "They"], explanation: "We use he for a boy.", ref: `${REF4.silver}, grammar: pronouns` },
  { text: "Which word tells how Musa feels?", correct: "Happy", distractors: ["Runs", "Desk", "Mango"], explanation: "Happy tells a feeling.", ref: `${REF4.silver}, grammar: adjectives` },
  { text: "Which word tells about the cat?", correct: "Black", distractors: ["Runs", "Sings", "Eats"], explanation: "Black describes the cat.", ref: `${REF4.silver}, grammar: adjectives` },
  { text: "Fill the gap: My hands are ___.", correct: "clean", distractors: ["run", "jump", "sing"], explanation: "Clean tells how my hands are.", ref: `${REF4.silver}, grammar: adjectives` },
  { text: "Which word is a naming word?", correct: "Dog", distractors: ["Run", "Quick", "Sing"], explanation: "Dog names an animal.", ref: `${REF4.silver}, grammar: nouns` },
  { text: "Which word is the action word?", correct: "Jump", distractors: ["Table", "Tall", "Red"], explanation: "Jump shows an action.", ref: `${REF4.silver}, grammar: verbs` },
];

const C46_GRA_GOLD: Draft[] = [
  { text: "What is more than one book called?", correct: "Books", distractors: ["Bookes", "Bookies", "Bookss"], explanation: "To make book plural, add s.", ref: `${REF4.gold}, grammar: plurals` },
  { text: "What is more than one cat called?", correct: "Cats", distractors: ["Cates", "Caties", "Catss"], explanation: "One cat, many cats. Add s.", ref: `${REF4.gold}, grammar: plurals` },
  { text: "What is the plural of box?", correct: "Boxes", distractors: ["Boxs", "Boxies", "Box"], explanation: "Words like box add es.", ref: `${REF4.gold}, grammar: plurals` },
  { text: "What is the plural of baby?", correct: "Babies", distractors: ["Babys", "Babyes", "Baby"], explanation: "Words ending in y change to ies.", ref: `${REF4.gold}, grammar: plurals` },
  { text: "Fill the gap: She is ___ than me.", correct: "taller", distractors: ["tall", "tallest", "run"], explanation: "Use taller to compare two people.", ref: `${REF4.gold}, grammar: comparison` },
  { text: "Fill the gap: It is Uche's bag. It is ___.", correct: "hers", distractors: ["his", "its", "theirs"], explanation: "Hers means it belongs to Uche.", ref: `${REF4.gold}, grammar: possessive pronouns` },
  { text: "Fill the gap: The boys lost ___ ball.", correct: "their", distractors: ["his", "her", "its"], explanation: "Their shows the ball is theirs.", ref: `${REF4.gold}, grammar: possessive pronouns` },
  { text: "Which sentence is right?", correct: "She runs fast.", distractors: ["She run fast.", "She running fast.", "She runned fast."], explanation: "With she, the verb gets an s.", ref: `${REF4.gold}, grammar: subject and verb` },
];
const C46_TEN_BRONZE: Draft[] = [
  { text: "Fill the gap: I ___ each day.", correct: "play", distractors: ["played", "will play", "playing"], explanation: "Every day tells us it happens now.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Fill the gap: She ___ now.", correct: "eats", distractors: ["ate", "will eat", "eaten"], explanation: "Now means it is happening now.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Fill the gap: We ___ at school.", correct: "learn", distractors: ["learned", "will learn", "learning"], explanation: "We learn at school each day.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Fill the gap: The sun ___ in the sky.", correct: "shines", distractors: ["shone", "will shine", "shining"], explanation: "The sun shines each day.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Fill the gap: He ___ his teeth.", correct: "brushes", distractors: ["brushed", "will brush", "brushing"], explanation: "He brushes his teeth daily.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Which word means now?", correct: "jumps", distractors: ["jumped", "will jump", "was jumping"], explanation: "Jumps shows action happening now.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Fill the gap: They ___ the ball.", correct: "kick", distractors: ["kicked", "will kick", "kicking"], explanation: "They kick the ball each day.", ref: `${REF4.bronze}, tenses: simple present` },
  { text: "Fill the gap: Dogs ___ at night.", correct: "bark", distractors: ["barked", "will bark", "barking"], explanation: "Dogs bark each night.", ref: `${REF4.bronze}, tenses: simple present` },
];

const C46_TEN_SILVER: Draft[] = [
  { text: "Fill the gap: Last week, I ___ to the market.", correct: "went", distractors: ["go", "goes", "will go"], explanation: "Yesterday tells us it already happened.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: Last night, she ___ rice.", correct: "cooked", distractors: ["cooks", "cook", "will cook"], explanation: "Yesterday means the past.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: Last week, we ___ to the farm.", correct: "walked", distractors: ["walk", "walks", "will walk"], explanation: "Last week tells us it is past.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: He ___ the ball last week.", correct: "kicked", distractors: ["kicks", "kick", "will kick"], explanation: "Yesterday shows the past.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: Last week, the rain ___.", correct: "fell", distractors: ["falls", "fall", "will fall"], explanation: "Fell is the past of fall.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: Last night, I ___ early.", correct: "slept", distractors: ["sleep", "sleeps", "will sleep"], explanation: "Slept is the past of sleep.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: Last night, she ___ a song.", correct: "sang", distractors: ["sings", "sing", "will sing"], explanation: "Sang is the past of sing.", ref: `${REF4.silver}, tenses: simple past` },
  { text: "Fill the gap: Last week, they ___ dinner.", correct: "ate", distractors: ["eat", "eats", "will eat"], explanation: "Ate is the past of eat.", ref: `${REF4.silver}, tenses: simple past` },
];

const C46_TEN_GOLD: Draft[] = [
  { text: "Fill the gap: Next week, I ___ to school.", correct: "will go", distractors: ["go", "went", "goes"], explanation: "Tomorrow tells us it is future.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Next week, we ___ the zoo.", correct: "will visit", distractors: ["visit", "visited", "visits"], explanation: "Will visit shows the future.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Next week, they ___ a new house.", correct: "will move", distractors: ["move", "moved", "moves"], explanation: "Next week means the future.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Soon, he ___ his bike.", correct: "will ride", distractors: ["rides", "rode", "ride"], explanation: "Tomorrow and will show the future.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Soon, the sun ___.", correct: "will rise", distractors: ["rises", "rose", "rise"], explanation: "Soon shows the future. We use will.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Next year, I ___ in Primary 1.", correct: "will be", distractors: ["am", "was", "were"], explanation: "Next year is the future. Use will be.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Next week, they ___ football.", correct: "will play", distractors: ["played", "play", "plays"], explanation: "Tomorrow means the action is future.", ref: `${REF4.gold}, tenses: simple future` },
  { text: "Fill the gap: Soon, mum ___ a cake.", correct: "will bake", distractors: ["bakes", "baked", "bake"], explanation: "Tomorrow shows the future. Use will bake.", ref: `${REF4.gold}, tenses: simple future` },
];

const C46_PUN_BRONZE: Draft[] = [
  { text: "Which mark ends a sentence?", correct: "A full stop", distractors: ["A comma", "A hyphen", "A colon"], explanation: "A sentence ends with a full stop.", ref: `${REF4.bronze}, punctuation: full stops` },
  { text: "Which mark shows a question?", correct: "A question mark", distractors: ["A full stop", "A comma", "An exclamation mark"], explanation: "Questions end with a question mark.", ref: `${REF4.bronze}, punctuation: question marks` },
  { text: "The first word of a sentence starts with ___.", correct: "a capital letter", distractors: ["a small letter", "a number", "a comma"], explanation: "Start a sentence with a capital letter.", ref: `${REF4.bronze}, punctuation: capital letters` },
  { text: "Which group of words is a full sentence?", correct: "The dog barks.", distractors: ["Barks the dog.", "The dog.", "Dog barks the"], explanation: "A sentence needs a naming part and action.", ref: `${REF4.bronze}, punctuation: sentences` },
  { text: "Which mark fits here: Are you ok ___", correct: "A question mark", distractors: ["A full stop", "A comma", "An exclamation mark"], explanation: "Are you ok is a question.", ref: `${REF4.bronze}, punctuation: question marks` },
  { text: "Which mark fits here: I am six ___", correct: "A full stop", distractors: ["A question mark", "A comma", "An exclamation mark"], explanation: "I am six is a statement. It takes a full stop.", ref: `${REF4.bronze}, punctuation: full stops` },
  { text: "Which word starts with a big letter?", correct: "Nigeria", distractors: ["table", "cat", "book"], explanation: "Names of places start with capitals.", ref: `${REF4.bronze}, punctuation: capital letters` },
  { text: "Which name starts with a big letter?", correct: "Ada", distractors: ["rice", "yam", "bag"], explanation: "Names of people start with capitals.", ref: `${REF4.bronze}, punctuation: capital letters` },
];

const C46_PUN_SILVER: Draft[] = [
  { text: "Which mark shows a strong feeling?", correct: "An exclamation mark", distractors: ["A comma", "A full stop", "A colon"], explanation: "Strong feelings take an exclamation mark.", ref: `${REF4.silver}, punctuation: exclamation marks` },
  { text: "Which mark ends a warning word like Fire?", correct: "An exclamation mark", distractors: ["A comma", "A full stop", "A colon"], explanation: "A strong call takes an exclamation mark.", ref: `${REF4.silver}, punctuation: exclamation marks` },
  { text: "Which mark joins things in a list?", correct: "A comma", distractors: ["A full stop", "A question mark", "An exclamation mark"], explanation: "Use commas between items in a list.", ref: `${REF4.silver}, punctuation: commas` },
  { text: "Fill the gap: I bought rice, beans ___ yam.", correct: "and", distractors: ["but", "yet", "or"], explanation: "And joins the last item in a list.", ref: `${REF4.silver}, punctuation: commas` },
  { text: "I live in Lagos. Which words take big letters?", correct: "I and Lagos", distractors: ["I and live", "live and Lagos", "in and Lagos"], explanation: "I and Lagos take capital letters.", ref: `${REF4.silver}, punctuation: capital letters` },
  { text: "What is missing? She said hello ___", correct: "A full stop at the end", distractors: ["A comma at the end", "A question mark at the end", "An exclamation mark at the end"], explanation: "She said hello is a statement.", ref: `${REF4.silver}, punctuation: full stops` },
  { text: "What is missing? Are you coming ___", correct: "A question mark at the end", distractors: ["A full stop at the end", "A comma at the end", "An exclamation mark at the end"], explanation: "Are you coming is a question.", ref: `${REF4.silver}, punctuation: question marks` },
  { text: "What is missing? What a lovely day ___", correct: "An exclamation mark at the end", distractors: ["A full stop at the end", "A comma at the end", "A question mark at the end"], explanation: "What a lovely day shows strong feeling.", ref: `${REF4.silver}, punctuation: exclamation marks` },
];

const C46_PUN_GOLD: Draft[] = [
  { text: "Which shows one boy owns the ball?", correct: "boy's ball", distractors: ["boys ball", "boys' ball", "balls boy"], explanation: "Apostrophe s means one boy owns it.", ref: `${REF4.gold}, punctuation: apostrophes` },
  { text: "Which shows one girl owns the bag?", correct: "girl's bag", distractors: ["girls bag", "girls' bag", "bags girl"], explanation: "Apostrophe s shows ownership.", ref: `${REF4.gold}, punctuation: apostrophes` },
  { text: "What is missing here: Where is my shoe ___", correct: "A question mark at the end", distractors: ["A full stop at the end", "A comma at the end", "An exclamation mark at the end"], explanation: "Where is my shoe is a question.", ref: `${REF4.gold}, punctuation: question marks` },
  { text: "What is missing here: Run for your life ___", correct: "An exclamation mark at the end", distractors: ["A full stop at the end", "A comma at the end", "A question mark at the end"], explanation: "Run for your life is an urgent call.", ref: `${REF4.gold}, punctuation: exclamation marks` },
  { text: "We visited Abuja. Which words take big letters?", correct: "We and Abuja", distractors: ["We and visited", "visited and Abuja", "and and Abuja"], explanation: "We starts the sentence. Abuja is a place.", ref: `${REF4.gold}, punctuation: capital letters` },
  { text: "Which order is right?", correct: "Go home now.", distractors: ["Home go now.", "Go now home.", "Home now go."], explanation: "A command starts with a capital letter.", ref: `${REF4.gold}, punctuation: sentences` },
  { text: "My friend Bola lives in Kano. Which words take big letters?", correct: "Bola and Kano", distractors: ["Bola and my", "friend and Kano", "lives and Bola"], explanation: "Names of people and places take capitals.", ref: `${REF4.gold}, punctuation: capital letters` },
  { text: "Which mark is used in boy's?", correct: "An apostrophe", distractors: ["A comma", "A full stop", "A hyphen"], explanation: "The apostrophe in boy's shows ownership.", ref: `${REF4.gold}, punctuation: apostrophes` },
];
const C46_SPE_BRONZE: Draft[] = [
  { text: "Fill the gap: The ___ says meow.", correct: "cat", distractors: ["kat", "cot", "cet"], explanation: "Cat starts with c and has a short a.", ref: `${REF4.bronze}, spelling: short vowels` },
  { text: "Fill the gap: The ___ wags its tail.", correct: "dog", distractors: ["dag", "dug", "dogg"], explanation: "Dog has a short o sound.", ref: `${REF4.bronze}, spelling: short vowels` },
  { text: "Fill the gap: The ___ is hot and bright.", correct: "sun", distractors: ["son", "sin", "san"], explanation: "Sun has a short u sound.", ref: `${REF4.bronze}, spelling: short vowels` },
  { text: "Fill the gap: A ___ lives in water.", correct: "fish", distractors: ["fesh", "fihs", "ficsh"], explanation: "Fish has the sh sound at the end.", ref: `${REF4.bronze}, spelling: digraphs` },
  { text: "Fill the gap: The ___ sails on the sea.", correct: "ship", distractors: ["sheep", "sip", "shipp"], explanation: "Ship has the sh sound at the start.", ref: `${REF4.bronze}, spelling: digraphs` },
  { text: "Fill the gap: I buy food at the ___.", correct: "shop", distractors: ["schop", "shopp", "shoppe"], explanation: "Shop has the sh sound at the start.", ref: `${REF4.bronze}, spelling: digraphs` },
  { text: "Fill the gap: I like ___ pen.", correct: "this", distractors: ["tis", "thes", "dis"], explanation: "This has the th sound at the start.", ref: `${REF4.bronze}, spelling: digraphs` },
  { text: "Fill the gap: Look at ___ bird.", correct: "that", distractors: ["tat", "thate", "dat"], explanation: "That has the th sound at the start.", ref: `${REF4.bronze}, spelling: digraphs` },
];

const C46_SPE_SILVER: Draft[] = [
  { text: "Fill the gap: The ___ is tall and green.", correct: "tree", distractors: ["tre", "trei", "trey"], explanation: "Tree has the ee long vowel sound.", ref: `${REF4.silver}, spelling: long vowels` },
  { text: "Fill the gap: My two ___ hurt.", correct: "feet", distractors: ["fet", "feat", "feit"], explanation: "Feet has the ee long vowel sound.", ref: `${REF4.silver}, spelling: long vowels` },
  { text: "Fill the gap: The ___ falls from the sky.", correct: "rain", distractors: ["rane", "rayn", "rin"], explanation: "Rain has the ai long vowel sound.", ref: `${REF4.silver}, spelling: long vowels` },
  { text: "Fill the gap: We sailed in a ___.", correct: "boat", distractors: ["bote", "boate", "bot"], explanation: "Boat has the oa long vowel sound.", ref: `${REF4.silver}, spelling: long vowels` },
  { text: "Fill the gap: We eat ___ in the morning.", correct: "bread", distractors: ["breed", "brad", "brede"], explanation: "Bread has a short e sound.", ref: `${REF4.silver}, spelling: vowel teams` },
  { text: "Fill the gap: Turn on the ___.", correct: "light", distractors: ["lite", "ligt", "lightt"], explanation: "Light has the igh sound.", ref: `${REF4.silver}, spelling: vowel teams` },
  { text: "Fill the gap: We sleep at ___.", correct: "night", distractors: ["nite", "nigth", "nightt"], explanation: "Night has the igh sound.", ref: `${REF4.silver}, spelling: vowel teams` },
  { text: "Fill the gap: I like to ___ books.", correct: "read", distractors: ["reed", "red", "raed"], explanation: "Read means to look at words.", ref: `${REF4.silver}, spelling: vowel teams` },
];

const C46_SPE_GOLD: Draft[] = [
  { text: "Fill the gap: She ___ hello to us.", correct: "said", distractors: ["sed", "sayid", "saed"], explanation: "Said is spelled s a i d.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: Please ___ here.", correct: "come", distractors: ["cum", "coome", "com"], explanation: "Come has a short u sound.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: I ___ my mum.", correct: "love", distractors: ["luv", "lov", "luve"], explanation: "Love is spelled l o v e.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: I have ___ mangoes.", correct: "some", distractors: ["sum", "sume", "som"], explanation: "Some is spelled s o m e.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: We ___ at the farm.", correct: "were", distractors: ["wher", "wer", "wheir"], explanation: "Were is spelled w e r e.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: I ___ a new bag.", correct: "have", distractors: ["hav", "haev", "haf"], explanation: "Have ends with a silent e.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: Bola is my best ___.", correct: "friend", distractors: ["frend", "freind", "frind"], explanation: "Friend has the ie spelling.", ref: `${REF4.gold}, spelling: tricky words` },
  { text: "Fill the gap: I stay home ___ it rains.", correct: "because", distractors: ["becauze", "becuse", "beacause"], explanation: "Because is spelled b e c a u s e.", ref: `${REF4.gold}, spelling: tricky words` },
];

const C46_VOC_BRONZE: Draft[] = [
  { text: "What does big mean?", correct: "Large", distractors: ["Small", "Quick", "Cold"], explanation: "Big means large.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does small mean?", correct: "Little", distractors: ["Large", "Soft", "Fast"], explanation: "Small means little.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does happy mean?", correct: "Glad", distractors: ["Sad", "Angry", "Tired"], explanation: "Happy means glad.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does fast mean?", correct: "Quick", distractors: ["Slow", "Late", "Cold"], explanation: "Fast means quick.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does cold mean?", correct: "Not hot", distractors: ["Very hot", "Very sweet", "Very loud"], explanation: "Cold is not hot.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does start mean?", correct: "Begin", distractors: ["End", "Stop", "Wait"], explanation: "Start means begin.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does end mean?", correct: "Finish", distractors: ["Start", "Begin", "Go"], explanation: "End means finish.", ref: `${REF4.bronze}, vocabulary: word meaning` },
  { text: "What does near mean?", correct: "Not far", distractors: ["Very far", "Up high", "Down low"], explanation: "Near means not far.", ref: `${REF4.bronze}, vocabulary: word meaning` },
];

const C46_VOC_SILVER: Draft[] = [
  { text: "What is the opposite of hot?", correct: "Cold", distractors: ["Warm", "Sunny", "Wet"], explanation: "Hot and cold are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of big?", correct: "Small", distractors: ["Large", "Huge", "Tall"], explanation: "Big and small are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of up?", correct: "Down", distractors: ["High", "Over", "Above"], explanation: "Up and down are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of day?", correct: "Night", distractors: ["Morning", "Noon", "Sun"], explanation: "Day and night are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of fast?", correct: "Slow", distractors: ["Quick", "Rapid", "Hurry"], explanation: "Fast and slow are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of happy?", correct: "Sad", distractors: ["Glad", "Joyful", "Merry"], explanation: "Happy and sad are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of open?", correct: "Shut", distractors: ["Clear", "Wide", "Loose"], explanation: "Open and shut are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
  { text: "What is the opposite of full?", correct: "Empty", distractors: ["Complete", "Heavy", "Over"], explanation: "Full and empty are opposites.", ref: `${REF4.silver}, vocabulary: opposites` },
];

const C46_VOC_GOLD: Draft[] = [
  { text: "Which word means the same as big?", correct: "Large", distractors: ["Small", "Little", "Tiny"], explanation: "Big and large mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as small?", correct: "Little", distractors: ["Huge", "Big", "Tall"], explanation: "Small and little mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as happy?", correct: "Glad", distractors: ["Sad", "Mad", "Tired"], explanation: "Happy and glad mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as quick?", correct: "Fast", distractors: ["Slow", "Late", "Calm"], explanation: "Quick and fast mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as begin?", correct: "Start", distractors: ["End", "Stop", "Finish"], explanation: "Begin and start mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as jump?", correct: "Leap", distractors: ["Sit", "Walk", "Stand"], explanation: "Jump and leap mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as rich?", correct: "Wealthy", distractors: ["Poor", "Hungry", "Weak"], explanation: "Rich and wealthy mean the same.", ref: `${REF4.gold}, vocabulary: synonyms` },
  { text: "What does brave mean?", correct: "Not scared", distractors: ["Very scared", "Very weak", "Very shy"], explanation: "Brave means not scared.", ref: `${REF4.gold}, vocabulary: word meaning` },
];
const C46_FIG_BRONZE: Draft[] = [
  { text: "Finish the line: As fast as a ___", correct: "cheetah", distractors: ["snail", "goat", "cow"], explanation: "A cheetah is very fast.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As big as an ___", correct: "elephant", distractors: ["cat", "hen", "ant"], explanation: "An elephant is very big.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As quiet as a ___", correct: "mouse", distractors: ["lion", "drum", "bell"], explanation: "A mouse moves very quietly.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As brave as a ___", correct: "lion", distractors: ["rabbit", "snail", "cat"], explanation: "A lion is very brave.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As sweet as ___", correct: "honey", distractors: ["pepper", "salt", "soap"], explanation: "Honey is very sweet.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As cold as ___", correct: "ice", distractors: ["fire", "the sun", "pepper"], explanation: "Ice is very cold.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As tall as a ___", correct: "giraffe", distractors: ["ant", "snail", "hen"], explanation: "A giraffe is very tall.", ref: `${REF4.bronze}, figures: similes` },
  { text: "Finish the line: As red as a ___", correct: "tomato", distractors: ["leaf", "sky", "mud"], explanation: "A tomato is red.", ref: `${REF4.bronze}, figures: similes` },
];

const C46_FIG_SILVER: Draft[] = [
  { text: "She sings like a ___.", correct: "bird", distractors: ["fish", "goat", "snake"], explanation: "A bird sings sweetly.", ref: `${REF4.silver}, figures: similes` },
  { text: "He runs like the ___.", correct: "wind", distractors: ["stone", "snail", "mud"], explanation: "The wind blows very fast.", ref: `${REF4.silver}, figures: similes` },
  { text: "The baby sleeps like a ___.", correct: "log", distractors: ["bell", "lion", "drum"], explanation: "Sleeps like a log means sleeps deeply.", ref: `${REF4.silver}, figures: similes` },
  { text: "She is as proud as a ___.", correct: "peacock", distractors: ["mouse", "snail", "cat"], explanation: "A peacock shows its fine feathers.", ref: `${REF4.silver}, figures: similes` },
  { text: "The sun went down like a ball of ___.", correct: "fire", distractors: ["ice", "water", "rain"], explanation: "The setting sun looks like a ball of fire.", ref: `${REF4.silver}, figures: similes` },
  { text: "The cloud is like ___ cotton.", correct: "fluffy", distractors: ["hard", "wet", "sharp"], explanation: "Clouds look like soft cotton.", ref: `${REF4.silver}, figures: similes` },
  { text: "He is as strong as an ___.", correct: "ox", distractors: ["ant", "hen", "fish"], explanation: "An ox is very strong.", ref: `${REF4.silver}, figures: similes` },
  { text: "Her voice is like ___ music.", correct: "sweet", distractors: ["sour", "rough", "cold"], explanation: "Sweet music is pleasant to hear.", ref: `${REF4.silver}, figures: similes` },
];

const C46_FIG_GOLD: Draft[] = [
  { text: "In the line, the wind sang, the wind is like a ___.", correct: "person", distractors: ["animal", "plant", "machine"], explanation: "Giving the wind a song makes it human.", ref: `${REF4.gold}, figures: personification` },
  { text: "In the line, the pot sang for food, the pot wants ___.", correct: "food", distractors: ["water", "a lid", "a song"], explanation: "The pot is given a human want.", ref: `${REF4.gold}, figures: personification` },
  { text: "What does a piece of cake mean?", correct: "Very easy", distractors: ["Very hard", "Very sweet", "Very big"], explanation: "A piece of cake means a task is easy.", ref: `${REF4.gold}, figures: idioms` },
  { text: "What does break a leg mean?", correct: "Good luck", distractors: ["Be careful", "Run away", "Sit down"], explanation: "Break a leg is said to wish good luck.", ref: `${REF4.gold}, figures: idioms` },
  { text: "What does raining cats and dogs mean?", correct: "It is raining hard", distractors: ["Cats are falling", "It is not raining", "Dogs are swimming"], explanation: "The idiom means a very heavy rain.", ref: `${REF4.gold}, figures: idioms` },
  { text: "In that line, what is given life?", correct: "The house", distractors: ["The wind", "The old man", "The door"], explanation: "The house is given a human sound.", ref: `${REF4.gold}, figures: personification` },
  { text: "What does once in a blue moon mean?", correct: "Very rarely", distractors: ["Very often", "Every night", "Never again"], explanation: "A blue moon is rare. The idiom means rarely.", ref: `${REF4.gold}, figures: idioms` },
  { text: "What does spill the beans mean?", correct: "Tell the secret", distractors: ["Drop the beans", "Cook the beans", "Plant the beans"], explanation: "To spill the beans is to tell a secret.", ref: `${REF4.gold}, figures: idioms` },
];

const C46_WRI_BRONZE: Draft[] = [
  { text: "Which is a sentence?", correct: "The sun is hot.", distractors: ["Sun hot the is.", "Is hot the sun.", "Hot is sun the."], explanation: "A sentence starts with a capital letter.", ref: `${REF4.bronze}, writing: sentences` },
  { text: "Put the words in order: my is Ada name", correct: "My name is Ada.", distractors: ["Name my Ada is.", "Ada name is my.", "Is name my Ada."], explanation: "A good sentence starts with a capital.", ref: `${REF4.bronze}, writing: word order` },
  { text: "Which is a full idea?", correct: "The hen sits.", distractors: ["The hen", "Sits the", "The"], explanation: "A sentence names and says something.", ref: `${REF4.bronze}, writing: sentences` },
  { text: "Which tells a story?", correct: "The girl is kind.", distractors: ["The girl kind.", "Girl is kind.", "Is kind the girl."], explanation: "A telling sentence names who and what.", ref: `${REF4.bronze}, writing: sentences` },
  { text: "Which group of words makes a question?", correct: "Where is my shoe?", distractors: ["My shoe is here.", "The shoe is red.", "Shoe red shoe."], explanation: "A question asks for something to be answered.", ref: `${REF4.bronze}, writing: questions` },
  { text: "Which group of words is an order?", correct: "Close the door.", distractors: ["The door is shut.", "Where is the door?", "The door."], explanation: "An order asks someone to do something.", ref: `${REF4.bronze}, writing: sentences` },
  { text: "Which tells a feeling?", correct: "I am glad.", distractors: ["The roof is red.", "The bag is heavy.", "The dog barks."], explanation: "Glad tells a feeling.", ref: `${REF4.bronze}, writing: sentences` },
  { text: "Which tells about the rain?", correct: "The rain fell.", distractors: ["The sun rose.", "The cat slept.", "The dog ran."], explanation: "The sentence about the rain is about rain.", ref: `${REF4.bronze}, writing: sentences` },
];

const C46_WRI_SILVER: Draft[] = [
  { text: "Which one is written right?", correct: "I like rice and beans.", distractors: ["I like rice beans.", "I rice like and beans.", "Like and rice beans I."], explanation: "Use and to join two things.", ref: `${REF4.silver}, writing: joining words` },
  { text: "Join: Ada is tall. Ada is kind.", correct: "Ada is tall and kind.", distractors: ["Ada is tall Ada is kind.", "Ada and tall kind is.", "Tall is Ada and kind."], explanation: "And joins two ideas about Ada.", ref: `${REF4.silver}, writing: joining words` },
  { text: "Fix the order: to school went I", correct: "I went to school.", distractors: ["Went to school I.", "To school I went.", "School to I went."], explanation: "A sentence starts with a capital letter.", ref: `${REF4.silver}, writing: word order` },
  { text: "Order it: plays football he", correct: "He plays football.", distractors: ["Football he plays.", "Plays he football.", "He football plays."], explanation: "A sentence starts with a capital letter.", ref: `${REF4.silver}, writing: word order` },
  { text: "Which uses and well?", correct: "I ate rice and fish.", distractors: ["I and ate rice fish.", "Ate and I rice fish.", "Rice fish ate and I."], explanation: "And joins two things you ate.", ref: `${REF4.silver}, writing: joining words` },
  { text: "Order it: sun the shines", correct: "The sun shines.", distractors: ["Sun shines the.", "Shines the sun.", "The shines sun."], explanation: "Start with the naming part.", ref: `${REF4.silver}, writing: word order` },
  { text: "Order it: happy the is girl", correct: "The girl is happy.", distractors: ["The happy is girl.", "Girl the happy is.", "Happy is girl the."], explanation: "A telling sentence names who first.", ref: `${REF4.silver}, writing: word order` },
  { text: "Order it: school is my big", correct: "My school is big.", distractors: ["School is my big.", "Big is school my.", "Is big my school."], explanation: "Say my school first, then big.", ref: `${REF4.silver}, writing: word order` },
];

const C46_WRI_GOLD: Draft[] = [
  { text: "Pick the right word order.", correct: "Mama cooked the food.", distractors: ["Cooked mama food the.", "Food cooked mama the.", "The food cooked mama."], explanation: "A telling sentence names who first.", ref: `${REF4.gold}, writing: word order` },
  { text: "Fix this: You are okay", correct: "Are you okay?", distractors: ["You are okay?", "You okay are?", "Okay you are?"], explanation: "A question like this starts with are.", ref: `${REF4.gold}, writing: questions` },
  { text: "Fix this: She is happy", correct: "Is she happy?", distractors: ["She is happy?", "Happy she is?", "She happy is?"], explanation: "A question like this starts with is.", ref: `${REF4.gold}, writing: questions` },
  { text: "Which uses but well?", correct: "I like rice but not beans.", distractors: ["I like but rice beans.", "But I like rice and beans not.", "Rice I like not but beans."], explanation: "But shows a contrast.", ref: `${REF4.gold}, writing: joining words` },
  { text: "Fix the order: dog my barks big", correct: "My big dog barks.", distractors: ["Dog barks my big.", "Barks big dog my.", "Big barks my dog."], explanation: "My big dog is the naming part.", ref: `${REF4.gold}, writing: word order` },
  { text: "Fix the order: going we are home", correct: "We are going home.", distractors: ["Going home we are.", "Home going we are.", "Are home we going."], explanation: "Start with we are.", ref: `${REF4.gold}, writing: word order` },
  { text: "Which sounds polite?", correct: "Please pass the salt.", distractors: ["Salt now.", "Pass the salt.", "I want salt now."], explanation: "Please makes a request polite.", ref: `${REF4.gold}, writing: polite speech` },
  { text: "Which tells a full idea?", correct: "Mama sells fish at the market.", distractors: ["At the market", "Mama sells", "The market."], explanation: "A full idea names who and what.", ref: `${REF4.gold}, writing: complete ideas` },
];
// ===========================================================================
// BAND 7-9 (Explorers). Reading grade must stay at or below 3.5.
// ===========================================================================
const C79_COM_BRONZE: Draft[] = [
  { text: "What did Ada do first?", passage: "Ada woke up early. She swept the compound. Then she fetched water. Mama cooked yam porridge. Papa returned at noon. The family ate together.", correct: "She swept the compound", distractors: ["She cooked the meal", "She went to the farm", "She fetched water"], explanation: "The story says she swept the compound first.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "Where is Musa's school?", passage: "Musa's school is near the market. He passes it each morning. He greets the traders on the way. When the bell rings, he runs to class.", correct: "Near the market", distractors: ["Near the river", "Near the farm", "Near the church"], explanation: "The story says his school is near the market.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "What is Bola's favourite book about?", passage: "Bola loves reading. She reads a book each day. Her favourite is about a clever tortoise. The tortoise tricks the other animals. Bola learned a lesson from it.", correct: "A clever tortoise", distractors: ["A fierce lion", "A brave hunter", "A kind king"], explanation: "Her favourite book is about a clever tortoise.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "What did Papa get when he came in?", passage: "The rain beat hard on the roof. Papa came in soaked. Mama passed him a dry wrapper. She also gave him hot tea. Papa smiled at her.", correct: "A dry wrapper and hot tea", distractors: ["A new shirt and shoes", "His lunch and water", "A blanket and a snack"], explanation: "Mama passed him a dry wrapper and tea.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "When is Independence Day?", passage: "Nigeria celebrates Independence Day on 1 October. Flags fly in the streets. Children dress in green and white. There are parades at the square. Everyone sings the anthem.", correct: "1 October", distractors: ["1 May", "1 December", "25 December"], explanation: "Independence Day is on 1 October.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "What does the family do with the goat money?", passage: "Chiamaka keeps goats behind her house. She feeds them in the evening. Every Saturday, her father sells two goats. The money helps pay school fees.", correct: "Pay school fees", distractors: ["Buy new clothes", "Build a house", "Travel to Lagos"], explanation: "The money helps pay school fees.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "How did the pap taste to Uche?", passage: "The matron gave every child a cup of pap. It was warm and sweet. Uche said it tasted like honey. Ngozi finished hers quickly. Soon all the cups were empty.", correct: "Like honey", distractors: ["Like pepper", "Like salt water", "Like bitter leaf"], explanation: "Uche said the pap tasted like honey.", ref: `${REF7.bronze}, reading comprehension` },
  { text: "What grew after two weeks?", passage: "Emeka's class planted flowers in the garden. He watered his plant every day. After two weeks, small leaves appeared. His teacher praised him in class.", correct: "Small leaves", distractors: ["Big flowers", "Tall grass", "Cassava stems"], explanation: "Small leaves appeared after two weeks.", ref: `${REF7.bronze}, reading comprehension` },
];

const C79_COM_SILVER: Draft[] = [
  { text: "What does the story tell us about Kemi?", passage: "Kemi's mother sells roasted plantain by the road. Kemi helps her carry the basket. She fans the charcoal when the wind is low. After school, she counts the money with her. She dreams of owning a big shop.", correct: "She is hardworking", distractors: ["She is lazy", "She is fearful", "She is rude"], explanation: "Kemi works hard to help her mother.", ref: `${REF7.silver}, reading comprehension` },
  { text: "What can we tell from the match?", passage: "The match ended in a draw. Both teams played very well. The crowd cheered every goal. The two captains shook hands at the end. Everyone left the field smiling.", correct: "Both teams were respectful", distractors: ["One team cheated", "The referee was angry", "The fans fought"], explanation: "The captains shook hands. Both sides were fair.", ref: `${REF7.silver}, reading comprehension` },
  { text: "What is the key message in the passage?", passage: "The generator failed at night. The house went dark. Ifele lit a kerosene lamp. Her brother read by the light. Their mother told them folktales until they slept. Ifele loved the tortoise stories.", correct: "The family shared stories in the dark", distractors: ["Generators often fail in Nigeria", "Kerosene lamps are costly", "Tortoise tales are for adults"], explanation: "The heart of the story is sharing tales in the dark.", ref: `${REF7.silver}, reading comprehension` },
  { text: "Why do the children love Aunty Biola?", passage: "Aunty Biola teaches in a village school. She walks two kilometres each day. She carries books for her pupils. On rainy days, she wears her boots. The children love her.", correct: "She is kind", distractors: ["She lives close", "She gives gifts", "She tells jokes"], explanation: "The children love her because she is kind.", ref: `${REF7.silver}, reading comprehension` },
  { text: "How did Tobi feel after buying the ball?", passage: "Tobi saved his pocket money for weeks. He wanted a new football. On Saturday, he walked to the shop with his father. He counted the notes and paid. He felt very proud.", correct: "Proud", distractors: ["Afraid", "Angry", "Bored"], explanation: "Tobi felt proud of his purchase.", ref: `${REF7.silver}, reading comprehension` },
  { text: "Why must hands be washed with soap?", passage: "The nurse told Ngozi to wash her hands with soap before eating. Soap removes the germs that water alone cannot. Ngozi washed her hands and ate her lunch. She did not fall ill that week.", correct: "To remove germs", distractors: ["To smell nice", "To cool the hands", "To save water"], explanation: "Soap removes germs that water cannot.", ref: `${REF7.silver}, reading comprehension` },
  { text: "What do farmers do under the tree?", passage: "A baobab tree stands at the village square. It is over a hundred years old. Its trunk is very wide. Farmers rest under it on hot afternoons. Birds nest on its branches.", correct: "They rest", distractors: ["They trade goods", "They dance", "They pray"], explanation: "Farmers rest under the tree on hot afternoons.", ref: `${REF7.silver}, reading comprehension` },
  { text: "What does Zainab want to be?", passage: "Zainab wants to be a doctor. She reads her science books every night. Her brother says she will heal many people. Zainab saves her allowance for books. She never misses study time.", correct: "A doctor", distractors: ["A teacher", "A trader", "An engineer"], explanation: "Zainab wants to be a doctor.", ref: `${REF7.silver}, reading comprehension` },
];

const C79_COM_GOLD: Draft[] = [
  { text: "How does the writer feel about the village trip?", passage: "Every December, we travel to our grandfather's village. The bus ride is long but fun. My cousins wait at the motor park. We feast, we play, we tell old stories. I wish the holiday never ended.", correct: "Excited and happy", distractors: ["Scared and worried", "Bored and tired", "Angry and sad"], explanation: "The writer loves the trip and wishes it lasted.", ref: `${REF7.gold}, reading comprehension` },
  { text: "What is the main idea of the passage?", passage: "The new borehole changed life in our town. Women no longer walk far for water. Crops grow taller with regular water. Children look cleaner at school. Even the cattle drink from it.", correct: "The borehole improved life in town", distractors: ["Cattle need water daily", "Children must look clean", "Women travel far to markets"], explanation: "The passage lists many ways the borehole helped.", ref: `${REF7.gold}, reading comprehension` },
  { text: "What lesson does the story teach?", passage: "Akin found a wallet at the bus stop. He handed it to the driver. The owner returned and gave him a reward. Akin refused the money but smiled. His teacher praised him before the school.", correct: "Honesty brings respect", distractors: ["Money is always lost", "Drivers are kind", "Always refuse money"], explanation: "Akin was respected because he was honest.", ref: `${REF7.gold}, reading comprehension` },
  { text: "What does the passage suggest about reading?", passage: "Our school library has many books. Pupils visit it every week. Reading grows the mind. Some pupils borrow novels. The librarian says reading is key.", correct: "Reading builds the mind", distractors: ["Reading is only for exams", "Newspapers are better than books", "Libraries are noisy places"], explanation: "Reading grows the mind and teaches ideas.", ref: `${REF7.gold}, reading comprehension` },
  { text: "Why do farmers watch their farms in harmattan?", passage: "In harmattan, the air is dry and dusty. People wear warm clothes at night. Dry leaves rattle on the ground. Fires start easily on farms. Farmers watch their crops with extra care.", correct: "Fires start easily", distractors: ["Thieves come often", "Crops grow too fast", "Wind blocks the roads"], explanation: "The passage says fires start easily in harmattan.", ref: `${REF7.gold}, reading comprehension` },
  { text: "How did Adaeze's writing help others?", passage: "Adaeze joined the press club at school. She wrote about the new lab. Her article praised the people who built it. Readers from other classes praised her work. She hopes to become a writer.", correct: "Readers praised her", distractors: ["Readers ignored her", "Readers laughed at her", "Readers rejected her"], explanation: "The passage says readers praised her work.", ref: `${REF7.gold}, reading comprehension` },
  { text: "What is the main lesson of the passage?", passage: "The old fisherman taught his grandson to mend nets. The boy watched each knot closely. At first his fingers fumbled. After many tries, he tied strong knots. The old man said practice makes perfect.", correct: "Practice makes perfect", distractors: ["Nets are hard to mend", "Fishing is a hard life", "Children should watch only"], explanation: "The grandson learned through steady practice.", ref: `${REF7.gold}, reading comprehension` },
  { text: "What does the passage say about the river?", passage: "The Benue river carries canoes and fish. Fishermen catch fish for sale. Many families depend on the river. It gives food and income. It also floods farms when it overflows.", correct: "It provides food and income", distractors: ["It is only for swimming", "It never floods", "It has no fish"], explanation: "Many families depend on the river for food and income.", ref: `${REF7.gold}, reading comprehension` },
];
const C79_GRA_BRONZE: Draft[] = [
  { text: "Which word names a person in the sentence?", correct: "farmer", distractors: ["planting", "quickly", "tall"], explanation: "A farmer is a naming word. It is a noun.", ref: `${REF7.bronze}, grammar: nouns` },
  { text: "Which word names a thing in: The goat eats grass?", correct: "grass", distractors: ["eats", "goatly", "the"], explanation: "Grass names a thing. It is a noun.", ref: `${REF7.bronze}, grammar: nouns` },
  { text: "Which word shows action in: The boy kicks the ball?", correct: "kicks", distractors: ["boy", "ball", "the"], explanation: "Kicks shows what the boy does.", ref: `${REF7.bronze}, grammar: verbs` },
  { text: "Which word shows action in: My mother cooks rice?", correct: "cooks", distractors: ["mother", "rice", "my"], explanation: "Cooks shows an action. It is a verb.", ref: `${REF7.bronze}, grammar: verbs` },
  { text: "Which word describes a noun in: The red car moves fast?", correct: "red", distractors: ["car", "moves", "fast"], explanation: "Red describes the car. It is an adjective.", ref: `${REF7.bronze}, grammar: adjectives` },
  { text: "Which word describes the cat in: The fluffy cat sleeps?", correct: "fluffy", distractors: ["cat", "sleeps", "the"], explanation: "Fluffy describes the cat.", ref: `${REF7.bronze}, grammar: adjectives` },
  { text: "Which word names a place in: The school is near the market?", correct: "school", distractors: ["near", "marketly", "is"], explanation: "School names a place. It is a noun.", ref: `${REF7.bronze}, grammar: nouns` },
  { text: "Which word shows action in: The birds fly in the sky?", correct: "fly", distractors: ["birds", "sky", "the"], explanation: "Fly shows what the birds do.", ref: `${REF7.bronze}, grammar: verbs` },
];

const C79_GRA_SILVER: Draft[] = [
  { text: "Which pronoun can replace Ada in: Ada sings a song?", correct: "She", distractors: ["He", "It", "They"], explanation: "Ada is one girl, so we use she.", ref: `${REF7.silver}, grammar: pronouns` },
  { text: "Which pronoun can replace the boys in: The boys play?", correct: "They", distractors: ["He", "She", "It"], explanation: "The boys are many, so we use they.", ref: `${REF7.silver}, grammar: pronouns` },
  { text: "Which pronoun can replace the cat in: The cat is black?", correct: "It", distractors: ["He", "She", "They"], explanation: "An animal like a cat can be it.", ref: `${REF7.silver}, grammar: pronouns` },
  { text: "Fill the gap: Tom and I ___ friends.", correct: "are", distractors: ["am", "is", "be"], explanation: "Plural subjects take are.", ref: `${REF7.silver}, grammar: subject and verb agreement` },
  { text: "Fill the gap: The dog ___ loudly.", correct: "barks", distractors: ["bark", "barking", "barked"], explanation: "A single dog takes barks.", ref: `${REF7.silver}, grammar: subject and verb agreement` },
  { text: "Fill the gap: My pens ___ on the table.", correct: "are", distractors: ["is", "am", "be"], explanation: "Plural subjects take are.", ref: `${REF7.silver}, grammar: subject and verb agreement` },
  { text: "Fill the gap: She ___ to school by bus.", correct: "goes", distractors: ["go", "going", "gone"], explanation: "She takes the verb with s.", ref: `${REF7.silver}, grammar: subject and verb agreement` },
  { text: "Fill the gap: The children ___ in the field.", correct: "play", distractors: ["plays", "playing", "played"], explanation: "Children is plural, so no s on the verb.", ref: `${REF7.silver}, grammar: subject and verb agreement` },
];

const C79_GRA_GOLD: Draft[] = [
  { text: "What is the plural of knife?", correct: "knives", distractors: ["knifes", "knifs", "knife"], explanation: "Knife changes its f to v and takes es.", ref: `${REF7.gold}, grammar: plurals` },
  { text: "What is the plural of child?", correct: "children", distractors: ["childs", "childes", "childrens"], explanation: "Child has an irregular plural, children.", ref: `${REF7.gold}, grammar: plurals` },
  { text: "What is the plural of foot?", correct: "feet", distractors: ["foots", "feets", "footes"], explanation: "Foot has an irregular plural, feet.", ref: `${REF7.gold}, grammar: plurals` },
  { text: "What is the plural of bush?", correct: "bushes", distractors: ["bushs", "bushies", "bush"], explanation: "Words ending in sh add es.", ref: `${REF7.gold}, grammar: plurals` },
  { text: "Fill the gap: She is ___ than her brother.", correct: "taller", distractors: ["tall", "tallest", "talls"], explanation: "Use taller to compare two people.", ref: `${REF7.gold}, grammar: comparison` },
  { text: "Fill the gap: Of the three, Ngozi sings the ___.", correct: "best", distractors: ["better", "good", "well"], explanation: "Use best when comparing three or more.", ref: `${REF7.gold}, grammar: comparison` },
  { text: "Fill the gap: This is ___ book, not mine.", correct: "your", distractors: ["you're", "yours", "you"], explanation: "Your shows ownership. Yours stands alone.", ref: `${REF7.gold}, grammar: possessive pronouns` },
  { text: "Fill the gap: The cat is washing ___ paws.", correct: "its", distractors: ["it's", "its'", "their"], explanation: "Its shows ownership. It's means it is.", ref: `${REF7.gold}, grammar: possessive pronouns` },
];

const C79_TEN_BRONZE: Draft[] = [
  { text: "Fill the gap: I ___ to school every day.", correct: "go", distractors: ["went", "going", "gone"], explanation: "Every day shows the habitual present.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Fill the gap: She ___ her books at night.", correct: "reads", distractors: ["read", "reading", "will read"], explanation: "She takes the verb with s.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Fill the gap: The sun ___ in the east.", correct: "rises", distractors: ["rise", "rising", "rose"], explanation: "The sun rises in the east each day.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Fill the gap: We ___ English in school.", correct: "speak", distractors: ["spoke", "spoken", "speaking"], explanation: "We speak English. This is the simple present.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Fill the gap: The bus ___ at the park daily.", correct: "stops", distractors: ["stop", "stopped", "stopping"], explanation: "A single bus takes stops.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Fill the gap: My father ___ in Kano.", correct: "works", distractors: ["work", "worked", "working"], explanation: "My father takes works.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Fill the gap: Birds ___ in the trees.", correct: "nest", distractors: ["nests", "nested", "nesting"], explanation: "Birds is plural, so use nest.", ref: `${REF7.bronze}, tenses: simple present` },
  { text: "Which word shows action now?", correct: "sings", distractors: ["sang", "sung", "sing"], explanation: "Sings shows present action.", ref: `${REF7.bronze}, tenses: simple present` },
];

const C79_TEN_SILVER: Draft[] = [
  { text: "Fill the gap: Last week, we ___ the new borehole.", correct: "visited", distractors: ["visit", "visits", "will visit"], explanation: "Yesterday shows the simple past.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Last week, she ___ a prize.", correct: "won", distractors: ["wins", "win", "will win"], explanation: "Won is the past of win.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Yesterday, the rain ___ all day.", correct: "fell", distractors: ["falls", "fall", "will fall"], explanation: "Fell is the past of fall.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Last night, I ___ my homework.", correct: "finished", distractors: ["finish", "finishes", "will finish"], explanation: "Last night shows the past.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Last night, he ___ his grandmother.", correct: "called", distractors: ["calls", "call", "will call"], explanation: "Yesterday tells us it is past.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Last year, they ___ to Lagos.", correct: "moved", distractors: ["move", "moves", "will move"], explanation: "Last year shows the past.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Last week, the baby ___ all night.", correct: "cried", distractors: ["cries", "cry", "will cry"], explanation: "Cried is the past of cry.", ref: `${REF7.silver}, tenses: simple past` },
  { text: "Fill the gap: Last Saturday, we ___ yams.", correct: "planted", distractors: ["plant", "plants", "will plant"], explanation: "Last Saturday shows the past.", ref: `${REF7.silver}, tenses: simple past` },
];

const C79_TEN_GOLD: Draft[] = [
  { text: "Fill the gap: Next week, we ___ the museum.", correct: "will visit", distractors: ["visited", "visit", "visits"], explanation: "Tomorrow shows the future. Use will.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: Next month, she ___ her exams.", correct: "will write", distractors: ["wrote", "writes", "write"], explanation: "Next month shows the future. Use will.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: Next year, they ___ a new school.", correct: "will build", distractors: ["built", "builds", "build"], explanation: "Next year shows the future. Use will.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: Tomorrow, the plane ___ at noon.", correct: "will land", distractors: ["landed", "lands", "land"], explanation: "Tomorrow shows the future. Use will land.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: By next week, I ___ my project.", correct: "will finish", distractors: ["finished", "finishes", "finish"], explanation: "Next week shows the future. Use will.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: Soon, the rains ___.", correct: "will come", distractors: ["came", "comes", "come"], explanation: "Soon shows the future. Use will come.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: On Friday, we ___ Independence Day.", correct: "will celebrate", distractors: ["celebrated", "celebrates", "celebrate"], explanation: "Next Friday shows the future. Use will.", ref: `${REF7.gold}, tenses: simple future` },
  { text: "Fill the gap: By 2027, I ___ in junior school.", correct: "will be", distractors: ["am", "was", "were"], explanation: "2027 is the future. Use will be.", ref: `${REF7.gold}, tenses: simple future` },
];
const C79_PUN_BRONZE: Draft[] = [
  { text: "Which mark ends a statement?", correct: "A full stop", distractors: ["A comma", "A question mark", "A hyphen"], explanation: "A statement ends with a full stop.", ref: `${REF7.bronze}, punctuation: full stops` },
  { text: "Which mark ends a question?", correct: "A question mark", distractors: ["A full stop", "A comma", "An exclamation mark"], explanation: "Questions end with a question mark.", ref: `${REF7.bronze}, punctuation: question marks` },
  { text: "Which mark ends a strong command like Stop?", correct: "An exclamation mark", distractors: ["A comma", "A full stop", "A colon"], explanation: "Strong commands take an exclamation mark.", ref: `${REF7.bronze}, punctuation: exclamation marks` },
  { text: "Which mark starts a new sentence?", correct: "A capital letter", distractors: ["A small letter", "A number", "A comma"], explanation: "Start sentences with capital letters.", ref: `${REF7.bronze}, punctuation: capital letters` },
  { text: "i live in abuja. Which words take big letters?", correct: "I and Abuja", distractors: ["I and live", "live and Abuja", "in and Abuja"], explanation: "I and Abuja take capital letters.", ref: `${REF7.bronze}, punctuation: capital letters` },
  { text: "Which name is written right?", correct: "Chinedu", distractors: ["Chineduh", "Chinadu", "Chi-Nedu"], explanation: "Names start with a capital letter.", ref: `${REF7.bronze}, punctuation: capital letters` },
  { text: "What is missing here: Where is my cap ___", correct: "A question mark", distractors: ["A full stop", "A comma", "An exclamation mark"], explanation: "Where is my cap is a question.", ref: `${REF7.bronze}, punctuation: question marks` },
  { text: "What is missing here: I am ten years old ___", correct: "A full stop", distractors: ["A question mark", "A comma", "An exclamation mark"], explanation: "I am ten years old is a statement.", ref: `${REF7.bronze}, punctuation: full stops` },
];

const C79_PUN_SILVER: Draft[] = [
  { text: "Which mark joins things in a list?", correct: "A comma", distractors: ["A full stop", "A question mark", "An apostrophe"], explanation: "Commas separate items in a list.", ref: `${REF7.silver}, punctuation: commas` },
  { text: "Which mark shows that one boy owns the book?", correct: "An apostrophe", distractors: ["A comma", "A full stop", "A hyphen"], explanation: "An apostrophe shows ownership: boy's book.", ref: `${REF7.silver}, punctuation: apostrophes` },
  { text: "Which shows more than one girl owns the bags?", correct: "girls' bags", distractors: ["girl's bags", "girls bags", "girles bags"], explanation: "girls' shows many girls own them.", ref: `${REF7.silver}, punctuation: apostrophes` },
  { text: "What is missing here: Wow, what a goal ___", correct: "An exclamation mark", distractors: ["A full stop", "A comma", "A question mark"], explanation: "Wow shows strong feeling.", ref: `${REF7.silver}, punctuation: exclamation marks` },
  { text: "Which shows one owner: the car of my father?", correct: "my father's car", distractors: ["my fathers car", "my fathers' car", "my father car"], explanation: "my father's car shows it is his car.", ref: `${REF7.silver}, punctuation: apostrophes` },
  { text: "she visited kaduna. Which words take big letters?", correct: "She and Kaduna", distractors: ["she and visited", "visited and Kaduna", "and and Kaduna"], explanation: "She starts the sentence. Kaduna is a place.", ref: `${REF7.silver}, punctuation: capital letters` },
  { text: "What is missing here: Do you know the way ___", correct: "A question mark", distractors: ["A full stop", "A comma", "An exclamation mark"], explanation: "Do you know the way is a question.", ref: `${REF7.silver}, punctuation: question marks` },
  { text: "Which mark goes after the last item in a list?", correct: "A full stop", distractors: ["A comma", "A question mark", "An exclamation mark"], explanation: "The list is a statement, so it ends with a full stop.", ref: `${REF7.silver}, punctuation: full stops` },
];

const C79_PUN_GOLD: Draft[] = [
  { text: "Which mark opens speech?", correct: "A speech mark", distractors: ["A comma", "A full stop", "A hyphen"], explanation: "Speech marks open and close direct speech.", ref: `${REF7.gold}, punctuation: speech marks` },
  { text: "Which sentence uses speech marks right?", correct: "She said, \"I am here.\"", distractors: ["She said \"I am here\".", "\"She said, I am here.\"", "She said \"I am\" here.\""], explanation: "Speech marks wrap the exact spoken words.", ref: `${REF7.gold}, punctuation: speech marks` },
  { text: "Fill the gap: The dog wagged ___ tail.", correct: "its", distractors: ["it's", "its'", "ites"], explanation: "Its shows ownership. It's means it is.", ref: `${REF7.gold}, punctuation: apostrophes` },
  { text: "Fill the gap: ___ raining hard today.", correct: "It's", distractors: ["Its", "Its'", "Itse"], explanation: "It's means it is.", ref: `${REF7.gold}, punctuation: apostrophes` },
  { text: "Which marks wrap the exact words a person speaks?", correct: "Speech marks", distractors: ["Commas", "Brackets", "Hyphens"], explanation: "Speech marks show direct speech.", ref: `${REF7.gold}, punctuation: speech marks` },
  { text: "Pick the right word: Put the book over ___.", correct: "there", distractors: ["their", "they're", "theire"], explanation: "There means a place.", ref: `${REF7.gold}, punctuation: homophones` },
  { text: "Pick the right word: The players tied ___ boots together.", correct: "their", distractors: ["there", "they're", "theire"], explanation: "Their shows the boots belong to the players.", ref: `${REF7.gold}, punctuation: homophones` },
  { text: "Fill the gap: He gave me ___ book and a pen.", correct: "a", distractors: ["an", "some", "many"], explanation: "Use a before a consonant sound.", ref: `${REF7.gold}, punctuation: articles` },
];

const C79_SPE_BRONZE: Draft[] = [
  { text: "Fill the gap: Children go to ___ every day.", correct: "school", distractors: ["schooll", "skuul", "schoo"], explanation: "School is spelled s c h o o l.", ref: `${REF7.bronze}, spelling: silent letters` },
  { text: "Fill the gap: Please ___ your name.", correct: "write", distractors: ["rite", "wirte", "wrtie"], explanation: "Write starts with a silent w.", ref: `${REF7.bronze}, spelling: silent letters` },
  { text: "Fill the gap: A ___ saved the king.", correct: "knight", distractors: ["nite", "knyght", "knigth"], explanation: "Knight starts with a silent k.", ref: `${REF7.bronze}, spelling: silent letters` },
  { text: "Fill the gap: Always be ___.", correct: "honest", distractors: ["onest", "honnest", "honst"], explanation: "Honest starts with a silent h.", ref: `${REF7.bronze}, spelling: silent letters` },
  { text: "Fill the gap: A tortoise lives on an ___.", correct: "island", distractors: ["iland", "isalnd", "islannd"], explanation: "Island has a silent s.", ref: `${REF7.bronze}, spelling: silent letters` },
  { text: "Fill the gap: The ___ is bright.", correct: "light", distractors: ["lite", "ligth", "ligt"], explanation: "Light has the igh sound.", ref: `${REF7.bronze}, spelling: vowel teams` },
  { text: "Fill the gap: The ___ is made of wood.", correct: "table", distractors: ["tabel", "tablle", "tabble"], explanation: "Table is spelled t a b l e.", ref: `${REF7.bronze}, spelling: common words` },
  { text: "Fill the gap: We grow ___ in the backyard.", correct: "garden", distractors: ["gardin", "gaerden", "gardan"], explanation: "Garden is spelled with an e.", ref: `${REF7.bronze}, spelling: common words` },
];

const C79_SPE_SILVER: Draft[] = [
  { text: "Fill the gap: Many ___ attended the meeting.", correct: "people", distractors: ["peopel", "poeple", "peeple"], explanation: "People is spelled p e o p l e.", ref: `${REF7.silver}, spelling: tricky words` },
  { text: "Fill the gap: Can you ___ the question?", correct: "answer", distractors: ["answar", "ansur", "anser"], explanation: "Answer has a silent w.", ref: `${REF7.silver}, spelling: tricky words` },
  { text: "Fill the gap: I ___ before I slept.", correct: "thought", distractors: ["thot", "thowt", "thougt"], explanation: "Thought is spelled t h o u g h t.", ref: `${REF7.silver}, spelling: tricky words` },
  { text: "Fill the gap: The hunter ___ the antelope.", correct: "caught", distractors: ["cought", "caut", "cauht"], explanation: "Caught is spelled c a u g h t.", ref: `${REF7.silver}, spelling: tricky words` },
  { text: "Fill the gap: Please be ___ in church.", correct: "quiet", distractors: ["queit", "quiete", "quite"], explanation: "Quiet is spelled q u i e t.", ref: `${REF7.silver}, spelling: tricky words` },
  { text: "Fill the gap: Pass me the water ___.", correct: "bottle", distractors: ["botle", "bottel", "bottll"], explanation: "Bottle doubles the t.", ref: `${REF7.silver}, spelling: double letters` },
  { text: "Fill the gap: The carpenter used a ___.", correct: "hammer", distractors: ["hamer", "hammur", "hamerr"], explanation: "Hammer doubles the m.", ref: `${REF7.silver}, spelling: double letters` },
  { text: "Fill the gap: I received a ___ from my aunt.", correct: "letter", distractors: ["leter", "litter", "lettir"], explanation: "Letter doubles the t.", ref: `${REF7.silver}, spelling: double letters` },
];

const C79_SPE_GOLD: Draft[] = [
  { text: "Pick the right word: The boy ate ___ food.", correct: "his", distractors: ["he's", "his'", "is"], explanation: "His shows the boy owns the food.", ref: `${REF7.gold}, spelling: homophones` },
  { text: "Pick the right word: ___ raining hard.", correct: "It's", distractors: ["Its", "Its'", "Itse"], explanation: "It's means it is.", ref: `${REF7.gold}, spelling: homophones` },
  { text: "Pick the right word: I have ___ friends in Kano.", correct: "two", distractors: ["too", "to", "tu"], explanation: "Two is the number 2.", ref: `${REF7.gold}, spelling: homophones` },
  { text: "Pick the right word: Ada is going ___ the market.", correct: "to", distractors: ["too", "two", "toe"], explanation: "To shows movement towards a place.", ref: `${REF7.gold}, spelling: homophones` },
  { text: "Pick the right word: The peppers are ___ hot.", correct: "too", distractors: ["to", "two", "tu"], explanation: "Too means excessively.", ref: `${REF7.gold}, spelling: homophones` },
  { text: "Pick the right word: He gave me ___ books.", correct: "their", distractors: ["there", "they're", "theire"], explanation: "Their shows the books belong to them.", ref: `${REF7.gold}, spelling: homophones` },
  { text: "Pick the right spelling of the word meaning needed.", correct: "necessary", distractors: ["neccessary", "necessery", "necesary"], explanation: "Necessary has one c and two s.", ref: `${REF7.gold}, spelling: tricky words` },
  { text: "Pick the right spelling of the word meaning lovely.", correct: "beautiful", distractors: ["beautifull", "beautful", "beautyful"], explanation: "Beautiful keeps the y changed to i.", ref: `${REF7.gold}, spelling: tricky words` },
];
const C79_VOC_BRONZE: Draft[] = [
  { text: "What does enormous mean?", correct: "Very big", distractors: ["Very small", "Very fast", "Very cold"], explanation: "Enormous means very big.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does tiny mean?", correct: "Very small", distractors: ["Very big", "Very loud", "Very hot"], explanation: "Tiny means very small.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does ancient mean?", correct: "Very old", distractors: ["Very new", "Very young", "Very big"], explanation: "Ancient means very old.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does brave mean?", correct: "Not scared", distractors: ["Very scared", "Very weak", "Very shy"], explanation: "Brave means not scared.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does assist mean?", correct: "Help", distractors: ["Hinder", "Watch", "Leave"], explanation: "Assist means to help.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does delighted mean?", correct: "Very happy", distractors: ["Very sad", "Very angry", "Very tired"], explanation: "Delighted means very happy.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does rapid mean?", correct: "Very fast", distractors: ["Very slow", "Very late", "Very calm"], explanation: "Rapid means very fast.", ref: `${REF7.bronze}, vocabulary: word meaning` },
  { text: "What does silent mean?", correct: "Very quiet", distractors: ["Very noisy", "Very loud", "Very busy"], explanation: "Silent means very quiet.", ref: `${REF7.bronze}, vocabulary: word meaning` },
];

const C79_VOC_SILVER: Draft[] = [
  { text: "What is the opposite of brave?", correct: "Cowardly", distractors: ["Bold", "Fearless", "Mighty"], explanation: "Brave and cowardly are opposites.", ref: `${REF7.silver}, vocabulary: opposites` },
  { text: "What is the opposite of ancient?", correct: "Modern", distractors: ["Old", "Historic", "Rustic"], explanation: "Ancient and modern are opposites.", ref: `${REF7.silver}, vocabulary: opposites` },
  { text: "What is the opposite of enormous?", correct: "Tiny", distractors: ["Huge", "Large", "Grand"], explanation: "Enormous and tiny are opposites.", ref: `${REF7.silver}, vocabulary: opposites` },
  { text: "What is the opposite of noisy?", correct: "Silent", distractors: ["Loud", "Rowdy", "Boisterous"], explanation: "Noisy and silent are opposites.", ref: `${REF7.silver}, vocabulary: opposites` },
  { text: "Which word means the same as happy?", correct: "Joyful", distractors: ["Sad", "Moody", "Gloomy"], explanation: "Happy and joyful mean the same.", ref: `${REF7.silver}, vocabulary: synonyms` },
  { text: "Which word means the same as begin?", correct: "Commence", distractors: ["End", "Cease", "Conclude"], explanation: "Begin and commence mean the same.", ref: `${REF7.silver}, vocabulary: synonyms` },
  { text: "Which word means the same as help?", correct: "Assist", distractors: ["Hinder", "Refuse", "Ignore"], explanation: "Help and assist mean the same.", ref: `${REF7.silver}, vocabulary: synonyms` },
  { text: "Which word means the same as rich?", correct: "Wealthy", distractors: ["Poor", "Needy", "Broke"], explanation: "Rich and wealthy mean the same.", ref: `${REF7.silver}, vocabulary: synonyms` },
];

const C79_VOC_GOLD: Draft[] = [
  { text: "Which word means the same as huge?", correct: "Massive", distractors: ["Small", "Light", "Narrow"], explanation: "Huge and massive mean very big.", ref: `${REF7.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as quick?", correct: "Swift", distractors: ["Slow", "Steady", "Calm"], explanation: "Quick and swift mean fast.", ref: `${REF7.gold}, vocabulary: synonyms` },
  { text: "Which word means the same as clever?", correct: "Smart", distractors: ["Foolish", "Dull", "Slow"], explanation: "Clever and smart mean the same.", ref: `${REF7.gold}, vocabulary: synonyms` },
  { text: "What does generous mean?", correct: "Free with giving", distractors: ["Unwilling to share", "Very quiet", "Always angry"], explanation: "A generous person gives freely.", ref: `${REF7.gold}, vocabulary: word meaning` },
  { text: "What does unfriendly mean?", correct: "Not friendly", distractors: ["Very friendly", "Very helpful", "Very kind"], explanation: "Unfriendly means not friendly.", ref: `${REF7.gold}, vocabulary: word meaning` },
  { text: "What does dislike mean?", correct: "Not like", distractors: ["Like very much", "Love", "Admire"], explanation: "Dislike means not to like.", ref: `${REF7.gold}, vocabulary: word meaning` },
  { text: "Fill the gap: The tired boy ___ to the farm.", correct: "wandered", distractors: ["sprinted", "dashed", "raced"], explanation: "Wandered means walked without haste.", ref: `${REF7.gold}, vocabulary: word meaning` },
  { text: "Fill the gap: The market was full of ___ people.", correct: "cheerful", distractors: ["silent", "sleepy", "empty"], explanation: "Cheerful people are happy and merry.", ref: `${REF7.gold}, vocabulary: word meaning` },
];

const C79_FIG_BRONZE: Draft[] = [
  { text: "Finish the line: As busy as a ___", correct: "bee", distractors: ["cat", "snail", "fish"], explanation: "A bee is always very busy.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As light as a ___", correct: "feather", distractors: ["stone", "brick", "cart"], explanation: "A feather weighs almost nothing.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As strong as a ___", correct: "lion", distractors: ["hen", "rabbit", "ant"], explanation: "A lion is very strong.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As smooth as ___", correct: "silk", distractors: ["stone", "bark", "sand"], explanation: "Silk is very smooth.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As clear as ___", correct: "crystal", distractors: ["mud", "smoke", "darkness"], explanation: "Crystal is very clear.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As cold as ___", correct: "ice", distractors: ["pepper", "fire", "the sun"], explanation: "Ice is very cold.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As white as ___", correct: "snow", distractors: ["mud", "ash", "grass"], explanation: "Snow is very white.", ref: `${REF7.bronze}, figures: similes` },
  { text: "Finish the line: As black as ___", correct: "night", distractors: ["day", "snow", "milk"], explanation: "Night is very dark.", ref: `${REF7.bronze}, figures: similes` },
];

const C79_FIG_SILVER: Draft[] = [
  { text: "He eats like a ___.", correct: "pig", distractors: ["bird", "fish", "ant"], explanation: "Eats like a pig means eats very greedily.", ref: `${REF7.silver}, figures: similes` },
  { text: "She slept like a ___.", correct: "baby", distractors: ["lion", "owl", "fox"], explanation: "Slept like a baby means slept soundly.", ref: `${REF7.silver}, figures: similes` },
  { text: "He is as cunning as a ___.", correct: "fox", distractors: ["lion", "cow", "donkey"], explanation: "A fox is very cunning.", ref: `${REF7.silver}, figures: similes` },
  { text: "The thief ran like a ___ of the wind.", correct: "gust", distractors: ["drop", "stone", "leaf"], explanation: "Like a gust of wind means very fast.", ref: `${REF7.silver}, figures: similes` },
  { text: "Her words were sweet like ___.", correct: "honey", distractors: ["salt", "pepper", "vinegar"], explanation: "Sweet like honey means sweet to hear.", ref: `${REF7.silver}, figures: similes` },
  { text: "The crowd was as loud as ___.", correct: "thunder", distractors: ["a whisper", "a drizzle", "a breeze"], explanation: "Loud as thunder means very loud.", ref: `${REF7.silver}, figures: similes` },
  { text: "She is as graceful as a ___.", correct: "dancer", distractors: ["stone", "log", "chair"], explanation: "Graceful as a dancer means moving beautifully.", ref: `${REF7.silver}, figures: similes` },
  { text: "The runner was as swift as a ___.", correct: "cheetah", distractors: ["cow", "snail", "tortoise"], explanation: "Swift as a cheetah means very fast.", ref: `${REF7.silver}, figures: similes` },
];

const C79_FIG_GOLD: Draft[] = [
  { text: "What does spill the beans mean?", correct: "Tell a secret", distractors: ["Cook beans", "Drop beans", "Buy beans"], explanation: "To spill the beans is to tell a secret.", ref: `${REF7.gold}, figures: idioms` },
  { text: "What does a piece of cake mean?", correct: "Very easy", distractors: ["Very sweet", "Very hard", "Very costly"], explanation: "A piece of cake means a task is easy.", ref: `${REF7.gold}, figures: idioms` },
  { text: "What does it is raining cats and dogs mean?", correct: "It is raining heavily", distractors: ["Cats are falling", "Dogs are falling", "It is sunny"], explanation: "The idiom means a heavy rain.", ref: `${REF7.gold}, figures: idioms` },
  { text: "What does break a leg mean?", correct: "Good luck", distractors: ["Be careful", "Run fast", "Sit down"], explanation: "Break a leg is said to wish good luck.", ref: `${REF7.gold}, figures: idioms` },
  { text: "What does once in a blue moon mean?", correct: "Very rarely", distractors: ["Very often", "Every month", "Every week"], explanation: "A blue moon is rare. The idiom means rarely.", ref: `${REF7.gold}, figures: idioms` },
  { text: "What does better late than never mean?", correct: "Doing it late is better than not", distractors: ["Never do it at all", "Do it quickly", "Late is never good"], explanation: "Even late is better than not doing it.", ref: `${REF7.gold}, figures: idioms` },
  { text: "In the line, the sun smiled at the village, the sun is ___.", correct: "personified", distractors: ["a simile", "an idiom", "a metaphor"], explanation: "The sun is given a human action.", ref: `${REF7.gold}, figures: personification` },
  { text: "In the line, the wind whispered through the trees, the wind is ___.", correct: "personified", distractors: ["a simile", "an idiom", "a rhyme"], explanation: "The wind is given a human action.", ref: `${REF7.gold}, figures: personification` },
];

const C79_WRI_BRONZE: Draft[] = [
  { text: "Which order is right?", correct: "The goat eats grass.", distractors: ["Goat the eats grass.", "Grass the eats goat.", "Eats grass goat the."], explanation: "A sentence starts with a capital letter.", ref: `${REF7.bronze}, writing: word order` },
  { text: "Which order works?", correct: "My father is strong.", distractors: ["Father my strong is.", "Is strong father my.", "Strong my father is."], explanation: "Start with the naming part.", ref: `${REF7.bronze}, writing: word order` },
  { text: "Which group of words is a question?", correct: "Where is the market?", distractors: ["The market is big.", "The market", "Is big the market."], explanation: "A question asks and ends with a question mark.", ref: `${REF7.bronze}, writing: questions` },
  { text: "Which group of words is a command?", correct: "Shut the door.", distractors: ["The door is shut.", "Where is the door?", "The door."], explanation: "A command tells someone to act.", ref: `${REF7.bronze}, writing: sentence types` },
  { text: "Which sentence fits a boy and a ball?", correct: "The boy kicks the ball.", distractors: ["The girl reads a book.", "The goat eats grass.", "The sun is hot."], explanation: "The sentence names the boy and the ball.", ref: `${REF7.bronze}, writing: sentences` },
  { text: "Put in order: play we football", correct: "We play football.", distractors: ["Play we football.", "Football we play.", "We football play."], explanation: "The naming word comes first.", ref: `${REF7.bronze}, writing: word order` },
  { text: "Which group of words is a statement?", correct: "I like rice and beans.", distractors: ["I like rice and beans", "Like I rice and beans.", "And I rice beans like."], explanation: "A statement ends with a full stop.", ref: `${REF7.bronze}, writing: sentence types` },
  { text: "Which shows strong feeling?", correct: "What a goal!", distractors: ["What a goal.", "What a goal?", "What a goal,"], explanation: "An exclamation shows strong feeling.", ref: `${REF7.bronze}, writing: sentence types` },
];

const C79_WRI_SILVER: Draft[] = [
  { text: "Fix: ran fast I", correct: "I ran fast.", distractors: ["Ran fast I.", "Fast I ran.", "I fast ran."], explanation: "A sentence starts with a capital letter.", ref: `${REF7.silver}, writing: word order` },
  { text: "Join the two ideas: It rained. We stayed indoors.", correct: "It rained, so we stayed indoors.", distractors: ["It rained and indoors we.", "So we stayed it rained, we.", "We rained, so it indoors stayed."], explanation: "So joins a cause and its effect.", ref: `${REF7.silver}, writing: joining words` },
  { text: "Join the two ideas: He was hungry. He ate the food.", correct: "He was hungry, so he ate the food.", distractors: ["He ate hungry, so he was food.", "Hungry he was the food ate.", "So he was hungry and ate indoors."], explanation: "So joins cause and effect.", ref: `${REF7.silver}, writing: joining words` },
  { text: "Which sentence shows a question?", correct: "How are you today?", distractors: ["I am fine today.", "You are a girl.", "It is sunny out."], explanation: "A question asks something and ends with a question mark.", ref: `${REF7.silver}, writing: questions` },
  { text: "Which sentence is polite?", correct: "Please help me with my bag.", distractors: ["Help me now.", "Give me that bag.", "I want the bag now."], explanation: "Please makes a request polite.", ref: `${REF7.silver}, writing: polite speech` },
  { text: "Fix the order: to the farm went we early", correct: "We went to the farm early.", distractors: ["Went we to the farm early.", "To the farm we early went.", "Early to the farm we went to."], explanation: "A sentence starts with a capital letter.", ref: `${REF7.silver}, writing: word order` },
  { text: "Which sentence is about the future?", correct: "We will visit Kano next week.", distractors: ["We visited Kano last week.", "We visit Kano every week.", "We are visiting Kano now."], explanation: "Will shows the future.", ref: `${REF7.silver}, writing: tenses in writing` },
  { text: "Which sentence is a question?", correct: "Where is the nearest hospital?", distractors: ["The hospital is near.", "Near the hospital.", "Is near the hospital."], explanation: "Where is asks a question.", ref: `${REF7.silver}, writing: questions` },
];

const C79_WRI_GOLD: Draft[] = [
  { text: "Join the two ideas: It was hot. We drank water.", correct: "It was hot, so we drank water.", distractors: ["It was hot but we drank water.", "We drank water, so it was hot.", "Hot it was, but water we drank."], explanation: "So joins cause and effect.", ref: `${REF7.gold}, writing: joining words` },
  { text: "Join with because: He shouted. The crowd clapped.", correct: "The crowd clapped because he shouted.", distractors: ["Because he shouted clapped the crowd.", "He shouted because the crowd clapped.", "Clapped the crowd because shouted he."], explanation: "Because gives the reason something happened.", ref: `${REF7.gold}, writing: joining words` },
  { text: "Which order makes a good paragraph?", correct: "Rain fell. The ground got wet. Farmers smiled.", distractors: ["Farmers smiled. Rain fell. The ground.", "The ground got wet. Rain. Farmers smiled.", "Rain fell smile."], explanation: "A good paragraph flows in order.", ref: `${REF7.gold}, writing: paragraphs` },
  { text: "Which opens a letter to a friend?", correct: "Dear Bola, how are you?", distractors: ["Dear Sir, I am writing to apply.", "Dear Bola, see you well.", "Dear friends how are you?"], explanation: "Dear names the friend. How are you is friendly.", ref: `${REF7.gold}, writing: letters` },
  { text: "Which sentence is a fact?", correct: "Nigeria is in West Africa.", distractors: ["I think rice is tasty.", "My favourite fruit is mango.", "The sky is beautiful today."], explanation: "A fact can be proved true.", ref: `${REF7.gold}, writing: facts and opinions` },
  { text: "Which tells what you think?", correct: "Yam porridge is the best meal.", distractors: ["Yam porridge has yams.", "Yam porridge is cooked in pots.", "Yam porridge is eaten at noon."], explanation: "An opinion cannot be proved right or wrong.", ref: `${REF7.gold}, writing: facts and opinions` },
  { text: "Fix the order: crowded was market the", correct: "The market was crowded.", distractors: ["The market crowded was.", "Market the was crowded.", "Crowded was the market."], explanation: "A sentence starts with a capital letter.", ref: `${REF7.gold}, writing: word order` },
  { text: "Fix the order: people mosque the prayed at", correct: "People prayed at the mosque.", distractors: ["Went people to the mosque for prayers.", "For prayers people went the to mosque.", "To the mosque for prayers went people."], explanation: "A sentence starts with a capital letter.", ref: `${REF7.gold}, writing: word order` },
];
// ===========================================================================
// Builders and writer
// ===========================================================================
function topic(prefix: string, id: string, levels: Record<Level, Draft[]>): TopicDef {
  return { id, prefix, levels };
}

const BAND_BUILDERS: Record<string, Record<string, TopicDef>> = {
  "4-6": {
    comprehension: topic("COM", "comprehension", { bronze: C46_COM_BRONZE, silver: C46_COM_SILVER, gold: C46_COM_GOLD }),
    grammar: topic("GRA", "grammar", { bronze: C46_GRA_BRONZE, silver: C46_GRA_SILVER, gold: C46_GRA_GOLD }),
    tenses: topic("TEN", "tenses", { bronze: C46_TEN_BRONZE, silver: C46_TEN_SILVER, gold: C46_TEN_GOLD }),
    punctuation: topic("PUN", "punctuation", { bronze: C46_PUN_BRONZE, silver: C46_PUN_SILVER, gold: C46_PUN_GOLD }),
    spelling: topic("SPE", "spelling", { bronze: C46_SPE_BRONZE, silver: C46_SPE_SILVER, gold: C46_SPE_GOLD }),
    vocabulary: topic("VOC", "vocabulary", { bronze: C46_VOC_BRONZE, silver: C46_VOC_SILVER, gold: C46_VOC_GOLD }),
    figures: topic("FIG", "figures", { bronze: C46_FIG_BRONZE, silver: C46_FIG_SILVER, gold: C46_FIG_GOLD }),
    writing: topic("WRI", "writing", { bronze: C46_WRI_BRONZE, silver: C46_WRI_SILVER, gold: C46_WRI_GOLD }),
  },
  "7-9": {
    comprehension: topic("COM", "comprehension", { bronze: C79_COM_BRONZE, silver: C79_COM_SILVER, gold: C79_COM_GOLD }),
    grammar: topic("GRA", "grammar", { bronze: C79_GRA_BRONZE, silver: C79_GRA_SILVER, gold: C79_GRA_GOLD }),
    tenses: topic("TEN", "tenses", { bronze: C79_TEN_BRONZE, silver: C79_TEN_SILVER, gold: C79_TEN_GOLD }),
    punctuation: topic("PUN", "punctuation", { bronze: C79_PUN_BRONZE, silver: C79_PUN_SILVER, gold: C79_PUN_GOLD }),
    spelling: topic("SPE", "spelling", { bronze: C79_SPE_BRONZE, silver: C79_SPE_SILVER, gold: C79_SPE_GOLD }),
    vocabulary: topic("VOC", "vocabulary", { bronze: C79_VOC_BRONZE, silver: C79_VOC_SILVER, gold: C79_VOC_GOLD }),
    figures: topic("FIG", "figures", { bronze: C79_FIG_BRONZE, silver: C79_FIG_SILVER, gold: C79_FIG_GOLD }),
    writing: topic("WRI", "writing", { bronze: C79_WRI_BRONZE, silver: C79_WRI_SILVER, gold: C79_WRI_GOLD }),
  },
};

let errors = 0;
for (const band of BANDS) {
  const OUT = path.resolve(`src/server/data/questions/${band.id}/english`);
  mkdirSync(OUT, { recursive: true });
  const builders = BAND_BUILDERS[band.id]!;
  for (const topicId of Object.keys(builders)) {
    const builder = builders[topicId]!;
    const topicDef = TOPICS.find((t) => t.id === builder.id);
    if (!topicDef) throw new Error(`unknown topic ${builder.id}`);
    const questions = toQuestions(band.token, band.id, builder.id, builder.prefix, builder.levels);
    const file: TopicFile = { band: band.id, subject: "english", topic: builder.id as never, title: topicDef.label, questions };
    const issues = validateTopicFile(file, {});
    const bad = issues.filter((i) => i.severity === "error");
    if (!isClean(issues)) {
      errors += bad.length;
      console.error(`\n${band.id}/${builder.id}: ${bad.length} errors`);
      for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
    } else {
      console.log(`${band.id}/${builder.id}: ${questions.length} questions clean`);
    }
    writeFileSync(path.join(OUT, `${builder.id}.json`), JSON.stringify(file, null, 2) + "\n");
  }
}

if (errors > 0) process.exitCode = 1;
