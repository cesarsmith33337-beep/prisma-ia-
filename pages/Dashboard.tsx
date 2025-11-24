import * as React from 'react';
import { TrendingUp, Target, Zap, BarChart3, Wifi, Activity, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAiMemory } from '../context/AiMemoryContext';
import { WelcomeGuide } from '../components/WelcomeGuide';

const Dashboard: React.FC = () => {
    const { signals } = useAiMemory();

    // Calculate stats dynamically based on signals from today with definitive status
    const today = new Date().toLocaleDateString();
    const signalsToday = signals.filter(s => new Date(s.id).toLocaleDateString() === today && s.status !== 'PENDING');

    const wins = signalsToday.filter(s => s.status === 'WIN').length;
    const losses = signalsToday.filter(s => s.status === 'LOSS').length;
    const totalToday = wins + losses;
    const winRateToday = totalToday > 0 ? Math.round((wins / totalToday) * 100) : 0;

    const activeAssets = [...new Set(signals.map(s => s.asset))].length;
    
    const recentSignals = signals.slice(0, 5);
    
    const totalWins = signals.filter(s => s.status === 'WIN').length;
    const totalLosses = signals.filter(s => s.status === 'LOSS').length;
    const totalTrades = totalWins + totalLosses;


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard - PRISMA IA</h1>
        <p className="text-gray-400 text-sm">Sistema conectado • Análise em tempo real</p>
      </div>

      <WelcomeGuide />

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard icon={Zap} title="Sinais Hoje (Concluídos)" value={totalToday} trend={`${wins} W / ${losses} L`} iconBg="bg-blue-500/20" iconColor="text-blue-400" />
        <StatCard icon={Target} title="Taxa de Acerto (Hoje)" value={`${winRateToday}%`} trend="Meta: 85%+" valueColor={winRateToday >= 85 ? "text-green-400" : winRateToday >= 70 ? "text-yellow-400" : "text-red-400"} iconBg="bg-green-500/20" iconColor="text-green-400" />
        <StatCard icon={BarChart3} title="Ativos Operados" value={activeAssets} trend="Pocket Option" iconBg="bg-purple-500/20" iconColor="text-purple-400" trendIcon={Wifi} />
      </div>

       {/* Performance & Recent Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <PerformanceCard total={totalTrades} wins={totalWins} losses={totalLosses} />
         <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-lg font-bold text-white mb-4">Sinais Recentes</h3>
          <div className="space-y-3">
            {recentSignals.length > 0 ? recentSignals.map(signal => (
              <div key={signal.id} className="bg-[#100e19] rounded-lg p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-1 rounded ${signal.direction === 'CALL' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                           {signal.direction === 'CALL' ? <TrendingUp className="w-4 h-4 text-green-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
                        </div>
                        <span className="font-medium text-white text-sm">{signal.asset}</span>
                        <span className="text-xs text-gray-500">{signal.time}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${signal.status === 'WIN' ? 'text-green-400 bg-green-500/10' : signal.status === 'LOSS' ? 'text-red-400 bg-red-500/10' : 'text-yellow-400 bg-yellow-500/10'}`}>{signal.status}</span>
                    </div>
                </div>
              </div>
            )) : (
                <div className="text-center py-6 text-gray-500">
                    <Zap className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">Nenhum sinal gerado ainda.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, trend, valueColor = 'text-white', iconBg, iconColor, trendIcon: TrendIcon = Activity }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#1e1c3a] rounded-xl p-5 border border-purple-500/20"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
    </div>
    <div className="mt-4 flex items-center text-xs text-gray-400">
      <TrendIcon className={`w-4 h-4 mr-1 ${trend.startsWith('-') || trend === 'Negativo' ? 'text-red-400' : 'text-green-400'}`} />
      <span>{trend}</span>
    </div>
  </motion.div>
);

const PerformanceCard = ({ total, wins, losses }) => {
    const winRate = total > 0 ? Math.round((wins/total) * 100) : 0;
    return (
     <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20">
        <h3 className="text-lg font-bold text-white mb-4">Performance Geral (Concluídos)</h3>
        <div className="space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-gray-400">Trades Totais:</span>
                <span className="text-white font-medium">{total.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-400">Wins:</span>
                <span className="text-green-400 font-medium">{wins.toLocaleString('pt-BR')}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-400">Losses:</span>
                <span className="text-red-400 font-medium">{losses.toLocaleString('pt-BR')}</span>
            </div>
             <div className="flex justify-between pt-2 mt-2 border-t border-purple-500/20">
                <span className="text-gray-400">Win Rate:</span>
                <span className="font-medium text-purple-400">{winRate}%</span>
            </div>
        </div>
    </div>
    )
};

export default Dashboard;