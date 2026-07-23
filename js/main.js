/**
 * Global Utilities and Shared UI Logic
 * This file is loaded on every page.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. MOBILE MENU HAMBURGER LOGIC
  // ==========================================
  const menuToggle = document.getElementById("menu-toggle-btn");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      menuToggle.classList.toggle("active");
      navMenu.classList.toggle("active");

      if (navMenu.classList.contains("active")) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });

    const navLinks = navMenu.querySelectorAll("ul li a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.classList.remove("active");
        navMenu.classList.remove("active");
        document.body.style.overflow = "";
      });
    });
  }

  // ==========================================
  // 2. HOMEPAGE STATS COUNTER ANIMATION
  // ==========================================
  const statsSection = document.querySelector(".stats");
  const statCards = document.querySelectorAll(".stat-animate");
  const statNumbers = document.querySelectorAll(".stat-number");

  if (statsSection) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            statCards.forEach((card) => card.classList.add("visible"));

            statNumbers.forEach((num) => {
              const target = parseInt(num.getAttribute("data-target"), 10);
              const duration = 2000;
              let startTimestamp = null;

              const step = (timestamp) => {
                if (!startTimestamp) startTimestamp = timestamp;
                const progress = Math.min(
                  (timestamp - startTimestamp) / duration,
                  1,
                );
                const currentNum = Math.floor(progress * target);
                num.textContent = currentNum.toLocaleString() + "+";

                if (progress < 1) {
                  window.requestAnimationFrame(step);
                } else {
                  num.textContent = target.toLocaleString() + "+";
                }
              };
              window.requestAnimationFrame(step);
            });
          }
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(statsSection);
  }

  // ==========================================
  // 3. ABOUT PAGE FAQ ACCORDION
  // ==========================================
  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const trigger = item.querySelector(".faq-trigger");
      if (trigger) {
        trigger.addEventListener("click", () => {
          const isActive = item.classList.contains("active");
          faqItems.forEach((otherItem) => otherItem.classList.remove("active"));
          if (!isActive) {
            item.classList.add("active");
          }
        });
      }
    });
  }

  // ==========================================
  // 4. ABOUT PAGE CONTACT FORM VALIDATION
  // ==========================================
  const contactForm = document.getElementById("contact-form");
  const contactSuccessAlert = document.getElementById("contact-success");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let isFormValid = true;

      const nameInput = document.getElementById("contact-name");
      const emailInput = document.getElementById("contact-email");
      const messageInput = document.getElementById("contact-message");

      if (nameInput.value.trim() === "") {
        window.EduUtils.showError(
          "contact-name",
          "Le nom complet est obligatoire.",
        );
        isFormValid = false;
      } else {
        window.EduUtils.clearError("contact-name");
      }

      if (!window.EduUtils.validateEmail(emailInput.value)) {
        window.EduUtils.showError(
          "contact-email",
          "Saisissez une adresse e-mail valide.",
        );
        isFormValid = false;
      } else {
        window.EduUtils.clearError("contact-email");
      }

      if (messageInput.value.trim().length < 10) {
        window.EduUtils.showError(
          "contact-message",
          "Le message doit contenir au moins 10 caractères.",
        );
        isFormValid = false;
      } else {
        window.EduUtils.clearError("contact-message");
      }

      if (isFormValid) {
        contactForm.style.display = "none";
        if (contactSuccessAlert) {
          contactSuccessAlert.style.display = "block";
        }
        contactForm.reset();
      }
    });
  }

  // ==========================================
  // 5. GLOBAL SESSION HEADER SYNC
  // ==========================================
  const currentUser = window.EduUtils.getCurrentUser();
  const authActionBtns = document.querySelectorAll(".auth-action-btn");
  if (currentUser && authActionBtns.length > 0) {
    authActionBtns.forEach((btn) => {
      btn.textContent = "Mon Profil";
      btn.href = "profil.html";
    });
  }
});

/**
 * Shared Validation and Utility Helpers
 * Exposed globally for other scripts to use.
 */
