import * as React from 'react';
import { Target, Eye, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const strategies = [
    { id: 1, name: 'Price Action Avançada', category: 'price-action', winRate: 87, riskLevel: 'MÉDIO', complexity: 'AVANÇADO', description: 'Análise de movimentação pura do preço sem indicadores.' },
    { id: 2, name: 'Volume Relativo + Força', category: 'indicators', winRate: 82, riskLevel: 'BAIXO', complexity: 'INTERMEDIÁRIO', description: 'Análise de volume combinada com força do movimento.' },
    { id: 3, name: 'RSI + MACD Confluência', category: 'indicators', winRate: 78, riskLevel: 'BAIXO', complexity: 'FÁCIL', description: 'Combinação de RSI e MACD para máxima precisão.' },
    { id: 4, name: 'ZigZag Supremo', category: 'indicators', winRate: 85, riskLevel: 'MÉDIO', complexity: 'INTERMEDIÁRIO', description: 'Estratégia baseada no indicador ZigZag para seguir tendência.' },
    { id: 5, name: 'Arab Traders Strategy', category: 'traders', winRate: 89, riskLevel: 'ALTO', complexity: 'AVANÇADO', description: 'Estratégia dos Arab Traders com foco em padrões específicos.' },
    { id: 6, name: 'Fluxo de Vela', category: 'patterns', winRate: 81, riskLevel: 'MÉDIO', complexity: 'INTERMEDIÁRIO', description: 'Análise do fluxo e direção das velas.' },
];
const categories = [ { id: 'all', name: 'Todas' }, { id: 'price-action', name: 'Price Action' }, { id: 'indicators', name: 'Indicadores' }, { id: 'patterns', name: 'Padrões' }, { id: 'traders', name: 'Traders' }];

const StrategyCard = ({ strategy, onSelect }: { strategy: any, onSelect: (s: any) => void }) => {
    const getRiskColor = (risk: string) => risk === 'BAIXO' ? 'text-green-400 bg-green-500/10 border-green-500/20' : risk === 'MÉDIO' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20';
    return (
        <div
            className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col justify-between h-full"
            onClick={() => onSelect(strategy)}
        >
            <div>
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-white pr-2">{strategy.name}</h3>
                    <div className="flex-shrink-0 flex items-center gap-1 text-green-400"><Target className="w-4 h-4" /><span>{strategy.winRate}%</span></div>
                </div>
                <p className="text-gray-400 text-sm mb-4 min-h-[40px]">{strategy.description}</p>
            </div>
            <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Risco:</span>
                    <span className={`px-2 py-0.5 rounded-full font-medium border ${getRiskColor(strategy.riskLevel)}`}>{strategy.riskLevel}</span>
                </div>
                 <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Complexidade:</span>
                    <span className="font-medium text-purple-300">{strategy.complexity}</span>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 mt-2">
                    <Eye className="w-4 h-4" />Ver Detalhes
                </button>
            </div>
        </div>
    );
};

const Strategies = () => {
    const [selectedCategory, setSelectedCategory] = React.useState('all');
    const [selectedStrategy, setSelectedStrategy] = React.useState<any | null>(null);

    const filteredStrategies = selectedCategory === 'all' ? strategies : strategies.filter(s => s.category === selectedCategory);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-white mb-2">Estratégias de Trading</h1>
                <p className="text-gray-400 text-sm">Explore a coleção de estratégias de alta performance da PRISMA IA.</p>
            </div>

            <div className="bg-[#1e1c3a] rounded-xl p-4 border border-purple-500/20 flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                    <button key={category.id} onClick={() => setSelectedCategory(category.id)} className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${selectedCategory === category.id ? 'bg-purple-600 text-white' : 'bg-[#100e19] text-gray-300 hover:bg-white/10'}`}>
                        {category.name}
                    </button>
                ))}
            </div>

            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredStrategies.map((strategy) => (
                        <motion.div
                            key={strategy.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <StrategyCard strategy={strategy} onSelect={setSelectedStrategy} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </motion.div>
            
            <AnimatePresence>
                {selectedStrategy && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedStrategy(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1e1c3a] rounded-xl p-6 max-w-lg w-full border border-purple-500/30"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-2xl font-bold text-white">{selectedStrategy.name}</h2>
                                <button onClick={() => setSelectedStrategy(null)} className="text-gray-400 hover:text-white"><X /></button>
                            </div>
                            <p className="text-gray-400 mb-4">{selectedStrategy.description}</p>
                            <div className="space-y-2 text-sm bg-[#100e19] p-4 rounded-lg border border-purple-500/20">
                                <div className="flex justify-between"><span className="text-gray-400">Assertividade:</span><span className="font-medium text-green-400">{selectedStrategy.winRate}%</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Risco:</span><span className="font-medium text-yellow-400">{selectedStrategy.riskLevel}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Complexidade:</span><span className="font-medium text-red-400">{selectedStrategy.complexity}</span></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Strategies;