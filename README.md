# Abdelrhman Hany — Full-Stack Developer Portfolio

A bilingual, full-stack developer portfolio built with Next.js. Alongside project and service showcases, it includes a MongoDB-backed project archive, user profiles, an admin dashboard, and a real-time support chat.

**Languages:** Arabic (RTL) and English (LTR)  
**Repository:** [baltmsah8-hash/portfolio](https://github.com/baltmsah8-hash/portfolio)

## Features

- **Bilingual portfolio:** Localized navigation, landing page, project pages, authentication, and dashboard in Arabic and English.
- **Portfolio and project archive:** Featured projects on the home page, category filters, bilingual project details, image gallery, technology tags, and optional live/repository links.
- **Admin dashboard:** Manage projects and uploaded images, browse registered users, and open client conversations.
- **Authentication and profiles:** Registration, login, profile editing, and logout using JWTs in HTTP-only cookies. Passwords are hashed with bcrypt.
- **Real-time support chat:** User/admin messages, read receipts, unread message counts, and admin message pinning, delivered through Pusher.
- **Background browser push notifications:** Web Push and VAPID let users receive chat notifications when the browser is closed or the chat page is in the background. Clicking a notification opens or focuses the relevant conversation.
- **Scheduled chat cleanup:** The Vercel cron configuration calls the cleanup endpoint weekly. Messages older than seven days are removed unless pinned, and unread counts are recalculated.
- **Responsive interface:** Tailwind CSS, Lucide icons, loading states, and a shared alert context.
- **API validation and rate limits:** Zod validates API inputs. The proxy applies in-memory rate limits to login, profile updates, and user chat messages.

## Technology

| Area | Technologies |
| --- | --- |
| Application | Next.js 16 (App Router), React 19, TypeScript |
| Styling and localization | Tailwind CSS 4, `next-intl` |
| Data and validation | MongoDB, Mongoose, Zod |
| Authentication | `jose` (JWT), `bcryptjs` |
| Real-time messaging | Pusher and `pusher-js` |
| Media | Cloudinary and `next-cloudinary` |
| UI and utilities | Lucide React, `date-fns`, Spline |
| Quality and deployment | Jest, ESLint, Vercel |

`src/data/technologies.json` supplies the technologies showcased in the portfolio UI. Some entries (such as React Native, Express, and PostgreSQL) describe showcased skills and are not application runtime dependencies.

## Application Structure

```text
src/
├── app/
│   ├── [locale]/           # Localized pages: home, projects, auth, profile, chat, admin
│   └── api/                # Route handlers for auth, projects, users, chat, and cron
├── components/             # Shared UI, landing-page sections, forms, and loading states
├── context/                # Shared alert provider
├── controllers/             # Auth, project, and chat business logic
├── data/                    # Portfolio technology showcase data
├── i18n/                    # next-intl request configuration
├── lib/                     # Database, Pusher, validation, and API error handling
├── models/                  # Mongoose User, Project, and Chat schemas
└── proxy.ts                 # API authentication, authorization, and rate limiting
messages/                    # English and Arabic translation dictionaries
tests/api/                   # Jest API and proxy tests
```

### Main routes

| Route | Purpose |
| --- | --- |
| `/[locale]` | Portfolio landing page |
| `/[locale]/projects` | Project archive and category filters |
| `/[locale]/projects/[id]` | Project details and image gallery |
| `/[locale]/auth` | Registration and login |
| `/[locale]/profile` | User profile and account actions |
| `/[locale]/chat` | Support conversation; admins can select a user with `?userId=...` |
| `/[locale]/admin` | Admin dashboard for projects and client conversations |

### API overview

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/auth/login` | `POST` | Authenticate and set the session cookie |
| `/api/auth/register` | `POST` | Create a user account |
| `/api/auth/logout` | `POST` | Clear the session cookie |
| `/api/user/profile` | `GET`, `PUT` | Read or update the authenticated profile |
| `/api/admin/users` | `GET` | List clients and unread-message totals for admins |
| `/api/projects` | `GET` | List projects |
| `/api/projects/one` | `GET` | Get a project using the `x-project-id` header |
| `/api/admin/projects/upload` | `POST`, `DELETE` | Create a project or delete a Cloudinary image |
| `/api/admin/projects/manage` | `PUT`, `DELETE` | Update or delete a project |
| `/api/chat` | `GET` | Load a conversation and update read state |
| `/api/chat/user` | `POST` | Send a user message |
| `/api/chat/admin` | `POST` | Send an admin reply |
| `/api/chat/read` | `PATCH` | Mark messages as read |
| `/api/chat/pin` | `PATCH` | Pin or unpin a message |
| `/api/push/subscribe` | `POST`, `DELETE` | Subscribe or unsubscribe the authenticated browser to Web Push notifications |
| `/api/cron/cleanup` | `GET` | Delete expired, unpinned messages and recalculate unread counts |

## Getting Started

### Requirements

- Node.js **20.9 or later**
- npm
- A MongoDB database
- Pusher and Cloudinary accounts for real-time chat and project image management
- HTTPS (or `localhost`) and a generated VAPID key pair for browser push notifications

### Install

```bash
git clone https://github.com/baltmsah8-hash/portfolio.git
cd portfolio
npm install
```

### Configure environment

Create `.env.local` in the project root. Keep secret values private; do not commit this file.

```env
# Required database and authentication settings
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT_SECRET=<long-random-secret>

# Optional: create the initial admin account on the first database connection
ADMIN_NAME=Portfolio Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PHONE=+14155552671
ADMIN_PASSWORD=<strong-admin-password>

# Pusher: server credentials and browser-visible app key/cluster
PUSHER_APP_ID=<pusher-app-id>
PUSHER_SECRET=<pusher-secret>
NEXT_PUBLIC_PUSHER_KEY=<pusher-key>
NEXT_PUBLIC_PUSHER_CLUSTER=<pusher-cluster>

# Cloudinary: server credentials and browser-visible upload configuration
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
NEXT_PUBLIC_CLOUDINARY_PRESET=<unsigned-upload-preset>

# Protect the scheduled cleanup endpoint
CRON_SECRET=<long-random-secret>

# Web Push: generate with `npx web-push generate-vapid-keys`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public-vapid-key>
VAPID_PRIVATE_KEY=<private-vapid-key>
VAPID_EMAIL=mailto:<support-contact-email>
```

The admin account is seeded automatically when the app first connects to MongoDB if no admin exists and the admin email, phone, and password are configured. `ADMIN_NAME` is optional and defaults to `Admin`. There is no separate seed command.

Variables prefixed with `NEXT_PUBLIC_` are used by browser-side code and should contain only values intended to be public. `NODE_ENV` is supplied by the runtime.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The default locale is Arabic; English is available under `/en`.

### Available scripts

```bash
npm run dev       # Start the Next.js development server
npm run build     # Create a production build
npm run start     # Serve the production build
npm run lint      # Run ESLint
npm test          # Run the Jest test suite
npm run test:watch
```

## Deployment

The repository includes a Vercel cron schedule in `vercel.json` for `/api/cron/cleanup` (`15 1 * * 5`, every Friday at 01:15 UTC). Configure all required environment variables in the deployment environment, including `CRON_SECRET`, and deploy to Vercel to use the configured schedule. The rate limiter stores counters in process memory, so it is per-instance and is not a shared distributed rate limit.
