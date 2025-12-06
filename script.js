// ============================================
// CONFIGURAÇÕES E VARIÁVEIS GLOBAIS
// ============================================

// Configuração do WhatsApp
const WHATSAPP_NUMBER = '558291422952'; // Aconchego Doces - Maceió/AL

// Variáveis globais com verificação de existência
const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('.nav-link');
const contatoForm = document.getElementById('contatoForm');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.getElementById('modalClose');
const galeriaItems = document.querySelectorAll('.galeria-item');
const telefoneInput = document.getElementById('telefone');
const whatsappFloat = document.querySelector('.whatsapp-float');

// Variáveis de controle
let isFormSubmitting = false;
let scrollAnimationFrame = null;
let previousScrollY = 0;

// ============================================
// UTILITÁRIOS E HELPERS
// ============================================

/**
 * Função debounce para otimizar eventos frequentes
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce aplicado
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Função throttle usando requestAnimationFrame
 * @param {Function} func - Função a ser executada
 * @returns {Function} Função com throttle aplicado
 */
function throttleRAF(func) {
    let rafId = null;
    return function(...args) {
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                func(...args);
                rafId = null;
            });
        }
    };
}

/**
 * Valida formato de telefone brasileiro
 * @param {string} telefone - Telefone a ser validado
 * @returns {boolean} True se válido
 */
function validarTelefone(telefone) {
    // Remove caracteres não numéricos
    const numeros = telefone.replace(/\D/g, '');
    
    // Valida: deve ter 10 ou 11 dígitos (fixo ou celular)
    // Celular: (11) 91234-5678 (11 dígitos)
    // Fixo: (11) 1234-5678 (10 dígitos)
    if (numeros.length < 10 || numeros.length > 11) {
        return false;
    }
    
    // Valida DDD (deve começar com dígito diferente de zero)
    const ddd = numeros.substring(0, 2);
    if (ddd[0] === '0' || ddd.length !== 2) {
        return false;
    }
    
    // Valida número (celular deve começar com 9, fixo não pode começar com 0 ou 1)
    const numero = numeros.substring(2);
    if (numeros.length === 11) {
        // Celular: deve começar com 9
        return numero[0] === '9';
    } else {
        // Fixo: não pode começar com 0 ou 1
        return numero[0] !== '0' && numero[0] !== '1';
    }
}

/**
 * Formata telefone brasileiro
 * @param {string} value - Valor a ser formatado
 * @returns {string} Telefone formatado
 */
