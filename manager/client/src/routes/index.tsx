import React, { Suspense } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom"

import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import VerifyEmailPage from "../pages/VerifyEmailPage"
import POSConsole from "../pages/POSConsole"
import LandingPage from "../pages/LandingPage"
import WaitlistPage from "../pages/WaitlistPage"
import PublicInfoPage from "../pages/PublicInfoPage"
import AGTPublicPortal from "../pages/AGTPublicPortal"

// Lazy Loaded Pages
const AdminUsers = React.lazy(() => import("../pages/AdminUsers"))
const RolesPermissions = React.lazy(() => import("../pages/RolesPermissions"))
const AuditLogs = React.lazy(() => import("../pages/AuditLogs"))
const Subscription = React.lazy(() => import("../pages/Subscription"))
const SubscriptionClient = React.lazy(() => import("../pages/SubscriptionClient"))
const Invoices = React.lazy(() => import("../pages/Invoices"))
const Clients = React.lazy(() => import("../pages/Clients"))
const Products = React.lazy(() => import("../pages/Products"))
const Services = React.lazy(() => import("../pages/Services"))
const Suppliers = React.lazy(() => import("../pages/Suppliers"))
const Employees = React.lazy(() => import("../pages/Employees"))
const Logistics = React.lazy(() => import("../pages/Logistics"))
const Finance = React.lazy(() => import("../pages/Finance"))
const Purchasing = React.lazy(() => import("../pages/Purchasing"))
const PayrollPage = React.lazy(() => import("../pages/PayrollPage"))
const Projects = React.lazy(() => import("../pages/Projects"))
const Reports = React.lazy(() => import("../pages/Reports"))
const Accounting = React.lazy(() => import("../pages/Accounting"))
const AccountingPortal = React.lazy(() => import("../pages/AccountingPortal"))
const Treasury = React.lazy(() => import("../pages/Treasury"))
const CRMSales = React.lazy(() => import("../pages/CRMSales"))
const AssetManagement = React.lazy(() => import("../pages/AssetManagement"))
const Production = React.lazy(() => import("../pages/Production"))
const SupportCenter = React.lazy(() => import("../pages/SupportCenter"))
const Marketing = React.lazy(() => import("../pages/Marketing"))
const StrategicPlanning = React.lazy(() => import("../pages/StrategicPlanning"))
const BusinessIntelligence = React.lazy(() => import("../pages/BusinessIntelligence"))
const Training = React.lazy(() => import("../pages/Training"))
const Maintenance = React.lazy(() => import("../pages/Maintenance"))
const POSModule = React.lazy(() => import("../pages/POSModule"))
const AuditCompliance = React.lazy(() => import("../pages/AuditCompliance"))
const Expenses = React.lazy(() => import("../pages/Expenses"))
const QualityStandards = React.lazy(() => import("../pages/QualityStandards"))
const LegalContracts = React.lazy(() => import("../pages/LegalContracts"))
const HSEModule = React.lazy(() => import("../pages/HSEModule"))
const DocumentCenter = React.lazy(() => import("../pages/DocumentCenter"))
const InventoryControl = React.lazy(() => import("../pages/InventoryControl"))
const Communications = React.lazy(() => import("../pages/Communications"))
const RiskManagement = React.lazy(() => import("../pages/RiskManagement"))
const Settings = React.lazy(() => import("../pages/Settings"))
const BudgetPlanning = React.lazy(() => import("../pages/BudgetPlanning"))
const Recruitment = React.lazy(() => import("../pages/Recruitment"))
const InternationalExpansion = React.lazy(() => import("../pages/InternationalExpansion"))
const FleetManagement = React.lazy(() => import("../pages/FleetManagement"))
const WorkflowApprovals = React.lazy(() => import("../pages/WorkflowApprovals"))
const PerformanceKPIs = React.lazy(() => import("../pages/PerformanceKPIs"))
const AgendaCalendar = React.lazy(() => import("../pages/AgendaCalendar"))
const Fiscal = React.lazy(() => import("../pages/Fiscal"))
const Dashboard = React.lazy(() => import("../pages/Dashboard"))
const TicketsPage = React.lazy(() => import("../pages/TicketsPage"))
const HRAdvanced = React.lazy(() => import("../pages/HRAdvanced"))

import { authStore } from "../auth/authStore"
import { Layout } from "./layout"

import ProtectedRoute from "../auth/ProtectedRoute"


const SuspenseLoader = () => (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent"></div>
            <p className="text-sm text-[var(--text-muted)] animate-pulse">A carregar módulo...</p>
        </div>
    </div>
);

