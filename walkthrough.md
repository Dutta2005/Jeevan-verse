# Jeevan Verse — Complete Project Walkthrough 🌐💉

> **"Connecting Healthcare, Empowering Lives"**

Jeevan Verse is a **full-stack healthcare platform** built as a hackathon project that connects patients, donors, medical professionals, and health organizations. It features Umeed, an AI-powered health assistant with multi-modal prescription analysis and persistent memory, a real-time blood donation network, community discussion forums, and organization-driven health campaigns.

---

## 1. High-Level Architecture

![alt text](./screenshots/hld.png)

### Umeed AI Chatbot Architecture

![Umeed Chatbot Features](./screenshots/umeed.png)

### Chatbot Sequence Flow

![alt text](./screenshots/umeed-arch.png)

### Architecture Pattern

- **Client**: Single Page Application (SPA) using React 19 + TypeScript + Vite
- **Server**: RESTful API + WebSocket server using Express.js + Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT-based (Access + Refresh token pair) with HTTP-only cookies
- **Real-time**: Socket.IO for live notifications (blood requests, comments)
- **AI**: Gemini 2.5 Flash for chat & vision, and Pinecone Vector DB for RAG memory
- **File Storage**: Cloudinary for image uploads
- **Email**: Nodemailer (Mailtrap in dev, Gmail in production)

---

## 2. Technology Stack

### Frontend

| Technology                        | Purpose                                                  |
| --------------------------------- | -------------------------------------------------------- |
| **React 19**                      | Core UI framework                                        |
| **TypeScript**                    | Type safety                                              |
| **Vite 6**                        | Build tool & dev server                                  |
| **React Router v7**               | Client-side routing                                      |
| **Redux Toolkit + Redux Persist** | Global state management (persisted to localStorage)      |
| **Axios**                         | HTTP client for API calls                                |
| **Socket.IO Client**              | Real-time WebSocket communication                        |
| **TailwindCSS 3**                 | Utility-first CSS styling                                |
| **ShadCN/UI (New York style)**    | Pre-built accessible UI components (Radix UI primitives) |
| **Lucide React**                  | Icon library                                             |
| **React Hook Form + Zod**         | Form handling & validation                               |
| **Framer Motion**                 | Animations                                               |
| **React Markdown**                | Rendering markdown (for chatbot responses)               |
| **date-fns**                      | Date formatting                                          |
| **country-state-city**            | Location dropdowns for address fields                    |

### Backend

| Technology                      | Purpose                                 |
| ------------------------------- | --------------------------------------- |
| **Node.js**                     | JavaScript runtime                      |
| **Express.js 4**                | HTTP server framework                   |
| **Mongoose 8**                  | MongoDB ODM                             |
| **Socket.IO 4**                 | WebSocket server                        |
| **@google/generative-ai**       | Google Gemini API client                |
| **@pinecone-database/pinecone** | Vector database for RAG memory          |
| **pdf-parse**                   | PDF text extraction for prescriptions   |
| **jsonwebtoken**                | JWT creation & verification             |
| **bcryptjs**                    | Password hashing                        |
| **Cloudinary**                  | Image upload & management               |
| **Multer**                      | File upload middleware (memory storage) |
| **Nodemailer**                  | Email sending                           |
| **cookie-parser**               | HTTP cookie parsing                     |
| **cors**                        | Cross-Origin Resource Sharing           |
| **dotenv**                      | Environment variable management         |

### Deployment

| Service          | Purpose                              |
| ---------------- | ------------------------------------ |
| **Vercel**       | Frontend hosting (SPA with rewrites) |
| **Backend host** | Express + Socket.IO server           |

---

## 3. Project Folder Structure

