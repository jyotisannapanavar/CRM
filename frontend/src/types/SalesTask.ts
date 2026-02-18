import { TaskSource, TaskType } from './Task';

export interface SalesTask {
    id: number;
    task_source_id: number;
    task_type_id: number;
    sales_assign_id: number | null;
    formatted_date?: string;
    task_source?: TaskSource;
    task_type?: TaskType;
    assigned_user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}
