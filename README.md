# ADAMOMER — آدم بن عمر للكهرباء

موقع تعريفي لمهندس كهرباء في صنعاء، مبني بـ Next.js 14 + Tailwind + Framer Motion، مع مشهد ثلاثي الأبعاد (Three.js) للوحة توزيع كهربائية بقواطع وأسلاك تسري فيها نبضات تيار.

## التشغيل

```bash
npm run dev      # التطوير: http://localhost:3000
npm run build    # بناء الإنتاج
npm start        # تشغيل نسخة الإنتاج
```

لا يحتاج أي خطوط أو ملفات من الإنترنت (الخطوط من النظام، والمشهد ثلاثي الأبعاد مرسوم بالكود).

## لوحة الإدارة (/admin)

1. أضف في `.env.local`: `ADMIN_PASSWORD=كلمة_سر_قوية` ثم أعد تشغيل `npm run dev`.
2. افتح `http://localhost:3000/admin` وسجّل الدخول.
3. من اللوحة: بدّل **الخلفية القديمة / الجديدة** لكل قسم، أخفِ أو أظهر الأقسام، عدّل النصوص والخدمات والصور وبيانات التواصل.
4. تُحفظ التعديلات في `data/settings.json` وتظهر في الموقع فوراً.

> الحفظ يحتاج نظام ملفات قابلاً للكتابة (جهازك أو خادم عادي). على Vercel لن يعمل الحفظ.

## الهيكل

```
app/
  layout.tsx          # RTL + عربي + SEO
  page.tsx            # ترتيب أقسام الصفحة الرئيسية
  about/page.tsx      # يحوّل إلى الرئيسية
components/
  Billboard3D.tsx     # قسم البطل (Hero) + شريط الخدمات
  Themed.tsx          # غلاف الثيم (old/new) لكل قسم
  admin/              # واجهة الإدارة (Login + AdminPanel)
  three/PanelScene.tsx# مشهد لوحة الكهرباء ثلاثي الأبعاد
  Header.tsx  Logo.tsx  Footer.tsx
  Services.tsx        # بطاقات الخدمات
  Portfolio.tsx       # معرض الأعمال + تكبير الصور
  Process.tsx         # آلية العمل
  Contact.tsx         # نموذج يفتح واتساب برسالة جاهزة
  ParticleSystem.tsx  # شرارات خلفية قسم التواصل
  Icon.tsx  Reveal.tsx  SectionTitle.tsx  Providers.tsx
lib/site.ts           # القيم الافتراضية للمحتوى
lib/settings.ts       # أنواع الإعدادات + التنقية (تُعدَّل من /admin)
lib/auth.ts           # حماية اللوحة بكلمة سر
app/api/admin/        # واجهات الدخول والحفظ
styles/globals.css    # الألوان والأزرار والحركات
public/               # الصور
```

## التعديل السريع

- رقم الهاتف/الإيميل/الخدمات/الصور/خطوات العمل: `lib/site.ts`
- ألوان الهوية: `tailwind.config.js` و`tailwind.config.cjs` (الملفان متطابقان)

## النشر من لوحة الإدارة (حفظ ونشر)

في `.env.local` أضف:

```
GITHUB_TOKEN=github_pat_xxxx      # Fine-grained token: Contents = Read and write، للمستودع maximum فقط
GITHUB_REPO=maximumadvye-source/maximum
GITHUB_BRANCH=main
```

ثم من `/admin` ← تبويب «النشر» ← «حفظ ونشر». يُرسل `data/settings.json` والصور الجديدة في commit واحد، فيعيد Vercel بناء الموقع خلال دقيقة تقريباً.
