import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Music banks for all three age bands (4-6 Sprouts, 7-9 Explorers, 10-12 Adventurers).
 * Written by hand, checked by the validator. Eight questions per level,
 * twenty four per topic, two hundred and eighty eight in all. The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "MSC";
const AUTHOR = "AI draft v1";

const REFS: Record<string, Record<string, string>> = {
  "4-6": {
    rhythm: "rhythm and beats",
    instruments: "musical instruments",
    songs: "songs and singing",
    tones: "pitch and tones",
  },
  "7-9": {
    rhythm: "rhythm and beats",
    instruments: "musical instruments",
    songs: "songs and singing",
    tones: "pitch and tones",
  },
  "10-12": {
    rhythm: "rhythm and beats",
    instruments: "musical instruments",
    songs: "songs and singing",
    tones: "pitch and tones",
  },
};

const REF_LEVEL: Record<string, Record<Level, string>> = {
  "4-6": { bronze: "Nursery 2", silver: "Primary 1", gold: "Primary 1" },
  "7-9": { bronze: "Primary 3", silver: "Primary 3", gold: "Primary 3" },
  "10-12": { bronze: "Primary 5", silver: "Primary 5", gold: "Primary 5" },
};

function refFor(bandId: string, topicId: string, level: Level): string {
  return `NERDC ${REF_LEVEL[bandId]![level]} Music, ${REFS[bandId]![topicId]}`;
}

/* ================= BAND 4-6 (Sprouts) ================= */

const P46_RHYTHM_BRONZE: Draft[] = [
  { text: "Which thing makes a beat?", correct: "A drum", distractors: ["A book", "A plate", "A shoe"], explanation: "A drum makes a strong beat." },
  { text: "What do we clap to keep a beat?", correct: "Our hands", distractors: ["Our feet", "Our nose", "Our hair"], explanation: "Clapping hands keeps a steady beat." },
  { text: "What is a beat?", correct: "A steady sound", distractors: ["A loud flash", "A cold wind", "A bright light"], explanation: "A beat is a steady, repeating sound." },
  { text: "What do we tap our feet to?", correct: "The beat", distractors: ["The wind", "The rain", "The dark"], explanation: "We tap our feet to the beat." },
  { text: "Which one can make a loud beat?", correct: "A drum", distractors: ["A teddy", "A mat", "A cup"], explanation: "A drum makes a loud beat." },
  { text: "What does fast music make us want to do?", correct: "Dance", distractors: ["Sleep", "Cry", "Hide"], explanation: "Fast music makes us want to dance." },
  { text: "What does slow music make us feel?", correct: "Calm", distractors: ["Wild", "Angry", "Silly"], explanation: "Slow music feels calm and soft." },
  { text: "Which one has a beat?", correct: "A song", distractors: ["A wall", "A cup", "A stone"], explanation: "A song keeps a beat." },
];

const P46_RHYTHM_SILVER: Draft[] = [
  { text: "How many beats are in a 4/4 bar?", correct: "Four", distractors: ["Two", "Three", "Eight"], explanation: "A 4/4 bar has four beats." },
  { text: "What does tempo mean?", correct: "The speed of the music", distractors: ["The loudness", "The words", "The singer"], explanation: "Tempo is the speed of the music." },
  { text: "How do you clap a slow beat?", correct: "Slowly with wide gaps", distractors: ["Very fast", "Not at all", "With loud shouts"], explanation: "A slow beat claps with wide gaps between claps." },
  { text: "What keeps time in music?", correct: "The beat", distractors: ["The singer", "The words", "The colour"], explanation: "The beat keeps time in music." },
  { text: "What does fast music feel like?", correct: "Exciting", distractors: ["Sleepy", "Calm", "Quiet"], explanation: "Fast music feels exciting and full of energy." },
  { text: "How do drummers keep time?", correct: "By drumming a steady beat", distractors: ["By shouting", "By sleeping", "By dancing only"], explanation: "Drummers keep time with a steady beat." },
  { text: "When music is fast, we say it is...", correct: "Quick", distractors: ["Slow", "Soft", "Long"], explanation: "Quick means fast in music." },
  { text: "Why keep a steady beat?", correct: "So everyone plays together", distractors: ["To shout loudly", "To break the drum", "To sleep soundly"], explanation: "A steady beat holds the group together." },
];

const P46_RHYTHM_GOLD: Draft[] = [
  { text: "What is rhythm made of?", correct: "Beats", distractors: ["Words", "Colours", "Numbers"], explanation: "Rhythm is made of beats." },
  { text: "What does 4/4 time mean?", correct: "Four beats in a bar", distractors: ["Four drums in a band", "Four songs in a row", "No beats at all"], explanation: "4/4 time means four beats in each bar." },
  { text: "How many beats in two bars of 4/4?", correct: "Eight", distractors: ["Four", "Six", "Ten"], explanation: "Each 4/4 bar has four beats. Two bars have eight." },
  { text: "What is a beat pattern?", correct: "Rhythm", distractors: ["Colour", "Number", "Picture"], explanation: "Rhythm is a pattern of beats." },
  { text: "Which one shows a fast rhythm?", correct: "A quick drum beat", distractors: ["A slow walk", "A long nap", "A deep sleep"], explanation: "A quick drum beat is a fast rhythm." },
  { text: "Highlife has what?", correct: "A steady beat", distractors: ["No beat", "Only silence", "Loud shouts"], explanation: "Highlife songs ride on a steady beat." },
  { text: "What do we count in 4/4?", correct: "1, 2, 3, 4", distractors: ["1, 2, 3", "1 to 10", "Only 4"], explanation: "In 4/4, we count to four." },
  { text: "A drum beat that repeats is a...", correct: "Pattern", distractors: ["Wall", "Chair", "Door"], explanation: "A repeating beat is called a pattern." },
];

const P46_INSTRUMENTS_BRONZE: Draft[] = [
  { text: "Which is a drum?", correct: "A drum", distractors: ["A guitar", "A flute", "A book"], explanation: "A drum is hit to make sound." },
  { text: "Which one is beaten?", correct: "The drum", distractors: ["The guitar", "The flute", "The piano"], explanation: "Drums are beaten with hands or sticks." },
  { text: "What has six strings?", correct: "A guitar", distractors: ["A drum", "A flute", "A bell"], explanation: "A guitar has six strings." },
  { text: "Which one do we blow?", correct: "A flute", distractors: ["A drum", "A guitar", "A piano"], explanation: "We blow into a flute to make sound." },
  { text: "Which one has black and white keys?", correct: "A piano", distractors: ["A drum", "A flute", "A talking drum"], explanation: "A piano has black and white keys." },
  { text: "What plays highlife?", correct: "A guitar", distractors: ["A ruler", "A cup", "A chair"], explanation: "The guitar is common in highlife music." },
  { text: "What do we press?", correct: "The keys", distractors: ["The strings", "The drum head", "The bow"], explanation: "We press the keys to play a keyboard." },
  { text: "Which one is wooden with bars?", correct: "A xylophone", distractors: ["A piano", "A drum", "A flute"], explanation: "A xylophone has wooden bars you hit." },
];

