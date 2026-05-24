  

**CEBU INSTITUTE OF TECHNOLOGY – UNIVERSITY**

College of Computer Studies

  
  
  

**Software Requirements Specification**

for

**SyntaxType v2**

*Typing-Based C Programming Platform (Phase 2 Continuation)*

  
  

**Team Code: 63**

Abalorio, Noel Keth V.

Ano-os, Iesus Rey A.

Cararag, Trisha Raye

Lapina, Honey Fate

Labajo, Cris Angelo

  
  

# **Change History**

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| Version | Date | Author | Description |
| 1.0 | May 23, 2026 | Team 63 | Initial SRS based on approved capstone proposal SyntaxType\\_Revised\\_v3. |

  

# **1. Introduction**

  

## **1.1 Purpose**

The purpose of this Software Requirements Specification (SRS) is to provide a complete and detailed description of the Phase 2 extensions to the SyntaxType platform — a gamified, web-based typing engine for C programming. This document defines the functional and non-functional requirements for three new game modes (Bug Smasher, Syntax Sniper, and Translation Terminal), the enhanced Teacher Dashboard with integrated Lesson Repository and Content Management, and the Gamified Progression and Logic Puzzle Engine. It serves as the authoritative reference for the development team, faculty advisers, and institutional stakeholders.

  

Version 2.0 incorporates a full code-to-document audit against the production codebase. All sections have been revised to reflect verified technical implementation, and embedded use case diagrams, activity diagrams, and wireframes have been added to each module.

  

## **1.2 Scope**

SyntaxType is a client–server web application that trains 1st-year BSIT students in C programming syntax through gamified typing exercises. Phase 2 extends the inherited falling-block engine with five modules:

  

  - Module 1: Bug Smasher Enhancement — error-injection layer using a pre-authored wrongWords pool served alongside the standard words pool in the AdvancedFallingTypingTest React component.
  - Module 2: Syntax Sniper Game Mode — fill-in-the-blank speed drill; implemented in the frontend as SyntaxSaverLesson.js (Category.SYNTAX_SAVER) with match-and-reorder question types.
  - Module 3: Translation Terminal Game Mode — C-code generation from natural-language prompts; partially addressed by codeChallenges.js with Judge0 integration and by the GalaxyChallenge FILL_IN_THE_BLANK question type.
  - Module 4: Teacher Dashboard, Lesson Repository, and Content Management — InstructorModule.js + CreateLessonModule.js (TinyMCE) + ChallengeController + LessonsController.
  - Module 5: Gamified Progression and Logic Puzzle Engine — Leaderboard entity with Combined Score formula, Achievements entity, and Galaxy Challenge RPG game mode (GalaxyMainGame.js + GalaxyChallengeController).

  

The platform is not a standalone mobile application. It targets desktop and laptop form factors. Frontend is deployed on Vercel; backend on Render.com; database on Render managed PostgreSQL.

  
  
  
  
  
  
  
  

## **1.3 Definitions, Acronyms, and Abbreviations**

  

|  |  |
| :-: | :-: |
| **Term / Element** | **Description / Value** |
| SyntaxType | The gamified web-based typing platform for C programming. |
| Bug Smasher | A game mode extending the falling-block engine with a pre-authored wrongWords error pool (Challenge.wrongWords), requiring students to type the correct version of corrupted C tokens. |
| Syntax Sniper / Syntax Saver | A fill-in-the-blank speed-drill mode; implemented as SyntaxSaverLesson.js using match and reorder question types (QuizData.js); leaderboard category: SYNTAX\\_SAVER. |
| Translation Terminal | An RPG-style C-code generation mode; partially addressed by codeChallenges.js (Judge0) and GalaxyChallenge FILL\\_IN\\_THE\\_BLANK questions. |
| Galaxy Challenge | The logic-puzzle module (Module 5) implemented as GalaxyMainGame.js + GalaxyChallengeController (/api/galaxy-challenges). Supports MULTIPLE\\_CHOICE, FILL\\_IN\\_THE\\_BLANK, and MULTIPLE\\_ANSWER question types. |
| TinyMCE | Browser-based rich-text editor (@tinymce/tinymce-react v6.3.0) used in CreateLessonModule.js and EditLessonModule.js for lesson content authoring. |
| Monaco Editor | As originally specified; not installed as an npm dependency in the production codebase. C code display is handled via styled browser text elements. |
| WPM | Words Per Minute — primary typing speed metric tracked in the UserStatistics and Leaderboard entities. |
| KPM | Keystrokes Per Minute — specified for Syntax Sniper; not yet tracked as a dedicated field in the production database. |
| Combined Score | Leaderboard ranking metric: base = WPM × (accuracy / 100.0); if accuracy \\> 95 then base × 1.5; rounded to 2 decimal places. Implemented in LeaderboardEntry.calculateCombinedScore(). |
| XP | Experience Points — specified in the SRS; not yet implemented as a dedicated field. Proxied by totalScore (Scoring entity) and leaderboard Combined Score. |
| CRUD | Create, Read, Update, Delete. |
| RBAC | Role-Based Access Control — enforced via @PreAuthorize annotations; roles: USER, ADMIN, TEACHER, STUDENT (Role enum). |
| JWT | JSON Web Token — HMAC-SHA256, 24-hour expiry (86,400,000 ms). Claims: subject, role, id, isTempPassword. Implemented via JJWT 0.12.6 in JwtUtil.java. |
| ChallengeType | Enum: PARAGRAPH, FALLING\\_TYPING\\_TEST, ADVANCED\\_FALLING\\_TYPING\\_TEST. |
| Category | Leaderboard/Scoring enum: TYPING\\_TESTS, FALLING\\_WORDS, GALAXY, GRID, BOOKWORM, CROSSWORD, FOUR\\_PICS, CODE\\_CHALLENGES, MAP, SYNTAX\\_SAVER, CHALLENGES, OVERALL. |
| QuestionTypes | Galaxy Challenge enum: MULTIPLE\\_CHOICE, FILL\\_IN\\_THE\\_BLANK, MULTIPLE\\_ANSWER. |
| DTO | Data Transfer Object — API serialisation boundary (package com.syntaxtype.demo.DTO). |
| HikariCP | JDBC connection pool: maximum-pool-size=10, minimum-idle=2, idle-timeout=600,000 ms. |
| SUS | System Usability Scale — 10-item Likert questionnaire for usability evaluation (Brooke, 1996). |
| SRS | Software Requirements Specification. |
| EQ | Error Quotient (Jadud, 2006). |

  

## **1.4 References**

