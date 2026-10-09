import type { SeedWordPart } from "./types";

/**
 * 40 high-utility SAT prefixes with plain-English explanations, visual
 * mnemonics, related parts, and example words with sentences.
 */
export const PREFIXES: SeedWordPart[] = [
  {
    text: "pre-",
    type: "prefix",
    meaning: "before",
    description:
      "Pre- means “before.” It attaches to the front of words about time, order, and foresight.",
    origin: "Latin",
    difficulty: "beginner",
    category: "time",
    mnemonic: "A preview shows the movie before it starts.",
    related: ["post-", "fore-", "re-"],
    words: [
      {
        word: "predict",
        definition: "to say what will happen before it happens",
        sentence: "Based on the dark clouds, we can predict rain.",
      },
      {
        word: "prelude",
        definition: "music or an event that comes before the main one",
        sentence: "The prelude introduced the orchestra's main piece.",
      },
      {
        word: "premature",
        definition: "happening too early",
        sentence: "The premature announcement caused confusion.",
      },
    ],
  },
  {
    text: "post-",
    type: "prefix",
    meaning: "after",
    description:
      "Post- means “after.” A postscript is written after the letter is finished.",
    origin: "Latin",
    difficulty: "beginner",
    category: "time",
    mnemonic: "P.S. — the note you write after the letter.",
    related: ["pre-", "retro-"],
    words: [
      {
        word: "postpone",
        definition: "to put off until a later time",
        sentence: "We had to postpone the game because of the storm.",
      },
      {
        word: "postscript",
        definition: "a note added after the end of a letter (P.S.)",
        sentence: "She added a postscript asking about the cat.",
      },
      {
        word: "posterior",
        definition: "located at the back",
        sentence: "The posterior fins help the fish steer.",
      },
    ],
  },
  {
    text: "ante-",
    type: "prefix",
    meaning: "before",
    description:
      "Ante- means “before.” In poker, you ante up before the cards are dealt.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "time",
    mnemonic: "You ante up before the hand begins.",
    related: ["pre-", "post-"],
    words: [
      {
        word: "antecedent",
        definition: "the thing that comes before",
        sentence: "The pronoun “she” refers to its antecedent, Maria.",
      },
      {
        word: "anteroom",
        definition: "a room before the main room",
        sentence: "Please wait in the anteroom.",
      },
      {
        word: "antediluvian",
        definition: "extremely old — literally “before the flood”",
        sentence: "The antediluvian traditions surprised the historians.",
      },
    ],
  },
  {
    text: "fore-",
    type: "prefix",
    meaning: "before",
    description: "Fore- means “before.” A forecast is made before the weather happens.",
    origin: "Old English",
    difficulty: "beginner",
    category: "time",
    mnemonic: "The weather forecast comes before the weather.",
    related: ["pre-", "post-"],
    words: [
      {
        word: "forecast",
        definition: "to predict what will happen before it does",
        sentence: "The forecast called for snow.",
      },
      {
        word: "forewarn",
        definition: "to warn before something happens",
        sentence: "The sign forewarned hikers of falling rocks.",
      },
      {
        word: "forebear",
        definition: "an ancestor",
        sentence: "Her forebears immigrated in the 1800s.",
      },
    ],
  },
  {
    text: "re-",
    type: "prefix",
    meaning: "again; back",
    description:
      "Re- means “again” or “back.” To return is to come back; to review is to look again.",
    origin: "Latin",
    difficulty: "beginner",
    category: "time",
    mnemonic: "Rewind means to wind back.",
    related: ["retro-", "pre-"],
    words: [
      {
        word: "return",
        definition: "to come back",
        sentence: "Please return the library book by Friday.",
      },
      {
        word: "review",
        definition: "to look at again",
        sentence: "Let's review the notes before the test.",
      },
      {
        word: "recede",
        definition: "to move back",
        sentence: "The floodwater began to recede.",
      },
    ],
  },
  {
    text: "retro-",
    type: "prefix",
    meaning: "backward",
    description:
      "Retro- means “backward.” In retrospect, you look back at what happened.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "time",
    mnemonic: "Retro style looks backward in time.",
    related: ["re-", "post-"],
    words: [
      {
        word: "retrospect",
        definition: "a look back at past events",
        sentence: "In retrospect, the decision was wise.",
      },
      {
        word: "retroactive",
        definition: "applying to the past",
        sentence: "The pay raise was retroactive to January.",
      },
      {
        word: "retrograde",
        definition: "moving backward",
        sentence: "The planet's retrograde motion puzzled astronomers.",
      },
    ],
  },
  {
    text: "a-/an-",
    type: "prefix",
    meaning: "not; without",
    description:
      "A-/an- means “not” or “without.” Anarchy is a state without rule.",
    origin: "Greek",
    difficulty: "beginner",
    category: "negation",
    mnemonic: "An anonymous letter has no name.",
    related: ["in-/im-", "non-", "dis-"],
    words: [
      {
        word: "anonymous",
        definition: "without a name",
        sentence: "The donor wished to remain anonymous.",
      },
      {
        word: "atypical",
        definition: "not typical",
        sentence: "Her reaction was atypical for her.",
      },
      {
        word: "asocial",
        definition: "not social",
        sentence: "The asocial child preferred reading alone.",
      },
    ],
  },
  {
    text: "anti-",
    type: "prefix",
    meaning: "against",
    description:
      "Anti- means “against.” An antibiotic works against bacteria.",
    origin: "Greek",
    difficulty: "beginner",
    category: "opposition",
    mnemonic: "Antisocial means against society.",
    related: ["contra-/counter-", "dis-"],
    words: [
      {
        word: "antibiotic",
        definition: "a medicine that works against bacteria",
        sentence: "The doctor prescribed an antibiotic.",
      },
      {
        word: "antisocial",
        definition: "against society; unfriendly to others",
        sentence: "He was quiet, not antisocial.",
      },
      {
        word: "anticlimax",
        definition: "a disappointing end",
        sentence: "The movie's ending felt like an anticlimax.",
      },
    ],
  },
  {
    text: "contra-/counter-",
    type: "prefix",
    meaning: "against",
    description:
      "Contra- and counter- mean “against.” To contradict is to speak against someone.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "opposition",
    mnemonic: "A counterargument is an argument against.",
    related: ["anti-", "dis-"],
    words: [
      {
        word: "contradict",
        definition: "to speak against",
        sentence: "The evidence contradicts his claim.",
      },
      {
        word: "counterfeit",
        definition: "made to deceive — against the real thing",
        sentence: "The guard spotted the counterfeit bill.",
      },
      {
        word: "counterargument",
        definition: "an argument against",
        sentence: "She prepared a counterargument for the debate.",
      },
    ],
  },
  {
    text: "dis-",
    type: "prefix",
    meaning: "not; opposite",
    description:
      "Dis- means “not” or reverses a meaning. To disagree is to not agree.",
    origin: "Latin",
    difficulty: "beginner",
    category: "negation",
    mnemonic: "Dislike is the opposite of like.",
    related: ["un-", "mis-", "a-/an-"],
    words: [
      {
        word: "disagree",
        definition: "to not agree",
        sentence: "I respectfully disagree with the conclusion.",
      },
      {
        word: "disappear",
        definition: "to not be visible",
        sentence: "The magician made the coin disappear.",
      },
      {
        word: "dishonest",
        definition: "not honest",
        sentence: "The dishonest merchant was fined.",
      },
    ],
  },
  {
    text: "in-/im-",
    type: "prefix",
    meaning: "not",
    description:
      "In-/im- can mean “not.” Impossible is not possible; immature is not mature.",
    origin: "Latin",
    difficulty: "beginner",
    category: "negation",
    mnemonic: "Impossible — not possible.",
    related: ["a-/an-", "non-", "un-"],
    words: [
      {
        word: "impossible",
        definition: "not possible",
        sentence: "Nothing is impossible with practice.",
      },
      {
        word: "immature",
        definition: "not mature",
        sentence: "His immature behavior cost him the job.",
      },
      {
        word: "invisible",
        definition: "not visible",
        sentence: "The ink was nearly invisible.",
      },
    ],
  },
  {
    text: "in-/im-/en-/em-",
    type: "prefix",
    meaning: "in; into",
    description:
      "In-/en- mean “in” or “into.” To import is to carry in from another country.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "direction",
    mnemonic: "Enclose means to close in on all sides.",
    related: ["ex-", "inter-"],
    words: [
      {
        word: "import",
        definition: "to bring in from outside",
        sentence: "The country imports most of its oil.",
      },
      {
        word: "enclose",
        definition: "to close in on all sides",
        sentence: "Please enclose a copy of your receipt.",
      },
      {
        word: "immerse",
        definition: "to dip into",
        sentence: "Immerse the berries in cold water.",
      },
      {
        word: "embark",
        definition: "to go on a journey",
        sentence: "They embarked on a year of travel.",
      },
    ],
  },
  {
    text: "non-",
    type: "prefix",
    meaning: "not",
    description: "Non- means “not.” A nonstop flight is one without stops.",
    origin: "Latin",
    difficulty: "beginner",
    category: "negation",
    mnemonic: "Nonstop — without a stop.",
    related: ["a-/an-", "un-"],
    words: [
      {
        word: "nonstop",
        definition: "without stopping",
        sentence: "We took a nonstop flight to Tokyo.",
      },
      {
        word: "nonexistent",
        definition: "not existing",
        sentence: "The treasure was nonexistent — a myth.",
      },
      {
        word: "nonprofit",
        definition: "not run for profit",
        sentence: "She volunteers for a nonprofit organization.",
      },
    ],
  },
  {
    text: "mis-",
    type: "prefix",
    meaning: "wrongly; badly",
    description:
      "Mis- means “wrongly.” To misunderstand is to understand wrongly.",
    origin: "Old English",
    difficulty: "beginner",
    category: "negation",
    mnemonic: "A misstep is a wrong step.",
    related: ["dis-", "mal-"],
    words: [
      {
        word: "misunderstand",
        definition: "to understand wrongly",
        sentence: "I misunderstood the directions.",
      },
      {
        word: "misplace",
        definition: "to put in the wrong place",
        sentence: "He misplaced his passport.",
      },
      {
        word: "misjudge",
        definition: "to judge wrongly",
        sentence: "They misjudged her abilities.",
      },
    ],
  },
  {
    text: "un-",
    type: "prefix",
    meaning: "not",
    description: "Un- means “not.” Unhappy is not happy; unable is not able.",
    origin: "Old English",
    difficulty: "beginner",
    category: "negation",
    mnemonic: "Unhappy — not happy.",
    related: ["dis-", "non-"],
    words: [
      {
        word: "unhappy",
        definition: "not happy",
        sentence: "The child was unhappy with the gift.",
      },
      {
        word: "unable",
        definition: "not able",
        sentence: "She was unable to attend the ceremony.",
      },
      {
        word: "unknown",
        definition: "not known",
        sentence: "The artist was unknown until last year.",
      },
    ],
  },
  {
    text: "inter-",
    type: "prefix",
    meaning: "between",
    description:
      "Inter- means “between.” International means between nations.",
    origin: "Latin",
    difficulty: "beginner",
    category: "position",
    mnemonic: "The internet connects between computers.",
    related: ["trans-", "circum-"],
    words: [
      {
        word: "international",
        definition: "between nations",
        sentence: "The conference was international.",
      },
      {
        word: "interact",
        definition: "to act between people",
        sentence: "The app lets users interact.",
      },
      {
        word: "intermission",
        definition: "a break between acts",
        sentence: "We bought snacks at intermission.",
      },
    ],
  },
  {
    text: "trans-",
    type: "prefix",
    meaning: "across; through",
    description:
      "Trans- means “across” or “through.” To transport is to carry across.",
    origin: "Latin",
    difficulty: "beginner",
    category: "direction",
    mnemonic: "A transcript is carried across to a new school.",
    related: ["inter-", "port"],
    words: [
      {
        word: "transport",
        definition: "to carry across",
        sentence: "The city will transport goods by rail.",
      },
      {
        word: "transfer",
        definition: "to carry across to another",
        sentence: "Transfer the files to the new laptop.",
      },
      {
        word: "transform",
        definition: "to change across form",
        sentence: "The renovation transformed the building.",
      },
    ],
  },
  {
    text: "circum-",
    type: "prefix",
    meaning: "around",
    description:
      "Circum- means “around.” The circumference measures the distance around a circle.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "position",
    mnemonic: "Circumnavigate — sail around the world.",
    related: ["peri-", "inter-"],
    words: [
      {
        word: "circumference",
        definition: "the distance around a circle",
        sentence: "Measure the circumference of the circle.",
      },
      {
        word: "circumnavigate",
        definition: "to sail around",
        sentence: "She circumnavigated the globe.",
      },
      {
        word: "circumspect",
        definition: "careful — looking around before acting",
        sentence: "He was circumspect about the investment.",
      },
    ],
  },
  {
    text: "peri-",
    type: "prefix",
    meaning: "around",
    description:
      "Peri- means “around.” The perimeter is the boundary around an area.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "position",
    mnemonic: "Peripheral vision is at the edges, around the center.",
    related: ["circum-", "inter-"],
    words: [
      {
        word: "perimeter",
        definition: "the distance around an area",
        sentence: "Fence the perimeter of the yard.",
      },
      {
        word: "periscope",
        definition: "a tube for looking around obstacles",
        sentence: "The periscope rose above the water.",
      },
      {
        word: "peripheral",
        definition: "at the edge, not central",
        sentence: "The issue was peripheral to the main debate.",
      },
    ],
  },
  {
    text: "sub-",
    type: "prefix",
    meaning: "under; below",
    description:
      "Sub- means “under” or “below.” A submarine travels under the sea.",
    origin: "Latin",
    difficulty: "beginner",
    category: "position",
    mnemonic: "A subway runs under the city.",
    related: ["super-", "hypo-"],
    words: [
      {
        word: "submarine",
        definition: "a vessel that goes under water",
        sentence: "The submarine surfaced at dawn.",
      },
      {
        word: "subway",
        definition: "a train that runs under the city",
        sentence: "We rode the subway downtown.",
      },
      {
        word: "subconscious",
        definition: "below awareness",
        sentence: "Fear can live in the subconscious mind.",
      },
    ],
  },
  {
    text: "super-",
    type: "prefix",
    meaning: "above; beyond",
    description:
      "Super- means “above” or “beyond.” To supervise is to watch over.",
    origin: "Latin",
    difficulty: "beginner",
    category: "position",
    mnemonic: "A supervisor stands over the team.",
    related: ["sub-", "hyper-"],
    words: [
      {
        word: "supernatural",
        definition: "beyond nature",
        sentence: "The story involves supernatural events.",
      },
      {
        word: "superficial",
        definition: "only on the surface",
        sentence: "Her smile was superficial.",
      },
      {
        word: "supervise",
        definition: "to watch over",
        sentence: "She supervises a team of ten.",
      },
    ],
  },
  {
    text: "hyper-",
    type: "prefix",
    meaning: "over; excessive",
    description:
      "Hyper- means “over” or “excessive.” Hyperactive means overly active.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "degree",
    mnemonic: "Hyperbole exaggerates — over the top.",
    related: ["hypo-", "ultra-"],
    words: [
      {
        word: "hyperactive",
        definition: "overly active",
        sentence: "The hyperactive puppy chewed the shoe.",
      },
      {
        word: "hyperbole",
        definition: "exaggeration",
        sentence: "Saying “I'm starving” is hyperbole.",
      },
      {
        word: "hypertension",
        definition: "high blood pressure",
        sentence: "Hypertension raises the risk of stroke.",
      },
    ],
  },
  {
    text: "hypo-",
    type: "prefix",
    meaning: "under; below",
    description:
      "Hypo- means “under” or “below.” Hypothermia is below-normal body temperature.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "degree",
    mnemonic: "A hypothesis is an idea underneath the claim.",
    related: ["hyper-", "sub-"],
    words: [
      {
        word: "hypothermia",
        definition: "dangerously low body temperature",
        sentence: "The hiker suffered from hypothermia.",
      },
      {
        word: "hypothesis",
        definition: "an underlying idea to be tested",
        sentence: "Her hypothesis predicted the result.",
      },
      {
        word: "hypodermic",
        definition: "under the skin",
        sentence: "The nurse used a hypodermic needle.",
      },
    ],
  },
  {
    text: "ultra-",
    type: "prefix",
    meaning: "beyond; extreme",
    description:
      "Ultra- means “beyond” or “extreme.” Ultraviolet light is beyond the violet end of the spectrum.",
    origin: "Latin",
    difficulty: "advanced",
    category: "degree",
    mnemonic: "Ultra = beyond, like ultra-marathon.",
    related: ["hyper-", "super-"],
    words: [
      {
        word: "ultraviolet",
        definition: "beyond the violet end of the visible spectrum",
        sentence: "Sunscreen blocks ultraviolet rays.",
      },
      {
        word: "ultrasonic",
        definition: "beyond the range of human hearing",
        sentence: "Bats navigate with ultrasonic calls.",
      },
      {
        word: "ultramodern",
        definition: "extremely modern",
        sentence: "The laboratory is ultramodern.",
      },
    ],
  },
  {
    text: "over-",
    type: "prefix",
    meaning: "too much; above",
    description:
      "Over- means “too much” or “above.” Overconfident means too confident.",
    origin: "Old English",
    difficulty: "beginner",
    category: "degree",
    mnemonic: "Overeating is eating too much.",
    related: ["under-", "hyper-"],
    words: [
      {
        word: "overconfident",
        definition: "too confident",
        sentence: "The overconfident team lost the game.",
      },
      {
        word: "overestimate",
        definition: "to estimate too high",
        sentence: "Don't overestimate your speed.",
      },
      {
        word: "overload",
        definition: "too much load",
        sentence: "The truck was overloaded.",
      },
    ],
  },
  {
    text: "under-",
    type: "prefix",
    meaning: "below; too little",
    description:
      "Under- means “below” or “too little.” To underestimate is to value too low.",
    origin: "Old English",
    difficulty: "beginner",
    category: "degree",
    mnemonic: "The underdog is the one below, expected to lose.",
    related: ["over-", "sub-"],
    words: [
      {
        word: "underestimate",
        definition: "to value too low",
        sentence: "Never underestimate your opponent.",
      },
      {
        word: "underground",
        definition: "below the ground",
        sentence: "The subway runs underground.",
      },
      {
        word: "underdog",
        definition: "the one expected to lose",
        sentence: "The underdog won the championship.",
      },
    ],
  },
  {
    text: "bi-",
    type: "prefix",
    meaning: "two",
    description: "Bi- means “two.” A bicycle has two wheels.",
    origin: "Latin",
    difficulty: "beginner",
    category: "number",
    mnemonic: "A bicycle has two wheels.",
    related: ["mono-", "uni-", "multi-", "semi-"],
    words: [
      {
        word: "bicycle",
        definition: "a vehicle with two wheels",
        sentence: "She rode her bicycle to school.",
      },
      {
        word: "bilingual",
        definition: "speaking two languages",
        sentence: "The bilingual guide translated for us.",
      },
      {
        word: "biannual",
        definition: "twice a year",
        sentence: "The biannual report surprised investors.",
      },
    ],
  },
  {
    text: "mono-",
    type: "prefix",
    meaning: "one",
    description: "Mono- means “one.” A monologue is a speech by one person.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "number",
    mnemonic: "Monotone — one unchanging tone.",
    related: ["uni-", "poly-"],
    words: [
      {
        word: "monopoly",
        definition: "control by one seller",
        sentence: "The company held a monopoly.",
      },
      {
        word: "monologue",
        definition: "a speech by one person",
        sentence: "The comedian's monologue lasted ten minutes.",
      },
      {
        word: "monotone",
        definition: "one unchanging tone",
        sentence: "His monotone voice put us to sleep.",
      },
    ],
  },
  {
    text: "uni-",
    type: "prefix",
    meaning: "one",
    description: "Uni- means “one.” A uniform gives everyone one shape.",
    origin: "Latin",
    difficulty: "beginner",
    category: "number",
    mnemonic: "A unicycle has one wheel.",
    related: ["mono-", "bi-"],
    words: [
      {
        word: "uniform",
        definition: "one style for all",
        sentence: "Students wear a uniform.",
      },
      {
        word: "unilateral",
        definition: "one-sided",
        sentence: "A unilateral decision ignored the team.",
      },
      {
        word: "unique",
        definition: "one of a kind",
        sentence: "Every snowflake is unique.",
      },
    ],
  },
  {
    text: "multi-",
    type: "prefix",
    meaning: "many",
    description: "Multi- means “many.” To multiply is to make many.",
    origin: "Latin",
    difficulty: "beginner",
    category: "number",
    mnemonic: "Multitasking — doing many tasks.",
    related: ["poly-", "omni-"],
    words: [
      {
        word: "multiple",
        definition: "many",
        sentence: "There are multiple solutions.",
      },
      {
        word: "multiply",
        definition: "to make many",
        sentence: "Multiply five by four.",
      },
      {
        word: "multicultural",
        definition: "of many cultures",
        sentence: "The city is multicultural.",
      },
    ],
  },
  {
    text: "poly-",
    type: "prefix",
    meaning: "many",
    description: "Poly- means “many.” A polygon has many angles.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "number",
    mnemonic: "A polygon — many angles.",
    related: ["multi-", "mono-"],
    words: [
      {
        word: "polygon",
        definition: "a shape with many angles",
        sentence: "A hexagon is a polygon.",
      },
      {
        word: "polyglot",
        definition: "one who speaks many languages",
        sentence: "The polyglot translated at the United Nations.",
      },
      {
        word: "polyester",
        definition: "a synthetic material made of many esters",
        sentence: "The shirt is made of polyester.",
      },
    ],
  },
  {
    text: "semi-",
    type: "prefix",
    meaning: "half",
    description: "Semi- means “half.” A semicircle is half a circle.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "number",
    mnemonic: "A semicircle — half a circle.",
    related: ["bi-", "mono-"],
    words: [
      {
        word: "semicircle",
        definition: "half a circle",
        sentence: "The stage was built as a semicircle.",
      },
      {
        word: "semifinal",
        definition: "the round before the final",
        sentence: "They won the semifinal.",
      },
      {
        word: "semicolon",
        definition: "a punctuation mark — literally “half a colon”",
        sentence: "Use a semicolon between two related clauses.",
      },
    ],
  },
  {
    text: "omni-",
    type: "prefix",
    meaning: "all",
    description: "Omni- means “all.” Omniscient means all-knowing.",
    origin: "Latin",
    difficulty: "intermediate",
    category: "number",
    mnemonic: "An omnivore eats everything.",
    related: ["pan-", "poly-"],
    words: [
      {
        word: "omniscient",
        definition: "all-knowing",
        sentence: "The narrator was omniscient.",
      },
      {
        word: "omnivore",
        definition: "one that eats all kinds of food",
        sentence: "Bears are omnivores.",
      },
      {
        word: "omnipotent",
        definition: "all-powerful",
        sentence: "The dictator seemed omnipotent.",
      },
    ],
  },
  {
    text: "pan-",
    type: "prefix",
    meaning: "all",
    description:
      "Pan- means “all.” A pandemic is a disease affecting all people.",
    origin: "Greek",
    difficulty: "advanced",
    category: "number",
    mnemonic: "A panorama shows all around you.",
    related: ["omni-", "poly-"],
    words: [
      {
        word: "pandemic",
        definition: "a disease affecting all people over a wide area",
        sentence: "The pandemic changed how we travel.",
      },
      {
        word: "panorama",
        definition: "a view of all around",
        sentence: "The panorama showed the whole valley.",
      },
      {
        word: "panacea",
        definition: "a cure for all ills",
        sentence: "Technology is not a panacea.",
      },
    ],
  },
  {
    text: "macro-",
    type: "prefix",
    meaning: "large",
    description:
      "Macro- means “large.” Macroscopic objects are visible without a microscope.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "size",
    mnemonic: "Macroeconomics — the big picture of economies.",
    related: ["micro-"],
    words: [
      {
        word: "macroscopic",
        definition: "visible to the naked eye",
        sentence: "The damage was macroscopic.",
      },
      {
        word: "macroeconomics",
        definition: "the study of large-scale economies",
        sentence: "She teaches macroeconomics.",
      },
      {
        word: "macrocosm",
        definition: "the whole world, as a system",
        sentence: "The novel treats the family as a macrocosm.",
      },
    ],
  },
  {
    text: "micro-",
    type: "prefix",
    meaning: "small",
    description:
      "Micro- means “small.” A microscope makes small things visible.",
    origin: "Greek",
    difficulty: "beginner",
    category: "size",
    mnemonic: "A microscope sees the small.",
    related: ["macro-"],
    words: [
      {
        word: "microscope",
        definition: "an instrument for seeing small things",
        sentence: "The cell was visible under the microscope.",
      },
      {
        word: "microorganism",
        definition: "a tiny organism",
        sentence: "A microorganism caused the infection.",
      },
      {
        word: "microwave",
        definition: "a very short electromagnetic wave",
        sentence: "Heat the soup in the microwave.",
      },
    ],
  },
  {
    text: "bene-/bon-",
    type: "prefix",
    meaning: "good; well",
    description:
      "Bene- and bon- mean “good” or “well.” A benefactor does good for others.",
    origin: "Latin",
    difficulty: "beginner",
    category: "evaluation",
    mnemonic: "Benevolent — wishing well on others.",
    related: ["eu-", "mal-"],
    words: [
      {
        word: "benevolent",
        definition: "kind and generous",
        sentence: "The benevolent donor gave millions.",
      },
      {
        word: "benefit",
        definition: "a good result",
        sentence: "Exercise has many benefits.",
      },
      {
        word: "bonus",
        definition: "something extra good",
        sentence: "The employees received a bonus.",
      },
      {
        word: "benediction",
        definition: "a blessing — a saying of good",
        sentence: "The priest gave a benediction.",
      },
    ],
  },
  {
    text: "eu-",
    type: "prefix",
    meaning: "good; well",
    description:
      "Eu- means “good” or “well.” Euphoria is a feeling of great goodness.",
    origin: "Greek",
    difficulty: "advanced",
    category: "evaluation",
    mnemonic: "Euphoria — feeling good.",
    related: ["bene-/bon-", "mal-"],
    words: [
      {
        word: "euphoria",
        definition: "intense happiness",
        sentence: "Winning the championship brought euphoria.",
      },
      {
        word: "euphemism",
        definition: "a mild, good-sounding word for something harsh",
        sentence: "“Passed away” is a euphemism.",
      },
      {
        word: "eulogy",
        definition: "a speech praising someone's good life",
        sentence: "The eulogy honored her years of service.",
      },
    ],
  },
  {
    text: "auto-",
    type: "prefix",
    meaning: "self",
    description:
      "Auto- means “self.” An automatic machine works by itself.",
    origin: "Greek",
    difficulty: "beginner",
    category: "reference",
    mnemonic: "Autobiography — a life story by oneself.",
    related: ["syn-/sym-"],
    words: [
      {
        word: "automatic",
        definition: "working by itself",
        sentence: "The door opens automatically.",
      },
      {
        word: "autobiography",
        definition: "a life story written by oneself",
        sentence: "She wrote an autobiography.",
      },
      {
        word: "autocrat",
        definition: "a ruler who governs by oneself alone",
        sentence: "The autocrat allowed no opposition.",
      },
    ],
  },
  {
    text: "syn-/sym-",
    type: "prefix",
    meaning: "together; with",
    description:
      "Syn-/sym- mean “together” or “with.” Synonyms go together in meaning.",
    origin: "Greek",
    difficulty: "intermediate",
    category: "reference",
    mnemonic: "Synchronize — set to the same time.",
    related: ["inter-", "auto-"],
    words: [
      {
        word: "synchronize",
        definition: "to make happen at the same time",
        sentence: "Synchronize your watches.",
      },
      {
        word: "synonym",
        definition: "a word with the same meaning",
        sentence: "“Happy” is a synonym of “glad.”",
      },
      {
        word: "sympathy",
        definition: "feeling together with someone",
        sentence: "She offered her sympathy after the loss.",
      },
      {
        word: "synthesis",
        definition: "a putting together of parts",
        sentence: "The essay was a synthesis of many sources.",
      },
    ],
  },
];
