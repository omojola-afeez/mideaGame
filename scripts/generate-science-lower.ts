import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Integrated Science banks for the lower bands (4-6 Sprouts and 7-9 Explorers).
 * Written by hand, checked by the validator. Eight questions per level,
 * twenty four per topic, two hundred and forty in all. The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "SCI";
const AUTHOR = "AI draft v1";

const REFS: Record<string, Record<string, string>> = {
  "4-6": {
    "living-things": "living things",
    matter: "solids and liquids",
    energy: "light and heat",
    "earth-space": "the sun and the sky",
    "body-health": "the human body",
  },
  "7-9": {
    "living-things": "living things",
    matter: "matter and materials",
    energy: "energy and force",
    "earth-space": "earth and space",
    "body-health": "the human body",
  },
};

const REF_LEVEL: Record<string, Record<Level, string>> = {
  "4-6": { bronze: "Nursery 2", silver: "Primary 1", gold: "Primary 1" },
  "7-9": { bronze: "Primary 3", silver: "Primary 3", gold: "Primary 3" },
};

function refFor(bandId: string, topicId: string, level: Level): string {
  return `NERDC ${REF_LEVEL[bandId]![level]} Integrated Science, ${REFS[bandId]![topicId]}`;
}

/* ================= BAND 4-6 (Sprouts) ================= */

const P46_LIVING_BRONZE: Draft[] = [
  { text: "Which one is alive?", correct: "A cat", distractors: ["A chair", "A cup", "A stone"], explanation: "A cat is alive. It eats and grows." },
  { text: "Which pet barks?", correct: "A dog", distractors: ["A cat", "A goat", "A hen"], explanation: "Dogs bark to talk to us." },
  { text: "What do cows give us?", correct: "Milk", distractors: ["Eggs", "Wool", "Rice"], explanation: "Cows give us fresh milk." },
  { text: "Which one lays eggs?", correct: "A hen", distractors: ["A goat", "A cow", "A dog"], explanation: "Hens lay eggs on the farm." },
  { text: "Where do fish live?", correct: "In water", distractors: ["In trees", "In sand", "On roofs"], explanation: "Fish need water to breathe." },
  { text: "What do trees need?", correct: "Sun and rain", distractors: ["More chairs", "Cold rooms", "Loud songs"], explanation: "Trees need sun and water to live." },
  { text: "What do birds have?", correct: "Wings", distractors: ["Fins", "Hooves", "Scales"], explanation: "Birds fly with their wings." },
  { text: "Which one flies?", correct: "A bird", distractors: ["A fish", "A cow", "A snail"], explanation: "Birds have wings and can fly." },
];

const P46_LIVING_SILVER: Draft[] = [
  { text: "What do plants make food from?", correct: "Sunlight", distractors: ["Candle light", "Fire light", "Torch light"], explanation: "Sunlight helps plants make food." },
  { text: "Why do we water plants?", correct: "To help them grow", distractors: ["To make them cold", "To wash them", "To paint them"], explanation: "Plants drink water through their roots." },
  { text: "Which part drinks water?", correct: "The roots", distractors: ["The leaves", "The buds", "The stem"], explanation: "Roots pull water from the soil." },
  { text: "What do roots hold?", correct: "The plant in soil", distractors: ["The plant in air", "The leaves to the sky", "The buds to the rain"], explanation: "Roots anchor the plant in the ground." },
  { text: "What do leaves breathe in?", correct: "Air", distractors: ["Mud", "Stones", "Paint"], explanation: "Leaves take in air to make food." },
  { text: "What will a chick grow into?", correct: "A hen", distractors: ["A goat", "A dog", "A fish"], explanation: "A chick grows into a hen." },
  { text: "Which one is a baby cow?", correct: "A calf", distractors: ["A duck", "A goat", "A piglet"], explanation: "A baby cow is called a calf." },
  { text: "What do goats and sheep give us?", correct: "Milk", distractors: ["Eggs", "Rice", "Fish"], explanation: "Goats and sheep give us milk." },
];

const P46_LIVING_GOLD: Draft[] = [
  { text: "Why do plants need sun?", correct: "To make food", distractors: ["To sleep", "To sing", "To jump"], explanation: "Plants use sun to make food." },
  { text: "Why do we need plants?", correct: "For food and air", distractors: ["For toys", "For paint", "For noise"], explanation: "Plants give us food and fresh air." },
  { text: "What do leaves make?", correct: "Food", distractors: ["Shoes", "Nets", "Bricks"], explanation: "Leaves make food for the plant." },
  { text: "Why does a crop need rain?", correct: "So it can grow", distractors: ["So it can sleep", "So it can fly", "So it can swim"], explanation: "Crops need water to grow well." },
  { text: "Which one is a plant we eat?", correct: "Ugu leaf", distractors: ["A stone", "A spoon", "A kite"], explanation: "Ugu leaf is a common soup leaf." },
  { text: "What do bees give us?", correct: "Honey", distractors: ["Milk", "Wool", "Rice"], explanation: "Bees make sweet honey." },
  { text: "Why will a hen grow from a chick?", correct: "It will grow bigger", distractors: ["It will turn to a goat", "It will melt", "It will float"], explanation: "Chicks grow into hens." },
  { text: "Which fruit comes from a tree?", correct: "Mango", distractors: ["Egg", "Milk", "Rice"], explanation: "Mangoes grow on trees." },
];

const P46_MATTER_BRONZE: Draft[] = [
  { text: "Which one can pour?", correct: "Water", distractors: ["A stone", "A chair", "A book"], explanation: "Water can pour from one place to another." },
  { text: "Which one is hard?", correct: "A rock", distractors: ["A cloth", "A balloon", "A sponge"], explanation: "A rock is hard and strong." },
  { text: "What does ice feel like?", correct: "Cold", distractors: ["Hot", "Soft and warm", "Dry and hot"], explanation: "Ice is very cold to touch." },
  { text: "Which one melts?", correct: "Ice cream", distractors: ["A cup", "A spoon", "A plate"], explanation: "Ice cream melts in the heat." },
  { text: "Where does rain land?", correct: "In puddles", distractors: ["In the sky", "On the sun", "In the clouds"], explanation: "Rain falls to the ground and fills puddles." },
  { text: "Which one is wet?", correct: "A wet cloth", distractors: ["A dry towel", "A clean plate", "A wool cap"], explanation: "A wet cloth holds water." },
  { text: "Where do we keep water?", correct: "In a cup", distractors: ["In a bag", "In a sock", "In a book"], explanation: "A cup can hold water." },
  { text: "Which one can flow?", correct: "Milk", distractors: ["A shoe", "A stone", "A chair"], explanation: "Milk flows like water does." },
];

