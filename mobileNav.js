document.addEventListener('DOMContentLoaded', function() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (toggle && navLinks) {
        toggle.addEventListener('click', function() {
            const expanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', String(!expanded));
            document.body.classList.toggle('nav-open');
            navLinks.style.display = expanded ? 'none' : 'flex';
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!toggle.contains(e.target) && !navLinks.contains(e.target)) {
                document.body.classList.remove('nav-open');
                toggle.setAttribute('aria-expanded', 'false');
                navLinks.style.display = 'none';
            }
        });
    }
});