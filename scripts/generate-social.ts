import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Social Studies starter bank for the three age bands. Written by hand, checked by the validator.
 * Eight questions per level, twenty four per topic, per band. The live game never calls an AI service.
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
const SUBJECT_PREFIX = "SOC";
const AUTHOR = "AI draft v1";

/** Curriculum reference level names per band and level. */
const REF_LEVEL: Record<string, Record<Level, string>> = {
  "4-6": { bronze: "Nursery 2", silver: "Primary 1", gold: "Primary 1" },
  "7-9": { bronze: "Primary 3", silver: "Primary 3", gold: "Primary 3" },
  "10-12": { bronze: "Primary 5", silver: "Primary 5", gold: "Primary 5" },
};
const REFS: Record<string, Record<string, string>> = {
  family: { "4-6": "the family", "7-9": "the family", "10-12": "the family" },
  community: { "4-6": "our community", "7-9": "our community", "10-12": "our community" },
  civic: { "4-6": "civic duties", "7-9": "civic duties", "10-12": "civic duties" },
  culture: { "4-6": "Nigerian culture", "7-9": "Nigerian culture", "10-12": "Nigerian culture" },
};

function ref(bandId: string, topic: string, level: Level): string {
  return `NERDC ${REF_LEVEL[bandId]![level]} Social Studies, ${REFS[topic]![bandId]}`;
}

const L46_FAMILY_BRONZE: Draft[] = [
  {
    text: "Who cooks the food at home?",
    correct: "Mother",
    distractors: ["The tailor", "The driver", "The pilot"],
    explanation: "Mothers prepare meals in many Nigerian homes.",
    ref: "",
  },
  {
    text: "Who takes you to school?",
    correct: "My parents",
    distractors: ["The goat", "The rain", "The cat"],
    explanation: "Parents take their children to school.",
    ref: "",
  },
  {
    text: "Who lives with you at your home?",
    correct: "Family members",
    distractors: ["Shopkeepers", "Farmers", "Pilots"],
    explanation: "People who live together at home are family.",
    ref: "",
  },
  {
    text: "What does your family eat for lunch?",
    correct: "Rice and stew",
    distractors: ["Sand", "Stones", "Paper"],
    explanation: "Rice and stew are common Nigerian lunch dishes.",
    ref: "",
  },
  {
    text: "Who teaches you good manners at home?",
    correct: "My parents",
    distractors: ["The radio", "The chair", "The rain"],
    explanation: "Parents teach children how to behave well.",
    ref: "",
  },
  {
    text: "What should you say when you want something?",
    correct: "Please",
    distractors: ["Nothing", "Give me", "Now"],
    explanation: "Say please to ask for things politely.",
    ref: "",
  },
  {
    text: "Who is your mother's own mother?",
    correct: "Grandma",
    distractors: ["Sister", "Auntie", "Teacher"],
    explanation: "Your mother's mother is your grandma.",
    ref: "",
  },
  {
    text: "How should you talk to elders?",
    correct: "With respect",
    distractors: ["With shouting", "With rudeness", "With noise"],
    explanation: "Always speak to elders with respect.",
    ref: "",
  },
];

const L46_FAMILY_SILVER: Draft[] = [
  {
    text: "What is a family made of?",
    correct: "People who care for each other",
    distractors: ["Only rich people", "Only adults", "People on TV"],
    explanation: "A family is people who live and care together.",
    ref: "",
  },
  {
    text: "Why do homes share food?",
    correct: "So everyone is fed",
    distractors: ["To waste food", "To sell it", "To hide it"],
    explanation: "Sharing food is a kind family habit.",
    ref: "",
  },
  {
    text: "Who helps when a child is sick?",
    correct: "The parents",
    distractors: ["The neighbour's cat", "The wind", "The shop"],
    explanation: "Parents care for sick children and take them to hospital.",
    ref: "",
  },
  {
    text: "What work does a tailor do?",
    correct: "Sews clothes",
    distractors: ["Fixes cars", "Grows rice", "Drives buses"],
    explanation: "A tailor sews dresses and shirts for people.",
    ref: "",
  },
  {
    text: "What does a farmer grow?",
    correct: "Crops like maize",
    distractors: ["Clothes", "Cars", "Phones"],
    explanation: "Farmers grow crops such as maize, rice and yams.",
    ref: "",
  },
  {
    text: "How can children help at home?",
    correct: "By tidying their toys",
    distractors: ["By sleeping all day", "By fighting", "By hiding"],
    explanation: "Children can pack toys and sweep small areas.",
    ref: "",
  },
  {
    text: "What should you do before meals?",
    correct: "Wash your hands",
    distractors: ["Run outside", "Sleep", "Shout"],
    explanation: "Clean hands stop germs from entering the body.",
    ref: "",
  },
  {
    text: "Who keeps the home safe and clean?",
    correct: "The whole family",
    distractors: ["Only visitors", "Nobody", "Only teachers"],
    explanation: "Every family member shares in keeping the home clean.",
    ref: "",
  },
];

const L46_FAMILY_GOLD: Draft[] = [
  {
    text: "Why is it good to eat together?",
    correct: "Family bonds grow stronger",
    distractors: ["Food tastes better", "It saves money", "No reason"],
    explanation: "Sharing meals brings family members closer.",
    ref: "",
  },
  {
    text: "How do parents show love?",
    correct: "By caring for their children",
    distractors: ["By buying toys only", "By shouting", "By leaving them"],
    explanation: "Parents show love through care, time and food.",
    ref: "",
  },
  {
    text: "What can a child do when sad?",
    correct: "Tell a parent",
    distractors: ["Hide away", "Break toys", "Stay silent"],
    explanation: "Talking to a parent helps a child feel better.",
    ref: "",
  },
  {
    text: "Why should we respect our parents?",
    correct: "They care for us",
    distractors: ["They give orders", "We fear them", "For gifts"],
    explanation: "Parents work hard to feed and protect their children.",
    ref: "",
  },
  {
    text: "How can we save money at home?",
    correct: "Spend only what we need",
    distractors: ["Buy many toys", "Waste food", "Borrow always"],
    explanation: "Buying only what is needed saves money.",
    ref: "",
  },
  {
    text: "Why do people live in families?",
    correct: "To love and support each other",
    distractors: ["To make noise", "To have fights", "To hide"],
    explanation: "Families give love, care and support to members.",
    ref: "",
  },
  {
    text: "Why do we visit our elders?",
    correct: "To show respect",
    distractors: ["To play loudly", "To collect gifts", "To sleep"],
    explanation: "Visiting elders shows love and respect.",
    ref: "",
  },
  {
    text: "How can we show love at home?",
    correct: "By helping and sharing",
    distractors: ["By shouting", "By refusing", "By ignoring"],
    explanation: "Helping and sharing are ways of showing love.",
    ref: "",
  },
];

const L46_COMMUNITY_BRONZE: Draft[] = [
  {
    text: "Where do we buy food?",
    correct: "At the market",
    distractors: ["At school", "At the library", "On the road"],
    explanation: "Markets sell food and goods in Nigeria.",
    ref: "",
  },
  {
    text: "Who sells food in the market?",
    correct: "A trader",
    distractors: ["A nurse", "A pilot", "A teacher"],
    explanation: "Traders sell food at the market.",
    ref: "",
  },
  {
    text: "What do we call a place where people live?",
    correct: "A community",
    distractors: ["A bedroom", "A basket", "A river"],
    explanation: "People who live together form a community.",
    ref: "",
  },
  {
    text: "Who puts out fires?",
    correct: "Firefighters",
    distractors: ["Teachers", "Nurses", "Drivers"],
    explanation: "Firefighters put out fires and save lives.",
    ref: "",
  },
  {
    text: "What do we use to travel?",
    correct: "Cars and buses",
    distractors: ["Spoons", "Chairs", "Books"],
    explanation: "Cars and buses help us travel around.",
    ref: "",
  },
  {
    text: "Who treats sick people?",
    correct: "A doctor",
    distractors: ["A farmer", "A tailor", "A barber"],
    explanation: "Doctors and nurses help sick people get well.",
    ref: "",
  },
  {
    text: "What is a road used for?",
    correct: "For travelling",
    distractors: ["For sleeping", "For cooking", "For swimming"],
    explanation: "Roads help people and cars move around.",
    ref: "",
  },
  {
    text: "Who keeps the market clean?",
    correct: "Market cleaners",
    distractors: ["Nobody", "Visitors only", "The rain"],
    explanation: "Cleaners keep our markets safe and tidy.",
    ref: "",
  },
];