const P46_MATTER_SILVER: Draft[] = [
  { text: "What is water when it boils?", correct: "Steam", distractors: ["Ice", "Salt", "Smoke"], explanation: "Boiling water turns into steam." },
  { text: "Which one sinks in water?", correct: "A stone", distractors: ["A leaf", "A cork", "An empty bottle"], explanation: "A stone is heavy and sinks." },
  { text: "Which one floats?", correct: "A cork", distractors: ["A stone", "A coin", "A key"], explanation: "A cork is light and floats." },
  { text: "What do we call water we can drink?", correct: "Drinking water", distractors: ["Dirty water", "Sea water", "Muddy water"], explanation: "Drinking water is clean and safe." },
  { text: "Which is a mix of sand and water?", correct: "Mud", distractors: ["Salt", "Ice", "Oil"], explanation: "Mud is sand mixed with water." },
  { text: "What is steam?", correct: "Water as a hot gas", distractors: ["Smoke from fire", "Dust from sand", "Cold mist"], explanation: "Steam is water as a hot gas." },
  { text: "Which one is the hardest?", correct: "A rock", distractors: ["A sponge", "A leaf", "A balloon"], explanation: "A rock is very hard." },
  { text: "What do we use for water?", correct: "A bucket", distractors: ["A net", "A bag", "A plate"], explanation: "A bucket holds and carries water." },
];

const P46_MATTER_GOLD: Draft[] = [
  { text: "Why can we not see air?", correct: "Air has no colour", distractors: ["Air is black", "Air is too bright", "Air hides in holes"], explanation: "Air is clear, so we cannot see it." },
  { text: "What is steam made of?", correct: "Water", distractors: ["Smoke", "Sand", "Salt"], explanation: "Steam is water as a hot gas." },
  { text: "Which water is safe to drink?", correct: "Boiled water", distractors: ["Muddy water", "Sea water", "Rain from a roof"], explanation: "Boiling kills germs in water." },
  { text: "How does ice feel?", correct: "Cold and hard", distractors: ["Warm and soft", "Hot and wet", "Soft and dry"], explanation: "Ice is cold and hard." },
  { text: "Why do we boil water?", correct: "To kill germs", distractors: ["To add salt", "To make it cold", "To change its taste"], explanation: "Boiling water kills germs." },
  { text: "Which one can melt?", correct: "Ice", distractors: ["A stone", "A spoon", "A plate"], explanation: "Ice melts when it gets warm." },
  { text: "Where does salt come from?", correct: "The sea", distractors: ["The sky", "Fire", "Trees"], explanation: "Salt is taken from sea water." },
  { text: "How can we keep water clean?", correct: "Keep the cup covered", distractors: ["Leave it open", "Mix it with oil", "Stir it with sand"], explanation: "A covered cup keeps dirt out." },
];

const P46_ENERGY_BRONZE: Draft[] = [
  { text: "Which one gives us light?", correct: "The sun", distractors: ["A rock", "A stone", "A cup"], explanation: "The sun gives us light and heat." },
  { text: "What gives us heat?", correct: "Fire", distractors: ["Ice", "Rain", "Snow"], explanation: "Fire gives us heat." },
  { text: "Which one is hot?", correct: "A stove", distractors: ["An ice block", "A wet towel", "A fan"], explanation: "A stove is hot when it is on." },
  { text: "What do we see with?", correct: "Our eyes", distractors: ["Our ears", "Our nose", "Our legs"], explanation: "We see with our eyes." },
  { text: "Which one makes sound?", correct: "A drum", distractors: ["A wall", "A pillow", "A cupboard"], explanation: "A drum makes sound when hit." },
  { text: "Which one is very hot?", correct: "Fire", distractors: ["Ice", "Snow", "A fridge"], explanation: "Fire is very hot." },
  { text: "Which shines by day?", correct: "The sun", distractors: ["The moon", "Stars", "Lamps"], explanation: "The sun shines by day." },
  { text: "Which one is cold?", correct: "Ice", distractors: ["Fire", "The sun", "A stove"], explanation: "Ice is cold." },
];

const P46_ENERGY_SILVER: Draft[] = [
  { text: "What do we use a torch for?", correct: "To see in the dark", distractors: ["To cook", "To wash", "To sweep"], explanation: "A torch gives light in the dark." },
  { text: "Which one needs petrol?", correct: "A car", distractors: ["A kite", "A cup", "A shoe"], explanation: "A car needs petrol to move." },
  { text: "What do we use to cook with?", correct: "Fire", distractors: ["Ice", "Water", "Snow"], explanation: "We cook our food with fire." },
  { text: "Why is fire hot?", correct: "It gives off heat", distractors: ["It is made of ice", "It is made of sand", "It is made of air"], explanation: "Fire is hot because it gives off heat." },
  { text: "Which one helps us hear?", correct: "Our ears", distractors: ["Our eyes", "Our nose", "Our lips"], explanation: "We hear sounds with our ears." },
  { text: "What makes a bell ring?", correct: "Being hit", distractors: ["Frost", "Sunlight", "Rain"], explanation: "A bell rings when it is hit." },
  { text: "Which keeps food warm?", correct: "A stove", distractors: ["A fridge", "A fan", "An ice block"], explanation: "A stove keeps food warm." },
  { text: "Where does rain come from?", correct: "Clouds", distractors: ["Trees", "Rocks", "The sun"], explanation: "Rain falls from clouds." },
];

