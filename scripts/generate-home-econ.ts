import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Home Economics starter banks for all three age bands. Written by hand, checked by the validator.
 * Eight questions per level, twenty four per topic, two hundred and sixteen in total.
 * The live game never calls an AI service.
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
const SUBJECT_PREFIX = "HEC";
const AUTHOR = "AI draft v1";

const TOPIC_PHRASE: Record<string, string> = {
  nutrition: "food groups and eating well",
  "home-care": "keeping the home clean and safe",
  "food-cook": "cooking tools, steps and recipes",
};

interface BandBank {
  id: string;
  refLevel: string;
  topics: Record<string, Record<Level, Draft[]>>;
}

function refs(refLevel: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [topicId, phrase] of Object.entries(TOPIC_PHRASE)) {
    out[topicId] = `NERDC ${refLevel} Home Economics, ${phrase}`;
  }
  return out;
}

const REFS_4_6 = refs("Nursery 2");
const REFS_7_9 = refs("Primary 3");
const REFS_10_12 = refs("Primary 5");

const B_NUT = REFS_4_6["nutrition"]!;
const B_HOM = REFS_4_6["home-care"]!;
const B_COO = REFS_4_6["food-cook"]!;
const E_NUT = REFS_7_9["nutrition"]!;
const E_HOM = REFS_7_9["home-care"]!;
const E_COO = REFS_7_9["food-cook"]!;
const A_NUT = REFS_10_12["nutrition"]!;
const A_HOM = REFS_10_12["home-care"]!;
const A_COO = REFS_10_12["food-cook"]!;

const NUT_4_6_BRONZE: Draft[] = [
  {
    text: "Which one is a fruit?",
    correct: "Mango",
    distractors: ["Rice", "Beans", "Garri"],
    explanation: "Mango is a sweet fruit we eat.",
    ref: B_NUT,
  },
  {
    text: "What do eggs give us?",
    correct: "Protein",
    distractors: ["Sugar", "Salt", "Starch"],
    explanation: "Eggs give our bodies protein to grow.",
    ref: B_NUT,
  },
  {
    text: "What do we drink for strong bones?",
    correct: "Milk",
    distractors: ["Coke", "Malt", "Yoghurt drink"],
    explanation: "Milk has calcium for strong bones.",
    ref: B_NUT,
  },
  {
    text: "Which is a leafy green?",
    correct: "Efo",
    distractors: ["Rice", "Yam", "Fish"],
    explanation: "Efo is a leafy green vegetable.",
    ref: B_NUT,
  },
  {
    text: "Which food gives us strength?",
    correct: "Yam",
    distractors: ["Water", "Soap", "Sand"],
    explanation: "Yam gives our bodies power to play.",
    ref: B_NUT,
  },
  {
    text: "How often should we eat?",
    correct: "Three times",
    distractors: ["Once a day", "Every night only", "Never"],
    explanation: "Eating three times a day keeps us strong.",
    ref: B_NUT,
  },
  {
    text: "Which drink is best for our bodies?",
    correct: "Water",
    distractors: ["Coke", "Malt", "Palm wine"],
    explanation: "Water keeps our bodies cool and clean.",
    ref: B_NUT,
  },
  {
    text: "Why do we wash our hands before we eat?",
    correct: "To keep germs away",
    distractors: ["To get warm", "To look nice", "To save time"],
    explanation: "Clean hands keep dirt and germs off our food.",
    ref: B_NUT,
  },
];

const NUT_4_6_SILVER: Draft[] = [
  {
    text: "Why must we eat each day?",
    correct: "To grow and stay strong",
    distractors: ["To sleep well", "To get tall only", "To look brown"],
    explanation: "Food helps our bodies grow and stay strong.",
    ref: B_NUT,
  },
  {
    text: "Which food builds our muscles?",
    correct: "Beans",
    distractors: ["Sugar", "Coke", "Salt"],
    explanation: "Beans are full of protein for our muscles.",
    ref: B_NUT,
  },
  {
    text: "Which food helps us fight germs?",
    correct: "Oranges",
    distractors: ["Rice", "Yam", "Garri"],
    explanation: "Oranges have vitamins that fight germs.",
    ref: B_NUT,
  },
  {
    text: "How much water should we drink?",
    correct: "Lots each day",
    distractors: ["A little each week", "None at all", "Only at night"],
    explanation: "Water keeps our bodies cool and clean.",
    ref: B_NUT,
  },
  {
    text: "Why should we chew our food well?",
    correct: "To help our stomach work well",
    distractors: ["To taste it more", "To finish faster", "To look polite"],
    explanation: "Chewing well helps the stomach break food down.",
    ref: B_NUT,
  },
  {
    text: "Which snack is healthier?",
    correct: "Groundnuts",
    distractors: ["Sweets", "Biscuits", "Candy"],
    explanation: "Groundnuts give us protein and power.",
    ref: B_NUT,
  },
  {
    text: "What does our body need to grow?",
    correct: "Good food",
    distractors: ["Just water", "Only sleep", "Only meat"],
    explanation: "Our body needs good food to grow.",
    ref: B_NUT,
  },
  {
    text: "Why is it bad to skip meals?",
    correct: "We get weak and tired",
    distractors: ["We grow faster", "We never sleep", "We get taller"],
    explanation: "Missing meals makes us weak and tired.",
    ref: B_NUT,
  },
];

const NUT_4_6_GOLD: Draft[] = [
  {
    text: "You are thirsty. What should you drink?",
    correct: "Water",
    distractors: ["Palm wine", "Coke", "Coffee"],
    explanation: "Water is the best drink when you are thirsty.",
    ref: B_NUT,
  },
  {
    text: "Why should we eat fruits daily?",
    correct: "They have vitamins",
    distractors: ["They are cheap", "They are sweet", "They are big"],
    explanation: "Fruits give us vitamins to stay healthy.",
    ref: B_NUT,
  },
  {
    text: "Your friend only eats rice. What should you tell them?",
    correct: "Eat beans and fruits too",
    distractors: ["Rice is all you need", "Stop eating rice", "Eat only fruits"],
    explanation: "A mix of foods gives the body all it needs.",
    ref: B_NUT,
  },
  {
    text: "Which plate is the healthiest?",
    correct: "Rice with vegetables",
    distractors: ["Rice only", "Bread and soda", "Yam and oil only"],
    explanation: "A plate with grains and greens is best.",
    ref: B_NUT,
  },
  {
    text: "Why must girls and boys eat well?",
    correct: "To grow strong and healthy",
    distractors: ["To win races", "To sleep longer", "To talk more"],
    explanation: "Growing bodies need good food each day.",
    ref: B_NUT,
  },
  {
    text: "What do you do after meals?",
    correct: "Wash your plate",
    distractors: ["Sleep at once", "Run outside", "Skip washing"],
    explanation: "Washing dishes after meals keeps germs away.",
    ref: B_NUT,
  },
  {
    text: "Which food comes from the farm?",
    correct: "Yam",
    distractors: ["Biscuits", "Sweets", "Coke"],
    explanation: "Yam is grown by farmers on the farm.",
    ref: B_NUT,
  },
  {
    text: "Why does a home share meals?",
    correct: "It brings the family close",
    distractors: ["It saves money only", "It is just a game", "It fills the pot"],
    explanation: "Sharing meals keeps the family close and happy.",
    ref: B_NUT,
  },
];

// Band bank definitions are built at the end of the file once all drafts exist.


