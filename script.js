// ===================
// Variables globales
// ===================
let categories = JSON.parse(localStorage.getItem('categories')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let events = JSON.parse(localStorage.getItem('events')) || [];

let currentDate = new Date();
let selectedDate = new Date();
let editMode = null; // {type, id}

// ===================
// DOMContentLoaded
// ===================
document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderCalendar(currentDate);
    setupTabs();
    setupModals();
    createToastContainer();
});

// ===================
// Local Storage
// ===================
function saveCategories() {
    localStorage.setItem('categories', JSON.stringify(categories));
    showToast("Categorías actualizadas");
}
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    showToast("Tareas actualizadas");
}
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
    showToast("Eventos actualizados");
}

// ===================
// Tabs
// ===================
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
        });
    });
}

// ===================
// Modales
// ===================
function setupModals() {
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => closeModal(closeBtn.closest('.modal').id));
    });

    window.addEventListener('click', e => {
        document.querySelectorAll('.modal').forEach(modal => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    window.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
        }
    });
}

function openModal(id) {
    document.getElementById(id).style.display = 'block';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
    editMode = null;
}

// ===================
// Toasts
// ===================
function createToastContainer() {
    const div = document.createElement('div');
    div.id = 'toast-container';
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.right = '20px';
    div.style.display = 'flex';
    div.style.flexDirection = 'column';
    div.style.gap = '10px';
    div.style.zIndex = '2000';
    document.body.appendChild(div);
}
function showToast(message) {
    const toast = document.createElement('div');
    toast.innerText = message;
    toast.style.background = '#e91e63';
    toast.style.color = 'white';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '20px';
    toast.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.4s ease';
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 50);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===================
// Categorías
// ===================
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    document.getElementById('categoryForm').reset();
    document.getElementById('categoryModalTitle').innerText = "Nueva Categoría";
    editMode = null;
    openModal('categoryModal');
});

document.getElementById('categoryForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;

    if (editMode?.type === 'category') {
        categories = categories.map(c => c.id === editMode.id ? {...c, name, icon} : c);
        showToast("Categoría editada");
    } else {
        categories.push({ id: Date.now(), name, icon });
    }
    saveCategories();
    renderCategories();
    closeModal('categoryModal');
});

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = categories.length ? '' : `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No tienes categorías aún.</p></div>`;
    categories.forEach(cat => {
        const div = document.createElement('div');
        div.className = 'category-card';
        div.innerHTML = `
            <div class="category-header">
                <div class="category-title"><i class="${cat.icon}"></i> ${cat.name}</div>
                <div class="category-actions">
                    <button class="btn-icon" onclick="editCategory(${cat.id})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon delete" onclick="deleteCategory(${cat.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <button class="add-task-btn" onclick="openTaskModal(${cat.id})"><i class="fas fa-plus"></i> Nueva Tarea</button>
            <div class="tasks-list">${renderTasksForCategory(cat.id)}</div>
        `;
        container.appendChild(div);
    });
}

function editCategory(id) {
    const cat = categories.find(c => c.id === id);
    document.getElementById('categoryName').value = cat.name;
    document.getElementById('categoryIcon').value = cat.icon;
    document.getElementById('categoryModalTitle').innerText = "Editar Categoría";
    editMode = { type: 'category', id };
    openModal('categoryModal');
}

function deleteCategory(id) {
    categories = categories.filter(c => c.id !== id);
    tasks = tasks.filter(t => t.categoryId !== id);
    saveCategories();
    saveTasks();
    renderCategories();
    showToast("Categoría eliminada");
}