const P46_ENERGY_GOLD: Draft[] = [
  { text: "Why do we need the sun?", correct: "For light and heat", distractors: ["For rain", "For wind", "For snow"], explanation: "The sun gives light and heat." },
  { text: "How do lamps shine?", correct: "They use energy", distractors: ["They eat", "They grow", "They freeze"], explanation: "Lamps shine when they use energy." },
  { text: "Why do we use sound?", correct: "To talk and sing", distractors: ["To eat", "To sleep only", "To swim"], explanation: "Sound helps us talk and sing." },
  { text: "What melts when heated?", correct: "Ice", distractors: ["A stone", "A brick", "A key"], explanation: "Ice melts when it is heated." },
  { text: "Why do wet clothes dry in sun?", correct: "The sun heats them", distractors: ["The wind eats them", "The rain washes them", "The moon shines"], explanation: "Heat from the sun dries wet clothes." },
  { text: "Which one uses fuel?", correct: "A car", distractors: ["A book", "A shoe", "A cup"], explanation: "A car burns fuel to move." },
  { text: "Why is fire good for cooking?", correct: "It gives heat", distractors: ["It gives cold", "It gives rain", "It gives salt"], explanation: "Fire gives the heat to cook food." },
  { text: "What does the sun melt?", correct: "Ice", distractors: ["Rocks", "Trees", "Bricks"], explanation: "The sun melts ice." },
];

const P46_EARTH_BRONZE: Draft[] = [
  { text: "What is up in the sky?", correct: "The sun", distractors: ["The sea", "A tree", "A pot"], explanation: "The sun is up in the sky." },
  { text: "What falls from clouds?", correct: "Rain", distractors: ["Stones", "Sand", "Salt"], explanation: "Rain falls from clouds." },
  { text: "Which one is round?", correct: "The sun", distractors: ["A brick", "A ruler", "A book"], explanation: "The sun is round." },
  { text: "What is the sun?", correct: "A star", distractors: ["A cloud", "A moon", "A planet"], explanation: "The sun is a big star." },
  { text: "What do we see in the night sky?", correct: "Stars", distractors: ["Fish", "Chairs", "Cars"], explanation: "Stars shine in the night sky." },
  { text: "Which one is very cold?", correct: "Snow", distractors: ["Fire", "A stove", "The sun"], explanation: "Snow is very cold." },
  { text: "Where do we live?", correct: "On Earth", distractors: ["On the moon", "On a star", "In a cloud"], explanation: "We live on planet Earth." },
  { text: "What do we call the land we live on?", correct: "Earth", distractors: ["The sky", "The moon", "The sun"], explanation: "The land we live on is Earth." },
];

const P46_EARTH_SILVER: Draft[] = [
  { text: "What is a cloud made of?", correct: "Tiny drops of water", distractors: ["Smoke", "Sand", "Salt"], explanation: "Clouds are made of tiny drops of water." },
  { text: "Why does it get dark at night?", correct: "The sun goes down", distractors: ["The moon eats the sun", "Birds cover the sky", "Clouds eat the sun"], explanation: "Night comes when the sun goes down." },
  { text: "Which one tells hot from cold?", correct: "A thermometer", distractors: ["A ruler", "A cup", "A spoon"], explanation: "A thermometer measures heat." },
  { text: "What brings rain?", correct: "Clouds", distractors: ["Trees", "Rocks", "Books"], explanation: "Rain comes from clouds." },
  { text: "When is the sun strongest?", correct: "At noon", distractors: ["At night", "At dawn", "At midnight"], explanation: "The sun is strongest at noon." },
  { text: "What do we use to see the stars?", correct: "A telescope", distractors: ["A cup", "A pot", "A spoon"], explanation: "A telescope makes far things look closer." },
  { text: "Which one is a planet?", correct: "Earth", distractors: ["The sun", "A cloud", "A star"], explanation: "Earth is a planet." },
  { text: "Why is rain good for us?", correct: "It helps plants grow", distractors: ["It cools the sun", "It wakes the moon", "It feeds the birds"], explanation: "Rain waters the crops." },
];

const P46_EARTH_GOLD: Draft[] = [
  { text: "Why is the earth round?", correct: "Like a ball", distractors: ["Like a box", "Like a plate", "Like a cup"], explanation: "The earth is round like a ball." },
  { text: "What is the sun made of?", correct: "Hot gases", distractors: ["Ice", "Water", "Rocks"], explanation: "The sun is a ball of hot gases." },
  { text: "Which season brings rain?", correct: "The rainy season", distractors: ["The dry season", "The cold season", "The harvest"], explanation: "Rain falls in the rainy season." },
  { text: "How long is one day?", correct: "Twenty-four hours", distractors: ["Twelve hours", "One hour", "One week"], explanation: "One day is twenty-four hours." },
  { text: "Why do we see the sun in the day?", correct: "The sun is up", distractors: ["The stars are white", "The clouds go away", "It rains"], explanation: "The sun is up in the day." },
  { text: "What makes rain stop?", correct: "The clouds go", distractors: ["The sun hides", "The wind sleeps", "The moon goes"], explanation: "Rain stops when the clouds move away." },
  { text: "Which one is nearer to us?", correct: "The moon", distractors: ["The sun", "A star", "A cloud"], explanation: "The moon is nearer to us than the sun." },
  { text: "Which season is hot and dry?", correct: "Harmattan", distractors: ["The rainy season", "August", "The cold season"], explanation: "Harmattan is hot, dry and dusty." },
];