```
hackwars/
├── .gitignore
├── Readme.md
├── client/                          # Frontend SPA
│   ├── index.html                   # HTML entry point
│   ├── package.json                 # Dependencies & scripts
│   ├── vite.config.ts               # Vite build config (@ alias)
│   ├── tailwind.config.js           # TailwindCSS theme & design tokens
│   ├── components.json              # ShadCN/UI configuration
│   ├── vercel.json                  # Vercel SPA rewrites
│   ├── .env / .env.example          # VITE_API_URL
│   └── src/
│       ├── main.tsx                 # ★ App entry — routing, providers, lazy loading
│       ├── App.tsx                  # ★ Root component — Navbar, theme, WebSocket init
│       ├── App.css                  # Global styles
│       ├── index.css                # Tailwind base imports
│       ├── api/
│       │   └── api.ts               # Axios instance (baseURL, withCredentials)
│       ├── store/
│       │   ├── store.ts             # Redux store config + persist
│       │   ├── authSlice.ts         # Auth state (user/org, role, isAuthenticated)
│       │   ├── themeSlice.ts        # Dark/Light theme toggle
│       │   └── notificationSlice.ts # Real-time notification queue
│       ├── utils/
│       │   ├── socket.ts            # Socket.IO client init + event handlers
│       │   └── userMenu.ts          # Navigation menu options config
│       ├── hooks/
│       │   └── use-toast.ts         # Toast notification hook (ShadCN)
│       ├── lib/
│       │   └── utils.ts             # Tailwind class merge utility (cn)
│       ├── pages/
│       │   ├── Home.tsx             # Conditional: Dashboard (auth) or LandingPage
│       │   ├── LandingPage.tsx      # Public landing with hero + feature sections
│       │   ├── Chatbot.tsx          # Umeed AI Health Assistant
│       │   ├── BloodBridge.tsx      # Blood donation hub (tabs)
│       │   ├── BloodBridgeRequest.tsx # Individual blood request detail
│       │   ├── BloodDonationGuidelines.tsx # Static guidelines page
│       │   ├── Discussions.tsx      # Discussion forum listing (Chit Chat)
│       │   ├── account/
│       │   │   ├── Login.tsx        # User login form
│       │   │   ├── Signup.tsx       # User registration (multi-field)
│       │   │   └── NotificationPage.tsx # Full notification center
│       │   └── organisation/
│       │       ├── Layout.tsx       # Organisation-specific layout wrapper
│       │       ├── OrgHome.tsx      # Organisation dashboard/landing
│       │       ├── OrgPost.tsx      # Single org post view
│       │       ├── OrgPostPage.tsx  # All org posts listing (Campaigns)
│       │       ├── OrgProfile.tsx   # Organisation profile page
│       │       └── auth/
│       │           ├── OrganisationLogin.tsx
│       │           └── OrganisationSignup.tsx
│       └── components/
│           ├── chatbot/             # Umeed AI Assistant features
│           │   ├── SessionSidebar.tsx
│           │   ├── FileUpload.tsx
│           │   ├── PrescriptionCard.tsx
│           │   └── BehaviorInsights.tsx
│           ├── BackButton.tsx       # Reusable back navigation
│           ├── CommentSection.tsx   # Threaded comments with replies
│           ├── LoadingScreen.tsx    # Suspense fallback spinner
│           ├── Logoutbtn.tsx        # User logout button
│           ├── MessageComponent.tsx # Chat message renderer (markdown)
│           ├── ui/                  # 24 ShadCN/UI components
│           ├── navbar/
│           │   ├── Navbar.tsx       # Main navigation bar
│           │   ├── Sidebar.tsx      # Mobile sidebar menu
│           │   └── Notifications.tsx # Navbar notification bell/dropdown
│           ├── layouts/
│           │   ├── Protected.tsx    # Auth guard (role-based)
│           │   └── Public.tsx       # Public-only route guard
│           ├── dashboard/
│           │   ├── Dashboard.tsx    # User dashboard container
│           │   ├── PersonalDetails.tsx # User profile display
│           │   └── LatestsPosts.tsx # Recent org posts feed
│           ├── discussion/
│           │   ├── CreatePost.tsx   # New discussion post dialog
│           │   ├── PostCard.tsx     # Discussion post card
│           │   ├── DiscussionPost.tsx # Full post view + comments
│           │   └── DiscussionPostSkeleton.tsx
│           ├── blood bridge/
│           │   ├── RequestForm.tsx  # Create blood request form
│           │   ├── Requests.tsx     # All blood requests listing
│           │   ├── UserRequests.tsx # User's own requests
│           │   ├── EditRequest.tsx  # Edit blood request
│           │   └── BeVolunteer.tsx  # Volunteer for a request
│           ├── landing page/
│           │   ├── Umeed.tsx        # AI chatbot feature section
│           │   ├── BloodBridge.tsx  # Blood bridge feature section
│           │   ├── ChitChat.tsx     # Discussion feature section
│           │   └── Campaign.tsx     # Campaigns feature section
│           ├── organisation/
│           │   ├── OrgLandingPage.tsx # Org public landing
│           │   ├── OrgLogoutBtn.tsx
│           │   ├── navbar/         # Org-specific navbar
│           │   ├── dashboard/      # Org dashboard components
│           │   └── post/           # Org post form component
│           ├── footer/
│           │   └── Footer.tsx
│           └── errors/
│               ├── Error404.tsx
│               └── SomethingWrong.tsx
│
└── server/                          # Backend API
    ├── package.json                 # Dependencies & scripts
    ├── .env / .env.example          # All config variables
    ├── .prettierrc                  # Code formatting
    ├── api/
    │   └── index.js                 # ★ Server entry — connects DB, starts HTTP+WS
    └── src/
        ├── app.js                   # ★ Express app — middleware, routes, WS init
        ├── constants.js             # DB_NAME = "hackwars"
        ├── db/
        │   └── index.js             # MongoDB connection via Mongoose
        ├── models/                  # 9 Mongoose schemas
        │   ├── user.model.js
        │   ├── organization.model.js
        │   ├── post.model.js
        │   ├── comment.model.js
        │   ├── bloodRequest.model.js
        │   ├── notification.model.js
        │   ├── orgPost.model.js
        │   ├── chatSession.model.js  # Chat history & metadata
        │   └── prescription.model.js # Extracted prescription data
        ├── controllers/             # 8 controller files
        │   ├── user.controller.js
        │   ├── organization.controller.js
        │   ├── chatbot.controller.js
        │   ├── post.controller.js
        │   ├── comment.controller.js
        │   ├── bloodRequest.controller.js
        │   ├── notification.controller.js
        │   └── orgPost.controller.js
        ├── routes/                  # 8 route files
        │   ├── user.routes.js
        │   ├── organization.routes.js
        │   ├── chatbot.routes.js
        │   ├── post.routes.js
        │   ├── comment.routes.js
        │   ├── orgPost.routes.js
        │   ├── bloodRequest.routes.js
        │   └── notification.routes.js
        ├── middlewares/
        │   ├── auth.middleware.js    # User JWT verification
        │   ├── org.middleware.js     # Organization JWT verification
        │   └── multer.middleware.js  # File upload (memory, 3MB limit)
        ├── utils/
        │   ├── apiError.js          # Custom error class
        │   ├── apiResponse.js       # Standard response class
        │   ├── asynchandler.js      # Async error wrapper
        │   ├── cloudinary.js        # Cloudinary upload/delete
        │   └── webSocket.js         # Socket.IO server setup
        └── service/
            ├── email.js             # Email transport (Mailtrap/Gmail)
            ├── rag.service.js       # Pinecone integration for RAG
            ├── behavior.service.js  # User conversation metadata extraction
            ├── prescription.service.js # PDF/Image analysis via Gemini
            └── emailTemplates/
                └── bloodBridge.js   # HTML email template for blood requests
```

