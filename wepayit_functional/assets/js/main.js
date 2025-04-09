// Funcionalidad principal para WePayIt
document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const header = document.getElementById('header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const signupForm = document.getElementById('signup-form');
    
    // Cambiar estilo del header al hacer scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Menú móvil
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Cambiar icono del botón
        const icon = mobileMenuBtn.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
    
    // Cerrar menú móvil al hacer clic en un enlace
    const navLinksItems = document.querySelectorAll('.nav-links a');
    navLinksItems.forEach(item => {
        item.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });
    
    // Animación de scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Validación del formulario de registro
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');
            
            let isValid = true;
            
            // Validar nombre
            if (nameInput.value.trim() === '') {
                showError(nameInput, 'Por favor, introduce tu nombre completo');
                isValid = false;
            } else {
                showSuccess(nameInput);
            }
            
            // Validar email
            if (emailInput.value.trim() === '') {
                showError(emailInput, 'Por favor, introduce tu correo electrónico');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Por favor, introduce un correo electrónico válido');
                isValid = false;
            } else {
                showSuccess(emailInput);
            }
            
            // Validar contraseña
            if (passwordInput.value.trim() === '') {
                showError(passwordInput, 'Por favor, introduce una contraseña');
                isValid = false;
            } else if (passwordInput.value.length < 8) {
                showError(passwordInput, 'La contraseña debe tener al menos 8 caracteres');
                isValid = false;
            } else {
                showSuccess(passwordInput);
            }
            
            // Validar confirmación de contraseña
            if (confirmPasswordInput.value.trim() === '') {
                showError(confirmPasswordInput, 'Por favor, confirma tu contraseña');
                isValid = false;
            } else if (confirmPasswordInput.value !== passwordInput.value) {
                showError(confirmPasswordInput, 'Las contraseñas no coinciden');
                isValid = false;
            } else {
                showSuccess(confirmPasswordInput);
            }
            
            // Si todo es válido, mostrar mensaje de éxito
            if (isValid) {
                // Aquí normalmente enviarías los datos al servidor
                showRegistrationSuccess();
            }
        });
    }
    
    // Función para mostrar error en un campo
    function showError(input, message) {
        const formGroup = input.parentElement;
        formGroup.classList.add('error');
        
        // Eliminar mensaje de error anterior si existe
        let errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Crear y añadir nuevo mensaje de error
        errorElement = document.createElement('p');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        formGroup.appendChild(errorElement);
        
        // Añadir estilo al input
        input.style.borderColor = 'var(--danger)';
    }
    
    // Función para mostrar éxito en un campo
    function showSuccess(input) {
        const formGroup = input.parentElement;
        formGroup.classList.remove('error');
        
        // Eliminar mensaje de error si existe
        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
        
        // Añadir estilo al input
        input.style.borderColor = 'var(--success)';
    }
    
    // Función para validar email
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Función para mostrar mensaje de registro exitoso
    function showRegistrationSuccess() {
        const formContainer = document.querySelector('.register-form');
        
        // Guardar la altura original del formulario
        const originalHeight = formContainer.offsetHeight;
        formContainer.style.height = originalHeight + 'px';
        
        // Limpiar el contenido del formulario
        formContainer.innerHTML = '';
        
        // Crear y añadir mensaje de éxito
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check-circle"></i>
            </div>
            <h2>¡Registro exitoso!</h2>
            <p>Gracias por registrarte en WePayIt. Hemos enviado un correo de confirmación a tu dirección de email.</p>
            <p>Revisa tu bandeja de entrada para completar el proceso de registro.</p>
            <a href="#" class="btn btn-primary btn-lg mt-3">Ir a mi cuenta</a>
        `;
        
        formContainer.appendChild(successMessage);
        
        // Añadir estilos para el mensaje de éxito
        const style = document.createElement('style');
        style.textContent = `
            .success-message {
                text-align: center;
                padding: 2rem;
                animation: fadeIn 0.5s ease-out forwards;
            }
            
            .success-icon {
                font-size: 4rem;
                color: var(--success);
                margin-bottom: 1rem;
            }
            
            .success-message h2 {
                font-size: 1.8rem;
                margin-bottom: 1rem;
                color: var(--dark);
            }
            
            .success-message p {
                color: var(--gray);
                margin-bottom: 0.5rem;
            }
        `;
        
        document.head.appendChild(style);
    }
    
    // Animaciones al hacer scroll
    const animateElements = document.querySelectorAll('.animate-fade-in');
    
    // Función para comprobar si un elemento está en el viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.85
        );
    }
    
    // Función para animar elementos cuando están en el viewport
    function checkAnimations() {
        animateElements.forEach(element => {
            if (isInViewport(element) && !element.classList.contains('animated')) {
                element.classList.add('animated');
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    }
    
    // Inicializar animaciones
    animateElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
    });
    
    // Comprobar animaciones al cargar la página y al hacer scroll
    window.addEventListener('load', checkAnimations);
    window.addEventListener('scroll', checkAnimations);
    
    // Añadir estilos adicionales para el menú móvil
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links {
                position: fixed;
                top: 70px;
                left: 0;
                width: 100%;
                background-color: white;
                flex-direction: column;
                padding: 1rem;
                box-shadow: var(--shadow-md);
                transform: translateY(-100%);
                opacity: 0;
                transition: transform 0.3s ease-in-out, opacity 0.3s ease-in-out;
                z-index: 999;
            }
            
            .nav-links.active {
                transform: translateY(0);
                opacity: 1;
            }
            
            .nav-links li {
                margin: 0.5rem 0;
            }
            
            .nav-links .btn {
                margin: 0.5rem 0 0;
                width: 100%;
                text-align: center;
            }
            
            .error-message {
                color: var(--danger);
                font-size: 0.85rem;
                margin-top: 0.25rem;
            }
        }
    `;
    
    document.head.appendChild(style);
});

