import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .order('log_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        setEvents([]);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = () => '📅';
  const getEventColor = () => 'blue';

  const categorizeEvents = (events) => {
    const monthCategories = {};
    
    events.forEach(event => {
      if (!event.log_at) return;
      
      const eventDate = new Date(event.log_at);
      const monthKey = eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      
      if (!monthCategories[monthKey]) {
        monthCategories[monthKey] = [];
      }
      monthCategories[monthKey].push(event);
    });
    
    return monthCategories;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-slate-600 font-medium">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Company Events</h1>
        <p className="text-slate-600">Manage and view all company events, meetings, and holidays.</p>
      </div>

      {/* Events List */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <span>📅</span>
          <span>Events</span>
        </h3>
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">📅</span>
            <h3 className="text-xl font-bold text-slate-700 mb-2">No Events Found</h3>
            <p className="text-slate-500">No events are currently scheduled.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {(() => {
              const categorized = categorizeEvents(events);
              const sortedMonths = Object.keys(categorized).sort((a, b) => new Date(b) - new Date(a));
              
              return sortedMonths.map(month => (
                <div key={month}>
                  <h4 className="text-lg font-semibold text-slate-700 mb-3">
                    {month}
                  </h4>
                  <div className="space-y-3">
                    {categorized[month].map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div>
                          <div>
                            <h4 className="font-semibold text-slate-800">{event.title}</h4>
                            <p className="text-sm text-slate-600">
                              {(() => {
                                const dateValue = event.log_at;
                                if (!dateValue) return 'No date available';
                                const date = new Date(dateValue);
                                if (isNaN(date.getTime())) return 'Invalid date format';
                                return date.toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'long',
                                  day: 'numeric' 
                                }).replace(/(\d+)/, (match) => {
                                  const day = parseInt(match);
                                  const suffix = day % 10 === 1 && day !== 11 ? 'st' : 
                                                day % 10 === 2 && day !== 12 ? 'nd' : 
                                                day % 10 === 3 && day !== 13 ? 'rd' : 'th';
                                  return `${day}${suffix}`;
                                });
                              })()
                              }
                            </p>
                            {event.description && (
                              <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()
            }
          </div>
        )}
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <span>🗓️</span>
          <span>Calendar View</span>
        </h3>
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🗓️</span>
          <h3 className="text-xl font-bold text-slate-700 mb-2">Calendar Coming Soon</h3>
          <p className="text-slate-500">Full calendar view will be available in the next update.</p>
        </div>
      </div>
    </div>
  );
}