const P46_INSTRUMENTS_SILVER: Draft[] = [
  { text: "Which drum can talk?", correct: "The talking drum", distractors: ["A tin can", "A cooking pot", "A big bell"], explanation: "The talking drum copies speech with its beat." },
  { text: "Which one has strings?", correct: "A guitar", distractors: ["A flute", "A drum", "A xylophone"], explanation: "Guitars make sound from strings." },
  { text: "Which is blown to play?", correct: "A flute", distractors: ["A drum", "A guitar", "A keyboard"], explanation: "Flutes are wind instruments because we blow them." },
  { text: "How is the udu played?", correct: "By tapping the pot", distractors: ["By blowing it", "By plucking strings", "By pressing keys"], explanation: "The udu is a clay pot drum you tap." },
  { text: "Which plays high notes?", correct: "A flute", distractors: ["A big drum", "A bass drum", "A udu"], explanation: "A flute makes high sweet notes." },
  { text: "What kind is a piano?", correct: "Keyboard", distractors: ["Percussion", "String", "Wind"], explanation: "A piano has keys, so it is a keyboard instrument." },
  { text: "Which one do we beat?", correct: "A drum", distractors: ["A violin", "A flute", "A trumpet"], explanation: "Percussion instruments are beaten or shaken." },
  { text: "Which is from Naija?", correct: "The talking drum", distractors: ["The piano", "The violin", "The harp"], explanation: "The talking drum is a famous Nigerian drum." },
];

const P46_INSTRUMENTS_GOLD: Draft[] = [
  { text: "How is a talking drum made to talk?", correct: "By beating and squeezing it", distractors: ["By blowing it", "By plucking strings", "By pressing keys"], explanation: "The pitch changes when the tension is squeezed." },
  { text: "Which one uses strings?", correct: "A guitar", distractors: ["A drum", "A flute", "An ekwe"], explanation: "Guitar strings are plucked to make sound." },
  { text: "Which is a gourd shaker?", correct: "A shekere", distractors: ["A flute", "A piano", "A guitar"], explanation: "The shekere is a gourd covered in bead nets." },
  { text: "Where did the ekwe come from?", correct: "Igbo land", distractors: ["China", "France", "Egypt"], explanation: "The ekwe is a wooden slit drum from Igbo land." },
  { text: "Which one is struck, not blown?", correct: "The udu", distractors: ["The flute", "The whistle", "The trumpet"], explanation: "The udu is a clay pot you strike." },
  { text: "Drums belong to which group?", correct: "Percussion", distractors: ["String", "Wind", "Keyboard"], explanation: "Drums are percussion because they are struck." },
  { text: "The gan gan is which kind of drum?", correct: "A talking drum", distractors: ["A bass drum", "A snare drum", "A bongo"], explanation: "The gan gan is the Yoruba talking drum." },
  { text: "Which one makes sound with keys?", correct: "A keyboard", distractors: ["A drum", "A flute", "A shekere"], explanation: "A keyboard makes sound when keys are pressed." },
];

const P46_SONGS_BRONZE: Draft[] = [
  { text: "What do we do in a choir?", correct: "Sing together", distractors: ["Dance only", "Run", "Sleep"], explanation: "A choir is a group of singers." },
  { text: "Which one is a song?", correct: "Happy Birthday", distractors: ["A drum beat", "A whistle", "A clap"], explanation: "Happy Birthday is a song we all know." },
  { text: "How many people sing in a duet?", correct: "Two", distractors: ["One", "Three", "Ten"], explanation: "A duet is a song for two singers." },
  { text: "What is a hymn?", correct: "A church song", distractors: ["A dance", "A drum", "A rhyme"], explanation: "A hymn is a song sung in church." },
  { text: "What do we use to sing?", correct: "Our voice", distractors: ["Our feet", "Our hands", "Our eyes"], explanation: "We sing with our voice." },
  { text: "What do singers need?", correct: "Teamwork", distractors: ["Shoes", "Hats", "Caps"], explanation: "Singers work as a team." },
  { text: "Which is a highlife song?", correct: "Highlife", distractors: ["Rock", "Jazz", "Blues"], explanation: "Highlife is a popular Nigerian music style." },
  { text: "Which song helps babies sleep?", correct: "A lullaby", distractors: ["A march", "A highlife tune", "A drum beat"], explanation: "Lullabies help babies sleep." },
];

const P46_SONGS_SILVER: Draft[] = [
  { text: "What is call and response?", correct: "A singer leads, others answer", distractors: ["Two drums clashing", "Singing in sleep", "Reading a poem"], explanation: "In call and response, one sings and the group answers." },
  { text: "Highlife is from where?", correct: "Nigeria", distractors: ["France", "Japan", "Italy"], explanation: "Highlife began in Ghana and Nigeria." },
  { text: "What is owambe?", correct: "Party music", distractors: ["Church music", "School music", "Funeral drums"], explanation: "Owambe parties blast loud Nigerian party music." },
  { text: "What does a choir need to sing well?", correct: "Singing in tune together", distractors: ["Loud shoes", "Fast running", "Big drums"], explanation: "Choir members must blend and sing in tune." },
  { text: "Who leads a choir?", correct: "A conductor", distractors: ["A drummer", "A dancer", "A cook"], explanation: "The conductor leads the choir with hand signs." },
  { text: "Where do we find call and response?", correct: "Nigerian folk songs", distractors: ["Silent songs", "Phone tones", "Sad songs"], explanation: "Nigerian folk songs often use call and response." },
  { text: "What does a hymn praise?", correct: "God", distractors: ["Food", "Money", "Cars"], explanation: "Hymns are songs of praise to God." },
  { text: "Why do we sing as one?", correct: "It sounds lovely as one", distractors: ["To shout", "To win a prize", "To scare birds"], explanation: "Singing together makes music sound full and rich." },
];

const P46_SONGS_GOLD: Draft[] = [
  { text: "What is highlife?", correct: "Nigerian guitar dance music", distractors: ["Slow church music", "Silent drum music", "Children clapping only"], explanation: "Highlife blends guitars, drums and horns." },
  { text: "What does an anthem do?", correct: "Honours a nation or cause", distractors: ["Makes babies sleep", "Calls animals", "Ends a film"], explanation: "Anthems are songs that honour a nation." },
  { text: "Who answers the call?", correct: "The group", distractors: ["No one", "The leader only", "The drummer"], explanation: "The leader calls, and the group responds." },
  { text: "Which song is sung at owambe?", correct: "Highlife party tunes", distractors: ["Hymns only", "Lullabies", "School anthems"], explanation: "Owambe parties play loud highlife and afrobeats." },
  { text: "What do hymns teach us?", correct: "Stories of faith", distractors: ["How to cook", "How to drive", "How to farm"], explanation: "Hymns teach faith through song." },
  { text: "What is our anthem?", correct: "The country's song", distractors: ["A church song", "A birthday song", "A school chant"], explanation: "A national anthem represents Nigeria." },
  { text: "Why learn songs from home?", correct: "They carry our culture", distractors: ["They make us rich", "They grow hair", "They stop rain"], explanation: "Traditional songs carry our history and values." },
  { text: "What makes a good choir song?", correct: "Blended voices in tune", distractors: ["Shouting loudly", "Wrong notes", "No melody"], explanation: "Good choir singing blends voices in tune." },
];

const P46_TONES_BRONZE: Draft[] = [
  { text: "A high note sounds...", correct: "Like a small bird", distractors: ["Like a big drum", "Like thunder", "Like a truck"], explanation: "High notes sound light and sweet." },
  { text: "Which has a low sound?", correct: "A big drum", distractors: ["A tiny bell", "A flute", "A bird whistle"], explanation: "Big drums make low sounds." },
  { text: "What does loud mean?", correct: "Strong sound", distractors: ["Soft sound", "No sound", "Slow music"], explanation: "Loud means a strong, big sound." },
  { text: "What does soft mean?", correct: "Quiet sound", distractors: ["Loud sound", "Fast sound", "Hard sound"], explanation: "Soft means a quiet, gentle sound." },
  { text: "Which makes a high sound?", correct: "A whistle", distractors: ["A big drum", "A lion's roar", "A thunderclap"], explanation: "A whistle makes a high sound." },
  { text: "Which makes a low sound?", correct: "Thunder", distractors: ["A whistle", "A tiny bell", "A flute"], explanation: "Thunder rumbles low." },
  { text: "Which is quieter?", correct: "A whisper", distractors: ["A shout", "A drum", "A horn"], explanation: "A whisper is a very soft sound." },
  { text: "Which is louder?", correct: "A drum beat", distractors: ["A whisper", "A sigh", "A tiptoe"], explanation: "A drum beat is loud." },
];

