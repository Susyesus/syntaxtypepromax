# Software Design Description — SyntaxType v2

**CEBU INSTITUTE OF TECHNOLOGY – UNIVERSITY**
College of Computer Studies

*Typing-Based C Programming Platform (Phase 2 Continuation)*

**Team Code: 63**

- Abalorio, Noel Keth V.
- Ano-os, Iesus Rey A.
- Cararag, Trisha Raye
- Lapina, Honey Fate
- Labajo, Cris Angelo

**Version 2 — Post-SRS Audit Edition**

| Version | Date | Author | Description |
| :-: | :-: | :-: | :-: |
| 2.0 | 2026 | Team 63 | Updated to align with SRS v2.0 code-to-document audit. Architecture, component, and data design sections added. |
| 2.1 | 2026 | Team 63 | Post-audit revision. Open items and deviations formally documented. Security remediation plan added. Sections 5–8 expanded. |

---

## Table of Contents

1. Introduction
2. System Overview
3. Component Design
4. Backend Component Design
5. Data Design
6. Interface Design
7. Security Design
8. Design Traceability — SRS to SDD
9. Open Items and Recommended Improvements
10. Non-Functional Design
- Appendix A — Technology Stack Quick Reference
- Appendix B — Open Items Summary

---

# 1. Introduction

## 1.1 Purpose

This Software Design Description (SDD) specifies the architectural, component-level, data, and interface design of the Phase 2 SyntaxType platform. It is the primary reference for developers implementing or extending any system module, and serves as the traceability link between the Software Requirements Specification (SRS v2.0) and the delivered codebase.

Version 2 incorporates findings from the SRS v2.0 code-to-document audit. All deviations from the originally specified design are formally documented in this version, along with remediation plans for the two open security items identified during audit.

## 1.2 Scope

SyntaxType is a client–server web application that trains first-year BSIT students in C programming syntax through gamified typing exercises. Phase 2 extends the inherited falling-block engine with five modules:

- **Module 1 — Bug Smasher Enhancement**: error-injection layer on the falling-block engine using a pre-authored `wrongWords` pool.
- **Module 2 — Syntax Sniper (Syntax Saver)**: drag-and-drop keyword matching and code-reorder drills.
- **Module 3 — Translation Terminal**: C-code generation from natural-language prompts, using the GalaxyChallenge `FILL_IN_THE_BLANK` pathway and the Judge0 code-execution pathway.
- **Module 4 — Teacher Dashboard and Lesson Repository**: TinyMCE-based lesson authoring, challenge management, and student progress monitoring.
- **Module 5 — Gamified Progression and Logic Puzzle Engine**: leaderboard combined scoring, achievement badges, and the Galaxy Challenge RPG game mode.

## 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
| :-: | :-: |
| SDD | Software Design Description — this document. |
| SRS | Software Requirements Specification (v2.0, Team 63). |
| JWT | JSON Web Token — HMAC-SHA256, 24-hour expiry. Claims: subject, role, id, isTempPassword. |
| RBAC | Role-Based Access Control — enforced via `@PreAuthorize` annotations. Roles: USER, ADMIN, TEACHER, STUDENT. |
| SPA | Single-Page Application — the React 18.2.0 frontend deployed on Vercel. |
| JPA | Jakarta Persistence API — used via Spring Data JPA 3.4.4 with Hibernate ORM. |
| DTO | Data Transfer Object — API serialisation boundary (package `com.syntaxtype.demo.DTO`). |
| HikariCP | JDBC connection pool: max-pool-size=10, min-idle=2. |
| Judge0 | External code execution API used in `codeChallenges.js` for C code compilation and running. |
| TinyMCE | Browser-based rich-text editor used in `CreateLessonModule.js` and `EditLessonModule.js`. |
| Combined Score | Leaderboard ranking metric: WPM × (accuracy/100); ×1.5 if accuracy > 95%. Rounded to 2 decimal places. |
| wrongWords | Pre-authored pool of corrupted C tokens stored in `Challenge.wrongWords` (`challenge_wrong_words` table). Used by Bug Smasher. |
| Category (enum) | Leaderboard/Scoring enum: TYPING_TESTS, FALLING_WORDS, GALAXY, GRID, BOOKWORM, CROSSWORD, FOUR_PICS, CODE_CHALLENGES, MAP, SYNTAX_SAVER, CHALLENGES, OVERALL. |

## 1.4 Document Relationships

This SDD is subordinate to the SRS v2.0 and takes precedence over the SDD v1.0 wherever they conflict. The SRS v2.0 is the requirements authority; the SDD v2.0 is the design authority.

| Document | Version | Relationship |
| :-: | :-: | :-: |
| Capstone Proposal | Revised (C-Only) | Source of pedagogical goals and module scope. |
| SRS | v2.0 (Code-to-Document Audit) | Primary requirements source for this SDD. |
| SDD (this document) | v2.0 | Design authority for all Phase 2 implementation. |

---

# 2. System Overview

## 2.1 System Context

SyntaxType is a web-based eLearning platform for BSIT first-year students at CIT-University. It runs as a client–server application with no native mobile client. The system context boundary includes:

- **Student users** — interact via browser on desktop/laptop hardware in institutional computer laboratories.
- **Faculty/Admin users** — manage lesson content and monitor student analytics via the Teacher Dashboard.
- **Judge0 API** — external service for compiling and executing student-submitted C code (Translation Terminal / Code Challenges).
- **TinyMCE Cloud** — external service providing the rich-text editing component for lesson authoring.
- **Vercel (frontend host)** — CDN-backed deployment of the React SPA.
- **Render.com (backend host)** — Docker-containerised Spring Boot REST API and managed PostgreSQL database.

## 2.2 High-Level Architecture

SyntaxType follows a three-tier layered architecture: Presentation (React SPA) → Application (Spring Boot REST API) → Data (PostgreSQL). The tiers communicate via JSON over HTTPS with JWT bearer-token authentication.

**Presentation Tier (Frontend)**

- Technology: React 18.2.0, React Router DOM 6.14.1, Material UI v7.1.1, Tailwind CSS v3.x, Axios 1.9.0.
- State management: React component state and `sessionStorage` for game-mode state (no Redux or global state library).
- Routing: `ProtectedRoute.js` and `PublicOnlyRoute.js` enforce authentication and role guards on the client side.
- Deployment: Vercel CDN (`https://syntaxtype-deploy-omega.vercel.app`).

**Application Tier (Backend)**

- Technology: Java 17 (OpenJDK eclipse-temurin), Spring Boot 3.4.4, Spring Security 3.4.4, Spring Data JPA 3.4.4.
- Architecture pattern: Controller → Service → Repository → Entity (package structure: controller, service, repository, entity).
- Security: Stateless JWT (JJWT 0.12.6, HMAC-SHA256), BCryptPasswordEncoder (strength 10), RBAC via `@PreAuthorize`.
- API documentation: SpringDoc OpenAPI v2.8.5 (Swagger UI available at `/swagger-ui.html`).
- Caching: Spring Cache (in-memory) on `LeaderboardController` read endpoints.
- Deployment: Docker container on Render.com (port 8080).

**Data Tier**

- Technology: PostgreSQL (Render managed instance), Spring Data JPA with Hibernate, HikariCP connection pool (max 10, min-idle 2).
- Primary driver: `org.postgresql:postgresql` v42.7.5 (`mysql-connector-j` declared but inactive).

## 2.3 Deployment Architecture

| Component | Host | Technology | URL / Port |
| :-: | :-: | :-: | :-: |
| React SPA | Vercel | React 18.2.0 / CRA 5.0.1 | `https://syntaxtype-deploy-omega.vercel.app` |
| Spring Boot API | Render.com (Docker) | Java 17 / Spring Boot 3.4.4 | port 8080 (internal) |
| PostgreSQL DB | Render.com (managed) | PostgreSQL | `SPRING_DATASOURCE_URL` env var |
| Judge0 API | External | REST (C compilation/execution) | `codeChallenges.js` |
| TinyMCE Cloud | External | SaaS rich-text editor | API key in `CreateLessonModule.js` |

---

# 3. Component Design

## 3.1 Frontend Component Architecture

The React SPA is organized into feature-based folders. Each game mode has a primary component that manages its session state, timer, scoring, and submission lifecycle. All score submissions are routed through the shared `useScoreSubmission` hook.

### 3.1.1 Shared / Cross-Cutting Components

| Component / Hook | Responsibility | Key Interactions |
| :-: | :-: | :-: |
| `ProtectedRoute.js` | Guards routes by authentication status and role. Checks `isTempPassword` JWT claim to redirect teachers to password-setup page. | `JwtUtils.js`, `AuthUtils.js`, React Router |
| `useScoreSubmission` (hook) | Centralised score-posting logic. Issues `POST /api/scores/{category}` with `{ wpm, accuracy, score, timeSpent }`. Returns `LeaderboardUpdateResult` DTO. | `ScoreController`, `LeaderboardController` |
| `JwtUtils.js` / `AuthUtils.js` | Client-side JWT decoding (`jwt-decode` v4.0.0). Extracts role, id, isTempPassword from `localStorage` token. | All authenticated components |
| `LeaderboardPage.js` | Filterable, metric-switchable top-10 leaderboard table. Supports Combined Score, WPM, and Accuracy metrics. Filters by Category enum. | `GET /api/leaderboards/global`, `/game/{category}` |
| `PersonalStatsDashboard.js` | Per-student cumulative statistics display (WPM, accuracy, totalWordsTyped, totalTimeSpent, totalErrors, totalTestsTaken, fastestClearTime). | `GET /api/user-statistics` |

### 3.1.2 Module 1 — Bug Smasher (`AdvancedFallingTypingTest.js`)

Extends the inherited falling-block engine. Reads game configuration from `sessionStorage` (`fallingGameConfig`) and presents blocks drawn from both the correct words pool and the `wrongWords` pool.

**Key Design Decisions:**

- Session state is managed entirely in React component state. No server round-trips occur during active gameplay — only on session end.
- Block classification: words pool blocks are marked `isCorrect: true`; wrongWords blocks are marked `isCorrect: false`. Blocks are interleaved randomly at render time.
- Input validation uses case-sensitive string comparison in React state (not a server endpoint). A configurable tolerance for trailing whitespace is implemented.
- Life consumption is gated by the `Challenge.useLives` Boolean field. When false, the game runs in unlimited-lives mode.
- On session completion, the component calls `useScoreSubmission.submitScore('FALLING_WORDS', payload)`.

