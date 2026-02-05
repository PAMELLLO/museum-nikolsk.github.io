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

// Наблюдаем за карточками (кроме новостей, которые управляются слайдером)
document.querySelectorAll('.exhibition-card, .info-item, .staff-member, .collection-category, .excursion-option, .service-item, .staff-contact, .social-platform').forEach(item => {
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

// ===================================================================
// ФУНКЦИИ СЛАЙДЕРА НОВОСТЕЙ
// ===================================================================

// Глобальные переменные для слайдера
let newsData = [];
let currentMainIndex = 0; // индекс текущей главной новости
let currentCarouselIndex = 0; // индекс текущего слайда в карусели
let slidesPerPage = 3; // сколько мини-новостей показывать

// Функция для загрузки новостей из Google Sheets
async function loadNews() {
    try {
        // ЗАМЕНИТЕ ЭТУ ССЫЛКУ НА ВАШУ ОПУБЛИКОВАННУЮ ТАБЛИЦУ
        const spreadsheetUrl = 'https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/export?format=csv';

        const response = await fetch(spreadsheetUrl);
        const text = await response.text();

        // Парсим CSV
        const news = parseCSV(text);
        newsData = news;

        // Показываем последнюю новость как основную (если есть)
        if (news.length > 0) {
            currentMainIndex = 0; // первая в списке = последняя по дате
            showMainSlide(currentMainIndex);
        }

        // Показываем остальные в карусели
        renderCarousel();

    } catch (error) {
        console.error('Ошибка загрузки новостей:', error);
        if (document.getElementById('news-main-slide')) {
            document.getElementById('news-main-slide').innerHTML =
                '<div class="error-message">Не удалось загрузить новости. Проверьте подключение к интернету.</div>';
        }
    }
}

// Функция для парсинга CSV
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        const obj = {};

        for (let j = 0; j < headers.length && j < currentLine.length; j++) {
            obj[headers[j].trim()] = currentLine[j].trim();
        }

        // Только если есть заголовок новости
        if (obj['Заголовок']) {
            result.push(obj);
        }
    }

    return result;
}

// Показываем основной слайд (последнюю новость)
function showMainSlide(index) {
    const news = newsData[index];
    if (!news || !document.getElementById('news-main-slide')) return;

    let formattedDate = news['Дата'] || 'Дата не указана';
    if (formattedDate.includes('-')) {
        const dateParts = formattedDate.split('-');
        formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
    }

    const imageUrl = news['Изображение (URL)'] || '';

    // Ограничиваем текст для основного слайда
    let fullText = news['Текст новости'] || '';
    let displayText = fullText;

    // Если текст слишком длинный, ограничиваем его
    if (fullText.length > 500) {
        displayText = fullText.substring(0, 500) + '...';
    }

    const mainSlideHtml = `
        <div class="main-slide">
            ${imageUrl ? `<img src="${imageUrl}" alt="${news['Заголовок'] || 'Новость'}" class="main-slide-image">` : ''}
            <div class="main-slide-content">
                <div class="main-slide-date">${formattedDate}</div>
                <h3>${news['Заголовок'] || 'Без заголовка'}</h3>
                <p class="main-slide-full-text">${displayText}</p>
                ${fullText.length > 500 ? `<button class="read-more-btn" onclick="toggleFullText(this)">Читать полностью</button>` : ''}
            </div>
        </div>
    `;

    document.getElementById('news-main-slide').innerHTML = mainSlideHtml;
}

