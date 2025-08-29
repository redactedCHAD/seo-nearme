/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Modal Logic ---
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const overlay = document.getElementById('modal-overlay');

  if (!overlay) {
    console.error('Modal overlay not found!');
  } else {
    const openModal = (modal) => {
      if (modal) {
        modal.classList.remove('hidden');
        overlay.classList.remove('hidden');
        document.body.classList.add('modal-open');
      }
    };

    const closeModal = (modal) => {
      if (modal) {
        modal.classList.add('hidden');
        overlay.classList.add('hidden');
        document.body.classList.remove('modal-open');
      }
    };

    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.getAttribute('data-modal-target');
        const modal = document.getElementById(modalId);
        if (modal) {
          openModal(modal);
        } else {
          console.error(`Modal with ID "${modalId}" not found.`);
        }
      });
    });

    const closeButtons = document.querySelectorAll('.modal-close-btn');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const modal = button.closest('.modal');
        closeModal(modal);
      });
    });

    overlay.addEventListener('click', () => {
      const activeModal = document.querySelector('.modal:not(.hidden)');
      if (activeModal) {
        closeModal(activeModal);
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('.modal:not(.hidden)');
        if (activeModal) {
          closeModal(activeModal);
        }
      }
    });
  }

  // --- 2. Scrolled Header Logic ---
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // --- 3. Smooth Scroll Logic ---
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      const targetElement = document.querySelector(href);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // --- 4. FAQ Accordion Logic ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    // FIX: Cast querySelector results to specific HTML element types to avoid type errors.
    const questionButton = item.querySelector<HTMLButtonElement>('.faq-question');
    const answerPanel = item.querySelector<HTMLElement>('.faq-answer');

    if (questionButton && answerPanel) {
      questionButton.addEventListener('click', () => {
        const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

        // FIX: The setAttribute method requires a string value. Convert the boolean to a string.
        questionButton.setAttribute('aria-expanded', String(!isExpanded));
        if (!isExpanded) {
          // Expand
          answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
        } else {
          // Collapse
          answerPanel.style.maxHeight = '0px';
        }
      });
    }
  });


  // --- 5. Scroll Animation Logic ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1
  });

  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  revealElements.forEach(element => {
    observer.observe(element);
  });

  // --- 6. Interactive Tilt Effect ---
  const cardsToTilt = document.querySelectorAll<HTMLElement>('.card.clickable, .pricing-card');

  cardsToTilt.forEach(card => {
    const isMostPopular = card.classList.contains('most-popular');
    const initialTransform = isMostPopular ? 'perspective(1000px) scale(1.05)' : 'perspective(1000px) scale(1)';

    // Set initial state for the most popular card
    if (isMostPopular) {
        card.style.transform = initialTransform;
    }

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = rect;

      const rotateX = (y / height - 0.5) * -20;
      const rotateY = (x / width - 0.5) * 20;
      const hoverBase = isMostPopular ? 'scale(1.08)' : 'scale(1.03)';
      const hoverTransform = `translateY(-8px) ${hoverBase}`;

      card.style.transition = 'transform 0.1s linear';
      card.style.transform = `perspective(1000px) ${hoverTransform} rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = initialTransform;
    });
  });

});