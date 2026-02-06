import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LeadsPage from "./pages/LeadsPage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import ProspectsPage from "./pages/ProspectsPage";
import CampaignsPage from "./pages/CampaignsPage";
import ContractsPage from "./pages/ContractsPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/opportunities" element={<OpportunitiesPage />} />
        <Route path="/prospects" element={<ProspectsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/contracts" element={<ContractsPage />} />
        <Route path="/appointments" element={<AppointmentsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
