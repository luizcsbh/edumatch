# PROMPT MESTRE — SISTEMA DE MATCHING DE ALUNOS COM MACHINE LEARNING

## 1. Objetivo do projeto

Desenvolver um sistema profissional para identificar se dois registros de alunos representam a **mesma pessoa**, mesmo quando os nomes possuem diferenças de:

* acentuação;
* letras maiúsculas/minúsculas;
* abreviações;
* nomes compostos;
* ordem dos sobrenomes;
* ausência de nomes intermediários;
* inclusão de nomes intermediários;
* erros de digitação;
* caracteres especiais;
* espaços duplicados;
* partículas como `DA`, `DE`, `DO`, `DOS`, `DAS`;
* diferenças entre sistemas de origem.

O sistema deverá utilizar uma abordagem híbrida composta por:

1. Normalização dos dados;
2. Regras determinísticas;
3. Similaridade textual;
4. Engenharia de atributos;
5. Machine Learning;
6. TensorFlow.js;
7. Revisão humana para casos ambíguos;
8. Retroalimentação do dataset com decisões humanas.

---

# 2. Stack obrigatória

Utilizar:

### Backend principal

* PHP 8.3+
* Laravel
* MySQL
* Clean Architecture
* SOLID
* Design Patterns
* PHPUnit
* Laravel Queue quando necessário
* Laravel Scheduler quando necessário

### Serviço de Machine Learning

* Node.js 20+
* TypeScript
* TensorFlow.js
* `@tensorflow/tfjs-node`
* Fastify
* REST API

### Infraestrutura

* Docker
* Docker Compose
* Git
* GitLab CI/CD

---

# 3. Arquivos de entrada reais

O sistema deverá ser desenvolvido considerando os dois arquivos fornecidos.

## 3.1 Base histórica do Chromos

Arquivo:

```text
lista-alunos-chromos-normalizada.csv
```

Apesar da extensão `.csv`, verificar o formato real do arquivo antes da implementação.

A estrutura identificada contém aproximadamente **31 mil registros** e campos como:

```text
NOME DO ALUNO CHROMOS
ANOLETIVOATUAL
ANOINGRESSO
MATRICULA
TURMA
DESCRICAO
CPF
SITUACAO
CURSO
UNIDADE
EMAIL
DATA_MATRICULA
CELULAR_ALUNO
TELEFONE_ALUNO
TEL_RECADOS_ALUNO
NOME_RESP_ACAD
CELULAR_RESP_ACAD
TELEFONE_RESP_ACAD
EMAIL_RESP_ACAD
NOME_RESP_FIN
CELULAR_RESP_FIN
TELEFONE_RESP_FIN
EMAIL_RESP_FIN
```

O campo principal para matching será:

```text
NOME DO ALUNO CHROMOS
```

O campo:

```text
NOME DO ALUNO CHROMOS
```

representará o nome de referência histórica do aluno.

---

# 4. Lista externa SISU

Arquivo:

```text
8a-Chamada-da-Lista-de-Espera-SISU-2026.xlsx
```

Utilizar a planilha:

```text
Planilha1
```

que possui campos como:

```text
nome_candidato
nome_tratado
incricao_enem
faculdade
curso
turno
classificacao
turno_aprovado
modalidade
```

O campo principal será:

```text
nome_candidato
```

e, quando necessário:

```text
nome_tratado
```

poderá ser utilizado como representação já normalizada.

---

# 5. Relação entre os arquivos

A arquitetura deverá considerar:

```text
BASE HISTÓRICA CHROMOS
        |
        | referência
        v
NOME DO ALUNO CHROMOS
        |
        | Matching
        v
LISTA SISU
        |
        v
nome_candidato
```

O sistema deverá tentar descobrir:

> "O candidato da lista SISU corresponde a algum aluno existente na base histórica do Chromos?"

---

# 6. Exemplo real de entrada

A lista SISU contém registros como:

