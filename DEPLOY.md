# Инструкция по деплою на GitHub Pages

## Шаг 1: Подготовка репозитория

1. Создайте новый репозиторий на GitHub
2. Инициализируйте git в проекте:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git
git push -u origin main
```

## Шаг 2: Настройка для GitHub Pages

Если ваш репозиторий называется не `your-repo-name`, обновите `next.config.ts`:

```typescript
basePath: '/your-repo-name',
assetPrefix: '/your-repo-name',
```

## Шаг 3: Настройка GitHub Actions

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./out

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

## Шаг 4: Включение GitHub Pages

1. Перейдите в Settings → Pages вашего репозитория
2. В разделе "Source" выберите "GitHub Actions"
3. После первого push в main, GitHub Actions автоматически задеплоит сайт

## Альтернативный способ (без Actions)

Если не хотите использовать Actions:

1. Выполните локально:
```bash
npm install
npm run build
```

2. Папка `out` будет содержать статический сайт
3. В Settings → Pages выберите "Deploy from a branch"
4. Выберите ветку `main` и папку `/out`
5. Или вручную загрузите содержимое папки `out` в ветку `gh-pages`

## Важно

- После деплоя сайт будет доступен по адресу: `https://your-username.github.io/your-repo-name/`
- Если репозиторий в корне (username.github.io), уберите `basePath` и `assetPrefix` из `next.config.ts`
