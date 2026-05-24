// Sidebar toggle functionality
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebarToggle');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (!sidebar || !toggle) return;

  sidebar.classList.toggle('open');
  toggle.classList.toggle('open');
  
  const isOpen = sidebar.classList.contains('open');
  
  // Sync ARIA
  toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

  // Handle Overlay
  if (overlay) {
    overlay.style.visibility = isOpen ? 'visible' : 'hidden';
    overlay.style.opacity = isOpen ? '1' : '0';
    overlay.style.pointerEvents = isOpen ? 'auto' : 'none';
  }

  // Focus Trap and Gestures
  if (isOpen) {
      // save previous focused element
      toggle._previousFocus = document.activeElement;
      const focusable = sidebar.querySelectorAll('a, button, input, textarea, [tabindex]:not([tabindex="-1"])');
      const focusables = Array.from(focusable).filter(el => !el.hasAttribute('disabled'));
      if (focusables.length) focusables[0].focus();
      
      // Add swipe to close logic
      let touchStartX = 0;
      const handleTouchStart = (e) => { touchStartX = e.changedTouches[0].screenX; };
      const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        if (touchEndX - touchStartX > 50) {
          toggleSidebar();
          sidebar.removeEventListener('touchstart', handleTouchStart);
          sidebar.removeEventListener('touchend', handleTouchEnd);
        }
      };
      sidebar.addEventListener('touchstart', handleTouchStart, {passive: true});
      sidebar.addEventListener('touchend', handleTouchEnd, {passive: true});

      toggle._trapHandler = function(e){
        if (e.key !== 'Tab') return;
        const first = focusables[0];
        const last = focusables[focusables.length-1];
        if (e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus();
        }
      };
      document.addEventListener('keydown', toggle._trapHandler);
  } else {
    if (toggle._trapHandler) document.removeEventListener('keydown', toggle._trapHandler);
    if (toggle._previousFocus && typeof toggle._previousFocus.focus === 'function') toggle._previousFocus.focus();
    toggle._trapHandler = null; toggle._previousFocus = null;
  }
}

// Slideshow functionality
function initSlideshow(container) {
  const slides = Array.from(container.querySelectorAll('.slide'));
  const dots = Array.from(container.querySelectorAll('.dot'));
  const prevBtn = container.querySelector('.prev');
  const nextBtn = container.querySelector('.next');
  const announcer = container.querySelector('#slideAnnouncer');

  if (!slides.length) return;

  let currentIndex = 0;

  const updateSlides = (index) => {
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    currentIndex = index;

    slides.forEach((slide, idx) => {
      slide.classList.toggle('fade', idx === currentIndex);
      slide.setAttribute('aria-hidden', idx !== currentIndex ? 'true' : 'false');
    });

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
      dot.setAttribute('aria-current', idx === currentIndex ? 'true' : 'false');
    });

    if (announcer) {
      const heading = slides[currentIndex].querySelector('h2')?.textContent || `Slide ${currentIndex + 1}`;
      announcer.textContent = heading;
    }
  };

  const changeSlide = (amount) => updateSlides(currentIndex + amount);
  const goToSlide = (index) => updateSlides(index);

  if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => goToSlide(idx));
  });

  updateSlides(0);

  const intervalId = setInterval(() => changeSlide(1), 5000);

  return {
    changeSlide: (amount = 1) => changeSlide(amount),
    goToSlide: (index) => goToSlide(index),
    stop: () => clearInterval(intervalId),
  };
}

const slideshowContainers = document.querySelectorAll('.slideshow-container');
const slideshows = Array.from(slideshowContainers).map(initSlideshow).filter(Boolean);

function changeSlide(n) {
  if (!slideshows[0]) return;
  slideshows[0].changeSlide(n !== undefined ? n : 1);
}

function currentSlide(n) {
  if (!slideshows[0]) return;
  slideshows[0].goToSlide(n);
}

// Keyboard controls: left/right arrows to change slides, Esc to close sidebar
let slideFocused = false;
document.addEventListener('focusin', (e) => {
  slideFocused = e.target.closest('.slideshow-container') != null;
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' && slideshows[0]) {
    slideshows[0].changeSlide(1);
  }
  if (e.key === 'ArrowLeft' && slideshows[0]) {
    slideshows[0].changeSlide(-1);
  }
  if (e.key === 'Escape') {
    const modal = document.getElementById('enquiryModal');
    if (modal && modal.classList.contains('open')) {
      closeEnquiryModal();
      return;
    }

    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('sidebarToggle');
    if (sidebar && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      if (toggle) toggle.classList.remove('open');
    }
  }
});

