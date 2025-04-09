// Juegos y retos interactivos para WePayIt
document.addEventListener('DOMContentLoaded', function() {
    // Comprobar si el usuario está autenticado
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Inicializar la ruleta
    initializeRoulette();
    
    // Inicializar el juego de sorteo aleatorio
    initializeRandomDraw();
    
    // Inicializar los retos para saldar deudas
    initializeChallenges();
    
    // Inicializar la cuenta atrás para pagar
    initializeCountdown();
});

// Inicializar la ruleta "¿Quién paga esta noche?"
function initializeRoulette() {
    const rouletteContainer = document.getElementById('roulette-container');
    if (!rouletteContainer) return;
    
    // Obtener grupos del usuario
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === currentUser.id)
    );
    
    // Crear selector de grupo para la ruleta
    const groupSelector = document.getElementById('roulette-group');
    if (groupSelector) {
        let optionsHTML = '<option value="">Selecciona un grupo</option>';
        
        userGroups.forEach(group => {
            optionsHTML += `<option value="${group.id}">${group.name}</option>`;
        });
        
        groupSelector.innerHTML = optionsHTML;
        
        // Añadir evento de cambio para cargar miembros del grupo
        groupSelector.addEventListener('change', function() {
            const selectedGroupId = this.value;
            if (selectedGroupId) {
                loadRouletteMembers(selectedGroupId);
            } else {
                // Limpiar ruleta
                const rouletteWheel = document.getElementById('roulette-wheel');
                if (rouletteWheel) {
                    rouletteWheel.innerHTML = '<p>Selecciona un grupo primero</p>';
                }
            }
        });
    }
    
    // Botón para girar la ruleta
    const spinButton = document.getElementById('spin-roulette');
    if (spinButton) {
        spinButton.addEventListener('click', function() {
            spinRoulette();
        });
    }
}

// Cargar miembros del grupo para la ruleta
function loadRouletteMembers(groupId) {
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const rouletteWheel = document.getElementById('roulette-wheel');
    if (!rouletteWheel) return;
    
    // Crear la ruleta con los miembros del grupo
    const members = group.members;
    const segmentAngle = 360 / members.length;
    
    // Colores para los segmentos de la ruleta
    const colors = [
        '#4361ee', '#3a56d4', '#7209b7', '#5a0791', '#4cc9f0', 
        '#3ab7de', '#4ade80', '#2ece64', '#fbbf24', '#f59e0b'
    ];
    
    let rouletteHTML = `
        <div class="roulette-center"></div>
        <div class="roulette-arrow"></div>
    `;
    
    members.forEach((member, index) => {
        const startAngle = index * segmentAngle;
        const endAngle = (index + 1) * segmentAngle;
        const color = colors[index % colors.length];
        
        rouletteHTML += `
            <div class="roulette-segment" 
                 style="transform: rotate(${startAngle}deg); 
                        background: linear-gradient(${startAngle}deg, transparent 0%, ${color} 100%);"
                 data-member-id="${member.id}" 
                 data-member-name="${member.name}">
                <span style="transform: rotate(${segmentAngle / 2}deg);">${member.name}</span>
            </div>
        `;
    });
    
    rouletteWheel.innerHTML = rouletteHTML;
    rouletteWheel.classList.add('ready');
    
    // Habilitar botón de girar
    const spinButton = document.getElementById('spin-roulette');
    if (spinButton) {
        spinButton.disabled = false;
    }
}

