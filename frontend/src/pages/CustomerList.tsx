import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/services/api";
import type { Customer } from "@/types";
import { Plus, Trash2, Edit2, Eye, Search, X } from "lucide-react";
import Swal from "sweetalert2";

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchCustomers = useCallback(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (search) params.search = search;

        customerApi.list(params).then((res) => {
            setCustomers(Array.isArray(res) ? res : res.data || []);
        }).finally(() => setLoading(false));
    }, [search]);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const viewCustomer = async (customer: Customer) => {
        await Swal.fire({
            title: customer.name,
            width: 650,
            html: `
                <div style="text-align:left;">
                    <table class="table table-borderless mb-0" style="font-size:0.9rem;">
                        <tr><td class="fw-semibold" style="width:160px;">Customer Type</td><td>${customer.customer_type || "—"}</td></tr>
                        <tr><td class="fw-semibold">Customer Group</td><td>${customer.customer_group?.name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Territory</td><td>${customer.territory?.territory_name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Email</td><td>${customer.email || "—"}</td></tr>
                        <tr><td class="fw-semibold">Phone</td><td>${customer.phone || "—"}</td></tr>
                        <tr><td class="fw-semibold">Website</td><td>${customer.website || "—"}</td></tr>
                    </table>
                </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#6c757d",
        });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Customer?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete it!",
        });
        if (result.isConfirmed) {
            await customerApi.delete(id);
            Swal.fire("Deleted!", "Customer has been deleted.", "success");
            fetchCustomers();
        }
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
                    <li className="breadcrumb-item active">Customers</li>
                </ol>
            </nav>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Customers</h2>
                <Link to="/customers/new" className="btn btn-primary"><Plus size={16} className="me-1" /> New Customer</Link>
            </div>
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search customers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && (
                            <button
                                className="btn btn-link position-absolute top-50 end-0 translate-middle-y text-muted"
                                onClick={() => setSearch("")}
                                style={{ textDecoration: "none" }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5 text-muted">Loading...</div>
            ) : customers.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-3">No customers found.</p>
                    <Link to="/customers/new" className="btn btn-primary">Create a new Customer</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Customer Type</th>
                                <th>Customer Group</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.id}>
                                    <td className="fw-medium">
                                        <Link to={`/customers/${customer.id}/edit`} className="text-decoration-none text-dark">
                                            {customer.name}
                                        </Link>
                                    </td>
                                    <td>{customer.customer_type || "-"}</td>
                                    <td>{customer.customer_group?.name || "-"}</td>
                                    <td>{customer.email || "-"}</td>
                                    <td>{customer.phone || "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-secondary me-1"
                                            onClick={() => viewCustomer(customer)}
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <Link
                                            to={`/customers/${customer.id}/edit`}
                                            className="btn btn-sm btn-outline-primary me-1"
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(customer.id)}
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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
