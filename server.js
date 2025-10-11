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
const systemPrompt = `Mi occorre aiuto a preparare dei Copy per i canali social di Poste Italiane partendo dalle informazioni riportate di seguito. Il tono di voce deve essere chiaro e istituzionale, senza enfasi e senza eccessi di emoticons, hashtag o punti esclamativi. Lo stile deve essere semplice ed informativo, senza enfasi. Dobbiamo parlare a nome di Poste Italiane, ma dobbiamo nominare il brand quando serve, semplificando in “Poste” se necessario od opportuno. Lo stile NON deve essere pubblicitario e quindi non dobbiamo dare del tu al lettore, ma solo creare una news. Considera che il Copy si associa ad un servizio giornalistico video realizzato in house da Poste Italiane per il TG Poste. I testi che mi occorrono sono per vari usi e quindi cambiano le lunghezze dei testi che saranno sempre indicative. L'output deve essere un oggetto JSON.
1) Testo per whatsapp -> lunghezza circa 90 caratteri
2) Titolo per Youtube -> lunghezza massima 49 caratteri (evitare più possibile ripetizioni rispetto a whatsapp)
3) Testo per Facebook e per Linkedin -> non ci sono limitazioni particolari: meglio essere concisi, ma non telegrafici. Aggiungere qualche hastag.
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
