// Características adicionales divertidas para WePayIt
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si el usuario está autenticado
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar generador de excusas
    initializeExcuseGenerator();
    
    // Inicializar calculadora de propinas
    initializeTipCalculator();
    
    // Inicializar sistema de logros
    initializeAchievements();
    
    // Inicializar estadísticas divertidas
    initializeFunStats();
});

// Inicializar generador de excusas para no pagar
function initializeExcuseGenerator() {
    const excuseContainer = document.getElementById('excuse-generator');
    if (!excuseContainer) return;
    
    const generateExcuseBtn = document.getElementById('generate-excuse');
    if (generateExcuseBtn) {
        generateExcuseBtn.addEventListener('click', function() {
            generateRandomExcuse();
        });
    }
}

// Generar excusa aleatoria
function generateRandomExcuse() {
    const excuses = [
        "Me acabo de dar cuenta de que dejé mi cartera en casa.",
        "Mi cuenta bancaria ha sido hackeada esta mañana.",
        "Estoy ahorrando para comprar un unicornio.",
        "Mi gato necesita una operación muy cara.",
        "Acabo de donar todo mi dinero a una ONG de pingüinos.",
        "Mi horóscopo dice que hoy no debo gastar dinero.",
        "Estoy en una relación complicada con mi cuenta bancaria.",
        "Prometí a mi abuela que no gastaría dinero esta semana.",
        "Estoy practicando el minimalismo financiero.",
        "Mi app de banco dice que estoy en modo supervivencia.",
        "Estoy guardando para comprar Bitcoin cuando baje a 1€.",
        "Mi terapeuta me recomendó no pagar cuentas como ejercicio de autocontrol.",
        "Estoy en una huelga personal contra el capitalismo.",
        "Mi economista personal me prohibió gastar hasta el próximo mes.",
        "Acabo de recordar que tengo que pagar el alquiler... de los próximos 6 meses.",
        "Estoy canalizando mi dinero hacia dimensiones alternativas.",
        "Mi cuenta está en cuarentena por sospecha de gastos excesivos.",
        "Juré por Snoopy que no gastaría dinero hoy.",
        "Estoy participando en un experimento científico de abstinencia financiera.",
        "Mi aplicación de presupuesto me ha bloqueado por exceder el límite mensual."
    ];
    
    const randomExcuse = excuses[Math.floor(Math.random() * excuses.length)];
    
    const excuseResult = document.getElementById('excuse-result');
    if (excuseResult) {
        excuseResult.innerHTML = `
            <div class="excuse-card">
                <h3>Tu excusa para hoy:</h3>
                <p class="excuse-text">"${randomExcuse}"</p>
                <div class="excuse-actions">
                    <button id="copy-excuse-btn" class="btn btn-primary">Copiar excusa</button>
                    <button id="share-excuse-btn" class="btn btn-secondary">Compartir</button>
                    <button id="new-excuse-btn" class="btn btn-outline">Nueva excusa</button>
                </div>
            </div>
        `;
        
        // Añadir evento para copiar excusa
        const copyExcuseBtn = document.getElementById('copy-excuse-btn');
        if (copyExcuseBtn) {
            copyExcuseBtn.addEventListener('click', function() {
                navigator.clipboard.writeText(randomExcuse)
                    .then(() => {
                        alert('Excusa copiada al portapapeles');
                    })
                    .catch(err => {
                        console.error('Error al copiar: ', err);
                    });
            });
        }
        
        // Añadir evento para compartir excusa
        const shareExcuseBtn = document.getElementById('share-excuse-btn');
        if (shareExcuseBtn) {
            shareExcuseBtn.addEventListener('click', function() {
                if (navigator.share) {
                    navigator.share({
                        title: 'Mi excusa para no pagar',
                        text: randomExcuse,
                        url: window.location.href
                    })
                    .catch(err => {
                        console.error('Error al compartir: ', err);
                    });
                } else {
                    alert('Tu navegador no soporta la función de compartir');
                }
            });
        }
        
        // Añadir evento para generar nueva excusa
        const newExcuseBtn = document.getElementById('new-excuse-btn');
        if (newExcuseBtn) {
            newExcuseBtn.addEventListener('click', function() {
                generateRandomExcuse();
            });
        }
    }
}