// Girar la ruleta
function spinRoulette() {
    const rouletteWheel = document.getElementById('roulette-wheel');
    if (!rouletteWheel || !rouletteWheel.classList.contains('ready')) return;
    
    // Deshabilitar botón mientras gira
    const spinButton = document.getElementById('spin-roulette');
    if (spinButton) {
        spinButton.disabled = true;
    }
    
    // Generar un número aleatorio de rotaciones (entre 5 y 10 vueltas completas)
    const rotations = 5 + Math.random() * 5;
    const totalDegrees = rotations * 360;
    
    // Añadir clase de animación
    rouletteWheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.83, 0.67)';
    rouletteWheel.style.transform = `rotate(${totalDegrees}deg)`;
    
    // Esperar a que termine la animación
    setTimeout(() => {
        // Calcular quién ha sido seleccionado
        const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
        const groupId = document.getElementById('roulette-group').value;
        const group = groups.find(g => g.id === groupId);
        
        if (!group) return;
        
        const members = group.members;
        const winnerIndex = Math.floor(Math.random() * members.length);
        const winner = members[winnerIndex];
        
        // Mostrar resultado
        const resultContainer = document.getElementById('roulette-result');
        if (resultContainer) {
            resultContainer.innerHTML = `
                <div class="result-card">
                    <h3>¡${winner.name} paga esta noche!</h3>
                    <p>La ruleta ha decidido. No hay vuelta atrás.</p>
                    <div class="result-actions">
                        <button id="create-expense-btn" class="btn btn-primary">Crear gasto</button>
                        <button id="spin-again-btn" class="btn btn-outline">Girar de nuevo</button>
                    </div>
                </div>
            `;
            
            // Añadir evento para crear gasto
            const createExpenseBtn = document.getElementById('create-expense-btn');
            if (createExpenseBtn) {
                createExpenseBtn.addEventListener('click', function() {
                    window.location.href = `add-expense.html?group=${groupId}&payer=${winner.id}`;
                });
            }
            
            // Añadir evento para girar de nuevo
            const spinAgainBtn = document.getElementById('spin-again-btn');
            if (spinAgainBtn) {
                spinAgainBtn.addEventListener('click', function() {
                    // Limpiar resultado
                    resultContainer.innerHTML = '';
                    
                    // Resetear ruleta
                    rouletteWheel.style.transition = 'none';
                    rouletteWheel.style.transform = 'rotate(0deg)';
                    
                    // Habilitar botón de girar
                    if (spinButton) {
                        spinButton.disabled = false;
                    }
                    
                    // Forzar reflow para que la transición funcione
                    void rouletteWheel.offsetWidth;
                });
            }
        }
    }, 5000);
}

// Inicializar el juego de sorteo aleatorio
function initializeRandomDraw() {
    const randomDrawContainer = document.getElementById('random-draw-container');
    if (!randomDrawContainer) return;
    
    // Obtener grupos del usuario
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === currentUser.id)
    );
    
    // Crear selector de grupo para el sorteo
    const groupSelector = document.getElementById('draw-group');
    if (groupSelector) {
        let optionsHTML = '<option value="">Selecciona un grupo</option>';
        
        userGroups.forEach(group => {
            optionsHTML += `<option value="${group.id}">${group.name}</option>`;
        });
        
        groupSelector.innerHTML = optionsHTML;
        
        // Añadir evento de cambio para cargar miembros del grupo
        groupSelector.addEventListener('change', function() {
            const selectedGroupId = this.value;
            if (selectedGroupId) {
                loadDrawMembers(selectedGroupId);
            } else {
                // Limpiar lista de miembros
                const membersContainer = document.getElementById('draw-members');
                if (membersContainer) {
                    membersContainer.innerHTML = '<p>Selecciona un grupo primero</p>';
                }
            }
        });
    }
    
    // Botón para realizar el sorteo
    const drawButton = document.getElementById('start-draw');
    if (drawButton) {
        drawButton.addEventListener('click', function() {
            startRandomDraw();
        });
    }
}

