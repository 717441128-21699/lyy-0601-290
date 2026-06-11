import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import ProtectedRoute from "@/pages/auth/ProtectedRoute";

import UserHome from "@/pages/user/Home";
import UserRiding from "@/pages/user/Riding";
import UserOrders from "@/pages/user/Orders";
import UserOrderDetail from "@/pages/user/OrderDetail";
import UserProfile from "@/pages/user/Profile";
import UserComplaints from "@/pages/user/Complaints";
import UserComplaintDetail from "@/pages/user/ComplaintDetail";

import FinanceDashboard from "@/pages/finance/Dashboard";
import FinanceRevenue from "@/pages/finance/Revenue";
import FinanceDeposit from "@/pages/finance/Deposit";
import FinanceCost from "@/pages/finance/Cost";
import FinanceReports from "@/pages/finance/Reports";

import AdminDashboard from "@/pages/admin/Dashboard";
import AdminPricing from "@/pages/admin/Pricing";
import AdminCreditConfig from "@/pages/admin/CreditConfig";
import AdminDispatchConfig from "@/pages/admin/DispatchConfig";
import AdminUsers from "@/pages/admin/Users";

import OperatorDashboard from "@/pages/operator/Dashboard";
import OperatorBatteryTasks from "@/pages/operator/BatteryTasks";
import OperatorFaultReports from "@/pages/operator/FaultReports";
import OperatorMaintenanceRecords from "@/pages/operator/MaintenanceRecords";
import OperatorBikes from "@/pages/operator/Bikes";

import DispatcherDashboard from "@/pages/dispatcher/Dashboard";
import DispatcherHeatmap from "@/pages/dispatcher/Heatmap";
import DispatcherSuggestions from "@/pages/dispatcher/Suggestions";
import DispatcherTasks from "@/pages/dispatcher/Tasks";

import NotificationListener from "@/components/NotificationListener";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/user" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserHome />
        </ProtectedRoute>
      } />
      <Route path="/user/riding" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserRiding />
        </ProtectedRoute>
      } />
      <Route path="/user/orders" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserOrders />
        </ProtectedRoute>
      } />
      <Route path="/user/order/:orderId" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserOrderDetail />
        </ProtectedRoute>
      } />
      <Route path="/user/profile" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/user/complaints" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserComplaints />
        </ProtectedRoute>
      } />
      <Route path="/user/complaint/:id" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserComplaintDetail />
        </ProtectedRoute>
      } />
      <Route path="/user/complaint/new" element={
        <ProtectedRoute allowedRoles={['user']}>
          <UserComplaintDetail />
        </ProtectedRoute>
      } />

      <Route path="/operator" element={
        <ProtectedRoute allowedRoles={['operator']}>
          <OperatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/operator/dashboard" element={
        <ProtectedRoute allowedRoles={['operator']}>
          <OperatorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/operator/battery-tasks" element={
        <ProtectedRoute allowedRoles={['operator']}>
          <OperatorBatteryTasks />
        </ProtectedRoute>
      } />
      <Route path="/operator/fault-reports" element={
        <ProtectedRoute allowedRoles={['operator']}>
          <OperatorFaultReports />
        </ProtectedRoute>
      } />
      <Route path="/operator/maintenance-records" element={
        <ProtectedRoute allowedRoles={['operator']}>
          <OperatorMaintenanceRecords />
        </ProtectedRoute>
      } />
      <Route path="/operator/bikes" element={
        <ProtectedRoute allowedRoles={['operator']}>
          <OperatorBikes />
        </ProtectedRoute>
      } />

      <Route path="/dispatcher" element={
        <ProtectedRoute allowedRoles={['dispatcher']}>
          <DispatcherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dispatcher/dashboard" element={
        <ProtectedRoute allowedRoles={['dispatcher']}>
          <DispatcherDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dispatcher/heatmap" element={
        <ProtectedRoute allowedRoles={['dispatcher']}>
          <DispatcherHeatmap />
        </ProtectedRoute>
      } />
      <Route path="/dispatcher/suggestions" element={
        <ProtectedRoute allowedRoles={['dispatcher']}>
          <DispatcherSuggestions />
        </ProtectedRoute>
      } />
      <Route path="/dispatcher/tasks" element={
        <ProtectedRoute allowedRoles={['dispatcher']}>
          <DispatcherTasks />
        </ProtectedRoute>
      } />

      <Route path="/finance" element={
        <ProtectedRoute allowedRoles={['finance']}>
          <FinanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/finance/dashboard" element={
        <ProtectedRoute allowedRoles={['finance']}>
          <FinanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/finance/revenue" element={
        <ProtectedRoute allowedRoles={['finance']}>
          <FinanceRevenue />
        </ProtectedRoute>
      } />
      <Route path="/finance/deposit" element={
        <ProtectedRoute allowedRoles={['finance']}>
          <FinanceDeposit />
        </ProtectedRoute>
      } />
      <Route path="/finance/cost" element={
        <ProtectedRoute allowedRoles={['finance']}>
          <FinanceCost />
        </ProtectedRoute>
      } />
      <Route path="/finance/reports" element={
        <ProtectedRoute allowedRoles={['finance']}>
          <FinanceReports />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin/pricing" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminPricing />
        </ProtectedRoute>
      } />
      <Route path="/admin/credit-config" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminCreditConfig />
        </ProtectedRoute>
      } />
      <Route path="/admin/dispatch-config" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDispatchConfig />
        </ProtectedRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsers />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <NotificationListener />
      <AppRoutes />
    </Router>
  );
}