const L46_COMMUNITY_SILVER: Draft[] = [
  {
    text: "Where do we buy fresh fish?",
    correct: "At the market",
    distractors: ["At the library", "At the bank", "At the clinic"],
    explanation: "Fresh fish is sold in our markets.",
    ref: "",
  },
  {
    text: "What does a nurse do?",
    correct: "Cares for sick people",
    distractors: ["Builds houses", "Sings songs", "Sells shoes"],
    explanation: "Nurses help doctors care for patients.",
    ref: "",
  },
  {
    text: "Why do we have traffic lights?",
    correct: "To control cars safely",
    distractors: ["To make noise", "To save light", "To guide birds"],
    explanation: "Traffic lights stop crashes and keep roads safe.",
    ref: "",
  },
  {
    text: "Who mends a burst pipe?",
    correct: "A plumber",
    distractors: ["A teacher", "A farmer", "A nurse"],
    explanation: "Plumbers fix burst pipes and taps.",
    ref: "",
  },
  {
    text: "Where do we go for lessons?",
    correct: "School",
    distractors: ["Market", "Hospital", "Bank"],
    explanation: "Schools teach children reading and maths.",
    ref: "",
  },
  {
    text: "What is a market for?",
    correct: "Buying and selling",
    distractors: ["Sleeping", "Bathing", "Dancing"],
    explanation: "A market is where people buy and sell goods.",
    ref: "",
  },
  {
    text: "Why do we need a hospital?",
    correct: "To treat sick people",
    distractors: ["To buy food", "To watch films", "To play games"],
    explanation: "Hospitals give care to people who are ill.",
    ref: "",
  },
  {
    text: "How does a trader help us?",
    correct: "By selling goods",
    distractors: ["By shouting at us", "By closing shop", "By sleeping"],
    explanation: "Traders sell the things we need each day.",
    ref: "",
  },
];

const L46_COMMUNITY_GOLD: Draft[] = [
  {
    text: "Why should we keep our town clean?",
    correct: "To stop disease",
    distractors: ["To win prizes", "To please visitors", "No reason"],
    explanation: "Clean towns stop germs and keep people healthy.",
    ref: "",
  },
  {
    text: "How can we help our neighbours?",
    correct: "By offering our hands",
    distractors: ["By fighting", "By stealing", "By ignoring them"],
    explanation: "Good neighbours help each other in times of need.",
    ref: "",
  },
  {
    text: "What makes a good leader?",
    correct: "Honesty and fairness",
    distractors: ["A loud voice", "A big car", "Fine clothes"],
    explanation: "Good leaders are honest and treat all fairly.",
    ref: "",
  },
  {
    text: "Why do we obey the law?",
    correct: "To keep everyone safe",
    distractors: ["To avoid work", "For prizes", "To impress"],
    explanation: "Laws keep order and protect everyone.",
    ref: "",
  },
  {
    text: "What is the work of a post office?",
    correct: "Delivering letters",
    distractors: ["Selling bread", "Fixing cars", "Teaching pupils"],
    explanation: "The post office moves letters across the country.",
    ref: "",
  },
  {
    text: "How do good roads help us?",
    correct: "They ease travel and trade",
    distractors: ["They store rain", "They stop trade", "They block travel"],
    explanation: "Good roads link markets and help trade.",
    ref: "",
  },
  {
    text: "Why must our traders be truthful?",
    correct: "So buyers trust them",
    distractors: ["So they cheat", "So they get rich quick", "No real reason"],
    explanation: "Honest traders build trust with their buyers.",
    ref: "",
  },
  {
    text: "What does a clean town give us?",
    correct: "Health and joy",
    distractors: ["Dirt and sickness", "Loud noise", "Broken roads"],
    explanation: "Clean places keep people strong and happy.",
    ref: "",
  },
];

const L46_CIVIC_BRONZE: Draft[] = [
  {
    text: "What does a good citizen do?",
    correct: "Obeys the rules",
    distractors: ["Breaks laws", "Cheats others", "Litters the street"],
    explanation: "Good citizens follow rules and do their duty.",
    ref: "",
  },
  {
    text: "What is a law?",
    correct: "A rule for everyone",
    distractors: ["A toy", "A song", "A game"],
    explanation: "Laws are rules everyone must follow.",
    ref: "",
  },
  {
    text: "Who belongs to our country?",
    correct: "A citizen",
    distractors: ["A stranger passing", "A ghost", "A cloud"],
    explanation: "A citizen is a full member of a country.",
    ref: "",
  },
  {
    text: "What must we do at a red light?",
    correct: "Stop the car",
    distractors: ["Go fast", "Wave hands", "Sleep"],
    explanation: "Red means stop so roads stay safe.",
    ref: "",
  },
  {
    text: "Telling the truth is called what?",
    correct: "Honesty",
    distractors: ["Laziness", "Greed", "Fear"],
    explanation: "Honesty means always telling the truth.",
    ref: "",
  },
  {
    text: "What should you do if you find money?",
    correct: "Tell an adult",
    distractors: ["Keep it secret", "Spend it", "Hide it"],
    explanation: "Found money should be reported to an adult.",
    ref: "",
  },
  {
    text: "Why do we have rules in school?",
    correct: "To keep order",
    distractors: ["To stop fun", "To punish us", "No reason"],
    explanation: "Rules help everyone learn in peace.",
    ref: "",
  },
  {
    text: "How should we welcome guests?",
    correct: "With warmth and respect",
    distractors: ["With fear", "With rudeness", "By hiding"],
    explanation: "Welcoming guests is part of Nigerian culture.",
    ref: "",
  },
];

const L46_CIVIC_SILVER: Draft[] = [
  {
    text: "What does civic duty mean for us?",
    correct: "Our duties as citizens",
    distractors: ["A type of dance", "Homework", "A tax only"],
    explanation: "Civic duties are what citizens owe their country.",
    ref: "",
  },
  {
    text: "Why must we vote fair and square?",
    correct: "For honest leaders",
    distractors: ["For food", "For money", "For fun"],
    explanation: "Honest votes give us leaders we can trust.",
    ref: "",
  },
  {
    text: "What is the job of a policeman?",
    correct: "Protects people and keeps peace",
    distractors: ["Sells bread", "Teaches maths", "Grows yam"],
    explanation: "The police keep law and order in our towns.",
    ref: "",
  },
  {
    text: "What do we mark on 1 October?",
    correct: "Nigeria's independence",
    distractors: ["New Year", "Christmas", "Eid"],
    explanation: "On 1 October 1960 Nigeria became independent.",
    ref: "",
  },
  {
    text: "In a good country, who rules?",
    correct: "The people",
    distractors: ["Kings only", "Nobody", "Strangers"],
    explanation: "In a democracy the people choose their leaders.",
    ref: "",
  },
  {
    text: "Why do we pay tax?",
    correct: "To build roads and schools",
    distractors: ["To buy toys", "To punish us", "To close shops"],
    explanation: "Taxes pay for roads, schools and hospitals.",
    ref: "",
  },
  {
    text: "What is the highest law?",
    correct: "The constitution",
    distractors: ["The market price", "The town crier", "School rules"],
    explanation: "The constitution is the highest law of Nigeria.",
    ref: "",
  },
  {
    text: "Why must we not take bribes?",
    correct: "It is against the law",
    distractors: ["It is free", "It makes us tall", "It is allowed"],
    explanation: "Bribery is wrong and against the law.",
    ref: "",
  },
];

const L46_CIVIC_GOLD: Draft[] = [
  {
    text: "Why should all obey the law?",
    correct: "Laws protect everyone",
    distractors: ["Laws stop fun", "Laws are optional", "Laws favour the rich"],
    explanation: "Laws apply to all and keep society fair.",
    ref: "",
  },
  {
    text: "When you see cheating, what should you do?",
    correct: "Report it honestly",
    distractors: ["Join in", "Ignore it", "Laugh at it"],
    explanation: "Reporting wrongdoing keeps society honest.",
    ref: "",
  },
  {
    text: "Why should adults vote?",
    correct: "To choose good leaders",
    distractors: ["To win money", "To avoid work", "To get gifts"],
    explanation: "Voting lets citizens choose honest leaders.",
    ref: "",
  },
  {
    text: "What is the meaning of justice?",
    correct: "Fair treatment for all",
    distractors: ["Harsh punishment", "Favouritism", "Revenge"],
    explanation: "Justice means everyone is treated fairly.",
    ref: "",
  },
  {
    text: "How can we serve our nation?",
    correct: "By studying hard",
    distractors: ["By fighting", "By cheating", "By sleeping"],
    explanation: "Studying hard prepares us to serve Nigeria.",
    ref: "",
  },
  {
    text: "What should you do if you see a crime?",
    correct: "Tell the police",
    distractors: ["Join in", "Run and hide forever", "Keep silent"],
    explanation: "Reporting crime helps the police protect everyone.",
    ref: "",
  },
  {
    text: "Why do we need fair leaders?",
    correct: "They serve all people",
    distractors: ["They get praise", "They get gifts", "No real reason"],
    explanation: "Honest leaders put everyone first.",
    ref: "",
  },
  {
    text: "What does good rule give us?",
    correct: "Safety and fair play",
    distractors: ["Chaos and fear", "Endless taxes only", "Nothing"],
    explanation: "Good government keeps citizens safe and treated fairly.",
    ref: "",
  },
];

const L46_CULTURE_BRONZE: Draft[] = [
  {
    text: "Which language do you speak?",
    correct: "Yoruba, Igbo or Hausa",
    distractors: ["French only", "Chinese", "Arabic only"],
    explanation: "Nigeria has many languages like Yoruba, Igbo and Hausa.",
    ref: "",
  },
  {
    text: "Why do we hold grand festivals?",
    correct: "To celebrate our culture",
    distractors: ["To fight", "To sleep", "To sell food"],
    explanation: "Festivals mark happy cultural occasions.",
    ref: "",
  },
  {
    text: "What is the name of our country?",
    correct: "Nigeria",
    distractors: ["Ghana", "Kenya", "Egypt"],
    explanation: "We live in Nigeria, our great country.",
    ref: "",
  },
  {
    text: "What do we wear on special days?",
    correct: "Traditional attire",
    distractors: ["School uniforms only", "Wet clothes", "Torn clothes"],
    explanation: "Traditional clothes show our cultural beauty.",
    ref: "",
  },
  {
    text: "What is Abuja?",
    correct: "The capital of Nigeria",
    distractors: ["A state", "A river", "A market"],
    explanation: "Abuja is the capital city of Nigeria.",
    ref: "",
  },
  {
    text: "How should we greet elders?",
    correct: "With respect and a bow",
    distractors: ["With shouting", "With silence", "With anger"],
    explanation: "Greeting with a bow shows honour to elders.",
    ref: "",
  },
  {
    text: "Which food do we love most?",
    correct: "Rice and yam",
    distractors: ["Ice cream only", "Grass", "Sandwiches daily"],
    explanation: "Rice, yam and cassava are favourite Nigerian foods.",
    ref: "",
  },
  {
    text: "What colours are on our flag?",
    correct: "Green and white",
    distractors: ["Red and blue", "Black and gold", "Yellow and red"],
    explanation: "The Nigerian flag is green and white.",
    ref: "",
  },
];

