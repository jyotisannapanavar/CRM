import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { leadApi, statusApi } from "@/services/api";
import type { Lead } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

export default function ProspectList() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [interestStatusId, setInterestStatusId] = useState<number | null>(null);

  useEffect(() => {
    statusApi.list().then((statuses) => {
      const status = statuses.find(s => s.status_name === "Interest");
      if (status) {
        setInterestStatusId(status.id);
      }
    });
  }, []);

  const fetchItems = useCallback(() => {
    if (interestStatusId === null) return;

    setLoading(true);
    const params: Record<string, string | number> = { status_id: interestStatusId };
    if (search) params.search = search;

    leadApi.list(params).then((res) => {
      setItems(Array.isArray(res) ? res : res.data || []);
    }).finally(() => setLoading(false));
  }, [search, interestStatusId]);

  useEffect(() => {
    if (interestStatusId !== null) {
      fetchItems();
    }
  }, [fetchItems, interestStatusId]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({ title: "Delete Lead?", text: "This action cannot be undone.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc3545", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      await leadApi.delete(id);
      Swal.fire("Deleted!", "Lead has been deleted.", "success");
      fetchItems();
    }
  };

  const getStatusColor = (statusName: string = '') => {
    const name = statusName.toLowerCase();
    if (name.includes('new')) return 'primary';
    if (name.includes('contact')) return 'warning';
    if (name.includes('qualif')) return 'success';
    if (name.includes('propos')) return 'info';
    if (name.includes('won') || name.includes('convert')) return 'success';
    if (name.includes('lost')) return 'danger';
    return 'secondary';
  };

  return (
    <div>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
          <li className="breadcrumb-item active">Prospects (Interest Leads)</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Prospects</h2>
        {/* Add button removed as requested */}
      </div>
      <div className="row g-2 mb-3">
        <div className="col-md-4">
          <input type="text" className="form-control" placeholder="Search prospects..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5 text-muted">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-3">No prospects found (Interest Leads).</p>
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
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="fw-medium">
                    <Link to={`/leads/${item.id}/edit`} className="text-decoration-none text-dark">
                      {item.salutation} {item.first_name} {item.last_name}
                    </Link>
                  </td>
                  <td>
                    {item.status ? (
                      <span className={`badge bg-${getStatusColor(item.status.status_name)}`}>{item.status.status_name}</span>
                    ) : "-"}
                  </td>
                  <td>{item.source?.name || "-"}</td>
                  <td>{item.company_name || "-"}</td>
                  <td>{item.email || "-"}</td>
                  <td>{item.mobile_no || "-"}</td>
                  <td className="text-end">
                    <div className="btn-group">
                      <Link to={`/leads/${item.id}/edit`} className="btn btn-sm btn-outline-secondary" title="Edit">
                        <Pencil size={14} />
                      </Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item.id)} title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
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