// Cargar miembros del grupo para el sorteo
function loadDrawMembers(groupId) {
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const membersContainer = document.getElementById('draw-members');
    if (!membersContainer) return;
    
    let membersHTML = '<h4>Participantes del sorteo</h4>';
    
    group.members.forEach(member => {
        membersHTML += `
            <div class="member-item">
                <input type="checkbox" id="draw-member-${member.id}" name="draw-members" value="${member.id}" checked>
                <label for="draw-member-${member.id}">${member.name}</label>
            </div>
        `;
    });
    
    membersContainer.innerHTML = membersHTML;
    
    // Habilitar botón de sorteo
    const drawButton = document.getElementById('start-draw');
    if (drawButton) {
        drawButton.disabled = false;
    }
}

// Realizar sorteo aleatorio
function startRandomDraw() {
    // Obtener miembros seleccionados
    const selectedMembers = document.querySelectorAll('input[name="draw-members"]:checked');
    if (selectedMembers.length < 2) {
        alert('Debes seleccionar al menos 2 participantes para el sorteo');
        return;
    }
    
    // Obtener valores del sorteo
    const drawTitle = document.getElementById('draw-title').value.trim() || 'Sorteo aleatorio';
    const numWinners = parseInt(document.getElementById('num-winners').value) || 1;
    
    if (numWinners < 1 || numWinners >= selectedMembers.length) {
        alert(`El número de ganadores debe estar entre 1 y ${selectedMembers.length - 1}`);
        return;
    }
    
    // Convertir NodeList a Array y mezclar aleatoriamente
    const members = Array.from(selectedMembers).map(checkbox => {
        const memberId = checkbox.value;
        const memberName = checkbox.nextElementSibling.textContent;
        return { id: memberId, name: memberName };
    });
    
    // Mezclar array (algoritmo Fisher-Yates)
    for (let i = members.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [members[i], members[j]] = [members[j], members[i]];
    }
    
    // Seleccionar ganadores
    const winners = members.slice(0, numWinners);
    
    // Mostrar animación de sorteo
    const resultContainer = document.getElementById('draw-result');
    if (resultContainer) {
        resultContainer.innerHTML = `
            <div class="draw-animation">
                <div class="draw-spinner"></div>
                <p>Realizando sorteo...</p>
            </div>
        `;
        
        // Esperar a que termine la animación
        setTimeout(() => {
            let winnersHTML = `
                <div class="result-card">
                    <h3>Resultado del sorteo: ${drawTitle}</h3>
                    <div class="winners-list">
            `;
            
            winners.forEach((winner, index) => {
                winnersHTML += `
                    <div class="winner-item">
                        <div class="winner-number">${index + 1}</div>
                        <div class="winner-name">${winner.name}</div>
                    </div>
                `;
            });
            
            winnersHTML += `
                    </div>
                    <div class="result-actions">
                        <button id="create-expense-draw-btn" class="btn btn-primary">Crear gasto</button>
                        <button id="draw-again-btn" class="btn btn-outline">Sortear de nuevo</button>
                    </div>
                </div>
            `;
            
            resultContainer.innerHTML = winnersHTML;
            
            // Añadir evento para crear gasto
            const createExpenseBtn = document.getElementById('create-expense-draw-btn');
            if (createExpenseBtn) {
                createExpenseBtn.addEventListener('click', function() {
                    const groupId = document.getElementById('draw-group').value;
                    window.location.href = `add-expense.html?group=${groupId}&payer=${winners[0].id}`;
                });
            }
            
            // Añadir evento para sortear de nuevo
            const drawAgainBtn = document.getElementById('draw-again-btn');
            if (drawAgainBtn) {
                drawAgainBtn.addEventListener('click', function() {
                    // Limpiar resultado
                    resultContainer.innerHTML = '';
                    
                    // Habilitar botón de sorteo
                    const drawButton = document.getElementById('start-draw');
                    if (drawButton) {
                        drawButton.disabled = false;
                    }
                });
            }
        }, 3000);
    }
}

