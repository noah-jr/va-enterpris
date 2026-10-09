import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client.js';

import { ClientLayout } from './components/ClientLayout.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';

import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage.js';
import { SetPasswordPage } from './pages/auth/SetPasswordPage.js';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage.js';

import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { DocumentsListPage } from './pages/documents/DocumentsListPage.js';
import { CreateDocumentPage } from './pages/documents/CreateDocumentPage.js';
import { DocumentDetailsPage } from './pages/documents/DocumentDetailsPage.js';
import { TicketsListPage } from './pages/tickets/TicketsListPage.js';
import { CreateTicketPage } from './pages/tickets/CreateTicketPage.js';
import { TicketDetailsPage } from './pages/tickets/TicketDetailsPage.js';
import { SettingsPage } from './pages/settings/SettingsPage.js';
import { NotificationsPage } from './pages/notifications/NotificationsPage.js';
import { PublicUploadPage } from './pages/public/PublicUploadPage.js';
import { PublicClientSessionUploadPage } from './pages/public/PublicClientSessionUploadPage.js';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
          <Route path="/auth/set-password" element={<SetPasswordPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          {/* Public, unauthenticated upload links */}
          <Route path="/upload/:token" element={<PublicUploadPage />} />
          <Route path="/publico/documentos/upload" element={<PublicClientSessionUploadPage />} />
          <Route path="/envio" element={<PublicClientSessionUploadPage />} />
          <Route path="/upload/sessao/:token" element={<PublicClientSessionUploadPage />} />

          {/* Protected Client Portal Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ClientLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentsListPage />} />
              <Route path="/documents/new" element={<CreateDocumentPage />} />
              <Route path="/documents/:id" element={<DocumentDetailsPage />} />
              <Route path="/tickets" element={<TicketsListPage />} />
              <Route path="/tickets/new" element={<CreateTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};
