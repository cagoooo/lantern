# 🏮 石門國小 2026 猜燈謎遊戲 - 使用說明書

## 📖 專案概述
本專案是專為石門國小 2026 年元宵節活動設計的互動式網頁猜燈謎遊戲。結合了傳統春節氛圍與現代網頁技術，提供學生有趣的闖關體驗，並讓教師能輕鬆管理題目與查看統計數據。

## 🚀 核心功能
### 學生端 (闖關體驗)
- **循序漸進闖關**：共有 10 道精心設計的燈謎，包含動物、地名、校內師長名及成語。
- **動態提示系統**：若答錯兩次，系統將自動顯示循序漸進的提示，引導學生思考。
- **即時互動反饋**：答對時噴發紙屑慶祝，答錯時提供溫馨鼓勵，完成所有關卡更有煙火動畫。
- **個人與班級排行**：實時更新的排行榜，激發班級競爭力與榮譽感。
- **PWA 支援**：支援離線快取與桌面安裝，連線不穩時也能順暢遊玩。

### 教師端 (後台管理)
- **統計儀表板**：直觀查看全校參與人數、班級參與率及各題正確率 analytic。
- **題庫管理系統**：支援新增、修改與刪除燈謎題目，包含答案與詳細解析。
- **校內專屬存取**：透過 Firebase Email/Password 認證保護管理權限。

## 🛠 技術架構
- **前端 (Frontend)**: React 18, Vite, Tailwind CSS, Framer Motion (動畫).
- **後端 (Backend)**: Express.js (Node.js).
- **資料庫 (Database)**: Firebase Firestore (雲端同步) + LocalStorage (本地備份).
- **認證 (Auth)**: Firebase Anonymous Auth (匿名認證).

## 💻 本地開發指南
### 1. 安裝環境
確保您的環境已安裝 Node.js (建議 v18 以上)。

### 2. 安裝依賴
```bash
npm install
```

### 3. 設定環境變數
建立一個 `.env` 檔案並填入您的 Firebase 配置（可參考 `.env.example`）：
```env
# Firebase 配置
VITE_FIREBASE_API_KEY=...
# 其他 VITE_ 開頭的變數

# 教師管理帳號 (請在 Firebase Console 建立)
VITE_TEACHER_EMAIL=teacher@smes.edu.tw
```

### 4. 啟動開發環境
```bash
npm run dev
```

## 🚀 部署指南 (GitHub Pages)

本專案已優化為**純靜態架構 (Serverless)**，您可以直接部署至 GitHub Pages：

### 1. 建立 GitHub Actions
專案已包含 `.github/workflows/deploy.yml`。當您將代碼推送到 `main` 分支時，系統會自動：
1. 打包專案 (`npm run build`)。
2. 將結果部署到 `gh-pages` 分支。

### 2. 設定 GitHub Repository
1. 前往 GitHub Repository 的 **Settings > Pages**。
2. 在 **Build and deployment > Branch** 選擇 `gh-pages` 分支。
3. 儲存後，您的專案將在幾分鐘內上線。

### 3. 環境變數設定 (GitHub Secrets)
由於 GitHub Pages 是公開的，請**務必**在 GitHub Repository 設定中加入機密變數，以便 Actions 進行安全打包：
1. 前往 **Settings > Secrets and variables > Actions**。
2. 點擊 **New repository secret**，依序新增以下變數：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_TEACHER_CODE` (教師登入密碼)

---
*本專案由 Antigravity 協助優化為 Serverless 架構。*
