import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/user/Home";
import Riding from "@/pages/user/Riding";
import Orders from "@/pages/user/Orders";
import OrderDetail from "@/pages/user/OrderDetail";
import Profile from "@/pages/user/Profile";
import Complaints from "@/pages/user/Complaints";
import ComplaintDetail from "@/pages/user/ComplaintDetail";

import FinanceDashboard from "@/pages/finance/Dashboard";
import Revenue from "@/pages/finance/Revenue";
import Deposit from "@/pages/finance/Deposit";
import Cost from "@/pages/finance/Cost";
import Reports from "@/pages/finance/Reports";

import AdminDashboard from "@/pages/admin/Dashboard";
import Pricing from "@/pages/admin/Pricing";
import CreditConfig from "@/pages/admin/CreditConfig";
import DispatchConfig from "@/pages/admin/DispatchConfig";
import Users from "@/pages/admin/Users";

import OperatorDashboard from "@/pages/operator/Dashboard";
import OperatorBatteryTasks from "@/pages/operator/BatteryTasks";
import OperatorFaultReports from "@/pages/operator/FaultReports";
import OperatorMaintenanceRecords from "@/pages/operator/MaintenanceRecords";
import OperatorBikes from "@/pages/operator/Bikes";

import DispatcherDashboard from "@/pages/dispatcher/Dashboard";
import DispatcherHeatmap from "@/pages/dispatcher/Heatmap";
import DispatcherSuggestions from "@/pages/dispatcher/Suggestions";
import DispatcherTasks from "@/pages/dispatcher/Tasks";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/riding" element={<Riding />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-detail/:orderId" element={<OrderDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/complaint-detail/:id" element={<ComplaintDetail />} />

        <Route path="/finance" element={<FinanceDashboard />} />
        <Route path="/finance/dashboard" element={<FinanceDashboard />} />
        <Route path="/finance/revenue" element={<Revenue />} />
        <Route path="/finance/deposit" element={<Deposit />} />
        <Route path="/finance/cost" element={<Cost />} />
        <Route path="/finance/reports" element={<Reports />} />

        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pricing" element={<Pricing />} />
        <Route path="/admin/credit-config" element={<CreditConfig />} />
        <Route path="/admin/dispatch-config" element={<DispatchConfig />} />
        <Route path="/admin/users" element={<Users />} />

        <Route path="/operator" element={<OperatorDashboard />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        <Route path="/operator/battery-tasks" element={<OperatorBatteryTasks />} />
        <Route path="/operator/fault-reports" element={<OperatorFaultReports />} />
        <Route path="/operator/maintenance-records" element={<OperatorMaintenanceRecords />} />
        <Route path="/operator/bikes" element={<OperatorBikes />} />

        <Route path="/dispatcher" element={<DispatcherDashboard />} />
        <Route path="/dispatcher/dashboard" element={<DispatcherDashboard />} />
        <Route path="/dispatcher/heatmap" element={<DispatcherHeatmap />} />
        <Route path="/dispatcher/suggestions" element={<DispatcherSuggestions />} />
        <Route path="/dispatcher/tasks" element={<DispatcherTasks />} />

        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