```text
ISADORA BARROSO ANDRADE
LUIZ GUSTAVO OLIVEIRA GONTIJO
EMANUELLY DA SILVA RODRIGUES
EMILLY MAGALHAES COUTINHO DE JESUS
HANNYAH KARENNINE CORDEIRO DE SOUSA LOPES
```

A base Chromos contém milhares de alunos históricos.

O sistema deverá procurar correspondências entre:

```text
nome_candidato
```

e:

```text
NOME DO ALUNO CHROMOS
```

---

# 7. Objetivo do Dataset

O dataset deverá representar pares de registros:

```text
Aluno Chromos
        +
Candidato SISU
        =
Par de Matching
```

Cada par deverá possuir atributos calculados e uma classificação:

```text
1 = MATCH
0 = NO_MATCH
```

Exemplo:

```text
Chromos:
JOAO PEDRO DA SILVA

SISU:
JOÃO PEDRO SILVA

Resultado esperado:

MATCH = 1
```

Outro exemplo:

```text
Chromos:
JOAO PEDRO DA SILVA

SISU:
JOAO PAULO DA SILVA

Resultado:

NO_MATCH = 0
```

Mesmo que os nomes sejam muito semelhantes, não se deve assumir automaticamente que representam a mesma pessoa.

---

# 8. Não criar dataset artificialmente perfeito

Esta regra é obrigatória.

O dataset deverá representar problemas reais encontrados nos dados.

Devem existir exemplos de:

### Match verdadeiro

```text
JOAO PEDRO DA SILVA
JOÃO PEDRO DA SILVA
```

```text
MARIA EDUARDA SOUZA
MARIA EDUARDA DE SOUZA
```

```text
CARLOS HENRIQUE ALVES
CARLOS H ALVES
```

```text
EMILLY MAGALHAES COUTINHO DE JESUS
EMILLY MAGALHAES COUTINHO JESUS
```

### Não Match

```text
JOAO PEDRO SILVA
JOAO PAULO SILVA
```

```text
MARIA EDUARDA SOUZA
MARIA EDUARDA SANTOS
```

### Hard Negative

Criar exemplos especialmente difíceis:

```text
JOAO PEDRO DA SILVA
JOAO PEDRO SILVA
```

pode ser MATCH.

Porém:

```text
JOAO PEDRO DA SILVA
JOAO PEDRO DOS SANTOS
```

pode ser NO_MATCH.

O modelo deve aprender que:

> alta similaridade textual não significa necessariamente que duas pessoas são iguais.

---

# 9. Estratégia para criação do Dataset

Implementar o seguinte pipeline:

```text
Arquivo Chromos
       |
       v
Importação
       |
       v
Normalização
       |
       v
Base de alunos
       |
       +--------------------+
       |                    |
       v                    v
Lista SISU             Base Chromos
       |                    |
       +---------+----------+
                 |
                 v
        Candidate Blocking
                 |
                 v
        Geração de pares
                 |
        +--------+--------+
        |        |        |
        v        v        v
    Positive  Negative  Hard Negative
        |        |        |
        +--------+--------+
                 |
                 v
        Feature Engineering
                 |
                 v
        Dataset Validation
                 |
                 v
        Balanceamento
                 |
                 v
        Train / Validation / Test
                 |
                 v
        Dataset Versionado
                 |
                 v
        TensorFlow Training
```

---

# 10. Importação dos arquivos

Criar um processo de importação independente do Matching.

Implementar:

```text
StudentImportService
SisuImportService
```

Responsabilidades:

### StudentImportService

Importar:

```text
lista-alunos-chromos-normalizada.csv
```

e transformar os dados em uma estrutura interna padronizada.

### SisuImportService

Importar:

```text
8a-Chamada-da-Lista-de-Espera-SISU-2026.xlsx
```

utilizando a planilha:

```text
Planilha1
```

---

# 11. Modelo interno dos dados

Criar uma estrutura comum.

### Student

