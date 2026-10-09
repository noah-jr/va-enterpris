/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'

import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'
const SolicitacaoCreditoController = () =>
  import('#modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController')

import { throttle, authThrottle } from './limiter.js'
import AutoSwagger from 'adonis-autoswagger'
import swagger from '#config/swagger'

import app from '@adonisjs/core/services/app'
import fs from 'node:fs'

router.get('/', () => {
  return { hello: 'world' }
})

router.get('/uploads/*', async ({ request, response }) => {
  const relPath = request.url().replace('/uploads/', '')
  const filePath = app.makePath('public/uploads', relPath)
  if (fs.existsSync(filePath)) {
    return response.download(filePath)
  }
  return response.notFound({ error: 'Ficheiro não encontrado no servidor.' })
})

router.get('/swagger', async () => {
  return AutoSwagger.default.docs(router.toJSON(), swagger)
})

router.get('/docs', async () => {
  return AutoSwagger.default.ui('/swagger', swagger)
})

router
  .group(() => {
    router
      .group(() => {
        router.post('signup', [controllers.NewAccount, 'store'])
        router.post('login', [controllers.AccessTokens, 'store']).use(authThrottle)
        router.post('refresh', [controllers.AccessTokens, 'refresh']).use(authThrottle)
        router
          .post('forgot-password', [
            () =>
              import('../app/Modules/Seguranca/Interface/Controllers/ResetPasswordController.js'),
            'forgotPassword',
          ])
          .use(throttle)
          .as('forgotPassword')
        router
          .post('reset-password', [
            () =>
              import('../app/Modules/Seguranca/Interface/Controllers/ResetPasswordController.js'),
            'resetPassword',
          ])
          .use(throttle)
          .as('resetPassword')
      })
      .prefix('auth')
      .as('auth')

    // Simulador & Solicitação Pública
    router
      .post('simulador', [
        () =>
          import('../app/Modules/SolicitacaoCredito/Interface/Controllers/SimuladorController.js'),
        'simular',
      ])
      .use(throttle)

    router
      .post('solicitacoes/public', [
        () =>
          import('../app/Modules/SolicitacaoCredito/Interface/Controllers/SolicitacaoCreditoController.js'),
        'publicSubmit',
      ])
      .use(throttle)

    // Formulario de Contacto & Newsletter Publico (Landing Page -> Admin & Email)
    router
      .post('contacto', [
        () => import('../app/controllers/contacto_controller.js'),
        'submit',
      ])
      .use(throttle)

    router
      .post('newsletter', [
        () => import('../app/controllers/contacto_controller.js'),
        'subscribeNewsletter',
      ])
      .use(throttle)

    // Produtos (público — necessário para o formulário do cliente)
    router
      .get('produtos', [
        () => import('../app/Modules/ProdutoFinanceiro/Interface/Controllers/ProdutoController.js'),
        'index',
      ])
      .use(throttle)
    router
      .get('produtos/:id', [
        () => import('../app/Modules/ProdutoFinanceiro/Interface/Controllers/ProdutoController.js'),
        'show',
      ])
      .use(throttle)

    // Transparência (público)
    router
      .get('transparencia', [
        () =>
          import('../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'),
        'publicData',
      ])
      .use(throttle)

    router
      .group(() => {
        router.get('profile', [controllers.Profile, 'show'])
        router.post('logout', [controllers.AccessTokens, 'destroy'])

        // 2FA Routes
        router
          .post('2fa/generate', [
            () =>
              import('../app/Modules/Seguranca/Interface/Controllers/TwoFactorAuthController.js'),
            'generate',
          ])
          .as('generate2fa')
        router
          .post('2fa/enable', [
            () =>
              import('../app/Modules/Seguranca/Interface/Controllers/TwoFactorAuthController.js'),
            'enable',
          ])
          .as('enable2fa')
        router
          .post('2fa/disable', [
            () =>
              import('../app/Modules/Seguranca/Interface/Controllers/TwoFactorAuthController.js'),
            'disable',
          ])
          .as('disable2fa')

        // API Keys Routes
        router
          .post('api-keys', [
            () => import('../app/Modules/Seguranca/Interface/Controllers/ApiKeyController.js'),
            'generate',
          ])
          .as('generateApiKey')
        router
          .get('api-keys', [
            () => import('../app/Modules/Seguranca/Interface/Controllers/ApiKeyController.js'),
            'list',
          ])
          .as('listApiKeys')
        router
          .delete('api-keys/:id', [
            () => import('../app/Modules/Seguranca/Interface/Controllers/ApiKeyController.js'),
            'revoke',
          ])
          .as('revokeApiKey')
      })
      .prefix('account')
      .as('profile')
      .use(middleware.jwt())
    // Clientes routes
    router
      .group(() => {
        router
          .get('/kpis', [
            () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
            'kpis',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .get('/export', [
            () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
            'export',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .get('/export-pdf', [
            () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
            'exportPdf',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router.get('/me/dashboard', [
          () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
          'dashboard',
        ])
        router.get('/me', [
          () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
          'me',
        ])
        router.put('/me', [
          () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
          'updateMe',
        ])
        router.post('/', [
          () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
          'store',
        ])
        router
          .get('/', [
            () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
            'index',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router.get('/:id', [
          () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
          'show',
        ])
        router
          .put('/:id', [
            () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
            'update',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .delete('/:id', [
            () => import('../app/Modules/Clientes/Interface/Controllers/ClienteController.js'),
            'destroy',
          ])
          .use(middleware.rbac({ guards: ['ADMIN'] }))
      })
      .prefix('clientes')
      .use(middleware.jwt())

    // Rotas públicas para geração de PDF (acessadas diretamente pelo navegador sem cabeçalho Authorization)
    router.get('solicitacoes/:id/contrato/pdf', [
      () => import('../app/Modules/Relatorios/Interface/Controllers/RelatoriosController.js'),
      'gerarContratoPdf',
    ])
    router.get('clientes/:clienteId/extrato/pdf', [
      () => import('../app/Modules/Relatorios/Interface/Controllers/RelatoriosController.js'),
      'gerarExtratoPdf',
    ])
    router.get('faturacao/:id/pdf', [
      () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
      'gerarPdf',
    ])

    // SolicitacaoCredito routes
    router
      .group(() => {
        router.post('/', [SolicitacaoCreditoController, 'create'])
        router
          .get('/', [SolicitacaoCreditoController, 'index'])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router.get('/:id', [SolicitacaoCreditoController, 'show'])
        router
          .patch('/:id/status', [SolicitacaoCreditoController, 'updateStatus'])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router.post('/:id/documentos', [SolicitacaoCreditoController, 'uploadDocumento'])
      })
      .prefix('solicitacoes')
      .use(middleware.jwt())
    router
      .get('clientes/:clienteId/solicitacoes', [SolicitacaoCreditoController, 'listByCliente'])
      .use(middleware.jwt())

    // Operações Financeiras
    router
      .group(() => {
        // Admin: Desembolso com upload de comprovativo
        router
          .post('desembolsos', [
            () =>
              import('../app/Modules/OperacaoFinanceira/Interface/Controllers/OperacaoFinanceiraController.js'),
            'desembolsar',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'DIRETOR'] }))
        // Admin: Listar parcelas/pagamentos
        router
          .get('pagamentos', [
            () =>
              import('../app/Modules/OperacaoFinanceira/Interface/Controllers/OperacaoFinanceiraController.js'),
            'listarPagamentos',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        // Admin: Validar/confirmar reembolso de parcela
        router
          .patch('pagamentos/:id/validar', [
            () =>
              import('../app/Modules/OperacaoFinanceira/Interface/Controllers/OperacaoFinanceiraController.js'),
            'validarPagamento',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        // Cliente: Submeter comprovativo de reembolso
        router.post('reembolsos', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/OperacaoFinanceiraController.js'),
          'submeterReembolso',
        ])
        // Parcelas + timeline de uma solicitação (cliente e admin)
        router.get('solicitacoes/:id/parcelas', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/OperacaoFinanceiraController.js'),
          'listarParcelas',
        ])
        // Admin: processar parcela manualmente
        router.post('pagamentos', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/OperacaoFinanceiraController.js'),
          'pagarParcela',
        ])
      })
      .prefix('operacoes')
      .use(middleware.jwt())
    // Renegociação
    router
      .group(() => {
        router.post('/', [
          () =>
            import('../app/Modules/Renegociacao/Interface/Controllers/RenegociacaoController.js'),
          'solicitar',
        ])
        router
          .post('/:id/aprovar', [
            () =>
              import('../app/Modules/Renegociacao/Interface/Controllers/RenegociacaoController.js'),
            'aprovar',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router.get('/', [
          () =>
            import('../app/Modules/Renegociacao/Interface/Controllers/RenegociacaoController.js'),
          'listar',
        ])
      })
      .prefix('renegociacoes')
      .use(middleware.jwt())
    // Garantias
    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Garantia/Interface/Controllers/GarantiaController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Garantia/Interface/Controllers/GarantiaController.js'),
          'adicionar',
        ])
        router
          .post('/:id/avaliar', [
            () => import('../app/Modules/Garantia/Interface/Controllers/GarantiaController.js'),
            'avaliar',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR', 'DIRETOR'] }))
        router.get('/solicitacao/:solicitacaoId', [
          () => import('../app/Modules/Garantia/Interface/Controllers/GarantiaController.js'),
          'listarPorSolicitacao',
        ])
      })
      .prefix('garantias')
      .use(middleware.jwt())

    // Lista Negra
    router
      .group(() => {
        router
          .get('/', [
            () => import('../app/Modules/ListaNegra/Interface/Controllers/ListaNegraController.js'),
            'index',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR', 'DIRETOR'] }))
        router.get('/:clienteId/status', [
          () => import('../app/Modules/ListaNegra/Interface/Controllers/ListaNegraController.js'),
          'status',
        ])
        router.get('/:clienteId/historico', [
          () => import('../app/Modules/ListaNegra/Interface/Controllers/ListaNegraController.js'),
          'historico',
        ])
        router
          .post('/', [
            () => import('../app/Modules/ListaNegra/Interface/Controllers/ListaNegraController.js'),
            'store',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .delete('/:id', [
            () => import('../app/Modules/ListaNegra/Interface/Controllers/ListaNegraController.js'),
            'destroy',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'DIRETOR'] }))
      })
      .prefix('lista-negra')
      .use(middleware.jwt())

    // Classificação de Clientes
    router
      .group(() => {
        router
          .get('/', [
            () =>
              import('../app/Modules/Clientes/Interface/Controllers/ClassificacaoController.js'),
            'index',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router.get('/:clienteId', [
          () => import('../app/Modules/Clientes/Interface/Controllers/ClassificacaoController.js'),
          'show',
        ])
      })
      .prefix('classificacao')
      .use(middleware.jwt())

    // Relatórios e KPIs
    router
      .group(() => {
        router.get('/kpis', [
          () => import('../app/Modules/Relatorios/Interface/Controllers/RelatoriosController.js'),
          'getKPIs',
        ])
        router.get('/kpis/exportar-pdf', [
          () => import('../app/Modules/Relatorios/Interface/Controllers/RelatoriosController.js'),
          'exportarPdf',
        ])
      })
      .prefix('relatorios')
      .use(middleware.jwt())
      .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR', 'DIRETOR'] }))

    // Campanhas
    router
      .group(() => {
        router
          .get('/', [
            () => import('../app/Modules/Campanha/Interface/Controllers/CampanhaController.js'),
            'index',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .post('/', [
            () => import('../app/Modules/Campanha/Interface/Controllers/CampanhaController.js'),
            'store',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .put('/:id', [
            () => import('../app/Modules/Campanha/Interface/Controllers/CampanhaController.js'),
            'update',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
        router
          .delete('/:id', [
            () => import('../app/Modules/Campanha/Interface/Controllers/CampanhaController.js'),
            'destroy',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))
      })
      .prefix('campanhas')
      .use(middleware.jwt())

    // Rotas públicas de campanha (para simulador)
    router.get('/campanhas/ativas', [
      () => import('../app/Modules/Campanha/Interface/Controllers/CampanhaController.js'),
      'ativas',
    ])

    // Notificações em Tempo Real (SSE)
    router
      .group(() => {
        router.get('/stream', [
          () =>
            import('../app/Modules/Notificacao/Interface/Controllers/NotificationsController.js'),
          'stream',
        ])
      })
      .prefix('notificacoes')
      .use(middleware.jwt())

    // --- NOVOS MÓDULOS ERP (Lógica Base) ---
    // Módulos com Lógica Completa Implementada
    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Stock/Interface/Controllers/StockController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Stock/Interface/Controllers/StockController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Stock/Interface/Controllers/StockController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Stock/Interface/Controllers/StockController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Stock/Interface/Controllers/StockController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Stock/Interface/Controllers/StockController.js'),
          'destroy',
        ])
      })
      .prefix('stock')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () =>
            import('../app/Modules/RecursosHumanos/Interface/Controllers/RecursosHumanosController.js'),
          'index',
        ])
        router.post('/', [
          () =>
            import('../app/Modules/RecursosHumanos/Interface/Controllers/RecursosHumanosController.js'),
          'store',
        ])
        router.get('/kpis', [
          () =>
            import('../app/Modules/RecursosHumanos/Interface/Controllers/RecursosHumanosController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () =>
            import('../app/Modules/RecursosHumanos/Interface/Controllers/RecursosHumanosController.js'),
          'show',
        ])
        router.put('/:id', [
          () =>
            import('../app/Modules/RecursosHumanos/Interface/Controllers/RecursosHumanosController.js'),
          'update',
        ])
        router.delete('/:id', [
          () =>
            import('../app/Modules/RecursosHumanos/Interface/Controllers/RecursosHumanosController.js'),
          'destroy',
        ])
      })
      .prefix('rh')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Vendas/Interface/Controllers/VendaController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Vendas/Interface/Controllers/VendaController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Vendas/Interface/Controllers/VendaController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Vendas/Interface/Controllers/VendaController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Vendas/Interface/Controllers/VendaController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Vendas/Interface/Controllers/VendaController.js'),
          'destroy',
        ])
      })
      .prefix('vendas')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Compras/Interface/Controllers/CompraController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Compras/Interface/Controllers/CompraController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Compras/Interface/Controllers/CompraController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Compras/Interface/Controllers/CompraController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Compras/Interface/Controllers/CompraController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Compras/Interface/Controllers/CompraController.js'),
          'destroy',
        ])
      })
      .prefix('compras')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/me', [
          () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
          'minhasFaturas',
        ])
        router
          .get('/', [
            () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
            'index',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR', 'DIRETOR'] }))
        router.post('/', [
          () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Faturacao/Interface/Controllers/FaturacaoController.js'),
          'destroy',
        ])
      })
      .prefix('faturacao')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/FinanceiroController.js'),
          'index',
        ])
        router.post('/', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/FinanceiroController.js'),
          'store',
        ])
        router.get('/kpis', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/FinanceiroController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/FinanceiroController.js'),
          'show',
        ])
        router.put('/:id', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/FinanceiroController.js'),
          'update',
        ])
        router.delete('/:id', [
          () =>
            import('../app/Modules/OperacaoFinanceira/Interface/Controllers/FinanceiroController.js'),
          'destroy',
        ])
      })
      .prefix('financeiro')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () =>
            import('../app/Modules/Contabilidade/Interface/Controllers/ContabilidadeController.js'),
          'index',
        ])
        router.post('/', [
          () =>
            import('../app/Modules/Contabilidade/Interface/Controllers/ContabilidadeController.js'),
          'store',
        ])
        router.get('/kpis', [
          () =>
            import('../app/Modules/Contabilidade/Interface/Controllers/ContabilidadeController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () =>
            import('../app/Modules/Contabilidade/Interface/Controllers/ContabilidadeController.js'),
          'show',
        ])
        router.put('/:id', [
          () =>
            import('../app/Modules/Contabilidade/Interface/Controllers/ContabilidadeController.js'),
          'update',
        ])
        router.delete('/:id', [
          () =>
            import('../app/Modules/Contabilidade/Interface/Controllers/ContabilidadeController.js'),
          'destroy',
        ])
      })
      .prefix('contabilidade')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Contratos/Interface/Controllers/ContratoController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Contratos/Interface/Controllers/ContratoController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Contratos/Interface/Controllers/ContratoController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Contratos/Interface/Controllers/ContratoController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Contratos/Interface/Controllers/ContratoController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Contratos/Interface/Controllers/ContratoController.js'),
          'destroy',
        ])
      })
      .prefix('contratos')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Projetos/Interface/Controllers/ProjetoController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Projetos/Interface/Controllers/ProjetoController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Projetos/Interface/Controllers/ProjetoController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Projetos/Interface/Controllers/ProjetoController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Projetos/Interface/Controllers/ProjetoController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Projetos/Interface/Controllers/ProjetoController.js'),
          'destroy',
        ])
      })
      .prefix('projetos')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Ativos/Interface/Controllers/AtivoController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Ativos/Interface/Controllers/AtivoController.js'),
          'store',
        ])
        router.get('/kpis', [
          () => import('../app/Modules/Ativos/Interface/Controllers/AtivoController.js'),
          'kpis',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Ativos/Interface/Controllers/AtivoController.js'),
          'show',
        ])
        router.put('/:id', [
          () => import('../app/Modules/Ativos/Interface/Controllers/AtivoController.js'),
          'update',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Ativos/Interface/Controllers/AtivoController.js'),
          'destroy',
        ])
      })
      .prefix('ativos')
      .use(middleware.jwt())

    router
      .group(() => {
        router.get('/', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'index',
        ])
        router.post('/', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'store',
        ])
        router.get('/templates/:key', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'getTemplate',
        ])
        router.get('/:id', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'show',
        ])
        router.post('/:id/tramitar', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'tramitar',
        ])
        router.post('/:id/enviar-email', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'enviarEmail',
        ])
        router.post('/:id/enviar-mensagem', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'enviarMensagem',
        ])
        router.delete('/:id', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'destroy',
        ])
      })
      .prefix('documentos')
      .use(middleware.jwt())

    // Inbox (Caixa de Entrada & Mensagens)
    router
      .group(() => {
        router.get('/me', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'getInboxMe',
        ])
        router
          .get('/', [
            () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
            'getInbox',
          ])
          .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR', 'DIRETOR'] }))

        router.post('/', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'sendInboxMessage',
        ])
        router.put('/:id/lida', [
          () => import('../app/Modules/Documentos/Interface/Controllers/DocumentoController.js'),
          'markInboxRead',
        ])
      })
      .prefix('inbox')
      .use(middleware.jwt())

    // Administração
    router
      .group(() => {
        router.get('/configuracoes', [
          () =>
            import('../app/Modules/Administracao/Interface/Controllers/AdministracaoController.js'),
          'getSettings',
        ])
        router.post('/configuracoes', [
          () =>
            import('../app/Modules/Administracao/Interface/Controllers/AdministracaoController.js'),
          'updateSettings',
        ])
        router.get('/metrics', [
          () =>
            import('../app/Modules/Administracao/Interface/Controllers/AdministracaoController.js'),
          'getSystemMetrics',
        ])
        router.post('/test-smtp', [
          () =>
            import('../app/Modules/Administracao/Interface/Controllers/AdministracaoController.js'),
          'testSmtp',
        ])
        router.get('/security-status', [
          () =>
            import('../app/Modules/Administracao/Interface/Controllers/AdministracaoController.js'),
          'getSecurityStatus',
        ])

        // Gestão de Utilizadores Internos & RBAC
        router.get('/users', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'index',
        ])
        router.post('/users', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'store',
        ])
        router.put('/users/:id', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'update',
        ])
        router.delete('/users/:id', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'destroy',
        ])
        router.post('/users/:id/reset-password', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'resetPassword',
        ])

        // Matriz de Roles & Logs de Auditoria
        router.get('/roles', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'getRolesAndPermissions',
        ])
        router.get('/audit-logs', [
          () => import('../app/Modules/Administracao/Interface/Controllers/UserController.js'),
          'getAuditLogs',
        ])

        // Storage & Backups
        router.get('/backups', [
          () => import('../app/Modules/Administracao/Interface/Controllers/BackupController.js'),
          'list',
        ])
        router.get('/backups/download/:filename', [
          () => import('../app/Modules/Administracao/Interface/Controllers/BackupController.js'),
          'download',
        ])
        router.post('/backups', [
          () => import('../app/Modules/Administracao/Interface/Controllers/BackupController.js'),
          'create',
        ])
        router.post('/backups/restore', [
          () => import('../app/Modules/Administracao/Interface/Controllers/BackupController.js'),
          'restore',
        ])
        router.post('/backups/upload', [
          () => import('../app/Modules/Administracao/Interface/Controllers/BackupController.js'),
          'upload',
        ])
        router.delete('/backups', [
          () => import('../app/Modules/Administracao/Interface/Controllers/BackupController.js'),
          'destroy',
        ])
      })
      .prefix('administracao')
      .use(middleware.jwt())
      .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR', 'DIRETOR'] }))

    // Transparência (Gestão Admin)
    router
      .group(() => {
        router.get('/admin', [
          () =>
            import('../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'),
          'index',
        ])
        router.put('/metricas', [
          () =>
            import('../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'),
          'updateMetricas',
        ])
        router.post('/documentos', [
          () =>
            import('../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'),
          'storeDocumento',
        ])
        router.put('/documentos/:id', [
          () =>
            import('../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'),
          'updateDocumento',
        ])
        router.delete('/documentos/:id', [
          () =>
            import('../app/Modules/Transparencia/Interface/Controllers/TransparenciaController.js'),
          'destroyDocumento',
        ])
      })
      .prefix('transparencia')
      .use(middleware.jwt())
      .use(middleware.rbac({ guards: ['ADMIN', 'GESTOR'] }))

    // Health check
    router.get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  })
  .prefix('/api/v1')
