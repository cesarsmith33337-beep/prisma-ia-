// FIX: Replaced incorrect file content with a proper EventBus implementation to resolve circular dependencies and export errors.
type Listener = (...args: any[]) => void;

class EventBus {
    private events: { [key: string]: Listener[] } = {};

    on(event: string, listener: Listener): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    emit(event: string, ...args: any[]): void {
        if (this.events[event]) {
            this.events[event].forEach(listener => listener(...args));
        }
    }

    off(event: string, listenerToRemove: Listener): void {
        if (!this.events[event]) {
            return;
        }
        this.events[event] = this.events[event].filter(listener => listener !== listenerToRemove);
    }
}

export const eventBus = new EventBus();