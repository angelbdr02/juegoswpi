// Funcionalidad para gestionar grupos en WePayIt
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si el usuario está autenticado
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar formulario de creación de grupo
    const createGroupForm = document.getElementById('create-group-form');
    if (createGroupForm) {
        createGroupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createNewGroup();
        });
    }

    // Cargar grupos del usuario
    loadUserGroups();

    // Inicializar formulario de añadir miembros
    const addMemberForm = document.getElementById('add-member-form');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addMemberToGroup();
        });
    }

    // Inicializar botones de eliminar grupo
    const deleteGroupBtns = document.querySelectorAll('.delete-group-btn');
    deleteGroupBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const groupId = this.getAttribute('data-group-id');
            deleteGroup(groupId);
        });
    });

    // Cargar detalles del grupo si estamos en la página de detalles
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');
    if (groupId) {
        loadGroupDetails(groupId);
    }
});

// Crear nuevo grupo
function createNewGroup() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groupName = document.getElementById('group-name').value.trim();
    const groupDescription = document.getElementById('group-description').value.trim();
    
    if (!groupName) {
        alert('Por favor, introduce un nombre para el grupo');
        return;
    }
    
    // Crear nuevo grupo
    const newGroup = {
        id: Date.now().toString(),
        name: groupName,
        description: groupDescription,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        members: [{
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: 'admin',
            joinedAt: new Date().toISOString()
        }],
        expenses: [],
        userBalance: 0
    };
    
    // Guardar grupo en localStorage
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    groups.push(newGroup);
    localStorage.setItem('wepayit_groups', JSON.stringify(groups));
    
    // Mostrar mensaje de éxito
    alert('Grupo creado correctamente');
    
    // Redirigir a la página de detalles del grupo
    window.location.href = `group-details.html?id=${newGroup.id}`;
}

// Cargar grupos del usuario
function loadUserGroups() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === currentUser.id)
    );
    
    const groupsContainer = document.getElementById('user-groups');
    if (!groupsContainer) return;
    
    if (userGroups.length === 0) {
        groupsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>No tienes grupos todavía</p>
                <a href="create-group.html" class="btn btn-primary">Crear grupo</a>
            </div>
        `;
        return;
    }
    
    let groupsHTML = '';
    userGroups.forEach(group => {
        groupsHTML += `
            <div class="group-card" data-group-id="${group.id}">
                <div class="group-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="group-info">
                    <h3>${group.name}</h3>
                    <p>${group.members.length} miembros</p>
                    <p class="group-description">${group.description || 'Sin descripción'}</p>
                </div>
                <div class="group-actions">
                    <button class="btn btn-outline delete-group-btn" data-group-id="${group.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    });
    
    groupsContainer.innerHTML = groupsHTML;
    
    // Añadir evento de clic a las tarjetas de grupo
    const groupCards = document.querySelectorAll('.group-card');
    groupCards.forEach(card => {
        card.addEventListener('click', function() {
            const groupId = this.getAttribute('data-group-id');
            window.location.href = `group-details.html?id=${groupId}`;
        });
    });
    
    // Añadir evento de clic a los botones de eliminar
    const deleteGroupBtns = document.querySelectorAll('.delete-group-btn');
    deleteGroupBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const groupId = this.getAttribute('data-group-id');
            deleteGroup(groupId);
        });
    });
}

// Cargar detalles del grupo
function loadGroupDetails(groupId) {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const group = groups.find(g => g.id === groupId);
    
    if (!group) {
        alert('Grupo no encontrado');
        window.location.href = 'groups.html';
        return;
    }
    
    // Comprobar si el usuario es miembro del grupo
    const isMember = group.members.some(member => member.id === currentUser.id);
    if (!isMember) {
        alert('No tienes permiso para ver este grupo');
        window.location.href = 'groups.html';
        return;
    }
    
    // Actualizar título y descripción del grupo
    const groupTitle = document.getElementById('group-title');
    const groupDescription = document.getElementById('group-description');
    
    if (groupTitle) groupTitle.textContent = group.name;
    if (groupDescription) groupDescription.textContent = group.description || 'Sin descripción';
    
    // Cargar miembros del grupo
    loadGroupMembers(group);
    
    // Cargar gastos del grupo
    loadGroupExpenses(group);
    
    // Cargar balance del grupo
    loadGroupBalance(group);
    
    // Comprobar si el usuario es administrador
    const isAdmin = group.members.find(member => member.id === currentUser.id)?.role === 'admin';
    const adminControls = document.querySelectorAll('.admin-only');
    
    adminControls.forEach(control => {
        control.style.display = isAdmin ? 'block' : 'none';
    });
}

// Cargar miembros del grupo
function loadGroupMembers(group) {
    const membersContainer = document.getElementById('group-members');
    if (!membersContainer) return;
    
    let membersHTML = '';
    group.members.forEach(member => {
        membersHTML += `
            <div class="member-item">
                <div class="member-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>${member.email}</p>
                    <span class="member-role ${member.role === 'admin' ? 'admin' : ''}">${member.role === 'admin' ? 'Administrador' : 'Miembro'}</span>
                </div>
            </div>
        `;
    });
    
    membersContainer.innerHTML = membersHTML;
}

