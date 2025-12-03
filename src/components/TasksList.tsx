import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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

interface TasksListProps {
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
}

const TasksList = ({ tasks, onCompleteTask }: TasksListProps) => {
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

  const activeTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="space-y-4 animate-fade-in">
      {activeTasks.map(task => (
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
                onClick={() => onCompleteTask(task.id)}
                className="bg-gradient-to-r from-success to-green-600 hover:from-success/90 hover:to-green-600/90"
              >
                <Icon name="Check" size={20} />
                Выполнено
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {activeTasks.length === 0 && (
        <Card className="p-12 text-center">
          <Icon name="CheckCircle2" size={64} className="mx-auto mb-4 text-success" />
          <h3 className="text-2xl font-semibold mb-2">Все задачи выполнены! 🎉</h3>
          <p className="text-muted-foreground">Создайте новое задание, чтобы продолжить прокачку</p>
        </Card>
      )}
    </div>
  );
};

export default TasksList;
