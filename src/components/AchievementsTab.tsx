import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  unlocked: boolean;
}

interface AchievementsTabProps {
  achievements: Achievement[];
}

const AchievementsTab = ({ achievements }: AchievementsTabProps) => {
  return (
    <>
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
    </>
  );
};

export default AchievementsTab;
