if (!window.HealthSaathiAuth?.isAuthenticated()) {
  window.location.href = "login.html";
}

if (window.HealthSaathiAuth?.getCurrentRole?.() !== "doctor") {
  window.location.href = "index.html";
}

const inboxList = document.getElementById("inboxList");
const threadMessages = document.getElementById("threadMessages");
const threadTitle = document.getElementById("threadTitle");
const threadMeta = document.getElementById("threadMeta");
const replyInput = document.getElementById("replyInput");
const sendReplyBtn = document.getElementById("sendReplyBtn");
const refreshInboxBtn = document.getElementById("refreshInboxBtn");
const refreshDocsBtn = document.getElementById("refreshDocsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const editProfileBtn = document.getElementById("editProfileBtn");
const doctorProfileView = document.getElementById("doctorProfileView");
const doctorProfileModal = document.getElementById("doctorProfileModal");
const doctorProfileForm = document.getElementById("doctorProfileForm");
const cancelProfileBtn = document.getElementById("cancelProfileBtn");
const threadDocuments = document.getElementById("threadDocuments");

let doctorInbox = [];
let selectedPatientEmail = "";
let selectedPatientDocuments = [];
let doctorProfile = {
  name: "",
  specialization: "",
  clinic: "",
  phone: "",
  notes: "",
};

function doctorProfileStorageKey() {
  return `healthsaathi_doctor_profile:${window.HealthSaathiAuth.getCurrentUser().toLowerCase()}`;
}

function loadDoctorProfile() {
  const stored = localStorage.getItem(doctorProfileStorageKey());
  doctorProfile = stored
    ? JSON.parse(stored)
    : {
        name: "",
        specialization: "",
        clinic: "",
        phone: "",
        notes: "",
      };
}

function saveDoctorProfile() {
  localStorage.setItem(doctorProfileStorageKey(), JSON.stringify(doctorProfile));
}

function renderDoctorProfile() {
  const email = window.HealthSaathiAuth.getCurrentUser();
  doctorProfileView.innerHTML = `
    <div class="doc-profile-item"><strong>Name</strong><span>${doctorProfile.name || "Not set"}</span></div>
    <div class="doc-profile-item"><strong>Email</strong><span>${email}</span></div>
    <div class="doc-profile-item"><strong>Specialization</strong><span>${doctorProfile.specialization || "Not set"}</span></div>
    <div class="doc-profile-item"><strong>Clinic</strong><span>${doctorProfile.clinic || "Not set"}</span></div>
    <div class="doc-profile-item"><strong>Phone</strong><span>${doctorProfile.phone || "Not set"}</span></div>
    <div class="doc-profile-item"><strong>Notes</strong><span>${doctorProfile.notes || "Not set"}</span></div>
  `;
}

function openProfileModal() {
  document.getElementById("docProfileName").value = doctorProfile.name || "";
  document.getElementById("docProfileSpecialization").value = doctorProfile.specialization || "";
  document.getElementById("docProfileClinic").value = doctorProfile.clinic || "";
  document.getElementById("docProfilePhone").value = doctorProfile.phone || "";
  document.getElementById("docProfileNotes").value = doctorProfile.notes || "";
  doctorProfileModal.style.display = "grid";
}

function closeProfileModal() {
  doctorProfileModal.style.display = "none";
}

function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "x-user-email": window.HealthSaathiAuth.getCurrentUser().toLowerCase(),
    "x-user-role": "doctor",
  };
}

function setIdentity() {
  const email = window.HealthSaathiAuth.getCurrentUser();
  document.getElementById("doctorIdentity").textContent = `Doctor: ${email}`;
}

function setStats() {
  const threadCount = doctorInbox.length;
  const totalMessages = doctorInbox.reduce((sum, item) => sum + Number(item.messageCount || 0), 0);
  const lastActivity = doctorInbox[0]?.lastMessageAt ? new Date(doctorInbox[0].lastMessageAt).toLocaleString() : "-";

  document.getElementById("statThreads").textContent = String(threadCount);
  document.getElementById("statMessages").textContent = String(totalMessages);
  document.getElementById("statUpdated").textContent = lastActivity;
}

async function loadInbox() {
  try {
    const response = await fetch("/api/chat/inbox", { headers: getAuthHeaders() });
    if (!response.ok) {
      doctorInbox = [];
      return;
    }
    doctorInbox = await response.json();
  } catch (_error) {
    doctorInbox = [];
  }

  if (!selectedPatientEmail && doctorInbox[0]?.patientEmail) {
    selectedPatientEmail = doctorInbox[0].patientEmail;
  }

  setStats();
  renderInbox();
}

function renderInbox() {
  if (!doctorInbox.length) {
    inboxList.innerHTML = '<p class="muted">No messages yet.</p>';
    return;
  }

  inboxList.innerHTML = doctorInbox
    .map((item) => {
      const active = selectedPatientEmail === item.patientEmail ? "active" : "";
      const text = String(item.lastMessage || "").slice(0, 88);
      return `
        <button type="button" class="inbox-item ${active}" data-thread="${item.patientEmail}">
          <strong>${item.patientEmail}</strong>
          <p>${item.lastSender || "Patient"}: ${text || "No preview"}</p>
          <p>${item.messageCount || 0} messages</p>
        </button>
      `;
    })
    .join("");

  inboxList.querySelectorAll("[data-thread]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      selectedPatientEmail = String(btn.dataset.thread || "").trim();
      renderInbox();
      await loadThread(selectedPatientEmail);
    });
  });
}

