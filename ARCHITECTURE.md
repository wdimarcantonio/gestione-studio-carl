# Dietitian Management System - Architecture Specification

## Stack Overview
- **Frontend:** Angular 17+ with Angular Material
- **Backend:** NestJS + TypeORM
- **Database:** PostgreSQL
- **Auth:** JWT with role-based access control

---

## 1. Database Schema

```sql
-- Users & Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PATIENT')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Patient Profile
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10),
  date_of_birth DATE,
  phone VARCHAR(50),
  address TEXT,
  billing_info JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Measurements
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  measurement_date DATE NOT NULL,
  weight_kg DECIMAL(5,2),
  fat_mass_kg DECIMAL(5,2),
  lean_mass_kg DECIMAL(5,2),
  water_percentage DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  sender_role VARCHAR(20) NOT NULL,
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('INTERNAL', 'EMAIL', 'WHATSAPP')),
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('IN', 'OUT')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size_bytes INT,
  mime_type VARCHAR(100),
  category VARCHAR(50),
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 30,
  status VARCHAR(20) DEFAULT 'SCHEDULED',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_measurements_patient ON measurements(patient_id, measurement_date DESC);
CREATE INDEX idx_messages_patient ON messages(patient_id, created_at DESC);
CREATE INDEX idx_documents_patient ON documents(patient_id);
```

---

## 2. Core Domain Models (TypeScript)

```typescript
// User & Auth
export interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'PATIENT';
  createdAt: Date;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

// Patient
export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: Date;
  phone?: string;
  address?: string;
  billingInfo?: Record<string, any>;
}

// Measurement
export interface Measurement {
  id: string;
  patientId: string;
  measurementDate: Date;
  weightKg?: number;
  fatMassKg?: number;
  leanMassKg?: number;
  waterPercentage?: number;
  notes?: string;
}

// Message
export type MessageChannel = 'INTERNAL' | 'EMAIL' | 'WHATSAPP';
export type MessageDirection = 'IN' | 'OUT';

export interface Message {
  id: string;
  patientId: string;
  senderRole: 'ADMIN' | 'PATIENT';
  channel: MessageChannel;
  direction: MessageDirection;
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// Document
export interface Document {
  id: string;
  patientId: string;
  filename: string;
  filePath: string;
  fileSizeBytes?: number;
  mimeType?: string;
  category?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Appointment
export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: Date;
  durationMinutes: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}
```

---

## 3. API Endpoints

### Authentication
```
POST   /api/v1/auth/register          - Register new user
POST   /api/v1/auth/login             - Login (returns JWT)
POST   /api/v1/auth/refresh           - Refresh access token
POST   /api/v1/auth/logout            - Logout
GET    /api/v1/auth/me                - Get current user
```

### Patients (ADMIN only)
```
GET    /api/v1/patients               - List all patients
POST   /api/v1/patients               - Create patient
GET    /api/v1/patients/:id           - Get patient details
PUT    /api/v1/patients/:id           - Update patient
DELETE /api/v1/patients/:id           - Delete patient
```

### Measurements (ADMIN: all, PATIENT: own only)
```
GET    /api/v1/measurements                    - List measurements
POST   /api/v1/measurements                    - Create measurement (ADMIN)
GET    /api/v1/measurements/patient/:patientId - Get by patient
DELETE /api/v1/measurements/:id                - Delete measurement (ADMIN)
```

### Messages
```
GET    /api/v1/messages                    - List messages (filtered by role)
POST   /api/v1/messages                    - Send message
GET    /api/v1/messages/patient/:patientId - Get patient messages (ADMIN)
POST   /api/v1/messages/email              - Send via email (ADMIN)
POST   /api/v1/messages/whatsapp           - Send via WhatsApp (ADMIN)
```

### Documents
```
GET    /api/v1/documents                    - List documents (filtered by role)
POST   /api/v1/documents                    - Upload document (ADMIN)
GET    /api/v1/documents/:id/download       - Download document
DELETE /api/v1/documents/:id                - Delete document (ADMIN)
```