> ⚠ **DEVIATION / OPEN ITEM:** Original SRS specified a runtime mutation engine applying five rules (semicolon removal, operator substitution, brace mismatch, pointer corruption, preprocessor malformation) at configurable frequency. The production implementation uses a pre-authored `wrongWords` pool (`Challenge.wrongWords`) stored in the database. All error variants are authored by teachers at content-creation time via `InstructorModule.js`. No runtime mutation engine is implemented. **Design decision:** pre-authored pools provide pedagogically consistent error sets and avoid runtime ambiguity about whether a generated error is 'realistic'. **Recommendation:** document the authoring guidelines for `wrongWords` to ensure error quality.

### 3.1.3 Module 2 — Syntax Sniper (`SyntaxSaverLesson.js`)

Presents C programming drills through match and reorder question types sourced from the static `QuizData.js` file. Uses `@hello-pangea/dnd` v18.0.1 for drag-and-drop interaction.

**Key Design Decisions:**

- Quiz content is currently hardcoded in `QuizData.js` (frontend). This is a static data source — teachers cannot add or modify Syntax Saver drills through the Teacher Dashboard at runtime.
- Validation: match steps use case-insensitive string comparison of dropped token against expected answer. Reorder steps compare final array order against the expected sequence.
- Score submission uses `POST /api/scores/SYNTAX_SAVER` via `useScoreSubmission` on lesson completion.
- The leaderboard category is `SYNTAX_SAVER` with Combined Score ranking (same formula as typing categories).

> ⚠ **DEVIATION / OPEN ITEM:** Original SRS specified: (1) Monaco editor with inline blank placeholders and single-keystroke capture per punctuation token, (2) automatic tier promotion (Tier 1–4) based on cumulative accuracy and KPM, (3) 40 timed drills with difficulty scaling to nested loops and function pointer declarations. Production: drag-and-drop keyword matching, no tier system, no KPM tracking, quiz content hardcoded in `QuizData.js`. **Remediation plan:** migrate `QuizData.js` content to a backend-managed structure (e.g., a `SyntaxSaverQuiz` entity) exposed via a new `/api/syntax-saver` endpoint, enabling teacher authoring. KPM tracking can be added to `UserStatistics` in a future sprint.

### 3.1.4 Module 3 — Translation Terminal (Two Pathways)

The Translation Terminal requirement is fulfilled by two parallel implementations:

**Pathway A — GalaxyChallenge `FILL_IN_THE_BLANK`:**

- `GalaxyMainGame.js` presents `FILL_IN_THE_BLANK` questions from `GalaxyChallenge` entities.
- Answer retrieval: `GET /api/galaxy-challenges/{id}/no-answer` (no correct flags) for display; `GET /api/galaxy-challenges/{id}/with-answer` for validation. Validation is client-side: the frontend compares student input against the Choice with `isCorrect = true`.
- Score submitted via `POST /api/scores/GALAXY`.

**Pathway B — Code Challenges (`codeChallenges.js` + Judge0):**

- Provides a full C code editor for open-ended code generation tasks.
- Student-submitted C code is sent to the external Judge0 API for compilation and execution. Results are returned and compared against expected output.
- This pathway most closely matches the Translation Terminal specification for complex C constructs.

> 🔴 **CRITICAL: Answer Security Gap — Pathway A:** The `/api/galaxy-challenges/{id}/with-answer` endpoint exposes the `isCorrect` flag on all `Choice` objects to the client before the student submits an answer. A student inspecting network traffic can retrieve correct answers without answering. **Recommended fix:** implement a `POST /api/galaxy-challenges/{id}/validate` endpoint that accepts the student's answer server-side and returns only a correct/incorrect boolean and corrective feedback — never exposing the raw `isCorrect` flag.

> ⚠ **DEVIATION / OPEN ITEM:** Original SRS specified: (1) a tokenized whitespace-normalising comparison algorithm with configurable stylistic tolerance, (2) a dedicated Translation Terminal authoring UI in the Teacher Dashboard, (3) side-by-side diff view for mismatched tokens. None of these are implemented. The GalaxyChallenge `FILL_IN_THE_BLANK` pathway provides the closest structural equivalent. The Judge0 pathway supports richer C code evaluation but lacks the RPG interface framing of the original spec.

### 3.1.5 Module 4 — Teacher Dashboard

The Teacher Dashboard is implemented across four frontend components:

| Component | Route | Responsibility |
| :-: | :-: | :-: |
| `InstructorModule.js` | `/instructor` | Main teacher hub. Lists lessons and challenges. Exposes challenge configuration UI (type selector, speed, lives, timer, words/wrongWords panels). Links to `CreateLessonModule` and `EditLessonModule`. |
| `CreateLessonModule.js` | `/lesson` | New lesson authoring. Title text input + TinyMCE rich-text editor. Issues `POST /api/lessons`. |
| `EditLessonModule.js` | `/lesson/edit/:id` | Lesson editing. Pre-populates TinyMCE from existing lesson content. Issues `PUT /api/lessons/{lessonId}`. |
| `ChallengePage.js` | `/challenges` | Challenge browsing and selection page for students. |

