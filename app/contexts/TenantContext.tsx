'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

type TenantSummary = { id: string; companyName: string; subdomain: string | null };

type TenantContextValue = {
  selectedTenantId: string | null;
  setSelectedTenantId: (tenantId: string | null) => void;
  tenants: TenantSummary[];
  refreshTenants: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [selectedTenantId, setSelectedTenantIdState] = useState<string | null>(null);
  const [tenants, setTenants] = useState<TenantSummary[]>([]);
  const originalFetchRef = useRef<typeof fetch | null>(null);

  const setSelectedTenantId = useCallback((tenantId: string | null) => {
    setSelectedTenantIdState(tenantId);
    if (typeof window !== 'undefined') {
      if (tenantId) window.localStorage.setItem('selectedTenantId', tenantId);
      else window.localStorage.removeItem('selectedTenantId');
    }
  }, []);

  const refreshTenants = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/tenants', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        const items: TenantSummary[] = (data?.tenants || data || []).map((t: any) => ({
          id: t.id,
          companyName: t.companyName || t.name || 'Tenant',
          subdomain: t.subdomain || null,
        }));
        setTenants(items);
      }
    } catch {}
  }, []);

  // Load saved selection
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem('selectedTenantId');
    if (saved) setSelectedTenantIdState(saved);
  }, []);

  // Load tenants when user is available
  useEffect(() => {
    if (user?.role === 'SUPERUSER') {
      refreshTenants();
    }
  }, [user?.role, refreshTenants]);

  // Install global fetch wrapper for SUPERUSER to inject x-tenant-id
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (user?.role !== 'SUPERUSER') return;

    if (!originalFetchRef.current) originalFetchRef.current = window.fetch.bind(window);
    const baseFetch = originalFetchRef.current;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const sel = selectedTenantId;
      if (!sel) return baseFetch(input, init);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers = new Headers((init && init.headers) || undefined);
      headers.set('x-tenant-id', sel);
      if (token) headers.set('authorization', `Bearer ${token}`);

      // If JSON body, ensure tenantId is present
      let body = init?.body;
      const contentType = headers.get('content-type') || headers.get('Content-Type') || '';
      if (contentType.includes('application/json') && typeof body === 'string') {
        try {
          const parsed = JSON.parse(body);
          if (parsed && typeof parsed === 'object' && parsed.tenantId == null) {
            parsed.tenantId = sel;
            body = JSON.stringify(parsed);
          }
        } catch {}
      }

      const nextInit: RequestInit = { ...(init || {}), headers, body };
      return baseFetch(input, nextInit);
    };

    return () => {
      if (originalFetchRef.current) {
        window.fetch = originalFetchRef.current;
      }
    };
  }, [selectedTenantId, user?.role]);

  const value = useMemo(() => ({ selectedTenantId, setSelectedTenantId, tenants, refreshTenants }), [selectedTenantId, setSelectedTenantId, tenants, refreshTenants]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}