```typescript
interface Student {
    id: string;
    name: string;
    normalizedName: string;
    registration?: string;
    cpf?: string;
    email?: string;
    phone?: string;
    course?: string;
    unit?: string;
    source: string;
    sourceId?: string;
}
```

### SisuCandidate

```typescript
interface SisuCandidate {
    id: string;
    name: string;
    normalizedName: string;
    enemRegistration?: string;
    college?: string;
    course?: string;
    shift?: string;
    classification?: string;
    approvedShift?: string;
    modality?: string;
}
```

---

# 12. Normalização dos nomes

Criar um componente:

```text
NameNormalizer
```

Responsável por:

1. Converter para uppercase ou lowercase padronizado;
2. Remover acentos;
3. Remover caracteres especiais;
4. Remover espaços duplicados;
5. Normalizar partículas;
6. Normalizar pontuação;
7. Manter tokens;
8. Gerar nome normalizado.

Exemplo:

```text
"João  Pedro da Silva"
```

deve produzir:

```text
"JOAO PEDRO DA SILVA"
```

e:

```text
"JOAO PEDRO DA SILVA"
```

deve produzir a mesma representação normalizada.

---

# 13. Candidate Blocking

Não realizar inicialmente:

```text
31.000 alunos × todos os candidatos
```

sem estratégia de redução.

Criar um mecanismo de:

```text
Candidate Blocking
```

Utilizando inicialmente:

* primeira letra;
* primeiro nome;
* último nome;
* tokens;
* iniciais;
* prefixos;
* similaridade mínima;
* outros atributos disponíveis.

Exemplo:

```text
Candidato:
JOAO PEDRO SILVA
```

Pesquisar inicialmente candidatos cujo:

```text
firstName = JOAO
```

ou:

```text
lastName = SILVA
```

ou possuam tokens semelhantes.

Depois aplicar os algoritmos de similaridade.

---

# 14. Feature Engineering

Para cada par:

```text
Chromos Student
+
SISU Candidate
```

calcular:

```text
jaro_winkler
levenshtein
token_similarity
same_first_name
same_last_name
first_name_similarity
last_name_similarity
same_initials
token_count_difference
token_order_similarity
full_name_similarity
```

---

# 15. Jaro-Winkler

Implementar:

```text
jaroWinkler(studentName, candidateName)
```

Resultado:

```text
0.0 → 1.0
```

Onde:

```text
0 = completamente diferente
1 = extremamente semelhante
```

---

# 16. Levenshtein

Calcular:

```text
levenshtein(studentName, candidateName)
```

Além da distância absoluta, criar uma versão normalizada:

```text
levenshtein_similarity
```

com resultado:

```text
0.0 → 1.0
```

---

# 17. Token Similarity

Separar:

```text
JOAO PEDRO DA SILVA
```

em:

```text
JOAO
PEDRO
DA
SILVA
```

Comparar os conjuntos de tokens.

Considerar:

* interseção;
* tokens exclusivos;
* quantidade de tokens;
* Jaccard;
* similaridade da ordem.

---

# 18. SAME_FIRST_NAME

Criar:

```text
same_first_name
```

Exemplo:

```text
JOAO PEDRO SILVA
JOAO PAULO SILVA
```

Resultado:

```text
same_first_name = 1
```

---

# 19. SAME_LAST_NAME

Exemplo:

```text
JOAO PEDRO SILVA
JOAO PAULO SILVA
```

Resultado:

```text
same_last_name = 1
```

---

# 20. DatasetRecord

Cada registro do dataset deverá possuir:

```typescript
interface DatasetRecord {
    id: string;

    studentId: string;
    candidateId: string;

    studentName: string;
    candidateName: string;

    normalizedStudentName: string;
    normalizedCandidateName: string;

    jaroWinkler: number;
    levenshteinSimilarity: number;
    tokenSimilarity: number;

    sameFirstName: number;
    sameLastName: number;

    firstNameSimilarity: number;
    lastNameSimilarity: number;

    sameInitials: number;

    tokenCountDifference: number;
    tokenOrderSimilarity: number;

    fullNameSimilarity: number;

    label: 0 | 1;

    source: string;
    sourceId?: string;

    createdAt: string;
}
```

