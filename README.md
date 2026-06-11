# ViralFlow AI - MVP Development

**Transform raw video into viral content with AI. Zero editing skills required.**

This is the complete source code for ViralFlow AI's MVP, built following the strategic roadmap defined in the MVP Strategy documents.

---

## 📋 Project Overview

ViralFlow AI is a production-ready video editing platform that uses AI to automatically transform raw footage into viral-optimized content. The core philosophy is **"AI first, customize second"** — users upload a video, our AI analyzes and edits it, and they download a polished result.

**Key Features:**
- Automatic video analysis (scene detection, motion, faces, audio)
- Contextual effect application (motion-triggered, face-triggered, silence-triggered)
- Auto-generated captions with speech-to-text
- Color grading and pacing optimization
- Feedback loop infrastructure for continuous improvement
- Presigned S3 downloads with 7-day expiration

**Target Launch:** 8-12 weeks  
**Target Users:** TikTok creators, Instagram Reels creators, small agencies  
**Success Metric:** >60% re-upload rate (indicates user satisfaction)

---

## 🏗️ Project Structure

```
viralflow-ai/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── api/               # API route handlers
│   │   ├── services/          # Business logic (video processing, AI, etc.)
│   │   ├── middleware/        # Auth, error handling, logging
│   │   ├── db/                # Database queries and schema
│   │   ├── lambda/            # AWS Lambda handlers
│   │   └── utils/             # Utilities and helpers
│   ├── tests/                 # Unit and integration tests
│   ├── migrations/            # Database migrations
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js + React application
│   ├── pages/                 # Page components
│   ├── components/            # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── styles/                # Global styles
│   ├── public/                # Static assets
│   ├── package.json
│   └── next.config.js
│
├── infrastructure/            # Infrastructure as Code
│   ├── terraform/             # Terraform modules
│   ├── docker/                # Docker Compose for local dev
│   └── scripts/               # Deployment scripts
│
├── docs/                      # Documentation
│   ├── API.md                 # API documentation
│   ├── ARCHITECTURE.md        # System architecture
│   └── DEPLOYMENT.md          # Deployment guide
│
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+
- Docker & Docker Compose
- Git
- AWS account (for production deployment)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/viralflow-ai.git
   cd viralflow-ai
   ```

2. **Install dependencies:**
   ```bash
   # Backend
   cd backend && npm install && cd ..
   
   # Frontend
   cd frontend && npm install && cd ..
   ```

3. **Start local services with Docker Compose:**
   ```bash
   cd infrastructure/docker
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   cd backend
   npm run migrate
   cd ..
   ```

5. **Start the development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - PostgreSQL: localhost:5432 (credentials in docker-compose.yml)

---

## 📦 Technology Stack

### Backend
- **Runtime:** Node.js 22
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15
- **Job Queue:** AWS SQS (production) / Bull + Redis (development)
- **Serverless:** AWS Lambda
- **Video Processing:** FFmpeg
- **AI Models:** OpenAI CLIP, Whisper API
- **Authentication:** JWT + OAuth2

### Frontend
- **Framework:** Next.js 14 (React 19)
- **Styling:** Tailwind CSS 4
- **State Management:** Zustand
- **Real-time:** WebSocket (Socket.io)
- **Hosting:** Vercel / Netlify
- **Video Upload:** Dropzone.js

### Infrastructure
- **Cloud:** AWS (Lambda, S3, RDS, SQS, CloudWatch)
- **IaC:** Terraform
- **CI/CD:** GitHub Actions
- **Monitoring:** CloudWatch + Sentry
- **Containerization:** Docker

---

## 🛠️ Development Workflow

### Git Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of your changes"

# Push to remote
git push origin feature/your-feature-name

# Create a Pull Request on GitHub
```

### Code Standards

- **Language:** TypeScript (strict mode)
- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Jest + Supertest (backend), Vitest (frontend)
- **Code Coverage:** Minimum 80%

### Running Tests

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm run test

# All tests
npm run test:all
```

