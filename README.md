# HealthSaathi

HealthSaathi is a patient pre-consultation assistant with a frontend (HTML/CSS/JS) and a Node.js backend (Express + PostgreSQL).

It helps patients capture complete symptom context, generate a doctor-ready report, share only what they want with family, and keep continuity across visits.

## Key Features

### 1) Intake and Context Collection

- Step-based guided intake flow with progress bar.
- Symptom timeline tracking with start, intensity, and trend events.
- Pain intensity slider, pain type examples, and body-map pain marker (different for male/female).
- Lifestyle-aware capture: sleep, stress, hydration, junk-food frequency, physical activity.
- Dynamic follow-up Q&A generated from symptom and severity context.
- Fear and nervousness notes to reduce missed details during consultation.

### 2) Smart Clinical Support

- Smart Pattern Detection: flags repeated symptoms from report history and likely triggers.
- Urgency Detection: rule-based alerts including immediate-consultation recommendations for risky patterns.
- Menstrual Cycle Insight: estimates cycle timing and correlates with abdominal pain (for females only).
- Food-pattern preliminary hints for common trigger patterns.
- Medical jargon simplification for easy patient understanding.
- Pre-consultation completeness score to improve input quality.

### 3) Reports and Doctor-Facing Output

- Auto structured patient report generation.
- Doctor quick summary for fast clinical review.
- Visit checklist to guide consultation talking points.
- Export and sharing tools: download, copy, email.

### 4) Family, Caregiver, and Communication

- Family visibility with privacy controls (hide all, share all, share specific members).
- Elder caregiver symptom input support with family member details.
- Family shared view for symptoms and ongoing medications.
- Doctor connection actions (email, call, WhatsApp).
- Doctor-patient chat persisted in database.

### 5) Records, Continuity, and Accessibility

- Prescription and medical document keeper persisted in SQLite.
- Doctor visit calendar timeline with dashboard view.
- Voice input powered by AssemblyAI transcription for reliable dictation.
- Multi-language UI switching (English, Hindi, Spanish).
- Offline mode with service-worker caching.

### 6) Backend and Database

- Express API for authentication and user-scoped data operations.
- PostgreSQL database (cloud-hosted via Supabase) with tables for:
  - users
  - reports
  - documents
  - calendar entries
  - chat messages
- Role-based login (patient/doctor) with signup page.

## Scope Notes

- Visual analysis is first-aid guidance only (rule-based), not clinical image diagnosis.
- Chat, documents, calendar, and report history are database-backed.
- This project does not replace emergency or professional medical care.

## Run Locally

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL database (local or cloud)

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Add `ASSEMBLYAI_API_KEY` for voice transcription
   - For Supabase: `DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres`

4. Start the backend server:
   ```bash
   npm start
   ```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

### Cloud Database Setup (Supabase)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database and copy the connection string
4. Update your `.env` file with the Supabase DATABASE_URL

### Backend Deployment
Deploy the Node.js app to platforms like:
- **Heroku**: Connect GitHub repo, set environment variables
- **Render**: Free tier available, set DATABASE_URL env var
- **Vercel**: For serverless deployment

### Frontend Deployment
The static files can be deployed to:
- **GitHub Pages**: For free static hosting
- **Netlify**: Connect repo for automatic deployments
- **Vercel**: Same as backend

### Environment Variables
```
DATABASE_URL=postgresql://username:password@host:5432/database
PORT=3000
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
OCR_API_KEY=your_ocr_api_key
```

## Disclaimer

HealthSaathi supports preparation and communication. It is not a diagnostic system and is not a substitute for licensed medical advice.
