import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { BANDS, TOPICS } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Arabic starter bank for all three age bands. Written by hand, checked by the validator.
 * Eight questions per level, twenty four per topic, twelve files in total.
 * The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
  /** Topic phrase used in the curriculumRef, joined to the band's level label. */
  ref: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "ARB";
const SUBJECT_ID = "arabic";
const ROOT = path.resolve("src/server/data/questions");
const AUTHOR = "AI draft v1";

/** NERDC level label per band, joined as "NERDC <level> Arabic, <topic phrase>". */
const LEVEL_WORD: Record<string, string> = {
  "4-6": "Nursery 2",
  "7-9": "Primary 3",
  "10-12": "Primary 5",
};

const REF_PHRASE = {
  alphabet: "the Arabic alphabet",
  words: "everyday Arabic words",
  reading: "simple Arabic reading",
  numbers: "numbers in Arabic",
} as const;

function refFor(bandId: string, phrase: keyof typeof REF_PHRASE): string {
  return `NERDC ${LEVEL_WORD[bandId]} Arabic, ${REF_PHRASE[phrase]}`;
}

// ---------------------------------------------------------------------------
// Band 4-6 (Sprouts) content
// ---------------------------------------------------------------------------

const A4_ALPHABET_BRONZE: Draft[] = [
  { text: "Which letter is alif?", correct: "ا", distractors: ["ب", "ت", "ث"], explanation: "Alif is the first letter of the Arabic alphabet.", ref: "alphabet" },
  { text: "Which letter is ba?", correct: "ب", distractors: ["ا", "ت", "ج"], explanation: "Ba is the second letter of the alphabet.", ref: "alphabet" },
  { text: "Which letter is ta?", correct: "ت", distractors: ["ب", "ث", "ن"], explanation: "Ta has two dots above the letter.", ref: "alphabet" },
  { text: "Which letter is jeem?", correct: "ج", distractors: ["ح", "خ", "د"], explanation: "Jeem has one dot below the letter.", ref: "alphabet" },
  { text: "Which letter is meem?", correct: "م", distractors: ["ن", "ل", "و"], explanation: "Meem starts the word for water, ماء.", ref: "alphabet" },
  { text: "Which letter is noon?", correct: "ن", distractors: ["م", "ب", "و"], explanation: "Noon has one dot above the letter.", ref: "alphabet" },
  { text: "Which letter is lam?", correct: "ل", distractors: ["ر", "ا", "ك"], explanation: "Lam is a tall letter like a stick.", ref: "alphabet" },
  { text: "Which letter is ha?", correct: "هـ", distractors: ["و", "ف", "ك"], explanation: "Ha is a soft sound made near the throat.", ref: "alphabet" },
];

const A4_ALPHABET_SILVER: Draft[] = [
  { text: "What sound does ba make?", correct: "B as in bat", distractors: ["T as in ten", "M as in man", "S as in sun"], explanation: "Ba is pronounced like the English b.", ref: "alphabet" },
  { text: "What sound does seen make?", correct: "S as in sun", distractors: ["Sh as in ship", "Z as in zoo", "H as in hat"], explanation: "Seen is a soft s sound.", ref: "alphabet" },
  { text: "Which letter makes the L sound?", correct: "ل", distractors: ["ر", "ن", "م"], explanation: "Lam is pronounced like English l.", ref: "alphabet" },
  { text: "Which letter makes the R sound?", correct: "ر", distractors: ["ز", "و", "ل"], explanation: "Ra is a rolled r sound.", ref: "alphabet" },
  { text: "Which three letters share one boat shape?", correct: "ب ت ث", distractors: ["ا و ي", "م ن ل", "س ش ص"], explanation: "Ba, ta and tha share one shape with different dots.", ref: "alphabet" },
  { text: "How many dots does jeem have?", correct: "One dot below", distractors: ["One dot above", "Two dots above", "Three dots above"], explanation: "Jeem is ج with one dot underneath.", ref: "alphabet" },
  { text: "Which letter has two dots above?", correct: "ت", distractors: ["ب", "ث", "ج"], explanation: "Ta has two dots above the boat shape.", ref: "alphabet" },
  { text: "Which letter has three dots above?", correct: "ث", distractors: ["ت", "ب", "ن"], explanation: "Tha has three dots above the boat shape.", ref: "alphabet" },
];

const A4_ALPHABET_GOLD: Draft[] = [
  { text: "Which word starts with alif?", correct: "أسد", distractors: ["بيت", "قلم", "ماء"], explanation: "أسد (asad) means lion and starts with alif.", ref: "alphabet" },
  { text: "Which word starts with ba?", correct: "بيت", distractors: ["تمر", "سمك", "جمل"], explanation: "بيت (bayt) means house and starts with ba.", ref: "alphabet" },
  { text: "Which word starts with seen?", correct: "سمك", distractors: ["بيت", "قلم", "دجاج"], explanation: "سمك (samak) means fish and starts with seen.", ref: "alphabet" },
  { text: "Which word starts with meem?", correct: "مدرسة", distractors: ["كتاب", "قلم", "بيت"], explanation: "مدرسة (madrasa) means school and starts with meem.", ref: "alphabet" },
  { text: "Which word starts with qaf?", correct: "قطة", distractors: ["كلب", "ماء", "تمر"], explanation: "قطة (qitta) means cat and starts with qaf.", ref: "alphabet" },
  { text: "Which letter can stretch a vowel?", correct: "ا", distractors: ["ب", "ت", "ج"], explanation: "Alif stretches the long a sound.", ref: "alphabet" },
  { text: "What is the name of this letter: و?", correct: "Waw", distractors: ["Ya", "Alif", "Ba"], explanation: "و is called waw and makes a w sound.", ref: "alphabet" },
  { text: "What is the name of this letter: ي?", correct: "Ya", distractors: ["Waw", "Noon", "Lam"], explanation: "ي is called ya and makes a y sound.", ref: "alphabet" },
];

const A4_WORDS_BRONZE: Draft[] = [
  { text: "What does بيت mean?", correct: "House", distractors: ["School", "Market", "Mosque"], explanation: "بيت (bayt) means house.", ref: "words" },
  { text: "What does كتاب mean?", correct: "Book", distractors: ["Pen", "Bag", "Chair"], explanation: "كتاب (kitab) means book.", ref: "words" },
  { text: "What does ماء mean?", correct: "Water", distractors: ["Milk", "Bread", "Rice"], explanation: "ماء (ma) means water.", ref: "words" },
  { text: "What does شمس mean?", correct: "Sun", distractors: ["Moon", "Star", "Cloud"], explanation: "شمس (shams) means sun.", ref: "words" },
  { text: "What does قمر mean?", correct: "Moon", distractors: ["Sun", "Sky", "Rain"], explanation: "قمر (qamar) means moon.", ref: "words" },
  { text: "What does كلب mean?", correct: "Dog", distractors: ["Cat", "Bird", "Fish"], explanation: "كلب (kalb) means dog.", ref: "words" },
  { text: "What does قطة mean?", correct: "Cat", distractors: ["Dog", "Cow", "Goat"], explanation: "قطة (qitta) means cat.", ref: "words" },
  { text: "What does قلم mean?", correct: "Pen", distractors: ["Book", "Door", "Table"], explanation: "قلم (qalam) means pen.", ref: "words" },
];

const A4_WORDS_SILVER: Draft[] = [
  { text: "What does معلم mean?", correct: "Teacher", distractors: ["Student", "Farmer", "Trader"], explanation: "معلم (muallim) means teacher.", ref: "words" },
  { text: "What does طالب mean?", correct: "Student", distractors: ["Teacher", "Doctor", "Trader"], explanation: "طالب (talib) means student.", ref: "words" },
  { text: "What does تفاحة mean?", correct: "Apple", distractors: ["Orange", "Banana", "Mango"], explanation: "تفاحة (tuffaha) means apple.", ref: "words" },
  { text: "What does لبن mean?", correct: "Milk", distractors: ["Water", "Tea", "Juice"], explanation: "لبن (laban) means milk.", ref: "words" },
  { text: "What does خبز mean?", correct: "Bread", distractors: ["Rice", "Beans", "Fish"], explanation: "خبز (khubz) means bread.", ref: "words" },
  { text: "Which word means water?", correct: "ماء", distractors: ["نار", "هواء", "تراب"], explanation: "ماء is water, نار is fire.", ref: "words" },
  { text: "Which word means book?", correct: "كتاب", distractors: ["قلم", "كرسي", "باب"], explanation: "كتاب means book.", ref: "words" },
  { text: "What does السلام عليكم mean?", correct: "Peace be upon you", distractors: ["Good morning", "Thank you", "Good luck"], explanation: "السلام عليكم is a common greeting among Muslims.", ref: "words" },
];