const P46_BODY_BRONZE: Draft[] = [
  { text: "Which part of your body pumps blood?", correct: "The heart", distractors: ["The hand", "The foot", "The nose"], explanation: "The heart pumps blood around the body." },
  { text: "What do we use to see?", correct: "Our eyes", distractors: ["Our knees", "Our ears", "Our toes"], explanation: "We see with our eyes." },
  { text: "What do we use to hear?", correct: "Our ears", distractors: ["Our eyes", "Our nose", "Our mouth"], explanation: "We hear with our ears." },
  { text: "Which part chews food?", correct: "The teeth", distractors: ["The fingers", "The knees", "The elbow"], explanation: "Teeth chew our food." },
  { text: "What do we use to smell?", correct: "Our nose", distractors: ["Our eyes", "Our toes", "Our legs"], explanation: "We smell with our nose." },
  { text: "How many legs do we have?", correct: "Two", distractors: ["Four", "Six", "Eight"], explanation: "We have two legs." },
  { text: "What do we use to eat?", correct: "Our mouth", distractors: ["Our ears", "Our nose", "Our eyes"], explanation: "We eat with our mouth." },
  { text: "Which part helps us walk?", correct: "Our legs", distractors: ["Our nose", "Our ears", "Our eyes"], explanation: "We walk with our legs." },
];

const P46_BODY_SILVER: Draft[] = [
  { text: "Why wash your hands?", correct: "To kill germs", distractors: ["To cool them", "To make them soft", "To smell nice"], explanation: "Washing hands kills germs." },
  { text: "What do we brush twice a day?", correct: "Our teeth", distractors: ["Our toes", "Our elbows", "Our knees"], explanation: "Brush teeth twice a day." },
  { text: "Which foods make us strong?", correct: "Milk and beans", distractors: ["Candy", "Chips", "Cola"], explanation: "Milk and beans build strong bodies." },
  { text: "Why do we need clean water?", correct: "To stay healthy", distractors: ["To wash cars", "To fight fires", "To fill cans"], explanation: "Clean water keeps us healthy." },
  { text: "Which one is a healthy meal?", correct: "Rice and beans", distractors: ["Sweets", "Crisp", "Cola"], explanation: "Rice and beans make a good meal." },
  { text: "How many hours should we sleep?", correct: "Nine to eleven hours", distractors: ["Two hours", "Four hours", "One hour"], explanation: "Children need nine to eleven hours of sleep." },
  { text: "Why wash before meals?", correct: "To get rid of germs", distractors: ["To see better", "To hear better", "To run faster"], explanation: "Washing before meals removes germs." },
  { text: "Which drink is best for you?", correct: "Water", distractors: ["Cola", "Tea", "Soda"], explanation: "Water is the best drink for the body." },
];

const P46_BODY_GOLD: Draft[] = [
  { text: "Why is sleep good for you?", correct: "It helps us grow", distractors: ["It cools the sun", "It fills our belly", "It grows hair"], explanation: "Sleep helps the body grow and rest." },
  { text: "What does milk give us?", correct: "Strong bones", distractors: ["Fancy hair", "New clothes", "Big eyes"], explanation: "Milk builds strong bones." },
  { text: "Why should we eat fruit?", correct: "It has vitamins", distractors: ["It fills the bin", "It cleans shoes", "It cools the room"], explanation: "Fruits have vitamins the body needs." },
  { text: "What do germs cause?", correct: "Sickness", distractors: ["Health", "Strength", "Sleep"], explanation: "Germs make us sick." },
  { text: "Why is play good for the body?", correct: "It keeps us fit", distractors: ["It cools the house", "It scares germs", "It boils food"], explanation: "Play keeps the body strong and fit." },
  { text: "Which one is not good?", correct: "Not washing hands", distractors: ["Brushing teeth", "Eating fruit", "Sleeping early"], explanation: "Unwashed hands carry germs." },
  { text: "What helps cuts heal?", correct: "Keeping them clean", distractors: ["Leaving them dirty", "Putting mud on them", "Skipping meals"], explanation: "Clean cuts heal faster." },
  { text: "Why is rest after work good?", correct: "It refreshes the body", distractors: ["It grows hair", "It boils blood", "It cools soup"], explanation: "Rest lets the body recover." },
];

/* ================= BAND 7-9 (Explorers) ================= */

const P79_LIVING_BRONZE: Draft[] = [
  { text: "What do plants need to grow?", correct: "Sunlight, water and soil", distractors: ["Milk, bread and sugar", "Salt, sand and stone", "Ice, snow and wind"], explanation: "Plants need sunlight, water and soil." },
  { text: "Which of these is a living thing?", correct: "A goat", distractors: ["A table", "A bicycle", "A stone"], explanation: "A goat eats, grows and reproduces." },
  { text: "What do green plants make from sunlight?", correct: "Food", distractors: ["Water", "Soil", "Air"], explanation: "Plants make food from sunlight." },
  { text: "Which ones are grass eaters?", correct: "Goats and cows", distractors: ["Lions and tigers", "Eagles and hawks", "Sharks and whales"], explanation: "Goats and cows eat grass." },
  { text: "Where do fishes live?", correct: "In water", distractors: ["In trees", "In nests", "On roofs"], explanation: "Fish live and breathe in water." },
  { text: "What do we call animals that eat plants?", correct: "Herbivores", distractors: ["Carnivores", "Omnivores", "Scavengers"], explanation: "Herbivores eat only plants." },
  { text: "What covers a fish body?", correct: "Scales", distractors: ["Feathers", "Fur", "Hair"], explanation: "Fish bodies are covered with scales." },
  { text: "Which of these can fly?", correct: "An eagle", distractors: ["A goat", "A snail", "A fish"], explanation: "An eagle flies with its wings." },
];

const P79_LIVING_SILVER: Draft[] = [
  { text: "Why do plants need sunlight?", correct: "To make their food", distractors: ["To sleep well", "To grow roots only", "To make flowers red"], explanation: "Sunlight helps plants make food." },
  { text: "What do we call animals that eat meat?", correct: "Carnivores", distractors: ["Herbivores", "Omnivores", "Plant eaters"], explanation: "Carnivores eat meat." },
  { text: "What does a food chain show?", correct: "Who eats who", distractors: ["How to cook rice", "Where the sun rises", "How to plant maize"], explanation: "A food chain shows who eats who." },
  { text: "Why do farmers need bees?", correct: "Bees pollinate crops", distractors: ["Bees guard the farm", "Bees give milk", "Bees eat weeds"], explanation: "Bees help crops set fruit and seed." },
  { text: "What do plants breathe in?", correct: "Carbon dioxide", distractors: ["Oxygen", "Nitrogen", "Helium"], explanation: "Plants take in carbon dioxide and give out oxygen." },
  { text: "How are seeds spread by wind?", correct: "The wind carries them", distractors: ["Wind eats them", "Wind melts them", "Wind paints them"], explanation: "Wind carries light seeds to new places." },
  { text: "Which part of a plant makes food?", correct: "The leaf", distractors: ["The root", "The flower", "The seed"], explanation: "Leaves make food for the plant." },
  { text: "Why do trees lose leaves in dry season?", correct: "To save water", distractors: ["To make room for fruit", "To scare birds", "To grow taller"], explanation: "Losing leaves helps trees save water." },
];