const P46_TONES_SILVER: Draft[] = [
  { text: "What does pitch mean?", correct: "How high or low a sound is", distractors: ["How loud a sound is", "How fast the music is", "How many drums play"], explanation: "Pitch is how high or low a sound is." },
  { text: "Which note is higher?", correct: "The flute note", distractors: ["The bass drum note", "The udu note", "The big bell note"], explanation: "The flute plays higher notes." },
  { text: "What does forte mean?", correct: "Loud", distractors: ["Soft", "Fast", "High"], explanation: "Forte means loud in music." },
  { text: "What does piano mean?", correct: "Soft", distractors: ["Loud", "Fast", "High"], explanation: "Piano means soft in music." },
  { text: "Which bird sings high?", correct: "A tiny bird", distractors: ["A big frog", "A drum", "A cow"], explanation: "Small birds sing high notes." },
  { text: "Which is higher, a flute or a drum?", correct: "A flute", distractors: ["A drum", "Both the same", "Neither"], explanation: "The flute is higher than a drum." },
  { text: "What is a deep voice?", correct: "A low voice", distractors: ["A high voice", "A loud voice", "A shrill voice"], explanation: "Deep voices sing low notes." },
  { text: "How do you sing softly?", correct: "In a whisper voice", distractors: ["At full volume", "Shouting", "Screaming"], explanation: "Singing softly uses a quiet voice." },
];

const P46_TONES_GOLD: Draft[] = [
  { text: "Which sign means soft music?", correct: "Piano", distractors: ["Forte", "Fast", "Tempo"], explanation: "Piano tells us to play soft." },
  { text: "Which sign means loud music?", correct: "Forte", distractors: ["Piano", "Slow", "Soft"], explanation: "Forte tells us to play loud." },
  { text: "What makes a note sound high?", correct: "Fast vibrations", distractors: ["Slow vibrations", "Loud beating", "Soft tapping"], explanation: "Fast vibrations make high sounds." },
  { text: "Pitch tells us if sound is...", correct: "High or low", distractors: ["Loud or soft", "Fast or slow", "Near or far"], explanation: "Pitch is about high and low." },
  { text: "Which beast makes a low sound?", correct: "A lion", distractors: ["A canary", "A mouse", "A sparrow"], explanation: "A lion roars low and deep." },
  { text: "Drummers play forte to be...", correct: "Loud", distractors: ["Soft", "Slow", "Quiet"], explanation: "Forte means loud and strong." },
  { text: "A whisper is like which sign?", correct: "Piano", distractors: ["Forte", "Fast", "Tempo"], explanation: "A whisper is soft, like piano." },
  { text: "Which one is loudest?", correct: "A big owambe drum", distractors: ["A whisper", "A soft flute", "A quiet hum"], explanation: "Owambe drums are played loud and strong." },
];

/* ================= BAND 7-9 (Explorers) ================= */

const P79_RHYTHM_BRONZE: Draft[] = [
  { text: "What is a steady beat?", correct: "A regular repeating sound", distractors: ["A random sound", "A silence", "A whisper"], explanation: "A steady beat repeats at the same speed." },
  { text: "How many beats are in a 4/4 bar?", correct: "Four", distractors: ["Two", "Three", "Six"], explanation: "4/4 time has four beats per bar." },
  { text: "What do we call the speed of music?", correct: "Tempo", distractors: ["Rhythm", "Melody", "Harmony"], explanation: "Tempo is how fast or slow music goes." },
  { text: "Which one can keep a beat?", correct: "A drum", distractors: ["A chair", "A book", "A door"], explanation: "A drum plays a strong, steady beat." },
  { text: "What does fast music feel like?", correct: "Exciting and quick", distractors: ["Calm and slow", "Sad and sleepy", "Quiet and still"], explanation: "Fast music feels exciting and full of energy." },
  { text: "How do we keep time with our hands?", correct: "By clapping in time", distractors: ["By waving randomly", "By hiding them", "By folding arms"], explanation: "Clapping in time is a simple way to keep the beat." },
  { text: "Which word means slow tempo?", correct: "Largo", distractors: ["Allegro", "Presto", "Vivace"], explanation: "Largo means slow and broad." },
  { text: "What is a pattern of beats called?", correct: "Rhythm", distractors: ["Melody", "Lyric", "Tune"], explanation: "Rhythm is the pattern of beats in music." },
];

const P79_RHYTHM_SILVER: Draft[] = [
  { text: "In 4/4 time, one bar holds how many beats?", correct: "Four beats", distractors: ["Two beats", "Three beats", "Eight beats"], explanation: "The top number in 4/4 tells us four beats per bar." },
  { text: "What is the first beat of a bar called?", correct: "The downbeat", distractors: ["The upbeat", "The rest", "The silence"], explanation: "The first beat of a bar is the downbeat." },
  { text: "What does the top number in 4/4 show?", correct: "How many beats per bar", distractors: ["How loud to play", "How fast to play", "How many drums"], explanation: "In 4/4, the 4 means four beats per bar." },
  { text: "What tempo is best for a slow march?", correct: "A slow, steady tempo", distractors: ["A very fast one", "A silent one", "The loudest one"], explanation: "A slow march needs a steady, slow tempo." },
  { text: "How should you clap in a steady beat?", correct: "Evenly spaced claps", distractors: ["Faster and faster", "Random claps", "No claps"], explanation: "A steady beat keeps even spacing." },
  { text: "What is a drum pattern that repeats?", correct: "A repeating rhythm pattern", distractors: ["A random noise", "A single clap", "A silent gap"], explanation: "An ostinato is a rhythm that repeats again and again." },
  { text: "What helps players keep a steady tempo?", correct: "A metronome", distractors: ["A loud drum", "A big stick", "A fast song"], explanation: "A metronome ticks to keep a steady beat." },
  { text: "What does clapping off the beat mean?", correct: "Clapping between the beats", distractors: ["Clapping on every beat", "Not clapping", "Clapping backwards"], explanation: "Offbeat clapping falls between the main beats." },
];

const P79_RHYTHM_GOLD: Draft[] = [
  { text: "What is a time signature?", correct: "The numbers that show beats per bar", distractors: ["The name of the song", "The loudness of music", "The key of the song"], explanation: "A time signature like 4/4 shows beats per bar." },
  { text: "What does the bottom number in 4/4 mean?", correct: "Each beat is a quarter note", distractors: ["Four beats per bar", "Four bars per song", "Four drums per group"], explanation: "The bottom 4 means the beat is a quarter note." },
  { text: "What is two rhythms at once called?", correct: "Polyrhythm", distractors: ["One rhythm played twice", "No rhythm at all", "A very slow rhythm"], explanation: "Polyrhythm layers two different rhythmic patterns together." },
  { text: "Why do talking drums copy speech rhythms?", correct: "Because drums mimic the tone patterns of speech", distractors: ["Because drummers cannot sing", "Because drums are cheap", "Because of the weather"], explanation: "Tonal languages let drums echo the speech tune." },
  { text: "What is a rest in music?", correct: "A silence lasting a beat", distractors: ["A loud note", "A fast run", "A wrong note"], explanation: "A rest is a measured silence in the music." },
  { text: "In 4/4, which beats are strong?", correct: "Beats 1 and 3", distractors: ["Beats 2 and 4", "Beats 4 and 1", "All beats equally"], explanation: "In 4/4, beats 1 and 3 feel stronger." },
  { text: "What is Afrobeats rhythm built on?", correct: "Layered drum patterns", distractors: ["A single slow clap", "Silence between beats", "Random noise"], explanation: "Afrobeats stacks layered drum and bass patterns." },
  { text: "What do players call a very fast tempo?", correct: "Presto", distractors: ["Largo", "Adagio", "Grave"], explanation: "Presto means very fast." },
];

