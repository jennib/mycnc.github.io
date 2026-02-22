import { create } from 'zustand';

export interface LibraryJob {
    id: string;
    name: string;
    timestamp: number;
    size: number;
    content?: string; // We only load this when requested
}

interface LibraryState {
    jobs: LibraryJob[];
    actions: {
        addJob: (name: string, content: string) => Promise<void>;
        removeJob: (id: string) => Promise<void>;
        loadJobContent: (id: string) => Promise<string | null>;
        init: () => Promise<void>;
    };
}

const DB_NAME = 'mycnc-libraryDB';
const STORE_NAME = 'jobsStore';

const getDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
};

export const useLibraryStore = create<LibraryState>((set, get) => ({
    jobs: [],
    actions: {
        init: async () => {
            try {
                const db = await getDB();
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    // Map to exclude content from state to save memory
                    const allJobs = request.result.map(job => ({
                        id: job.id,
                        name: job.name,
                        timestamp: job.timestamp,
                        size: job.size
                    }));

                    allJobs.sort((a, b) => b.timestamp - a.timestamp);
                    set({ jobs: allJobs });
                };
            } catch (e) {
                console.error("Failed to init library DB", e);
            }
        },
        addJob: async (name: string, content: string) => {
            try {
                const db = await getDB();
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);

                const newJob = {
                    id: crypto.randomUUID(),
                    name,
                    timestamp: Date.now(),
                    size: content.length,
                    content
                };

                store.put(newJob);

                transaction.oncomplete = () => {
                    const { jobs } = get();
                    const newJobsList = [{
                        id: newJob.id,
                        name: newJob.name,
                        timestamp: newJob.timestamp,
                        size: newJob.size
                    }, ...jobs];
                    set({ jobs: newJobsList });
                };
            } catch (e) {
                console.error("Failed to add job to library", e);
            }
        },
        removeJob: async (id: string) => {
            try {
                const db = await getDB();
                const transaction = db.transaction([STORE_NAME], 'readwrite');
                const store = transaction.objectStore(STORE_NAME);
                store.delete(id);

                transaction.oncomplete = () => {
                    set({ jobs: get().jobs.filter(j => j.id !== id) });
                };
            } catch (e) {
                console.error("Failed to remove job from library", e);
            }
        },
        loadJobContent: async (id: string) => {
            try {
                const db = await getDB();
                return new Promise((resolve, reject) => {
                    const transaction = db.transaction([STORE_NAME], 'readonly');
                    const store = transaction.objectStore(STORE_NAME);
                    const request = store.get(id);

                    request.onsuccess = () => {
                        resolve(request.result?.content || null);
                    };
                    request.onerror = () => reject(request.error);
                });
            } catch (e) {
                console.error("Failed to load job content", e);
                return null;
            }
        }
    }
}));
