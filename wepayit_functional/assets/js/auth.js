// Modificación del sistema de autenticación para permitir acceso directo
document.addEventListener('DOMContentLoaded', function() {
    // Crear un usuario automático para acceso directo
    const autoUser = {
        id: 'auto-user-' + Date.now(),
        name: 'Usuario Demo',
        email: 'demo@wepayit.com',
        createdAt: new Date().toISOString()
    };
    
    // Guardar usuario en localStorage si no existe
    if (!localStorage.getItem('wepayit_current_user')) {
        localStorage.setItem('wepayit_current_user', JSON.stringify(autoUser));
        
        // Crear algunos datos de ejemplo para la demostración
        createDemoData(autoUser);
    }
    
    // Actualizar la interfaz para mostrar el usuario actual
    updateUserInterface();
    
    // Añadir evento para el botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // En lugar de cerrar sesión, redirigir al dashboard
            window.location.href = 'dashboard.html';
        });
    }
});

// Función para actualizar la interfaz de usuario
function updateUserInterface() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    
    if (currentUser) {
        // Ocultar enlaces de autenticación
        const authLinks = document.querySelectorAll('.auth-link');
        authLinks.forEach(link => {
            link.style.display = 'none';
        });
        
        // Mostrar enlaces de usuario
        const userLinks = document.querySelectorAll('.user-link');
        userLinks.forEach(link => {
            link.style.display = 'block';
        });
        
        // Actualizar nombre de usuario
        const userNameElements = document.querySelectorAll('.user-name');
        userNameElements.forEach(element => {
            element.textContent = currentUser.name;
        });
        
        // Actualizar mensaje de bienvenida si existe
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            welcomeMessage.textContent = `¡Bienvenido, ${currentUser.name}!`;
        }
        
        // Si estamos en la página de inicio, redirigir al dashboard
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            // Comprobar si el usuario llegó directamente a la página de inicio
            const directAccess = sessionStorage.getItem('direct_access');
            
            if (!directAccess) {
                sessionStorage.setItem('direct_access', 'true');
                window.location.href = 'dashboard.html';
            }
        }
    } else {
        // Si no hay usuario, redirigir a la página de inicio desde páginas protegidas
        const protectedPages = ['dashboard.html', 'groups.html', 'expenses.html', 'games.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'index.html';
        }
    }
}

// Función para crear datos de demostración
function createDemoData(user) {
    // Crear usuarios de ejemplo
    const demoUsers = [
        {
            id: 'user-1',
            name: 'Ana García',
            email: 'ana@example.com',
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-2',
            name: 'Carlos Rodríguez',
            email: 'carlos@example.com',
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-3',
            name: 'Laura Martínez',
            email: 'laura@example.com',
            createdAt: new Date().toISOString()
        },
        {
            id: 'user-4',
            name: 'Miguel Sánchez',
            email: 'miguel@example.com',
            createdAt: new Date().toISOString()
        }
    ];
    
    // Añadir el usuario actual a la lista
    demoUsers.push(user);
    
    // Guardar usuarios en localStorage
    localStorage.setItem('wepayit_users', JSON.stringify(demoUsers));
    
    // Crear grupos de ejemplo
    const demoGroups = [
        {
            id: 'group-1',
            name: 'Viaje a Barcelona',
            description: 'Gastos del viaje a Barcelona del 15 al 20 de mayo',
            members: [user, demoUsers[0], demoUsers[1]],
            createdBy: user.id,
            createdAt: new Date().toISOString()
        },
        {
            id: 'group-2',
            name: 'Piso compartido',
            description: 'Gastos mensuales del piso compartido',
            members: [user, demoUsers[2], demoUsers[3]],
            createdBy: user.id,
            createdAt: new Date().toISOString()
        },
        {
            id: 'group-3',
            name: 'Cena de cumpleaños',
            description: 'Gastos de la cena de cumpleaños de Miguel',
            members: [user, demoUsers[0], demoUsers[1], demoUsers[2], demoUsers[3]],
            createdBy: demoUsers[3].id,
            createdAt: new Date().toISOString()
        }
    ];
    
    // Guardar grupos en localStorage
    localStorage.setItem('wepayit_groups', JSON.stringify(demoGroups));
    
    // Crear gastos de ejemplo
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const demoExpenses = [
        {
            id: 'expense-1',
            description: 'Cena en restaurante',
            amount: 120,
            category: 'food',
            date: today.toISOString().split('T')[0],
            groupId: 'group-3',
            paidBy: user.id,
            participants: [
                { id: user.id, share: 24 },
                { id: 'user-1', share: 24 },
                { id: 'user-2', share: 24 },
                { id: 'user-3', share: 24 },
                { id: 'user-4', share: 24 }
            ],
            splitType: 'equal',
            createdAt: today.toISOString()
        },
        {
            id: 'expense-2',
            description: 'Alquiler mayo',
            amount: 900,
            category: 'housing',
            date: yesterday.toISOString().split('T')[0],
            groupId: 'group-2',
            paidBy: user.id,
            participants: [
                { id: user.id, share: 300 },
                { id: 'user-3', share: 300 },
                { id: 'user-4', share: 300 }
            ],
            splitType: 'equal',
            createdAt: yesterday.toISOString()
        },
        {
            id: 'expense-3',
            description: 'Billetes de tren',
            amount: 150,
            category: 'transport',
            date: lastWeek.toISOString().split('T')[0],
            groupId: 'group-1',
            paidBy: 'user-1',
            participants: [
                { id: user.id, share: 50 },
                { id: 'user-1', share: 50 },
                { id: 'user-2', share: 50 }
            ],
            splitType: 'equal',
            createdAt: lastWeek.toISOString()
        },
        {
            id: 'expense-4',
            description: 'Hotel en Barcelona',
            amount: 450,
            category: 'travel',
            date: lastWeek.toISOString().split('T')[0],
            groupId: 'group-1',
            paidBy: 'user-2',
            participants: [
                { id: user.id, share: 150 },
                { id: 'user-1', share: 150 },
                { id: 'user-2', share: 150 }
            ],
            splitType: 'equal',
            createdAt: lastWeek.toISOString()
        }
    ];
    
    // Guardar gastos en localStorage
    localStorage.setItem('wepayit_expenses', JSON.stringify(demoExpenses));
    
    // Crear notificaciones de ejemplo
    const demoNotifications = [
        {
            id: 'notification-1',
            type: 'expense',
            expenseId: 'expense-1',
            groupId: 'group-3',
            groupName: 'Cena de cumpleaños',
            createdBy: user.id,
            createdAt: today.toISOString(),
            read: false
        },
        {
            id: 'notification-2',
            type: 'group',
            groupId: 'group-1',
            groupName: 'Viaje a Barcelona',
            createdBy: user.id,
            createdAt: lastWeek.toISOString(),
            read: true
        }
    ];
    
    // Guardar notificaciones en localStorage
    localStorage.setItem('wepayit_notifications', JSON.stringify(demoNotifications));
    
    // Crear logros de ejemplo para el usuario
    const demoAchievements = ['first_expense', 'group_creator'];
    
    // Guardar logros en localStorage
    localStorage.setItem(`wepayit_achievements_${user.id}`, JSON.stringify(demoAchievements));
}
