import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

export default function AnalyticsWidget() {
  const [metrics, setMetrics] = useState({
    avgWorkHours: 0,
    attendanceRate: 0,
    totalEmployees: 0,
    todayAttendance: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuickMetrics();
  }, []);

  const fetchQuickMetrics = async () => {
    try {
      // Fetch report data
      const { data, error } = await supabase
        .from('report_attendance_daily')
        .select('*')
        .order('date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase error:', error);
        setMetrics({ hasData: false });
        return;
      }

      // Fetch total employees
      const { count: totalEmployees } = await supabase
        .from('user')
        .select('*', { count: 'exact', head: true });

      // Fetch today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('*');
      
      const todayRecords = attendanceData?.filter(record => 
        record.created_at?.startsWith(today)
      ) || [];

      calculateMetrics(data || [], totalEmployees || 0, todayRecords.length);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics({ hasData: false });
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data, totalEmployees, todayAttendance) => {
    const validRecords = data?.filter(r => r.total_hours && !isNaN(parseFloat(r.total_hours))) || [];
    const completeRecords = data?.filter(r => r.clock_in && r.clock_out) || [];
    
    const avgHours = validRecords.length > 0 
      ? validRecords.reduce((sum, r) => sum + parseFloat(r.total_hours), 0) / validRecords.length 
      : 0;

    const attendanceRate = data?.length > 0 ? (completeRecords.length / data.length) * 100 : 0;
    const hasTodayData = todayAttendance > 0;

    setMetrics({
      avgWorkHours: avgHours,
      attendanceRate,
      totalEmployees,
      todayAttendance,
      hasData: data && data.length > 0,
      hasTodayData
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-slate-200 rounded"></div>
            <div className="h-16 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Quick Analytics</h2>
          </div>
          <Link 
            to="/analytics"
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-white font-medium transition-colors"
          >
            View All
          </Link>
        </div>
      </div>
      
      <div className="p-6">
        {metrics.hasData === false ? (
          <div className="text-center py-8">
            <span className="text-4xl mb-3 block">📊</span>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No Data Yet</h3>
            <p className="text-slate-500 text-sm">Analytics will appear once attendance data is available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {metrics.avgWorkHours.toFixed(1)}h
              </div>
              <div className="text-slate-600 text-sm">Avg Work Hours</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {metrics.attendanceRate.toFixed(0)}%
              </div>
              <div className="text-slate-600 text-sm">Attendance Rate</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {metrics.totalEmployees}
              </div>
              <div className="text-slate-600 text-sm">Total Employees</div>
            </div>
            
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${
                metrics.hasTodayData ? 'text-orange-600' : 'text-slate-400'
              }`}>
                {metrics.hasTodayData ? metrics.todayAttendance : '-'}
              </div>
              <div className="text-slate-600 text-sm">
                Today Present
                {!metrics.hasTodayData && <span className="text-orange-500 block text-xs">(No data)</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}