> ⚠ **DEVIATION / OPEN ITEM:** Four features specified in the SRS are not implemented: (1) **Lesson versioning** — no version field on `Lessons` entity; `PUT /api/lessons/{id}` performs a full overwrite. (2) **Soft-delete** — `DELETE /api/lessons/{id}` performs a hard delete with no recovery path. (3) **CSV/PDF analytics export** — no export endpoint exists. (4) **Cohort assignment UI** — not implemented in `InstructorModule.js`. **Remediation plan:** (1) Add a `LessonVersion` entity as a snapshot on every PUT; (2) Add `isDeleted` + `deletedAt` fields and a `PATCH /{id}/restore` endpoint; (3) Add a `/api/reports/students.csv` endpoint aggregating Score and UserStatistics data; (4) Add cohort grouping to the `TeacherTopics` relationship model.

### 3.1.6 Module 5 — Gamified Progression (`GalaxyMainGame.js` + `LeaderboardPage.js`)

The gamified progression layer is built around two constructs: the `Leaderboard` entity (combined score ranking) and the `GalaxyChallenge` RPG mode.

- `GalaxyChallengeList.js` lists available challenges via `GET /api/galaxy-challenges` (preview only, no answers).
- `GalaxyMainGame.js` manages the RPG session: question progression, answer evaluation, and score submission via `POST /api/scores/GALAXY`.
- `LeaderboardPage.js` renders the filterable top-10 table. Supports four metric views (Combined Score, WPM, Accuracy, Raw Score) and all Category enum values.
- Achievement badges are managed by `AchievementsController` and awarded via `StudentAchievementsController`. Currently assigned manually by Admin/Teacher — no automatic trigger on session completion.

> ⚠ **DEVIATION / OPEN ITEM:** XP system not implemented. The SRS and Proposal specified a dedicated XP field accumulating across sessions with level/rank progression. The production implementation uses the Leaderboard Combined Score as the de-facto progression metric (updated when a new personal best is achieved, not accumulated across sessions). A separate `totalScore` field in the `Scoring` entity stores per-session scores but is not aggregated into a lifetime XP total. **Remediation plan:** add a `lifetimeXP` field to `UserStatistics`, incremented by rawScore on every session completion regardless of whether it is a personal best.

---

# 4. Backend Component Design

## 4.1 Layer Structure

The Spring Boot backend follows a strict four-layer architecture. Cross-cutting concerns (security, caching, exception handling) are applied via Spring AOP and annotations.

| Layer | Package | Responsibility |
| :-: | :-: | :-: |
| Controller | `com.syntaxtype.demo.controller` | HTTP endpoint mapping. Request/response DTO serialisation. `@PreAuthorize` role enforcement. Delegates all business logic to Services. |
| Service | `com.syntaxtype.demo.service` | Business logic. Entity construction and validation. Leaderboard update orchestration. Cache management. |
| Repository | `com.syntaxtype.demo.repository` | Spring Data JPA repositories. Custom JPQL queries for leaderboard ranking and analytics aggregation. |
| Entity | `com.syntaxtype.demo.Entity` | JPA-mapped domain objects. `@PrePersist` lifecycle hooks (e.g., `User.onCreate()` sets `isTempPassword = true` for TEACHER role). |

## 4.2 Key Controllers and Services

| Controller | Base Route | Key Design Notes |
| :-: | :-: | :-: |
| `AuthController` | `/api/auth` | Stateless. Registers users by role (STUDENT self-register; TEACHER provisioned by ADMIN with `isTempPassword=true`). Issues JWT on `/login`. |
| `ChallengeController` | `/api/challenges` | Manages PARAGRAPH, FALLING_TYPING_TEST, and ADVANCED_FALLING_TYPING_TEST challenges. The `wrongWords` list is stored in `challenge_wrong_words` join table. |
| `GalaxyChallengeController` | `/api/galaxy-challenges` | Provides `/no-answer` and `/with-answer` variants. The `/with-answer` endpoint exposes `isCorrect` flags — see security warning in §3.1.4. |
| `ScoreController` | `/api/scores` | Accepts `POST /{category}`. Validates Category enum. Persists Score entity. Delegates to `LeaderboardService.updateLeaderboardIfBetter()`. |
| `LeaderboardController` | `/api/leaderboards` | Read endpoints (`@Cacheable 'leaderboard'`). Cache is NOT evicted on write — first post-write read incurs a cache miss. See open item in §7. |
| `LessonsController` | `/api/lessons` | Full CRUD. PUT performs full overwrite. DELETE performs hard delete. No versioning or soft-delete. |

## 4.3 Combined Score Algorithm

The leaderboard ranking formula, implemented in `LeaderboardEntry.calculateCombinedScore()`, is the authoritative ranking metric across all typing categories:

```
base = WPM × (accuracy / 100.0)
if (accuracy > 95.0) then base = base × 1.5
combinedScore = round(base, 2, HALF_UP)  [via BigDecimal]

Applied to categories: TYPING_TESTS, FALLING_WORDS, SYNTAX_SAVER
Non-typing categories (GALAXY, GRID, etc.): rawScore compared directly
```

---

# 5. Data Design

## 5.1 Core Entity Model

The following table describes the primary JPA entities and their key fields. All entities are persisted to Render PostgreSQL via Hibernate. Column naming follows Spring Data JPA defaults (snake_case via `@Column` or implicit naming strategy).

