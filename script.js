document.addEventListener('DOMContentLoaded', () => {
  const bgTitle = document.getElementById('bg-title-yashu');
  const modelImg = document.getElementById('model-img');
  const body = document.body;
  const navLinks = document.querySelectorAll('.nav-link');
  const header = document.querySelector('header');

  // Change header background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Handle active states on navigation
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Premium Parallax Effect
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Calculate percentage offset from center (-0.5 to 0.5)
    const offsetX = (mouseX / w) - 0.5;
    const offsetY = (mouseY / h) - 0.5;

    // 1. Shift the background title slightly in opposite direction
    if (bgTitle) {
      bgTitle.style.transform = `scaleY(1.35) translate3d(${offsetX * -30}px, ${offsetY * -15}px, 0)`;
    }

    // 2. Shift the model image slightly in direction of cursor for depth
    if (modelImg) {
      modelImg.style.transform = `translate3d(${offsetX * 20}px, ${offsetY * 10}px, 0)`;
    }

    // 3. Shift the radial gradient spotlight center
    const spotlightX = 50 + (offsetX * 10);
    const spotlightY = 35 + (offsetY * 10);
    body.style.background = `radial-gradient(circle at ${spotlightX}% ${spotlightY}%, #680643 0%, #3d052b 40%, #1e021e 80%, #0d010e 100%)`;
  });

  // Auto Horizontal Scrolling Slider Loop for About Me Section
  const aboutSlider = document.getElementById('about-slider');
  const slides = document.querySelectorAll('.about-slide');
  if (aboutSlider && slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      aboutSlider.style.transform = `translateX(-${currentSlide * 100}%)`;
    }, 2800); // 2s pause + 0.8s CSS transition time
  }

  // Horizontal Scroll on Scroll for Portfolio Section
  const portfolioContainer = document.querySelector('.portfolio-scroll-container');
  const horizontalTrack = document.querySelector('.portfolio-horizontal-track');

  if (portfolioContainer && horizontalTrack) {
    window.addEventListener('scroll', () => {
      const rect = portfolioContainer.getBoundingClientRect();
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;

      // Scroll progress relative to the container's scrollable height
      const totalScrollable = containerHeight - windowHeight;
      const scrolled = -rect.top; // scroll offset inside container

      if (scrolled >= 0 && scrolled <= totalScrollable) {
        const progress = scrolled / totalScrollable;
        const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
        horizontalTrack.style.transform = `translateX(-${progress * maxTranslate}px)`;
      } else if (scrolled < 0) {
        horizontalTrack.style.transform = 'translateX(0px)';
      } else if (scrolled > totalScrollable) {
        const maxTranslate = horizontalTrack.scrollWidth - window.innerWidth;
        horizontalTrack.style.transform = `translateX(-${maxTranslate}px)`;
      }
    });
  }

  // Lightbox Functionality with Albums
  const portfolioPanels = document.querySelectorAll('.portfolio-slide-panel');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  let albumImages = [];
  let currentAlbumIndex = 0;
  let currentTitle = '';
  let currentDesc = '';

  const updateLightboxContent = () => {
    if (albumImages.length > 0) {
      lightboxImg.src = albumImages[currentAlbumIndex];
      lightboxImg.alt = `${currentTitle} - ${currentDesc}`;
      
      // Update description with image counter if it's an album
      if (albumImages.length > 1) {
        lightboxDesc.textContent = `${currentDesc} (${currentAlbumIndex + 1}/${albumImages.length})`;
      } else {
        lightboxDesc.textContent = currentDesc;
      }
    }
  };

  if (portfolioPanels.length > 0 && lightbox) {
    portfolioPanels.forEach(panel => {
      panel.addEventListener('click', () => {
        const link = panel.getAttribute('data-link');
        if (link) {
          window.location.href = link;
          return;
        }

        const albumStr = panel.getAttribute('data-album') || '';
        albumImages = albumStr.split(',').filter(src => src.trim() !== '');
        currentAlbumIndex = 0;
        currentTitle = panel.getAttribute('data-title') || '';
        currentDesc = panel.getAttribute('data-desc') || '';

        lightboxTitle.textContent = currentTitle;
        updateLightboxContent();

        // Toggle navigation arrows visibility depending on album size
        if (albumImages.length > 1) {
          if (lightboxPrev) lightboxPrev.style.display = 'flex';
          if (lightboxNext) lightboxNext.style.display = 'flex';
        } else {
          if (lightboxPrev) lightboxPrev.style.display = 'none';
          if (lightboxNext) lightboxNext.style.display = 'none';
        }

        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
      });
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      setTimeout(() => {
        lightboxImg.src = '';
        lightboxTitle.textContent = '';
        lightboxDesc.textContent = '';
        albumImages = [];
        currentAlbumIndex = 0;
      }, 400); // Wait for transition
    };

    const nextImage = () => {
      if (albumImages.length > 1) {
        currentAlbumIndex = (currentAlbumIndex + 1) % albumImages.length;
        updateLightboxContent();
      }
    };

    const prevImage = () => {
      if (albumImages.length > 1) {
        currentAlbumIndex = (currentAlbumIndex - 1 + albumImages.length) % albumImages.length;
        updateLightboxContent();
      }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);

    // Close on clicking backdrop
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard controls (Esc, Arrow Left, Arrow Right)
    document.addEventListener('keydown', (e) => {
      if (lightbox.classList.contains('active')) {
        if (e.key === 'Escape') {
          closeLightbox();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'ArrowLeft') {
          prevImage();
        }
      }
    });
  }
});