const P79_INSTRUMENTS_BRONZE: Draft[] = [
  { text: "Which instrument is a drum?", correct: "The talking drum", distractors: ["The guitar", "The flute", "The piano"], explanation: "The talking drum is a famous Nigerian instrument." },
  { text: "The guitar belongs to which group?", correct: "String", distractors: ["Wind", "Percussion", "Keyboard"], explanation: "The guitar makes sound from vibrating strings." },
  { text: "Which instrument is blown to make sound?", correct: "The flute", distractors: ["The drum", "The xylophone", "The shekere"], explanation: "Flutes make sound when air is blown across them." },
  { text: "Which one has keys?", correct: "The piano", distractors: ["The drum", "The flute", "The violin"], explanation: "The piano is played by pressing keys." },
  { text: "What does the xylophone have?", correct: "Wooden bars you hit", distractors: ["Strings you pluck", "Keys you press", "Holes you blow"], explanation: "A xylophone has wooden bars that make notes when struck." },
  { text: "Which is made of clay?", correct: "The udu", distractors: ["The ekwe", "The talking drum", "The shekere"], explanation: "The udu is a clay pot drum played by tapping." },
  { text: "Which instrument has six strings?", correct: "The guitar", distractors: ["The piano", "The drum", "The xylophone"], explanation: "A standard guitar has six strings." },
  { text: "Which instrument do you beat?", correct: "The ekwe", distractors: ["The flute", "The guitar", "The piano"], explanation: "The ekwe is a wooden slit drum from Igbo land, struck with sticks." },
];

const P79_INSTRUMENTS_SILVER: Draft[] = [
  { text: "The talking drum changes pitch when you...", correct: "Squeeze its tension ropes", distractors: ["Blow into it", "Pluck its strings", "Press its keys"], explanation: "Squeezing the ropes changes the drum's pitch." },
  { text: "Which group is the shekere in?", correct: "Percussion", distractors: ["Strings", "Winds", "Keyboards"], explanation: "The shekere is a gourd shaker, a percussion instrument." },
  { text: "How does a flute make sound?", correct: "Air blown across the hole", distractors: ["Hitting with a stick", "Plucking strings", "Pressing keys"], explanation: "Air blown across the mouthpiece vibrates to make sound." },
  { text: "Which one uses a bow?", correct: "The violin", distractors: ["The drum", "The flute", "The keyboard"], explanation: "A violin is played with a bow drawn across its strings." },
  { text: "Which one is common in highlife bands?", correct: "The guitar", distractors: ["The udu", "The ekwe", "The agogo"], explanation: "Highlife is built around guitar melodies and brass." },
  { text: "What kind of instrument is the ekwe?", correct: "A wooden slit drum", distractors: ["A clay pot", "A string guitar", "A bamboo flute"], explanation: "The ekwe is a carved wooden drum with a slit." },
  { text: "Which of these is not percussion?", correct: "The flute", distractors: ["The drum", "The agogo", "The shekere"], explanation: "The flute is a wind instrument, not percussion." },
  { text: "What does a keyboard make sound with?", correct: "Strings or pipes inside", distractors: ["Stretched skin", "Wooden bars", "Clay pots"], explanation: "Pianos use strings; organs use pipes and air." },
];

const P79_INSTRUMENTS_GOLD: Draft[] = [
  { text: "How does the talking drum copy speech?", correct: "By copying tone and rhythm patterns", distractors: ["By growing louder", "By changing colour", "By playing faster"], explanation: "Yoruba and tonal languages let drums imitate speech tones." },
  { text: "What is the udu made from?", correct: "Fired clay", distractors: ["Wood", "Brass", "Goat skin"], explanation: "The udu is a traditional clay pot drum of Igbo people." },
  { text: "Which of these is a wind instrument?", correct: "The trumpet", distractors: ["The violin", "The drum", "The xylophone"], explanation: "Trumpets are wind instruments played with breath." },
  { text: "What group does the piano belong to?", correct: "Keyboard", distractors: ["Percussion", "String", "Woodwind"], explanation: "The piano has keys, making it a keyboard instrument." },
  { text: "What is odd about the shekere?", correct: "It is shaken, not struck", distractors: ["It has keys", "It is blown", "It has strings"], explanation: "The shekere is shaken to rattle its bead net." },
  { text: "Which one has wooden bars?", correct: "Xylophone", distractors: ["Piano", "Flute", "Trumpet"], explanation: "The xylophone is struck, so it is percussion." },
  { text: "Why is the ekwe carved with a long slit?", correct: "So beating the slit makes sound", distractors: ["To hold water", "To hide food", "To decorate doors"], explanation: "The slit divides the ekwe and turns each side into a note." },
  { text: "Which pairs well with the talking drum?", correct: "The shekere", distractors: ["The piano only", "The harp", "The violin only"], explanation: "Shekeres and talking drums blend well in Nigerian ensembles." },
];

const P79_SONGS_BRONZE: Draft[] = [
  { text: "What is a choir?", correct: "A group of singers", distractors: ["A type of drum", "A dance style", "A music lesson"], explanation: "A choir is a group of people who sing together." },
  { text: "What is call and response?", correct: "One sings, others answer", distractors: ["Everyone silent", "Two drums clashing", "A single solo"], explanation: "Call and response is when a lead sings and the group answers." },
  { text: "Which song style is West African?", correct: "Highlife", distractors: ["Country", "Opera", "Flamenco"], explanation: "Highlife is a popular Nigerian music style." },
  { text: "What is a hymn?", correct: "A song of praise", distractors: ["A party tune", "A dance track", "A folk tale"], explanation: "Hymns are songs of praise, often sung in church." },
  { text: "Which song helps a baby sleep?", correct: "A lullaby", distractors: ["A marching tune", "A highlife hit", "A church chant"], explanation: "Lullabies help babies and children fall asleep." },
  { text: "Owambe parties are for what?", correct: "Nigerian celebrations", distractors: ["Church services", "Funerals only", "School exams"], explanation: "Owambe parties feature loud, festive Nigerian music." },
  { text: "What does our anthem do?", correct: "Unites Nigerians", distractors: ["Announces food", "Sells products", "Ends school"], explanation: "The national anthem unites Nigerians in pride." },
  { text: "How do choirs sing best?", correct: "Together in tune", distractors: ["Shouting over each other", "At different times", "Without practice"], explanation: "Choir members listen and blend in tune." },
];

const P79_SONGS_SILVER: Draft[] = [
  { text: "What role does the leader play in call and response?", correct: "Sings the call", distractors: ["Sings the answer", "Plays the drum", "Conducts only"], explanation: "In call and response, the leader sings the call line." },
  { text: "Which genre mixes guitar and brass?", correct: "Highlife", distractors: ["Gospel only", "Fuji only", "Apala only"], explanation: "Highlife blends horns, guitars and dance rhythms." },
  { text: "What is a soloist?", correct: "A singer who sings alone", distractors: ["A group of drummers", "A choir leader", "A dancer"], explanation: "A soloist sings alone, sometimes with a choir." },
  { text: "What does an anthem do for a country?", correct: "Builds unity and pride", distractors: ["Sells records", "Collects taxes", "Tells jokes"], explanation: "Anthems unite people with shared pride." },
  { text: "Why were hymns sung in mission schools?", correct: "They taught faith through song", distractors: ["They replaced exams", "They were for fun", "They kept time"], explanation: "Hymns taught Bible stories and songs in school." },
  { text: "What does a conductor do?", correct: "Guides the choir with hand signs", distractors: ["Plays the drum", "Writes the music", "Sells tickets"], explanation: "The conductor sets tempo and guides singers." },
  { text: "How does call and response teach?", correct: "By inviting everyone to join in", distractors: ["By boring listeners", "By being silent", "By ending early"], explanation: "Call and response invites everyone to sing along." },
  { text: "Which is true of folk songs?", correct: "Songs passed down generations", distractors: ["Brand new pop songs", "Foreign imports", "Shop adverts"], explanation: "Folk songs are passed from parents to children." },
];