const HOM_4_6_BRONZE: Draft[] = [
  {
    text: "What do we use to sweep the floor?",
    correct: "A broom",
    distractors: ["A cup", "A spoon", "A fork"],
    explanation: "A broom sweeps dirt off the floor.",
    ref: B_HOM,
  },
  {
    text: "Why do we mop the floor?",
    correct: "To keep it clean",
    distractors: ["To make it wet", "To paint it", "To dry it"],
    explanation: "Mopping removes dirt and dust from the floor.",
    ref: B_HOM,
  },
  {
    text: "Where do we keep clean clothes?",
    correct: "In a wardrobe",
    distractors: ["In the bin", "On the floor", "Outside"],
    explanation: "Clean clothes stay safe in a wardrobe.",
    ref: B_HOM,
  },
  {
    text: "What must we do with plates?",
    correct: "Wash them",
    distractors: ["Leave them", "Throw them", "Sell them"],
    explanation: "Dirty plates must be washed with soap and water.",
    ref: B_HOM,
  },
  {
    text: "Who can touch a hot stove?",
    correct: "Only grown-ups",
    distractors: ["Children", "Pets", "Friends"],
    explanation: "Hot stoves can burn, so only grown-ups use them.",
    ref: B_HOM,
  },
  {
    text: "What do we use to wash our hands?",
    correct: "Soap and water",
    distractors: ["Dust", "Oil", "Sand"],
    explanation: "Soap and water keep our hands clean.",
    ref: B_HOM,
  },
  {
    text: "Why must we keep our room tidy?",
    correct: "So nobody trips",
    distractors: ["So it stays big", "So it looks new", "So it smells nice"],
    explanation: "A tidy room stops falls and bumps.",
    ref: B_HOM,
  },
  {
    text: "Where should we put rubbish?",
    correct: "In the bin",
    distractors: ["On the road", "Under the mat", "In the sink"],
    explanation: "Rubbish in the bin keeps flies away.",
    ref: B_HOM,
  },
];

const HOM_4_6_SILVER: Draft[] = [
  {
    text: "Why wash hands before meals?",
    correct: "To keep germs away",
    distractors: ["To look smart", "To get warm", "To smell nice"],
    explanation: "Hands carry germs, so we wash them before meals.",
    ref: B_HOM,
  },
  {
    text: "A knife is on the floor. What should you do?",
    correct: "Tell a grown-up",
    distractors: ["Pick it up fast", "Play with it", "Kick it away"],
    explanation: "Sharp things can cut, so tell a grown-up.",
    ref: B_HOM,
  },
  {
    text: "Why must we not play with matches?",
    correct: "They can start fires",
    distractors: ["They are too loud", "They are too big", "They cost money"],
    explanation: "Matches can start fires and burn the home.",
    ref: B_HOM,
  },
  {
    text: "How often should we sweep the house?",
    correct: "Every day",
    distractors: ["Once a year", "Never", "Once a month"],
    explanation: "Daily sweeping keeps dust and germs away.",
    ref: B_HOM,
  },
  {
    text: "Where do we keep drugs?",
    correct: "High up, away from children",
    distractors: ["On the floor", "In the cooking pot", "In the fridge"],
    explanation: "Drugs can harm children, so keep them high up.",
    ref: B_HOM,
  },
  {
    text: "Why do we clean as we cook?",
    correct: "To stop germs spreading",
    distractors: ["To fill the sink", "To waste time", "To use more water"],
    explanation: "Cleaning as you cook keeps germs from food.",
    ref: B_HOM,
  },
  {
    text: "Where do we throw tissues?",
    correct: "In the bin",
    distractors: ["On the floor", "In the toilet", "Out the window"],
    explanation: "Tissues carry germs, so they go in the bin.",
    ref: B_HOM,
  },
  {
    text: "Why can a wet floor harm us?",
    correct: "We may slip and fall",
    distractors: ["It looks bad", "It smells bad", "It cools the room"],
    explanation: "Wet floors are slippery and can cause falls.",
    ref: B_HOM,
  },
];

const HOM_4_6_GOLD: Draft[] = [
  {
    text: "A glass breaks in the kitchen. What should you do?",
    correct: "Call a grown-up and keep away",
    distractors: ["Pick up the pieces", "Sweep it with bare hands", "Step over it"],
    explanation: "Broken glass can cut, so keep away and call help.",
    ref: B_HOM,
  },
  {
    text: "Why can a gas cooker burn?",
    correct: "It can start a fire",
    distractors: ["It uses too much salt", "It is too cold", "It is too heavy"],
    explanation: "Gas can leak and burn, so children stay away.",
    ref: B_HOM,
  },
  {
    text: "Mum is cooking. Where should you play?",
    correct: "Away from the stove",
    distractors: ["Right beside her", "Under the pot", "On the counter"],
    explanation: "Hot pots and oil can burn children.",
    ref: B_HOM,
  },
  {
    text: "Why do we not touch plugs with wet hands?",
    correct: "Water conducts electricity",
    distractors: ["They are noisy", "They are cold", "They are sticky"],
    explanation: "Water carries current into our bodies.",
    ref: B_HOM,
  },
  {
    text: "Water is spilt on the floor. What do you do?",
    correct: "Wipe it up at once",
    distractors: ["Step on it", "Walk over it fast", "Leave it there"],
    explanation: "Wiping spills quickly stops slips and falls.",
    ref: B_HOM,
  },
  {
    text: "Why should we not climb high shelves?",
    correct: "You may fall and get hurt",
    distractors: ["Shelves are sticky", "It is too quiet", "It is too dusty"],
    explanation: "Climbing high shelves can make you fall.",
    ref: B_HOM,
  },
  {
    text: "What should we check before we sleep?",
    correct: "Doors and lights are off",
    distractors: ["The TV is on", "The tap is running", "The window is open"],
    explanation: "Checking doors and lights keeps the home safe.",
    ref: B_HOM,
  },
  {
    text: "Why must kids stay away from hot pots?",
    correct: "They can burn you",
    distractors: ["They are too cold", "They are sticky", "They are too heavy"],
    explanation: "Hot pots can burn, so kids keep their distance.",
    ref: B_HOM,
  },
];

const COO_4_6_BRONZE: Draft[] = [
  {
    text: "What do we use to cut bread?",
    correct: "A knife",
    distractors: ["A spoon", "A fork", "A cup"],
    explanation: "A knife cuts bread into slices.",
    ref: B_COO,
  },
  {
    text: "What do we boil water in?",
    correct: "A kettle",
    distractors: ["A plate", "A bucket", "A glass"],
    explanation: "A kettle safely boils water for us.",
    ref: B_COO,
  },
  {
    text: "Why do we wash leaves?",
    correct: "To remove dirt",
    distractors: ["To add salt", "To cool them", "To make them soft"],
    explanation: "Washing removes dirt and tiny bugs.",
    ref: B_COO,
  },
  {
    text: "What do we stir stew with?",
    correct: "A spoon",
    distractors: ["A knife", "A fork", "A bottle"],
    explanation: "A spoon stirs stew without splashing.",
    ref: B_COO,
  },
  {
    text: "Who may fry things?",
    correct: "Grown-ups only",
    distractors: ["Little children", "Nobody", "Pets"],
    explanation: "Hot oil can burn, so only grown-ups fry.",
    ref: B_COO,
  },
  {
    text: "What do we cook rice in?",
    correct: "A pot",
    distractors: ["A plate", "A cup", "A bowl"],
    explanation: "Rice cooks well in a pot with water.",
    ref: B_COO,
  },
  {
    text: "What do we do after meals?",
    correct: "Wash the pot",
    distractors: ["Leave it dirty", "Hide the pot", "Throw it away"],
    explanation: "Washing pots after cooking keeps them clean.",
    ref: B_COO,
  },
  {
    text: "Which meal do we eat at night?",
    correct: "Dinner",
    distractors: ["Breakfast", "Lunch", "Snacks"],
    explanation: "Dinner is the meal we eat at night.",
    ref: B_COO,
  },
];

