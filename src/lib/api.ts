const API_BASE = 'https://functions.poehali.dev';

const ENDPOINTS = {
  users: '04bbd535-e278-40ef-a668-d4c00cddff55',
  tasks: 'c4d99b39-898a-498c-b916-faedd8a63c90',
  achievements: '1bfac6dd-5105-4252-8fa5-eea0ddc83aa2'
};

interface User {
  id: number;
  telegram_id: number;
  username?: string;
  level: number;
  xp: number;
  totalCompleted: number;
  streak: number;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  interval: string;
  assignedTo?: string;
  status: 'active' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  reminderCount: number;
  createdAt: string;
  completedAt?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export const api = {
  users: {
    async get(telegram_id: number): Promise<User> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.users}?telegram_id=${telegram_id}`);
      const data = await response.json();
      return data.user;
    },

    async create(telegram_id: number, username?: string): Promise<User> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.users}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id, username })
      });
      const data = await response.json();
      return data.user;
    },

    async update(user_id: number, xp_increment: number = 0, complete_task: boolean = false): Promise<User> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.users}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, xp_increment, complete_task })
      });
      const data = await response.json();
      return data.user;
    }
  },

  tasks: {
    async list(user_id: number, status: string = 'active'): Promise<Task[]> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.tasks}?user_id=${user_id}&status=${status}`);
      const data = await response.json();
      return data.tasks;
    },

    async create(user_id: number, task: {
      title: string;
      description: string;
      interval: string;
      assigned_to?: string;
      priority: 'low' | 'medium' | 'high';
    }): Promise<Task> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.tasks}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id,
          title: task.title,
          description: task.description,
          interval: task.interval,
          assigned_to: task.assigned_to,
          priority: task.priority
        })
      });
      const data = await response.json();
      return data.task;
    },

    async update(task_id: string, status: string): Promise<Task> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.tasks}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        
      });
      const data = await response.json();
      return data.task;
    }
  },

  achievements: {
    async list(user_id: number): Promise<Achievement[]> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.achievements}?user_id=${user_id}`);
      const data = await response.json();
      return data.achievements;
    },

    async updateProgress(user_id: number, achievement_id: number, progress_increment: number = 1): Promise<{ progress: number; unlocked: boolean }> {
      const response = await fetch(`${API_BASE}/${ENDPOINTS.achievements}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, achievement_id, progress_increment })
      });
      return await response.json();
    }
  }
};