// Рендерим карусель с мини-новостями
function renderCarousel() {
    if (!document.getElementById('carousel-inner')) return;

    if (newsData.length <= 1) {
        document.getElementById('carousel-inner').innerHTML =
            '<div class="carousel-no-news">Нет других новостей для отображения</div>';
        return;
    }

    // Показываем все новости кроме первой (она уже в основном слайде)
    const miniNews = newsData.slice(1);

    const carouselHtml = miniNews.map((news, index) => {
        let formattedDate = news['Дата'] || 'Дата не указана';
        if (formattedDate.includes('-')) {
            const dateParts = formattedDate.split('-');
            formattedDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;
        }

        const imageUrl = news['Изображение (URL)'] || '';

        // Ограничиваем текст для мини-слайдов
        let shortText = news['Текст новости'] || '';
        if (shortText.length > 100) {
            shortText = shortText.substring(0, 100) + '...';
        }

        return `
            <div class="carousel-slide" onclick="selectMiniSlide(${index})">
                ${imageUrl ? `<img src="${imageUrl}" alt="${news['Заголовок'] || 'Новость'}">` : ''}
                <div class="carousel-slide-content">
                    <div class="carousel-slide-date">${formattedDate}</div>
                    <h4>${news['Заголовок'] || 'Без заголовка'}</h4>
                    <p class="mini-slide-text">${shortText}</p>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('carousel-inner').innerHTML = carouselHtml;

    // Обновляем количество слайдов на странице для адаптивности
    updateSlidesPerPage();
}

// Обновляем количество слайдов на странице
function updateSlidesPerPage() {
    if (!document.querySelector('.carousel-wrapper')) return;

    const containerWidth = document.querySelector('.carousel-wrapper').offsetWidth;
    slidesPerPage = Math.max(1, Math.floor(containerWidth / 270)); // 270px на слайд
    updateCarouselPosition();
}

// Выбор мини-новости из карусели
function selectMiniSlide(index) {
    // Показываем выбранную мини-новость как основную
    currentMainIndex = index + 1; // +1 потому что первая новость исключена из карусели
    showMainSlide(currentMainIndex);

    // Прокручиваем карусель к выбранному слайду
    currentCarouselIndex = index;
    updateCarouselPosition();
}

// Переключение слайдов в карусели
function changeSlide(direction) {
    if (newsData.length <= 1) return;

    const totalSlides = newsData.length - 1; // минус основной слайд

    if (totalSlides <= slidesPerPage) return; // не нужно прокручивать

    currentCarouselIndex += direction;

    if (currentCarouselIndex < 0) {
        currentCarouselIndex = 0;
    } else if (currentCarouselIndex > totalSlides - slidesPerPage) {
        currentCarouselIndex = totalSlides - slidesPerPage;
    }

    updateCarouselPosition();
}

// Обновляем позицию карусели
function updateCarouselPosition() {
    if (!document.getElementById('carousel-inner')) return;

    const translateX = -currentCarouselIndex * (250 + 20); // ширина слайда + gap
    document.getElementById('carousel-inner').style.transform = `translateX(${translateX}px)`;
}

// Функция для показа/скрытия полного текста
function toggleFullText(button) {
    const fullTextElement = button.previousElementSibling;
    const originalText = button.dataset.originalText;

    if (!button.dataset.originalText) {
        // Сохраняем оригинальный текст
        button.dataset.originalText = newsData[currentMainIndex]['Текст новости'] || '';
    }

    if (fullTextElement.textContent.endsWith('...')) {
        // Показываем полный текст
        fullTextElement.textContent = button.dataset.originalText;
        button.textContent = 'Свернуть';
    } else {
        // Показываем сокращенный текст
        let shortText = button.dataset.originalText;
        if (shortText.length > 500) {
            shortText = shortText.substring(0, 500) + '...';
        }
        fullTextElement.textContent = shortText;
        button.textContent = 'Читать полностью';
    }
}

// Обновляем количество слайдов при изменении размера окна
window.addEventListener('resize', updateSlidesPerPage);

// Загружаем новости при загрузке страницы (только если элементы существуют)
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('news-main-slide')) {
        loadNews();
    }
});

// Обновляем новости каждые 5 минут (300000 мс)
setInterval(function () {
    if (document.getElementById('news-main-slide')) {
        loadNews();
    }
}, 300000);
