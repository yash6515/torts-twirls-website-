import React, { useState, useEffect } from 'react';
import { getAdminUsers, updateUserRole, toggleUserStatus } from '../../utils/api';
import { toast } from 'react-toastify';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = (p = page) => {
    setLoading(true);
    const params = { page: p, limit: 20 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    getAdminUsers(params)
      .then(res => {
        setUsers(res.data.users);
        setTotalPages(res.data.pages || 1);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const debounce = setTimeout(() => fetchUsers(1), 300);
    return () => clearTimeout(debounce);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await updateUserRole(userId, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: res.data.user.role } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (userId, action) => {
    setUpdatingId(userId);
    try {
      const res = await toggleUserStatus(userId, { action });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...res.data.user } : u));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-cream pt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
          <div>
            <p className="text-[0.7rem] font-sans uppercase tracking-[0.2em] text-rose-primary mb-1">Management</p>
            <h1 className="font-display text-[1.8rem] sm:text-[2.2rem] text-deep-brown">User Management</h1>
          </div>
          <div className="text-sm font-sans text-taupe bg-white px-4 py-2 rounded-xl shadow-card">
            {users.length} users shown
          </div>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-luxury pl-10 text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['', 'user', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => { setRoleFilter(r); setPage(1); }}
                className={`text-xs px-4 py-2.5 rounded-xl font-sans transition-all whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-rose-primary text-white shadow-sm font-medium'
                    : 'bg-white text-warm-gray hover:bg-cream hover:text-deep-brown border border-sand'
                }`}
              >
                {r === '' ? 'All Roles' : r === 'admin' ? 'Admins' : 'Users'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-rose-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Users table - responsive */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sand bg-cream/50">
                      {['User', 'Email', 'Role', 'Orders', 'Total Spent', 'Status', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="text-left text-[0.7rem] font-sans font-semibold uppercase tracking-wider text-taupe px-5 py-3.5">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => (
                      <tr
                        key={user._id}
                        className="border-b border-sand/40 hover:bg-cream/40 transition-colors"
                      >
                        {/* Name + avatar */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-rose-primary to-chocolate rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-sans font-medium text-deep-brown">{user.name}</p>
                              {user.phone && <p className="text-[0.68rem] text-taupe font-sans">{user.phone}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-sans text-warm-gray truncate max-w-[180px]">{user.email}</p>
                        </td>

                        {/* Role badge */}
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-sans font-medium capitalize ${
                            user.role === 'admin'
                              ? 'bg-rose-primary/10 text-rose-primary border border-rose-primary/20'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Orders */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-sans text-deep-brown font-medium">{user.orderCount || 0}</p>
                        </td>

                        {/* Total spent */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-sans text-deep-brown font-medium">
                            ₹{(user.totalSpent || 0).toLocaleString('en-IN')}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-sans font-medium ${
                            user.isBanned ? 'bg-red-50 text-red-700 border border-red-200' :
                            user.isActive !== false ? 'bg-green-50 text-green-700 border border-green-200' :
                            'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}>
                            {user.isBanned ? 'Banned' : user.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-sans text-taupe">
                            {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-1.5">
                            <select
                              value={user.role}
                              onChange={e => handleRoleChange(user._id, e.target.value)}
                              disabled={updatingId === user._id}
                              className="text-[0.72rem] border border-sand rounded-lg px-2 py-1.5 font-sans text-deep-brown outline-none focus:border-rose-primary bg-white w-28 capitalize"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                            <div className="flex gap-1">
                              {user.isBanned ? (
                                <button
                                  onClick={() => handleStatusToggle(user._id, 'unban')}
                                  disabled={updatingId === user._id}
                                  className="text-[0.68rem] px-2 py-1 rounded-md font-sans text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-50"
                                >
                                  Unban
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStatusToggle(user._id, 'ban')}
                                  disabled={updatingId === user._id}
                                  className="text-[0.68rem] px-2 py-1 rounded-md font-sans text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors disabled:opacity-50"
                                >
                                  Ban
                                </button>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card view */}
              <div className="md:hidden divide-y divide-sand/40">
                {users.map(user => (
                  <div key={user._id} className="p-4 hover:bg-cream/30 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-rose-primary to-chocolate rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-medium text-deep-brown">{user.name}</p>
                        <p className="text-xs text-taupe font-sans truncate">{user.email}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-sans font-medium capitalize ${
                        user.role === 'admin'
                          ? 'bg-rose-primary/10 text-rose-primary border border-rose-primary/20'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-3 text-xs font-sans text-taupe">
                        <span>{user.orderCount || 0} orders</span>
                        <span>₹{(user.totalSpent || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex gap-2">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          disabled={updatingId === user._id}
                          className="text-[0.72rem] border border-sand rounded-lg px-2 py-1.5 font-sans text-deep-brown outline-none focus:border-rose-primary bg-white capitalize"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        {user.isBanned ? (
                          <button
                            onClick={() => handleStatusToggle(user._id, 'unban')}
                            disabled={updatingId === user._id}
                            className="text-[0.68rem] px-2 py-1 rounded-md font-sans text-green-700 bg-green-50 border border-green-200"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusToggle(user._id, 'ban')}
                            disabled={updatingId === user._id}
                            className="text-[0.68rem] px-2 py-1 rounded-md font-sans text-red-700 bg-red-50 border border-red-200"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {users.length === 0 && (
                <div className="text-center py-16">
                  <span className="text-4xl block mb-3">👤</span>
                  <p className="text-warm-gray font-sans text-sm">No users found</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => { setPage(p => p - 1); fetchUsers(page - 1); }}
                  className="px-4 py-2 text-sm font-sans border border-sand rounded-xl text-warm-gray hover:bg-white disabled:opacity-40 transition-colors"
                >← Prev</button>
                <span className="px-4 py-2 text-sm font-sans text-deep-brown bg-white rounded-xl border border-sand">
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => { setPage(p => p + 1); fetchUsers(page + 1); }}
                  className="px-4 py-2 text-sm font-sans border border-sand rounded-xl text-warm-gray hover:bg-white disabled:opacity-40 transition-colors"
                >Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
