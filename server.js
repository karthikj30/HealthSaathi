require("dotenv").config();
const dns = require("dns");
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const axios = require("axios");
const { Pool } = require("pg");

// Supabase hosts may resolve to IPv6 first; prefer IPv4 in environments without IPv6 routing.
dns.setDefaultResultOrder("ipv4first");

const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;
const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;
const OCR_API_KEY = process.env.OCR_API_KEY;
const ASSEMBLYAI_BASE_URL = "https://api.assemblyai.com";
const OCR_SPACE_BASE_URL = "https://api.ocr.space/parse/image";

if (!DATABASE_URL) {
  console.error("Missing DATABASE_URL in environment variables.");
}

try {
  if (DATABASE_URL) {
    new URL(DATABASE_URL);
  }
} catch (_error) {
  console.error("Invalid DATABASE_URL format. Ensure password characters are URL-encoded (for example @ as %40).");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Required for Supabase
});

pool.query(`
CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT,
  payload TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  summary TEXT,
  precautions TEXT,
  extracted_text TEXT,
  file_name TEXT,
  file_mime TEXT,
  file_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS calendar_entries (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date DATE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  doctor_email TEXT,
  sender TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS qa_answers (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  session_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY(user_email) REFERENCES users(email) ON DELETE CASCADE,
  UNIQUE(user_email, session_id, question_id)
);

CREATE TABLE IF NOT EXISTS family_members (
  id SERIAL PRIMARY KEY,
  owner_email TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relation TEXT,
  is_app_user BOOLEAN DEFAULT FALSE,
  invite_sent BOOLEAN DEFAULT FALSE,
  invite_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY(owner_email) REFERENCES users(email) ON DELETE CASCADE
);

ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_mime TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_data TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS precautions TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS doctor_email TEXT;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS is_app_user BOOLEAN DEFAULT FALSE;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS invite_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS invite_message TEXT;
ALTER TABLE family_members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
`).catch(err => console.error('Table creation error:', err));

app.use(express.json({ limit: "25mb" }));
app.use(express.static(__dirname, { index: 'landing.html' }));

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function getAuthUser(req, res, next) {
  const email = String(req.header("x-user-email") || "").trim().toLowerCase();
  const roleHeader = String(req.header("x-user-role") || "patient").trim().toLowerCase();

  if (!email) {
    return res.status(401).json({ error: "Missing auth user" });
  }

  pool.query('SELECT email, role FROM users WHERE email = $1', [email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Unknown user" });
    }

    req.authUser = {
      email,
      role: roleHeader === "doctor" ? "doctor" : user.role,
    };

    next();
  });
}

function getScopedEmail(req, bodyField = "patientEmail") {
  if (req.authUser.role !== "doctor") {
    return req.authUser.email;
  }

  const fromQuery = String(req.query?.patientEmail || "").trim().toLowerCase();
  const fromBody = String(req.body?.[bodyField] || "").trim().toLowerCase();
  return fromQuery || fromBody || req.authUser.email;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "healthsaathi-api" });
});

function decodeAudioPayload(audioBase64) {
  const encoded = String(audioBase64 || "").trim();
  const clean = encoded.includes(",") ? encoded.split(",").pop() : encoded;
  return Buffer.from(clean, "base64");
}

function decodeDataUrlPayload(dataUrl) {
  const source = String(dataUrl || "").trim();
  const match = source.match(/^data:([^;,]+)?(;base64)?,(.*)$/i);
  if (!match) {
    return { mimeType: "application/octet-stream", buffer: Buffer.from(source, "base64") };
  }

  const mimeType = (match[1] || "application/octet-stream").toLowerCase();
  const payload = match[3] || "";
  const isBase64 = !!match[2];

  return {
    mimeType,
    buffer: isBase64 ? Buffer.from(payload, "base64") : Buffer.from(decodeURIComponent(payload), "utf8"),
  };
}