const P79_SONGS_GOLD: Draft[] = [
  { text: "What makes choir singing full?", correct: "Singing different notes in harmony", distractors: ["Everyone on one note", "Shouting together", "Singing off-key"], explanation: "Harmony mixes voices on different notes." },
  { text: "How is call and response not a round?", correct: "In call and response, the leader cues each answer", distractors: ["A round has no singing", "Call and response is silent", "A round uses drums only"], explanation: "In a round, voices start the same tune at different times." },
  { text: "What does highlife mean?", correct: "Nigerian joy, dance and guitar style", distractors: ["Only sadness", "Only silence", "Only church worship"], explanation: "Highlife blends Yoruba and Igbo rhythms into dance music." },
  { text: "Why do people play owambe music loud?", correct: "To celebrate joyfully together", distractors: ["To scare neighbours", "To sell food", "To test speakers"], explanation: "Owambe music fills parties with energy and joy." },
  { text: "What is a lead singer's job in a choir?", correct: "To guide the melody line", distractors: ["To clap the rhythm", "To watch the exit", "To sell the records"], explanation: "The lead voice carries the main tune." },
  { text: "Why is an anthem special?", correct: "It belongs to everyone in the country", distractors: ["Only the president can sing it", "It has no melody", "It is sung only at funerals"], explanation: "Anthems belong to every citizen and unite them." },
  { text: "Why do people sing hymns at weddings?", correct: "To give thanks and bless the couple", distractors: ["For no reason", "To pass time", "To test the microphone"], explanation: "Hymns are sung to bless and give thanks at weddings." },
  { text: "How do folk songs preserve culture?", correct: "They pass stories and values down", distractors: ["They are only for tourists", "They are about foreign lands", "They change every week"], explanation: "Folk songs carry history, values and language." },
];

const P79_TONES_BRONZE: Draft[] = [
  { text: "What does pitch mean?", correct: "How high or low a sound is", distractors: ["How loud a sound is", "How fast music is", "How long a note lasts"], explanation: "Pitch describes how high or low a note sounds." },
  { text: "Which makes a high sound?", correct: "A whistle", distractors: ["A lion's roar", "Thunder", "A bass drum"], explanation: "Whistles make high, piercing sounds." },
  { text: "Which makes a low sound?", correct: "A bass drum", distractors: ["A tiny bell", "A flute", "A canary"], explanation: "Big drums and bass notes sound low." },
  { text: "What does forte mean?", correct: "Loud", distractors: ["Soft", "Fast", "Slow"], explanation: "Forte is the Italian word for loud." },
  { text: "What does piano mean in music?", correct: "Soft", distractors: ["Loud", "Fast", "High"], explanation: "Piano is the Italian word for soft." },
  { text: "Which is louder, a shout or a whisper?", correct: "A shout", distractors: ["A whisper", "They are the same", "Neither"], explanation: "A shout is louder than a whisper." },
  { text: "What kind of voice is deep?", correct: "A low voice", distractors: ["A high voice", "A thin voice", "A tiny voice"], explanation: "Deep voices are low in pitch." },
  { text: "What kind of voice is shrill?", correct: "A high voice", distractors: ["A low voice", "A deep voice", "A bass voice"], explanation: "Shrill voices are high in pitch." },
];

const P79_TONES_SILVER: Draft[] = [
  { text: "How do we show soft music on paper?", correct: "With a p (piano)", distractors: ["With an f (forte)", "With a big star", "With a red circle"], explanation: "Composers write p for soft (piano)." },
  { text: "Which sign means the music gets louder?", correct: "Crescendo", distractors: ["Diminuendo", "Pianissimo", "Largo"], explanation: "Crescendo means growing louder." },
  { text: "Which sign means the music gets softer?", correct: "Diminuendo", distractors: ["Crescendo", "Fortissimo", "Presto"], explanation: "Diminuendo means fading softer." },
  { text: "Why does a flute sound higher than a tuba?", correct: "It produces faster vibrations", distractors: ["It is louder", "It is bigger", "It is older"], explanation: "Smaller instruments vibrate faster, making higher pitches." },
  { text: "Volume tells us what?", correct: "How loud or soft a sound is", distractors: ["How high or low it is", "How fast it is", "How long it lasts"], explanation: "Volume is how loud or soft a sound is." },
  { text: "Which note is highest on a keyboard?", correct: "The one furthest right", distractors: ["The one furthest left", "The middle one", "They are all the same"], explanation: "Notes rise in pitch from left to right." },
  { text: "Which sign means very loud?", correct: "Fortissimo", distractors: ["Pianissimo", "Piano", "Largo"], explanation: "Fortissimo means very loud." },
  { text: "Which signs mean loud and soft?", correct: "Forte and piano", distractors: ["Allegro and Largo", "Presto and Adagio", "Fast and quick"], explanation: "Forte (loud) and piano (soft) are opposites." },
];

const P79_TONES_GOLD: Draft[] = [
  { text: "What makes a note sound sharp or flat?", correct: "Being slightly above or below a pitch", distractors: ["Being loud or soft", "Being fast or slow", "Being long or short"], explanation: "Sharp sits slightly above, flat slightly below a true pitch." },
  { text: "How do major and minor keys sound?", correct: "Major sounds bright, minor sounds sad", distractors: ["Major is louder", "Minor is faster", "They sound identical"], explanation: "Major keys sound bright; minor keys sound darker." },
  { text: "What is a scale in music?", correct: "Notes arranged in steps", distractors: ["A weighing tool", "A drum pattern", "A song title"], explanation: "A scale is a set of notes moving step by step." },
  { text: "What is a major third?", correct: "An interval of two whole tones", distractors: ["A very loud note", "Three drums playing", "Three bars of rest"], explanation: "A major third spans two whole tones." },
  { text: "What does a key signature tell us?", correct: "Which sharps or flats the piece uses", distractors: ["The speed of play", "The volume marking", "The length of song"], explanation: "The key signature lists sharps or flats to use." },
  { text: "Why does a big drum sound lower than a small drum?", correct: "Longer drum heads vibrate slower", distractors: ["Big drums are quieter", "Small drums are heavier", "Big drums are louder only"], explanation: "Bigger surfaces vibrate slower, lowering pitch." },
  { text: "What is the tonic of a key?", correct: "The home note the music rests on", distractors: ["The loudest note", "The last drum hit", "The singer's name"], explanation: "The tonic is the note the music feels at home on." },
  { text: "Which key sounds sad?", correct: "Minor", distractors: ["Major", "Both identical", "Neither exists"], explanation: "Minor keys carry a darker, sadder mood." },
];

/* ================= BAND 10-12 (Adventurers) ================= */

const P1012_RHYTHM_BRONZE: Draft[] = [
  { text: "What is a time signature?", correct: "Numbers showing beats per bar", distractors: ["The key of the song", "The loudness marking", "The song title"], explanation: "A time signature like 3/4 or 4/4 shows beats per bar." },
  { text: "What does 4/4 time mean?", correct: "Four beats per bar, quarter notes", distractors: ["Four bars per song", "Four drums per band", "Four songs per album"], explanation: "4/4: four quarter-note beats in every bar." },
  { text: "What is tempo?", correct: "The speed of the music", distractors: ["The loudness of music", "The mood of music", "The length of a song"], explanation: "Tempo tells how fast or slow the music is played." },
  { text: "What is it when we stress the weak beats?", correct: "Syncopation", distractors: ["A tempo marking", "A loud crash", "A rest symbol"], explanation: "Syncopation shifts accents to offbeats." },
  { text: "What does a rest mean in music?", correct: "A measured silence", distractors: ["A loud crash", "A fast note", "A high note"], explanation: "Rests are silent, measured pauses in music." },
  { text: "Which note gets one beat in 4/4?", correct: "The quarter note", distractors: ["The half note", "The whole note", "The eighth note"], explanation: "In 4/4, a quarter note receives one beat." },
  { text: "What does slowing down in music mean?", correct: "Ritardando", distractors: ["Accelerando", "Allegro", "Forte"], explanation: "Ritardando means gradually slowing down." },
  { text: "What does a dot after a note do?", correct: "Adds half the note's length", distractors: ["Halves the note", "Doubles the pitch", "Makes it silent"], explanation: "A dotted note lasts one and a half times its value." },
];

