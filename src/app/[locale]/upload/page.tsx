"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

export default function TestUploadPage() {
  // تجميع بيانات النموذج (Form Data)
  
  const [formData, setFormData] = useState({
    title_en: "مشروع تجريبي جدeeد",
    title_ar: "مشروع تجريبي جديد",
    description_en: "eeهذا الوصف مخصص لتجربة رفع البيانات والصور فقط.",
    description_ar: "هذا الوصف مخصص لتجربة رفع البيانات والصور فقط.",
    liveLink: "https://example.com",
    repoLink: "https://github.com",
    stack: "fullstack", // يجب أن يكون أحد القيم المحددة في الـ enum
    tags: ["React", "Next.js", "MongoDB"],
  });

  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");

  // دالة إرسال البيانات المجمعة إلى السيرفر الخاص بك
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus("جاري حفظ المشروع في قاعدة البيانات...");

  try {
    const response = await fetch("/api/projects", { // تأكد من المسار الصحيح
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-role": "admin",
      },
      body: JSON.stringify({
        ...formData,
        images: images, 
      }),
    });

    const result = await response.json();

    if (response.ok) {
      setStatus("✅ تم رفع المشروع بنجاح وحفظه في المونجو!");
      console.log("Success Data:", result);
    } else {
      // هنا سيظهر لك الحقل المرفوض من Zod بدقة في المستطيل الرمادي
      setStatus(`❌ فشل الحفظ: ${result.error || result.message || "خطأ في المدخلات"}`);
    }
  } catch (error) {
    setStatus("❌ حدث خطأ في الشبكة أو تحويل البيانات.");
  }
};


  return (
    <div style={{ padding: "40px", maxWidth: "500px", fontFamily: "sans-serif" }}>
      <h2>🧪 صفحة تجربة رفع المشاريع</h2>
      
      {/* 1. مكون رفع الصور إلى كلوديناري */}
      <div style={{ marginBottom: "20px", border: "1px dashed #ccc", padding: "20px" }}>
        <h3>الخطوة 1: ارفع الصور إلى Cloudinary</h3>
        
        <CldUploadWidget 
          uploadPreset="my_images" // قم بتغييره إذا كان لديك Preset مخصص غير الافتراضي
          onSuccess={(result) => {
            const info = result?.info;
            if (info && typeof info !== "string" && info.secure_url) {
              const url = info.secure_url;
              setImages((prev) => [...prev, url]);
              setStatus("✓ تم رفع الصورة إلى كلوديناري بنجاح!");
            }
          }}
        >
          {({ open }) => (
            <button 
              type="button" 
              onClick={() => open()} 
              style={{ padding: "10px", cursor: "pointer", background: "#0070f3", color: "#fff", border: "none", borderRadius: "5px" }}
            >
              اختر صورة وارفعها
            </button>
          )}
        </CldUploadWidget>

        {/* عرض روابط أو عدد الصور التي تم رفعها حالياً */}
        <div style={{ marginTop: "10px" }}>
          <strong>عدد الصور المجهزة للرفع:</strong> {images.length}
          {images.map((img, idx) => (
            <div key={idx} style={{ fontSize: "12px", color: "green", overflow: "hidden", textOverflow: "ellipsis" }}>
              🔗 {img}
            </div>
          ))}
        </div>
      </div>

      {/* 2. نموذج إرسال البيانات الكلية */}
      <form onSubmit={handleSubmit} style={{ border: "1px solid #eee", padding: "20px" }}>
        <h3>الخطوة 2: إرسال المشروع بالكامل</h3>
        
        <p style={{ fontSize: "14px", color: "#666" }}>
          (البيانات معبأة تلقائياً لتسريع التجربة)
        </p>

        <label style={{ display: "block", marginBottom: "10px" }}>
          العنوان: 
          <input 
            type="text" 
            value={formData.title_en} 
            onChange={(e) => setFormData({...formData, title_en: e.target.value})} 
            style={{ width: "100%", padding: "5px", marginTop: "5px" }}
          />
        </label>

        <button 
          type="submit" 
          disabled={images.length === 0}
          style={{ 
            width: "100%", 
            padding: "10px", 
            background: images.length === 0 ? "#ccc" : "#222", 
            color: "#fff", 
            border: "none", 
            cursor: images.length === 0 ? "not-allowed" : "pointer" 
          }}
        >
          حفظ المشروع النهائي في المونجو
        </button>
      </form>

      {/* رسالة الحالة */}
      {status && (
        <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0", borderRadius: "5px", fontWeight: "bold" }}>
          {status}
        </div>
      )}
    </div>
  );
}
