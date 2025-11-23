'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface DraftSession {
    id: number;
    sport: number;
    sport_name: string;
    status: string;
    current_round: number;
    current_pick_index: number;
    can_participate: boolean;
    your_turn: boolean;
}

export default function ActiveDraftsWidget() {
    const router = useRouter();
    const [drafts, setDrafts] = useState<DraftSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveDrafts();
        // Auto-refresh every 10 seconds
        const interval = setInterval(fetchActiveDrafts, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchActiveDrafts = async () => {
        try {
            const response = await api.get('/api/log/draft/sessions/');
            // Filter to only show in-progress drafts where user can participate or it's their turn
            const active = response.data.filter(
                (d: DraftSession) => d.status === 'in_progress' && (d.can_participate || d.your_turn)
            );
            setDrafts(active);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch drafts', err);
            setLoading(false);
        }
    };

    if (loading || drafts.length === 0) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        Active Drafts
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                        {drafts.filter(d => d.your_turn).length > 0
                            ? "It's your turn to pick!"
                            : 'Draft sessions in progress'}
                    </p>
                </div>
                <button
                    onClick={() => router.push('/log/drafts')}
                    className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
                >
                    View All
                </button>
            </div>

            <div className="space-y-3">
                {drafts.map((draft) => (
                    <div
                        key={draft.id}
                        className={`bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-opacity-30 transition-all ${
                            draft.your_turn ? 'ring-2 ring-white animate-pulse' : ''
                        }`}
                        onClick={() => router.push(`/log/draft/${draft.sport}`)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-white">
                                    {draft.sport_name}
                                    {draft.your_turn && <span className="ml-2">🎯</span>}
                                </h4>
                                <p className="text-blue-100 text-sm">
                                    Round {draft.current_round} • Pick #{draft.current_pick_index + 1}
                                </p>
                            </div>
                            {draft.your_turn ? (
                                <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                                    YOUR TURN
                                </span>
                            ) : (
                                <span className="px-3 py-1 bg-white bg-opacity-30 text-white rounded-full text-xs">
                                    Live
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
