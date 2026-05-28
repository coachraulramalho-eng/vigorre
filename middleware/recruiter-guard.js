/* ============================================
   VIGORRE ONE™ — RECRUITER AUTH GUARD
   Proteção e Isolamento de Dados para Recrutadores
   ============================================ */

/**
 * Verifica se o usuário é recrutador e possui permissão para acessar a área.
 * @returns {boolean} - True se autorizado, false se redirecionado.
 */
function checkRecruiterAuth() {
  try {
    // 1. Obter dados da sessão
    const storedUser = localStorage.getItem('vigorre_current_user');
    const sessionActive = sessionStorage.getItem('vigorre_session_active');
    
    if (!storedUser || !sessionActive) {
      console.warn('🔐 Acesso Negado: Sessão inexistente.');
      redirectToRecruiterLogin();
      return false;
    }

    // 2. Parsear dados do usuário
    let currentUser;
    try {
      currentUser = JSON.parse(storedUser);
    } catch (e) {
      console.error('❌ Erro ao parsear dados do usuário:', e);
      clearRecruiterSession();
      window.location.href = 'login.html';
      return false;
    }

    // 3. Verificar se é recrutador
    if (currentUser.role !== 'recruiter') {
      console.warn(`🚫 Acesso Negado: Usuário é '${currentUser.role}', necessário 'recruiter'.`);
      // Redirecionar para dashboard apropriado
      if (currentUser.role === 'admin' || currentUser.role === 'staff') {
        window.location.href = 'admin.html';
      } else if (currentUser.role === 'participant') {
        window.location.href = 'dashboard-participante.html';
      } else {
        window.location.href = 'login.html';
      }
      return false;
    }

    // 4. Configurar escopo de dados do recrutador (ISOLAMENTO)
    window.recruiterScope = {
      id: currentUser.id,
      companyIds: currentUser.companies || [],
      participantIds: currentUser.participants || [],
      credits: currentUser.credits || { DISC: 0, IE: 0, Valores: 0 },
      permissions: currentUser.permissions || ['view_reports', 'manage_participants']
    };

    console.log('✅ Recrutador autorizado:', currentUser.name);
    console.log('🔒 Escopo de dados:', window.recruiterScope);
    return true;

  } catch (error) {
    console.error('❌ Erro crítico no RecruiterAuthGuard:', error);
    clearRecruiterSession();
    window.location.href = 'login.html?reason=error';
    return false;
  }
}

/**
 * Filtra dados pelo escopo do recrutador (apenas empresas/participantes dele)
 * @param {Array} data - Lista de itens para filtrar
 * @param {string} field - Campo para comparar (ex: 'companyId', 'id')
 * @returns {Array} - Dados filtrados
 */
function filterByRecruiterScope(data, field = 'companyId') {
  if (!window.recruiterScope || !Array.isArray(data)) return [];
  
  // Se recrutador tem empresas vinculadas, filtra por elas
  if (window.recruiterScope.companyIds && window.recruiterScope.companyIds.length > 0) {
    return data.filter(item => 
      window.recruiterScope.companyIds.includes(item[field]) ||
      window.recruiterScope.companyIds.includes(item.company_id) ||
      window.recruiterScope.participantIds.includes(item.id)
    );
  }
  
  // Se não tem empresas vinculadas, retorna vazio (segurança)
  return [];
}

/**
 * Verifica se recrutador tem créditos suficientes para liberar teste
 * @param {string} testType - Tipo do teste: 'DISC', 'IE' ou 'Valores'
 * @returns {boolean} - True se tem créditos, false caso contrário
 */
function hasRecruiterCredits(testType) {
  if (!window.recruiterScope || !window.recruiterScope.credits) return false;
  
  const available = window.recruiterScope.credits[testType] || 0;
  return available > 0;
}

/**
 * Desconta crédito do recrutador ao liberar teste
 * @param {string} testType - Tipo do teste liberado
 * @returns {boolean} - True se sucesso, false se erro
 */
