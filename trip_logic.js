// Trip Data Configuration
const defaultTripEvents = [
    { id: 'start', title: 'Trip Begins: Assembly', time: 'Feb 7', description: 'Assembly at Thrissur Railway Station. Head Count Check.', status: 'pending', icon: '🚩', countCheck: true },
    { id: 'train_board', title: 'Boarding Train', time: 'Feb 7', description: 'Train Departs towards Delhi', status: 'pending', icon: '🚆' },
    { id: 'delhi_reach', title: 'Reached Delhi', time: 'Feb 8', description: 'Arrival at Hazrat Nizamuddin Station. Head Count Check.', status: 'pending', icon: '📍', countCheck: true },
    { id: 'bus_board', title: 'Boarding Volvo', time: 'Feb 8', description: 'Transfer to Volvo Bus for Manali', status: 'pending', icon: '🚌' },
    { id: 'manali_reach', title: 'Reached Manali', time: 'Feb 9', description: 'Arrival in Manali. Hotel Check-in. Head Count Check.', status: 'pending', icon: '🏔️', countCheck: true },
    { id: 'sightseeing_manali', title: 'Local Sightseeing', time: 'Feb 9', description: 'Hadimba Temple, Van Vihar, Mall Road', status: 'pending', icon: '📷' },

    // Day 4 Updated (Feb 10)
    { id: 'snow_point_start', title: 'Depart for Snow Point', time: 'Feb 10', description: 'Early morning departure for Snow Point.', status: 'pending', icon: '❄️' },
    { id: 'snow_point_check', title: 'Snow Point Check', time: 'Feb 10', description: 'Post-excursion Head Count. ⚠️ ALERT: Not all students reported.', status: 'pending', icon: '📋', countCheck: true, warning: true },

    { id: 'kullu_visit', title: 'Kullu Visit', time: 'Feb 11', description: 'River Rafting. Head Count Check.', status: 'pending', icon: '🌊', countCheck: true },
    { id: 'return_journey', title: 'Return Journey', time: 'Feb 11', description: 'Volvo Bus to Delhi boarded', status: 'pending', icon: '🚌' },
    { id: 'delhi_sight', title: 'Delhi Sightseeing', time: 'Feb 12', description: 'Sightseeing. Head Count Check.', status: 'pending', icon: '🕌', countCheck: true },
    { id: 'train_return', title: 'Train to Mumbai', time: 'Feb 12', description: 'Boarding train to Mumbai', status: 'pending', icon: '🚆' },
    { id: 'mumbai_transfer', title: 'Mumbai Transfer', time: 'Feb 13', description: 'Transfer to LTT. Head Count Check.', status: 'pending', icon: '⇄', countCheck: true },
    { id: 'home_arrival', title: 'Homecoming', time: 'Feb 14', description: 'Reached Kerala safely', status: 'pending', icon: '🏡' }
];

// Supabase Configuration
// REPLACE THESE WITH YOUR OWN KEYS FROM SUPABASE DASHBOARD
const SUPABASE_URL = 'https://wgdyfxndajymkuiepqrl.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnZHlmeG5kYWp5bWt1aWVwcXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNDcwNjgsImV4cCI6MjA4NTcyMzA2OH0.V10YJw5wAOZLY4RsVDENcG-FgDDaWf5recCE4FUwysk';

// Initialize Client (if library is loaded)
let db;
if (window.supabase && window.supabase.createClient) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.db = db; // Expose for Realtime subscripts
}

// Content Management Class (Async Version)
class TripManager {
    constructor() {
        this.events = [];
    }

    // Fetch all events from Supabase
    async fetchEvents() {
        if (!db) return [];

        const { data, error } = await db
            .from('trip_events')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching events:', error);
            return [];
        }

        this.events = data;
        return data;
    }

    // Update status
    async updateStatus(id, newStatus) {
        let updates = { status: newStatus };

        // Auto-capture live time
        if (newStatus === 'active' || newStatus === 'completed') {
            const now = new Date();
            updates.time = now.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }

        const { error } = await db
            .from('trip_events')
            .update(updates)
            .eq('id', id);

        if (error) console.error('Error updating status:', error);
        return !error;
    }

    // Update time manual
    async updateTime(id, newTime) {
        const { error } = await db
            .from('trip_events')
            .update({ time: newTime })
            .eq('id', id);

        return !error;
    }

    // Toggle Head Count
    async toggleHeadCount(id) {
        // We need current state first
        const event = this.events.find(e => e.id === id);
        if (!event) return false;

        const { error } = await db
            .from('trip_events')
            .update({ head_count_verified: !event.head_count_verified })
            .eq('id', id);

        return !error;
    }

    // Reset Data (Re-applies defaults logic if needed, or just resets columns)
    async resetData() {
        // Resetting everything to pending/default
        // In a real app we might delete and re-insert, or update all.
        // Here we'll just update all to 'pending' and clear custom times?
        // For simplicity, let's just update all status to pending.

        const { error } = await db
            .from('trip_events')
            .update({
                status: 'pending',
                head_count_verified: false,
                // We might want to keep the original hardcoded dates? 
                // For this demo, let's not wipe the dates completely if they are hardcoded rows.
            })
            .neq('id', 'placeholder'); // Update all

        return !error;
    }

    getEvents() {
        return this.events;
    }
}

// Global Instance
window.tripManager = new TripManager();
