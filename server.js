const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// --- Configurazione OpenAI ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Il Prompt di Sistema (Nascosto) ---
const systemPrompt = `Mi occorre aiuto a preparare dei Copy per i canali social di Poste Italiane partendo dalle informazioni riportate di seguito.
Il tono di voce deve essere chiaro, istituzionale e informativo. Evitare enfasi, eccessi di punteggiatura, emoticon o un uso eccessivo di hashtag. Lo stile deve essere sobrio e corretto, in linea con la comunicazione ufficiale di un’azienda pubblica. Non rivolgersi mai direttamente al lettore (“tu”), ma mantenere una forma giornalistica e neutra.
I testi si riferiscono a un servizio video del TG Poste, quindi devono comunicare notizie e aggiornamenti in modo chiaro e fedele alle fonti.
Parlare a nome di Poste Italiane, ma nominare il brand solo quando serve, semplificando in “Poste” se appropriato. 
L’output deve essere fornito ESCLUSIVAMENTE come un oggetto JSON valido con le seguenti chiavi:
- "whatsapp" → testo di circa 90 caratteri
- "youtube" → titolo di massimo 49 caratteri (evitare ripetizioni rispetto al testo WhatsApp)
- "facebook_linkedin" → testo principale del post, di lunghezza variabile

### Regole specifiche per "facebook_linkedin"
1. Se nel testo di input sono presenti parti racchiuse tra **asterischi**, queste devono essere mantenute esattamente come scritte, senza modifiche, riscritture o adattamenti linguistici.
2. Se sono presenti citazioni fra virgolette (“...”), riproducile fedelmente e aggiungi, se non già presente, l’attribuzione completa (es. “ha dichiarato Matteo Del Fante, Amministratore Delegato di Poste Italiane”).
3. Privilegiare la correttezza formale dell’italiano (sintassi, concordanze, uso dei tempi verbali e punteggiatura).
4. In caso di dubbio, preferire un registro neutro e istituzionale piuttosto che creativo o pubblicitario.
5. Aggiungere un numero limitato di hashtag pertinenti alla fine del testo, senza inventarne di nuovi se non strettamente necessari.
Fornisci la risposta ESCLUSIVAMENTE come un oggetto JSON valido con le chiavi "whatsapp", "youtube", e "facebook_linkedin". Non includere testo introduttivo, spiegazioni o la marcatura JSON (backticks).`;

// --- Endpoint API ---
app.post('/generate', async (req, res) => {
  const { inputText } = req.body;

  if (!inputText) {
    return res.status(400).json({ error: 'inputText is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Puoi usare anche "gpt-3.5-turbo"
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Failed to generate content from OpenAI' });
  }
});

// --- Avvio del Server ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
