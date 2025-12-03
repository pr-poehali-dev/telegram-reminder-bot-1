import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface UserHeaderProps {
  userLevel: number;
  userXP: number;
  nextLevelXP: number;
}

const UserHeader = ({ userLevel, userXP, nextLevelXP }: UserHeaderProps) => {
  return (
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
  );
};

export default UserHeader;
