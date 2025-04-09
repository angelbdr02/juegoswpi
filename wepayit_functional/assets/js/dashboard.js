// Dashboard functionality for WePayIt
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is authenticated
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load user data
    loadUserData(currentUser.id);
    
    // Load user groups
    loadUserGroups(currentUser.id);
    
    // Load recent expenses
    loadRecentExpenses(currentUser.id);
    
    // Load balance summary
    loadBalanceSummary(currentUser.id);
    
    // Initialize event listeners
    initializeEventListeners();
});

// Load user data
function loadUserData(userId) {
    const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
    const user = users.find(u => u.id === userId);
    
    if (!user) {
        console.error('User not found');
        return;
    }
    
    // Update user name in header
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => el.textContent = user.name);
    
    // Update welcome message
    const welcomeMessage = document.getElementById('welcome-message');
    if (welcomeMessage) {
        welcomeMessage.textContent = `¡Bienvenido, ${user.name}!`;
    }
}

// Load user groups
function loadUserGroups(userId) {
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === userId)
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
                </div>
                <div class="group-balance ${group.userBalance > 0 ? 'positive' : group.userBalance < 0 ? 'negative' : ''}">
                    ${formatCurrency(group.userBalance)}
                </div>
            </div>
        `;
    });
    
    groupsContainer.innerHTML = groupsHTML;
    
    // Add click event to group cards
    const groupCards = document.querySelectorAll('.group-card');
    groupCards.forEach(card => {
        card.addEventListener('click', function() {
            const groupId = this.getAttribute('data-group-id');
            window.location.href = `group-details.html?id=${groupId}`;
        });
    });
}

// Load recent expenses
function loadRecentExpenses(userId) {
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const userExpenses = expenses.filter(expense => 
        expense.paidBy === userId || 
        expense.participants.some(p => p.id === userId)
    );
    
    // Sort by date (newest first)
    userExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Get only the 5 most recent
    const recentExpenses = userExpenses.slice(0, 5);
    
    const expensesContainer = document.getElementById('recent-expenses');
    if (!expensesContainer) return;
    
    if (recentExpenses.length === 0) {
        expensesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No tienes gastos recientes</p>
                <a href="add-expense.html" class="btn btn-primary">Añadir gasto</a>
            </div>
        `;
        return;
    }
    
    let expensesHTML = '';
    recentExpenses.forEach(expense => {
        const isPayer = expense.paidBy === userId;
        const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
        const payer = users.find(u => u.id === expense.paidBy);
        
        expensesHTML += `
            <div class="expense-item" data-expense-id="${expense.id}">
                <div class="expense-icon">
                    <i class="fas ${getCategoryIcon(expense.category)}"></i>
                </div>
                <div class="expense-info">
                    <h4>${expense.description}</h4>
                    <p>${formatDate(expense.date)} • ${isPayer ? 'Pagaste tú' : `Pagó ${payer ? payer.name : 'Desconocido'}`}</p>
                </div>
                <div class="expense-amount ${isPayer ? 'positive' : 'negative'}">
                    ${isPayer ? '+' : '-'}${formatCurrency(expense.amount)}
                </div>
            </div>
        `;
    });
    
    expensesContainer.innerHTML = expensesHTML;
}

// Load balance summary
function loadBalanceSummary(userId) {
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const users = JSON.parse(localStorage.getItem('wepayit_users') || '[]');
    const currentUser = users.find(u => u.id === userId);
    
    if (!currentUser) return;
    
    // Calculate total balance
    let totalPaid = 0;
    let totalOwed = 0;
    
    expenses.forEach(expense => {
        if (expense.paidBy === userId) {
            // User paid for this expense
            totalPaid += expense.amount;
        }
        
        // Check if user is a participant
        const userParticipation = expense.participants.find(p => p.id === userId);
        if (userParticipation) {
            totalOwed += userParticipation.share;
        }
    });
    
    const netBalance = totalPaid - totalOwed;
    
    // Update balance display
    const balanceAmount = document.getElementById('balance-amount');
    const balanceStatus = document.getElementById('balance-status');
    
    if (balanceAmount) {
        balanceAmount.textContent = formatCurrency(Math.abs(netBalance));
        balanceAmount.className = netBalance >= 0 ? 'positive' : 'negative';
    }
    
    if (balanceStatus) {
        if (netBalance > 0) {
            balanceStatus.textContent = 'Te deben';
            balanceStatus.className = 'positive';
        } else if (netBalance < 0) {
            balanceStatus.textContent = 'Debes';
            balanceStatus.className = 'negative';
        } else {
            balanceStatus.textContent = 'Estás en paz';
            balanceStatus.className = '';
        }
    }
    
    // Update charts if they exist
    updateBalanceCharts(totalPaid, totalOwed);
}

// Update balance charts
function updateBalanceCharts(totalPaid, totalOwed) {
    const balanceChartElement = document.getElementById('balance-chart');
    if (!balanceChartElement) return;
    
    // This is a simplified version. In a real app, you would use a charting library
    // like Chart.js to create proper charts
    
    const total = totalPaid + totalOwed;
    const paidPercentage = (totalPaid / total) * 100;
    const owedPercentage = (totalOwed / total) * 100;
    
    balanceChartElement.innerHTML = `
        <div class="chart-container">
            <div class="chart-bar">
                <div class="chart-segment paid" style="width: ${paidPercentage}%"></div>
                <div class="chart-segment owed" style="width: ${owedPercentage}%"></div>
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-color paid"></span>
                    <span>Pagado: ${formatCurrency(totalPaid)}</span>
                </div>
                <div class="legend-item">
                    <span class="legend-color owed"></span>
                    <span>Debido: ${formatCurrency(totalOwed)}</span>
                </div>
            </div>
        </div>
    `;
}

// Initialize event listeners
function initializeEventListeners() {
    // Add expense button
    const addExpenseBtn = document.getElementById('add-expense-btn');
    if (addExpenseBtn) {
        addExpenseBtn.addEventListener('click', function() {
            window.location.href = 'add-expense.html';
        });
    }
    
    // Create group button
    const createGroupBtn = document.getElementById('create-group-btn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', function() {
            window.location.href = 'create-group.html';
        });
    }
    
    // Games button
    const gamesBtn = document.getElementById('games-btn');
    if (gamesBtn) {
        gamesBtn.addEventListener('click', function() {
            window.location.href = 'games.html';
        });
    }
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