The following references inform the pedagogical rationale, system design, and evaluation methodology:

  

  - Altadmri & Brown (2015). 37 million compilations. ACM Transactions on Computing Education, 15(4).
  - Anderson, J. R. (1982). Acquisition of cognitive skill. Psychological Review, 89(4).
  - Becker et al. (2019). Enhanced compiler error messages. SIGCSE 2019.
  - Brooke, J. (1996). SUS: A quick and dirty usability scale. Taylor & Francis.
  - Brown & Altadmri (2014). Novice programming mistakes. ICER 2014.
  - Csikszentmihalyi, M. (1990). Flow. Harper & Row.
  - Dela Cruz & Mendoza (2022). Gamification in programming courses. Philippine Journal of Educational Technology, 14(2).
  - Ericsson et al. (1993). Deliberate practice and expert performance. Psychological Review, 100(3).
  - Jadud, M. C. (2006). Methods for exploring novice compilation behaviour. ICER 2006.
  - Ryan & Deci (2000). Self-determination theory. American Psychologist, 55(1).
  - Sweller, J. (1988). Cognitive load during problem solving. Cognitive Science, 12(2).

# **2. Overall Description**

  

## **2.1 Product Perspective**

SyntaxType follows a layered, client–server architecture (Presentation → Service → Repository → Entity). The frontend is a React 18.2.0 SPA deployed on Vercel; the backend is a Spring Boot 3.4.4 REST API containerised with Docker and hosted on Render.com (port 8080). All data is persisted to a PostgreSQL database via Spring Data JPA 3.4.4. Client–server communication uses JSON over HTTPS, with JWT bearer tokens for authentication.

  

The system extends the Phase 1 falling-block engine (ChallengeType.FALLING_TYPING_TEST) with three new game modes, an enhanced Teacher Dashboard, and a gamified progression layer. Game-mode state is managed client-side in React component state and sessionStorage; server-side state is limited to score/leaderboard persistence triggered at session end.

  

## **2.2 User Characteristics**

**Student Users (Primary).** 1st-year BSIT students with beginner-level exposure to C programming. They interact with falling-block exercises, Bug Smasher sessions, Syntax Saver drills, Galaxy Challenge logic puzzles, and the Leaderboard page. They view personal scores via PersonalStatsDashboard.js and rankings via LeaderboardPage.js.

  

**Faculty/Admin Users (Secondary).** IT faculty members who use the Teacher Dashboard (InstructorModule.js) to author lessons (TinyMCE), configure challenge word lists (words + wrongWords), manage Galaxy Challenges (/api/galaxy-challenges), and monitor student progress. Admin role provisions teacher accounts with isTempPassword = true, forcing a password-change flow on first login (TeacherSetupAccountPage.js).

  

## **2.4 Constraints**

  - Language Scope: C programming language only during this capstone cycle.
  - Form Factor: Desktop/laptop with physical keyboard. Mobile not supported.
  - Legacy Codebase: Phase 1 falling-block engine inherited; ADVANCED_FALLING_TYPING_TEST extends it.
  - Concurrent User Ceiling: HikariCP maximum-pool-size=10. Load-tested to ≥30 concurrent users per section.
  - Monaco Editor Absent: @monaco-editor/react is not installed. TinyMCE is used for lesson authoring; game-mode code display uses styled browser elements.
  - JWT Filter Commented Out: JwtAuthFilter is currently commented out in SecurityConfig.securityFilterChain(). This must be re-enabled before public production deployment.
  - No WebSocket: Leaderboard updates use Spring Cache (in-memory) + HTTP polling, not WebSocket.

  
  
  

## **2.5 Assumptions and Dependencies**

  - Users access the platform via the latest two major versions of Chrome, Firefox, Edge, or Safari.
  - Reliable HTTPS connectivity is available in institutional computer laboratories.
  - Environment variables (SPRING_DATASOURCE_URL, jwt.secret, FRONTEND_URL, PORT) are correctly set on Render.com.
  - TinyMCE cloud service remains available for the lesson authoring component (apiKey in CreateLessonModule.js).
  - Physical keyboards are available on all target machines.

# **3. Specific Requirements**

  

## **3.1 External Interface Requirements**

  

### **3.1.1 Hardware Interfaces**

  - Standard Physical Keyboards: All game modes require keystroke capture. HID-compliant USB/Bluetooth keyboards supported.
  - Desktop/Laptop Monitors: Minimum 1280×720 landscape. React DOM-based animation (no Canvas/WebGL required).

  

### **3.1.2 Software Interfaces**

The following table lists the verified production technology stack as of the code-to-document audit:

  

|  |  |
| :-: | :-: |
| **Term / Element** | **Description / Value** |
| Java / Runtime | OpenJDK 17 (eclipse-temurin) |
| Spring Boot | 3.4.4 (spring-boot-starter-parent) |
| Spring Data JPA | 3.4.4 — ORM via Hibernate; entities in com.syntaxtype.demo.Entity.\\* |
| Spring Security | 3.4.4 — stateless JWT; BCryptPasswordEncoder; @EnableMethodSecurity |
| Database Driver | org.postgresql:postgresql v42.7.5 (active); mysql-connector-j declared but inactive |
| JWT Library | io.jsonwebtoken:jjwt-api/jjwt-impl/jjwt-jackson v0.12.6 (HMAC-SHA256) |
| OpenAPI/Swagger | org.springdoc:springdoc-openapi-starter-webmvc-ui v2.8.5 |
| Lombok | Code generation: @Getter, @Setter, @Builder, @Data, @RequiredArgsConstructor |
| HikariCP | Connection pool: max=10, min-idle=2, idle-timeout=600,000 ms |
| Maven | Build tool (mvnw wrapper included) |
| React | 18.2.0 with React DOM 18.2.0 |
| React Router DOM | 6.14.1 — SPA routing; ProtectedRoute.js, PublicOnlyRoute.js |
| Axios | 1.9.0 — HTTP client for all API calls |
| Material UI | @mui/material v7.1.1, @mui/icons-material v7.1.1 |
| Emotion | @emotion/react v11.14.0, @emotion/styled v11.14.0 (MUI peer) |
| TinyMCE | @tinymce/tinymce-react v6.3.0 — lesson content authoring (CreateLessonModule, EditLessonModule) |
| jwt-decode | v4.0.0 — client-side JWT decoding in JwtUtils.js / AuthUtils.js; tokens in localStorage |
| DOMPurify | v3.3.0 — HTML sanitisation for TinyMCE content |
| @hello-pangea/dnd | v18.0.1 — drag-and-drop in SyntaxSaverLesson.js |
| Tailwind CSS | v3.x with PostCSS and Autoprefixer |
| Create React App | 5.0.1 (react-scripts) — Webpack/Babel build |
| http-proxy-middleware | v2.0.6 — development proxy (setupProxy.js) |
| Monaco Editor | NOT INSTALLED — no @monaco-editor/react in package.json; code display uses styled HTML elements |

  

### **3.1.3 Communications Interfaces**

All client–server communication uses JSON over HTTPS. The following REST API route map is verified against the production controller classes:

  

