import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WorkspaceBookmark } from '@mycnc/shared';

interface BookmarkState {
    bookmarks: WorkspaceBookmark[];
    categories: string[];
    actions: {
        addBookmark: (bookmark: Omit<WorkspaceBookmark, 'id'>) => void;
        removeBookmark: (id: string) => void;
        updateBookmark: (id: string, updates: Partial<WorkspaceBookmark>) => void;
        addCategory: (category: string) => void;
        removeCategory: (category: string) => void;
    };
}

export const useBookmarkStore = create<BookmarkState>()(
    persist(
        (set) => ({
            bookmarks: [],
            categories: ['General', 'Maintenance', 'Jigs', 'Projects'],
            actions: {
                addBookmark: (bookmark) => {
                    set((state) => ({
                        bookmarks: [...state.bookmarks, { 
                            ...bookmark, 
                            id: Date.now().toString(36) + Math.random().toString(36).substring(2)
                        }]
                    }));
                },
                removeBookmark: (id) => {
                    set((state) => ({
                        bookmarks: state.bookmarks.filter((b) => b.id !== id)
                    }));
                },
                updateBookmark: (id, updates) => {
                    set((state) => ({
                        bookmarks: state.bookmarks.map((b) => b.id === id ? { ...b, ...updates } : b)
                    }));
                },
                addCategory: (category) => {
                    set((state) => ({
                        categories: state.categories.includes(category) 
                            ? state.categories 
                            : [...state.categories, category]
                    }));
                },
                removeCategory: (category) => {
                    set((state) => ({
                        categories: state.categories.filter(c => c !== category)
                    }));
                },
            },
        }),
        {
            name: 'cnc-app-bookmarks',
            partialize: (state) => ({ 
                bookmarks: state.bookmarks,
                categories: state.categories
            }),
            // Use merge to handle migrations or default values
            merge: (persistedState: any, currentState) => ({
                ...currentState,
                ...persistedState,
                bookmarks: (persistedState.bookmarks || []).map((b: any) => ({
                    ...b,
                    reference: b.reference || 'work' // Default to work for old bookmarks
                }))
            })
        }
    )
);
