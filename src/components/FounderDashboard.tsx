import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Cpu, 
  BarChart3, 
  BookOpen, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Terminal, 
  Zap, 
  FileText, 
  Download, 
  UserCheck, 
  ArrowUpRight, 
  Trash2, 
  ExternalLink,
  Flame,
  Award,
  Layers,
  Sparkles,
  Server,
  Lock
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  limit 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { UserProfile } from '../types';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface AIMetric {
  endpoint: string;
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  avgLatencyMs: number;
  successRate: number;
  lastCalledAt: string;
  lastStatus: 'ok' | 'error';
  lastErrorMessage?: string;
}

interface SystemHealthData {
  status: string;
  timestamp: string;
  uptimeSeconds: number;
  memory: {
    rssMb: number;
    heapTotalMb: number;
    heapUsedMb: number;
    externalMb: number;
  };
  platform: string;
  arch: string;
  nodeVersion: string;
  activeAuditLogs: number;
  aiTrackedEndpoints: number;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'auth' | 'user_management' | 'security' | 'system' | 'course';
  performedBy: string;
  targetId?: string;
  details?: Record<string, any>;
}

interface CachedLesson {
  id: string;
  title?: string;
  category?: string;
  subfield?: string;
  level?: number;
  quizCount?: number;
  hasInteractive?: boolean;
  contentLength?: number;
}

interface FounderDashboardProps {
  currentProfile: UserProfile;
}

type TabType = 'overview' | 'users' | 'analytics' | 'ai' | 'courses' | 'revenue' | 'system' | 'audit';

