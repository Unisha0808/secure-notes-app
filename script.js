function addNote() {
  const title = document.getElementById("noteTitle").value.trim();
  const text = document.getElementById("noteText").value.trim();
  const password = document.getElementById("notePassword").value.trim();

  if (!title || !text || !password) {
    alert("Please fill in all fields including password!");
    return;
  }

  const encrypted = CryptoJS.AES.encrypt(text, password).toString();
  const timestamp = new Date().toLocaleTimeString();

  const noteId = Date.now();
  const note = {
    id: noteId,
    title,
    encrypted,
    timestamp
  };

  displayNote(note);
  setTimeout(() => removeNote(noteId), 60000); // Auto-delete after 1 min
}

function displayNote(note) {
  const notesList = document.getElementById("notesList");

  const div = document.createElement("div");
  div.className = "note";
  div.id = `note-${note.id}`;
  div.innerHTML = `
    <h3>${note.title}</h3>
    <p id="enc-${note.id}" style="display:none">${note.encrypted}</p>
    <p><small>Added at: ${note.timestamp}</small></p>
    <button onclick="decryptNote(${note.id})">🔓 Decrypt</button>
    <button onclick="removeNote(${note.id})">🗑️ Delete</button>
    <button onclick='downloadEncryptedPDF(${JSON.stringify(note)})'>📄 Download PDF</button>
  `;

  notesList.prepend(div);
}


function decryptNote(id) {
  const password = prompt("Enter password to decrypt this note:");
  if (!password) return;

  const encryptedText = document.getElementById(`enc-${id}`).innerText;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) throw new Error("Wrong password");

    alert("Decrypted Note:\n\n" + decrypted);
  } catch (e) {
    alert("Invalid password or corrupted note.");
  }
}

function removeNote(id) {
  const noteElement = document.getElementById(`note-${id}`);
  if (noteElement) noteElement.remove();
}

function downloadEncryptedPDF(note) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("courier", "normal");
  doc.setFontSize(14);

  doc.text(`🔐 Secure Encrypted Note`, 20, 20);
  doc.text(`Title: ${note.title}`, 20, 30);
  doc.text(`Timestamp: ${note.timestamp}`, 20, 40);

  const encryptedText = note.encrypted;
  const lines = doc.splitTextToSize(`Encrypted Data:\n${encryptedText}`, 170);
  doc.text(lines, 20, 50);

  const fileName = `${note.title.replace(/[^a-z0-9]/gi, "_")}_note.pdf`;
  doc.save(fileName);
}
