# ✅ GraphQL Profile Project TODO List

## 🔰 Phase 1: Setup & Authentication

- [x] Initialize project structure (HTML/CSS/JS or framework)
- [x] Create login page UI
- [x] Implement POST request to `/api/auth/signin` with Basic Auth
- [x] Handle JWT on successful login (store in localStorage or cookie)
- [x] Decode JWT to extract user ID
- [x] Show error message on invalid credentials
- [x] Add logout functionality (clear JWT, redirect to login)

---

## 📊 Phase 2: GraphQL Integration

- [ ] Set up GraphQL request utility with JWT in `Authorization` header
- [ ] Query user table for `id` and `login`
- [ ] Explore schema in GraphiQL and test sample queries
- [ ] Try queries with:
  - [ ] Basic fields
  - [ ] Nested objects
  - [ ] Arguments

---

## 👤 Phase 3: Profile Page

- [ ] Design profile UI (basic info + stats layout)
- [ ] Choose at least 3 types of data to display, e.g.:
  - [ ] User login/email
  - [ ] XP total
  - [ ] Grades or passed/failed stats
- [ ] Write GraphQL queries to fetch chosen data
- [ ] Display the queried data in the profile UI

---

## 📈 Phase 4: SVG Graphs

- [ ] Choose two+ types of statistical graphs:
  - [ ] XP over time
  - [ ] XP by project
  - [ ] Pass/fail ratio
  - [ ] Attempts per exercise
- [ ] Query GraphQL for relevant graph data
- [ ] Structure and parse data for graphing
- [ ] Implement SVG graphs:
  - [ ] Line/Bar chart
  - [ ] Pie chart or radial progress
  - [ ] Add interactivity or animation if desired

---

## 🌐 Phase 5: Hosting

- [ ] Choose hosting platform (GitHub Pages, Netlify, Vercel)
- [ ] Configure deployment settings
- [ ] Deploy final app online

---

## ✅ Final Checks

- [ ] All GraphQL query types used
- [ ] JWT-based login works
- [ ] UI is responsive and clean
- [ ] Graphs are dynamic and SVG-based
- [ ] App is publicly hosted
- [ ] Code is organized and commented
