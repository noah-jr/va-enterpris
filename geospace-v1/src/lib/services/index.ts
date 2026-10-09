// ============================================
// SERVIÇOS
// ============================================

export { default as authService } from './auth.service';
export { default as dashboardService } from './dashboard.service';
export { default as emergencyService } from './emergency.service';
export { default as settingsService } from './settings.service';
export { default as userService } from './user.service';
export { default as auditLogService } from './audit-log.service';
export { default as recordingService } from './recording.service';

// ============================================
// TIPOS - AUTH
// ============================================

export type {
    User,
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
} from './auth.service';

// ============================================
// TIPOS - DASHBOARD
// ============================================

export type {
    DashboardStats,
    RecentActivity,
    ChartData,
} from './dashboard.service';

// ============================================
// TIPOS - EMERGENCY
// ============================================

export type {
    Emergency,
    CreateEmergencyRequest,
    UpdateEmergencyRequest,
} from './emergency.service';

// ============================================
// TIPOS - SETTINGS
// ============================================

export type {
    Settings,
    UpdateSettingsRequest,
} from './settings.service';

// ============================================
// TIPOS - USER
// ============================================

export type {
    GEOSPACEUser,
    UserStats,
    UserActivity,
    UserFilters,
} from './user.service';

// ============================================
// TIPOS - AUDIT LOG
// ============================================

export type {
    AuditLog,
    AuditLogFilters,
} from './audit-log.service';

// ============================================
// TIPOS - RECORDING
// ============================================

export type {
    Recording,
    RecordingFilters,
} from './recording.service';