const COO_4_6_SILVER: Draft[] = [
  {
    text: "Why do we cook food well?",
    correct: "To kill germs",
    distractors: ["To waste it", "To cool it", "To burn it"],
    explanation: "Well cooked food has no harmful germs.",
    ref: B_COO,
  },
  {
    text: "What happens if oil is too hot?",
    correct: "It can burn",
    distractors: ["It freezes", "It turns sweet", "It gets cold"],
    explanation: "Very hot oil can catch fire and burn food.",
    ref: B_COO,
  },
  {
    text: "Why should we not leave the stove on?",
    correct: "It may start a fire",
    distractors: ["It saves gas", "It makes noise", "It cools the room"],
    explanation: "A stove left on can burn the house.",
    ref: B_COO,
  },
  {
    text: "What is the first step in cooking?",
    correct: "Wash your hands",
    distractors: ["Put on music", "Set the table", "Open the fridge"],
    explanation: "Clean hands stop germs from reaching food.",
    ref: B_COO,
  },
  {
    text: "Why do we add salt to food?",
    correct: "To make it taste nice",
    distractors: ["To keep it raw", "To cool it", "To make it sour"],
    explanation: "A little salt brings out the flavour of food.",
    ref: B_COO,
  },
  {
    text: "When is it safe to add fish to the pot?",
    correct: "When the water boils",
    distractors: ["When it is cold", "When the pot is dry", "Before the fire is lit"],
    explanation: "Boiling water cooks fish safely.",
    ref: B_COO,
  },
  {
    text: "What should you do with a sharp knife?",
    correct: "Keep it away from children",
    distractors: ["Leave it on the floor", "Use it as a toy", "Hide it in the bin"],
    explanation: "Sharp knives can cut children.",
    ref: B_COO,
  },
  {
    text: "Why do we taste food while cooking?",
    correct: "To check the flavour",
    distractors: ["To finish fast", "To cool it", "To add more water"],
    explanation: "Tasting checks if the seasoning is right.",
    ref: B_COO,
  },
];

const COO_4_6_GOLD: Draft[] = [
  {
    text: "You want to fry puff-puff. What must be hot first?",
    correct: "The oil",
    distractors: ["The plate", "The flour", "The table"],
    explanation: "Hot oil fries puff-puff evenly and crisply.",
    ref: B_COO,
  },
  {
    text: "Why must a pot not be too full?",
    correct: "It can boil over",
    distractors: ["It saves gas", "It cooks faster", "It keeps cool"],
    explanation: "A full pot boils over and spills on the fire.",
    ref: B_COO,
  },
  {
    text: "A child wants the knife. What should you do?",
    correct: "Say no and tell a grown-up",
    distractors: ["Give it to him", "Let him try", "Hide it and laugh"],
    explanation: "Knives can hurt children, so they stay away.",
    ref: B_COO,
  },
  {
    text: "How do we know when beans are soft?",
    correct: "They crush easily",
    distractors: ["They are cold", "They are green", "They float"],
    explanation: "Soft beans crush easily when pressed.",
    ref: B_COO,
  },
  {
    text: "Why is it risky to fry in wet oil?",
    correct: "It can splash and burn",
    distractors: ["It tastes sweet", "It cools fast", "It turns green"],
    explanation: "Water in hot oil splashes and can burn you.",
    ref: B_COO,
  },
  {
    text: "Mum says dinner is near. What should you do?",
    correct: "Stay away from the stove",
    distractors: ["Run to the stove", "Open the oven", "Touch the pot"],
    explanation: "Staying back keeps you safe from heat and steam.",
    ref: B_COO,
  },
  {
    text: "What do we do with extra food?",
    correct: "Keep it covered in the fridge",
    distractors: ["Leave it on the table", "Throw it in the bin", "Feed the dog"],
    explanation: "Covered leftovers in the fridge keep longer.",
    ref: B_COO,
  },
  {
    text: "Why should we cook in a clean kitchen?",
    correct: "So germs do not reach our food",
    distractors: ["So we can sing", "So the pot stays shiny", "So the cat is happy"],
    explanation: "A clean kitchen stops germs from reaching food.",
    ref: B_COO,
  },
];

const NUT_7_9_BRONZE: Draft[] = [
  {
    text: "Which food group do beans belong to?",
    correct: "Protein foods",
    distractors: ["Starchy foods", "Fats and oils", "Sugary foods"],
    explanation: "Beans are rich in protein, which builds our body.",
    ref: E_NUT,
  },
  {
    text: "Which of these is rich in vitamin C?",
    correct: "Oranges",
    distractors: ["Rice", "Yam", "Bread"],
    explanation: "Oranges are a good source of vitamin C.",
    ref: E_NUT,
  },
  {
    text: "What do yam and rice give us?",
    correct: "Energy to play and learn",
    distractors: ["Vitamins only", "Iron only", "Calcium only"],
    explanation: "Yam and rice are starchy foods that give energy.",
    ref: E_NUT,
  },
  {
    text: "How many food groups are there?",
    correct: "Three basic groups",
    distractors: ["One group", "Two groups", "Ten groups"],
    explanation: "Body-building, energy-giving and protective foods are the three groups.",
    ref: E_NUT,
  },
  {
    text: "Which food keeps us from falling sick?",
    correct: "Fruits and vegetables",
    distractors: ["Sugar and salt", "Oil and butter", "Sweets and biscuits"],
    explanation: "Fruits and vegetables protect our bodies from illness.",
    ref: E_NUT,
  },
  {
    text: "Why should we not eat too much sugar?",
    correct: "It rots our teeth",
    distractors: ["It makes us tall", "It helps us run", "It builds muscles"],
    explanation: "Too much sugar causes tooth decay and weight gain.",
    ref: E_NUT,
  },
  {
    text: "Which drink is best for us?",
    correct: "Water",
    distractors: ["Fizzy drinks", "Palm wine", "Beer"],
    explanation: "Water is the best and cheapest drink for our bodies.",
    ref: E_NUT,
  },
  {
    text: "What does milk do for us?",
    correct: "Makes bones and teeth strong",
    distractors: ["Makes us sleepy", "Gives us sugar", "Makes us cough"],
    explanation: "Milk has calcium for strong bones and teeth.",
    ref: E_NUT,
  },
];

const NUT_7_9_SILVER: Draft[] = [
  {
    text: "Why should we eat a balanced diet?",
    correct: "To get all nutrients",
    distractors: ["To look rich", "To eat less", "To save money"],
    explanation: "A balanced diet gives the body every nutrient it needs.",
    ref: E_NUT,
  },
  {
    text: "Which meal gives us the best start to the day?",
    correct: "Breakfast",
    distractors: ["Lunch", "Dinner", "Supper"],
    explanation: "Breakfast gives us energy and focus for the day.",
    ref: E_NUT,
  },
  {
    text: "Why is fish a good food for children?",
    correct: "It has protein for growth",
    distractors: ["It is sweet", "It is cheap only", "It fills the tummy"],
    explanation: "Fish protein helps children grow and stay strong.",
    ref: E_NUT,
  },
  {
    text: "What happens when we skip meals often?",
    correct: "We become weak and tired",
    distractors: ["We gain weight", "We grow faster", "We become stronger"],
    explanation: "Skipping meals deprives the body of energy and nutrients.",
    ref: E_NUT,
  },
  {
    text: "Which is a better snack than sweets?",
    correct: "Groundnuts",
    distractors: ["Cake", "Chocolate", "Biscuits"],
    explanation: "Groundnuts give protein instead of empty sugar.",
    ref: E_NUT,
  },
  {
    text: "Why should we eat fruits instead of drinking juice?",
    correct: "Fruits have more fibre",
    distractors: ["Juice is too cheap", "Juice is too salty", "Fruits have no taste"],
    explanation: "Whole fruits give fibre and less sugar than juice.",
    ref: E_NUT,
  },
  {
    text: "How does fixed meal time help us?",
    correct: "It keeps our energy steady",
    distractors: ["It makes us sleepy", "It saves water", "It improves taste"],
    explanation: "Regular meals keep our blood sugar steady and mood good.",
    ref: E_NUT,
  },
  {
    text: "Why do we need iron in our diet?",
    correct: "It builds healthy blood",
    distractors: ["It makes bones white", "It helps us sleep", "It cleans our skin"],
    explanation: "Iron helps the body make blood and stops weakness.",
    ref: E_NUT,
  },
];