// Inicializar los retos para saldar deudas
function initializeChallenges() {
    const challengesContainer = document.getElementById('challenges-container');
    if (!challengesContainer) return;
    
    // Obtener deudas del usuario
    loadUserDebts();
    
    // Botón para generar reto
    const generateChallengeBtn = document.getElementById('generate-challenge');
    if (generateChallengeBtn) {
        generateChallengeBtn.addEventListener('click', function() {
            generateChallenge();
        });
    }
}

// Cargar deudas del usuario
function loadUserDebts() {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const expenses = JSON.parse(localStorage.getItem('wepayit_expenses') || '[]');
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    
    // Calcular deudas por grupo y usuario
    const debts = [];
    
    groups.forEach(group => {
        // Comprobar si el usuario es miembro del grupo
        const isMember = group.members.some(member => member.id === currentUser.id);
        if (!isMember) return;
        
        // Filtrar gastos del grupo
        const groupExpenses = expenses.filter(expense => expense.groupId === group.id);
        
        // Calcular balances
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
        
        // Comprobar si el usuario tiene deudas
        if (balances[currentUser.id] < 0) {
            // Encontrar a quién le debe dinero
            group.members.forEach(member => {
                if (member.id !== currentUser.id && balances[member.id] > 0) {
                    // Calcular cuánto debe el usuario a este miembro
                    const debtAmount = Math.min(Math.abs(balances[currentUser.id]), balances[member.id]);
                    
                    if (debtAmount > 0) {
                        debts.push({
                            groupId: group.id,
                            groupName: group.name,
                            creditorId: member.id,
                            creditorName: member.name,
                            amount: debtAmount
                        });
                    }
                }
            });
        }
    });
    
    // Mostrar deudas
    const debtsContainer = document.getElementById('user-debts');
    if (!debtsContainer) return;
    
    if (debts.length === 0) {
        debtsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <p>¡No tienes deudas pendientes!</p>
            </div>
        `;
        
        // Deshabilitar botón de generar reto
        const generateChallengeBtn = document.getElementById('generate-challenge');
        if (generateChallengeBtn) {
            generateChallengeBtn.disabled = true;
        }
        
        return;
    }
    
    let debtsHTML = '<h4>Tus deudas pendientes</h4>';
    
    debts.forEach(debt => {
        debtsHTML += `
            <div class="debt-item" data-debt-id="${debt.groupId}-${debt.creditorId}">
                <div class="debt-info">
                    <h4>Debes a ${debt.creditorName}</h4>
                    <p>Grupo: ${debt.groupName}</p>
                </div>
                <div class="debt-amount negative">
                    ${formatCurrency(debt.amount)}
                </div>
            </div>
        `;
    });
    
    debtsContainer.innerHTML = debtsHTML;
    
    // Habilitar botón de generar reto
    const generateChallengeBtn = document.getElementById('generate-challenge');
    if (generateChallengeBtn) {
        generateChallengeBtn.disabled = false;
    }
    
    // Guardar deudas en localStorage para usarlas en el generador de retos
    localStorage.setItem('wepayit_current_debts', JSON.stringify(debts));
}

// Generar reto para saldar deuda
function generateChallenge() {
    const debts = JSON.parse(localStorage.getItem('wepayit_current_debts') || '[]');
    if (debts.length === 0) return;
    
    // Seleccionar una deuda aleatoria
    const randomDebt = debts[Math.floor(Math.random() * debts.length)];
    
    // Lista de retos posibles
    const challenges = [
        {
            title: "Karaoke improvisado",
            description: `Canta una canción completa elegida por ${randomDebt.creditorName} en un lugar público para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Camarero por un día",
            description: `Sirve como camarero personal de ${randomDebt.creditorName} durante toda una comida o cena para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Disfraz vergonzoso",
            description: `Usa un disfraz elegido por ${randomDebt.creditorName} durante 2 horas en un lugar público para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Chef personal",
            description: `Prepara una comida gourmet de 3 platos para ${randomDebt.creditorName} y sus amigos para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Reto de baile",
            description: `Aprende y ejecuta una coreografía elegida por ${randomDebt.creditorName} y comparte el video en redes sociales para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Asistente personal",
            description: `Sé el asistente personal de ${randomDebt.creditorName} durante un día completo para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Stand-up comedy",
            description: `Prepara y presenta un monólogo de comedia de 5 minutos frente a ${randomDebt.creditorName} y sus amigos para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        },
        {
            title: "Limpieza a fondo",
            description: `Limpia completamente la casa o apartamento de ${randomDebt.creditorName} para saldar tu deuda de ${formatCurrency(randomDebt.amount)}.`
        }
    ];
    
    // Seleccionar un reto aleatorio
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    // Mostrar el reto
    const challengeResult = document.getElementById('challenge-result');
    if (challengeResult) {
        challengeResult.innerHTML = `
            <div class="challenge-card">
                <h3>${randomChallenge.title}</h3>
                <p>${randomChallenge.description}</p>
                <div class="challenge-actions">
                    <button id="accept-challenge-btn" class="btn btn-primary">Aceptar reto</button>
                    <button id="reject-challenge-btn" class="btn btn-outline">Rechazar y pagar</button>
                    <button id="new-challenge-btn" class="btn btn-secondary">Generar otro reto</button>
                </div>
            </div>
        `;
        
        // Añadir evento para aceptar reto
        const acceptChallengeBtn = document.getElementById('accept-challenge-btn');
        if (acceptChallengeBtn) {
            acceptChallengeBtn.addEventListener('click', function() {
                alert(`¡Has aceptado el reto! Coordina con ${randomDebt.creditorName} para completarlo y saldar tu deuda.`);
                
                // Crear notificación de reto aceptado
                createChallengeNotification(randomDebt, randomChallenge, 'accepted');
                
                // Limpiar resultado
                challengeResult.innerHTML = '';
            });
        }
        
        // Añadir evento para rechazar reto
        const rejectChallengeBtn = document.getElementById('reject-challenge-btn');
        if (rejectChallengeBtn) {
            rejectChallengeBtn.addEventListener('click', function() {
                alert(`Has decidido pagar la deuda de ${formatCurrency(randomDebt.amount)} a ${randomDebt.creditorName} directamente.`);
                
                // Crear notificación de reto rechazado
                createChallengeNotification(randomDebt, randomChallenge, 'rejected');
                
                // Limpiar resultado
                challengeResult.innerHTML = '';
            });
        }
        
        // Añadir evento para generar otro reto
        const newChallengeBtn = document.getElementById('new-challenge-btn');
        if (newChallengeBtn) {
            newChallengeBtn.addEventListener('click', function() {
                // Generar nuevo reto
                generateChallenge();
            });
        }
    }
}