// Contact form handling (client-side validation only)
document.addEventListener('DOMContentLoaded', () => {
  _syncSidebarAria();

  const form = document.getElementById('contactForm');
  if (!form) return;

  const showMessage = (type, text) => {
    let el = document.querySelector('.form-message.'+type);
    if (!el){
      el = document.createElement('div');
      el.className = 'form-message ' + type;
      form.parentNode.insertBefore(el, form.nextSibling);
    }
    el.textContent = text;
    el.style.display = 'block';
    setTimeout(()=> el.style.display = 'none', 5000);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (!name || !email || !message) {
      showMessage('error', 'Please fill in all required fields.');
      return;
    }

    // Basic email pattern
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)){
      showMessage('error', 'Please enter a valid email address.');
      return;
    }

    // No backend: fallback to mailto with prefilled subject/body
    const subject = encodeURIComponent('Website Enquiry from ' + name);
    const body = encodeURIComponent(message + '\n\nFrom: ' + name + ' <' + email + '>');
    window.location.href = `mailto:mufamadimulalo@gmail.com?subject=${subject}&body=${body}`;
    showMessage('success', 'Opening your email client to send message...');
    form.reset();
  });
});

// Enquiry modal handling for service pages
function openEnquiryModal(service) {
  const modal = document.getElementById('enquiryModal');
  if (!modal) return;
  const title = modal.querySelector('#enquiryTitle');
  const text = modal.querySelector('.modal-text');
  const submit = modal.querySelector('.enquiry-submit');
  if (title) title.textContent = `Enquiry: ${service}`;
  if (text) text.textContent = `Send a quick enquiry for ${service}. Our team will follow up with details.`;
  if (submit) {
    submit.dataset.service = service;
    submit.dataset.subject = `${service} Enquiry`;
    submit.dataset.body = `Hello Mukoni,%0D%0A%0D%0AI would like to enquire about ${service} services.%0D%0A%0D%0APlease contact me with further details.%0D%0A%0D%0AThank you.`;
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modal.querySelector('.modal-close')?.focus();
}

function closeEnquiryModal() {
  const modal = document.getElementById('enquiryModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.enquiry-trigger').forEach((button) => {
    button.addEventListener('click', () => openEnquiryModal(button.dataset.service));
  });

  const modal = document.getElementById('enquiryModal');
  if (!modal) return;

  modal.querySelector('.modal-close')?.addEventListener('click', closeEnquiryModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeEnquiryModal();
  });

  const submitButton = modal.querySelector('.enquiry-submit');
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      const subject = encodeURIComponent(submitButton.dataset.subject || 'Service Enquiry');
      const body = submitButton.dataset.body || 'Hello Mukoni,%0D%0A%0D%0AI am interested in your services.';
      window.location.href = `mailto:mufamadimulalo@gmail.com?subject=${subject}&body=${body}`;
      closeEnquiryModal();
    });
  }
});

// ---------- Additional UI: animations, WhatsApp and modal form handling ----------
document.addEventListener('DOMContentLoaded', () => {
  // Animate elements into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));

  // Hook enquiry modal form submit (uses mailto fallback)
  const modalForm = document.getElementById('enquiryModalForm');
  const modal = document.getElementById('enquiryModal');
  if (modalForm && modal) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modalForm.name.value.trim();
      const email = modalForm.email.value.trim();
      const company = modalForm.company.value.trim();
      const phone = modalForm.phone.value.trim();
      const message = modalForm.message.value.trim();

      if (!name || !email || !message) {
        alert('Please fill name, email and message.');
        return;
      }

      // Submit to Netlify
      const formData = new FormData(modalForm);
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
      .then(() => {
        alert('Thank you! Your enquiry has been sent.');
        closeEnquiryModal();
        modalForm.reset();
      })
      .catch((error) => alert(error));
    });
  }

  // Make WhatsApp button announce and be focusable
  const wa = document.getElementById('whatsappBtn');
  if (wa) wa.addEventListener('keydown', (e) => { if (e.key === 'Enter') wa.click(); });
});

// Sidebar Services submenu toggle
(function(){
  const toggleBtn = document.querySelector('.sidebar-toggle-services');
  const submenu = document.getElementById('servicesSubmenu');
  const sidebar = document.getElementById('sidebar');
  if (!toggleBtn || !submenu) return;

  function openSub(open){
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      submenu.hidden = false;
      submenu.classList.add('open');
      submenu.style.maxHeight = submenu.scrollHeight + 'px';
    } else {
      submenu.classList.remove('open');
      submenu.style.maxHeight = '0';
      // hide after transition
      setTimeout(()=> submenu.hidden = true, 300);
    }
  }

  // initialize closed
  submenu.hidden = true;
  submenu.style.maxHeight = '0';

  toggleBtn.addEventListener('click', () => {
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    openSub(!isOpen);
  });

  toggleBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleBtn.click(); }
  });

  // Close submenu when sidebar closes
  if (sidebar) {
    const mo = new MutationObserver(() => {
      if (!sidebar.classList.contains('open')) openSub(false);
    });
    mo.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
  }
})();