const NUT_7_9_GOLD: Draft[] = [
  {
    text: "Your friend eats only noodles daily. What is wrong?",
    correct: "Noodles alone cannot supply all nutrients",
    distractors: ["Noodles are too expensive", "Noodles make people cough", "Noodles must be eaten at night"],
    explanation: "A single food cannot supply every nutrient the body needs.",
    ref: E_NUT,
  },
  {
    text: "Why are local foods like beans and yam a good choice?",
    correct: "They are cheap and nutritious",
    distractors: ["They look nice", "They are imported", "They never spoil"],
    explanation: "Local foods are affordable and full of good nutrients.",
    ref: E_NUT,
  },
  {
    text: "A child is always tired and pale. Which food may help?",
    correct: "Beans and meat for iron",
    distractors: ["Sugar for energy", "Water for thirst", "Salt for taste"],
    explanation: "Tiredness and paleness can be signs of low iron.",
    ref: E_NUT,
  },
  {
    text: "Why should children drink milk or eat fish daily?",
    correct: "For strong bones, teeth and growth",
    distractors: ["For shiny hair only", "To sleep longer", "To talk more"],
    explanation: "Milk and fish supply calcium and protein for growing bodies.",
    ref: E_NUT,
  },
  {
    text: "How can a home eat well on a small budget?",
    correct: "Buy beans, vegetables and seasonal fruits",
    distractors: ["Buy sweets and drinks", "Buy only imported food", "Skip breakfast daily"],
    explanation: "Beans and seasonal produce give nutrients at low cost.",
    ref: E_NUT,
  },
  {
    text: "Why is water better than soft drinks?",
    correct: "It hydrates without sugar",
    distractors: ["It tastes sweeter", "It is colder", "It has more gas"],
    explanation: "Water rehydrates the body with no sugar or additives.",
    ref: E_NUT,
  },
  {
    text: "What may happen if a child never eats greens?",
    correct: "The child may fall sick often",
    distractors: ["The child will grow faster", "The child will sleep more", "Nothing at all"],
    explanation: "Greens supply vitamins and fibre that protect health.",
    ref: E_NUT,
  },
  {
    text: "A woman is pregnant. Which nutrient does she need more of?",
    correct: "Folic acid and iron",
    distractors: ["Only sugar", "Only salt", "Only fat"],
    explanation: "Pregnant women need extra iron and folate for the baby.",
    ref: E_NUT,
  },
];

const HOM_7_9_BRONZE: Draft[] = [
  {
    text: "What tool is used for sweeping?",
    correct: "A broom",
    distractors: ["A kettle", "A spade", "A fork"],
    explanation: "A broom gathers dust and dirt from the floor.",
    ref: E_HOM,
  },
  {
    text: "Why do we mop the floor?",
    correct: "To remove hidden dust",
    distractors: ["To wet the floor", "To paint it", "To warm it"],
    explanation: "Mopping picks up fine dust that sweeping leaves behind.",
    ref: E_HOM,
  },
  {
    text: "Where should dirty clothes be kept?",
    correct: "In the laundry basket",
    distractors: ["On the dining table", "Under the bed", "In the kitchen"],
    explanation: "The laundry basket keeps dirty clothes in one place.",
    ref: E_HOM,
  },
  {
    text: "What should we do with spilt liquids?",
    correct: "Wipe them up quickly",
    distractors: ["Leave them to dry", "Cover with paper", "Walk around them"],
    explanation: "Spilt liquids make floors slippery and unsafe.",
    ref: E_HOM,
  },
  {
    text: "Why do we cover our food?",
    correct: "To keep flies away",
    distractors: ["To keep it hot", "To hide it", "To make it tasty"],
    explanation: "Covering food stops flies from contaminating it.",
    ref: E_HOM,
  },
  {
    text: "Which room needs the most cleaning?",
    correct: "The kitchen",
    distractors: ["The study", "The bedroom", "The sitting room"],
    explanation: "The kitchen handles food, so it must be cleanest.",
    ref: E_HOM,
  },
  {
    text: "What do we use to wash dishes?",
    correct: "Soap and water",
    distractors: ["Oil and salt", "Dust and sand", "Paper and glue"],
    explanation: "Soap and water remove grease and germs from dishes.",
    ref: E_HOM,
  },
  {
    text: "Why is it dangerous to leave toys on the stairs?",
    correct: "People may trip and fall",
    distractors: ["Toys may break", "Toys will rust", "Stairs may shrink"],
    explanation: "Toys on stairs cause falls for children and adults.",
    ref: E_HOM,
  },
];

const HOM_7_9_SILVER: Draft[] = [
  {
    text: "How often should we change our bedsheets?",
    correct: "At least once a week",
    distractors: ["Once a year", "Never", "Once a month"],
    explanation: "Weekly sheet changing removes sweat, dust and mites.",
    ref: E_HOM,
  },
  {
    text: "Why must plugs and water never mix?",
    correct: "Water conducts electricity",
    distractors: ["They make noise", "They smell bad", "They rust"],
    explanation: "Water carries current and can shock or kill.",
    ref: E_HOM,
  },
  {
    text: "What should you check before using the stove?",
    correct: "Check for leaks and open a window",
    distractors: ["Light it with paper", "Pour water on it", "Turn it fully on"],
    explanation: "Checking for leaks prevents fires and gas poisoning.",
    ref: E_HOM,
  },
  {
    text: "Why do we wash fruits before eating them?",
    correct: "To remove dirt and pesticides",
    distractors: ["To add flavour", "To cool them", "To make them shiny"],
    explanation: "Washing removes dirt, germs and chemical residues.",
    ref: E_HOM,
  },
  {
    text: "What is the best way to store leftover food?",
    correct: "Cover it and refrigerate it",
    distractors: ["Leave it uncovered", "Put it in the sun", "Feed it to the cat"],
    explanation: "Refrigerating covered leftovers slows spoilage.",
    ref: E_HOM,
  },
  {
    text: "Why should we keep the toilet clean and flushed?",
    correct: "To stop germs and bad smells",
    distractors: ["To save water", "To help flies breed", "To block the drain"],
    explanation: "A clean toilet stops germs spreading in the home.",
    ref: E_HOM,
  },
  {
    text: "How can children help with chores at home?",
    correct: "By tidying toys and sweeping",
    distractors: ["By cooking alone", "By carrying hot pots", "By climbing ladders"],
    explanation: "Age-appropriate chores teach responsibility and teamwork.",
    ref: E_HOM,
  },
  {
    text: "Why is it unsafe to burn rubbish near the house?",
    correct: "Fire can spread to the house",
    distractors: ["It makes too much noise", "It wastes firewood", "It smells sweet"],
    explanation: "Open burning can spark and set nearby buildings alight.",
    ref: E_HOM,
  },
];

const HOM_7_9_GOLD: Draft[] = [
  {
    text: "Your mother mops the floor while you walk in with wet shoes. What should you do?",
    correct: "Remove the shoes or stay off the floor",
    distractors: ["Splash more water", "Run on the floor", "Ignore her"],
    explanation: "Wet shoes on a mopped floor cause dangerous slips.",
    ref: E_HOM,
  },
  {
    text: "Why must drugs be kept from children?",
    correct: "Children may swallow them by mistake",
    distractors: ["Children like the taste", "Drugs attract ants", "Drugs melt in rain"],
    explanation: "Accidental swallowing of medicines can seriously harm children.",
    ref: E_HOM,
  },
  {
    text: "What should you do if you smell leaking gas?",
    correct: "Open windows and tell a grown-up",
    distractors: ["Light a match to check", "Switch on the fan", "Close all doors"],
    explanation: "Opening windows and alerting adults prevents fire or poisoning.",
    ref: E_HOM,
  },
  {
    text: "Why must we wash hands after the toilet?",
    correct: "To remove germs before touching food",
    distractors: ["To smell nice", "To cool the hands", "To save soap"],
    explanation: "Toilet germs spread disease if we touch food afterwards.",
    ref: E_HOM,
  },
  {
    text: "How can we stop mosquitoes at home?",
    correct: "Drain stagnant water and use nets",
    distractors: ["Leave windows open at night", "Keep dirty water in buckets", "Sweep once a week"],
    explanation: "Mosquitoes breed in still water, so drain it and sleep under nets.",
    ref: E_HOM,
  },
  {
    text: "Why should we empty bins daily?",
    correct: "To stop flies and bad smells",
    distractors: ["To make the bin lighter", "To feed the cat", "To save space indoors"],
    explanation: "Full bins attract flies and rats that spread disease.",
    ref: E_HOM,
  },
  {
    text: "Your little brother swallowed a coin. What should you do?",
    correct: "Tell a grown-up immediately",
    distractors: ["Give him more coins", "Make him run around", "Wait and see"],
    explanation: "Swallowing small objects can block breathing or harm the body.",
    ref: E_HOM,
  },
  {
    text: "Why can the heater be risky?",
    correct: "It can start a fire",
    distractors: ["It uses too much power", "It mars the clothes", "It takes too long"],
    explanation: "Drying clothes on heaters can overheat and ignite the fabric.",
    ref: E_HOM,
  },
];

