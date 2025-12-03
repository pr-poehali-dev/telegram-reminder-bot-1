import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import UserHeader from '@/components/UserHeader';
import StatsCards from '@/components/StatsCards';
import TasksList from '@/components/TasksList';
import CreateTaskForm from '@/components/CreateTaskForm';
import StatsTab from '@/components/StatsTab';
import AchievementsTab from '@/components/AchievementsTab';

interface Task {
  id: string;
  title: string;
  description: string;
  interval: string;
  assignedTo?: string;
  status: 'active' | 'completed' | 'overdue';
  createdAt: Date;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  reminderCount: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  
  const DEMO_USER_ID = 1;
  const DEMO_TELEGRAM_ID = 123456789;

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    interval: '30min',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [nextLevelXP, setNextLevelXP] = useState(100);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      let user = await api.users.get(DEMO_TELEGRAM_ID).catch(() => null);
      if (!user) {
        user = await api.users.create(DEMO_TELEGRAM_ID, 'demo_user');
      }
      
      setUserLevel(user.level);
      setUserXP(user.xp);
      setNextLevelXP(user.level * 100);
      
      const tasksData = await api.tasks.list(user.id);
      setTasks(tasksData.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined
      })));
      
      const achievementsData = await api.achievements.list(user.id);
      setAchievements(achievementsData);
      
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить данные",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalCompleted: 24,
    activeReminders: tasks.filter(t => t.status === 'active').length,
    overdueCount: tasks.filter(t => t.status === 'overdue').length,
    streak: 12
  };

  const completeTask = async (taskId: string) => {
    try {
      await api.tasks.update(taskId, 'completed');
      
      const updatedUser = await api.users.update(DEMO_USER_ID, 25, true);
      setUserXP(updatedUser.xp);
      setUserLevel(updatedUser.level);
      setNextLevelXP(updatedUser.level * 100);
      
      await api.achievements.updateProgress(DEMO_USER_ID, 2, 1);
      
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const, completedAt: new Date() }
          : task
      ));
      
      toast({
        title: "🎉 Задание выполнено!",
        description: "+25 XP. Так держать!",
        className: "bg-gradient-to-r from-game-purple to-game-blue border-none text-white"
      });
      
      loadData();
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить задание",
        variant: "destructive"
      });
    }
  };

  const createTask = async () => {
    if (!newTask.title) {
      toast({
        title: "Упс! 😅",
        description: "Название задания не может быть пустым",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.tasks.create(DEMO_USER_ID, {
        title: newTask.title,
        description: newTask.description,
        interval: newTask.interval,
        assigned_to: newTask.assignedTo || undefined,
        priority: newTask.priority
      });
      
      await api.achievements.updateProgress(DEMO_USER_ID, 1, 1);

      setNewTask({
        title: '',
        description: '',
        interval: '30min',
        assignedTo: '',
        priority: 'medium'
      });

      toast({
        title: "✨ Задание создано!",
        description: "Бот начнёт отправлять напоминания",
        className: "bg-gradient-to-r from-game-orange to-game-gold border-none text-white"
      });
      
      loadData();
    } catch (error) {
      console.error('Failed to create task:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать задание",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-game-purple border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30 dark:from-background dark:via-purple-950/20 dark:to-blue-950/20">
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 animate-fade-in">
          <UserHeader 
            userLevel={userLevel}
            userXP={userXP}
            nextLevelXP={nextLevelXP}
          />

          <StatsCards stats={stats} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Icon name="ListTodo" size={18} />
              Мои задачи
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Icon name="Plus" size={18} />
              Создать
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Icon name="BarChart3" size={18} />
              Статистика
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Icon name="Award" size={18} />
              Достижения
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TasksList tasks={tasks} onCompleteTask={completeTask} />
          </TabsContent>

          <TabsContent value="create" className="animate-fade-in">
            <CreateTaskForm 
              newTask={newTask}
              onTaskChange={setNewTask}
              onCreateTask={createTask}
            />
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <StatsTab stats={stats} />
          </TabsContent>

          <TabsContent value="achievements" className="animate-fade-in">
            <AchievementsTab achievements={achievements} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
