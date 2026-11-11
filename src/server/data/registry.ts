import comprehension from "./questions/english/comprehension.json";
import figures from "./questions/english/figures.json";
import grammar from "./questions/english/grammar.json";
import punctuation from "./questions/english/punctuation.json";
import spelling from "./questions/english/spelling.json";
import tenses from "./questions/english/tenses.json";
import vocabulary from "./questions/english/vocabulary.json";
import writing from "./questions/english/writing.json";
import addsub from "./questions/mathematics/addsub.json";
import decimals from "./questions/mathematics/decimals.json";
import fractions from "./questions/mathematics/fractions.json";
import geometry from "./questions/mathematics/geometry.json";
import measurement from "./questions/mathematics/measurement.json";
import moneyData from "./questions/mathematics/money-data.json";
import muldiv from "./questions/mathematics/muldiv.json";
import number from "./questions/mathematics/number.json";
import codeAndAi from "./questions/code/code-and-ai.json";
import type { TopicFile } from "../../shared/question";

/** Every reviewed question file. Add a file here and it is live after the next deploy. */
export const TOPIC_FILES = [
  comprehension,
  figures,
  grammar,
  punctuation,
  spelling,
  tenses,
  vocabulary,
  writing,
  addsub,
  decimals,
  fractions,
  geometry,
  measurement,
  moneyData,
  muldiv,
  number,
  codeAndAi,
] as unknown as TopicFile[];