|  |  |  |
| :-: | :-: | :-: |
| **Controller** | **Base Route** | **Methods / Sub-routes** |
| AuthController | /api/auth | POST /register, /register/admin, /register/teacher, /register/student, /login |
| LessonsController | /api/lessons | GET, POST, PUT /{id}, PATCH /{id}/title, DELETE /{id} |
| ChallengeController | /api/challenges | GET, POST, DELETE; /falling, /falling/{id}, /normal/{id} |
| GalaxyChallengeController | /api/galaxy-challenges | GET (list/preview), GET /{id}/no-answer, GET /{id}/with-answer, POST, PATCH, DELETE |
| TopicsController | /api/topics | GET, POST, PUT, DELETE |
| ScoreController | /api/scores | GET, POST; /falling; POST /{category} (auth required) |
| LeaderboardController | /api/leaderboards | GET /global, /game/{category}, /user/{userId}; full CRUD |
| AchievementsController | /api/achievements | GET, POST, PATCH, DELETE (ADMIN/TEACHER only) |
| ScoringController | /api/scorings | GET, POST, PATCH, DELETE |
| LessonAttemptsController | /api/lesson-attempts | GET, POST, PATCH, DELETE |
| UserStatisticsController | /api/user-statistics | GET, POST, PATCH |
| StudentAchievementsController | /api/student-achievements | GET, POST, DELETE |
| StudentController | /api/students | GET, POST, PATCH, DELETE |
| TeacherController | /api/teachers | GET, POST, PATCH, DELETE |
| AdminController | /api/admins | GET, POST, DELETE |
| UserController | /api/users | GET, PATCH, DELETE |
| StudentTopicsController | /api/student-topics | GET, POST, DELETE |
| TeacherTopicsController | /api/teacher-topics | GET, POST, DELETE |
| QuizController | /api/quizzes | GET, POST, DELETE |
| HealthController | /api/health | GET (public health-check) |

  

|  |
| :-: |
| *CORS: CorsConfigurationSource permits origins: http://localhost:3000, http://localhost:5173, https://syntaxtype-deploy-omega.vercel.app/. Allowed methods: GET, POST, PUT, DELETE, OPTIONS. Credentials: allowed. Authorization header exposed.* |

  

|  |
| :-: |
| *WebSocket: No WebSocket, SockJS, or STOMP implementation is present. The LeaderboardController uses Spring Cache (@Cacheable, cache name 'leaderboard', in-memory store) for read-side ranking. Leaderboard "refresh" is achieved via on-demand HTTP GET with cached results served in O(1) after the first miss.* |

  

## **3.2 Functional Requirements**

  

|  |
| :-: |
| *AUDIT FINDING: Modules are described below with verified implementation status. Where the production codebase deviates from the original SRS specification, a clearly labelled 'Deviation' note is included. Use Case Diagrams, Activity Diagrams, and Wireframes follow each module description.* |

  

### **Module 1: Bug Smasher Enhancement**

This module extends the inherited falling-block engine with an error-injection layer. The production implementation stores pre-authored corrupted C tokens in the Challenge.wrongWords field (List<String>, stored in the challenge_wrong_words join table). The AdvancedFallingTypingTest.js React component loads both words (correct tokens) and wrongWords (corrupted tokens) from sessionStorage and presents falling blocks drawn from both pools. Difficulty is controlled by Challenge.speed (Integer), Challenge.maxLives (Integer), and Challenge.useLives (Boolean).

  

|  |
| :-: |
| *Deviation: The original SRS specified five runtime mutation rules (semicolon removal, operator substitution, brace mismatch, pointer corruption, preprocessor malformation) applied by a runtime engine. The production implementation uses a pre-authored wrongWords pool — all corrupted variants are authored at content-creation time by the teacher via InstructorModule.js and stored in the database. No runtime mutation engine is implemented.* |

  

**1.1 Transaction: Load and Execute Bug Smasher Session**

  

**Use Case Diagram Description:**

The diagram contains two actors: Student (primary) and Teacher/Admin (secondary). The system use cases are: Start Bug Smasher Session, Type Word / Correction, View Session Results (Student-facing), and Configure Challenge — words / wrongWords (Teacher-facing). System-internal use cases: Generate Falling Blocks, Inject Wrong Word Block (extends Generate Falling Blocks), Validate Input — String Match (string comparison in React state), and POST /api/scores/FALLING_WORDS (included by Validate Input on session end). A dashed «extend» arrow connects Inject Wrong Word Block to Generate Falling Blocks. A dashed «include» arrow connects POST /api/scores/FALLING_WORDS to Validate Input.

  

*Figure 1.1 — Use Case Diagram: Bug Smasher (Module 1 Transaction 1.1)*

  

**Use Case Description:**

**Use Case Name:** Inject Wrong Word Block and Validate Correction.

**Primary Actor:** Student.

**Precondition:** Student is authenticated (valid JWT in localStorage). A Challenge entity of type ADVANCED_FALLING_TYPING_TEST exists with non-empty words and wrongWords lists, speed, maxLives, and useLives fields populated.

**Trigger:** Student navigates to the Advanced Falling Typing Test page; a valid fallingGameConfig object is present in sessionStorage.

  

Main Flow:

1.  The AdvancedFallingTypingTest component reads fallingGameConfig from sessionStorage: words (correct tokens), wrongWords (corrupted tokens), duration, speed, maxLives, useLives.
2.  Blocks are drawn from the combined pool (words marked isCorrect: true; wrongWords marked isCorrect: false) and fall vertically at the configured speed.
3.  The student types the correct version of the displayed token into the single-line input field at the bottom of the game area.
4.  On match (case-sensitive string comparison in React state), the block clears, score increments, and the answered word is logged.
5.  On mismatch or block reaching the bottom boundary: if useLives is true, one life is consumed; the attempt is recorded as a miss.
6.  On session completion (timer exhaustion or lives exhausted), useScoreSubmission.submitScore('FALLING_WORDS', payload) issues POST /api/scores/FALLING_WORDS with { wpm, accuracy, score }.
7.  ScoreController persists a Score entity and invokes LeaderboardService.updateLeaderboardIfBetter(). If the new Combined Score (WPM × accuracy/100.0; ×1.5 if accuracy > 95%) exceeds the stored record, the Leaderboard entity is updated. A LeaderboardUpdateResult DTO (success, isNewBest, rank) is returned.

  

**Postcondition:** Score persisted. Leaderboard updated if new best. LeaderboardUpdateResult displayed to student.

**Alternative Flow:** If sessionStorage does not contain a valid fallingGameConfig, the component renders with empty pools and no API calls are issued.

  

**Activity Diagram Description:**

Start node → Load fallingGameConfig from sessionStorage → Drop Next Block → Decision: Block from wrongWords? → \[Yes\] Render Block with Red Border Indicator → \[No\] Render Standard Block → Merge → Capture Student Keystroke Input → Decision: Input matches? → \[Yes\] Clear Block, Score++, Accuracy++ → \[No\] Consume Life / Miss, Log Wrong Word → Merge → Decision: More blocks / time left? → \[Yes\] loop to Drop Next Block → \[No\] POST /api/scores/FALLING_WORDS → Update Leaderboard → End node.

  

*Figure 1.2 — Activity Diagram: Bug Smasher Session Flow (Transaction 1.1)*

  

**Wireframe Description:**