window.EduUtils = {
  normalizeEmail: function (email) {
    return String(email || "")
      .trim()
      .toLowerCase();
  },

  validateEmail: function (email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  showError: function (inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorSpan = document.getElementById(`error-${inputId}`);
    if (inputElement && errorSpan) {
      inputElement.parentElement.classList.add("invalid");
      errorSpan.textContent = message;
      errorSpan.style.display = "block";
    }
  },

  clearError: function (inputId, message) {
    const inputElement = document.getElementById(inputId);
    const errorSpan = document.getElementById(`error-${inputId}`);
    if (inputElement && errorSpan) {
      inputElement.parentElement.classList.remove("invalid");
      errorSpan.textContent = "";
      errorSpan.style.display = "none";
    }
  },

  escapeHTML: function (str) {
    return str.replace(
      /[&<>'"]/g,
      (tag) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "'": "&#39;",
          '"': "&quot;",
        })[tag] || tag,
    );
  },

  fetchData: async function (url) {
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.warn(
        "Could not fetch data from " + url + ", using fallback built-in data.",
        e,
      );
      if (url.includes("evenements.json")) {
        return [
          {
            id: 1,
            title: "Conférence internationale sur les innovations éducatives",
            category: "conference",
            categoryLabel: "Conférence",
            date: "15 juin 2026",
            dayName: "Ven",
            dayNumber: "15",
            monthYear: "Juin 2026",
            time: "09:00 - 17:00",
            period: "aujourd'hui",
            location: "Paris, France",
            fullLocation: "Grand Amphithéâtre, Paris, France",
            imgUrl:
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80",
            featured: true,
            description:
              "Découvrez les dernières innovations et méthodes d'apprentissage lors de cette conférence exceptionnelle réunissant des experts internationaux.",
            longDescription: [
              "Rejoignez-nous pour une conférence passionnante sur les dernières tendances en matière d'éducation. Des experts de renommée internationale partageront leurs connaissances et retours d'expériences pratiques pour inspirer et informer les participants sur les outils d'apprentissage de demain.",
              "Au programme : tables rondes sur l'intelligence artificielle dans l'enseignement, ateliers de pédagogie active et opportunités de réseautage avec des chercheurs, professeurs et étudiants passionnés.",
            ],
            organizer: "Faculté des Sciences & ÉduEvent",
            price: "Gratuit",
            remainingSeats: 14,
            totalSeats: 50,
          },
          {
            id: 2,
            title: "Atelier interactif de développement personnel",
            category: "atelier",
            categoryLabel: "Atelier",
            date: "20 juin 2026",
            dayName: "Mer",
            dayNumber: "20",
            monthYear: "Juin 2026",
            time: "14:00 - 18:00",
            period: "cette-semaine",
            location: "Lyon, France",
            fullLocation: "Amphithéâtre C, Lyon, France",
            imgUrl:
              "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Un atelier interactif conçu pour apprendre à mieux gérer son temps, fixer des objectifs clairs et libérer son plein potentiel professionnel.",
            longDescription: [
              "Cet atelier pratique et hautement interactif vous donnera les clés pour structurer vos journées, vaincre la procrastination et développer une posture professionnelle affirmée.",
              "À travers des exercices de mise en situation réelle et des échanges collectifs guidés par un coach spécialisé, vous repartirez avec un plan d'action personnalisé applicable dès le lendemain.",
            ],
            organizer: "Département Psychologie & Carrières",
            price: "45 €",
            remainingSeats: 25,
            totalSeats: 30,
          },
          {
            id: 3,
            title: "Webinaire : Le Futur du Développement Web",
            category: "webinaire",
            categoryLabel: "Webinaire",
            date: "30 juin 2026",
            dayName: "Mar",
            dayNumber: "30",
            monthYear: "Juin 2026",
            time: "10:00 - 12:00",
            period: "ce-mois",
            location: "À distance (Zoom)",
            fullLocation:
              "Visioconférence Zoom (Lien envoyé après inscription)",
            imgUrl:
              "https://images.unsplash.com/photo-1591115765373-520976827f05?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Participez à notre webinaire pour explorer les tendances technologiques de demain, de l'intelligence artificielle aux frameworks modernes.",
            longDescription: [
              "Quelles seront les technologies indispensables aux développeurs web dans les cinq prochaine années ? Ce webinaire décrypte l'impact de l'IA générative sur le code, l'évolution du responsive design et les nouveaux standards de performance web.",
              "Session interactive avec période de questions-réponses en direct animée par des architectes logiciels chevronnés.",
            ],
            organizer: "Club Informatique Étudiant",
            price: "Gratuit",
            remainingSeats: 150,
            totalSeats: 200,
          },
          {
            id: 4,
            title: "Tournoi de Football Inter-Universitaire",
            category: "sports",
            categoryLabel: "Sports",
            date: "22 juin 2026",
            dayName: "Lun",
            dayNumber: "22",
            monthYear: "Juin 2026",
            time: "13:00 - 19:00",
            period: "cette-semaine",
            location: "Marseille, France",
            fullLocation: "Stade Universitaire Luminy, Marseille, France",
            imgUrl:
              "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Venez supporter votre équipe universitaire lors du grand tournoi annuel de football de la région sud.",
            longDescription: [
              "Le tournoi annuel inter-universitaire rassemble cette année 12 équipes masculines et féminines s'affrontant pour remporter la Coupe du Campus.",
              "Restauration sur place, animations musicales, tombola et stands de nos partenaires sportifs tout au long de la journée de compétition. Venez nombreux encourager vos camarades !",
            ],
            organizer: "Association Sportive du Campus",
            price: "Gratuit",
            remainingSeats: 8,
            totalSeats: 100,
          },
          {
            id: 5,
            title: "Exposition d'Art Contemporain Étudiant",
            category: "culture",
            categoryLabel: "Culture",
            date: "28 juin 2026",
            dayName: "Dim",
            dayNumber: "28",
            monthYear: "Juin 2026",
            time: "10:00 - 18:00",
            period: "ce-mois",
            location: "Lille, France",
            fullLocation:
              "Galerie d'Art du Centre Culturel Étudiant, Lille, France",
            imgUrl:
              "https://images.unsplash.com/photo-1531058020387-3be344559be6?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Admirez les œuvres d'art originales réalisées par les étudiants de l'école des Beaux-Arts du campus.",
            longDescription: [
              "Cette exposition met à l'honneur la jeune création contemporaine à travers une cinquantaine d'œuvres : peintures, sculptures, photographies et installations numériques interactives.",
              "Le vernissage aura lieu à 11h en présence des artistes étudiants, l'occasion idéale d'échanger sur leurs inspirations, leurs parcours et leurs techniques de création.",
            ],
            organizer: "Bureau des Arts (BDA)",
            price: "Gratuit",
            remainingSeats: 40,
            totalSeats: 150,
          },
          {
            id: 6,
            title: "Hackathon IA : Révolutionner la Santé",
            category: "atelier",
            categoryLabel: "Atelier",
            date: "15 juin 2026",
            dayName: "Ven",
            dayNumber: "15",
            monthYear: "Juin 2026",
            time: "08:00 - 20:00",
            period: "aujourd'hui",
            location: "Toulouse, France",
            fullLocation: "Espace Turing, Pôle Innovation, Toulouse, France",
            imgUrl:
              "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Relevez le défi de développer des solutions d'intelligence artificielle innovantes appliquées au secteur médical.",
            longDescription: [
              "Pendant 12 heures non-stop, concevez en équipe un prototype d'intelligence artificielle pour répondre à un défi de santé publique : aide au diagnostic, suivi de patients ou optimisation des soins.",
              "Des mentors du monde médical et de l'IA guideront les équipes. Présentation finale devant un jury professionnel avec de nombreux prix technologiques à remporter.",
            ],
            organizer: "Toulouse Tech Hub & Faculté de Médecine",
            price: "Gratuit",
            remainingSeats: 0,
            totalSeats: 80,
          },
          {
            id: 7,
            title: "Conférence : Climat et Éco-Responsabilité",
            category: "conference",
            categoryLabel: "Conférence",
            date: "21 juin 2026",
            dayName: "Dim",
            dayNumber: "21",
            monthYear: "Juin 2026",
            time: "18:00 - 20:00",
            period: "cette-semaine",
            location: "Bordeaux, France",
            fullLocation:
              "Amphi Climat, Faculté de Géographie, Bordeaux, France",
            imgUrl:
              "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Une conférence interactive pour comprendre les enjeux climatiques actuels et adopter des gestes éco-responsables.",
            longDescription: [
              "Quelles actions concrètes un étudiant peut-il mener à son échelle pour réduire son empreinte environnementale ? Des experts du climat s'associent à des associations étudiantes locales pour dresser un bilan lucide et constructif des initiatives écologiques sur nos campus.",
              "La conférence sera suivie d'un buffet zéro-déchet convivial propice au partage d'idées.",
            ],
            organizer: "Réseau Campus Vert & Éco-Étudiants",
            price: "Gratuit",
            remainingSeats: 35,
            totalSeats: 120,
          },
          {
            id: 8,
            title: "Atelier d'Initiation à la Cuisine du Monde",
            category: "culture",
            categoryLabel: "Culture",
            date: "29 juin 2026",
            dayName: "Lun",
            dayNumber: "29",
            monthYear: "Juin 2026",
            time: "11:30 - 13:30",
            period: "ce-mois",
            location: "Nantes, France",
            fullLocation: "Cuisine Collective du Crous, Nantes, France",
            imgUrl:
              "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
            featured: false,
            description:
              "Apprenez à cuisiner des plats exotiques et savoureux venus des quatre coins du globe avec nos chefs étudiants.",
            longDescription: [
              "Un voyage gustatif guidé par des étudiants internationaux ravis de faire découvrir leurs spécialités culinaires traditionnelles. Apprenez des techniques de préparation simples, économiques et adaptées à la vie étudiante.",
              "Chaque participant met la main à la pâte avant une dégustation partagée et chaleureuse. Repartez avec votre livret de fiches recettes illustrées !",
            ],
            organizer: "Association des Étudiants Internationaux",
            price: "15 €",
            remainingSeats: 12,
            totalSeats: 20,
          },
        ];
      }
      return null;
    }
  },

  // --- LOCAL STORAGE HELPERS ---

  getUsers: function () {
    const users = localStorage.getItem("edu_users");
    if (!users) {
      const defaultUsers = [
        {
          firstname: "John",
          lastname: "Doe",
          email: "john.doe@etudiant.univ.fr",
          password: "password123",
          faculty: "Faculté des Sciences et de génie",
          program: "Informatique",
          level: "L3",
          avatar: null,
        },
      ];
      localStorage.setItem("edu_users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }

    try {
      const parsedUsers = JSON.parse(users);
      return Array.isArray(parsedUsers) ? parsedUsers : [];
    } catch (error) {
      console.warn(
        "Stored user data is invalid, resetting auth storage.",
        error,
      );
      localStorage.removeItem("edu_users");
      return this.getUsers();
    }
  },

  saveUser: function (user) {
    const users = this.getUsers();
    const normalizedUserEmail = this.normalizeEmail(user.email);
    const idx = users.findIndex(
      (u) => this.normalizeEmail(u.email) === normalizedUserEmail,
    );
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem("edu_users", JSON.stringify(users));
  },

  getCurrentUser: function () {
    const user = localStorage.getItem("edu_currentUser");
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      console.warn("Stored current user is invalid, clearing session.", error);
      localStorage.removeItem("edu_currentUser");
      return null;
    }
  },

  setCurrentUser: function (user) {
    if (user) {
      localStorage.setItem("edu_currentUser", JSON.stringify(user));
      this.saveUser(user);
    } else {
      localStorage.removeItem("edu_currentUser");
    }
  },

  getReservations: function () {
    const reservations = localStorage.getItem("edu_reservations");
    if (!reservations) return [];

    try {
      const parsedReservations = JSON.parse(reservations);
      return Array.isArray(parsedReservations) ? parsedReservations : [];
    } catch (error) {
      console.warn(
        "Stored reservations are invalid, resetting reservation storage.",
        error,
      );
      localStorage.removeItem("edu_reservations");
      return [];
    }
  },

  addReservation: function (eventId, email, name, phone) {
    const reservations = this.getReservations();
    const normalizedEmail = this.normalizeEmail(email);
    const exists = reservations.some(
      (r) =>
        r.eventId === eventId &&
        this.normalizeEmail(r.email) === normalizedEmail,
    );
    if (!exists) {
      reservations.push({
        eventId: eventId,
        email: normalizedEmail,
        name: name,
        phone: phone || "",
        dateReserved: new Date().toISOString(),
      });
      localStorage.setItem("edu_reservations", JSON.stringify(reservations));
      this.decrementSeats(eventId);
      return true;
    }
    return false;
  },

  removeReservation: function (eventId, email) {
    let reservations = this.getReservations();
    const originalLength = reservations.length;
    const normalizedEmail = this.normalizeEmail(email);
    reservations = reservations.filter(
      (r) =>
        !(
          r.eventId === eventId &&
          this.normalizeEmail(r.email) === normalizedEmail
        ),
    );
    if (reservations.length < originalLength) {
      localStorage.setItem("edu_reservations", JSON.stringify(reservations));
      this.incrementSeats(eventId);
      return true;
    }
    return false;
  },

  // --- SEATS MANAGEMENT ---

  getRemainingSeats: function (eventId, totalSeats, defaultRemaining) {
    const seatsMap = localStorage.getItem("edu_seats_map");
    let map = {};

    if (seatsMap) {
      try {
        map = JSON.parse(seatsMap);
      } catch (error) {
        console.warn(
          "Stored seats map is invalid, resetting seat storage.",
          error,
        );
        localStorage.removeItem("edu_seats_map");
      }
    }

    if (map[eventId] !== undefined) {
      return map[eventId];
    }
    map[eventId] = defaultRemaining;
    localStorage.setItem("edu_seats_map", JSON.stringify(map));
    return defaultRemaining;
  },

  decrementSeats: function (eventId) {
    const seatsMap = localStorage.getItem("edu_seats_map");
    let map = {};

    if (seatsMap) {
      try {
        map = JSON.parse(seatsMap);
      } catch (error) {
        console.warn(
          "Stored seats map is invalid, resetting seat storage.",
          error,
        );
        localStorage.removeItem("edu_seats_map");
      }
    }

    if (map[eventId] !== undefined && map[eventId] > 0) {
      map[eventId]--;
      localStorage.setItem("edu_seats_map", JSON.stringify(map));
    }
  },

  incrementSeats: function (eventId) {
    const seatsMap = localStorage.getItem("edu_seats_map");
    let map = {};

    if (seatsMap) {
      try {
        map = JSON.parse(seatsMap);
      } catch (error) {
        console.warn(
          "Stored seats map is invalid, resetting seat storage.",
          error,
        );
        localStorage.removeItem("edu_seats_map");
      }
    }

    if (map[eventId] !== undefined) {
      map[eventId]++;
      localStorage.setItem("edu_seats_map", JSON.stringify(map));
    }
  },
};
