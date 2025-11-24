// FIX: Replaced incorrect file content with the actual QueueStatusToast component implementation.
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { eventBus } from '../services/eventBus';
import { Layers } from 'lucide-react';

export const QueueStatusToast: React.FC = () => {
    const [queueSize, setQueueSize] = useState(0);

    useEffect(() => {
        const handleQueueChange = (size: number) => {
            setQueueSize(size);
        };

        eventBus.on('queue:change', handleQueueChange);

        return () => {
            eventBus.off('queue:change', handleQueueChange);
        };
    }, []);

    useEffect(() => {
        // Aprimoramento: Só mostrar o toast se houver um backlog real (mais de 1 item).
        // Isso evita que o toast apareça para uma única requisição, tornando a UX mais fluida.
        if (queueSize > 1) {
            toast(
                (t) => (
                    <div className="flex items-center gap-3">
                        <div className="animate-spin">
                            <Layers className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-sm">
                            Requisições na fila: <strong>{queueSize}</strong>. A IA está processando em sequência para garantir a estabilidade.
                        </span>
                    </div>
                ),
                {
                    id: 'queue-toast',
                    duration: Infinity,
                    style: {
                        background: 'rgba(23, 10, 36, 0.8)',
                        color: '#fff',
                        border: '1px solid #a855f7',
                        backdropFilter: 'blur(10px)',
                    },
                }
            );
        } else {
            toast.dismiss('queue-toast');
        }
    }, [queueSize]);

    return null; // This component only renders toasts
};