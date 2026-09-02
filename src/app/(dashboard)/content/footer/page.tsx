'use client';

import React, { useState, useEffect } from 'react';
import { Builder } from '@/components/builder/core/Builder';
import { BuilderDocument, BuilderVersion } from '@/components/builder/types/builder.types';
import { getDefaultFooterDocument, FOOTER_PRESETS } from '@/components/builder/presets/footerPresets';
import { PlatformService } from '@/services/platform';
import { ApiClient } from '@/services/api';
import { Loader2 } from 'lucide-react';
// Ensure footer blocks are registered
import '@/components/builder/registry/footerBlocks';

export default function FooterBuilderPage() {
  const [activeTenant, setActiveTenant] = useState<{ id: string; slug: string; name: string; brandColor: string }>({
    id: 'store_jq_trends',
    slug: 'jqtrends',
    name: 'JQ TRENDS',
    brandColor: '#E11D48',
  });

  const [document, setDocument] = useState<BuilderDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize active tenant and load saved document
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenant = await PlatformService.getActiveTenant();
        if (tenant) {
          setActiveTenant({
            id: tenant.id || `store_${tenant.slug || 'jqtrends'}`,
            slug: (tenant.slug || 'jqtrends').toLowerCase().trim(),
            name: tenant.name || 'Storefront',
            brandColor: (tenant as any).brandColor || (tenant as any).themeColor || '#E11D48',
          });
        }

        const slug = (tenant?.slug || 'jqtrends').toLowerCase().trim();
        const res = await ApiClient.get<any>(`/api/v1/content/footer?tenant=${slug}&preview=draft&_t=${Date.now()}`);

        if (res.data?.sections && res.data.sections.length > 0) {
          setDocument(res.data);
        } else {
          setDocument(getDefaultFooterDocument(slug, tenant?.name || 'STOREFRONT'));
        }
      } catch (err) {
        console.warn('Failed to fetch footer config from API, using default seed:', err);
        setDocument(getDefaultFooterDocument('jqtrends', 'JQ TRENDS'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async (doc: BuilderDocument) => {
    const slug = activeTenant.slug || 'jqtrends';
    await ApiClient.put(`/api/v1/content/footer?tenant=${slug}`, {
      ...doc,
      tenantSlug: slug,
      status: 'draft',
    });
  };

  // Publish Handler
  const handlePublish = async (doc: BuilderDocument) => {
    const slug = activeTenant.slug || 'jqtrends';
    await ApiClient.put(`/api/v1/content/footer?tenant=${slug}`, {
      ...doc,
      tenantSlug: slug,
      status: 'published',
    });
  };

  // Fetch Version History
  const handleFetchVersions = async (): Promise<BuilderVersion[]> => {
    const slug = activeTenant.slug || 'jqtrends';
    try {
      const res = await ApiClient.get<any[]>(`/api/v1/content/footer/versions?tenant=${slug}`);
      return res.data || [];
    } catch {
      return [];
    }
  };

  // Restore Version
  const handleRestoreVersion = async (versionId: string): Promise<BuilderDocument | void> => {
    const slug = activeTenant.slug || 'jqtrends';
    const res = await ApiClient.post<any>(`/api/v1/content/footer/restore/${versionId}?tenant=${slug}`, {});
    if (res.data) {
      setDocument(res.data);
      return res.data;
    }
  };

  if (isLoading || !document) {
    return (
      <div className="h-screen bg-[#07090E] flex flex-col items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Loading {activeTenant.name} Footer Builder...
        </span>
      </div>
    );
  }

  return (
    <Builder
      initialDocument={document}
      presets={FOOTER_PRESETS}
      onSaveDraft={handleSaveDraft}
      onPublish={handlePublish}
      onFetchVersions={handleFetchVersions}
      onRestoreVersion={handleRestoreVersion}
      tenantSlug={activeTenant.slug}
    />
  );
}