const A4_WORDS_GOLD: Draft[] = [
  { text: "How do you reply to السلام عليكم?", correct: "وعليكم السلام", distractors: ["صباح الخير", "أهلا وسهلا", "مع السلامة"], explanation: "The reply to السلام عليكم is وعليكم السلام.", ref: "words" },
  { text: "What does صباح الخير mean?", correct: "Good morning", distractors: ["Good night", "Good evening", "Welcome"], explanation: "صباح الخير is a morning greeting.", ref: "words" },
  { text: "What does مدرسة mean?", correct: "School", distractors: ["Market", "Hospital", "Bank"], explanation: "مدرسة (madrasa) means school.", ref: "words" },
  { text: "Which word means cat?", correct: "قطة", distractors: ["كلب", "جمل", "حصان"], explanation: "قطة means cat, كلب means dog.", ref: "words" },
  { text: "Which word means teacher?", correct: "معلم", distractors: ["طالب", "فلاح", "تاجر"], explanation: "معلم means teacher, طالب means student.", ref: "words" },
  { text: "What does أهلا mean?", correct: "Welcome", distractors: ["Goodbye", "Thanks", "Sorry"], explanation: "أهلا (ahlan) is a warm welcome.", ref: "words" },
  { text: "What does شكرا mean?", correct: "Thank you", distractors: ["Welcome", "Hello", "Please"], explanation: "شكرا (shukran) means thank you.", ref: "words" },
  { text: "Which word means sun?", correct: "شمس", distractors: ["قمر", "نجم", "ليل"], explanation: "شمس means sun and قمر means moon.", ref: "words" },
];

const A4_READING_BRONZE: Draft[] = [
  { text: "Read: ب. What is the letter?", correct: "Ba", distractors: ["Ta", "Tha", "Jeem"], explanation: "ب is the letter ba.", ref: "reading" },
  { text: "Read: ا. What is the letter?", correct: "Alif", distractors: ["Waw", "Ya", "Lam"], explanation: "ا is the letter alif.", ref: "reading" },
  { text: "Read: م. What is the letter?", correct: "Meem", distractors: ["Noon", "Ra", "Ha"], explanation: "م is the letter meem.", ref: "reading" },
  { text: "Read: ت. What is the letter?", correct: "Ta", distractors: ["Ba", "Tha", "Dal"], explanation: "ت is the letter ta.", ref: "reading" },
  { text: "Read: ل. What is the letter?", correct: "Lam", distractors: ["Alif", "Ra", "Kaf"], explanation: "ل is the letter lam.", ref: "reading" },
  { text: "Which one says ba?", correct: "ب", distractors: ["ت", "ج", "ن"], explanation: "ب is ba with one dot below.", ref: "reading" },
  { text: "Which one says alif?", correct: "ا", distractors: ["و", "ي", "ر"], explanation: "ا is alif, the first letter.", ref: "reading" },
  { text: "Which one says meem?", correct: "م", distractors: ["ن", "و", "ل"], explanation: "م is the letter meem.", ref: "reading" },
];

const A4_READING_SILVER: Draft[] = [
  { text: "Read: بيت. What does it mean?", correct: "House", distractors: ["Book", "Dog", "Water"], explanation: "بيت (bayt) means house.", ref: "reading" },
  { text: "Read: ماء. What does it mean?", correct: "Water", distractors: ["Sun", "Moon", "Bread"], explanation: "ماء (ma) means water.", ref: "reading" },
  { text: "Read: قلم. What does it mean?", correct: "Pen", distractors: ["Book", "Chair", "House"], explanation: "قلم (qalam) means pen.", ref: "reading" },
  { text: "Read: شمس. What does it mean?", correct: "Sun", distractors: ["Moon", "Star", "Night"], explanation: "شمس (shams) means sun.", ref: "reading" },
  { text: "How many letters are in بيت?", correct: "Three", distractors: ["Two", "Four", "Five"], explanation: "بيت has three letters: ba, ya, ta.", ref: "reading" },
  { text: "Which word starts with ب?", correct: "بيت", distractors: ["قلم", "ماء", "شمس"], explanation: "بيت begins with the letter ba.", ref: "reading" },
  { text: "Read: باب. What does it mean?", correct: "Door", distractors: ["Book", "House", "Pen"], explanation: "باب (bab) means door.", ref: "reading" },
  { text: "Read: يد. What does it mean?", correct: "Hand", distractors: ["Eye", "Leg", "Ear"], explanation: "يد (yad) means hand.", ref: "reading" },
];

const A4_READING_GOLD: Draft[] = [
  { text: "Read: أنا تلميذ. What does it mean?", correct: "I am a pupil", distractors: ["I am a teacher", "I am a farmer", "I am a trader"], explanation: "أنا تلميذ means I am a pupil.", ref: "reading" },
  { text: "Read: هذا بيت. What does it mean?", correct: "This is a house", distractors: ["This is a book", "This is a school", "This is a pen"], explanation: "هذا بيت means this is a house.", ref: "reading" },
  { text: "Read: الماء نظيف. What does it mean?", correct: "The water is clean", distractors: ["The water is cold", "The water is hot", "The water is sweet"], explanation: "نظيف means clean.", ref: "reading" },
  { text: "Read: الشمس تشرق. What does it mean?", correct: "The sun rises", distractors: ["The moon shines", "The rain falls", "The star twinkles"], explanation: "تشرق means rises or comes up.", ref: "reading" },
  { text: "Read: القطة تشرب. What does it mean?", correct: "The cat drinks", distractors: ["The dog runs", "The bird flies", "The fish swims"], explanation: "تشرب means drinks.", ref: "reading" },
  { text: "Read: أبي يقرأ. What does it mean?", correct: "My father is reading", distractors: ["My mother is cooking", "My brother is playing", "My sister is sleeping"], explanation: "أبي يقرأ means my father is reading.", ref: "reading" },
  { text: "Read: أمي تطبخ. What does it mean?", correct: "My mother is cooking", distractors: ["My father is working", "My brother is reading", "My sister is drawing"], explanation: "أمي تطبخ means my mother is cooking.", ref: "reading" },
  { text: "Which sentence means this is a book?", correct: "هذا كتاب", distractors: ["هذا قلم", "هذا بيت", "هذا باب"], explanation: "كتاب is the Arabic word for book.", ref: "reading" },
];

const A4_NUMBERS_BRONZE: Draft[] = [
  { text: "What number is واحد?", correct: "1", distractors: ["2", "3", "4"], explanation: "واحد (wahid) means one.", ref: "numbers" },
  { text: "What number is اثنان?", correct: "2", distractors: ["1", "3", "5"], explanation: "اثنان (ithnan) means two.", ref: "numbers" },
  { text: "What number is ثلاثة?", correct: "3", distractors: ["2", "4", "6"], explanation: "ثلاثة (thalatha) means three.", ref: "numbers" },
  { text: "What number is أربعة?", correct: "4", distractors: ["5", "3", "7"], explanation: "أربعة (arbaa) means four.", ref: "numbers" },
  { text: "What number is خمسة?", correct: "5", distractors: ["4", "6", "8"], explanation: "خمسة (khamsa) means five.", ref: "numbers" },
  { text: "What number is ستة?", correct: "6", distractors: ["7", "5", "9"], explanation: "ستة (sitta) means six.", ref: "numbers" },
  { text: "What number is سبعة?", correct: "7", distractors: ["6", "8", "9"], explanation: "سبعة (saba) means seven.", ref: "numbers" },
  { text: "What number is ثمانية?", correct: "8", distractors: ["7", "9", "10"], explanation: "ثمانية (thamaniya) means eight.", ref: "numbers" },
];

