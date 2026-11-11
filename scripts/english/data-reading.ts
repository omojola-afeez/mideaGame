/**
 * Forty short reading passages for the comprehension topic.
 * Each story feeds three questions: a detail question at Bronze,
 * a reason question at Silver and a word meaning question at Gold.
 * Every field is authored for the Explorers band (ages 9 to 11).
 */

export interface Story {
  name: string;
  place: string;
  /** The key thing or person at the centre of the story. */
  item: string;
  /** Why the character went to the place. */
  reason: string;
  /** A word from the passage that the Gold question asks about. */
  word: string;
  /** Child friendly meaning of that word. */
  meaning: string;
  passage: string;
}

export const STORIES: Story[] = [
  {
    name: "Ada",
    place: "market",
    item: "tomatoes",
    reason: "to cook stew for her family",
    word: "stew",
    meaning: "a thick cooked dish",
    passage:
      "Ada went to the market on Saturday. She wanted tomatoes to cook stew for her family. The tomatoes were fresh and red. Ada paid the trader and put them in her basket. At home, she washed them and helped her mother cook. The stew smelled good.",
  },
  {
    name: "Musa",
    place: "farm",
    item: "yams",
    reason: "to plant them before the rain",
    word: "plant",
    meaning: "to put a seed in the ground",
    passage:
      "Musa walked to his father's farm early in the morning. He carried a bag of yams. He wanted to plant them before the rain came. Musa dug small holes and placed each yam in the soil. By noon, he had planted ten yams. He was tired but happy.",
  },
  {
    name: "Ngozi",
    place: "river",
    item: "water",
    reason: "to fill the pots for cooking",
    word: "fill",
    meaning: "to make something full",
    passage:
      "Ngozi took two pots to the river. She wanted to fill them with water for cooking. The river was low, so she walked to a deep part. She carried the full pots home on her head. Her mother thanked her.",
  },
  {
    name: "Tunde",
    place: "school",
    item: "a book",
    reason: "to return it to the library",
    word: "library",
    meaning: "a place where books are kept",
    passage:
      "Tunde found a book under his bed. It belonged to the school library. He walked to school early to return it. The librarian smiled and stamped the card. Tunde chose another book about animals. He promised to bring it back on time.",
  },
  {
    name: "Amina",
    place: "clinic",
    item: "medicine",
    reason: "because her baby brother was ill",
    word: "medicine",
    meaning: "something you take to get well",
    passage:
      "Amina's baby brother was hot and crying. Her mother sent her to the clinic. Amina collected medicine from the nurse. The nurse said to give it after food. At home, the baby drank the medicine and slept. By evening, he was cooler.",
  },
  {
    name: "Sani",
    place: "shop",
    item: "a new pen",
    reason: "because he lost his old one",
    word: "lost",
    meaning: "cannot be found",
    passage:
      "Sani could not find his pen before the test. He looked in his bag and under his desk. His old pen was lost. He ran to the shop near the gate. He bought a new pen with his pocket money. He reached the class before the bell.",
  },
  {
    name: "Ifeoma",
    place: "garden",
    item: "okra",
    reason: "to make soup for dinner",
    word: "okra",
    meaning: "a green vegetable used in soup",
    passage:
      "Ifeoma went to the garden behind her house. She wanted okra for dinner. The okra plants were tall and green. She picked ten soft pods and put them in a bowl. Her grandmother cut them into small pieces. The soup was ready before dark.",
  },
  {
    name: "Bola",
    place: "park",
    item: "a kite",
    reason: "to fly it with his friends",
    word: "kite",
    meaning: "a toy that flies on a string",
    passage:
      "Bola made a kite from paper and sticks. On Sunday, he took it to the park. His friends came with their own kites. The wind lifted Bola's kite high above the trees. He held the string tightly and laughed. They played until the sun went down.",
  },
  {
    name: "Chidi",
    place: "workshop",
    item: "a stool",
    reason: "to repair the broken leg",
    word: "repair",
    meaning: "to fix something broken",
    passage:
      "Chidi's stool had a broken leg. He carried it to his uncle's workshop. His uncle gave him a hammer and nails. Chidi held the wood while his uncle repaired the leg. Soon the stool was strong again. Chidi carried it home carefully.",
  },
  {
    name: "Ekaette",
    place: "bakery",
    item: "bread",
    reason: "to buy breakfast for the family",
    word: "bakery",
    meaning: "a place where bread is baked",
    passage:
      "Ekaette woke up early on Monday. Her mother gave her money for bread. She walked to the bakery at the corner. The baker pulled fresh loaves from the oven. Ekaette bought two loaves and a small cake. The family ate breakfast together.",
  },
  {
    name: "Emeka",
    place: "stream",
    item: "fish",
    reason: "to catch food for lunch",
    word: "catch",
    meaning: "to take hold of something",
    passage:
      "Emeka took his net to the stream. He wanted to catch fish for lunch. The water was clear and cool. He stood still and watched the fish swim past. Then he moved his net quickly. He caught three small fish and carried them home.",
  },
  {
    name: "Fatima",
    place: "village square",
    item: "a package",
    reason: "to deliver it to the chief",
    word: "package",
    meaning: "something wrapped for carrying",
    passage:
      "Fatima's aunt gave her a small package. It was wrapped in brown paper. Fatima walked to the village square. She gave the package to the chief's messenger. The messenger thanked her and gave her a sweet. Fatima ran home to tell her aunt.",
  },
  {
    name: "Garba",
    place: "bus stop",
    item: "a ticket",
    reason: "to travel to see his grandmother",
    word: "ticket",
    meaning: "a paper that allows you to travel",
    passage:
      "Garba stood at the bus stop with a small bag. He wanted to visit his grandmother in the next town. When the bus came, he bought a ticket. He sat near the window and watched the trees pass. Two hours later, he reached her gate.",
  },
  {
    name: "Halima",
    place: "market",
    item: "groundnuts",
    reason: "to sell them at her stall",
    word: "stall",
    meaning: "a small table where goods are sold",
    passage:
      "Halima filled a sack with groundnuts. She carried it to the market before sunrise. She spread them on her stall and waited for buyers. Soon, people came to buy small bags. By noon, her sack was empty. Halima counted her money and smiled.",
  },
  {
    name: "Ikenna",
    place: "field",
    item: "a ball",
    reason: "to practise for the match",
    word: "practise",
    meaning: "to do something again to improve",
    passage:
      "Ikenna took his ball to the field. His team had a match on Friday. They practised passing and shooting. Ikenna scored two goals. The coach told them to keep trying. They left the field tired but ready.",
  },
  {
    name: "Jumai",
    place: "well",
    item: "a bucket",
    reason: "to get water for washing",
    word: "bucket",
    meaning: "a container with a handle",
    passage:
      "Jumai carried a bucket to the well. The rope was long and the water was deep. She pulled the bucket up slowly. The water was cold and clean. She carried it home and washed the plates. Then she watered the small plants.",
  },
  {
    name: "Kemi",
    place: "library",
    item: "a story book",
    reason: "to read about a brave girl",
    word: "brave",
    meaning: "not afraid",
    passage:
      "Kemi went to the library after school. She wanted a story about a brave girl. The librarian showed her a book with a red cover. Kemi read three pages at the table. The girl in the story saved a baby from a fire. Kemi took the book home.",
  },
  {
    name: "Lanre",
    place: "market",
    item: "shoes",
    reason: "because his old shoes had holes",
    word: "holes",
    meaning: "open spaces in something",
    passage:
      "Lanre's old shoes had holes in the front. Water came in when it rained. He went to the market with his father. They found a pair of strong black shoes. Lanre tried them on and walked around. They fit well, so his father paid.",
  },
  {
    name: "Maimuna",
    place: "farm",
    item: "soup",
    reason: "to feed the workers",
    word: "workers",
    meaning: "people who do a job",
    passage:
      "Maimuna's father had men working on the farm. They were building a new fence. Maimuna helped her mother cook soup. She carried a big pot to the farm. The workers washed their hands and ate. They thanked her for the hot food.",
  },
  {
    name: "Nnamdi",
    place: "cycle shop",
    item: "a tyre",
    reason: "to fix his bicycle",
    word: "tyre",
    meaning: "the rubber ring on a wheel",
    passage:
      "Nnamdi's bicycle had a flat tyre. He pushed it to the cycle shop. The repairer found a small nail in the rubber. He took out the nail and mended the hole. Nnamdi paid him and rode home. The bicycle moved smoothly again.",
  },
  {
    name: "Olamide",
    place: "tailor's shop",
    item: "a dress",
    reason: "to wear at her cousin's wedding",
    word: "wedding",
    meaning: "a marriage ceremony",
    passage:
      "Olamide chose a blue cloth at the market. She took it to the tailor. She wanted a dress for her cousin's wedding. The tailor measured her shoulders and waist. Three days later, the dress was ready. Olamide wore it and looked beautiful.",
  },
  {
    name: "Peace",
    place: "church",
    item: "a song book",
    reason: "to join the choir",
    word: "choir",
    meaning: "a group of people who sing",
    passage:
      "Peace wanted to join the church choir. On Sunday, she arrived early with a song book. The leader taught them a new song. Peace sang softly at first. Then she found the tune and sang louder. The choir leader said she could join.",
  },
  {
    name: "Qasim",
    place: "mosque",
    item: "a mat",
    reason: "to pray with his father",
    word: "mat",
    meaning: "a piece of material to kneel on",
    passage:
      "Qasim rolled his mat and walked to the mosque. His father was already there. They washed their hands and faces. Qasim spread his mat near the wall. After prayers, he greeted the old men. His father bought him a cold drink.",
  },
  {
    name: "Rukayat",
    place: "farm",
    item: "maize",
    reason: "to help her mother harvest it",
    word: "maize",
    meaning: "a yellow grain used for food",
    passage:
      "Rukayat went with her mother to the farm. The maize was dry and yellow. They pulled the cobs and put them in baskets. Rukayat carried a heavy basket on her head. At home, they spread the maize in the sun. It would be ground into flour.",
  },
  {
    name: "Segun",
    place: "mechanic's shop",
    item: "a car",
    reason: "to help his uncle",
    word: "mechanic",
    meaning: "a person who repairs machines",
    passage:
      "Segun spent Saturday at his uncle's shop. His uncle was a mechanic. A car came in with a loud engine. Segun passed the spanner and held the light. His uncle fixed the engine. The driver paid and drove away. Segun learned something new.",
  },
  {
    name: "Tolu",
    place: "shop",
    item: "salt",
    reason: "because there was none at home",
    word: "salt",
    meaning: "a white powder that adds taste",
    passage:
      "Tolu's mother was cooking rice. She opened the cupboard and found no salt. She sent Tolu to the shop. Tolu bought a small bag of salt. He ran home without stopping. His mother added it to the pot. The rice tasted much better.",
  },
  {
    name: "Uche",
    place: "river",
    item: "a canoe",
    reason: "to cross to the other side",
    word: "canoe",
    meaning: "a small boat",
    passage:
      "Uche wanted to visit his friend across the river. There was no bridge. An old man had a canoe tied to a tree. Uche paid him and climbed in. The man rowed slowly across the water. Uche reached the other side and waved goodbye.",
  },
  {
    name: "Victor",
    place: "school",
    item: "a football",
    reason: "to give it to the coach",
    word: "coach",
    meaning: "a person who trains a team",
    passage:
      "Victor found a football in the bush near the school. It had a name written on it. He carried it to the coach. The coach said it belonged to the school team. He thanked Victor and let him join the practice. Victor was very happy.",
  },
  {
    name: "Wale",
    place: "market",
    item: "a hen",
    reason: "to give to his grandmother",
    word: "hen",
    meaning: "a female chicken",
    passage:
      "Wale's grandmother was coming for a visit. His mother gave him money for a hen. At the market, Wale chose a healthy brown hen. He carried it in a basket. His grandmother laughed when she saw it. That evening, they cooked a special meal.",
  },
  {
    name: "Yemi",
    place: "garden",
    item: "flowers",
    reason: "to decorate the table",
    word: "vase",
    meaning: "a container for flowers",
    passage:
      "Yemi's sister was having a birthday. Yemi went to the garden with scissors. She cut yellow flowers and green leaves. She put them in a small vase. Then she placed the vase on the table. The room looked bright and cheerful.",
  },
  {
    name: "Zainab",
    place: "clinic",
    item: "a baby",
    reason: "to help the nurse",
    word: "nurse",
    meaning: "a person who cares for sick people",
    passage:
      "Zainab's mother worked at the clinic. On Saturday, Zainab went with her. A young mother came in with a crying baby. The nurse checked the baby and gave advice. Zainab held the door and carried a small box. She felt proud to help.",
  },
  {
    name: "Abiodun",
    place: "farm",
    item: "a goat",
    reason: "to bring it home",
    word: "goat",
    meaning: "a farm animal with horns",
    passage:
      "Abiodun's father bought a goat at the market. It broke the rope and ran towards the farm. Abiodun followed it quietly. He saw the goat eating leaves near a tree. He held out some grass and caught it. He led it home by the rope.",
  },
  {
    name: "Blessing",
    place: "shop",
    item: "a lamp",
    reason: "because the power was out",
    word: "lamp",
    meaning: "a light you can carry",
    passage:
      "Blessing's house was dark. The power had gone out. Her father gave her money for a lamp. She walked to the shop at the corner. The shopkeeper showed her a small lamp with a bright light. Blessing paid and hurried home.",
  },
  {
    name: "Chinedu",
    place: "workshop",
    item: "a table",
    reason: "to help his father",
    word: "hammer",
    meaning: "a tool used to hit nails",
    passage:
      "Chinedu's father was building a table. He needed another pair of hands. Chinedu held the wood steady. His father hit the nails with a hammer. Chinedu passed the ruler and the glue. By evening, the table was finished. They stood it near the window.",
  },
  {
    name: "Damilola",
    place: "market",
    item: "oranges",
    reason: "to make juice for her friends",
    word: "juice",
    meaning: "a drink made from fruit",
    passage:
      "Damilola invited her friends for lunch. She wanted fresh orange juice. At the market, she bought ten oranges. She cut them and squeezed them into a jug. Her friends arrived and drank the cold juice. They said it was the best they had tasted.",
  },
  {
    name: "Efe",
    place: "stream",
    item: "a fish",
    reason: "to cook for his sick mother",
    word: "sick",
    meaning: "not feeling well",
    passage:
      "Efe's mother was sick and could not eat much. He took a small net to the stream. He stood in the shallow water for a long time. At last, he caught one fish. He ran home and cooked it with pepper. His mother ate and smiled.",
  },
  {
    name: "Funmi",
    place: "school",
    item: "a letter",
    reason: "to give to the head teacher",
    word: "head teacher",
    meaning: "the leader of a school",
    passage:
      "Funmi's father wrote a letter about her absence. Funmi carried it to school. She gave it to the head teacher's helper. Later, the head teacher called her to the office. She explained that she had been ill. He told her to catch up on her notes.",
  },
  {
    name: "Gbenga",
    place: "bus stop",
    item: "a bag",
    reason: "to travel to Lagos",
    word: "bag",
    meaning: "a container for carrying things",
    passage:
      "Gbenga packed his clothes in a bag. He was going to Lagos to see his brother. At the bus stop, he bought a ticket. The bus was full, so he sat near the door. He held his bag on his lap. The journey took six hours.",
  },
  {
    name: "Hauwa",
    place: "market",
    item: "a scarf",
    reason: "to wear on a cold day",
    word: "scarf",
    meaning: "cloth worn round the neck",
    passage:
      "The morning was cold and windy. Hauwa walked to the market with her mother. She chose a soft red scarf. The trader wrapped it in paper. Hauwa wore it at once and felt warm. Her mother bought one for her sister too.",
  },
  {
    name: "Ibukun",
    place: "garden",
    item: "a hoe",
    reason: "to weed the beds",
    word: "weed",
    meaning: "to remove unwanted plants",
    passage:
      "Ibukun took a hoe from the shed. The garden was full of tall grass. He wanted to weed the beds before planting. He worked slowly and pulled the grass by the roots. His back ached, but the garden looked neat. He drank water and rested.",
  },
];