const L46_CULTURE_SILVER: Draft[] = [
  {
    text: "What is Jollof rice?",
    correct: "A Nigerian food",
    distractors: ["A dance", "A song", "A language"],
    explanation: "Jollof rice is a beloved Nigerian dish.",
    ref: "",
  },
  {
    text: "What is the New Yam festival for?",
    correct: "To thank God for harvest",
    distractors: ["To welcome kings", "To mourn the dead", "To open schools"],
    explanation: "The New Yam festival honours the harvest season.",
    ref: "",
  },
  {
    text: "Which tribe speaks Hausa?",
    correct: "The Hausa people",
    distractors: ["The Zulu people", "The Maasai", "The Inuit"],
    explanation: "Hausa is spoken mainly in the north of Nigeria.",
    ref: "",
  },
  {
    text: "What do we sing each day?",
    correct: "The national anthem",
    distractors: ["A birthday song", "A lullaby", "A church song only"],
    explanation: "The national anthem honours our country.",
    ref: "",
  },
  {
    text: "What is Adire cloth?",
    correct: "A Yoruba dyed cloth",
    distractors: ["A dance", "A drum", "A dish"],
    explanation: "Adire is a beautiful hand-dyed Yoruba cloth.",
    ref: "",
  },
  {
    text: "What do the Hausa call a cap?",
    correct: "A fila",
    distractors: ["A buba", "A wrapper", "A turban"],
    explanation: "A Hausa fila is a colourful round cap.",
    ref: "",
  },
  {
    text: "What is garri made from?",
    correct: "Cassava",
    distractors: ["Yam", "Maize", "Rice"],
    explanation: "Garri is made from cassava tubers.",
    ref: "",
  },
  {
    text: "What do we beat at festivals?",
    correct: "Drums",
    distractors: ["Spoons", "Books", "Stones"],
    explanation: "Talking drums are played at Nigerian festivals.",
    ref: "",
  },
];

const L46_CULTURE_GOLD: Draft[] = [
  {
    text: "Why is our culture key?",
    correct: "It is our shared heritage",
    distractors: ["It is old only", "It has no value", "It is foreign"],
    explanation: "Culture unites us and shapes our identity.",
    ref: "",
  },
  {
    text: "How does music lift our hearts?",
    correct: "It moves and joins us",
    distractors: ["It divides us", "It bores us", "It silences us"],
    explanation: "Music brings people together in joy.",
    ref: "",
  },
  {
    text: "What does the national dress show?",
    correct: "Our pride and heritage",
    distractors: ["Our wealth only", "Our anger", "Our foreign ties"],
    explanation: "National dress shows our pride in Nigerian heritage.",
    ref: "",
  },
  {
    text: "Why should we love our tongue?",
    correct: "It keeps our heritage alive",
    distractors: ["It is fun only", "It wins prizes", "No reason"],
    explanation: "Our mother tongue carries our stories and wisdom.",
    ref: "",
  },
  {
    text: "What is one good of festivals?",
    correct: "They teach respect for tradition",
    distractors: ["They cost money only", "They cause fights", "They spoil food"],
    explanation: "Festivals pass culture from parents to children.",
    ref: "",
  },
  {
    text: "How do we keep culture alive?",
    correct: "By teaching our children",
    distractors: ["By forgetting it", "By mocking it", "By hiding it"],
    explanation: "Teaching culture keeps Nigerian heritage alive.",
    ref: "",
  },
  {
    text: "What is a masquerade dance for?",
    correct: "To honour ancestral spirits",
    distractors: ["To scare children", "To sell masks", "To chase tourists"],
    explanation: "Masquerades honour the spirits of our ancestors.",
    ref: "",
  },
  {
    text: "Why do we respect all tribes?",
    correct: "All Nigerians are one",
    distractors: ["Some tribes are better", "No need", "Only our tribe matters"],
    explanation: "Every tribe is equal; we are one Nigeria.",
    ref: "",
  },
];

const L79_FAMILY_BRONZE: Draft[] = [
  {
    text: "Who takes care of the children at home?",
    correct: "The parents",
    distractors: ["The neighbours", "The shopkeeper", "The driver"],
    explanation: "Parents love and care for their children at home.",
    ref: "",
  },
  {
    text: "What should children do to help at home?",
    correct: "Tidy their rooms",
    distractors: ["Break plates", "Ignore chores", "Fight"],
    explanation: "Helping with chores builds good character.",
    ref: "",
  },
  {
    text: "What is the duty of an elder brother?",
    correct: "To guide his younger ones",
    distractors: ["To boss everyone about", "To play all day", "To stay quiet"],
    explanation: "Elder brothers protect and guide their younger siblings.",
    ref: "",
  },
  {
    text: "Why do families pray?",
    correct: "To grow closer to God",
    distractors: ["To win prizes", "To rush bedtime", "No reason"],
    explanation: "Family prayer strengthens love and faith.",
    ref: "",
  },
  {
    text: "Who heads a single parent home?",
    correct: "One parent only",
    distractors: ["Both parents", "Grandparents only", "No one"],
    explanation: "A single-parent home has one parent caring for the children.",
    ref: "",
  },
  {
    text: "How do parents provide for us?",
    correct: "By working to earn money",
    distractors: ["By wishing", "By borrowing always", "By begging"],
    explanation: "Parents work hard to feed, clothe and train us.",
    ref: "",
  },
  {
    text: "Who belongs to a big family?",
    correct: "Uncles, aunts and cousins",
    distractors: ["Only parents", "Only children", "No one"],
    explanation: "Extended family includes uncles, aunts and grandparents.",
    ref: "",
  },
  {
    text: "What are chores?",
    correct: "Small jobs at home",
    distractors: ["Exams", "Games", "Holidays"],
    explanation: "Chores are small duties like sweeping and washing dishes.",
    ref: "",
  },
];

const L79_FAMILY_SILVER: Draft[] = [
  {
    text: "How are good values learnt?",
    correct: "By copying parents",
    distractors: ["By watching TV only", "By keeping quiet", "By fighting"],
    explanation: "Children learn manners and values by copying their parents.",
    ref: "",
  },
  {
    text: "Why respect our parents?",
    correct: "They care for us",
    distractors: ["They are bossy", "They own us", "For their money"],
    explanation: "Parents deserve respect for their sacrifices.",
    ref: "",
  },
  {
    text: "Why settle home quarrels?",
    correct: "Quarrels divide the home",
    distractors: ["Quarrels are fun", "Quarrels bring gifts", "No reason"],
    explanation: "Quick settlement keeps the family peaceful.",
    ref: "",
  },
  {
    text: "What is the role of grandparents?",
    correct: "To guide and share wisdom",
    distractors: ["To cook only", "To travel abroad", "To stay away"],
    explanation: "Grandparents teach culture, history and wise counsel.",
    ref: "",
  },
  {
    text: "How can families spend time?",
    correct: "Eating and talking together",
    distractors: ["Sleeping apart", "Watching screens only", "Fighting"],
    explanation: "Shared meals and stories strengthen family bonds.",
    ref: "",
  },
  {
    text: "Why do homes plan spending?",
    correct: "To avoid debt",
    distractors: ["To flash wealth", "To please neighbours", "No reason"],
    explanation: "Planning spending stops waste and debt.",
    ref: "",
  },
  {
    text: "What is the danger of broken homes?",
    correct: "Children may lack care",
    distractors: ["Houses collapse", "Food spoils", "Schools close"],
    explanation: "Children from broken homes often need extra support.",
    ref: "",
  },
  {
    text: "How should siblings act?",
    correct: "With love and patience",
    distractors: ["With jealousy", "With violence", "With mockery"],
    explanation: "Siblings must love, share and forgive each other.",
    ref: "",
  },
];

