# Question authoring guide

Phase 1 band: Explorers, ages 9 to 11, Primary 4 to 6.

Every question is a draft until a second teacher reviews it. Do not mark a question reviewed or live unless a real reviewer is named.

## File shape

One file per topic. Path: `src/server/data/questions/<subject>/<topic>.json`.

```json
{
  "subject": "english",
  "topic": "grammar",
  "title": "Grammar garden",
  "questions": [
    {
      "code": "ENG-GRA-B-001",
      "subject": "english",
      "topic": "grammar",
      "level": "bronze",
      "text": "Which word in this sentence is a noun? Ada reads a book.",
      "options": ["Ada", "reads", "a", "quickly"],
      "correctIndex": 0,
      "explanation": "Ada is the name of a person, so it is a noun.",
      "curriculumRef": "NERDC Primary 4 English, grammar: nouns",
      "author": "AI draft v1",
      "reviewer": null,
      "status": "draft"
    }
  ]
}
```

## Counts and codes

- 40 questions at Bronze, 40 at Silver, 40 at Gold. That is 120 per topic.
- The Code and AI sample has 8 per level, 24 in total.
- Codes use SUBJECT-TOPIC-LEVEL-NUMBER.
- Subject prefixes: `ENG`, `MAT`, `COD`.
- Topic prefixes: `COM`, `GRA`, `TEN`, `PUN`, `SPE`, `VOC`, `FIG`, `WRI`, `NUM`, `ADD`, `MUL`, `FRA`, `DEC`, `GEO`, `MEA`, `MON`, `COD`.
- Level letters: Bronze `B`, Silver `S`, Gold `G`.
- Number from `001` to `040`, in file order, with no gaps.

## Levels

- Bronze: recall one fact or one step. Example: name a noun, add 24 and 13, round 48 to the nearest 10.
- Silver: use the fact in a short problem. Example: pick the correct tense, find change from 500 naira, find a fraction of a number.
- Gold: combine two ideas or explain why. Example: two step word problem, compare two fractions, spot the mistake in a sentence.

## Writing rules

- Use Nigerian English spelling: colour, centre, metre, organise, practise as a verb.
- Use Nigerian names, places and money: Ada, Chidi, Ngozi, Tunde, Amina, Musa, Ekaette, Lagos, Kano, Enugu, Ibadan, Abuja, naira, mango, sachet water.
- Keep the question under 35 words. Keep every option under 14 words.
- Use short sentences. Aim for reading grade 6.5 or lower. The hard limit is 7.5.
- One question, one idea. No trick questions.
- No em dashes. Use a full stop or a comma.
- Use straight apostrophes and straight quotes.
- Do not say "all of the above" or "none of the above".
- Do not write a question that needs a picture or diagram. Describe shapes and data in words.
- Fractions are written like `1/2`, `3/4`.
- Multiplication is `×`, division is `÷`, money is `₦`, degrees is `°`.

## Options

- Exactly four options.
- One is clearly correct. The other three are plausible mistakes, not jokes.
- Keep options similar in length and grammar.
- Do not let the correct answer stand out by being the longest or the only detailed one.
- Do not repeat an option.
- Mix the correct position. Aim for about 10 of each position at every level.
- For number answers, include common wrong answers such as a sign error, a place value slip, or a missed step.

## Explanations

- One or two short sentences. Under 30 words.
- Say why the right answer is right. For a wrong answer, name the likely slip.
- Do not say "just because" or "it is obvious".

## Reading comprehension

- Passage under 130 words, reading grade 7.5 or lower.
- Each comprehension question repeats the same `passage` string exactly.
- Ask about a fact, a word in context, the main idea, or a simple inference.
- Do not ask a question that can be answered without reading the passage.
- Use 8 to 12 questions per passage. Forty questions per level can use 4 or 5 passages.

## Curriculum reference

Use a clear descriptive reference, for example:

- `NERDC Primary 4 English, grammar: common and proper nouns`
- `NERDC Primary 5 Mathematics, fractions: equivalent fractions`
- `NERDC Primary 6 Mathematics, measurement: area of a rectangle`

Do not invent official code numbers.

## Final check

Run:

```
npm run validate:questions -- --file=src/server/data/questions/english/grammar.json
```

The file must report 0 errors. Warnings about reading grade should be fixed where possible.