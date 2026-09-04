'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Save,
  ArrowLeft,
  Image as ImageIcon,
  IndianRupee,
  Boxes,
  Layers,
  Search,
  Truck,
  Sparkles,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { ProductService } from '@/services/products';
import { MediaService, optimizeImageFile } from '@/services/media';
import { PlatformService } from '@/services/platform';
import { useToast } from '@/lib/toast-context';
import { MediaPickerModal } from '@/components/ui/MediaPickerModal';
import { VariantMatrixEditor } from '@/components/ui/VariantMatrixEditor';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import type { Product, ProductVariant } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'pricing' | 'inventory' | 'variants' | 'seo' | 'shipping' | 'badges'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('JQ Trends');
  const [category, setCategory] = useState('cat_women');
  const [shortDesc, setShortDesc] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('1499');
  const [compareAtPrice, setCompareAtPrice] = useState('2299');
  const [costPrice, setCostPrice] = useState('650');
  const [sku, setSku] = useState('JQT-WMN-DRS-101');
  const [stock, setStock] = useState('50');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [trackInventory, setTrackInventory] = useState(true);
  const [allowBackorders, setAllowBackorders] = useState(false);
  const [images, setImages] = useState<{ id: string; url: string; altText?: string; isPrimary: boolean }[]>([
    { id: 'img_default', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop', isPrimary: true },
  ]);
  const [variants, setVariants] = useState<ProductVariant[]>([
    { id: 'v_s', sku: 'JQT-WMN-DRS-101-S', title: 'S / Default', price: 1499, stock: 20, options: { size: 'S' } },
    { id: 'v_m', sku: 'JQT-WMN-DRS-101-M', title: 'M / Default', price: 1499, stock: 20, options: { size: 'M' } },
    { id: 'v_l', sku: 'JQT-WMN-DRS-101-L', title: 'L / Default', price: 1499, stock: 10, options: { size: 'L' } },
  ]);

  React.useEffect(() => {
    const randomSuffix = Date.now().toString().slice(-6);
    const initialSku = `JQT-${randomSuffix}`;
    setSku(initialSku);
    setVariants([
      { id: 'v_s', sku: `${initialSku}-S`, title: 'S / Default', price: 1499, stock: 20, options: { size: 'S' } },
      { id: 'v_m', sku: `${initialSku}-M`, title: 'M / Default', price: 1499, stock: 20, options: { size: 'M' } },
      { id: 'v_l', sku: `${initialSku}-L`, title: 'L / Default', price: 1499, stock: 10, options: { size: 'L' } },
    ]);
  }, []);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [weightKg, setWeightKg] = useState('0.4');
  const [isExpressAvailable, setIsExpressAvailable] = useState(true);
  const [isFeatured, setIsFeatured] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>('published');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const [isUploadingDirect, setIsUploadingDirect] = useState(false);

  const handleDirectPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF)', 'error');
      return;
    }

    try {
      setIsUploadingDirect(true);
      showToast('Optimizing and uploading image...', 'info');
      const optimized = await optimizeImageFile(file);
      const asset = await MediaService.upload({
        filename: file.name,
        url: optimized.dataUrl,
        altText: title || file.name.replace(/\.[^/.]+$/, ''),
        folder: 'Products',
        mimeType: 'image/jpeg',
        sizeBytes: optimized.sizeBytes,
        width: optimized.width,
        height: optimized.height,
      });

      const newImg = {
        id: asset.id,
        url: asset.url,
        altText: asset.altText || title,
        isPrimary: images.length === 0,
      };
      setImages((prev) => [...prev, newImg]);
      showToast('Photo uploaded & added to gallery', 'success');
    } catch (err: any) {
      showToast('Failed to upload image: ' + (err.message || 'Error'), 'error');
    } finally {
      setIsUploadingDirect(false);
      e.target.value = '';
    }
  };

  const handleAddImage = (url: string) => {
    const newImg = {
      id: `img_${Date.now()}`,
      url,
      altText: title,
      isPrimary: images.length === 0,
    };
    setImages([...images, newImg]);
    showToast('Image added to product gallery', 'success');
  };

  const setPrimaryImage = (id: string) => {
    setImages(images.map((img) => ({ ...img, isPrimary: img.id === id })));
  };

  const removeImage = (id: string) => {
    setImages(images.filter((img) => img.id !== id));
  };

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleGenerateAiCopy = () => {
    if (!title.trim()) {
      showToast('Please enter a product title first so AI can write the description', 'error');
      return;
    }

    setIsAiGenerating(true);
    setTimeout(() => {
      setIsAiGenerating(false);
      const cleanTitle = title.trim();
      const generatedShort = `An exquisite artisanal ${cleanTitle.toLowerCase()} designed for modern elegance, handcrafted with premium breathable textures and bespoke silhouettes.`;
      const generatedFull = `<p>Elevate your seasonal wardrobe with the signature <strong>${cleanTitle}</strong>. Meticulously tailored for timeless distinction, this piece seamlessly merges contemporary tailoring with artisanal craftsmanship.</p>
<h3>Highlights &amp; Fabric Details:</h3>
<ul>
  <li><strong>Fabric Composition:</strong> 100% Premium Artisanal Silk &amp; Organic Cotton Blend</li>
  <li><strong>Fit &amp; Silhouette:</strong> Tailored relaxed silhouette with structured drape</li>
  <li><strong>Craftsmanship:</strong> Hand-finished seams with signature branded hardware</li>
  <li><strong>Care Instructions:</strong> Dry clean only or gentle hand wash in cold water</li>
</ul>`;
      const generatedSeoTitle = `${cleanTitle} | Buy Online | ${brand || 'Mavenco'}`;
      const generatedSeoDesc = `Discover ${cleanTitle} online at ${brand || 'Mavenco'}. Enjoy complimentary luxury packaging, fast worldwide shipping, and hassle-free returns.`;

      setShortDesc(generatedShort);
      setDescription(generatedFull);
      setSeoTitle(generatedSeoTitle);
      setSeoDesc(generatedSeoDesc);
      showToast('✨ AI luxury copy and SEO metadata generated successfully!', 'success');
    }, 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showToast('Product title is required', 'error');
      setActiveTab('basic');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeTenant = PlatformService.getActiveTenant();
      const newProduct: any = {
        tenantId: activeTenant?.slug || 'demo',
        tenantSlug: activeTenant?.slug || 'demo',
        storeSlug: activeTenant?.slug || 'demo',
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        shortDescription: shortDesc,
        description,
        brand,
        sku,
        categoryIds: [category],
        price: parseFloat(price) || 0,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        stock: parseInt(stock, 10) || 0,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 10,
        trackInventory,
        allowBackorders,
        images,
        variants,
        status,
        tags: [category.replace('cat_', ''), 'JQ Trends'],
        seo: { title: seoTitle || title, description: seoDesc || shortDesc },
        shipping: { weightKg: parseFloat(weightKg) || 0.4, isExpressAvailable },
        badges: { isFeatured, isNewArrival, isBestSeller },
      };

      await ProductService.create(newProduct);
      showToast('Product created successfully!', 'success');
      router.push('/products');
    } catch {
      showToast('Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'basic', label: '1. Basic Info', icon: Package },
    { id: 'media', label: '2. Media Gallery', icon: ImageIcon },
    { id: 'pricing', label: '3. Pricing (₹)', icon: IndianRupee },
    { id: 'inventory', label: '4. Inventory', icon: Boxes },
    { id: 'variants', label: '5. Variants Matrix', icon: Layers },
    { id: 'seo', label: '6. SEO & Meta', icon: Search },
    { id: 'shipping', label: '7. Shipping', icon: Truck },
    { id: 'badges', label: '8. Store Badges', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-6 pb-20 select-none max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161822] p-5 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-rose-400">
              New Catalog Item
            </span>
            <h1 className="text-2xl font-bold text-white mt-0.5">Create Product</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-white uppercase"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving...' : 'Save Product'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1 bg-[#161822] p-1.5 rounded-xl border border-slate-800 overflow-x-auto text-xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: BASIC INFORMATION */}
      {activeTab === 'basic' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Blush Floral Tiered Midi Dress"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-sans text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Primary Department Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              >
                <option value="cat_women">Women › Dresses &amp; Gowns</option>
                <option value="cat_kurtis">Women › Kurtis &amp; Sets</option>
                <option value="cat_coords">Women › Co-ords</option>
                <option value="cat_sarees">Women › Sarees</option>
                <option value="cat_kids_girls">Kids › Girls Party Dresses</option>
                <option value="cat_kids_boys">Kids › Boys Ethnic Sets</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Brand Name</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-slate-300 font-bold">Product Copy &amp; Story</span>
            <button
              type="button"
              onClick={handleGenerateAiCopy}
              disabled={isAiGenerating}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAiGenerating ? 'AI Crafting Copy...' : '✨ Auto-Generate with AI'}</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Short Summary (Shown in product lists)</label>
            <input
              type="text"
              placeholder="e.g. Ethereal chiffon dress crafted with delicate vintage floral motifs."
              value={shortDesc}
              onChange={(e) => setShortDesc(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Detailed Story &amp; Fabric Specifications</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
        </div>
      )}

      {/* TAB 2: MEDIA GALLERY */}
      {activeTab === 'media' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">Product Photo Gallery</h3>
              <p className="text-xs text-slate-400 mt-0.5">Upload high-res imagery and designate the primary storefront card thumbnail.</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-md cursor-pointer transition-all text-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDirectPhotoUpload}
                  disabled={isUploadingDirect}
                  className="sr-only"
                />
                <Upload className="w-4 h-4" />
                <span>{isUploadingDirect ? 'Uploading...' : 'Upload From Device'}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-lg shadow-md border border-slate-700 text-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Media Library</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {images.map((img) => (
              <div
                key={img.id}
                className={`relative aspect-3/4 rounded-xl overflow-hidden border-2 bg-slate-900 group ${
                  img.isPrimary ? 'border-rose-500 ring-2 ring-rose-500/30' : 'border-slate-800'
                }`}
              >
                <img src={img.url} alt="Product" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="p-1 bg-rose-600 text-white rounded hover:bg-rose-500 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(img.id)}
                    className={`w-full py-1 rounded text-[10px] font-bold cursor-pointer ${
                      img.isPrimary ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {img.isPrimary ? 'Primary Thumbnail' : 'Set as Primary'}
                  </button>
                </div>
              </div>
            ))}

            {/* Direct Device Upload Card in the Grid */}
            <label className="relative aspect-3/4 rounded-xl border-2 border-dashed border-slate-700 hover:border-rose-500 bg-[#10121A] hover:bg-slate-900/70 transition-all flex flex-col items-center justify-center gap-2.5 text-center p-4 cursor-pointer group">
              <input
                type="file"
                accept="image/*"
                onChange={handleDirectPhotoUpload}
                disabled={isUploadingDirect}
                className="sr-only"
              />
              <div className="w-11 h-11 rounded-full bg-slate-800 group-hover:bg-rose-600/20 text-slate-400 group-hover:text-rose-400 flex items-center justify-center transition-colors shadow-inner">
                {isUploadingDirect ? <Sparkles className="w-5 h-5 animate-spin text-rose-400" /> : <Upload className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-white text-xs block group-hover:text-rose-300 transition-colors">
                  {isUploadingDirect ? 'Optimizing...' : 'Upload Photo'}
                </span>
                <span className="text-[10px] text-slate-400 block">From Computer / Phone</span>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* TAB 3: PRICING */}
      {activeTab === 'pricing' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Compare-At Price (₹ Original)</label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Cost Per Garment (₹ For Profit Telemetry)</label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Stock Keeping Unit (SKU) *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Available Quantity</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Low Stock Warning Threshold</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center gap-6">
            <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={trackInventory}
                onChange={(e) => setTrackInventory(e.target.checked)}
                className="accent-rose-600 rounded"
              />
              <span>Track Inventory Automatically</span>
            </label>
            <label className="flex items-center gap-2 text-white font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={allowBackorders}
                onChange={(e) => setAllowBackorders(e.target.checked)}
                className="accent-rose-600 rounded"
              />
              <span>Allow Backorders When Out of Stock</span>
            </label>
          </div>
        </div>
      )}

      {/* TAB 5: VARIANTS */}
      {activeTab === 'variants' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <VariantMatrixEditor
            variants={variants}
            onChange={setVariants}
            basePrice={price}
            baseSku={sku}
          />
        </div>
      )}

      {/* TAB 6: SEO */}
      {activeTab === 'seo' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Search Engine Meta Title</label>
            <input
              type="text"
              placeholder={title || 'Product Title | JQ Trends'}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-bold mb-1">Search Engine Meta Description</label>
            <textarea
              rows={3}
              placeholder={shortDesc || 'Discover affordable luxury fashion...'}
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white"
            />
          </div>
        </div>
      )}

      {/* TAB 7: SHIPPING */}
      {activeTab === 'shipping' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Package Weight (kg)</label>
              <input
                type="number"
                step="0.05"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-3 py-2 bg-[#10121A] border border-slate-700/80 rounded-lg text-white font-mono"
              />
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={isExpressAvailable}
                  onChange={(e) => setIsExpressAvailable(e.target.checked)}
                  className="accent-rose-600 rounded"
                />
                <span>Eligible for BlueDart Express Overnight Delivery</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BADGES */}
      {activeTab === 'badges' && (
        <div className="bg-[#161822] p-6 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Storefront Promotional Tags</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                isFeatured ? 'bg-rose-950/20 border-rose-500/60' : 'bg-[#10121A] border-slate-800'
              }`}
            >
              <div>
                <div className="font-bold text-white">Featured Product</div>
                <div className="text-[10px] text-slate-400">Highlighted on homepage grid</div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-rose-600"
              />
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                isNewArrival ? 'bg-rose-950/20 border-rose-500/60' : 'bg-[#10121A] border-slate-800'
              }`}
            >
              <div>
                <div className="font-bold text-white">New Arrival</div>
                <div className="text-[10px] text-slate-400">Shown in fresh drops carousel</div>
              </div>
              <input
                type="checkbox"
                checked={isNewArrival}
                onChange={(e) => setIsNewArrival(e.target.checked)}
                className="accent-rose-600"
              />
            </label>

            <label
              className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                isBestSeller ? 'bg-rose-950/20 border-rose-500/60' : 'bg-[#10121A] border-slate-800'
              }`}
            >
              <div>
                <div className="font-bold text-white">Best Seller</div>
                <div className="text-[10px] text-slate-400">Tagged with popular star badge</div>
              </div>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="accent-rose-600"
              />
            </label>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={handleAddImage}
          title="Select Product Image"
        />
      )}
    </div>
  );
}
