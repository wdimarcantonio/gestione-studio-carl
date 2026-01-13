# Dietitian Management System - PRD

A secure, multi-tenant web application for dietitians to manage patient data, measurements, communications, and documents with role-based access control.

## Purpose
Enable dietitians (ADMIN role) to efficiently manage patient health data while providing patients (PATIENT role) secure access to their own information through a unified platform.

**Experience Qualities**:
1. **Secure** - Multi-tenant data isolation ensures patients only see their own data
2. **Efficient** - Streamlined workflows for common tasks like logging measurements and messaging
3. **Transparent** - Clear visibility into patient progress and communication history

**Complexity Level**: Complex Application (advanced functionality with multiple views)
- Multiple user roles with different feature sets
- Real-time messaging across channels
- Data visualization and analytics
- File management and secure storage

---

## Essential Features

### 1. Authentication & Authorization
- **Functionality**: JWT-based login with role assignment (ADMIN/PATIENT)
- **Purpose**: Secure access control and data isolation
- **Trigger**: User navigates to app URL
- **Progression**: Login form → credential validation → JWT token issuance → role-based redirect (admin to /admin, patient to /patient)
- **Success Criteria**: Users can only access routes and data appropriate to their role

### 2. Patient Dashboard (PATIENT role)
- **Functionality**: Personalized view of health metrics, appointments, and communications
- **Purpose**: Empower patients with insight into their health journey
- **Trigger**: Patient logs in
- **Progression**: Dashboard loads → displays weight/composition charts → shows upcoming appointments → message count badges
- **Success Criteria**: Patient sees only their own data; charts render correctly with historical data

### 3. Measurement Management (ADMIN)
- **Functionality**: Record weight, fat mass, lean mass, water percentage with dates
- **Purpose**: Track patient progress over time
- **Trigger**: Admin selects patient and clicks "Add Measurement"
- **Progression**: Select patient from global selector or dialog → open measurement form → input values and date → validate → save → update patient chart
- **Success Criteria**: Measurements persist, display in charts, and are visible to both admin and respective patient; selected patient from header pre-populates in dialogs

### 3.1 Global Patient Selection (ADMIN)
- **Functionality**: Persistent patient selector in application header
- **Purpose**: Allow admin to select a patient once and work with that patient across all pages without repetitive selection
- **Trigger**: Admin navigates to any admin page
- **Progression**: View patient selector in header → search/select patient → selection persists across page navigation → all admin pages filter to selected patient → clear selection to view all patients
- **Success Criteria**: Selected patient persists in useKV storage; all admin pages (measurements, messages, documents) respect selected patient; selection survives page refresh

### 4. Unified Messaging Hub
- **Functionality**: Send and receive messages via internal chat, email, and WhatsApp
- **Purpose**: Centralize all patient communication in one interface
- **Trigger**: User clicks "Messages" or "Send Message"
- **Progression**: View message timeline → filter by channel → compose message → select channel → send → message persists in DB → displays in timeline
- **Success Criteria**: All messages (internal, email, WhatsApp) appear in unified timeline; filtering works correctly

### 5. Document Management
- **Functionality**: Upload, categorize, and share documents with patients
- **Purpose**: Provide patients access to diet plans, lab results, educational materials
- **Trigger**: Admin uploads document or patient views documents section
- **Progression**: Admin: select file → assign to patient → upload → Patient: view list → click download → file downloads
- **Success Criteria**: Files store securely; patients can only download their own documents; file size limits enforced

---

## Edge Case Handling

- **No measurements yet**: Display empty state with prompt to add first measurement
- **Failed external message send**: Log error, mark message as "failed," allow retry
- **Large file uploads**: Show progress indicator, enforce 10MB limit, display error for oversized files
- **Token expiration**: Refresh token automatically or redirect to login with message
- **Patient profile incomplete**: Allow gradual profile completion, show completion progress
- **Concurrent admin edits**: Last write wins; consider optimistic locking for future versions
- **Deleted patient data**: Soft delete with retention period for compliance

---

## Design Direction

The design should evoke **clinical professionalism with human warmth** - trustworthy, clean, and accessible while avoiding sterile or intimidating medical aesthetics.

---

## Color Selection

**Approach**: Calming health-focused palette with professional tones and clear visual hierarchy

- **Primary Color**: Deep Teal `oklch(0.50 0.12 200)` - Conveys health, trust, and expertise
- **Secondary Colors**: 
  - Soft Blue `oklch(0.70 0.08 220)` - Supporting actions, less emphasis
  - Warm Neutral `oklch(0.85 0.02 80)` - Backgrounds for cards and sections
