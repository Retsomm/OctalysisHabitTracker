# goalApp 專案規範

## 回覆語言
所有回覆一律使用**繁體中文**。

## 技術錯誤處理
遇到技術問題，優先查閱**官方文件**。如需文件內容，主動向使用者索取，不自行推斷或產生幻覺。

## 技術棧

| 層級 | 技術 | 用途 |
|------|------|------|
| 前端 | React + Vite + Tailwind + TypeScript + Redux Toolkit (RTK Query) | UI、狀態、效能優化 |
| 後端 | Node.js + Express + TypeScript (ESM) | API 分層架構 |
| 資料庫 | Prisma ORM + MySQL (prod) / SQLite (dev) | 多環境資料庫切換 |
| API 測試 | Postman | |

## 前端規範（React + Vite + Tailwind + TypeScript）
- 使用yarn 安裝
- 元件使用 `const` 箭頭函數
- 使用 React hooks（`useState`, `useEffect` 等）
- 樣式使用 Tailwind utility class，不寫自訂 CSS
- 狀態管理使用 Redux Toolkit；API 請求使用 RTK Query
- 函數邏輯簡單清晰，不過度抽象化
- 以可測試性為設計前提（純函數、明確 props、副作用隔離）

```tsx
const MyComponent = (): JSX.Element => {
  const [value, setValue] = useState<string>('')
  return <input className="border rounded px-2 py-1" value={value} onChange={e => setValue(e.target.value)} />
}
export default MyComponent
```

## 後端規範（Node.js + Express + TypeScript）
- 使用 ES Modules（ESM）：`import/export`，不使用 `require`
- 分層架構：`routes/` → `controllers/` → `services/`
- 每層職責單一，依賴可注入，便於測試

```ts
import express, { Request, Response } from 'express'
const router = express.Router()
router.get('/goals', async (req: Request, res: Response) => {
  const goals = await goalService.getAll()
  res.json(goals)
})
export default router
```

## 資料庫規範（Prisma + MySQL/SQLite）
- Schema 定義於 `prisma/schema.prisma`
- dev 環境使用 SQLite，prod 環境使用 MySQL
- 透過 `DATABASE_URL` 環境變數切換資料庫

```prisma
model Goal {
  id        Int     @id @default(autoincrement())
  title     String
  completed Boolean @default(false)
}
```

## TypeScript 通則
- `strict: true`
- 不使用 `any`，必要時用 `unknown`
- 型別定義放 `types/` 或與模組並置

## 程式碼品質原則
- 不過度設計，不為假設需求預先抽象
- 只在系統邊界（使用者輸入、外部 API）處理 error
- 邏輯自明不加多餘 comments
- 優先修改現有檔案，不隨意新增檔案
