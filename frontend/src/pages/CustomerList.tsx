import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { customerApi, customerGroupApi } from "@/services/api";
import type { Customer, CustomerGroup } from "@/types";
import { Plus, Pencil, Trash2, MoreVertical, Eye } from "lucide-react";
import Swal from "sweetalert2";

interface CustomerActionsMenuProps {
    customer: Customer;
    onDelete: (id: number) => void;
}

function CustomerActionsMenu({ customer, onDelete }: CustomerActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="position-relative" ref={dropdownRef}>
            <button
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                type="button"
            >
                <MoreVertical size={16} />
            </button>

            {isOpen && (
                <div
                    className="dropdown-menu show"
                    style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        zIndex: 1000,
                        display: 'block',
                        minWidth: '160px'
                    }}
                >
                    <Link
                        className="dropdown-item d-flex align-items-center"
                        to={`/customers/${customer.id}/edit`}
                        onClick={() => setIsOpen(false)}
                    >
                        <Pencil size={14} className="me-2" /> Edit
                    </Link>
                    <button
                        className="dropdown-item d-flex align-items-center text-danger"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDelete(customer.id);
                            setIsOpen(false);
                        }}
                    >
                        <Trash2 size={14} className="me-2" /> Delete
                    </button>
                </div>
            )}
        </div>
    );
}

export default function CustomerList() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [groups, setGroups] = useState<CustomerGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [groupFilter, setGroupFilter] = useState("");

    const fetchCustomers = useCallback(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (groupFilter) params.customer_group_id = groupFilter;

        customerApi.list(params).then((res) => {
            setCustomers(Array.isArray(res) ? res : res.data || []);
        }).finally(() => setLoading(false));
    }, [search, groupFilter]);

    useEffect(() => {
        customerGroupApi.list().then(setGroups);
    }, []);

    useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Customer?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete it!"
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
                    <input type="text" className="form-control" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="col-md-3">
                    <select className="form-select" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
                        <option value="">All Groups</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
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
                                <th>Group</th>
                                <th>Type</th>
                                <th>Territory</th>
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
                                    <td>{customer.customer_group?.name || "-"}</td>
                                    <td>{customer.customer_type || "-"}</td>
                                    <td>{customer.territory?.territory_name || "-"}</td>
                                    <td>{customer.email || "-"}</td>
                                    <td>{customer.phone || "-"}</td>
                                    <td className="text-end">
                                        <CustomerActionsMenu customer={customer} onDelete={handleDelete} />
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
