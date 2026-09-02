document.addEventListener('DOMContentLoaded', function() {
      // --- GESTION DU MODE SOMBRE ---
      const darkToggle = document.getElementById('darkToggle');
      const body = document.body;
      const navbar = document.querySelector('.navbar');
      const themeKey = 'jp_dark';

      function applyTheme() {
          const isDarkMode = localStorage.getItem(themeKey) === '1';
          if (isDarkMode) {
              body.classList.add('dark-mode');
              if (navbar) {
                  navbar.classList.add('dark-theme');
                  navbar.classList.remove('light-theme');
              }
          } else {
              body.classList.remove('dark-mode');
              if (navbar) {
                  navbar.classList.add('light-theme');
                  navbar.classList.remove('dark-theme');
              }
          }
      }

      // Applique le thème au chargement de la page
      applyTheme();

      if (darkToggle) {
          darkToggle.addEventListener('click', () => {
              const isDarkMode = body.classList.toggle('dark-mode');
              localStorage.setItem(themeKey, isDarkMode ? '1' : '0');
              applyTheme();
          });
      }

      // --- EFFET DE DÉFILEMENT DE LA BARRE DE NAVIGATION ---
      window.addEventListener('scroll', function() {
          if (!navbar) return;
          if (window.scrollY > 50) {
              navbar.classList.add('scrolled');
          } else {
              navbar.classList.remove('scrolled');
          }
      });
    });
