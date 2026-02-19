"use client";

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Upload, ImagePlus, Trash2, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PresignEntry = { key: string; url: string };

const MAX_FILES = Number(process.env.NEXT_PUBLIC_S3_UPLOAD_MAX_FILES || 3);
const MAX_MB = Number(process.env.NEXT_PUBLIC_S3_UPLOAD_MAX_MB || 5);
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

import { AuthClient } from '@/lib/auth/auth-client';

function getAuthHeader(): Record<string, string> {
  // Access token is stored in-memory by AuthClient
  const token = typeof window !== 'undefined' ? AuthClient.getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function BannersUpload({ initial = [] as string[] }:{ initial?: string[] }){
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keysState, setKeysState] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch presigned URLs on mount
  useEffect(() => {
    async function fetchBanners() {
      try {
        // Ensure we have a token
        if (!AuthClient.hasValidToken()) {
          const refreshed = await AuthClient.refreshTokens();
          if (!refreshed) {
            setIsLoading(false);
            return;
          }
        }
        
        const res = await fetch('/api/v1/upload/banners', {
          method: 'GET',
          headers: { ...getAuthHeader() }
        });
        
        if (res.ok) {
          const data = await res.json();
          setKeysState(data.keys || []);
          setPreviews(data.urls || []);
        }
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchBanners();
  }, []);

  const extractKey = (v?: string | null): string | null => {
    if (!v) return null;
    if (v.startsWith('banners/')) return v;
    // Extract from presigned URL
    try {
      const url = new URL(v);
      const path = url.pathname;
      if (path.startsWith('/banners/')) return path.slice(1);
    } catch {}
    return null;
  };

  function onSelect(e: React.ChangeEvent<HTMLInputElement>){
    const list = e.target.files;
    if(!list) return;
    handleAdd(Array.from(list));
    e.currentTarget.value = '';
  }

  function handleAdd(newFiles: File[]){
    // Check total count including existing banners
    const totalExisting = keysState.length;
    const availableSlots = MAX_FILES - totalExisting;
    
    if (availableSlots <= 0) {
      toast.error(`الحد الأقصى للصور هو ${MAX_FILES}`);
      return;
    }
    
    const merged = [...files];
    for(const f of newFiles){
      if(merged.length >= availableSlots){
        toast.error(`يمكنك إضافة ${availableSlots} صور فقط`);
        break;
      }
      if(!ALLOWED.includes(f.type)){
        toast.error('نوع ملف غير مدعوم');
        continue;
      }
      if(f.size > MAX_MB * 1024 * 1024){
        toast.error(`حجم الملف يجب أن لا يتجاوز ${MAX_MB} ميجابايت`);
        continue;
      }
      merged.push(f);
    }
    setFiles(merged);
    // Don't add blob URLs to previews - files are shown separately
  }

  function removeAt(index: number){
    setFiles(prev => prev.filter((_,i)=>i!==index));
    setPreviews(prev => prev.filter((_,i)=>i!==index));
  }

  async function uploadPresigned(){
    if(files.length === 0){ toast.error('الرجاء اختيار ملفات'); return; }
    try{
      // Ensure access token exists; try refresh if missing
      if (!AuthClient.hasValidToken()) {
        const refreshed = await AuthClient.refreshTokens();
        if (!refreshed) {
          toast.error('يرجى تسجيل الدخول');
          return;
        }
      }
      const meta = files.map(f => ({ name: f.name, type: f.type, size: f.size }));
      const res = await fetch('/api/v1/upload/banners/presign', { method: 'POST', headers: { 'Content-Type':'application/json', ...getAuthHeader() }, body: JSON.stringify({ files: meta }) });
      if(!res.ok) throw new Error('Presign failed');
      const presigns: PresignEntry[] = await res.json();

      // upload via XHR to track progress
      await Promise.all(presigns.map((p, i) => new Promise<void>((resolve, reject)=>{
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', p.url);
        xhr.setRequestHeader('Content-Type', files[i].type);
        xhr.upload.onprogress = (ev) => {
          if(ev.lengthComputable){
            setProgress(prev => ({ ...prev, [i]: Math.round((ev.loaded/ev.total)*100) }));
          }
        };
        xhr.onload = () => {
          if(xhr.status >=200 && xhr.status < 300) resolve();
          else reject(new Error('Upload failed'));
        };
        xhr.onerror = () => reject(new Error('Upload error'));
        xhr.send(files[i]);
      })));

      // confirm — send only NEW keys, backend will merge with existing
      const newKeys = presigns.map(p => p.key);
      const confirmRes = await fetch('/api/v1/upload/banners/confirm', { method: 'POST', headers: { 'Content-Type':'application/json', ...getAuthHeader() }, body: JSON.stringify({ keys: newKeys }) });
      if(!confirmRes.ok) throw new Error('Confirm failed');
      toast.success('تم رفع البانرات بنجاح');
      
      // Refetch banners to get new presigned URLs
      const bannersRes = await fetch('/api/v1/upload/banners', { method: 'GET', headers: { ...getAuthHeader() } });
      if (bannersRes.ok) {
        const data = await bannersRes.json();
        setKeysState(data.keys || []);
        setPreviews(data.urls || []);
      }
      setFiles([]);
      setProgress({});
    }catch(err:any){
      toast.error(err.message || 'فشل في الرفع');
    }
  }

  async function fallbackServerUpload(){
    if(files.length === 0){ toast.error('الرجاء اختيار ملفات'); return; }
    try{
      if (!AuthClient.hasValidToken()) {
        const refreshed = await AuthClient.refreshTokens();
        if (!refreshed) { toast.error('يرجى تسجيل الدخول'); return; }
      }
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      const res = await fetch('/api/v1/upload/banners', { method: 'POST', body: fd, headers: { ...getAuthHeader() } });
      if(!res.ok) throw new Error('Server upload failed');
      toast.success('تم الرفع عبر الخادم');
      
      // Refetch banners to get new presigned URLs
      const bannersRes = await fetch('/api/v1/upload/banners', { method: 'GET', headers: { ...getAuthHeader() } });
      if (bannersRes.ok) {
        const data = await bannersRes.json();
        setKeysState(data.keys || []);
        setPreviews(data.urls || []);
      }
      setFiles([]);
    }catch(err:any){ toast.error(err.message || 'فشل الرفع عبر الخادم'); }
  }

  async function handleDelete(item: string, idx: number){
    try{
      const key = keysState[idx] || extractKey(item) || item;
      const res = await fetch('/api/v1/upload/banners/delete', { method: 'POST', headers: { 'Content-Type':'application/json', ...getAuthHeader() }, body: JSON.stringify({ items: [key] }) });
      if(!res.ok) throw new Error('Delete failed');
      toast.success('تم حذف البانر');
      setPreviews(prev => prev.filter((_,i)=>i!==idx));
      setKeysState(prev => prev.filter((_,i)=>i!==idx));
    }catch(err:any){ toast.error(err.message || 'فشل في الحذف'); }
  }

  const hasImages = previews.length > 0 || files.length > 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="border border-gray-200 rounded-xl bg-gray-50 p-6">
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#4FADC0]" />
            <span className="text-sm font-medium">جاري تحميل البانرات...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border border-gray-200 rounded-xl bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Use label instead of button for better mobile compatibility */}
          <label 
            htmlFor="banner-upload-input"
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer active:scale-[0.98] touch-manipulation"
          >
            <ImagePlus className="w-4 h-4" />
            <span>اختر صور</span>
          </label>
          
          <button 
            onClick={uploadPresigned} 
            disabled={files.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#193948] text-white rounded-xl text-sm font-medium hover:bg-[#193948]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] touch-manipulation"
          >
            <Upload className="w-4 h-4" />
            <span>رفع الصور</span>
          </button>
          
          {/* Hidden file input with mobile-friendly attributes */}
          <input 
            ref={inputRef} 
            id="banner-upload-input"
            type="file" 
            accept="image/jpeg,image/png,image/webp" 
            multiple 
            onChange={onSelect} 
            className="hidden" 
            capture={false as any}
          />
        </div>
        
        {!hasImages && (
          <label 
            htmlFor="banner-upload-input"
            className="mt-4 flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#4FADC0] hover:bg-[#4FADC0]/5 transition-colors touch-manipulation bg-gray-50"
          >
            <div className="w-14 h-14 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-3">
              <ImagePlus className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-sm text-gray-700 font-medium">اضغط لإضافة بانرات</p>
            <p className="text-xs text-gray-500 mt-1">حتى {MAX_FILES} صور • {MAX_MB}MB لكل صورة</p>
          </label>
        )}
      </div>

      {/* Images Grid */}
      {hasImages && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previews.map((p, i)=> (
            <div 
              key={i} 
              className="group relative rounded-xl overflow-hidden border border-gray-200 bg-white hover:shadow-md transition-shadow"
            >
              <div className="relative w-full h-32">
                <Image 
                  src={p} 
                  alt={`بانر ${i + 1}`} 
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={() => handleDelete(p, i)} 
                className="absolute top-2 left-2 opacity-100 sm:opacity-0 group-hover:opacity-100 bg-white hover:bg-red-500 hover:text-white rounded-lg p-2 transition-colors shadow-md active:scale-95 touch-manipulation"
                aria-label="حذف البانر"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {progress[i] != null && (
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                  <div 
                    style={{ width: `${progress[i]}%` }}
                    className="h-full bg-[#4FADC0] transition-all duration-300" 
                  />
                </div>
              )}
            </div>
          ))}

          {files.map((f, i) => {
            const objectUrl = URL.createObjectURL(f);
            return (
              <div 
                key={`file-${i}`} 
                className="group relative rounded-xl overflow-hidden border-2 border-dashed border-[#4FADC0]/30 bg-[#4FADC0]/5"
              >
                <div className="relative w-full h-32">
                  <Image 
                    src={objectUrl} 
                    alt={f.name} 
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-2 right-2 bg-[#4FADC0] text-white text-[10px] px-2 py-1 rounded-md font-medium shadow-sm">جديد</span>
                <button 
                  onClick={() => removeAt(i)} 
                  className="absolute top-2 left-2 opacity-100 sm:opacity-0 group-hover:opacity-100 bg-white hover:bg-red-500 hover:text-white rounded-lg p-2 transition-colors shadow-md active:scale-95 touch-manipulation"
                  aria-label="إزالة الصورة"
                >
                  <X className="w-4 h-4" />
                </button>
                {progress[i] != null && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      style={{ width: `${progress[i]}%` }}
                      className="h-full bg-[#4FADC0] transition-all duration-300" 
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MemoizedBannersUpload = memo(BannersUpload);
export default MemoizedBannersUpload;
