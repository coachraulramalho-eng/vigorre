/* ============================================
   VIGORRE ONE™ — GLOBAL JAVASCRIPT
   Funções reutilizáveis em toda a plataforma
   ============================================ */

/**
 * Exibe uma notificação toast na tela.
 * @param {string} message - Mensagem a ser exibida.
 * @param {string} type - Tipo: 'success', 'error' ou 'warning'.
 */
function showToast(message, type) {
  type = type || 'success';
  
  // Remover toast anterior se existir
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  
  // Criar novo toast
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.className = `toast ${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 24px;
    right: 24px;
    background: white;
    padding: 14px 24px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
    color: var(--slate-800);
    z-index: 10001;
    border-left: 4px solid ${type === 'error' ? 'var(--brand-rose)' : type === 'warning' ? 'var(--brand-amber)' : 'var(--brand-emerald)'};
    animation: slideIn 0.3s ease;
    max-width: 400px;
    font-size: 0.875rem;
    border: 1px solid var(--slate-200);
  `;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  toast.innerHTML = `<span style="font-size: 1.25rem;">${icon}</span><span>${message}</span>`;
  
  document.body.appendChild(toast);
  
  // Remover após 4 segundos
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/**
 * Fecha um modal pelo ID.
 * @param {string} modalId - ID do modal a ser fechado.
 */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    modal.querySelectorAll('form')?.forEach(f => f.reset());
    modal.querySelectorAll('input[type="hidden"]')?.forEach(i => i.value = '');
    document.body.style.overflow = '';
  }
}

/**
 * Abre um modal pelo ID.
 * @param {string} modalId - ID do modal a ser aberto.
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

/**
 * Formata uma data para o formato brasileiro.
 * @param {string|Date} date - Data a ser formatada.
 * @returns {string} Data formatada (DD/MM/YYYY).
 */
function formatDateBR(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata um número para moeda brasileira.
 * @param {number} value - Valor numérico.
 * @returns {string} Valor formatado (R$ 0,00).
 */
function formatCurrencyBRL(value) {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Sanitiza uma string para prevenir XSS.
 * @param {string} str - String a ser sanitizada.
 * @returns {string} String sanitizada.
 */
function sanitizeString(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Valida um campo de email.
 * @param {string} email - Email a ser validado.
 * @returns {boolean} True se válido.
 */
function isValidEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Debounce para evitar chamadas excessivas de função.
 * @param {Function} func - Função a ser executada.
 * @param {number} wait - Tempo de espera em ms.
 * @returns {Function} Função com debounce.
 */
function debounce(func, wait = 300) {
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
 * Copia texto para a área de transferência.
 * @param {string} text - Texto a ser copiado.
 */
function copyToClipboard(text) {
  if (!text) return;
  
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiado para a área de transferência!', 'success');
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showToast('Copiado!', 'success');
  } catch (err) {
    showToast('Erro ao copiar.', 'error');
  }
  document.body.removeChild(textArea);
}

/**
 * Previne o botão voltar do navegador após logout.
 */
function preventBackButton() {
  window.history.pushState(null, null, window.location.href);
  window.addEventListener('popstate', function () {
    window.history.pushState(null, null, window.location.href);
    const sessionActive = sessionStorage.getItem('vigorre_session_active') === 'true';
    if (!sessionActive) {
      window.location.href = 'login.html';
    }
  });
}

/**
 * Logout seguro - limpa sessão e redireciona.
 * @param {string} redirectUrl - URL para redirecionar após logout.
 */
function logout(redirectUrl = 'login.html') {
  // Marcar logout para sincronização entre abas
  sessionStorage.setItem('vigorre_logged_out', 'true');
  
  // Limpar dados sensíveis
  localStorage.removeItem('vigorre_current_user');
  localStorage.removeItem('vigorre_password_temp');
  localStorage.removeItem('vigorre_report_participant');
  sessionStorage.clear();
  
  // Redirecionar com timestamp para evitar cache
  window.location.href = `${redirectUrl}?loggedout=1&ts=${Date.now()}`;
}

/**
 * Verifica se o usuário está autenticado.
 * @param {string} requiredRole - Papel necessário (opcional).
 * @returns {boolean} True se autenticado.
 */
function isAuthenticated(requiredRole = null) {
  const stored = JSON.parse(localStorage.getItem('vigorre_current_user') || '{}');
  const sessionActive = sessionStorage.getItem('vigorre_session_active') === 'true';
  
  if (!stored.role || !sessionActive) return false;
  if (requiredRole && stored.role !== requiredRole) return false;
  
  return true;
}

/**
 * Redireciona para login se não autenticado.
 * @param {string} requiredRole - Papel necessário (opcional).
 */
function requireAuth(requiredRole = null) {
  if (!isAuthenticated(requiredRole)) {
    window.location.href = `login.html?reason=auth_required&ts=${Date.now()}`;
    return false;
  }
  return true;
}

/**
 * Carrega dados do localStorage com fallback seguro.
 * @param {string} key - Chave do localStorage.
 * @param {*} defaultValue - Valor padrão se não existir.
 * @returns {*} Dados parseados ou valor padrão.
 */
function loadFromStorage(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.warn(`⚠️ Erro ao carregar ${key}:`, e);
    return defaultValue;
  }
}

/**
 * Salva dados no localStorage com tratamento de erro.
 * @param {string} key - Chave do localStorage.
 * @param {*} value - Valor a ser salvo.
 * @returns {boolean} True se sucesso.
 */
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`❌ Erro ao salvar ${key}:`, e);
    showToast('Erro ao salvar dados. Tente novamente.', 'error');
    return false;
  }
}