### Appointments
```
GET    /api/v1/appointments                    - List appointments
POST   /api/v1/appointments                    - Create appointment (ADMIN)
GET    /api/v1/appointments/patient/:patientId - Get patient appointments
PUT    /api/v1/appointments/:id                - Update appointment
DELETE /api/v1/appointments/:id                - Delete appointment (ADMIN)
```

---

## 4. Backend Structure (NestJS)

```
backend/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/
│   │   ├── database.config.ts
│   │   └── jwt.config.ts
│   ├── common/
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── current-user.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interceptors/
│   │   │   └── transform.interceptor.ts
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── patients/
│   │   ├── patients.module.ts
│   │   ├── patients.controller.ts
│   │   ├── patients.service.ts
│   │   ├── entities/
│   │   │   └── patient.entity.ts
│   │   └── dto/
│   │       ├── create-patient.dto.ts
│   │       └── update-patient.dto.ts
│   ├── measurements/
│   │   ├── measurements.module.ts
│   │   ├── measurements.controller.ts
│   │   ├── measurements.service.ts
│   │   ├── entities/
│   │   │   └── measurement.entity.ts
│   │   └── dto/
│   │       └── create-measurement.dto.ts
│   ├── messages/
│   │   ├── messages.module.ts
│   │   ├── messages.controller.ts
│   │   ├── messages.service.ts
│   │   ├── providers/
│   │   │   ├── email.provider.ts
│   │   │   └── whatsapp.provider.ts
│   │   ├── entities/
│   │   │   └── message.entity.ts
│   │   └── dto/
│   │       ├── create-message.dto.ts
│   │       └── send-external-message.dto.ts
│   ├── documents/
│   │   ├── documents.module.ts
│   │   ├── documents.controller.ts
│   │   ├── documents.service.ts
│   │   ├── entities/
│   │   │   └── document.entity.ts
│   │   └── dto/
│   │       └── upload-document.dto.ts
│   └── appointments/
│       ├── appointments.module.ts
│       ├── appointments.controller.ts
│       ├── appointments.service.ts
│       ├── entities/
│       │   └── appointment.entity.ts
│       └── dto/
│           ├── create-appointment.dto.ts
│           └── update-appointment.dto.ts
├── uploads/
│   └── documents/
├── package.json
└── tsconfig.json
```

---

## 5. Frontend Structure (Angular)

```
frontend/
├── src/
│   ├── app/
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── app.component.ts
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── auth.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── token.service.ts
│   │   │   └── models/
│   │   │       ├── user.model.ts
│   │   │       ├── patient.model.ts
│   │   │       ├── measurement.model.ts
│   │   │       ├── message.model.ts
│   │   │       ├── document.model.ts
│   │   │       └── appointment.model.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   │   ├── layout.component.ts
│   │   │   │   │   ├── header.component.ts
│   │   │   │   │   └── sidebar.component.ts
│   │   │   │   └── loading-spinner/
│   │   │   │       └── loading-spinner.component.ts
│   │   │   └── material.module.ts
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   │   └── login.component.ts
│   │   │   │   └── auth.routes.ts
│   │   │   ├── patient/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── dashboard.component.ts
│   │   │   │   ├── measurements/
│   │   │   │   │   └── measurements.component.ts
│   │   │   │   ├── messages/
│   │   │   │   │   └── messages.component.ts
│   │   │   │   ├── documents/
│   │   │   │   │   └── documents.component.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── patient.service.ts
│   │   │   │   └── patient.routes.ts
│   │   │   └── admin/
│   │   │       ├── patients-list/
│   │   │       │   └── patients-list.component.ts
│   │   │       ├── patient-detail/
│   │   │       │   └── patient-detail.component.ts
│   │   │       ├── measurements-manage/
│   │   │       │   └── measurements-manage.component.ts
│   │   │       ├── messages-hub/
│   │   │       │   └── messages-hub.component.ts
│   │   │       ├── documents-manage/
│   │   │       │   └── documents-manage.component.ts
│   │   │       ├── services/
│   │   │       │   ├── admin.service.ts
│   │   │       │   ├── measurements.service.ts
│   │   │       │   ├── messages.service.ts
│   │   │       │   └── documents.service.ts
│   │   │       └── admin.routes.ts
│   │   └── environments/
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   ├── assets/
│   ├── styles.scss
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

---

## 6. Angular Routing Structure

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'patient',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'PATIENT' },
    loadChildren: () => import('./features/patient/patient.routes').then(m => m.PATIENT_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' },
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];

// patient.routes.ts
export const PATIENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'documents', component: DocumentsComponent }
];

// admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'patients', pathMatch: 'full' },
  { path: 'patients', component: PatientsListComponent },
  { path: 'patients/:id', component: PatientDetailComponent },
  { path: 'messages', component: MessagesHubComponent }
];
```

