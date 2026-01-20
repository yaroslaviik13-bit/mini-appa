// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
let userData = null;

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем Telegram Web App
    tg.ready();
    tg.expand();
    tg.MainButton.hide();

    // Получаем данные пользователя из Telegram
    const initData = tg.initDataUnsafe;
    if (initData.user) {
        userData = initData.user;
        document.getElementById('user-name').textContent = userData.first_name || 'Пользователь';
    }

    // Загружаем данные пользователя
    loadUserData();
    loadHistory();

    // Обновляем кнопку ежедневного бонуса
    updateBonusButton();
});

// Загрузка данных пользователя
async function loadUserData() {
    try {
        // Здесь будет запрос к вашему боту за данными
        // Пока используем мок данные
        const mockData = {
            tokens: 100,
            messages: 42,
            referrals: 5,
            earnedTokens: 250,
            history: [
                { type: 'question', text: 'Как решить уравнение?', time: '10:30', cost: 1 },
                { type: 'photo', text: 'Решение задачи по фото', time: 'Вчера', cost: 3 },
                { type: 'bonus', text: 'Ежедневный бонус', time: '2 дня назад', cost: 50 },
                { type: 'referral', text: 'Приглашен друг', time: 'Неделю назад', cost: 50 }
            ]
        };

        // Обновляем UI
        document.getElementById('tokens').textContent = mockData.tokens;
        document.getElementById('messages').textContent = mockData.messages;
        document.getElementById('referral-count').textContent = mockData.referrals;
        document.getElementById('earned-tokens').textContent = mockData.earnedTokens;

        // Генерируем реферальную ссылку
        if (userData) {
            const botUsername = '@ChatGPTkryt_bot'; // Замените на имя вашего бота
            const refCode = userData.id.toString().slice(-6);
            const refLink = `https://t.me/${botUsername.replace('@', '')}?start=${refCode}`;
            document.getElementById('ref-link').value = refLink;
        }

    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showToast('Ошибка загрузки данных', 'error');
    }
}