const L79_FAMILY_GOLD: Draft[] = [
  {
    text: "Why is the family called the first school?",
    correct: "It teaches a child first",
    distractors: ["It has classrooms", "It gives homework", "It is near school"],
    explanation: "The family teaches values before any school does.",
    ref: "",
  },
  {
    text: "How does lack of money affect homes?",
    correct: "Children may miss school",
    distractors: ["Houses grow bigger", "Food tastes better", "It brings joy"],
    explanation: "Poor homes may struggle to feed and school children.",
    ref: "",
  },
  {
    text: "Why do some children live with aunties?",
    correct: "Parents may be away or passed on",
    distractors: ["For fun only", "To avoid chores", "By accident"],
    explanation: "Kinship care is a Nigerian tradition of support.",
    ref: "",
  },
  {
    text: "What is the duty of parents to children?",
    correct: "To feed, train and protect",
    distractors: ["To farm only", "To travel abroad", "To sell the home"],
    explanation: "Nigerian law expects parents to care for their children.",
    ref: "",
  },
  {
    text: "How do we settle home disputes?",
    correct: "By talking and forgiving",
    distractors: ["By shouting", "By hiding", "By fighting"],
    explanation: "Calm talk and forgiveness heal broken hearts.",
    ref: "",
  },
  {
    text: "Why do foster homes matter?",
    correct: "They shelter children in need",
    distractors: ["For praise", "They must", "No reason"],
    explanation: "Foster parents sacrifice much to raise other children.",
    ref: "",
  },
  {
    text: "What is loyalty at home?",
    correct: "Standing by your family",
    distractors: ["Betraying secrets", "Ignoring relatives", "Chasing money"],
    explanation: "Loyalty means supporting family members in all seasons.",
    ref: "",
  },
  {
    text: "How do good homes shape society?",
    correct: "Children grow into good citizens",
    distractors: ["Society gets worse", "No effect", "Houses improve"],
    explanation: "Strong families build strong, honest nations.",
    ref: "",
  },
];

const L79_COMMUNITY_BRONZE: Draft[] = [
  {
    text: "Where do farmers sell their yams?",
    correct: "At the market",
    distractors: ["At the library", "At the clinic", "At the mosque"],
    explanation: "The market is where farm goods are sold.",
    ref: "",
  },
  {
    text: "Who cleans the streets in a town?",
    correct: "The sanitation workers",
    distractors: ["Only the president", "Nobody", "Visitors"],
    explanation: "Sanitation workers keep our streets clean.",
    ref: "",
  },
  {
    text: "What does a bank do?",
    correct: "Keeps money safe",
    distractors: ["Sells food", "Tells stories", "Repairs cars"],
    explanation: "Banks keep money safe and lend to businesses.",
    ref: "",
  },
  {
    text: "What is a neighbour?",
    correct: "Someone living near you",
    distractors: ["A stranger in another country", "A shop in town", "A river"],
    explanation: "Neighbours are the people who live close to us.",
    ref: "",
  },
  {
    text: "How many states do we have?",
    correct: "Thirty-six states and the FCT",
    distractors: ["Ten states", "Twenty states", "One hundred states"],
    explanation: "Nigeria has thirty-six states and the FCT, Abuja.",
    ref: "",
  },
  {
    text: "What does a fireman do?",
    correct: "Puts out fires",
    distractors: ["Polices traffic", "Teaches pupils", "Builds roads"],
    explanation: "Firefighters rescue people from burning buildings.",
    ref: "",
  },
  {
    text: "What is the main market in Lagos?",
    correct: "Balogun market",
    distractors: ["Onitsha market", "Kano market", "Aba market"],
    explanation: "Balogun market is a famous Lagos trading hub.",
    ref: "",
  },
  {
    text: "What does a librarian do?",
    correct: "Manages the library",
    distractors: ["Sells medicine", "Drives buses", "Cooks meals"],
    explanation: "Librarians help people find books to read.",
    ref: "",
  },
];

const L79_COMMUNITY_SILVER: Draft[] = [
  {
    text: "Why are markets vital to a town?",
    correct: "They link buyers and sellers",
    distractors: ["They waste money", "They cause fights", "They close schools"],
    explanation: "Markets connect farmers and traders with buyers.",
    ref: "",
  },
  {
    text: "What does the council do?",
    correct: "Manages local roads and markets",
    distractors: ["Makes national laws", "Prints money", "Runs the navy"],
    explanation: "The local council runs markets, roads and refuse.",
    ref: "",
  },
  {
    text: "Why do we have a fire service?",
    correct: "To fight fires and save lives",
    distractors: ["To entertain", "To sell water", "To guard banks"],
    explanation: "The fire service responds to fire outbreaks quickly.",
    ref: "",
  },
  {
    text: "What is one job of the council?",
    correct: "Collecting refuse",
    distractors: ["Minting money", "Running airports", "Judging cases"],
    explanation: "The local council handles refuse and local roads.",
    ref: "",
  },
  {
    text: "Why should we obey traffic rules?",
    correct: "To stop accidents",
    distractors: ["To impress police", "To drive fast", "To save fuel"],
    explanation: "Traffic rules keep road users safe.",
    ref: "",
  },
  {
    text: "How can young people improve their town?",
    correct: "Volunteering and cleaning",
    distractors: ["Complaining only", "Breaking benches", "Dropping dirt"],
    explanation: "Voluntary work makes communities better.",
    ref: "",
  },
  {
    text: "What does a town crier do?",
    correct: "Spreads news to villagers",
    distractors: ["Sells clothes", "Heals the sick", "Builds houses"],
    explanation: "The town crier used to announce news and meetings.",
    ref: "",
  },
  {
    text: "Why do towns hold market days?",
    correct: "To gather traders and buyers",
    distractors: ["To play music", "To rest", "To close shops"],
    explanation: "Market days bring trade and social life together.",
    ref: "",
  },
];

const L79_COMMUNITY_GOLD: Draft[] = [
  {
    text: "How does city growth affect housing?",
    correct: "Demand rises and rents climb",
    distractors: ["Rents fall always", "No change", "Houses disappear"],
    explanation: "More people in cities means fewer affordable homes.",
    ref: "",
  },
  {
    text: "Why do we join town meetings?",
    correct: "To air our views",
    distractors: ["To sell goods", "To eat free food", "To sleep"],
    explanation: "Town meetings let citizens voice concerns and ideas.",
    ref: "",
  },
  {
    text: "Why is open waste dumping bad?",
    correct: "It spreads diseases",
    distractors: ["It saves money", "It smells nice", "It helps farms"],
    explanation: "Waste in the open spreads cholera and typhoid.",
    ref: "",
  },
  {
    text: "How do local banks help traders?",
    correct: "They give small loans",
    distractors: ["They close shops", "They raise prices", "They ban trade"],
    explanation: "Small loans let traders buy more stock.",
    ref: "",
  },
  {
    text: "Why is clean water vital?",
    correct: "It prevents waterborne diseases",
    distractors: ["It tastes sweet only", "It fills rivers", "No real reason"],
    explanation: "Clean water stops cholera and diarrhoea.",
    ref: "",
  },
  {
    text: "What can a youth corps member do?",
    correct: "Teach in rural schools",
    distractors: ["Avoid all duty", "Fight in wars", "Sell drugs"],
    explanation: "NYSC members serve communities in health and education.",
    ref: "",
  },
  {
    text: "How do farmer groups help?",
    correct: "They pool resources for bulk buying",
    distractors: ["They fix prices high", "They quarrel", "They do nothing"],
    explanation: "Cooperatives let farmers buy and sell together.",
    ref: "",
  },
  {
    text: "Why is waste recycling good?",
    correct: "It reduces rubbish and pollution",
    distractors: ["It costs less never", "It creates jobs only", "It has no use"],
    explanation: "Recycling turns waste into useful products.",
    ref: "",
  },
];

const L79_CIVIC_BRONZE: Draft[] = [
  {
    text: "What does honesty mean?",
    correct: "Telling the truth always",
    distractors: ["Being rich", "Being loud", "Being quick"],
    explanation: "Honesty is truth in word and action.",
    ref: "",
  },
  {
    text: "What should you do if you break a rule?",
    correct: "Admit it and accept the result",
    distractors: ["Blame others", "Run away", "Lie about it"],
    explanation: "Owning our mistakes shows good character.",
    ref: "",
  },
  {
    text: "Why do schools have rules?",
    correct: "To keep order and safety",
    distractors: ["To stop play", "To make children sad", "No reason"],
    explanation: "Rules make school safe and fair for all.",
    ref: "",
  },
  {
    text: "What is a ballot box used for?",
    correct: "Casting votes in an election",
    distractors: ["Storing books", "Keeping money", "Holding letters"],
    explanation: "Voters drop their marked ballot papers into the box.",
    ref: "",
  },
  {
    text: "What is a good citizen?",
    correct: "Someone who obeys laws",
    distractors: ["Someone who breaks rules", "Someone who hides taxes", "Someone loud"],
    explanation: "Good citizens obey laws and help others.",
    ref: "",
  },
  {
    text: "What does the police do?",
    correct: "Enforces the law",
    distractors: ["Sells goods", "Teaches classes", "Sings songs"],
    explanation: "The police maintain law and order.",
    ref: "",
  },
  {
    text: "Why should we keep promises?",
    correct: "Our word should be trusted",
    distractors: ["For gifts", "It is fun", "No reason"],
    explanation: "Keeping promises builds trust with others.",
    ref: "",
  },
  {
    text: "What is the meaning of respect?",
    correct: "Treating others with dignity",
    distractors: ["Fearing everyone", "Ignoring elders", "Shouting at people"],
    explanation: "Respect means honouring the worth of every person.",
    ref: "",
  },
];

