// Common theme utilities
document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('slide-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply to elements with .animate-on-scroll class
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });

    // Mobile menu toggle (simple)
    const mobileMenuBtn = document.createElement('div');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '☰';
    mobileMenuBtn.style.cssText = `
        display: none;
        color: #fff;
        font-size: 1.5rem;
        cursor: pointer;
    `;
    
    const nav = document.querySelector('nav');
    if (nav) {
        nav.appendChild(mobileMenuBtn);
        
        // basic media query handling for menu
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
        }
        window.addEventListener('resize', () => {
            mobileMenuBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
        });
    }
});