const P1012_RHYTHM_SILVER: Draft[] = [
  { text: "In 6/8 time, how many beats are felt per bar?", correct: "Two dotted-quarter beats", distractors: ["Six even beats", "Four beats", "Three beats"], explanation: "6/8 feels as two groups of three eighth notes." },
  { text: "What is the note before the first bar called?", correct: "An anacrusis (pickup note)", distractors: ["A final chord", "A repeated pattern", "A loud crash"], explanation: "Anacrusis is the upbeat starting before bar one." },
  { text: "What does allegro mean?", correct: "Fast and lively", distractors: ["Slow and broad", "Very soft", "Moderately"], explanation: "Allegro means fast and lively." },
  { text: "How many beats does a dotted half note get in 4/4?", correct: "Three beats", distractors: ["Two beats", "Four beats", "One beat"], explanation: "A dotted half note: two beats plus one beat for the dot." },
  { text: "What is a polyrhythm?", correct: "Two or more rhythms at once", distractors: ["One rhythm played twice", "No rhythm", "A slow rhythm"], explanation: "Polyrhythm layers different rhythmic patterns simultaneously." },
  { text: "What pattern do Afrobeats use?", correct: "Kick, snare and hi-hat grooves", distractors: ["Only triangle hits", "Only silence", "Single cowbell hits"], explanation: "Afrobeats builds from layered drum machine grooves." },
  { text: "What does swing mean in jazz rhythm?", correct: "Eighth notes played unevenly", distractors: ["Perfectly even eighths", "All notes dotted", "No eighth notes"], explanation: "Swing lilts pairs of eighth notes unevenly." },
  { text: "What does the agogo bell do in West African drumming?", correct: "It marks the bell pattern timeline", distractors: ["It signals the end", "It plays the melody", "It drowns the drums"], explanation: "The agogo bell keeps the timeline pattern." },
];

const P1012_RHYTHM_GOLD: Draft[] = [
  { text: "What is the difference between simple and compound time?", correct: "Simple beats divide by two; compound by three", distractors: ["Simple is slow, compound is fast", "Simple uses dots, compound uses rests", "No difference"], explanation: "Simple time divides beats in two; compound time divides them in three." },
  { text: "In 12/8, how many beats per bar does the conductor feel?", correct: "Four dotted-quarter beats", distractors: ["Twelve even beats", "Six beats", "Three beats"], explanation: "12/8 groups into four beats, each of three eighths." },
  { text: "What does rubato mean?", correct: "Flexible tempo for expression", distractors: ["Strict, rigid timing", "Very loud playing", "Silent rests"], explanation: "Rubato stretches or squeezes tempo freely." },
  { text: "How does the Yoruba talking drum encode tonal speech?", correct: "By matching pitch glides with squeezed tension", distractors: ["By hitting harder", "By playing faster", "By adding beads"], explanation: "Squeezing the ropes bends pitch to mimic speech tones." },
  { text: "What makes Afrobeat feel dance-friendly?", correct: "Interlocking grooves with a steady pulse", distractors: ["No pulse at all", "Only slow ballads", "Random note crashes"], explanation: "Afrobeat locks layered grooves to a steady pulse." },
  { text: "What is cross-rhythm?", correct: "Conflicting accent patterns played together", distractors: ["A very loud rhythm", "A rhythm in another key", "Silent bars"], explanation: "Cross-rhythm pits two patterns' accents against each other." },
  { text: "What is an additive rhythm?", correct: "Uneven groupings like 2+3", distractors: ["Only 4/4", "Only straight eighths", "Only dotted notes"], explanation: "Additive rhythm builds bars from short unequal groups." },
  { text: "How would you transcribe a standard Afrobeat kick pattern?", correct: "Steady four on the floor with offbeat accents", distractors: ["A single hit per bar", "No kick pattern", "Random kicks only"], explanation: "Afrobeat keeps a steady pulse with syncopated accents layered above." },
];

const P1012_INSTRUMENTS_BRONZE: Draft[] = [
  { text: "What family does the violin belong to?", correct: "String", distractors: ["Wind", "Percussion", "Keyboard"], explanation: "Violins are bowed string instruments." },
  { text: "What family does the trumpet belong to?", correct: "Brass", distractors: ["Strings", "Woodwind", "Percussion"], explanation: "Trumpets are brass wind instruments." },
  { text: "What is the largest standard string instrument?", correct: "Double bass", distractors: ["Violin", "Viola", "Cello"], explanation: "The double bass is the largest common string instrument." },
  { text: "Which Nigerian instrument is a clay pot?", correct: "The udu", distractors: ["The ekwe", "The shekere", "The agogo"], explanation: "The udu is an Igbo clay pot drum." },
  { text: "How is the ekwe played?", correct: "Struck with sticks on a slit drum", distractors: ["Blown across the top", "Plucked like a guitar", "Pressed with fingers"], explanation: "The ekwe is a carved wooden slit drum struck with sticks." },
  { text: "The xylophone belongs to which group?", correct: "Percussion", distractors: ["Strings", "Woodwind", "Brass"], explanation: "The xylophone is struck, making it percussion." },
  { text: "What does a piano use to make sound?", correct: "Felt hammers striking strings", distractors: ["Wind through pipes", "Beads in a gourd", "Skin stretched over wood"], explanation: "Piano keys trigger felt hammers that strike strings." },
  { text: "Which of these is a woodwind?", correct: "The flute", distractors: ["The drum", "The violin", "The harp"], explanation: "The flute is a woodwind instrument despite being metal." },
];

const P1012_INSTRUMENTS_SILVER: Draft[] = [
  { text: "How does the talking drum change its pitch?", correct: "By squeezing its laced tension ropes", distractors: ["By pressing keys", "By plucking strings", "By blowing harder"], explanation: "Squeezing the ropes tightens the drumhead, raising pitch." },
  { text: "What is the shekere?", correct: "A gourd shaker covered in bead net", distractors: ["A clay pot drum", "A wooden slit drum", "A brass bell"], explanation: "The shekere is shaken to rattle its bead net." },
  { text: "What is the agogo?", correct: "A double bell used as a timeline", distractors: ["A large talking drum", "A clay whistle", "A string instrument"], explanation: "The agogo bell holds the underlying timeline pattern." },
  { text: "How does percussion differ from strings?", correct: "Percussion is struck or shaken", distractors: ["Strings are blown", "Percussion has keys", "Strings are hit"], explanation: "Percussion makes sound by striking or shaking." },
  { text: "The cello belongs to which group?", correct: "Strings", distractors: ["Winds", "Keyboards", "Percussion"], explanation: "The cello is a bowed string instrument." },
  { text: "What is an ensemble?", correct: "A group performing together", distractors: ["A solo performance", "A rehearsal room", "A sheet music book"], explanation: "An ensemble is any group performing music together." },
  { text: "Which African instrument is a slit drum?", correct: "The ekwe", distractors: ["The udu", "The shekere", "The piano"], explanation: "The ekwe is a carved wooden slit drum from Igbo land." },
  { text: "How is the harp played?", correct: "By plucking its strings", distractors: ["By bowing", "By blowing", "By striking"], explanation: "Harpists pluck the strings with their fingers." },
];

