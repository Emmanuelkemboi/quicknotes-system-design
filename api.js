
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const NOTES_LIMIT = 10;

const noteForm = document.querySelector("#note-form");
const titleInput = document.querySelector("#title-input");
const bodyInput = document.querySelector("#body-input");
const submitButton = document.querySelector("#submit-btn");
const loadButton = document.querySelector("#load-btn");
const statusMessage = document.querySelector("#status");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");

let notes = [];
let isLoading = false;
let isCreating = false;
const deletingIds = new Set();

async function request(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: "application/json",
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function setStatus(message, state = "info") {
    statusMessage.textContent = message;
    statusMessage.dataset.state = state;
}

function updateControls() {
    loadButton.disabled = isLoading;
    submitButton.disabled = isCreating;
    loadButton.textContent = isLoading ? "Loading..." : "Load notes";
    submitButton.textContent = isCreating ? "Creating..." : "Create note";
}

function renderNotes() {
    notesList.replaceChildren();
    noteCount.textContent = String(notes.length);

    if (notes.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "empty-state";

        const emptyText = document.createElement("p");
        emptyText.textContent = "No notes to display yet. Load notes or create your first note.";

        emptyItem.append(emptyText);
        notesList.append(emptyItem);
        return;
    }

    for (const note of notes) {
        const item = document.createElement("li");
        item.className = "note-card";

        const heading = document.createElement("h3");
        heading.textContent = note.title || "Untitled note";

        const body = document.createElement("p");
        body.textContent = note.body || "No note content.";

        const actions = document.createElement("div");
        actions.className = "note-actions";

        const identifier = document.createElement("span");
        identifier.className = "note-id";
        identifier.textContent = `Note #${note.id}`;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-button";
        deleteButton.textContent = deletingIds.has(note.id) ? "Deleting..." : "Delete";
        deleteButton.disabled = deletingIds.has(note.id);
        deleteButton.setAttribute("aria-label", `Delete note ${note.title || note.id}`);
        deleteButton.addEventListener("click", () => deleteNote(note.id));

        actions.append(identifier, deleteButton);
        item.append(heading, body, actions);
        notesList.append(item);
    }
}

async function loadNotes() {
    if (isLoading) {
        return;
    }

    isLoading = true;
    updateControls();
    setStatus("Loading notes...");

    try {
        const data = await request(`${API_URL}?_limit=${NOTES_LIMIT}`);

        if (!Array.isArray(data)) {
            throw new Error("The server returned an unexpected response.");
        }

        notes = data;
        renderNotes();

        if (notes.length === 0) {
            setStatus("No notes were found.", "info");
        } else {
            setStatus(`Successfully loaded ${notes.length} notes.`, "success");
        }
    } catch (error) {
        setStatus(`Unable to load notes. ${error.message}`, "error");
    } finally {
        isLoading = false;
        updateControls();
    }
}

async function createNote(event) {
    event.preventDefault();

    if (isCreating) {
        return;
    }

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title || !body) {
        setStatus("Enter both a title and note content.", "error");
        return;
    }

    if (title.length > 100) {
        setStatus("The title must be 100 characters or fewer.", "error");
        titleInput.focus();
        return;
    }

    isCreating = true;
    updateControls();
    setStatus("Creating note...");

    try {
        const createdNote = await request(API_URL, {
            method: "POST",
            body: JSON.stringify({
                title,
                body,
                userId: 1
            })
        });

        notes = [createdNote, ...notes];
        renderNotes();
        noteForm.reset();
        setStatus(`Note created successfully (status 201, ID ${createdNote.id}). JSONPlaceholder simulates creation but does not permanently save new notes.`, "success");
    } catch (error) {
        setStatus(`Unable to create note. ${error.message}`, "error");
    } finally {
        isCreating = false;
        updateControls();
    }
}

async function deleteNote(id) {
    if (deletingIds.has(id)) {
        return;
    }

    deletingIds.add(id);
    renderNotes();
    setStatus("Deleting note...");

    try {
        await request(`${API_URL}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        notes = notes.filter((note) => note.id !== id);
        setStatus(`Note #${id} deleted successfully. JSONPlaceholder simulates deletion but does not permanently change its dataset.`, "success");
    } catch (error) {
        setStatus(`Unable to delete note #${id}. ${error.message}`, "error");
    } finally {
        deletingIds.delete(id);
        renderNotes();
    }
}

loadButton.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);
renderNotes();
