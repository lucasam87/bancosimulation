# Bankofthe Banking System 🚀

Bem-vindo ao **Bankofthe**, um sistema bancário digital moderno e completo, desenvolvido com **FastAPI** (Backend) e **React** (Frontend).

## 🌟 Funcionalidades

*   **Dashboards Interativos**: Acompanhe saldo, patrimônio líquido e gráficos em tempo real.
*   **Transações Financeiras**: Depósitos, Saques e Transferências (Simulação de PIX).
*   **Gestão de Crédito**:
    *   Análise de crédito com Inteligência Artificial (Gemini).
    *   Score de Crédito dinâmico.
    *   Emissão de Cartão de Crédito Black (Virtual).
*   **Empréstimos**: Simulação e contratação de empréstimos com cálculo automático de parcelas e juros.
*   **Design Premium**: Interface moderna com Dark Mode e Glassmorphism.

## 🛠️ Tecnologias

*   **Backend**: Python, FastAPI, SQLAlchemy, PostgreSQL.
*   **Frontend**: React, Vite, Framer Motion, Recharts.
*   **Infraestrutura**: Docker & Docker Compose.
*   **AI**: Google Gemini API.

## 🚀 Como Executar

### Pré-requisitos
*   Docker e Docker Compose instalados.
*   (Opcional) Chave de API do Google Gemini para funcionalidades avançadas de IA.

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/retrograde-newton.git
    cd retrograde-newton
    ```

2.  **Configure as variáveis de ambiente (Opcional):**
    Abra o `docker-compose.yml` e adicione sua `GEMINI_API_KEY` se desejar testar a análise de crédito real. Caso contrário, o sistema usará um modo "Offline" simulado.

3.  **Inicie a aplicação:**
    ```bash
    docker-compose up --build
    ```

4.  **Acesse:**
    *   **Frontend**: http://localhost:3000
    *   **Backend Docs**: http://localhost:8000/docs

## 🧪 Usuários de Teste

Você pode criar uma nova conta na tela de registro ou utilizar o fluxo completo para validar as funcionalidades.

---

Desenvolvido para fins educacionais e de demonstração.
