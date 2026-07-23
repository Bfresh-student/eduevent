/**
 * Event Detail Page Logic
 */

document.addEventListener("DOMContentLoaded", async () => {
  const eventsData = await window.EduUtils.fetchData("data/evenements.json");
  if (!eventsData) return;

  const urlParams = new URLSearchParams(window.location.search);
  const eventId = parseInt(urlParams.get("id"));
  const event = eventsData.find((e) => e.id === eventId);

  if (event) {
    const titleEl = document.getElementById("event-title");
    const catEl = document.getElementById("event-category");
    const dateEl = document.getElementById("event-date");
    const locEl = document.getElementById("event-location");
    const imgEl = document.getElementById("event-image");

    if (titleEl) titleEl.textContent = event.title;
    if (catEl) catEl.textContent = event.categoryLabel;
    if (dateEl) dateEl.textContent = `${event.date} • ${event.time}`;
    if (locEl) locEl.textContent = event.fullLocation;
    if (imgEl) {
      imgEl.src = event.imgUrl;
      imgEl.alt = event.title;
    }
  }

  // ==========================================
  // SEATS MANAGEMENT
  // ==========================================
  const TOTAL_SEATS = event ? event.totalSeats : 50;
  let remainingSeats = event
    ? window.EduUtils.getRemainingSeats(
        event.id,
        event.totalSeats,
        event.remainingSeats,
      )
    : 14;

  const seatsDisplay = document.getElementById("seats-display");
  const seatsProgressBar = document.getElementById("seats-progress-bar");
  const seatsWarning = document.getElementById("seats-warning");

  function updateSeatsUI() {
    if (seatsDisplay && seatsProgressBar) {
      seatsDisplay.textContent = `${remainingSeats} / ${TOTAL_SEATS}`;
      const percentageUsed = (remainingSeats / TOTAL_SEATS) * 100;
      seatsProgressBar.style.width = `${percentageUsed}%`;

      if (remainingSeats === 0) {
        seatsWarning.textContent = "Désolé, cet événement est complet !";
        seatsWarning.style.color = "#94A3B8";
        seatsProgressBar.style.backgroundColor = "#94A3B8";
      } else if (remainingSeats > 10) {
        seatsWarning.style.display = "none";
        seatsProgressBar.style.backgroundColor = "#10B981";
      } else {
        seatsWarning.style.display = "block";
        seatsWarning.style.color = "#EF4444";
        seatsProgressBar.style.backgroundColor = "#EF4444";
      }
    }
  }

  updateSeatsUI();

  const regForm = document.getElementById("event-reg-form");
  const regSuccessAlert = document.getElementById("reg-success");
  const nameInput = document.getElementById("reg-name");
  const emailInput = document.getElementById("reg-email");
  const phoneInput = document.getElementById("reg-phone");

  const currentUser = window.EduUtils.getCurrentUser();

  // Pre-fill fields if user is logged in
  if (currentUser) {
    if (nameInput)
      nameInput.value = `${currentUser.firstname} ${currentUser.lastname}`;
    if (emailInput) emailInput.value = currentUser.email;
  }

  // If already registered, hide form and show alert
  if (currentUser && event) {
    const reservations = window.EduUtils.getReservations();
    const alreadyRegistered = reservations.some(
      (r) =>
        r.eventId === event.id &&
        r.email.toLowerCase() === currentUser.email.toLowerCase(),
    );
    if (alreadyRegistered) {
      if (regForm) regForm.style.display = "none";
      if (regSuccessAlert) {
        regSuccessAlert.style.display = "flex";
        const alertTitle = regSuccessAlert.querySelector("h5");
        const alertText = regSuccessAlert.querySelector("p");
        if (alertTitle) alertTitle.textContent = "Déjà inscrit !";
        if (alertText)
          alertText.textContent =
            "Vous êtes déjà inscrit à cet événement. Vous pouvez retrouver votre billet dans votre profil.";
      }
    }
  }

  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let isFormValid = true;

      if (nameInput.value.trim() === "") {
        window.EduUtils.showError(
          "reg-name",
          "Le nom complet est obligatoire.",
        );
        isFormValid = false;
      } else {
        window.EduUtils.clearError("reg-name");
      }

      if (!window.EduUtils.validateEmail(emailInput.value)) {
        window.EduUtils.showError(
          "reg-email",
          "Saisissez une adresse e-mail valide.",
        );
        isFormValid = false;
      } else {
        // Check if already registered for this event
        const reservations = window.EduUtils.getReservations();
        const alreadyRegistered = reservations.some(
          (r) =>
            r.eventId === eventId &&
            r.email.toLowerCase() === emailInput.value.toLowerCase(),
        );

        if (alreadyRegistered) {
          window.EduUtils.showError(
            "reg-email",
            "Vous êtes déjà inscrit à cet événement.",
          );
          isFormValid = false;
        } else {
          window.EduUtils.clearError("reg-email");
        }
      }

      const phone = phoneInput.value.trim();

      const regex = /^(?:\+509\s?)?[23489]\d{7}$/;

      if (phone !== "" && !regex.test(phone)) {
        window.EduUtils.showError(
          "reg-phone",
          "Saisissez un numéro de téléphone haïtien valide.",
        );
        isFormValid = false;
      } else {
        window.EduUtils.clearError("reg-phone");
      }

      if (isFormValid && remainingSeats > 0) {
        const added = window.EduUtils.addReservation(
          eventId,
          emailInput.value,
          nameInput.value,
          phoneInput.value,
        );
        if (added) {
          remainingSeats = window.EduUtils.getRemainingSeats(
            eventId,
            TOTAL_SEATS,
            event.remainingSeats,
          );
          updateSeatsUI();
          regForm.style.display = "none";
          if (regSuccessAlert) {
            regSuccessAlert.style.display = "flex";
            const alertTitle = regSuccessAlert.querySelector("h5");
            const alertText = regSuccessAlert.querySelector("p");
            if (alertTitle) alertTitle.textContent = "Inscription validée !";
            if (alertText)
              alertText.textContent =
                "Votre place est réservée. Un e-mail contenant votre billet vient d'être envoyé.";
          }
        }
      }
    });
  }

  // ==========================================
  // COMMENTS LOGIC
  // ==========================================
  const commentForm = document.getElementById("comment-form");
  const commentsListContainer = document.getElementById(
    "comments-list-container",
  );
  const commentsCounter = document.getElementById("comments-count");

  const commentsKey = `edu_comments_${eventId}`;
  let comments = JSON.parse(localStorage.getItem(commentsKey) || "[]");

  function renderComments() {
    if (!commentsListContainer) return;

    // Seed initial comments if empty
    if (comments.length === 0) {
      comments = [
        {
          author: "Jane Smith",
          avatar: "JS",
          date: "Il y a 1 jour",
          text: "Merci pour cette opportunité d'apprendre et de réseauter avec des universitaires.",
        },
        {
          author: "John Doe",
          avatar: "JD",
          date: "Il y a 2 heures",
          text: "C'est un événement très intéressant ! J'ai hâte d'assister à la table ronde sur l'intégration de l'IA.",
        },
      ];
      localStorage.setItem(commentsKey, JSON.stringify(comments));
    }

    if (commentsCounter) commentsCounter.textContent = comments.length;

    commentsListContainer.innerHTML = comments
      .map((comment) => {
        const initials =
          comment.avatar ||
          comment.author
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
        return `
        <div class="comment-item">
            <div class="comment-avatar" style="background-color: #0066FF; color: #FFFFFF;">${initials}</div>
            <div class="comment-body">
                <div class="comment-meta">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${comment.date}</span>
                </div>
                <p class="comment-text-content">${window.EduUtils.escapeHTML(comment.text)}</p>
            </div>
        </div>
      `;
      })
      .join("");
  }

  if (commentsListContainer) {
    renderComments();
  }

  if (commentForm && commentsListContainer) {
    commentForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const commentText = document.getElementById("comment-text");

      if (commentText.value.trim() !== "") {
        const authorName = currentUser
          ? `${currentUser.firstname} ${currentUser.lastname}`
          : "Étudiant Invité";
        const authorAvatar = currentUser
          ? `${currentUser.firstname[0]}${currentUser.lastname[0]}`.toUpperCase()
          : "EI";

        const newComment = {
          author: authorName,
          avatar: authorAvatar,
          date: "À l'instant",
          text: commentText.value,
        };

        comments.unshift(newComment);
        localStorage.setItem(commentsKey, JSON.stringify(comments));

        renderComments();
        commentForm.reset();
      }
    });
  }
});
