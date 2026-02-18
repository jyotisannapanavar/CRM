import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { SalesTask } from "../types";
import { salesTaskApi } from "../services/api";

export default function SalesTaskList() {
    const [salesTasks, setSalesTasks] = useState<SalesTask[]>([]);
    const [loading, setLoading] = useState(true);

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
        if (confirm("Are you sure you want to delete this sales task?")) {
            try {
                await salesTaskApi.delete(id);
                loadSalesTasks();
            } catch (error) {
                console.error("Failed to delete sales task:", error);
            }
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Sales Tasks</h2>
                <Link to="/sales-tasks/new" className="btn btn-primary d-flex align-items-center gap-2">
                    <Plus size={20} />
                    Add Sales Task
                </Link>
            </div>

            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Type</th>
                                    <th>Source</th>
                                    <th>Assigned To</th>
                                    <th>Created At</th>
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
                                            <td>{task.task_source?.name || "Unknown"}</td>
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
                                            <td>{new Date(task.created_at).toLocaleDateString()}</td>
                                            <td className="text-end">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <Link
                                                        to={`/sales-tasks/${task.id}`}
                                                        className="btn btn-sm btn-outline-info"
                                                        title="View"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link
                                                        to={`/sales-tasks/${task.id}/edit`}
                                                        className="btn btn-sm btn-outline-primary"
                                                        title="Edit"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
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
        </div>
    );
}