function simplifyDocumentLanguage(text) {
  const glossary = {
    abdominal: "stomach area",
    anemia: "low blood count",
    bilirubin: "liver waste marker",
    cholesterol: "blood fat",
    creatinine: "kidney function marker",
    edema: "swelling",
    elevated: "higher than usual",
    hemoglobin: "blood oxygen protein",
    hypertension: "high blood pressure",
    inflammation: "swelling or irritation",
    lesion: "abnormal spot",
    platelet: "blood-clotting cell",
    radiology: "scan imaging",
    triglycerides: "blood fat",
    urinalysis: "urine test",
  };

  let simplified = String(text || "");
  Object.entries(glossary).forEach(([medical, plain]) => {
    const regex = new RegExp(`\\b${medical}\\b`, "gi");
    simplified = simplified.replace(regex, plain);
  });

  return simplified.replace(/\s+/g, " ").trim();
}

function splitDocumentSentences(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .match(/[^.!?]+[.!?]?/g) || [];
}

function buildDocumentPrecautions(text) {
  const lower = String(text || "").toLowerCase();
  const precautions = [];
  const add = (item) => {
    if (!precautions.includes(item)) {
      precautions.push(item);
    }
  };

  if (/(shortness of breath|chest pain|faint|stroke|seizure)/.test(lower)) {
    add("This looks urgent. Seek immediate medical care if symptoms are severe or worsening.");
  }
  if (/(fever|infection|culture|antibiotic|pus)/.test(lower)) {
    add("Watch for persistent fever, spreading redness, or worsening infection signs and follow the full medicine course.");
  }
  if (/(glucose|blood sugar|diabetes|hba1c|sugar)/.test(lower)) {
    add("Keep blood sugar under control with the diet and medicines recommended by your clinician.");
  }
  if (/(blood pressure|hypertension|bp\b)/.test(lower)) {
    add("Check blood pressure regularly and avoid extra salt unless your doctor advises otherwise.");
  }
  if (/(hemoglobin|anemia|iron)/.test(lower)) {
    add("Discuss low blood count follow-up and iron-rich food only if your doctor recommends it.");
  }
  if (/(cholesterol|triglyceride|lipid)/.test(lower)) {
    add("Stay consistent with diet, movement, and follow-up for lipid results.");
  }
  if (/(creatinine|urea|kidney|renal)/.test(lower)) {
    add("Review kidney-function results with your doctor and follow fluid advice carefully.");
  }
  if (/(liver|sgot|sgpt|alt|ast|bilirubin)/.test(lower)) {
    add("Avoid alcohol and confirm liver-related medicines with a clinician.");
  }

  add("Bring this report to your next appointment and follow only the advice of a qualified clinician.");
  return precautions;
}

function buildDocumentAnalysis(text, fileName) {
  const cleanedText = String(text || "").replace(/\s+/g, " ").trim();
  const sentenceSample = splitDocumentSentences(cleanedText).slice(0, 3).join(" ");
  const simplified = simplifyDocumentLanguage(sentenceSample || cleanedText.slice(0, 400));
  const precautions = buildDocumentPrecautions(cleanedText);

  return {
    summary: simplified || `No readable text was extracted from ${fileName || "this document"}.`,
    precautions: precautions.join(" "),
    extractedText: cleanedText.slice(0, 12000),
  };
}