const COO_7_9_BRONZE: Draft[] = [
  {
    text: "What is the job of a cooking pot?",
    correct: "To boil or cook food",
    distractors: ["To serve food only", "To store food", "To wash food"],
    explanation: "A pot holds food and water while it cooks.",
    ref: E_COO,
  },
  {
    text: "What do we fry akara in?",
    correct: "A frying pan",
    distractors: ["A colander", "A grater", "A kettle"],
    explanation: "Akara is deep fried in hot oil in a pan.",
    ref: E_COO,
  },
  {
    text: "Why do we sieve garri?",
    correct: "To remove lumps and chaff",
    distractors: ["To add water", "To cool it", "To sweeten it"],
    explanation: "Sieving garri removes lumps so it soaks evenly.",
    ref: E_COO,
  },
  {
    text: "What must we always check before we light the stove?",
    correct: "That the gas is not leaking",
    distractors: ["That the pot is big", "That the salt is ready", "That the food is spicy"],
    explanation: "Checking for leaks prevents fires before lighting.",
    ref: E_COO,
  },
  {
    text: "Which of these do we cook with?",
    correct: "Pepper and onions",
    distractors: ["Soap and sponge", "Books and pens", "Buckets and brooms"],
    explanation: "Pepper and onions are common kitchen ingredients.",
    ref: E_COO,
  },
  {
    text: "Why must we never leave hot oil alone?",
    correct: "It can catch fire",
    distractors: ["It will get cold", "It will turn sweet", "It will dry up"],
    explanation: "Hot oil can ignite, so never leave it unattended.",
    ref: E_COO,
  },
  {
    text: "What do we use to peel yam?",
    correct: "A peeler or knife",
    distractors: ["A spoon", "A fork", "A pair of scissors"],
    explanation: "A peeler or knife removes the tough yam skin safely.",
    ref: E_COO,
  },
  {
    text: "When is it safe for children to help in the kitchen?",
    correct: "When a grown-up is watching",
    distractors: ["When frying alone", "When using sharp knives alone", "When the stove is on"],
    explanation: "Children must always cook under adult supervision.",
    ref: E_COO,
  },
];

const COO_7_9_SILVER: Draft[] = [
  {
    text: "Why do we soak beans before cooking them?",
    correct: "To soften them and save time",
    distractors: ["To make them sweet", "To keep them raw", "To change their colour"],
    explanation: "Soaking softens the beans so they cook faster.",
    ref: E_COO,
  },
  {
    text: "What is the right order to cook rice?",
    correct: "Wash, then boil with water and salt",
    distractors: ["Boil, then wash, then add salt", "Soak in sugar, then fry", "Fry first, then boil"],
    explanation: "Washing rice before boiling removes starch and dirt.",
    ref: E_COO,
  },
  {
    text: "Why should we not overfill a frying pan with oil?",
    correct: "Hot oil can splash out and burn",
    distractors: ["It saves cooking gas", "It makes food crispier", "It cools the oil faster"],
    explanation: "Too much oil can bubble over and splash onto flames.",
    ref: E_COO,
  },
  {
    text: "How do we know spaghetti is done?",
    correct: "It feels soft when bitten",
    distractors: ["It turns green", "It floats fully", "It becomes black"],
    explanation: "Cooked spaghetti is tender with a slight firmness.",
    ref: E_COO,
  },
  {
    text: "Why should we thaw frozen meat fully?",
    correct: "So the inside cooks through and kills germs",
    distractors: ["So it tastes salty", "So it cooks faster", "So it looks bigger"],
    explanation: "Unthawed meat cooks unevenly, leaving raw spots inside.",
    ref: E_COO,
  },
  {
    text: "What should you use to taste food while cooking?",
    correct: "A clean spoon",
    distractors: ["Your fingers", "The same spoon you stir with", "A fork from the sink"],
    explanation: "Always taste with a clean spoon to avoid contamination.",
    ref: E_COO,
  },
  {
    text: "Why do we pound yam with a mortar and pestle?",
    correct: "To make smooth pounded yam",
    distractors: ["To cut it into cubes", "To fry it", "To mash it with sugar"],
    explanation: "Pounding makes the cooked yam soft and stretchy.",
    ref: E_COO,
  },
  {
    text: "Why can a boiling pot be risky?",
    correct: "It can put out the flame or scald",
    distractors: ["It adds too much salt", "It burns the rice only", "It makes too much noise"],
    explanation: "Boil-overs can extinguish burners or scald nearby cooks.",
    ref: E_COO,
  },
];

const COO_7_9_GOLD: Draft[] = [
  {
    text: "You are asked to fry plantain. What must you check?",
    correct: "That the oil is hot and you watch it",
    distractors: ["That the pan is wet", "That the door is open", "That the light is off"],
    explanation: "Hot oil and constant watching prevent burns and fires.",
    ref: E_COO,
  },
  {
    text: "Why is water on a hot oil fire bad?",
    correct: "It makes the fire explode and spread",
    distractors: ["It puts the fire out safely", "It cools the pan slowly", "It boils the oil"],
    explanation: "Water turns to steam and throws burning oil across the kitchen.",
    ref: E_COO,
  },
  {
    text: "A recipe says two cups of rice for four people. How much for eight?",
    correct: "Four cups",
    distractors: ["Two cups", "Eight cups", "One cup"],
    explanation: "Doubling the people doubles the rice needed.",
    ref: E_COO,
  },
  {
    text: "Why must fish and meat be cooked well?",
    correct: "To kill harmful germs inside them",
    distractors: ["To make them heavier", "To remove their smell", "To keep them raw inside"],
    explanation: "Raw meat and fish can carry germs that cause illness.",
    ref: E_COO,
  },
  {
    text: "What will happen if you add too much pepper to soup?",
    correct: "The soup will be too spicy to enjoy",
    distractors: ["The soup will thicken", "The soup will freeze", "The soup will turn sweet"],
    explanation: "Too much pepper overpowers other flavours and upsets stomachs.",
    ref: E_COO,
  },
  {
    text: "Why should sharp knives be handled with care?",
    correct: "Dull knives slip and sharp knives cut cleanly",
    distractors: ["Sharp knives are heavier", "Dull knives rust faster", "Sharp knives attract flies"],
    explanation: "A dull knife slips, while a sharp one cuts cleanly.",
    ref: E_COO,
  },
  {
    text: "How can you reduce oil when frying plantain?",
    correct: "Use a non-stick pan with little oil",
    distractors: ["Add water to the oil", "Cover the pan fully", "Fry on high heat only"],
    explanation: "A non-stick pan needs less oil for crispy plantain.",
    ref: E_COO,
  },
  {
    text: "Why must we wash hands before cooking?",
    correct: "It stops germs reaching the food",
    distractors: ["It makes the food salty", "It saves water", "It keeps the tap clean"],
    explanation: "Clean hands prevent germs from contaminating meals.",
    ref: E_COO,
  },
];