const A4_NUMBERS_SILVER: Draft[] = [
  { text: "What does ١ show?", correct: "One", distractors: ["Two", "Three", "Ten"], explanation: "١ is one in Arabic numerals.", ref: "numbers" },
  { text: "What does ٢ show?", correct: "Two", distractors: ["One", "Four", "Seven"], explanation: "٢ is two in Arabic numerals.", ref: "numbers" },
  { text: "What does ٣ show?", correct: "Three", distractors: ["Five", "Six", "Eight"], explanation: "٣ is three in Arabic numerals.", ref: "numbers" },
  { text: "What does ٤ stand for?", correct: "Four", distractors: ["Six", "Nine", "Two"], explanation: "٤ is four in Arabic numerals.", ref: "numbers" },
  { text: "What does ٥ stand for?", correct: "Five", distractors: ["Three", "Seven", "Ten"], explanation: "٥ is five in Arabic numerals.", ref: "numbers" },
  { text: "Which symbol shows the number 7?", correct: "٧", distractors: ["٦", "٨", "٩"], explanation: "٧ is seven in Arabic numerals.", ref: "numbers" },
  { text: "Which symbol shows the number 9?", correct: "٩", distractors: ["٦", "٥", "٨"], explanation: "٩ is nine in Arabic numerals.", ref: "numbers" },
  { text: "What number is عشرة?", correct: "10", distractors: ["8", "9", "12"], explanation: "عشرة (ashara) means ten.", ref: "numbers" },
];

const A4_NUMBERS_GOLD: Draft[] = [
  { text: "Count: واحد، اثنان، ثلاثة. What comes next?", correct: "أربعة", distractors: ["خمسة", "اثنان", "ستة"], explanation: "After three comes four, أربعة.", ref: "numbers" },
  { text: "What is اثنان plus واحد?", correct: "ثلاثة", distractors: ["أربعة", "اثنان", "واحد"], explanation: "اثنان plus واحد makes ثلاثة.", ref: "numbers" },
  { text: "Which number is bigger: خمسة or ثلاثة?", correct: "خمسة", distractors: ["ثلاثة", "اثنان", "واحد"], explanation: "خمسة is five and ثلاثة is three.", ref: "numbers" },
  { text: "How do you write six in Arabic symbols?", correct: "٦", distractors: ["٥", "٧", "٨"], explanation: "٦ is six in Arabic numerals.", ref: "numbers" },
  { text: "What is تسعة minus واحد?", correct: "ثمانية", distractors: ["سبعة", "ستة", "عشرة"], explanation: "تسعة minus واحد equals ثمانية.", ref: "numbers" },
  { text: "Which word means the number 4?", correct: "أربعة", distractors: ["ثلاثة", "خمسة", "اثنان"], explanation: "أربعة (arbaa) means four.", ref: "numbers" },
  { text: "What is اثنان plus اثنان?", correct: "أربعة", distractors: ["ثلاثة", "خمسة", "ستة"], explanation: "اثنان plus اثنان equals أربعة.", ref: "numbers" },
  { text: "Count: سبعة، ثمانية، تسعة. What comes next?", correct: "عشرة", distractors: ["ثمانية", "سبعة", "ستة"], explanation: "After nine comes ten, عشرة.", ref: "numbers" },
];

// ---------------------------------------------------------------------------
// Band 7-9 (Explorers) content
// ---------------------------------------------------------------------------

const A7_ALPHABET_BRONZE: Draft[] = [
  { text: "What is the name of this letter: ب?", correct: "Ba", distractors: ["Ta", "Tha", "Jeem"], explanation: "ب is called ba.", ref: "alphabet" },
  { text: "What sound does ث make?", correct: "Th as in three", distractors: ["B as in bat", "T as in ten", "S as in sun"], explanation: "Tha is pronounced like th in three.", ref: "alphabet" },
  { text: "Which letter is kha?", correct: "خ", distractors: ["ح", "ج", "د"], explanation: "خ is kha, a rough h sound.", ref: "alphabet" },
  { text: "Which letter is haa?", correct: "ح", distractors: ["خ", "هـ", "ج"], explanation: "ح is a deep h sound made in the throat.", ref: "alphabet" },
  { text: "Which letter is ayn?", correct: "ع", distractors: ["غ", "ف", "ق"], explanation: "ع is ayn, a voiced throat sound.", ref: "alphabet" },
  { text: "Which letter is ghayn?", correct: "غ", distractors: ["ع", "ق", "ف"], explanation: "غ is ghayn, a throaty gh sound.", ref: "alphabet" },
  { text: "Which letter is fa?", correct: "ف", distractors: ["ق", "ك", "ب"], explanation: "ف is fa, like English f.", ref: "alphabet" },
  { text: "Which letter is qaaf?", correct: "ق", distractors: ["ف", "ك", "ل"], explanation: "ق is qaaf, a deep q sound.", ref: "alphabet" },
];

const A7_ALPHABET_SILVER: Draft[] = [
  { text: "How does ba look at the end of a word?", correct: "ـب", distractors: ["بـ", "ـبـ", "ب"], explanation: "Final ba is written as ـب with a joining tail.", ref: "alphabet" },
  { text: "How does meem look at the start of a word?", correct: "مـ", distractors: ["ـم", "ـمـ", "م"], explanation: "Initial meem is written as مـ.", ref: "alphabet" },
  { text: "How does noon look in the middle of a word?", correct: "ـنـ", distractors: ["نـ", "ـن", "ن"], explanation: "Medial noon is written as ـنـ.", ref: "alphabet" },
  { text: "Which letter never joins the next letter?", correct: "ا", distractors: ["ب", "م", "س"], explanation: "Alif, dal, ra and waw do not join forward.", ref: "alphabet" },
  { text: "How is lam-alif written?", correct: "لا", distractors: ["ال", "لم", "نا"], explanation: "Lam and alif join as لا.", ref: "alphabet" },
  { text: "How many dots does tha have?", correct: "Three dots above", distractors: ["One dot above", "Two dots above", "One dot below"], explanation: "Tha is ث with three dots above.", ref: "alphabet" },
  { text: "How many dots does ba have?", correct: "One dot below", distractors: ["One dot above", "Two dots above", "No dots"], explanation: "Ba is ب with one dot below.", ref: "alphabet" },
  { text: "Which letter has three dots?", correct: "ث", distractors: ["ب", "ت", "ن"], explanation: "Tha is ث with three dots above.", ref: "alphabet" },
];

const A7_ALPHABET_GOLD: Draft[] = [
  { text: "Which word begins with شم?", correct: "شمس", distractors: ["قمر", "نجم", "ليل"], explanation: "شمس (shams) means sun and starts with sheen and meem.", ref: "alphabet" },
  { text: "Which word begins with قم?", correct: "قمر", distractors: ["شمس", "بيت", "تمر"], explanation: "قمر (qamar) means moon and starts with qaf and meem.", ref: "alphabet" },
  { text: "Which word contains the letter خ?", correct: "خبز", distractors: ["ماء", "لبن", "أرز"], explanation: "خبز (khubz) means bread and contains kha.", ref: "alphabet" },
  { text: "Which word contains the letter ق?", correct: "قلم", distractors: ["كتاب", "بيت", "ماء"], explanation: "قلم (qalam) means pen and contains qaf.", ref: "alphabet" },
  { text: "Which word contains the letter غ?", correct: "غزال", distractors: ["جمل", "حصان", "فيل"], explanation: "غزال (ghazal) means deer and contains ghayn.", ref: "alphabet" },
  { text: "Which pair spells ما?", correct: "م + ا", distractors: ["م + ن", "ل + ا", "ن + ا"], explanation: "ما is meem joined to alif.", ref: "alphabet" },
  { text: "Which pair spells بي?", correct: "ب + ي", distractors: ["ب + و", "ت + ي", "ث + ي"], explanation: "بي is ba joined to ya.", ref: "alphabet" },
  { text: "ما الحرف الذي يأتي بعد ج؟", correct: "ح", distractors: ["خ", "ث", "د"], explanation: "The order is jeem, haa, kha.", ref: "alphabet" },
];

const A7_WORDS_BRONZE: Draft[] = [
  { text: "What does مدرسة mean?", correct: "School", distractors: ["Market", "Hospital", "Farm"], explanation: "مدرسة (madrasa) means school.", ref: "words" },
  { text: "What does مكتبة mean?", correct: "Library", distractors: ["School", "Cinema", "Bank"], explanation: "مكتبة (maktaba) means library.", ref: "words" },
  { text: "What does مطعم mean?", correct: "Restaurant", distractors: ["Mosque", "Market", "Library"], explanation: "مطعم (matam) means restaurant.", ref: "words" },
  { text: "What does سوق mean?", correct: "Market", distractors: ["School", "House", "Farm"], explanation: "سوق (suq) means market.", ref: "words" },
  { text: "What does مسجد mean?", correct: "Mosque", distractors: ["Church", "School", "Market"], explanation: "مسجد (masjid) means mosque.", ref: "words" },
  { text: "What does فلاح mean?", correct: "Farmer", distractors: ["Trader", "Teacher", "Doctor"], explanation: "فلاح (fallah) means farmer.", ref: "words" },
  { text: "What does تاجر mean?", correct: "Trader", distractors: ["Farmer", "Imam", "Driver"], explanation: "تاجر (tajir) means trader.", ref: "words" },
  { text: "What does طبيب mean?", correct: "Doctor", distractors: ["Teacher", "Student", "Trader"], explanation: "طبيب (tabib) means doctor.", ref: "words" },
];