async function extractTextWithOCRSpace({ fileData, fileName, fileMime }) {
  if (!OCR_API_KEY) {
    throw new Error("Missing OCR_API_KEY in environment variables.");
  }

  const { mimeType, buffer } = decodeDataUrlPayload(fileData);
  const effectiveMime = (fileMime || mimeType || "").toLowerCase();
  const effectiveName = String(fileName || "document");

  if (effectiveMime.startsWith("text/")) {
    return buffer.toString("utf8");
  }

  const payloadBase64 = `data:${effectiveMime || "application/octet-stream"};base64,${buffer.toString("base64")}`;
  const params = new URLSearchParams();
  params.set("apikey", OCR_API_KEY);
  params.set("language", "eng");
  params.set("isOverlayRequired", "false");
  params.set("OCREngine", "2");
  params.set("filetype", path.extname(effectiveName).replace(".", "") || "jpg");
  params.set("base64Image", payloadBase64);

  const response = await axios.post(OCR_SPACE_BASE_URL, params.toString(), {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    timeout: 90000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const parsedResults = Array.isArray(response?.data?.ParsedResults) ? response.data.ParsedResults : [];
  const text = parsedResults
    .map((item) => String(item?.ParsedText || "").trim())
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    const message = response?.data?.ErrorMessage || response?.data?.ErrorDetails || "No OCR text extracted";
    throw new Error(Array.isArray(message) ? message.join("; ") : String(message));
  }

  return text;
}

async function transcribeWithAssemblyAI(audioBuffer, mimeType) {
  if (!ASSEMBLYAI_API_KEY) {
    throw new Error("Missing ASSEMBLYAI_API_KEY in environment variables.");
  }

  const uploadResponse = await axios.post(`${ASSEMBLYAI_BASE_URL}/v2/upload`, audioBuffer, {
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      "content-type": mimeType || "application/octet-stream",
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const transcriptResponse = await axios.post(
    `${ASSEMBLYAI_BASE_URL}/v2/transcript`,
    {
      audio_url: uploadResponse.data.upload_url,
      language_detection: true,
      speech_models: ["universal-3-pro", "universal-2"],
    },
    {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        "content-type": "application/json",
      },
    }
  );

  const transcriptId = transcriptResponse.data.id;
  const pollingEndpoint = `${ASSEMBLYAI_BASE_URL}/v2/transcript/${transcriptId}`;
  const deadline = Date.now() + 90000;

  while (Date.now() < deadline) {
    const pollingResponse = await axios.get(pollingEndpoint, {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
    });

    const transcriptionResult = pollingResponse.data;
    if (transcriptionResult.status === "completed") {
      return transcriptionResult.text || "";
    }

    if (transcriptionResult.status === "error") {
      throw new Error(`Transcription failed: ${transcriptionResult.error || "Unknown error"}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error("Transcription timed out");
}

app.post("/api/voice/transcribe", getAuthUser, async (req, res) => {
  try {
    const audioBase64 = String(req.body?.audioBase64 || "").trim();
    const mimeType = String(req.body?.mimeType || "audio/webm").trim();

    if (!audioBase64) {
      return res.status(400).json({ error: "Audio payload is required" });
    }

    const audioBuffer = decodeAudioPayload(audioBase64);
    if (!audioBuffer.length) {
      return res.status(400).json({ error: "Invalid audio payload" });
    }

    const text = await transcribeWithAssemblyAI(audioBuffer, mimeType);
    return res.json({ ok: true, text });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to transcribe audio" });
  }
});

app.post("/api/documents/analyze", getAuthUser, async (req, res) => {
  try {
    const fileData = String(req.body?.fileData || "").trim();
    const fileName = String(req.body?.fileName || "document").trim();
    const fileMime = String(req.body?.fileMime || "").trim();

    if (!fileData) {
      return res.status(400).json({ error: "File payload is required" });
    }

    const extractedText = await extractTextWithOCRSpace({ fileData, fileName, fileMime });
    const analysis = buildDocumentAnalysis(extractedText, fileName);
    return res.json({ ok: true, provider: "ocr-space", ...analysis });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unable to analyze document" });
  }
});

app.get("/api/doctors", getAuthUser, (req, res) => {
  pool.query(
    "SELECT email FROM users WHERE role = 'doctor' ORDER BY email ASC",
    [],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      const doctors = result.rows.map((row) => ({ email: row.email }));
      return res.json(doctors);
    }
  );
});

app.post("/api/auth/register", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const role = String(req.body?.role || "patient").trim().toLowerCase() === "doctor" ? "doctor" : "patient";

  console.log(`[auth] register attempt email=${email} role=${role}`);

  if (!email || !password) {
    console.warn("[auth] register failed: missing email/password");
    return res.status(400).json({ error: "Email and password are required" });
  }

  const passwordHash = hashPassword(password);

  pool.query('SELECT email FROM users WHERE email = $1', [email], (err, result) => {
    if (err) {
      console.error("[auth] register DB lookup error", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.rows.length > 0) {
      console.warn(`[auth] register failed: email already exists ${email}`);
      return res.status(409).json({ error: "Email already registered" });
    }

    pool.query('INSERT INTO users (email, role, password_hash) VALUES ($1, $2, $3)', [email, role, passwordHash], (insertErr) => {
      if (insertErr) {
        console.error("[auth] register insert error", insertErr);
        return res.status(500).json({ error: "Database error" });
      }
      console.log(`[auth] register success email=${email}`);
      return res.json({ ok: true, user: { email, role } });
    });
  });
});

app.post("/api/auth/login", (req, res) => {
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const role = String(req.body?.role || "patient").trim().toLowerCase() === "doctor" ? "doctor" : "patient";

  console.log(`[auth] login attempt email=${email} role=${role}`);

  if (!email || !password) {
    console.warn("[auth] login failed: missing email/password");
    return res.status(400).json({ error: "Email and password are required" });
  }

  const passwordHash = hashPassword(password);

  pool.query('SELECT email, role, password_hash FROM users WHERE email = $1', [email], (err, result) => {
    if (err) {
      console.error("[auth] login DB lookup error", err);
      return res.status(500).json({ error: "Database error" });
    }

    const existing = result.rows[0];
    if (!existing) {
      console.warn(`[auth] login failed: email not found ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (existing.password_hash !== passwordHash) {
      console.warn(`[auth] login failed: invalid password ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (existing.role !== role) {
      pool.query('UPDATE users SET role = $1 WHERE email = $2', [role, email], (updateErr) => {
        if (updateErr) {
          console.error("[auth] login role update error", updateErr);
          return res.status(500).json({ error: "Database error" });
        }
        console.log(`[auth] login success email=${email} role updated ${role}`);
        return res.json({ ok: true, user: { email, role } });
      });
    } else {
      console.log(`[auth] login success email=${email}`);
      return res.json({ ok: true, user: { email, role } });
    }
  });
});

app.get("/api/reports", getAuthUser, (req, res) => {
  pool.query("SELECT id, title, payload, created_at FROM reports WHERE user_email = $1 ORDER BY created_at DESC", [req.authUser.email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    const reports = result.rows.map((row) => ({
      id: row.id,
      createdAt: row.created_at.toISOString(),
      ...JSON.parse(row.payload),
      title: row.title || JSON.parse(row.payload).title || "Consultation summary",
    }));

    res.json(reports);
  });
});

app.post("/api/reports", getAuthUser, (req, res) => {
  const report = req.body;
  if (!report || typeof report !== "object") {
    return res.status(400).json({ error: "Invalid report payload" });
  }

  const createdAt = report.createdAt || new Date().toISOString();
  const title = report.title || "Consultation summary";

  pool.query('INSERT INTO reports (user_email, title, payload, created_at) VALUES ($1, $2, $3, $4) RETURNING id', 
    [req.authUser.email, title, JSON.stringify({ ...report, createdAt, title }), createdAt], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ ok: true, id: result.rows[0].id });
  });
});

app.delete("/api/reports/:id", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  pool.query('DELETE FROM reports WHERE id = $1 AND user_email = $2', [id, req.authUser.email], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(204).end();
  });
});

app.get("/api/documents", getAuthUser, (req, res) => {
  const requestedPatientEmail = String(req.query?.patientEmail || "").trim().toLowerCase();

  if (req.authUser.role === "doctor") {
    if (!requestedPatientEmail) {
      return res.json([]);
    }

    pool.query(
      "SELECT 1 FROM chat_messages WHERE doctor_email = $1 AND user_email = $2 LIMIT 1",
      [req.authUser.email, requestedPatientEmail],
      (chatErr, chatResult) => {
        if (chatErr) {
          return res.status(500).json({ error: "Database error" });
        }

        if (!chatResult.rows.length) {
          return res.status(403).json({ error: "No access to this patient documents" });
        }

        pool.query(
          "SELECT id, title, notes, summary, precautions, extracted_text, file_name, file_mime, file_data, created_at FROM documents WHERE user_email = $1 ORDER BY created_at DESC",
          [requestedPatientEmail],
          (err, result) => {
            if (err) {
              return res.status(500).json({ error: "Database error" });
            }
            const docs = result.rows.map((row) => ({
              id: row.id,
              title: row.title,
              notes: row.notes,
              summary: row.summary,
              precautions: row.precautions,
              extractedText: row.extracted_text,
              fileName: row.file_name,
              fileMime: row.file_mime,
              fileData: row.file_data,
              createdAt: row.created_at.toISOString(),
            }));
            return res.json(docs);
          }
        );
      }
    );

    return;
  }

  pool.query("SELECT id, title, notes, summary, precautions, extracted_text, file_name, file_mime, file_data, created_at FROM documents WHERE user_email = $1 ORDER BY created_at DESC", [req.authUser.email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    const docs = result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      notes: row.notes,
      summary: row.summary,
      precautions: row.precautions,
      extractedText: row.extracted_text,
      fileName: row.file_name,
      fileMime: row.file_mime,
      fileData: row.file_data,
      createdAt: row.created_at.toISOString(),
    }));
    res.json(docs);
  });
});

app.post("/api/documents", getAuthUser, (req, res) => {
  const title = String(req.body?.title || "").trim();
  const notes = String(req.body?.notes || "").trim();
  const summary = String(req.body?.summary || "").trim();
  const precautions = String(req.body?.precautions || "").trim();
  const extractedText = String(req.body?.extractedText || "").trim();
  const fileName = String(req.body?.fileName || "").trim();
  const fileMime = String(req.body?.fileMime || "").trim();
  const fileData = String(req.body?.fileData || "").trim();
  const createdAt = req.body?.createdAt || new Date().toISOString();

  if (!title && !fileName) {
    return res.status(400).json({ error: "Title or file is required" });
  }

  if (fileData && fileData.length > 6_000_000) {
    return res.status(413).json({ error: "File is too large. Keep uploads under ~4MB." });
  }

  const resolvedTitle = title || fileName || "Untitled document";

  pool.query('INSERT INTO documents (user_email, title, notes, summary, precautions, extracted_text, file_name, file_mime, file_data, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id', 
    [req.authUser.email, resolvedTitle, notes || "No notes", summary || null, precautions || null, extractedText || null, fileName || null, fileMime || null, fileData || null, createdAt], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ ok: true, id: result.rows[0].id });
  });
});

app.delete("/api/documents/:id", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  pool.query('DELETE FROM documents WHERE id = $1 AND user_email = $2', [id, req.authUser.email], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(204).end();
  });
});

app.get("/api/calendar", getAuthUser, (req, res) => {
  pool.query("SELECT id, date, note, created_at FROM calendar_entries WHERE user_email = $1 ORDER BY date ASC", [req.authUser.email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    const visits = result.rows.map((row) => ({
      id: row.id,
      date: row.date,
      note: row.note,
      createdAt: row.created_at.toISOString(),
    }));
    res.json(visits);
  });
});

app.post("/api/calendar", getAuthUser, (req, res) => {
  const date = String(req.body?.date || "").trim();
  const note = String(req.body?.note || "").trim();
  const createdAt = req.body?.createdAt || new Date().toISOString();

  if (!date || !note) {
    return res.status(400).json({ error: "Date and note are required" });
  }

  pool.query('INSERT INTO calendar_entries (user_email, date, note, created_at) VALUES ($1, $2, $3, $4) RETURNING id', 
    [req.authUser.email, date, note, createdAt], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ ok: true, id: result.rows[0].id });
  });
});

app.delete("/api/calendar/:id", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  pool.query('DELETE FROM calendar_entries WHERE id = $1 AND user_email = $2', [id, req.authUser.email], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(204).end();
  });
});

app.get("/api/chat", getAuthUser, (req, res) => {
  const targetPatientEmail = String(req.query?.patientEmail || "").trim().toLowerCase();
  const targetDoctorEmail = String(req.query?.doctorEmail || "").trim().toLowerCase();

  let query = "SELECT id, sender, text, doctor_email, created_at FROM chat_messages WHERE 1=1";
  const params = [];

  if (req.authUser.role === "doctor") {
    if (targetPatientEmail) {
      query += " AND user_email = $1 AND doctor_email = $2";
      params.push(targetPatientEmail, req.authUser.email);
    } else {
      query += " AND doctor_email = $1";
      params.push(req.authUser.email);
    }
  } else {
    query += " AND user_email = $1";
    params.push(req.authUser.email);
    if (targetDoctorEmail) {
      query += " AND doctor_email = $2";
      params.push(targetDoctorEmail);
    }
  }

  query += " ORDER BY created_at ASC";

  pool.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    const messages = result.rows.map((row) => ({
      id: row.id,
      sender: row.sender,
      text: row.text,
      doctorEmail: row.doctor_email,
      createdAt: row.created_at.toISOString(),
    }));
    res.json(messages);
  });
});

app.post("/api/chat", getAuthUser, (req, res) => {
  const sender = String(req.body?.sender || "Patient").trim() || "Patient";
  const text = String(req.body?.text || "").trim();
  const createdAt = req.body?.createdAt || new Date().toISOString();
  const targetPatientEmail = String(req.body?.patientEmail || req.query?.patientEmail || "").trim().toLowerCase();
  const targetDoctorEmail = String(req.body?.doctorEmail || req.query?.doctorEmail || "").trim().toLowerCase();
  const doctorEmail = req.authUser.role === "doctor" ? req.authUser.email : targetDoctorEmail;

  if (!text) {
    return res.status(400).json({ error: "Message text is required" });
  }

  if (req.authUser.role !== "doctor" && !doctorEmail) {
    return res.status(400).json({ error: "Select a doctor first" });
  }

  if (req.authUser.role === "doctor" && !targetPatientEmail) {
    return res.status(400).json({ error: "Select a patient thread first" });
  }

  const targetUserEmail = req.authUser.role === "doctor" ? targetPatientEmail : req.authUser.email;

  pool.query("INSERT INTO chat_messages (user_email, doctor_email, sender, text, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id", [targetUserEmail, doctorEmail || null, sender, text, createdAt], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ ok: true, id: result.rows[0].id });
  });
});

app.get("/api/chat/inbox", getAuthUser, (req, res) => {
  if (req.authUser.role !== "doctor") {
    return res.status(403).json({ error: "Doctor access required" });
  }

  const query = `
    SELECT
      user_email,
      MAX(created_at) AS last_message_at,
      (ARRAY_AGG(text ORDER BY created_at DESC))[1] AS last_message,
      (ARRAY_AGG(sender ORDER BY created_at DESC))[1] AS last_sender,
      COUNT(*) AS message_count
    FROM chat_messages
    WHERE doctor_email = $1
    GROUP BY user_email
    ORDER BY MAX(created_at) DESC
  `;

  pool.query(query, [req.authUser.email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    const inbox = result.rows.map((row) => ({
      patientEmail: row.user_email,
      lastMessage: row.last_message,
      lastSender: row.last_sender,
      messageCount: Number(row.message_count || 0),
      lastMessageAt: row.last_message_at ? new Date(row.last_message_at).toISOString() : null,
    }));

    return res.json(inbox);
  });
});

app.delete("/api/chat/:id", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  pool.query("DELETE FROM chat_messages WHERE id = $1 AND user_email = $2", [id, req.authUser.email], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ success: true });
  });
});

app.get("/api/qa_answers", getAuthUser, (req, res) => {
  const sessionId = req.query.sessionId;
  let query = "SELECT question_id, answer, timestamp FROM qa_answers WHERE user_email = $1";
  let params = [req.authUser.email];
  
  if (sessionId) {
    query += " AND session_id = $2";
    params.push(sessionId);
  }
  
  query += " ORDER BY timestamp DESC";
  
  pool.query(query, params, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    const answers = {};
    result.rows.forEach(row => {
      answers[row.question_id] = row.answer;
    });
    res.json(answers);
  });
});

app.post("/api/qa_answers", getAuthUser, (req, res) => {
  const sessionId = String(req.body?.sessionId || "").trim();
  const questionId = String(req.body?.questionId || "").trim();
  const answer = String(req.body?.answer || "").trim();
  
  if (!sessionId || !questionId) {
    return res.status(400).json({ error: "Session ID and question ID are required" });
  }
  
  pool.query('INSERT INTO qa_answers (user_email, session_id, question_id, answer) VALUES ($1, $2, $3, $4) ON CONFLICT (user_email, session_id, question_id) DO UPDATE SET answer = EXCLUDED.answer, timestamp = NOW()', 
    [req.authUser.email, sessionId, questionId, answer], (err) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    res.status(201).json({ ok: true });
  });
});

app.get("/api/family-members", getAuthUser, (req, res) => {
  pool.query(
    "SELECT id, name, email, phone, relation, is_app_user, invite_sent, invite_message, created_at, updated_at FROM family_members WHERE owner_email = $1 ORDER BY created_at DESC",
    [req.authUser.email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      const members = result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        relation: row.relation,
        isAppUser: row.is_app_user,
        inviteSent: row.invite_sent,
        inviteMessage: row.invite_message,
        createdAt: row.created_at.toISOString(),
        updatedAt: row.updated_at?.toISOString?.() || row.created_at.toISOString(),
      }));
      return res.json(members);
    }
  );
});

app.post("/api/family-members", getAuthUser, (req, res) => {
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const phone = String(req.body?.phone || "").trim();
  const relation = String(req.body?.relation || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Family member name is required" });
  }

  const inviteMessage = email
    ? `You are listed as a family member for ${req.authUser.email}. Register in HealthSaathi to view reports, prescriptions, and shared health updates.`
    : null;

  const saveMember = (isAppUser) => {
    pool.query(
      "INSERT INTO family_members (owner_email, name, email, phone, relation, is_app_user, invite_sent, invite_message, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id, is_app_user, invite_sent, invite_message",
      [req.authUser.email, name, email || null, phone || null, relation || null, isAppUser, !isAppUser && Boolean(email), inviteMessage],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }
        return res.status(201).json({
          ok: true,
          id: result.rows[0].id,
          isAppUser: result.rows[0].is_app_user,
          inviteSent: result.rows[0].invite_sent,
          inviteMessage: result.rows[0].invite_message,
        });
      }
    );
  };

  if (!email) {
    return saveMember(false);
  }

  pool.query("SELECT email FROM users WHERE email = $1", [email], (lookupErr, lookupResult) => {
    if (lookupErr) {
      return res.status(500).json({ error: "Database error" });
    }
    return saveMember(lookupResult.rows.length > 0);
  });
});

app.put("/api/family-members/:id", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const phone = String(req.body?.phone || "").trim();
  const relation = String(req.body?.relation || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Family member name is required" });
  }

  const inviteMessage = email
    ? `You are listed as a family member for ${req.authUser.email}. Register in HealthSaathi to view reports, prescriptions, and shared health updates.`
    : null;

  const updateMember = (isAppUser) => {
    pool.query(
      "UPDATE family_members SET name = $1, email = $2, phone = $3, relation = $4, is_app_user = $5, invite_sent = $6, invite_message = $7, updated_at = NOW() WHERE id = $8 AND owner_email = $9 RETURNING id, is_app_user, invite_sent, invite_message",
      [name, email || null, phone || null, relation || null, isAppUser, !isAppUser && Boolean(email), inviteMessage, id, req.authUser.email],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }
        if (!result.rows[0]) {
          return res.status(404).json({ error: "Family member not found" });
        }
        return res.json({
          ok: true,
          id: result.rows[0].id,
          isAppUser: result.rows[0].is_app_user,
          inviteSent: result.rows[0].invite_sent,
          inviteMessage: result.rows[0].invite_message,
        });
      }
    );
  };

  if (!email) {
    return updateMember(false);
  }

  pool.query("SELECT email FROM users WHERE email = $1", [email], (lookupErr, lookupResult) => {
    if (lookupErr) {
      return res.status(500).json({ error: "Database error" });
    }
    return updateMember(lookupResult.rows.length > 0);
  });
});

app.post("/api/family-members/:id/invite", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  pool.query(
    "SELECT id, name, email, invite_message, is_app_user FROM family_members WHERE id = $1 AND owner_email = $2",
    [id, req.authUser.email],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      const member = result.rows[0];
      if (!member) {
        return res.status(404).json({ error: "Family member not found" });
      }

      if (member.is_app_user) {
        return res.json({ ok: true, alreadyRegistered: true });
      }

      const inviteMessage = member.invite_message || `You are listed as a family member for ${req.authUser.email}. Register in HealthSaathi to view reports, prescriptions, and shared health updates.`;
      pool.query(
        "UPDATE family_members SET invite_sent = TRUE, invite_message = $1, updated_at = NOW() WHERE id = $2 AND owner_email = $3",
        [inviteMessage, id, req.authUser.email],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: "Database error" });
          }
          return res.json({
            ok: true,
            inviteMessage,
            mailto: `mailto:${member.email || ""}?subject=${encodeURIComponent("Register on HealthSaathi")}&body=${encodeURIComponent(inviteMessage)}`,
          });
        }
      );
    }
  );
});

app.delete("/api/family-members/:id", getAuthUser, (req, res) => {
  const id = Number(req.params.id);
  pool.query(
    "DELETE FROM family_members WHERE id = $1 AND owner_email = $2",
    [id, req.authUser.email],
    (err) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }
      return res.status(204).end();
    }
  );
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "landing.html"));
});

// Listen on all environments (Render sets NODE_ENV=production but still needs a running server)
// Only skip if explicitly running in a serverless context (e.g. Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`HealthSaathi server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
