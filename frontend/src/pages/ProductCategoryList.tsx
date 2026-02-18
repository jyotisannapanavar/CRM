import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productCategoryApi } from "@/services/api";
import type { ProductCategory } from "@/types";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Swal from "sweetalert2";

export default function ProductCategoryList() {
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = () => {
        setLoading(true);
        productCategoryApi
            .list()
            .then((data) => setCategories(Array.isArray(data) ? data : []))
            .catch(() => setCategories([]))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAdd = async () => {
        const { value: formValues } = await Swal.fire({
            title: "Add Product Category",
            html:
                '<input id="swal-name" class="swal2-input" placeholder="Category Name">' +
                '<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)"></textarea>',
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Category name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues) {
            try {
                await productCategoryApi.create(formValues);
                Swal.fire("Added!", "Product category has been added.", "success");
                fetchCategories();
            } catch {
                Swal.fire("Error", "Failed to add product category.", "error");
            }
        }
    };

    const handleEdit = async (category: ProductCategory) => {
        const { value: formValues } = await Swal.fire({
            title: "Edit Product Category",
            html:
                `<input id="swal-name" class="swal2-input" placeholder="Category Name" value="${category.name}">` +
                `<textarea id="swal-description" class="swal2-textarea" placeholder="Description (optional)">${category.description || ""}</textarea>`,
            focusConfirm: false,
            showCancelButton: true,
            preConfirm: () => {
                const name = (document.getElementById("swal-name") as HTMLInputElement).value;
                if (!name) {
                    Swal.showValidationMessage("Category name is required!");
                    return false;
                }
                return {
                    name,
                    description: (document.getElementById("swal-description") as HTMLTextAreaElement).value || null,
                };
            },
        });
        if (formValues && (formValues.name !== category.name || formValues.description !== category.description)) {
            try {
                await productCategoryApi.update(category.id, formValues);
                Swal.fire("Updated!", "Product category has been updated.", "success");
                fetchCategories();
            } catch {
                Swal.fire("Error", "Failed to update product category.", "error");
            }
        }
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: "Delete Product Category?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            confirmButtonText: "Delete",
        });
        if (result.isConfirmed) {
            try {
                await productCategoryApi.delete(id);
                Swal.fire("Deleted!", "Product category has been deleted.", "success");
                fetchCategories();
            } catch {
                Swal.fire("Error", "Failed to delete product category.", "error");
            }
        }
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
                    <li className="breadcrumb-item active">Product Categories</li>
                </ol>
            </nav>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Product Categories</h2>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <Plus size={18} className="me-1" /> Add Category
                </button>
            </div>

            <div className="card">
                <div className="card-body p-0">
                    <table className="table table-hover mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th className="text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="text-center text-muted py-4">
                                        No product categories found
                                    </td>
                                </tr>
                            )}
                            {categories.map((category, index) => (
                                <tr key={category.id}>
                                    <td>{index + 1}</td>
                                    <td>
                                        <span className="badge bg-success">{category.name}</span>
                                    </td>
                                    <td>{category.description || "-"}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(category)}
                                            title="Edit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(category.id)}
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
