import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  opportunityApi, statusApi, sourceApi, industryTypeApi,
  opportunityTypeApi, opportunityStageApi, userApi, leadApi,
  territoryApi, prospectApi, contactApi,
  User
} from "@/services/api";
import type { Lead, Status, Source, IndustryType, OpportunityType, OpportunityStage, Territory, Prospect, Contact } from "@/types";
import Swal from "sweetalert2";

const OPPORTUNITY_FROM_OPTIONS = ["lead", "customer", "prospect"];

export default function OpportunityForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({
    naming_series: "CRM-OPP-.YYYY.-",
    opportunity_from: "lead",
    currency: "INR",
    probability: 0,
    with_items: false,
    items: []
  });

  // Dropdown options
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      sourceApi.list(),
      opportunityTypeApi.list(),
      userApi.list(),
      leadApi.list(),
      territoryApi.list(),
      prospectApi.list(),
      contactApi.list(),
    ]).then(([statusRes, sourceRes, typeRes, usersRes, leadsRes, territoryRes, prospectsRes, contactsRes]) => {
      console.log("Contacts Response:", contactsRes); // DEBUG
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setSources(Array.isArray(sourceRes) ? sourceRes : []);
      setOpportunityTypes(Array.isArray(typeRes) ? typeRes : []);
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setLeads(Array.isArray(leadsRes) ? leadsRes : (leadsRes as any)?.data || []);
      setTerritories(Array.isArray(territoryRes) ? territoryRes : []);
      setProspects(Array.isArray(prospectsRes) ? prospectsRes : (prospectsRes as any)?.data || []);
      setContacts(Array.isArray(contactsRes) ? contactsRes : (contactsRes as any)?.data || []);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      opportunityApi.get(Number(id)).then((item) => {
        setForm({
          ...item,
          expected_closing: item.expected_closing ? item.expected_closing.split('T')[0] : "",
          next_contact_date: item.next_contact_date ? item.next_contact_date.split('T')[0] : "",
          with_items: Boolean(item.with_items),
        });
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const setField = (key: string, value: any) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // Sanitize payload if needed
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

  const addItemRow = () => {
    const newItems = [...(form.items || [])];
    newItems.push({ item_code: "", qty: 1, rate: 0, amount: 0 });
    setField("items", newItems);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...(form.items || [])];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'qty' || field === 'rate') {
      newItems[index].amount = newItems[index].qty * newItems[index].rate;
    }
    setField("items", newItems);
  };

  const removeItem = (index: number) => {
    const newItems = [...(form.items || [])];
    newItems.splice(index, 1);
    setField("items", newItems);
  }

  const handleContactChange = (contactId: string) => {
    setField("customer_contact_id", contactId);
  };

  // if (loading) return <div className="text-center py-5 text-muted">Loading...</div>;

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item"><Link to="/opportunities">Opportunity</Link></li>
          <li className="breadcrumb-item active">{isEdit ? form.naming_series || "Edit" : "New"}</li>
        </ol>
      </nav>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEdit ? "Edit Opportunity" : "New Opportunity"} <span className="text-danger fs-6">{isEdit ? "" : "• Not Saved"}</span></h2>
        <button type="submit" onClick={handleSubmit} className="btn btn-primary">Save</button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Sales Section */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Sales</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Series <span className="text-danger">*</span></label>
              <input className="form-control" value={form.naming_series || ""} onChange={(e) => setField("naming_series", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Opportunity Type</label>
              <select className="form-select" value={form.opportunity_type_id || ""} onChange={(e) => setField("opportunity_type_id", e.target.value)}>
                <option value="">Select Type</option>
                {opportunityTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Opportunity From</label>
              <select className="form-select" value={form.opportunity_from || "lead"} onChange={(e) => {
                setField("opportunity_from", e.target.value);
                setField("lead_id", "");
                setField("customer_id", "");
                setField("prospect_id", "");
                setField("customer_contact_id", "");
              }}>
                <option value="lead">Lead</option>
                <option value="customer">Customer</option>
                {/* <option value="prospect">Prospect</option> */}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Status <span className="text-danger">*</span></label>
              <select className="form-select" value={form.status_id || ""} onChange={(e) => setField("status_id", e.target.value)} required>
                <option value="">Select Status</option>
                {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
              </select>
            </div>

            {form.opportunity_from === "lead" && (
              <div className="col-md-6">
                <label className="form-label">Lead <span className="text-danger">*</span></label>
                <select className="form-select" value={form.lead_id || ""} onChange={(e) => setField("lead_id", e.target.value)}>
                  <option value="">Select Lead</option>
                  {leads.map((l) => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                </select>
              </div>
            )}
            {form.opportunity_from === "prospect" && (
              <div className="col-md-6">
                <label className="form-label">Prospect <span className="text-danger">*</span></label>
                <select className="form-select" value={form.prospect_id || ""} onChange={(e) => setField("prospect_id", e.target.value)}>
                  <option value="">Select Prospect</option>
                  {prospects.map((p) => <option key={p.id} value={p.id}>{p.company_name}</option>)}
                </select>
              </div>
            )}
            {form.opportunity_from === "customer" && (
              <div className="col-md-6">
                <label className="form-label">Customer Contact <span className="text-danger">*</span></label>
                <select className="form-select" value={form.customer_contact_id || ""} onChange={(e) => handleContactChange(e.target.value)}>
                  <option value="">Select Contact</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.company_name})</option>)}
                </select>
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label">Expected Closing Date</label>
              <input type="date" className="form-control" value={form.expected_closing || ""} onChange={(e) => setField("expected_closing", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Source</label>
              <select className="form-select" value={form.source_id || ""} onChange={(e) => setField("source_id", e.target.value)}>
                <option value="">Select Source</option>
                {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Currency</label>
              <select className="form-select" value={form.currency || "INR"} onChange={(e) => setField("currency", e.target.value)}>
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Opportunity Amount</label>
              <input type="number" className="form-control" value={form.opportunity_amount || ""} onChange={(e) => setField("opportunity_amount", e.target.value)} />
            </div>

            <div className="col-md-6">
              <label className="form-label">Probability (%)</label>
              <input type="number" className="form-control" value={form.probability || ""} onChange={(e) => setField("probability", e.target.value)} />
            </div>
            <div className="col-md-6">
              {/* Spacer */}
            </div>

            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="withItems" checked={Boolean(form.with_items)} onChange={(e) => setField("with_items", e.target.checked)} />
                <label className="form-check-label" htmlFor="withItems">With Items</label>
              </div>
            </div>
          </div>
        </div>

        {/* Items Section */}
        {Boolean(form.with_items) && (
          <div className="form-container mb-4">
            <h5 className="mb-3 border-bottom pb-2">Items</h5>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Rate</th>
                    <th>Amount</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {form.items?.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td><input className="form-control form-control-sm" value={item.item_code} onChange={(e) => updateItem(index, 'item_code', e.target.value)} /></td>
                      <td><input className="form-control form-control-sm" value={item.item_name || ""} onChange={(e) => updateItem(index, 'item_name', e.target.value)} /></td>
                      <td><input type="number" className="form-control form-control-sm" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} /></td>
                      <td><input type="number" className="form-control form-control-sm" value={item.rate} onChange={(e) => updateItem(index, 'rate', e.target.value)} /></td>
                      <td><input type="number" className="form-control form-control-sm" value={item.amount} readOnly /></td>
                      <td><button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(index)}>X</button></td>
                    </tr>
                  ))}
                  {(!form.items || form.items.length === 0) && (
                    <tr>
                      <td colSpan={7} className="text-center text-muted p-4">
                        No Data. <button type="button" className="btn btn-sm btn-outline-primary ms-2" onClick={addItemRow}>Add Row</button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="mt-2">
                <button type="button" className="btn btn-sm btn-secondary" onClick={addItemRow}>Add Row</button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Info Section */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Contact Info</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Contact Person</label>
              <input className="form-control" value={form.contact_person || ""} onChange={(e) => setField("contact_person", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Email</label>
              <input type="email" className="form-control" value={form.contact_email || ""} onChange={(e) => setField("contact_email", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Contact Mobile No</label>
              <input type="tel" className="form-control" value={form.contact_mobile || ""} onChange={(e) => setField("contact_mobile", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Territory</label>
              <select className="form-select" value={form.territory_id || ""} onChange={(e) => setField("territory_id", e.target.value)}>
                <option value="">All Territories</option>
                {territories.map((t) => <option key={t.id} value={t.id}>{t.territory_name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Follow Up Section */}
        <div className="form-container mb-4">
          <h5 className="mb-3 border-bottom pb-2">Follow Up</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Next Contact By</label>
              <select className="form-select" value={form.next_contact_by || ""} onChange={(e) => setField("next_contact_by", e.target.value)}>
                <option value="">Select User</option>
                {users.map((u) => <option key={u.id} value={u.name}>{u.name}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Next Contact Date</label>
              <input type="date" className="form-control" value={form.next_contact_date || ""} onChange={(e) => setField("next_contact_date", e.target.value)} />
            </div>
            <div className="col-12">
              <label className="form-label">To Discuss</label>
              <textarea className="form-control" rows={3} value={form.to_discuss || ""} onChange={(e) => setField("to_discuss", e.target.value)}></textarea>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