const A7_WORDS_SILVER: Draft[] = [
  { text: "What does السلام عليكم mean?", correct: "Peace be upon you", distractors: ["Good morning", "Good night", "Welcome"], explanation: "السلام عليكم is a Muslim greeting.", ref: "words" },
  { text: "How do you reply to السلام عليكم?", correct: "وعليكم السلام", distractors: ["صباح الخير", "مع السلامة", "أهلا بك"], explanation: "The reply is وعليكم السلام.", ref: "words" },
  { text: "What does كيف حالك mean?", correct: "How are you?", distractors: ["What is your name?", "Where are you going?", "What do you want?"], explanation: "كيف حالك asks how you are.", ref: "words" },
  { text: "What does أنا بخير، شكرا mean?", correct: "I am fine, thank you", distractors: ["I am sick", "I am busy", "I am hungry"], explanation: "أنا بخير means I am fine.", ref: "words" },
  { text: "What does صباح الخير mean?", correct: "Good morning", distractors: ["Good evening", "Good night", "Hello"], explanation: "صباح الخير is a morning greeting.", ref: "words" },
  { text: "What does مساء الخير mean?", correct: "Good evening", distractors: ["Good morning", "Welcome", "Goodbye"], explanation: "مساء الخير is an evening greeting.", ref: "words" },
  { text: "Which word means thank you?", correct: "شكرا", distractors: ["أهلا", "مع السلامة", "نعم"], explanation: "شكرا (shukran) means thank you.", ref: "words" },
  { text: "Which word means yes?", correct: "نعم", distractors: ["لا", "شكرا", "أهلا"], explanation: "نعم (na am) means yes.", ref: "words" },
];

const A7_WORDS_GOLD: Draft[] = [
  { text: "Which phrase means my name is?", correct: "اسمي", distractors: ["عمري", "عندي", "أبي"], explanation: "اسمي (ismi) means my name.", ref: "words" },
  { text: "What does من أين أنت mean?", correct: "Where are you from?", distractors: ["What is your name?", "How old are you?", "What do you do?"], explanation: "من أين أنت asks where you come from.", ref: "words" },
  { text: "What does أنا من نيجيريا mean?", correct: "I am from Nigeria", distractors: ["I live in Kano", "Nigeria is big", "I go to Lagos"], explanation: "أنا من نيجيريا means I am from Nigeria.", ref: "words" },
  { text: "What does عمري تسع سنوات mean?", correct: "I am nine years old", distractors: ["I am ten years old", "I have nine books", "I have ten pencils"], explanation: "عمري تسع سنوات means I am nine years old.", ref: "words" },
  { text: "Which phrase means I love learning?", correct: "أحب العلم", distractors: ["أكره المدرسة", "ألعب الكرة", "أنام مبكرا"], explanation: "أحب العلم means I love knowledge.", ref: "words" },
  { text: "What does أهلا وسهلا mean?", correct: "Welcome", distractors: ["Goodbye", "Sorry", "Please"], explanation: "أهلا وسهلا is a warm welcome.", ref: "words" },
  { text: "What does مع السلامة mean?", correct: "Goodbye", distractors: ["Welcome", "Thank you", "Good morning"], explanation: "مع السلامة (ma salama) means goodbye.", ref: "words" },
  { text: "Which phrase means please?", correct: "من فضلك", distractors: ["شكرا", "عفوا", "أهلا"], explanation: "من فضلك (min fadlik) means please.", ref: "words" },
];

const A7_READING_BRONZE: Draft[] = [
  { text: "Read: السماء زرقاء. What does it mean?", correct: "The sky is blue", distractors: ["The sun is hot", "The moon is bright", "The sea is deep"], explanation: "زرقاء means blue.", ref: "reading" },
  { text: "Read: الكتاب جديد. What does it mean?", correct: "The book is new", distractors: ["The book is old", "The book is big", "The book is red"], explanation: "جديد means new.", ref: "reading" },
  { text: "Read: التفاحة حمراء. What does it mean?", correct: "The apple is red", distractors: ["The apple is green", "The banana is yellow", "The orange is sweet"], explanation: "حمراء means red.", ref: "reading" },
  { text: "Read: القط صغير. What does it mean?", correct: "The cat is small", distractors: ["The dog is big", "The bird is fast", "The fish is slow"], explanation: "صغير means small.", ref: "reading" },
  { text: "Which sentence means the school is big?", correct: "المدرسة كبيرة", distractors: ["المدرسة صغيرة", "المدرسة بعيدة", "المدرسة جديدة"], explanation: "كبيرة means big.", ref: "reading" },
  { text: "Which sentence means the water is cold?", correct: "الماء بارد", distractors: ["الماء ساخن", "الماء نظيف", "الماء حلو"], explanation: "بارد means cold.", ref: "reading" },
  { text: "Read: اليوم جميل. What does it mean?", correct: "The day is beautiful", distractors: ["The day is dark", "The night is cold", "The morning is early"], explanation: "جميل means beautiful.", ref: "reading" },
  { text: "Which sentence means I like milk?", correct: "أحب اللبن", distractors: ["أشرب الماء", "أحب الخبز", "أكره اللبن"], explanation: "أحب اللبن means I love milk.", ref: "reading" },
];

const A7_READING_SILVER: Draft[] = [
  { text: "Read: ذهب أحمد إلى المدرسة صباحا. When did Ahmad go?", correct: "In the morning", distractors: ["In the evening", "At night", "At noon"], explanation: "صباحا means in the morning.", ref: "reading" },
  { text: "Read: أكلت مريم تفاحة حمراء. What did Maryam eat?", correct: "A red apple", distractors: ["A green apple", "A banana", "An orange"], explanation: "تفاحة حمراء means a red apple.", ref: "reading" },
  { text: "Read: يصلي أبي في المسجد. Where does papa pray?", correct: "In the mosque", distractors: ["At home", "In the school", "In the market"], explanation: "المسجد means the mosque.", ref: "reading" },
  { text: "Read: شربت سارة اللبن. What did Sara drink?", correct: "Milk", distractors: ["Water", "Tea", "Juice"], explanation: "اللبن means milk.", ref: "reading" },
  { text: "Read: لعب الولد بالكرة في الملعب. Where did the boy play?", correct: "On the field", distractors: ["In the house", "In the school", "In the market"], explanation: "الملعب means the playground.", ref: "reading" },
  { text: "Read: قرأ يوسف القصة. What did Yusuf do?", correct: "He read the story", distractors: ["He wrote the story", "He heard the story", "He drew the story"], explanation: "قرأ means he read.", ref: "reading" },
  { text: "Which sentence means the sun shines?", correct: "الشمس تشرق", distractors: ["القمر يضيء", "النجوم تلمع", "السحب تمطر"], explanation: "تشرق means rises or shines.", ref: "reading" },
  { text: "Read: أمي تطبخ الغداء. What is mother doing?", correct: "Cooking lunch", distractors: ["Washing dishes", "Reading a book", "Sweeping the floor"], explanation: "تطبخ means is cooking and الغداء means lunch.", ref: "reading" },
];