// Cargar gastos del grupo
function loadGroupExpenses(group) {
    const expensesContainer = document.getElementById('group-expenses');
    if (!expensesContainer) return;
    
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const groupExpenses = expenses.filter(expense => expense.groupId === group.id);
    
    if (groupExpenses.length === 0) {
        expensesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No hay gastos en este grupo todavía</p>
                <a href="add-expense.html?group=${group.id}" class="btn btn-primary">Añadir gasto</a>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    groupExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let expensesHTML = '';
    groupExpenses.forEach(expense => {
        const payer = group.members.find(member => member.id === expense.paidBy);
        
        expensesHTML += `
            <div class="expense-item">
                <div class="expense-icon">
                    <i class="fas ${getCategoryIcon(expense.category)}"></i>
                </div>
                <div class="expense-info">
                    <h4>${expense.description}</h4>
                    <p>${formatDate(expense.date)} • Pagó ${payer ? payer.name : 'Desconocido'}</p>
                </div>
                <div class="expense-amount">
                    ${formatCurrency(expense.amount)}
                </div>
            </div>
        `;
    });
    
    expensesContainer.innerHTML = expensesHTML;
}

// Cargar balance del grupo
function loadGroupBalance(group) {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const groupExpenses = expenses.filter(expense => expense.groupId === group.id);
    
    // Calcular balances entre miembros
    const balances = {};
    
    // Inicializar balances a 0
    group.members.forEach(member => {
        balances[member.id] = 0;
    });
    
    // Calcular balances basados en gastos
    groupExpenses.forEach(expense => {
        // El pagador recibe dinero
        balances[expense.paidBy] += expense.amount;
        
        // Los participantes deben dinero
        expense.participants.forEach(participant => {
            balances[participant.id] -= participant.share;
        });
    });
    
    // Mostrar balance del usuario actual
    const userBalance = balances[currentUser.id] || 0;
    const balanceContainer = document.getElementById('user-balance');
    
    if (balanceContainer) {
        if (userBalance > 0) {
            balanceContainer.innerHTML = `
                <div class="balance positive">
                    <h3>Te deben</h3>
                    <p>${formatCurrency(userBalance)}</p>
                </div>
            `;
        } else if (userBalance < 0) {
            balanceContainer.innerHTML = `
                <div class="balance negative">
                    <h3>Debes</h3>
                    <p>${formatCurrency(Math.abs(userBalance))}</p>
                </div>
            `;
        } else {
            balanceContainer.innerHTML = `
                <div class="balance neutral">
                    <h3>Estás en paz</h3>
                    <p>${formatCurrency(0)}</p>
                </div>
            `;
        }
    }
    
    // Mostrar balances de todos los miembros
    const balancesContainer = document.getElementById('member-balances');
    
    if (balancesContainer) {
        let balancesHTML = '';
        
        group.members.forEach(member => {
            const memberBalance = balances[member.id] || 0;
            
            balancesHTML += `
                <div class="member-balance">
                    <div class="member-info">
                        <h4>${member.name}</h4>
                    </div>
                    <div class="balance-amount ${memberBalance > 0 ? 'positive' : memberBalance < 0 ? 'negative' : 'neutral'}">
                        ${formatCurrency(memberBalance)}
                    </div>
                </div>
            `;
        });
        
        balancesContainer.innerHTML = balancesHTML;
    }
}

// Añadir miembro al grupo
function addMemberToGroup() {
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');
    
    if (!groupId) {
        alert('ID de grupo no válido');
        return;
    }
    
    const memberEmail = document.getElementById('member-email').value.trim();
    
    if (!memberEmail) {
        alert('Por favor, introduce un correo electrónico');
        return;
    }
    
    // Buscar usuario por email
    const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
    const user = users.find(u => u.email === memberEmail);
    
    if (!user) {
        alert('Usuario no encontrado. El usuario debe estar registrado en WePayIt.');
        return;
    }
    
    // Buscar grupo
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
        alert('Grupo no encontrado');
        return;
    }
    
    // Comprobar si el usuario ya es miembro
    if (groups[groupIndex].members.some(member => member.id === user.id)) {
        alert('Este usuario ya es miembro del grupo');
        return;
    }
    
    // Añadir usuario al grupo
    groups[groupIndex].members.push({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'member',
        joinedAt: new Date().toISOString()
    });
    
    // Guardar cambios
    localStorage.setItem('wepayit_groups', JSON.stringify(groups));
    
    // Mostrar mensaje de éxito
    alert('Miembro añadido correctamente');
    
    // Recargar detalles del grupo
    loadGroupDetails(groupId);
    
    // Limpiar formulario
    document.getElementById('member-email').value = '';
}

// Eliminar grupo
function deleteGroup(groupId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este grupo? Esta acción no se puede deshacer.')) {
        return;
    }
    
    // Buscar grupo
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const groupIndex = groups.findIndex(g => g.id === groupId);
    
    if (groupIndex === -1) {
        alert('Grupo no encontrado');
        return;
    }
    
    // Eliminar grupo
    groups.splice(groupIndex, 1);
    
    // Guardar cambios
    localStorage.setItem('wepayit_groups', JSON.stringify(groups));
    
    // Mostrar mensaje de éxito
    alert('Grupo eliminado correctamente');
    
    // Recargar página
    window.location.reload();
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(date);
}

// Helper function to get icon for expense category
function getCategoryIcon(category) {
    const icons = {
        'food': 'fa-utensils',
        'transport': 'fa-car',
        'housing': 'fa-home',
        'entertainment': 'fa-film',
        'shopping': 'fa-shopping-bag',
        'utilities': 'fa-bolt',
        'health': 'fa-medkit',
        'travel': 'fa-plane',
        'education': 'fa-graduation-cap',
        'other': 'fa-receipt'
    };
    
    return icons[category] || 'fa-receipt';
}
