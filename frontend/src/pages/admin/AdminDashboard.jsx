import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  LayoutDashboard, FileText, Clock, CheckCircle, XCircle,
  AlertCircle, Shield, Search, Filter, ChevronLeft, ChevronRight,
  LogOut, RefreshCw, Eye, TrendingUp, Users, Loader2, UserCog
} from 'lucide-react';
import adminService from '../../services/adminService';
import '../../styles/theme.css';

const StatCard = ({ label, value, icon: Icon, color = 'text-blue-600', bg = 'bg-blue-50' }) => (
  <Card className="livishield-card">
    <CardContent className="p-5 flex items-center gap-4">
      <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <p className="text-2xl font-bold livishield-text-primary">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </CardContent>
  </Card>
);

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'documents_required', label: 'Docs Required' },
  { value: 'documents_expired', label: 'Docs Expired' },
  { value: 'medical_checkup_required', label: 'Medical Checkup' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'policy_issued', label: 'Policy Issued' },
];

/* ─── Users Tab ─── */
const UsersTab = () => {
  const [users, setUsers]           = useState([]);
  const [pagination, setPagination] = useState({ currentPage:1, totalPages:1, totalUsers:0 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage]             = useState(1);
  const [changingRole, setChangingRole] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers({ page, limit: 20, search, role: roleFilter });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(userId);
    try {
      await adminService.updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) { alert(e.message); }
    finally { setChangingRole(null); }
  };

  const roleBadge = (role) => ({
    admin:    'bg-purple-100 text-purple-700 border-purple-200',
    agent:    'bg-blue-100 text-blue-700 border-blue-200',
    customer: 'bg-gray-100 text-gray-600 border-gray-200',
  }[role] || 'bg-gray-100 text-gray-500');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 livishield-focus-ring" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 livishield-focus-ring">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="agent">Agent</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Card className="livishield-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin livishield-text-accent" /></div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Phone</th>
                    <th className="text-left px-4 py-3 font-medium">Role</th>
                    <th className="text-left px-4 py-3 font-medium">Proposals</th>
                    <th className="text-left px-4 py-3 font-medium">Joined</th>
                    <th className="px-4 py-3 font-medium">Change Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border capitalize ${roleBadge(u.role)}`}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{u.proposalCount || 0}</td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{adminService.formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <select value={u.role} disabled={changingRole === u.id}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 livishield-focus-ring">
                          <option value="customer">Customer</option>
                          <option value="agent">Agent</option>
                          <option value="admin">Admin</option>
                        </select>
                        {changingRole === u.id && <Loader2 className="inline h-3 w-3 animate-spin ml-1" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">{pagination.totalUsers} users total</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0"><ChevronLeft className="h-4 w-4" /></Button>
                <span className="text-xs text-gray-600">{page} / {pagination.totalPages}</span>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── Plans Tab ─── */
const PlansTab = () => {
  const [plans, setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [busy, setBusy]     = useState(null);
  const [msg, setMsg]       = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getPlans({ status: statusFilter });
      setPlans(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const handleDiscontinue = async (id, name) => {
    if (!window.confirm(`Discontinue "${name}"? It won't appear in new quotes.`)) return;
    setBusy(id);
    try {
      await adminService.deletePlan(id);
      setMsg('Plan discontinued.');
      fetchPlans();
    } catch (e) { setMsg('Error: ' + e.message); }
    finally { setBusy(null); setTimeout(() => setMsg(null), 3000); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 livishield-focus-ring">
          <option value="">All Plans</option>
          <option value="active">Active</option>
          <option value="discontinued">Discontinued</option>
        </select>
        {msg && <span className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1">{msg}</span>}
      </div>
      <Card className="livishield-card">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="h-7 w-7 animate-spin livishield-text-accent" /></div>
          ) : plans.length === 0 ? (
            <div className="text-center py-16">
              <Shield className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No plans found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="text-left px-4 py-3">Plan</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Sum Insured</th>
                    <th className="text-left px-4 py-3">Annual Premium</th>
                    <th className="text-left px-4 py-3">Rating</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {plans.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.provider}</p>
                      </td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{p.type}</Badge></td>
                      <td className="px-4 py-3 text-xs font-medium livishield-text-accent">{adminService.formatCurrency(p.sumInsured)}</td>
                      <td className="px-4 py-3 text-xs font-medium">{adminService.formatCurrency(p.premium?.annual)}</td>
                      <td className="px-4 py-3 text-xs">⭐ {p.rating}</td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs border ${p.status === 'active' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {p.status === 'active' && (
                          <Button size="sm" variant="outline" disabled={busy === p.id}
                            onClick={() => handleDiscontinue(p.id, p.name)}
                            className="text-xs h-7 text-red-600 border-red-200 hover:bg-red-50">
                            {busy === p.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Discontinue'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

/* ─── Main Component ─── */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('proposals');
  const [stats, setStats]           = useState(null);
  const [proposals, setProposals]   = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalProposals: 0 });
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { const res = await adminService.getDashboardStats(); setStats(res.data); }
    catch (e) { setError(e.message); }
    finally { setStatsLoading(false); }
  }, []);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getProposals({ page, limit: 15, status: statusFilter, search });
      setProposals(res.data.proposals);
      setPagination(res.data.pagination);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { if (activeTab === 'proposals') fetchProposals(); }, [fetchProposals, activeTab]);

  const handleSearch = useCallback((e) => { e.preventDefault(); setPage(1); fetchProposals(); }, [fetchProposals]);
  const handleLogout = async () => { await logout(); navigate('/login'); };

  const TABS = [
    { id: 'proposals', label: 'Proposals', icon: FileText },
    { id: 'users',     label: 'Users',     icon: Users },
    { id: 'plans',     label: 'Plans',     icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="livishield-gradient-header sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg border border-white/30"><Shield className="h-5 w-5 text-white" /></div>
            <div><span className="text-white font-bold text-sm">LiviShield</span><span className="text-white/60 text-xs ml-2">Admin Panel</span></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-white text-xs font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-white/60 text-xs">Administrator</p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 text-xs">Admin</Badge>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white/80 hover:text-white hover:bg-white/10"><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold livishield-text-primary flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 livishield-text-accent" />Underwriting Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Review and manage insurance proposals, users, and plans</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchStats(); fetchProposals(); }} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </Button>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">{[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border animate-pulse" />)}</div>
        ) : stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Proposals"  value={stats.total}          icon={FileText}    color="text-blue-600"   bg="bg-blue-50" />
            <StatCard label="Pending Review"   value={stats.pendingReview}  icon={Clock}       color="text-amber-600"  bg="bg-amber-50" />
            <StatCard label="Approved"         value={stats.approved}       icon={CheckCircle} color="text-green-600"  bg="bg-green-50" />
            <StatCard label="Rejected"         value={stats.rejected}       icon={XCircle}     color="text-red-600"    bg="bg-red-50" />
            <StatCard label="Under Review"     value={stats.underReview}    icon={TrendingUp}  color="text-yellow-600" bg="bg-yellow-50" />
            <StatCard label="Docs Required"    value={stats.docsRequired}   icon={AlertCircle} color="text-orange-600" bg="bg-orange-50" />
            <StatCard label="Medical Checkup"  value={stats.medicalCheckup} icon={UserCog}     color="text-purple-600" bg="bg-purple-50" />
            <StatCard label="This Week"        value={stats.recentWeek}     icon={TrendingUp}  color="text-cyan-600"   bg="bg-cyan-50" />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 livishield-text-accent'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}>
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Proposals Tab ── */}
        {activeTab === 'proposals' && (
          <>
            <Card className="livishield-card mb-4">
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search by proposal number, name or email..."
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400 shrink-0" />
                    <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }}
                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 livishield-focus-ring">
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <Button type="submit" className="livishield-btn-primary gap-1.5 shrink-0">
                    <Search className="h-4 w-4" />Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="livishield-card">
              <CardContent className="p-0">
                {error && (
                  <div className="p-4 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />{error}
                  </div>
                )}
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin livishield-text-accent" />
                  </div>
                ) : proposals.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">No proposals found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                          <th className="text-left px-4 py-3 font-medium">Proposal</th>
                          <th className="text-left px-4 py-3 font-medium">Applicant</th>
                          <th className="text-left px-4 py-3 font-medium">Plan</th>
                          <th className="text-left px-4 py-3 font-medium">Premium</th>
                          <th className="text-left px-4 py-3 font-medium">Docs</th>
                          <th className="text-left px-4 py-3 font-medium">Status</th>
                          <th className="text-left px-4 py-3 font-medium">Submitted</th>
                          <th className="px-4 py-3" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {proposals.map(p => (
                          <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-mono text-xs font-semibold livishield-text-primary">{p.proposalNumber}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{p.applicant.name || '—'}</p>
                              <p className="text-xs text-gray-400 truncate max-w-[160px]">{p.applicant.email}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800 truncate max-w-[140px]">{p.plan.name}</p>
                              <p className="text-xs text-gray-400">{p.plan.provider}</p>
                            </td>
                            <td className="px-4 py-3 font-medium livishield-text-accent whitespace-nowrap">
                              {adminService.formatCurrency(p.totalPremium)}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${p.docsMandatoryDone === p.docsMandatory ? 'bg-green-500' : 'livishield-bg-accent'}`}
                                    style={{ width: `${p.docsMandatory ? (p.docsMandatoryDone / p.docsMandatory) * 100 : 0}%` }} />
                                </div>
                                <span className="text-xs text-gray-500">{p.docsMandatoryDone}/{p.docsMandatory}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={`text-xs border ${adminService.statusColor(p.status)}`}>
                                {adminService.statusLabel(p.status)}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                              {adminService.formatDate(p.submittedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7"
                                onClick={() => navigate(`/admin/proposals/${p.id}`)}>
                                <Eye className="h-3.5 w-3.5" />Review
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-xs text-gray-500">
                      Showing {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.totalProposals)} of {pagination.totalProposals}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={!pagination.hasPrev}
                        onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-xs text-gray-600">{page} / {pagination.totalPages}</span>
                      <Button variant="outline" size="sm" disabled={!pagination.hasNext}
                        onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && <UsersTab />}

        {/* ── Plans Tab ── */}
        {activeTab === 'plans' && <PlansTab />}

      </div>
    </div>
  );
};

export default AdminDashboard;
