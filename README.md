# 📮 ArchiSimple Quote Mailer

> Service d'envoi automatique de devis personnalisés par email (API Gmail) suite à la soumission du formulaire ArchiSimple et synchronisation CRM HubSpot.

---

## 🎯 Fonctionnalités

1. **Moteur de Chiffrage Précis (Simulateur SaaS ArchiSimple) :**
   - Calcul des travaux selon la surface et le DPE initial (G, F, E).
   - Prise en compte de la TVA réduite à 5,5% (rénovation énergétique).
   - Calcul automatique des subventions **MaPrimeRénov' 2026** (Parcours Accompagné MAR jusqu'à 28 000 €).
   - Primes CEE (35 €/m²).
   - Reste à charge net garanti.
   - Calcul de l'avantage fiscal **Super Déficit Foncier** (Loi de Finances 2026 : jusqu'à 21 400 € / an déductibles).
   - Attribution automatique de l'architecte agréé MAR local (Olivier Duverdier pour PACA/Marseille, Thomas Roux pour IDF/Paris, Claire Delmas pour ARA/Lyon).
   - Protection 100% via Tiers Séquestre Bancaire ACPR (0 € d'avance artisan).

2. **Template Email Personnalisé & Élégant :**
   - Respect scrupuleux de la Direction Artistique ArchiSimple (`#E60023`, fond crème `#F5F4F0`, typographie soignée).
   - Remplacement dynamique des variables : Nom, Prénom, Ville, Surface, DPE garanti, Montants et Aides.
   - Version HTML responsive pour tous les clients mail (Gmail, Apple Mail, Outlook) + version texte brut de secours.

3. **Intégration API Gmail & Sécurité :**
   - Compatible **OAuth2 Gmail** (`CLIENT_ID`, `CLIENT_SECRET`, `REFRESH_TOKEN`).
   - Compatible **Mot de passe d'application Gmail** (`GMAIL_APP_PASSWORD`).
   - **Mode Fallback & Preview local** automatique si les identifiants ne sont pas encore configurés : génère un fichier `.html` dans `outbox/` pour prévisualisation immédiate dans le navigateur.

---

## 🚀 Installation & Démarrage Rapide

### 1. Cloner et installer les dépendances

```bash
git clone https://github.com/contactkevinmonin-blip/archisimple-quote-mailer.git
cd archisimple-quote-mailer
npm install
```

### 2. Configuration d'environnement (`.env`)

Dupliquez le fichier d'exemple :

```bash
cp .env.example .env
```

Renseignez vos identifiants Gmail :

```env
# Adresse expéditrice
GMAIL_USER=contact.kevinmonin@gmail.com

# OPTION A : Mot de passe d'application (Recommandé, simple et rapide)
# À générer sur https://myaccount.google.com/apppasswords
GMAIL_APP_PASSWORD=votre_code_16_caracteres

# OPTION B : API OAuth2 Google Cloud
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
```

*Note : Si aucun identifiant n'est renseigné, le service fonctionne en mode Aperçu Local sans bloquer.*

### 3. Tester la génération d'un devis

Générez un devis de test complet :
```bash
npm run test-quote
```

Ouvrez le devis HTML généré dans votre navigateur :
```bash
npm run preview
```

### 4. Démarrer le serveur HTTP

```bash
npm start
# ou en mode développement avec rechargement à chaud :
npm run dev
```

Le serveur écoute sur `http://localhost:3005`.

---

## 📡 API Endpoints

### `POST /api/quote`
Reçoit les données du lead issues du formulaire et envoie le devis personnalisé par email.

**Payload JSON :**
```json
{
  "firstname": "Kevin",
  "lastname": "Monin",
  "email": "contact.kevinmonin@gmail.com",
  "phone": "06 12 34 56 78",
  "postalCode": "13006",
  "city": "Marseille",
  "propertyType": "Appartement",
  "surface": 65,
  "occupancyStatus": "loue",
  "dpeRating": "G",
  "projectStageAnswer": "devis_recus"
}
```

**Réponse JSON :**
```json
{
  "success": true,
  "quoteReference": "DEV-2026-894210",
  "client": {
    "fullName": "Kevin Monin",
    "city": "Marseille",
    "surface": 65
  },
  "works": {
    "dpeInitial": "G",
    "dpeTarget": "C",
    "totalWorksTTC": 38400,
    "totalSubventions": 25000,
    "resteACharge": 13400
  },
  "mailResult": {
    "success": true,
    "mode": "gmail-smtp"
  }
}
```

### `GET /preview`
Affiche directement dans le navigateur le dernier devis HTML généré.

### `GET /health`
Vérifie la santé du microservice et si l'API Gmail est connectée.

---

## 🔗 Connexion avec le Formulaire ArchiSimple

Dans le repository du formulaire `renov-confiance-form`, le script `api/submit-lead.js` transmet directement les données à cet endpoint dès que le lead est synchronisé avec HubSpot CRM.

---

## 🛡️ Licence
MIT © ArchiSimple