---

## 7. Security Implementation

### Backend: JWT Guards & Role Checking

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.includes(user.role);
  }
}

// Usage in controller
@Controller('patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  @Get()
  @Roles('ADMIN')
  findAll() { /* ... */ }
}
```

### Data Isolation in Services

```typescript
// measurements.service.ts
@Injectable()
export class MeasurementsService {
  async findAll(currentUser: User): Promise<Measurement[]> {
    if (currentUser.role === 'ADMIN') {
      return this.measurementRepository.find();
    }
    
    // PATIENT: return only their measurements
    const patient = await this.patientRepository.findOne({ 
      where: { userId: currentUser.id } 
    });
    
    return this.measurementRepository.find({ 
      where: { patientId: patient.id } 
    });
  }
}
```

### Frontend: Auth Interceptor

```typescript
// auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getAccessToken();
    
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    
    return next.handle(req);
  }
}
```

---

## 8. Key Implementation Notes

### File Storage Strategy
- Store files in `backend/uploads/documents/{patientId}/{filename}`
- Save only relative path in database
- Use multer for file uploads
- Validate file types and size limits
- Stream files for download (don't load entire file in memory)

### Message Integration
- Internal messages: direct DB insert
- Email: use nodemailer, save sent message to DB
- WhatsApp: integrate Twilio API or similar, persist message
- Webhook endpoint to receive incoming external messages

### Frontend State Management
- Use Angular services with BehaviorSubject for simple state
- Consider NgRx if app grows complex

### Charts
- Use Chart.js or ng2-charts for measurement trends
- Display weight, fat mass, lean mass over time

---

## 9. Environment Variables

```bash
# Backend .env
DATABASE_URL=postgresql://user:pass@localhost:5432/dietitian_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password
WHATSAPP_API_KEY=your-twilio-key
WHATSAPP_PHONE_NUMBER=+1234567890
UPLOAD_DIR=./uploads
```

```typescript
// Frontend environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1'
};
```

---

## 10. Deployment Checklist

- [ ] Enable CORS with specific origins
- [ ] Set up HTTPS with SSL certificates
- [ ] Use environment variables (never hardcode secrets)
- [ ] Implement rate limiting on auth endpoints
- [ ] Add database connection pooling
- [ ] Set up file upload size limits
- [ ] Enable compression (gzip)
- [ ] Add logging (Winston or similar)
- [ ] Set up error monitoring (Sentry)
- [ ] Database migrations with TypeORM
- [ ] Backup strategy for database and files
- [ ] GDPR compliance: data export, deletion endpoints

---

## Summary

This architecture provides:
✅ **Secure multi-tenancy** with role-based access  
✅ **Clean separation** between frontend and backend  
✅ **Scalable structure** with lazy-loaded modules  
✅ **Production-ready patterns** with DTOs, guards, interceptors  
✅ **Data isolation** at the service layer  
✅ **Unified messaging** with multi-channel support  

Start by implementing authentication, then build patient management, followed by measurements, messages, and documents.
