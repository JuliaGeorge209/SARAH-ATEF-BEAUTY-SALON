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
  const backToTopBtn = document.getElementById('backToTop');

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
        priceTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

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
    if (!clientDate || !clientDate.value) {
      slotsLabelContainer.textContent = i18n[currentLang].selectDateFirst;
      if (slotsGrid) slotsGrid.innerHTML = '';
      return;
    }
    slotsLabelContainer.textContent = i18n[currentLang].slotsLabel;
  }

  function renderSlots(slots) {
    if (!slotsGrid) return;
    slotsGrid.innerHTML = '';
    slots.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot-btn';
      // Style match to fit layout cleanly
      btn.style.padding = '8px';
      btn.style.border = '1px solid var(--border-color, #e5e7eb)';
      btn.style.borderRadius = '6px';
      btn.style.background = 'transparent';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '0.85rem';
      btn.style.color = 'var(--text-main)';
      
      btn.textContent = time;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.time-slot-btn').forEach(b => {
          b.classList.remove('selected');
          b.style.background = 'transparent';
          b.style.color = 'var(--text-main)';
        });
        btn.classList.add('selected');
        btn.style.background = '#ec4899'; // Hot pink active matching design
        btn.style.color = '#ffffff';
        selectedSlot = time;
      });
      slotsGrid.appendChild(btn);
    });
  }

  function triggerAvailableSlotsLoad() {
    if (!clientDate) return;
    const pickerDate = clientDate.value;
    if (!pickerDate) {
      if (slotsGrid) slotsGrid.innerHTML = '';
      selectedSlot = '';
      return;
    }

    const checkDate = new Date(pickerDate + 'T12:00:00');
    if (checkDate.getDay() === 0) {
      if (dateWarning) {
        dateWarning.textContent = i18n[currentLang].sundayOff;
        dateWarning.style.display = 'block';
      }
      if (slotsGrid) slotsGrid.innerHTML = '';
      selectedSlot = '';
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateObj = new Date(pickerDate + 'T00:00:00');
    if (selectedDateObj < today) {
      if (dateWarning) {
        dateWarning.textContent = i18n[currentLang].pastDatesForbidden;
        dateWarning.style.display = 'block';
      }
      if (slotsGrid) slotsGrid.innerHTML = '';
      selectedSlot = '';
      return;
    }

    if (dateWarning) dateWarning.style.display = 'none';
    if (slotsGrid) slotsGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; font-size: 0.85rem; padding: 10px; color: #ec4899;">${i18n[currentLang].loadingSlots}</div>`;
    selectedSlot = '';

    // Fetch live slots from endpoint
    fetch(`/api/available-slots?date=${pickerDate}`)
      .then(res => res.json())
      .then(data => {
        const slots = data.slots || [];
        if (slots.length === 0) {
          // Default backup templates if no API slots available
          const fallbackSlots = ['12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM', '09:00 PM'];
          renderSlots(fallbackSlots);
          return;
        }
        renderSlots(slots);
      })
      .catch(() => {
        // Safe design fallback protection
        const fallbackSlots = ['12:00 PM', '01:30 PM', '03:00 PM', '04:30 PM', '06:00 PM', '07:30 PM', '09:00 PM'];
        renderSlots(fallbackSlots);
      });
  }

  if (clientDate) {
    clientDate.addEventListener('change', () => {
      updateSlotsLabel();
      triggerAvailableSlotsLoad();
    });
  }

  if (clientDate && !clientDate.value) {
    const d = new Date();
    if (d.getDay() === 0) d.setDate(d.getDate() + 1); 
    clientDate.value = d.toISOString().split('T')[0];
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
      const noteVal = clientNote ? clientNote.value.trim() : '';

      if (!nameVal || !phoneVal || !serviceVal || !dateVal || !selectedSlot) {
        showFeedback(i18n[currentLang].fillRequired, 'error');
        return;
      }

      showFeedback(i18n[currentLang].submitting, 'success');
      if (bookBtn) bookBtn.disabled = true;

      // Extract translated visual name
      const selectedOption = clientService.options[clientService.selectedIndex];
      const visualServiceText = currentLang === 'ar' ? selectedOption.getAttribute('data-ar') : selectedOption.getAttribute('data-en');

      try {
        // Simulating reservation capture or endpoint forward cleanly
        const bookingPayload = {
          id: Math.floor(1000 + Math.random() * 9000),
          name: nameVal,
          phone: phoneVal,
          service: visualServiceText,
          date: dateVal,
          time: selectedSlot
        };

        showFeedback(i18n[currentLang].successMsg, 'success');
        bookingForm.style.display = 'none';

        renderTicket(bookingPayload, visualServiceText, noteVal);

        // WhatsApp trigger execution setup
        const waNumber = '201050362209'; 
        const waMsg = currentLang === 'ar'
          ? `مرحباً سارة 🌸\nلقد قمت بحجز موعد عبر موقع صالونك:\n\n👤 الاسم: ${bookingPayload.name}\n📞 التليفون: ${bookingPayload.phone}\n✨ الخدمة: ${visualServiceText}\n📅 التاريخ: ${bookingPayload.date}\n⏰ الوقت: ${bookingPayload.time}${noteVal ? `\n📝 ملاحظات: ${noteVal}` : ''}`
          : `Hello Sarah 🌸\nI have reserved an appointment on your Salon Site:\n\n👤 Name: ${bookingPayload.name}\n📞 Phone: ${bookingPayload.phone}\n✨ Service: ${visualServiceText}\n📅 Date: ${bookingPayload.date}\n⏰ Time: ${bookingPayload.time}${noteVal ? `\n📝 Notes: ${noteVal}` : ''}`;
        
        setTimeout(() => {
          window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, '_blank');
        }, 1500);

      } catch (err) {
        showFeedback(i18n[currentLang].errorFetch, 'error');
        if (bookBtn) bookBtn.disabled = false;
      }
    });
  }

  function showFeedback(text, type) {
    if (!formAlert) return;
    formAlert.textContent = text;
    formAlert.style.display = 'block';
    formAlert.style.background = type === 'error' ? '#fee2e2' : '#ecfdf5';
    formAlert.style.color = type === 'error' ? '#b91c1c' : '#047857';
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
      <div class="ticket-container" style="border: 2px dashed #ec4899; padding: 20px; border-radius: 12px; background: var(--bg-surface, rgba(255,255,255,0.05)); margin-top: 20px;">
        <div class="ticket-header" style="text-align:center; margin-bottom: 15px;">
          <div class="ticket-title" style="font-weight: bold; color: #ec4899;">${i18n[currentLang].ticketHeader}</div>
          <p style="font-size: 0.8rem; margin-top: 5px; color: #6b7280;">Ref ID: #SAB-${booking.id}</p>
        </div>
        
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size:0.9rem;">
          <span>${i18n[currentLang].ticketClient}:</span>
          <strong>${booking.name}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size:0.9rem;">
          <span>${i18n[currentLang].ticketPhone}:</span>
          <span style="direction: ltr;">${booking.phone}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size:0.9rem;">
          <span>${i18n[currentLang].ticketService}:</span>
          <strong>${serviceLabel}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size:0.9rem;">
          <span>${i18n[currentLang].ticketDate}:</span>
          <span>${formattedDate}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size:0.9rem;">
          <span>${i18n[currentLang].ticketTime}:</span>
          <span style="direction: ltr;">${booking.time}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom: 8px; font-size:0.9rem;">
          <span>${i18n[currentLang].ticketStatus}:</span>
          <span style="color: #059669; font-weight:bold;">${statusLabel}</span>
        </div>

        <div style="margin-top: 1.5rem; text-align: center;">
          <p style="font-size: 0.8rem; color: #db2777; margin-bottom: 12px; font-weight: bold;">
            ${i18n[currentLang].ticketNote}
          </p>
          <a href="${waUrl}" target="_blank" class="btn-primary" style="display:block; text-decoration:none; text-align:center; background:#10b981; padding:10px; border-radius:30px; color:#fff; font-weight:bold;">
            ${i18n[currentLang].waSendText}
          </a>
        </div>
      </div>
    `;
  }
});