// Crear notificación de reto
function createChallengeNotification(debt, challenge, status) {
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    
    // Crear notificación
    const notification = {
        id: Date.now().toString(),
        type: 'challenge',
        status: status,
        debtorId: currentUser.id,
        debtorName: currentUser.name,
        creditorId: debt.creditorId,
        creditorName: debt.creditorName,
        groupId: debt.groupId,
        groupName: debt.groupName,
        amount: debt.amount,
        challengeTitle: challenge.title,
        challengeDescription: challenge.description,
        createdAt: new Date().toISOString(),
        read: false
    };
    
    // Guardar notificación
    const notifications = JSON.parse(localStorage.getItem('wepayit_notifications') || '[]');
    notifications.push(notification);
    localStorage.setItem('wepayit_notifications', JSON.stringify(notifications));
}

// Inicializar la cuenta atrás para pagar
function initializeCountdown() {
    const countdownContainer = document.getElementById('countdown-container');
    if (!countdownContainer) return;
    
    // Obtener grupos del usuario
    const currentUser = JSON.parse(localStorage.getItem('wepayit_current_user'));
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const userGroups = groups.filter(group => 
        group.members.some(member => member.id === currentUser.id)
    );
    
    // Crear selector de grupo para la cuenta atrás
    const groupSelector = document.getElementById('countdown-group');
    if (groupSelector) {
        let optionsHTML = '<option value="">Selecciona un grupo</option>';
        
        userGroups.forEach(group => {
            optionsHTML += `<option value="${group.id}">${group.name}</option>`;
        });
        
        groupSelector.innerHTML = optionsHTML;
        
        // Añadir evento de cambio para cargar miembros del grupo
        groupSelector.addEventListener('change', function() {
            const selectedGroupId = this.value;
            if (selectedGroupId) {
                loadCountdownMembers(selectedGroupId);
            } else {
                // Limpiar lista de miembros
                const membersContainer = document.getElementById('countdown-members');
                if (membersContainer) {
                    membersContainer.innerHTML = '<p>Selecciona un grupo primero</p>';
                }
            }
        });
    }
    
    // Botón para iniciar cuenta atrás
    const startCountdownBtn = document.getElementById('start-countdown');
    if (startCountdownBtn) {
        startCountdownBtn.addEventListener('click', function() {
            startPaymentCountdown();
        });
    }
}

