import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { TOPICS, bandById } from "../src/shared/constants";
import type { Question, TopicFile } from "../src/shared/question";
import { isClean, validateTopicFile } from "../src/server/data/validate";

/**
 * Christian Religious Studies starter banks for all three bands (4-6 Sprouts,
 * 7-9 Explorers, 10-12 Adventurers). Written by hand, checked by the validator.
 * Eight questions per level, twenty four per topic, two hundred and eighty eight in all.
 * The live game never calls an AI service.
 */

type Level = "bronze" | "silver" | "gold";
interface Draft {
  text: string;
  correct: string;
  distractors: string[];
  explanation: string;
}

const LEVEL_LETTER: Record<Level, string> = { bronze: "B", silver: "S", gold: "G" };
const SUBJECT_PREFIX = "CST";
const AUTHOR = "AI draft v1";

const REF_TOPIC: Record<string, string> = {
  "bible-stories": "stories from the Bible",
  jesus: "Jesus and his teaching",
  commandments: "God's laws and how to live",
  worship: "prayer and worship",
};

const REF_LEVEL: Record<string, Record<Level, string>> = {
  "4-6": { bronze: "Nursery 2", silver: "Primary 1", gold: "Primary 1" },
  "7-9": { bronze: "Primary 3", silver: "Primary 3", gold: "Primary 3" },
  "10-12": { bronze: "Primary 5", silver: "Primary 5", gold: "Primary 5" },
};

function refFor(bandId: string, topicId: string, level: Level): string {
  return `NERDC ${REF_LEVEL[bandId]![level]} Christian Religious Studies, ${REF_TOPIC[topicId]}`;
}

/* ================= BAND 4-6 (Sprouts) ================= */

const P46_BIBLES_BRONZE: Draft[] = [
  { text: "Who made the world?", correct: "God", distractors: ["A king", "A man", "A fisherman"], explanation: "God made the whole world." },
  { text: "Who built the ark?", correct: "Noah", distractors: ["David", "Moses", "Joseph"], explanation: "Noah built a big ark." },
  { text: "Where did Noah put the pairs?", correct: "On the ark", distractors: ["In a barn", "On a hill", "In a cave"], explanation: "Noah kept the animals on the ark." },
  { text: "Who went in a big fish?", correct: "Jonah", distractors: ["Peter", "Paul", "John"], explanation: "A big fish swallowed Jonah." },
  { text: "Who beat the giant Goliath?", correct: "David", distractors: ["Saul", "Samuel", "Solomon"], explanation: "David trusted God and won." },
  { text: "Who had the bright coat?", correct: "Joseph", distractors: ["Aaron", "Isaac", "Jacob"], explanation: "Joseph got a special coat." },
  { text: "Who led God's people from Egypt?", correct: "Moses", distractors: ["Joshua", "Aaron", "Eli"], explanation: "God chose Moses to lead His people." },
  { text: "What did God make first?", correct: "Light", distractors: ["The sea", "The sun", "People"], explanation: "God said, let there be light." },
];

const P46_BIBLES_SILVER: Draft[] = [
  { text: "How many days did it rain on the ark?", correct: "Forty", distractors: ["Ten", "Seven", "One hundred"], explanation: "The rain fell for forty days." },
  { text: "What bird did Noah send out?", correct: "A dove", distractors: ["An eagle", "A crow", "A hawk"], explanation: "The dove came back with an olive leaf." },
  { text: "Who sold Joseph?", correct: "His brothers", distractors: ["His father", "His uncle", "The king"], explanation: "His brothers were jealous of him." },
  { text: "Who dreamed of stars?", correct: "Joseph", distractors: ["Pharaoh", "Daniel", "Jacob"], explanation: "Joseph dreamed of his family bowing." },
  { text: "Who found Moses?", correct: "Pharaoh's daughter", distractors: ["His mother", "Miriam", "The queen"], explanation: "Pharaoh's daughter found him in a basket." },
  { text: "What did God give Moses?", correct: "The ten rules", distractors: ["A crown", "A sword", "A scroll of songs"], explanation: "God wrote ten rules on stone." },
  { text: "Who was thrown to the lions?", correct: "Daniel", distractors: ["Jonah", "Elijah", "Ezekiel"], explanation: "Daniel kept praying, and God shut the lions' mouths." },
  { text: "Where were the people of God held as slaves?", correct: "In Egypt", distractors: ["In Babylon", "In Canaan", "In Assyria"], explanation: "The people worked as slaves in Egypt." },
];

const P46_BIBLES_GOLD: Draft[] = [
  { text: "Why did God send the flood?", correct: "People were wicked", distractors: ["It rained too much", "The rivers rose", "They angered the king"], explanation: "God judged the world because people chose evil." },
  { text: "Why did his brothers hate him?", correct: "His father loved him most", distractors: ["He ate the food", "He broke things", "He lied often"], explanation: "His brothers were jealous of his special coat." },
  { text: "Why did David fight the giant?", correct: "To save God's people", distractors: ["For money", "For a crown", "For fun"], explanation: "David trusted God and fought the giant." },
  { text: "How did Moses cross the Red Sea?", correct: "God opened a path", distractors: ["He swam fast", "He built a bridge", "He hid in a boat"], explanation: "God parted the waters for His people." },
  { text: "Why did Daniel pray each day?", correct: "He loved God", distractors: ["To be safe", "To win", "To show off"], explanation: "Daniel prayed to God three times a day." },
  { text: "Why did Jonah run from God?", correct: "He did not want to go", distractors: ["He feared the storm", "He lost his way", "He was asleep"], explanation: "Jonah disobeyed, but God still loved the city." },
  { text: "What leaves did the dove bring back?", correct: "Olive leaves", distractors: ["Mango leaves", "Palm leaves", "Fig leaves"], explanation: "Olive leaves showed the land was dry again." },
  { text: "Why did they repent?", correct: "They heard Jonah preach", distractors: ["The king died", "The city fell", "Food ran out"], explanation: "The people of Nineveh heard Jonah and repented." },
];

const P46_JESUS_BRONZE: Draft[] = [
  { text: "Who is Jesus?", correct: "God's Son", distractors: ["A king of Egypt", "A farmer", "An angel"], explanation: "Jesus is the Son of God." },
  { text: "Where was Jesus born?", correct: "In Bethlehem", distractors: ["In Nazareth", "In Jerusalem", "In Egypt"], explanation: "Jesus was born in Bethlehem." },
  { text: "Who came to see the baby?", correct: "Wise men", distractors: ["Soldiers", "Farmers", "Sailors"], explanation: "Wise men came with gifts for Jesus." },
  { text: "What did Jesus ride on?", correct: "A donkey", distractors: ["A horse", "A camel", "A chariot"], explanation: "Jesus rode in on a donkey." },
  { text: "Who walked on the sea?", correct: "Jesus", distractors: ["Peter", "John", "Thomas"], explanation: "Jesus walked on the sea." },
  { text: "What did Jesus feed the crowd with?", correct: "Loaves and fish", distractors: ["Rice and beans", "Bread and soup", "Meat and yam"], explanation: "Five loaves and two fish fed thousands." },
  { text: "What did Jesus do for the sick?", correct: "He healed them", distractors: ["He fed them", "He dressed them", "He taught them"], explanation: "Jesus healed the sick all over the land." },
  { text: "Whom does Jesus love?", correct: "Little children", distractors: ["The rich", "Only leaders", "Soldiers"], explanation: "Jesus loves all children." },
];