---

## 4. Database Schema (MongoDB + Mongoose)

![alt text](./screenshots/er.png)

### Key Model Features

| Model            | Notable Details                                                                                                                                                                                     |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User**         | Password auto-hashed via `pre("save")` hook. Has `generateAccessToken()` and `generateRefreshToken()` methods. Stores address (state/district/city) and medical info (blood group, height, weight). |
| **Organization** | Parallel auth system to User. Same JWT token generation pattern. Types: hospital, ngo, research, other.                                                                                             |
| **Post**         | Supports anonymous posting — author is stored but hidden when `isAnonymous: true`.                                                                                                                  |
| **Comment**      | Supports **threaded replies** via `parentComment` + `replies[]` refs. Has a `pre('validate')` hook ensuring either `user` or `organization` is set. Works for both Post and OrgPost.                |
| **BloodRequest** | Hierarchical location-based donor matching (city → district → state). Has a volunteers array with privacy preferences (`canShareDetails`).                                                          |
| **Notification** | Linked to users, supports deduplication for grouped comments within a 5-minute window.                                                                                                              |

---

## 5. Authentication System

### Dual-Entity Auth

The system supports **two independent authentication entities**: **Users** and **Organizations**. Each has its own:

- Registration / Login / Logout endpoints
- JWT middleware (`auth.middleware.js` vs `org.middleware.js`)
- Redux state slice (user vs organization)

