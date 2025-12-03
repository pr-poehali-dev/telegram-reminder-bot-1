import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface StatsCardsProps {
  stats: {
    totalCompleted: number;
    activeReminders: number;
    overdueCount: number;
    streak: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
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
  );
};

export default StatsCards;