---

# 21. Geração de pares positivos

Criar:

```text
PositivePairGenerator
```

Os pares positivos deverão representar pessoas que comprovadamente correspondem.

Priorizar:

1. correspondências confirmadas;
2. decisões humanas;
3. identificadores confiáveis quando disponíveis;
4. histórico validado.

Nunca considerar apenas alta similaridade como prova definitiva de Match.

---

# 22. Geração de pares negativos

Criar:

```text
NegativePairGenerator
```

Gerar pares de pessoas diferentes.

Não utilizar somente nomes completamente diferentes.

O dataset precisa possuir:

```text
Negative
```

e:

```text
Hard Negative
```

---

# 23. Hard Negative

Criar:

```text
HardNegativeGenerator
```

Selecionar pares com:

```text
Jaro-Winkler alto
```

mas que sejam conhecidos como pessoas diferentes.

Exemplo:

```text
JOAO PEDRO DA SILVA
JOAO PEDRO DOS SANTOS
```

Esses casos são importantes para ensinar o modelo a não tomar uma decisão apenas baseada em similaridade.

---

# 24. Utilização da lista SISU para gerar o Dataset

A lista:

```text
8a-Chamada-da-Lista-de-Espera-SISU-2026.xlsx
```

deverá ser processada contra:

```text
lista-alunos-chromos-normalizada.csv
```

O pipeline deverá produzir algo conceitualmente semelhante a:

```text
SISU Candidate
        |
        v
Candidate Blocking
        |
        v
Candidatos Chromos
        |
        v
Feature Engineering
        |
        v
Ranking de Similaridade
        |
        v
Possíveis Matches
```

Exemplo:

```text
SISU:

ISADORA BARROSO ANDRADE
```

Pesquisar na base:

```text
ISADORA BARROSO ANDRADE
ISADORA BARROS ANDRADE
ISADORA BARROSO DE ANDRADE
...
```

Cada combinação candidata deverá gerar suas respectivas features.

---

# 25. Revisão humana

Quando o sistema não possuir confiança suficiente:

```text
MATCH
```

ou:

```text
NO_MATCH
```

deverá encaminhar para:

```text
HUMAN_REVIEW
```

Exemplo:

```text
MATCH >= 0.90
```

pode ser automaticamente aceito conforme configuração.

```text
MATCH <= 0.30
```

pode ser automaticamente rejeitado.

```text
0.30 < MATCH < 0.90
```

pode exigir revisão humana.

Os thresholds devem ser configuráveis e não hardcoded.

---

# 26. Human Review como fonte do Dataset

Toda decisão humana poderá posteriormente alimentar o dataset.

Fluxo:

```text
Matching
    ↓
Human Review
    ↓
MATCH / NO_MATCH
    ↓
Dataset Candidate
    ↓
Validation
    ↓
Dataset Version
```

Exemplo:

```json
{
    "studentName": "JOAO PEDRO SILVA",
    "candidateName": "JOÃO PEDRO DA SILVA",
    "decision": "MATCH",
    "reviewedBy": "user-id",
    "reviewedAt": "2026-10-03T12:00:00Z"
}
```

---

# 27. Dataset Candidate

Não adicionar imediatamente uma decisão humana ao dataset de produção.

Criar:

```text
Dataset Candidate
```

Estados:

```text
PENDING
APPROVED
REJECTED
```

Somente:

```text
APPROVED
```

poderá entrar em uma nova versão oficial do dataset.

---

# 28. Balanceamento

Verificar:

```text
MATCH
NO_MATCH
HARD_NEGATIVE
```

Antes do treinamento.

Calcular:

```text
total
positive
negative
hard_negative
percentage
```

