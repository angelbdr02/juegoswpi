// Funcionalidad para gestionar gastos en WePayIt
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si el usuario está autenticado
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar formulario de añadir gasto
    const addExpenseForm = document.getElementById('add-expense-form');
    if (addExpenseForm) {
        // Cargar grupos del usuario para el selector
        loadUserGroupsForSelector();
        
        // Inicializar selector de participantes
        initializeParticipantsSelector();
        
        // Manejar envío del formulario
        addExpenseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewExpense();
        });
    }

    // Cargar gastos del usuario
    loadUserExpenses();

    // Cargar detalles del gasto si estamos en la página de detalles
    const urlParams = new URLSearchParams(window.location.search);
    const expenseId = urlParams.get('id');
    if (expenseId) {
        loadExpenseDetails(expenseId);
    }
    
    // Si hay un grupo preseleccionado en la URL
    const groupId = urlParams.get('group');
    if (groupId && document.getElementById('expense-group')) {
        document.getElementById('expense-group').value = groupId;
        // Cargar miembros del grupo seleccionado
        loadGroupMembersForExpense(groupId);
    }
});

// Cargar grupos del usuario para el selector
function loadUserGroupsForSelector() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === currentUser.id)
    );
    
    const groupSelector = document.getElementById('expense-group');
    if (!groupSelector) return;
    
    let optionsHTML = '<option value="">Selecciona un grupo</option>';
    
    userGroups.forEach(group => {
        optionsHTML += `<option value="${group.id}">${group.name}</option>`;
    });
    
    groupSelector.innerHTML = optionsHTML;
    
    // Añadir evento de cambio para cargar miembros del grupo
    groupSelector.addEventListener('change', function() {
        const selectedGroupId = this.value;
        if (selectedGroupId) {
            loadGroupMembersForExpense(selectedGroupId);
        } else {
            // Limpiar selector de participantes
            const participantsContainer = document.getElementById('participants-container');
            if (participantsContainer) {
                participantsContainer.innerHTML = '<p>Selecciona un grupo primero</p>';
            }
        }
    });
}

// Inicializar selector de participantes
function initializeParticipantsSelector() {
    const splitTypeSelector = document.getElementById('split-type');
    if (!splitTypeSelector) return;
    
    splitTypeSelector.addEventListener('change', function() {
        const selectedType = this.value;
        const customAmountsContainer = document.getElementById('custom-amounts-container');
        
        if (selectedType === 'custom' && customAmountsContainer) {
            customAmountsContainer.style.display = 'block';
        } else if (customAmountsContainer) {
            customAmountsContainer.style.display = 'none';
        }
    });
}

// Cargar miembros del grupo para el gasto
function loadGroupMembersForExpense(groupId) {
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const participantsContainer = document.getElementById('participants-container');
    if (!participantsContainer) return;
    
    let participantsHTML = '<h4>Participantes</h4>';
    
    group.members.forEach(member => {
        participantsHTML += `
            <div class="participant-item">
                <input type="checkbox" id="participant-${member.id}" name="participants" value="${member.id}" checked>
                <label for="participant-${member.id}">${member.name}</label>
                <div class="custom-amount-input" style="display: none;">
                    <input type="number" id="amount-${member.id}" name="amount-${member.id}" placeholder="Cantidad" min="0" step="0.01">
                </div>
            </div>
        `;
    });
    
    participantsContainer.innerHTML = participantsHTML;
    
    // Añadir evento de cambio al tipo de división
    const splitTypeSelector = document.getElementById('split-type');
    if (splitTypeSelector) {
        const customAmountInputs = document.querySelectorAll('.custom-amount-input');
        
        splitTypeSelector.addEventListener('change', function() {
            const selectedType = this.value;
            
            customAmountInputs.forEach(input => {
                input.style.display = selectedType === 'custom' ? 'block' : 'none';
            });
        });
    }
}

// Añadir nuevo gasto
function addNewExpense() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    
    // Obtener valores del formulario
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const groupId = document.getElementById('expense-group').value;
    const splitType = document.getElementById('split-type').value;
    
    // Validar campos obligatorios
    if (!description || isNaN(amount) || amount <= 0 || !category || !date || !groupId || !splitType) {
        alert('Por favor, completa todos los campos obligatorios');
        return;
    }
    
    // Obtener participantes seleccionados
    const participantCheckboxes = document.querySelectorAll('input[name="participants"]:checked');
    const participantIds = Array.from(participantCheckboxes).map(checkbox => checkbox.value);
    
    if (participantIds.length === 0) {
        alert('Debes seleccionar al menos un participante');
        return;
    }
    
    // Calcular la parte de cada participante
    let participants = [];
    
    if (splitType === 'equal') {
        // División igualitaria
        const shareAmount = amount / participantIds.length;
        
        participants = participantIds.map(id => ({
            id,
            share: shareAmount
        }));
    } else if (splitType === 'custom') {
        // División personalizada
        let totalCustomAmount = 0;
        
        participants = participantIds.map(id => {
            const customAmount = parseFloat(document.getElementById(`amount-${id}`).value);
            
            if (isNaN(customAmount) || customAmount < 0) {
                alert('Por favor, introduce cantidades válidas para todos los participantes');
                return null;
            }
            
            totalCustomAmount += customAmount;
            
            return {
                id,
                share: customAmount
            };
        });
        
        // Comprobar si hay algún participante nulo (validación fallida)
        if (participants.includes(null)) return;
        
        // Comprobar si la suma de las cantidades personalizadas es igual al total
        if (Math.abs(totalCustomAmount - amount) > 0.01) {
            alert('La suma de las cantidades personalizadas debe ser igual al total del gasto');
            return;
        }
    }
    
    // Crear nuevo gasto
    const newExpense = {
        id: Date.now().toString(),
        description,
        amount,
        category,
        date,
        groupId,
        paidBy: currentUser.id,
        participants,
        splitType,
        createdAt: new Date().toISOString()
    };
    
    // Guardar gasto en localStorage
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    expenses.push(newExpense);
    localStorage.setItem('wepayit_expenses', JSON.stringify(expenses));
    
    // Mostrar mensaje de éxito
    alert('Gasto añadido correctamente');
    
    // Redirigir a la página de detalles del grupo
    window.location.href = `group-details.html?id=${groupId}`;
}