const L79_CIVIC_SILVER: Draft[] = [
  {
    text: "What are human rights?",
    correct: "Basic freedoms for all people",
    distractors: ["Special favours for the rich", "Punishments for criminals", "Toys for children"],
    explanation: "Human rights belong to every person.",
    ref: "",
  },
  {
    text: "What is freedom of speech?",
    correct: "The right to speak freely",
    distractors: ["The right to hurt others", "The duty to shout", "The chance to fight"],
    explanation: "Freedom of speech is the right to express your opinions.",
    ref: "",
  },
  {
    text: "Why should citizens pay tax?",
    correct: "To fund public services",
    distractors: ["It is optional fun", "To avoid arrest", "For gifts"],
    explanation: "Taxes build roads, schools and hospitals.",
    ref: "",
  },
  {
    text: "What is the rule of law?",
    correct: "All are equal before the law",
    distractors: ["Kings rule by force", "The rich are above law", "Law favours friends"],
    explanation: "The rule of law means nobody is above the law.",
    ref: "",
  },
  {
    text: "How can we fight corruption?",
    correct: "By refusing bribes",
    distractors: ["By joining it", "By silence", "By celebrating it"],
    explanation: "Refusing and reporting bribes fights corruption.",
    ref: "",
  },
  {
    text: "What does INEC do?",
    correct: "Conducts free and fair elections",
    distractors: ["Collects taxes", "Chooses winners", "Prints money"],
    explanation: "INEC runs credible elections in Nigeria.",
    ref: "",
  },
  {
    text: "Why is voting a duty?",
    correct: "It is our civic responsibility",
    distractors: ["It gives free food", "It is fun", "It is optional sport"],
    explanation: "Voting is how citizens shape their country.",
    ref: "",
  },
  {
    text: "What do judges do?",
    correct: "Interpret the law",
    distractors: ["Make laws", "Enforce laws", "Break laws"],
    explanation: "Judges interpret and apply the law fairly.",
    ref: "",
  },
];

const L79_CIVIC_GOLD: Draft[] = [
  {
    text: "Why is INEC vital?",
    correct: "It runs elections",
    distractors: ["It collects taxes", "It builds roads", "It prints money"],
    explanation: "INEC conducts elections so Nigerians can choose leaders.",
    ref: "",
  },
  {
    text: "What is the harm of rigging?",
    correct: "True winners lose",
    distractors: ["Elections get cheaper", "Everyone wins", "Nobody cares"],
    explanation: "Rigging steals the people's voice and justice.",
    ref: "",
  },
  {
    text: "How does the rule of law protect us?",
    correct: "It stops leaders abusing power",
    distractors: ["It favours the rich", "It punishes all", "It removes freedom"],
    explanation: "Rule of law stops dictatorship and abuse.",
    ref: "",
  },
  {
    text: "Why must INEC stay neutral?",
    correct: "To conduct fair elections",
    distractors: ["To please the president", "To favour rich candidates", "For show only"],
    explanation: "A neutral INEC builds trust in elections.",
    ref: "",
  },
  {
    text: "What is the role of the press?",
    correct: "Informing the public",
    distractors: ["Selling newspapers only", "Entertaining only", "Hiding the truth"],
    explanation: "A free press reports honestly and checks power.",
    ref: "",
  },
  {
    text: "How can youths prepare to lead?",
    correct: "By studying and serving",
    distractors: ["By staying idle", "By complaining", "By dodging duty"],
    explanation: "Good leaders start as good students and citizens.",
    ref: "",
  },
  {
    text: "Why can we march in peace?",
    correct: "To express our grievances lawfully",
    distractors: ["To destroy property", "To fight police", "To block roads forever"],
    explanation: "Peaceful marching is a lawful way to air grievances.",
    ref: "",
  },
  {
    text: "What do lawmakers do?",
    correct: "They make laws",
    distractors: ["They run elections", "They judge cases", "They collect taxes"],
    explanation: "Lawmakers in the National Assembly make our laws.",
    ref: "",
  },
];

const L79_CULTURE_BRONZE: Draft[] = [
  {
    text: "What is the main language of the Hausa?",
    correct: "Hausa",
    distractors: ["Yoruba", "Igbo", "Fulfulde"],
    explanation: "Hausa is the language of the Hausa people.",
    ref: "",
  },
  {
    text: "Which tribe is known for the Benin bronze art?",
    correct: "The Edo people",
    distractors: ["The Igbo", "The Tiv", "The Kanuri"],
    explanation: "Benin City was famous for bronze artworks.",
    ref: "",
  },
  {
    text: "What is the Yoruba greeting style?",
    correct: "Prostrating or kneeling",
    distractors: ["Waving from afar", "Backing away", "Bowing sharply"],
    explanation: "Yoruba greeting customs show respect to elders.",
    ref: "",
  },
  {
    text: "What is the festival of the yam called?",
    correct: "The yam festival",
    distractors: ["The Eid festival", "The Christmas festival", "The Sallah festival"],
    explanation: "The New Yam festival celebrates the yam harvest.",
    ref: "",
  },
  {
    text: "The Igbo new yam festival is?",
    correct: "Iri Ji Mba",
    distractors: ["Ojude Oba", "Durbar", "Osun Osogbo"],
    explanation: "Iri Ji Mba is the Igbo New Yam festival.",
    ref: "",
  },
  {
    text: "What is Ojude Oba?",
    correct: "A Yoruba festival honouring kings",
    distractors: ["An Igbo mask dance", "A Hausa horse race", "A river festival"],
    explanation: "Ojude Oba celebrates Yoruba kings in Ijebu.",
    ref: "",
  },
  {
    text: "What is Durbar?",
    correct: "A Hausa horse parade festival",
    distractors: ["A fishing festival", "A harvest dance", "A wedding feast"],
    explanation: "Durbar is a grand Hausa and Fulani horse parade.",
    ref: "",
  },
  {
    text: "Which country lies west of Nigeria?",
    correct: "Benin Republic",
    distractors: ["Niger", "Chad", "Cameroon"],
    explanation: "Benin Republic borders Nigeria to the west.",
    ref: "",
  },
];

const L79_CULTURE_SILVER: Draft[] = [
  {
    text: "What is the meaning of the word culture?",
    correct: "The way of life of a people",
    distractors: ["A type of food", "A dance only", "A foreign dress"],
    explanation: "Culture includes language, food, dress and beliefs.",
    ref: "",
  },
  {
    text: "How many big tribes does Nigeria have?",
    correct: "Three main ones",
    distractors: ["One", "Two", "Ten"],
    explanation: "The Hausa, Yoruba and Igbo are the largest.",
    ref: "",
  },
  {
    text: "What is the art of Yoruba hand dyed cloth?",
    correct: "Adire",
    distractors: ["Aso Oke", "Kente", "Ankara"],
    explanation: "Adire is made with indigo dye and resist patterns.",
    ref: "",
  },
  {
    text: "What is Aso Oke?",
    correct: "A Yoruba handwoven cloth",
    distractors: ["A Hausa cap", "An Igbo wrapper", "A Tiv top"],
    explanation: "Aso Oke is worn at weddings and special events.",
    ref: "",
  },
  {
    text: "What is the Tiv language family?",
    correct: "Benue-Congo",
    distractors: ["Semitic", "Romance", "Slavic"],
    explanation: "Tiv belongs to the Benue-Congo language family.",
    ref: "",
  },
  {
    text: "What do the Igbo call their supreme god?",
    correct: "Chineke",
    distractors: ["Olodumare", "Ogun", "Ala"],
    explanation: "Chineke is the Igbo name for the supreme creator.",
    ref: "",
  },
  {
    text: "What is the Osun festival?",
    correct: "A Yoruba river goddess festival",
    distractors: ["A harvest feast", "A horse parade", "A yam rite"],
    explanation: "Osun Osogbo honours the river goddess Osun.",
    ref: "",
  },
  {
    text: "Why do we mark festivals?",
    correct: "To honour our shared heritage",
    distractors: ["To rest from work", "To sell food", "No reason"],
    explanation: "Festivals preserve unity and cultural pride.",
    ref: "",
  },
];

const L79_CULTURE_GOLD: Draft[] = [
  {
    text: "How does culture shape us?",
    correct: "It gives us shared values",
    distractors: ["It divides Nigeria", "It copies foreign ways", "It ignores history"],
    explanation: "Shared culture builds national unity.",
    ref: "",
  },
  {
    text: "What does our national anthem urge?",
    correct: "Unity and faith in God",
    distractors: ["Wealth and fame", "War and conquest", "Foreign travel"],
    explanation: "The anthem calls for unity and service.",
    ref: "",
  },
  {
    text: "How do trade fairs showcase culture?",
    correct: "They display crafts and foods",
    distractors: ["They hide traditions", "They sell foreign goods only", "They close markets"],
    explanation: "Trade fairs display Nigerian arts, foods and fashion.",
    ref: "",
  },
  {
    text: "Why save our heritage sites?",
    correct: "They teach our history",
    distractors: ["For tourists only", "They cost money", "No reason"],
    explanation: "Heritage sites connect us to our past.",
    ref: "",
  },
  {
    text: "Why are many cultures good?",
    correct: "It enriches national life",
    distractors: ["It divides us", "It confuses us", "It has no value"],
    explanation: "Diversity brings many foods, arts and views.",
    ref: "",
  },
  {
    text: "How does tourism help us?",
    correct: "It brings money and jobs",
    distractors: ["It spoils culture", "It closes museums", "It raises crime only"],
    explanation: "Tourism creates jobs and shows Nigeria to the world.",
    ref: "",
  },
  {
    text: "Why is the census held?",
    correct: "To count citizens for planning",
    distractors: ["To collect taxes", "To spy on people", "For fun"],
    explanation: "Census data guides schools, roads and hospitals.",
    ref: "",
  },
  {
    text: "What do Nigerians share?",
    correct: "One nation and common destiny",
    distractors: ["One tribe only", "One religion only", "Nothing at all"],
    explanation: "Nigerians share one nation, flag and destiny.",
    ref: "",
  },
];

