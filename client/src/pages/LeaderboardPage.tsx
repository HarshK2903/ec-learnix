import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { Trophy, Medal, Crown, Sparkles, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface LeaderboardEntry {
  userId: string;
  firstName: string;
  enhancedCount: number;
}

const RANK_CONFIG = [
  {
    gradient: 'from-amber-400 to-yellow-500',
    bgGlow: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    textColor: 'text-amber-400',
    icon: Crown,
    label: '1st',
  },
  {
    gradient: 'from-slate-300 to-slate-400',
    bgGlow: 'bg-slate-400/10',
    border: 'border-slate-400/30',
    textColor: 'text-slate-300',
    icon: Medal,
    label: '2nd',
  },
  {
    gradient: 'from-orange-400 to-amber-600',
    bgGlow: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    textColor: 'text-orange-400',
    icon: Medal,
    label: '3rd',
  },
];

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        setLeaderboard(res.data.leaderboard);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center gap-4 mb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-2xl shadow-lg shadow-amber-500/20">
          <Trophy className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Top users by AI-enhanced documents
          </p>
        </div>
      </motion.div>

      {leaderboard.length === 0 ? (
        <Card className="border-dashed border-2 border-border/40 bg-card/30">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Trophy className="h-12 w-12 text-muted-foreground/20 mb-3" />
            <h3 className="font-semibold mb-1">No rankings yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Be the first to enhance a document and claim the top spot!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.userId === (user as any)?._id || entry.userId === (user as any)?.id;
            const isTopThree = index < 3;
            const rankConfig = isTopThree ? RANK_CONFIG[index] : null;
            const RankIcon = rankConfig?.icon || TrendingUp;

            return (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Card
                  className={`group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    isCurrentUser
                      ? 'border-violet-500/40 bg-violet-500/5 ring-1 ring-violet-500/20'
                      : isTopThree && rankConfig
                      ? `${rankConfig.border} ${rankConfig.bgGlow}`
                      : 'border-border/30 bg-card/40'
                  }`}
                >
                  <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                    {/* Rank */}
                    <div className="flex items-center justify-center w-10 shrink-0">
                      {isTopThree && rankConfig ? (
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${rankConfig.gradient} shadow-md`}>
                          <RankIcon className="h-5 w-5 text-white" />
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground/50">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback
                        className={`font-semibold text-sm ${
                          isTopThree && rankConfig
                            ? `bg-gradient-to-br ${rankConfig.gradient} text-white`
                            : 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
                        }`}
                      >
                        {entry.firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate">
                          {entry.firstName}
                        </p>
                        {isCurrentUser && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-violet-500/15 text-violet-400 border-violet-500/20"
                          >
                            You
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-400 border-amber-500/20 gap-0.5"
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            Top
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Rank #{index + 1}
                      </p>
                    </div>

                    {/* Count */}
                    <div className="text-right shrink-0">
                      <p className={`text-xl font-bold ${
                        isTopThree && rankConfig
                          ? rankConfig.textColor
                          : 'text-foreground'
                      }`}>
                        {entry.enhancedCount}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        enhanced
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
