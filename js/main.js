/* =============================================
   Pont Français — Main JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // --- Mobile Menu Toggle ---
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Header scroll effect ---
  const header = document.getElementById('header');
  let lastScrollY = 0;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
  }, { passive: true });

  // --- Smooth scroll for anchor links (fallback) ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop) || 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- Contact Form Handler ---
  const quoteForm = document.getElementById('quoteForm');

  if (quoteForm) {
    quoteForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      // Reset errors
      const errorMessages = this.querySelectorAll('.error-message');
      errorMessages.forEach(el => el.classList.remove('visible'));
      const errorInputs = this.querySelectorAll('.error');
      errorInputs.forEach(el => el.classList.remove('error'));

      // Validate
      let isValid = true;
      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const docDesc = document.getElementById('doc-desc');

      if (!name.value.trim()) {
        showError(name, 'Please enter your name.');
        isValid = false;
      }

      if (!email.value.trim() || !isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email address.');
        isValid = false;
      }

      if (!docDesc.value.trim()) {
        showError(docDesc, 'Please describe your document.');
        isValid = false;
      }

      if (!isValid) return;

      // Build mailto link with form data
      const nameVal = encodeURIComponent(name.value.trim());
      const emailVal = encodeURIComponent(email.value.trim());
      const docDescVal = encodeURIComponent(docDesc.value.trim());
      const wordCountVal = document.getElementById('word-count').value.trim();
      const serviceTypeVal = document.getElementById('service-type').value;
      const messageVal = encodeURIComponent(document.getElementById('message').value.trim());

      const serviceTypeLabel = serviceTypeVal === 'premium' ? 'Premium (Legal/Medical/Technical)' :
                                serviceTypeVal === 'standard' ? 'Standard (General Content)' : 'Not specified';

      const body = `Quote Request Details:%0D%0A%0D%0A
Name: ${nameVal}%0D%0A
Email: ${emailVal}%0D%0A
Document Description: ${docDescVal}%0D%0A
Estimated Word Count: ${wordCountVal || 'Not specified'}%0D%0A
Service Type: ${serviceTypeLabel}%0D%0A
Additional Notes: ${messageVal || 'None'}`;

      const mailtoLink = `mailto:alexmicati@hotmail.com?subject=Quote%20Request%20from%20${nameVal}&body=${body}`;

      // Open mailto as primary action
      window.location.href = mailtoLink;

      // Show success message as fallback
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      try {
        // In production, this would POST to a backend endpoint
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Show success message
        const formContent = this.innerHTML;
        this.innerHTML = `
          <div class="success-message visible">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px; display: block;">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;">Thank you!</p>
            <p>Your quote request has been received. I'll review your details and respond within 24 hours.</p>
          </div>
        `;
      } catch (err) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Something went wrong. Please try again or email me directly.');
      }
    });
  }

  // --- Helper Functions ---
  function showError(input, message) {
    input.classList.add('error');
    const formGroup = input.closest('.form-group');
    if (formGroup) {
      let errorEl = formGroup.querySelector('.error-message');
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        formGroup.appendChild(errorEl);
      }
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // --- Pricing estimate calculator (live word count × rate) ---
  const wordCountInput = document.getElementById('word-count');
  const serviceTypeSelect = document.getElementById('service-type');

  if (wordCountInput && serviceTypeSelect) {
    function updateEstimate() {
      const wordCount = parseInt(wordCountInput.value) || 0;
      const serviceType = serviceTypeSelect.value;
      let rate = 0;
      let rateLabel = '';

      if (serviceType === 'standard') {
        rate = 0.25;
        rateLabel = '$0.25/word';
      } else if (serviceType === 'premium') {
        rate = 0.40;
        rateLabel = '$0.40/word';
      }

      // Look for or create an estimate display
      let estimateEl = document.querySelector('.live-estimate');
      if (!estimateEl && wordCount > 0 && rate > 0) {
        estimateEl = document.createElement('div');
        estimateEl.className = 'live-estimate';
        estimateEl.style.cssText = `
          margin-top: 12px;
          padding: 12px 16px;
          background: rgba(201, 168, 76, 0.08);
          border-radius: 6px;
          font-size: 0.9rem;
          color: #1a2a3a;
        `;
        wordCountInput.closest('.form-group').appendChild(estimateEl);
      }

      if (estimateEl && wordCount > 0 && rate > 0) {
        const estimated = Math.max(wordCount * rate, 70);
        estimateEl.innerHTML = `
          <strong>Estimated price:</strong> ~$${estimated.toFixed(2)} CAD
          <span style="color: #6b636b; font-size: 0.85rem;"> (${rateLabel} × ${wordCount} words${estimated === 70 ? ', minimum fee applied' : ''})</span>
        `;
        estimateEl.style.display = 'block';
      } else if (estimateEl) {
        estimateEl.style.display = 'none';
      }
    }

    wordCountInput.addEventListener('input', updateEstimate);
    serviceTypeSelect.addEventListener('change', updateEstimate);
  }

});