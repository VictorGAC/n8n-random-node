# Node n8n Random

Node custom para o n8n que encapsula a [API de inteiros verdadeiramente aleatórios do Random.org](https://www.random.org/integers/). O node recebe os limites mínimo e máximo inclusivos e retorna um único inteiro imparcial gerado pelo Random.org.

## Requisitos

- Node.js 22 LTS (use `nvm use 22` ou baixe em [nodejs.org](https://nodejs.org))
- npm 10+
- Docker e Docker Compose

## Estrutura do projeto

```
.
|-- docker-compose.yml       # Stack n8n + PostgreSQL para desenvolvimento local
|-- icons/random.svg         # Ícone utilizado pelo node Random
|-- index.ts                 # Ponto de entrada exportando o node
|-- nodes/Random/Random.node.ts
|-- dist/                    # Saída de build consumida pelo n8n (gerada)
|-- README.md
```

## Configuração

1. Instale as dependências
   ```bash
   npm install
   ```
2. Compile os arquivos TypeScript
   ```bash
   npm run build
   ```
   Os arquivos compilados são gravados em `dist/` e são os consumidos pelo n8n.

> Dica: durante o desenvolvimento, use `npm run dev` para recompilar a cada alteração.

## Executando o n8n localmente

1. Suba o stack (n8n + PostgreSQL):
   ```bash
   docker compose up -d
   ```
2. Acesse http://localhost:5678 no navegador e conclua o onboarding inicial.
3. O repositório é montado em `/home/node/.n8n/custom/n8n-nodes-random` dentro do container, então o node Random aparece em **Random - True Random Number Generator** assim que existir a build em `dist/`.

Para encerrar o stack:

```bash
docker compose down
```

Os volumes nomeados `postgres_data` e `n8n_data` preservam o banco e as configurações do n8n; adicione `-v` caso deseje limpar tudo.

## Utilizando o node Random

- **Min**: limite inferior inclusivo. Precisa ser inteiro.
- **Max**: limite superior inclusivo. Precisa ser inteiro maior ou igual a **Min**.
- Saída: `{ min, max, result, provider }`, onde `result` é o inteiro retornado pelo Random.org.

O node valida os dados informados e propaga mensagens de erro amigáveis da API do Random.org.

## Qualidade e verificações

- `npm run lint`: executa o ESLint sobre `nodes/**/*.ts`.

## Publicação / Empacotamento

Quando quiser distribuir o node, execute `npm run build` e publique o pacote (ou use `npm pack`) para que outras instâncias do n8n possam instalar via `n8n install <nome-do-pacote>`.

## Solução de problemas

- Se o n8n não listar o node Random, confirme que `npm run build` foi executado antes de subir o Docker para garantir a existência de `dist/`.
- Como o projeto exige Node.js `>=22`, usar versões mais antigas ao rodar `npm install` gera um aviso de engines.
- A API do Random.org possui cotas de requisição; falhas são exibidas no n8n com detalhe sobre o problema.

---

Criado para o desafio de conector customizado do n8n Random.