function consumeRecruiterCredit(testType) {
  try {
    if (!hasRecruiterCredits(testType)) {
      console.warn('❌ Créditos insuficientes para:', testType);
      return false;
    }
    
    // Atualizar escopo local
    window.recruiterScope.credits[testType] -= 1;
    
    // Atualizar localStorage para persistência
    const currentUser = JSON.parse(localStorage.getItem('vigorre_current_user') || '{}');
    if (currentUser.credits) {
      currentUser.credits[testType] = (currentUser.credits[testType] || 1) - 1;
      localStorage.setItem('vigorre_current_user', JSON.stringify(currentUser));
    }
    
    // Salvar no Supabase se disponível
    if (window.VigorreDB && VigorreDB.supabase && currentUser.id) {
      VigorreDB.supabase
        .from('recruiters')
        .update({ 
          credits: currentUser.credits,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
    }
    
    console.log(`✅ Crédito consumido: ${testType} (-1)`);
    return true;
    
  } catch (e) {
    console.error('❌ Erro ao consumir crédito:', e);
    return false;
  }
}

/**
 * Redireciona para login com parâmetro de recrutador
 */
function redirectToRecruiterLogin() {
  clearRecruiterSession();
  window.location.href = 'login.html?role=recruiter&reason=auth_required';
}

/**
 * Limpa sessão do recrutador
 */
function clearRecruiterSession() {
  localStorage.removeItem('vigorre_current_user');
  sessionStorage.removeItem('vigorre_session_active');
  sessionStorage.removeItem('vigorre_session_token');
  window.recruiterScope = null;
  console.log('🧹 Sessão de recrutador limpa.');
}

/**
 * Inicializa o Recruiter Guard na página
 * @param {boolean} requireScope - Se deve exigir escopo de empresas definido
 */
function initRecruiterGuard(requireScope = true) {
  // 1. Verificar autenticação
  const isAuthorized = checkRecruiterAuth();
  
  if (!isAuthorized) return false;
  
  // 2. Se exigir escopo, verificar se recrutador tem empresas vinculadas
  if (requireScope && (!window.recruiterScope.companyIds || window.recruiterScope.companyIds.length === 0)) {
    console.warn('⚠️ Recrutador sem empresas vinculadas. Contate o administrador.');
    // Mostrar mensagem amigável em vez de redirecionar
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; background: #f8fafc; border-radius: 16px; border: 2px dashed #e2e8f0;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔐</div>
          <h3 style="color: #334155; margin-bottom: 0.5rem;">Aguardando Configuração</h3>
          <p style="color: #64748b; margin-bottom: 1.5rem;">
            Seu perfil de recrutador ainda não possui empresas vinculadas.<br>
            Entre em contato com o administrador da Vigorre One™ para configurar seu acesso.
          </p>
          <button onclick="logout()" class="btn btn-secondary">Sair</button>
        </div>
      `;
    }
    return false;
  }
  
  // 3. Ativar proteção contra botão voltar
  preventBackButton();
  
  console.log('✅ RecruiterGuard inicializado com sucesso');
  return true;
}

/**
 * Previne botão voltar após logout (mesma lógica do auth-guard)
 */
function preventBackButton() {
  window.history.pushState(null, null, window.location.href);
  
  window.addEventListener('popstate', function () {
    window.history.pushState(null, null, window.location.href);
    
    const sessionActive = sessionStorage.getItem('vigorre_session_active');
    if (!sessionActive) {
      window.location.href = 'login.html';
    }
  });
}

/**
 * Formata número de créditos para exibição
 * @param {number} credits - Quantidade de créditos
 * @returns {string} - Texto formatado com cor
 */
function formatRecruiterCredits(credits) {
  if (credits >= 10) return `<span style="color: #10B981; font-weight: 700;">${credits}</span>`;
  if (credits >= 3) return `<span style="color: #F59E0B; font-weight: 700;">${credits}</span>`;
  return `<span style="color: #F43F5E; font-weight: 700;">${credits}</span>`;
}

/**
 * Busca dados do recrutador no Supabase para atualizar créditos em tempo real
 * @param {string} recruiterId - ID do recrutador
 * @returns {Promise<Object>} - Dados atualizados do recrutador
 */
async function syncRecruiterData(recruiterId) {
  try {
    if (!window.VigorreDB || !VigorreDB.supabase) {
      // Fallback para localStorage
      const user = JSON.parse(localStorage.getItem('vigorre_current_user') || '{}');
      return user.credits || {};
    }
    
    const { data, error } = await VigorreDB.supabase
      .from('recruiters')
      .select('credits, companies, participants')
      .eq('id', recruiterId)
      .maybeSingle();
    
    if (error || !data) {
      console.warn('⚠️ Não foi possível sincronizar dados do recrutador');
      return {};
    }
    
    // Atualizar escopo local
    if (window.recruiterScope) {
      window.recruiterScope.credits = data.credits || window.recruiterScope.credits;
      window.recruiterScope.companyIds = data.companies || window.recruiterScope.companyIds;
      window.recruiterScope.participantIds = data.participants || window.recruiterScope.participantIds;
    }
    
    return data.credits || {};
    
  } catch (e) {
    console.error('❌ Erro ao sincronizar dados do recrutador:', e);
    return {};
  }
}

// ============================================
// EXPORTS PARA MÓDULOS (OPCIONAL)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkRecruiterAuth,
    filterByRecruiterScope,
    hasRecruiterCredits,
    consumeRecruiterCredit,
    initRecruiterGuard,
    formatRecruiterCredits,
    syncRecruiterData,
    clearRecruiterSession
  };
}