const P46_JESUS_SILVER: Draft[] = [
  { text: "What was Joseph's job?", correct: "A carpenter", distractors: ["A fisherman", "A farmer", "A shepherd"], explanation: "Joseph was a carpenter in Nazareth." },
  { text: "Did Jesus choose ten or twelve men?", correct: "Twelve", distractors: ["Ten", "Seven", "Fifty"], explanation: "Jesus chose twelve disciples." },
  { text: "What work did Jesus's friends do?", correct: "Fishermen", distractors: ["Soldiers", "Priests", "Kings"], explanation: "Jesus called fishermen like Peter and John." },
  { text: "What was Jesus doing in the storm?", correct: "He was asleep", distractors: ["He was fishing", "He was praying loud", "He was rowing"], explanation: "Jesus slept in the boat while the storm raged." },
  { text: "What did Jesus do for the blind man?", correct: "He gave him sight", distractors: ["He gave him money", "He gave him bread", "He gave him songs"], explanation: "Jesus healed the blind man so he could see." },
  { text: "What did Jesus say to kids?", correct: "Let them come to me", distractors: ["Keep them away", "Send them home", "They are too noisy"], explanation: "Jesus welcomed little children to Him." },
  { text: "What did Jesus teach us to do?", correct: "Love others", distractors: ["Get rich", "Fight enemies", "Hide away"], explanation: "Jesus taught us to love one another." },
  { text: "Whom should we forgive?", correct: "Everyone", distractors: ["Only friends", "Only family", "Only elders"], explanation: "Jesus taught us to forgive others." },
];

const P46_JESUS_GOLD: Draft[] = [
  { text: "Why did Jesus come to earth?", correct: "To save people", distractors: ["To build a city", "To be a king", "To judge sinners"], explanation: "Jesus came to save us from sin." },
  { text: "What did the angels say?", correct: "A saviour was born", distractors: ["A king was crowned", "The temple fell", "A storm was coming"], explanation: "The angels announced the birth of Jesus." },
  { text: "Why did the good man help the hurt stranger?", correct: "He was kind", distractors: ["He was paid", "He was forced", "He was related"], explanation: "The good Samaritan cared for a stranger." },
  { text: "What does the good man teach?", correct: "Help everyone", distractors: ["Help the rich", "Help your clan", "Help yourself"], explanation: "We should help anyone in need." },
  { text: "What is a parable?", correct: "A teaching story", distractors: ["A sad song", "A riddle", "A poem"], explanation: "A parable is a story that teaches." },
  { text: "Why did Jesus wash His friends' feet?", correct: "To teach humble service", distractors: ["For cleanliness", "To be served", "For a bet"], explanation: "Jesus showed that serving is greatness." },
  { text: "Who came to the tomb on Easter day?", correct: "Some women", distractors: ["The soldiers", "The priests", "The thieves"], explanation: "The women found the tomb empty on Easter." },
  { text: "What does rising from death mean?", correct: "Rising from the dead", distractors: ["Rising at night", "Rising from bed", "Rising like smoke"], explanation: "Jesus rose from the dead on Easter." },
];

const P46_COMMAND_BRONZE: Draft[] = [
  { text: "Who made the ten rules?", correct: "God", distractors: ["Moses", "Abraham", "David"], explanation: "God gave the people ten rules." },
  { text: "Who got the rules?", correct: "Moses", distractors: ["Aaron", "Joshua", "Caleb"], explanation: "God gave the rules to Moses." },
  { text: "Whom must we love first?", correct: "God", distractors: ["Our friends", "Ourselves", "Our teachers"], explanation: "We must love God with all we are." },
  { text: "Is it right to steal?", correct: "No, it is not", distractors: ["Yes, when poor", "Yes, at market", "Yes, on Sundays"], explanation: "Stealing hurts others and angers God." },
  { text: "Is it right to lie?", correct: "No, never", distractors: ["Yes, sometimes", "Yes, to friends", "Yes, at school"], explanation: "God wants us to tell the truth." },
  { text: "Whom must we honour?", correct: "Our parents", distractors: ["Our rivals", "Nobody", "Only rich people"], explanation: "God tells us to honour our parents." },
  { text: "Is it right to kill?", correct: "No, never", distractors: ["Sometimes", "Yes, when angry", "Yes, in war"], explanation: "Every life is precious to God." },
  { text: "How many laws did God give?", correct: "Ten", distractors: ["Five", "Twelve", "One hundred"], explanation: "God gave ten rules on stone." },
];

const P46_COMMAND_SILVER: Draft[] = [
  { text: "Which rule is about God's name?", correct: "Do not misuse it", distractors: ["Do not say it", "Do not know it", "Do not sing it"], explanation: "We must use God's name with respect." },
  { text: "Which day must we keep holy?", correct: "The seventh day", distractors: ["The first day", "The fifth day", "Every day"], explanation: "God rested on the seventh day." },
  { text: "What does the eighth rule forbid?", correct: "Stealing", distractors: ["Lying", "Working", "Singing"], explanation: "The eighth rule says do not steal." },
  { text: "What does the ninth rule forbid?", correct: "Lying", distractors: ["Working", "Eating", "Running"], explanation: "The ninth rule says do not lie about others." },
  { text: "What must we do for parents?", correct: "Honour them", distractors: ["Ignore them", "Fear them", "Beat them"], explanation: "God tells us to honour our parents." },
  { text: "On what were the laws written?", correct: "Two tablets", distractors: ["One", "Three", "Seven"], explanation: "God wrote the rules on two tablets." },
  { text: "What is the greatest rule?", correct: "Love God", distractors: ["Work hard", "Eat well", "Obey the king"], explanation: "Love God with all your heart." },
  { text: "What is the second great law?", correct: "Love your neighbour", distractors: ["Fear your neighbour", "Ignore your neighbour", "Beat your neighbour"], explanation: "Love your neighbour as yourself." },
];

const P46_COMMAND_GOLD: Draft[] = [
  { text: "Why did God give us rules?", correct: "To guide us", distractors: ["To control us", "To frighten us", "To test us"], explanation: "God's rules show us the right path." },
  { text: "Is it wrong to want what others have?", correct: "Yes, it is wrong", distractors: ["No, it is fine", "Only sometimes", "Only at night"], explanation: "We should be happy with what we have." },
  { text: "Why respect God's name?", correct: "It is holy", distractors: ["It is old", "It is short", "It is English"], explanation: "God's name is holy and deserves respect." },
  { text: "Why must we tell the truth?", correct: "God loves truth", distractors: ["It is cheaper", "It is easier", "It is fun"], explanation: "God is truth, so we must be honest." },
  { text: "Why do we obey them?", correct: "God commands it", distractors: ["To get gifts", "To look good", "To win praise"], explanation: "God commands us to honour our parents." },
  { text: "How should we treat people?", correct: "As we like to be treated", distractors: ["As they deserve", "As they pay us", "As they ask us"], explanation: "Treat others how you want to be treated." },
  { text: "Where did Moses get the laws?", correct: "On Mount Sinai", distractors: ["In Egypt", "In the ark", "In the desert"], explanation: "God gave Moses the rules on Sinai." },
  { text: "Why live by God's rules?", correct: "They make life good", distractors: ["They save money", "They win fights", "They impress friends"], explanation: "God's rules help us live well together." },
];

const P46_WORSHIP_BRONZE: Draft[] = [
  { text: "To whom do we pray?", correct: "God", distractors: ["The moon", "The trees", "Ourselves"], explanation: "We pray to God alone." },
  { text: "What do we do in church?", correct: "Worship God", distractors: ["Sleep", "Trade", "Play"], explanation: "Church is where we worship God." },
  { text: "Who taught the Our Father prayer?", correct: "Jesus", distractors: ["Peter", "Paul", "Moses"], explanation: "Jesus taught us to pray the Our Father." },
  { text: "What should we do each day?", correct: "Thank God", distractors: ["Ignore God", "Test God", "Hide from God"], explanation: "We should thank God every day." },
  { text: "How should we pray?", correct: "With a sincere heart", distractors: ["Loudly", "Slowly", "In a crowd"], explanation: "God hears sincere prayers." },
  { text: "Can God hear us?", correct: "Yes, always", distractors: ["No, never", "Only on Sundays", "Only at church"], explanation: "God hears every sincere prayer." },
  { text: "What is worship?", correct: "Praising God", distractors: ["Bowing to kings", "Singing pop songs", "Giving money"], explanation: "Worship is praising and honouring God." },
  { text: "When can we pray?", correct: "Any time", distractors: ["Only at night", "Only in church", "Only on Sundays"], explanation: "We can pray to God at any time." },
];