### Token Flow

![alt text](./screenshots/token.png)

### Cookie Configuration

- `httpOnly: true` — prevents JavaScript access (XSS protection)
- `secure: true` — HTTPS only
- `sameSite: "none"` — allows cross-origin requests (frontend on different domain)
- `withCredentials: true` on Axios — sends cookies with every request

### Comment Routes — Dual Auth

The comment routes use a **unique dual-auth fallback** pattern:

```javascript
// First tries User JWT, if fails, tries Organization JWT
router.use((req, res, next) => {
  verifyJWT(req, res, (err) => {
    if (err) {
      verifyOrgJWT(req, res, next);
    } else {
      next();
    }
  });
});
```

This allows both users AND organizations to comment on posts.

---

## 6. API Routes — Complete Reference

### Base URL: `/api/v1`

#### Users (`/users`)

| Method | Endpoint                | Auth    | Description                  |
| ------ | ----------------------- | ------- | ---------------------------- |
| POST   | `/register`             | ❌      | Register new user            |
| POST   | `/login`                | ❌      | Login user                   |
| GET    | `/:id`                  | ❌      | Get user by ID               |
| POST   | `/logout`               | ✅ User | Logout user                  |
| POST   | `/refresh-token`        | ❌      | Refresh access token         |
| POST   | `/change-password`      | ✅ User | Change password              |
| PATCH  | `/update`               | ✅ User | Update profile               |
| GET    | `/search`               | ✅ User | Search blood donors          |
| PATCH  | `/donation-status`      | ✅ User | Toggle donation availability |
| GET    | `/current-user/details` | ✅ User | Get current user info        |

#### Organizations (`/organizations`)

| Method | Endpoint           | Auth   | Description           |
| ------ | ------------------ | ------ | --------------------- |
| POST   | `/register`        | ❌     | Register organization |
| POST   | `/login`           | ❌     | Login organization    |
| GET    | `/profile/:id`     | ❌     | Get org profile by ID |
| POST   | `/logout`          | ✅ Org | Logout                |
| POST   | `/refresh-token`   | ❌     | Refresh token         |
| POST   | `/change-password` | ✅ Org | Change password       |
| PATCH  | `/update`          | ✅ Org | Update profile        |
| GET    | `/profile`         | ✅ Org | Get own profile       |

#### AI Chatbot (`/chat`)

| Method | Endpoint                | Auth    | Description                          |
| ------ | ----------------------- | ------- | ------------------------------------ |
| GET    | `/sessions`             | ✅ User | List all chat sessions               |
| POST   | `/sessions`             | ✅ User | Create new chat session (max 20)     |
| GET    | `/sessions/:id`         | ✅ User | Get full session chat history        |
| DELETE | `/sessions/:id`         | ✅ User | Delete session and vectors           |
| POST   | `/sessions/:id/message` | ✅ User | Send message with Pinecone RAG       |
| POST   | `/sessions/:id/upload`  | ✅ User | Upload image/PDF prescription        |
| GET    | `/behavior`             | ✅ User | Get behavior insights (mood, topics) |

#### Discussion Posts (`/posts`)