---

## 📊 Sprint Breakdown

| Sprint | Duration | Focus | Status |
| :--- | :--- | :--- | :--- |
| **Sprint 0** | Week 1 | Infrastructure & Setup | 🔄 In Progress |
| **Sprint 1** | Week 2 | Backend Core | ⏳ Pending |
| **Sprint 2** | Weeks 3-4 | Video Processing | ⏳ Pending |
| **Sprint 3** | Weeks 3-4 | AI Integration | ⏳ Pending |
| **Sprint 4** | Weeks 4-5 | Frontend | ⏳ Pending |
| **Sprint 5** | Week 6 | Integration & Testing | ⏳ Pending |
| **Sprint 6** | Week 7 | Closed Beta | ⏳ Pending |
| **Sprint 7** | Week 8 | Launch Prep | ⏳ Pending |

---

## 📈 Key Metrics

### Success Criteria

- **Re-upload rate:** >60% (users satisfied with edits)
- **Processing time:** <60 seconds for 1-minute video
- **Satisfaction score:** >4.0/5.0
- **Error rate:** <1%
- **System uptime:** >99.5%

### Monitoring

- Real-time dashboards in CloudWatch
- Error tracking in Sentry
- User analytics in Metabase
- Cost tracking in AWS Billing

---

## 🔐 Security & Privacy

- **HTTPS everywhere** — All traffic encrypted
- **Database encryption** — PostgreSQL encryption at rest
- **API authentication** — JWT tokens with 1-hour expiration
- **Rate limiting** — 100 requests/minute per user
- **Data retention** — Videos deleted after 7 days
- **GDPR compliant** — User data deletion on request

---

## 📚 Documentation

- **[API Documentation](./docs/API.md)** — Complete API reference
- **[Architecture Guide](./docs/ARCHITECTURE.md)** — System design and data flow
- **[Deployment Guide](./docs/DEPLOYMENT.md)** — Production deployment steps
- **[MVP Strategy](../viralflow-mvp-strategy.md)** — Business and product strategy
- **[Tech Stack](../viralflow-tech-stack.md)** — Detailed technology choices
- **[Implementation Roadmap](../viralflow-implementation-roadmap.md)** — Sprint-by-sprint plan

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes with clear commit messages
3. Write tests for new functionality
4. Ensure all tests pass and code coverage >80%
5. Create a Pull Request with a clear description
6. Request review from team leads
7. Merge after approval

---

## 🚨 Troubleshooting

### Docker Services Won't Start

```bash
# Check if ports are already in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Kill existing processes
kill -9 <PID>

# Restart Docker Compose
docker-compose restart
```

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose logs postgres

# Reset database
docker-compose exec postgres psql -U viralflow -d viralflow -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npm run migrate
```

### Frontend Build Issues

```bash
# Clear Next.js cache
rm -rf frontend/.next

# Reinstall dependencies
cd frontend && rm -rf node_modules && npm install

# Restart dev server
npm run dev
```

---

## 📞 Support & Contact

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** dev@viralflow.ai
- **Slack:** [Workspace Link]

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🎯 Roadmap

**MVP (Current):**
- ✅ Auto-edit with 3 contextual effects
- ✅ Feedback loop infrastructure
- ✅ Single platform (TikTok/Reels)
- ✅ 1,000 users target

**Post-MVP (Phase 2):**
- Customization UI (VFX styles, fonts)
- Multi-platform support (YouTube Shorts)
- Creator analytics dashboard
- Team collaboration features
- API access for agencies

**Long-term (Phase 3):**
- Mobile native apps
- Advanced effects library
- Real-time collaboration
- Creator marketplace
- Enterprise features

---

## 👥 Team

- **Product Lead:** [Name]
- **Backend Lead:** [Name]
- **Frontend Lead:** [Name]
- **DevOps/ML Lead:** [Name]

---

**Last Updated:** June 6, 2026  
**Version:** 1.0.0 (MVP Development)