const P46_WORSHIP_SILVER: Draft[] = [
  { text: "The Our Father starts with?", correct: "Our Father in heaven", distractors: ["Dear God above", "O Lord Jehovah", "Hail Mary"], explanation: "Jesus taught us to call God Our Father." },
  { text: "What do we ask God to give us?", correct: "Our daily bread", distractors: ["Gold and silver", "A new house", "Sweets"], explanation: "We ask God to meet our daily needs." },
  { text: "How should we treat those who wrong us?", correct: "Forgive them", distractors: ["We never forgive", "God never forgives", "Forget forgiving"], explanation: "We ask God to forgive as we forgive." },
  { text: "What is saying thanks to God?", correct: "Thanking God", distractors: ["Asking God", "Praising God", "Shouting to God"], explanation: "Thanksgiving is giving thanks to God." },
  { text: "What is praise?", correct: "Telling God He is great", distractors: ["Talking to yourself", "Singing alone", "Buying gifts"], explanation: "Praise tells God how great He is." },
  { text: "To whom do we sing in church?", correct: "God", distractors: ["The pastor", "Each other", "Nobody"], explanation: "Our songs of praise are for God." },
  { text: "Should we pray before meals?", correct: "Yes, always", distractors: ["No, never", "Only on Sundays", "Only at school"], explanation: "We thank God for our food." },
  { text: "What pleases God most?", correct: "A sincere heart", distractors: ["Loud songs", "Big gifts", "Huge churches"], explanation: "God loves a sincere, loving heart." },
];

const P46_WORSHIP_GOLD: Draft[] = [
  { text: "Why do we pray?", correct: "To talk with God", distractors: ["To show off", "To win gifts", "To pass time"], explanation: "Prayer is talking with God." },
  { text: "What does Our Father mean?", correct: "God is our Father", distractors: ["God is a man", "God is far away", "God is a judge"], explanation: "God loves us like a kind father." },
  { text: "Why must we forgive?", correct: "It is right", distractors: ["It makes you weak", "It wins favour", "It saves money"], explanation: "Forgiveness brings peace to all." },
  { text: "How can we worship at home?", correct: "Pray and sing to God", distractors: ["Watch TV", "Sleep late", "Eat snacks"], explanation: "We can worship God anywhere." },
  { text: "What should we do when we are sad?", correct: "Tell God in prayer", distractors: ["Hide in bed", "Break things", "Stay silent"], explanation: "God hears us when we are troubled." },
  { text: "How do we show we love God?", correct: "By obeying Him", distractors: ["By giving gifts", "By singing loud", "By building churches"], explanation: "Loving God means doing His will." },
  { text: "Why do we meet to worship?", correct: "To praise God together", distractors: ["To trade", "To eat together", "To compete"], explanation: "Believers worship God as one family." },
  { text: "Why does the church meet?", correct: "To worship God", distractors: ["To make money", "To learn politics", "To meet friends"], explanation: "Church gathers God's people to worship." },
];

/* ================= BAND 7-9 (Explorers) ================= */

const E79_BIBLES_BRONZE: Draft[] = [
  { text: "Who built the ark when God warned of the flood?", correct: "Noah", distractors: ["Abraham", "Lot", "Isaac"], explanation: "God warned Noah, so he built the ark." },
  { text: "What did Noah take into the ark?", correct: "Animals and his family", distractors: ["Gold and silver", "Soldiers and spears", "Books and scrolls"], explanation: "God told Noah to save the animals and his family." },
  { text: "Who got the ten rules?", correct: "Moses", distractors: ["Aaron", "Joshua", "Caleb"], explanation: "God gave Moses the ten commandments on Mount Sinai." },
  { text: "Who beat the giant Goliath?", correct: "David", distractors: ["Saul", "Jonathan", "Samuel"], explanation: "David trusted God and struck down the giant." },
  { text: "What did God create on the first day?", correct: "Light", distractors: ["The stars", "The birds", "The rivers"], explanation: "God said, let there be light, and there was light." },
  { text: "Whose brothers were jealous of his coat?", correct: "Joseph", distractors: ["Benjamin", "Judah", "Reuben"], explanation: "Joseph's brothers envied his special coat of many colours." },
  { text: "Where did God send Abraham?", correct: "Canaan", distractors: ["Egypt", "Babylon", "Ur"], explanation: "God called Abraham to leave Ur and go to Canaan." },
  { text: "Who spent a night in the lions' den?", correct: "Daniel", distractors: ["Shadrach", "Elijah", "Jeremiah"], explanation: "Daniel was thrown to the lions, but God shut their mouths." },
];

const E79_BIBLES_SILVER: Draft[] = [
  { text: "Why did God send the great flood?", correct: "Because people were wicked", distractors: ["Because the rivers were high", "Because of the rain", "Because ships sank"], explanation: "The flood judged the earth because people chose evil." },
  { text: "How did the people of God escape Egypt?", correct: "Through the Red Sea", distractors: ["Through a tunnel", "On ships made of reeds", "By camel across the desert"], explanation: "God opened the Red Sea so His people crossed." },
  { text: "Why was Joseph thrown in jail?", correct: "He was falsely accused", distractors: ["He stole gold", "He ran away", "He fought a soldier"], explanation: "Joseph was falsely accused, yet God used it for good." },
  { text: "What did Joseph's dreams say would happen?", correct: "His family would bow to him", distractors: ["He would be a fisherman", "He would marry a queen", "He would sail to Spain"], explanation: "Joseph dreamed his family would bow to him one day." },
  { text: "Why did God speak to Moses from the burning bush?", correct: "To call him to lead", distractors: ["To warm him", "To scare him", "To cook for him"], explanation: "God chose Moses to lead the people from slavery." },
  { text: "What did Elijah ask God to send?", correct: "Fire from heaven", distractors: ["Rain from heaven", "Manna from heaven", "Wind from heaven"], explanation: "God sent fire to show He is the true God." },
  { text: "Why did the people wander forty years?", correct: "Because of their disobedience", distractors: ["Because the road was long", "Because they were lost", "Because Moses walked slowly"], explanation: "The people disobeyed God, so they wandered until the old generation died." },
  { text: "Which walls fell after seven days?", correct: "Jericho", distractors: ["Jerusalem", "Ai", "Bethel"], explanation: "The walls of Jericho fell after Israel marched around them." },
];

const E79_BIBLES_GOLD: Draft[] = [
  { text: "What lesson does Noah's story teach?", correct: "God blesses obedience", distractors: ["Animals are sacred", "Rain comes from heaven", "Boats are always safe"], explanation: "Noah obeyed God and was saved with his family." },
  { text: "How did Joseph save Egypt?", correct: "He stored grain ahead", distractors: ["He imported food by sea", "He planted new crops", "He taxed the people"], explanation: "Joseph stored grain in the good years, so Egypt survived the famine." },
  { text: "Why did God send the plagues on Egypt?", correct: "To rescue His people", distractors: ["To punish Pharaoh forever", "To destroy Egypt", "To test Moses"], explanation: "God sent the plagues to free the Israelites from slavery." },
  { text: "What does Ruth's story teach?", correct: "Loyalty and kindness", distractors: ["Wealth and power", "Strength in battle", "Wisdom in judging"], explanation: "Ruth stayed loyal to Naomi, and God blessed her." },
  { text: "How did God feed Elijah?", correct: "Ravens brought him food", distractors: ["Angels brought him bread", "He found wild honey", "A farmer fed him"], explanation: "God fed Elijah there with bread and meat brought by ravens." },
  { text: "What does the story of Esther show?", correct: "God works through brave people", distractors: ["Kings are always fair", "Palace life is easy", "Dreams come true"], explanation: "Esther risked her life to save her people." },
  { text: "Why was Jonah upset with God?", correct: "He wanted them judged", distractors: ["They ignored him", "They mocked him", "They gave him no food"], explanation: "Jonah loved justice, but God loves mercy too." },
  { text: "What did the prophets call for?", correct: "Turning back to God", distractors: ["Building bigger cities", "Winning wars", "Paying taxes"], explanation: "The prophets warned the people to repent and return to God." },
];

