import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Swal from 'sweetalert2';
import { SalesTask } from "../types";
import { salesTaskApi } from "../services/api";
import SalesTaskModal from "./SalesTaskModal";

// Task source IDs matching the backend enum
const TASK_SOURCE_LEAD = 1;
const TASK_SOURCE_PROSPECT = 2;
const TASK_SOURCE_OPPORTUNITY = 3;

function getSourceEntityDisplay(task: SalesTask): string {
    if (!task.source_detail) return "—";

    switch (task.task_source_id) {
        case TASK_SOURCE_LEAD:
            return `${task.source_detail.first_name || ''} ${task.source_detail.last_name || ''}`.trim()
                || `Lead #${task.source_id}`;
        case TASK_SOURCE_PROSPECT:
            return task.source_detail.company_name || `Prospect #${task.source_id}`;
        case TASK_SOURCE_OPPORTUNITY:
            return task.source_detail.naming_series
                ? `${task.source_detail.naming_series} - ${task.source_detail.party_name || ''}`
                : `Opportunity #${task.source_id}`;
        default:
            return "—";
    }
}

function getSourceBadgeColor(taskSourceId: number): string {
    switch (taskSourceId) {
        case TASK_SOURCE_LEAD: return "bg-info";
        case TASK_SOURCE_PROSPECT: return "bg-warning text-dark";
        case TASK_SOURCE_OPPORTUNITY: return "bg-success";
        default: return "bg-secondary";
    }
}

export default function SalesTaskList() {
    const [salesTasks, setSalesTasks] = useState<SalesTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | undefined>(undefined);
    const [isReadOnly, setIsReadOnly] = useState(false);

    useEffect(() => {
        loadSalesTasks();
    }, []);

    const loadSalesTasks = async () => {
        try {
            const data = await salesTaskApi.list();
            setSalesTasks(data);
        } catch (error) {
            console.error("Failed to load sales tasks:", error);
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
                await salesTaskApi.delete(id);
                Swal.fire(
                    'Deleted!',
                    'Your sales task has been deleted.',
                    'success'
                );
                loadSalesTasks();
            } catch (error) {
                console.error("Failed to delete sales task:", error);
                Swal.fire(
                    'Error!',
                    'Failed to delete sales task.',
                    'error'
                );
            }
        }
    };

    const handleAdd = () => {
        setSelectedTaskId(undefined);
        setIsReadOnly(false);
        setShowModal(true);
    };

    const handleEdit = (id: number) => {
        setSelectedTaskId(id);
        setIsReadOnly(false);
        setShowModal(true);
    };

    const handleView = (id: number) => {
        setSelectedTaskId(id);
        setIsReadOnly(true);
        setShowModal(true);
    };

    const handleSave = () => {
        loadSalesTasks();
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Sales Tasks</h2>
                <button
                    onClick={handleAdd}
                    className="btn btn-primary d-flex align-items-center gap-2"
                >
                    <Plus size={20} />
                    Add Sales Task
                </button>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Type</th>
                                    <th>Source</th>
                                    <th>Linked To</th>
                                    <th>Assigned To</th>
                                    <th className="text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {salesTasks.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-muted">
                                            No sales tasks found.
                                        </td>
                                    </tr>
                                ) : (
                                    salesTasks.map((task) => (
                                        <tr key={task.id}>
                                            <td>
                                                <span className="badge bg-secondary">{task.task_type?.name || "Unknown"}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getSourceBadgeColor(task.task_source_id)}`}>
                                                    {task.task_source?.name || "Unknown"}
                                                </span>
                                            </td>
                                            <td>
                                                {task.source_id ? (
                                                    <span className="text-primary fw-medium">
                                                        {getSourceEntityDisplay(task)}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted fst-italic">Not linked</span>
                                                )}
                                            </td>
                                            <td>
                                                {task.assigned_user?.name ? (
                                                    <span className="d-flex align-items-center gap-2">
                                                        <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px', fontSize: '12px' }}>
                                                            {task.assigned_user.name.charAt(0)}
                                                        </div>
                                                        {task.assigned_user.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted fst-italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button
                                                        onClick={() => handleView(task.id)}
                                                        className="btn btn-sm btn-outline-info"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(task.id)}
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(task.id)}
                                                        className="btn btn-sm btn-outline-danger"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <SalesTaskModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onSave={handleSave}
                taskId={selectedTaskId}
                readOnly={isReadOnly}
            />
        </div>
    );
}
