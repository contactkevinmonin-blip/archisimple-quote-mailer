import { calculateRealQuote } from '../simulator.js';
import { generateQuoteEmail } from '../template.js';
import { sendQuoteEmail } from '../mailer.js';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  console.log('🧪 Exécution du test de génération et expédition de devis ArchiSimple...\n');

  const testLead = {
    firstname: 'Kevin',
    lastname: 'Monin',
    email: 'archisimple13@gmail.com',
    phone: '06 12 34 56 78',
    postalCode: '13006',
    city: 'Marseille',
    propertyType: 'Appartement',
    surface: 65,
    occupancyStatus: 'loue',
    dpeRating: 'G',
    projectStageAnswer: 'devis_recus'
  };

  console.log('1. Données du prospect reçues du formulaire :');
  console.log(testLead);

  console.log('\n2. Calcul du devis personnalisé avec le moteur simulateur...');
  const quote = calculateRealQuote(testLead);
  console.log(`✓ Devis calculé : Réf ${quote.quoteReference}`);
  console.log(`  - Surface : ${quote.client.surface} m² · DPE initial : ${quote.works.dpeInitial} ➔ Garanti : ${quote.works.dpeTarget}`);
  console.log(`  - Travaux HT : ${quote.works.totalWorksHT.toLocaleString('fr-FR')} € (TTC : ${quote.works.totalWorksTTC.toLocaleString('fr-FR')} €)`);
  console.log(`  - Subventions Anah & CEE : -${quote.works.totalSubventions.toLocaleString('fr-FR')} €`);
  console.log(`  - Reste à charge net : ${quote.works.resteACharge.toLocaleString('fr-FR')} €`);
  console.log(`  - Super Déficit Foncier : ${quote.works.deficitFoncier.toLocaleString('fr-FR')} € déductibles`);
  console.log(`  - Architecte MAR attribué : ${quote.architect.name} (${quote.architect.city})`);

  console.log('\n3. Génération du template email...');
  const emailContent = generateQuoteEmail(quote);
  console.log(`✓ Email généré : "${emailContent.subject}"`);

  console.log('\n4. Expédition via le module Mailer (Gmail API / fallback preview)...');
  const result = await sendQuoteEmail({
    to: testLead.email,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
    quoteReference: quote.quoteReference
  });

  console.log('\n Résultat :', result);
  console.log(`\n Vous pouvez visualiser le rendu exact en exécutant : npm run preview\n`);
}

run().catch(console.error);
