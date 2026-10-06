# EduMatch — Sistema de Matching de Alunos com Machine Learning

Sistema híbrido profissional para identificação de duplicidades e correspondências entre registros de alunos históricos (Base Chromos) e listas externas (ex: Chamada da Lista de Espera SISU), mesmo diante de variações nominais complexas (abreviações, partículas, trocas de sobrenomes, acentuação e erros de digitação).

---

## 🏛️ Arquitetura do Sistema

O projeto é estruturado em três componentes principais desacoplados:

1. **`dataset-pipeline/` (Node.js 20+ / TypeScript)**:
   - Importação das bases reais (Chromos XLSX e SISU XLSX);
   - Normalização com `NameNormalizer`;
   - Redução de busca com `CandidateBlocking` (primeiro/último nome e tokens);
   - Geração de pares (Positivos, Negativos e Hard Negatives com alta similaridade textual mas pessoas distintas);
   - Engenharia de 11 atributos de similaridade (Jaro-Winkler, Levenshtein, Token Overlap, Jaccard, Iniciais, etc.);
   - Validação, detecção de Data Leakage, balanceamento e split (70% Train, 15% Validation, 15% Test);
   - Versionamento semântico de datasets com manifestos JSON auditáveis.

2. **`matching-ml-service/` (Fastify / TensorFlow.js / @tensorflow/tfjs-node)**:
   - API REST de predição em tempo real (`POST /api/v1/predict` e `POST /api/v1/batch-predict`);
   - Rede Neural feed-forward com Regularização Dropout;
   - Treinamento auditado associado à versão do dataset;
   - Avaliação detalhada de métricas: Accuracy, Precision, Recall, F1-Score e Matriz de Confusão;
   - Thresholds configuráveis com roteamento para `HUMAN_REVIEW` em casos ambíguos (ex: prob entre 0.30 e 0.90).

3. **`backend/` (PHP 8.3 / Laravel 11 / MySQL 8.0)**:
   - Clean Architecture e princípios SOLID (Domain, Application, Infrastructure, Presentation);
   - Importação e gestão de alunos e candidatos com `PhpSpreadsheet`;
   - Criptografia de dados sensíveis em repouso (CPF e E-mails) em conformidade com a LGPD;
   - Fluxo de Revisão Humana (`HumanReviewService`) para retroalimentação do dataset (`DatasetCandidate`);
   - Trilha completa de auditoria (`audit_logs` e `import_logs`).

---

## 🚀 Como Executar com Docker Compose

### 1. Pré-requisitos
- Docker Engine 24+
- Docker Compose v2+

### 2. Subir os serviços
```bash
docker compose up -d mysql matching-ml-service backend
```

- **Backend Laravel**: `http://localhost:8000`
- **ML Service**: `http://localhost:3001`
- **MySQL**: Porta `3306`

### 3. Executar o Pipeline de Dataset
Para processar os arquivos reais de dados e gerar a versão 1.0.0 do dataset:
```bash
docker compose run --rm dataset-pipeline npm start
```

### 4. Executar os Testes Unitários
```bash
# Testes do Pipeline de Dataset
cd dataset-pipeline && npm test

# Testes do Serviço de Machine Learning
cd matching-ml-service && npm test
```

---

## 📚 Endpoints Principais da API

### ML Service (`http://localhost:3001`)
- `GET /api/v1/health`: Status de saúde do serviço
- `GET /api/v1/model`: Metadados e versão do modelo ativo
- `POST /api/v1/predict`: Predição para um par de nomes
- `POST /api/v1/batch-predict`: Predição em lote

### Backend Laravel (`http://localhost:8000`)
- `GET /api/v1/health`: Status da API
- `GET /api/v1/students`: Lista paginada de alunos (dados LGPD mascarados)
- `GET /api/v1/candidates`: Lista paginada de candidatos SISU
- `POST /api/v1/match/candidate/{id}`: Executa matching contra a base histórica
- `GET /api/v1/match/pending-reviews`: Lista de casos ambíguos para revisão humana
- `POST /api/v1/review/{id}`: Registra parecer humano e cria candidato para novo dataset
- `GET /api/v1/dataset/latest`: Versão e métricas do último dataset gerado
- `POST /api/v1/import/chromos`: Dispara importação da planilha Chromos
- `POST /api/v1/import/sisu`: Dispara importação da planilha SISU

---

## 🔒 Conformidade LGPD
- Atributos pessoais sensíveis (CPF, e-mails) são criptografados no banco e mascarados na camada de apresentação.
- O treinamento do modelo de ML utiliza **estritamente correspondências e similaridades nominais**, sem utilizar CPF ou dados de contato como atributos para evitar viés e vazamento de privacidade.
