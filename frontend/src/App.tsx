import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import LeadList from "./pages/LeadList";
import LeadForm from "./pages/LeadForm";
import OpportunityList from "./pages/OpportunityList";
import OpportunityForm from "./pages/OpportunityForm";
import ProspectList from "./pages/ProspectList";
import ProspectForm from "./pages/ProspectForm";
import CampaignList from "./pages/CampaignList";
import CampaignForm from "./pages/CampaignForm";
import SourceList from "./pages/SourceList";
import SourceForm from "./pages/SourceForm";

import AppointmentList from "./pages/AppointmentList";
import AppointmentForm from "./pages/AppointmentForm";
import SettingsPage from "./pages/SettingsPage";
import StatusList from "./pages/StatusList";
import RequestTypeList from "./pages/RequestTypeList";
import IndustryTypeList from "./pages/IndustryTypeList";
import OpportunityStageList from "./pages/OpportunityStageList";
import OpportunityTypeList from "./pages/OpportunityTypeList";
import OpportunityLostReasonList from "./pages/OpportunityLostReasonList";
import TerritoryList from "./pages/TerritoryList";
import ContactList from "./pages/ContactList";
import ContactForm from "./pages/ContactForm";
import CustomerList from "./pages/CustomerList";
import CustomerForm from "./pages/CustomerForm";
import ProductCategoryList from "./pages/ProductCategoryList";
import ProductList from "./pages/ProductList";
import ProductForm from "./pages/ProductForm";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/new" element={<CustomerForm />} />
        <Route path="/customers/:id/edit" element={<CustomerForm />} />
        <Route path="/leads" element={<LeadList />} />
        <Route path="/leads/new" element={<LeadForm />} />
        <Route path="/leads/:id/edit" element={<LeadForm />} />
        <Route path="/opportunities" element={<OpportunityList />} />
        <Route path="/opportunities/new" element={<OpportunityForm />} />
        <Route path="/opportunities/:id/edit" element={<OpportunityForm />} />
        <Route path="/prospects" element={<ProspectList />} />
        <Route path="/prospects/new" element={<ProspectForm />} />
        <Route path="/prospects/:id/edit" element={<ProspectForm />} />
        <Route path="/campaigns" element={<CampaignList />} />
        <Route path="/campaigns/new" element={<CampaignForm />} />
        <Route path="/campaigns/:id/edit" element={<CampaignForm />} />
        <Route path="/sources" element={<SourceList />} />
        <Route path="/sources/new" element={<SourceForm />} />
        <Route path="/sources/:id/edit" element={<SourceForm />} />

        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointments/new" element={<AppointmentForm />} />
        <Route path="/appointments/:id/edit" element={<AppointmentForm />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/statuses" element={<StatusList />} />
        <Route path="/request-types" element={<RequestTypeList />} />
        <Route path="/industry-types" element={<IndustryTypeList />} />
        <Route path="/opportunity-stages" element={<OpportunityStageList />} />
        <Route path="/opportunity-types" element={<OpportunityTypeList />} />
        <Route path="/opportunity-lost-reasons" element={<OpportunityLostReasonList />} />
        <Route path="/territories" element={<TerritoryList />} />
        <Route path="/product-categories" element={<ProductCategoryList />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/contacts" element={<ContactList />} />
        <Route path="/contacts/new" element={<ContactForm />} />
        <Route path="/contacts/:id/edit" element={<ContactForm />} />
      </Route>
    </Routes>
  );
}
