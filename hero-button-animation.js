document.querySelector('.cta-button').addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
        });

// smooth-scroll for same-page anchors (won't affect normal links to menu.html)
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href').slice(1);
            var target = document.getElementById(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});