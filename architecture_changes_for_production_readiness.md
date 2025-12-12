# Architecture Roadmap: Production Readiness

This document outlines the critical structural and architectural changes required to transition the AQI Intervention Lab from an MVP (Minimum Viable Product) to a scalable, secure, and production-grade application.

## 1. Critical Architecture: Decoupling `App.tsx`
**Current State:** 
`App.tsx` acts as a "God Component," handling layout, global state (User, Data), view routing, and business logic simultaneously.

**Risks:** 
High coupling makes the app difficult to maintain, test, and extend. Adding new features increases complexity exponentially.

**Required Changes:**
*   **Routing:** Replace conditional rendering (`switch(currentView)`) with **React Router v6+**.
    *   *Benefit:* Enables deep linking (e.g., `/pune/baner/analysis`), browser history navigation, and lazy loading of routes.
*   **State Management:** Extract state out of `App.tsx`.
    *   Use **Context API** for simple global state (Theme, User Auth).
    *   Use **Zustand** or **Redux Toolkit** for complex application state (Intervention Projects, Analysis history).
    *   *Benefit:* Prevents "prop drilling" (passing data through multiple layers of components).

## 2. Security: API Key Protection
**Current State:** 
The application accesses the Google Gemini API directly from the browser using `process.env.API_KEY`.

**Risks:** 
In a production environment, the API key is exposed in the client-side bundle, allowing malicious actors to steal quota or incur costs.

**Required Changes:**
*   **Backend Proxy:** Implement a lightweight backend (Node.js/Express, Next.js API Routes, or Python/FastAPI).
*   **Flow:** Client sends request to Backend -> Backend appends API Key -> Backend calls Google Gemini -> Backend returns result to Client.
*   *Benefit:* The API key never leaves the secure server environment.

## 3. Data Integrity & Management
**Current State:** 
Data is static and hardcoded in `constants.ts`. Authentication checks against a mock local object.

**Risks:** 
Data is not persistent; page refreshes reset state. AQI data requires real-time accuracy.

**Required Changes:**
*   **Authentication:** Integrate a dedicated Identity Provider (IdP) like **Firebase Auth**, **Auth0**, or **Supabase**.
*   **Data Fetching:** specific Use **TanStack Query (React Query)** for server state management.
    *   *Benefit:* Handles caching, background refetching (polling for live AQI data), loading states, and error retries automatically.
*   **Database:** Migrate `MOCK_CITIES` and `MOCK_PROJECTS` to a real database (PostgreSQL or NoSQL) to persist intervention plans and analysis history.

## 4. Scalable Folder Structure
**Current State:** 
A flat `components/` directory containing all UI elements.

**Risks:** 
As the component library grows to 50+ files, navigation becomes difficult and domains get mixed.

**Required Changes:**
Adopt a **Feature-based Architecture**:
```text
/src
  /features
    /auth
      /components/Login.tsx
      /hooks/useAuth.ts
      /authSlice.ts
    /dashboard
      /components/AqiChart.tsx
      /components/PollutantCard.tsx
    /analysis
      /components/AnalysisView.tsx
      /services/geminiAnalysis.ts
  /components     (Shared/Generic UI: Buttons, Modals, Inputs)
  /hooks          (Shared hooks)
  /utils          (Shared helpers)
```

## 5. AI Integration Robustness
**Current State:** 
The app relies on `JSON.parse(response.text)` from the LLM.

**Risks:** 
LLMs are non-deterministic. They may occasionally return Markdown (` ```json ... ``` `) or malformed JSON, causing the application to crash.

**Required Changes:**
*   **Sanitization:** Implement a utility to strip Markdown code blocks before parsing.
*   **Schema Validation:** Use **Zod** to validate the parsed object against a strict schema at runtime.
    *   *Example:* Ensure `phases` is always an array and `confidence` is always a number.

## 6. UI/UX Refinement for Scale
**Current State:** 
Dense dashboard information that may look crowded on mobile devices.

**Required Changes:**
*   **Responsive Charts:** Use CSS media queries or conditional rendering to simplify charts on mobile devices (e.g., show Sparklines instead of complex Area Charts).
*   **Feedback Systems:** Implement a **Toast/Notification System** (e.g., `sonner` or `react-hot-toast`) to provide immediate visual feedback for actions like "Analysis Started" or "Project Created," replacing `console.log` or simple text alerts.
