/* ==========================================
   SARAH ATEF — NAILS & LASHES STUDIO
   script.js — Interactive Booking & Client Engine
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  // --- CORE STATE ---
  let currentLang = localStorage.getItem('sarahLang') || 'ar';
  let currentTheme = localStorage.getItem('sarahTheme') || 'light';
  let selectedSlot = '';

  // --- DOM SELECTORS ---
  const loader = document.getElementById('loader');
  const navbar = document.getElementById('navbar');
  const langToggle = document.getElementById('langToggle');
  const themeToggle = document.getElementById('themeToggle');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const scrollArrow = document.querySelector('.hero-scroll');
  const backToTopBtn = document.querySelector('.back-to-top');

  // Booking Form Fields
  const bookingForm = document.getElementById('bookingForm');
  const clientName = document.getElementById('clientName');
  const clientPhone = document.getElementById('clientPhone');
  const clientService = document.getElementById('clientService');
  const clientDate = document.getElementById('clientDate');
  const clientNote = document.getElementById('clientNote');
  const slotsLabelContainer = document.getElementById('slotsLabelContainer');
  const slotsGrid = document.getElementById('slotsGrid');
  const dateWarning = document.getElementById('dateWarning');
  const formAlert = document.getElementById('formAlert');
  const bookBtn = document.getElementById('bookBtn');
  const ticketTarget = document.getElementById('ticketTarget');

  // Pricing Tabs
  const priceTabs = document.querySelectorAll('.price-tab');
  const pricesContent = document.getElementById('pricesContent');

  // --- 1. LOADER INITIALIZATION ---
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 1200);
  }

  // --- 2. THEME CONTROLLERS ---
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const sunIcon = document.querySelector('.icon-sun');
    const moonIcon = document.querySelector('.icon-moon');
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }

  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('sarahTheme', currentTheme);
      applyTheme(currentTheme);
    });
  }

  // --- 3. LANGUAGE CONTROLLERS (TRANSLATION DICTIONARY) ---
  const i18n = {
    ar: {
      slotsLabel: 'الأوقات المتاحة لهذا اليوم ⏱️',
      selectDateFirst: 'الرجاء اختيار تاريخ أولاً لعرض الأوقات المتاحة',
      loadingSlots: 'جاري تحميل الأوقات المتاحة...',
      sundayOff: '✦ الأحد عطلة أسبوعية للصالون بالكامل. يرجى اختيار يوم آخر لخدمتك ✦',
      pastDatesForbidden: '✦ لا يمكن الحجز في تواريخ سابقة للغد أو اليوم ✦',
      fillRequired: 'من فضلك املئي جميع الحقول واختاري التوقيت المناسب ✦',
      submitting: 'جاري تسجيل حجزك الآن...',
      successMsg: 'تم تسجيل حجزك بنجاح! جاري إعداد وتأكيد تذكرتك...',
      errorFetch: 'حدث خطأ في تحميل الأوقات. يرجى إعادة المحاولة.',
      ticketHeader: '✦ تذكرة حجز صالون سارة عاطف ✦',
      ticketService: 'الخدمة المطلوبة',
      ticketDate: 'التاريخ',
      ticketTime: 'الوقت المحدد',
      ticketPhone: 'رقم العميل',
      ticketStatus: 'الحالة',
      ticketClient: 'اسم العميل',
      statusPending: 'تم تأكيد الحجز بنجاح ✓',
      ticketNote: 'الحجز ينقصه الإرسال عبر واتساب للتأكيد الفوري!',
      waSendText: 'أرسلي الموعد على واتس سارة 🌸'
    },
    en: {
      slotsLabel: 'Available Time Slots ⏱️',
      selectDateFirst: 'Please select a date first to view availability options',
      loadingSlots: 'Browsing live bookable slots...',
      sundayOff: '✦ Sunday is our salon weekly holiday. Please schedule another day ✦',
      pastDatesForbidden: '✦ Past dates cannot be selected. Please choose a future date ✦',
      fillRequired: 'Please complete name, phone, service, date, and pick a time slot ✦',
      submitting: 'Capturing your reservation detail...',
      successMsg: 'Booking registered successfully! Instantiating confirmation ticket...',
      errorFetch: 'Failed to access available timelines. Retry shortly.',
      ticketHeader: '✦ Sarah Atef Salon Booking Receipt ✦',
      ticketService: 'Service Requested',
      ticketDate: 'Appointment Date',
      ticketTime: 'Selected Time',
      ticketPhone: 'Client Mobile',
      ticketStatus: 'Status',
      ticketClient: 'Client Name',
      statusPending: 'Booking Confirmed ✓',
      ticketNote: 'Make sure to notify Sarah on WhatsApp to guarantee slot!',
      waSendText: 'Send Appointment to WhatsApp 🌸'
    }
  };

  function applyLanguage(lang) {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Language buttons text values swapping
    const langArText = document.querySelector('.lang-ar');
    const langEnText = document.querySelector('.lang-en');
    if (lang === 'ar') {
      if (langArText) langArText.style.display = 'inline';
      if (langEnText) langEnText.style.display = 'none';
    } else {
      if (langArText) langArText.style.display = 'none';
      if (langEnText) langEnText.style.display = 'inline';
    }

    // Translate elements having data-ar and data-en attributes
    document.querySelectorAll('[data-ar]').forEach(el => {
      const arVal = el.getAttribute('data-ar');
      const enVal = el.getAttribute('data-en');
      if (lang === 'ar' && arVal) {
        el.innerHTML = arVal;
      } else if (lang === 'en' && enVal) {
        el.innerHTML = enVal;
      }
    });

    // Translate input placeholders
    document.querySelectorAll('[data-placeholder-ar]').forEach(el => {
      const arPlace = el.getAttribute('data-placeholder-ar');
      const enPlace = el.getAttribute('data-placeholder-en');
      if (lang === 'ar' && arPlace) {
        el.placeholder = arPlace;
      } else if (lang === 'en' && enPlace) {
        el.placeholder = enPlace;
      }
    });

    // Translate standard components dynamically
    updateSlotsLabel();
    triggerAvailableSlotsLoad();
  }

  applyLanguage(currentLang);

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'ar' ? 'en' : 'ar';
      localStorage.setItem('sarahLang', currentLang);
      applyLanguage(currentLang);
    });
  }

  // --- 4. NAVIGATION ACTIONS & MOBILE SLIDE HAMBURGER ---
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // Scroll active class trigger
  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    if (window.scrollY > 400) {
      if (backToTopBtn) backToTopBtn.classList.add('visible');
    } else {
      if (backToTopBtn) backToTopBtn.classList.remove('visible');
    }
  });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Hero scroll arrow
  if (scrollArrow) {
    scrollArrow.addEventListener('click', () => {
      const el = document.getElementById('about');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- 5. PRICING TABS ENGINE ---
  if (priceTabs.length > 0) {
    priceTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Toggle tabs
        priceTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Toggle matching price panels
        const selectedTabName = tab.getAttribute('data-tab');
        const panels = document.querySelectorAll('.price-panel');
        panels.forEach(p => {
          if (p.id === selectedTabName + 'Tab') {
            p.classList.add('active');
          } else {
            p.classList.remove('active');
          }
        });
      });
    });
  }

  // --- 6. REALTIME CALENDLY BOOKING ENGINE ---
  function updateSlotsLabel() {
    if (!slotsLabelContainer) return;
    if (!clientDate.value) {
      slotsLabelContainer.textContent = i18n[currentLang].selectDateFirst;
      slotsGrid.innerHTML = '';
      return;
    }
    slotsLabelContainer.textContent = i18n[currentLang].slotsLabel;
  }

  function triggerAvailableSlotsLoad() {
    const pickerDate = clientDate.value;
    if (!pickerDate) {
      slotsGrid.innerHTML = '';
      selectedSlot = '';
      return;
    }

    // Rules check — use T12:00:00 to avoid UTC midnight day-shift in Cairo (UTC+2/+3)
    const checkDate = new Date(pickerDate + 'T12:00:00');
    // 0 = Sunday
    if (checkDate.getDay() === 0) {
      dateWarning.textContent = i18n[currentLang].sundayOff;
      dateWarning.style.display = 'block';
      slotsGrid.innerHTML = '';
      selectedSlot = '';
      return;
    }

    // Past date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(pickerDate + 'T00:00:00');
    if (selectedDateObj < today) {
      dateWarning.textContent = i18n[currentLang].pastDatesForbidden;
      dateWarning.style.display = 'block';
      slotsGrid.innerHTML = '';
      selectedSlot = '';
      return;
    }

    // Hide warnings and display loader
    dateWarning.style.display = 'none';
    slotsGrid.innerHTML = `<div class="col-span-full text-center text-sm py-2 text-pink-500 animate-pulse">${i18n[currentLang].loadingSlots}</div>`;
    selectedSlot = '';

    // Fetch live slots
    fetch(`/api/available-slots?date=${pickerDate}`)
      .then(res => res.json())
      .then(data => {
        slotsGrid.innerHTML = '';
        const slots = data.slots || [];

        if (slots.length === 0) {
          slotsGrid.innerHTML = `<div class="col-span-full text-center text-sm text-gray shadow-sm border border-pink-100 p-4 rounded-lg bg-pink-50">✦ Sorry, no available hours left for this date ✦</div>`;
          return;
        }

        slots.forEach(time => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'time-slot-btn';
          btn.textContent = time;
          btn.addEventListener('click', () => {
            // Deselect all
            document.querySelectorAll('.time-slot-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSlot = time;
          });
          slotsGrid.appendChild(btn);
        });
      })
      .catch(err => {
        console.error('Error fetching online capacity:', err);
        slotsGrid.innerHTML = `<div class="col-span-full text-center text-sm text-red-500 py-2">${i18n[currentLang].errorFetch}</div>`;
      });
  }

  if (clientDate) {
    clientDate.addEventListener('change', () => {
      updateSlotsLabel();
      triggerAvailableSlotsLoad();
    });
  }

  // Pre-fill date to today if empty; skip Sunday → advance to Monday
  if (clientDate && !clientDate.value) {
    const d = new Date();
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); // Sunday → Monday
    const todayStr = d.toISOString().split('T')[0];
    clientDate.value = todayStr;
    updateSlotsLabel();
    triggerAvailableSlotsLoad();
  }

  // Submit Handler
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameVal = clientName.value.trim();
      const phoneVal = clientPhone.value.trim();
      const serviceVal = clientService.value;
      const dateVal = clientDate.value;
      const noteVal = clientNote.value.trim();

      if (!nameVal || !phoneVal || !serviceVal || !dateVal || !selectedSlot) {
        showFeedback(i18n[currentLang].fillRequired, 'error');
        return;
      }

      showFeedback(i18n[currentLang].submitting, 'success');
      bookBtn.disabled = true;

      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameVal,
            phone: phoneVal,
            service: serviceVal,
            date: dateVal,
            time: selectedSlot,
            note: noteVal
          })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed registration');
        }

        // Display Success!
        showFeedback(i18n[currentLang].successMsg, 'success');
        
        // Hide form fields nicely
        bookingForm.style.display = 'none';

        // Render Confirmation Ticket Card
        const savedBooking = result.booking;
        renderTicket(savedBooking, serviceVal, noteVal);

        // Clear Fields
        clientName.value = '';
        clientPhone.value = '';
        clientNote.value = '';
        selectedSlot = '';

        // Auto trigger WhatsApp redirect
        const waNumber = '201050362209'; // Sarah Atef Business Mobile
        const waMsg = currentLang === 'ar'
          ? `مرحباً سارة 🌸\nلقد قمت بحجز موعد عبر موقع صالونك:\n\n👤 الاسم: ${savedBooking.name}\n📞 التليفون: ${savedBooking.phone}\n✨ الخدمة: ${serviceVal}\n📅 التاريخ: ${savedBooking.date}\n⏰ الوقت: ${savedBooking.time}${noteVal ? `\n📝 ملاحظات: ${noteVal}` : ''}`
          : `Hello Sarah 🌸\nI have reserved an appointment on your Salon Site:\n\n👤 Name: ${savedBooking.name}\n📞 Phone: ${savedBooking.phone}\n✨ Service: ${serviceVal}\n📅 Date: ${savedBooking.date}\n⏰ Time: ${savedBooking.time}${noteVal ? `\n📝 Notes: ${noteVal}` : ''}`;
        
        setTimeout(() => {
          window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, '_blank');
        }, 1500);

      } catch (err) {
        showFeedback(err.message || 'Error occurred, please retry.', 'error');
        bookBtn.disabled = false;
      }
    });
  }

  function showFeedback(text, type) {
    if (!formAlert) return;
    formAlert.textContent = text;
    formAlert.style.display = 'block';
    formAlert.className = `form-alert form-alert-${type}`;
  }

  function renderTicket(booking, serviceLabel, note) {
    if (!ticketTarget) return;

    const formattedDate = new Date(booking.date + 'T12:00:00').toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const statusLabel = i18n[currentLang].statusPending;
    const waNumber = '201050362209';
    const waMsg = currentLang === 'ar'
      ? `مرحباً سارة 🌸\nأريد الحجز:\n👤 الاسم: ${booking.name}\n✨ الخدمة: ${serviceLabel}\n📅 التاريخ: ${booking.date}\n⏰ الوقت: ${booking.time}`
      : `Hello Sarah 🌸\nBooking styling session:\n👤 Name: ${booking.name}\n✨ Service: ${serviceLabel}\n📅 Date: ${booking.date}\n⏰ Time: ${booking.time}`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`;

    ticketTarget.style.display = 'block';
    ticketTarget.innerHTML = `
      <div class="ticket-container">
        <div class="ticket-header">
          <div class="ticket-title">${i18n[currentLang].ticketHeader}</div>
          <p style="font-size: 0.8rem; margin-top: 5px; color: var(--text-gray);">Ref ID: #SAB-${booking.id}</p>
        </div>
        
        <div class="ticket-row">
          <span class="ticket-label">${i18n[currentLang].ticketClient}:</span>
          <span class="ticket-value">${booking.name}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">${i18n[currentLang].ticketPhone}:</span>
          <span class="ticket-value" style="direction: ltr;">${booking.phone}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">${i18n[currentLang].ticketService}:</span>
          <span class="ticket-value">${serviceLabel}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">${i18n[currentLang].ticketDate}:</span>
          <span class="ticket-value">${formattedDate}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">${i18n[currentLang].ticketTime}:</span>
          <span class="ticket-value" style="direction: ltr;">${booking.time}</span>
        </div>
        <div class="ticket-row">
          <span class="ticket-label">${i18n[currentLang].ticketStatus}:</span>
          <span class="ticket-value text-amber-500">${statusLabel}</span>
        </div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <p style="font-size: 0.78rem; color: var(--hot-pink); margin-bottom: 10px; font-weight: bold;">
            ${i18n[currentLang].ticketNote}
          </p>
          <a href="${waUrl}" target="_blank" class="btn-primary full-width text-center block bg-emerald-500 hover:bg-emerald-600 border-none rounded-full py-2 shadow-md">
            ${i18n[currentLang].waSendText}
          </a>
        </div>
      </div>
    `;
  }

  // --- 7. SCROLL OBSERVER AND ENTRANCE EFFECTS ---
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
});
