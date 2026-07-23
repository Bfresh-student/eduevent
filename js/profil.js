/**
 * Profile and Authentication Page Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  const defaultAvatarUrl =
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80";

  // ==========================================
  // 1. TAB SELECTION (LOGIN/REGISTER)
  // ==========================================
  const tabLoginBtn = document.getElementById("tab-login-btn");
  const tabRegisterBtn = document.getElementById("tab-register-btn");
  const loginFormWrapper = document.getElementById("login-form-wrapper");
  const registerFormWrapper = document.getElementById("register-form-wrapper");

  if (tabLoginBtn && tabRegisterBtn) {
    tabLoginBtn.addEventListener("click", () => {
      tabLoginBtn.classList.add("active");
      tabRegisterBtn.classList.remove("active");
      loginFormWrapper.classList.add("active");
      registerFormWrapper.classList.remove("active");
    });

    tabRegisterBtn.addEventListener("click", () => {
      tabRegisterBtn.classList.add("active");
      tabLoginBtn.classList.remove("active");
      registerFormWrapper.classList.add("active");
      loginFormWrapper.classList.remove("active");
    });
  }

  const fileInput = document.getElementById("reg-avatar");
  const fileLabel = document.querySelector(".file-custom-label");
  const registrationSuccessAlert = document.getElementById(
    "registration-success-alert",
  );
  let avatarBase64 = null;

  function clearAuthErrors() {
    [
      "login-email",
      "login-password",
      "reg-lastname",
      "reg-firstname",
      "reg-email",
      "reg-password",
      "reg-password-confirm",
      "reg-faculty",
      "reg-program",
      "reg-level",
    ].forEach((fieldId) => window.EduUtils.clearError(fieldId));

    if (registrationSuccessAlert) {
      registrationSuccessAlert.style.display = "none";
    }
  }

  function showRegistrationSuccess() {
    if (registrationSuccessAlert) {
      registrationSuccessAlert.style.display = "flex";
    }
  }

  function showLoginTab() {
    if (
      tabLoginBtn &&
      tabRegisterBtn &&
      loginFormWrapper &&
      registerFormWrapper
    ) {
      tabLoginBtn.classList.add("active");
      tabRegisterBtn.classList.remove("active");
      loginFormWrapper.classList.add("active");
      registerFormWrapper.classList.remove("active");
    }
  }

  function showProfileView() {
    if (authSection) authSection.style.display = "none";
    if (profileSection) {
      profileSection.classList.add("active");
      profileSection.style.display = "block";
    }
  }

  function showAuthView() {
    if (profileSection) profileSection.style.display = "none";
    if (authSection) {
      authSection.classList.add("active");
      authSection.style.display = "flex";
    }
  }

  if (fileInput && fileLabel) {
    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        fileLabel.textContent = file.name;

        const reader = new FileReader();
        reader.onload = (event) => {
          avatarBase64 = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ==========================================
  // 2. USER SESSION STATE
  // ==========================================
  let userSession = null;
  const authSection = document.getElementById("auth-section");
  const profileSection = document.getElementById("profile-section");
  const authActionBtns = document.querySelectorAll(".auth-action-btn");

  async function renderUserEvents() {
    const eventsContainer = document.getElementById("events-container");
    const eventsCounter = document.getElementById("events-counter");
    if (!eventsContainer) return;

    if (!userSession) return;

    const eventsData = await window.EduUtils.fetchData("data/evenements.json");
    if (!eventsData) return;

    const reservations = window.EduUtils.getReservations();
    const currentEmail = window.EduUtils.normalizeEmail(userSession.email);
    const userReservations = reservations.filter(
      (reservation) =>
        window.EduUtils.normalizeEmail(reservation.email) === currentEmail,
    );

    if (eventsCounter) {
      eventsCounter.textContent = `${userReservations.length} inscrit${userReservations.length !== 1 ? "s" : ""}`;
    }

    if (userReservations.length === 0) {
      eventsContainer.innerHTML = `
        <div class="no-events-alert" style="padding: 30px; text-align: center; color: #64748B; border: 2px dashed #E2E8F0; border-radius: 12px; grid-column: 1 / -1;">
          <p style="margin-bottom: 15px;">Vous n'êtes inscrit à aucun événement pour le moment.</p>
          <a href="evenements.html" class="btn-pill btn-blue" style="display: inline-block; padding: 10px 20px; text-decoration: none; border-radius: 30px; font-weight: 600;">Découvrir les événements</a>
        </div>
      `;
      return;
    }

    eventsContainer.innerHTML = userReservations
      .map((res) => {
        const event = eventsData.find((e) => e.id === res.eventId);
        if (!event) return "";

        let tagClass = "tag-featured";
        if (event.category === "atelier") tagClass = "tag-workshop";
        else if (event.category === "webinaire") tagClass = "tag-webinar";
        else if (event.category === "sports") tagClass = "tag-sports";

        return `
        <div class="registered-event-row" data-id="${event.id}">
          <div class="event-row-info">
            <span class="mini-tag ${tagClass}">${event.categoryLabel}</span>
            <a href="detail.html?id=${event.id}" style="text-decoration: none; color: inherit;"><h4 style="margin: 8px 0; font-size: 1.1rem; font-weight: 700;">${event.title}</h4></a>
            <p class="event-row-date" style="font-size: 0.85rem; color: #64748B; display: flex; align-items: center; gap: 5px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              ${event.date} &bull; ${event.time}
            </p>
          </div>
          <button class="btn-cancel" aria-label="Annuler l'inscription" data-event-id="${event.id}" style="cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 20px; border: 1px solid #E2E8F0; background: white; font-size: 0.85rem; color: #EF4444; font-weight: 600; transition: all 0.2s;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Annuler</span>
          </button>
        </div>
      `;
      })
      .join("");

    const cancelBtns = eventsContainer.querySelectorAll(".btn-cancel");
    cancelBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const eventId = parseInt(btn.getAttribute("data-event-id"));
        if (
          confirm(
            "Voulez-vous vraiment annuler votre inscription à cet événement ?",
          )
        ) {
          window.EduUtils.removeReservation(eventId, userSession.email);
          renderUserEvents();
        }
      });
    });
  }

  function updateUIState() {
    userSession = window.EduUtils.getCurrentUser();
    if (userSession) {
      showProfileView();

      const fullName = document.getElementById("user-fullname");
      const email = document.getElementById("user-email");
      const faculty = document.getElementById("user-faculty");
      const program = document.getElementById("user-program");
      const level = document.getElementById("user-level");

      if (fullName)
        fullName.textContent = `${userSession.firstname} ${userSession.lastname}`;
      if (email) email.textContent = userSession.email;
      if (faculty) faculty.textContent = userSession.faculty;
      if (program) program.textContent = userSession.program;
      if (level) level.textContent = userSession.level;

      const avatarImg = document.getElementById("user-avatar");
      if (avatarImg) {
        avatarImg.src = userSession.avatar || defaultAvatarUrl;
      }

      authActionBtns.forEach((btn) => {
        btn.textContent = "Mon Profil";
        btn.href = "profil.html";
      });
      renderUserEvents();
    } else {
      showAuthView();
      showLoginTab();
      authActionBtns.forEach((btn) => {
        btn.textContent = "Se connecter";
        btn.href = "profil.html";
      });
    }
  }

  updateUIState();

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.EduUtils.setCurrentUser(null);
      clearAuthErrors();
      updateUIState();
    });
  }

  // ==========================================
  // 3. LOGIN FORM VALIDATION
  // ==========================================
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAuthErrors();
      let isValid = true;
      const emailInput = document.getElementById("login-email");
      const passwordInput = document.getElementById("login-password");
      const emailValue = emailInput.value.trim();
      const passwordValue = passwordInput.value;

      if (!window.EduUtils.validateEmail(emailValue)) {
        window.EduUtils.showError(
          "login-email",
          "Veuillez entrer une adresse e-mail valide.",
        );
        isValid = false;
      } else {
        window.EduUtils.clearError("login-email");
      }

      if (passwordValue.trim().length < 6) {
        window.EduUtils.showError(
          "login-password",
          "Le mot de passe doit comporter au moins 6 caractères.",
        );
        isValid = false;
      } else {
        window.EduUtils.clearError("login-password");
      }

      if (isValid) {
        const users = window.EduUtils.getUsers();
        const matchedUser = users.find(
          (user) =>
            window.EduUtils.normalizeEmail(user.email) ===
            window.EduUtils.normalizeEmail(emailValue),
        );

        if (matchedUser && matchedUser.password === passwordValue) {
          window.EduUtils.setCurrentUser(matchedUser);
          clearAuthErrors();
          loginForm.reset();
          if (fileLabel) fileLabel.textContent = "Sélectionner une image...";
          updateUIState();
        } else {
          window.EduUtils.showError(
            "login-email",
            "Adresse e-mail ou mot de passe incorrect.",
          );
          window.EduUtils.showError(
            "login-password",
            "Adresse e-mail ou mot de passe incorrect.",
          );
        }
      }
    });
  }

  // ==========================================
  // 4. REGISTER FORM VALIDATION
  // ==========================================
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearAuthErrors();
      let isValid = true;
      const fields = {
        lastname: document.getElementById("reg-lastname"),
        firstname: document.getElementById("reg-firstname"),
        email: document.getElementById("reg-email"),
        password: document.getElementById("reg-password"),
        passwordConfirm: document.getElementById("reg-password-confirm"),
        faculty: document.getElementById("reg-faculty"),
        program: document.getElementById("reg-program"),
        level: document.getElementById("reg-level"),
      };

      const emailValue = fields.email.value.trim();
      const passwordValue = fields.password.value;
      const passwordConfirmValue = fields.passwordConfirm.value;

      if (fields.lastname.value.trim() === "") {
        window.EduUtils.showError("reg-lastname", "Le nom est obligatoire.");
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-lastname");
      }

      if (fields.firstname.value.trim() === "") {
        window.EduUtils.showError(
          "reg-firstname",
          "Le prénom est obligatoire.",
        );
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-firstname");
      }

      if (!window.EduUtils.validateEmail(emailValue)) {
        window.EduUtils.showError(
          "reg-email",
          "Saisissez un e-mail universitaire valide.",
        );
        isValid = false;
      } else {
        // Check duplicate e-mail
        const users = window.EduUtils.getUsers();
        const exists = users.some(
          (user) =>
            window.EduUtils.normalizeEmail(user.email) ===
            window.EduUtils.normalizeEmail(emailValue),
        );
        if (exists) {
          window.EduUtils.showError(
            "reg-email",
            "Cet e-mail est déjà associé à un compte.",
          );
          isValid = false;
        } else {
          window.EduUtils.clearError("reg-email");
        }
      }

      if (passwordValue.length < 8) {
        window.EduUtils.showError(
          "reg-password",
          "Minimum 8 caractères requis.",
        );
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-password");
      }

      if (
        passwordConfirmValue !== passwordValue ||
        passwordConfirmValue === ""
      ) {
        window.EduUtils.showError(
          "reg-password-confirm",
          "Les mots de passe ne correspondent pas.",
        );
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-password-confirm");
      }

      if (fields.faculty.value === "") {
        window.EduUtils.showError("reg-faculty", "Sélectionnez votre faculté.");
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-faculty");
      }

      if (fields.program.value.trim() === "") {
        window.EduUtils.showError(
          "reg-program",
          "Le programme d'études est obligatoire.",
        );
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-program");
      }

      if (fields.level.value === "") {
        window.EduUtils.showError("reg-level", "Sélectionnez votre niveau.");
        isValid = false;
      } else {
        window.EduUtils.clearError("reg-level");
      }

      if (isValid) {
        const newUser = {
          firstname: fields.firstname.value.trim(),
          lastname: fields.lastname.value.trim(),
          email: emailValue,
          password: passwordValue,
          faculty: fields.faculty.value,
          program: fields.program.value.trim(),
          level: fields.level.value,
          avatar: avatarBase64,
        };

        window.EduUtils.saveUser(newUser);
        window.EduUtils.setCurrentUser(null);
        clearAuthErrors();
        registerForm.reset();
        if (fileLabel) fileLabel.textContent = "Sélectionner une image...";
        avatarBase64 = null;
        showRegistrationSuccess();
        showLoginTab();
        const loginEmailInput = document.getElementById("login-email");
        const loginPasswordInput = document.getElementById("login-password");
        if (loginEmailInput) loginEmailInput.value = emailValue;
        if (loginPasswordInput) loginPasswordInput.value = "";
        if (loginEmailInput) loginEmailInput.focus();
        updateUIState();
      }
    });
  }
});