| Entity | Key Fields | Notes |
| :-: | :-: | :-: |
| `User` | id (UUID/Long), username, password (BCrypt), role (Role enum), isTempPassword | Base user entity. Inherited by Student, Teacher, Admin via SINGLE_TABLE or JOINED inheritance. |
| `Challenge` | id, title, words (List\<String\>), wrongWords (List\<String\>), challengeType (ChallengeType), speed, maxLives, useLives, testTimer | wrongWords stored in `challenge_wrong_words` join table. ChallengeType enum: PARAGRAPH, FALLING_TYPING_TEST, ADVANCED_FALLING_TYPING_TEST. |
| `Lessons` | lessonId, title, content (TEXT) | No version field. No isDeleted field. Hard-delete only. TinyMCE HTML stored as raw TEXT. |
| `GalaxyChallenge` | id, title, description, questions (List\<Question\>) | Question has: question (text), questionType (MULTIPLE_CHOICE, FILL_IN_THE_BLANK, MULTIPLE_ANSWER), choices (List\<Choice\>). Choice has: text, isCorrect. |
| `Score` | id, score, timeInSeconds, challengeType, wpm, submittedAt, user (FK) | Per-session score. Not aggregated into a lifetime total. |
| `Leaderboard` | id, user (FK), category (Category enum), wordsPerMinute, accuracy, totalWordsTyped, totalTimeSpent, combinedScore | Four indexes: idx_category_wpm, idx_category_accuracy, idx_category, idx_user. Updated only when new combinedScore exceeds stored record (best-only, not cumulative). |
| `UserStatistics` | id, user (FK), wordsPerMinute, accuracy, totalWordsTyped, totalTimeSpent, totalErrors, totalTestsTaken, fastestClearTime | Cumulative lifetime statistics. Updated on every session end. No lifetimeXP field (open item). |
| `Achievements` | id, name, description, badgeImageUrl, triggerCondition (String) | Teacher-authored. No automated award trigger on session completion. |
| `StudentAchievements` | id, student (FK), achievement (FK), awardedAt | Junction table. Manual assignment only — no automated trigger from `ScoreController`. |
| `Scoring` | id, user (FK), totalScore, category | Per-session raw score. Separate from Leaderboard entity. |
| `LessonAttempts` | id, user (FK), lesson (FK), completedAt, score | Tracks per-lesson completion status per student. |
| `Topics` / `StudentTopics` / `TeacherTopics` | id, title; junction tables | Topic tagging for lessons and assignments. Supports cohort-style grouping at the data layer; no UI in current Teacher Dashboard. |

## 5.2 Database Constraints and Indexes

- `Leaderboard`: composite unique constraint on `(user_id, category)` — one leaderboard record per user per category.
- `Leaderboard` indexes: `idx_category_wpm` (category, wordsPerMinute DESC), `idx_category_accuracy` (category, accuracy DESC), `idx_category`, `idx_user` — support efficient top-N queries.
- HikariCP pool: max 10 connections, min-idle 2, idle-timeout 600,000 ms. Under concurrent load exceeding 10 simultaneous score submissions, requests queue in HikariCP.

## 5.3 Caching Strategy

Spring Cache (in-memory, keyed by metric + category) is applied to `LeaderboardController` read endpoints via `@Cacheable(value='leaderboard')`.

> ℹ **NOTE: Known gap:** The leaderboard cache is not explicitly evicted when `LeaderboardService.updateLeaderboardIfBetter()` writes a new best score. The first post-write read incurs a cache miss and hits PostgreSQL; subsequent reads serve stale cached data until the cache entry expires or the application restarts. **Recommended fix:** add `@CacheEvict(value='leaderboard', allEntries=true)` to the `updateLeaderboardIfBetter` method, or switch to `@CachePut` with a targeted key.

---

# 6. Interface Design

## 6.1 REST API Interface Summary

All endpoints communicate via JSON over HTTPS. Authentication uses JWT bearer tokens in the Authorization header (except public endpoints). The following table summarises the verified production REST API:

| Controller (Base Route) | Methods and Sub-routes | Auth Requirement |
| :-: | :-: | :-: |
| `AuthController` (`/api/auth`) | `POST /register`, `/register/admin*`, `/register/teacher*`, `/login` | Public for `/register` and `/login`; *ADMIN only for admin and teacher registration. |
| `LessonsController` (`/api/lessons`) | GET (all), POST (create), PUT `/{id}` (overwrite), PATCH `/{id}/title`, DELETE `/{id}` | TEACHER/ADMIN for write operations. |
| `ChallengeController` (`/api/challenges`) | GET (all), POST, DELETE; `/falling`, `/falling/{id}`, `/normal/{id}` | TEACHER/ADMIN for write operations. |
| `GalaxyChallengeController` (`/api/galaxy-challenges`) | GET list/preview, GET `/{id}/no-answer`, GET `/{id}/with-answer`, POST, PATCH, DELETE | Authenticated. `/with-answer` exposes `isCorrect` — see security note. |
| `ScoreController` (`/api/scores`) | GET (all scores), POST (session score), GET/POST `/falling`, POST `/{category}` | Authenticated for POST. |
| `LeaderboardController` (`/api/leaderboards`) | GET `/global`, `/game/{category}`, `/user/{userId}`; full CRUD | Read public; write ADMIN. |
| `UserStatisticsController` (`/api/user-statistics`) | GET, POST, PATCH | Authenticated. |
| `AchievementsController` (`/api/achievements`) | GET, POST, PATCH, DELETE | ADMIN/TEACHER only for write. |
| `HealthController` (`/api/health`) | GET (health check) | Public. |

## 6.2 CORS Configuration