const P1012_INSTRUMENTS_GOLD: Draft[] = [
  { text: "Why does a trumpet sound brighter than a flute?", correct: "Brass resonance and a flared bell", distractors: ["It has strings", "It is smaller", "It is blown softer"], explanation: "Brass bells project bright, buzzing overtones." },
  { text: "How do groups balance rhythm and melody?", correct: "Percussion carries time; strings carry tune", distractors: ["Only percussion plays", "Only strings play", "No one leads"], explanation: "Ensembles layer drums for time with melodic voices above." },
  { text: "What is the role of the lead drum in West African ensembles?", correct: "To signal and cue dancers and singers", distractors: ["To keep the food warm", "To tune the guitars", "To end the performance"], explanation: "The lead drummer cues changes and calls dancers." },
  { text: "How does an electric keyboard differ from a real piano?", correct: "It generates sound electronically", distractors: ["It uses strings and hammers", "It cannot play chords", "It needs no electricity"], explanation: "Keyboards synthesize sound; acoustic pianos strike strings." },
  { text: "What is the shekere used as?", correct: "Unpitched rhythm", distractors: ["A melodic lead", "A keyed instrument", "A wind instrument"], explanation: "The shekere provides rhythm, not definite pitches." },
  { text: "What does a violin's bridge do?", correct: "Transfers string vibration to the body", distractors: ["Holds the bow", "Tunes the pegs", "Mutes the sound"], explanation: "The bridge passes vibrations from strings into the hollow body." },
  { text: "How do griots preserve history in music?", correct: "Through praise songs and genealogy", distractors: ["Through written exams", "Through silence", "Through drum tuning"], explanation: "Griots sing genealogies that keep history alive." },
  { text: "What makes the talking drum ideal for proverbs?", correct: "It copies the tone and rhythm of speech", distractors: ["It is the loudest drum", "It has the most strings", "It was invented last year"], explanation: "Talking drums speak in proverbs by mimicking tonal Yoruba." },
];

const P1012_SONGS_BRONZE: Draft[] = [
  { text: "What does a cappella mean?", correct: "Singing without instruments", distractors: ["Singing with drums", "Singing while dancing", "Singing off-key"], explanation: "A cappella means voices only, no instruments." },
  { text: "What is a choir?", correct: "A group of trained singers", distractors: ["A type of drum ensemble", "A dance troupe", "A brass band"], explanation: "A choir is an organized singing group." },
  { text: "What is a hymn?", correct: "A song of religious praise", distractors: ["A pop hit", "A protest song", "A lullaby"], explanation: "Hymns are songs of worship, often in church." },
  { text: "What is call and response?", correct: "A leader calls, the group answers", distractors: ["Everyone sings alone", "A silent performance", "Two choirs shouting"], explanation: "Call and response alternates leader and group phrases." },
  { text: "What is Afrobeats?", correct: "A fusion of West African rhythms and global beats", distractors: ["A slow hymn style", "An Italian opera form", "A lullaby genre"], explanation: "Afrobeats blends Nigerian rhythms with global pop." },
  { text: "What is the purpose of an owambe song?", correct: "To celebrate at parties", distractors: ["To mourn the dead", "To teach maths", "To sell goods"], explanation: "Owambe songs celebrate joy at parties." },
  { text: "What is a soloist?", correct: "A singer performing alone", distractors: ["The whole choir together", "A drummer", "An audience member"], explanation: "A soloist performs alone, sometimes with support." },
  { text: "What is a national anthem?", correct: "The official song of a nation", distractors: ["A church hymn", "A birthday song", "A school play song"], explanation: "The national anthem represents a country's identity." },
];

const P1012_SONGS_SILVER: Draft[] = [
  { text: "What is harmony in singing?", correct: "Multiple notes blending together", distractors: ["One note sung loudly", "Silence between songs", "A fast rhythm"], explanation: "Harmony layers different pitches to enrich the sound." },
  { text: "What is the difference between a choir and an ensemble?", correct: "A choir is voice-only; ensemble mixes instruments", distractors: ["They are the same thing", "A choir uses only drums", "An ensemble never sings"], explanation: "Ensembles can mix voices and instruments freely." },
  { text: "How did highlife spread across West Africa?", correct: "Through Ghana-Nigeria touring bands and radio", distractors: ["Through written letters only", "Through churches only", "Through schools only"], explanation: "Highlife spread via dance bands, records and radio." },
  { text: "What is the role of the choir director?", correct: "Leads tempo, dynamics and entry cues", distractors: ["Sells the tickets", "Plays the piano only", "Writes the lyrics"], explanation: "The director cues entries, tempo and dynamics." },
  { text: "What does a cappella rely on?", correct: "Vocal rhythm, harmony and blend", distractors: ["Loud amplifiers", "Drum backing", "Keyboards"], explanation: "Without instruments, singers supply rhythm and harmony." },
  { text: "Why do gospel choirs repeat refrains?", correct: "So the whole congregation can join", distractors: ["For no musical reason", "To end quickly", "To show off voices"], explanation: "Repeated refrains invite everyone to sing along." },
  { text: "What are oriki songs?", correct: "Praise poetry songs", distractors: ["Lullabies", "War chants", "Wedding marches"], explanation: "Oriki are praise poems sung for people or places." },
  { text: "What is the call-and-response pattern rooted in?", correct: "African communal singing traditions", distractors: ["European opera", "American rap only", "Chinese opera"], explanation: "Call and response echoes African oral tradition." },
];

const P1012_SONGS_GOLD: Draft[] = [
  { text: "How did Fela Kuti shape Afrobeat?", correct: "Fused highlife, jazz and funk into political grooves", distractors: ["Invented classical notation", "Composed church hymns", "Rejected all rhythm"], explanation: "Fela blended highlife, jazz and funk into Afrobeat." },
  { text: "What role did brass bands play in Nigerian highlife?", correct: "Added dance-hall excitement and swing", distractors: ["Performed only at funerals", "Replaced string players", "Played silent marches"], explanation: "Highlife brass sections drove the dance floor energy." },
  { text: "What is owambe music rooted in?", correct: "Yoruba feasting and party culture", distractors: ["British ballroom", "Chinese opera", "French chanson"], explanation: "Owambe draws from Yoruba feast celebration traditions." },
  { text: "Why is the national anthem sung in English?", correct: "As a unifying official language", distractors: ["Because it was written in Latin", "As a joke", "Only for tourists"], explanation: "Nigeria uses English as its official tongue." },
  { text: "How do griots pass history through song?", correct: "By singing praise genealogies from memory", distractors: ["By writing textbooks", "By dancing only", "By drumming silently"], explanation: "Griots memorize and sing lineages across generations." },
  { text: "What is the bell pattern in West African drumming?", correct: "A repeating timeline ostinato that anchors the ensemble", distractors: ["A random fill", "A solo break", "A closing chord"], explanation: "The bell holds the repeating timeline for the ensemble." },
  { text: "Why do hymns help groups sing together?", correct: "Simple tunes everyone can learn", distractors: ["Complex solo arias", "Silent meditation", "Fast rap flows"], explanation: "Hymn tunes stay simple so all can join in." },
  { text: "What did Fela sing about?", correct: "It criticized power through dance music", distractors: ["It avoided all issues", "It praised the army", "It banned instruments"], explanation: "Fela turned dance beats into protest." },
];

