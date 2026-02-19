import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Swal from 'sweetalert2';
import { salesTaskDetailApi } from "../services/api";
import { SalesTaskDetail } from "../types";
import SalesTaskDetailModal from "./SalesTaskDetailModal";

export default function SalesTaskDetailList() {
    const [details, setDetails] = useState<SalesTaskDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<SalesTaskDetail | null>(null);
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        loadDetails();
    }, []);

    const loadDetails = async () => {
        try {
            const data = await salesTaskDetailApi.list({});
            setDetails(data);
        } catch (error) {
            console.error("Failed to load task details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await salesTaskDetailApi.delete(id);
                Swal.fire(
                    'Deleted!',
                    'Your detail has been deleted.',
                    'success'
                );
                loadDetails();
            } catch (error) {
                console.error("Failed to delete detail:", error);
                Swal.fire(
                    'Error!',
                    'Failed to delete detail.',
                    'error'
                );
            }
        }
    };

    const handleEdit = (detail: SalesTaskDetail) => {
        setSelectedDetail(detail);
        setIsReadOnly(false);
        setShowModal(true);
    };

    const handleView = (detail: SalesTaskDetail) => {
        setSelectedDetail(detail);
        setIsReadOnly(true);
        setShowModal(true);
    };

    const handleAdd = () => {
        setSelectedDetail(null);
        setIsReadOnly(false);
        setShowModal(true);
    };

    const handleSave = () => {
        loadDetails();
        setShowModal(false);
    };

    const configDate = (dateStr: string) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Open': return 'primary';
            case 'In Progress': return 'warning';
            case 'Closed': return 'success';
            default: return 'secondary';
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <h2 className="mb-0">All Sales Task Details</h2>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleAdd}>
                    <Plus size={18} />
                    Add Detail
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    {details.length === 0 ? (
                        <div className="text-center text-muted py-4">No details found.</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Task Type</th>
                                        <th>Date / Time</th>
                                        <th>Description</th>
                                        <th>Status</th>
                                        <th className="text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {details.map((detail) => (
                                        <tr key={detail.id}>
                                            <td>
                                                {detail.sales_task?.task_type?.name || <span className="text-muted fst-italic">Unknown Type</span>}
                                                {detail.sales_task?.task_source && (
                                                    <div className="small text-muted">{detail.sales_task.task_source.name}</div>
                                                )}
                                            </td>
                                            <td style={{ minWidth: '140px' }}>
                                                <div className="fw-medium">{configDate(detail.date)}</div>
                                                <div className="small text-muted">{detail.time}</div>
                                            </td>
                                            <td>{detail.description}</td>
                                            <td>
                                                <span className={`badge bg-${getStatusColor(detail.status)}`}>
                                                    {detail.status}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                {detail.sales_task && (
                                                    <button
                                                        className="btn btn-sm btn-outline-secondary me-1"
                                                        onClick={() => handleView(detail)}
                                                        title="View Detail"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-outline-primary me-1"
                                                    onClick={() => handleEdit(detail)}
                                                    title="Edit"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(detail.id)}
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
            </div>

            <SalesTaskDetailModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleSave}
                detail={selectedDetail}
                readOnly={isReadOnly}
            />
        </div>
    );
}