CORS is configured in `SecurityConfig.corsConfigurationSource()`. Permitted origins: `http://localhost:3000`, `http://localhost:5173`, `https://syntaxtype-deploy-omega.vercel.app`. Allowed methods: GET, POST, PUT, DELETE, OPTIONS. Credentials: allowed. The Authorization header is exposed. CSRF is disabled (appropriate for a stateless JWT API).

## 6.3 External Interface — Judge0 API

- Used by `codeChallenges.js` (Translation Terminal / Code Challenges pathway B).
- Student C code is submitted as a POST to the Judge0 REST API. The API compiles and executes the code and returns stdout, stderr, and a status code.
- Dependency risk: if the Judge0 API is unavailable, Code Challenges are non-functional. No fallback or retry is implemented.

## 6.4 External Interface — TinyMCE Cloud

- Used by `CreateLessonModule.js` and `EditLessonModule.js` for lesson content authoring.
- The TinyMCE API key is stored in the frontend source. Content is sanitised client-side by DOMPurify v3.3.0 before submission to `/api/lessons`.
- Dependency risk: if TinyMCE Cloud is unavailable, lesson authoring is non-functional. A fallback plain-textarea editor is recommended for resilience.

---

# 7. Security Design

## 7.1 Authentication and Authorisation Overview

SyntaxType uses stateless JWT authentication with RBAC enforcement. The security stack is:

- BCryptPasswordEncoder (strength 10) for password hashing.
- JJWT v0.12.6 (HMAC-SHA256) for JWT generation and validation.
- JWT claims: subject (username), role, id (userId), isTempPassword. Expiry: 86,400,000 ms (24 hours).
- Tokens stored in `localStorage` on the frontend (`jwt-decode` v4.0.0 for client-side decoding).
- `@EnableMethodSecurity(prePostEnabled = true)` with `@PreAuthorize` annotations for endpoint-level RBAC.

## 7.2 Critical Open Item — JWT Filter Disabled

> 🔴 **CRITICAL:** `JwtAuthFilter` is present in the codebase but its registration (`.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)`) is commented out in `SecurityConfig.securityFilterChain()`. Token validation is therefore NOT enforced at the Spring Security filter chain level. `@PreAuthorize` annotations remain in place but depend on the security context being populated by the filter — without the filter, the security context is empty and role-based guards may not function as intended. **THIS MUST BE RESOLVED BEFORE ANY PUBLIC-FACING DEPLOYMENT.**

**Remediation Plan — JWT Filter:**

- **Step 1:** Uncomment the `.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)` line in `SecurityConfig.securityFilterChain()`.
- **Step 2:** Run the full integration test suite to verify that all authenticated endpoints correctly reject requests without a valid JWT (expect HTTP 401).
- **Step 3:** Verify that `@PreAuthorize` role guards correctly return HTTP 403 for insufficient-role requests.
- **Step 4:** Confirm that `POST /api/auth/login` still returns a token and that the protected route flow (`ProtectedRoute.js`) works end-to-end.

## 7.3 Answer Security Gap — `/with-answer` Endpoint

> 🔴 **CRITICAL:** `GET /api/galaxy-challenges/{id}/with-answer` exposes the `isCorrect` flag on all `Choice` objects to the browser before the student submits an answer. Any student inspecting browser network traffic can retrieve the correct answer without solving the challenge. This undermines the educational validity of the Translation Terminal (Pathway A) and Galaxy Challenge modes.

**Remediation Plan — Server-Side Validation:**

- Implement `POST /api/galaxy-challenges/{id}/validate` accepting `{ questionId, studentAnswer }` in the request body.
- The endpoint compares `studentAnswer` against the Choice with `isCorrect = true` server-side and returns `{ isCorrect: boolean, correctAnswer: String (optional for feedback), feedbackText: String }`.
- Remove or restrict the `/with-answer` endpoint to ADMIN/TEACHER roles only.
- Update `GalaxyMainGame.js` to use the new `/validate` endpoint instead of fetching `/with-answer` for evaluation.

## 7.4 Token Storage Consideration

JWT tokens are currently stored in `localStorage`. This exposes them to potential XSS attacks. For a future hardening sprint, consider migrating to httpOnly cookies, which are inaccessible to JavaScript. If `localStorage` is retained, ensure DOMPurify sanitisation is applied to all user-generated content rendered in the DOM (currently applied to TinyMCE lesson content via DOMPurify v3.3.0).

---

# 8. Design Traceability — SRS to SDD

The following matrix traces each SRS module requirement to its design realisation in this SDD and documents the implementation status.

