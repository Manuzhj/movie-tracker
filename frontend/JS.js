// ───── SIGN IN FORM TOGGLE ─────
document.getElementById("sign-in-link").addEventListener("click", function(event) {
  event.preventDefault();
  document.getElementById("sign-in-form").style.display = "block";
});

document.getElementById("close-form").addEventListener("click", function() {
  document.getElementById("sign-in-form").style.display = "none";
});

// ───── CREATE ACCOUNT FORM TOGGLE ─────
const accountlink  = document.getElementById("accountlink");
const overlay      = document.getElementById("overlay");
const accountform  = document.getElementById("accountform");
const closeform    = document.getElementById("closeform");
const accountbutton = document.getElementById("accountbutton");

accountlink.onclick = function() {
  overlay.style.display = "block";
  accountform.style.display = "block";
};

closeform.onclick = function() {
  overlay.style.display = "none";
  accountform.style.display = "none";
};

accountbutton.onclick = function() {
  overlay.style.display = "block";
  accountform.style.display = "block";
};

// ───── REGISTER ─────
const registerForm = document.querySelector("#accountform form");

registerForm.addEventListener("submit", async function(e) {
  e.preventDefault(); // stop page from refreshing

  const fullname = document.getElementById("fullname").value;
  const email    = document.getElementById("email").value;
  const password = document.querySelector("#accountform [name='password']").value;
  const confirm  = document.getElementById("confirm").value;

  // Check passwords match before even calling the server
  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, email, password })
    });

    const data = await response.json();

    if (response.ok) {
      alert("Account created successfully! You can now sign in.");
      overlay.style.display = "none";
      accountform.style.display = "none";
      registerForm.reset();
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Could not connect to server. Is it running?");
  }
});

// ───── LOGIN ─────
const loginForm = document.querySelector("#sign-in-form form");

loginForm.addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
      // Save user info so other pages know who is logged in
      localStorage.setItem("userId",   data.userId);
      localStorage.setItem("fullname", data.fullname);

      alert("Welcome back, " + data.fullname + "!");
      document.getElementById("sign-in-form").style.display = "none";

      // Show their name in the navbar instead of "SIGN IN"
      document.getElementById("sign-in-link").textContent = data.fullname;
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Could not connect to server. Is it running?");
  }
});

// ───── RESTORE LOGIN STATE ON PAGE LOAD ─────
// If the user was already logged in, show their name
const savedName = localStorage.getItem("fullname");
if (savedName) {
  document.getElementById("sign-in-link").textContent = savedName;
}

// ───── JOURNAL ─────
// Only runs on journal.html
const journalForm = document.getElementById("journal-form");

if (journalForm) {
  // Load existing entries from the server when page opens
  async function loadJournalEntries() {
    try {
      const response = await fetch("http://localhost:3000/api/journal");
      const entries  = await response.json();
      const list     = document.getElementById("journal-entries");
      list.innerHTML = "";

      entries.forEach(entry => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${entry.movieTitle}</strong> (${entry.dateWatched})<br>
          <em>Rating:</em> ${"⭐".repeat(entry.rating)}<br>
          <em>Thoughts:</em> ${entry.thoughts}
        `;
        list.appendChild(li);
      });
    } catch (err) {
      console.log("Could not load journal entries");
    }
  }

  loadJournalEntries();

  // Save new entry to the server
  journalForm.addEventListener("submit", async function(e) {
    e.preventDefault();

    const movieTitle  = document.getElementById("movie-title").value;
    const dateWatched = document.getElementById("date-watched").value;
    const thoughts    = document.getElementById("my-thoughts").value;
    const rating      = document.getElementById("rating").value;

    try {
      const response = await fetch("http://localhost:3000/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieTitle, dateWatched, thoughts, rating })
      });

      const data = await response.json();

      if (response.ok) {
        journalForm.reset();
        loadJournalEntries(); // refresh the list
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Could not connect to server. Is it running?");
    }
  });
}