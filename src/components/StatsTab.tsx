import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface StatsTabProps {
  stats: {
    totalCompleted: number;
    activeReminders: number;
    overdueCount: number;
    streak: number;
  };
}

const StatsTab = ({ stats }: StatsTabProps) => {
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Icon name="TrendingUp" size={28} className="text-game-purple" />
          Прогресс за неделю
        </h3>
        <div className="space-y-4">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => {
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
  );
};

export default StatsTab;
