'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Upload,
  Check,
  Folder,
  X,
  Smartphone,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { MediaService } from '@/services/media';
import type { MediaAsset } from '@/types';
import { Modal } from './Modal';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  title?: string;
}

const FOLDERS = ['All', 'Homepage', 'Products', 'Women', 'Kids', 'Banners', 'Campaigns'];

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Media Image',
}: MediaPickerModalProps) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // Upload Drawer State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [dragOver, setDragOver] = useState(false);

  // File Input References for 100% Reliable Native File Picker
  const fileInputRef = useRef<HTMLInputElement>(null);
  const changeFileInputRef = useRef<HTMLInputElement>(null);

  // File from computer / phone state
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // URL state
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadAlt, setUploadAlt] = useState('');
  const [uploadFolder, setUploadFolder] = useState<string>('Products');

  const loadAssets = async () => {
    const list = await MediaService.getAll();
    setAssets(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadAssets();
      setSelectedAsset(null);
      resetUploadForm();
    }
  }, [isOpen]);

  const resetUploadForm = () => {
    setIsUploading(false);
    setFilePreview(null);
    setSelectedFile(null);
    setUploadUrl('');
    setUploadFilename('');
    setUploadAlt('');
    setUploadMode('device');
    setUploadFolder('Products');
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF, AVIF)');
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

    const newAsset = await MediaService.upload({
      filename: uploadFilename || (selectedFile?.name || `upload-${Date.now()}.jpg`),
      url: finalUrl,
      altText: uploadAlt,
      folder: (uploadFolder !== 'All' ? uploadFolder : 'Products') as any,
      mimeType: finalMime,
      sizeBytes: finalSize,
    });

    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAsset(newAsset);
    resetUploadForm();

    // Automatically select and close with newly uploaded image
    onSelect(newAsset.url, newAsset);
    onClose();
  };

  const filteredAssets = assets.filter((a) => {
    if (selectedFolder !== 'All' && a.folder !== selectedFolder) return false;
    if (search) {
      const q = search.toLowerCase();
      return a.filename.toLowerCase().includes(q) || (a.altText && a.altText.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="4xl">
      <div className="space-y-4 text-xs">
        {/* Top Controls: Folder tabs, search, upload button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
            {FOLDERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setSelectedFolder(f)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                  selectedFolder === f
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-[#10121A] border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsUploading(!isUploading)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md transition-all shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Cancel' : 'Upload Media'}</span>
            </button>
          </div>
        </div>

        {/* Upload Form Box */}
        {isUploading && (
          <form
            onSubmit={handleUploadSubmit}
            className="p-4 bg-[#10121A] border border-slate-700 rounded-xl space-y-3.5 animate-in fade-in duration-200"
          >
            {/* Mode Switch: Device (PC/Phone) vs URL */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('device')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs transition-all ${
                    uploadMode === 'url'
                      ? 'bg-slate-800 text-rose-400 border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Web / CDN Link</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400">
                Target Folder:{' '}
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-0.5 ml-1 text-xs"
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
                {!filePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      dragOver
                        ? 'border-rose-500 bg-rose-500/10 scale-[1.01]'
                        : 'border-slate-700 bg-slate-900/60 hover:border-rose-500 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center gap-2.5">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-rose-400 shadow-md">
                        <Upload className="w-6 h-6" />
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-white text-xs">
                          Click to browse from Computer / Phone or drag &amp; drop
                        </p>
                        <p className="text-[11px] text-slate-400">
                          High resolution JPG, PNG, WEBP, SVG, GIF or AVIF (up to 20MB)
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md text-xs inline-flex items-center gap-1.5 transition-all mt-1 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Device Files</span>
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
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
                        onClick={() => changeFileInputRef.current?.click()}
                        className="text-[11px] text-rose-400 hover:underline mt-0.5 font-semibold inline-block cursor-pointer"
                      >
                        Change Image
                      </button>
                      <input
                        ref={changeFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInputChange}
                        className="hidden"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFilePreview(null);
                        setSelectedFile(null);
                      }}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: URL Input */}
            {uploadMode === 'url' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Image CDN / URL *</label>
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
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Filename / Alt Description</label>
                  <input
                    type="text"
                    placeholder="e.g. blush-chiffon-dress.jpg"
                    value={uploadFilename}
                    onChange={(e) => setUploadFilename(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">
                Uploaded assets are optimized and saved into your boutique media library.
              </span>
              <button
                type="submit"
                disabled={uploadMode === 'device' ? !filePreview : !uploadUrl}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg disabled:opacity-40 shadow-md transition-all cursor-pointer"
              >
                Save &amp; Select Image
              </button>
            </div>
          </form>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-80 overflow-y-auto p-1">
          {filteredAssets.map((asset) => {
            const isSelected = selectedAsset?.id === asset.id;
            return (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  isSelected
                    ? 'border-rose-500 ring-2 ring-rose-500/40'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <img
                  src={asset.url}
                  alt={asset.altText || asset.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-2 text-[10px] text-white truncate">
                  {asset.filename}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="text-slate-400">
            {selectedAsset ? (
              <span className="text-white font-semibold truncate max-w-xs inline-block">
                Selected: {selectedAsset.filename}
              </span>
            ) : (
              'Click an image to select'
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedAsset}
              onClick={() => {
                if (selectedAsset) {
                  onSelect(selectedAsset.url, selectedAsset);
                  onClose();
                }
              }}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md disabled:opacity-40 transition-all cursor-pointer"
            >
              Choose Image
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