// ===================
// Tareas
// ===================
function openTaskModal(categoryId, taskId = null) {
    document.getElementById('taskForm').reset();
    editMode = null;
    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        document.getElementById('taskName').value = task.name;
        document.getElementById('taskDescription').value = task.description;
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskModalTitle').innerText = "Editar Tarea";
        editMode = { type: 'task', id: taskId };
    } else {
        document.getElementById('taskModalTitle').innerText = "Nueva Tarea";
    }

    document.getElementById('taskForm').onsubmit = e => {
        e.preventDefault();
        const name = document.getElementById('taskName').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;

        if (editMode?.type === 'task') {
            tasks = tasks.map(t => t.id === editMode.id ? {...t, name, description, priority} : t);
            showToast("Tarea editada");
        } else {
            tasks.push({ id: Date.now(), name, description, priority, categoryId, completed: false });
            showToast("Tarea añadida");
        }
        saveTasks();
        renderCategories();
        closeModal('taskModal');
    };
    openModal('taskModal');
}

function renderTasksForCategory(categoryId) {
    const relatedTasks = tasks.filter(t => t.categoryId === categoryId);
    return relatedTasks.length ? relatedTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}">
            <div class="task-content">
                <div class="task-name">${task.name}</div>
                <div class="task-description">${task.description || ''}</div>
            </div>
            <div class="task-actions">
                <button class="btn-icon" onclick="toggleTask(${task.id})"><i class="fas fa-check"></i></button>
                <button class="btn-icon" onclick="openTaskModal(${categoryId}, ${task.id})"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('') : `<div class="empty-state"><i class="fas fa-tasks"></i><p>Sin tareas.</p></div>`;
}

function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    saveTasks();
    renderCategories();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderCategories();
    showToast("Tarea eliminada");
}

// ===================
// Calendario y eventos
// ===================
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});
document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

function renderCalendar(date) {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const startDay = monthStart.getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    document.getElementById('currentMonth').innerText = date.toLocaleString('es', { month: 'long', year: 'numeric' });

    const calendar = document.getElementById('calendarGrid');
    calendar.innerHTML = '';
    let dayCounter = 1 - startDay;
    for (let i = 0; i < 42; i++, dayCounter++) {
        const cellDate = new Date(date.getFullYear(), date.getMonth(), dayCounter);
        const dayEvents = events.filter(e => e.date === cellDate.toISOString().split('T')[0]);

        const div = document.createElement('div');
        div.className = 'calendar-day';
        if (cellDate.getMonth() !== date.getMonth()) div.classList.add('other-month');
        if (cellDate.toDateString() === new Date().toDateString()) div.classList.add('today');
        if (dayEvents.length) div.classList.add('has-events');

        div.innerHTML = `<div class="day-number">${cellDate.getDate()}</div>
            <div class="event-dots">${dayEvents.map(()=>'<div class="event-dot"></div>').join('')}</div>`;
        div.onclick = () => showEventsForDay(cellDate);
        calendar.appendChild(div);
    }
}

function showEventsForDay(date) {
    selectedDate = date;
    const container = document.getElementById('dayEvents');
    const dayEvents = events.filter(e => e.date === date.toISOString().split('T')[0]);

    container.innerHTML = dayEvents.length ? dayEvents.map(ev => `
        <div class="event-item">
            <div class="event-content">
                <h4>${ev.title}</h4>
                <p>${ev.description || ''}</p>
            </div>
            <div class="event-time">${ev.time || ''}</div>
        </div>
    `).join('') : `<div class="empty-state"><i class="fas fa-calendar-day"></i><p>No hay eventos.</p></div>`;

    document.getElementById('eventForm').onsubmit = e => {
        e.preventDefault();
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        const time = document.getElementById('eventTime').value;
        events.push({ id: Date.now(), date: selectedDate.toISOString().split('T')[0], title, description, time });
        saveEvents();
        renderCalendar(currentDate);
        showToast("Evento añadido");
        closeModal('eventModal');
    };
    openModal('eventModal');
}

// ===================
// Botones cancelar
// ===================
document.getElementById('cancelCategory').onclick = () => closeModal('categoryModal');
document.getElementById('cancelTask').onclick = () => closeModal('taskModal');
document.getElementById('cancelEvent').onclick = () => closeModal('eventModal');
