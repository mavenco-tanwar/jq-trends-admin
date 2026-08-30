'use client';

import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, Check, X } from 'lucide-react';
import { UserService } from '@/services/users';
import type { Role } from '@/types';

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState('role_owner');

  useEffect(() => {
    UserService.getRoles().then((r) => setRoles(r));
  }, []);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) || roles[0];

  const permissionModules = [
    {
      module: 'Catalog Management',
      actions: [
        { name: 'View Products', code: 'products.view' },
        { name: 'Create & Edit Products', code: 'products.create' },
        { name: 'Delete Products', code: 'products.delete' },
        { name: 'Manage Categories & Collections', code: 'categories.manage' },
        { name: 'Stock Inventory Adjustments', code: 'inventory.manage' },
      ],
    },
    {
      module: 'Sales & Fulfillment',
      actions: [
        { name: 'View Orders', code: 'orders.view' },
        { name: 'Update Order Status & Dispatch', code: 'orders.update_status' },
        { name: 'Customer Data Access', code: 'customers.view' },
        { name: 'Review Moderation', code: 'reviews.moderate' },
      ],
    },
    {
      module: 'Headless CMS & Visual Homepage Builder',
      actions: [
        { name: 'Edit Homepage Blocks', code: 'content.edit' },
        { name: 'Toggle Block Visibility ON/OFF', code: 'content.publish' },
        { name: 'Publish Live Storefront', code: 'content.publish' },
        { name: 'Upload Media Assets', code: 'media.upload' },
      ],
    },
    {
      module: 'System & Security',
      actions: [
        { name: 'Store & Theme Settings', code: 'settings.manage' },
        { name: 'Payment & Gateway Config', code: 'settings.manage' },
        { name: 'User Management & Roles', code: 'users.manage' },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Role-Based Access Control
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Roles &amp; Granular Permissions</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Define permissions and authorization matrix for each staff role.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        {/* Roles Tabs (4 cols) */}
        <div className="lg:col-span-4 space-y-2">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedRoleId(r.id)}
              className={`w-full p-4 rounded-xl text-left border transition-all ${
                selectedRoleId === r.id
                  ? 'bg-rose-950/20 border-rose-500/60 shadow-md'
                  : 'bg-[#161822] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{r.name}</span>
                {r.isSystem && (
                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                    System
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">{r.description}</p>
            </button>
          ))}
        </div>

        {/* Permission Matrix (8 cols) */}
        <div className="lg:col-span-8 bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>{selectedRole?.name} Permissions</span>
            </h3>
            <span className="text-[10px] text-slate-400">
              {selectedRole?.id === 'role_owner' ? 'All Permissions Granted' : 'Custom Permission Set'}
            </span>
          </div>

          <div className="space-y-4">
            {permissionModules.map((pm) => (
              <div key={pm.module} className="p-4 bg-[#10121A] rounded-xl border border-slate-800 space-y-2.5">
                <span className="font-bold text-white text-xs uppercase tracking-wider block">
                  {pm.module}
                </span>
                <div className="divide-y divide-slate-800/60">
                  {pm.actions.map((act) => {
                    const isGranted =
                      selectedRole?.id === 'role_owner' ||
                      selectedRole?.permissions?.some((p) => (p as any) === act.code || (p as any) === '*' || (p as any).code === act.code);
                    return (
                      <div key={act.name} className="py-2 flex items-center justify-between">
                        <span className="text-slate-300">{act.name}</span>
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                          }`}
                        >
                          {isGranted ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