const A7_READING_GOLD: Draft[] = [
  { text: "Read: أحب أن أقرأ القرآن كل صباح. What does the writer love to do?", correct: "Read the Quran every morning", distractors: ["Pray at noon", "Visit his friend", "Play in the morning"], explanation: "The sentence says he loves to read the Quran each morning.", ref: "reading" },
  { text: "Read: ذهب الطلاب إلى المكتبة ليبحثوا عن الكتب. Why did the pupils go?", correct: "To look for books", distractors: ["To play games", "To eat lunch", "To sleep"], explanation: "ليبحثوا means so that they may search.", ref: "reading" },
  { text: "Read: إن مع العسر يسرا. What does it mean?", correct: "With hardship comes ease", distractors: ["Work is hard", "Money solves problems", "Study is important"], explanation: "This Quranic verse promises ease after hardship.", ref: "reading" },
  { text: "Read: الماء أساس الحياة. What does it mean?", correct: "Water is the basis of life", distractors: ["Water is free", "Water is cold", "Water is deep"], explanation: "أساس means basis or foundation.", ref: "reading" },
  { text: "Read: الصلاة عماد الدين. What does it mean?", correct: "Prayer is the pillar of religion", distractors: ["Fasting is the pillar of religion", "Charity is the pillar of religion", "Travel is the pillar of religion"], explanation: "عماد means pillar or support.", ref: "reading" },
  { text: "Read: من طلب العلا سهر الليالي. What advice does it give?", correct: "Success needs hard work", distractors: ["Sleep early", "Play at night", "Wake up late"], explanation: "The saying links high goals to long, wakeful nights of study.", ref: "reading" },
  { text: "What does العلم نور والجهل ظلام mean?", correct: "Knowledge is light, ignorance is darkness", distractors: ["Knowledge is wealth, ignorance is poverty", "Knowledge is power, ignorance is weakness", "Knowledge is joy, ignorance is misery"], explanation: "نور means light and ظلام means darkness.", ref: "reading" },
  { text: "Read: الوقاية خير من العلاج. What does it mean?", correct: "Prevention is better than cure", distractors: ["Medicine is cheap", "Hospitals are good", "Doctors are kind"], explanation: "الوقاية is prevention and العلاج is cure.", ref: "reading" },
];

const A7_NUMBERS_BRONZE: Draft[] = [
  { text: "What number is أحد عشر?", correct: "11", distractors: ["10", "12", "13"], explanation: "أحد عشر (ahada ashar) means eleven.", ref: "numbers" },
  { text: "What number is اثنا عشر?", correct: "12", distractors: ["11", "13", "14"], explanation: "اثنا عشر (ithna ashar) means twelve.", ref: "numbers" },
  { text: "What number is ثلاثة عشر?", correct: "13", distractors: ["12", "14", "15"], explanation: "ثلاثة عشر (thalatha ashar) means thirteen.", ref: "numbers" },
  { text: "What number is أربعة عشر?", correct: "14", distractors: ["13", "15", "16"], explanation: "أربعة عشر (arbaata ashar) means fourteen.", ref: "numbers" },
  { text: "What number is خمسة عشر?", correct: "15", distractors: ["14", "16", "17"], explanation: "خمسة عشر (khamsata ashar) means fifteen.", ref: "numbers" },
  { text: "What number is عشرون?", correct: "20", distractors: ["12", "15", "10"], explanation: "عشرون (ishrun) means twenty.", ref: "numbers" },
  { text: "What number is ثلاثون?", correct: "30", distractors: ["13", "20", "40"], explanation: "ثلاثون (thalathun) means thirty.", ref: "numbers" },
  { text: "What number is مئة?", correct: "100", distractors: ["10", "1000", "50"], explanation: "مئة (mia) means one hundred.", ref: "numbers" },
];

const A7_NUMBERS_SILVER: Draft[] = [
  { text: "Write the number ١٢ as a word.", correct: "اثنا عشر", distractors: ["أحد عشر", "ثلاثة عشر", "عشرون"], explanation: "١٢ is اثنا عشر, twelve.", ref: "numbers" },
  { text: "Write the number ١٥ as a word.", correct: "خمسة عشر", distractors: ["أربعة عشر", "ستة عشر", "خمسة"], explanation: "١٥ is خمسة عشر, fifteen.", ref: "numbers" },
  { text: "What does ٧ + ٣ equal?", correct: "عشرة", distractors: ["تسعة", "ثمانية", "أحد عشر"], explanation: "Seven plus three makes ten, عشرة.", ref: "numbers" },
  { text: "What does ١٠ - ٤ equal?", correct: "ستة", distractors: ["خمسة", "سبعة", "أربعة"], explanation: "Ten minus four makes six, ستة.", ref: "numbers" },
  { text: "Which symbol shows twenty five?", correct: "٢٥", distractors: ["٥٢", "١٥", "٢١"], explanation: "٢٥ reads as twenty five.", ref: "numbers" },
  { text: "Which symbol shows thirty eight?", correct: "٣٨", distractors: ["٨٣", "٣١", "٣٦"], explanation: "٣٨ reads as thirty eight.", ref: "numbers" },
  { text: "What is عشرون plus عشرة?", correct: "ثلاثون", distractors: ["اثنان وثلاثون", "أربعون", "خمسون"], explanation: "Twenty plus ten makes thirty, ثلاثون.", ref: "numbers" },
  { text: "Which is greater: أربعون or خمسون?", correct: "خمسون", distractors: ["أربعون", "They are equal", "عشرون"], explanation: "خمسون is fifty and أربعون is forty.", ref: "numbers" },
];

const A7_NUMBERS_GOLD: Draft[] = [
  { text: "What is مئة minus خمسون?", correct: "خمسون", distractors: ["أربعون", "ستون", "سبعون"], explanation: "One hundred minus fifty makes fifty.", ref: "numbers" },
  { text: "Which number is ستة وسبعون?", correct: "76", distractors: ["67", "70", "86"], explanation: "ستة وسبعون is seventy six.", ref: "numbers" },
  { text: "Which number is أربعة وسبعون?", correct: "74", distractors: ["47", "84", "64"], explanation: "أربعة وسبعون is seventy four.", ref: "numbers" },
  { text: "What does ٣ × ٣ equal?", correct: "تسعة", distractors: ["ستة", "ثمانية", "اثنا عشر"], explanation: "Three times three makes nine, تسعة.", ref: "numbers" },
  { text: "What is نصف المئة, half of a hundred?", correct: "خمسون", distractors: ["عشرون", "ثلاثون", "أربعون"], explanation: "نصف means half and half of one hundred is fifty.", ref: "numbers" },
  { text: "ما الرقم الذي بين ٩٩ و ١٠١؟", correct: "١٠٠", distractors: ["٩٨", "١٠٢", "١١٠"], explanation: "The number between ninety nine and one hundred and one is one hundred.", ref: "numbers" },
  { text: "How is the number 42 written in Arabic words?", correct: "اثنان وأربعون", distractors: ["أربعة وعشرون", "اثنان وعشرون", "اثنان وسبعون"], explanation: "42 is اثنان وأربعون.", ref: "numbers" },
  { text: "What is سبعة times اثنان?", correct: "أربعة عشر", distractors: ["تسعة", "ثمانية", "ستة عشر"], explanation: "Seven times two makes fourteen, أربعة عشر.", ref: "numbers" },
];

// ---------------------------------------------------------------------------
// Band 10-12 (Adventurers) content
// ---------------------------------------------------------------------------

const A10_ALPHABET_BRONZE: Draft[] = [
  { text: "What is the name of this letter: ع?", correct: "Ayn", distractors: ["Ghayn", "Haa", "Khaa"], explanation: "ع is ayn, a voiced throat sound.", ref: "alphabet" },
  { text: "What is the name of this letter: غ?", correct: "Ghayn", distractors: ["Ayn", "Faa", "Qaaf"], explanation: "غ is ghayn, a throaty gh sound.", ref: "alphabet" },
  { text: "What is the name of this letter: ح?", correct: "Haa", distractors: ["Ha", "Khaa", "Jeem"], explanation: "ح is a deep, breathy h sound.", ref: "alphabet" },
  { text: "What is the name of this letter: ذ?", correct: "Dhaal", distractors: ["Dal", "Zay", "Thaa"], explanation: "ذ is dhaal, like th in this.", ref: "alphabet" },
  { text: "What is the name of this letter: ظ?", correct: "Zaa", distractors: ["Taa", "Saad", "Daad"], explanation: "ظ is an emphatic z sound.", ref: "alphabet" },
  { text: "What is the name of this letter: ص?", correct: "Saad", distractors: ["Seen", "Sheen", "Daad"], explanation: "ص is an emphatic s sound.", ref: "alphabet" },
  { text: "What is the name of this letter: ض?", correct: "Daad", distractors: ["Saad", "Taa", "Zaa"], explanation: "ض is an emphatic d sound.", ref: "alphabet" },
  { text: "Which letter is emphatic taa?", correct: "ط", distractors: ["ت", "ظ", "ص"], explanation: "ط is the emphatic partner of ت.", ref: "alphabet" },
];