const E79_JESUS_BRONZE: Draft[] = [
  { text: "Where was Jesus born?", correct: "Bethlehem", distractors: ["Nazareth", "Jerusalem", "Samaria"], explanation: "Jesus was born in Bethlehem, David's town." },
  { text: "Who raised Jesus as a boy?", correct: "Joseph", distractors: ["John", "Peter", "Eli"], explanation: "Joseph, a carpenter, raised Jesus in Nazareth." },
  { text: "Where did John dunk Jesus?", correct: "The Jordan", distractors: ["The Nile", "The Euphrates", "The Tigris"], explanation: "Jesus was baptised in the River Jordan." },
  { text: "Who took Jesus to the river?", correct: "John the Baptist", distractors: ["Peter", "John the apostle", "James"], explanation: "John the Baptist baptised Jesus in the Jordan." },
  { text: "How many men did Jesus choose?", correct: "Twelve", distractors: ["Seven", "Ten", "Seventy"], explanation: "Jesus chose twelve disciples to follow Him." },
  { text: "What came down on Jesus at His baptism?", correct: "The Spirit like a dove", distractors: ["Fire from heaven", "Rain from the sky", "Manna from heaven"], explanation: "The Holy Spirit descended on Jesus like a dove." },
  { text: "What did Jesus feed five thousand with?", correct: "Loaves and fish", distractors: ["Bread and soup", "Rice and stew", "Yam and vegetables"], explanation: "Five loaves and two fish fed five thousand people." },
  { text: "Who walked on the sea?", correct: "Peter", distractors: ["John", "Thomas", "Andrew"], explanation: "Peter stepped out in faith and walked on the sea." },
];

const E79_JESUS_SILVER: Draft[] = [
  { text: "What is a parable?", correct: "A simple story with a lesson", distractors: ["A song of praise", "A law code", "A funeral speech"], explanation: "A parable teaches a spiritual truth with a simple story." },
  { text: "What does the kind stranger teach?", correct: "Love your neighbour", distractors: ["Love your nation first", "Avoid strangers", "Help only family"], explanation: "Love your neighbour, the Samaritan loved a stranger in need." },
  { text: "What does the lost sheep show about God?", correct: "God seeks the lost", distractors: ["God abandons wanderers", "God counts flocks", "God fears wolves"], explanation: "God rejoices over every sinner who returns to Him." },
  { text: "What does the prodigal son teach?", correct: "God forgives and welcomes", distractors: ["God punishes rebels", "Fathers are strict", "Riches are evil"], explanation: "The father welcomed his son home with love." },
  { text: "What did Jesus share at the Last Supper?", correct: "Bread and wine", distractors: ["Fish and bread", "Lamb and wine", "Bread and oil"], explanation: "Jesus shared bread and wine with His disciples." },
  { text: "What did Jesus give the woman?", correct: "Living water", distractors: ["Cool water", "Salt water", "Rain water"], explanation: "Jesus offered her water that gives eternal life." },
  { text: "How did Jesus heal people?", correct: "He healed the sick", distractors: ["He avoided the sick", "He studied medicine", "He sent people to doctors"], explanation: "Jesus healed the sick to show God's love and power." },
  { text: "Who is greatest in God's kingdom?", correct: "The servant", distractors: ["The king", "The judge", "The rich man"], explanation: "In God's kingdom, serving others is greatness." },
];

const E79_JESUS_GOLD: Draft[] = [
  { text: "What is the Sermon on the Mount?", correct: "Jesus's teaching on kingdom living", distractors: ["Jesus's last will", "Jesus's baptism speech", "Jesus's prayer on the cross"], explanation: "Jesus taught how to live in God's kingdom on the mountain." },
  { text: "What does blessed are the meek mean?", correct: "The humble are blessed", distractors: ["The strong inherit land", "The proud are blessed", "The rich are blessed"], explanation: "God blesses those who are gentle and humble." },
  { text: "Why did Jesus die on the cross?", correct: "To save us from sin", distractors: ["To start a revolution", "To escape Rome", "To punish sinners"], explanation: "Jesus died to take the punishment for our sins." },
  { text: "What happened on the third day?", correct: "Jesus rose again", distractors: ["The temple fell", "The disciples fled", "Rome conquered Judea"], explanation: "Jesus rose from the dead on the third day." },
  { text: "What does the rising prove?", correct: "Jesus is the Son of God", distractors: ["The tomb was empty", "The guards slept", "The stone was moved"], explanation: "The resurrection shows Jesus is the conquering Son of God." },
  { text: "What did Jesus say on worry?", correct: "Do not worry about tomorrow", distractors: ["Worry if you are poor", "Worry before every meal", "Worry about dress"], explanation: "Jesus told us not to worry like the birds that are fed." },
  { text: "Why did Jesus eat with outcasts?", correct: "To show God loves all", distractors: ["To gain followers", "To avoid crowds", "To raise money"], explanation: "Jesus showed that God's love reaches every person." },
  { text: "What is the golden rule?", correct: "Do to others as you want", distractors: ["Do what others do to you", "Do what leaders require", "Do what is profitable"], explanation: "Treat others as you wish to be treated." },
];

const E79_COMMAND_BRONZE: Draft[] = [
  { text: "Who gave the ten commandments?", correct: "God", distractors: ["Moses", "Abraham", "David"], explanation: "God Himself gave the commandments at Sinai." },
  { text: "Where did Moses receive them?", correct: "Mount Sinai", distractors: ["Mount Zion", "Mount Carmel", "Mount Olives"], explanation: "God gave Moses the commandments on Mount Sinai." },
  { text: "What do the first four rules teach?", correct: "Love for God", distractors: ["Love for money", "Love for country", "Love for family only"], explanation: "The first four rules help us honour and worship God." },
  { text: "What do the last six rules teach?", correct: "Love for others", distractors: ["Love for animals", "Love for property", "Love for work"], explanation: "The last six rules teach us to love our neighbours." },
  { text: "What does do not kill protect?", correct: "Human life", distractors: ["Property", "Marriage", "Truth"], explanation: "God values every human life." },
  { text: "What does do not steal mean?", correct: "Take nothing that belongs to another", distractors: ["Borrow freely without asking", "Take only what you can hide", "Share everything always"], explanation: "We must respect what others own." },
  { text: "What does no false witness mean?", correct: "Do not lie about others", distractors: ["Do not talk in court", "Do not argue with elders", "Do not sign papers"], explanation: "God commands us to speak the truth about others." },
  { text: "Why must we obey them?", correct: "Because God commands it", distractors: ["To win gifts", "To avoid beating", "To look holy"], explanation: "Honouring parents is God's clear command." },
];

const E79_COMMAND_SILVER: Draft[] = [
  { text: "What is the first commandment?", correct: "No other gods before God", distractors: ["Keep the Sabbath holy", "Do not steal", "Honour your father"], explanation: "We must worship God and Him alone." },
  { text: "What is the second rule?", correct: "Not making or worshipping idols", distractors: ["Not bearing false witness", "Not coveting", "Keeping the Sabbath"], explanation: "We must not bow to images or idols." },
  { text: "What does taking God's name in vain mean?", correct: "Misusing God's holy name", distractors: ["Singing God's name", "Speaking God's name quietly", "Learning God's name"], explanation: "God's name must never be used carelessly or falsely." },
  { text: "Which day is the Sabbath day?", correct: "The seventh day", distractors: ["The first day", "The third day", "The fifth day"], explanation: "The seventh day is set apart for rest and worship." },
  { text: "What does do not covet mean?", correct: "Do not envy what others have", distractors: ["Do not buy what you like", "Do not work for others", "Do not own land"], explanation: "We must not crave or envy other people's things." },
  { text: "Why is lying so bad?", correct: "It destroys justice", distractors: ["It wastes time", "It costs money", "It angers judges"], explanation: "False witness can ruin an innocent person." },
  { text: "Which rule guards wedding vows?", correct: "Marriage faithfulness", distractors: ["Church attendance", "Family property", "Neighbourhood peace"], explanation: "It protects the sanctity of marriage." },
  { text: "What is the seventh rule?", correct: "Be faithful in marriage", distractors: ["Avoid old people", "Stay single", "Marry late"], explanation: "Marriage demands faithfulness between husband and wife." },
];

