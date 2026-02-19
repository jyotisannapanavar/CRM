import React, { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { salesTaskApi, taskSourceApi, taskTypeApi, userApi, User } from "../services/api";
import { SalesTask } from "../types";

interface SalesTaskModalProps {
    show: boolean;
    onHide: () => void;
    onSave: () => void;
    taskId?: number;
    readOnly?: boolean;
}

export default function SalesTaskModal({ show, onHide, onSave, taskId, readOnly = false }: SalesTaskModalProps) {
    const [formData, setFormData] = useState({
        task_source_id: "",
        task_type_id: "",
        sales_assign_id: "",
    });

    const [sources, setSources] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (show) {
            loadOptions();
            if (taskId) {
                loadSalesTask(taskId);
            } else {
                // Reset form for new task
                setFormData({
                    task_source_id: "",
                    task_type_id: "",
                    sales_assign_id: "",
                });
                setErrors({});
            }
        }
    }, [show, taskId]);

    const loadOptions = async () => {
        try {
            const [sourcesData, typesData, usersData] = await Promise.all([
                taskSourceApi.list(),
                taskTypeApi.list(),
                userApi.list(),
            ]);
            setSources(sourcesData);
            setTypes(typesData);
            setUsers(usersData);
        } catch (error) {
            console.error("Failed to load options:", error);
        }
    };

    const loadSalesTask = async (id: number) => {
        try {
            const data = await salesTaskApi.get(id);
            setFormData({
                task_source_id: data.task_source_id.toString(),
                task_type_id: data.task_type_id.toString(),
                sales_assign_id: data.sales_assign_id ? data.sales_assign_id.toString() : "",
            });
        } catch (error) {
            console.error("Failed to load sales task:", error);
            onHide();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            const dataToSave = {
                task_source_id: Number(formData.task_source_id),
                task_type_id: Number(formData.task_type_id),
                sales_assign_id: formData.sales_assign_id ? Number(formData.sales_assign_id) : null,
            };

            if (taskId) {
                await salesTaskApi.update(taskId, dataToSave);
            } else {
                await salesTaskApi.create(dataToSave);
            }
            onSave();
            onHide();
        } catch (error: any) {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
            console.error("Failed to save sales task:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            {readOnly ? "View Sales Task" : taskId ? "Edit Sales Task" : "New Sales Task"}
                        </h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label">Task Source</label>
                                <select
                                    className={`form-select ${errors.task_source_id ? "is-invalid" : ""}`}
                                    value={formData.task_source_id}
                                    onChange={(e) => setFormData({ ...formData, task_source_id: e.target.value })}
                                    required
                                    disabled={readOnly}
                                >
                                    <option value="">Select Source</option>
                                    {sources.map((source) => (
                                        <option key={source.id} value={source.id}>
                                            {source.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.task_source_id && <div className="invalid-feedback">{errors.task_source_id[0]}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Task Type</label>
                                <select
                                    className={`form-select ${errors.task_type_id ? "is-invalid" : ""}`}
                                    value={formData.task_type_id}
                                    onChange={(e) => setFormData({ ...formData, task_type_id: e.target.value })}
                                    required
                                    disabled={readOnly}
                                >
                                    <option value="">Select Type</option>
                                    {types.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.task_type_id && <div className="invalid-feedback">{errors.task_type_id[0]}</div>}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Assigned User</label>
                                <select
                                    className={`form-select ${errors.sales_assign_id ? "is-invalid" : ""}`}
                                    value={formData.sales_assign_id}
                                    onChange={(e) => setFormData({ ...formData, sales_assign_id: e.target.value })}
                                    disabled={readOnly}
                                >
                                    <option value="">Select User (Optional)</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.sales_assign_id && <div className="invalid-feedback">{errors.sales_assign_id[0]}</div>}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={onHide}>Close</button>
                            {!readOnly && (
                                <button type="submit" className="btn btn-primary d-flex align-items-center gap-2" disabled={loading}>
                                    <Save size={18} />
                                    {loading ? "Saving..." : (taskId ? "Update" : "Save")}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