// Contador de estadísticas animado
document.addEventListener('DOMContentLoaded', function() {
    // Añadir sección de estadísticas después de la sección de características
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
        const statsSection = document.createElement('section');
        statsSection.className = 'stats';
        statsSection.innerHTML = `
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-item animate-fade-in">
                        <div class="stat-number" data-count="50000">0</div>
                        <div class="stat-label">Usuarios activos</div>
                    </div>
                    <div class="stat-item animate-fade-in delay-1">
                        <div class="stat-number" data-count="120000">0</div>
                        <div class="stat-label">Gastos registrados</div>
                    </div>
                    <div class="stat-item animate-fade-in delay-2">
                        <div class="stat-number" data-count="25000">0</div>
                        <div class="stat-label">Grupos creados</div>
                    </div>
                    <div class="stat-item animate-fade-in delay-3">
                        <div class="stat-number" data-count="98">0</div>
                        <div class="stat-label">% de satisfacción</div>
                    </div>
                </div>
            </div>
        `;
        
        featuresSection.parentNode.insertBefore(statsSection, featuresSection.nextSibling);
        
        // Añadir estilos para la sección de estadísticas
        const style = document.createElement('style');
        style.textContent = `
            .stats {
                padding: var(--spacing-xxl) 0;
                background-color: var(--primary);
                color: white;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--spacing-xl);
                text-align: center;
            }
            
            .stat-number {
                font-size: 3rem;
                font-weight: 700;
                margin-bottom: var(--spacing-xs);
            }
            
            .stat-label {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            
            @media (max-width: 768px) {
                .stat-number {
                    font-size: 2.5rem;
                }
                
                .stat-label {
                    font-size: 1rem;
                }
            }
        `;
        
        document.head.appendChild(style);
        
        // Función para animar contadores
        function animateCounters() {
            const counters = document.querySelectorAll('.stat-number');
            const speed = 200; // Velocidad de la animación (menor = más rápido)
            
            counters.forEach(counter => {
                const target = +counter.getAttribute('data-count');
                const increment = target / speed;
                
                let count = 0;
                const updateCount = () => {
                    if (count < target) {
                        count += increment;
                        counter.innerText = Math.ceil(count);
                        setTimeout(updateCount, 1);
                    } else {
                        counter.innerText = target;
                    }
                };
                
                // Iniciar animación solo cuando el elemento está en el viewport
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            updateCount();
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(counter);
            });
        }
        
        // Iniciar animación de contadores
        animateCounters();
    }
});

// Efecto de desplazamiento para dispositivos móviles
document.addEventListener('DOMContentLoaded', function() {
    // Añadir efecto de desplazamiento para dispositivos móviles en la sección hero
    const heroImage = document.querySelector('.hero-image img');
    if (heroImage && window.innerWidth <= 768) {
        let startX, startY;
        
        heroImage.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        heroImage.addEventListener('touchmove', function(e) {
            if (!startX || !startY) return;
            
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Si el desplazamiento horizontal es mayor que el vertical
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Calcular el ángulo de rotación basado en el desplazamiento
                const rotation = diffX / 20;
                
                // Aplicar transformación
                heroImage.style.transform = `perspective(1000px) rotateY(${rotation}deg)`;
            }
        });
        
        heroImage.addEventListener('touchend', function() {
            // Restaurar la posición original con una transición suave
            heroImage.style.transition = 'transform 0.5s ease-out';
            heroImage.style.transform = 'perspective(1000px) rotateY(0)';
            
            // Restablecer variables
            startX = null;
            startY = null;
            
            // Eliminar la transición después de completarse
            setTimeout(() => {
                heroImage.style.transition = '';
            }, 500);
        });
    }
});
