import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Zap, TrendingUp, Settings, Menu, X, Sparkles, Activity, Link as LinkIcon, Film } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();

    const navigation = [
        { name: 'Análise de Imagem', href: '/image-analysis', icon: Camera },
        { name: 'Análise em Tempo Real', href: '/live-analysis', icon: Activity },
        { name: 'Análise de Link', href: '/link-analysis', icon: LinkIcon },
        { name: 'Análise de Vídeo', href: '/video-analysis', icon: Film }, // Re-adicionado
        { name: 'Estratégias', href: '/strategies', icon: Zap },
        { name: 'Sinais', href: '/signals', icon: TrendingUp },
        { name: 'Configurações', href: '/settings', icon: Settings }
    ];

    return (
        <nav className="bg-[#100e19]/80 backdrop-blur-md border-b border-purple-500/20 sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-3 group">
                        <motion.div
                            className="w-10 h-10 bg-gradient-to-br from-purple-600 via-violet-500 to-purple-700 rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg shadow-purple-500/50"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                        >
                            <Sparkles className="w-6 h-6 text-white/90 relative z-10" />
                        </motion.div>
                         <div className="relative">
                            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400 tracking-wider prisma-text">
                                PRISMA IA
                            </span>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center space-x-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 z-10 ${
                                        isActive
                                            ? 'text-white'
                                            : 'text-purple-200 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                     {isActive && (
                                        <motion.div
                                            layoutId="active-nav-link"
                                            className="absolute inset-0 bg-purple-600 rounded-lg -z-10"
                                            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="md:hidden"
                >
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navigation.map((item) => {
                             const Icon = item.icon;
                             const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-all ${
                                        isActive
                                            ? 'bg-purple-600 text-white'
                                            : 'text-purple-200 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                     <Icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;