/* ============================================
   VIGORRE ONE™ — MIDDLEWARE DE AUTENTICAÇÃO
   Segurança Enterprise • Proteção de Rotas
   ============================================ */

/**
 * Verifica se o usuário está autenticado e possui o perfil necessário.
 * @param {string} requiredRole - O papel necessário ('admin', 'participant', 'recruiter', etc.).
 * @returns {boolean} - Retorna true se autorizado, false se redirecionado.
 */
function checkAuth(requiredRole) {
  try {
    // 1. Obter dados da sessão local
    const storedUser = localStorage.getItem('vigorre_current_user');
    const sessionActive = sessionStorage.getItem('vigorre_session_active');
    
    // 2. Verificação básica de existência
    if (!storedUser || !sessionActive) {
      console.warn(' Acesso Negado: Sessão inexistente.');
      redirectToLogin();
      return false;
    }

    // 3. Parsear dados do usuário
    let currentUser;
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      console.error('❌ Erro ao parsear dados do usuário:', e);
      clearSessionAndRedirect();
      return false;
    }

    // 4. Verificação de Role (Papel de Acesso)
    if (requiredRole && currentUser.role !== requiredRole) {
      // Admin pode acessar tudo, mas participant não pode acessar admin, etc.
      // Lógica simples: se o role não bater, nega.
      // (Pode ser expandido para lógica de hierarquia se necessário)
      
      // Permissão especial: Admin Master tem acesso total
      if (currentUser.id !== 'admin-master-001' && currentUser.role !== requiredRole) {
         console.warn(`🚫 Acesso Negado: Usuário é '${currentUser.role}', necessário '${requiredRole}'.`);
         // Se tentar acessar área restrita, redireciona para dashboard do próprio perfil ou login
         if (currentUser.role === 'participant') {
             window.location.href = 'dashboard-participante.html';
         } else {
             window.location.href = 'login.html';
         }
         return false;
      }
    }

    // 5. Verificação de Expiração de Sessão (Opcional - baseada no localStorage)
    // Se houver lógica de expiração no objeto user, verificar aqui.
    // Por enquanto, confiamos na existência da chave no storage.

    console.log('✅ Acesso Autorizado para:', currentUser.name, '(', currentUser.role, ')');
    return true;

  } catch (error) {
    console.error('❌ Erro crítico no AuthGuard:', error);
    clearSessionAndRedirect();
    return false;
  }
}

/**
 * Redireciona para a página de login.
 * Adiciona parâmetro para indicar que foi um redirecionamento de segurança.
 */
function redirectToLogin() {
  // Limpa sessão inválida antes de sair
  clearSession();
  
  // Redireciona para login com flag de erro
  const currentUrl = window.location.pathname;
  window.location.href = `login.html?redirect=${encodeURIComponent(currentUrl)}&reason=auth_required`;
}

/**
 * Limpa a sessão atual (Logout seguro).
 */
function clearSession() {
  localStorage.removeItem('vigorre_current_user');
  sessionStorage.removeItem('vigorre_session_active');
  sessionStorage.removeItem('vigorre_session_token');
  console.log('🧹 Sessão limpa.');
}

/**
 * Limpa a sessão e redireciona (usado em erros críticos).
 */
function clearSessionAndRedirect() {
  clearSession();
  window.location.href = 'login.html?reason=error';
}

/**
 * Implementa a proteção contra o botão "Voltar" do navegador após logout.
 * Deve ser chamado nas páginas protegidas.
 */
function preventBackButton() {
  // Manipula o histórico para que o botão voltar não funcione como esperado
  // Adiciona um estado extra ao histórico
  window.history.pushState(null, null, window.location.href);
  
  window.addEventListener('popstate', function () {
    // Quando o usuário clica em voltar, o popstate é disparado.
    // Forçamos o histórico a voltar para a página atual (impedindo o retorno à página anterior de login)
    window.history.pushState(null, null, window.location.href);
    
    // Opcional: Verificar se a sessão ainda é válida. Se não, forçar logout real.
    const sessionActive = sessionStorage.getItem('vigorre_session_active');
    if (!sessionActive) {
      window.location.href = 'login.html';
    }
  });
}

/**
 * Inicializa o AuthGuard na página.
 * Deve ser chamado no carregamento de cada página protegida.
 * @param {string} requiredRole - O papel mínimo necessário para acessar esta página.
 */
function initAuthGuard(requiredRole) {
  // 1. Verificar autenticação
  const isAuthorized = checkAuth(requiredRole);
  
  if (isAuthorized) {
    // 2. Se autorizado, ativar proteção contra botão voltar
    preventBackButton();
  }
}

// ============================================
// EXPORTS PARA USO EM MÓDULOS (SE NECESSÁRIO)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkAuth,
    preventBackButton,
    initAuthGuard,
    clearSession
  };
}
