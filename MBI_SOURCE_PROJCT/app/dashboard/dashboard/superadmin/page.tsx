'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { api } from '@/lib/api'
import { Crown, Shield, Users, Settings, Zap, Server, Loader2, Plus, CheckCircle } from 'lucide-react'

interface SuperAdminProfile {
  systemName: string
  contactEmail: string
  contactPhone?: string
  createdAt: string
  lastLoginAt?: string
}

interface CreateAdminForm {
  firstname: string
  lastname: string
  email: string
  password: string
}

export default function SuperAdminDashboard() {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<SuperAdminProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [createForm, setCreateForm] = useState<CreateAdminForm>({ firstname: '', lastname: '', email: '', password: '' })
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/v1/superadmin/profile/me')
        setProfile(response.data)
      } catch (err) {
        console.error('Failed to fetch superadmin profile', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleCreateAdmin = async () => {
    if (!createForm.firstname || !createForm.lastname || !createForm.email || !createForm.password) {
      setMessage('❌ All fields are required')
      return
    }

    setIsCreating(true)
    setMessage('')

    try {
      // SuperAdmin creates admin directly - no verification needed
      await api.post('/v1/superadmin/create-admin', createForm)
      setMessage('✅ Admin account created successfully')
      setCreateForm({ firstname: '', lastname: '', email: '', password: '' })
      setShowCreateAdmin(false)
    } catch (err: any) {
      setMessage(err?.response?.data?.message || '❌ Failed to create admin')
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f]">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] p-6">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{ backgroundImage: `url('/textures/texture.jpg')`, backgroundRepeat: 'repeat', backgroundSize: '200px 200px' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at top right, rgba(255,107,53,0.08) 0%, transparent 60%)' }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-8 h-8 text-[#ff6b35]"
              style={{ filter: 'drop-shadow(0 0 15px rgba(255,107,53,1))' }}
            />
            <h1 className="text-3xl font-black text-white tracking-tight">
              SUPER ADMIN
              <span className="text-[#ff6b35] ml-2"
                style={{ textShadow: '0 0 20px rgba(255,107,53,0.5)' }}
              >COMMAND CENTER</span>
            </h1>
          </div>
          <p className="text-gray-400 text-sm">
            Welcome, <span className="text-[#ff6b35] font-bold">{user?.firstname}</span> — you have full system control
          </p>
        </div>

        {/* System Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#0d0d14] border border-[#ff6b35]/20 rounded-2xl p-5">
            <Server className="w-5 h-5 text-[#ff6b35] mb-3" />
            <div className="text-sm text-gray-500 mb-1">Platform</div>
            <div className="text-white font-bold">{profile?.systemName || 'E-Gaming Platform'}</div>
          </div>

          <div className="bg-[#0d0d14] border border-[#ff6b35]/20 rounded-2xl p-5">
            <Shield className="w-5 h-5 text-[#ff6b35] mb-3" />
            <div className="text-sm text-gray-500 mb-1">Your Role</div>
            <div className="text-[#ff6b35] font-black">SUPERADMIN</div>
          </div>

          <div className="bg-[#0d0d14] border border-[#ff6b35]/20 rounded-2xl p-5">
            <CheckCircle className="w-5 h-5 text-green-400 mb-3" />
            <div className="text-sm text-gray-500 mb-1">System Status</div>
            <div className="text-green-400 font-bold">Online</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${
            message.startsWith('✅')
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Create Admin Section */}
        <div className="relative mb-6">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ff6b35]/20 to-transparent rounded-2xl blur-sm"></div>
          <div className="relative bg-[#0d0d14] border border-[#ff6b35]/20 rounded-2xl overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ff6b35]/10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#ff6b35]" />
                <h2 className="text-white font-bold">Admin Management</h2>
              </div>
              <button
                onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff6b35]/10 border border-[#ff6b35]/30 text-[#ff6b35] text-sm font-bold rounded-xl hover:bg-[#ff6b35]/20 transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Admin
              </button>
            </div>

            {/* Create Admin Form */}
            {showCreateAdmin && (
              <div className="px-6 py-5 border-b border-[#ff6b35]/10 bg-[#ff6b35]/5">
                <h3 className="text-white font-semibold mb-4 text-sm">New Admin Account</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="First name"
                    value={createForm.firstname}
                    onChange={e => setCreateForm(prev => ({ ...prev, firstname: e.target.value }))}
                    className="px-4 py-2.5 bg-[#1a1a24] border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff6b35]/50"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={createForm.lastname}
                    onChange={e => setCreateForm(prev => ({ ...prev, lastname: e.target.value }))}
                    className="px-4 py-2.5 bg-[#1a1a24] border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff6b35]/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={createForm.email}
                    onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="px-4 py-2.5 bg-[#1a1a24] border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff6b35]/50"
                  />
                  <input
                    type="password"
                    placeholder="Temporary password"
                    value={createForm.password}
                    onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="px-4 py-2.5 bg-[#1a1a24] border border-[#ff6b35]/20 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#ff6b35]/50"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCreateAdmin}
                    disabled={isCreating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ff6b35] to-[#ff0000] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                    Create Admin
                  </button>
                  <button
                    onClick={() => setShowCreateAdmin(false)}
                    className="px-5 py-2.5 bg-[#1a1a24] border border-[#ff6b35]/20 text-gray-400 text-sm font-bold rounded-xl hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="px-6 py-5 text-center text-gray-600 text-sm">
              Admins created here are immediately active — no email verification required.
              They can approve players and manage the platform.
            </div>
          </div>
        </div>

        {/* System Profile */}
        <div className="bg-[#0d0d14] border border-[#ff6b35]/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-[#ff6b35]" />
            <h2 className="text-white font-bold">System Profile</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Contact Email</div>
              <div className="text-white">{profile?.contactEmail || user?.email}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Contact Phone</div>
              <div className="text-white">{profile?.contactPhone || '—'}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Account Created</div>
              <div className="text-white">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Last Login</div>
              <div className="text-white">
                {profile?.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}