const P79_LIVING_GOLD: Draft[] = [
  { text: "What if there were no plants?", correct: "We would have no food or oxygen", distractors: ["Nothing would change", "The sun would shine more", "The rain would stop forever"], explanation: "Plants give us food and the air we breathe." },
  { text: "Why must we not cut all trees?", correct: "We need them for air and rain", distractors: ["They block our view", "They are too noisy", "They eat our crops"], explanation: "Trees give fresh air and help rainfall." },
  { text: "How do plants help animals?", correct: "They give food and air", distractors: ["They give games", "They give cars", "They give phones"], explanation: "Plants give animals food and oxygen." },
  { text: "Which animal hunts at night?", correct: "The owl", distractors: ["The cow", "The goat", "The dove"], explanation: "An owl hunts at night." },
  { text: "Why do we plant trees?", correct: "For fresh air and shade", distractors: ["For noise", "For dust", "For darkness"], explanation: "Trees clean the air and give shade." },
  { text: "What does a lizard eat?", correct: "Insects", distractors: ["Stones", "Leaves", "Water"], explanation: "Lizards eat insects like ants and flies." },
  { text: "Why are they hunted?", correct: "For their skin, horns and meat", distractors: ["For their noise", "For their colour", "For their names"], explanation: "Poachers kill animals for skin and horns." },
  { text: "How can we protect fish in rivers?", correct: "By not pouring poison into them", distractors: ["By fishing more", "By adding sand", "By building more banks"], explanation: "Poison kills the fish in our rivers." },
];

const P79_MATTER_BRONZE: Draft[] = [
  { text: "Which of these is a solid?", correct: "A spoon", distractors: ["Water", "Air", "Milk"], explanation: "A spoon is a solid." },
  { text: "Which one is a liquid?", correct: "Milk", distractors: ["A pencil", "A chair", "A stone"], explanation: "Milk is a liquid." },
  { text: "What do we breathe in?", correct: "Air", distractors: ["Water", "Sand", "Smoke"], explanation: "We breathe in air." },
  { text: "Which of these can melt?", correct: "Ice", distractors: ["A rock", "A key", "A brick"], explanation: "Ice melts when heated." },
  { text: "What happens when steam cools?", correct: "It becomes water", distractors: ["It becomes salt", "It becomes smoke", "It stays steam"], explanation: "Steam cools and turns back to water." },
  { text: "Which is heavier, a stone or a leaf?", correct: "A stone", distractors: ["A leaf", "A feather", "A piece of paper"], explanation: "A stone is heavier than a leaf." },
  { text: "What do we get when water boils?", correct: "Steam", distractors: ["Ice", "Smoke", "Sand"], explanation: "Boiling water gives steam." },
  { text: "Which one can we see through?", correct: "Clean glass", distractors: ["A brick", "A wooden door", "A black cloth"], explanation: "Clean glass is clear." },
];

const P79_MATTER_SILVER: Draft[] = [
  { text: "Why does metal feel cold?", correct: "It takes heat from our hands", distractors: ["It makes its own cold", "It is always cold", "It eats the heat"], explanation: "Metal takes heat from the skin, so it feels cold." },
  { text: "Which is best for a cooking pot?", correct: "Metal", distractors: ["Paper", "Cloth", "Sponge"], explanation: "Metal conducts heat well for cooking." },
  { text: "What is a mixture?", correct: "Things mixed together, not joined", distractors: ["A single pure thing", "A living thing", "A broken thing"], explanation: "A mixture has two or more things mixed together." },
  { text: "How can we part sand and water?", correct: "By filtering", distractors: ["By stirring only", "By adding salt", "By freezing it"], explanation: "A filter holds back the sand." },
  { text: "Which one does a magnet not pick?", correct: "A plastic comb", distractors: ["A nail", "A pin", "An iron key"], explanation: "Magnets pick iron, not plastic." },
  { text: "Why is glass used for windows?", correct: "It lets light through", distractors: ["It is very soft", "It is very warm", "It is light in colour"], explanation: "Clear glass lets light pass through." },
  { text: "What is water made of?", correct: "Hydrogen and oxygen", distractors: ["Salt and sugar", "Sand and stone", "Iron and dust"], explanation: "Water is made of hydrogen and oxygen." },
  { text: "What does salt do in water?", correct: "It dissolves", distractors: ["It stays on top", "It turns to gas", "It grows bigger"], explanation: "Salt dissolves in water." },
];

const P79_MATTER_GOLD: Draft[] = [
  { text: "How does salt mix in water?", correct: "It dissolves evenly", distractors: ["It stays at the bottom", "It floats on top", "It turns to gas"], explanation: "Salt dissolves evenly in water." },
  { text: "Which one is pure?", correct: "Table salt", distractors: ["Salt water", "Muddy water", "Sand water"], explanation: "Table salt is a pure substance." },
  { text: "How can we get salt from sea water?", correct: "By evaporating the water", distractors: ["By boiling and throwing the salt away", "By filtering it", "By freezing it"], explanation: "Sea water is evaporated to leave salt behind." },
  { text: "Why do wet clothes dry on a sunny day?", correct: "The heat turns water to vapour", distractors: ["The wind eats the water", "The sun paints them", "The air pushes them"], explanation: "Heat turns water into vapour, so clothes dry." },
  { text: "What happens to ice in the sun?", correct: "It melts", distractors: ["It freezes more", "It breaks into dust", "It turns to salt"], explanation: "Ice melts in the heat of the sun." },
  { text: "Why is iron good for nails?", correct: "It is very strong and hard", distractors: ["It bends easily", "It is very light", "It is soft"], explanation: "Iron is strong, so nails hold well." },
  { text: "Which one floats on water?", correct: "Wood", distractors: ["Iron", "Stone", "Lead"], explanation: "Wood floats on water." },
  { text: "Why do potters dry pots in the sun?", correct: "To make them hard", distractors: ["To colour them", "To melt them", "To shrink them"], explanation: "Drying makes clay pots hard." },
];

