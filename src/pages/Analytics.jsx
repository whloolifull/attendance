import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function Analytics() {
  const navigate = useNavigate();
  const [attendanceData, setAttendanceData] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    avgWorkHours: 0,
    attendanceRate: 0,
    totalEmployees: 0,
    todayPresent: 0,
    onTimeRate: 0,
    weeklyTrend: [],
    locationStats: {},
    monthlyComparison: []
  });
  const [todayAttendanceData, setTodayAttendanceData] = useState([]);
  const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'week', 'month', 'today'

  useEffect(() => {
    fetchAnalyticsData();
    fetchTotalEmployees();
    fetchTodayAttendanceForTrend();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (attendanceData.length > 0) {
      calculateAnalytics(attendanceData);
    }
  }, [attendanceData, todayAttendanceData]);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('report_attendance_daily')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        setAttendanceData([]);
        return;
      }
      
      setAttendanceData(data || []);
    } catch (error) {
      setAttendanceData([]);
    }
  };

  const fetchTotalEmployees = async () => {
    try {
      const { count, error } = await supabase
        .from('user')
        .select('*', { count: 'exact', head: true });

      if (!error) {
        setAnalytics(prev => ({ ...prev, totalEmployees: count || 0 }));
      }
    } catch (error) {
      console.error('Error fetching total employees:', error);
    }
  };

  const fetchTodayAttendanceForTrend = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('attendance')
        .select('*');

      if (!error) {
        const todayRecords = data?.filter(record => 
          record.log_at?.startsWith(today)
        ) || [];
        setTodayAttendanceData(todayRecords);
        setAnalytics(prev => ({ ...prev, todayPresent: todayRecords.length }));
        // Recalculate analytics with today's data
        if (attendanceData.length > 0) {
          calculateAnalytics(attendanceData);
        }
      } else {
        console.error('Error fetching today attendance:', error);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('event')
        .select('*')
        .limit(3)
        .order('id', { ascending: false });

      if (error) {
        console.error('Events error:', error);
        setEvents([]);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    }
  };

  const calculateAnalytics = (data) => {
    if (!data || !data.length) {
      setAnalytics(prev => ({
        ...prev,
        avgWorkHours: 0,
        attendanceRate: 0,
        onTimeRate: 0,
        weeklyTrend: [],
        locationStats: {},
        monthlyComparison: []
      }));
      return;
    }

    // Calculate average work hours
    const validRecords = data.filter(r => r.total_hours && !isNaN(parseFloat(r.total_hours)));
    const avgHours = validRecords.length > 0 
      ? validRecords.reduce((sum, r) => sum + parseFloat(r.total_hours), 0) / validRecords.length 
      : 0;

    // Calculate attendance rate (complete records vs total)
    const completeRecords = data.filter(r => r.clock_in && r.clock_out);
    const attendanceRate = data.length > 0 ? (completeRecords.length / data.length) * 100 : 0;

    // Note: totalEmployees is now fetched separately from user table

    // Calculate on-time rate (assuming 9:00 AM is standard start)
    const onTimeRecords = data.filter(r => {
      if (!r.clock_in) return false;
      try {
        const clockInTime = new Date(r.clock_in);
        const hours = clockInTime.getHours();
        const minutes = clockInTime.getMinutes();
        return hours < 9 || (hours === 9 && minutes === 0);
      } catch {
        return false;
      }
    });
    const onTimeRate = completeRecords.length > 0 ? (onTimeRecords.length / completeRecords.length) * 100 : 0;

    // Weekly trend (last 7 weekdays only)
    const last7Days = [];
    let date = new Date();
    while (last7Days.length < 7) {
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude Sunday (0) and Saturday (6)
        last7Days.unshift(date.toISOString().split('T')[0]);
      }
      date.setDate(date.getDate() - 1);
    }
    
    // Monday to Friday for chart display (weekdays only)
    const getMondayOfCurrentWeek = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return monday;
    };
    
    const mondayToFriday = [...Array(5)].map((_, i) => {
      const monday = getMondayOfCurrentWeek();
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      return date.toISOString().split('T')[0];
    });

    const weeklyTrend = last7Days.map(date => {
      const today = new Date().toISOString().split('T')[0];
      
      if (date === today) {
        // Use today's data from attendance table
        const todayCount = todayAttendanceData.length;
        return {
          date,
          avgHours: 0, // No hours data from attendance table
          attendance: todayCount
        };
      } else {
        // Use historical data from report_attendance_daily
        const dayRecords = data.filter(r => r.date === date);
        
        const avgHoursForDay = dayRecords.length > 0 
          ? dayRecords.filter(r => r.total_hours).reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0) / dayRecords.length
          : 0;
        
        const attendanceCount = dayRecords.filter(r => r.clock_in && r.clock_out).length;
        
        return {
          date,
          avgHours: avgHoursForDay,
          attendance: attendanceCount
        };
      }
    });
    
    const chartData = mondayToFriday.map(date => {
      const dayRecords = data.filter(r => r.date === date);
      
      const avgHoursForDay = dayRecords.length > 0 
        ? dayRecords.filter(r => r.total_hours).reduce((sum, r) => sum + parseFloat(r.total_hours || 0), 0) / dayRecords.length
        : 0;
      
      return {
        date,
        avgHours: avgHoursForDay
      };
    });

    // Location statistics
    const locationStats = data.reduce((acc, record) => {
      const location = record.work_location || 'Remote';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {});

    setAnalytics(prev => ({
      ...prev,
      avgWorkHours: avgHours,
      attendanceRate,
      onTimeRate,
      weeklyTrend,
      chartData,
      locationStats,
      monthlyComparison: []
    }));
  };

  const StatCard = ({ title, value, icon, color = "primary", suffix = "" }) => {
    const displayValue = typeof value === 'number' 
      ? (title.includes('Employee') || title.includes('Present') ? Math.round(value) : value.toFixed(1))
      : value;
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 text-sm font-medium">{title}</p>
            <p className={`text-3xl font-bold text-${color} mt-2`}>
              {displayValue}{suffix}
            </p>
          </div>
          <div className={`w-12 h-12 bg-${color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
            <span className="text-2xl">{icon}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-slate-600 font-medium">Loading analytics...</span>
        </div>
      </div>
    );
  }

  // No data state
  if (!attendanceData.length) {
    return (
      <div className="space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">HR Analytics</h1>
          <p className="text-slate-600">Comprehensive insights into attendance patterns and workforce metrics.</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-12 text-center">
          <span className="text-8xl mb-6 block">📊</span>
          <h3 className="text-2xl font-bold text-slate-700 mb-4">No Data Available</h3>
          <p className="text-slate-500 mb-6">No attendance records found in the database.</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-700 text-sm">
              💡 <strong>Tip:</strong> Check your Supabase attendance table or add some test data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">HR Analytics</h1>
        <p className="text-slate-600">Comprehensive insights into attendance patterns and workforce metrics.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Average Work Hours"
          value={analytics.avgWorkHours}
          icon="⏰"
          suffix="h"
        />
        <StatCard
          title="Attendance Rate"
          value={analytics.attendanceRate}
          icon="📊"
          suffix="%"
        />
        <StatCard
          title="Total Employees"
          value={analytics.totalEmployees}
          icon="👥"
        />
        <StatCard
          title="Today Present"
          value={analytics.todayPresent}
          icon="✅"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Attendance Trend */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <span>📈</span>
            <span>Weekly Attendance Trend</span>
          </h3>
          {analytics.weeklyTrend.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">📅</span>
              <p className="text-slate-500">No recent attendance data available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.weeklyTrend.map((day, index) => {
                const today = new Date().toISOString().split('T')[0];
                const isToday = day.date === today;
                const hasData = day.attendance > 0;
                
                return (
                  <div key={day.date} className="flex items-center justify-between">
                    <span className={`text-slate-600 text-sm ${isToday && !hasData ? 'italic' : ''}`}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      {isToday && !hasData && <span className="text-orange-500 ml-1">(No data today)</span>}
                    </span>
                    <div className="flex items-center space-x-3">
                      <div className="w-32 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            hasData ? 'bg-primary' : 'bg-slate-300'
                          }`}
                          style={{ width: `${analytics.totalEmployees > 0 ? Math.min((day.attendance / analytics.totalEmployees) * 100, 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-medium w-12 text-right ${
                        hasData ? 'text-slate-700' : 'text-slate-400'
                      }`}>
                        {day.attendance}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Work Location Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
              <span>📍</span>
              <span>Work Location Distribution</span>
            </h3>
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="px-3 py-1 pr-12 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          {Object.keys(analytics.locationStats).length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-3 block">📍</span>
              <p className="text-slate-500">No location data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {(() => {
                const getFilteredLocationStats = () => {
                  let filteredData = attendanceData;
                  const today = new Date();
                  
                  switch(locationFilter) {
                    case 'today':
                      const todayStr = today.toISOString().split('T')[0];
                      filteredData = attendanceData.filter(r => r.date === todayStr);
                      break;
                    case 'week':
                      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                      const weekAgoStr = weekAgo.toISOString().split('T')[0];
                      filteredData = attendanceData.filter(r => {
                        if (r.date < weekAgoStr) return false;
                        const recordDate = new Date(r.date);
                        const dayOfWeek = recordDate.getDay();
                        return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
                      });
                      break;
                    case 'month':
                      const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                      const monthAgoStr = monthAgo.toISOString().split('T')[0];
                      filteredData = attendanceData.filter(r => {
                        if (r.date < monthAgoStr) return false;
                        const recordDate = new Date(r.date);
                        const dayOfWeek = recordDate.getDay();
                        return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
                      });
                      break;
                    default:
                      filteredData = attendanceData;
                  }
                  
                  const locationStats = filteredData.reduce((acc, record) => {
                    const location = record.work_location || 'Remote';
                    acc[location] = (acc[location] || 0) + 1;
                    return acc;
                  }, {});
                  
                  return { locationStats, totalRecords: filteredData.length };
                };
                
                const { locationStats, totalRecords } = getFilteredLocationStats();
                
                return Object.entries(locationStats)
                  .sort(([,a], [,b]) => b - a)
                  .map(([location, count]) => {
                    const percentage = totalRecords > 0 ? (count / totalRecords) * 100 : 0;
                  const colors = {
                    'Remote': { bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-50' },
                    'Office': { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50' },
                    'Hybrid': { bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-50' }
                  };
                  const color = colors[location] || { bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-50' };
                  
                    return (
                    <div key={location} className={`${color.light} border border-opacity-20 rounded-lg p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">
                            {location === 'Remote' ? '🏠' : location === 'Office' ? '🏢' : location === 'Hybrid' ? '🔄' : '📍'}
                          </span>
                          <span className={`font-semibold ${color.text}`}>{location}</span>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${color.text}`}>{count}</div>
                          <div className="text-xs text-slate-500">{percentage.toFixed(1)}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`${color.bg} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                  });
              })()}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-center text-sm text-slate-600">
                  Total Records: <span className="font-semibold">{(() => {
                    const { totalRecords } = (() => {
                      let filteredData = attendanceData;
                      const today = new Date();
                      
                      switch(locationFilter) {
                        case 'today':
                          const todayStr = today.toISOString().split('T')[0];
                          filteredData = attendanceData.filter(r => r.date === todayStr);
                          break;
                        case 'week':
                          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                          const weekAgoStr = weekAgo.toISOString().split('T')[0];
                          filteredData = attendanceData.filter(r => {
                            if (r.date < weekAgoStr) return false;
                            const recordDate = new Date(r.date);
                            const dayOfWeek = recordDate.getDay();
                            return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
                          });
                          break;
                        case 'month':
                          const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                          const monthAgoStr = monthAgo.toISOString().split('T')[0];
                          filteredData = attendanceData.filter(r => {
                            if (r.date < monthAgoStr) return false;
                            const recordDate = new Date(r.date);
                            const dayOfWeek = recordDate.getDay();
                            return dayOfWeek !== 0 && dayOfWeek !== 6; // Exclude weekends
                          });
                          break;
                        default:
                          filteredData = attendanceData;
                      }
                      return { totalRecords: filteredData.length };
                    })();
                    return totalRecords;
                  })()}</span> 
                  <span className="text-xs text-slate-400">({locationFilter === 'all' ? 'all time' : locationFilter})</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Average Hours by Day and Event Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Average Hours by Day */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <span>⏱️</span>
            <span>Average Work Hours by Day</span>
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {analytics.chartData?.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-slate-500 mb-2">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="relative h-20 bg-slate-100 rounded-lg flex items-end justify-center">
                  <div 
                    className="bg-primary rounded-t-lg w-6 transition-all duration-300"
                    style={{ height: `${Math.max((day.avgHours / 10) * 100, 5)}%` }}
                  ></div>
                </div>
                <div className="text-xs font-medium text-slate-700 mt-1">
                  {day.avgHours.toFixed(1)}h
                </div>
              </div>
            )) || []}
          </div>
        </div>

        {/* Event Calendar Overview */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <span>📅</span>
            <span>Event Calendar Overview</span>
          </h3>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl mb-3 block">📅</span>
                <p className="text-slate-500">No upcoming events</p>
              </div>
            ) : (
              events.map((event) => {
                const dateValue = event.log_at;
                const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                }) : 'No date';
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-600">📅</span>
                      <div>
                        <p className="font-medium text-blue-800">{event.title || 'Untitled Event'}</p>
                        <p className="text-sm text-blue-600">{formattedDate}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">Event</span>
                  </div>
                );
              })
            )}
            
            <div className="text-center pt-2">
              <button 
                onClick={() => navigate('/events')}
                className="text-primary hover:text-primary-dark text-sm font-medium hover:underline cursor-pointer"
              >
                View Full Calendar →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Insights */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <span>💡</span>
          <span>Key Insights</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Attendance Performance</h4>
            <p className="text-blue-700 text-sm">
              {analytics.attendanceRate >= 90 
                ? "Excellent attendance rate! Team is consistently present."
                : analytics.attendanceRate >= 75
                ? "Good attendance rate with room for improvement."
                : "Attendance needs attention. Consider reviewing policies."
              }
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">Work Hours Trend</h4>
            <p className="text-green-700 text-sm">
              {analytics.avgWorkHours >= 8 
                ? "Team is meeting standard work hour expectations."
                : analytics.avgWorkHours >= 6
                ? "Work hours are below standard. Monitor workload distribution."
                : "Significantly low work hours detected. Review attendance policies."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}