| Method | Endpoint      | Auth    | Description                            |
| ------ | ------------- | ------- | -------------------------------------- |
| GET    | `/`           | ❌      | Get all posts (paginated, 15/page)     |
| GET    | `/:id`        | ❌      | Get post by ID                         |
| GET    | `/user/:id`   | ❌      | Get posts by user (non-anonymous only) |
| POST   | `/create`     | ✅ User | Create new post                        |
| PATCH  | `/edit/:id`   | ✅ User | Edit own post                          |
| DELETE | `/delete/:id` | ✅ User | Delete own post                        |

#### Organization Posts (`/org-posts`)

| Method | Endpoint            | Auth   | Description                         |
| ------ | ------------------- | ------ | ----------------------------------- |
| GET    | `/`                 | ❌     | Get all org posts (paginated)       |
| GET    | `/:id`              | ❌     | Get org post by ID                  |
| GET    | `/organization/:id` | ❌     | Get posts by organization           |
| POST   | `/create`           | ✅ Org | Create post (with thumbnail upload) |
| PATCH  | `/edit/:id`         | ✅ Org | Edit post                           |
| DELETE | `/delete/:id`       | ✅ Org | Delete post (+ Cloudinary cleanup)  |

#### Comments (`/comments`)

| Method | Endpoint                    | Auth | Description                              |
| ------ | --------------------------- | ---- | ---------------------------------------- |
| GET    | `/post/:postId`             | ✅   | Get top-level comments for a post        |
| GET    | `/comment/:parentCommentId` | ✅   | Get replies to a comment                 |
| POST   | `/post/:postId`             | ✅   | Add comment to post                      |
| POST   | `/comment/:parentCommentId` | ✅   | Reply to a comment                       |
| PATCH  | `/:commentId`               | ✅   | Update own comment                       |
| DELETE | `/:commentId`               | ✅   | Delete own comment (soft if has replies) |

#### Blood Requests (`/blood-requests`)

| Method | Endpoint                     | Auth    | Description                        |
| ------ | ---------------------------- | ------- | ---------------------------------- |
| GET    | `/`                          | ✅ User | Get all blood requests (paginated) |
| GET    | `/status`                    | ✅ User | Filter by status                   |
| GET    | `/blood-group`               | ✅ User | Filter by blood group              |
| GET    | `/:id`                       | ✅ User | Get request by ID                  |
| GET    | `/user/:id`                  | ✅ User | Get user's requests                |
| POST   | `/create`                    | ✅ User | Create blood request               |
| PATCH  | `/update/:id`                | ✅ User | Update request                     |
| PATCH  | `/status/:id`                | ✅ User | Update request status              |
| DELETE | `/delete/:id`                | ✅ User | Delete request                     |
| POST   | `/:id/volunteer`             | ✅ User | Volunteer for a request            |
| PATCH  | `/:id/volunteer-preferences` | ✅ User | Update volunteer privacy           |

#### Notifications (`/notifications`)

| Method | Endpoint                     | Auth    | Description                       |
| ------ | ---------------------------- | ------- | --------------------------------- |
| GET    | `/`                          | ✅ User | Get all notifications             |
| PATCH  | `/mark-read/:notificationId` | ✅ User | Mark one as read                  |
| PATCH  | `/mark-all-read`             | ✅ User | Mark all as read                  |
| DELETE | `/delete/:notificationId`    | ✅ User | Delete one                        |
| DELETE | `/delete-all`                | ✅ User | Delete all                        |
| GET    | `/after`                     | ✅ User | Get notifications after timestamp |

---

## 7. Feature Deep-Dives

### 7.1 🩺 Umeed — AI Symptom Checker

![alt text](./screenshots/ummed.png)

**Key Details:**

- Uses **Gemini 2.0 Flash** model with custom generation config (maxTokens: 500, temp: 0.7)
- **Personalised**: Injects logged-in user's blood group, height, weight, and calculated BMI into the system prompt
- **Chat context**: Full conversation history is maintained and sent with each request
- **Safety filter retry**: If Gemini blocks for safety, retries up to 2 times with rephrasing suggestion
- **Markdown rendering**: Responses are rendered using `react-markdown` in the client