const P79_ENERGY_BRONZE: Draft[] = [
  { text: "Which of these gives light?", correct: "A candle", distractors: ["A stone", "A spoon", "A book"], explanation: "A candle gives light when it burns." },
  { text: "What is the main source of light for Earth?", correct: "The sun", distractors: ["The moon", "The stars", "A torch"], explanation: "The sun is the main source of light." },
  { text: "Food gives us what?", correct: "Energy", distractors: ["Salt", "Water", "Air"], explanation: "Food gives us energy." },
  { text: "Which one works with power?", correct: "A fan", distractors: ["A broom", "A bucket", "A spoon"], explanation: "A fan works with electricity." },
  { text: "Energy from the sun is what?", correct: "Solar energy", distractors: ["Wind power", "Water power", "Atomic energy"], explanation: "Energy from the sun is solar energy." },
  { text: "Which of these makes a sound?", correct: "A drum", distractors: ["A wall", "A pillow", "A book"], explanation: "A drum makes sound when struck." },
  { text: "How do we feel heat?", correct: "With our skin", distractors: ["With our ears", "With our nose", "With our eyes"], explanation: "Our skin senses heat." },
  { text: "What flows in wires?", correct: "Electric current", distractors: ["Water", "Gas", "Sound"], explanation: "Electric current flows in wires." },
];

const P79_ENERGY_SILVER: Draft[] = [
  { text: "Why does a metal spoon get hot in soup?", correct: "It carries heat", distractors: ["It makes heat", "It eats heat", "It breathes heat"], explanation: "Metal carries heat up the spoon." },
  { text: "Which one keeps soup hot longest?", correct: "A flask", distractors: ["An open pot", "A glass bowl", "A bare plate"], explanation: "A flask keeps soup hot for hours." },
  { text: "How does sound move?", correct: "By vibrations in the air", distractors: ["By light rays", "By heat waves", "By magnetism"], explanation: "Sound travels as vibrations in the air." },
  { text: "What does a dam give us?", correct: "Electricity", distractors: ["Food", "Fuel", "Clothes"], explanation: "A dam uses moving water to make electricity." },
  { text: "Why do heavy things need more force to push?", correct: "They have more mass", distractors: ["They are taller", "They are wider", "They are older"], explanation: "Heavy things have more mass to move." },
  { text: "Which is good at passing heat?", correct: "Metal", distractors: ["Wood", "Plastic", "Rubber"], explanation: "Metal passes heat easily." },
  { text: "Why is the sun hot?", correct: "It is a huge ball of hot gas", distractors: ["It burns coal", "It reflects moon light", "It is close to us"], explanation: "The sun is a huge ball of hot gas." },
  { text: "What can wind do for us?", correct: "Turn windmills to make electricity", distractors: ["Drown houses", "Spoil crops", "Blow away boats"], explanation: "Wind can turn windmills to make electricity." },
];

const P79_ENERGY_GOLD: Draft[] = [
  { text: "Why do solar panels need the sun?", correct: "They change sunlight to power", distractors: ["They need rain", "They use the moon", "They hide from heat"], explanation: "Solar panels turn sunlight into electricity." },
  { text: "How does heat move through a spoon?", correct: "By conduction", distractors: ["By convection", "By radiation", "By evaporation"], explanation: "Heat moves through solids by conduction." },
  { text: "Why do shoes have rubber soles?", correct: "They last long and grip well", distractors: ["They are cheap only", "They are soft and weak", "They conduct electricity"], explanation: "Rubber grips and lasts long." },
  { text: "Why do mirrors show us?", correct: "Mirrors reflect light", distractors: ["Mirrors give off light", "Mirrors eat light", "Mirrors make shadows"], explanation: "Mirrors reflect light back to our eyes." },
  { text: "What does a drum give us?", correct: "Sound energy", distractors: ["Light energy", "Heat energy", "Atomic energy"], explanation: "Beating a drum makes sound energy." },
  { text: "Why must we switch off lights?", correct: "To save electricity", distractors: ["To make the room dark for fun", "To make bulbs last always", "To please the teacher"], explanation: "Switching off lights saves electricity." },
  { text: "How is wind made?", correct: "By air moving from hot to cold areas", distractors: ["By the sea moving", "By trees waving", "By rain falling"], explanation: "Wind is moving air, from hot to cold areas." },
  { text: "Which one burns to give energy?", correct: "Petrol", distractors: ["Water", "Sand", "Salt"], explanation: "Petrol burns to give energy." },
];

const P79_EARTH_BRONZE: Draft[] = [
  { text: "Which planet do we live on?", correct: "Earth", distractors: ["Mars", "Venus", "Jupiter"], explanation: "We live on planet Earth." },
  { text: "What is the moon?", correct: "A natural satellite of Earth", distractors: ["A star", "A planet", "A cloud"], explanation: "The moon is a natural satellite of Earth." },
  { text: "What gives us light by day?", correct: "The sun", distractors: ["The moon", "Lamps", "Stars"], explanation: "The sun gives us light by day." },
  { text: "Which one brings rain?", correct: "Clouds", distractors: ["Trees", "Stones", "The moon"], explanation: "Rain falls from clouds." },
  { text: "What happens when water boils?", correct: "It becomes steam", distractors: ["It becomes ice", "It becomes salt", "It becomes sand"], explanation: "Boiling water becomes steam." },
  { text: "Which is our star?", correct: "The sun", distractors: ["The pole star", "Sirius", "The moon"], explanation: "The sun is the star nearest to us." },
  { text: "What falls from the sky?", correct: "Rain", distractors: ["Stones", "Leaves", "Feathers"], explanation: "Rain falls from the sky." },
  { text: "Where do rivers flow to?", correct: "The sea", distractors: ["The sky", "The desert always", "The sun"], explanation: "Rivers flow to the sea." },
];