const A10_ALPHABET_SILVER: Draft[] = [
  { text: "Which of these is a moon letter?", correct: "ب", distractors: ["ت", "س", "ن"], explanation: "Ba is a moon letter, the lam stays spoken.", ref: "alphabet" },
  { text: "Which of these is a sun letter?", correct: "س", distractors: ["ك", "م", "ف"], explanation: "Seen is a sun letter, the lam is skipped.", ref: "alphabet" },
  { text: "In الشمس how is the lam pronounced?", correct: "It is silent", distractors: ["It is clear", "It is doubled", "It is long"], explanation: "Sun letters swallow the lam of al.", ref: "alphabet" },
  { text: "In القمر how is the lam pronounced?", correct: "It is clear", distractors: ["It is silent", "It is dropped", "It is stressed"], explanation: "Moon letters keep the lam sound.", ref: "alphabet" },
  { text: "What is tanwin?", correct: "A double vowel mark giving an n sound", distractors: ["A long vowel", "A silent letter", "A full stop"], explanation: "Tanwin adds an n sound at the end of a word.", ref: "alphabet" },
  { text: "What sound does fathatan give?", correct: "An", distractors: ["In", "Un", "Ah"], explanation: "Fathatan is a double fatha, read as an.", ref: "alphabet" },
  { text: "What sound does kasratan give?", correct: "In", distractors: ["An", "Un", "Ee"], explanation: "Kasratan is a double kasra, read as in.", ref: "alphabet" },
  { text: "What sound does dammatan give?", correct: "Un", distractors: ["An", "In", "Oo"], explanation: "Dammatan is a double damma, read as un.", ref: "alphabet" },
];

const A10_ALPHABET_GOLD: Draft[] = [
  { text: "Which word begins with a sun letter?", correct: "الشمس", distractors: ["القمر", "الكتاب", "البيت"], explanation: "Seen is a sun letter, so الشمس swallows the lam.", ref: "alphabet" },
  { text: "Which word begins with a moon letter?", correct: "القمر", distractors: ["الشمس", "النور", "الرحمة"], explanation: "Qaf is a moon letter, so the lam is spoken.", ref: "alphabet" },
  { text: "What does the shadda mean?", correct: "The letter is doubled", distractors: ["The vowel is missing", "The letter is long", "The word is foreign"], explanation: "Shadda doubles the consonant beneath it.", ref: "alphabet" },
  { text: "What does the sukoon mean?", correct: "The letter has no vowel", distractors: ["The letter is doubled", "The letter is long", "The letter starts the word"], explanation: "Sukoon means no vowel follows the consonant.", ref: "alphabet" },
  { text: "Which word is written with a sun letter lam?", correct: "السماء", distractors: ["القمر", "البيت", "المدرسة"], explanation: "Seen is a sun letter, so its lam is not spoken.", ref: "alphabet" },
  { text: "How is hamza on alif written?", correct: "أ or إ", distractors: ["ة", "ى", "و"], explanation: "Hamza on alif carries a fatha or a kasra.", ref: "alphabet" },
  { text: "What is the difference between ه and ة?", correct: "The round ta marks feminine words", distractors: ["Nothing at all", "Ha is always silent", "Ta marbuta is masculine"], explanation: "ة is ta marbuta, it closes many feminine nouns.", ref: "alphabet" },
  { text: "Which of these shows tanwin al-fath?", correct: "ـًا", distractors: ["ـٌ", "ـٍ", "ـْ"], explanation: "Tanwin al-fath is a double fatha over alif.", ref: "alphabet" },
];

const A10_WORDS_BRONZE: Draft[] = [
  { text: "What does مستشفى mean?", correct: "Hospital", distractors: ["School", "Bank", "Library"], explanation: "مستشفى (mustashfa) means hospital.", ref: "words" },
  { text: "What does مطعم mean?", correct: "Restaurant", distractors: ["Mosque", "Market", "Cinema"], explanation: "مطعم (mat am) means restaurant.", ref: "words" },
  { text: "What does صيدلية mean?", correct: "Pharmacy", distractors: ["Hospital", "Bakery", "Library"], explanation: "صيدلية (saydaliyya) means pharmacy.", ref: "words" },
  { text: "What does حديقة mean?", correct: "Garden", distractors: ["House", "Street", "Market"], explanation: "حديقة (hadiqa) means garden.", ref: "words" },
  { text: "What does جامعة mean?", correct: "University", distractors: ["School", "Mosque", "Hospital"], explanation: "جامعة (jami a) means university.", ref: "words" },
  { text: "What does وظيفة mean?", correct: "Job", distractors: ["School", "House", "Money"], explanation: "وظيفة (wazifa) means job.", ref: "words" },
  { text: "What does سيارة mean?", correct: "Car", distractors: ["Train", "Airplane", "Bicycle"], explanation: "سيارة (sayyara) means car.", ref: "words" },
  { text: "What does طائرة mean?", correct: "Airplane", distractors: ["Car", "Ship", "Bus"], explanation: "طائرة (ta ira) means airplane.", ref: "words" },
];

const A10_WORDS_SILVER: Draft[] = [
  { text: "What does صديق mean?", correct: "Friend", distractors: ["Enemy", "Neighbor", "Brother"], explanation: "صديق (sadiq) means friend.", ref: "words" },
  { text: "What does جار mean?", correct: "Neighbor", distractors: ["Friend", "Guest", "Stranger"], explanation: "جار (jar) means neighbor.", ref: "words" },
  { text: "What does ضيف mean?", correct: "Guest", distractors: ["Host", "Neighbor", "Friend"], explanation: "ضيف (dayf) means guest.", ref: "words" },
  { text: "What does أمانة mean?", correct: "Trust", distractors: ["Lie", "Fear", "Anger"], explanation: "أمانة (amana) means trust or honesty.", ref: "words" },
  { text: "What does صدق mean?", correct: "Truthfulness", distractors: ["Laziness", "Greed", "Anger"], explanation: "صدق (sidq) means truthfulness.", ref: "words" },
  { text: "What does صبر mean?", correct: "Patience", distractors: ["Haste", "Anger", "Fear"], explanation: "صبر (sabr) means patience.", ref: "words" },
  { text: "What does كرم mean?", correct: "Generosity", distractors: ["Stinginess", "Laziness", "Pride"], explanation: "كرم (karam) means generosity.", ref: "words" },
  { text: "What does تواضع mean?", correct: "Humility", distractors: ["Pride", "Anger", "Envy"], explanation: "تواضع (tawadu) means humility.", ref: "words" },
];

const A10_WORDS_GOLD: Draft[] = [
  { text: "What does العفو عند المقدرة mean?", correct: "Forgiving when you can", distractors: ["Being strong", "Never forgive", "Seeking revenge"], explanation: "العفو عند المقدرة praises pardoning at the moment of power.", ref: "words" },
  { text: "What does من جد وجد mean?", correct: "He who strives finds", distractors: ["He who sleeps wins", "He who asks gets", "He who waits sees"], explanation: "من جد وجد means hard work is rewarded.", ref: "words" },
  { text: "What does الوقت كالسيف mean?", correct: "Time is like a sword", distractors: ["Time is money", "Time is long", "Time is short"], explanation: "The full saying warns that time cuts those who waste it.", ref: "words" },
  { text: "Which phrase means I am learning Arabic?", correct: "أتعلم اللغة العربية", distractors: ["أكره العربية", "أنسى العربية", "أترك العربية"], explanation: "أتعلم اللغة العربية means I am learning Arabic.", ref: "words" },
  { text: "What does العلم نور mean?", correct: "Knowledge is light", distractors: ["Knowledge is money", "Knowledge is power", "Knowledge is wealth"], explanation: "العلم نور means knowledge is light.", ref: "words" },
  { text: "What does الوحدة قوة mean?", correct: "Unity is strength", distractors: ["Divide and rule", "Each for himself", "Strength is wealth"], explanation: "الوحدة قوة means unity is strength.", ref: "words" },
  { text: "Which phrase means please speak slowly?", correct: "من فضلك تكلم ببطء", distractors: ["تكلم بسرعة", "لا تتكلم", "تكلم بصوت عال"], explanation: "ببطء means slowly.", ref: "words" },
  { text: "What does رب ضارة نافعة mean?", correct: "A harm may bring benefit", distractors: ["Harm is always bad", "Benefit is always easy", "Pain is useless"], explanation: "The saying notes that harm can hide a benefit.", ref: "words" },
];