### 7.2 🩸 Blood Bridge — Blood Donation Network

![alt text](./screenshots/bloodBridge.png)

**Key Details:**

- **Location-Based Matching**: Uses hierarchical fallback — first searches donors in the same city, then district, then state
- **Multi-channel notification**: Each matching donor gets a WebSocket real-time notification, an in-app notification, AND an email
- **Volunteer system**: Donors can volunteer with a `canShareDetails` privacy preference
- **Privacy**: Non-creator viewers don't see volunteer contact details if `canShareDetails: false`
- **Blood groups supported**: A+, A-, B+, B-, AB+, AB-, O+, O-
- **Urgency levels**: low, medium, high
- **Status tracking**: pending → completed | rejected

### 7.3 💬 Chit Chat — Discussion Forums

**Key Details:**

- **Anonymous posting**: Users can create posts anonymously — author ID is stored (for ownership) but hidden from other viewers
- **Threaded comments**: Comments support nested replies via `parentComment` + `replies[]` references
- **Dual-entity comments**: Both Users AND Organizations can comment (dual JWT fallback in middleware)
- **Comment notifications**: When someone comments on your post, you get a real-time WebSocket notification + in-app notification
- **Deduplication**: If multiple people comment within 5 minutes, notifications are grouped ("3 people commented on your post")
- **Soft delete**: Comments with replies are marked as `[Deleted]` rather than removed (preserves thread)
- **Pagination**: Posts are paginated at 15 per page

### 7.4 📣 Health Campaigns — Organization Posts

**Key Details:**

- **Organization-only creation**: Only authenticated organizations can create campaign posts
- **Thumbnail support**: Posts support image thumbnails uploaded via Multer → Cloudinary
- **File size limit**: 3MB max for uploads
- **Cloudinary cleanup**: When a post with a thumbnail is deleted, the image is also removed from Cloudinary
- **Public viewing**: All users (including unauthenticated on some routes) can view campaign posts
- **Organisation profiles**: Each org has a public profile page showing description, type, website, and their posts

---

## 8. Real-Time System (WebSocket)

![alt text](./screenshots/ws.png)

**Socket Events:**

| Event                 | Direction       | Purpose                                              |
| --------------------- | --------------- | ---------------------------------------------------- |
| `joinRoom`            | Client → Server | User joins their personal notification room (userId) |
| `roomJoined`          | Server → Client | Confirmation of room join                            |
| `bloodRequest`        | Server → Client | New blood request notification                       |
| `comment`             | Server → Client | New comment on user's post                           |
| `sendNotification`    | Client → Server | Generic notification relay                           |
| `receiveNotification` | Server → Client | Relayed notification                                 |

**Client-side debouncing**: Blood request events are debounced with a 100ms delay to prevent duplicate notifications.

---

## 9. Client-Side State Management

![alt text](./screenshots/state.png)

**Key Decisions:**

- **Redux Persist**: Entire store is persisted to `localStorage`, so auth state survives page refreshes
- **Serializable check**: Redux middleware configured to ignore redux-persist's internal actions
- **Notification deduplication**: Both `addNotification` and `addNotifications` check for duplicate `_id` before adding

---

## 10. Client-Side Routing

![alt text](./screenshots/route.png)

**Legend**: ★ = Protected (requires auth), ☆ = Public-only (redirects if logged in)

### Route Guards

- **`<Protected role="user">`**: Redirects to `/login` if not authenticated as user
- **`<Protected role="organization">`**: Redirects to `/signin` if not authenticated as org
- **`<PublicRoutes>`**: Only renders children if NOT authenticated (prevents login page when already logged in)

### Lazy Loading

All pages are lazy-loaded with `React.lazy()` + `<Suspense>` for code splitting, showing a `<LoadingScreen>` spinner during load.

---

## 11. Design System

### Color Palette