const NUT_10_12_BRONZE: Draft[] = [
  {
    text: "Which nutrient builds and repairs body tissues?",
    correct: "Protein",
    distractors: ["Carbohydrate", "Fat", "Vitamin C"],
    explanation: "Protein builds and repairs muscles, skin and organs.",
    ref: A_NUT,
  },
  {
    text: "Which food is the best source of calcium?",
    correct: "Milk",
    distractors: ["Rice", "Yam", "Beef"],
    explanation: "Milk and milk products are the richest calcium sources.",
    ref: A_NUT,
  },
  {
    text: "Oranges are rich in which vitamin?",
    correct: "Vitamin C",
    distractors: ["Vitamin A", "Vitamin D", "Vitamin B12"],
    explanation: "Citrus fruits are rich in vitamin C, which boosts immunity.",
    ref: A_NUT,
  },
  {
    text: "What is the main function of carbohydrates in the diet?",
    correct: "To provide energy",
    distractors: ["To build bones", "To carry oxygen", "To repair tissues"],
    explanation: "Carbohydrates are the body's main source of energy.",
    ref: A_NUT,
  },
  {
    text: "Which of the following is a protective food?",
    correct: "Vegetables",
    distractors: ["Oil", "Sugar", "Yam"],
    explanation: "Vegetables supply vitamins and minerals that protect the body.",
    ref: A_NUT,
  },
  {
    text: "Why is water vital to the body?",
    correct: "It regulates temperature and transports nutrients",
    distractors: ["It provides calories", "It builds muscle", "It strengthens bones"],
    explanation: "Water transports nutrients and controls body temperature.",
    ref: A_NUT,
  },
  {
    text: "Which of these foods is rich in iron?",
    correct: "Liver",
    distractors: ["Bread", "Rice", "Milk"],
    explanation: "Liver is one of the richest sources of iron.",
    ref: A_NUT,
  },
  {
    text: "What does the body use fats for?",
    correct: "Energy storage and warmth",
    distractors: ["Building bones", "Making blood", "Carrying oxygen"],
    explanation: "Fats store energy and insulate the body from cold.",
    ref: A_NUT,
  },
];

const NUT_10_12_SILVER: Draft[] = [
  {
    text: "Why is it better to eat whole grains than refined ones?",
    correct: "They keep more fibre and nutrients",
    distractors: ["They taste sweeter", "They are more expensive", "They cook faster"],
    explanation: "Whole grains retain fibre, vitamins and minerals lost in refining.",
    ref: A_NUT,
  },
  {
    text: "A child has bleeding gums. Which nutrient is likely missing?",
    correct: "Vitamin C",
    distractors: ["Vitamin D", "Calcium", "Protein"],
    explanation: "Bleeding gums are a classic sign of vitamin C deficiency.",
    ref: A_NUT,
  },
  {
    text: "Why should we limit salt intake?",
    correct: "To prevent high blood pressure",
    distractors: ["To improve eyesight", "To strengthen bones", "To boost growth"],
    explanation: "Excess salt raises blood pressure and risks heart disease.",
    ref: A_NUT,
  },
  {
    text: "Which meal pattern is healthiest for school children?",
    correct: "Three balanced meals plus a snack",
    distractors: ["One large meal a day", "Skipping breakfast often", "Only snacks all day"],
    explanation: "Regular balanced meals sustain energy and concentration.",
    ref: A_NUT,
  },
  {
    text: "How does fibre in fruits help digestion?",
    correct: "It prevents constipation and keeps the gut healthy",
    distractors: ["It adds calories", "It builds muscle", "It cools the body"],
    explanation: "Fibre adds bulk to stool and feeds healthy gut bacteria.",
    ref: A_NUT,
  },
  {
    text: "Why are fermented foods like ogi good for us?",
    correct: "They improve gut health and digestion",
    distractors: ["They are high in sugar", "They cure headaches", "They whiten teeth"],
    explanation: "Fermented foods supply beneficial bacteria for the gut.",
    ref: A_NUT,
  },
  {
    text: "What is kwashiorkor caused by?",
    correct: "Severe protein deficiency",
    distractors: ["Excess vitamin C", "Lack of water", "Too much fat"],
    explanation: "Kwashiorkor results from prolonged lack of dietary protein.",
    ref: A_NUT,
  },
  {
    text: "Why is red palm oil a protective fat?",
    correct: "It is rich in vitamin A",
    distractors: ["It has no calories", "It lowers cholesterol", "It is low in fat"],
    explanation: "Red palm oil contains carotene, a precursor of vitamin A.",
    ref: A_NUT,
  },
];

const NUT_10_12_GOLD: Draft[] = [
  {
    text: "A household of six has a small food budget. What is best?",
    correct: "Plan meals around cheap local staples and vegetables",
    distractors: ["Buy only imported foods", "Skip two meals daily", "Buy only meat and fish"],
    explanation: "Local staples like beans and yam are affordable and nutritious.",
    ref: A_NUT,
  },
  {
    text: "Why is eating late at night unhealthy?",
    correct: "It disturbs sleep and digestion",
    distractors: ["It makes food taste better", "It saves cooking gas", "It builds muscle overnight"],
    explanation: "Late heavy meals disrupt digestion and sleep quality.",
    ref: A_NUT,
  },
  {
    text: "How can a teenage girl get enough iron?",
    correct: "Eat liver, beans and leafy vegetables",
    distractors: ["Drink only malt drinks", "Eat more sugar", "Avoid all fats"],
    explanation: "Iron-rich foods with vitamin C sources prevent anaemia.",
    ref: A_NUT,
  },
  {
    text: "Why feed babies only breast milk for six months?",
    correct: "It provides complete nutrition and antibodies",
    distractors: ["It is cheaper than formula only", "It guarantees intelligence", "It prevents all diseases"],
    explanation: "Breast milk supplies all nutrients and immune protection infants need.",
    ref: A_NUT,
  },
  {
    text: "A child eats a lot of sugar daily but avoids vegetables. What risks arise?",
    correct: "Tooth decay, obesity and poor immunity",
    distractors: ["Stronger bones", "Better digestion", "No risk at all"],
    explanation: "Excess sugar and low fibre raise risks of decay, obesity and illness.",
    ref: A_NUT,
  },
  {
    text: "Why are vegetables in rice better than plain noodles?",
    correct: "It provides more nutrients and fibre",
    distractors: ["It is cheaper", "It needs no water", "It cooks faster"],
    explanation: "Mixed meals give carbohydrates, vitamins and minerals together.",
    ref: A_NUT,
  },
  {
    text: "What should people with diabetes avoid most?",
    correct: "Refined sugar and white rice",
    distractors: ["Water and vegetables", "Beans and moi moi", "Leafy greens"],
    explanation: "Refined carbs spike blood sugar; whole grains are safer choices.",
    ref: A_NUT,
  },
  {
    text: "How does food affect a child's school work?",
    correct: "Good nutrition improves focus and energy",
    distractors: ["Food has no effect on learning", "Only breakfast matters", "Food only affects height"],
    explanation: "Well-fed children concentrate better and miss fewer school days.",
    ref: A_NUT,
  },
];

const HOM_10_12_BRONZE: Draft[] = [
  {
    text: "Which liquid cleans the toilet?",
    correct: "Bleach",
    distractors: ["Cooking oil", "Kerosene", "Palm wine"],
    explanation: "Bleach kills germs and deodorises toilet bowls.",
    ref: A_HOM,
  },
  {
    text: "Why should sweeping be done before mopping?",
    correct: "Mopping then removes remaining fine dust",
    distractors: ["Mopping first is faster", "Sweeping wets the floor", "Order does not matter"],
    explanation: "Sweeping collects big debris so mopping can finish.",
    ref: A_HOM,
  },
  {
    text: "Which of these is a safe way to store knives?",
    correct: "In a knife block or rack",
    distractors: ["Loose in a drawer with spoons", "On the floor", "Under the mattress"],
    explanation: "Knife blocks keep blades secure and protect fingers.",
    ref: A_HOM,
  },
  {
    text: "What does a home laundry basket help with?",
    correct: "Keeping dirty clothes together",
    distractors: ["Storing clean dishes", "Holding cooking utensils", "Collecting refuse"],
    explanation: "A laundry basket organises dirty clothes for washing day.",
    ref: A_HOM,
  },
  {
    text: "Which of these should never be mixed with bleach?",
    correct: "Toilet cleaner containing ammonia",
    distractors: ["Water", "Salt", "Baking soda"],
    explanation: "Bleach and ammonia release toxic chloramine gas when mixed.",
    ref: A_HOM,
  },
  {
    text: "Why do homes need cross ventilation?",
    correct: "It circulates fresh air and removes damp",
    distractors: ["It keeps rooms colder in winter", "It reduces electricity bills", "It stops noise"],
    explanation: "Cross ventilation replaces stale air and reduces mould.",
    ref: A_HOM,
  },
  {
    text: "What is the best way to get rid of mosquito breeding sites?",
    correct: "Drain stagnant water around the home",
    distractors: ["Spray tomorrow", "Close all windows", "Sweep once a week"],
    explanation: "Mosquitoes breed in still water; draining it breaks the cycle.",
    ref: A_HOM,
  },
  {
    text: "Why must sockets not be overloaded?",
    correct: "Overloading causes overheating and fires",
    distractors: ["It saves power", "It makes appliances faster", "It extends bulb life"],
    explanation: "Too many devices draw excess current and can start fires.",
    ref: A_HOM,
  },
];