const A10_READING_BRONZE: Draft[] = [
  { text: "Read: الوطن أغلى ما نملك. What does it mean?", correct: "The homeland is the dearest thing we own", distractors: ["Money is everything", "Family is everything", "Health is everything"], explanation: "أغلى means dearest and ما نملك means what we own.", ref: "reading" },
  { text: "Read: القراءة غذاء العقل. What does it mean?", correct: "Reading is food for the mind", distractors: ["Reading is rest", "Reading is fun", "Reading is work"], explanation: "غذاء means nourishment or food.", ref: "reading" },
  { text: "Read: النظافة من الإيمان. What does it mean?", correct: "Cleanliness is part of faith", distractors: ["Work is worship", "Charity is faith", "Fasting is faith"], explanation: "النظافة means cleanliness and الإيمان means faith.", ref: "reading" },
  { text: "Read: اطلبوا العلم ولو في الصين. What advice does it give?", correct: "Seek knowledge even far away", distractors: ["Travel to China", "Stay at home", "Trade abroad"], explanation: "ولو في الصين urges seeking knowledge however far it may be.", ref: "reading" },
  { text: "Which line means honesty is best?", correct: "الصدق أفضل سياسة", distractors: ["الكذب مهارة", "الغش طريق النجاح", "المكر قوة"], explanation: "الصدق means honesty and سياسة means policy.", ref: "reading" },
  { text: "Which sentence means time is precious?", correct: "الوقت ثمين", distractors: ["الوقت طويل", "الوقت مجاني", "الوقت مظلم"], explanation: "ثمين means precious.", ref: "reading" },
  { text: "Read: خير الناس أنفعهم للناس. What does it mean?", correct: "The best people help others", distractors: ["The best people are rich", "The best people are strong", "The best people are tall"], explanation: "أنفعهم للناس means those most helpful to others.", ref: "reading" },
  { text: "Read: العلم بلا عمل كشجرة بلا ثمر. What does it mean?", correct: "Knowledge without action is useless", distractors: ["Trees need water", "Study hard", "Plant more trees"], explanation: "ثمر means fruit, so the tree without fruit is the knowledge without action.", ref: "reading" },
];

const A10_READING_SILVER: Draft[] = [
  { text: "Read: سافر محمد إلى كانو مع والده ليحضر مؤتمر العلماء. Why did Muhammad travel?", correct: "To attend a scholars' conference", distractors: ["To visit his uncle", "To buy a car", "To play football"], explanation: "مؤتمر العلماء means a scholars' conference.", ref: "reading" },
  { text: "Read: نصح الإمام المصلين بالصبر عند المصيبة. What did the imam advise?", correct: "Patience in hardship", distractors: ["Anger in hardship", "Giving up in hardship", "Fear in hardship"], explanation: "المصيبة means calamity and الصبر means patience.", ref: "reading" },
  { text: "Read: كتب الطبيب للمريض دواء مرتين في اليوم. What should the patient do?", correct: "Take the medicine twice a day", distractors: ["Take it once a day", "Take it three times daily", "Take it every week"], explanation: "مرتين في اليوم means twice a day.", ref: "reading" },
  { text: "Read: حث المدرس تلاميذه على القراءة كل يوم. What did the teacher urge?", correct: "Reading every day", distractors: ["Playing every day", "Sleeping early", "Fasting daily"], explanation: "القراءة كل يوم means reading every day.", ref: "reading" },
  { text: "Which sentence means the traveler reached the city at night?", correct: "وصل المسافر إلى المدينة ليلا", distractors: ["وصل المسافر إلى المدينة صباحا", "خرج المسافر من المدينة ليلا", "عاد المسافر إلى المدينة ظهرا"], explanation: "ليلا means at night.", ref: "reading" },
  { text: "Read: قال الرئيس: التعليم سلاح التنمية. What is education to the president?", correct: "A weapon for development", distractors: ["A burden on the nation", "A luxury for the rich", "A problem for schools"], explanation: "سلاح التنمية means the weapon of development.", ref: "reading" },
  { text: "Which sentence means the Quran is guidance for mankind?", correct: "القرآن هدى للناس", distractors: ["القرآن تاريخ للناس", "القرآن قصة للناس", "القرآن لغة للناس"], explanation: "هدى means guidance.", ref: "reading" },
  { text: "Read: احترم الصغير الكبير. What does it teach?", correct: "The young should respect elders", distractors: ["The old should serve the young", "Age brings weakness", "Youth is strength"], explanation: "احترم الصغير الكبير means let the young one respect the elder.", ref: "reading" },
];

const A10_READING_GOLD: Draft[] = [
  { text: "Read: من يعمل مثقال ذرة خيرا يره. What does it promise?", correct: "Even a tiny good deed is rewarded", distractors: ["Big deeds only count", "Evil deeds are hidden", "Deeds are weighed at night"], explanation: "مثقال ذرة means the weight of an atom.", ref: "reading" },
  { text: "Read: إنما بعثت لأتمم مكارم الأخلاق. What was the mission?", correct: "To perfect noble character", distractors: ["To build mosques", "To teach trade", "To lead armies"], explanation: "مكارم الأخلاق means noble morals and character.", ref: "reading" },
  { text: "Read: إن الله لا يغير ما بقوم حتى يغيروا ما بأنفسهم. What does it teach?", correct: "Change starts within ourselves", distractors: ["God changes nations overnight", "People cannot change", "Leaders change nations alone"], explanation: "The verse ties a nation's change to inner personal change.", ref: "reading" },
  { text: "Read: رب زدني علما. What does this prayer ask for?", correct: "More knowledge", distractors: ["More wealth", "More children", "More power"], explanation: "زدني علما means increase me in knowledge.", ref: "reading" },
  { text: "Read: اقرأ باسم ربك الذي خلق. What is the first command here?", correct: "Read", distractors: ["Pray", "Fast", "Give charity"], explanation: "اقرأ is the very first word revealed in the Quran.", ref: "reading" },
  { text: "Read: ربنا هب لنا من أزواجنا وذرياتنا قرة أعين. What does it ask for?", correct: "Peace and joy from family", distractors: ["More money", "Long life", "Good health"], explanation: "قرة أعين means the delight of the eyes.", ref: "reading" },
  { text: "Read: رب أوزعني أن أشكر نعمتك. What does it ask for?", correct: "The ability to thank God for blessings", distractors: ["More blessings", "A new home", "Forgiveness alone"], explanation: "أوزعني أن أشكر means enable me to give thanks.", ref: "reading" },
  { text: "Read: لئن شكرتم لأزيدنكم. What does God promise?", correct: "He increases their blessings", distractors: ["He tests them more", "He takes away wealth", "He forgives all sins"], explanation: "لأزيدنكم means I will surely increase you.", ref: "reading" },
];

const A10_NUMBERS_BRONZE: Draft[] = [
  { text: "What number is مئتان?", correct: "200", distractors: ["100", "1000", "300"], explanation: "مئتان (mi atan) means two hundred.", ref: "numbers" },
  { text: "What number is ألف?", correct: "1000", distractors: ["100", "10000", "100000"], explanation: "ألف (alf) means one thousand.", ref: "numbers" },
  { text: "What number is نصف?", correct: "1/2", distractors: ["1/4", "1/3", "3/4"], explanation: "نصف (nisf) means one half.", ref: "numbers" },
  { text: "What number is ربع?", correct: "1/4", distractors: ["1/2", "1/3", "1/5"], explanation: "ربع (rub) means one quarter.", ref: "numbers" },
  { text: "What does ٪ mean?", correct: "Percent", distractors: ["Dollar", "Minutes", "Degrees"], explanation: "٪ is the percent sign in Arabic.", ref: "numbers" },
  { text: "What does ٨٠ mean?", correct: "Eighty", distractors: ["Eighteen", "Eight", "Eight hundred"], explanation: "٨٠ reads as eighty.", ref: "numbers" },
  { text: "What does ٩٠ mean?", correct: "Ninety", distractors: ["Nineteen", "Nine", "Nine hundred"], explanation: "٩٠ reads as ninety.", ref: "numbers" },
  { text: "What does سبعون mean?", correct: "70", distractors: ["17", "77", "700"], explanation: "سبعون (sab un) means seventy.", ref: "numbers" },
];

