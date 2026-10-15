import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outboxDir = path.resolve(__dirname, '../../outbox');

if (!fs.existsSync(outboxDir)) {
  console.error('Aucun devis trouvé dans outbox/. Lancez d\'abord : npm run test-quote');
  process.exit(1);
}

const files = fs.readdirSync(outboxDir)
  .filter(f => f.endsWith('.html'))
  .map(f => ({ name: f, time: fs.statSync(path.join(outboxDir, f)).mtime.getTime() }))
  .sort((a, b) => b.time - a.time);

if (!files.length) {
  console.error('Aucun fichier HTML dans outbox/. Lancez d\'abord : npm run test-quote');
  process.exit(1);
}

const latestFile = path.join(outboxDir, files[0].name);
console.log(`Ouverture de l'aperçu du devis : ${latestFile}`);

// Commande open sur macOS
exec(`open "${latestFile}"`, (err) => {
  if (err) {
    console.error('Erreur lors de l\'ouverture du navigateur :', err);
  } else {
    console.log('✓ Aperçu ouvert dans votre navigateur web par défaut.');
  }
});
