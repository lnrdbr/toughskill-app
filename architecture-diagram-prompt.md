# System Architecture Diagram Prompt

Generate a clean, professional **system architecture diagram** for a dissertation (UK Software Engineering). The diagram should use a layered architecture style with clear boundaries between tiers. Use a neutral, technical colour palette — no bright gradients or decorative elements. Monochrome with one accent colour (teal) is ideal. The diagram must be legible at A4 print scale.

## System: TOUGHSKILL — Gamified Soft Skills E-Learning Platform

**Stack:** SvelteKit 2 / Svelte 5 frontend and server, SQLite database, Mistral AI for LLM evaluation, Better Auth for authentication.

## Architecture Layers (top to bottom)

### 1. Client Tier (Browser)

Label: **"Client (Browser)"**

Three groups inside this tier:

**Pages / Routes:**

- `/` (Landing)
- `/learn` (Course Hub — dot-path progress view)
- `/lesson` (Lesson Player)
- `/me` (User Dashboard)
- `/demo/better-auth` (Auth Demo)

**UI Components** (grouped):

- Core: `Button`, `ListItem`, `CourseCard`, `LessonItem`, `ReadingBlock`
- Exercise: `DivergentThinking`, `Scamper`, `StoryBuilder`, `ConstraintChallenge`, `AnalogySprint`
- Feedback: `ExerciseResults`, `GuilfordCard`, `BubbleCloud`
- Orchestration: `ModuleRunner` (dynamically loads exercise/learning/results modules)

**Client Auth:** `auth-client` (anonymous sign-in, GitHub OAuth, email/password)

Show an arrow from Pages down to the SvelteKit Server tier labelled "HTTP (form actions, fetch)".

### 2. SvelteKit Server Tier

Label: **"Application Server (SvelteKit / Node.js)"**

Three groups:

**Middleware:**

- `hooks.server.ts` — session injection via Better Auth

**Page Handlers:**

- Load functions: read course config + query DB for progress
- Form actions: start lessons, sign out

**API Endpoints:**

- `POST /api/exercises/divergent-thinking`
- `POST /api/exercises/scamper`
- `POST /api/exercises/story-builder`
- `POST /api/exercises/constraint-challenge`
- `POST /api/exercises/analogy-sprint`
- `POST /api/progress`

Show arrows from API Endpoints to both the Database tier and the External Services tier.

### 3. Data Tier

Label: **"Data (SQLite + Drizzle ORM)"**

Two table groups:

**Auth Tables** (managed by Better Auth):

- `user` (id, name, email, isAnonymous)
- `session` (token, expiresAt, userId)
- `account` (providerId, accessToken, userId)
- `verification` (identifier, value, expiresAt)

**Application Tables:**

- `exerciseSubmission` (userId, exerciseType, prompt, ideas, evaluation, timeSpentSeconds)
- `moduleCompletion` (userId, moduleId, courseId, lessonSlug, timeSpentSeconds)

### 4. External Services Tier

Label: **"External Services"**

Three services shown as separate boxes:

- **Mistral AI** — LLM evaluation engine (`mistral-small-latest`). Arrow from API Endpoints labelled "POST /chat/completions (JSON evaluation)". Used to score exercise submissions across creativity dimensions (fluency, flexibility, originality, etc.).
- **GitHub OAuth** — Social authentication provider. Arrow from Auth middleware labelled "OAuth 2.0 flow".
- **Iconify CDN** — Icon delivery for UI.

### 5. Configuration Layer (side panel, not a horizontal tier)

Label: **"Configuration (static)"**

Show this as a vertical panel on the right side, connected to the Server tier:

- **Course Config** (`creativity.ts`) — defines courses, lessons, and module sequences
- **Module Registry** — maps component IDs to lazy-loaded Svelte components
- **Type System** — `Course > Lesson > Module` hierarchy; evaluation types per exercise

## Key Data Flows (show as annotated arrows)

1. **Exercise submission flow:**
   Client submits ideas → API endpoint stores `exerciseSubmission` in DB → sends prompt + ideas to Mistral AI → receives JSON evaluation → updates DB record → returns evaluation + community ideas to client

2. **Progress tracking flow:**
   `ModuleRunner` completes a module → `POST /api/progress` → inserts `moduleCompletion` row → `/learn` page queries completions to render dot-path progress

3. **Auth flow:**
   Browser → `hooks.server.ts` checks session → Better Auth resolves user from cookie → `locals.user` injected into all server handlers. Anonymous users auto-created on first visit; can link GitHub account later.

## Visual Style

- Layered horizontal tiers, top to bottom: Client → Server → Data, with External Services to the side or below
- Configuration as a vertical sidebar
- Rounded rectangles for service/component groups
- Solid arrows for synchronous data flow, dashed arrows for async (LLM evaluation)
- Use teal (#0d9488) as the accent colour for primary flow arrows and tier headers
- White/light grey background, dark text
- Sans-serif font (Inter, Helvetica, or similar)
- Include a small legend for arrow types
- No decorative icons or illustrations — keep it technical and clean
- Suitable for academic publication at A4 scale
