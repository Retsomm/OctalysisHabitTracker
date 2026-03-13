# Octalysis Habit Tracker

基於 Octalysis 框架的習慣追蹤應用，幫助用戶透過遊戲化元素建立持續的好習慣。

## 🏗️ 項目架構

- **前端**: React + TypeScript + Vite + Tailwind CSS
- **後端**: Node.js + Express + TypeScript + Prisma
- **資料庫**: PostgreSQL (Supabase)
- **部署**: Vercel (前端) + Render (後端)

## 🚀 快速開始

### 環境要求

- Node.js 22.x
- Yarn 1.22.x
- PostgreSQL 資料庫

### 本地開發設定

1. **克隆專案**
```bash
git clone https://github.com/Retsomm/OctalysisHabitTracker.git
cd OctalysisHabitTracker
```

2. **設定環境變數**
```bash
# 後端環境變數
cp backend/.env.example backend/.env
# 編輯 backend/.env 填入實際的環境變數值

# 前端環境變數
cp frontend/.env.example frontend/.env
# 編輯 frontend/.env 填入實際的環境變數值
```

3. **安裝依賴**
```bash
# 後端依賴
cd backend
yarn install

# 前端依賴
cd ../frontend
yarn install
```

4. **資料庫設定**
```bash
cd backend
yarn db:migrate
yarn db:generate
```

5. **啟動開發服務器**
```bash
# 啟動後端 (端口 3001)
cd backend
yarn dev

# 啟動前端 (端口 5173)
cd frontend
yarn dev
```

## 📦 構建與部署

### 本地構建測試

```bash
# 構建後端
cd backend
yarn build

# 構建前端
cd frontend
yarn build
```

### 自動化部署

專案已配置 GitHub Actions 進行自動化部署：

- **推送到 main 分支** → 自動觸發部署流程
- **後端** → 部署到 Render
- **前端** → 部署到 Vercel
- **資料庫** → 自動執行 migration

## 🔧 開發工具

- **ESLint**: 代碼規範檢查
- **TypeScript**: 靜態類型檢查
- **Prisma**: 資料庫 ORM
- **Tailwind CSS**: CSS 框架

## 📁 專案結構

```
├── backend/                # 後端應用
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── routes/         # 路由
│   │   ├── services/       # 服務層
│   │   ├── middleware/     # 中介軟體
│   │   └── types/          # 類型定義
│   ├── prisma/             # 資料庫配置
│   └── package.json
├── frontend/               # 前端應用
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/          # 頁面組件
│   │   ├── store/          # Redux 狀態管理
│   │   └── types/          # 類型定義
│   └── package.json
└── .github/workflows/      # CI/CD 配置
```

## 🔐 環境變數說明

### 後端 (.env)
- `JWT_SECRET`: JWT 令牌密鑰
- `DATABASE_URL`: PostgreSQL 資料庫連接 URL
- `LINE_CLIENT_ID/SECRET`: LINE Login OAuth 設定
- `X_CLIENT_ID/SECRET`: X (Twitter) OAuth 設定

### 前端 (.env)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth 客戶端 ID
- `VITE_LINE_*`: LINE Login 相關設定
- `VITE_X_*`: X (Twitter) 相關設定

## 🤝 貢獻指南

1. Fork 專案
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 許可證

本專案採用 MIT 許可證 - 詳見 LICENSE 文件。