| Token        | Value                | Usage                                   |
| ------------ | -------------------- | --------------------------------------- |
| `primary`    | `#bf2231` (Deep Red) | CTAs, blood donation, brand accent      |
| `secondary`  | `#3498db` (Blue)     | Links, AI chatbot, interactive elements |
| `accent`     | `#1abc9c` (Teal)     | Success states, brand accent            |
| `light-bg`   | `#f4f9f4`            | Light mode background                   |
| `light-text` | `#2c3e50`            | Light mode text                         |
| `dark-bg`    | `#222222`            | Dark mode background                    |
| `dark-text`  | `#e0e6ed`            | Dark mode text                          |

### Typography

- **IBM Plex Sans**: Body text font
- **Samarkan**: Decorative font for "Jeevan" in brand name

### Component Library

24 ShadCN/UI components (New York style) built on Radix UI primitives:
alert-dialog, alert, avatar, badge, border-beam, button, card, dialog, dropdown-menu, input, label, marquee, navigation-menu, number-ticker, scroll-area, select, separator, sheet, skeleton, switch, tabs, textarea, toast, toaster

### Theme System

- **Dark mode by default** (`initialState: { theme: "dark" }`)
- Toggle via navbar dropdown switch
- Implemented via TailwindCSS `dark:` class strategy
- Theme preference persisted in localStorage via Redux Persist

---

## 12. Data Flow — End-to-End User Journey

![alt text](./screenshots/dataFlow.png)

---

## 13. Deployment Architecture

![alt text](./screenshots/deployment.png)

### Environment Variables

**Server** (`.env`):

- `PORT`, `MONGODB_URI`, `CORS_ORIGIN`
- `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIARY`
- `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIARY`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `MAILTRAP_*` (dev) / `GMAIL_*` (prod)
- `FRONTEND_URL`

**Client** (`.env`):

- `VITE_API_URL` — Backend server URL

---

## 14. Key Design Patterns & Decisions

| Pattern                           | Where                    | Description                                                                         |
| --------------------------------- | ------------------------ | ----------------------------------------------------------------------------------- |
| **Async Handler**                 | All controllers          | Wraps async route handlers to catch errors without try/catch boilerplate            |
| **ApiError / ApiResponse**        | All controllers          | Standardised error/success response format                                          |
| **Dual-Entity Auth**              | Auth system              | Separate auth flows for Users and Organizations sharing the same JWT infrastructure |
| **Hierarchical Location Search**  | Blood requests           | City → District → State fallback for finding matching donors                        |
| **Comment Notification Grouping** | Comment controller       | Deduplicates notifications within 5-minute windows                                  |
| **Soft Delete**                   | Comments                 | Comments with replies show `[Deleted]` instead of being removed                     |
| **Privacy Controls**              | Blood request volunteers | Volunteers choose whether to share contact details                                  |
| **Anonymous Posting**             | Discussion posts         | Author stored internally but hidden from public API responses                       |
| **Lazy Loading**                  | Client routing           | All pages lazy-loaded for code splitting                                            |
| **Redux Persist**                 | Client state             | Auth and theme state survives page refreshes                                        |
| **Debounced WebSocket Events**    | Client socket            | 100ms debounce on blood request notifications to prevent duplicates                 |

---

## 15. Quick Summary for Presentations

> **Jeevan Verse** is a full-stack healthcare platform built with React, Node.js, Express, MongoDB, Socket.IO, and Google Gemini AI. It has four core features:
>
> 1. **Umeed (AI Symptom Checker)** — A personalized medical chatbot powered by Gemini AI that considers your blood group, height, weight, and BMI to provide tailored health guidance.
> 2. **Blood Bridge** — A real-time blood donation coordination system with location-based donor matching, WebSocket notifications, email alerts, and a volunteer management system with privacy controls.
> 3. **Chit Chat (Discussion Forums)** — Community health discussion spaces with anonymous posting, threaded comments supporting both users and organizations, and real-time comment notifications.
> 4. **Health Campaigns** — Organization-driven health awareness posts with image uploads to Cloudinary, enabling hospitals, NGOs, and research organizations to publish health education content.
>
> The platform uses JWT-based authentication with dual-entity support (Users + Organizations), real-time WebSocket communication via Socket.IO, Redux with persistence for client state management, and is deployed on Vercel (frontend) with a Node.js backend.
