import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { leadApi, statusApi, sourceApi } from "@/services/api";
import type { Lead, Status, Source } from "@/types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function LeadList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([statusApi.list(), sourceApi.list()])
      .then(([statusRes, sourceRes]) => {
        setStatuses(Array.isArray(statusRes) ? statusRes : []);
        setSources(Array.isArray(sourceRes) ? sourceRes : []);
      });
  }, []);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (statusFilter) params.status_id = statusFilter;
    if (sourceFilter) params.source_id = sourceFilter;
    leadApi.list(params).then((res) => {
      setLeads(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, statusFilter, sourceFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Lead?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await leadApi.delete(id);
      Swal.fire("Deleted!", "Lead has been deleted.", "success");
      fetchLeads();
    }
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Leads</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Leads</h2>
        <Link to="/leads/new" className="btn btn-primary"><Plus size={16} className="me-1" /> Add Lead</Link>
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.status_name}</option>)}
          </select>
        </div>
        <div className="col-md-2">
          <select className="form-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value="">All Sources</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : leads.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No leads found.</p>
          <Link to="/leads/new" className="btn btn-primary">Create a new Lead</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Source</th>
                <th>Company</th>
                <th>Email</th>
                <th>Mobile</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td className="fw-medium">
                    {lead.salutation} {lead.first_name} {lead.middle_name} {lead.last_name}
                  </td>
                  <td>
                    {lead.status ? (
                      <span className="badge bg-secondary">{lead.status.status_name}</span>
                    ) : "-"}
                  </td>
                  <td>{lead.source?.name || "-"}</td>
                  <td>{lead.company_name || "-"}</td>
                  <td>{lead.email || "-"}</td>
                  <td>{lead.mobile_no || "-"}</td>
                  <td className="text-end">
                    <Link to={`/leads/${lead.id}/edit`} className="btn btn-sm btn-outline-secondary me-1" title="Edit"><Pencil size={14} /></Link>
                    <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDelete(lead.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
