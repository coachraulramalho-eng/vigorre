/* ============================================
   VIGORRE ONE™ — ADMIN PREMIUM LOGIC
   Injeta Gráficos e Melhorias de UX
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  
  // 1. Inicialização de Gráficos (Se existir o canvas)
  const ctxMain = document.getElementById('mainChart');
  if (ctxMain) {
    new Chart(ctxMain, {
      type: 'line',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Testes Realizados',
          data: [12, 19, 3, 5, 22, 30, 45], // Dados simulados
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const ctxDisc = document.getElementById('discChart');
  if (ctxDisc) {
    new Chart(ctxDisc, {
      type: 'doughnut',
      data: {
        labels: ['Dominância', 'Influência', 'Estabilidade', 'Conformidade'],
        datasets: [{
          data: [30, 20, 25, 25], // Dados simulados
          backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        cutout: '70%',
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true } }
        }
      }
    });
  }

  // 2. Melhoria de Tooltips nos Botões de Ação
  const actionButtons = document.querySelectorAll('button.sm\\:px-3, button.px-2');
  actionButtons.forEach(btn => {
    if (btn.textContent.includes('Edit')) btn.setAttribute('data-tooltip', 'Editar');
    if (btn.textContent.includes('Delete') || btn.textContent.includes('Excluir')) btn.setAttribute('data-tooltip', 'Excluir');
    if (btn.textContent.includes('View') || btn.textContent.includes('Ver')) btn.setAttribute('data-tooltip', 'Visualizar Relatório');
  });

  // 3. Loading States para Tabelas (Simulação)
  // Se houver tabelas com ID específico, aplica-se o estilo premium
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    table.classList.add('table-premium');
  });

  console.log('✅ Vigorre One™ Premium UI Loaded.');
});