const L1012_FAMILY_BRONZE: Draft[] = [
  {
    text: "What is a nuclear family?",
    correct: "Parents and their children",
    distractors: ["All relatives in one house", "Only grandparents", "A group of friends"],
    explanation: "A nuclear family has parents and their children.",
    ref: "",
  },
  {
    text: "What are parents' duties?",
    correct: "Feeding, clothing and educating children",
    distractors: ["Making money only", "Travelling abroad", "Working all day"],
    explanation: "Parents must provide for and train their children.",
    ref: "",
  },
  {
    text: "Who are aunts and uncles?",
    correct: "Extended family members",
    distractors: ["Parents", "Children", "Neighbours"],
    explanation: "Aunts and uncles are part of the extended family.",
    ref: "",
  },
  {
    text: "Why should children obey parents?",
    correct: "It shows respect and brings blessing",
    distractors: ["Parents own them", "It is fear only", "No reason"],
    explanation: "Obedience brings peace and blessing on the home.",
    ref: "",
  },
  {
    text: "What is the duty of children at home?",
    correct: "Helping with chores",
    distractors: ["Commanding parents", "Locking doors", "Selling the house"],
    explanation: "Children must help with age-appropriate chores.",
    ref: "",
  },
  {
    text: "How can homes stay united?",
    correct: "Through love and communication",
    distractors: ["By avoiding each other", "By fighting", "By keeping secrets"],
    explanation: "Open talk keeps families close and strong.",
    ref: "",
  },
  {
    text: "What is the meaning of family tree?",
    correct: "A chart of family members across generations",
    distractors: ["A tree grown by the family", "A family crest", "A type of fruit tree"],
    explanation: "A family tree shows how relatives are related.",
    ref: "",
  },
  {
    text: "Why do homes pray together?",
    correct: "To grow closer to God",
    distractors: ["To win prizes", "To impress guests", "No reason"],
    explanation: "Family prayer strengthens bond and faith.",
    ref: "",
  },
];

const L1012_FAMILY_SILVER: Draft[] = [
  {
    text: "How does the extended family help?",
    correct: "By sharing care and resources",
    distractors: ["By ignoring them", "By charging fees", "By fighting"],
    explanation: "Extended families cushion burdens and share care.",
    ref: "",
  },
  {
    text: "Why are home values important?",
    correct: "They shape character from childhood",
    distractors: ["They buy wealth", "They are outdated", "No reason"],
    explanation: "Values learnt at home guide us for life.",
    ref: "",
  },
  {
    text: "What makes a happy home?",
    correct: "Love, respect and support",
    distractors: ["Wealth and gadgets", "Many servants", "Big houses"],
    explanation: "Love and support, not money, make a home happy.",
    ref: "",
  },
  {
    text: "Why do some children live with guardians?",
    correct: "Parents may have passed or be abroad",
    distractors: ["For fun", "To escape chores", "By choice"],
    explanation: "Guardians care for children when parents cannot.",
    ref: "",
  },
  {
    text: "What is the role of the mother in a home?",
    correct: "Caring and nurturing the family",
    distractors: ["Working only", "Cooking only", "Travelling widely"],
    explanation: "Mothers nurture, guide and keep the home.",
    ref: "",
  },
  {
    text: "How do parents train children?",
    correct: "With love and firm rules",
    distractors: ["With abuse", "With neglect", "With bribery"],
    explanation: "Good discipline combines love with firmness.",
    ref: "",
  },
  {
    text: "Why does home income matter?",
    correct: "It covers feeding, school and health",
    distractors: ["It buys luxuries", "It impresses neighbours", "No reason"],
    explanation: "Income must cover basic needs before wants.",
    ref: "",
  },
  {
    text: "What does a family budget help with?",
    correct: "Avoiding waste and debt",
    distractors: ["Buying everything now", "Flashing wealth", "Borrowing more"],
    explanation: "Budgeting prevents debt and builds savings.",
    ref: "",
  },
];

const L1012_FAMILY_GOLD: Draft[] = [
  {
    text: "Why is family the base of society?",
    correct: "It shapes citizens' character",
    distractors: ["It builds houses", "It collects taxes", "It runs schools"],
    explanation: "Values learnt at home build the nation.",
    ref: "",
  },
  {
    text: "How does home violence hurt children?",
    correct: "It causes fear and trauma",
    distractors: ["It makes them strong", "It improves grades", "No effect"],
    explanation: "Violence at home scars children emotionally.",
    ref: "",
  },
  {
    text: "Why is talk vital in marriage?",
    correct: "It prevents misunderstandings",
    distractors: ["It wastes time", "It causes quarrels", "No effect"],
    explanation: "Open talk resolves problems before they grow.",
    ref: "",
  },
  {
    text: "How can homes support special children?",
    correct: "With patience and inclusion",
    distractors: ["By ignoring them", "By hiding them", "By sending them away"],
    explanation: "Every child deserves love, care and inclusion.",
    ref: "",
  },
  {
    text: "What is the meaning of a broken home?",
    correct: "A home where parents have separated",
    distractors: ["A house that fell down", "A very poor home", "A crowded home"],
    explanation: "Broken homes need extra support for the children.",
    ref: "",
  },
  {
    text: "Why register a new baby?",
    correct: "To give the child legal identity",
    distractors: ["To make hospital profit", "To decorate homes", "No reason"],
    explanation: "Birth registration proves identity and nationality.",
    ref: "",
  },
  {
    text: "How does child labour harm society?",
    correct: "It steals childhood and education",
    distractors: ["It builds wealth", "It trains skills", "No harm"],
    explanation: "Child labour denies children school and safety.",
    ref: "",
  },
  {
    text: "Why is the family the bedrock?",
    correct: "It nurtures future citizens",
    distractors: ["It builds houses", "It collects taxes", "It runs schools"],
    explanation: "Strong families raise capable, honest citizens.",
    ref: "",
  },
];

const L1012_COMMUNITY_BRONZE: Draft[] = [
  {
    text: "What does the local government do?",
    correct: "Runs grassroots affairs",
    distractors: ["Runs federal ministries", "Runs the navy", "Runs the central bank"],
    explanation: "Local government handles community roads, markets and refuse.",
    ref: "",
  },
  {
    text: "Why do traders need markets?",
    correct: "To sell goods and earn income",
    distractors: ["To make noise", "To beg", "To rest"],
    explanation: "Markets are where traders earn their living.",
    ref: "",
  },
  {
    text: "What does a public library offer?",
    correct: "Free access to books and study",
    distractors: ["Selling books only", "Showing films", "Selling food"],
    explanation: "Public libraries give free reading and study space.",
    ref: "",
  },
  {
    text: "What is the role of the fire service?",
    correct: "Fire prevention and rescue",
    distractors: ["Traffic control", "Ambulance service", "Electricity supply"],
    explanation: "The fire service rescues people from fires.",
    ref: "",
  },
  {
    text: "Why do towns hold meetings?",
    correct: "To plan development together",
    distractors: ["To fight", "To sell goods", "To rest"],
    explanation: "Town meetings gather citizens for shared decisions.",
    ref: "",
  },
  {
    text: "What do farmer groups do?",
    correct: "Help members pool resources",
    distractors: ["Fix prices always", "Ban farming", "Sell land only"],
    explanation: "Cooperatives let small farmers compete well.",
    ref: "",
  },
  {
    text: "What does cleaning do for health?",
    correct: "It prevents disease",
    distractors: ["It spoils food", "It spreads germs", "It wastes water"],
    explanation: "Clean surroundings stop diseases like cholera.",
    ref: "",
  },
  {
    text: "What is the duty of the police?",
    correct: "Maintaining law and order",
    distractors: ["Writing laws", "Judging cases", "Collecting taxes"],
    explanation: "The police enforce the law and protect citizens.",
    ref: "",
  },
];

const L1012_COMMUNITY_SILVER: Draft[] = [
  {
    text: "Why do cities grow crowded?",
    correct: "People move in for jobs",
    distractors: ["Cities build more houses", "Fewer people live there", "Government orders it"],
    explanation: "Rural-urban migration swells city populations.",
    ref: "",
  },
  {
    text: "What is the danger of slums?",
    correct: "Disease and poor sanitation",
    distractors: ["Too much space", "High rent only", "No traders"],
    explanation: "Slums breed disease and social problems.",
    ref: "",
  },
  {
    text: "How do community leaders serve their people?",
    correct: "By settling disputes and guiding development",
    distractors: ["By collecting fines", "By selling goods", "By keeping office forever"],
    explanation: "Traditional rulers settle disputes and drive development.",
    ref: "",
  },
  {
    text: "Why is waste disposal vital?",
    correct: "It keeps the environment healthy",
    distractors: ["It beautifies only", "It saves money", "It is a law only"],
    explanation: "Proper disposal prevents disease and pollution.",
    ref: "",
  },
  {
    text: "What is the role of the traditional ruler?",
    correct: "Custodian of culture and peace",
    distractors: ["Tax collector", "Head of government", "Party chairman"],
    explanation: "Traditional rulers guard culture and foster peace.",
    ref: "",
  },
  {
    text: "How can we report crimes?",
    correct: "Through the police or hotlines",
    distractors: ["Through gossip", "Through fights", "By ignoring them"],
    explanation: "Prompt reporting helps the police act fast.",
    ref: "",
  },
  {
    text: "Why is power vital to shops?",
    correct: "Machines and refrigeration need it",
    distractors: ["It lights streets only", "It cools houses only", "No importance"],
    explanation: "Steady power keeps shops and factories running.",
    ref: "",
  },
  {
    text: "What does rural growth bring?",
    correct: "Schools, clinics and roads",
    distractors: ["Only water pipes", "Only electricity", "Only markets"],
    explanation: "Development brings schools, clinics and tarred roads.",
    ref: "",
  },
];