function formatarTelefone(value) {
    const numeros = value.replace(/\D/g, '');
    
    if (numeros.length === 0) return '';
    if (numeros.length <= 2) return `(${numeros}`;
    if (numeros.length <= 6) return `(${numeros.substring(0, 2)}) ${numeros.substring(2)}`;
    if (numeros.length <= 10) {
        return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
    }
    // Celular (11 dígitos)
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7, 11)}`;
}

/**
 * Bloqueia scroll do body de forma segura
 */
function bloquearScroll() {
    // Salva a posição atual do scroll
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.setAttribute('data-scroll-y', scrollY);
}

/**
 * Desbloqueia scroll do body de forma segura
 */
function desbloquearScroll() {
    const scrollY = document.body.getAttribute('data-scroll-y');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.removeAttribute('data-scroll-y');
    if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10));
    }
}

// ============================================
// HEADER SCROLL E MENU MOBILE
// ============================================

// Adiciona classe ao header quando scrollar (com throttle e passive)
if (header) {
    const handleHeaderScroll = throttleRAF(() => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
}

// Toggle do menu mobile (com verificação de existência)
if (menuToggle && nav) {
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Acessibilidade: atualiza aria-expanded
        const isExpanded = nav.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Fecha o menu ao clicar em um link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Fecha o menu ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================
// NAVEGAÇÃO SUAVE E ATIVAÇÃO DE LINKS
// ============================================

// Navegação suave para âncoras
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Verifica se é um link âncora
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement && header) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// Ativa o link do menu conforme a seção visível
if (navLinks.length > 0) {
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    // Observa todas as seções
    document.querySelectorAll('section[id]').forEach(section => {
        observer.observe(section);
    });
}

// ============================================
// ANIMAÇÕES AO SCROLL (OTIMIZADO)
// ============================================

// Configuração do Intersection Observer para animações
const animationObserverOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
};

// Observer para animações suaves
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            // Usa requestAnimationFrame para animação suave
            requestAnimationFrame(() => {
                // Adiciona delay escalonado para efeito cascata
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    // Remove o observer após animar para melhor performance
                    animationObserver.unobserve(entry.target);
                }, index * 100); // Delay de 100ms entre cada elemento
            });
        }
    });
}, animationObserverOptions);

/**
 * Inicializa animações de scroll
 */
function initScrollAnimations() {
    // Animações para cards de serviços
    document.querySelectorAll('.servico-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        animationObserver.observe(card);
    });
    
    // Animações para cards de depoimentos
    document.querySelectorAll('.depoimento-card').forEach((card, index) => {
        card.style.transitionDelay = `${index * 0.1}s`;
        animationObserver.observe(card);
    });
    
    // Animações para destaques
    document.querySelectorAll('.destaque-item').forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.15}s`;
        animationObserver.observe(item);
    });
    
    // Animações para itens de informação
    document.querySelectorAll('.info-item').forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
        animationObserver.observe(item);
    });
    
    // Animações para itens da galeria
    document.querySelectorAll('.galeria-item').forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.08}s`;
        animationObserver.observe(item);
    });
    
    // Animações para headers de seção
    document.querySelectorAll('.section-header').forEach((header) => {
        animationObserver.observe(header);
    });
    
    // Animações para elementos fade-in
    document.querySelectorAll('.fade-in').forEach((element) => {
        animationObserver.observe(element);
    });
}

// Função legada para compatibilidade (mantida para elementos que não usam IntersectionObserver)
const isElementInViewport = (el) => {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
};

// Função para animar elementos ao entrar na viewport (fallback)
const animateOnScroll = throttleRAF(() => {
    const elements = document.querySelectorAll('.fade-in:not(.visible)');
    
    elements.forEach(element => {
        if (isElementInViewport(element) || element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add('visible');
        }
    });
});

// ============================================
// MODAL DA GALERIA (ACESSÍVEL E SEGURO)
// ============================================

// Elementos focáveis dentro do modal
let focusableElements = [];
let firstFocusableElement = null;
let lastFocusableElement = null;

/**
 * Abre o modal com controle completo de acessibilidade
 * @param {string} imageUrl - URL da imagem a ser exibida
 */
function openModal(imageUrl) {
    if (!modal || !modalImage) return;
    
    // Define a imagem
    modalImage.src = imageUrl;
    modalImage.alt = modalImage.alt || 'Imagem ampliada da galeria';
    
    // Adiciona classe ativa
    modal.classList.add('active');
    
    // Acessibilidade: remove aria-hidden e adiciona role
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modal-image');
    modalImage.setAttribute('id', 'modal-image');
    
    // Bloqueia scroll de forma segura
    bloquearScroll();
    
    // Prepara elementos focáveis
    focusableElements = Array.from(
        modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden';
    });
    
    firstFocusableElement = focusableElements[0];
    lastFocusableElement = focusableElements[focusableElements.length - 1];
    
    // Foca no primeiro elemento (botão de fechar)
    if (firstFocusableElement) {
        requestAnimationFrame(() => {
            firstFocusableElement.focus();
        });
    }
}

/**
 * Fecha o modal com controle completo de acessibilidade
 */
function closeModal() {
    if (!modal) return;
    
    // Remove classe ativa
    modal.classList.remove('active');
    
    // Acessibilidade: adiciona aria-hidden
    modal.setAttribute('aria-hidden', 'true');
    modal.removeAttribute('role');
    modal.removeAttribute('aria-labelledby');
    
    // Desbloqueia scroll de forma segura
    desbloquearScroll();
    
    // Limpa referências
    focusableElements = [];
    firstFocusableElement = null;
    lastFocusableElement = null;
}

// Abre o modal ao clicar em um item da galeria
if (galeriaItems.length > 0) {
    galeriaItems.forEach(item => {
        item.addEventListener('click', () => {
            const imageUrl = item.getAttribute('data-image');
            if (imageUrl) {
                openModal(imageUrl);
            }
        });
    });
}

// Fecha o modal ao clicar no X
if (modalClose) {
    modalClose.addEventListener('click', () => {
        closeModal();
    });
}

// Fecha o modal ao clicar fora da imagem
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Fecha o modal com a tecla ESC
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Melhora a navegação por teclado no modal (trap de foco)
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && modal.classList.contains('active')) {
            if (focusableElements.length === 0) {
                e.preventDefault();
                return;
            }
            
            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement?.focus();
                }
            } else {
                // Tab
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement?.focus();
                }
            }
        }
    });
}

// Inicializa modal como oculto
if (modal) {
    modal.setAttribute('aria-hidden', 'true');
}

// ============================================
// FORMULÁRIO DE CONTATO (COM PROTEÇÃO)
// ============================================

if (contatoForm) {
    contatoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Proteção contra envio duplo
        if (isFormSubmitting) {
            return;
        }
        
        isFormSubmitting = true;
        
        // Desabilita o botão de submit
        const submitButton = contatoForm.querySelector('.btn-submit');
        const originalButtonText = submitButton?.textContent;
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';
        }
        
        try {
            // Coleta os dados do formulário
            const formData = new FormData(contatoForm);
            const nome = formData.get('nome')?.trim();
            const email = formData.get('email')?.trim();
            const telefone = formData.get('telefone')?.trim();
            const mensagem = formData.get('mensagem')?.trim();
            
            // Validação básica
            if (!nome || !email || !telefone || !mensagem) {
                showMessage('Por favor, preencha todos os campos.', 'error');
                return;
            }
            
            // Validação de nome (mínimo 2 caracteres)
            if (nome.length < 2) {
                showMessage('Por favor, insira um nome válido (mínimo 2 caracteres).', 'error');
                return;
            }
            
            // Validação de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Por favor, insira um e-mail válido.', 'error');
                return;
            }
            
            // Validação de telefone
            if (!validarTelefone(telefone)) {
                showMessage('Por favor, insira um telefone válido (formato: (11) 91234-5678).', 'error');
                return;
            }
            
            // Validação de mensagem (mínimo 10 caracteres)
            if (mensagem.length < 10) {
                showMessage('Por favor, escreva uma mensagem mais detalhada (mínimo 10 caracteres).', 'error');
                return;
            }
            
            // Cria a mensagem para WhatsApp
            const whatsappMessage = `Olá! Meu nome é ${nome}.\n\nE-mail: ${email}\nTelefone: ${telefone}\n\nMensagem:\n${mensagem}`;
            const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;
            
            // Abre o WhatsApp
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Mostra mensagem de sucesso
            showMessage('Redirecionando para o WhatsApp...', 'success');
            
            // Limpa o formulário após 1 segundo
            setTimeout(() => {
                contatoForm.reset();
            }, 1000);
            
        } catch (error) {
            console.error('Erro ao processar formulário:', error);
            showMessage('Ocorreu um erro ao processar seu formulário. Tente novamente.', 'error');
        } finally {
            // Reabilita o botão após 2 segundos
            setTimeout(() => {
                isFormSubmitting = false;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText || 'Enviar Mensagem';
                }
            }, 2000);
        }
    });
}

// Função para mostrar mensagens
function showMessage(message, type) {
    if (!contatoForm) return;
    
    // Remove mensagem anterior se existir
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.setAttribute('role', 'alert');
    messageDiv.setAttribute('aria-live', 'polite');
    messageDiv.style.cssText = `
        padding: 1rem;
        margin-top: 1rem;
        border-radius: 10px;
        text-align: center;
        font-weight: 600;
        animation: fadeIn 0.3s ease;
        ${type === 'success' 
            ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
            : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
        }
    `;
    
    // Insere a mensagem após o botão de submit
    const submitButton = contatoForm.querySelector('.btn-submit');
    if (submitButton && submitButton.parentNode) {
        submitButton.parentNode.insertBefore(messageDiv, submitButton.nextSibling);
    }
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 300);
    }, 5000);
}

// ============================================
// MÁSCARA DE TELEFONE (MELHORADA)
// ============================================

if (telefoneInput) {
    telefoneInput.addEventListener('input', (e) => {
        const formatted = formatarTelefone(e.target.value);
        e.target.value = formatted;
    });
    
    // Validação ao perder o foco
    telefoneInput.addEventListener('blur', (e) => {
        const telefone = e.target.value;
        if (telefone && !validarTelefone(telefone)) {
            e.target.setCustomValidity('Por favor, insira um telefone válido (formato: (11) 91234-5678)');
            e.target.reportValidity();
        } else {
            e.target.setCustomValidity('');
        }
    });
}

// ============================================
// LAZY LOADING DE IMAGENS
// ============================================

// Verifica se o navegador suporta Intersection Observer
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    }, {
        rootMargin: '50px' // Carrega imagens 50px antes de aparecerem
    });
    
    // Observa todas as imagens com data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// ANIMAÇÃO DO BOTÃO WHATSAPP FLUTUANTE
// ============================================

if (whatsappFloat) {
    // Adiciona efeito de hover mais suave
    whatsappFloat.addEventListener('mouseenter', () => {
        whatsappFloat.style.transform = 'scale(1.1)';
    });
    
    whatsappFloat.addEventListener('mouseleave', () => {
        whatsappFloat.style.transform = 'scale(1)';
    });
}

// ============================================
// ATUALIZAÇÃO DE LINKS DO WHATSAPP
// ============================================

/**
 * Atualiza todos os links do WhatsApp com o número configurado
 * Esta função garante que todos os links usem o mesmo número
 */
function atualizarLinksWhatsApp() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    whatsappLinks.forEach(link => {
        const href = link.getAttribute('href');
        // Extrai a mensagem existente se houver
        const urlMatch = href.match(/wa\.me\/(\d+)(\?text=.*)?/);
        if (urlMatch) {
            const mensagem = urlMatch[2] || '';
            link.href = `https://wa.me/${WHATSAPP_NUMBER}${mensagem}`;
        }
    });
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Executa quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Adiciona classe de carregamento concluído
    document.body.classList.add('loaded');
    
    // Atualiza todos os links do WhatsApp
    atualizarLinksWhatsApp();
    
    // Inicializa animações
    initScrollAnimations();
    animateOnScroll();
    
    // Log de inicialização (pode ser removido em produção)
    if (process.env.NODE_ENV !== 'production') {
        console.log('Confeitaria Carlinha - Site carregado com sucesso!');
    }
});

// ============================================
// PREVENÇÃO DE COMPORTAMENTO PADRÃO EM LINKS
// ============================================

// Previne comportamento padrão em links âncora vazios
document.querySelectorAll('a[href="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
    });
});

// ============================================
// TRATAMENTO DE ERROS
// ============================================

// Tratamento global de erros
window.addEventListener('error', (e) => {
    console.error('Erro capturado:', e.error);
    // Em produção, você pode enviar este erro para um serviço de monitoramento
    // Exemplo: Sentry, LogRocket, etc.
});

// Tratamento de erros não capturados em Promises
window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise rejeitada não tratada:', e.reason);
    // Em produção, você pode enviar este erro para um serviço de monitoramento
});

// ============================================
// DETECÇÃO DE REDE E OFFLINE
// ============================================

// Detecta quando o usuário está offline
window.addEventListener('offline', () => {
    console.warn('Conexão perdida. Algumas funcionalidades podem não estar disponíveis.');
    // Opcional: mostrar notificação ao usuário
});

window.addEventListener('online', () => {
    console.log('Conexão restaurada.');
    // Opcional: mostrar notificação ao usuário
});

// ============================================
// FIM DO SCRIPT
// ============================================
