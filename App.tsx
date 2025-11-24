import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import LiveAnalysis from './pages/LiveAnalysis';
import ImageAnalysis from './pages/ImageAnalysis';
import LinkAnalysis from './pages/LinkAnalysis';
import VideoAnalysis from './pages/VideoAnalysis'; // Re-adicionado
import Signals from './pages/Signals';
import Strategies from './pages/Strategies';
import Settings from './pages/Settings';
import { AiMemoryProvider } from './context/AiMemoryContext';

const App: React.FC = () => {
    return (
        <AiMemoryProvider>
            <HashRouter>
                <Toaster
                    position="top-center"
                    reverseOrder={false}
                    toastOptions={{
                        className: '',
                        style: {
                            background: 'rgba(23, 10, 36, 0.8)',
                            color: '#fff',
                            border: '1px solid #a855f7',
                            backdropFilter: 'blur(10px)',
                        },
                    }}
                />
                <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/live-analysis" element={<LiveAnalysis />} />
                            <Route path="/image-analysis" element={<ImageAnalysis />} />
                            <Route path="/link-analysis" element={<LinkAnalysis />} />
                            <Route path="/video-analysis" element={<VideoAnalysis />} /> {/* Re-adicionado */}
                            <Route path="/signals" element={<Signals />} />
                            <Route path="/strategies" element={<Strategies />} />
                            <Route path="/settings" element={<Settings />} />
                        </Routes>
                    </main>
                </div>
            </HashRouter>
        </AiMemoryProvider>
    );
};

export default App;