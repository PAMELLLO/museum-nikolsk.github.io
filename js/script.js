// Мобильное меню
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav ul');

menuToggle.addEventListener('click', () => {
    mainNav.classList.toggle('show');
});

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Анимация при прокрутке
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Наблюдаем за карточками
document.querySelectorAll('.exhibition-card, .news-card, .info-item, .staff-member, .collection-category, .excursion-option, .service-item, .staff-contact, .social-platform').forEach(item => {
    item.style.opacity = 0;
    item.style.transform = 'translateY(20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(item);
});

// Текущая дата в футере
const now = new Date();
document.querySelector('.footer-bottom p').innerHTML =
    `© ${now.getFullYear()} Краеведческий музей Никольска. Все права защищены.`;

// Валидация формы обратной связи
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Простая валидация
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                alert('Пожалуйста, заполните все обязательные поля.');
                return;
            }

            // Проверка email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Пожалуйста, введите корректный email.');
                return;
            }

            // Имитация отправки формы
            alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
            contactForm.reset();
        });
    }

    // Валидация формы бронирования экскурсии
    const bookingForm = document.querySelector('.excursion-booking');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const phone = this.querySelector('input[type="tel"]').value;

            if (!name || !email) {
                alert('Пожалуйста, заполните обязательные поля.');
                return;
            }

            alert('Ваша экскурсия забронирована! Мы свяжемся с вами для подтверждения.');
            bookingForm.reset();
        });
    }
});

// Проверка, если iframe карты не загрузился
window.addEventListener('load', () => {
    const mapIframes = document.querySelectorAll('iframe[src*="google.com/maps"]');
    mapIframes.forEach(map => {
        if (!map.src.includes('google.com/maps')) {
            console.warn('Карта не загружена. Проверьте URL в iframe.');
        }
    });
});

// Добавление текущего года в заголовки страниц
document.addEventListener('DOMContentLoaded', function () {
    const yearSpan = document.createElement('span');
    yearSpan.textContent = new Date().getFullYear();

    // Добавляем год в заголовки, если нужно
    const titleElements = document.querySelectorAll('h1, h2, h3');
    titleElements.forEach(el => {
        if (el.textContent.includes('2026')) {
            el.innerHTML = el.innerHTML.replace('2026', `<span style="color:${getComputedStyle(document.documentElement).getPropertyValue('--accent-color')}">${yearSpan.textContent}</span>`);
        }
    });
});
