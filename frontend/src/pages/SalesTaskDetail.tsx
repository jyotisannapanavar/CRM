import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit } from "lucide-react";
import { salesTaskApi } from "../services/api";
import { SalesTask } from "../types";

export default function SalesTaskDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState<SalesTask | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadTask(Number(id));
        }
    }, [id]);

    const loadTask = async (taskId: number) => {
        try {
            const data = await salesTaskApi.get(taskId);
            setTask(data);
        } catch (error) {
            console.error("Failed to load task:", error);
            navigate("/sales-tasks");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;
    if (!task) return <div className="p-4">Task not found</div>;

    return (
        <div className="container-fluid p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-3">
                    <Link to="/sales-tasks" className="btn btn-outline-secondary">
                        <ArrowLeft size={20} />
                    </Link>
                    <h2 className="mb-0">Sales Task Details</h2>
                </div>
                <Link to={`/sales-tasks/${task.id}/edit`} className="btn btn-primary d-flex align-items-center gap-2">
                    <Edit size={18} />
                    Edit Task
                </Link>
            </div>

            <div className="card shadow-sm" style={{ maxWidth: '800px' }}>
                <div className="card-body">
                    <div className="row g-4">
                        <div className="col-md-6">
                            <label className="text-muted small d-block mb-1">Task Type</label>
                            <span className="badge bg-secondary fs-6">
                                {task.task_type?.name || "Unknown"}
                            </span>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small d-block mb-1">Source</label>
                            <p className="fs-5 fw-medium mb-0">{task.task_source?.name || "Unknown"}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small d-block mb-1">Assigned User</label>
                            {task.assigned_user?.name ? (
                                <div className="d-flex align-items-center gap-2">
                                    <div className="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '32px', height: '32px' }}>
                                        {task.assigned_user.name.charAt(0)}
                                    </div>
                                    <span className="fs-5">{task.assigned_user.name}</span>
                                </div>
                            ) : (
                                <span className="text-muted fst-italic fs-5">Unassigned</span>
                            )}
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small d-block mb-1">Created Date</label>
                            <p className="fs-5 mb-0">{new Date(task.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="col-md-6">
                            <label className="text-muted small d-block mb-1">Task ID</label>
                            <p className="text-muted font-monospace mb-0">#{task.id}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