Se houver desequilíbrio significativo, avaliar:

* undersampling;
* oversampling;
* class weights;
* hard negative sampling.

A estratégia utilizada deverá ser registrada no manifesto do dataset.

---

# 29. Prevenção de Data Leakage

É obrigatório impedir que informações equivalentes apareçam simultaneamente em:

```text
TRAIN
VALIDATION
TEST
```

Não dividir simplesmente linhas aleatoriamente quando isso permitir que o mesmo aluno ou pares derivados do mesmo registro apareçam em conjuntos diferentes.

Registrar:

```text
random_seed
dataset_version
split_strategy
```

---

# 30. Divisão do Dataset

Utilizar inicialmente:

```text
70% TRAIN
15% VALIDATION
15% TEST
```

Configuração:

```env
DATASET_TRAIN_RATIO=0.70
DATASET_VALIDATION_RATIO=0.15
DATASET_TEST_RATIO=0.15
DATASET_RANDOM_SEED=42
```

---

# 31. Estrutura do Dataset

Criar:

```text
dataset-pipeline/
├── src/
│   ├── importers/
│   │   ├── chromos-importer.ts
│   │   └── sisu-importer.ts
│   │
│   ├── normalizers/
│   │   └── name-normalizer.ts
│   │
│   ├── blocking/
│   │   └── candidate-blocking.ts
│   │
│   ├── generators/
│   │   ├── positive-pair-generator.ts
│   │   ├── negative-pair-generator.ts
│   │   └── hard-negative-generator.ts
│   │
│   ├── features/
│   │   └── feature-generator.ts
│   │
│   ├── validation/
│   │   └── dataset-validator.ts
│   │
│   ├── balancing/
│   │   └── dataset-balancer.ts
│   │
│   ├── splitting/
│   │   └── dataset-splitter.ts
│   │
│   └── export/
│       └── dataset-exporter.ts
│
├── datasets/
│   ├── raw/
│   ├── processed/
│   ├── train/
│   ├── validation/
│   └── test/
│
├── manifests/
└── tests/
```

---

# 32. Formato de exportação

Gerar:

```text
datasets/
├── dataset-v1.0.0.csv
├── dataset-v1.0.0.json
└── dataset-v1.0.0.manifest.json
```

Nunca sobrescrever datasets versionados.

---

# 33. Exemplo do Dataset

O CSV deverá possuir estrutura semelhante a:

```csv
student_name,candidate_name,jaro_winkler,levenshtein_similarity,token_similarity,same_first_name,same_last_name,first_name_similarity,last_name_similarity,same_initials,token_count_difference,token_order_similarity,full_name_similarity,label
JOAO PEDRO DA SILVA,JOÃO PEDRO SILVA,0.96,0.91,0.90,1,1,1.0,1.0,1,1,0.95,0.95,1
JOAO PEDRO DA SILVA,JOAO PAULO SILVA,0.88,0.82,0.75,1,1,1.0,1.0,1,0,0.80,0.84,0
MARIA EDUARDA SOUZA,MARIA EDUARDA DE SOUZA,0.98,0.94,0.95,1,1,1.0,1.0,1,1,0.98,0.97,1
```

Esses valores são apenas exemplos de estrutura.

**Não inventar esses valores no dataset real.**

Eles deverão ser calculados pelo sistema.

---

# 34. Dataset Manifest

Criar:

```text
dataset-v1.0.0.manifest.json
```

Exemplo:

```json
{
    "version": "1.0.0",
    "records": 50000,
    "positive": 20000,
    "negative": 25000,
    "hard_negative": 5000,
    "train": 35000,
    "validation": 7500,
    "test": 7500,
    "random_seed": 42,
    "feature_version": "1.0.0",
    "source_versions": [
        "chromos-2026",
        "sisu-2026-8a-chamada"
    ]
}
```

Os valores deverão ser gerados automaticamente.

---

# 35. Dataset Quality Report

Antes de permitir treinamento, gerar:

```text
DATASET QUALITY REPORT

Version: 1.0.0

Total records: XXXXX

Positive: XXXXX
Negative: XXXXX
Hard Negative: XXXXX

Train: XXXXX
Validation: XXXXX
Test: XXXXX

Duplicates: 0
Null features: 0
Invalid features: 0
Data leakage: 0

Quality: PASS
```

Se:

```text
Quality != PASS
```

o treinamento deverá ser bloqueado.

---

# 36. Validações obrigatórias

O `DatasetValidator` deverá verificar:

* registros duplicados;
* nomes vazios;
* IDs inválidos;
* features nulas;
* features fora do intervalo;
* labels inválidos;
* distribuição das classes;
* data leakage;
* registros duplicados entre splits;
* consistência das features;
* quantidade mínima de exemplos;
* existência de hard negatives;
* integridade do manifesto.

Similaridades deverão estar entre:

```text
0.0
```

e:

```text
1.0
```

Campos booleanos deverão ser:

```text
0
```

ou:

```text
1
```

---

# 37. Dataset Versioning

Utilizar:

```text
dataset-v1.0.0
dataset-v1.1.0
dataset-v2.0.0
```

Cada versão deverá registrar:

```text
version
created_at
records
positive
negative
hard_negative
train
validation
test
random_seed
feature_version
algorithm_version
source_version
```

---

# 38. Relação Dataset → Modelo

Nenhum modelo poderá existir sem referência ao dataset usado para treiná-lo.

Exemplo:

```text
model-v1.0.0
        |
        +-- dataset-v1.0.0
        |
        +-- feature-v1.0.0
        |
        +-- algorithm-v1.0.0
```

No MySQL:

```text
ml_models
```

Campos:

```text
id
version
dataset_version
feature_version
algorithm_version
accuracy
precision
recall
f1_score
created_at
```

---

# 39. TensorFlow

Somente após o dataset estar validado implementar:

```text
TensorFlow Training
```

Entrada:

```text
features
```

Saída:

```text
MATCH
NO_MATCH
```

Avaliar:

```text
Accuracy
Precision
Recall
F1 Score
Confusion Matrix
```

Não utilizar apenas Accuracy como métrica.

---

# 40. Serviço Node.js

Criar um serviço:

```text
matching-ml-service
```

Endpoints:

```http
POST /api/v1/predict
POST /api/v1/batch-predict
GET /api/v1/model
GET /api/v1/health
```

Exemplo:

```json
POST /api/v1/predict
```

Entrada:

```json
{
    "studentName": "JOAO PEDRO DA SILVA",
    "candidateName": "JOÃO PEDRO SILVA"
}
```

Resposta:

```json
{
    "match": true,
    "probability": 0.97,
    "decision": "MATCH",
    "modelVersion": "1.0.0",
    "datasetVersion": "1.0.0"
}
```

---

# 41. Laravel

O Laravel será responsável por:

* importação;
* gerenciamento dos arquivos;
* gerenciamento dos alunos;
* gerenciamento dos candidatos;
* matching;
* revisão humana;
* auditoria;
* histórico;
* gerenciamento dos modelos;
* gerenciamento dos datasets;
* dashboard.

O TensorFlow não deverá ser acoplado diretamente ao domínio principal do Laravel.

A comunicação deverá ocorrer através de API.

---

# 42. Arquitetura

Utilizar:

```text
Laravel
    |
    +-- Domain
    |
    +-- Application
    |
    +-- Infrastructure
    |
    +-- Presentation
    |
    +-- Database
    |
    +-- Jobs
            |
            v
      ML Service
            |
            v
      TensorFlow.js
```

---

# 43. Clean Architecture

Separar:

```text
Domain
Application
Infrastructure
Presentation
```

Evitar:

```text
Controller
    ↓
Model
    ↓
TensorFlow
```

A regra de negócio não deve depender diretamente da implementação do TensorFlow.

---

# 44. Auditoria