// Inicializar calculadora de propinas
function initializeTipCalculator() {
    const tipCalculator = document.getElementById('tip-calculator');
    if (!tipCalculator) return;
    
    const calculateTipBtn = document.getElementById('calculate-tip');
    if (calculateTipBtn) {
        calculateTipBtn.addEventListener('click', function() {
            calculateTip();
        });
    }
    
    // Añadir evento para actualizar en tiempo real
    const billAmount = document.getElementById('bill-amount');
    const tipPercentage = document.getElementById('tip-percentage');
    const numPeople = document.getElementById('num-people');
    
    if (billAmount && tipPercentage && numPeople) {
        [billAmount, tipPercentage, numPeople].forEach(input => {
            input.addEventListener('input', function() {
                calculateTip();
            });
        });
    }
}

// Calcular propina
function calculateTip() {
    const billAmount = parseFloat(document.getElementById('bill-amount').value) || 0;
    const tipPercentage = parseFloat(document.getElementById('tip-percentage').value) || 0;
    const numPeople = parseInt(document.getElementById('num-people').value) || 1;
    
    if (billAmount <= 0) {
        alert('Por favor, introduce un importe válido');
        return;
    }
    
    if (numPeople <= 0) {
        alert('El número de personas debe ser al menos 1');
        return;
    }
    
    const tipAmount = billAmount * (tipPercentage / 100);
    const totalAmount = billAmount + tipAmount;
    const amountPerPerson = totalAmount / numPeople;
    
    const tipResult = document.getElementById('tip-result');
    if (tipResult) {
        tipResult.innerHTML = `
            <div class="tip-result-card">
                <div class="result-row">
                    <span>Importe de la cuenta:</span>
                    <span>${formatCurrency(billAmount)}</span>
                </div>
                <div class="result-row">
                    <span>Propina (${tipPercentage}%):</span>
                    <span>${formatCurrency(tipAmount)}</span>
                </div>
                <div class="result-row total">
                    <span>Total:</span>
                    <span>${formatCurrency(totalAmount)}</span>
                </div>
                <div class="result-row per-person">
                    <span>Importe por persona:</span>
                    <span>${formatCurrency(amountPerPerson)}</span>
                </div>
                <div class="tip-actions">
                    <button id="add-expense-tip-btn" class="btn btn-primary">Añadir como gasto</button>
                </div>
            </div>
        `;
        
        // Añadir evento para crear gasto
        const addExpenseTipBtn = document.getElementById('add-expense-tip-btn');
        if (addExpenseTipBtn) {
            addExpenseTipBtn.addEventListener('click', function() {
                // Obtener grupos del usuario
                const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
                const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
                const userGroups = groups.filter(group => 
                    group.members.some(member => member.id === currentUser.id)
                );
                
                if (userGroups.length === 0) {
                    alert('Necesitas crear o unirte a un grupo primero');
                    return;
                }
                
                // Mostrar modal para seleccionar grupo
                const modalHTML = `
                    <div class="modal" id="group-select-modal">
                        <div class="modal-content">
                            <span class="close-modal">&times;</span>
                            <h3>Selecciona un grupo</h3>
                            <select id="expense-group-select" class="form-input">
                                ${userGroups.map(group => `
                                    <option value="${group.id}">${group.name}</option>
                                `).join('')}
                            </select>
                            <button id="confirm-group-btn" class="btn btn-primary">Continuar</button>
                        </div>
                    </div>
                `;
                
                // Añadir modal al DOM
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = modalHTML;
                document.body.appendChild(modalContainer);
                
                // Mostrar modal
                const modal = document.getElementById('group-select-modal');
                modal.style.display = 'block';
                
                // Cerrar modal
                const closeModal = document.querySelector('.close-modal');
                closeModal.addEventListener('click', function() {
                    modal.style.display = 'none';
                    modalContainer.remove();
                });
                
                // Confirmar selección de grupo
                const confirmGroupBtn = document.getElementById('confirm-group-btn');
                confirmGroupBtn.addEventListener('click', function() {
                    const groupId = document.getElementById('expense-group-select').value;
                    
                    // Redirigir a la página de añadir gasto con los parámetros
                    window.location.href = `add-expense.html?group=${groupId}&amount=${totalAmount}&description=Cuenta con propina`;
                });
            });
        }
    }
}

