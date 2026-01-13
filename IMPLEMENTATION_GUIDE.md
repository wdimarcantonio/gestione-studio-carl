# Quick Implementation Guide

## Setup Commands

### Backend (NestJS)
```bash
npm i -g @nestjs/cli
nest new dietitian-backend
cd dietitian-backend

# Dependencies
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install bcrypt class-validator class-transformer
npm install @nestjs/config
npm install multer @types/multer
npm install nodemailer @types/nodemailer

# Dev dependencies
npm install -D @types/passport-jwt @types/bcrypt
```

### Frontend (Angular)
```bash
npm i -g @angular/cli
ng new dietitian-frontend
cd dietitian-frontend

# Angular Material
ng add @angular/material

# Additional dependencies
npm install chart.js ng2-charts
npm install jwt-decode
```

---

## Critical Code Snippets

### Backend: JWT Strategy
```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      role: payload.role 
    };
  }
}
```

### Backend: Data Isolation Example
```typescript
// src/measurements/measurements.controller.ts
import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('measurements')
@UseGuards(JwtAuthGuard)
export class MeasurementsController {
  constructor(private measurementsService: MeasurementsService) {}

  @Get()
  async findAll(@Req() req) {
    const currentUser = req.user;
    return this.measurementsService.findAllForUser(currentUser);
  }
}

// src/measurements/measurements.service.ts
@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement) private repo: Repository<Measurement>,
    @InjectRepository(Patient) private patientRepo: Repository<Patient>,
  ) {}

  async findAllForUser(user: any): Promise<Measurement[]> {
    if (user.role === 'ADMIN') {
      return this.repo.find({ relations: ['patient'] });
    }

    // PATIENT: only their own data
    const patient = await this.patientRepo.findOne({ 
      where: { userId: user.id } 
    });
    
    if (!patient) throw new NotFoundException('Patient profile not found');
    
    return this.repo.find({ 
      where: { patientId: patient.id },
      order: { measurementDate: 'DESC' }
    });
  }
}
```

### Frontend: Auth Service
```typescript
// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { 
      email, 
      password 
    }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);
    this.loadUserFromToken();
    
    const user = this.currentUserSubject.value;
    if (user.role === 'ADMIN') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/patient']);
    }
  }

  private loadUserFromToken(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        this.currentUserSubject.next({
          id: decoded.sub,
          email: decoded.email,
          role: decoded.role
        });
      } catch (error) {
        this.logout();
      }
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }
}
```

### Frontend: Auth Guard
```typescript
// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const requiredRole = route.data['role'];
  
  if (authService.hasRole(requiredRole)) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

### Frontend: Material Module
```typescript
// src/app/shared/material.module.ts
import { NgModule } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

const modules = [
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatCardModule,
  MatTableModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatChipsModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatDialogModule,
  MatTabsModule
];

@NgModule({
  imports: modules,
  exports: modules
})
export class MaterialModule {}
```

---

## Database Migration (TypeORM)

```bash
# Generate migration
npm run migration:generate -- -n CreateInitialSchema

# Run migrations
npm run migration:run
```

```typescript
// package.json scripts
"scripts": {
  "migration:generate": "typeorm migration:generate -d src/config/data-source.ts",
  "migration:run": "typeorm migration:run -d src/config/data-source.ts",
  "migration:revert": "typeorm migration:revert -d src/config/data-source.ts"
}
```

---

## File Upload Example

### Backend
```typescript
// src/documents/documents.controller.ts
import { 
  Controller, Post, UseInterceptors, UploadedFile, 
  UseGuards, Req, Body 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  @Post()
  @Roles('ADMIN')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/documents',
        filename: (req, file, cb) => {
          const uniqueName = `${Date.now()}-${file.originalname}`;
          cb(null, uniqueName);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Req() req
  ) {
    return this.documentsService.create({
      ...dto,
      filename: file.originalname,
      filePath: file.path,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      uploadedBy: req.user.id,
    });
  }
}
```

### Frontend
```typescript
// Upload component
uploadFile(event: any, patientId: string): void {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('patientId', patientId);
  formData.append('category', this.selectedCategory);

  this.http.post(`${environment.apiUrl}/documents`, formData)
    .subscribe({
      next: () => this.snackBar.open('Document uploaded', 'Close', { duration: 3000 }),
      error: (err) => this.snackBar.open('Upload failed', 'Close', { duration: 3000 })
    });
}
```

---

## Testing Endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Get measurements (with token)
curl -X GET http://localhost:3000/api/v1/measurements \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Create collection "Dietitian API"
2. Set environment variable: `baseUrl = http://localhost:3000/api/v1`
3. Add auth folder with login request
4. Use Tests tab to save token: `pm.environment.set("token", pm.response.json().accessToken)`
5. Set Authorization type to Bearer Token with `{{token}}`

---

## Production Deployment

### Backend (Docker)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/main"]
```

### Frontend (Nginx)
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/dietitian-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: dietitian_db
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://admin:secure_password@postgres:5432/dietitian_db
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

---

## Next Steps

1. ✅ Set up backend with NestJS CLI
2. ✅ Configure database connection and create entities
3. ✅ Implement authentication module with JWT
4. ✅ Create patient, measurement, message, document modules
5. ✅ Add guards and decorators for authorization
6. ✅ Set up Angular project with Material
7. ✅ Create core services (auth, http interceptors)
8. ✅ Build patient and admin feature modules
9. ✅ Add charts for measurement visualization
10. ✅ Implement file upload/download
11. ✅ Integrate email and WhatsApp providers
12. ✅ Write unit and e2e tests
13. ✅ Deploy to production

Good luck with your implementation!