const P79_EARTH_SILVER: Draft[] = [
  { text: "Why does it rain?", correct: "Water vapour cools and falls", distractors: ["Clouds burst from wind", "The sun cries", "Birds drink the clouds"], explanation: "Water vapour cools in the sky and falls as rain." },
  { text: "What do we call a group of stars?", correct: "A constellation", distractors: ["A comet", "An orbit", "A galaxy of none"], explanation: "A group of stars is a constellation." },
  { text: "Which season is dry?", correct: "Harmattan", distractors: ["The rainy season", "The cold season", "August"], explanation: "Harmattan is the dry season." },
  { text: "Why is Earth a planet?", correct: "It goes around the sun", distractors: ["It makes its own light", "It is a star", "It is made of gas"], explanation: "Earth goes round the sun, so it is a planet." },
  { text: "What is the sea made of?", correct: "Salt water", distractors: ["Fresh water", "Mud", "Oil"], explanation: "The sea is salt water." },
  { text: "Why do we have day and night?", correct: "The earth turns on its axis", distractors: ["The sun goes round us", "The moon blocks the sun", "Clouds cover the sky"], explanation: "The earth turns, giving us day and night." },
  { text: "What do we use to see stars?", correct: "A telescope", distractors: ["A stethoscope", "A thermometer", "A microscope"], explanation: "A telescope makes far stars look close." },
  { text: "Which of these is not a planet?", correct: "The sun", distractors: ["Mars", "Venus", "Jupiter"], explanation: "The sun is a star, not a planet." },
];

const P79_EARTH_GOLD: Draft[] = [
  { text: "Why does the moon seem to shine?", correct: "It reflects light from the sun", distractors: ["It makes its own light", "It burns gas", "It glows like fire"], explanation: "The moon shines by reflecting sunlight." },
  { text: "What is weather?", correct: "The state of the air at a place", distractors: ["The shape of the sky", "The heat of the sun only", "The number of stars"], explanation: "Weather is the state of the air at a place." },
  { text: "Why does the sea taste salty?", correct: "Rivers carry salt into it", distractors: ["Fish put salt in it", "Rain falls as salt water", "People pour salt in it"], explanation: "Rivers carry salt into the sea." },
  { text: "Why do floods happen?", correct: "Heavy rain fills rivers too fast", distractors: ["The sea rises by itself", "Farmers open dams always", "Sand blocks the sky"], explanation: "Heavy rain can fill rivers too fast." },
  { text: "Which planet is the red one?", correct: "Mars", distractors: ["Venus", "Jupiter", "Mercury"], explanation: "Mars is known as the red planet." },
  { text: "Why is the sky blue?", correct: "The air scatters sunlight", distractors: ["The sea reflects up", "The sky is painted", "The sun is blue"], explanation: "Air scatters sunlight, which makes the sky look blue." },
  { text: "What does the word climate mean?", correct: "The usual weather of a place", distractors: ["One day's weather", "A storm warning", "The wind speed"], explanation: "Climate is the usual weather of a place." },
  { text: "How does rain water help farms?", correct: "It waters the crops", distractors: ["It washes away farm tools", "It rusts the farm tools", "It floods the yam barns"], explanation: "Rain waters the crops on the farm." },
];

const P79_BODY_BRONZE: Draft[] = [
  { text: "Which organ pumps blood?", correct: "The heart", distractors: ["The lungs", "The liver", "The kidneys"], explanation: "The heart pumps blood around the body." },
  { text: "What do your lungs do?", correct: "Help you breathe", distractors: ["Pump blood", "Digest food", "Make urine"], explanation: "The lungs help you breathe." },
  { text: "How many senses do we have?", correct: "Five", distractors: ["Four", "Six", "Seven"], explanation: "We have five senses." },
  { text: "Which organ helps you see?", correct: "The eyes", distractors: ["The ears", "The nose", "The skin"], explanation: "The eyes help us see." },
  { text: "What is the healthiest drink?", correct: "Water", distractors: ["Cola", "Energy drinks", "Sweet tea"], explanation: "Water is the healthiest drink." },
  { text: "Which part of the leg bends?", correct: "The knee", distractors: ["The elbow", "The shoulder", "The neck"], explanation: "The knee bends the leg." },
  { text: "Rice gives us what?", correct: "Energy", distractors: ["Salt", "Vitamins only", "Water"], explanation: "Rice gives the body energy." },
  { text: "What is blood?", correct: "A red liquid that carries food and oxygen", distractors: ["A watery juice", "A thick oil", "Dirt in the body"], explanation: "Blood carries food and oxygen around the body." },
];

const P79_BODY_SILVER: Draft[] = [
  { text: "Why wash fruits before eating?", correct: "To remove dirt and germs", distractors: ["To make them sweet", "To cool them", "To change their colour"], explanation: "Washing fruits removes dirt and germs." },
  { text: "Which food is rich in vitamin C?", correct: "Oranges", distractors: ["Rice", "Yam", "Beans"], explanation: "Oranges are rich in vitamin C." },
  { text: "Why is exercise good for the heart?", correct: "It makes the heart strong", distractors: ["It makes the heart lazy", "It stops blood flow", "It fills the lungs with dust"], explanation: "Exercise makes the heart stronger." },
  { text: "What do you do when ill?", correct: "See a doctor or nurse", distractors: ["Keep silent always", "Eat junk food", "Play outside all day"], explanation: "A doctor or nurse cares for the sick." },
  { text: "Which food is good for teeth?", correct: "Milk", distractors: ["Sweets", "Soda", "Chips"], explanation: "Milk builds strong teeth." },
  { text: "Why is too much salt bad?", correct: "It raises blood pressure", distractors: ["It makes you sneeze", "It cools the body too much", "It causes hair loss"], explanation: "Too much salt can raise blood pressure." },
  { text: "Why do we need protein?", correct: "To build and repair body tissues", distractors: ["To give quick energy", "To help eyes only", "To make bones soft"], explanation: "Protein builds and repairs the body." },
  { text: "Why should children drink milk?", correct: "It builds strong bones and teeth", distractors: ["It makes them tall at once", "It gives instant energy", "It stops all diseases"], explanation: "Milk builds strong bones and teeth in children." },
];