// Cargar miembros del grupo para la cuenta atrás
function loadCountdownMembers(groupId) {
    const groups = JSON.parse(localStorage.getItem('wepayit_groups') || '[]');
    const group = groups.find(g => g.id === groupId);
    
    if (!group) return;
    
    const membersContainer = document.getElementById('countdown-members');
    if (!membersContainer) return;
    
    let membersHTML = '<h4>Participantes de la cuenta atrás</h4>';
    
    group.members.forEach(member => {
        membersHTML += `
            <div class="member-item">
                <input type="checkbox" id="countdown-member-${member.id}" name="countdown-members" value="${member.id}" checked>
                <label for="countdown-member-${member.id}">${member.name}</label>
            </div>
        `;
    });
    
    membersContainer.innerHTML = membersHTML;
    
    // Habilitar botón de cuenta atrás
    const startCountdownBtn = document.getElementById('start-countdown');
    if (startCountdownBtn) {
        startCountdownBtn.disabled = false;
    }
}

// Iniciar cuenta atrás para pagar
function startPaymentCountdown() {
    // Obtener miembros seleccionados
    const selectedMembers = document.querySelectorAll('input[name="countdown-members"]:checked');
    if (selectedMembers.length < 2) {
        alert('Debes seleccionar al menos 2 participantes para la cuenta atrás');
        return;
    }
    
    // Obtener valores de la cuenta atrás
    const countdownTitle = document.getElementById('countdown-title').value.trim() || 'Cuenta atrás para pagar';
    const countdownDuration = parseInt(document.getElementById('countdown-duration').value) || 30;
    const countdownAmount = parseFloat(document.getElementById('countdown-amount').value) || 0;
    
    if (countdownDuration < 5 || countdownDuration > 60) {
        alert('La duración debe estar entre 5 y 60 segundos');
        return;
    }
    
    if (countdownAmount <= 0) {
        alert('El importe debe ser mayor que 0');
        return;
    }
    
    // Convertir NodeList a Array
    const members = Array.from(selectedMembers).map(checkbox => {
        const memberId = checkbox.value;
        const memberName = checkbox.nextElementSibling.textContent;
        return { id: memberId, name: memberName };
    });
    
    // Iniciar cuenta atrás
    const countdownResult = document.getElementById('countdown-result');
    if (countdownResult) {
        countdownResult.innerHTML = `
            <div class="countdown-card">
                <h3>${countdownTitle}</h3>
                <p>Importe: ${formatCurrency(countdownAmount)}</p>
                <div class="countdown-timer">
                    <div class="countdown-display">${countdownDuration}</div>
                    <div class="countdown-progress">
                        <div class="progress-bar" style="width: 100%"></div>
                    </div>
                </div>
                <p class="countdown-instruction">¡El último en pulsar el botón paga!</p>
                <div class="countdown-buttons">
                    ${members.map(member => `
                        <button class="btn btn-primary countdown-member-btn" data-member-id="${member.id}">
                            ${member.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Deshabilitar botón de iniciar cuenta atrás
        const startCountdownBtn = document.getElementById('start-countdown');
        if (startCountdownBtn) {
            startCountdownBtn.disabled = true;
        }
        
        // Iniciar temporizador
        let timeLeft = countdownDuration;
        const countdownDisplay = document.querySelector('.countdown-display');
        const progressBar = document.querySelector('.progress-bar');
        const memberButtons = document.querySelectorAll('.countdown-member-btn');
        let clickedMembers = [];
        
        // Añadir eventos a los botones de miembros
        memberButtons.forEach(button => {
            button.addEventListener('click', function() {
                const memberId = this.getAttribute('data-member-id');
                const memberName = this.textContent.trim();
                
                // Comprobar si el miembro ya ha pulsado
                if (clickedMembers.some(m => m.id === memberId)) return;
                
                // Añadir miembro a la lista de pulsados
                clickedMembers.push({ id: memberId, name: memberName });
                
                // Deshabilitar botón
                this.disabled = true;
                this.classList.add('clicked');
                
                // Comprobar si todos han pulsado excepto uno
                if (clickedMembers.length === members.length - 1) {
                    // Encontrar el miembro que no ha pulsado
                    const loser = members.find(member => !clickedMembers.some(m => m.id === member.id));
                    
                    // Detener temporizador
                    clearInterval(countdownInterval);
                    
                    // Mostrar resultado
                    showCountdownResult(loser, countdownAmount);
                }
            });
        });
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            
            if (countdownDisplay) {
                countdownDisplay.textContent = timeLeft;
            }
            
            if (progressBar) {
                progressBar.style.width = `${(timeLeft / countdownDuration) * 100}%`;
            }
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                
                // Si no todos han pulsado, seleccionar un perdedor aleatorio entre los que no han pulsado
                if (clickedMembers.length < members.length - 1) {
                    const notClicked = members.filter(member => !clickedMembers.some(m => m.id === member.id));
                    const randomLoser = notClicked[Math.floor(Math.random() * notClicked.length)];
                    
                    showCountdownResult(randomLoser, countdownAmount);
                }
            }
        }, 1000);
    }
}

