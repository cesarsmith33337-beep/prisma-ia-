import React, { useState } from 'react';
import { TrendingUp, Zap, Shield, Save, RefreshCw, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Settings: React.FC = () => {
    const [settings, setSettings] = useState({
        rsi: { period: 14, overbought: 70, oversold: 30, enabled: true },
        macd: { fast: 12, slow: 26, signal: 9, enabled: true },
        trading: { minProbability: 80, maxSignalsPerHour: 5, autoTrade: false },
        strategies: { priceAction: true, volume: true, indicators: true }
    });

    const handleSave = () => toast.success('Configurações salvas com sucesso!');
    const handleReset = () => toast.error('Configurações restauradas para o padrão!');
    const handleImportStrategy = () => toast.info('Funcionalidade de importação de estratégia em desenvolvimento.');

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                    <p className="text-gray-400 text-sm">Personalize a PRISMA IA de acordo com sua estratégia.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleReset} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all text-sm"><RefreshCw className="w-4 h-4" />Restaurar</button>
                    <button onClick={handleSave} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-all text-sm"><Save className="w-4 h-4" />Salvar</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center"><TrendingUp className="w-5 h-5 mr-3 text-blue-400" />Indicadores Técnicos</h2>
                    <div>
                        <h3 className="text-lg font-medium text-white mb-3">RSI</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div><label className="block text-gray-400 text-xs mb-1">Período</label><input type="number" defaultValue={settings.rsi.period} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" /></div>
                            <div><label className="block text-gray-400 text-xs mb-1">Sobrecompra</label><input type="number" defaultValue={settings.rsi.overbought} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" /></div>
                            <div><label className="block text-gray-400 text-xs mb-1">Sobrevenda</label><input type="number" defaultValue={settings.rsi.oversold} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" /></div>
                        </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-medium text-white mb-3">MACD</h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div><label className="block text-gray-400 text-xs mb-1">Rápida</label><input type="number" defaultValue={settings.macd.fast} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" /></div>
                            <div><label className="block text-gray-400 text-xs mb-1">Lenta</label><input type="number" defaultValue={settings.macd.slow} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" /></div>
                            <div><label className="block text-gray-400 text-xs mb-1">Sinal</label><input type="number" defaultValue={settings.macd.signal} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" /></div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center"><Zap className="w-5 h-5 mr-3 text-yellow-400" />Trading</h2>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Assertividade Mínima ({settings.trading.minProbability}%)</label>
                        <input type="range" min="70" max="95" value={settings.trading.minProbability} onChange={e => setSettings(s => ({...s, trading: {...s.trading, minProbability: parseInt(e.target.value) }}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider" />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Máximo de Sinais por Hora</label>
                        <input type="number" defaultValue={settings.trading.maxSignalsPerHour} className="w-full bg-[#100e19] text-white p-2 rounded border border-purple-500/20" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
                        <label className="text-white">Auto Trading <span className="text-red-500 text-xs">(BETA)</span></label>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-[#1e1c3a] rounded-xl p-6 border border-purple-500/20">
                 <h2 className="text-xl font-bold text-white flex items-center mb-4"><Shield className="w-5 h-5 mr-3 text-fuchsia-400" />Gerenciamento de Estratégias</h2>
                 <div className="bg-[#100e19] p-4 rounded-lg border border-purple-500/20 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-grow">
                        <h3 className="font-medium text-white">Importar Estratégia</h3>
                        <p className="text-xs text-gray-400">Faça upload de um arquivo .json para adicionar uma nova estratégia ao motor da IA.</p>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <input type="file" id="strategy-upload" className="hidden" accept=".json" />
                        <label htmlFor="strategy-upload" className="w-full cursor-pointer text-center bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all text-sm">
                            Escolher Arquivo
                        </label>
                        <button onClick={handleImportStrategy} className="flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-lg transition-all text-sm w-full sm:w-auto">
                            <Upload className="w-4 h-4" /> Salvar
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default Settings;
