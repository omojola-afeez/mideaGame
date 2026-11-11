import { draft, int, moneyDistractors, naira, name, pick, thousands, type Maker } from "./math-types";

/** Geometry, measurement and money makers. Every answer is computed, never typed by hand. */

export const geometryMakers: Record<string, Maker[]> = {
  bronze: [
    (rng) => {
      const shapes = [
        ["triangle", 3],
        ["square", 4],
        ["rectangle", 4],
        ["rhombus", 4],
        ["pentagon", 5],
        ["hexagon", 6],
        ["heptagon", 7],
        ["octagon", 8],
      ] as const;
      const [shape, sides] = pick(rng, shapes);
      return draft(
        `How many sides does a ${shape} have?`,
        sides,
        [sides - 1, sides + 1, sides + 2],
        `A ${shape} has ${sides} sides.`,
        "NERDC Primary 4 Mathematics, geometry: sides of shapes",
      );
    },
    (rng) => {
      const shapes = [
        ["triangle", 3],
        ["square", 4],
        ["rectangle", 4],
        ["rhombus", 4],
        ["pentagon", 5],
        ["hexagon", 6],
        ["heptagon", 7],
        ["octagon", 8],
      ] as const;
      const [shape, corners] = pick(rng, shapes);
      return draft(
        `How many corners does a ${shape} have?`,
        corners,
        [corners - 1, corners + 1, corners + 2],
        `A ${shape} has ${corners} corners, also called vertices.`,
        "NERDC Primary 4 Mathematics, geometry: corners of shapes",
      );
    },
    (rng) => {
      const targets = [
        ["triangle", 3],
        ["pentagon", 5],
        ["hexagon", 6],
        ["octagon", 8],
      ] as const;
      const [answer, sides] = pick(rng, targets);
      return draft(
        `Which shape has exactly ${sides} sides?`,
        answer,
        ["square", "circle", "rectangle"].filter((x) => x !== answer),
        `A ${answer} has ${sides} sides.`,
        "NERDC Primary 4 Mathematics, geometry: naming shapes",
      );
    },
    (rng) => {
      const items = [
        ["square", 4],
        ["rectangle", 2],
        ["rhombus", 2],
      ] as const;
      const [shape, lines] = pick(rng, items);
      return draft(
        `How many lines of symmetry does a ${shape} have?`,
        lines,
        [lines + 1, Math.max(0, lines - 1), lines + 2],
        `A ${shape} folds onto itself along ${lines} lines of symmetry.`,
        "NERDC Primary 4 Mathematics, geometry: symmetry",
      );
    },
    () =>
      draft(
        "How many faces does a cube have?",
        6,
        [4, 8, 12],
        "A cube has a top, a bottom and four sides, so six faces.",
        "NERDC Primary 4 Mathematics, geometry: cubes",
      ),
    () =>
      draft(
        "How many edges does a cube have?",
        12,
        [6, 8, 10],
        "A cube has 12 edges.",
        "NERDC Primary 4 Mathematics, geometry: edges of a cube",
      ),
    () =>
      draft(
        "How many corners does a cube have?",
        8,
        [6, 10, 12],
        "A cube has eight corners, also called vertices.",
        "NERDC Primary 4 Mathematics, geometry: corners of a cube",
      ),
    (rng) => {
      const angle = pick(rng, [35, 45, 60, 90, 120, 135, 160] as const);
      const correct = angle === 90 ? "A right angle" : angle < 90 ? "An acute angle" : "An obtuse angle";
      return draft(
        `What kind of angle is ${angle}°?`,
        correct,
        ["An acute angle", "A right angle", "An obtuse angle", "A straight angle"].filter((x) => x !== correct),
        angle === 90
          ? "Exactly 90° is a right angle."
          : angle < 90
            ? `An angle less than 90° is acute. ${angle}° is less than 90°.`
            : `An angle between 90° and 180° is obtuse. ${angle}° is obtuse.`,
        "NERDC Primary 4 Mathematics, geometry: types of angles",
      );
    },
    () =>
      draft(
        "How many degrees are in a right angle?",
        "90°",
        ["45°", "180°", "360°"],
        "A right angle is a quarter turn, which is 90 degrees.",
        "NERDC Primary 4 Mathematics, geometry: right angles",
      ),
    () =>
      draft(
        "How many degrees are on a straight line?",
        "180°",
        ["90°", "360°", "45°"],
        "A straight line is a half turn, which is 180 degrees.",
        "NERDC Primary 4 Mathematics, geometry: angles on a line",
      ),
    (rng) => {
      const r = int(rng, 2, 9);
      return draft(
        `A circle has a radius of ${r} cm. What is its diameter?`,
        `${2 * r} cm`,
        [`${r} cm`, `${4 * r} cm`, `${r + 2} cm`],
        `Diameter = 2 × radius = 2 × ${r} = ${2 * r} cm.`,
        "NERDC Primary 4 Mathematics, geometry: radius and diameter",
      );
    },
    (rng) => {
      const r = int(rng, 2, 9);
      const d = 2 * r;
      return draft(
        `A circle has a diameter of ${d} cm. What is its radius?`,
        `${r} cm`,
        [`${d} cm`, `${d * 2} cm`, `${r + 1} cm`],
        `Radius = diameter ÷ 2 = ${d} ÷ 2 = ${r} cm.`,
        "NERDC Primary 4 Mathematics, geometry: radius and diameter",
      );
    },
    () =>
      draft(
        "How many straight sides does a circle have?",
        0,
        [1, 2, 4],
        "A circle is a curved line with no straight sides.",
        "NERDC Primary 4 Mathematics, geometry: circles",
      ),
    () =>
      draft(
        "Which shape has four equal sides and four right angles?",
        "A square",
        ["A rectangle", "A triangle", "A circle"],
        "A square has four equal sides and four right angles.",
        "NERDC Primary 4 Mathematics, geometry: squares",
      ),
  ],
  silver: [
    (rng) => {
      const l = int(rng, 5, 15);
      const w = int(rng, 3, 12);
      return draft(
        `A rectangle is ${l} cm long and ${w} cm wide. What is its perimeter?`,
        `${2 * (l + w)} cm`,
        [`${l + w} cm`, `${l * w} cm`, `${2 * (l + w) + 2} cm`],
        `Perimeter = 2 × (${l} + ${w}) = ${2 * (l + w)} cm.`,
        "NERDC Primary 5 Mathematics, geometry: perimeter of a rectangle",
      );
    },
    (rng) => {
      const l = int(rng, 4, 12);
      const w = int(rng, 3, 9);
      return draft(
        `A rectangle is ${l} cm long and ${w} cm wide. What is its area?`,
        `${l * w} cm²`,
        [`${2 * (l + w)} cm²`, `${l + w} cm²`, `${l * w + w} cm²`],
        `Area = ${l} × ${w} = ${l * w} cm².`,
        "NERDC Primary 5 Mathematics, geometry: area of a rectangle",
      );
    },
    (rng) => {
      const a = int(rng, 30, 150);
      return draft(
        `Two angles sit on a straight line. One is ${a}°. What is the other?`,
        `${180 - a}°`,
        [`${90 - a}°`, `${360 - a}°`, `${a}°`],
        `Angles on a straight line add to 180°, so the other is ${180 - a}°.`,
        "NERDC Primary 5 Mathematics, geometry: angles on a line",
      );
    },
    (rng) => {
      const a = int(rng, 40, 80);
      const b = int(rng, 30, Math.max(30, 160 - a));
      return draft(
        `A triangle has angles of ${a}° and ${b}°. What is the third angle?`,
        `${180 - a - b}°`,
        [`${a + b}°`, `${180 + a + b}°`, `${90 - a}°`],
        `The angles of a triangle add to 180°, so ${180 - a - b}° is left.`,
        "NERDC Primary 5 Mathematics, geometry: angles in a triangle",
      );
    },
    (rng) => {
      const angle = pick(rng, [35, 45, 60, 90, 120, 135, 160] as const);
      const kind = angle === 90 ? "A right angle" : angle < 90 ? "An acute angle" : "An obtuse angle";
      return draft(
        `What kind of angle is ${angle}°?`,
        kind,
        ["An acute angle", "A right angle", "An obtuse angle", "A straight angle"].filter((x) => x !== kind),
        angle === 90
          ? "Exactly 90° is a right angle."
          : angle < 90
            ? `An angle less than 90° is acute. ${angle}° is less than 90°.`
            : `An angle between 90° and 180° is obtuse. ${angle}° is obtuse.`,
        "NERDC Primary 5 Mathematics, geometry: types of angles",
      );
    },
    (rng) => {
      const r = int(rng, 4, 15);
      return draft(
        `A circle has a radius of ${r} cm. What is its diameter?`,
        `${2 * r} cm`,
        [`${r} cm`, `${4 * r} cm`, `${r + 2} cm`],
        `Diameter = 2 × radius = 2 × ${r} = ${2 * r} cm.`,
        "NERDC Primary 5 Mathematics, geometry: radius and diameter",
      );
    },
    (rng) => {
      const a = int(rng, 3, 9);
      const b = int(rng, 4, 11);
      const c = int(rng, 5, 13);
      return draft(
        `A triangle has sides of ${a} cm, ${b} cm and ${c} cm. What is its perimeter?`,
        `${a + b + c} cm`,
        [`${a * b * c} cm`, `${a + b} cm`, `${a + b + c + 2} cm`],
        `Perimeter = ${a} + ${b} + ${c} = ${a + b + c} cm.`,
        "NERDC Primary 5 Mathematics, geometry: perimeter of a triangle",
      );
    },
    () =>
      draft(
        "How many edges does a cube have?",
        12,
        [6, 8, 10],
        "A cube has 12 edges, 8 corners and 6 faces.",
        "NERDC Primary 5 Mathematics, geometry: properties of a cube",
      ),
  ],
  gold: [
    (rng) => {
      const s = int(rng, 4, 12);
      return draft(
        `A square has sides of ${s} cm. What is its area?`,
        `${s * s} cm²`,
        [`${4 * s} cm²`, `${2 * s} cm²`, `${s * s + s} cm²`],
        `Area of a square = side × side = ${s} × ${s} = ${s * s} cm².`,
        "NERDC Primary 6 Mathematics, geometry: area of a square",
      );
    },
    (rng) => {
      const l = int(rng, 3, 10);
      const w = int(rng, 2, 8);
      const h = int(rng, 2, 6);
      return draft(
        `A box is ${l} cm long, ${w} cm wide and ${h} cm high. What is its volume?`,
        `${l * w * h} cm³`,
        [`${l + w + h} cm³`, `${2 * (l + w)} cm³`, `${l * w} cm³`],
        `Volume = ${l} × ${w} × ${h} = ${l * w * h} cm³.`,
        "NERDC Primary 6 Mathematics, geometry: volume of a cuboid",
      );
    },
    (rng) => {
      const w = int(rng, 3, 9);
      const l = int(rng, 4, 12);
      const area = l * w;
      return draft(
        `A rectangle has an area of ${area} cm² and a width of ${w} cm. What is its length?`,
        `${l} cm`,
        [`${l + 1} cm`, `${area} cm`, `${w} cm`],
        `${area} ÷ ${w} = ${l} cm.`,
        "NERDC Primary 6 Mathematics, geometry: missing side of a rectangle",
      );
    },
    (rng) => {
      const a = int(rng, 60, 110);
      const b = int(rng, 50, 100);
      const c = int(rng, 40, Math.max(40, 350 - a - b));
      return draft(
        `Three angles of a quadrilateral are ${a}°, ${b}° and ${c}°. What is the fourth angle?`,
        `${360 - a - b - c}°`,
        [`${180 - a - b - c}°`, `${360 + a + b + c}°`, `${180 - a}°`],
        `The angles of a quadrilateral add to 360°, so the fourth is ${360 - a - b - c}°.`,
        "NERDC Primary 6 Mathematics, geometry: angles in a quadrilateral",
      );
    },
    (rng) => {
      const bigL = int(rng, 8, 14);
      const bigW = int(rng, 6, 10);
      const smallL = int(rng, 2, 5);
      const smallW = int(rng, 2, 5);
      const area = bigL * bigW - smallL * smallW;
      return draft(
        `An L shape is made by cutting a ${smallL} cm by ${smallW} cm rectangle from a ${bigL} cm by ${bigW} cm rectangle. What area is left?`,
        `${area} cm²`,
        [`${bigL * bigW} cm²`, `${area + smallL * smallW} cm²`, `${area - smallL} cm²`],
        `Big area ${bigL * bigW} cm² minus ${smallL * smallW} cm² gives ${area} cm².`,
        "NERDC Primary 6 Mathematics, geometry: area of a composite shape",
      );
    },
    (rng) => {
      const s = int(rng, 3, 9);
      return draft(
        `A cube has edges of ${s} cm. What is the total length of all its edges?`,
        `${12 * s} cm`,
        [`${6 * s} cm`, `${8 * s} cm`, `${s * s} cm`],
        `A cube has 12 edges, so 12 × ${s} = ${12 * s} cm.`,
        "NERDC Primary 6 Mathematics, geometry: edges of a cube",
      );
    },
    (rng) => {
      const l = int(rng, 10, 20);
      const w = int(rng, 5, 12);
      const rate = pick(rng, [400, 500, 600, 750] as const);
      return draft(
        `A plot is ${l} m by ${w} m. Fencing costs ${naira(rate)} per metre. What is the cost to fence all round?`,
        naira(2 * (l + w) * rate),
        moneyDistractors(2 * (l + w) * rate, [rate, -rate, l * w * rate]),
        `Perimeter = 2 × (${l} + ${w}) = ${2 * (l + w)} m. Cost = ${2 * (l + w)} × ${rate} = ${naira(2 * (l + w) * rate)}.`,
        "NERDC Primary 6 Mathematics, geometry: perimeter and cost",
      );
    },
    (rng) => {
      const a = int(rng, 70, 140);
      const b = int(rng, 60, 120);
      const c = int(rng, 50, Math.max(50, 350 - a - b));
      return draft(
        `Three angles meet at a point. They are ${a}°, ${b}° and ${c}°. What is the fourth angle?`,
        `${360 - a - b - c}°`,
        [`${180 - a - b - c}°`, `${a + b + c}°`, `${360 + a + b + c}°`],
        `Angles around a point add to 360°, so the fourth is ${360 - a - b - c}°.`,
        "NERDC Primary 6 Mathematics, geometry: angles at a point",
      );
    },
  ],
};

