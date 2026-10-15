import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { calculateRealQuote } from './simulator.js';
import { generateQuoteEmail } from './template.js';
import { sendQuoteEmail } from './mailer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Endpoint Santé
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'archisimple-quote-mailer',
    gmailConfigured: Boolean(process.env.GMAIL_USER && (process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_CLIENT_ID)),
    timestamp: new Date().toISOString()
  });
});

// 2. Endpoint Principal : Réception du Lead, Calcul Devis & Envoi Email Client
app.post('/api/quote', async (req, res) => {
  try {
    const leadData = req.body;

    if (!leadData || !leadData.email) {
      return res.status(400).json({
        success: false,
        error: 'Adresse email obligatoire pour transmettre le devis.'
      });
    }

    console.log(`[SERVER] Nouveau lead reçu pour devis : ${leadData.firstname} ${leadData.lastname} (${leadData.email}) · ${leadData.city}`);

    // Étape 1 : Calcul du devis réel selon le simulateur
    const quote = calculateRealQuote(leadData);

    // Étape 2 : Génération de l'email HTML & texte
    const emailContent = generateQuoteEmail(quote);

    // Étape 3 : Expédition via l'API Gmail ou Sauvegarde Preview
    const mailResult = await sendQuoteEmail({
      to: leadData.email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      quoteReference: quote.quoteReference
    });

    return res.status(200).json({
      success: true,
      quoteReference: quote.quoteReference,
      client: quote.client,
      works: quote.works,
      architect: quote.architect,
      mailResult
    });

  } catch (error) {
    console.error('[SERVER] Erreur traitement devis :', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erreur interne lors de la génération du devis'
    });
  }
});

// 3. Endpoint pour voir le dernier devis généré dans le navigateur
app.get('/preview', (req, res) => {
  const outboxDir = path.resolve(__dirname, '../outbox');
  if (!fs.existsSync(outboxDir)) {
    return res.status(404).send('Aucun devis généré pour le moment.');
  }

  const files = fs.readdirSync(outboxDir)
    .filter(f => f.endsWith('.html'))
    .map(f => ({ name: f, time: fs.statSync(path.join(outboxDir, f)).mtime.getTime() }))
    .sort((a, b) => b.time - a.time);

  if (!files.length) {
    return res.status(404).send('Aucun devis trouvé dans outbox/.');
  }

  const latestFile = path.join(outboxDir, files[0].name);
  const html = fs.readFileSync(latestFile, 'utf8');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Démarrage du serveur si exécuté directement
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ArchiSimple Quote Mailer démarré sur http://localhost:${PORT}`);
    console.log(`   - Endpoint Devis : POST http://localhost:${PORT}/api/quote`);
    console.log(`   - Prévisualisation HTML : GET http://localhost:${PORT}/preview`);
    console.log(`   - Statut Santé : GET http://localhost:${PORT}/health`);
    console.log(`======================================================\n`);
  });
}

export default app;