async function loadThread(patientEmail) {
  if (!patientEmail) {
    threadTitle.textContent = "Select a patient thread";
    threadMeta.textContent = "";
    threadMessages.innerHTML = '<p class="muted">No thread selected.</p>';
    selectedPatientDocuments = [];
    renderPatientDocuments();
    return;
  }

  let messages = [];
  try {
    const response = await fetch(`/api/chat?patientEmail=${encodeURIComponent(patientEmail)}`, { headers: getAuthHeaders() });
    if (response.ok) {
      messages = await response.json();
    }
  } catch (_error) {
    messages = [];
  }

  threadTitle.textContent = `Conversation with ${patientEmail}`;
  threadMeta.textContent = `${messages.length} messages`;
  threadMessages.innerHTML = messages.length
    ? messages
        .map((msg) => {
          const klass = String(msg.sender || "").toLowerCase() === "doctor" ? "doctor" : "";
          return `<div class="chat-msg ${klass}"><strong>${msg.sender || "User"}:</strong> ${msg.text || ""}</div>`;
        })
        .join("")
    : '<p class="muted">No messages in this thread yet.</p>';

  threadMessages.scrollTop = threadMessages.scrollHeight;
  await loadPatientDocuments(patientEmail);
}

function renderPatientDocuments() {
  if (!selectedPatientEmail) {
    threadDocuments.innerHTML = '<p class="muted">Select a patient to view documents.</p>';
    return;
  }

  if (!selectedPatientDocuments.length) {
    threadDocuments.innerHTML = '<p class="muted">No documents available for this patient.</p>';
    return;
  }

  threadDocuments.innerHTML = selectedPatientDocuments
    .map((doc) => {
      const summary = String(doc.summary || "").slice(0, 140);
      const precautions = String(doc.precautions || "").slice(0, 140);
      return `
        <div class="doc-list-item">
          <strong>${doc.title || "Document"}</strong>
          <p>${doc.fileName ? `File: ${doc.fileName}` : "No file attached"}</p>
          ${summary ? `<p><strong>Summary:</strong> ${summary}${String(doc.summary || "").length > 140 ? "..." : ""}</p>` : ""}
          ${precautions ? `<p><strong>Precautions:</strong> ${precautions}${String(doc.precautions || "").length > 140 ? "..." : ""}</p>` : ""}
          ${doc.fileData ? `<button class="doc-btn" data-doc-download="${doc.id}">Download</button>` : ""}
        </div>
      `;
    })
    .join("");

  threadDocuments.querySelectorAll("[data-doc-download]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = String(btn.dataset.docDownload || "");
      const doc = selectedPatientDocuments.find((item) => String(item.id) === id);
      if (!doc?.fileData) {
        return;
      }
      const a = document.createElement("a");
      a.href = doc.fileData;
      a.download = doc.fileName || `${doc.title || "document"}.bin`;
      a.click();
    });
  });
}

async function loadPatientDocuments(patientEmail) {
  if (!patientEmail) {
    selectedPatientDocuments = [];
    renderPatientDocuments();
    return;
  }

  try {
    const response = await fetch(`/api/documents?patientEmail=${encodeURIComponent(patientEmail)}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      selectedPatientDocuments = [];
      renderPatientDocuments();
      return;
    }

    selectedPatientDocuments = await response.json();
  } catch (_error) {
    selectedPatientDocuments = [];
  }

  renderPatientDocuments();
}

async function sendReply() {
  const text = String(replyInput.value || "").trim();
  if (!text || !selectedPatientEmail) {
    return;
  }

  await fetch("/api/chat", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      sender: "Doctor",
      text,
      patientEmail: selectedPatientEmail,
      createdAt: new Date().toISOString(),
    }),
  });

  replyInput.value = "";
  await loadThread(selectedPatientEmail);
  await loadInbox();
}

sendReplyBtn?.addEventListener("click", sendReply);
replyInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendReply();
  }
});

refreshInboxBtn?.addEventListener("click", async () => {
  await loadInbox();
  await loadThread(selectedPatientEmail);
});

refreshDocsBtn?.addEventListener("click", async () => {
  await loadPatientDocuments(selectedPatientEmail);
});

logoutBtn?.addEventListener("click", () => {
  window.HealthSaathiAuth.logout();
});

editProfileBtn?.addEventListener("click", openProfileModal);
cancelProfileBtn?.addEventListener("click", closeProfileModal);

doctorProfileForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  doctorProfile = {
    name: String(document.getElementById("docProfileName").value || "").trim(),
    specialization: String(document.getElementById("docProfileSpecialization").value || "").trim(),
    clinic: String(document.getElementById("docProfileClinic").value || "").trim(),
    phone: String(document.getElementById("docProfilePhone").value || "").trim(),
    notes: String(document.getElementById("docProfileNotes").value || "").trim(),
  };

  saveDoctorProfile();
  renderDoctorProfile();
  closeProfileModal();
});

doctorProfileModal?.addEventListener("click", (event) => {
  if (event.target === doctorProfileModal) {
    closeProfileModal();
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  setIdentity();
  loadDoctorProfile();
  renderDoctorProfile();
  renderPatientDocuments();
  await loadInbox();
  await loadThread(selectedPatientEmail);
});