const HOM_10_12_SILVER: Draft[] = [
  {
    text: "What is the correct order for cleaning a room?",
    correct: "Dust, sweep, then mop",
    distractors: ["Mop, dust, then sweep", "Sweep, mop, then dust", "Dust, mop, then sweep"],
    explanation: "Work top-down: dust first, sweep next, mop last.",
    ref: A_HOM,
  },
  {
    text: "Why should chemicals have clear labels?",
    correct: "So nobody uses them by mistake",
    distractors: ["To make shelves look tidy", "To attract buyers", "To increase shelf life"],
    explanation: "Clear labels prevent dangerous mix-ups with food or water.",
    ref: A_HOM,
  },
  {
    text: "How can a home cut electricity costs?",
    correct: "Switch off unused appliances and bulbs",
    distractors: ["Leave all lights on", "Use bigger fridges", "Iron clothes daily"],
    explanation: "Switching off unused devices cuts wasted electricity.",
    ref: A_HOM,
  },
  {
    text: "Why is it wrong to clean the kitchen with the same cloth used for the toilet?",
    correct: "It spreads toilet germs to food areas",
    distractors: ["It wastes soap", "It damages the cloth", "It is not wrong at all"],
    explanation: "Shared cloths transfer harmful bacteria to food surfaces.",
    ref: A_HOM,
  },
  {
    text: "What must be checked on a kerosene stove often?",
    correct: "The wick and fuel level",
    distractors: ["The colour of the flame only", "The pot size", "The matchbox count"],
    explanation: "A frayed wick or full tank causes flare-ups and spills.",
    ref: A_HOM,
  },
  {
    text: "Why does a tidy home stay safer?",
    correct: "It clears walkways and reduces falls",
    distractors: ["It makes rooms look bigger", "It attracts visitors", "It saves paint"],
    explanation: "Removing clutter eliminates trip hazards and blocked exits.",
    ref: A_HOM,
  },
  {
    text: "How should broken bottles and sharp objects be disposed of?",
    correct: "Wrapped and put in a labelled bin",
    distractors: ["Thrown loosely into the bin", "Burned in the compound", "Left by the roadside"],
    explanation: "Wrapped, labelled sharps protect waste handlers from cuts.",
    ref: A_HOM,
  },
  {
    text: "Why should a home have a first aid box?",
    correct: "To treat minor injuries immediately",
    distractors: ["To store snacks", "To keep medicines for visitors", "To hold tools"],
    explanation: "Prompt first aid prevents minor injuries from worsening.",
    ref: A_HOM,
  },
];

const HOM_10_12_GOLD: Draft[] = [
  {
    text: "A gas cylinder in the kitchen smells strongly of gas. What should the family do first?",
    correct: "Open windows, turn off gas and go outside",
    distractors: ["Light a match to find the leak", "Switch on the extractor fan", "Spray air freshener"],
    explanation: "Fresh air and evacuation prevent explosion; sparks must be avoided.",
    ref: A_HOM,
  },
  {
    text: "Why is it risky to dry clothes near a cooking fire?",
    correct: "Fabric can ignite and start a fire",
    distractors: ["Clothes will fade", "Smoke flavours the food", "It wastes firewood"],
    explanation: "Fabric catches fire easily near open flames.",
    ref: A_HOM,
  },
  {
    text: "How can a home keep out rats and cockroaches?",
    correct: "Seal food properly and keep the home clean",
    distractors: ["Leave food scraps overnight", "Use perfume only", "Open all windows at night"],
    explanation: "Proper food storage and hygiene deny pests food and shelter.",
    ref: A_HOM,
  },
  {
    text: "Why should a home have a fire plan?",
    correct: "So everyone knows what to do in danger",
    distractors: ["To plan parties", "To impress visitors", "To practise dancing"],
    explanation: "A rehearsed plan saves lives during fires, floods or leaks.",
    ref: A_HOM,
  },
  {
    text: "What is the safest way to clean a bathroom floor?",
    correct: "Use disinfectant and a wet mop with a caution sign",
    distractors: ["Sweep with a dry broom", "Pour water and walk on it", "Use cooking oil"],
    explanation: "Disinfectant and a warning sign prevent slips and germs.",
    ref: A_HOM,
  },
  {
    text: "Why must a damaged cable be replaced fast?",
    correct: "It can cause shocks and fires",
    distractors: ["It wastes electricity", "It looks ugly", "It trips the meter"],
    explanation: "Damaged insulation exposes live current, risking shock and fire.",
    ref: A_HOM,
  },
  {
    text: "How can children do home chores safely?",
    correct: "Give them age-appropriate tasks with guidance",
    distractors: ["Let them use sharp tools alone", "Give them stove duty", "Give toddlers heavy loads"],
    explanation: "Matching tasks to age and supervising keeps children safe.",
    ref: A_HOM,
  },
  {
    text: "What should be done with expired medicines at home?",
    correct: "Return them to a pharmacy or dispose safely",
    distractors: ["Use them anyway", "Flush them in the toilet", "Give them to younger siblings"],
    explanation: "Expired medicines lose potency and can be harmful.",
    ref: A_HOM,
  },
];

const COO_10_12_BRONZE: Draft[] = [
  {
    text: "Which tool is used to drain fried food?",
    correct: "A sieve or colander",
    distractors: ["A ladle", "A rolling pin", "A spatula"],
    explanation: "A sieve lets excess oil drain off fried food.",
    ref: A_COO,
  },
  {
    text: "What is the purpose of a whisk in cooking?",
    correct: "To beat eggs and mix batter",
    distractors: ["To cut vegetables", "To stir thick stew", "To measure water"],
    explanation: "A whisk incorporates air and blends ingredients smoothly.",
    ref: A_COO,
  },
  {
    text: "Why must meat be defrosted before cooking?",
    correct: "So it cooks evenly throughout",
    distractors: ["To add salt", "To save gas", "To make it look bigger"],
    explanation: "Frozen centres stay raw while outer parts burn.",
    ref: A_COO,
  },
  {
    text: "Which of these is a dry heat cooking method?",
    correct: "Grilling",
    distractors: ["Boiling", "Steaming", "Poaching"],
    explanation: "Grilling cooks food with dry radiant heat, not water.",
    ref: A_COO,
  },
  {
    text: "What does a pressure cooker do?",
    correct: "Cooks food faster with steam pressure",
    distractors: ["Chills food quickly", "Blends ingredients", "Measures temperature"],
    explanation: "Trapped steam raises pressure and cooking temperature.",
    ref: A_COO,
  },
  {
    text: "Why use a wooden spoon in non-stick pans?",
    correct: "It does not scratch the coating",
    distractors: ["It adds flavour", "It cleans faster", "It cools the oil"],
    explanation: "Wood is gentle on non-stick surfaces unlike metal.",
    ref: A_COO,
  },
  {
    text: "What must you do with raw meat juices on the chopping board?",
    correct: "Wash the board and knife before reuse",
    distractors: ["Wipe with a dry cloth only", "Use immediately for vegetables", "Leave it to dry in the sun"],
    explanation: "Raw meat juices carry bacteria that cause cross-contamination.",
    ref: A_COO,
  },
  {
    text: "Which oil is most common in our kitchens?",
    correct: "Palm oil",
    distractors: ["Mustard oil", "Lard", "Butter"],
    explanation: "Palm oil is the traditional cooking fat in many homes.",
    ref: A_COO,
  },
];

