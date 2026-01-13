# Studio Carla Rapagnà - Sistema di Gestione Dietistica

Sistema web sicuro e multi-tenant per la gestione di pazienti, misurazioni, comunicazioni e documenti da parte della dietista.

## 🚀 Caratteristiche Principali

- **Autenticazione basata su ruoli** (ADMIN/PATIENT)
- **Dashboard paziente** con grafici di andamento peso e composizione corporea
- **Gestione misurazioni** complete (peso, massa grassa, massa magra, acqua %)
- **Hub di messaggistica unificato** (chat interna, email, WhatsApp)
- **Gestione documenti** con upload e download sicuro
- **Selettore paziente globale** per il lavoro continuo su un paziente specifico
- **Responsive design** ottimizzato per desktop e mobile

## 🎯 Ruoli Utente

### ADMIN (Dietista)
- Gestione completa anagrafica pazienti
- Inserimento e visualizzazione misurazioni
- Invio e ricezione messaggi multi-canale
- Upload e gestione documenti per pazienti
- Selettore paziente persistente in header

### PATIENT (Paziente)
- Visualizzazione dashboard personale con grafici
- Accesso storico misurazioni
- Messaggistica con la dietista
- Download documenti personali

## 🛠️ Stack Tecnologico

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v7
- **State Management**: React Context + useKV (Spark Runtime)
- **Icons**: Phosphor Icons
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod

## 📋 Credenziali di Accesso Demo

### Dietista
- Email: `admin@studio.it`
- Password: qualsiasi

### Paziente
- Email: `paziente@esempio.it`
- Password: qualsiasi

## 🧹 Just Exploring?
No problem! If you were just checking things out and don't need to keep this code:

- Simply delete your Spark.
- Everything will be cleaned up — no traces left behind.

📄 License For Spark Template Resources 

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