- **Accent Color**: Vibrant Coral `oklch(0.68 0.18 25)` - CTAs, important notifications, progress indicators
- **Foreground/Background Pairings**:
  - Primary on Background: White text `oklch(0.98 0 0)` on Deep Teal - Ratio 6.2:1 ✓
  - Foreground on Background: Dark Gray `oklch(0.25 0 0)` on White `oklch(1 0 0)` - Ratio 13.5:1 ✓
  - Accent on Card: White text `oklch(0.98 0 0)` on Coral - Ratio 4.9:1 ✓

---

## Font Selection

Typography should balance **medical precision with approachability** - clear, legible, and modern without being cold.

- **Typographic Hierarchy**:
  - H1 (Page Titles): Inter SemiBold/32px/tight letter spacing/-0.02em
  - H2 (Section Headers): Inter Medium/24px/normal spacing
  - H3 (Card Titles): Inter Medium/18px/normal spacing
  - Body (Content): Inter Regular/16px/line-height 1.6
  - Small (Metadata): Inter Regular/14px/muted color
  - Data Display (Numbers): IBM Plex Mono Regular/18px - for measurements and metrics

---

## Animations

**Approach**: Subtle, purposeful motion that guides attention without distraction

- **Card hover**: Gentle lift with shadow increase (150ms ease-out)
- **Button interactions**: Quick scale feedback (100ms) on press
- **Chart rendering**: Staggered fade-in for data points (400ms ease)
- **Page transitions**: Smooth slide and fade (300ms) between views
- **Message send**: Success checkmark animation with slight bounce
- **Loading states**: Skeleton screens with shimmer effect for content areas

---

## Component Selection

### **Components**:
- **Layout**: Material Toolbar (top) + Sidenav (left navigation) with responsive toggle
- **Forms**: Material Form Fields with validation states and error messages
- **Data Display**: Material Table with sorting, Material Cards for dashboards
- **Dialogs**: Material Dialog for confirmations and forms
- **Navigation**: Material Tabs for message channels
- **Feedback**: Material Snackbar for notifications
- **Charts**: ng2-charts (Chart.js) for line charts showing measurement trends
- **File Upload**: Custom component with drag-drop using Material styling

### **Customizations**:
- Custom measurement card component with mini sparkline preview
- Custom message bubble component for internal chat (WhatsApp-style)
- Custom patient list item with avatar, status indicator, and quick actions

### **States**:
- **Buttons**: Hover (background darken 10%), Active (scale 0.97), Disabled (opacity 0.5)
- **Inputs**: Focus (primary color border + subtle glow), Error (destructive color border + icon)
- **Cards**: Default (subtle border), Hover (shadow elevation), Selected (primary border)

### **Icon Selection**:
- **Navigation**: Material Icons (home, people, message, folder, settings)
- **Actions**: add_circle, edit, delete, send, file_upload, file_download
- **Status**: check_circle (success), error (error), schedule (pending)
- **Channels**: chat (internal), email, phone (WhatsApp)

### **Spacing**:
- Base unit: 8px (Material Design standard)
- Component padding: 16px
- Card spacing: 24px gaps in grid
- Section margins: 32px vertical spacing
- Form field gaps: 16px

### **Mobile**:
- **< 768px**: Sidenav becomes overlay drawer, toolbar shows menu toggle
- **Tables**: Transform to card list view on mobile
- **Charts**: Full width with touch-enabled tooltips
- **Forms**: Stack fields vertically, full-width inputs
- **Navigation**: Bottom navigation bar for primary patient actions (dashboard, messages, documents)

---

## Technical Architecture Summary

**Stack**: React 19 + TypeScript (frontend) + Spark Runtime (persistence & LLM) + Client-side routing

**Key Patterns**:
- React Router for role-based navigation
- Custom hooks for data management (useKV for persistence)
- Context providers for auth state
- Protected routes with role guards
- Data isolation via user ID filtering
- Type-safe interfaces for all entities
- Zod validation on forms

**Security**:
- Role-based route guards via React Router
- User ID validation on every data access
- Spark KV isolation per user
- Client-side data filtering
- No sensitive data in client storage

---

## Success Metrics

1. **Security**: Zero unauthorized data access incidents; all endpoints properly guarded
2. **Performance**: Dashboard loads < 2s; chart rendering < 500ms
3. **Reliability**: 99.9% uptime; zero data loss on measurements or messages
4. **Usability**: Patient onboarding < 5 minutes; admin can log measurement in < 30 seconds
5. **Scalability**: Handle 1000+ patients per dietitian; message history with pagination

---

## Future Enhancements

- Mobile apps (iOS/Android) for patients
- Automated appointment reminders via email/SMS
- Meal planning and recipe management
- Photo upload for meal logging
- Integration with fitness trackers (Fitbit, Apple Health)
- Multi-language support
- Telehealth video consultations
- Payment and invoicing module
