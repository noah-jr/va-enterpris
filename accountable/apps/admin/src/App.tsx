import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client.js';

import { AdminLayout } from './components/AdminLayout.js';
import { AdminProtectedRoute } from './components/AdminProtectedRoute.js';

import { AdminLoginPage } from './pages/auth/AdminLoginPage.js';
import { AdminDashboardPage } from './pages/dashboard/AdminDashboardPage.js';
import { AdminDocumentsPage } from './pages/documents/AdminDocumentsPage.js';
import { AdminDocumentPage } from './pages/documents/AdminDocumentPage.js';
import { AdminClientsPage } from './pages/clients/AdminClientsPage.js';
import { AdminUsersPage } from './pages/users/AdminUsersPage.js';
import { AdminAuditPage } from './pages/audit/AdminAuditPage.js';
import { AdminBackupsPage } from './pages/backups/AdminBackupsPage.js';
import { AdminTicketsPage } from './pages/tickets/AdminTicketsPage.js';
import { AdminNotificationsPage } from './pages/notifications/AdminNotificationsPage.js';
import { AdminPlansPage } from './pages/plans/AdminPlansPage.js';
import { AdminDocumentTypesPage } from './pages/document-types/AdminDocumentTypesPage.js';
import { AdminLeadsPage } from './pages/leads/AdminLeadsPage.js';
import { AdminSettingsPage } from './pages/settings/AdminSettingsPage.js';
import { AdminRolesPage } from './pages/roles/AdminRolesPage.js';
import { AdminSubscriptionsPage } from './pages/subscriptions/AdminSubscriptionsPage.js';
import { AdminForgotPasswordPage, AdminResetPasswordPage } from './pages/auth/AdminPasswordPages.js';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/forgot-password" element={<AdminForgotPasswordPage />} />
          <Route path="/reset-password" element={<AdminResetPasswordPage />} />

          {/* Protected Admin Routes */}
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<AdminDashboardPage />} />
              <Route path="/documents" element={<AdminDocumentsPage />} />
              <Route path="/documents/:id" element={<AdminDocumentPage />} />
              <Route path="/clients" element={<AdminClientsPage />} />
              <Route path="/document-types" element={<AdminDocumentTypesPage />} />
              <Route path="/users" element={<AdminUsersPage />} />
              <Route path="/audit" element={<AdminAuditPage />} />
              <Route path="/backups" element={<AdminBackupsPage />} />
              <Route path="/tickets" element={<AdminTicketsPage />} />
              <Route path="/notifications" element={<AdminNotificationsPage />} />
              <Route path="/settings" element={<AdminSettingsPage />} />
              <Route element={<AdminProtectedRoute requiredPermission="plans:read" />}>
                <Route path="/plans" element={<AdminPlansPage />} />
              </Route>
              <Route element={<AdminProtectedRoute requiredPermission="users:read" />}>
                <Route path="/roles" element={<AdminRolesPage />} />
              </Route>
              <Route element={<AdminProtectedRoute requiredPermission="subscriptions:read" />}>
                <Route path="/subscriptions" element={<AdminSubscriptionsPage />} />
              </Route>
              <Route element={<AdminProtectedRoute requiredPermission="contacts:read" />}>
                <Route path="/leads" element={<AdminLeadsPage />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