const COO_10_12_SILVER: Draft[] = [
  {
    text: "Why should we get ingredients ready first?",
    correct: "It prevents burning and mistakes",
    distractors: ["It saves on ingredients", "It makes food taste sweeter", "It cools the kitchen"],
    explanation: "Having everything ready prevents food from burning mid-cook.",
    ref: A_COO,
  },
  {
    text: "What happens to meat cooked too long?",
    correct: "It becomes tough and dry",
    distractors: ["It gets sweeter", "It becomes tender", "It turns purple"],
    explanation: "Overcooking squeezes out moisture and toughens proteins.",
    ref: A_COO,
  },
  {
    text: "Why should we not wash chicken in the kitchen sink?",
    correct: "Splashing spreads bacteria around the sink",
    distractors: ["It wastes soap", "It makes the chicken tough", "It is not allowed by law"],
    explanation: "Washing poultry splashes campylobacter onto surfaces.",
    ref: A_COO,
  },
  {
    text: "How do you correctly hold a knife for safety?",
    correct: "Curl fingers back and grip firmly",
    distractors: ["Hold the tip tightly", "Rest it on your palm", "Grip the blade itself"],
    explanation: "A firm grip with tucked fingers prevents slips and cuts.",
    ref: A_COO,
  },
  {
    text: "Why is it important to let a stock simmer rather than boil hard?",
    correct: "Gentle heat extracts flavour without clouding",
    distractors: ["Hard boiling saves more gas", "It makes the stock sweeter", "It is faster"],
    explanation: "Simmering extracts flavours gently and keeps the stock clear.",
    ref: A_COO,
  },
  {
    text: "What is the safest way to test if oil is hot enough for frying?",
    correct: "Drop a small piece of onion or bread in it",
    distractors: ["Splash water in the pot", "Use your wet finger", "Taste the oil"],
    explanation: "A food drop sizzling shows the oil is ready without risk.",
    ref: A_COO,
  },
  {
    text: "Why should cooked food not sit at room temperature for long?",
    correct: "Bacteria multiply rapidly in the danger zone",
    distractors: ["It tastes better cold", "Flies will not touch it", "It saves electricity"],
    explanation: "Between 5 and 60 degrees, bacteria multiply quickly.",
    ref: A_COO,
  },
  {
    text: "What is the function of a marinade in cooking?",
    correct: "To tenderise and flavour meat before cooking",
    distractors: ["To preserve meat for years", "To cool the kitchen", "To thicken sauces"],
    explanation: "Acid and spices in marinades tenderise meat and add flavour.",
    ref: A_COO,
  },
];

const COO_10_12_GOLD: Draft[] = [
  {
    text: "Why does adding a pinch of salt to boiling pasta improve it?",
    correct: "It seasons the pasta from inside",
    distractors: ["It makes pasta cook faster", "It prevents sticking entirely", "It adds calories"],
    explanation: "Salt in the water seasons pasta throughout, not just on top.",
    ref: A_COO,
  },
  {
    text: "A pot of soup must serve 12 people but only feeds 8. How do you scale the recipe?",
    correct: "Multiply each ingredient by 1.5",
    distractors: ["Double every ingredient", "Add more water only", "Add more salt only"],
    explanation: "12 divided by 8 equals 1.5, so scale everything by half again.",
    ref: A_COO,
  },
  {
    text: "Why must a chip pan never be left alone?",
    correct: "Overheated oil can burst into flames",
    distractors: ["It cools too fast", "It soaks up water", "It turns green"],
    explanation: "Chip pan fires ignite without warning once oil overheats.",
    ref: A_COO,
  },
  {
    text: "How can a cook avoid spreading germs from raw chicken to salad?",
    correct: "Use separate boards and wash hands between",
    distractors: ["Use one board for everything", "Rinse chicken in the salad bowl", "Chop chicken last without washing"],
    explanation: "Separate boards and handwashing stop salmonella reaching salad.",
    ref: A_COO,
  },
  {
    text: "Why might a cake fail to rise even with fresh yeast?",
    correct: "Yeast needs warmth and moisture to activate",
    distractors: ["Yeast needs direct sunlight", "Yeast only works at night", "Yeast works better in cold water"],
    explanation: "Yeast is a living organism needing warmth, moisture and sugar.",
    ref: A_COO,
  },
  {
    text: "What is the science behind resting meat after cooking?",
    correct: "Juices redistribute, keeping the meat moist",
    distractors: ["It makes the meat cooler to touch only", "It kills leftover bacteria", "It improves the colour"],
    explanation: "Resting lets muscle fibres relax and reabsorb juices.",
    ref: A_COO,
  },
  {
    text: "Why should we use low heat for custard or milk sauces?",
    correct: "High heat curdles the milk proteins",
    distractors: ["Low heat saves more energy", "High heat burns the sugar", "Low heat keeps it whiter"],
    explanation: "Milk proteins clump and curdle under sudden high heat.",
    ref: A_COO,
  },
  {
    text: "How does steaming keep more nutrients than boiling?",
    correct: "Vitamins dissolve in water and are drained away",
    distractors: ["Steaming adds vitamins", "Boiling removes fibre", "Steaming uses plastic"],
    explanation: "Water-soluble vitamins leach into boiling water and are poured away.",
    ref: A_COO,
  },
];

const DATA_4_6: BandBank = {
  id: "4-6",
  refLevel: "Nursery 2",
  topics: {
    nutrition: { bronze: NUT_4_6_BRONZE, silver: NUT_4_6_SILVER, gold: NUT_4_6_GOLD },
    "home-care": { bronze: HOM_4_6_BRONZE, silver: HOM_4_6_SILVER, gold: HOM_4_6_GOLD },
    "food-cook": { bronze: COO_4_6_BRONZE, silver: COO_4_6_SILVER, gold: COO_4_6_GOLD },
  },
};

const DATA_7_9: BandBank = {
  id: "7-9",
  refLevel: "Primary 3",
  topics: {
    nutrition: { bronze: NUT_7_9_BRONZE, silver: NUT_7_9_SILVER, gold: NUT_7_9_GOLD },
    "home-care": { bronze: HOM_7_9_BRONZE, silver: HOM_7_9_SILVER, gold: HOM_7_9_GOLD },
    "food-cook": { bronze: COO_7_9_BRONZE, silver: COO_7_9_SILVER, gold: COO_7_9_GOLD },
  },
};

const DATA_10_12: BandBank = {
  id: "10-12",
  refLevel: "Primary 5",
  topics: {
    nutrition: { bronze: NUT_10_12_BRONZE, silver: NUT_10_12_SILVER, gold: NUT_10_12_GOLD },
    "home-care": { bronze: HOM_10_12_BRONZE, silver: HOM_10_12_SILVER, gold: HOM_10_12_GOLD },
    "food-cook": { bronze: COO_10_12_BRONZE, silver: COO_10_12_SILVER, gold: COO_10_12_GOLD },
  },
};

const BAND_BANKS: BandBank[] = [DATA_4_6, DATA_7_9, DATA_10_12];

const LEVEL_NUM: Record<Level, number[]> = {
  bronze: [1, 2, 3, 4, 5, 6, 7, 8],
  silver: [1, 2, 3, 4, 5, 6, 7, 8],
  gold: [1, 2, 3, 4, 5, 6, 7, 8],
};

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

function toQuestions(bank: BandBank, topicId: string, prefix: string, levels: Record<Level, Draft[]>): Question[] {
  const band = bandById(bank.id)!;
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${bank.id} ${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${band.token}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: band.id,
        subject: "home-economics",
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

let errors = 0;
for (const bank of BAND_BANKS) {
  const OUT = path.resolve(`src/server/data/questions/${bank.id}/home-economics`);
  mkdirSync(OUT, { recursive: true });
  for (const topicId of Object.keys(bank.topics)) {
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) throw new Error(`unknown topic ${topicId}`);
    const levels = bank.topics[topicId]!;
    const questions = toQuestions(bank, topicId, topic.codePrefix, levels);
    const file: TopicFile = {
      band: bank.id as TopicFile["band"],
      subject: "home-economics",
      topic: topicId as never,
      title: topic.label,
      questions,
    };
    const issues = validateTopicFile(file, {});
    const bad = issues.filter((i) => i.severity === "error");
    if (!isClean(issues)) {
      errors += bad.length;
      console.error(`\n${bank.id} ${topicId}: ${bad.length} errors`);
      for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
    } else {
      console.log(`${bank.id} ${topicId}: ${questions.length} questions clean`);
    }
    writeFileSync(path.join(OUT, `${topicId}.json`), JSON.stringify(file, null, 2) + "\n");
  }
}

if (errors > 0) process.exitCode = 1;