const P79_BODY_GOLD: Draft[] = [
  { text: "Why do we need vitamins?", correct: "To prevent deficiency diseases", distractors: ["To make nails shiny", "To grow hair faster", "To sleep better only"], explanation: "Vitamins prevent deficiency diseases." },
  { text: "Which sickness does fruit stop?", correct: "Scurvy", distractors: ["Malaria", "Typhoid", "Cholera"], explanation: "Fruits rich in vitamin C prevent scurvy." },
  { text: "How does the heart beat?", correct: "By squeezing and relaxing its muscles", distractors: ["By blowing air into it", "By the lungs pushing it", "By the brain shaking it"], explanation: "The heart beats by squeezing and relaxing." },
  { text: "Why is too much sugar bad?", correct: "It can cause tooth decay and diabetes", distractors: ["It makes blood cold", "It stops the heart", "It cools the brain"], explanation: "Too much sugar can cause tooth decay and diabetes." },
  { text: "What does the liver do?", correct: "It cleans the blood", distractors: ["It pumps blood", "It breathes air", "It stores urine"], explanation: "The liver cleans the blood." },
  { text: "Why should we sleep enough?", correct: "For the body to rest and grow", distractors: ["To dream more dreams", "To eat more", "To grow taller overnight only"], explanation: "Sleep lets the body rest and grow." },
  { text: "How are germs spread?", correct: "Through dirty hands, air, food and water", distractors: ["Through clean air only", "Through sunlight", "Through sound"], explanation: "Germs spread through dirty hands, air, food and water." },
  { text: "Why is a mixed diet good?", correct: "It gives all the nutrients the body needs", distractors: ["It costs less money", "It tastes better", "It cooks faster"], explanation: "A mixed diet gives all the nutrients the body needs." },
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

function toQuestions(bandId: string, topicId: string, prefix: string, levels: Record<Level, Draft[]>): Question[] {
  const band = bandById(bandId);
  if (!band) throw new Error(`unknown band ${bandId}`);
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${bandId} ${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${band.token}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: band.id,
        subject: "science",
        topic: topicId as Question["topic"],
        level,
        text: d.text,
        options: optionsFor(d.correct, d.distractors, index),
        correctIndex: index,
        explanation: d.explanation,
        curriculumRef: refFor(bandId, topicId, level),
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

const BUILDERS: Record<string, Record<string, TopicDef>> = {
  "4-6": {
    "living-things": { id: "living-things", prefix: "LIV", levels: { bronze: P46_LIVING_BRONZE, silver: P46_LIVING_SILVER, gold: P46_LIVING_GOLD } },
    matter: { id: "matter", prefix: "MAT", levels: { bronze: P46_MATTER_BRONZE, silver: P46_MATTER_SILVER, gold: P46_MATTER_GOLD } },
    energy: { id: "energy", prefix: "ENE", levels: { bronze: P46_ENERGY_BRONZE, silver: P46_ENERGY_SILVER, gold: P46_ENERGY_GOLD } },
    "earth-space": { id: "earth-space", prefix: "EAR", levels: { bronze: P46_EARTH_BRONZE, silver: P46_EARTH_SILVER, gold: P46_EARTH_GOLD } },
    "body-health": { id: "body-health", prefix: "BOD", levels: { bronze: P46_BODY_BRONZE, silver: P46_BODY_SILVER, gold: P46_BODY_GOLD } },
  },
  "7-9": {
    "living-things": { id: "living-things", prefix: "LIV", levels: { bronze: P79_LIVING_BRONZE, silver: P79_LIVING_SILVER, gold: P79_LIVING_GOLD } },
    matter: { id: "matter", prefix: "MAT", levels: { bronze: P79_MATTER_BRONZE, silver: P79_MATTER_SILVER, gold: P79_MATTER_GOLD } },
    energy: { id: "energy", prefix: "ENE", levels: { bronze: P79_ENERGY_BRONZE, silver: P79_ENERGY_SILVER, gold: P79_ENERGY_GOLD } },
    "earth-space": { id: "earth-space", prefix: "EAR", levels: { bronze: P79_EARTH_BRONZE, silver: P79_EARTH_SILVER, gold: P79_EARTH_GOLD } },
    "body-health": { id: "body-health", prefix: "BOD", levels: { bronze: P79_BODY_BRONZE, silver: P79_BODY_SILVER, gold: P79_BODY_GOLD } },
  },
};

let errors = 0;
for (const bandId of Object.keys(BUILDERS)) {
  const outDir = path.resolve(`src/server/data/questions/${bandId}/science`);
  mkdirSync(outDir, { recursive: true });
  const band = bandById(bandId)!;
  for (const topicId of Object.keys(BUILDERS[bandId]!)) {
    const builder = BUILDERS[bandId]![topicId]!;
    const topic = TOPICS.find((t) => t.id === builder.id);
    if (!topic) throw new Error(`unknown topic ${builder.id}`);
    const questions = toQuestions(bandId, builder.id, builder.prefix, builder.levels);
    const file: TopicFile = { band: band.id, subject: "science", topic: builder.id as never, title: topic.label, questions };
    const issues = validateTopicFile(file, {});
    const bad = issues.filter((i) => i.severity === "error");
    if (!isClean(issues)) {
      errors += bad.length;
      console.error(`\n${bandId}/${builder.id}: ${bad.length} errors`);
      for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
    } else {
      console.log(`${bandId}/${builder.id}: ${questions.length} questions clean`);
    }
    writeFileSync(path.join(outDir, `${builder.id}.json`), JSON.stringify(file, null, 2) + "\n");
  }
}

if (errors > 0) process.exitCode = 1;
