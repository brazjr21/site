// ===== Mobile Nav Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// ===== Quote Carousel =====
const quotes = document.querySelectorAll('.quote');
const dotsContainer = document.querySelector('.quote-dots');
const prevBtn = document.getElementById('prevQuote');
const nextBtn = document.getElementById('nextQuote');
let currentQuote = 0;

// Create dots
quotes.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.classList.add('quote-dot');
  if (i === 0) dot.classList.add('active');
  dot.addEventListener('click', () => goToQuote(i));
  dotsContainer.appendChild(dot);
});

function goToQuote(index) {
  quotes[currentQuote].classList.remove('active');
  dotsContainer.children[currentQuote].classList.remove('active');
  currentQuote = (index + quotes.length) % quotes.length;
  quotes[currentQuote].classList.add('active');
  dotsContainer.children[currentQuote].classList.add('active');
}

prevBtn.addEventListener('click', () => goToQuote(currentQuote - 1));
nextBtn.addEventListener('click', () => goToQuote(currentQuote + 1));

// Auto-advance quotes every 8 seconds
let autoPlay = setInterval(() => goToQuote(currentQuote + 1), 8000);
document.querySelector('.quote-controls').addEventListener('click', () => {
  clearInterval(autoPlay);
  autoPlay = setInterval(() => goToQuote(currentQuote + 1), 8000);
});

// ===== Scroll Reveal for Timeline Steps =====
const timelineSteps = document.querySelectorAll('.timeline-step');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

timelineSteps.forEach(step => observer.observe(step));

// ===== Header background on scroll =====
const header = document.querySelector('.site-header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    header.style.borderBottomColor = 'var(--clr-accent)';
  } else {
    header.style.borderBottomColor = 'var(--clr-border)';
  }
});