/**
 * Debounce para buscas em tempo real.
 */
const searchDebounce = debounce(function(callback, value) {
  callback(value);
}, 300);

/**
 * Inicializa tooltips em elementos com data-tooltip.
 */
function initTooltips() {
  // Tooltips são puramente CSS via globals.css, esta função é placeholder
  // para futuras expansões com JavaScript se necessário.
}

/**
 * Inicializa animações de entrada para elementos.
 * @param {string} selector - Seletor CSS dos elementos.
 * @param {string} animation - Nome da animação.
 */
function initEntranceAnimations(selector = '.card', animation = 'fadeIn') {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, index) => {
    el.style.animationDelay = `${0.1 + index * 0.05}s`;
    el.classList.add(animation);
  });
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar tooltips
  initTooltips();
  
  // Fechar modais ao pressionar ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(modal => {
        closeModal(modal.id);
      });
    }
  });
  
  // Fechar modais ao clicar fora
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this.id);
      }
    });
  });
  
  // Prevenir submit de forms com Enter em inputs vazios
  document.querySelectorAll('form[novalidate]').forEach(form => {
    form.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        const inputs = form.querySelectorAll('input[required]');
        const empty = Array.from(inputs).find(input => !input.value.trim());
        if (empty) {
          e.preventDefault();
          empty.focus();
          showToast('Preencha todos os campos obrigatórios.', 'warning');
        }
      }
    });
  });
});

// ============================================
// ANIMAÇÃO DO TOAST (injetada no head se não existir)
// ============================================
(function() {
  if (!document.getElementById('globals-toast-style')) {
    const style = document.createElement('style');
    style.id = 'globals-toast-style';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
})();

// ============================================
// EXPORTS PARA MÓDULOS (Node.js / Bundlers)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showToast,
    closeModal,
    openModal,
    formatDateBR,
    formatCurrencyBRL,
    sanitizeString,
    isValidEmail,
    debounce,
    copyToClipboard,
    preventBackButton,
    logout,
    isAuthenticated,
    requireAuth,
    loadFromStorage,
    saveToStorage,
    searchDebounce,
    initTooltips,
    initEntranceAnimations
  };
}