export const measurementMakers: Record<string, Maker[]> = {
  bronze: [
    (rng) => {
      const m = int(rng, 2, 9);
      return draft(
        `How many centimetres are in ${m} metres?`,
        m * 100,
        [m * 10, m * 1000, m + 100],
        `1 m = 100 cm, so ${m} × 100 = ${m * 100} cm.`,
        "NERDC Primary 4 Mathematics, measurement: metres and centimetres",
      );
    },
    (rng) => {
      const km = int(rng, 2, 9);
      return draft(
        `How many metres are in ${km} kilometres?`,
        km * 1000,
        [km * 100, km * 10, km + 1000],
        `1 km = 1000 m, so ${km} × 1000 = ${km * 1000} m.`,
        "NERDC Primary 4 Mathematics, measurement: kilometres",
      );
    },
    (rng) => {
      const kg = int(rng, 2, 9);
      return draft(
        `How many grams are in ${kg} kilograms?`,
        kg * 1000,
        [kg * 100, kg * 10, kg + 1000],
        `1 kg = 1000 g, so ${kg} × 1000 = ${kg * 1000} g.`,
        "NERDC Primary 4 Mathematics, measurement: mass",
      );
    },
    (rng) => {
      const l = int(rng, 2, 9);
      return draft(
        `How many millilitres are in ${l} litres?`,
        l * 1000,
        [l * 100, l * 10, l + 1000],
        `1 litre = 1000 ml, so ${l} × 1000 = ${l * 1000} ml.`,
        "NERDC Primary 4 Mathematics, measurement: capacity",
      );
    },
    () =>
      draft(
        "How many days are in one week?",
        7,
        [5, 10, 12],
        "A week has seven days, from Sunday to Saturday.",
        "NERDC Primary 4 Mathematics, measurement: time",
      ),
    () =>
      draft(
        "How many months are in one year?",
        12,
        [10, 7, 24],
        "A year has twelve months.",
        "NERDC Primary 4 Mathematics, measurement: the calendar",
      ),
    () =>
      draft(
        "How many minutes are in one hour?",
        60,
        [30, 100, 24],
        "One hour has 60 minutes.",
        "NERDC Primary 4 Mathematics, measurement: time",
      ),
    () =>
      draft(
        "How many seconds are in one minute?",
        60,
        [30, 100, 24],
        "One minute has 60 seconds.",
        "NERDC Primary 4 Mathematics, measurement: time",
      ),
    () =>
      draft(
        "How many hours are in one day?",
        24,
        [12, 60, 7],
        "One day has 24 hours.",
        "NERDC Primary 4 Mathematics, measurement: time",
      ),
    () =>
      draft(
        "How many weeks are in one year?",
        52,
        [12, 24, 30],
        "One year has 52 weeks.",
        "NERDC Primary 4 Mathematics, measurement: the calendar",
      ),
    () =>
      draft(
        "Which is longer, 1 kilometre or 900 metres?",
        "1 kilometre",
        ["900 metres", "They are equal", "Cannot tell"],
        "1 kilometre is 1000 metres, which is longer than 900 metres.",
        "NERDC Primary 4 Mathematics, measurement: comparing lengths",
      ),
    () =>
      draft(
        "A clock shows half past 3. What time is it?",
        "3:30",
        ["2:30", "3:00", "4:30"],
        "Half past 3 means thirty minutes after 3 o'clock.",
        "NERDC Primary 4 Mathematics, measurement: telling the time",
      ),
  ],
  silver: [
    (rng) => {
      const m = int(rng, 2, 9);
      return draft(
        `How many centimetres are in ${m} metres?`,
        `${m * 100} cm`,
        [`${m * 10} cm`, `${m * 1000} cm`, `${m + 100} cm`],
        `1 m = 100 cm, so ${m} × 100 = ${m * 100} cm.`,
        "NERDC Primary 5 Mathematics, measurement: converting metres to centimetres",
      );
    },
    (rng) => {
      const km = int(rng, 2, 9);
      return draft(
        `How many metres are in ${km} kilometres?`,
        `${km * 1000} m`,
        [`${km * 100} m`, `${km * 10} m`, `${km + 1000} m`],
        `1 km = 1000 m, so ${km} × 1000 = ${km * 1000} m.`,
        "NERDC Primary 5 Mathematics, measurement: converting kilometres to metres",
      );
    },
    (rng) => {
      const kg = int(rng, 1, 4);
      const g = pick(rng, [250, 500, 750] as const);
      return draft(
        `A bag of rice has a mass of ${kg} kg ${g} g. What is this in grams?`,
        `${kg * 1000 + g} g`,
        [`${kg * 100 + g} g`, `${kg * 1000} g`, `${kg + g} g`],
        `${kg} kg is ${kg * 1000} g. Add ${g} g to get ${kg * 1000 + g} g.`,
        "NERDC Primary 5 Mathematics, measurement: mass in grams",
      );
    },
    () =>
      draft(
        "A lesson starts at 8:15 and ends at 9:00. How long is the lesson?",
        "45 minutes",
        ["15 minutes", "30 minutes", "60 minutes"],
        "From 8:15 to 9:00 is 45 minutes.",
        "NERDC Primary 5 Mathematics, measurement: time intervals",
      ),
    (rng) => {
      const kg = pick(rng, [1.5, 2, 2.5] as const);
      const g = pick(rng, [250, 500, 750] as const);
      return draft(
        `What is ${kg} kg plus ${g} g?`,
        `${kg * 1000 + g} g`,
        [`${kg * 100 + g} g`, `${kg * 1000} g`, `${kg * 1000 + g * 10} g`],
        `${kg} kg is ${kg * 1000} g. Add ${g} g to get ${kg * 1000 + g} g.`,
        "NERDC Primary 5 Mathematics, measurement: adding mass",
      );
    },
    (rng) => {
      const litres = int(rng, 2, 5);
      const ml = pick(rng, [250, 500, 750] as const);
      return draft(
        `A bucket holds ${litres} litres. ${ml} ml is poured out. How much is left?`,
        `${litres * 1000 - ml} ml`,
        [`${litres * 1000 + ml} ml`, `${litres * 100 - ml} ml`, `${litres * 1000} ml`],
        `${litres} litres is ${litres * 1000} ml. ${litres * 1000} - ${ml} = ${litres * 1000 - ml} ml.`,
        "NERDC Primary 5 Mathematics, measurement: capacity",
      );
    },
    (rng) => {
      const l = int(rng, 4, 12);
      const w = int(rng, 3, 9);
      return draft(
        `A classroom floor is ${l} m long and ${w} m wide. What is its area?`,
        `${l * w} m²`,
        [`${2 * (l + w)} m²`, `${l + w} m²`, `${l * w + l} m²`],
        `Area = ${l} × ${w} = ${l * w} m².`,
        "NERDC Primary 5 Mathematics, measurement: area of a rectangle",
      );
    },
    (rng) => {
      const s = int(rng, 4, 12);
      return draft(
        `A square garden has sides of ${s} m. What is its perimeter?`,
        `${4 * s} m`,
        [`${s * s} m`, `${2 * s} m`, `${4 * s + 4} m`],
        `Perimeter of a square = 4 × side = 4 × ${s} = ${4 * s} m.`,
        "NERDC Primary 5 Mathematics, measurement: perimeter of a square",
      );
    },
  ],
  gold: [
    (rng) => {
      const km1 = int(rng, 2, 5);
      const m1 = pick(rng, [250, 400, 600] as const);
      const m2 = pick(rng, [500, 700, 800] as const);
      const totalM = km1 * 1000 + m1 + m2;
      return draft(
        `Add ${km1} km ${m1} m and 1 km ${m2} m.`,
        `${thousands(Math.floor(totalM / 1000))} km ${totalM % 1000} m`,
        [`${thousands(Math.floor(totalM / 1000))} km ${(totalM % 1000) + 100} m`, `${thousands(Math.floor(totalM / 1000) - 1)} km ${totalM % 1000} m`, `${thousands(Math.floor(totalM / 1000) + 1)} km ${totalM % 1000} m`],
        `${km1} km ${m1} m plus 1 km ${m2} m makes ${Math.floor(totalM / 1000)} km ${totalM % 1000} m.`,
        "NERDC Primary 6 Mathematics, measurement: adding lengths",
      );
    },
    (rng) => {
      const h = int(rng, 2, 6);
      const m = pick(rng, [15, 30, 45] as const);
      const startH = pick(rng, [3, 4, 5] as const);
      const start = startH * 60 + 45;
      const end = start + h * 60 + m;
      const endH = Math.floor(end / 60) % 12 || 12;
      const endM = end % 60;
      return draft(
        `A film starts at ${startH}:45 pm and lasts ${h} hours ${m} minutes. What time does it end?`,
        `${endH}:${String(endM).padStart(2, "0")} pm`,
        [`${endH}:${String((endM + 15) % 60).padStart(2, "0")} pm`, `${(endH % 12) + 1}:${String(endM).padStart(2, "0")} pm`, `${startH}:${String(endM).padStart(2, "0")} pm`],
        `${startH}:45 plus ${h} hours ${m} minutes ends at ${endH}:${String(endM).padStart(2, "0")} pm.`,
        "NERDC Primary 6 Mathematics, measurement: time intervals",
      );
    },
    (rng) => {
      const l = int(rng, 8, 16);
      const w = int(rng, 5, 12);
      const rate = pick(rng, [400, 500, 600] as const);
      const perimeter = 2 * (l + w);
      return draft(
        `A garden is ${l} m by ${w} m. Fencing costs ${naira(rate)} per metre. What is the total cost?`,
        naira(perimeter * rate),
        moneyDistractors(perimeter * rate, [rate, -rate, l * w * rate]),
        `Perimeter = ${perimeter} m. ${perimeter} × ${rate} = ${naira(perimeter * rate)}.`,
        "NERDC Primary 6 Mathematics, measurement: perimeter and cost",
      );
    },
    (rng) => {
      const l = int(rng, 2, 4);
      const w = int(rng, 2, 3);
      const h = int(rng, 1, 2);
      const m3 = l * w * h;
      return draft(
        `A tank is ${l} m long, ${w} m wide and ${h} m high. How many litres does it hold when full?`,
        `${thousands(m3 * 1000)} litres`,
        [`${thousands(m3 * 100)} litres`, `${thousands(m3)} litres`, `${thousands(m3 * 10000)} litres`],
        `Volume = ${m3} m³. One cubic metre is 1000 litres, so ${m3} × 1000 = ${thousands(m3 * 1000)} litres.`,
        "NERDC Primary 6 Mathematics, measurement: volume and capacity",
      );
    },
    (rng) => {
      const kg = pick(rng, [2, 2.5, 3] as const);
      const g = pick(rng, [650, 750, 850] as const);
      return draft(
        `What is ${kg} kg minus ${g} g? Give your answer in grams.`,
        `${kg * 1000 - g} g`,
        [`${kg * 1000 + g} g`, `${kg * 100 - g} g`, `${kg * 1000} g`],
        `${kg} kg is ${kg * 1000} g. ${kg * 1000} - ${g} = ${kg * 1000 - g} g.`,
        "NERDC Primary 6 Mathematics, measurement: subtracting mass",
      );
    },
    (rng) => {
      const s = int(rng, 4, 9);
      const rate = pick(rng, [800, 1000, 1200] as const);
      return draft(
        `A square carpet has sides of ${s} m. It costs ${naira(rate)} per square metre. What is the total cost?`,
        naira(s * s * rate),
        moneyDistractors(s * s * rate, [rate, -rate, 4 * s * rate]),
        `Area = ${s} × ${s} = ${s * s} m². Cost = ${s * s} × ${rate} = ${naira(s * s * rate)}.`,
        "NERDC Primary 6 Mathematics, measurement: area and cost",
      );
    },
    () => {
      const jugs = 4;
      return draft(
        "Four jugs each hold 1 litre 250 ml. How many litres do they hold in all?",
        "5 litres",
        ["4 litres", "5.5 litres", "6 litres"],
        "1 litre 250 ml × 4 = 5 litres.",
        "NERDC Primary 6 Mathematics, measurement: capacity",
      );
    },
    () =>
      draft(
        "A rope 10 m long is cut into 8 equal pieces. How long is each piece?",
        "125 cm",
        ["120 cm", "80 cm", "150 cm"],
        "10 m is 1000 cm. 1000 ÷ 8 = 125 cm.",
        "NERDC Primary 6 Mathematics, measurement: equal sharing of length",
      ),
  ],
};

