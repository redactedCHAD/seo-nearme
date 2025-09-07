/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. Scrolled Header Logic ---
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

  // --- 2. Smooth Scroll Logic ---
  const navLinks = document.querySelectorAll('nav a[href^="#"]');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        const targetElement = document.querySelector<HTMLElement>(href);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // --- 3. FAQ Accordion Logic ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionButton = item.querySelector<HTMLButtonElement>('.faq-question');
    const answerPanel = item.querySelector<HTMLElement>('.faq-answer');

    if (questionButton && answerPanel) {
      questionButton.addEventListener('click', () => {
        const isExpanded = questionButton.getAttribute('aria-expanded') === 'true';

        questionButton.setAttribute('aria-expanded', String(!isExpanded));
        if (!isExpanded) {
          answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
        } else {
          answerPanel.style.maxHeight = '0px';
        }
      });
    }
  });


  // --- 4. Scroll Animation Logic ---
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

  // --- 5. Interactive Tilt Effect ---
  const cardsToTilt = document.querySelectorAll<HTMLElement>('.card.clickable');

  cardsToTilt.forEach(card => {
    const initialTransform = 'perspective(1000px) scale(1)';

    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { width, height } = rect;

      const rotateX = (y / height - 0.5) * -20;
      const rotateY = (x / width - 0.5) * 20;
      const hoverBase = 'scale(1.03)';
      const hoverTransform = `translateY(-8px) ${hoverBase}`;

      card.style.transition = 'transform 0.1s linear';
      card.style.transform = `perspective(1000px) ${hoverTransform} rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
      card.style.transform = initialTransform;
    });
  });

  // --- 6. Active Nav Link on Scroll Logic ---
  const sections = document.querySelectorAll<HTMLElement>('section[id]');
  const allNavLinks = document.querySelectorAll<HTMLAnchorElement>('nav a');

  const observerOptions = {
    root: null,
    rootMargin: '-70px 0px -50% 0px', // Adjusts the "trigger zone" to be the top part of the viewport
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        allNavLinks.forEach(link => {
          link.classList.remove('active-link');
          const href = link.getAttribute('href');
          if (href && href.includes(id)) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

});