const E79_COMMAND_GOLD: Draft[] = [
  { text: "How do the rules help the town?", correct: "They set moral standards", distractors: ["They raise revenue", "They elect leaders", "They build roads"], explanation: "The commandments protect life, truth, marriage and property." },
  { text: "Why is envy a sin?", correct: "It leads to wrongdoing", distractors: ["It causes headaches", "It makes people shy", "It causes hunger"], explanation: "Envy can grow into stealing, lying or even violence." },
  { text: "How do we love neighbours at school?", correct: "By helping and being honest", distractors: ["By giving them our work", "By copying them", "By avoiding them"], explanation: "Honesty and help are how we love our classmates." },
  { text: "What makes God's laws holy?", correct: "They come from God", distractors: ["They are old", "They are written on stone", "They are in the Bible"], explanation: "God's rules are holy because God is holy." },
  { text: "Why worship God?", correct: "He alone deserves worship", distractors: ["God forbids everything else", "Churches demand it", "It is traditional"], explanation: "Only the one true God deserves our worship." },
  { text: "How did Jesus sum up the law?", correct: "Love God and neighbour", distractors: ["Obey all rules", "Honour the temple", "Pay your tithes"], explanation: "All the commandments point to loving God and people." },
  { text: "What does no stealing teach about work?", correct: "Earn honestly for what you have", distractors: ["Work only for your family", "Keep whatever you find", "Share everything you own"], explanation: "God calls us to honest work and fair dealing." },
  { text: "Why keep a weekly rest and worship day?", correct: "It refreshes body and soul", distractors: ["It pleases the government", "It saves electricity", "It fills the church"], explanation: "Rest and worship restore us and keep us close to God." },
];

const E79_WORSHIP_BRONZE: Draft[] = [
  { text: "What is prayer?", correct: "Talking to God", distractors: ["Singing loudly", "Reading silently", "Giving offerings"], explanation: "Prayer is talking to God with our heart." },
  { text: "What is worship?", correct: "Praising and honouring God", distractors: ["Attending a concert", "Wearing fine clothes", "Giving alms"], explanation: "Worship is honouring God with our whole life." },
  { text: "Who taught the Lord's Prayer?", correct: "Jesus", distractors: ["Paul", "Peter", "The apostles"], explanation: "Jesus taught His disciples the Our Father." },
  { text: "When did Jesus often pray?", correct: "Early in the morning", distractors: ["Only at noon", "Only at night", "Only on feasts"], explanation: "Jesus prayed often, even before sunrise." },
  { text: "What do we do before meals?", correct: "Thank God", distractors: ["Wash hands only", "Set the table", "Call the family"], explanation: "We thank God for the food we eat." },
  { text: "What is the church?", correct: "The family of believers", distractors: ["A big building", "A charity group", "A choir"], explanation: "The church is God's family gathered to worship." },
  { text: "What should we do when others hurt us?", correct: "Forgive them", distractors: ["Hurt them back", "Report them", "Ignore them forever"], explanation: "We forgive others as God forgives us." },
  { text: "Can we pray at home?", correct: "Yes, anywhere", distractors: ["No, never", "Only at church", "Only at school"], explanation: "God hears us at home and everywhere." },
];

const E79_WORSHIP_SILVER: Draft[] = [
  { text: "What does Our Father teach us about God?", correct: "He is our loving Father", distractors: ["He is far away", "He is a judge only", "He is a stranger"], explanation: "God cares for us like a kind father." },
  { text: "What does hallowed be Thy name mean?", correct: "May God's name be honoured", distractors: ["May God's name be known", "May God's name be hidden", "May God's name be sung"], explanation: "We ask that God's name be treated as holy." },
  { text: "What does Thy kingdom come mean?", correct: "We want God's rule on earth", distractors: ["We want to move to heaven", "We want political power", "We want new laws"], explanation: "We pray for God's kingdom to grow on earth." },
  { text: "What does give us our daily bread mean?", correct: "God provides our daily needs", distractors: ["God gives manna", "We beg for bread", "Bakers are blessed"], explanation: "We ask God to meet our needs each day." },
  { text: "What does the prayer teach us?", correct: "Forgive others to be forgiven", distractors: ["Never forgive anyone", "Forgiveness is a weakness", "Only God forgives"], explanation: "We receive forgiveness as we forgive others." },
  { text: "What is saying thanks to God?", correct: "Giving thanks to God", distractors: ["Giving gifts to men", "Giving offerings", "Giving alms"], explanation: "Thanksgiving is our grateful response to God's goodness." },
  { text: "Why do we sing in church?", correct: "To praise God together", distractors: ["To show off voices", "To fill time", "To raise offerings"], explanation: "Singing lifts our hearts to God in worship." },
  { text: "Why read the Bible in worship?", correct: "To hear God's word", distractors: ["To learn history", "To pass time", "To debate doctrine"], explanation: "The Bible is God speaking to His people." },
];

const E79_WORSHIP_GOLD: Draft[] = [
  { text: "Why forgive before you pray?", correct: "Unforgiveness hinders prayer", distractors: ["It saves energy", "It speeds things up", "It wins arguments"], explanation: "God will not hear a heart holding grudges." },
  { text: "How does worship change us?", correct: "It renews our hearts", distractors: ["It makes us famous", "It fills our pockets", "It raises our status"], explanation: "Worship fills us with God's peace and truth." },
  { text: "What is worship in spirit and truth?", correct: "Sincere worship from the heart", distractors: ["Loud singing", "Correct ritual", "Fancy buildings"], explanation: "God seeks those who worship Him truly and sincerely." },
  { text: "Why do Christians give?", correct: "To honour God with our wealth", distractors: ["To buy blessings", "To be seen by men", "To avoid tax"], explanation: "Giving shows gratitude and supports God's work." },
  { text: "How can you worship at home daily?", correct: "Pray and read the Bible", distractors: ["Watch church online", "Sleep well", "Eat on time"], explanation: "Daily prayer and Bible reading are worship at home." },
  { text: "What is praying for others?", correct: "Intercession", distractors: ["Praying for rain", "Praying at night", "Praying loudly"], explanation: "Intercession means lifting others' needs to God." },
  { text: "Why worship as a church?", correct: "It builds the church family", distractors: ["It raises collections", "It grows the building", "It entertains members"], explanation: "Worshipping together strengthens every believer." },
  { text: "What should a worshipper's heart be like?", correct: "Reverent and loving", distractors: ["Proud and loud", "Cold and formal", "Ashamed and fearful"], explanation: "True worship flows from a heart that reveres God." },
];

/* ================= BAND 10-12 (Adventurers) ================= */

