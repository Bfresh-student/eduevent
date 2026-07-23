/**
 * Events Page and Homepage Events Rendering Logic
 */

document.addEventListener("DOMContentLoaded", async () => {
  const eventsData = await window.EduUtils.fetchData("data/evenements.json");
  if (!eventsData) return;

  // ==========================================
  // 1. HOMEPAGE: DYNAMIC VEDETTE EVENTS
  // ==========================================
  const homeEventsContainer = document.getElementById("home-events-container");
  if (homeEventsContainer) {
    // We only want a few featured events on the home page
    const featuredEvents = eventsData.filter(e => e.featured).slice(0, 3);
    
    homeEventsContainer.innerHTML = featuredEvents.map(event => `
      <div class="event-row featured">
          <div class="event-date-block">
              <span class="day-name">${event.dayName}</span>
              <span class="day-number">${event.dayNumber}</span>
              <span class="month-year">${event.monthYear}</span>
          </div>
          <div class="event-content">
              <div class="event-meta-top">
                  <span class="event-badge badge-featured">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Vedette
                  </span>
                  <span class="event-time">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                      ${event.time}
                  </span>
              </div>
              <h3 class="event-row-title">${event.title}</h3>
              <p class="event-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  ${event.location}
              </p>
              <p class="event-desc">${event.description}</p>
              <div class="event-footer">
                  <span class="event-price ${event.price === 'Gratuit' ? 'price-free' : ''}">${event.price}</span>
                  <a href="detail.html?id=${event.id}" class="btn-text">
                      En savoir plus 
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>
              </div>
          </div>
          <div class="event-image-wrapper">
              <img src="${event.imgUrl}" alt="${event.title}" loading="lazy">
          </div>
      </div>
    `).join("");
  }

  // ==========================================
  // 2. EVENTS PAGE: FILTRING, SEARCH & VIEW
  // ==========================================
  const searchInput = document.getElementById("search-input");
  const categorySelect = document.getElementById("category");
  const dateSelect = document.getElementById("date-filter");
  const viewGridBtn = document.getElementById("view-grid-btn");
  const viewListBtn = document.getElementById("view-list-btn");
  const eventsContainer = document.getElementById("events-container");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loadMoreContainer = document.getElementById("load-more-container");

  if (eventsContainer) {
    let currentLimit = 4;
    const ITEMS_PER_LOAD = 4;
    let currentViewMode = "grid-view";

    const renderFilteredEvents = () => {
      const searchText = searchInput.value.toLowerCase().trim();
      const selectedCategory = categorySelect.value;
      const selectedDate = dateSelect.value;

      const filteredArray = eventsData.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchText) || event.location.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === "" || event.category === selectedCategory;
        const matchesDate = selectedDate === "" || event.period === selectedDate;
        return matchesSearch && matchesCategory && matchesDate;
      });

      const visibleEvents = filteredArray.slice(0, currentLimit);

      if (visibleEvents.length === 0) {
        eventsContainer.innerHTML = `<div class="no-results" style="grid-column: 1 / -1;"><p>Aucun événement ne correspond à vos critères de recherche.</p></div>`;
        loadMoreContainer.classList.add("hidden");
        return;
      }

      eventsContainer.innerHTML = visibleEvents.map(event => `
          <div class="event-card" data-id="${event.id}" tabindex="0" role="button" aria-label="Ouvrir ${event.title}">
              <div class="card-img-container">
                <span class="card-category-badge category-${event.category}">${event.categoryLabel}</span>
                <img src="${event.imgUrl}" alt="${event.title}" loading="lazy">
              </div>
              <div class="card-info">
                  <div class="card-text-block">
                      <h3>${event.title}</h3>
                      <div class="card-meta-block">
                          <p class="card-meta-line">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                              ${event.date}
                          </p>
                          <p class="card-meta-line">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              ${event.location}
                          </p>
                      </div>
                  </div>
                  <a href="detail.html?id=${event.id}" class="btn-text">
                      En savoir plus
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </a>
              </div>
          </div>
      `).join("");

      if (filteredArray.length > currentLimit) {
        loadMoreContainer.classList.remove("hidden");
      } else {
        loadMoreContainer.classList.add("hidden");
      }
    };

    renderFilteredEvents();

    searchInput.addEventListener("input", () => { currentLimit = ITEMS_PER_LOAD; renderFilteredEvents(); });
    categorySelect.addEventListener("change", () => { currentLimit = ITEMS_PER_LOAD; renderFilteredEvents(); });
    dateSelect.addEventListener("change", () => { currentLimit = ITEMS_PER_LOAD; renderFilteredEvents(); });

    viewGridBtn.addEventListener("click", () => {
      currentViewMode = "grid-view";
      viewGridBtn.classList.add("active");
      viewListBtn.classList.remove("active");
      eventsContainer.className = `event-list ${currentViewMode}`;
      renderFilteredEvents();
    });

    viewListBtn.addEventListener("click", () => {
      currentViewMode = "list-view";
      viewListBtn.classList.add("active");
      viewGridBtn.classList.remove("active");
      eventsContainer.className = `event-list ${currentViewMode}`;
      renderFilteredEvents();
    });

    loadMoreBtn.addEventListener("click", () => {
      currentLimit += ITEMS_PER_LOAD;
      renderFilteredEvents();
    });
  }
});
