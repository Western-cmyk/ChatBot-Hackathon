import type { Gloss, Theme } from './flashcards/types';

/**
 * Simulaciones: Sabio actúa un papel (barista, recepcionista, entrevistador…)
 * y el alumno cumple una misión en el idioma que aprende.
 *
 * `role`, `studentRole`, `situation` y `goals[].prompt` van en inglés porque
 * son instrucciones para el modelo; lo que ve el alumno está en `title`,
 * `description` y `goals[].label`.
 */
export interface Scenario {
  id: string;
  emoji: string;
  /** Mazo de flashcards que acompaña la simulación. */
  theme: Theme;
  /** Nivel sugerido (se puede practicar en cualquier nivel). */
  level: 'A1' | 'A2' | 'B1' | 'B2';
  /**
   * Simulacro de certificación: nombre del examen. Sabio hace de examinador.
   * Sin `exam` es una simulación de la vida real.
   */
  exam?: string;
  /** Cursos donde aparece (ids de idioma). Sin lista: en todos. */
  languages?: string[];
  title: Gloss;
  description: Gloss;
  role: string;
  studentRole: string;
  situation: string;
  goals: { prompt: string; label: Gloss }[];
  /** Primera frase del personaje, por idioma de voz. */
  greeting: Record<string, string>;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'cafe',
    emoji: '☕',
    theme: 'food',
    level: 'A1',
    title: { es: 'Pedir un café', en: 'Order a coffee' },
    description: { es: 'Eres cliente en una cafetería.', en: "You're a customer at a café." },
    role: 'a friendly barista at Café Luna',
    studentRole: 'a customer',
    situation: 'The student walks up to the counter of a small café in the morning.',
    goals: [
      { prompt: 'order a drink', label: { es: 'Pide una bebida', en: 'Order a drink' } },
      { prompt: 'choose a size or order something to eat', label: { es: 'Elige el tamaño o algo de comer', en: 'Choose a size or something to eat' } },
      { prompt: 'ask how much it costs and pay', label: { es: 'Pregunta el precio y paga', en: 'Ask the price and pay' } },
    ],
    greeting: {
      en: 'Hi! Welcome to Café Luna. What can I get you?',
      es: '¡Hola! Bienvenido a Café Luna. ¿Qué te pongo?',
      fr: "Bonjour ! Bienvenue au Café Luna. Qu'est-ce que je vous sers ?",
      de: 'Hallo! Willkommen im Café Luna. Was darf es sein?',
    },
  },
  {
    id: 'restaurant',
    emoji: '🍽️',
    theme: 'food',
    level: 'A2',
    title: { es: 'Reservar en un restaurante', en: 'Book a restaurant' },
    description: { es: 'Llamas por teléfono para reservar una mesa.', en: 'You call to book a table.' },
    role: 'the host answering the phone at the restaurant La Terraza',
    studentRole: 'a customer calling to make a reservation',
    situation: 'A phone call to a busy restaurant. Tables are available but you must ask for the details.',
    goals: [
      { prompt: 'ask for a table for a specific day and time', label: { es: 'Pide mesa para un día y hora', en: 'Ask for a table on a day and time' } },
      { prompt: 'say how many people are coming', label: { es: 'Di cuántas personas van', en: 'Say how many people are coming' } },
      { prompt: 'give a name for the booking or make a special request', label: { es: 'Da tu nombre o una petición especial', en: 'Give your name or a special request' } },
    ],
    greeting: {
      en: 'Good evening, La Terraza restaurant. How can I help you?',
      es: 'Buenas tardes, restaurante La Terraza. ¿En qué puedo ayudarle?',
      fr: 'Bonsoir, restaurant La Terrasse, je vous écoute.',
      de: 'Guten Abend, Restaurant Die Terrasse. Was kann ich für Sie tun?',
    },
  },
  {
    id: 'hotel',
    emoji: '🏨',
    theme: 'travel',
    level: 'A2',
    title: { es: 'Registrarte en un hotel', en: 'Check in at a hotel' },
    description: { es: 'Llegas a la recepción del hotel.', en: 'You arrive at the hotel front desk.' },
    role: 'a receptionist at the Hotel Central',
    studentRole: 'a guest who has a reservation',
    situation: 'The student arrives at the front desk with luggage after a long trip.',
    goals: [
      { prompt: 'check in and give the name of the reservation', label: { es: 'Haz el check-in con tu reserva', en: 'Check in with your reservation' } },
      { prompt: 'ask about breakfast (time or place)', label: { es: 'Pregunta por el desayuno', en: 'Ask about breakfast' } },
      { prompt: 'ask for the wifi password or another service', label: { es: 'Pide el wifi u otro servicio', en: 'Ask for the wifi or another service' } },
    ],
    greeting: {
      en: 'Good afternoon and welcome to the Hotel Central. Do you have a reservation?',
      es: 'Buenas tardes, bienvenido al Hotel Central. ¿Tiene una reserva?',
      fr: "Bonjour et bienvenue à l'Hôtel Central. Vous avez une réservation ?",
      de: 'Guten Tag und willkommen im Hotel Central. Haben Sie eine Reservierung?',
    },
  },
  {
    id: 'directions',
    emoji: '🗺️',
    theme: 'city',
    level: 'A1',
    title: { es: 'Pedir direcciones', en: 'Ask for directions' },
    description: { es: 'Estás perdido en una ciudad nueva.', en: "You're lost in a new city." },
    role: 'a friendly local on the street',
    studentRole: 'a lost tourist',
    situation: 'The student is lost downtown and wants to reach the train station, about ten minutes away on foot.',
    goals: [
      { prompt: 'ask how to get to the train station', label: { es: 'Pregunta cómo llegar a la estación', en: 'Ask how to get to the station' } },
      { prompt: 'ask how far it is or how long it takes', label: { es: 'Pregunta qué tan lejos está', en: 'Ask how far it is' } },
      { prompt: 'thank the person and say goodbye', label: { es: 'Da las gracias y despídete', en: 'Say thanks and goodbye' } },
    ],
    greeting: {
      en: 'Hi! You look a little lost. Can I help you?',
      es: '¡Hola! Pareces un poco perdido. ¿Te ayudo?',
      fr: "Bonjour ! Vous avez l'air un peu perdu. Je peux vous aider ?",
      de: 'Hallo! Sie sehen etwas verloren aus. Kann ich Ihnen helfen?',
    },
  },
  {
    id: 'shopping',
    emoji: '👕',
    theme: 'shopping',
    level: 'A1',
    title: { es: 'Comprar ropa', en: 'Buy clothes' },
    description: { es: 'Buscas algo en una tienda de ropa.', en: "You're shopping for clothes." },
    role: 'a shop assistant in a clothing store',
    studentRole: 'a customer',
    situation: 'The student enters a clothing store looking for something to buy.',
    goals: [
      { prompt: 'ask for a piece of clothing in their size', label: { es: 'Pide una prenda en tu talla', en: 'Ask for an item in your size' } },
      { prompt: 'ask the price', label: { es: 'Pregunta el precio', en: 'Ask the price' } },
      { prompt: 'decide to buy it or not and say why', label: { es: 'Decide si lo compras', en: 'Decide whether to buy it' } },
    ],
    greeting: {
      en: 'Hello! Are you looking for anything in particular?',
      es: '¡Hola! ¿Buscas algo en especial?',
      fr: 'Bonjour ! Vous cherchez quelque chose en particulier ?',
      de: 'Hallo! Suchen Sie etwas Bestimmtes?',
    },
  },
  {
    id: 'doctor',
    emoji: '🩺',
    theme: 'health',
    level: 'A2',
    title: { es: 'Ir al médico', en: 'See a doctor' },
    description: { es: 'Le cuentas al médico cómo te sientes.', en: 'You tell the doctor how you feel.' },
    role: 'a kind family doctor',
    studentRole: 'a patient who feels unwell',
    situation: 'A short visit to the doctor for a common illness (a cold, a headache or a stomach ache).',
    goals: [
      { prompt: 'describe the symptoms', label: { es: 'Describe tus síntomas', en: 'Describe your symptoms' } },
      { prompt: 'say since when they feel this way', label: { es: 'Di desde cuándo te sientes así', en: 'Say since when' } },
      { prompt: 'ask what to do or what medicine to take', label: { es: 'Pregunta qué hacer o qué tomar', en: 'Ask what to do or take' } },
    ],
    greeting: {
      en: 'Good morning, come in and have a seat. What brings you here today?',
      es: 'Buenos días, pase y siéntese. ¿Qué le trae por aquí?',
      fr: "Bonjour, entrez et asseyez-vous. Qu'est-ce qui vous amène aujourd'hui ?",
      de: 'Guten Morgen, kommen Sie herein und setzen Sie sich. Was führt Sie heute zu mir?',
    },
  },
  {
    id: 'interview',
    emoji: '💼',
    theme: 'work',
    level: 'B1',
    title: { es: 'Entrevista de trabajo', en: 'Job interview' },
    description: { es: 'Te entrevistan para un puesto nuevo.', en: "You're interviewed for a new job." },
    role: 'a hiring manager interviewing a candidate',
    studentRole: 'a job candidate',
    situation: 'A job interview for a position the student chooses (if they do not say, assume an office job).',
    goals: [
      { prompt: 'introduce themselves and describe their experience', label: { es: 'Preséntate y cuenta tu experiencia', en: 'Introduce yourself and your experience' } },
      { prompt: 'explain why they want the job', label: { es: 'Explica por qué quieres el puesto', en: 'Explain why you want the job' } },
      { prompt: 'ask the interviewer a question about the job', label: { es: 'Haz una pregunta sobre el puesto', en: 'Ask a question about the job' } },
    ],
    greeting: {
      en: 'Good morning, thanks for coming in. Please, tell me a little about yourself.',
      es: 'Buenos días, gracias por venir. Cuénteme un poco sobre usted.',
      fr: "Bonjour, merci d'être venu. Parlez-moi un peu de vous.",
      de: 'Guten Morgen, danke, dass Sie gekommen sind. Erzählen Sie mir bitte etwas über sich.',
    },
  },
  {
    id: 'party',
    emoji: '🎉',
    theme: 'greetings',
    level: 'A1',
    title: { es: 'Conocer gente en una fiesta', en: 'Meet people at a party' },
    description: { es: 'Conversas con alguien nuevo.', en: 'You chat with someone new.' },
    role: 'Alex, a friendly guest at a birthday party',
    studentRole: 'another guest',
    situation: 'Both of you are at a friend’s birthday party and have just met.',
    goals: [
      { prompt: 'introduce themselves', label: { es: 'Preséntate', en: 'Introduce yourself' } },
      { prompt: 'ask where the other person is from', label: { es: 'Pregunta de dónde es', en: 'Ask where they are from' } },
      { prompt: 'talk about their hobbies', label: { es: 'Habla de tus pasatiempos', en: 'Talk about your hobbies' } },
    ],
    greeting: {
      en: "Hey! I don't think we've met. I'm Alex!",
      es: '¡Hola! Creo que no nos conocemos. ¡Soy Álex!',
      fr: "Salut ! Je crois qu'on ne se connaît pas. Moi, c'est Alex !",
      de: 'Hallo! Ich glaube, wir kennen uns noch nicht. Ich bin Alex!',
    },
  },
  // ---------------------------------------------------------- certificación
  {
    id: 'placement',
    emoji: '📊',
    theme: 'greetings',
    level: 'A1',
    exam: 'CEFR',
    title: { es: '¿Qué nivel tengo? (A1 a C1)', en: "What's my level? (A1 to C1)" },
    description: {
      es: 'Examen corto de nivel: las preguntas se van haciendo más difíciles.',
      en: 'A short level test: the questions get harder as you go.',
    },
    role: "a friendly placement examiner who finds the student's CEFR level",
    studentRole: 'a student taking a placement test',
    situation:
      'Start with very easy questions (A1) and make each new question a bit harder (A2, B1, B2, C1) while the student answers well. If they struggle twice, stay at that level. When the mission is done, tell them their estimated CEFR level and one thing to improve.',
    goals: [
      { prompt: 'introduce themselves', label: { es: 'Preséntate', en: 'Introduce yourself' } },
      { prompt: 'talk about something they did in the past', label: { es: 'Cuenta algo que hiciste en el pasado', en: 'Talk about something you did in the past' } },
      { prompt: 'give an opinion and explain why', label: { es: 'Da una opinión y explica por qué', en: 'Give an opinion and explain why' } },
    ],
    greeting: {
      en: "Hi! Let's find your level. Easy start: what's your name, and where are you from?",
      es: '¡Hola! Vamos a ver tu nivel. Empecemos fácil: ¿cómo te llamas y de dónde eres?',
      fr: "Bonjour ! On va trouver ton niveau. Pour commencer : comment tu t'appelles et d'où viens-tu ?",
      de: 'Hallo! Wir finden jetzt dein Niveau. Zum Start: Wie heißt du und woher kommst du?',
    },
  },
  {
    id: 'toefl',
    emoji: '🎓',
    theme: 'feelings',
    level: 'B2',
    exam: 'TOEFL iBT',
    languages: ['en'],
    title: { es: 'TOEFL: pregunta de opinión', en: 'TOEFL: opinion question' },
    description: {
      es: 'Contesta como en la sección de Speaking del TOEFL y recibe una calificación de 0 a 4.',
      en: 'Answer like in the TOEFL Speaking section and get a score from 0 to 4.',
    },
    role: 'a TOEFL iBT Speaking examiner running a practice independent speaking task',
    studentRole: 'a test taker preparing for the TOEFL',
    situation:
      'Ask ONE independent speaking question at a time about personal preferences (for example studying alone or in a group, living in a city or in the countryside). After each answer, give a score from 0 to 4 with one concrete tip, like a TOEFL rater, then ask the next question.',
    goals: [
      { prompt: 'state a clear opinion', label: { es: 'Da una opinión clara', en: 'State a clear opinion' } },
      { prompt: 'give at least two reasons', label: { es: 'Da al menos dos razones', en: 'Give at least two reasons' } },
      { prompt: 'support a reason with a specific personal example', label: { es: 'Apoya una razón con un ejemplo personal', en: 'Support a reason with a personal example' } },
    ],
    greeting: {
      en: 'Welcome to your TOEFL speaking practice. First question: do you prefer to study alone or in a group? Why?',
    },
  },
  {
    id: 'duolingo-test',
    emoji: '📝',
    theme: 'leisure',
    level: 'B1',
    exam: 'Duolingo English Test',
    languages: ['en'],
    title: { es: 'Duolingo English Test: habla de un tema', en: 'Duolingo English Test: speak about a topic' },
    description: {
      es: 'Habla de 30 a 60 segundos sobre un tema, como en el examen.',
      en: 'Speak for 30 to 60 seconds about a topic, like in the test.',
    },
    role: 'a Duolingo English Test practice coach giving "speak about the topic" tasks',
    studentRole: 'a test taker preparing for the Duolingo English Test',
    situation:
      'Give ONE short speaking prompt at a time (for example: describe a place you love to visit, talk about a skill you want to learn). Let the student speak for 30 to 60 seconds without interrupting. Then give brief feedback on fluency and vocabulary, and the next prompt.',
    goals: [
      { prompt: 'describe the situation with details (who, where, when)', label: { es: 'Describe con detalles (quién, dónde, cuándo)', en: 'Describe it with details (who, where, when)' } },
      { prompt: 'explain why it matters to them', label: { es: 'Explica por qué es importante para ti', en: 'Explain why it matters to you' } },
      { prompt: 'use a connector like because, however or for example', label: { es: 'Usa un conector: because, however, for example', en: 'Use a connector: because, however, for example' } },
    ],
    greeting: {
      en: "Let's practice for the Duolingo English Test. Talk about a place you love to visit. You have one minute.",
    },
  },
  {
    id: 'cambridge-b2',
    emoji: '🗣️',
    theme: 'discourse',
    level: 'B2',
    exam: 'Cambridge B2 First',
    languages: ['en'],
    title: { es: 'Cambridge B2 First: entrevista', en: 'Cambridge B2 First: interview' },
    description: {
      es: 'Partes 1 y 3 del Speaking: preguntas personales y una discusión.',
      en: 'Speaking Parts 1 and 3: personal questions and a discussion.',
    },
    role: 'a Cambridge B2 First Speaking examiner (the interlocutor)',
    studentRole: 'a candidate taking the B2 First Speaking test',
    situation:
      'Run Part 1 (short personal questions about home, studies and free time), then Part 3 (a question with two options; ask the candidate to compare them and choose one). Ask ONE question at a time.',
    goals: [
      { prompt: 'answer a personal question with details, not just yes or no', label: { es: 'Responde una pregunta personal con detalles', en: 'Answer a personal question with details' } },
      { prompt: 'compare two options and choose one', label: { es: 'Compara dos opciones y elige una', en: 'Compare two options and choose one' } },
      { prompt: 'agree or disagree politely, or ask the examiner a follow-up question', label: { es: 'Da tu acuerdo o desacuerdo con cortesía', en: 'Agree or disagree politely' } },
    ],
    greeting: {
      en: 'Good afternoon. Can you tell me your name and where you are from?',
    },
  },
  {
    id: 'dele-b1',
    emoji: '🇪🇸',
    theme: 'travel',
    level: 'B1',
    exam: 'DELE B1',
    languages: ['es'],
    title: { es: 'DELE B1: expresión oral', en: 'DELE B1: speaking' },
    description: {
      es: 'Presenta un tema y responde las preguntas del examinador.',
      en: "Present a topic and answer the examiner's questions.",
    },
    role: 'a DELE B1 oral exam examiner (Instituto Cervantes)',
    studentRole: 'a candidate taking the DELE B1 oral exam',
    situation:
      'The candidate talks about a topic (for example their ideal holiday) for about two minutes, then you ask follow-up questions. Ask ONE question at a time.',
    goals: [
      { prompt: 'present the topic in an organized way', label: { es: 'Presenta el tema con orden', en: 'Present the topic in an organized way' } },
      { prompt: 'answer a follow-up question with details', label: { es: 'Responde una pregunta con detalles', en: 'Answer a follow-up question with details' } },
      { prompt: 'talk about a past experience', label: { es: 'Cuenta una experiencia pasada', en: 'Talk about a past experience' } },
    ],
    greeting: {
      es: '¡Bienvenido al examen oral del DELE B1! Háblame de tus vacaciones ideales: ¿adónde irías y por qué?',
    },
  },
  {
    id: 'delf-b1',
    emoji: '🇫🇷',
    theme: 'feelings',
    level: 'B1',
    exam: 'DELF B1',
    languages: ['fr'],
    title: { es: 'DELF B1: producción oral', en: 'DELF B1: speaking' },
    description: {
      es: 'Preséntate y defiende un punto de vista, como en el DELF.',
      en: 'Introduce yourself and defend a point of view, like in the DELF.',
    },
    role: 'a DELF B1 oral exam examiner',
    studentRole: 'a candidate taking the DELF B1 oral exam',
    situation:
      'Part 1: a short guided interview about the candidate. Part 3: give a short opinion topic and ask the candidate to defend a point of view. Ask ONE question at a time.',
    goals: [
      { prompt: 'introduce themselves (studies, hobbies, plans)', label: { es: 'Preséntate (estudios, pasatiempos, planes)', en: 'Introduce yourself (studies, hobbies, plans)' } },
      { prompt: 'defend a point of view with arguments', label: { es: 'Defiende un punto de vista con argumentos', en: 'Defend a point of view with arguments' } },
      { prompt: "react to the examiner's question with an example", label: { es: 'Responde al examinador con un ejemplo', en: 'Answer the examiner with an example' } },
    ],
    greeting: {
      fr: "Bienvenue à l'épreuve orale du DELF B1. Pour commencer, présentez-vous : vos études, vos loisirs, vos projets.",
    },
  },
  {
    id: 'goethe-b1',
    emoji: '🇩🇪',
    theme: 'leisure',
    level: 'B1',
    exam: 'Goethe-Zertifikat B1',
    languages: ['de'],
    title: { es: 'Goethe-Zertifikat B1: Sprechen', en: 'Goethe-Zertifikat B1: speaking' },
    description: {
      es: 'Planea algo con el examinador y da tu opinión, como en el examen.',
      en: 'Plan something with the examiner and give your opinion, like in the test.',
    },
    role: 'a Goethe-Zertifikat B1 speaking examiner',
    studentRole: 'a candidate taking the Goethe-Zertifikat B1 speaking test',
    situation:
      'Part 1: plan something together (for example a trip or a party for a friend). Part 3: ask for the candidate\'s opinion on a simple topic. Ask ONE question at a time.',
    goals: [
      { prompt: 'introduce themselves', label: { es: 'Preséntate', en: 'Introduce yourself' } },
      { prompt: 'plan something together with the examiner (agree on a day or an idea)', label: { es: 'Planea algo con el examinador', en: 'Plan something with the examiner' } },
      { prompt: 'give an opinion with a reason', label: { es: 'Da tu opinión con una razón', en: 'Give your opinion with a reason' } },
    ],
    greeting: {
      de: 'Willkommen zur mündlichen Prüfung Goethe-Zertifikat B1. Stellen Sie sich bitte kurz vor.',
    },
  },
];


/** Simulaciones de la vida real (sin examen). */
export const ROLE_PLAYS = SCENARIOS.filter((s) => !s.exam);

/** Simulacros de certificación disponibles para un curso. */
export function examsFor(languageId: string): Scenario[] {
  return SCENARIOS.filter((s) => s.exam && (!s.languages || s.languages.includes(languageId)));
}

/** El examen de nivel es gratis; los demás simulacros son del plan Estudiante. */
export const FREE_EXAMS = ['placement'];

export function getScenario(id: string | undefined): Scenario | null {
  return SCENARIOS.find((s) => s.id === id) ?? null;
}

/** XP de una simulación: base + extra por cada objetivo cumplido. */
export const SCENARIO_BASE_XP = 10;
export const SCENARIO_GOAL_XP = 5;
