import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { opportunityApi, statusApi, opportunityTypeApi, opportunityStageApi } from "@/services/api";
import type { Opportunity, Status, OpportunityType, OpportunityStage } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function OpportunityList() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const [statuses, setStatuses] = useState<Status[]>([]);
  const [types, setTypes] = useState<OpportunityType[]>([]);
  const [stages, setStages] = useState<OpportunityStage[]>([]);

  useEffect(() => {
    Promise.all([
      statusApi.list(),
      opportunityTypeApi.list(),
      opportunityStageApi.list(),
    ]).then(([statusRes, typeRes, stageRes]) => {
      setStatuses(Array.isArray(statusRes) ? statusRes : []);
      setTypes(Array.isArray(typeRes) ? typeRes : []);
      setStages(Array.isArray(stageRes) ? stageRes : []);
    });
  }, []);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status_id = statusFilter;
    if (typeFilter) params.opportunity_type_id = typeFilter;
    if (stageFilter) params.opportunity_stage_id = stageFilter;
    opportunityApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter, typeFilter, stageFilter]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Opportunity?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await opportunityApi.delete(id);
      Swal.fire("Deleted!", "Opportunity has been deleted.", "success");
      fetchItems();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Opportunities</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Opportunities</h2>
        <Link to="/opportunities/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Opportunity</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-3">
          <input type="text" className="form-control" placeholder="Search opportunities..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">All Types</option>
            {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
            <option value="">All Stages</option>
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No opportunities found.</p>
          <Link to="/opportunities/new" className="btn btn-primary">Create a new Opportunity</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Opportunity From</th>
                <th>Party</th>
                <th>Status</th>
                <th>Type</th>
                <th>Probability</th>
                <th>Expected Close</th>
                <th className="text-end">Amount</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const partyName = (() => {
                  if (item.opportunity_from === 'lead' && item.lead) {
                    return `${item.lead.first_name} ${item.lead.last_name || ''}`.trim();
                  }
                  if (item.opportunity_from === 'customer') {
                    if (item.customer) return item.customer.name;
                    if (item.contact) return item.contact.full_name || `${item.contact.first_name} ${item.contact.last_name}`.trim();
                  }
                  return item.party_name || "—";
                })();

                const stageName = item.opportunity_type?.name || stages.find(s => s.id === item.opportunity_type_id)?.name || "—";

                return (
                  <tr key={item.id}>
                    <td><Link to={`/opportunities/${item.id}/edit`} className="text-decoration-none fw-bold">{item.naming_series || item.id}</Link></td>
                    <td>
                      <div className="fw-medium text-capitalize">{item.opportunity_from || "—"}</div>
                    </td>
                    <td>
                      <div className="fw-medium">{partyName}</div>
                      {item.company_name && <div className="text-muted small">{item.company_name}</div>}
                    </td>
                    <td>
                      {item.status ? (
                        <span className="badge bg-secondary">{item.status.status_name}</span>
                      ) : "—"}
                    </td>
                    <td>{stageName}</td>
                    <td>{item.probability !== null ? `${item.probability}%` : "—"}</td>
                    <td>{item.expected_closing || "—"}</td>
                    <td className="text-end">{item.currency || "$"}{item.opportunity_amount?.toLocaleString() || "0"}</td>
                    <td className="text-end">
                      <Link to={`/opportunities/${item.id}/edit`} className="btn btn-sm btn-icon btn-outline-primary me-1" title="Edit"><Pencil size={14} /></Link>
                      <button className="btn btn-sm btn-icon btn-outline-danger" title="Delete" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
