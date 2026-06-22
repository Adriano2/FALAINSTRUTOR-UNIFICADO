# Modelo de Provas — importação no Editor de Provas

Use este modelo para inserir as provas de **todos os treinamentos**. O arquivo
[`modelo-prova.csv`](./modelo-prova.csv) já vem **preenchido com uma prova de
exemplo (10 questões)** que serve de base — é só duplicar e adaptar por curso.

## Formato da planilha

Uma questão por linha. Colunas (separador `;`):

| Coluna | Conteúdo |
|--------|----------|
| **Pergunta** | O enunciado da questão |
| **Alternativa 1..N** | As opções de resposta (mínimo 2; pode ter 3, 4 ou mais) |
| **Resposta correta (numero)** | O **número** da alternativa correta (1 = Alternativa 1, 2 = Alternativa 2, ...) |

> ⚠️ A última coluna é o **número** da alternativa certa (1 a 4), **não** a letra.
> Ex.: se a resposta certa é a "Alternativa 2", escreva `2`.

## Como importar no painel

1. Abra **Painel Admin → Editor de Provas**.
2. Selecione o **curso** (treinamento).
3. (Opcional) Clique em **Exportar modelo** para baixar o cabeçalho padrão.
4. Preencha a planilha (a partir deste modelo) com as questões do curso.
5. Clique em **Importar** e selecione o arquivo `.csv` (ou `.xlsx`).
6. Confira as questões e **salve**.

A partir daí, o **servidor corrige a prova** automaticamente: o aluno envia só as
respostas, o sistema compara com o gabarito e calcula a aprovação (**mínimo 75%**).

## Dicas

- **Excel pt-BR:** o arquivo usa `;` e acentuação UTF-8 (BOM) — abre direto, sem
  bagunçar os acentos.
- **Google Sheets:** importe o `.csv` e, ao exportar, mantenha o separador `;`
  (ou exporte como `.xlsx` e importe assim mesmo).
- **Mais de 4 alternativas:** basta acrescentar colunas `Alternativa 5`, `6`, ...
  antes da coluna de resposta correta.
- **Uma prova por curso:** importe um arquivo para cada treinamento.
- Importar **substitui** a prova atual daquele curso (inclusive a genérica de base).

## Sugestão de quantidade

Para provas regulamentadas, recomenda-se **10 questões** por treinamento, com
aprovação a partir de **75%** (7,5 → 8 acertos). O modelo já traz 10 questões.
