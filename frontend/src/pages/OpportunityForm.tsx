import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { opportunityApi, statusApi, sourceApi, industryTypeApi, opportunityTypeApi, opportunityStageApi, userApi, User } from "@/services/api";
import type { Status, Source, IndustryType, OpportunityType, OpportunityStage } from "@/types";
import Swal from "sweetalert2";

const OPPORTUNITY_FROM_OPTIONS = ["Lead", "Customer", "Prospect"];
const EMPLOYEE_RANGES = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, string | number | null>>({});
  
  // Dropdown options
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [industries, setIndustries] = useState<IndustryType[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>([]);
  const [opportunityStages, setOpportunityStages] = useState<OpportunityStage[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      sourceApi.list(),
      industryTypeApi.list(),
      opportunityTypeApi.list(),
      opportunityStageApi.list(),
      userApi.list(),
    ]).then(([statusRes, sourceRes, industryRes, typeRes, stageRes, usersRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setSources(Array.isArray(sourceRes) ? sourceRes : []);
      setIndustries(Array.isArray(industryRes) ? industryRes : []);
      setOpportunityTypes(Array.isArray(typeRes) ? typeRes : []);
      setOpportunityStages(Array.isArray(stageRes) ? stageRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      opportunityApi.get(Number(id)).then((item) => {
        setForm({
          naming_series: item.naming_series || "",
          opportunity_type_id: item.opportunity_type_id || "",
          opportunity_stage_id: item.opportunity_stage_id || "",
          opportunity_from: item.opportunity_from || "",
          source_id: item.source_id || "",
          expected_closing: item.expected_closing ? item.expected_closing.split('T')[0] : "",
          party_name: item.party_name || "",
          opportunity_owner: item.opportunity_owner || "",
          probability: item.probability?.toString() || "",
          status_id: item.status_id || "",
          company_name: item.company_name || "",
          industry_id: item.industry_id || "",
          no_of_employees: item.no_of_employees || "",
          city: item.city || "",
          state: item.state || "",
          country: item.country || "",
          annual_revenue: item.annual_revenue?.toString() || "",
          market_segment: item.market_segment || "",
          currency: item.currency || "USD",
          opportunity_amount: item.opportunity_amount?.toString() || "",
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: string | number) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Convert empty strings to null for foreign keys
      ['opportunity_type_id', 'opportunity_stage_id', 'source_id', 'opportunity_owner', 'status_id', 'industry_id'].forEach(key => {
        if (payload[key] === '' || payload[key] === null) {
          payload[key] = null;
        }
      });
      // Convert empty date to null
      if (payload.expected_closing === '') {
        payload.expected_closing = null;
      }

      if (isEdit) {
        await opportunityApi.update(Number(id), payload);
        Swal.fire("Updated!", "Opportunity has been updated.", "success");
      } else {
        await opportunityApi.create(payload);
        Swal.fire("Created!", "Opportunity has been created.", "success");
      }
      navigate("/opportunities");
    } catch {
      Swal.fire("Error", "Failed to save opportunity.", "error");
    }
  };

  if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/opportunities">Opportunities</Link></li>
          <li className="breadcrumb-item active">{isEdit ? "Edit" : "New"}</li>
        </ol>
      </nav>
      <h2 className="mb-4">{isEdit ? "Edit Opportunity" : "New Opportunity"}</h2>
      <form onSubmit={handleSubmit}>
        {/* Opportunity Details */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Opportunity Details</h5>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Series</label>
              <input className="form-control" value={form.naming_series?.toString() || ""} onChange={(e) => setField("naming_series", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Opportunity Type</label>
              <select className="form-select" value={form.opportunity_type_id?.toString() || ""} onChange={(e) => setField("opportunity_type_id", e.target.value)}>
                <option value="">Select Type</option>
                {opportunityTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Opportunity Stage</label>
              <select className="form-select" value={form.opportunity_stage_id?.toString() || ""} onChange={(e) => setField("opportunity_stage_id", e.target.value)}>
                <option value="">Select Stage</option>
                {opportunityStages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status_id?.toString() || ""} onChange={(e) => setField("status_id", e.target.value)}>
                <option value="">Select Status</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Opportunity From</label>
              <select className="form-select" value={form.opportunity_from?.toString() || ""} onChange={(e) => setField("opportunity_from", e.target.value)}>
                <option value="">Select</option>
                {OPPORTUNITY_FROM_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source_id?.toString() || ""} onChange={(e) => setField("source_id", e.target.value)}>
                <option value="">Select Source</option>
                {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Party Name</label>
              <input className="form-control" value={form.party_name?.toString() || ""} onChange={(e) => setField("party_name", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Owner</label>
              <select className="form-select" value={form.opportunity_owner?.toString() || ""} onChange={(e) => setField("opportunity_owner", e.target.value)}>
                <option value="">Select Owner</option>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Expected Closing</label>
              <input type="date" className="form-control" value={form.expected_closing?.toString() || ""} onChange={(e) => setField("expected_closing", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Probability (%)</label>
              <input type="number" min="0" max="100" className="form-control" value={form.probability?.toString() || ""} onChange={(e) => setField("probability", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Company Information</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Company Name</label>
              <input className="form-control" value={form.company_name?.toString() || ""} onChange={(e) => setField("company_name", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Industry</label>
              <select className="form-select" value={form.industry_id?.toString() || ""} onChange={(e) => setField("industry_id", e.target.value)}>
                <option value="">Select Industry</option>
                {industries.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">No of Employees</label>
              <select className="form-select" value={form.no_of_employees?.toString() || ""} onChange={(e) => setField("no_of_employees", e.target.value)}>
                <option value="">Select</option>
                {EMPLOYEE_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Market Segment</label>
              <input className="form-control" value={form.market_segment?.toString() || ""} onChange={(e) => setField("market_segment", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Location</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">City</label>
              <input className="form-control" value={form.city?.toString() || ""} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">State</label>
              <input className="form-control" value={form.state?.toString() || ""} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Country</label>
              <input className="form-control" value={form.country?.toString() || ""} onChange={(e) => setField("country", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Financial</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Annual Revenue</label>
              <input type="number" className="form-control" value={form.annual_revenue?.toString() || ""} onChange={(e) => setField("annual_revenue", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Currency</label>
              <input className="form-control" value={form.currency?.toString() || "USD"} onChange={(e) => setField("currency", e.target.value)} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Opportunity Amount</label>
              <input type="number" className="form-control" value={form.opportunity_amount?.toString() || ""} onChange={(e) => setField("opportunity_amount", e.target.value)} />
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">Save</button>
          <Link to="/opportunities" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
