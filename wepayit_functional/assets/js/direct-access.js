// Modificación para permitir acceso directo a las páginas internas
document.addEventListener('DOMContentLoaded', function() {
    // Redirigir automáticamente a la página de dashboard si estamos en index, login o register
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['index.html', 'login.html', 'register.html', ''];
    
    if (publicPages.includes(currentPage)) {
        window.location.href = 'dashboard.html';
    }
    
    // Crear un usuario automático para acceso directo si no existe
    if (!localStorage.getItem('wepayit_current_user')) {
        const autoUser = {
            id: 'auto-user-' + Date.now(),
            name: 'Usuario Demo',
            email: 'demo@wepayit.com',
            createdAt: new Date().toISOString()
        };
        
        localStorage.setItem('wepayit_current_user', JSON.stringify(autoUser));
        
        // Crear datos de ejemplo para la demostración
        createDemoData(autoUser);
    }
});

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
    const demoAchievements = ['first_expense', 'group_creator', 'roulette_master'];
    
    // Guardar logros en localStorage
    localStorage.setItem(`wepayit_achievements_${user.id}`, JSON.stringify(demoAchievements));
}
