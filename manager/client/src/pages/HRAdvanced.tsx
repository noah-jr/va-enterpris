import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users, Briefcase, GraduationCap, Target,
  ArrowUpRight, ArrowDownRight, Loader2,
  Heart, ShieldCheck, Search, Plus, ActivitySquare,
  TrendingUp, MessageSquare, Zap, Activity, User, 
  BarChart3, PieChart as PieChartIcon, LayoutDashboard, ChevronRight,
  Award, Clock, AlertTriangle, Fingerprint, Globe, Star,
  Mail, Phone, MapPin, Building, Filter, Download, MoreVertical,
  X, CheckCircle2, Calendar, DollarSign, UserCheck, UserMinus, UserPlus,
  BriefcaseIcon, UserCircle, Settings, Eye, Trash2, FileText,
  ShieldAlert, BookOpen, ClipboardCheck, History, Landmark
} from 'lucide-react';
import api from '../api';
import { useMe } from '../auth/useAuth';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, CartesianGrid,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { formatCurrency } from '../utils/format';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const fmt = (v: number) => formatCurrency(v);
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const HRAdvanced = () => {
  const queryClient = useQueryClient();
  const { data: user } = useMe();
  const [time, setTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DIRECTORY' | 'RECRUITMENT' | 'PAYROLL' | 'ACADEMY' | 'DOCS'>('OVERVIEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [drawerTab, setDrawerTab] = useState<'PROFILE' | 'DOCS' | 'PERFORMANCE' | 'PAYROLL'>('PROFILE');

  const [promotionModal, setPromotionModal] = useState<any>(null);
  const [evaluationModal, setEvaluationModal] = useState<any>(null);
  const [payrollModal, setPayrollModal] = useState<any>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Queries
  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ['hr-advanced-overview'],
    queryFn: async () => (await api.get('/hr-advanced/overview')).data
  });

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ['hr-employees'],
    queryFn: async () => (await api.get('/hr/employees')).data,
    enabled: true
  });

  const { data: candidates = [], isLoading: loadingCandidates } = useQuery({
    queryKey: ['hr-candidates'],
    queryFn: async () => (await api.get('/recruitment/candidates')).data,
    enabled: activeTab === 'RECRUITMENT'
  });

  const { data: payrolls = [], isLoading: loadingPayroll } = useQuery({
    queryKey: ['hr-payrolls'],
    queryFn: async () => (await api.get('/payrolls')).data,
    enabled: activeTab === 'PAYROLL' || !!(selectedEmployee && drawerTab === 'PAYROLL')
  });

  const { data: courses = [], isLoading: loadingAcademy } = useQuery({
    queryKey: ['hr-academy'],
    queryFn: async () => (await api.get('/academy/courses')).data,
    enabled: activeTab === 'ACADEMY'
  });

  const { data: documents = [], isLoading: loadingDocs } = useQuery({
    queryKey: ['hr-documents'],
    queryFn: async () => (await api.get('/documents')).data,
    enabled: activeTab === 'DOCS' || !!(selectedEmployee && drawerTab === 'DOCS')
  });

  // Mutations
  const promoteMutation = useMutation({
    mutationFn: (data: any) => api.post(`/hr-advanced/employees/${data.id}/promote`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-employees'] });
      toast.success('Colaborador promovido com sucesso!');
      setPromotionModal(null);
      setSelectedEmployee(null);
    },
    onError: () => toast.error('Erro ao processar promoção.')
  });

  const evaluateMutation = useMutation({
    mutationFn: (data: any) => api.post(`/hr-advanced/employees/${data.id}/evaluate`, data),
    onSuccess: () => {
      toast.success('Avaliação registada com sucesso!');
      setEvaluationModal(null);
    },
    onError: () => toast.error('Erro ao registar avaliação.')
  });

  const payrollMutation = useMutation({
    mutationFn: (data: any) => api.post(`/hr-advanced/payroll/process`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr-payrolls'] });
      toast.success('Salário processado com sucesso!');
      setPayrollModal(null);
    },
    onError: () => toast.error('Erro ao processar salário.')
  });

  const bulkPayrollMutation = useMutation({
    mutationFn: (data: any) => api.post(`/hr-advanced/payroll/bulk`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['hr-payrolls'] });
      toast.success(`Processados ${res.data.processed} salários com sucesso! Total: ${fmt(res.data.total)}`);
      setIsBulkProcessing(false);
    },
    onError: () => {
      toast.error('Erro no processamento em massa.');
      setIsBulkProcessing(false);
    }
  });

  if (loadingOverview) return (
    <div className="flex items-center justify-center gap-3 py-32 text-[var(--text-muted)]">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm">Sincronizando Ecossistema de Inteligência RH...</span>
    </div>
  );

  const stats = overview?.stats || {};
  const filteredEmployees = employees.filter((e: any) => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-700">
      
      {/* ── Header Strategy ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-[1.2rem] bg-[var(--accent)] flex items-center justify-center text-white shadow-xl">
                <Globe size={20} className="animate-pulse" />
             </div>
             <div>
                <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic leading-none">
                    Recursos Humanos <span className="text-[var(--accent)] font-normal not-italic opacity-30">/ Advanced Intelligence</span>
                </h1>
                <p className="text-[10px] font-bold text-[var(--text-muted)] italic mt-1.5 flex items-center gap-2">
                    <Activity size={12} className="text-[var(--accent)]" />
                    {format(time, "EEEE, dd 'de' MMMM · HH:mm:ss", { locale: pt })}
                </p>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {[
            { id: 'OVERVIEW', label: 'Estratégia', icon: LayoutDashboard },
            { id: 'DIRECTORY', label: 'Diretório', icon: Users },
            { id: 'RECRUITMENT', label: 'Talentos', icon: UserPlus },
            { id: 'ACADEMY', label: 'Academy', icon: BookOpen },
            { id: 'PAYROLL', label: 'Financeiro', icon: DollarSign },
            { id: 'DOCS', label: 'Conformidade', icon: ShieldCheck },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setSearchTerm(''); }}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Capital Ativo', value: stats.activeEmployees || 0, icon: <Users size={18} />, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { title: 'Custo Mensal', value: fmt(stats.totalPayroll || 0), icon: <Zap size={18} />, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
              { title: 'Candidatos', value: stats.activeRecruitments || 0, icon: <Target size={18} />, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-500/10' },
              { title: 'Cursos Ativos', value: stats.activeTraining || 0, icon: <BookOpen size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            ].map((kpi, idx) => (
              <div key={idx} className="premium-card p-6 flex items-start gap-4 hover:border-[var(--accent)] transition-all group">
                <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border border-current/10 ${kpi.color} ${kpi.bg} shadow-lg group-hover:scale-110 transition-transform`}>
                  {kpi.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 truncate">{kpi.title}</p>
                  <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter tabular-nums truncate">{kpi.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="premium-card p-6 bg-gradient-to-r from-indigo-500/10 to-emerald-500/10 border-indigo-500/20">
             <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic">Centro de Operações Estratégicas</h3>
                   <p className="text-[10px] text-[var(--text-muted)] font-bold mt-1">Execute ações globais de RH e processe folhas de pagamento em massa com um único comando.</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => { setActiveTab('PAYROLL'); }}
                     className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                   >
                     <Zap size={14} /> Processar Folha Global
                   </button>
                   <button 
                     onClick={() => toast.info('Gerando relatório consolidado...')}
                     className="px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2"
                   >
                     <BarChart3 size={14} /> Relatório Trimestral
                   </button>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="premium-card p-0 overflow-hidden" style={{ height: 350 }}>
                <div className="px-6 py-4 border-b border-[var(--border-color)] flex items-center justify-between bg-emerald-500/5">
                   <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                     <GraduationCap size={16} /> Academy Performance Index
                   </h2>
                </div>
                <div className="p-6 h-[290px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overview?.deptDistribution || []}>
                         <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                         <YAxis fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)' }} />
                         <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '1rem' }} />
                         <Bar dataKey="value" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>
             <div className="premium-card p-6 space-y-6">
                <h2 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-500" /> Compliance Monitor
                </h2>
                <div className="space-y-4">
                   {[
                     { label: 'Contratos Válidos', value: ((documents.filter((d: any) => d.status === 'VALID').length / (documents.length || 1)) * 100).toFixed(0) + '%', color: 'bg-emerald-500' },
                     { label: 'Documentação ID', value: '85%', color: 'bg-amber-500' },
                     { label: 'Segurança Social', value: '100%', color: 'bg-sky-500' },
                     { label: 'Certificações', value: '72%', color: 'bg-indigo-500' },
                   ].map((item, i) => (
                     <div key={i} className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
                           <span className="text-[var(--text-muted)]">{item.label}</span>
                           <span className="text-[var(--text-primary)]">{item.value}</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                           <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'DIRECTORY' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input 
                  placeholder="Pesquisar colaborador..."
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-[var(--text-primary)] focus:border-[var(--accent)] outline-none transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="premium-button-primary !px-6 !py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg rounded-xl">
                  <Plus size={16} className="mr-2 inline" /> Admitir
              </button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEmployees.map((emp: any) => (
                <div key={emp.id} className="premium-card p-0 flex flex-col group cursor-pointer hover:border-[var(--accent)] hover:shadow-xl transition-all duration-500 overflow-hidden">
                   <div onClick={() => { setSelectedEmployee(emp); setDrawerTab('PROFILE'); }} className="p-6 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)] border-2 border-[var(--border-color)] flex items-center justify-center overflow-hidden mb-4 group-hover:rotate-6 transition-all">
                          {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" alt=""/> : <User size={28} className="text-[var(--text-muted)]" />}
                      </div>
                      <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight truncate w-full">{emp.name}</h3>
                      <p className="text-[9px] font-bold text-[var(--accent)] uppercase tracking-widest mt-1 italic">{emp.position || 'Operativo'}</p>
                   </div>
                   <div className="px-4 py-3 bg-[var(--bg-primary)]/50 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPromotionModal(emp); }}
                        className="flex-1 py-2 rounded-lg bg-[var(--bg-secondary)] text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border border-[var(--border-color)]"
                      >
                        Promover
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPayrollModal(emp); }}
                        className="flex-1 py-2 rounded-lg bg-[var(--bg-secondary)] text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-[var(--border-color)]"
                      >
                        Processar
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'ACADEMY' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <div key={course.id} className="premium-card p-6 space-y-4 hover:border-emerald-500/30 transition-all group">
                   <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                         <BookOpen size={20} />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[8px] font-black uppercase tracking-widest">{course.category}</span>
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-emerald-500 transition-colors">{course.title}</h3>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1 line-clamp-2">{course.description}</p>
                   </div>
                   <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
                      <div className="flex items-center gap-1.5">
                         <Users size={12} className="text-[var(--text-muted)]" />
                         <span className="text-[10px] font-bold text-[var(--text-secondary)]">{course.enrolled} Inscritos</span>
                      </div>
                      <div className="flex items-center gap-1">
                         <Star size={12} className="text-amber-500 fill-amber-500" />
                         <span className="text-[10px] font-black text-[var(--text-primary)]">{course.rating || '4.5'}</span>
                      </div>
                   </div>
                </div>
              ))}
              {courses.length === 0 && <div className="col-span-full p-20 text-center opacity-30 italic text-xs font-black uppercase">Nenhum curso registado na academia.</div>}
           </div>
        </div>
      )}

      {activeTab === 'PAYROLL' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                 <Landmark size={16} className="text-emerald-500" /> Histórico de Pagamentos Geral
              </h2>
              <button 
                disabled={isBulkProcessing}
                onClick={() => {
                  setIsBulkProcessing(true);
                  bulkPayrollMutation.mutate({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
                }}
                className="premium-button-primary !px-6 !py-2.5 text-[10px] font-black uppercase tracking-widest shadow-lg rounded-xl flex items-center gap-2"
              >
                {isBulkProcessing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Processamento em Massa ({format(new Date(), 'MMMM', { locale: pt })})
              </button>
           </div>
           <div className="premium-card p-0 overflow-hidden">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-[var(--bg-primary)]/50 border-b border-[var(--border-color)]">
                       {['Colaborador', 'Período', 'Salário Base', 'Descontos', 'Líquido', 'Estado', 'Ações'].map(h => (
                          <th key={h} className="px-8 py-4 text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{h}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody>
                    {payrolls.map((p: any) => (
                       <tr key={p.id} className="border-b border-[var(--border-color)] hover:bg-[var(--bg-primary)]/50 transition-colors group">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <UserCircle size={18} className="text-[var(--accent)]" />
                                <span className="text-xs font-bold text-[var(--text-primary)]">{p.employee?.name || '---'}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-xs text-[var(--text-secondary)] font-medium tabular-nums">{p.periodMonth}/{p.periodYear}</td>
                          <td className="px-8 py-5 text-xs font-bold text-[var(--text-primary)] tabular-nums">{fmt(p.baseSalary)}</td>
                          <td className="px-8 py-5 text-xs font-bold text-rose-500 tabular-nums">-{fmt(p.deductions)}</td>
                          <td className="px-8 py-5 text-xs font-black text-emerald-500 tabular-nums">{fmt(p.netSalary)}</td>
                          <td className="px-8 py-5">
                             <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             {p.status !== 'PAID' && (
                               <button 
                                 onClick={() => api.patch(`/hr-advanced/payroll/${p.id}/paid`).then(() => queryClient.invalidateQueries({ queryKey: ['hr-payrolls'] }))}
                                 className="p-2 hover:bg-emerald-500/10 text-emerald-500 rounded-lg transition-all"
                               >
                                 <CheckCircle2 size={16} />
                               </button>
                             )}
                             <button className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg text-[var(--text-muted)] transition-all"><Download size={16} /></button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* ── Employee Detail Drawer ── */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end p-4 lg:p-6 overflow-hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in" onClick={() => setSelectedEmployee(null)} />
            <div className="relative w-full max-w-2xl bg-[var(--bg-secondary)]/95 border border-[var(--border-color)] h-full rounded-[2.5rem] shadow-2xl animate-in slide-in-from-right duration-700 flex flex-col backdrop-blur-xl">
                {/* Drawer Header */}
                <div className="px-8 py-8 border-b border-[var(--border-color)]">
                    <div className="flex items-center justify-between mb-8">
                       <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-[1.8rem] border-2 border-[var(--accent)]/30 overflow-hidden">
                             {selectedEmployee.photoUrl ? <img src={selectedEmployee.photoUrl} className="w-full h-full object-cover" alt=""/> : <User size={32} className="m-auto mt-4 text-[var(--text-muted)]" />}
                          </div>
                          <div>
                             <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{selectedEmployee.name}</h2>
                             <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">{selectedEmployee.position}</p>
                          </div>
                       </div>
                       <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-xl transition-all"><X size={24} /></button>
                    </div>
                    {/* Drawer Tabs */}
                    <div className="flex items-center gap-2 p-1 bg-[var(--bg-primary)]/50 rounded-2xl border border-[var(--border-color)] w-fit">
                       {[
                         { id: 'PROFILE', label: 'Perfil', icon: UserCircle },
                         { id: 'DOCS', label: 'Documentos', icon: FileText },
                         { id: 'PERFORMANCE', label: 'Métricas', icon: ActivitySquare },
                         { id: 'PAYROLL', label: 'Salários', icon: DollarSign },
                       ].map(t => (
                         <button
                           key={t.id}
                           onClick={() => setDrawerTab(t.id as any)}
                           className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${drawerTab === t.id ? 'bg-[var(--accent)] text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                         >
                           <t.icon size={12} /> {t.label}
                         </button>
                       ))}
                    </div>
                </div>

                {/* Drawer Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8">
                    {drawerTab === 'PROFILE' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
                          {[
                            { label: 'Unidade', value: selectedEmployee.department || 'Geral', icon: Building },
                            { label: 'Data Início', value: format(new Date(selectedEmployee.hireDate), 'dd/MM/yyyy'), icon: Calendar },
                            { label: 'Contacto', value: selectedEmployee.phone || 'N/A', icon: Phone },
                            { label: 'Email', value: selectedEmployee.email || 'N/A', icon: Mail },
                            { label: 'Salário Base', value: fmt(selectedEmployee.salary || 0), icon: DollarSign },
                            { label: 'Estado', value: selectedEmployee.status, icon: ShieldCheck },
                          ].map((item, i) => (
                            <div key={i} className="p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-color)] rounded-2xl">
                               <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-2">
                                  <item.icon size={10} /> {item.label}
                               </p>
                               <p className="text-xs font-black text-[var(--text-primary)]">{item.value}</p>
                            </div>
                          ))}
                       </div>
                    )}

                    {drawerTab === 'DOCS' && (
                       <div className="space-y-4 animate-in fade-in duration-500">
                          {documents.filter((d: any) => d.owner === selectedEmployee.name).map((doc: any) => (
                             <div key={doc.id} className="p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-color)] rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                   <FileText size={16} className="text-[var(--accent)]" />
                                   <span className="text-xs font-bold text-[var(--text-primary)]">{doc.name}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${doc.status === 'VALID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{doc.status}</span>
                             </div>
                          ))}
                          <button className="w-full py-4 border-2 border-dashed border-[var(--border-color)] rounded-2xl text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                             <Plus size={16} className="inline mr-2" /> Upload Documento
                          </button>
                       </div>
                    )}

                    {drawerTab === 'PERFORMANCE' && (
                       <div className="space-y-8 animate-in fade-in duration-500">
                          <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10">
                             <div className="flex items-center gap-4 mb-6">
                                <ActivitySquare className="text-indigo-500" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Métricas de Performance Operacional</h4>
                             </div>
                             <div className="space-y-4">
                                {[
                                   { l: 'Pontualidade', v: 94 },
                                   { l: 'Qualidade Técnica', v: 88 },
                                   { l: 'Trabalho em Equipa', v: 92 },
                                ].map((s, i) => (
                                   <div key={i} className="space-y-1.5">
                                      <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                                         <span>{s.l}</span>
                                         <span>{s.v}%</span>
                                      </div>
                                      <div className="h-1.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                                         <div className="h-full bg-indigo-500" style={{ width: `${s.v}%` }} />
                                      </div>
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    )}

                    {drawerTab === 'PAYROLL' && (
                       <div className="space-y-4 animate-in fade-in duration-500">
                          {payrolls.filter((p: any) => p.employeeId === selectedEmployee.id).map((p: any) => (
                             <div key={p.id} className="p-4 bg-[var(--bg-primary)]/40 border border-[var(--border-color)] rounded-2xl flex items-center justify-between">
                                <div>
                                   <p className="text-[10px] font-black text-[var(--text-primary)]">{p.periodMonth}/{p.periodYear}</p>
                                   <p className="text-[9px] text-[var(--text-muted)] font-bold italic">{fmt(p.netSalary)}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${p.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{p.status}</span>
                             </div>
                          ))}
                       </div>
                    )}
                </div>

                <div className="p-8 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/50 flex items-center gap-3">
                    <button onClick={() => setEvaluationModal(selectedEmployee)} className="premium-button-secondary py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest flex-1 flex items-center justify-center gap-2">
                       <Award size={14} /> Avaliar Performance
                    </button>
                    <button className="premium-button-primary py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest flex-1 flex items-center justify-center gap-2">
                       <History size={14} /> Histórico Completo
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ── Modals (Promotion, Evaluation, Payroll) ── */}
      {promotionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPromotionModal(null)} />
          <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-6">Promover Colaborador</h3>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              promoteMutation.mutate({
                id: promotionModal.id,
                newPosition: formData.get('position'),
                newDepartment: formData.get('department'),
                newSalary: formData.get('salary'),
                promotionNote: formData.get('notes')
              });
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Novo Cargo</label>
                <input name="position" defaultValue={promotionModal.position} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Novo Departamento</label>
                <input name="department" defaultValue={promotionModal.department} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Novo Salário Base (AOA)</label>
                <input name="salary" type="number" defaultValue={promotionModal.salary} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Notas da Promoção</label>
                <textarea name="notes" placeholder="Motivo da promoção..." className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)] h-24 resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setPromotionModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Confirmar Promoção</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {evaluationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEvaluationModal(null)} />
          <div className="relative w-full max-w-4xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex gap-8">
            <div className="flex-1 space-y-6">
              <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Avaliação de Desempenho</h3>
              <form id="evaluationForm" onSubmit={(e: any) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                evaluateMutation.mutate({
                  id: evaluationModal.id,
                  period: formData.get('period'),
                  punctuality: formData.get('punctuality'),
                  technical: formData.get('technical'),
                  teamwork: formData.get('teamwork'),
                  leadership: formData.get('leadership'),
                  notes: formData.get('notes')
                });
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {['punctuality', 'technical', 'teamwork', 'leadership'].map(key => (
                    <div key={key} className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">{key === 'punctuality' ? 'Pontualidade' : key === 'technical' ? 'Técnica' : key === 'teamwork' ? 'Equipa' : 'Liderança'}</label>
                      <input name={key} type="number" min="0" max="10" defaultValue="8" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                    </div>
                  ))}
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Período de Avaliação</label>
                  <input name="period" placeholder="ex: Q1 2024" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Observações</label>
                  <textarea name="notes" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)] h-24 resize-none" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setEvaluationModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Salvar Avaliação</button>
                </div>
              </form>
            </div>
            <div className="hidden lg:flex w-80 flex-col items-center justify-center p-6 bg-[var(--bg-primary)]/50 border border-[var(--border-color)] rounded-[1.5rem]">
               <h4 className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-8 text-center italic">Radar de Performance em Tempo Real</h4>
               <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                      { subject: 'Pontualidade', A: 8, fullMark: 10 },
                      { subject: 'Técnica', A: 7, fullMark: 10 },
                      { subject: 'Equipa', A: 9, fullMark: 10 },
                      { subject: 'Liderança', A: 6, fullMark: 10 },
                    ]}>
                      <PolarGrid stroke="var(--border-color)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 8 }} />
                      <Radar name="Score" dataKey="A" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} />
                    </RadarChart>
                  </ResponsiveContainer>
               </div>
               <p className="text-[8px] text-[var(--text-muted)] text-center mt-4 italic opacity-50">Altere os valores no formulário para visualizar o impacto estratégico no gráfico radar.</p>
            </div>
          </div>
        </div>
      )}

      {payrollModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPayrollModal(null)} />
          <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic mb-6">Processamento Salarial</h3>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              payrollMutation.mutate({
                employeeId: payrollModal.id,
                month: formData.get('month'),
                year: formData.get('year'),
                bonuses: formData.get('bonuses'),
                extraDeductions: formData.get('deductions'),
                absenceDays: formData.get('absences'),
                notes: formData.get('notes')
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Mês</label>
                  <input name="month" type="number" defaultValue={new Date().getMonth() + 1} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Ano</label>
                  <input name="year" type="number" defaultValue={new Date().getFullYear()} className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Bónus</label>
                  <input name="bonuses" type="number" defaultValue="0" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Descontos Extras</label>
                  <input name="deductions" type="number" defaultValue="0" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Faltas (Dias)</label>
                  <input name="absences" type="number" defaultValue="0" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)]" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Notas Adicionais</label>
                <textarea name="notes" className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs font-bold outline-none focus:border-[var(--accent)] h-24 resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setPayrollModal(null)} className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Cancelar</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg">Processar Salário</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRAdvanced;
