'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  Folder,
  Search,
  Plus,
  Smartphone,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { MediaService } from '@/services/media';
import { useToast } from '@/lib/toast-context';
import { Modal } from '@/components/ui/Modal';
import type { MediaAsset } from '@/types';

const FOLDERS = ['All', 'Homepage', 'Products', 'Women', 'Kids', 'Banners', 'Campaigns'];

export default function MediaLibraryPage() {
  const { showToast } = useToast();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload state
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [dragOver, setDragOver] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState<any>('Products');

  const fetchAssets = async () => {
    const list = await MediaService.getAll();
    setAssets(list);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const resetUploadState = () => {
    setIsUploadOpen(false);
    setUploadMode('device');
    setFilePreview(null);
    setSelectedFile(null);
    setUploadUrl('');
    setUploadFilename('');
    setUploadAlt('');
    setUploadFolder('Products');
  };

  const handleCopyUrl = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    showToast('Copied image CDN link to clipboard!', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF)', 'error');
      return;
    }

    setSelectedFile(file);
    setUploadFilename(file.name);
    setUploadAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));

    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = uploadUrl;
    let finalSize = 250000;
    let finalMime = 'image/jpeg';

    if (uploadMode === 'device') {
      if (!filePreview) return;
      finalUrl = filePreview;
      finalSize = selectedFile?.size || 250000;
      finalMime = selectedFile?.type || 'image/jpeg';
    } else {
      if (!uploadUrl) return;
    }

    await MediaService.upload({
      url: finalUrl,
      filename: uploadFilename || (selectedFile?.name || `upload-${Date.now()}.jpg`),
      altText: uploadAlt,
      folder: uploadFolder,
      mimeType: finalMime,
      sizeBytes: finalSize,
    });

    showToast('Image added to media library', 'success');
    resetUploadState();
    fetchAssets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    await MediaService.delete(id);
    showToast('Media asset removed', 'info');
    fetchAssets();
  };

  const filtered = assets.filter((a) => {
    if (selectedFolder !== 'All' && a.folder !== selectedFolder) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.filename.toLowerCase().includes(q) || (a.altText && a.altText.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-20 select-none max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
            Digital Asset Management
          </span>
          <h1 className="text-2xl font-bold text-white mt-1">Media Asset Library</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload from computer or phone, or link external CDN images with automatic folder categorization.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-rose-950/40 transition-all"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Media</span>
        </button>
      </div>

      {/* Folders Bar & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-[#161822] p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFolder(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedFolder === f
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search filename or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((asset) => (
          <div
            key={asset.id}
            className="bg-[#161822] border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between group hover:border-slate-700 transition-all"
          >
            {/* Image Preview */}
            <div className="relative aspect-square bg-[#10121A] overflow-hidden">
              <img
                src={asset.url}
                alt={asset.altText || asset.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  onClick={() => handleCopyUrl(asset.id, asset.url)}
                  className="p-1.5 bg-slate-800 text-white hover:bg-slate-700 rounded-lg shadow"
                  title="Copy CDN Link"
                >
                  {copiedId === asset.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(asset.id)}
                  className="p-1.5 bg-rose-600 text-white hover:bg-rose-500 rounded-lg shadow"
                  title="Delete File"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata Footer */}
            <div className="p-2.5 bg-[#12141D] border-t border-slate-800/80 space-y-1 text-xs">
              <div className="font-semibold text-white text-[11px] truncate" title={asset.filename}>
                {asset.filename}
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span>{asset.folder}</span>
                <span>{(asset.sizeBytes / 1024).toFixed(0)} KB</span>
              </div>
              {asset.usedInCount ? (
                <div className="text-[10px] text-rose-300 font-semibold truncate" title={asset.usedIn?.join(', ')}>
                  Used in: {asset.usedInCount} section(s)
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <Modal
          isOpen={isUploadOpen}
          onClose={resetUploadState}
          title="Upload Media Asset"
          maxWidth="lg"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
            {/* Mode Switch: Device (PC/Phone) vs URL */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('device')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    uploadMode === 'device'
                      ? 'bg-slate-800 text-rose-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>From Computer / Phone</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('url')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    uploadMode === 'url'
                      ? 'bg-slate-800 text-rose-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Web CDN URL</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Folder:{' '}
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 ml-1 text-xs"
                >
                  {FOLDERS.filter((f) => f !== 'All').map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mode A: Device File Upload */}
            {uploadMode === 'device' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {!filePreview ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2.5 ${
                      dragOver
                        ? 'border-rose-500 bg-rose-500/10'
                        : 'border-slate-700 bg-[#10121A] hover:border-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-rose-400 shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-white text-xs">
                        Click to browse from Computer / Phone or drag &amp; drop
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        High resolution JPG, PNG, WEBP, SVG or GIF (up to 20MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0 bg-black">
                      <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white text-xs truncate">
                        {selectedFile?.name || 'Uploaded Image'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ready to upload'}
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[11px] text-rose-400 hover:underline mt-0.5 font-semibold inline-block"
                      >
                        Change Image
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFilePreview(null);
                        setSelectedFile(null);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: URL Input */}
            {uploadMode === 'url' && (
              <div>
                <label className="block text-slate-300 font-bold mb-1">Image URL (Direct CDN Link) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-..."
                  value={uploadUrl}
                  onChange={(e) => {
                    setUploadUrl(e.target.value);
                    if (!uploadFilename && e.target.value) {
                      setUploadFilename(`cdn-asset-${Date.now()}.jpg`);
                    }
                  }}
                  className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-bold mb-1">Filename</label>
              <input
                type="text"
                placeholder="e.g. spring-lookbook-01.jpg"
                value={uploadFilename}
                onChange={(e) => setUploadFilename(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Alt Text (Accessibility &amp; SEO)</label>
              <input
                type="text"
                placeholder="Descriptive image caption..."
                value={uploadAlt}
                onChange={(e) => setUploadAlt(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={resetUploadState}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadMode === 'device' ? !filePreview : !uploadUrl}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md disabled:opacity-40 transition-all"
              >
                Add to Library
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
