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
  const [activeTenant, setActiveTenant] = useState<{ id: string; slug: string; name: string; brandColor: string }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const t = PlatformService.getActiveTenant();
        if (t) {
          return {
            id: t.id || `store_${t.slug || 'lumina'}`,
            slug: (t.slug || 'lumina').toLowerCase().trim(),
            name: t.name || 'Storefront',
            brandColor: (t as any).brandColor || (t as any).themeColor || '#E11D48',
          };
        }
      } catch {}
    }
    return {
      id: '',
      slug: '',
      name: '',
      brandColor: '#E11D48',
    };
  });

  const [document, setDocument] = useState<BuilderDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize active tenant and load saved document
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const tenant = await PlatformService.getActiveTenant();
        const tenantInfo = {
          id: tenant?.id || `store_${tenant?.slug || 'storefront'}`,
          slug: (tenant?.slug || 'storefront').toLowerCase().trim(),
          name: tenant?.name || 'Storefront',
          brandColor: (tenant as any)?.brandColor || (tenant as any)?.themeColor || '#E11D48',
        };
        setActiveTenant(tenantInfo);

        const slug = tenantInfo.slug;
        const res = await ApiClient.get<any>(`/api/v1/content/footer?tenant=${slug}&preview=draft&_t=${Date.now()}`);

        if (res.data?.sections && res.data.sections.length > 0) {
          // If logo or copyright blocks are empty, hydrate with dynamic store name
          const hydratedSections = res.data.sections.map((sec: any) => ({
            ...sec,
            blocks: (sec.blocks || []).map((blk: any) => {
              if (blk.type === 'logo' && (!blk.content?.text || blk.content.text === 'MAVENCO LUXURY')) {
                return { ...blk, content: { ...blk.content, text: tenantInfo.name.toUpperCase() } };
              }
              if (blk.type === 'copyright' && (!blk.content?.storeName || blk.content.storeName === 'MAVENCO LUXURY')) {
                return { ...blk, content: { ...blk.content, storeName: tenantInfo.name.toUpperCase() } };
              }
              return blk;
            }),
          }));

          setDocument({ ...res.data, sections: hydratedSections });
        } else {
          setDocument(getDefaultFooterDocument(slug, tenantInfo.name));
        }
      } catch (err) {
        console.warn('Failed to fetch footer config from API, using dynamic seed:', err);
        const t = PlatformService.getActiveTenant();
        setDocument(getDefaultFooterDocument(t?.slug || 'storefront', t?.name || 'STOREFRONT'));
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Save Draft Handler
  const handleSaveDraft = async (doc: BuilderDocument) => {
    const slug = activeTenant.slug || 'storefront';
    await ApiClient.put(`/api/v1/content/footer?tenant=${slug}`, {
      ...doc,
      tenantSlug: slug,
      status: 'draft',
    });
  };

  // Publish Handler
  const handlePublish = async (doc: BuilderDocument) => {
    const slug = activeTenant.slug || 'storefront';
    await ApiClient.put(`/api/v1/content/footer?tenant=${slug}`, {
      ...doc,
      tenantSlug: slug,
      status: 'published',
    });
  };

  // Fetch Version History
  const handleFetchVersions = async (): Promise<BuilderVersion[]> => {
    const slug = activeTenant.slug || 'storefront';
    try {
      const res = await ApiClient.get<any[]>(`/api/v1/content/footer/versions?tenant=${slug}`);
      return res.data || [];
    } catch {
      return [];
    }
  };

  // Restore Version
  const handleRestoreVersion = async (versionId: string): Promise<BuilderDocument | void> => {
    const slug = activeTenant.slug || 'storefront';
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
          Loading {activeTenant.name ? `${activeTenant.name} ` : ''}Footer Builder...
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