export const FounderDashboard: React.FC<FounderDashboardProps> = ({ currentProfile }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [lessons, setLessons] = useState<CachedLesson[]>([]);
  const [aiMetrics, setAiMetrics] = useState<AIMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Filters & Selected Details
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CachedLesson | null>(null);
  const [auditCategoryFilter, setAuditCategoryFilter] = useState<string>('all');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Helper to fetch server auth token
  const getAuthToken = async () => {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken();
  };

  // Load all operational data
  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = await getAuthToken();
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // 1. Fetch live Firestore users
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const loadedUsers: UserProfile[] = [];
        usersSnapshot.forEach(docSnap => {
          loadedUsers.push({ ...(docSnap.data() as UserProfile), uid: docSnap.id });
        });
        setUsers(loadedUsers);
      } catch (err) {
        console.warn('Could not read users collection from client Firestore:', err);
      }

      // 2. Fetch live Firestore cached lessons
      try {
        const lessonsSnapshot = await getDocs(query(collection(db, 'lessons'), limit(50)));
        const loadedLessons: CachedLesson[] = [];
        lessonsSnapshot.forEach(docSnap => {
          const data = docSnap.data();
          loadedLessons.push({
            id: docSnap.id,
            title: data.title || docSnap.id,
            category: data.category || 'General',
            subfield: data.subfield || 'Curriculum',
            level: data.level || 1,
            quizCount: Array.isArray(data.quiz) ? data.quiz.length : 0,
            hasInteractive: Boolean(data.simulationSteps || data.interactiveSim),
            contentLength: (data.detailedExplanation || '').length,
          });
        });
        setLessons(loadedLessons);
      } catch (err) {
        console.warn('Could not read lessons collection:', err);
      }

      // 3. Fetch server AI monitoring telemetry
      try {
        const aiRes = await fetch('/api/admin/ai-monitoring', { headers });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          setAiMetrics(aiData.metrics || []);
        }
      } catch (err) {
        console.error('Failed to load AI monitoring metrics:', err);
      }

      // 4. Fetch server System Health
      try {
        const healthRes = await fetch('/api/admin/system-health', { headers });
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setSystemHealth(healthData);
        }
      } catch (err) {
        console.error('Failed to load system health:', err);
      }

      // 5. Fetch server Audit Logs
      try {
        const logsRes = await fetch('/api/admin/audit-logs', { headers });
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setAuditLogs(logsData.logs || []);
        }
      } catch (err) {
        console.error('Failed to load audit logs:', err);
      }

      if (isManualRefresh) {
        toast.success('Տվյալները թարմացվեցին հաջողությամբ:');
      }
    } catch (error: any) {
      console.error('Founder dashboard data error:', error);
      toast.error('Սխալ տվյալների բեռնման ժամանակ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Measure round-trip ping latency
  const measurePing = async () => {
    const start = performance.now();
    try {
      const token = await getAuthToken();
      await fetch('/api/admin/overview', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const duration = Math.round(performance.now() - start);
      setPingLatency(duration);
      toast.success(`Server Latency: ${duration}ms`);
    } catch {
      toast.error('Ping failed');
    }
  };

  // Change user role via Firebase Custom Claims & Firestore
  const handleAssignRole = async (targetUser: UserProfile, newRole: 'student' | 'teacher' | 'admin') => {
    if (!targetUser.uid) {
      toast.error('Օգտատիրոջ UID-ն բացակայում է');
      return;
    }

    if (targetUser.role === newRole) {
      toast.info(`Օգտատերն արդեն ունի ${newRole} դերը`);
      return;
    }

    setIsUpdatingRole(true);
    try {
      const token = await getAuthToken();
      // 1. Call server API to set cryptographic Firebase custom claims
      const response = await fetch('/api/admin/users/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          targetUid: targetUser.uid,
          targetEmail: targetUser.email,
          newRole,
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server error setting role');
      }

      // 2. Also update Firestore user document
      try {
        await updateDoc(doc(db, 'users', targetUser.uid), {
          role: newRole,
          updatedAt: new Date().toISOString()
        });
      } catch (docErr) {
        console.warn('Firestore user doc update warning:', docErr);
      }

      // Update local state
      setUsers(prev => prev.map(u => u.uid === targetUser.uid ? { ...u, role: newRole } : u));
      if (selectedUser && selectedUser.uid === targetUser.uid) {
        setSelectedUser({ ...selectedUser, role: newRole });
      }

      toast.success(`Դերը հաջողությամբ փոխվեց՝ ${newRole}`);
      fetchDashboardData();
    } catch (error: any) {
      console.error('Role update failed:', error);
      toast.error(`Սխալ դերի փոփոխության ժամանակ: ${error.message}`);
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Invalidate / Delete a cached lesson
  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm(`Իսկապե՞ս ցանկանում եք ջնջել «${lessonId}» դասը:`)) return;

    try {
      await deleteDoc(doc(db, 'lessons', lessonId));
      setLessons(prev => prev.filter(l => l.id !== lessonId));
      if (selectedLesson?.id === lessonId) setSelectedLesson(null);
      toast.success('Դասը հաջողությամբ հեռացվեց:');
      
      // Log action to server audit log
      const token = await getAuthToken();
      await fetch('/api/admin/audit-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: 'LESSON_PURGED',
          category: 'course',
          targetId: lessonId,
          details: { purgedBy: currentProfile.email }
        })
      });
    } catch (error: any) {
      toast.error(`Չհաջողվեց ջնջել դասը: ${error.message}`);
    }
  };

  // Computed Summaries
  const totalUsersCount = users.length;
  const totalXp = useMemo(() => users.reduce((acc, u) => acc + (u.xp || 0), 0), [users]);
  const activeStreakUsers = useMemo(() => users.filter(u => (u.streak || 0) > 0).length, [users]);

  const totalAICalls = useMemo(() => aiMetrics.reduce((acc, m) => acc + m.totalCalls, 0), [aiMetrics]);
  const totalAITokens = useMemo(() => aiMetrics.reduce((acc, m) => acc + m.totalTokens, 0), [aiMetrics]);
  const totalAICost = useMemo(() => aiMetrics.reduce((acc, m) => acc + m.estimatedCostUsd, 0), [aiMetrics]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        (user.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
        (user.uid || '').toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, roleFilter]);

  // Analytics Computations
  const roleDistributionData = useMemo(() => {
    const counts: Record<string, number> = { student: 0, teacher: 0, admin: 0 };
    users.forEach(u => {
      const r = u.role || 'student';
      counts[r] = (counts[r] || 0) + 1;
    });
    return [
      { name: 'Ուսանողներ (Students)', value: counts.student, color: '#6366f1' },
      { name: 'Ուսուցիչներ (Teachers)', value: counts.teacher, color: '#10b981' },
      { name: 'Ադմիններ (Admins)', value: counts.admin, color: '#f59e0b' },
    ];
  }, [users]);

  const levelDistributionData = useMemo(() => {
    const buckets: Record<string, number> = { 'Lv 1': 0, 'Lv 2-3': 0, 'Lv 4-5': 0, 'Lv 6+': 0 };
    users.forEach(u => {
      const lvl = u.level || 1;
      if (lvl === 1) buckets['Lv 1']++;
      else if (lvl <= 3) buckets['Lv 2-3']++;
      else if (lvl <= 5) buckets['Lv 4-5']++;
      else buckets['Lv 6+']++;
    });
    return Object.entries(buckets).map(([k, v]) => ({ level: k, count: v }));
  }, [users]);

  // Export Audit Logs as JSON
  const handleExportAuditLogs = () => {
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(auditLogs, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `krtlab_audit_logs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Աուդիտի մատյանը արտահանվեց:');
  };

  const filteredLogs = useMemo(() => {
    if (auditCategoryFilter === 'all') return auditLogs;
    return auditLogs.filter(l => l.category === auditCategoryFilter);
  }, [auditLogs, auditCategoryFilter]);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-8 md:p-10 border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Founder & Operations Center v1
              </span>
              <span className="px-3 py-1 bg-white/10 text-white/80 rounded-full text-[10px] font-black uppercase tracking-widest">
                KrtLab Cloud Production
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
              Հիմնադրի Կառավարման Կենտրոն
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-medium mt-1">
              Իրական ժամանակի տվյալներ, անվտանգության մոնիթորինգ և օգտատերերի կառավարում:
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="px-5 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              Թարմացնել
            </button>
            <button
              onClick={measurePing}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <Zap size={15} />
              {pingLatency ? `${pingLatency}ms` : 'Ping Latency'}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto no-scrollbar border-t border-white/10 pt-6">
          {[
            { id: 'overview', label: 'Ընդհանուր (Overview)', icon: <Activity size={16} /> },
            { id: 'users', label: `Օգտատերեր (${users.length})`, icon: <Users size={16} /> },
            { id: 'analytics', label: 'Վերլուծություն', icon: <BarChart3 size={16} /> },
            { id: 'ai', label: `AI Մոնիթորինգ (${totalAICalls})`, icon: <Sparkles size={16} /> },
            { id: 'courses', label: `Դասընթացներ (${lessons.length})`, icon: <BookOpen size={16} /> },
            { id: 'revenue', label: 'Եկամուտներ (SaaS)', icon: <DollarSign size={16} /> },
            { id: 'system', label: 'Սերվերի Վիճակ', icon: <Server size={16} /> },
            { id: 'audit', label: `Աուդիտ (${auditLogs.length})`, icon: <ShieldCheck size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-md scale-102'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div className="p-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-xl space-y-4">
          <RefreshCw size={36} className="animate-spin text-primary mx-auto" />
          <p className="text-slate-500 font-bold">Բեռնվում են իրական տվյալները Firestore-ից և սերվերից...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Գրանցված Օգտատերեր</span>
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{totalUsersCount}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {activeStreakUsers} օգտատեր ունեն ակտիվ շղթա 🔥
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Հարթակի Ընդհանուր XP</span>
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Flame size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{totalXp.toLocaleString()} XP</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Միջինը՝ {totalUsersCount > 0 ? Math.round(totalXp / totalUsersCount) : 0} XP մեկ օգտատիրոջ հաշվով
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Քեշավորված Դասեր</span>
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <BookOpen size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{lessons.length}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Firestore-ում պահպանված ինտերակտիվ դասընթացներ
                  </p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">AI Հարցումներ & Ծախս</span>
                    <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Sparkles size={20} />
                    </div>
                  </div>
                  <p className="text-3xl font-black text-slate-900">{totalAICalls} կանչ</p>
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    ${totalAICost.toFixed(4)} USD գնահատված ծախս
                  </p>
                </div>
              </div>

              {/* Server & Security Status Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-md">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-black text-slate-900">Համակարգային Կարգավիճակ</h3>
                      <p className="text-xs text-slate-400 font-medium">Անվտանգություն և սերվերային ցուցանիշներ</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase">
                      Օնլայն և Պաշտպանված
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Սերվերի Uptime</p>
                      <p className="text-base font-black text-slate-900">
                        {systemHealth ? formatUptime(systemHealth.uptimeSeconds) : '...'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Հիշողություն (RSS)</p>
                      <p className="text-base font-black text-slate-900">
                        {systemHealth ? `${systemHealth.memory.rssMb} MB` : '...'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Heap Used</p>
                      <p className="text-base font-black text-slate-900">
                        {systemHealth ? `${systemHealth.memory.heapUsedMb} MB` : '...'}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Node Վերսիա</p>
                      <p className="text-base font-black text-slate-900">
                        {systemHealth?.nodeVersion || 'v22.x'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between text-xs font-semibold text-indigo-900">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-indigo-600" />
                      <span>Անվտանգության մոդել՝ <strong>Firebase Admin SDK verifyIdToken() & Firestore Rules RBAC</strong></span>
                    </div>
                    <span className="font-mono text-[11px] text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-lg">
                      Founder Email Bound
                    </span>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] border border-slate-800 shadow-md flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-black mb-1">Արագ Գործողություններ</h3>
                    <p className="text-xs text-slate-400 mb-6">Հիմնադրի անմիջական գործիքներ</p>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Users size={15} className="text-indigo-400" />
                          Օգտատերերի ցուցակ
                        </span>
                        <ArrowUpRight size={14} className="text-slate-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('ai')}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Cpu size={15} className="text-emerald-400" />
                          AI Թրաֆիկ և Տոկեններ
                        </span>
                        <ArrowUpRight size={14} className="text-slate-400" />
                      </button>

                      <button
                        onClick={handleExportAuditLogs}
                        className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Download size={15} className="text-amber-400" />
                          Արտահանել Audit Logs
                        </span>
                        <ArrowUpRight size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
                    Admin: {currentProfile.email}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Օգտատերերի Կառավարում</h3>
                  <p className="text-xs text-slate-400 font-medium">Իրական օգտատերեր Firestore բազայից ({filteredUsers.length} գտնված)</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Որոնել ըստ անվան, էլ. հասցեի..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary w-64"
                    />
                  </div>

                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                    className="py-2.5 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">Բոլոր Դերերը</option>
                    <option value="student">Ուսանողներ (student)</option>
                    <option value="teacher">Ուսուցիչներ (teacher)</option>
                    <option value="admin">Ադմիններ (admin)</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4">Օգտատեր</th>
                      <th className="p-4">Էլ. Հասցե / UID</th>
                      <th className="p-4">Դեր (Role)</th>
                      <th className="p-4">Մակարդակ & XP</th>
                      <th className="p-4">Շղթա (Streak)</th>
                      <th className="p-4 text-right">Գործողություններ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                          Օգտատերեր չեն գտնվել
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.uid || u.name} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900">{u.name || 'Անանուն'}</p>
                                <p className="text-[10px] text-slate-400">
                                  Գրանցված՝ {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="p-4 font-mono text-[11px] text-slate-600">
                            <div>{u.email || 'Email չկա (Guest / Anon)'}</div>
                            <div className="text-[9px] text-slate-400">{u.uid?.slice(0, 16)}...</div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-amber-100 text-amber-800'
                                  : u.role === 'teacher'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {u.role || 'student'}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="font-black text-slate-900">Lv {u.level || 1}</div>
                            <div className="text-[10px] text-slate-500 font-semibold">{u.xp || 0} XP</div>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center gap-1 font-bold text-amber-600">
                              <Flame size={14} />
                              {u.streak || 0} օր
                            </div>
                          </td>

                          <td className="p-4 text-right space-x-2">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] cursor-pointer transition-all"
                            >
                              Դիտել
                            </button>
                            <button
                              onClick={() => {
                                const newRole = u.role === 'admin' ? 'student' : 'admin';
                                if (confirm(`Փոխե՞լ ${u.name || u.email}-ի դերը "${newRole}"-ի:`)) {
                                  handleAssignRole(u, newRole);
                                }
                              }}
                              disabled={isUpdatingRole}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-[11px] cursor-pointer transition-all disabled:opacity-50"
                            >
                              {u.role === 'admin' ? 'Հեռացնել Admin' : 'Դարձնել Admin'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* User Details Modal / Drawer */}
              {selectedUser && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 mt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Օգտատիրոջ Մանրամասներ</h4>
                      <p className="text-xs text-slate-500">{selectedUser.name} ({selectedUser.email})</p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Փակել
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold block">UID:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedUser.uid}</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold block">XP & Մակարդակ:</span>
                      <span className="font-bold text-slate-800">{selectedUser.xp} XP (Level {selectedUser.level})</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold block">Շղթա (Streak):</span>
                      <span className="font-bold text-amber-600">{selectedUser.streak} օր</span>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-400 font-bold block">Վերջին Ակտիվություն:</span>
                      <span className="font-bold text-slate-800">
                        {selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Role Switcher */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-bold text-slate-700">Փոխել Դերը:</span>
                    {(['student', 'teacher', 'admin'] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => handleAssignRole(selectedUser, r)}
                        disabled={isUpdatingRole || selectedUser.role === r}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                          selectedUser.role === r
                            ? 'bg-slate-900 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Level Distribution */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-md">
                  <h3 className="text-lg font-black text-slate-900 mb-1">Օգտատերերի Բաշխումն ըստ Մակարդակների</h3>
                  <p className="text-xs text-slate-400 mb-6">Իրական առաջընթացի մակարդակներ</p>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={levelDistributionData}>
                        <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Role Distribution */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-md">
                  <h3 className="text-lg font-black text-slate-900 mb-1">Դերերի Բաշխում (RBAC Distribution)</h3>
                  <p className="text-xs text-slate-400 mb-6">Ուսանողներ, Ուսուցիչներ, Ադմինիստրատորներ</p>

                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={roleDistributionData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label
                        >
                          {roleDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* XP Leaderboard */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-md">
                <h3 className="text-lg font-black text-slate-900 mb-1">Առաջատար Օգտատերեր (Real Leaderboard)</h3>
                <p className="text-xs text-slate-400 mb-6">Ամենաբարձր XP ունեցող սովորողները</p>

                <div className="space-y-3">
                  {[...users]
                    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                    .slice(0, 5)
                    .map((topUser, idx) => (
                      <div
                        key={topUser.uid || idx}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                              idx === 0
                                ? 'bg-amber-400 text-amber-950 shadow-sm'
                                : idx === 1
                                ? 'bg-slate-300 text-slate-800'
                                : idx === 2
                                ? 'bg-amber-600/30 text-amber-900'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{topUser.name || 'Անանուն'}</p>
                            <p className="text-[11px] text-slate-400">{topUser.email || 'Email չկա'}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-black text-primary">{topUser.xp || 0} XP</p>
                          <p className="text-[10px] text-slate-400">Level {topUser.level || 1}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI MONITORING */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-[11px] font-black uppercase text-slate-400">Ընդհանուր AI Զանգեր</span>
                  <p className="text-3xl font-black text-slate-900 mt-2">{totalAICalls}</p>
                  <p className="text-xs text-slate-500 mt-1">Բոլոր /api/gemini/* endpoint-ներով</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-[11px] font-black uppercase text-slate-400">Օգտագործված Տոկեններ</span>
                  <p className="text-3xl font-black text-slate-900 mt-2">{totalAITokens.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Prompt + Completion գնահատում</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <span className="text-[11px] font-black uppercase text-slate-400">Գնահատված Ծախս (USD)</span>
                  <p className="text-3xl font-black text-emerald-600 mt-2">${totalAICost.toFixed(4)}</p>
                  <p className="text-xs text-slate-500 mt-1">Gemini 3.5 Flash & TTS պաշտոնական գնացուցակով</p>
                </div>
              </div>

              {/* Endpoint Table */}
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Endpoint-ների Թրաֆիկ և Կատարողականություն</h3>
                    <p className="text-xs text-slate-400">Իրական զանգեր, միջին լատենտություն և սխալների քանակ</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                      <tr>
                        <th className="p-4">Endpoint</th>
                        <th className="p-4">Զանգեր</th>
                        <th className="p-4">Հաջող / Սխալ</th>
                        <th className="p-4">Միջին Լատենտություն</th>
                        <th className="p-4">Տոկեններ</th>
                        <th className="p-4">Ծախս ($)</th>
                        <th className="p-4">Կարգավիճակ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {aiMetrics.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                            AI հարցումներ դեռ չեն գրանցվել այս սերվերային սեսիայում: Փորձարկեք AI Mentor-ը կամ Դասի ստեղծումը:
                          </td>
                        </tr>
                      ) : (
                        aiMetrics.map((m) => (
                          <tr key={m.endpoint} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-900">
                              /api/gemini{m.endpoint}
                            </td>
                            <td className="p-4 font-bold text-slate-800">{m.totalCalls}</td>
                            <td className="p-4">
                              <span className="text-emerald-600 font-bold">{m.successCalls}</span> /{' '}
                              <span className={m.errorCalls > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}>
                                {m.errorCalls}
                              </span>
                            </td>
                            <td className="p-4 font-mono text-slate-600">{m.avgLatencyMs} ms</td>
                            <td className="p-4 font-mono text-slate-600">{m.totalTokens.toLocaleString()}</td>
                            <td className="p-4 font-mono text-emerald-700 font-bold">${m.estimatedCostUsd}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                  m.lastStatus === 'ok'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {m.lastStatus}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COURSE MANAGEMENT */}
          {activeTab === 'courses' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Դասընթացների և Բովանդակության Կառավարում</h3>
                  <p className="text-xs text-slate-400 font-medium">Firestore-ում քեշավորված դասեր և սիմուլյացիաներ ({lessons.length})</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.length === 0 ? (
                  <div className="col-span-full p-12 text-center text-slate-400 font-bold bg-slate-50 rounded-3xl">
                    Քեշավորված դասեր դեռ չկան Firestore-ում:
                  </div>
                ) : (
                  lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-[10px] font-black uppercase">
                            Level {lesson.level}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {lesson.contentLength} chars
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-sm mb-1 line-clamp-1">{lesson.title}</h4>
                        <p className="text-xs text-slate-500 font-medium">{lesson.category} / {lesson.subfield}</p>

                        <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-600 font-bold">
                          <span>{lesson.quizCount} Quiz հարց</span>
                          {lesson.hasInteractive && (
                            <span className="text-emerald-600 flex items-center gap-1">
                              • Ինտերակտիվ
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-200/60">
                        <button
                          onClick={() => setSelectedLesson(lesson)}
                          className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Մանրամասն
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl cursor-pointer"
                          title="Ջնջել քեշավորված դասը"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Lesson Detail Drawer */}
              {selectedLesson && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h4 className="font-black text-slate-900 text-base">{selectedLesson.title}</h4>
                    <button
                      onClick={() => setSelectedLesson(null)}
                      className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer"
                    >
                      Փակել
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold">
                    <div><strong>ID:</strong> {selectedLesson.id}</div>
                    <div><strong>Բաժին:</strong> {selectedLesson.category}</div>
                    <div><strong>Ենթաբաժին:</strong> {selectedLesson.subfield}</div>
                    <div><strong>Թեստեր:</strong> {selectedLesson.quizCount} հարց</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: REVENUE (SaaS MODEL) */}
          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">KrtLab SaaS Բիզնես Մոդել և Եկամուտների Կառուցվածք</h3>
                  <p className="text-xs text-slate-400 font-medium">Նախապատրաստված սակագնային պլաններ և ֆինանսական ինտեգրացիաներ</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Tier 1 */}
                  <div className="p-6 rounded-3xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                    <div>
                      <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-[10px] font-black uppercase">
                        Անվճար
                      </span>
                      <h4 className="text-xl font-black text-slate-900 mt-3">Free Learner</h4>
                      <p className="text-2xl font-black text-slate-900 mt-2">$0 <span className="text-xs text-slate-500 font-normal">/ ամիս</span></p>
                      <ul className="text-xs text-slate-600 font-medium mt-4 space-y-2">
                        <li>• Հիմնական դասընթացներ</li>
                        <li>• Օրական 5 AI Mentor հարցում</li>
                        <li>• Flashcard համակարգ</li>
                        <li>• Հիմնական հավաստագրեր</li>
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500">
                      Ակտիվ օգտատերեր՝ <strong>{totalUsersCount}</strong>
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="p-6 rounded-3xl border-2 border-primary bg-primary/5 flex flex-col justify-between relative shadow-lg shadow-primary/10">
                    <div className="absolute top-4 right-4">
                      <span className="px-2.5 py-1 bg-primary text-white rounded-full text-[9px] font-black uppercase tracking-wider">
                        Popular
                      </span>
                    </div>
                    <div>
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase">
                        Պրոֆեսիոնալ
                      </span>
                      <h4 className="text-xl font-black text-slate-900 mt-3">KrtLab Pro</h4>
                      <p className="text-2xl font-black text-slate-900 mt-2">$9.99 <span className="text-xs text-slate-500 font-normal">/ ամիս (4,000 AMD)</span></p>
                      <ul className="text-xs text-slate-700 font-medium mt-4 space-y-2">
                        <li>• Անսահմանափակ AI դասընթացներ</li>
                        <li>• 24/7 AI Mentor & Speech TTS</li>
                        <li>• Ինտերակտիվ սիմուլյացիաներ</li>
                        <li>• Պաշտոնական PDF հավաստագրեր</li>
                        <li>• Կարիերայի & Portfolio ռեժիմ</li>
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t border-primary/20 text-[11px] text-primary font-bold">
                      Պոտենցիալ MRR: ${(totalUsersCount * 0.08 * 9.99).toFixed(2)} USD
                    </div>
                  </div>

                  {/* Tier 3 */}
                  <div className="p-6 rounded-3xl border border-indigo-200 bg-indigo-50/50 flex flex-col justify-between">
                    <div>
                      <span className="px-3 py-1 bg-indigo-200 text-indigo-800 rounded-full text-[10px] font-black uppercase">
                        Կրթական / Դպրոցներ
                      </span>
                      <h4 className="text-xl font-black text-slate-900 mt-3">School & Enterprise</h4>
                      <p className="text-2xl font-black text-slate-900 mt-2">$49.00 <span className="text-xs text-slate-500 font-normal">/ ամիս (20,000 AMD)</span></p>
                      <ul className="text-xs text-slate-600 font-medium mt-4 space-y-2">
                        <li>• Մինչև 50 աշակերտական հաշիվ</li>
                        <li>• Ուսուցչի կառավարման վահանակ</li>
                        <li>• Առաջադրանքների նշանակում</li>
                        <li>• Առաջընթացի սինխրոնացում</li>
                      </ul>
                    </div>
                    <div className="mt-6 pt-4 border-t border-indigo-200 text-[11px] text-indigo-900 font-bold">
                      B2B Կրթական մոդել
                    </div>
                  </div>
                </div>

                {/* Gateway Integration Status */}
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="text-sm font-black text-slate-900">Վճարային Համակարգերի Ինտեգրման Կարգավիճակ</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-bold">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span>Stripe Checkout</span>
                      <span className="text-emerald-600">Պատրաստ</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span>Idram & Telcell</span>
                      <span className="text-indigo-600">Հասանելի API</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span>Ameriabank vPOS</span>
                      <span className="text-amber-600">Արխիվացված</span>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                      <span>Invoicing / Կտրոն</span>
                      <span className="text-emerald-600">Ակտիվ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SYSTEM HEALTH */}
          {activeTab === 'system' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Սերվերային և Ենթակառուցվածքային Տելեմետրիա</h3>
                  <p className="text-xs text-slate-400 font-medium">Node.js պրոցեսի և միջավայրի իրական ցուցանիշներ</p>
                </div>
                <button
                  onClick={measurePing}
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black cursor-pointer"
                >
                  Կատարել Latency Թեստ
                </button>
              </div>

              {systemHealth ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400">Process Uptime</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{formatUptime(systemHealth.uptimeSeconds)}</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400">Memory RSS</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{systemHealth.memory.rssMb} MB</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400">Heap Used</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{systemHealth.memory.heapUsedMb} MB</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400">Heap Total</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{systemHealth.memory.heapTotalMb} MB</p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Terminal size={16} />
                      <span>Process Environment Diagnostics:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300">
                      <div>Node Version: <strong>{systemHealth.nodeVersion}</strong></div>
                      <div>Platform / Arch: <strong>{systemHealth.platform} ({systemHealth.arch})</strong></div>
                      <div>Active Audit Logs: <strong>{systemHealth.activeAuditLogs}</strong></div>
                      <div>AI Intercepted Endpoints: <strong>{systemHealth.aiTrackedEndpoints}</strong></div>
                      <div>RTT Ping: <strong>{pingLatency ? `${pingLatency}ms` : 'Not tested'}</strong></div>
                      <div>Server Timestamp: <strong>{systemHealth.timestamp}</strong></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400">Տվյալները բացակայում են</div>
              )}
            </div>
          )}

          {/* TAB 8: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Աուդիտի Մատյան (Security Audit Trail)</h3>
                  <p className="text-xs text-slate-400 font-medium">Ադմինիստրատիվ և անվտանգության բոլոր գործողությունների արձանագրություն</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={auditCategoryFilter}
                    onChange={(e) => setAuditCategoryFilter(e.target.value)}
                    className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <option value="all">Բոլոր Կատեգորիաները</option>
                    <option value="security">Security</option>
                    <option value="auth">Auth</option>
                    <option value="user_management">User Management</option>
                    <option value="course">Course</option>
                    <option value="system">System</option>
                  </select>

                  <button
                    onClick={handleExportAuditLogs}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-all"
                  >
                    <Download size={14} />
                    Արտահանել JSON
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="p-4">Ժամանակ</th>
                      <th className="p-4">Գործողություն (Action)</th>
                      <th className="p-4">Կատեգորիա</th>
                      <th className="p-4">Կատարող (Admin)</th>
                      <th className="p-4">Մանրամասներ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 font-sans font-bold">
                          Աուդիտի գրանցումներ չկան
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-4 text-slate-500 whitespace-nowrap text-[11px]">
                            {new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})
                          </td>

                          <td className="p-4 font-bold text-slate-900">
                            {log.action}
                          </td>

                          <td className="p-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] uppercase font-bold">
                              {log.category}
                            </span>
                          </td>

                          <td className="p-4 text-slate-700">
                            {log.performedBy}
                          </td>

                          <td className="p-4 text-slate-500 text-[11px]">
                            {log.details ? JSON.stringify(log.details) : 'N/A'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