const P1012_TONES_BRONZE: Draft[] = [
  { text: "What is pitch?", correct: "How high or low a sound is", distractors: ["How loud a sound is", "How long a note is", "How fast the tempo is"], explanation: "Pitch describes the height of a note." },
  { text: "What does a treble clef indicate?", correct: "Higher notes and voices", distractors: ["Low bass notes", "Percussion only", "Volume markings"], explanation: "Treble clef marks the staff for higher pitches." },
  { text: "What does a bass clef indicate?", correct: "Lower notes and voices", distractors: ["High flute parts", "Drum notation", "Tempo markings"], explanation: "Bass clef marks the staff for lower pitches." },
  { text: "What does forte mean?", correct: "Loud", distractors: ["Soft", "Fast", "Slow"], explanation: "Forte means loud in dynamic terms." },
  { text: "What does piano mean in music?", correct: "Soft", distractors: ["Loud", "Fast", "High"], explanation: "Piano is the Italian word for soft." },
  { text: "Which clef does a flute use?", correct: "Treble clef", distractors: ["Bass clef", "Alto clef", "Tenor clef"], explanation: "The flute reads treble clef." },
  { text: "What is an octave?", correct: "The distance between the same note name", distractors: ["Two different notes", "Eight bars of music", "A sharp note"], explanation: "An octave spans eight lettered notes, like C to C." },
  { text: "Which note is higher: middle C or the C above it?", correct: "The C above middle C", distractors: ["Middle C", "They are the same", "Neither exists"], explanation: "The C above middle C sounds an octave higher." },
];

const P1012_TONES_SILVER: Draft[] = [
  { text: "What does a sharp do to a note?", correct: "Raises it by a semitone", distractors: ["Lowers it", "Silences it", "Doubles its length"], explanation: "A sharp raises pitch by a semitone." },
  { text: "What does a flat do to a note?", correct: "Lowers it by a semitone", distractors: ["Raises it", "Loudens it", "Speeds it up"], explanation: "A flat lowers pitch by a semitone." },
  { text: "What is a major scale?", correct: "A bright-sounding stepwise scale", distractors: ["A sad, dark scale", "A random set of notes", "A drum pattern"], explanation: "Major scales sound bright and happy." },
  { text: "What changes between major and minor keys?", correct: "The third scale degree differs", distractors: ["The tempo", "The volume", "The instrumentation"], explanation: "Minor lowers the third degree from major." },
  { text: "What does mezzo forte mean?", correct: "Moderately loud", distractors: ["Very loud", "Very soft", "Moderately soft"], explanation: "Mezzo forte means moderately loud." },
  { text: "Where is middle C on the piano?", correct: "At the centre, between treble and bass clef", distractors: ["At the far left", "At the far right", "On a different keyboard"], explanation: "Middle C sits between treble and bass registers." },
  { text: "What does a natural sign cancel?", correct: "A sharp or flat", distractors: ["A rest", "A time signature", "A dynamic"], explanation: "A natural returns a note to its unaltered pitch." },
  { text: "What is a whole tone interval?", correct: "Two semitones", distractors: ["One semitone", "Four semitones", "Twelve semitones"], explanation: "A whole tone spans two semitones." },
];

const P1012_TONES_GOLD: Draft[] = [
  { text: "What are melodic steps?", correct: "Notes in sequence", distractors: ["Notes played together", "Notes at rest", "Notes in canon"], explanation: "Melodic intervals move in time; harmonic sound together." },
  { text: "Why does a minor third sound darker than a major third?", correct: "The minor third is narrower and tenser", distractors: ["Minor thirds are louder", "Major thirds use sharps only", "They sound identical"], explanation: "The minor third's narrower gap creates tension." },
  { text: "What is the relative minor of C major?", correct: "A minor", distractors: ["E minor", "F minor", "D minor"], explanation: "A minor shares C major's key signature." },
  { text: "What does intonation mean for singers?", correct: "Accuracy of pitch", distractors: ["Breath control", "Volume control", "Diction clarity"], explanation: "Intonation is how accurately a singer hits pitch." },
  { text: "What sound does a stable triad make?", correct: "A consonant one", distractors: ["A dissonant one", "A silent one", "A loud one"], explanation: "Consonant triads sound stable; dissonant ones tense." },
  { text: "How do forte and piano shape musical phrasing?", correct: "They contrast loud and soft sections", distractors: ["They set the key", "They choose the tempo", "They end the song"], explanation: "Dynamics create contrast and expression in phrases." },
  { text: "What is it when music changes key?", correct: "Modulation", distractors: ["Syncopation", "Rubato", "Ostinato"], explanation: "Modulation shifts the music into a new key." },
  { text: "Why do orchestras tune to A above middle C?", correct: "Tradition fixes it as the reference pitch", distractors: ["It is the loudest note", "It is the lowest note", "It was random"], explanation: "Concert A serves as the tuning standard." },
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
        subject: "music",
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
    rhythm: { id: "rhythm", prefix: "RYT", levels: { bronze: P46_RHYTHM_BRONZE, silver: P46_RHYTHM_SILVER, gold: P46_RHYTHM_GOLD } },
    instruments: { id: "instruments", prefix: "INS", levels: { bronze: P46_INSTRUMENTS_BRONZE, silver: P46_INSTRUMENTS_SILVER, gold: P46_INSTRUMENTS_GOLD } },
    songs: { id: "songs", prefix: "SNG", levels: { bronze: P46_SONGS_BRONZE, silver: P46_SONGS_SILVER, gold: P46_SONGS_GOLD } },
    tones: { id: "tones", prefix: "TON", levels: { bronze: P46_TONES_BRONZE, silver: P46_TONES_SILVER, gold: P46_TONES_GOLD } },
  },
  "7-9": {
    rhythm: { id: "rhythm", prefix: "RYT", levels: { bronze: P79_RHYTHM_BRONZE, silver: P79_RHYTHM_SILVER, gold: P79_RHYTHM_GOLD } },
    instruments: { id: "instruments", prefix: "INS", levels: { bronze: P79_INSTRUMENTS_BRONZE, silver: P79_INSTRUMENTS_SILVER, gold: P79_INSTRUMENTS_GOLD } },
    songs: { id: "songs", prefix: "SNG", levels: { bronze: P79_SONGS_BRONZE, silver: P79_SONGS_SILVER, gold: P79_SONGS_GOLD } },
    tones: { id: "tones", prefix: "TON", levels: { bronze: P79_TONES_BRONZE, silver: P79_TONES_SILVER, gold: P79_TONES_GOLD } },
  },
  "10-12": {
    rhythm: { id: "rhythm", prefix: "RYT", levels: { bronze: P1012_RHYTHM_BRONZE, silver: P1012_RHYTHM_SILVER, gold: P1012_RHYTHM_GOLD } },
    instruments: { id: "instruments", prefix: "INS", levels: { bronze: P1012_INSTRUMENTS_BRONZE, silver: P1012_INSTRUMENTS_SILVER, gold: P1012_INSTRUMENTS_GOLD } },
    songs: { id: "songs", prefix: "SNG", levels: { bronze: P1012_SONGS_BRONZE, silver: P1012_SONGS_SILVER, gold: P1012_SONGS_GOLD } },
    tones: { id: "tones", prefix: "TON", levels: { bronze: P1012_TONES_BRONZE, silver: P1012_TONES_SILVER, gold: P1012_TONES_GOLD } },
  },
};

let errors = 0;
for (const bandId of Object.keys(BUILDERS)) {
  const outDir = path.resolve(`src/server/data/questions/${bandId}/music`);
  mkdirSync(outDir, { recursive: true });
  const band = bandById(bandId)!;
  for (const topicId of Object.keys(BUILDERS[bandId]!)) {
    const builder = BUILDERS[bandId]![topicId]!;
    const topic = TOPICS.find((t) => t.id === builder.id);
    if (!topic) throw new Error(`unknown topic ${builder.id}`);
    const questions = toQuestions(bandId, builder.id, builder.prefix, builder.levels);
    const file: TopicFile = { band: band.id, subject: "music", topic: builder.id as never, title: topic.label, questions };
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