export const moneyMakers: Record<string, Maker[]> = {
  bronze: [
    (rng) => {
      const a = int(rng, 2, 9) * 10;
      const b = int(rng, 1, 9) * 10;
      return draft(
        `What is ${naira(a)} plus ${naira(b)}?`,
        naira(a + b),
        moneyDistractors(a + b, [10, -10, 100]),
        `${a} + ${b} = ${a + b} naira.`,
        "NERDC Primary 4 Mathematics, money: adding naira",
      );
    },
    (rng) => {
      const price = int(rng, 2, 9) * 10;
      const change = 100 - price;
      return draft(
        `A pencil costs ${naira(price)}. You pay with ₦100. How much change do you get?`,
        naira(change),
        moneyDistractors(change, [10, -10, 100]),
        `100 - ${price} = ${change} naira.`,
        "NERDC Primary 4 Mathematics, money: change",
      );
    },
    (rng) => {
      const a = pick(rng, [100, 200, 300, 500, 1000] as const);
      const b = pick(rng, [100, 200, 300, 500, 1000] as const);
      if (a === b) return moneyMakers.bronze![2]!(rng);
      const high = Math.max(a, b);
      const low = Math.min(a, b);
      return draft(
        `Which is more, ${naira(low)} or ${naira(high)}?`,
        naira(high),
        [naira(low), "They are equal", "Cannot tell"],
        `${naira(high)} is greater than ${naira(low)}.`,
        "NERDC Primary 4 Mathematics, money: comparing amounts",
      );
    },
    (rng) => {
      const price = pick(rng, [20, 30, 40, 50, 60, 70, 80] as const);
      return draft(
        `Three oranges cost ${naira(price)} each. What is the total cost?`,
        naira(price * 3),
        moneyDistractors(price * 3, [price, -price, 10]),
        `3 × ${price} = ${price * 3} naira.`,
        "NERDC Primary 4 Mathematics, money: total cost",
      );
    },
    (rng) => {
      const price = pick(rng, [30, 40, 50, 60, 70, 80, 90] as const);
      return draft(
        `A mango costs ${naira(price)}. What do two mangoes cost?`,
        naira(price * 2),
        moneyDistractors(price * 2, [price, -price, 10]),
        `2 × ${price} = ${price * 2} naira.`,
        "NERDC Primary 4 Mathematics, money: multiplying cost",
      );
    },
    () =>
      draft(
        "How many kobo make one naira?",
        100,
        [10, 50, 1000],
        "One naira is 100 kobo.",
        "NERDC Primary 4 Mathematics, money: naira and kobo",
      ),
    () =>
      draft(
        "Which is worth the most?",
        naira(1000),
        [naira(500), naira(200), naira(100)],
        "₦1000 is the largest amount here.",
        "NERDC Primary 4 Mathematics, money: note values",
      ),
    () =>
      draft(
        "What is ₦250 plus ₦300?",
        naira(550),
        [naira(450), naira(650), naira(530)],
        "250 + 300 = 550 naira.",
        "NERDC Primary 4 Mathematics, money: adding amounts",
      ),
  ],
  silver: [
    (rng) => {
      const cost = int(rng, 4, 9) * 100 + pick(rng, [50, 0] as const);
      const change = 1000 - cost;
      return draft(
        `You buy goods worth ${naira(cost)} and pay with ₦1,000. How much change do you get?`,
        naira(change),
        moneyDistractors(change, [100, -100, 1000]),
        `${thousands(1000)} - ${thousands(cost)} = ${thousands(change)} naira.`,
        "NERDC Primary 5 Mathematics, money: change from 1000 naira",
      );
    },
    (rng) => {
      const price = int(rng, 2, 8) * 50;
      return draft(
        `Four books cost ${naira(price)} each. What is the total cost?`,
        naira(price * 4),
        moneyDistractors(price * 4, [price, -price, 100]),
        `4 × ${price} = ${price * 4} naira.`,
        "NERDC Primary 5 Mathematics, money: total cost",
      );
    },
    (rng) => {
      const weekly = pick(rng, [150, 200, 250] as const);
      return draft(
        `${name(rng)} saves ${naira(weekly)} each week. How much does she save in 3 weeks?`,
        naira(weekly * 3),
        moneyDistractors(weekly * 3, [weekly, -weekly, 100]),
        `3 × ${weekly} = ${weekly * 3} naira.`,
        "NERDC Primary 5 Mathematics, money: saving",
      );
    },
    (rng) => {
      const high = int(rng, 7, 12) * 100;
      const low = high - int(rng, 2, 4) * 50;
      return draft(
        `A shirt costs ${naira(high)} and a cap costs ${naira(low)}. How much more is the shirt?`,
        naira(high - low),
        moneyDistractors(high - low, [100, -100, high]),
        `${thousands(high)} - ${thousands(low)} = ${thousands(high - low)} naira.`,
        "NERDC Primary 5 Mathematics, money: finding the difference",
      );
    },
    () =>
      draft(
        "A chart shows 12 pupils chose football, 8 chose reading and 15 chose music. How many pupils chose a club in all?",
        35,
        [20, 27, 30],
        "12 + 8 + 15 = 35 pupils.",
        "NERDC Primary 5 Mathematics, data: reading a simple chart",
      ),
    () =>
      draft(
        "Amina has ₦2,000. She spends ₦1,250. How much is left?",
        naira(750),
        [naira(650), naira(850), naira(1250)],
        "2000 - 1250 = 750 naira.",
        "NERDC Primary 5 Mathematics, money: budgeting",
      ),
    (rng) => {
      const per = pick(rng, [20, 25, 30] as const);
      return draft(
        `Five sachets of water cost ${naira(per * 5)} in all. What is the cost of one sachet?`,
        naira(per),
        moneyDistractors(per, [5, -5, 10]),
        `${per * 5} ÷ 5 = ${per} naira.`,
        "NERDC Primary 5 Mathematics, money: unit price",
      );
    },
    () =>
      draft(
        "A table shows 12 pupils were present on Monday and 15 on Tuesday. How many more were present on Tuesday?",
        3,
        [2, 4, 27],
        "15 - 12 = 3 pupils.",
        "NERDC Primary 5 Mathematics, data: comparing chart values",
      ),
  ],
  gold: [
    (rng) => {
      const price = int(rng, 20, 60) * 100;
      return draft(
        `A bag costs ${naira(price)}. A shop gives a 10% discount. How much is the discount?`,
        naira(price / 10),
        moneyDistractors(price / 10, [price / 5, -price / 10, price / 4]),
        `10% means one tenth. ${thousands(price)} ÷ 10 = ${thousands(price / 10)} naira.`,
        "NERDC Primary 6 Mathematics, money: percentage discount",
      );
    },
    (rng) => {
      const cost = int(rng, 6, 15) * 100;
      const profit = pick(rng, [100, 150, 200, 250] as const);
      return draft(
        `A trader buys a bag for ${naira(cost)} and sells it for ${naira(cost + profit)}. What is the profit?`,
        naira(profit),
        moneyDistractors(profit, [100, -50, cost]),
        `${thousands(cost + profit)} - ${thousands(cost)} = ${thousands(profit)} naira.`,
        "NERDC Primary 6 Mathematics, money: profit",
      );
    },
    (rng) => {
      const price = pick(rng, [1000, 1200, 1500] as const);
      const total = price * 3;
      const change = 5000 - total;
      return draft(
        `${name(rng)} buys 3 chairs at ${naira(price)} each and pays with ₦5,000. What change does she get?`,
        naira(change),
        moneyDistractors(change, [price, -price, 500]),
        `3 × ${thousands(price)} = ${thousands(total)}. 5000 - ${thousands(total)} = ${thousands(change)} naira.`,
        "NERDC Primary 6 Mathematics, money: multi step change",
      );
    },
    () =>
      draft(
        "Shop A sells 6 pens for ₦900. Shop B sells 4 pens for ₦640. Which shop is cheaper per pen?",
        "Shop A",
        ["Shop B", "They are the same", "Cannot tell"],
        "Shop A is ₦150 per pen. Shop B is ₦160 per pen. Shop A is cheaper.",
        "NERDC Primary 6 Mathematics, money: comparing unit prices",
      ),
    () =>
      draft(
        "A chart shows 12 pupils chose football, 8 chose reading and 15 chose music. What is the difference between the most and least popular club?",
        7,
        [3, 4, 35],
        "The most is 15 and the least is 8. 15 - 8 = 7.",
        "NERDC Primary 6 Mathematics, data: range in a chart",
      ),
    (rng) => {
      const each = pick(rng, [400, 500, 600, 750] as const);
      const people = pick(rng, [4, 5, 6, 8] as const);
      return draft(
        `₦${thousands(each * people)} is shared equally among ${people} people. How much does each person get?`,
        naira(each),
        moneyDistractors(each, [50, -50, 100]),
        `${thousands(each * people)} ÷ ${people} = ${thousands(each)} naira.`,
        "NERDC Primary 6 Mathematics, money: equal sharing",
      );
    },
    (rng) => {
      const weekly = pick(rng, [200, 250, 300] as const);
      const weeks = 12;
      return draft(
        `${name(rng)} saves ${naira(weekly)} every week. How much does he save in ${weeks} weeks?`,
        naira(weekly * weeks),
        moneyDistractors(weekly * weeks, [weekly, -weekly, 1000]),
        `${weeks} × ${weekly} = ${weekly * weeks} naira.`,
        "NERDC Primary 6 Mathematics, money: saving over time",
      );
    },
    (rng) => {
      const cost = int(rng, 10, 16) * 100;
      const loss = pick(rng, [100, 150, 200] as const);
      return draft(
        `A trader buys a radio for ${naira(cost)} and sells it for ${naira(cost - loss)}. What is the loss?`,
        naira(loss),
        moneyDistractors(loss, [100, -50, cost]),
        `${thousands(cost)} - ${thousands(cost - loss)} = ${thousands(loss)} naira.`,
        "NERDC Primary 6 Mathematics, money: loss",
      );
    },
  ],
};