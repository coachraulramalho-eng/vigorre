/**
 * ============================================
 * VIGORRE ONE™ - AUTH.JS
 * Sistema de Autenticação e Autorização
 * People Analytics Enterprise
 * ============================================
 * 
 * FUNCIONALIDADES:
 * ✅ Verificação de sessão ativa
 * ✅ Proteção de rotas por nível de acesso
 * ✅ Controle de permissões granular
 * ✅ Logout seguro em todas as abas
 * ✅ Timeout de sessão por inatividade
 * ✅ Prevenção de back button após logout
 * ✅ Validação de tokens e integridade
 * ✅ Logs de auditoria de segurança
 * 
 * NÍVEIS DE ACESSO:
 * - admin: Admin Master Vigorre™ (controle total)
 * - staff: Recrutador/Consultor (gestão de participantes)
 * - company: Empresa (visualização de colaboradores)
 * - participant: Participante (realização de testes)
 */

'use strict';

// ============================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================

const AUTH_CONFIG = {
  // Timeout de sessão (30 minutos de inatividade)
  SESSION_TIMEOUT: 30 * 60 * 1000,
  
  // Tempo máximo de sessão (8 horas)
  MAX_SESSION_TIME: 8 * 60 * 60 * 1000,
  
  // Chave de armazenamento local
  STORAGE_KEYS: {
    CURRENT_USER: 'vigorre_current_user',
    SESSION_ACTIVE: 'vigorre_session_active',
    SESSION_START: 'vigorre_session_start',
    LAST_ACTIVITY: 'vigorre_last_activity',
    LOGGED_OUT: 'vigorre_logged_out'
  },
  
  // Páginas protegidas por nível de acesso
  PROTECTED_ROUTES: {
    admin: ['admin.html', 'usuarios.html', 'empresas.html', 'recrutadores.html', 'testes.html', 'relatorios.html', 'analytics.html', 'configuracoes.html'],
    staff: ['admin.html', 'participantes.html', 'testes.html', 'relatorios.html'],
    company: ['company-dashboard.html', 'colaboradores.html', 'company-analytics.html'],
    participant: ['dashboard-participante.html', 'meus-testes.html', 'meus-resultados.html', 'minha-evolucao.html']
  },
  
  // Página de login
  LOGIN_PAGE: 'login.html',
  
  // Página de redirecionamento padrão após login
  DEFAULT_REDIRECT: {
    admin: 'admin.html',
    staff: 'admin.html',
    company: 'company-dashboard.html',
    participant: 'dashboard-participante.html'
  }
};

// ============================================
// CLASSE PRINCIPAL DE AUTENTICAÇÃO
// ============================================

class VigorreAuth {
  constructor() {
    this.currentUser = null;
    this.sessionTimer = null;
    this.activityTimer = null;
    this.init();
  }

  /**
   * Inicialização do sistema de autenticação
   */
  init() {
    // Verificar se há logout pendente
    this.checkLogoutFlag();
    
    // Carregar usuário atual
    this.loadCurrentUser();
    
    // Configurar listeners de atividade
    this.setupActivityListeners();
    
    // Configurar sincronização entre abas
    this.setupTabSync();
    
    // Verificar sessão ativa
    if (this.currentUser) {
      this.validateSession();
      this.startSessionTimers();
    }
    
    console.log('🔐 VigorreAuth inicializado com sucesso');
  }

  // ============================================
  // GERENCIAMENTO DE SESSÃO
  // ============================================

