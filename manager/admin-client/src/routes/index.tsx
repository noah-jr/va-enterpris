import React, { Suspense } from 'react'
import LoginPage from "../pages/LoginPage"
import VerifyEmailPage from "../pages/VerifyEmailPage"
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"
import { authStore } from "../auth/authStore"
import { Layout } from "./layout"
import ProtectedRoute from "../auth/ProtectedRoute"

// Lazy imports for admin pages
const SuperAdminDashboard = React.lazy(() => import("../pages/SuperAdminDashboard"))
const SystemMonitoring = React.lazy(() => import("../pages/SystemMonitoring"))
const SubscriptionManagement = React.lazy(() => import("../pages/SubscriptionManagement"))
const TicketsPage = React.lazy(() => import("../pages/TicketsPage"))
const Settings = React.lazy(() => import("../pages/Settings"))
const ClientAudits = React.lazy(() => import("../pages/ClientAudits"))
const AdminUsers = React.lazy(() => import("../pages/AdminUsers"))
const AdminRoles = React.lazy(() => import("../pages/AdminRoles"))

const SuspenseLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent"></div>
            <p className="text-sm text-[var(--text-muted)] animate-pulse">A carregar módulo admin...</p>
        </div>
    </div>
);

const LayoutRoot = () => {
    return (
        <Router>
            <Suspense fallback={<SuspenseLoader />}>
                <Routes>
                    {/* Public routes - redirect to dashboard if already logged in */}
                    <Route path="/" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
                    <Route path="/login" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
                    <Route path="/verify-email" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <VerifyEmailPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<Layout><SuperAdminDashboard /></Layout>} path="/dashboard" />
                        <Route element={<Layout><AdminUsers /></Layout>} path="/users" />
                        <Route element={<Layout><AdminRoles /></Layout>} path="/roles" />
                        <Route element={<Layout><SubscriptionManagement /></Layout>} path="/subscriptions" />
                        <Route element={<Layout><SystemMonitoring /></Layout>} path="/monitoring" />
                        <Route element={<Layout><TicketsPage /></Layout>} path="/tickets" />
                        <Route element={<Layout><Settings /></Layout>} path="/settings" />
                        <Route element={<Layout><ClientAudits /></Layout>} path="/audits" />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    )
}

export {LayoutRoot}