| Module | SRS Requirement (summary) | SDD Design Section | Status |
| :-: | :-: | :-: | :-: |
| M1 — Bug Smasher | Error-injection via runtime mutation engine (5 rules, configurable frequency). | §3.1.2 | **DEVIATED** — Pre-authored `wrongWords` pool used instead of runtime mutation. Functionally equivalent but pedagogically different. |
| M1 | `wrongWords` pool stored in database, configurable by teacher. | §3.1.2, §4.2 | **IMPLEMENTED** — `Challenge.wrongWords` field, `InstructorModule.js` UI. |
| M2 — Syntax Sniper | Monaco editor, single-keystroke blank filling, KPM tracking, 4-tier difficulty. | §3.1.3 | **DEVIATED** — Drag-and-drop match/reorder UI. No KPM, no tiers, no Monaco. |
| M2 | Score submission and leaderboard update for SYNTAX_SAVER category. | §3.1.3, §4.3 | **IMPLEMENTED**. |
| M3 — Translation Terminal | Tokenized whitespace-normalising comparison, dedicated authoring UI, diff view. | §3.1.4 | **NOT IMPLEMENTED** — Two partial pathways (GalaxyChallenge FILL_IN_THE_BLANK + Judge0). Dedicated authoring UI absent. |
| M3 | Answer security — correct answer not exposed before submission. | §3.1.4, §7.3 | **OPEN** — `/with-answer` endpoint exposes `isCorrect` client-side. Server-side validate endpoint recommended. |
| M4 — Teacher Dashboard | CRUD for lessons and challenges. | §3.1.5 | **IMPLEMENTED** — TinyMCE + `InstructorModule.js`. |
| M4 | Lesson versioning, soft-delete, CSV/PDF export, cohort assignment. | §3.1.5 | **NOT IMPLEMENTED** — All four features are open items. |
| M5 — Gamified Progression | XP accumulation, level/rank system, automatic badge award on session end. | §3.1.6 | **NOT IMPLEMENTED** — Combined Score used as XP proxy. Manual badge assignment only. |
| M5 | Leaderboard ranking, Galaxy Challenge logic puzzle, personal stats. | §3.1.6, §4.2 | **IMPLEMENTED** — `Leaderboard` entity, `GalaxyMainGame.js`, `PersonalStatsDashboard.js`. |
| Security | JWT filter enforcing token validation on all protected endpoints. | §7.2 | **OPEN** — `JwtAuthFilter` commented out. CRITICAL before production deployment. |
| Security | RBAC via `@PreAuthorize` enforced for all write operations. | §7.1 | **PARTIALLY IMPLEMENTED** — annotations in place but depend on filter (see §7.2). |
| Performance | Leaderboard cache eviction on score write. | §5.3 | **OPEN** — Cache not evicted on write. Stale reads possible. |
| Reliability | Score submission retry on network error. | §4.2 | **NOT IMPLEMENTED** — No retry mechanism. Manual retry required. |

---

# 9. Open Items and Recommended Improvements

## 9.1 Critical (Must Fix Before Production)

| ID | Issue | Recommended Action |
| :-: | :-: | :-: |
| OI-01 | `JwtAuthFilter` is commented out. All protected endpoints accept unauthenticated requests — `@PreAuthorize` guards are ineffective. | Uncomment filter registration in `SecurityConfig`. Run integration tests to verify 401/403 responses. See §7.2. |
| OI-02 | `GET /api/galaxy-challenges/{id}/with-answer` exposes correct answers to the client before evaluation. | Implement server-side `POST /api/galaxy-challenges/{id}/validate`. Restrict `/with-answer` to ADMIN/TEACHER. See §7.3. |

## 9.2 High Priority (Address in Next Sprint)

| ID | Issue | Recommended Action |
| :-: | :-: | :-: |
| OI-03 | Leaderboard cache not evicted on write — stale rankings possible. | Add `@CacheEvict` on `LeaderboardService.updateLeaderboardIfBetter()`. See §5.3. |
| OI-04 | Syntax Saver quiz content hardcoded in `QuizData.js` — teachers cannot add or modify drills at runtime. | Migrate `QuizData.js` to a `SyntaxSaverQuiz` JPA entity + `/api/syntax-saver` endpoint. Add authoring UI in `InstructorModule.js`. |
| OI-05 | No score submission retry on network error. Failed submissions lost permanently. | Add exponential-backoff retry in `useScoreSubmission` hook (3 attempts, 1s/2s/4s delays). Fall back to `localStorage` queue for offline recovery. |
| OI-06 | XP system not implemented — `lifetimeXP` accumulation missing. | Add `lifetimeXP` field to `UserStatistics`. Increment by rawScore on every `POST /api/scores/{category}` call. Expose via `PersonalStatsDashboard.js`. |

## 9.3 Medium Priority (Future Sprints)

| ID | Issue | Recommended Action |
| :-: | :-: | :-: |
| OI-07 | Lesson hard-delete — no recovery path for accidentally deleted lessons. | Add `isDeleted` + `deletedAt` fields to `Lessons` entity. `PATCH /{id}/restore` endpoint. Filter soft-deleted lessons in GET queries. |
| OI-08 | No lesson versioning — PUT overwrites without snapshot. | Create `LessonVersion` entity (lessonId FK, versionNumber, content, createdAt). Snapshot on each PUT. |
| OI-09 | CSV/PDF analytics export not implemented — faculty cannot export cohort progress. | Add `GET /api/reports/students.csv` endpoint aggregating Score + UserStatistics per user, with optional cohort filter. |
| OI-10 | Automatic achievement badge award not implemented. | Add `AchievementEvaluatorService` called by `ScoreController` on session end. Evaluate `triggerCondition` expressions against the submitted score/accuracy/WPM. |
| OI-11 | JWT tokens in `localStorage` expose XSS risk. | Migrate to httpOnly SameSite=Strict cookies in a future hardening sprint. Ensure all dynamic content is DOMPurify-sanitised. |
| OI-12 | TinyMCE cloud dependency — lesson authoring fails if TinyMCE Cloud is unavailable. | Add a plain `<textarea>` fallback in `CreateLessonModule.js` and `EditLessonModule.js` for TinyMCE load-failure scenarios. |

---

# 10. Non-Functional Design

## 10.1 Performance