const LayoutRoot = () => {
    return (
        <Router>
            <Suspense fallback={<SuspenseLoader />}>
            <Routes>
                {/* Public routes - redirect to dashboard if already logged in */}
                <Route path="/" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
                <Route path="/login" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
                <Route path="/register" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
                <Route path="/waitlist" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <WaitlistPage />} />
                <Route path="/verify-email" element={authStore.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <VerifyEmailPage />} />
                <Route path="/info/:slug" element={<PublicInfoPage />} />
                <Route path="/agt" element={<AGTPublicPortal />} />

                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout><Invoices /></Layout>} path="/invoices" />
                    <Route element={<Layout><Clients /></Layout>} path="/clients" />
                    <Route element={<Layout><Products /></Layout>} path="/products" />
                    <Route element={<Layout><Services /></Layout>} path="/services" />
                    <Route element={<Layout><Suppliers /></Layout>} path="/suppliers" />

                    <Route element={<Layout><Employees /></Layout>} path="/hr" />
                    <Route element={<Layout><Logistics /></Layout>} path="/logistics" />
                    <Route element={<Layout><Finance /></Layout>} path="/finance" />
                    <Route element={<Layout><Purchasing /></Layout>} path="/purchasing" />
                    <Route element={<Layout><PayrollPage /></Layout>} path="/payroll" />
                    <Route element={<Layout><Projects /></Layout>} path="/projects" />
                    <Route element={<Layout><Reports /></Layout>} path="/reports" />                    <Route element={<Layout><Accounting /></Layout>} path="/accounting" />
                    <Route element={<Layout><AccountingPortal /></Layout>} path="/accounting-portal" />
                    <Route element={<Layout><Treasury /></Layout>} path="/treasury" />
                    <Route element={<Layout><CRMSales /></Layout>} path="/crm-sales" />
                    <Route element={<Layout><AssetManagement /></Layout>} path="/assets" />
                    <Route element={<Layout><Production /></Layout>} path="/production" />
                    <Route element={<Layout><SupportCenter /></Layout>} path="/support" />
                    <Route element={<Layout><Marketing /></Layout>} path="/marketing" />
                    <Route element={<Layout><StrategicPlanning /></Layout>} path="/strategy" />
                    <Route element={<Layout><BusinessIntelligence /></Layout>} path="/analytics" />
                    <Route element={<Layout><Training /></Layout>} path="/academy" />
                    <Route element={<Layout><Maintenance /></Layout>} path="/maintenance" />
                    <Route element={<Layout><POSModule /></Layout>} path="/pos" />
                    <Route element={<POSConsole />} path="/pos/console/:terminalId" />
                    <Route element={<Layout><AuditCompliance /></Layout>} path="/compliance" />
                    <Route element={<Layout><Expenses /></Layout>} path="/expenses" />
                    <Route element={<Layout><QualityStandards /></Layout>} path="/quality" />
                    <Route element={<Layout><LegalContracts /></Layout>} path="/legal" />
                    <Route element={<Layout><HSEModule /></Layout>} path="/hse" />
                    <Route element={<Layout><DocumentCenter /></Layout>} path="/documents" />
                    <Route element={<Layout><InventoryControl /></Layout>} path="/inventory" />
                    <Route element={<Layout><Communications /></Layout>} path="/communications" />
                    <Route element={<Layout><Settings /></Layout>} path="/settings" />                    <Route element={<Layout><RiskManagement /></Layout>} path="/risks" />
                    <Route element={<Layout><BudgetPlanning /></Layout>} path="/budget" />
                    <Route element={<Layout><Recruitment /></Layout>} path="/recruitment" />
                    <Route element={<Layout><HRAdvanced /></Layout>} path="/hr-advanced" />
                    <Route element={<Layout><InternationalExpansion /></Layout>} path="/expansion" />
                    <Route element={<Layout><FleetManagement /></Layout>} path="/fleet" />
                    <Route element={<Layout><WorkflowApprovals /></Layout>} path="/approvals" />
                    <Route element={<Layout><PerformanceKPIs /></Layout>} path="/kpis" />
                    <Route element={<Layout><AgendaCalendar /></Layout>} path="/calendar" />
                    <Route element={<Layout><Fiscal /></Layout>} path="/fiscal" />
                    <Route element={<Layout><Dashboard /></Layout>} path="/dashboard" />
                    <Route element={<Layout><TicketsPage /></Layout>} path="/tickets" />                </Route>


                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            
                    <Route element={<Layout><AdminUsers /></Layout>} path="/admin-users" />
                    <Route element={<Layout><RolesPermissions /></Layout>} path="/roles" />
                    <Route element={<Layout><AuditLogs /></Layout>} path="/audit-logs" />
                    <Route element={<Layout><Subscription /></Layout>} path="/subscription" />
                    <Route element={<Layout><SubscriptionClient /></Layout>} path="/my-subscription" />

                </Routes>
            </Suspense>
        </Router>
    )
}

export {LayoutRoot}