// Inicializar sistema de logros
function initializeAchievements() {
    const achievementsContainer = document.getElementById('achievements-container');
    if (!achievementsContainer) return;
    
    // Definir logros posibles
    const achievements = [
        {
            id: 'first_expense',
            title: 'Primer Gasto',
            description: 'Registraste tu primer gasto compartido',
            icon: 'fa-receipt',
            condition: user => {
                const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
                return expenses.some(expense => expense.paidBy === user.id);
            }
        },
        {
            id: 'group_creator',
            title: 'Fundador',
            description: 'Creaste tu primer grupo',
            icon: 'fa-users',
            condition: user => {
                const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
                return groups.some(group => group.createdBy === user.id);
            }
        },
        {
            id: 'big_spender',
            title: 'Gran Gastador',
            description: 'Registraste un gasto de más de 100€',
            icon: 'fa-money-bill-wave',
            condition: user => {
                const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
                return expenses.some(expense => expense.paidBy === user.id && expense.amount >= 100);
            }
        },
        {
            id: 'debt_free',
            title: 'Libre de Deudas',
            description: 'No tienes deudas pendientes',
            icon: 'fa-check-circle',
            condition: user => {
                const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
                let totalOwed = 0;
                
                expenses.forEach(expense => {
                    // Comprobar si el usuario es participante
                    const userParticipation = expense.participants.find(p => p.id === user.id);
                    if (userParticipation && expense.paidBy !== user.id) {
                        totalOwed += userParticipation.share;
                    }
                });
                
                return totalOwed === 0;
            }
        },
        {
            id: 'challenge_accepted',
            title: 'Reto Aceptado',
            description: 'Aceptaste un reto para saldar una deuda',
            icon: 'fa-trophy',
            condition: user => {
                const notifications = JSON.parse(localStorage.getItem('wepayit_notifications') || '[]');
                return notifications.some(notification => 
                    notification.type === 'challenge' && 
                    notification.debtorId === user.id && 
                    notification.status === 'accepted'
                );
            }
        },
        {
            id: 'roulette_master',
            title: 'Maestro de la Ruleta',
            description: 'Usaste la ruleta para decidir quién paga',
            icon: 'fa-circle-notch',
            condition: user => {
                // Este logro se otorga manualmente cuando se usa la ruleta
                const userAchievements = JSON.parse(localStorage.getItem(`wepayit_achievements_${user.id}`) || '[]');
                return userAchievements.includes('roulette_master');
            }
        }
    ];
    
    // Comprobar logros del usuario
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const userAchievements = [];
    
    achievements.forEach(achievement => {
        if (achievement.condition(currentUser)) {
            userAchievements.push(achievement.id);
        }
    });
    
    // Guardar logros del usuario
    localStorage.setItem(`wepayit_achievements_${currentUser.id}`, JSON.stringify(userAchievements));
    
    // Mostrar logros
    let achievementsHTML = '<h3>Tus Logros</h3>';
    
    achievements.forEach(achievement => {
        const isUnlocked = userAchievements.includes(achievement.id);
        
        achievementsHTML += `
            <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-status">
                    ${isUnlocked ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-lock"></i>'}
                </div>
            </div>
        `;
    });
    
    achievementsContainer.innerHTML = achievementsHTML;
}