- Active gameplay (falling blocks, drag-and-drop) is entirely client-side in React state — zero server round-trips during a game session. This ensures sub-100ms input latency on standard institutional hardware.
- Score submission (`POST /api/scores/{category}`) is the only synchronous server call triggered at session end. Under normal HikariCP pool conditions (max 10 connections), expected latency is under 2 seconds on Render.com's managed PostgreSQL.
- Leaderboard reads are served from Spring Cache (O(1) after first request). Cold reads (first request or post-restart) incur a PostgreSQL query against four indexes.
- Content changes (lessons, challenges) propagate immediately after a successful POST/PUT response — no propagation delay.

## 10.2 Scalability

- HikariCP pool (max 10) supports approximately 30 concurrent users per classroom section without pool exhaustion under normal session-end patterns (score submissions are short-lived transactions).
- Beyond 30 simultaneous session-end events, HikariCP queues exceed timeout thresholds. For larger deployments, increase `max-pool-size` and upgrade the Render.com database tier.
- Leaderboard caching reduces database read load for the most accessed endpoints.

## 10.3 Reliability

- Score persistence is synchronous and transactional via Spring Data JPA. A failed transaction rolls back completely — no partial score records.
- No message broker, event queue, or retry mechanism is implemented. A `POST /api/scores/{category}` that fails due to network error results in a lost session score. See OI-05.
- Graceful degradation: Spring Cache serves cached leaderboard data if the database is temporarily unreachable. Core game-mode functionality (falling blocks, drag-and-drop) is independent of the leaderboard service.

## 10.4 Maintainability

- The Controller → Service → Repository → Entity layer separation isolates business logic from HTTP concerns and makes unit testing practical at the service layer.
- Lombok annotations (`@Getter`, `@Setter`, `@Builder`, `@Data`, `@RequiredArgsConstructor`) reduce boilerplate in entity and DTO classes.
- SpringDoc OpenAPI (Swagger UI at `/swagger-ui.html`) auto-generates API documentation from controller annotations — reduces documentation drift.
- Frontend: feature-based component organisation and the centralised `useScoreSubmission` hook reduce duplication across game modes.

---

# Appendix A — Technology Stack Quick Reference

| Layer | Technology | Version / Notes |
| :-: | :-: | :-: |
| Runtime | OpenJDK (eclipse-temurin) | 17 |
| Framework | Spring Boot | 3.4.4 |
| ORM | Spring Data JPA / Hibernate | 3.4.4 |
| Security | Spring Security + JJWT | 3.4.4 + v0.12.6 (HMAC-SHA256) |
| Database | PostgreSQL (Render managed) | Driver: `org.postgresql` v42.7.5 |
| Connection Pool | HikariCP | max=10, min-idle=2 |
| API Docs | SpringDoc OpenAPI | v2.8.5 (Swagger UI) |
| Build | Maven (mvnw wrapper) | Included in repo |
| Frontend Framework | React | 18.2.0 (Create React App 5.0.1) |
| Routing | React Router DOM | 6.14.1 |
| HTTP Client | Axios | 1.9.0 |
| UI Library | Material UI | `@mui/material` v7.1.1 |
| Styling | Tailwind CSS | v3.x with PostCSS + Autoprefixer |
| Drag-and-Drop | `@hello-pangea/dnd` | v18.0.1 — used in `SyntaxSaverLesson.js` |
| Rich-Text Editor | TinyMCE | `@tinymce/tinymce-react` v6.3.0 (cloud) |
| HTML Sanitiser | DOMPurify | v3.3.0 |
| JWT Client | `jwt-decode` | v4.0.0 (`localStorage` tokens) |
| Frontend Host | Vercel | `https://syntaxtype-deploy-omega.vercel.app` |
| Backend Host | Render.com (Docker) | Port 8080 (internal) |
| External APIs | Judge0 (code execution), TinyMCE Cloud | Used by `codeChallenges.js` and lesson authoring |

---

# Appendix B — Open Items Summary

| ID | Priority | Issue | Section |
| :-: | :-: | :-: | :-: |
| OI-01 | CRITICAL | `JwtAuthFilter` disabled — all protected endpoints accept unauthenticated requests. | §7.2 |
| OI-02 | CRITICAL | `/with-answer` endpoint exposes correct answers client-side before evaluation. | §7.3 |
| OI-03 | HIGH | Leaderboard cache not evicted on score write — stale rankings. | §5.3 |
| OI-04 | HIGH | Syntax Saver quiz content hardcoded in `QuizData.js` — teacher cannot author drills. | §3.1.3 |
| OI-05 | HIGH | No retry mechanism for failed score submissions. | §9.2 |
| OI-06 | HIGH | XP/`lifetimeXP` field absent — gamified progression partially unimplemented. | §3.1.6 |
| OI-07 | MEDIUM | Lesson hard-delete with no recovery path. | §3.1.5 |
| OI-08 | MEDIUM | No lesson versioning — overwrite without snapshot. | §3.1.5 |
| OI-09 | MEDIUM | CSV/PDF analytics export not implemented. | §3.1.5 |
| OI-10 | MEDIUM | Automatic achievement award not implemented. | §3.1.6 |
| OI-11 | MEDIUM | JWT in `localStorage` — XSS risk. | §7.4 |
| OI-12 | MEDIUM | TinyMCE cloud dependency — no fallback if service unavailable. | §6.4 |

---

*— End of Document —*