const A10_NUMBERS_SILVER: Draft[] = [
  { text: "What is نصف المئة?", correct: "50", distractors: ["25", "100", "75"], explanation: "Half of one hundred is fifty.", ref: "numbers" },
  { text: "What is ربع الألف?", correct: "250", distractors: ["500", "750", "100"], explanation: "A quarter of one thousand is two hundred and fifty.", ref: "numbers" },
  { text: "What is ثلاثة أرباع المئة?", correct: "75", distractors: ["25", "50", "90"], explanation: "Three quarters of one hundred is seventy five.", ref: "numbers" },
  { text: "What is ١٠ × ١٢?", correct: "120", distractors: ["102", "112", "210"], explanation: "Ten times twelve is one hundred and twenty.", ref: "numbers" },
  { text: "What is ألف divided by عشرة?", correct: "100", distractors: ["10", "1000", "10000"], explanation: "One thousand divided by ten is one hundred.", ref: "numbers" },
  { text: "What is ٥٠٪ of 200?", correct: "100", distractors: ["50", "150", "200"], explanation: "Fifty percent is one half, and half of two hundred is one hundred.", ref: "numbers" },
  { text: "What is ٢٥٪ of 80?", correct: "20", distractors: ["25", "40", "15"], explanation: "Twenty five percent is one quarter, a quarter of eighty is twenty.", ref: "numbers" },
  { text: "How is 350 written in Arabic words?", correct: "ثلاثمئة وخمسون", distractors: ["ثلاثمئة وخمسة", "خمسمئة وثلاثون", "ثلاثة وخمسون"], explanation: "350 is ثلاثمئة وخمسون.", ref: "numbers" },
];

const A10_NUMBERS_GOLD: Draft[] = [
  { text: "A book costs ٢٥٠ naira. You pay ٥٠٠ naira. What change do you get?", correct: "٢٥٠ naira", distractors: ["١٥٠ naira", "٢٠٠ naira", "٣٥٠ naira"], explanation: "Five hundred minus two hundred and fifty is two hundred and fifty.", ref: "numbers" },
  { text: "Oranges cost ٤٠ naira each. How much do ٥ oranges cost?", correct: "٢٠٠ naira", distractors: ["١٦٠ naira", "٢٤٠ naira", "١٨٠ naira"], explanation: "Forty times five is two hundred.", ref: "numbers" },
  { text: "What is ثلث, one third, of ٩٠?", correct: "30", distractors: ["20", "45", "60"], explanation: "ثلث means one third and ninety divided by three is thirty.", ref: "numbers" },
  { text: "What is خمس, one fifth, of ١٠٠?", correct: "20", distractors: ["25", "10", "50"], explanation: "خمس means one fifth and one hundred divided by five is twenty.", ref: "numbers" },
  { text: "What is ٧٥٪ of ٤٠٠?", correct: "300", distractors: ["250", "200", "350"], explanation: "Seventy five percent is three quarters, and three quarters of four hundred is three hundred.", ref: "numbers" },
  { text: "Which fraction is larger: نصف or ربع?", correct: "نصف", distractors: ["ربع", "هما متساويان", "لا يمكن المقارنة"], explanation: "نصف is one half and ربع is one quarter, and one half is larger.", ref: "numbers" },
  { text: "How is ١٩٤٥ written in Arabic words?", correct: "ألف وتسعمئة وخمسة وأربعون", distractors: ["ألف وتسعمئة وأربعة وخمسون", "ألف وست مئة وأربعون", "ألف وتسعمئة وتسعة وعشرون"], explanation: "١٩٤٥ is ألف وتسعمئة وخمسة وأربعون.", ref: "numbers" },
  { text: "A class of ٤٥ pupils lost ثلثهم to illness. How many were ill?", correct: "15", distractors: ["10", "20", "30"], explanation: "ثلث, one third, of forty five is fifteen.", ref: "numbers" },
];

// ---------------------------------------------------------------------------
// Plumbing
// ---------------------------------------------------------------------------

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

const CONTENT: Record<string, Record<string, Record<Level, Draft[]>>> = {
  "4-6": {
    "arabic-alphabet": { bronze: A4_ALPHABET_BRONZE, silver: A4_ALPHABET_SILVER, gold: A4_ALPHABET_GOLD },
    "arabic-words": { bronze: A4_WORDS_BRONZE, silver: A4_WORDS_SILVER, gold: A4_WORDS_GOLD },
    "arabic-reading": { bronze: A4_READING_BRONZE, silver: A4_READING_SILVER, gold: A4_READING_GOLD },
    "arabic-numbers": { bronze: A4_NUMBERS_BRONZE, silver: A4_NUMBERS_SILVER, gold: A4_NUMBERS_GOLD },
  },
  "7-9": {
    "arabic-alphabet": { bronze: A7_ALPHABET_BRONZE, silver: A7_ALPHABET_SILVER, gold: A7_ALPHABET_GOLD },
    "arabic-words": { bronze: A7_WORDS_BRONZE, silver: A7_WORDS_SILVER, gold: A7_WORDS_GOLD },
    "arabic-reading": { bronze: A7_READING_BRONZE, silver: A7_READING_SILVER, gold: A7_READING_GOLD },
    "arabic-numbers": { bronze: A7_NUMBERS_BRONZE, silver: A7_NUMBERS_SILVER, gold: A7_NUMBERS_GOLD },
  },
  "10-12": {
    "arabic-alphabet": { bronze: A10_ALPHABET_BRONZE, silver: A10_ALPHABET_SILVER, gold: A10_ALPHABET_GOLD },
    "arabic-words": { bronze: A10_WORDS_BRONZE, silver: A10_WORDS_SILVER, gold: A10_WORDS_GOLD },
    "arabic-reading": { bronze: A10_READING_BRONZE, silver: A10_READING_SILVER, gold: A10_READING_GOLD },
    "arabic-numbers": { bronze: A10_NUMBERS_BRONZE, silver: A10_NUMBERS_SILVER, gold: A10_NUMBERS_GOLD },
  },
};

const TOPIC_PREFIX: Record<string, string> = {
  "arabic-alphabet": "ARA",
  "arabic-words": "WRD",
  "arabic-reading": "RED",
  "arabic-numbers": "NUM",
};

function toQuestions(bandId: string, topicId: string, levels: Record<Level, Draft[]>): Question[] {
  const out: Question[] = [];
  const band = BANDS.find((b) => b.id === bandId)!;
  for (const level of ["bronze", "silver", "gold"] as const) {
    const drafts = levels[level];
    if (drafts.length !== 8) throw new Error(`${bandId} ${topicId} ${level} needs 8 drafts, found ${drafts.length}`);
    drafts.forEach((d, i) => {
      const index = i % 4;
      out.push({
        code: `${band.token}-${SUBJECT_PREFIX}-${TOPIC_PREFIX[topicId]}-${LEVEL_LETTER[level]}-${String(LEVEL_NUM[level][i]).padStart(3, "0")}`,
        band: band.id,
        subject: SUBJECT_ID,
        topic: topicId as Question["topic"],
        level,
        text: d.text,
        options: optionsFor(d.correct, d.distractors, index),
        correctIndex: index,
        explanation: d.explanation,
        curriculumRef: refFor(band.id, d.ref as keyof typeof REF_PHRASE),
        author: AUTHOR,
        reviewer: null,
        status: "draft",
      });
    });
  }
  return out;
}

let errors = 0;
for (const bandId of Object.keys(CONTENT)) {
  const outDir = path.join(ROOT, bandId, "arabic");
  mkdirSync(outDir, { recursive: true });
  const bandContent = CONTENT[bandId]!;
  for (const topicId of Object.keys(bandContent)) {
    const levels = bandContent[topicId]!;
    const topic = TOPICS.find((t) => t.id === topicId);
    if (!topic) throw new Error(`unknown topic ${topicId}`);
    const questions = toQuestions(bandId, topicId, levels);
    const file: TopicFile = { band: bandId as TopicFile["band"], subject: SUBJECT_ID as TopicFile["subject"], topic: topicId as TopicFile["topic"], title: topic.label, questions };
    const issues = validateTopicFile(file, {});
    const bad = issues.filter((i) => i.severity === "error");
    if (!isClean(issues)) {
      errors += bad.length;
      console.error(`\n${bandId}/${topicId}: ${bad.length} errors`);
      for (const issue of bad.slice(0, 15)) console.error(`  ${issue.code}${issue.field ? ` [${issue.field}]` : ""} ${issue.message}`);
    } else {
      console.log(`${bandId}/${topicId}: ${questions.length} questions clean`);
    }
    writeFileSync(path.join(outDir, `${topicId}.json`), JSON.stringify(file, null, 2) + "\n");
  }
}

if (errors > 0) process.exitCode = 1;