const A1012_BIBLES_BRONZE: Draft[] = [
  { text: "Who led the Israelites out of Egypt?", correct: "Moses", distractors: ["Joshua", "Aaron", "Caleb"], explanation: "God chose Moses to deliver His people from slavery." },
  { text: "What was the first plague on Egypt?", correct: "Water turned to blood", distractors: ["Frogs covered the land", "Locusts ate the crops", "Darkness covered the land"], explanation: "The Nile turned to blood, the first plague." },
  { text: "Who was the strongest man in the book of Judges?", correct: "Samson", distractors: ["Gideon", "Barak", "Jephthah"], explanation: "Samson had great strength given by God." },
  { text: "Who raised Samuel at Shiloh?", correct: "Eli the priest", distractors: ["Samuel himself", "Nathan", "Hilkiah"], explanation: "Samuel served under Eli, the old priest." },
  { text: "Who struck down Goliath?", correct: "David", distractors: ["Saul", "Jonathan", "Abner"], explanation: "David defeated Goliath with a sling and faith in God." },
  { text: "What did Nehemiah build again?", correct: "The walls of Jerusalem", distractors: ["The temple", "The palace", "The gates of Babylon"], explanation: "Nehemiah led the rebuilding of Jerusalem's walls." },
  { text: "Which king let the exiles return?", correct: "Cyrus", distractors: ["Nebuchadnezzar", "Darius", "Pharaoh"], explanation: "Cyrus permitted the Jews to return and rebuild the temple." },
  { text: "Who was thrown into the fiery furnace?", correct: "Shadrach, Meshach and Abednego", distractors: ["Daniel and his friends", "Esther and Mordecai", "Jeremiah and Baruch"], explanation: "God rescued the three friends who refused to bow to the idol." },
];

const A1012_BIBLES_SILVER: Draft[] = [
  { text: "Why did God send Joseph to Egypt ahead of his family?", correct: "To store grain for the famine", distractors: ["To trade with Pharaoh", "To learn Egyptian wisdom", "To find a wife"], explanation: "Joseph's rise in Egypt prepared the way to save many lives." },
  { text: "What does the Exodus story teach about God?", correct: "God delivers His people", distractors: ["God rewards the strong", "God avoids conflict", "God needs armies"], explanation: "The Exodus shows God's power to rescue and redeem His people." },
  { text: "Why did David spare Saul in the cave?", correct: "Saul was God's anointed king", distractors: ["David was afraid of Saul", "David had no weapon", "David was Saul's guest"], explanation: "David refused to kill God's chosen king, trusting God's justice." },
  { text: "Why is the story of Ruth significant?", correct: "She became an ancestor of Jesus", distractors: ["She was the first queen", "She built a temple", "She led an army"], explanation: "Ruth, a Moabite, entered the line that led to David and Jesus." },
  { text: "What does the story of Job teach?", correct: "Trust God even in suffering", distractors: ["God causes all pain", "Suffering means punishment", "God is absent in trouble"], explanation: "Job remained faithful, and God restored his fortunes." },
  { text: "Why did Jeremiah weep?", correct: "He grieved over his people's sin", distractors: ["He was often beaten", "He lost his family young", "He was often ill"], explanation: "Jeremiah wept because the people refused to repent." },
  { text: "What did Daniel's three friends refuse to do?", correct: "Bow to the golden image", distractors: ["Worship in the temple", "Eat with the king", "Learn Babylonian"], explanation: "They chose faithfulness even at the risk of death." },
  { text: "What did God prove on Mount Carmel?", correct: "He alone is the true God", distractors: ["Baal is stronger", "Elijah is a god", "Kings are chosen by gods"], explanation: "God answered Elijah with fire, proving He alone is God." },
];

const A1012_BIBLES_GOLD: Draft[] = [
  { text: "How does Joseph's life show God's sovereignty?", correct: "God turned evil into good", distractors: ["Joseph planned every event", "Pharaoh controlled all things", "Fate ruled Egypt"], explanation: "Joseph forgave his brothers, seeing God's hand in their evil." },
  { text: "What does the Passover lamb point to?", correct: "Jesus, the Lamb of God", distractors: ["The temple sacrifice", "The tenth plague", "The exodus journey"], explanation: "The Passover prefigured Jesus, who takes away the sin of the world." },
  { text: "Why did Moses not enter Canaan?", correct: "He struck the rock instead of speaking", distractors: ["He died before the crossing", "He feared the Canaanites", "He chose to stay behind"], explanation: "Moses disobeyed at Meribah, so God barred him from Canaan." },
  { text: "How did the walls of Jericho fall?", correct: "By Israel's obedient march and shout", distractors: ["By battering rams", "By earthquake", "By fire from heaven"], explanation: "God gave victory when the people obeyed His strange plan." },
  { text: "What does the story of Jonah reveal?", correct: "God's mercy reaches all who repent", distractors: ["God loves only Israel", "Repentance is impossible", "Prophets are never wrong"], explanation: "God's mercy reached the Ninevites when they repented." },
  { text: "How does the book of Esther show God's providence?", correct: "Every event served God's purpose", distractors: ["Esther planned the rescue alone", "The king loved justice", "Mordecai knew the future"], explanation: "From the palace to the king's favour, God worked to save His people." },
  { text: "What is the central theme of the Exodus narrative?", correct: "Redemption and covenant", distractors: ["Warfare and conquest", "Law and punishment", "Wealth and nationhood"], explanation: "God redeemed His people and made covenant with them at Sinai." },
  { text: "Why does the Old Testament point to Christ?", correct: "It prepares for the Messiah", distractors: ["It records history only", "It is a law book alone", "It ends with Malachi"], explanation: "God's plan for the Messiah unfolds through the whole Bible." },
];

const A1012_JESUS_BRONZE: Draft[] = [
  { text: "Who put Jesus under the water?", correct: "John the Baptist", distractors: ["Peter", "John the apostle", "Andrew"], explanation: "John the Baptist baptised Jesus in the Jordan." },
  { text: "Where was Jesus dipped in water?", correct: "The River Jordan", distractors: ["The Red Sea", "The Nile", "The Sea of Galilee"], explanation: "Jesus was baptised in the River Jordan." },
  { text: "How many disciples did Jesus call?", correct: "Twelve", distractors: ["Ten", "Fifty", "Three"], explanation: "Jesus chose twelve disciples to follow Him." },
  { text: "What did Jesus use to teach?", correct: "Parables from daily life", distractors: ["Long speeches", "Lectures from scripture alone", "Riddles"], explanation: "Jesus taught with stories from farming, fishing and family life." },
  { text: "What was Jesus accused of?", correct: "Claiming to be king", distractors: ["Stealing from the temple", "Breaking the Sabbath", "Plotting rebellion"], explanation: "Jesus was charged with claiming to be king of the Jews." },
  { text: "Who carried Jesus's cross partway?", correct: "Simon of Cyrene", distractors: ["Joseph of Arimathea", "Nicodemus", "Barabbas"], explanation: "Simon of Cyrene was made to carry the cross." },
  { text: "What did Jesus pray for His enemies?", correct: "Father, forgive them", distractors: ["Father, judge them", "Father, confuse them", "Father, receive them"], explanation: "Jesus prayed for the forgiveness of those who crucified Him." },
  { text: "When did Jesus rise from the tomb?", correct: "On the third day", distractors: ["On the second day", "On the fourth day", "Immediately"], explanation: "Jesus rose on the third day, conquering death." },
];

const A1012_JESUS_SILVER: Draft[] = [
  { text: "What does the parable of the sower teach?", correct: "Receive God's word with open hearts", distractors: ["Farming is holy work", "Seeds need rich soil", "Preach to crowds only"], explanation: "The seed is God's word; good soil bears lasting fruit." },
  { text: "What does the hidden treasure teach?", correct: "The kingdom is worth everything", distractors: ["Treasure hunts are fun", "Land is valuable", "Fields are blessings"], explanation: "The man sold all to possess the joy of God's kingdom." },
  { text: "What does the vineyard workers parable show?", correct: "God's grace is generous", distractors: ["Late workers are lazy", "Employers are fair", "Wages are equal"], explanation: "God rewards by grace, not by anyone's merit." },
  { text: "Why did Jesus wash His disciples' feet?", correct: "To teach humble service", distractors: ["For hygiene", "To honour them", "To show respect"], explanation: "Jesus showed that leaders must serve others." },
  { text: "What does the good shepherd show?", correct: "Jesus protects His people", distractors: ["Shepherds are strong", "Sheep are foolish", "Wolves are dangerous"], explanation: "Jesus, the good shepherd, lays down His life for His sheep." },
  { text: "What does Jesus's temptation teach?", correct: "Answer Satan with Scripture", distractors: ["Avoid deserts", "Eat only bread", "Climb mountains"], explanation: "Jesus answered every temptation with the word of God." },
  { text: "What does I am the way mean?", correct: "Jesus is the path to God", distractors: ["Jesus knows the road", "Jesus is a guide", "Jesus built a way"], explanation: "Jesus is the only way to know God and gain eternal life." },
  { text: "Why did Jesus teach in parables?", correct: "To reveal truth to open hearts", distractors: ["To entertain crowds", "To confuse enemies", "To speak simply"], explanation: "Parables reveal God's kingdom to those who seek it." },
];

