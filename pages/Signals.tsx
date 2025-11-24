import * as React from 'react';
import { TrendingUp, TrendingDown, Clock, Filter, Download, ListX, HelpCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAiMemory } from '../context/AiMemoryContext';

const Signals: React.FC = () => {
    const { signals } = useAiMemory();
    const [filter, setFilter] = React.useState('all');

    const filteredSignals = React.useMemo(() => {
        if (filter === 'all') return signals;
        return signals.filter(signal => signal.status.toLowerCase() === filter);
    }, [signals, filter]);

    const stats = React.useMemo(() => {
        const concluded = signals.filter(s => s.status !== 'PENDING');
        const wins = concluded.filter(s => s.status === 'WIN').length;
        const totalConcluded = concluded.length;
        return {
            total: signals.length,
            pending: signals.filter(s => s.status === 'PENDING').length,
            wins,
            losses: totalConcluded - wins,
            winRate: totalConcluded > 0 ? Math.round((wins / totalConcluded) * 100) : 0,
        };
    }, [signals]);
    
    const handleExport = () => {
        const headers = "ID,Ativo,Direção,Estratégia,Preço,Probabilidade,Horário,Status,Motivo\n";
        const csv = filteredSignals.map(s => 
            `${s.id},${s.asset},${s.direction},"${s.strategy}",${s.price || 'N/A'},${s.probability || 'N/A'},${s.time},${s.status},"${s.reason.replace(/"/g, '""')}"`
        ).join("\n");
        
        const blob = new Blob([headers + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `prisma_ia_sinais_${new Date().toISOString()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const getStatusStyle = (status: 'WIN' | 'LOSS' | 'PENDING') => {
        switch (status) {
            case 'WIN':
                return 'bg-green-500/10 text-green-400 border border-green-500/20';
            case 'LOSS':
                return 'bg-red-500/10 text-red-400 border border-red-500/20';
            case 'PENDING':
                return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
        }
    }


    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Histórico de Sinais</h1>
                <p className="text-gray-400 text-sm">Acompanhe todos os sinais gerados e sua performance.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <StatBox label="Sinais Totais" value={stats.total} />
                <StatBox label="Pendentes" value={stats.pending} valueColor="text-yellow-400" />
                <StatBox label="Vitórias" value={stats.wins} valueColor="text-green-400" />
                <StatBox label="Derrotas" value={stats.losses} valueColor="text-red-400" />
                <StatBox label="Taxa de Acerto" value={`${stats.winRate}%`} valueColor="text-purple-400" />
            </div>

            <div className="bg-[#1e1c3a] rounded-xl p-4 border border-purple-500/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Filter className="w-5 h-5 text-gray-400" />
                    {['all', 'pending', 'win', 'loss'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-[#100e19] hover:bg-white/10 text-gray-300'}`}>
                            {f === 'pending' ? 'Pendentes' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
                <button onClick={handleExport} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors w-full sm:w-auto">
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </button>
            </div>

            <div className="bg-[#1e1c3a] rounded-xl border border-purple-500/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[600px]">
                        <thead className="bg-[#100e19]/50">
                            <tr>
                                {['Ativo', 'Direção', 'Estratégia', 'Horário', 'Status'].map(h => 
                                <th key={h} className="text-left p-4 text-gray-400 font-medium text-xs uppercase tracking-wider">{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSignals.length > 0 ? (
                                filteredSignals.map((signal, index) => (
                                    <motion.tr key={signal.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.02 }} className="border-b border-purple-500/10 hover:bg-purple-500/5">
                                        <td className="p-4 text-white font-medium">{signal.asset}</td>
                                        <td className={`p-4 font-medium flex items-center gap-2 ${signal.direction === 'CALL' ? 'text-green-400' : 'text-red-400'}`}>
                                            {signal.direction === 'CALL' ? <TrendingUp size={16}/> : <TrendingDown size={16}/>} {signal.direction}
                                        </td>
                                        <td className="p-4 text-gray-300">{signal.strategy}</td>
                                        <td className="p-4 text-gray-400">{signal.time}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 ${getStatusStyle(signal.status)}`}>
                                                {signal.status === 'PENDING' && <Loader className="w-3 h-3 animate-spin" />}
                                                {signal.status}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-500">
                                        <ListX className="w-12 h-12 mx-auto mb-3" />
                                        <p>Nenhum sinal encontrado para este filtro.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, valueColor = 'text-white' }) => (
    <div className="bg-[#1e1c3a] rounded-xl p-4 border border-purple-500/20">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</h3>
        <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
);

export default Signals;