const L1012_COMMUNITY_GOLD: Draft[] = [
  {
    text: "How does city growth strain services?",
    correct: "Overcrowding, traffic and waste",
    distractors: ["Better services for all", "Lower rents", "No effect"],
    explanation: "Rapid growth overwhelms roads, housing and water.",
    ref: "",
  },
  {
    text: "Why is private sector partnership key?",
    correct: "Combined funds build better roads",
    distractors: ["It favours only the rich", "It wastes money", "No benefit"],
    explanation: "Public-private partnerships fund infrastructure faster.",
    ref: "",
  },
  {
    text: "How can citizens check projects?",
    correct: "Demand budgets, audits and reports",
    distractors: ["Avoid them", "Destroy them", "Ignore them"],
    explanation: "Citizens can demand transparency and accountability.",
    ref: "",
  },
  {
    text: "What is the danger of fake drugs?",
    correct: "They harm or kill people",
    distractors: ["They save money", "They work better", "No risk"],
    explanation: "Fake drugs cause deaths and treatment failure.",
    ref: "",
  },
  {
    text: "How does queueing at election booths show order?",
    correct: "It shows patience and fairness",
    distractors: ["It wastes time", "It favours nobody", "It causes fights"],
    explanation: "Orderly queues keep elections peaceful and fair.",
    ref: "",
  },
  {
    text: "Why is the railway coming back?",
    correct: "To move goods and people cheaply",
    distractors: ["For decoration", "To compete with buses", "No reason"],
    explanation: "Rail moves heavy goods and passengers cheaply.",
    ref: "",
  },
  {
    text: "Why do we have the NYSC scheme?",
    correct: "To build unity after school",
    distractors: ["To recruit soldiers", "To employ graduates only", "For parties"],
    explanation: "NYSC unites graduate youths in service to Nigeria.",
    ref: "",
  },
  {
    text: "What is the purpose of the census?",
    correct: "To plan national development",
    distractors: ["To collect taxes", "To spy on citizens", "To sell data"],
    explanation: "Census data guides schools, roads and hospitals planning.",
    ref: "",
  },
];

const L1012_CIVIC_BRONZE: Draft[] = [
  {
    text: "What is the meaning of voting?",
    correct: "Choosing leaders by ballot",
    distractors: ["Appointing friends to office", "Paying tax", "Joining a party"],
    explanation: "Voting is the citizen's voice in choosing leaders.",
    ref: "",
  },
  {
    text: "What does the constitution do?",
    correct: "Sets out how the country is governed",
    distractors: ["Lists prices of goods", "Names all citizens", "Describes foreign land"],
    explanation: "The constitution is the supreme law of Nigeria.",
    ref: "",
  },
  {
    text: "What are human rights?",
    correct: "Basic freedoms for every person",
    distractors: ["Rewards for the rich", "Duties of police", "Privileges for adults"],
    explanation: "Human rights belong to every Nigerian.",
    ref: "",
  },
  {
    text: "Why is the rule of law important?",
    correct: "No one is above the law",
    distractors: ["Rich people break rules", "Law is optional", "Police make their own laws"],
    explanation: "Rule of law treats every person equally.",
    ref: "",
  },
  {
    text: "What is a civic duty?",
    correct: "Duties owed to the community",
    distractors: ["Personal hobbies", "Paying school fees", "Travelling abroad"],
    explanation: "Civic duties include voting, tax and obeying law.",
    ref: "",
  },
  {
    text: "What is the job of the judiciary?",
    correct: "Interpreting the law",
    distractors: ["Making laws", "Enforcing laws", "Printing money"],
    explanation: "The judiciary applies the law to disputes.",
    ref: "",
  },
  {
    text: "What is INEC?",
    correct: "The electoral umpire",
    distractors: ["The tax office", "The police headquarters", "A bank"],
    explanation: "INEC conducts elections in Nigeria.",
    ref: "",
  },
  {
    text: "Why keep traffic laws?",
    correct: "To prevent road accidents",
    distractors: ["To impress officers", "To avoid fines only", "No reason"],
    explanation: "Traffic laws save lives on our roads.",
    ref: "",
  },
];

const L1012_CIVIC_SILVER: Draft[] = [
  {
    text: "How does the legislature make laws?",
    correct: "Through bills passed and signed",
    distractors: ["By presidential decree only", "By voting in markets", "By town criers"],
    explanation: "Bills are debated, passed and signed into law.",
    ref: "",
  },
  {
    text: "Why is press freedom important?",
    correct: "It checks abuse of power",
    distractors: ["It sells papers", "It entertains only", "It spreads rumours"],
    explanation: "A free press exposes wrongdoing and informs citizens.",
    ref: "",
  },
  {
    text: "What is the meaning of corruption?",
    correct: "Abuse of entrusted power",
    distractors: ["Honest work", "Charity giving", "Tax payment"],
    explanation: "Corruption is abuse of power for private gain.",
    ref: "",
  },
  {
    text: "How can youths fight corruption?",
    correct: "By refusing bribes and reporting them",
    distractors: ["By joining in", "By silence", "By running away"],
    explanation: "Integrity starts with each young Nigerian.",
    ref: "",
  },
  {
    text: "Why do we mark Democracy Day?",
    correct: "It honours our return to civil rule",
    distractors: ["It celebrates a coup", "It is a bank holiday only", "No reason"],
    explanation: "Democracy Day marks our democratic journey.",
    ref: "",
  },
  {
    text: "What does the audit office do?",
    correct: "Audits how public money is spent",
    distractors: ["Collects taxes", "Makes laws", "Runs hospitals"],
    explanation: "Audits ensure public funds are properly used.",
    ref: "",
  },
  {
    text: "Why study civics?",
    correct: "To prepare for citizenship",
    distractors: ["To become politicians only", "To pass exams only", "No reason"],
    explanation: "Civics prepares young people to govern wisely.",
    ref: "",
  },
  {
    text: "What is the meaning of the rule of law?",
    correct: "Everyone is equal before the law",
    distractors: ["The president makes all laws", "Police are above law", "Laws favour the rich"],
    explanation: "Rule of law binds rulers and citizens alike.",
    ref: "",
  },
];

const L1012_CIVIC_GOLD: Draft[] = [
  {
    text: "In what year did civil rule return?",
    correct: "1999",
    distractors: ["1960", "1975", "2015"],
    explanation: "Nigeria returned to democracy in 1999.",
    ref: "",
  },
  {
    text: "Why must INEC stay neutral?",
    correct: "To conduct free, fair elections",
    distractors: ["To please the ruling party", "To favour rich candidates", "For show only"],
    explanation: "A neutral INEC builds trust in elections.",
    ref: "",
  },
  {
    text: "What are checks and balances?",
    correct: "Arms of government limit each other",
    distractors: ["Balances in the treasury", "Bank account checks", "Weighing scales"],
    explanation: "Checks and balances stop any arm dominating.",
    ref: "",
  },
  {
    text: "How do courts check the government?",
    correct: "By striking down unlawful acts",
    distractors: ["By writing laws", "By running elections", "By collecting taxes"],
    explanation: "Courts can declare executive acts unconstitutional.",
    ref: "",
  },
  {
    text: "Why keep lawmakers neutral?",
    correct: "So laws work for all citizens",
    distractors: ["So they earn more", "So they fight the president", "For prestige"],
    explanation: "Separate lawmakers check the executive freely.",
    ref: "",
  },
  {
    text: "What is the duty of the opposition?",
    correct: "Criticising and offering alternatives",
    distractors: ["Fighting the police", "Plotting coups", "Selling manifestos"],
    explanation: "Opposition keeps government accountable in democracy.",
    ref: "",
  },
  {
    text: "How does the EFCC fight corruption?",
    correct: "By investigating and prosecuting offenders",
    distractors: ["By collecting taxes", "By printing money", "By running elections"],
    explanation: "EFCC probes and prosecutes financial crimes.",
    ref: "",
  },
  {
    text: "Why are free and fair elections vital?",
    correct: "They give voice to citizens",
    distractors: ["They cost little", "They empower party bosses", "No importance"],
    explanation: "Free elections reflect the people's will.",
    ref: "",
  },
];