// Inicializar estadísticas divertidas
function initializeFunStats() {
    const funStatsContainer = document.getElementById('fun-stats-container');
    if (!funStatsContainer) return;
    
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    
    // Calcular estadísticas
    const userExpenses = expenses.filter(expense => 
        expense.paidBy === currentUser.id || 
        expense.participants.some(p => p.id === currentUser.id)
    );
    
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === currentUser.id)
    );
    
    // Total pagado
    let totalPaid = 0;
    expenses.forEach(expense => {
        if (expense.paidBy === currentUser.id) {
            totalPaid += expense.amount;
        }
    });
    
    // Total debido
    let totalOwed = 0;
    expenses.forEach(expense => {
        if (expense.paidBy !== currentUser.id) {
            const userParticipation = expense.participants.find(p => p.id === currentUser.id);
            if (userParticipation) {
                totalOwed += userParticipation.share;
            }
        }
    });
    
    // Categoría más común
    const categories = {};
    userExpenses.forEach(expense => {
        categories[expense.category] = (categories[expense.category] || 0) + 1;
    });
    
    let mostCommonCategory = 'other';
    let maxCount = 0;
    
    for (const category in categories) {
        if (categories[category] > maxCount) {
            maxCount = categories[category];
            mostCommonCategory = category;
        }
    }
    
    // Calcular estadísticas divertidas
    const coffeeEquivalent = Math.round(totalPaid / 3); // Asumiendo que un café cuesta 3€
    const pizzaEquivalent = Math.round(totalPaid / 12); // Asumiendo que una pizza cuesta 12€
    const movieTicketEquivalent = Math.round(totalPaid / 10); // Asumiendo que una entrada de cine cuesta 10€
    
    // Calcular tiempo para recuperar el dinero
    const daysToRecover = Math.ceil(totalOwed / 5); // Asumiendo que se ahorran 5€ al día
    
    // Mostrar estadísticas
    funStatsContainer.innerHTML = `
        <h3>Estadísticas Divertidas</h3>
        
        <div class="fun-stat-card">
            <div class="fun-stat-icon">
                <i class="fas fa-coffee"></i>
            </div>
            <div class="fun-stat-info">
                <h4>Equivalente en café</h4>
                <p>Has pagado el equivalente a <strong>${coffeeEquivalent} cafés</strong></p>
            </div>
        </div>
        
        <div class="fun-stat-card">
            <div class="fun-stat-icon">
                <i class="fas fa-pizza-slice"></i>
            </div>
            <div class="fun-stat-info">
                <h4>Equivalente en pizzas</h4>
                <p>Has pagado el equivalente a <strong>${pizzaEquivalent} pizzas</strong></p>
            </div>
        </div>
        
        <div class="fun-stat-card">
            <div class="fun-stat-icon">
                <i class="fas fa-film"></i>
            </div>
            <div class="fun-stat-info">
                <h4>Equivalente en cine</h4>
                <p>Has pagado el equivalente a <strong>${movieTicketEquivalent} entradas de cine</strong></p>
            </div>
        </div>
        
        <div class="fun-stat-card">
            <div class="fun-stat-icon">
                <i class="fas fa-calendar-day"></i>
            </div>
            <div class="fun-stat-info">
                <h4>Tiempo de recuperación</h4>
                <p>Necesitarías <strong>${daysToRecover} días</strong> ahorrando 5€ diarios para recuperar lo que te deben</p>
            </div>
        </div>
        
        <div class="fun-stat-card">
            <div class="fun-stat-icon">
                <i class="fas ${getCategoryIcon(mostCommonCategory)}"></i>
            </div>
            <div class="fun-stat-info">
                <h4>Tu debilidad</h4>
                <p>Tu categoría de gasto más común es <strong>${getCategoryName(mostCommonCategory)}</strong></p>
            </div>
        </div>
    `;
}

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
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