// Загрузка истории
function loadHistory() {
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    const mockHistory = [
        { type: 'question', icon: 'fas fa-question', color: '#667eea', text: 'Как решить уравнение?', time: '10:30' },
        { type: 'photo', icon: 'fas fa-camera', color: '#f5576c', text: 'Решение задачи по фото', time: 'Вчера' },
        { type: 'bonus', icon: 'fas fa-gift', color: '#43e97b', text: 'Ежедневный бонус +50 токенов', time: '2 дня назад' },
        { type: 'referral', icon: 'fas fa-user-plus', color: '#4facfe', text: 'Приглашен друг +50 токенов', time: 'Неделю назад' }
    ];

    mockHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-icon" style="background: ${item.color}">
                <i class="${item.icon}"></i>
            </div>
            <div class="history-content">
                <h4>${item.text}</h4>
                <p>${getOperationType(item.type)}</p>
            </div>
            <div class="history-time">${item.time}</div>
        `;
        historyList.appendChild(historyItem);
    });
}

// Получение типа операции
function getOperationType(type) {
    const types = {
        'question': 'Вопрос AI',
        'photo': 'Решение по фото',
        'bonus': 'Бонус',
        'referral': 'Реферал',
        'translate': 'Перевод',
        'story': 'История'
    };
    return types[type] || 'Операция';
}

// Открытие функций
function openFunction(type) {
    const tokens = parseInt(document.getElementById('tokens').textContent);
    const requiredTokens = getRequiredTokens(type);

    if (tokens < requiredTokens) {
        showToast(`Недостаточно токенов! Нужно ${requiredTokens}`, 'error');
        return;
    }

    switch(type) {
        case 'ask':
            openModal('question-modal');
            break;
        case 'photo':
            sendToBot('photo');
            break;
        case 'translate':
            sendToBot('translate');
            break;
        case 'story':
            sendToBot('story');
            break;
    }
}

// Получение стоимости операции
function getRequiredTokens(type) {
    const costs = {
        'ask': 1,
        'photo': 3,
        'translate': 1,
        'story': 5
    };
    return costs[type] || 1;
}

// Отправка вопроса
function sendQuestion() {
    const question = document.getElementById('question-input').value.trim();

    if (!question) {
        showToast('Введите вопрос', 'warning');
        return;
    }

    const data = {
        action: 'ask',
        question: question,
        user_id: userData ? userData.id : null
    };

    sendToBot(data);
    closeModal('question-modal');
    document.getElementById('question-input').value = '';
    showToast('Вопрос отправлен!', 'success');
}

// Отправка данных в бот
function sendToBot(data) {
    if (typeof data === 'string') {
        data = { action: data };
    }

    if (userData) {
        data.user_id = userData.id;
    }

    // Отправляем данные в бот через Telegram Web App
    tg.sendData(JSON.stringify(data));

    // Закрываем Web App
    setTimeout(() => {
        tg.close();
    }, 1000);
}

// Получение ежедневного бонуса
async function claimBonus() {
    const btn = document.getElementById('daily-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        // Имитация запроса
        await new Promise(resolve => setTimeout(resolve, 1000));

        const data = {
            action: 'daily_bonus',
            user_id: userData ? userData.id : null
        };

        sendToBot(data);
        showToast('Бонус получен! Проверьте бота', 'success');

    } catch (error) {
        showToast('Ошибка получения бонуса', 'error');
        btn.disabled = false;
        btn.textContent = 'Забрать';
    }
}

// Обновление кнопки бонуса
function updateBonusButton() {
    const lastClaim = localStorage.getItem('lastBonusClaim');
    const btn = document.getElementById('daily-btn');

    if (lastClaim) {
        const lastDate = new Date(lastClaim);
        const now = new Date();
        const diffHours = Math.floor((now - lastDate) / (1000 * 60 * 60));

        if (diffHours < 24) {
            btn.disabled = true;
            btn.textContent = `Через ${24 - diffHours}ч`;
        }
    }
}

// Реферальная система
function openReferral() {
    openModal('referral-modal');
}

function copyReferralLink() {
    const input = document.getElementById('ref-link');
    input.select();
    input.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(input.value)
        .then(() => {
            showToast('Ссылка скопирована!', 'success');
        })
        .catch(err => {
            console.error('Ошибка копирования:', err);
            showToast('Ошибка копирования', 'error');
        });
}

function shareReferral() {
    const link = document.getElementById('ref-link').value;
    const text = `🎁 Присоединяйся к AI Помощнику! Получи 25 токенов при регистрации:\n${link}`;

    if (tg.isVersionAtLeast('6.0')) {
        tg.shareText(text);
    } else {
        // Альтернативный способ для старых версий
        navigator.clipboard.writeText(text);
        showToast('Текст скопирован в буфер! Поделитесь им с друзьями', 'success');
    }
}

// Открытие промокодов
function openPromo() {
    const data = {
        action: 'promo',
        user_id: userData ? userData.id : null
    };
    sendToBot(data);
}

// Показать секцию
function showSection(section) {
    // Обновляем активную кнопку
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.nav-btn').classList.add('active');

    // Здесь можно реализовать переключение между секциями
    showToast(`Раздел "${section}" в разработке`, 'info');
}

// Обновление данных
function refreshData() {
    const btn = document.querySelector('.refresh-btn i');
    btn.classList.add('fa-spin');

    loadUserData();
    loadHistory();

    setTimeout(() => {
        btn.classList.remove('fa-spin');
        showToast('Данные обновлены!', 'success');
    }, 1000);
}

// Управление модальными окнами
function openModal(modalId) {
    document.getElementById('modal-overlay').style.display = 'block';
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Уведомления
function showToast(message, type = 'info') {
    // Создаем элемент уведомления
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Стили для toast
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#43e97b' : 
                     type === 'error' ? '#f5576c' : 
                     type === 'warning' ? '#ffd166' : '#667eea'};
        color: white;
        border-radius: 10px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        font-weight: 500;
    `;

    document.body.appendChild(toast);

    // Удаляем через 3 секунды
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// CSS анимации для toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Обработка закрытия по клику вне модалки
document.getElementById('modal-overlay').addEventListener('click', function() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    this.style.display = 'none';
    document.body.style.overflow = 'auto';
});