const A1012_JESUS_GOLD: Draft[] = [
  { text: "What do the Beatitudes teach?", correct: "God blesses the humble and merciful", distractors: ["God blesses the powerful", "God blesses the rich", "God blesses the clever"], explanation: "Jesus's kingdom honours humility, mercy and hunger for righteousness." },
  { text: "How did Jesus relate to the law of Moses?", correct: "He fulfilled its true meaning", distractors: ["He abolished it", "He ignored it", "He replaced it"], explanation: "Jesus deepened the law from outward rule to heart obedience." },
  { text: "What does the Lord's Supper mean?", correct: "Remembering Christ's sacrifice", distractors: ["Celebrating a feast", "Sharing a meal", "Growing closer as a church"], explanation: "The bread and cup proclaim Jesus's body and blood given for us." },
  { text: "What does My God, my God, why have you forsaken me express?", correct: "The agony of bearing sin", distractors: ["Doubt about God", "Anger at the Father", "Despair without hope"], explanation: "Jesus felt God's forsakenness as He bore the world's sin." },
  { text: "Why does Jesus's rising from death matter?", correct: "It proves Jesus's victory over death", distractors: ["It guarantees health", "It promises wealth", "It removes grief"], explanation: "Without the resurrection, our faith is empty." },
  { text: "What is the Great Commission?", correct: "Make disciples of all nations", distractors: ["Build a world empire", "Translate the Bible", "Govern nations for God"], explanation: "Jesus commands us to spread His gospel to every nation." },
  { text: "What does the ascension assure us?", correct: "Jesus reigns and will return", distractors: ["Jesus is resting", "Jesus is distant", "Jesus has left us alone"], explanation: "Jesus now reigns in heaven and will come again." },
  { text: "How did Jesus forgive on the cross?", correct: "He forgave His executioners", distractors: ["He ignored His enemies", "He fled from them", "He defeated them"], explanation: "Jesus prayed for the very men who crucified Him." },
];

const A1012_COMMAND_BRONZE: Draft[] = [
  { text: "What are the ten commandments?", correct: "God's holy rules for living", distractors: ["Moses's laws", "The king's decrees", "The people's traditions"], explanation: "They are God's holy rules, given through Moses." },
  { text: "Who wrote the first five books of the Bible?", correct: "Moses", distractors: ["David", "Ezra", "Paul"], explanation: "Moses wrote the law, including the commandments." },
  { text: "On how many tablets were the laws written?", correct: "Two", distractors: ["One", "Ten", "Seven"], explanation: "God wrote the commandments on two stone tablets." },
  { text: "In which book are the commandments first recorded?", correct: "Exodus", distractors: ["Genesis", "Leviticus", "Numbers"], explanation: "Exodus 20 records the giving of the commandments." },
  { text: "What is the greatest commandment?", correct: "Love God with your whole heart", distractors: ["Honour your parents", "Keep the Sabbath", "Do not steal"], explanation: "Jesus called love for God the greatest commandment." },
  { text: "What is the second greatest commandment?", correct: "Love your neighbour as yourself", distractors: ["Do not kill", "Do not lie", "Keep God's name holy"], explanation: "The second greatest is love for our neighbours." },
  { text: "Which rule forbids idols?", correct: "The second commandment", distractors: ["The first commandment", "The third commandment", "The fifth commandment"], explanation: "The second commandment forbids making or worshipping idols." },
  { text: "Which rule promises long life?", correct: "The fifth commandment", distractors: ["The fourth commandment", "The eighth commandment", "The tenth commandment"], explanation: "Honour your father and mother so that you may live long." },
];

const A1012_COMMAND_SILVER: Draft[] = [
  { text: "What does the first commandment demand?", correct: "Exclusive worship of God alone", distractors: ["Good works", "Temple attendance", "Tithe giving"], explanation: "No person or thing may share God's place in our hearts." },
  { text: "What does the third commandment forbid?", correct: "Careless use of God's name", distractors: ["Praying aloud", "Singing hymns", "Reading the Bible"], explanation: "God's holy name must never be used carelessly or falsely." },
  { text: "What does the fourth commandment teach?", correct: "Rest and worship on the Sabbath", distractors: ["Working every day", "Farming only on Sundays", "Resting without worship"], explanation: "Six days of labour, one day set apart to worship God." },
  { text: "What else does do not murder address?", correct: "Angry hatred in the heart", distractors: ["Warfare and defence", "Hunting animals", "Capital punishment"], explanation: "Jesus taught that hatred is murder in the heart." },
  { text: "What does the marriage rule protect?", correct: "The marriage covenant", distractors: ["Family property", "Church membership", "Community peace"], explanation: "It guards the faithfulness between husband and wife." },
  { text: "What does do not steal imply?", correct: "Respect for property and honest work", distractors: ["Share all goods", "Avoid the market", "Distrust the rich"], explanation: "Stealing shows contempt for God's gift of property." },
  { text: "What does the tenth commandment target?", correct: "Greed and envy in the heart", distractors: ["Theft of goods", "Lies under oath", "Misuse of the Sabbath"], explanation: "Covetousness is the root of stealing and hatred." },
  { text: "How were the commandments given?", correct: "Spoken by God at Sinai", distractors: ["Written by Moses alone", "Revealed in a dream", "Passed down orally"], explanation: "God spoke amid thunder and fire on Mount Sinai." },
];

const A1012_COMMAND_GOLD: Draft[] = [
  { text: "Why does true obedience come from the heart?", correct: "God sees the heart", distractors: ["Rules are hard to keep", "Men judge by looks", "Only the heart can count"], explanation: "Outward acts without love are empty; God weighs the heart." },
  { text: "How did Jesus sum up the law?", correct: "Love God and your neighbour", distractors: ["Keep every rule", "Sacrifice daily", "Tithe faithfully"], explanation: "Love fulfils the whole law; every commandment flows from it." },
  { text: "How did Jesus deepen the commandments?", correct: "He applied them to the heart", distractors: ["He added new rules", "He removed the old ones", "He made them easier"], explanation: "Jesus moved the law from outward conduct to inward motive." },
  { text: "Do we keep the commandments to earn salvation?", correct: "No, salvation is by grace", distractors: ["Yes, by works", "Only partially", "Only before baptism"], explanation: "We obey out of love, not to earn God's favour." },
  { text: "How does the Holy Spirit help us obey?", correct: "He transforms our inner desires", distractors: ["He gives us more strength", "He removes our temptations", "He changes the rules"], explanation: "God's Spirit empowers us to delight in His law." },
  { text: "What happens when societies reject God's law?", correct: "Moral and social decline follow", distractors: ["Prosperity increases", "Order improves", "Nothing changes"], explanation: "Justice and peace rest on God's moral order." },
  { text: "How do the commandments apply online?", correct: "Be honest, respect others, do not steal", distractors: ["Say anything anonymously", "Copy whatever you find", "Judge others freely"], explanation: "Online theft, lying and lust violate God's commands." },
  { text: "Why are the last six commandments grouped?", correct: "They order our life with others", distractors: ["They are easier to keep", "They concern the nation", "They are optional"], explanation: "The last six govern how we treat people." },
];

