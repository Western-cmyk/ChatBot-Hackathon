/**
 * Genera la narracion del video con la voz "alba" del Voice Agent API.
 *
 *   node --env-file=.env.local tools/narrate-video.mjs
 *
 * Cada frase va como `greeting` de una sesion: el greeting se pronuncia tal
 * cual, sin pasar por el LLM, asi que funciona como texto-a-voz exacto.
 * Salida: presentacion/narration/seg_N.wav (carpeta ignorada por git).
 * Costo: ~10 sesiones cortas, unos centavos de credito.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

const KEY = process.env.ASSEMBLYAI_API_KEY;
if (!KEY) { console.error('Falta ASSEMBLYAI_API_KEY (corre con --env-file=.env.local)'); process.exit(1); }
if (typeof WebSocket === 'undefined') { console.error('Necesitas Node 22 o mas nuevo (WebSocket global).'); process.exit(1); }

const VOICE = process.argv[2] || 'alba';
const LINES = [
  "Meet Fluenta. A voice tutor that helps you speak a new language, and waits for you while you find the words.",
  "When you learn a language, you pause to think. A voice agent tuned for fluent speakers hears that pause as the end of your turn, and cuts you off, right before you get it right.",
  "Getting started takes thirty seconds, and it's all by voice. Sabio, our owl tutor, asks which language you speak, what you want to learn, and your level. No forms.",
  "Lessons unlock one at a time, by level. Ana is starting French at A1, so her next lesson is a role play: ordering at a café. She picks a ten-minute class.",
  "Here's the key moment. Ana stops in the middle of a sentence to find a word. For an A1 learner, Fluenta waits up to 1.2 seconds of silence before ending her turn, so she gets to finish. While she talks, new words and gentle corrections appear as cards.",
  "Stuck on the price? One tap, and Sabio switches to Ana's own language, with a native voice, and explains. Then it goes back to French, right where they left off. A voice can't change inside a session, so Fluenta opens a new one, and carries the conversation over.",
  "When the class ends, Ana gets her points, her mission score, and feedback in her own language. Every correction quotes what she actually said. If the model invents a quote, our server throws it out.",
  "Under the hood, the browser streams audio straight to the AssemblyAI Voice Agent API, with a single-use token. Universal 3.5 Pro handles speech recognition. Our small Node server issues the tokens, runs the live coaching, and builds the reports through the LLM Gateway. The API key never reaches the browser, and the audio never touches our server.",
  "Fluenta understands eighteen languages and speaks six. Today it teaches English, Spanish, French and German, with per-session limits that keep costs predictable, for learners and for schools.",
  "Fluenta. Speak before you're ready.",
];

function wav(pcm, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

async function token() {
  const r = await fetch('https://agents.assemblyai.com/v1/token?expires_in_seconds=60&max_session_duration_seconds=90',
    { headers: { Authorization: `Bearer ${KEY}` } });
  if (!r.ok) throw new Error(`token ${r.status}: ${await r.text()}`);
  return (await r.json()).token;
}

function speak(text, tok) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`wss://agents.assemblyai.com/v1/ws?token=${tok}`);
    const chunks = [];
    let quiet = null;
    const finish = () => { clearTimeout(quiet); clearTimeout(limit); try { ws.send(JSON.stringify({ type: 'session.end' })); ws.close(); } catch {} resolve(Buffer.concat(chunks)); };
    const limit = setTimeout(() => chunks.length ? finish() : reject(new Error('sin audio tras 60 s')), 60000);
    ws.onopen = () => ws.send(JSON.stringify({ type: 'session.update', session: {
      system_prompt: 'You are a narrator. Do not say anything beyond your greeting.',
      greeting: text,
      output: { voice: VOICE, format: { encoding: 'audio/pcm', sample_rate: 24000 } },
    } }));
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.type === 'reply.audio') {
        chunks.push(Buffer.from(m.data, 'base64'));
        clearTimeout(quiet); quiet = setTimeout(finish, 2500); // respaldo si no llega reply.done
      } else if (m.type === 'reply.done') finish();
      else if (m.type === 'session.error') { clearTimeout(limit); reject(new Error(m.message || JSON.stringify(m))); }
    };
    ws.onerror = () => { clearTimeout(limit); reject(new Error('fallo el WebSocket')); };
  });
}

mkdirSync('presentacion/narration', { recursive: true });
for (let i = 0; i < LINES.length; i++) {
  const pcm = await speak(LINES[i], await token());
  writeFileSync(`presentacion/narration/seg_${i}.wav`, wav(pcm));
  console.log(`seg_${i}.wav  ${(pcm.length / 48000).toFixed(1)} s`);
}
console.log('Listo. Avisale a Claude para reconstruir el video con esta voz.');