// Cargar gastos del usuario
function loadUserExpenses() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const userExpenses = expenses.filter(expense => 
        expense.paidBy === currentUser.id || 
        expense.participants.some(p => p.id === currentUser.id)
    );
    
    const expensesContainer = document.getElementById('user-expenses');
    if (!expensesContainer) return;
    
    if (userExpenses.length === 0) {
        expensesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No tienes gastos todavía</p>
                <a href="add-expense.html" class="btn btn-primary">Añadir gasto</a>
            </div>
        `;
        return;
    }
    
    // Ordenar por fecha (más reciente primero)
    userExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let expensesHTML = '';
    userExpenses.forEach(expense => {
        const isPayer = expense.paidBy === currentUser.id;
        const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
        const payer = users.find(u => u.id === expense.paidBy);
        
        // Obtener nombre del grupo
        const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
        const group = groups.find(g => g.id === expense.groupId);
        
        expensesHTML += `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-icon">
                    <i class="fas ${getCategoryIcon(expense.category)}"></i>
                </div>
                <div class="expense-info">
                    <h4>${expense.description}</h4>
                    <p>${formatDate(expense.date)} • ${group ? group.name : 'Grupo desconocido'}</p>
                    <p>${isPayer ? 'Pagaste tú' : `Pagó ${payer ? payer.name : 'Desconocido'}`}</p>
                </div>
                <div class="expense-amount ${isPayer ? 'positive' : 'negative'}">
                    ${isPayer ? '+' : '-'}${formatCurrency(expense.amount)}
                </div>
            </div>
        `;
    });
    
    expensesContainer.innerHTML = expensesHTML;
    
    // Añadir evento de clic a los elementos de gasto
    const expenseItems = document.querySelectorAll('.expense-item');
    expenseItems.forEach(item => {
        item.addEventListener('click', function() {
            const expenseId = this.getAttribute('data-expense-id');
            window.location.href = `expense-details.html?id=${expenseId}`;
        });
    });
}

// Cargar detalles del gasto
function loadExpenseDetails(expenseId) {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const expense = expenses.find(e => e.id === expenseId);
    
    if (!expense) {
        alert('Gasto no encontrado');
        window.location.href = 'expenses.html';
        return;
    }
    
    // Comprobar si el usuario es participante o pagador
    const isParticipant = expense.participants.some(p => p.id === currentUser.id);
    const isPayer = expense.paidBy === currentUser.id;
    
    if (!isParticipant && !isPayer) {
        alert('No tienes permiso para ver este gasto');
        window.location.href = 'expenses.html';
        return;
    }
    
    // Obtener información adicional
    const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
    const payer = users.find(u => u.id === expense.paidBy);
    
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const group = groups.find(g => g.id === expense.groupId);
    
    // Actualizar detalles del gasto
    const expenseTitle = document.getElementById('expense-title');
    const expenseAmount = document.getElementById('expense-amount');
    const expenseDate = document.getElementById('expense-date');
    const expenseCategory = document.getElementById('expense-category');
    const expensePayer = document.getElementById('expense-payer');
    const expenseGroup = document.getElementById('expense-group');
    
    if (expenseTitle) expenseTitle.textContent = expense.description;
    if (expenseAmount) expenseAmount.textContent = formatCurrency(expense.amount);
    if (expenseDate) expenseDate.textContent = formatDate(expense.date);
    if (expenseCategory) expenseCategory.textContent = getCategoryName(expense.category);
    if (expensePayer) expensePayer.textContent = payer ? payer.name : 'Desconocido';
    if (expenseGroup) expenseGroup.textContent = group ? group.name : 'Grupo desconocido';
    
    // Cargar participantes
    loadExpenseParticipants(expense);
    
    // Mostrar botones de acción solo si el usuario es el pagador
    const actionButtons = document.querySelectorAll('.payer-only');
    actionButtons.forEach(button => {
        button.style.display = isPayer ? 'block' : 'none';
    });
}

// Cargar participantes del gasto
function loadExpenseParticipants(expense) {
    const participantsContainer = document.getElementById('expense-participants');
    if (!participantsContainer) return;
    
    const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
    
    let participantsHTML = '';
    expense.participants.forEach(participant => {
        const user = users.find(u => u.id === participant.id);
        
        participantsHTML += `
            <div class="participant-item">
                <div class="participant-info">
                    <h4>${user ? user.name : 'Usuario desconocido'}</h4>
                </div>
                <div class="participant-share">
                    ${formatCurrency(participant.share)}
                </div>
            </div>
        `;
    });
    
    participantsContainer.innerHTML = participantsHTML;
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

// Helper function to get name for expense category
function getCategoryName(category) {
    const names = {
        'food': 'Comida',
        'transport': 'Transporte',
        'housing': 'Vivienda',
        'entertainment': 'Entretenimiento',
        'shopping': 'Compras',
        'utilities': 'Servicios',
        'health': 'Salud',
        'travel': 'Viajes',
        'education': 'Educación',
        'other': 'Otros'
    };
    
    return names[category] || 'Otros';
}