const A1012_WORSHIP_BRONZE: Draft[] = [
  { text: "What is the main aim of worship?", correct: "To glorify God", distractors: ["To entertain the crowd", "To raise funds", "To grow a church"], explanation: "Worship exists to glorify God alone." },
  { text: "What are two main elements of worship?", correct: "Prayer and the Word", distractors: ["Tithes and offerings", "Songs and dancing", "Shouting and clapping"], explanation: "Worship gathers around God's Word and prayer." },
  { text: "What is a quiet time?", correct: "Personal time with God", distractors: ["A silent meeting", "A nap after lunch", "A time of fasting"], explanation: "Christians meet God privately in prayer and Scripture." },
  { text: "Why gather to worship?", correct: "To encourage one another", distractors: ["To be seen by others", "To raise money", "To show off gifts"], explanation: "We were not meant to walk with God alone." },
  { text: "What is confession in prayer?", correct: "Admitting our sins to God", distractors: ["Praising God's name", "Listing our needs", "Thanking God daily"], explanation: "Confession restores our fellowship with God." },
  { text: "What is it to adore God?", correct: "Praising God for His greatness", distractors: ["Asking God for things", "Thanking God for gifts", "Confessing sins"], explanation: "Adoration tells God how awesome He is." },
  { text: "What is thanksgiving?", correct: "Thanking God for His goodness", distractors: ["Asking for more blessings", "Rejoicing over enemies", "Boasting to friends"], explanation: "Thanksgiving is gratitude offered to God." },
  { text: "What is asking God for our needs?", correct: "Bringing our requests to God", distractors: ["Praising God publicly", "Interceding for sinners", "Reading the Bible"], explanation: "Supplication is asking God to meet our needs." },
];

const A1012_WORSHIP_SILVER: Draft[] = [
  { text: "What does the Lord's Prayer reveal about God?", correct: "He is holy, sovereign Father", distractors: ["He is distant and harsh", "He is weak and limited", "He is indifferent to us"], explanation: "It names God as our holy, ruling, caring Father." },
  { text: "What is the ACTS pattern of prayer?", correct: "Adoration, Confession, Thanksgiving, Supplication", distractors: ["Ask, Claim, Trust, Speak", "Adore, Confess, Thank, Supplicate", "Atone, Confess, Trust, Serve"], explanation: "ACTS gives a balanced, Jesus-shaped pattern of prayer." },
  { text: "Why pray your will be done?", correct: "We trust God's wisdom above our own", distractors: ["To sound spiritual", "To avoid responsibility", "To end the prayer quickly"], explanation: "We yield our desires to God's perfect will." },
  { text: "What role does fasting play?", correct: "It humbles and sharpens prayer", distractors: ["It earns God's favour", "It proves our holiness", "It replaces prayer"], explanation: "Fasting sets aside food to seek God fully." },
  { text: "Why is the Bible central to worship?", correct: "It is God speaking to us", distractors: ["It preserves tradition", "It teaches history", "It aids memory"], explanation: "In worship we meet God through His word." },
  { text: "How should we prepare for worship?", correct: "Confess and come in reverence", distractors: ["Dress in new clothes", "Arrive early always", "Bring big offerings"], explanation: "We come to God with clean hearts and reverent awe." },
  { text: "What is the church praying for others called?", correct: "Corporate intercession", distractors: ["A prayer marathon", "A national fast", "An all-night vigil"], explanation: "Together we carry the world's burdens to God." },
  { text: "Why does worship include giving?", correct: "Giving honours God", distractors: ["It keeps the church strong", "It buys blessings", "It impresses people"], explanation: "Generous giving is an act of worship and gratitude." },
];

const A1012_WORSHIP_GOLD: Draft[] = [
  { text: "What is worship in spirit and truth?", correct: "Heartfelt, obedient worship", distractors: ["Loud songs and dance", "Correct liturgy", "Ancient traditions"], explanation: "God wants worshippers whose hearts and lives are sincere." },
  { text: "How does prayer shape character?", correct: "It aligns our will with God's", distractors: ["It makes us more confident", "It gives us peace with men", "It calms our nerves"], explanation: "Regular prayer moulds us into the image of Christ." },
  { text: "What role does silence play in worship?", correct: "It makes space to hear God", distractors: ["It calms the crowd", "It marks the end", "It is empty time"], explanation: "Silence teaches us to listen before we speak." },
  { text: "How are worship and justice linked?", correct: "Love for God demands love for people", distractors: ["Worship earns justice", "Justice replaces worship", "They are unrelated"], explanation: "True worship shows in how we treat the poor." },
  { text: "Why is the Lord's Prayer a model and not a formula?", correct: "It teaches priorities and attitudes", distractors: ["It is often repeated", "It was old even then", "It covers all needs"], explanation: "Jesus taught us what and how to pray." },
  { text: "What harm does holding a grudge do?", correct: "It hinders our fellowship with God", distractors: ["Nothing at all", "It adds urgency", "It deepens devotion"], explanation: "God will not hear a heart holding grudges." },
  { text: "How can a teenager worship daily?", correct: "Pray, read the Bible, obey and love", distractors: ["Attend church weekly", "Wear Christian symbols", "Post scripture online"], explanation: "Every act of love and obedience is worship." },
  { text: "What makes a church's worship pleasing to God?", correct: "Truth, love and holiness together", distractors: ["Excellent music", "Big attendance", "Rich offerings"], explanation: "God delights in worship offered with honest, loving, holy hearts." },
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
        subject: "christian-studies",
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
      "bible-stories": topic("bible-stories", "BIB", [P46_BIBLES_BRONZE, P46_BIBLES_SILVER, P46_BIBLES_GOLD]),
      jesus: topic("jesus", "JES", [P46_JESUS_BRONZE, P46_JESUS_SILVER, P46_JESUS_GOLD]),
      commandments: topic("commandments", "GOD", [P46_COMMAND_BRONZE, P46_COMMAND_SILVER, P46_COMMAND_GOLD]),
      worship: topic("worship", "WOR", [P46_WORSHIP_BRONZE, P46_WORSHIP_SILVER, P46_WORSHIP_GOLD]),
    },
  },
  {
    id: "7-9",
    topics: {
      "bible-stories": topic("bible-stories", "BIB", [E79_BIBLES_BRONZE, E79_BIBLES_SILVER, E79_BIBLES_GOLD]),
      jesus: topic("jesus", "JES", [E79_JESUS_BRONZE, E79_JESUS_SILVER, E79_JESUS_GOLD]),
      commandments: topic("commandments", "GOD", [E79_COMMAND_BRONZE, E79_COMMAND_SILVER, E79_COMMAND_GOLD]),
      worship: topic("worship", "WOR", [E79_WORSHIP_BRONZE, E79_WORSHIP_SILVER, E79_WORSHIP_GOLD]),
    },
  },
  {
    id: "10-12",
    topics: {
      "bible-stories": topic("bible-stories", "BIB", [A1012_BIBLES_BRONZE, A1012_BIBLES_SILVER, A1012_BIBLES_GOLD]),
      jesus: topic("jesus", "JES", [A1012_JESUS_BRONZE, A1012_JESUS_SILVER, A1012_JESUS_GOLD]),
      commandments: topic("commandments", "GOD", [A1012_COMMAND_BRONZE, A1012_COMMAND_SILVER, A1012_COMMAND_GOLD]),
      worship: topic("worship", "WOR", [A1012_WORSHIP_BRONZE, A1012_WORSHIP_SILVER, A1012_WORSHIP_GOLD]),
    },
  },
];

let errors = 0;
for (const bandDef of BAND_BUILDERS) {
  const band = bandById(bandDef.id);
  if (!band) throw new Error(`unknown band ${bandDef.id}`);
  const OUT = path.resolve(`src/server/data/questions/${band.id}/christian-studies`);
  mkdirSync(OUT, { recursive: true });
  for (const topicId of Object.keys(bandDef.topics)) {
    const builder = bandDef.topics[topicId]!;
    const topicDef = TOPICS.find((t) => t.id === builder.id);
    if (!topicDef) throw new Error(`unknown topic ${builder.id}`);
    const questions = toQuestions(band.id, band.token, builder.id, builder.prefix, builder.levels);
    const file: TopicFile = {
      band: band.id as TopicFile["band"],
      subject: "christian-studies",
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