const L1012_CULTURE_BRONZE: Draft[] = [
  {
    text: "Name the three largest ethnic groups in Nigeria.",
    correct: "Hausa, Yoruba and Igbo",
    distractors: ["Tiv, Kanuri and Ijaw", "Edo, Nupe and Fulani", "Ibibio, Efik and Yoruba"],
    explanation: "Hausa, Yoruba and Igbo are the biggest groups.",
    ref: "",
  },
  {
    text: "What is the capital city of Nigeria?",
    correct: "Abuja",
    distractors: ["Lagos", "Kano", "Port Harcourt"],
    explanation: "Abuja became the capital in 1991, replacing Lagos.",
    ref: "",
  },
  {
    text: "What is the currency of Nigeria?",
    correct: "The naira",
    distractors: ["The cedi", "The pound", "The dollar"],
    explanation: "The naira is Nigeria's legal tender.",
    ref: "",
  },
  {
    text: "What is Jollof rice?",
    correct: "A famous Nigerian dish",
    distractors: ["A dance", "A festival", "A cloth"],
    explanation: "Jollof rice is enjoyed across Nigeria.",
    ref: "",
  },
  {
    text: "Which animal appears on the Nigerian coat of arms?",
    correct: "The eagle",
    distractors: ["The lion", "The tiger", "The elephant"],
    explanation: "The eagle stands above the shield on the arms.",
    ref: "",
  },
  {
    text: "What is the main language of northern Nigeria?",
    correct: "Hausa",
    distractors: ["Yoruba", "Igbo", "Edo"],
    explanation: "Hausa is widely spoken across the north.",
    ref: "",
  },
  {
    text: "What cloth is Aso Ebi?",
    correct: "Matching cloth worn by friends and family",
    distractors: ["School uniform", "Army camouflage", "Hospital gown"],
    explanation: "Aso ebi is worn by friends and family at events.",
    ref: "",
  },
  {
    text: "What is the meaning of the Nigerian flag colours?",
    correct: "Green for agriculture, white for peace",
    distractors: ["Red for blood, white for purity", "Green for forests, white for snow", "Gold for wealth, green for land"],
    explanation: "Green stands for agriculture; white for peace.",
    ref: "",
  },
];

const L1012_CULTURE_SILVER: Draft[] = [
  {
    text: "Who made the Benin bronzes?",
    correct: "The Edo people",
    distractors: ["The Igbo", "The Yoruba", "The Hausa"],
    explanation: "Benin bronzes are world-famous Edo artworks.",
    ref: "",
  },
  {
    text: "What is the Osun festival about?",
    correct: "Honouring the river goddess Osun",
    distractors: ["Celebrating the harvest", "Marking independence", "Honouring ancestors"],
    explanation: "Osun Osogbo honours the Yoruba river goddess.",
    ref: "",
  },
  {
    text: "Which city is Nigeria's trade hub?",
    correct: "Lagos",
    distractors: ["Abuja", "Kano", "Ibadan"],
    explanation: "Lagos remains Nigeria's busiest trading city.",
    ref: "",
  },
  {
    text: "What is Alo?",
    correct: "Yoruba evening storytelling",
    distractors: ["A harvest dance", "A warrior chant", "A funeral rite"],
    explanation: "Alo is the Yoruba art of evening storytelling.",
    ref: "",
  },
  {
    text: "What is Ijala?",
    correct: "A Yoruba hunter's chant",
    distractors: ["A Hausa dance", "An Igbo mask", "A market song"],
    explanation: "Ijala is chanted poetry of Yoruba hunters.",
    ref: "",
  },
  {
    text: "What is the significance of the New Yam festival?",
    correct: "Thanksgiving for the harvest",
    distractors: ["Marking the new year", "Welcoming kings", "Opening schools"],
    explanation: "New Yam festival celebrates a good harvest.",
    ref: "",
  },
  {
    text: "What do the Kanuri speak?",
    correct: "Kanuri",
    distractors: ["Yoruba", "Edo", "Tiv"],
    explanation: "Kanuri is spoken in Borno and Yobe states.",
    ref: "",
  },
  {
    text: "How do Nigerians show respect to elders?",
    correct: "Bowing, kneeling or prostrating",
    distractors: ["Waving from afar", "Shouting loudly", "Ignoring them"],
    explanation: "Respect gestures differ by ethnic group.",
    ref: "",
  },
];

const L1012_CULTURE_GOLD: Draft[] = [
  {
    text: "How does Nollywood help our nation?",
    correct: "It spreads our stories and earns foreign exchange",
    distractors: ["It only entertains", "It replaces farming", "It divides the country"],
    explanation: "Nollywood exports Nigerian culture worldwide.",
    ref: "",
  },
  {
    text: "Why save our languages?",
    correct: "They carry our history and identity",
    distractors: ["They confuse youths", "They are outdated", "No value"],
    explanation: "A lost language means a lost heritage.",
    ref: "",
  },
  {
    text: "What is the role of the National Museum?",
    correct: "Preserving Nigerian art and history",
    distractors: ["Selling souvenirs", "Hosting concerts", "Teaching science"],
    explanation: "Museums keep our heritage for future generations.",
    ref: "",
  },
  {
    text: "Why is the constitution a sign of unity?",
    correct: "It applies equally to all citizens",
    distractors: ["It favours one religion", "It favours one region", "It serves only officers"],
    explanation: "One constitution binds all Nigerians together.",
    ref: "",
  },
  {
    text: "How does the FESTAC legacy live on?",
    correct: "Festivals and arts still flourish",
    distractors: ["It ended in 1977", "It was banned", "It failed completely"],
    explanation: "FESTAC '77 celebrated Black and African arts.",
    ref: "",
  },
  {
    text: "Why is our national anthem in English?",
    correct: "English unites our diverse peoples",
    distractors: ["It is the only Nigerian language", "It is required by Britain", "No reason"],
    explanation: "English serves as our common national language.",
    ref: "",
  },
  {
    text: "How can we promote Nigerian culture?",
    correct: "Invest in film, music and arts",
    distractors: ["Ignore the arts", "Import everything", "Ban festivals"],
    explanation: "Culture is a growing part of Nigeria's economy.",
    ref: "",
  },
  {
    text: "Why is our diversity a strength?",
    correct: "Many peoples, one nation, shared purpose",
    distractors: ["Diversity divides us", "It weakens the country", "It has no meaning"],
    explanation: "Our many groups enrich one Nigeria.",
    ref: "",
  },
];

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

function toQuestions(
  bandId: string,
  token: string,
  topicId: string,
  prefix: string,
  levels: Record<Level, Draft[]>,
): Question[] {
  const out: Question[] = [];
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${token}-${SUBJECT_PREFIX}-${prefix}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: bandId as Question["band"],
        subject: "social-studies",
        topic: topicId as Question["topic"],
        level,
        text: d.text,
        options: optionsFor(d.correct, d.distractors, index),
        correctIndex: index,
        explanation: d.explanation,
        curriculumRef: d.ref === "" ? ref(bandId, topicId, level) : d.ref,
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

interface BandDef {
  id: string;
  topics: Record<string, TopicDef>;
}

function topic(id: string, prefix: string, sets: [Draft[], Draft[], Draft[]]): TopicDef {
  return { id, prefix, levels: { bronze: sets[0], silver: sets[1], gold: sets[2] } };
}

const BAND_BUILDERS: BandDef[] = [
  {
    id: "4-6",
    topics: {
      family: topic("family", "FAM", [L46_FAMILY_BRONZE, L46_FAMILY_SILVER, L46_FAMILY_GOLD]),
      community: topic("community", "COM", [L46_COMMUNITY_BRONZE, L46_COMMUNITY_SILVER, L46_COMMUNITY_GOLD]),
      civic: topic("civic", "CIV", [L46_CIVIC_BRONZE, L46_CIVIC_SILVER, L46_CIVIC_GOLD]),
      culture: topic("culture", "CUL", [L46_CULTURE_BRONZE, L46_CULTURE_SILVER, L46_CULTURE_GOLD]),
    },
  },
  {
    id: "7-9",
    topics: {
      family: topic("family", "FAM", [L79_FAMILY_BRONZE, L79_FAMILY_SILVER, L79_FAMILY_GOLD]),
      community: topic("community", "COM", [L79_COMMUNITY_BRONZE, L79_COMMUNITY_SILVER, L79_COMMUNITY_GOLD]),
      civic: topic("civic", "CIV", [L79_CIVIC_BRONZE, L79_CIVIC_SILVER, L79_CIVIC_GOLD]),
      culture: topic("culture", "CUL", [L79_CULTURE_BRONZE, L79_CULTURE_SILVER, L79_CULTURE_GOLD]),
    },
  },
  {
    id: "10-12",
    topics: {
      family: topic("family", "FAM", [L1012_FAMILY_BRONZE, L1012_FAMILY_SILVER, L1012_FAMILY_GOLD]),
      community: topic("community", "COM", [L1012_COMMUNITY_BRONZE, L1012_COMMUNITY_SILVER, L1012_COMMUNITY_GOLD]),
      civic: topic("civic", "CIV", [L1012_CIVIC_BRONZE, L1012_CIVIC_SILVER, L1012_CIVIC_GOLD]),
      culture: topic("culture", "CUL", [L1012_CULTURE_BRONZE, L1012_CULTURE_SILVER, L1012_CULTURE_GOLD]),
    },
  },
];

let errors = 0;
for (const bandDef of BAND_BUILDERS) {
  const band = bandById(bandDef.id);
  if (!band) throw new Error(`unknown band ${bandDef.id}`);
  const OUT = path.resolve(`src/server/data/questions/${band.id}/social-studies`);
  mkdirSync(OUT, { recursive: true });
  for (const topicId of Object.keys(bandDef.topics)) {
    const builder = bandDef.topics[topicId]!;
    const topicDef = TOPICS.find((t) => t.id === builder.id);
    if (!topicDef) throw new Error(`unknown topic ${builder.id}`);
    const questions = toQuestions(band.id, band.token, builder.id, builder.prefix, builder.levels);
    const file: TopicFile = {
      band: band.id as TopicFile["band"],
      subject: "social-studies",
      topic: builder.id as never,
      title: topicDef.label,
      questions,
    };
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