The screen is divided into three zones. Top Bar: lesson title on the left, live timer in the centre, WPM and lives counter on the right (dark navy background, MUI AppBar pattern). Main Game Area (approximately 75% of viewport, dark theme \#0d1b2a): blocks fall vertically. Standard blocks have a blue border (\#3b82f6). Corrupted blocks (drawn from wrongWords) have a red/orange border glow (\#ef4444) and a bug emoji badge. At the bottom of the game area is a single-line text input spanning the canvas width (dark background, blue border, monospace font). Placeholder text: 'Type the corrected code here…'. Below the input, an inline feedback strip shows a green background with checkmark for correct answers, or a red background with the expected correction for incorrect answers. Right Sidebar (approximately 25%): live accuracy %, score, correct block count, wrong/missed count, and an error-category breakdown. On session completion, a Submit Score button appears, which calls POST /api/scores/FALLING_WORDS.

  

*Figure 1.3 — Wireframe: Bug Smasher Game Screen (based on AdvancedFallingTypingTest.js with proposed sidebar enhancements)*

  
  
  
  
  

**1.2 Transaction: Configure Bug Smasher Challenge (Teacher)**

**Use Case Diagram Description:**

Single actor: Teacher/Admin. Use cases: Open Instructor Module (/instructor route), Enter words\[\] + wrongWords\[\] (correct and Bug Smasher pools), Set speed / useLives / maxLives / testTimer, POST /api/challenges/falling (ChallengeType=ADVANCED_FALLING_TYPING_TEST), Challenge available via GET /api/challenges/falling.

  
  

  
  
  

**Use Case Name:** Configure Bug Smasher Challenge.

**Primary Actor:** Teacher/Admin.

**Precondition:** Teacher is authenticated with TEACHER or ADMIN role. Teacher navigates to InstructorModule.js (/instructor route).

Main Flow:

1.  Teacher accesses the Challenges tab of InstructorModule.js and selects 'Advanced Falling (Bug Mode)' challenge type.
2.  Teacher enters correct C code tokens in the words field (Correct Words panel, displayed in green).
3.  Teacher enters pre-authored corrupted variants in the wrongWords field (Bug Smasher pool, displayed in red).
4.  Teacher configures speed, maxLives, useLives, and testTimer.
5.  Teacher clicks 'Save Challenge'. Frontend issues POST /api/challenges/falling with the Challenge payload.
6.  ChallengeController sets ChallengeType = ADVANCED_FALLING_TYPING_TEST and persists via ChallengeService.save(). The challenge is immediately queryable via GET /api/challenges/falling.

  

**Activity Diagram Description:**

Start → Navigate to /instructor (InstructorModule.js) → Select 'Advanced Falling (Bug Mode)' challenge type tab → Enter correct C tokens into words\[\] panel (green) → Enter corrupted variants into wrongWords\[\] panel (red, Bug Smasher injection source) → Set speed, maxLives, useLives, testTimer → Click Save Challenge → POST /api/challenges/falling → Decision: 200 OK? → \[Yes\] Challenge persisted and immediately queryable via GET /api/challenges/falling → End → \[No\] Show error → End.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Wireframe Description:**

InstructorModule.js layout. Top Navbar (dark \#1e293b): hamburger, title, Back to Dashboard. Tab bar: Challenges (active, blue), Create Lesson, Custom Rewards. Left Panel: challenge type toggle (Normal / Falling Words / Advanced Falling Bug Mode — selected, amber border), speed slider (speed field), lives toggle (useLives boolean), max lives numeric (maxLives field), timer input (testTimer). Right Panel: two-column word list — left column shows words\[\] in green (\#f0fdf4 background, monospace), right column shows wrongWords\[\] in red (\#fff5f5 background). Warning bar: 'Typing a wrongWord during game consumes 1 life. Correct word reaching bottom also consumes 1 life.' Save Challenge button (blue, full width) calls POST /api/challenges/falling; sessionStorage key fallingGameConfig is set by AdvancedFallingLocalSetup.js on navigation.

### **Module 2: Syntax Sniper Game Mode**

The Syntax Sniper game mode is implemented as SyntaxSaverLesson.js, presenting C programming lessons through match and reorder question types sourced from QuizData.js. The backend supports the SYNTAX_SAVER leaderboard category. Score submission uses POST /api/scores/SYNTAX_SAVER via useScoreSubmission.

  

|  |
| :-: |
| *Deviation: The original SRS specified Monaco editor rendering with inline blank placeholders and single-keystroke capture per punctuation token. The production SyntaxSaverLesson.js uses a drag-and-drop keyword matching interface (@hello-pangea/dnd) and reorder exercises, not keystroke-by-keystroke blank filling. Automatic tier promotion (Tier 1–4) based on cumulative accuracy and KPM is not implemented; no difficulty tier or KPM field exists in the database. The Combined Score formula (same as all typing categories) is used for SYNTAX\\_SAVER leaderboard ranking.* |

  

**2.1 Transaction: Execute Timed Punctuation / Keyword Drill**

  

**Use Case Diagram Description:**

Actors: Student (primary), Teacher (secondary, for content authoring). Student use cases: Start Syntax Saver / Drill Lesson, Answer Match / Reorder Question, View Lesson Score. System use cases: POST /api/scores/SYNTAX_SAVER (included by View Lesson Score). Teacher use case: Author Quiz Lesson (QuizData.js). A dashed «include» arrow connects POST /api/scores/SYNTAX_SAVER from View Lesson Score.

  

*Figure 2.1 — Use Case Diagram: Syntax Sniper / Syntax Saver (Module 2 Transaction 2.1)*

  

**Use Case Description:**

**Use Case Name:** Execute Timed Keyword Drill.

**Primary Actor:** Student.

**Precondition:** Student is authenticated. Lesson steps are defined in QuizData.js.

**Trigger:** Student navigates to the Syntax Saver lesson.

  

Main Flow:

1.  SyntaxSaverLesson.js renders the current lesson step from QuizData.js (type: 'match', 'reorder', or 'battle').
2.  For match steps: keyword tokens are displayed and the student drags the correct answer to the blank. Client-side validation compares the dropped token against the expected answer using case-insensitive string matching.
3.  For reorder steps: code lines are presented out of order and the student reorders them via drag-and-drop (@hello-pangea/dnd).
4.  Correct answers increment the score. Incorrect answers display feedback text.
5.  On lesson completion (all steps answered), the total score is submitted via POST /api/scores/SYNTAX_SAVER.
6.  The Leaderboard is updated for SYNTAX_SAVER category using the Combined Score formula.

  

**Postcondition:** Score persisted. Leaderboard updated if new best for SYNTAX_SAVER.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → SyntaxSaverLesson renders lessons\[step=0\] → Decision: current.type? → \[match\] MatchQuestion renders question + options\[\] buttons; handleClick calls normalize(opt) === normalize(correct); \[Yes\] setFeedback('✅') onNext(10); \[No\] setFeedback('❌') onNext(0) → \[reorder\] ReorderQuestion scrambles parts, DragDropContext; handleSubmit: JSON.stringify(order) === JSON.stringify(parts); \[Yes\] onNext(15); \[No\] onNext(0) → \[battle\] CodeWormBattle renders → All branches merge → Decision: step < lessons.length-1? → \[Yes\] step++ → loop to render next question → \[No\] feedback='ð Lesson Complete\!' → POST /api/scores/SYNTAX_SAVER (planned) → End.

  
  
  
  
  
  
  
  
  
  

**Wireframe Description:**

The screen uses a warm paper aesthetic (background \#f5f0e8, accent \#e8622a — consistent with SyntaxSaverLesson.js design tokens). Top Bar (dark \#1a1a2e): lesson title on the left, live countdown timer (prominent, centre, orange background), step counter and score on the right. Lesson Card: a white rounded card displaying the question prompt and instruction text. Code Display Area: a dark (\#1e1e2e) panel showing the C code block with highlighted blank placeholder boxes (blue dashed borders for unfilled blanks, green fill for correctly answered blanks). Drag Token Row: a light-cream bar below the code display showing draggable keyword tokens (blue filled rounded rectangles with monospace font). Feedback Strip: green (\#d6f0db) for correct, red (\#fad7d7) for incorrect, with explanatory text. Progress Bar: shows steps completed out of total. Navigation Buttons: Previous (grey) and Next/Submit (accent orange).

  

*Figure 2.2 — Wireframe: Syntax Saver Lesson Screen (SyntaxSaverLesson.js — with proposed inline blank-placeholder enhancement for future fill-in-the-blank mode)*

  
  
  
  
  
  
  
  
  
  
  

### **Transaction 2.2: Scale Drill Difficulty**

  

**Use Case Diagram Description:**

Actor: Student (primary), Teacher (QuizData.js author). Student use case: Progress Through Steps (step state: 0 to lessons.length-1), Difficulty Scaled by QuizData (match → reorder → battle sequence in QuizData.js), Auto-tier Promotion (NOT IMPLEMENTED — no KPM or accuracy threshold evaluation), Reset / Restart Lesson (resetKey++ triggers full component remount, setStep(0)).

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → Student completes a step (handleNext called) → step++ in React state (no backend tier evaluation) → Decision: step < lessons.length-1? → \[No\] feedback='ð Lesson Complete\!' → \[Yes\] Render next question (match / reorder / battle per QuizData.js type field) → NOTE: KPM / accuracy-based tier promotion NOT IMPLEMENTED; QuizData.js order is fixed → Faculty override requires code change to QuizData.js export → End.

### **Module 3: Translation Terminal Game Mode**

The Translation Terminal game mode is partially addressed by two implementations: (1) codeChallenges.js provides a C code editor interface integrated with the Judge0 external compiler API for code execution and validation; and (2) the GalaxyChallenge entity supports FILL_IN_THE_BLANK question types with teacher-authored expected answers, which partially satisfies the prompt-answer pair authoring requirement.

  

|  |
| :-: |
| *Deviation: The tokenized whitespace-normalising comparison algorithm, configurable stylistic tolerance (whitespace flexibility, alternative variable names), and side-by-side diff view specified in the original SRS are not implemented. A dedicated Translation Terminal prompt-answer pair authoring form in the Teacher Dashboard is not present. The GalaxyChallenge API (POST /api/galaxy-challenges) provides the closest structural equivalent for structured C-construct question authoring.* |

  

**3.1 Transaction: Present Prompt and Validate Generated Code**

  

**Use Case Diagram Description:**

Actors: Student (primary), Teacher/Admin (galaxy-challenges authoring). Student use cases: Select Code Challenge (codeChallenges.js local array), Fill Blank Inputs in C Code (blankInputs\[\] state, ___ markers), Submit Answers (blankInputs vs answers\[\] string compare), View Results (correctCount / answers.length). System use case: POST /api/scores/CODE_CHALLENGES (included). Teacher use case: Author GalaxyChallenge FIB (POST /api/galaxy-challenges with FILL_IN_THE_BLANK type).

  
  
  
  

**Use Case Name:** Present Prompt and Validate Generated Code.

**Primary Actor:** Student.

**Precondition:** Student is authenticated. A GalaxyChallenge entity with FILL_IN_THE_BLANK questions, or a Code Challenge in codeChallenges.js, is available.

  

Main Flow (Hybrid — GalaxyChallenge FILL_IN_THE_BLANK path):

1.  Student navigates to the Galaxy Challenge list and selects a challenge containing FILL_IN_THE_BLANK questions.
2.  GET /api/galaxy-challenges/{id}/no-answer returns the challenge DTO with isCorrect set to null on all Choice objects, preventing client-side answer revelation.
3.  The English prompt (question.question field) is displayed in the Galaxy RPG interface.
4.  Student types the C code answer or selects from options.
5.  Student submits. Frontend issues GET /api/galaxy-challenges/{id}/with-answer to retrieve the answer-inclusive DTO and performs client-side comparison of the student's input against the Choice with isCorrect = true.
6.  On correct match, score increments. On mismatch, feedback is shown.
7.  Score submitted via POST /api/scores/GALAXY. Leaderboard updated.

  

**Postcondition:** Score persisted for GALAXY category. Leaderboard updated.

**Note — Answer Security:** Answer validation is client-side in the current implementation. The /with-answer endpoint exposes correct-answer flags before evaluation. A server-side validation endpoint is recommended for production hardening.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → Student selects challenge from codeChallenges.js (local array: id, difficulty, question, code, answers\[\]) → Challenge renders: C code with ___ blanks (blankInputs = new Array(answers.length).fill('')) → Student types into blank input fields (setBlankInputs index-mapped) → Decision: startTime set (first keystroke)? → \[No\] setStartTime(Date.now()) → Student clicks Submit → Decision: all blankInputs\[i\].trim() === answers\[i\]? → \[Yes\] setIsTestComplete(true), setCorrectCount(answers.length) → \[No\] partial correctCount++ per matched blank → Merge → elapsed = (Date.now()-startTime)/1000; score = correctCount/answers.length*100 → POST /api/scores/CODE_CHALLENGES via useScoreSubmission → LeaderboardService updates CODE_CHALLENGES leaderboard.

  
  
  
  
  
  
  
  
  

**Wireframe Description:**

Dark code-editor aesthetic (\#1e2a3a background). Top bar (dark \#111827): challenge title and difficulty label. Question panel: challenge.question text in bold white. Code display panel (\#0d1117, monospace): C code with ___ blank positions rendered as coloured inline input boxes (blue border for blank 0, amber for blank 1, purple for blank 2). Right sidebar: 'Fill the Blanks' label with one labelled text input per blank, colour-coded matching the inline box. Submit button (blue) triggers comparison. Results bar (dark green): '✅ Correct: N / M — Score: P%' with time elapsed and score submission note. Below: challenge selector row showing all codeChallenges grouped by difficulty (20 total).

  

**3.2 Transaction: Author Prompt-Answer Pair (Teacher)**

Faculty author structured C-construct question pairs via POST /api/galaxy-challenges, providing: title, description, and a list of Question objects (question text, QuestionTypes, and Choice objects with isCorrect flags). The FILL_IN_THE_BLANK QuestionType most closely satisfies the Translation Terminal authoring requirement. A dedicated Translation Terminal authoring UI is planned but not yet implemented.

  
  
  
  
  
  
  
  
  

**Use Case Diagram Description:**

Actor: Teacher/Admin. Use cases: Open Galaxy Challenge Authoring (POST /api/galaxy-challenges), Set QuestionTypes.FILL_IN_THE_BLANK (or MULTIPLE_CHOICE / MULTIPLE_ANSWER), Define Choice objects (text + isCorrect flag), Publish (persisted to galaxy_challenge table). NOTE: Dedicated Translation Terminal authoring form NOT implemented. GalaxyChallenge API is used as a structural proxy.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → Teacher: POST /api/galaxy-challenges (title, description, questions\[\]) → Set question.type = FILL_IN_THE_BLANK → Define Choice\[\] with isCorrect flags → Decision: validation passes (title non-empty, choices present)? → \[Yes\] GalaxyChallengeService.save() → galaxy_challenge table persisted → available via GET /api/galaxy-challenges/{id}/no-answer (isCorrect=null suppressed by findByIdNoAnswer()) and GET /api/galaxy-challenges/{id}/with-answer (isCorrect exposed — SECURITY NOTE: client-side answer validation exposes flags pre-submission) → \[No\] HTTP 400 Bad Request.

  

### **Module 4: Teacher Dashboard, Lesson Repository, and Content Management**

The Teacher Dashboard is implemented across InstructorModule.js (/instructor), CreateLessonModule.js (/lesson), EditLessonModule.js (/lesson/edit/:id), and ChallengePage.js (/challenges). Lesson content is authored using TinyMCE (@tinymce/tinymce-react v6.3.0). The backend is served by LessonsController (/api/lessons) and ChallengeController (/api/challenges).

  

|  |
| :-: |
| *Deviation: (1) Lesson versioning — Lessons entity has no version field; PUT /api/lessons/{lessonId} performs a full overwrite without version snapshot. (2) Soft-delete — DELETE /api/lessons/{id} performs a hard delete; no isDeleted flag or deletedAt timestamp. (3) CSV/PDF analytics export — not implemented. (4) Cohort assignment UI — not implemented in InstructorModule.js.* |

  

**4.1 Transaction: Manage Lesson Content (CRUD)**

  

**Use Case Diagram Description:**

Actor: Teacher/Admin. Use cases: Create Lesson (POST /api/lessons), Update Lesson (PUT /api/lessons/{lessonId}), Delete Lesson (DELETE /api/lessons/{id}), Configure Challenge Word Lists (POST /api/challenges/falling — words + wrongWords), Author Galaxy Challenge (POST /api/galaxy-challenges). All use cases are accessible from the Instructor Module navigation. No version snapshot use case exists in the production implementation.

  

*Figure 4.1 — Use Case Diagram: Teacher Dashboard (Module 4 Transaction 4.1)*

  
  

**Use Case Description — Create:**

1.  Teacher navigates to /lesson (CreateLessonModule.js). Enters a lesson title in the text input and authors content using the TinyMCE rich-text editor.
2.  Teacher clicks Submit. Frontend issues POST /api/lessons with { title: String, content: String }.
3.  LessonsService.save() persists a Lessons entity (lessonId auto-generated, title, content as TEXT). HTTP 200 OK with the saved LessonsDTO is returned.

  

**Use Case Description — Update:**

1.  Teacher selects a lesson in InstructorModule.js and clicks Edit. Navigates to /lesson/edit/:id (EditLessonModule.js), which pre-populates the TinyMCE editor with the existing content.
2.  Teacher modifies content. Frontend issues PUT /api/lessons/{lessonId} with the updated LessonsDTO.
3.  LessonsService.updateLesson() overwrites the existing title and content. No version snapshot is created.

  

**Use Case Description — Delete:**

1.  Teacher clicks Delete on a lesson card in InstructorModule.js.
2.  Frontend issues DELETE /api/lessons/{id}.
3.  LessonsService.deleteById() performs a hard delete. If not found, EntityNotFoundException → HTTP 404.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → Teacher action decision: \[Create\] CreateLessonModule.js — enter title + TinyMCE content → POST /api/lessons {title,content} → 200 OK? → \[Yes\] Lessons entity persisted (lessonId auto-generated) → \[No\] alert('Failed to submit lesson.') → \[Update\] EditLessonModule.js — GET /api/lessons/{id} pre-fills title + TinyMCE → Teacher edits → PUT /api/lessons/{id} {title,content} → 200 OK? → \[Yes\] alert('Updated\!') navigate('/instructor') → \[No\] alert('Failed to update.') → \[Delete\] DELETE /api/lessons/{id} (no confirm dialog) → 200 OK? → \[Yes\] alert('Deleted') hard delete permanent → \[No\] alert('Failed to delete') → All branches merge → InstructorModule.js re-fetches GET /api/lessons → setState(lessons) → End.

  

  
  
  
  
  
  
  
  

**Wireframe Description:**

The screen follows the InstructorModule.js layout pattern. Top Navbar (dark \#1e293b): hamburger menu on the left, title 'Instructor Module', Back to Dashboard button on the right. Tab Bar (dark): Challenges (active, blue), Create Lesson, Custom Rewards. Left Panel (white card): challenge type selector (Normal / Falling Words / Advanced Falling Bug Mode), speed slider, lives toggle, timer input. Right Panel (white card): two-column word list area — left column shows the Correct Words pool (green bordered, monospace font); right column shows the Bug Smasher wrongWords pool (red bordered). Below both columns, a Saved Lessons grid shows lesson cards with title, Edit and Delete buttons. A 'Save Challenge' action button (blue, full-width) at the bottom issues POST /api/challenges/falling.

  

*Figure 4.2 — Wireframe: Teacher Dashboard / Instructor Module (InstructorModule.js — with wrongWords Bug Smasher pool panel enhancement)*

  
  
  
  
  
  
  
  

**4.2 Transaction: Export Student Analytics (Specified; Not Implemented)**

No analytics export endpoint (CSV or PDF) is implemented. ScoringController, LeaderboardController, and UserStatisticsController provide per-student GET endpoints accessible via the API, but no aggregated multi-student export feature exists. This capability is a planned but unimplemented requirement.

  
  

**Use Case Diagram Description:**

All use cases in this transaction are specified but not implemented. No export endpoint exists in any controller. The diagram is shown with a red dashed border to indicate unimplemented status. Teacher/Admin use cases: Select Cohort (no cohort UI), Set Date Range (not implemented), Choose Format CSV/PDF (not implemented), Download Export File (no /api/export endpoint). Recommendation: implement a GET /api/analytics/export?cohortId={id}\&from={date}\&to={date}\&format={csv|pdf} endpoint aggregating per-student Score, Leaderboard, and UserStatistics records.

  

  

### **Module 5: Gamified Progression and Logic Puzzle Engine**

The gamified progression layer is implemented through the Leaderboard entity (combined score ranking, four database indexes), Achievements entity (teacher-authored trigger-based badges), StudentAchievements junction entity, and the Galaxy Challenge RPG game mode (GalaxyMainGame.js + GalaxyChallengeController). The PersonalStatsDashboard.js page shows personal score statistics. LeaderboardPage.js renders a filterable, metric-switchable top-10 table with game and all-time views.

  

|  |
| :-: |
| *Deviation — XP System: No dedicated XP field, XP accumulation service, or level/rank entity is present. The Scoring entity stores per-session totalScore; UserStatistics tracks cumulative wordsPerMinute, accuracy, totalWordsTyped, totalTimeSpent, totalErrors, totalTestsTaken, and fastestClearTime. The Leaderboard Combined Score serves as the de-facto progression metric. Automatic badge award on session completion is not implemented; StudentAchievements are assigned manually.* |

  

**5.1 Transaction: Submit Score and Update Leaderboard**

  

**Use Case Diagram Description:**

Actors: Student (primary), Teacher/Admin (for achievement authoring). Student use cases: Browse Galaxy Challenge List (GET /api/galaxy-challenges), Start Galaxy Challenge (GalaxyMainGame.js), Answer Questions (MC / FIB / Multiple Answer), Submit Score (POST /api/scores/GALAXY), View Leaderboard (/leaderboard). A dashed «include» arrow connects Submit Score to the leaderboard update internal use case (LeaderboardService.updateLeaderboardIfBetter()). Teacher use case: Author Galaxy Challenge (POST /api/galaxy-challenges).

  

*Figure 5.1 — Use Case Diagram: Galaxy Challenge + Leaderboard (Module 5 Transactions 5.1 and 5.2)*

  

**Use Case Description — Submit Score and Update Leaderboard:**

**Use Case Name:** Submit Score and Update Leaderboard.

**Primary Actor:** System (triggered on session completion).

**Precondition:** Student has completed a game-mode session and is authenticated.

  

Main Flow:

1.  On game-over, the frontend component invokes useScoreSubmission.submitScore(category, { wpm, accuracy, score, timeSpent }) or issues a direct fetch to POST /api/scores/{category}.
2.  ScoreController parses the category path variable against the Category enum. If invalid, HTTP 400 returned.
3.  A Score entity is persisted to the scores table (score, timeInSeconds, challengeType, wpm, submittedAt, user).
4.  LeaderboardService.updateLeaderboardIfBetter(username, category, wpm, accuracy, rawScore) is called.
5.  For typing categories (TYPING_TESTS, FALLING_WORDS): Combined Score = WPM × (accuracy / 100.0); if accuracy > 95 then × 1.5; rounded to 2 decimal places (BigDecimal.HALF_UP). For non-typing categories: rawScore compared directly.
6.  If new score exceeds existing Leaderboard record, the entity is updated (wordsPerMinute, accuracy, totalWordsTyped, totalTimeSpent). isNewBest = true.
7.  The caller's rank is computed from the category leaderboard and returned in LeaderboardUpdateResult (success, isNewBest, rank).
8.  Leaderboard read endpoints (/global, /game/{category}, /user/{userId}) serve cached results via Spring Cache (@Cacheable, in-memory store keyed by metric+category). Cache is not explicitly evicted on write; first post-update read is a cache miss and hits the database.

  

**Postcondition:** Score persisted. Leaderboard updated if new best. Result returned to client.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → isGameOver=true in React component → useScoreSubmission.submitScore(category, {wpm, accuracy, score, timeSpent}) → POST /api/scores/{category} → ScoreController.submitScore() → Decision: Category.valueOf(category) valid? → \[No\] HTTP 400 → \[Yes\] Score entity persisted (score, timeInSeconds, challengeType, wpm, submittedAt, user) → LeaderboardService.updateLeaderboardIfBetter(username, category, wpm, accuracy, rawScore) → Decision: Existing Leaderboard entry for user+category? → \[No\] Create new entry, isNewBest=true → \[Yes\] Decision: isTypingGame (TYPING_TESTS or FALLING_WORDS)? → \[Yes\] Combined = WPM × (acc/100); if acc > 95 then × 1.5; compare vs existing Combined → \[No\] compare rawScore vs existing.score → Decision: new > existing? → \[Yes\] update Leaderboard entity → Merge → calculateRankForUser(user, category) → Return LeaderboardUpdateResult {success, isNewBest, rank} → End.

  
  
  
  
  
  

**Wireframe Description:**

LeaderboardPage.js. Top AppBar (dark \#1e293b): title 'ð SyntaxType — Leaderboard', Back to Dashboard button. Filter Row (white card): game dropdown (all Category enum values), metric toggle (Combined \[active, blue\] / WPM / Accuracy), period toggle (All-Time / Recent — stored in localStorage). Table Header (dark \#1e293b): Rank, Username, Game Category, WPM, Accuracy, Combined Score. Rows: top 3 show ð¥ð¥ð¥ medal icons; current user's row highlighted in yellow (\#fef9c3) with blue border. Formula note bar (blue): 'Combined Score = WPM × (accuracy / 100.0) ×1.5 bonus if accuracy > 95%'. Personal Stats section below: Highest WPM, Average Score, Tests Taken, Average Accuracy cards — data from GET /api/scores + /api/scores/falling via PersonalStatsDashboard.js.

  
  
  
  
  
  
  
  
  
  
  
  
  
  

**5.2 Transaction: Complete Galaxy Challenge (Logic Puzzle)**

  

**Use Case Diagram Description:**

Actors: Student (primary), Teacher/Admin (galaxy challenge authoring). Student use cases: Browse Galaxy Challenges (GET /api/challenges/galaxy), Load Challenge no-answer (GET /api/galaxy-challenges/{id}/no-answer — isCorrect=null on ChoiceDTO via findByIdNoAnswer()), Play Galaxy RPG (GalaxyMainGame.js canvas: ship, enemies, bosses, bullets via requestAnimationFrame), Answer Question (overlay MC / FIB / Multi — GET /with-answer for client-side isCorrect check), Submit Score (POST /api/scores/GALAXY). Teacher use case: Author Galaxy Challenge (POST /api/galaxy-challenges, QuestionTypes enum).

  

**Use Case Name:** Complete Galaxy Challenge.

**Primary Actor:** Student.

**Precondition:** Student authenticated. GalaxyChallenge entities available in galaxy_challenge table.

  

Main Flow:

1.  Student navigates to /galaxy. GalaxyChallengeList.js issues GET /api/galaxy-challenges → List<GalaxyChallengePreview> (id, title, description — no answers).
2.  Student selects a challenge. GalaxyMainGame.js issues GET /api/galaxy-challenges/{id}/no-answer → GalaxyChallengeDTO with Question list; isCorrect null on all ChoiceDTO objects (suppressed by GalaxyChallengeService.findByIdNoAnswer()).
3.  Student progresses through the Galaxy RPG narrative (space-shooter canvas, enemy waves, boss encounters). Questions appear as overlay prompts.
4.  Student selects or types an answer. Frontend issues GET /api/galaxy-challenges/{id}/with-answer, and compares the student's selection against Choice.isCorrect = true (client-side).
5.  Score submitted via POST /api/scores/GALAXY. Leaderboard updated for GALAXY category using rawScore.

  

**Postcondition:** Score persisted. Leaderboard updated if new best for GALAXY.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

**Activity Diagram Description:**

Start → GalaxyChallengeList.js: GET /api/challenges/galaxy → List<preview> → Student selects challenge, navigate to GalaxyMainGame → GET /api/galaxy-challenges/{id}/no-answer (ChoiceDTO.isCorrect=null suppressed) → GalaxyMainGame canvas renders (requestAnimationFrame: playerRef, bossEnemy, bossEnemy2, bossEnemy3, enemy wave logic) → Decision: enemy/boss encounter triggers question overlay? → \[Yes\] Display question overlay → GET /api/galaxy-challenges/{id}/with-answer → client-side: studentAnswer vs choice.isCorrect=true → Decision: correct? → \[Yes\] updateScoreUI, enemy defeated → \[No\] wrong answer feedback → Merge → Decision: bossesDefeated >= 3 (MAX_BOSSES)? → \[No\] loop back to canvas → \[Yes\] setGameWon(true) → POST /api/scores/GALAXY via useScoreSubmission → LeaderboardService: rawScore comparison (non-typing category) → End.

  
  
  

**Wireframe Description:**

The Galaxy game screen uses a space theme (background \#0a0a1a with animated star particles). Top HUD bar (dark \#0f0f2e, purple accent \#a78bfa): score on the left, lives (heart icons) in the centre, current level/wave on the right. Main Canvas (dark, approximately 65% of width): ship sprite at the bottom-left, enemy sprites at top, bullet animations, animated background stars. Question Overlay (purple-bordered card, semi-transparent dark background): English prompt text in white bold font, answer options as coloured buttons (blue for standard, green for selected correct, red for incorrect). Right Panel (dark card, 35% width): scrollable mission list showing available Galaxy Challenges with title, question type summary, and completion status icons (checkmark / bullet / circle). Bottom Input Area (dark, full width): text input for FILL_IN_THE_BLANK answers. Submit Answer button (purple, right-aligned). Score note bar: 'On completion: POST /api/scores/GALAXY → LeaderboardService.updateLeaderboardIfBetter()'.

  

*Figure 5.2 — Wireframe: Galaxy Challenge Game Screen (GalaxyMainGame.js)*

  
  
  
  
  
  
  
  
  

**Leaderboard Page Wireframe Description:**

The LeaderboardPage.js renders with a Material UI AppBar (dark \#1e293b) and a data table. Filter Row: a game dropdown (all implemented Category values), metric toggle buttons (Combined / WPM / Accuracy), and an All-Time / Recent toggle (preference persisted in localStorage). Table Header (dark blue): Rank, Student, Game, WPM, Accuracy, Combined Score. Rows: gold/silver/bronze medal icons for top 3; current user's row highlighted in yellow (\#fef9c3). A Combined Score formula note bar appears below the table. The table is populated via GET /api/leaderboards/global or /game/{category} with the selected metric parameter.

  

*Figure 5.3 — Wireframe: Leaderboard Page (LeaderboardPage.js)*

  

## **3.4 Non-Functional Requirements**

  

### **Performance**

  - Per-session metrics (WPM, accuracy, score) are persisted synchronously via POST /api/scores/{category}. Availability within ≤2 seconds of session completion depends on PostgreSQL write latency on Render.com's managed instance and HikariCP pool availability (max 10 connections).
  - Content changes (lessons, challenges) propagate synchronously within the HTTP response. The ≤3-minute specification does not apply in the current architecture; changes are immediately queryable after a successful POST/PUT response.
  - Leaderboard read queries are served from Spring Cache (@Cacheable, in-memory) after the first request. Cached reads are O(1). The first post-write read (cache miss) incurs a PostgreSQL query against four indexed columns (idx_category_wpm, idx_category_accuracy, idx_category, idx_user) on the leaderboards table.
  - The falling-block animation, drag-and-drop interactions, and keystroke capture are handled client-side in React state (no server round-trips during active gameplay), ensuring sub-second input latency on standard institutional hardware.
  - Analytics export (≤5 seconds) is a planned but unimplemented feature. This constraint is inapplicable until the feature is developed.

  

### **Security**

  - Authentication: POST /api/auth/login validates credentials via BCryptPasswordEncoder.matches() against the stored BCrypt hash (10 rounds). On success, JwtUtil.generateToken() produces an HMAC-SHA256 JWT (JJWT v0.12.6) with claims: subject (username), role, id (userId), isTempPassword. Token expiry: 86,400,000 ms (24 hours). Tokens are stored in localStorage on the frontend.
  - JWT Filter Status: JwtAuthFilter is present in the codebase but its registration (.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)) is commented out in SecurityConfig.securityFilterChain(). This means token validation is not enforced at the Spring Security filter chain level in the current configuration. CRITICAL: This must be resolved before public production deployment. @PreAuthorize annotations remain in place but depend on the security context being populated by the filter.
  - Password Storage: BCryptPasswordEncoder (Spring Security default, strength 10). Plaintext passwords are never persisted.
  - RBAC: @EnableMethodSecurity(prePostEnabled = true) in SecurityConfig. @PreAuthorize annotations restrict endpoints by role (e.g., AchievementsController: ADMIN/TEACHER only; AuthController.registerAdmin/registerTeacher: ADMIN only).
  - Temporary Passwords: Teacher accounts set isTempPassword = true via User.onCreate() @PrePersist. The JWT isTempPassword claim is checked by ProtectedRoute.js to redirect teachers to TeacherSetupAccountPage.js for mandatory password change.
  - CORS: Configured in SecurityConfig.corsConfigurationSource() — permitted origins: localhost:3000, localhost:5173, syntaxtype-deploy-omega.vercel.app. Methods: GET, POST, PUT, DELETE, OPTIONS. Credentials: allowed. CSRF disabled (appropriate for stateless JWT API).

  
  
  

### **Reliability**

  - Score persistence is synchronous and transactional via Spring Data JPA. If the HikariCP pool is exhausted (max 10 connections under concurrent load), requests queue in HikariCP; score submissions may time out under heavy load exceeding pool capacity.
  - Lesson versioning and session isolation: not implemented. PUT /api/lessons/{id} overwrites the Lessons entity immediately. Students who have loaded lesson content into browser state will continue with it for the current session; future loads will reflect the updated version.
  - Graceful degradation: Spring Cache serves cached leaderboard results if the database is temporarily unreachable. Core game-mode functionality (score submission, falling-block gameplay) is independent of the leaderboard service and remains operational if LeaderboardController endpoints are unavailable.
  - Galaxy Challenge answer security: client-side validation via the /with-answer endpoint exposes correct-answer flags. This is a known reliability and fairness gap; server-side validation is recommended.
  - No message broker, event queue, or retry mechanism is implemented. Score submission failures due to network errors are not automatically retried; the student mu