import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { contactApi } from "@/services/api"; // Changed from customerApi
import type { Contact } from "@/types"; // Changed from Customer
import { Plus, Trash2, Edit2, Eye, Search, X } from "lucide-react";
import Swal from "sweetalert2";

export default function CustomerList() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchContacts = useCallback(() => {
        setLoading(true);
        const params: Record<string, string> = {};
        if (search) params.search = search;

        contactApi.list(params).then((res) => {
            setContacts(Array.isArray(res) ? res : res.data || []);
        }).finally(() => setLoading(false));
    }, [search]);

    useEffect(() => { fetchContacts(); }, [fetchContacts]);

    const viewContact = async (contact: Contact) => {
        const email = contact.emails?.[0]?.email || "—";
        const phone = contact.phones?.[0]?.phone_no || "—";

        await Swal.fire({
            title: `${contact.first_name} ${contact.last_name}`,
            width: 650,
            html: `
                <div style="text-align:left;">
                    <table class="table table-borderless mb-0" style="font-size:0.9rem;">
                        <tr><td class="fw-semibold" style="width:140px;">Company</td><td>${contact.company_name || "—"}</td></tr>
                        <tr><td class="fw-semibold">Designation</td><td>${contact.designation || "—"}</td></tr>
                        <tr><td class="fw-semibold">Email</td><td>${email}</td></tr>
                        <tr><td class="fw-semibold">Phone</td><td>${phone}</td></tr>
                        <tr><td class="fw-semibold">Address</td><td>${contact.address || "—"}</td></tr>
                        <tr><td class="fw-semibold">Status</td><td>${contact.status || "—"}</td></tr>
                    </table>
                </div>
            `,
            confirmButtonText: "Close",
            confirmButtonColor: "#6c757d",
        });
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Contact?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Yes, delete it!"
        });
        if (result.isConfirmed) {
            await contactApi.delete(id);
            Swal.fire("Deleted!", "Contact has been deleted.", "success");
            fetchContacts();
        }
    };

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">CRM</Link></li>
                    <li className="breadcrumb-item active">Customers (Contacts)</li>
                </ol>
            </nav>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>Customers (Contacts)</h2>
                {/* Pointing to new contact creation if available, or keeping generic */}
                <Link to="/customers/new" className="btn btn-primary"><Plus size={16} className="me-1" /> New Contact</Link>
            </div>
            <div className="row g-2 mb-3">
                <div className="col-md-4">
                    <div className="position-relative">
                        <Search size={16} className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                        <input
                            type="text"
                            className="form-control ps-5"
                            placeholder="Search contacts..."
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
            ) : contacts.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted mb-3">No contacts found.</p>
                    <Link to="/customers/new" className="btn btn-primary">Create a new Contact</Link>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>Name</th>
                                <th>Company</th>
                                <th>Designation</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td className="fw-medium">
                                        <Link to={`/customers/${contact.id}/edit`} className="text-decoration-none text-dark">
                                            {contact.first_name} {contact.last_name}
                                        </Link>
                                    </td>
                                    <td>{contact.company_name || "-"}</td>
                                    <td>{contact.designation || "-"}</td>
                                    <td>{contact.emails?.[0]?.email || "-"}</td>
                                    <td>{contact.phones?.[0]?.phone_no || "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-secondary me-1"
                                            onClick={() => viewContact(contact)}
                                            title="View"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <Link
                                            to={`/customers/${contact.id}/edit`}
                                            className="btn btn-sm btn-outline-primary me-1"
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </Link>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(contact.id)}
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
