import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface NewTask {
  title: string;
  description: string;
  interval: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high';
}

interface CreateTaskFormProps {
  newTask: NewTask;
  onTaskChange: (task: NewTask) => void;
  onCreateTask: () => void;
}

const CreateTaskForm = ({ newTask, onTaskChange, onCreateTask }: CreateTaskFormProps) => {
  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <Label htmlFor="title" className="text-lg">Название задания *</Label>
          <Input 
            id="title"
            placeholder="Например: Позвонить клиенту" 
            value={newTask.title}
            onChange={(e) => onTaskChange({...newTask, title: e.target.value})}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-lg">Описание</Label>
          <Textarea 
            id="description"
            placeholder="Подробности задания..."
            value={newTask.description}
            onChange={(e) => onTaskChange({...newTask, description: e.target.value})}
            className="mt-2 min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="interval" className="text-lg">Интервал напоминаний</Label>
            <Select value={newTask.interval} onValueChange={(value) => onTaskChange({...newTask, interval: value})}>
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
            <Select value={newTask.priority} onValueChange={(value: any) => onTaskChange({...newTask, priority: value})}>
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
            onChange={(e) => onTaskChange({...newTask, assignedTo: e.target.value})}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">Оставьте пустым для себя</p>
        </div>

        <Button 
          onClick={onCreateTask}
          size="lg"
          className="w-full bg-gradient-to-r from-game-purple via-game-orange to-game-blue hover:opacity-90 text-white text-lg"
        >
          <Icon name="Plus" size={24} className="mr-2" />
          Создать задание
        </Button>
      </div>
    </Card>
  );
};

export default CreateTaskForm;
