/* ============================================
   VIGORRE ONE™ - GLOBAL JAVASCRIPT
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
    modal.style.display = 'none';
  }
}

/**
 * Abre um modal pelo ID.
 * @param {string} modalId - ID do modal a ser aberto.
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

/**
 * Formata uma data para o formato brasileiro.
 * @param {string|Date} date - Data a ser formatada.
 * @returns {string} Data formatada (DD/MM/YYYY).
 */
function formatDateBR(date) {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata um número para moeda brasileira.
 * @param {number} value - Valor numérico.
 * @returns {string} Valor formatado (R$ 0,00).
 */
function formatCurrencyBRL(value) {
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
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
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
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copiado para a área de transferência!', 'success');
    });
  } else {
    // Fallback para navegadores antigos
    const textArea = document.createElement('textarea');
    textArea.value = text;
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
}

// Adicionar animação slideIn ao documento
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(120%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;
document.head.appendChild(style);

// Fechar modais ao pressionar ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      if (modal.style.display === 'flex') {
        modal.style.display = 'none';
      }
    });
  }
});

// Fechar modais ao clicar fora
document.querySelectorAll('.modal-overlay').forEach(modal => {
  modal.addEventListener('click', function(e) {
    if (e.target === this) {
      this.style.display = 'none';
    }
  });
});

// ============================================
// EXPORTS PARA MÓDULOS (OPCIONAL)
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
    copyToClipboard
  };
}