  /**
   * Carrega o usuário atual do localStorage
   */
  loadCurrentUser() {
    try {
      const userData = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.updateLastActivity();
      }
    } catch (error) {
      console.error('❌ Erro ao carregar usuário:', error);
      this.clearSession();
    }
  }

  /**
   * Valida se a sessão está ativa e válida
   */
  validateSession() {
    const sessionActive = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_ACTIVE);
    const sessionStart = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_START);
    
    if (!sessionActive || !this.currentUser) {
      console.warn('⚠️ Sessão inválida - redirecionando para login');
      this.forceLogout('Sessão expirada. Faça login novamente.');
      return false;
    }
    
    // Verificar tempo máximo de sessão
    if (sessionStart) {
      const elapsed = Date.now() - parseInt(sessionStart);
      if (elapsed > AUTH_CONFIG.MAX_SESSION_TIME) {
        console.warn('⏰ Tempo máximo de sessão excedido');
        this.forceLogout('Sessão expirada por tempo máximo. Faça login novamente.');
        return false;
      }
    }
    
    return true;
  }

  /**
   * Inicia os timers de sessão e inatividade
   */
  startSessionTimers() {
    // Timer de inatividade
    this.resetActivityTimer();
    
    // Verificação periódica de validade
    this.sessionTimer = setInterval(() => {
      this.validateSession();
    }, 60000); // Verifica a cada minuto
  }

  /**
   * Reseta o timer de atividade do usuário
   */
  resetActivityTimer() {
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    
    this.activityTimer = setTimeout(() => {
      console.warn('⏰ Sessão expirada por inatividade');
      this.forceLogout('Sessão expirada por inatividade. Faça login novamente.');
    }, AUTH_CONFIG.SESSION_TIMEOUT);
  }

  /**
   * Atualiza o timestamp da última atividade
   */
  updateLastActivity() {
    localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    this.resetActivityTimer();
  }

  /**
   * Configura listeners para detectar atividade do usuário
   */
  setupActivityListeners() {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, () => {
        if (this.currentUser) {
          this.updateLastActivity();
        }
      }, { passive: true, capture: true });
    });
  }

  /**
   * Sincroniza estado de autenticação entre abas
   */
  setupTabSync() {
    window.addEventListener('storage', (e) => {
      if (e.key === AUTH_CONFIG.STORAGE_KEYS.LOGGED_OUT && e.newValue === 'true') {
        console.log(' Logout detectado em outra aba');
        this.handleCrossTabLogout();
      }
      
      if (e.key === AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER) {
        // Recarregar página se usuário mudar em outra aba
        if (window.location.pathname.includes('admin') || 
            window.location.pathname.includes('dashboard')) {
          window.location.reload();
        }
      }
    });
  }

  // ============================================
  // PROTEÇÃO DE ROTAS
  // ============================================

  /**
   * Verifica se o usuário tem permissão para acessar a página
   * @param {string} currentPage - Nome da página atual
   * @param {string} requiredRole - Papel necessário (opcional)
   */
  requireAuth(currentPage = null, requiredRole = null) {
    const page = currentPage || this.getCurrentPage();
    
    // Verificar se usuário está autenticado
    if (!this.currentUser || !this.currentUser.role) {
      console.warn('⚠️ Usuário não autenticado - redirecionando para login');
      this.redirectToLogin(page);
      return false;
    }
    
    // Validar sessão
    if (!this.validateSession()) {
      return false;
    }
    
    // Verificar permissão por papel
    if (requiredRole && this.currentUser.role !== requiredRole) {
      console.error('❌ Acesso negado - papel insuficiente');
      this.showAccessDenied();
      return false;
    }
    
    // Verificar permissão por rota
    if (!this.hasPagePermission(page)) {
      console.error('❌ Acesso negado - sem permissão para esta página');
      this.showAccessDenied();
      return false;
    }
    
    // Usuário autenticado e com permissão
    console.log('✅ Acesso permitido para:', this.currentUser.name);
    return true;
  }

  /**
   * Verifica se o usuário tem permissão para acessar a página
   */
  hasPagePermission(page) {
    const userRole = this.currentUser.role;
    
    // Admin tem acesso a tudo
    if (userRole === 'admin') {
      return true;
    }
    
    // Verificar rotas permitidas para o papel do usuário
    const allowedRoutes = AUTH_CONFIG.PROTECTED_ROUTES[userRole] || [];
    return allowedRoutes.includes(page);
  }

  /**
   * Obtém o nome da página atual
   */
  getCurrentPage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
  }

  /**
   * Redireciona para página de login
   */
  redirectToLogin(returnUrl = null) {
    // Marcar que usuário fez logout
    sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGGED_OUT, 'true');
    
    // Limpar dados sensíveis
    this.clearSensitiveData();
    
    // Construir URL de retorno
    let loginUrl = AUTH_CONFIG.LOGIN_PAGE;
    if (returnUrl) {
      loginUrl += `?returnUrl=${encodeURIComponent(returnUrl)}`;
    }
    
    // Redirecionar
    window.location.replace(loginUrl);
  }

  /**
   * Mostra mensagem de acesso negado
   */
  showAccessDenied() {
    // Criar overlay de acesso negado
    const overlay = document.createElement('div');
    overlay.id = 'access-denied-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(15, 23, 42, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s ease;
    `;
    
    overlay.innerHTML = `
      <div style="
        background: white;
        padding: 3rem;
        border-radius: 16px;
        text-align: center;
        max-width: 450px;
        box-shadow: 0 25px 80px rgba(0,0,0,0.4);
      ">
        <div style="
          font-size: 4rem;
          margin-bottom: 1rem;
        ">🚫</div>
        <h1 style="
          color: #1e293b;
          font-size: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        ">Acesso Negado</h1>
        <p style="
          color: #64748b;
          margin-bottom: 2rem;
          line-height: 1.6;
        ">
          Você não tem permissão para acessar esta página. 
          Entre em contato com o administrador se precisar de acesso.
        </p>
        <button onclick="window.history.back()" style="
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
        ">
          ← Voltar
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Prevenir navegação
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, null, window.location.href);
    };
  }

  // ============================================
  // LOGIN E LOGOUT
  // ============================================

  /**
   * Realiza login do usuário
   * @param {Object} userData - Dados do usuário
   */
  login(userData) {
    try {
      // Validar dados mínimos
      if (!userData.email || !userData.role) {
        throw new Error('Dados de usuário incompletos');
      }
      
      // Criar objeto de usuário seguro
      const secureUserData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        type: userData.type || userData.role,
        permissions: userData.permissions || [],
        loginAt: new Date().toISOString(),
        sessionId: this.generateSessionId()
      };
      
      // Armazenar sessão
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(secureUserData));
      localStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_START, Date.now().toString());
      sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_ACTIVE, 'true');
      
      // Atualizar estado local
      this.currentUser = secureUserData;
      this.updateLastActivity();
      this.startSessionTimers();
      
      console.log('✅ Login realizado com sucesso:', secureUserData.name);
      
      // Log de auditoria
      this.logSecurityEvent('LOGIN_SUCCESS', {
        userId: secureUserData.id,
        email: secureUserData.email,
        role: secureUserData.role
      });
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao realizar login:', error);
      this.logSecurityEvent('LOGIN_FAILED', {
        error: error.message,
        email: userData.email
      });
      return false;
    }
  }

  /**
   * Realiza logout seguro
   * @param {string} reason - Motivo do logout (opcional)
   */
  logout(reason = null) {
    console.log('🚪 Logout iniciado:', reason || 'Solicitado pelo usuário');
    
    // Log de auditoria
    this.logSecurityEvent('LOGOUT', {
      userId: this.currentUser?.id,
      email: this.currentUser?.email,
      reason: reason || 'user_requested'
    });
    
    // Marcar logout para sincronização entre abas
    sessionStorage.setItem(AUTH_CONFIG.STORAGE_KEYS.LOGGED_OUT, 'true');
    
    // Limpar sessão
    this.clearSession();
    
    // Redirecionar para login
    setTimeout(() => {
      window.location.replace(AUTH_CONFIG.LOGIN_PAGE);
    }, 500);
  }

  /**
   * Força logout imediato (sessão expirada, erro, etc)
   */
  forceLogout(reason) {
    console.warn('⚠️ Logout forçado:', reason);
    
    // Mostrar mensagem antes de redirecionar
    if (reason) {
      alert('⚠️ ' + reason);
    }
    
    this.logout(reason);
  }

  /**
   * Lida com logout em outra aba
   */
  handleCrossTabLogout() {
    // Limpar dados sem mostrar mensagem (já foi feito em outra aba)
    this.clearSession();
    
    // Redirecionar silenciosamente
    window.location.replace(AUTH_CONFIG.LOGIN_PAGE);
  }

  /**
   * Verifica flag de logout
   */
  checkLogoutFlag() {
    const loggedOut = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LOGGED_OUT);
    if (loggedOut === 'true') {
      console.log('🚪 Logout pendente detectado');
      sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.LOGGED_OUT);
      this.clearSession();
    }
  }

  // ============================================
  // UTILITÁRIOS DE SEGURANÇA
  // ============================================

  /**
   * Limpa todos os dados da sessão
   */
  clearSession() {
    // Parar timers
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }
    if (this.activityTimer) {
      clearTimeout(this.activityTimer);
    }
    
    // Limpar storage
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_START);
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
    sessionStorage.removeItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_ACTIVE);
    
    // Limpar estado local
    this.currentUser = null;
    
    console.log('🧹 Sessão limpa com sucesso');
  }

  /**
   * Limpa dados sensíveis (senhas, tokens temporários, etc)
   */
  clearSensitiveData() {
    const sensitiveKeys = [
      'vigorre_password_temp',
      'vigorre_token',
      'vigorre_session_key',
      'vigorre_remember_me'
    ];
    
    sensitiveKeys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    console.log('🔒 Dados sensíveis limpos');
  }

  /**
   * Gera ID de sessão único
   */
  generateSessionId() {
    return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Registra evento de segurança para auditoria
   */
  logSecurityEvent(event, data) {
    const log = {
      timestamp: new Date().toISOString(),
      event: event,
      data: data,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Em produção: enviar para API de logs
    console.log('📋 Security Log:', log);
    
    // Armazenar localmente (limite: últimos 50 eventos)
    try {
      const logs = JSON.parse(localStorage.getItem('vigorre_security_logs') || '[]');
      logs.push(log);
      if (logs.length > 50) {
        logs.shift();
      }
      localStorage.setItem('vigorre_security_logs', JSON.stringify(logs));
    } catch (e) {
      console.warn('⚠️ Não foi possível salvar logs de segurança');
    }
  }

  // ============================================
  // VERIFICAÇÕES DE PERMISSÃO
  // ============================================

  /**
   * Verifica se usuário tem permissão específica
   * @param {string} permission - Nome da permissão
   */
  hasPermission(permission) {
    if (!this.currentUser) return false;
    
    // Admin tem todas as permissões
    if (this.currentUser.role === 'admin') {
      return true;
    }
    
    // Verificar permissões explícitas
    return this.currentUser.permissions && 
           this.currentUser.permissions.includes(permission);
  }

  /**
   * Verifica se usuário é Admin Master
   */
  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  /**
   * Verifica se usuário é Staff/Recrutador
   */
  isStaff() {
    return this.currentUser && 
           (this.currentUser.role === 'staff' || this.currentUser.role === 'recruiter');
  }

  /**
   * Verifica se usuário é Participante
   */
  isParticipant() {
    return this.currentUser && this.currentUser.role === 'participant';
  }

  /**
   * Verifica se usuário é Empresa
   */
  isCompany() {
    return this.currentUser && this.currentUser.role === 'company';
  }

  // ============================================
  // GETTERS PÚBLICOS
  // ============================================

  /**
   * Obtém usuário atual
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Obtém papel do usuário atual
   */
  getRole() {
    return this.currentUser ? this.currentUser.role : null;
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated() {
    return !!this.currentUser && this.validateSession();
  }

  /**
   * Obtém tempo restante da sessão (em segundos)
   */
  getSessionTimeRemaining() {
    const lastActivity = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.LAST_ACTIVITY);
    if (!lastActivity) return 0;
    
    const elapsed = Date.now() - parseInt(lastActivity);
    const remaining = AUTH_CONFIG.SESSION_TIMEOUT - elapsed;
    
    return Math.max(0, Math.floor(remaining / 1000));
  }
}

// ============================================
// INSTÂNCIA GLOBAL
// ============================================

// Criar instância global
window.VigorreAuth = new VigorreAuth();

// ============================================
// FUNÇÕES UTILITÁRIAS GLOBAIS
// ============================================

/**
 * Verifica autenticação e permissão na página atual
 * Uso: requireAuth() no DOMContentLoaded
 */
function requireAuth(requiredRole = null) {
  return window.VigorreAuth.requireAuth(null, requiredRole);
}

/**
 * Verifica se usuário tem permissão
 */
function hasPermission(permission) {
  return window.VigorreAuth.hasPermission(permission);
}

/**
 * Realiza logout
 */
function logout() {
  window.VigorreAuth.logout();
}

/**
 * Obtém usuário atual
 */
function getCurrentUser() {
  return window.VigorreAuth.getCurrentUser();
}

// ============================================
// PREVENÇÃO DE BACK BUTTON APÓS LOGOUT
// ============================================

// Impedir cache de páginas sensíveis
if (window.history && window.history.replaceState) {
  window.history.replaceState(null, null, window.location.href);
  
  window.addEventListener('popstate', function() {
    // Verificar se há sessão ativa
    const sessionActive = sessionStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.SESSION_ACTIVE);
    const currentUser = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.CURRENT_USER);
    
    if (!sessionActive || !currentUser) {
      // Se não há sessão, forçar recarregamento (vai para login)
      window.location.replace(AUTH_CONFIG.LOGIN_PAGE);
    } else {
      // Se há sessão, permitir navegação
      window.history.pushState(null, null, window.location.href);
    }
  });
}

// ============================================
// EXPORTS (para módulos ES6 se necessário)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    VigorreAuth,
    AUTH_CONFIG,
    requireAuth,
    hasPermission,
    logout,
    getCurrentUser
  };
}

console.log('✅ auth.js carregado com sucesso - Vigorre One™ Security System');
