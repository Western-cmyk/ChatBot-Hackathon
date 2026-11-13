# Educa

Clases de inglés en línea con un tutor de IA por voz, 15 minutos al día.
(Antes se llamaba Fluenta.)

Tutor de idiomas por voz. Practicas conversación en inglés, francés, alemán o
español con un tutor que te habla, **te espera mientras buscas la palabra**, y
cambia a tu idioma cuando te atoras.

Construido sobre el [Voice Agent API](https://www.assemblyai.com/docs/voice-agents/voice-agent-api)
y el [LLM Gateway](https://www.assemblyai.com/docs/llm-gateway/quickstart) de AssemblyAI.

## Lo que lo hace distinto

- **Paciencia por nivel.** Un principiante hace pausas largas buscando la
  palabra. El tutor le da a un A1 más del triple de silencio antes de
  contestar que a un C1, para no cortarlo justo cuando iba a acertar.
- **Ayuda en tu idioma.** Con un botón, el tutor cambia a la voz de tu idioma
  nativo, te explica, y regresa a la clase donde iban.
- **Retroalimentación que no inventa.** Al terminar, un reporte con tus
  correcciones. Cada corrección cita algo que de verdad dijiste; el servidor
  descarta las que no.

## Qué incluye

- **Conversación con IA que te corrige en el momento**, con mapa de progreso por nivel.
- **Mini-lecciones de pronunciación** (`/pronunciation`): videos animados de ~1 minuto
  con los sonidos del inglés que más cuestan a quien habla español. Al final repites
  las palabras y el reconocimiento de voz del navegador te dice si se entendió.
- **Juego de vocabulario** (`/games/:curso`): parejas contra reloj con los mazos de flashcards.
- **Preparación para certificación**: simulacros orales de TOEFL, Duolingo English Test,
  Cambridge B2 First, DELE, DELF y Goethe, más un examen de nivel (A1 a C1).
- **Plan Gratis y plan Estudiante (MXN 99 al mes)** en `/plans`. Es un prototipo:
  no se cobra nada, la prueba de 7 días solo cambia el plan guardado en el navegador.
- **15 minutos al día**: duración por defecto de cada clase y meta diaria en el panel.

## Correrlo

```bash
npm install
cp .env.example .env.local   # y pon tu ASSEMBLYAI_API_KEY
npm run dev                  # http://localhost:3000
```

Documentación técnica completa: [`docs/voz-y-backend.md`](docs/voz-y-backend.md).