Registrar:

```text
quem importou
quando importou
qual arquivo
qual versão
quantos registros
quantos erros
qual dataset foi gerado
qual modelo foi utilizado
qual decisão foi tomada
```

Para Human Review:

```text
reviewed_by
reviewed_at
review_decision
review_comment
```

---

# 45. Segurança

Nunca utilizar os dados abaixo como features do modelo sem justificativa explícita:

```text
CPF
EMAIL
TELEFONE
CELULAR
```

Esses campos podem ser utilizados para:

* validação;
* auditoria;
* identificação de registros;
* confirmação humana;

mas não devem ser utilizados automaticamente como atributos de treinamento apenas porque estão disponíveis.

Priorizar o matching nominal.

---

# 46. LGPD

Considerar:

* minimização de dados;
* controle de acesso;
* logs;
* auditoria;
* criptografia quando aplicável;
* não exposição desnecessária de CPF;
* não exposição desnecessária de dados de contato.

---

# 47. Fluxo completo

Implementar:

```text
IMPORTAR CHROMOS
       ↓
VALIDAR ARQUIVO
       ↓
NORMALIZAR NOMES
       ↓
IMPORTAR SISU
       ↓
VALIDAR ARQUIVO
       ↓
NORMALIZAR NOMES
       ↓
CANDIDATE BLOCKING
       ↓
GERAR PARES
       ↓
FEATURE ENGINEERING
       ↓
POSITIVE
NEGATIVE
HARD NEGATIVE
       ↓
DATASET VALIDATION
       ↓
BALANCEAMENTO
       ↓
TRAIN / VALIDATION / TEST
       ↓
DATASET QUALITY REPORT
       ↓
DATASET VERSION
       ↓
TENSORFLOW TRAINING
       ↓
MODEL EVALUATION
       ↓
MODEL VERSION
       ↓
PREDICTION
       ↓
HUMAN REVIEW
       ↓
NOVOS DADOS ROTULADOS
       ↓
NOVA VERSÃO DO DATASET
```

---

# 48. Fases de implementação

## Fase 1 — Estrutura do projeto

Criar:

```text
Laravel
Node.js
TypeScript
TensorFlow.js
MySQL
Docker
```

---

## Fase 2 — Importação

Implementar:

```text
ChromosImporter
SisuImporter
```

Importar os arquivos reais.

Gerar relatório:

```text
Arquivo
Quantidade de registros
Colunas
Registros válidos
Registros inválidos
Campos vazios
Duplicidades
```

---

## Fase 3 — Normalização

Implementar:

```text
NameNormalizer
```

Criar testes para:

* acentos;
* espaços;
* abreviações;
* caracteres especiais;
* nomes compostos;
* partículas;
* inversão de nomes.

---

## Fase 4 — Candidate Blocking

Implementar:

```text
CandidateBlocking
```

Reduzir a quantidade de comparações.

---

## Fase 5 — Construção do Dataset

Implementar obrigatoriamente:

```text
PositivePairGenerator
NegativePairGenerator
HardNegativeGenerator
FeatureGenerator
DatasetValidator
DatasetBalancer
DatasetSplitter
DatasetExporter
DatasetVersionManager
```

Executar:

```text
1. Importação
2. Normalização
3. Candidate Blocking
4. Geração dos pares
5. Feature Engineering
6. Validação
7. Detecção de duplicidades
8. Detecção de Data Leakage
9. Balanceamento
10. Train / Validation / Test
11. Dataset Quality Report
12. Dataset Manifest
13. Dataset Versioning
```

Somente depois:

```text
14. TensorFlow Training
15. Model Evaluation
16. Accuracy
17. Precision
18. Recall
19. F1 Score
20. Confusion Matrix
21. Model Versioning
22. Association Model → Dataset
```

---

# 49. Regra crítica para o agente

**NÃO iniciar o treinamento do TensorFlow antes da criação e validação do dataset.**

A ordem obrigatória é:

