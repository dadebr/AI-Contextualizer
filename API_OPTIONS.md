# Opções de API e Chat Aberto para AI Contextualizer

## 🎯 Visão Geral

A extensão AI Contextualizer precisa de um backend para processar as solicitações de IA. Existem várias opções, cada uma com seus prós e contras.

## 📋 Opções Disponíveis

### 1. ✅ API Própria (Recomendado) - **IMPLEMENTADO**

**Como funciona:**
- A extensão faz chamadas para sua aplicação Next.js
- A aplicação Next.js processa o texto usando Genkit + Google AI
- Resultados são retornados para a extensão

**Vantagens:**
- ✅ Controle total sobre a lógica de processamento
- ✅ Personalização das ações de IA
- ✅ Caching e otimização de performance
- ✅ Tratamento de erros robusto
- ✅ Histórico e analytics se necessário
- ✅ Funciona offline (se configurado)

**Desvantagens:**
- ❌ Requer hospedagem da aplicação Next.js
- ❌ Custos de servidor/infraestrutura
- ❌ Necessita de chave API do Google AI

**Status:** ✅ Implementado e funcionando

---

### 2. 🔄 API Direta no Navegador (Chat Aberto)

**Como funcionaria:**
- A extensão faz chamadas diretas para APIs de IA (Google Gemini, OpenAI, etc.)
- Sem necessidade de backend próprio
- Processamento acontece no navegador

**Vantagens:**
- ✅ Sem necessidade de servidor próprio
- ✅ Menos complexidade de infraestrutura
- ✅ Mais rápido para desenvolvimento inicial

**Desvantagens:**
- ❌ Chaves de API expostas no código da extensão
- ❌ Limitações de CORS e políticas de segurança
- ❌ Menos controle sobre o processamento
- ❌ Problemas de rate limiting
- ❌ Não funciona se a API estiver offline

**Status:** ❌ Não recomendado por questões de segurança

---

### 3. 🔗 WebSocket para Comunicação em Tempo Real

**Como funcionaria:**
- Conexão WebSocket entre extensão e servidor
- Comunicação bidirecional em tempo real
- Processamento streaming de respostas

**Vantagens:**
- ✅ Respostas em tempo real (streaming)
- ✅ Conexão persistente
- ✅ Melhor UX para textos longos

**Desvantagens:**
- ❌ Maior complexidade de implementação
- ❌ Requer infraestrutura WebSocket
- ❌ Maior consumo de recursos

**Status:** ❌ Não implementado, pode ser adicionado futuramente

---

## 🚀 Configuração da API Própria

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local`:

```bash
GOOGLE_GENAI_API_KEY=sua-chave-api-aqui
```

### 2. Executar a Aplicação

```bash
# Terminal 1: Aplicação Next.js
npm run dev

# Terminal 2: Aplicação Genkit (se necessário)
npm run genkit:start
```

### 3. Configurar URL da API na Extensão

No arquivo `public/content.js`, linha 207:
```javascript
const API_URL = 'http://localhost:3000/api/process-text';
```

Para produção, mude para:
```javascript
const API_URL = 'https://sua-aplicacao.vercel.app/api/process-text';
```

### 4. Testar a Integração

1. Execute `npm run build`
2. Recarregue a extensão no Chrome
3. Selecione texto e teste uma ação
4. Verifique se a sidebar mostra o resultado da API

---

## 🔐 Considerações de Segurança

### API Própria:
- ✅ Chaves API ficam no servidor (seguro)
- ✅ Controle de rate limiting
- ✅ Logs e monitoramento
- ✅ Autenticação possível

### API Direta:
- ❌ Chaves API expostas no código
- ❌ Qualquer um pode ver suas chaves
- ❌ Sem controle de uso

---

## 💡 Recomendação

**Use a API própria (já implementada)** porque:

1. **Segurança**: Chaves API ficam no servidor
2. **Controle**: Você controla toda a lógica
3. **Flexibilidade**: Fácil adicionar novas funcionalidades
4. **Performance**: Caching e otimizações possíveis
5. **Confiabilidade**: Não depende de APIs externas

Para usar com chat aberto no navegador, seria necessário expor as chaves de API, o que é uma prática insegura para uma extensão pública.

---

## 🔧 Troubleshooting

### Erro: "Failed to fetch"
- Verifique se a aplicação Next.js está rodando
- Confirme a URL da API no content.js
- Verifique problemas de CORS

### Erro: "Erro interno do servidor"
- Verifique logs do Next.js
- Confirme se a chave API está configurada
- Teste a API diretamente via curl/postman

### Erro: "Chave API inválida"
- Verifique se GOOGLE_GENAI_API_KEY está configurada
- Confirme se a chave tem permissões para Gemini API
- Verifique se não expirou

---

## 📈 Próximos Passos

1. ✅ Implementar API própria
2. 🔄 Adicionar autenticação (opcional)
3. 🔄 Implementar caching
4. 🔄 Adicionar rate limiting
5. 🔄 Deploy em produção (Vercel, Netlify, etc.)
