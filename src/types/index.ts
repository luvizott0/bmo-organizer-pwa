export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'review' | 'reviewed' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskType = 'feature' | 'bugfix' | 'hotfix'
export type AssigneeType = 'user' | 'ai'

export interface Project {
  id: number
  workspace_id: number
  name: string
  prefix: string
  description?: string | null
  github_repo?: string | null
  backend_repo?: string | null
  backend_test_cmd?: string | null
  backend_instructions_file?: string | null
  frontend_repo?: string | null
  frontend_test_cmd?: string | null
  frontend_instructions_file?: string | null
  local_path?: string | null
  base_branch?: string
  test_command?: string | null
  instructions_file?: string
  color: string
  last_task_number: number
  is_active: boolean
  tasks_count?: number
  created_at?: string
  updated_at?: string
}

export type TargetScope = 'auto' | 'backend' | 'frontend' | 'fullstack'

export interface Task {
  id: number
  workspace_id: number
  project_id: number
  task_code: string
  task_number: number
  title: string
  description?: string | null
  type?: TaskType
  status: TaskStatus
  priority: TaskPriority
  target_scope?: TargetScope
  branch_name?: string | null
  backend_branch_name?: string | null
  frontend_branch_name?: string | null
  assignee_type: AssigneeType
  ai_logs?: any
  order: number
  due_date?: string | null
  release_id?: number | null
  preview_url?: string | null
  project?: Project
  created_at?: string
  updated_at?: string
}

export type ReleaseStatus = 'draft' | 'sandbox' | 'production' | 'cancelled'

export interface Release {
  id: number
  workspace_id: number
  project_id: number
  version: string
  title: string
  description?: string | null
  status: ReleaseStatus
  deployed_to_sandbox_at?: string | null
  deployed_to_production_at?: string | null
  release_notes?: string | null
  logs?: string[] | null
  project?: Project
  tasks?: Task[]
  created_at?: string
  updated_at?: string
}

export interface CalendarEvent {
  id: number
  workspace_id: number
  title: string
  description?: string | null
  start_at: string
  end_at?: string | null
  all_day: boolean
  category: 'routine' | 'house' | 'work' | 'personal' | string
  color: string
  location?: string | null
  created_at?: string
  updated_at?: string
}

export interface Reminder {
  id: number
  workspace_id: number
  title: string
  due_at: string
  is_completed: boolean
  completed_at?: string | null
  category: string
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  notify_whatsapp: boolean
  last_notified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  name: string
  email: string
  is_admin?: boolean
}

export interface Workspace {
  id: number
  name: string
  is_personal: boolean
  role?: string
}