```text
DADOS
 ↓
IMPORTAÇÃO
 ↓
NORMALIZAÇÃO
 ↓
PARES
 ↓
FEATURES
 ↓
LABELS
 ↓
VALIDAÇÃO
 ↓
BALANCEAMENTO
 ↓
SPLIT
 ↓
DATASET VERSION
 ↓
TREINAMENTO
```

---

# 50. Dados insuficientes

Se as listas fornecidas não permitirem identificar automaticamente quais pares são verdadeiros:

**não inventar labels.**

Nesse caso:

1. gerar candidatos;
2. calcular features;
3. gerar ranking;
4. identificar casos de alta confiança;
5. separar casos ambíguos;
6. solicitar revisão humana;
7. utilizar decisões humanas aprovadas para formar o dataset supervisionado.

---

# 51. Synthetic Data

Dados sintéticos somente poderão ser utilizados se explicitamente solicitados.

Quando utilizados:

```text
source = synthetic
```

Nunca tratar automaticamente dados sintéticos como equivalentes aos dados reais.

O dataset deverá informar:

```text
real_records
synthetic_records
```

---

# 52. Critério de qualidade

O objetivo não é produzir o maior dataset possível.

O objetivo é produzir um dataset:

```text
REALISTA
BALANCEADO
AUDITÁVEL
REPRODUTÍVEL
SEM DATA LEAKAGE
COM HARD NEGATIVES
COM LABELS CONFIÁVEIS
VERSIONADO
```

---

# 53. Aceite do Dataset

O dataset somente poderá ser considerado pronto quando:

```text
[ ] Chromos importado
[ ] SISU importado
[ ] Campos mapeados
[ ] Nomes normalizados
[ ] Duplicidades verificadas
[ ] Candidate Blocking implementado
[ ] Positive pairs criados
[ ] Negative pairs criados
[ ] Hard negatives criados
[ ] Features calculadas
[ ] Labels validados
[ ] Dataset balanceado
[ ] Data leakage verificado
[ ] Train criado
[ ] Validation criado
[ ] Test criado
[ ] Quality Report gerado
[ ] Manifest gerado
[ ] Dataset versionado
[ ] Dataset reproduzível
[ ] Dataset pronto para TensorFlow
```

---

# 54. Resultado esperado

Ao final da primeira execução deverá existir algo semelhante a:

```text
datasets/
│
├── raw/
│   ├── chromos/
│   └── sisu/
│
├── processed/
│
├── train/
│   └── dataset-v1.0.0-train.csv
│
├── validation/
│   └── dataset-v1.0.0-validation.csv
│
├── test/
│   └── dataset-v1.0.0-test.csv
│
└── manifests/
    └── dataset-v1.0.0.manifest.json
```

E posteriormente:

```text
models/
└── model-v1.0.0/
    ├── model.json
    └── metadata.json
```

---

# 55. Regra final para o agente de desenvolvimento

Antes de escrever código de Machine Learning:

1. analisar os dois arquivos;
2. identificar corretamente os formatos;
3. mapear os campos;
4. mostrar a quantidade de registros;
5. identificar possíveis duplicidades;
6. explicar como serão encontrados os pares;
7. explicar como serão obtidos os labels;
8. criar o pipeline do dataset;
9. executar a validação;
10. gerar o primeiro dataset versionado;
11. apresentar o Quality Report;
12. somente então implementar o treinamento TensorFlow.

Não assumir que dois nomes iguais representam automaticamente a mesma pessoa.

Não assumir que nomes diferentes representam pessoas diferentes sem avaliar o contexto disponível.

Não inventar labels.

Não inventar dados.

Não sobrescrever datasets anteriores.

Cada modelo deverá informar exatamente qual dataset foi utilizado em seu treinamento.

A arquitetura deve permitir que novas decisões humanas sejam incorporadas posteriormente para gerar novas versões do dataset e novos modelos.

**Dataset primeiro. Modelo depois.**