// Mostrar resultado de la cuenta atrás
function showCountdownResult(loser, amount) {
    const countdownResult = document.getElementById('countdown-result');
    if (!countdownResult) return;
    
    const groupId = document.getElementById('countdown-group').value;
    
    countdownResult.innerHTML = `
        <div class="result-card">
            <h3>¡${loser.name} debe pagar!</h3>
            <p>Importe: ${formatCurrency(amount)}</p>
            <div class="result-actions">
                <button id="create-expense-countdown-btn" class="btn btn-primary">Crear gasto</button>
                <button id="countdown-again-btn" class="btn btn-outline">Jugar de nuevo</button>
            </div>
        </div>
    `;
    
    // Añadir evento para crear gasto
    const createExpenseBtn = document.getElementById('create-expense-countdown-btn');
    if (createExpenseBtn) {
        createExpenseBtn.addEventListener('click', function() {
            window.location.href = `add-expense.html?group=${groupId}&payer=${loser.id}&amount=${amount}`;
        });
    }
    
    // Añadir evento para jugar de nuevo
    const countdownAgainBtn = document.getElementById('countdown-again-btn');
    if (countdownAgainBtn) {
        countdownAgainBtn.addEventListener('click', function() {
            // Limpiar resultado
            countdownResult.innerHTML = '';
            
            // Habilitar botón de cuenta atrás
            const startCountdownBtn = document.getElementById('start-countdown');
            if (startCountdownBtn) {
                startCountdownBtn.disabled = false;
            }
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
