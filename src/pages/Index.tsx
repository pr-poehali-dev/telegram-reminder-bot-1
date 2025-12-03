import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

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
      const createdTask = await api.tasks.create(DEMO_USER_ID, {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-game-orange';
      case 'medium': return 'bg-game-blue';
      case 'low': return 'bg-muted';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'CheckCircle2';
      case 'overdue': return 'AlertCircle';
      default: return 'Clock';
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-game-purple via-game-orange to-game-blue bg-clip-text text-transparent mb-2">
                TaskMaster Bot 🎮
              </h1>
              <p className="text-muted-foreground text-lg">Превращай задачи в достижения!</p>
            </div>
            
            <Card className="p-4 bg-gradient-to-br from-game-purple/10 to-game-blue/10 border-game-purple/20 animate-pulse-glow">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-game-gold to-game-orange flex items-center justify-center text-2xl font-bold text-white animate-bounce-subtle">
                  {userLevel}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">Уровень {userLevel}</span>
                    <span className="text-xs text-muted-foreground">{userXP}/{nextLevelXP} XP</span>
                  </div>
                  <Progress value={(userXP / nextLevelXP) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">До следующего уровня: {nextLevelXP - userXP} XP</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4 bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <Icon name="CheckCircle" size={24} className="text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalCompleted}</p>
                  <p className="text-sm text-muted-foreground">Выполнено</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-game-blue/10 to-blue-600/10 border-game-blue/20 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-game-blue/20 flex items-center justify-center">
                  <Icon name="Bell" size={24} className="text-game-blue" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.activeReminders}</p>
                  <p className="text-sm text-muted-foreground">Активных</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-game-orange/10 to-red-600/10 border-game-orange/20 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-game-orange/20 flex items-center justify-center">
                  <Icon name="AlertTriangle" size={24} className="text-game-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.overdueCount}</p>
                  <p className="text-sm text-muted-foreground">Просрочено</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-gradient-to-br from-game-gold/10 to-yellow-600/10 border-game-gold/20 hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-game-gold/20 flex items-center justify-center animate-sparkle">
                  <Icon name="Flame" size={24} className="text-game-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.streak}</p>
                  <p className="text-sm text-muted-foreground">Дней подряд</p>
                </div>
              </div>
            </Card>
          </div>
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

          <TabsContent value="tasks" className="space-y-4 animate-fade-in">
            {tasks.filter(t => t.status !== 'completed').map(task => (
              <Card key={task.id} className="p-6 hover:shadow-lg transition-all hover:scale-[1.02] animate-scale-in">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name={getStatusIcon(task.status)} size={24} className={task.status === 'overdue' ? 'text-game-orange' : 'text-game-blue'} />
                      <h3 className="text-xl font-semibold">{task.title}</h3>
                      <Badge className={`${getPriorityColor(task.priority)} text-white`}>
                        {task.priority === 'high' ? '🔥 Высокий' : task.priority === 'medium' ? '⚡ Средний' : '💤 Низкий'}
                      </Badge>
                      {task.status === 'overdue' && (
                        <Badge className="bg-game-orange text-white animate-pulse">
                          Просрочено
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{task.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Icon name="Clock" size={16} />
                        <span>{task.interval}</span>
                      </div>
                      {task.assignedTo && (
                        <div className="flex items-center gap-1">
                          <Icon name="User" size={16} />
                          <span>{task.assignedTo}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Icon name="Bell" size={16} />
                        <span>{task.reminderCount} напоминаний</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => completeTask(task.id)}
                      className="bg-gradient-to-r from-success to-green-600 hover:from-success/90 hover:to-green-600/90"
                    >
                      <Icon name="Check" size={20} />
                      Выполнено
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {tasks.filter(t => t.status !== 'completed').length === 0 && (
              <Card className="p-12 text-center">
                <Icon name="CheckCircle2" size={64} className="mx-auto mb-4 text-success" />
                <h3 className="text-2xl font-semibold mb-2">Все задачи выполнены! 🎉</h3>
                <p className="text-muted-foreground">Создайте новое задание, чтобы продолжить прокачку</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create" className="animate-fade-in">
            <Card className="p-8">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-lg">Название задания *</Label>
                  <Input 
                    id="title"
                    placeholder="Например: Позвонить клиенту" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-lg">Описание</Label>
                  <Textarea 
                    id="description"
                    placeholder="Подробности задания..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="mt-2 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="interval" className="text-lg">Интервал напоминаний</Label>
                    <Select value={newTask.interval} onValueChange={(value) => setNewTask({...newTask, interval: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30min">⏰ Каждые 30 минут</SelectItem>
                        <SelectItem value="1hour">⏰ Каждый час</SelectItem>
                        <SelectItem value="2hours">⏰ Каждые 2 часа</SelectItem>
                        <SelectItem value="daily">📅 Каждый день</SelectItem>
                        <SelectItem value="custom">⚙️ Настроить время</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="priority" className="text-lg">Приоритет</Label>
                    <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({...newTask, priority: value})}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">💤 Низкий</SelectItem>
                        <SelectItem value="medium">⚡ Средний</SelectItem>
                        <SelectItem value="high">🔥 Высокий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="assignedTo" className="text-lg">Назначить пользователю (опционально)</Label>
                  <Input 
                    id="assignedTo"
                    placeholder="@username или выберите из группы" 
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Оставьте пустым для себя</p>
                </div>

                <Button 
                  onClick={createTask}
                  size="lg"
                  className="w-full bg-gradient-to-r from-game-purple via-game-orange to-game-blue hover:opacity-90 text-white text-lg"
                >
                  <Icon name="Plus" size={24} className="mr-2" />
                  Создать задание
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="animate-fade-in">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Icon name="TrendingUp" size={28} className="text-game-purple" />
                  Прогресс за неделю
                </h3>
                <div className="space-y-4">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, index) => {
                    const value = Math.floor(Math.random() * 100);
                    return (
                      <div key={day}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium">{day}</span>
                          <span className="text-sm text-muted-foreground">{value}% выполнено</span>
                        </div>
                        <Progress value={value} className="h-3" />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon name="Target" size={24} className="text-game-orange" />
                    Топ категорий
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Работа', count: 12, color: 'bg-game-purple' },
                      { name: 'Личное', count: 8, color: 'bg-game-blue' },
                      { name: 'Спорт', count: 4, color: 'bg-game-orange' }
                    ].map(cat => (
                      <div key={cat.name} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <span className="flex-1">{cat.name}</span>
                        <Badge>{cat.count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Icon name="Calendar" size={24} className="text-game-blue" />
                    Архив заданий
                  </h3>
                  <div className="text-center py-8">
                    <Icon name="Archive" size={48} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="text-muted-foreground">Выполнено заданий: {stats.totalCompleted}</p>
                    <Button variant="outline" className="mt-4">
                      Посмотреть архив
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <Card 
                  key={achievement.id} 
                  className={`p-6 transition-all hover:scale-105 ${
                    achievement.unlocked 
                      ? 'bg-gradient-to-br from-game-gold/20 to-game-orange/20 border-game-gold animate-pulse-glow' 
                      : 'opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-game-gold to-game-orange animate-bounce-subtle' 
                        : 'bg-muted'
                    }`}>
                      <Icon 
                        name={achievement.icon as any} 
                        size={32} 
                        className={achievement.unlocked ? 'text-white' : 'text-muted-foreground'} 
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{achievement.title}</h3>
                        {achievement.unlocked && (
                          <Badge className="bg-game-gold text-white">
                            ✓ Разблокировано
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Прогресс</span>
                          <span className="font-medium">{achievement.progress}%</span>
                        </div>
                        <Progress value={achievement.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6 p-8 bg-gradient-to-r from-game-purple/10 via-game-orange/10 to-game-blue/10 text-center">
              <Icon name="Sparkles" size={48} className="mx-auto mb-4 text-game-gold animate-sparkle" />
              <h3 className="text-2xl font-semibold mb-2">Продолжай в том же духе! 🚀</h3>
              <p className="text-muted-foreground">Выполняй задания, чтобы разблокировать новые достижения</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;