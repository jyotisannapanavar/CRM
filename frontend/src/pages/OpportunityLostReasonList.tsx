import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { lostReasonApi, opportunityApi } from "@/services/api";
import type { OpportunityLostReason, Opportunity } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function OpportunityLostReasonList() {
    const [reasons, setReasons] = useState<OpportunityLostReason[]>([]);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReasons = () => {
        setLoading(true);
        lostReasonApi
            .list()
            .then((data) => setReasons(Array.isArray(data) ? data : []))
            .catch(() => setReasons([]))
            .finally(() => setLoading(false));
    };

    const fetchOpportunities = () => {
        opportunityApi
            .list()
            .then((data) => {
                const list = Array.isArray(data) ? data : data?.data || [];
                setOpportunities(list);
            })
            .catch(() => setOpportunities([]));
    };

    useEffect(() => {
        fetchReasons();
        fetchOpportunities();
    }, []);

    const buildOpportunityOptions = () => {
        return opportunities
            .map(
                (o) =>
                    `<option value="${o.id}">${o.party_name || o.naming_series || `Opportunity #${o.id}`}</option>`
            )
            .join("");
    };

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Add Lost Reason",
            html:
                `<select id="swal-opportunity" class="swal2-select" style="width:100%;padding:8px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">
                    <option value="">Select Opportunity</option>
                    ${buildOpportunityOptions()}
                </select>` +
                '<input id="swal-reason" class="swal2-input" placeholder="Lost Reason">',
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const opportunity_id = (document.getElementById("swal-opportunity") as HTMLSelectElement).value;
                const opportunity_lost_reasons = (document.getElementById("swal-reason") as HTMLInputElement).value;
                if (!opportunity_id) {
                    Swal.showValidationMessage("Please select an opportunity!");
                    return false;
                }
                if (!opportunity_lost_reasons) {
                    Swal.showValidationMessage("Lost reason is required!");
                    return false;
                }
                return {
                    opportunity_id: Number(opportunity_id),
                    opportunity_lost_reasons,
                };
            },
        });
        if (formValues) {
            try {
                await lostReasonApi.create(formValues);
                Swal.fire("Added!", "Lost reason has been added.", "success");
                fetchReasons();
            } catch {
                Swal.fire("Error", "Failed to add lost reason.", "error");
            }
        }
    };

    const handleEdit = async (reason: OpportunityLostReason) => {
        const { value: formValues } = await Swal.fire({
            title: "Edit Lost Reason",
            html:
                `<select id="swal-opportunity" class="swal2-select" style="width:100%;padding:8px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">
                    <option value="">Select Opportunity</option>
                    ${opportunities
                        .map(
                            (o) =>
                                `<option value="${o.id}" ${o.id === reason.opportunity_id ? "selected" : ""}>${o.party_name || o.naming_series || `Opportunity #${o.id}`}</option>`
                        )
                        .join("")}
                </select>` +
                `<input id="swal-reason" class="swal2-input" placeholder="Lost Reason" value="${reason.opportunity_lost_reasons}">`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const opportunity_id = (document.getElementById("swal-opportunity") as HTMLSelectElement).value;
                const opportunity_lost_reasons = (document.getElementById("swal-reason") as HTMLInputElement).value;
                if (!opportunity_id) {
                    Swal.showValidationMessage("Please select an opportunity!");
                    return false;
                }
                if (!opportunity_lost_reasons) {
                    Swal.showValidationMessage("Lost reason is required!");
                    return false;
                }
                return {
                    opportunity_id: Number(opportunity_id),
                    opportunity_lost_reasons,
                };
            },
        });
        if (
            formValues &&
            (formValues.opportunity_id !== reason.opportunity_id ||
                formValues.opportunity_lost_reasons !== reason.opportunity_lost_reasons)
        ) {
            try {
                await lostReasonApi.update(reason.id, formValues);
                Swal.fire("Updated!", "Lost reason has been updated.", "success");
                fetchReasons();
            } catch {
                Swal.fire("Error", "Failed to update lost reason.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Lost Reason?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await lostReasonApi.delete(id);
                Swal.fire("Deleted!", "Lost reason has been deleted.", "success");
                fetchReasons();
            } catch {
                Swal.fire("Error", "Failed to delete lost reason.", "error");
            }
        }
    };

    const getOpportunityName = (reason: OpportunityLostReason) => {
        if (reason.opportunity) {
            return reason.opportunity.party_name || reason.opportunity.naming_series || `Opportunity #${reason.opportunity.id}`;
        }
        return `Opportunity #${reason.opportunity_id}`;
    };

    if (loading) {
        return <div className="text-center py-5 text-muted">Loading...</div>;
    }

    return (
        <div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/">CRM</Link>
                    </li>
                    <li className="breadcrumb-item active">Opportunity Lost Reasons</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Opportunity Lost Reasons</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Lost Reason
                </button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Opportunity</th>
                                <th>Lost Reason</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reasons.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4">
                                        No lost reasons found
                                    </td>
                                </tr>
                            )}
                            {reasons.map((reason, index) => (
                                <tr key={reason.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-info">
                                            {getOpportunityName(reason)}
                                        </span>
                                    </td>
                                    <td>{reason.opportunity_lost_reasons}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(reason)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(reason.id)}
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
            </div>
        </div>
    );
}
