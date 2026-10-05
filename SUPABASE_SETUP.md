# إعداد لوحة إدارة كوفي بنان

الموقع ثابت على GitHub Pages، لذلك تحتاج لوحة الإدارة إلى مشروع Supabase كي تحفظ التعديلات للجميع. بعد الربط، التعديل من `admin.html` يظهر على الموقع دون رفع `menu.js` يدويًا.

## إعداد المشروع

1. أنشئي مشروعًا في [Supabase](https://supabase.com/dashboard) باسم Bunnan Menu.
2. من **Authentication → Users** أنشئي مستخدمًا واحدًا بهذه الهوية الداخلية، واختاري كلمة مرور قوية وفعّلي **Auto Confirm User**:

```text
bunnan-admin@bunnan.invalid
```

لا يحتاج صاحب الكوفي إلى بريد حقيقي للدخول؛ اسم المستخدم في لوحة الإدارة هو `bunnan-admin`. أوقفي التسجيل العام للمستخدمين الجدد. لا يمكن استعادة كلمة المرور إلى بريد؛ أعيدي ضبطها من لوحة Supabase إذا نُسيت.
3. افتحي **SQL Editor** وشغّلي محتوى `supabase-schema.sql` مرة واحدة.
4. أضيفي المستخدم الذي أنشأتِه إلى قائمة المالكين، بعد استبدال البريد:

```sql
insert into public.menu_admins (user_id)
select id from auth.users where email = 'bunnan-admin@bunnan.invalid'
on conflict (user_id) do nothing;
```

5. من **Project Settings → API** انسخي Project URL والمفتاح العام `anon` أو `publishable`.
6. ضعي القيم في `supabase-config.js`:

```js
window.BUNNAN_SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

المفتاح العام مخصص للواجهة ويظل محميًا بسياسات RLS؛ لا تضعي مفتاح `service_role` في ملفات الموقع ولا تشاركي كلمات المرور.

## النشر والاستيراد

ارفعي `admin.html`, `admin.css`, `admin.js`, `supabase-config.js`, `supabase-schema.sql`, ونسخة `index.html` و`app.js` المحدّثة إلى جذر مستودع GitHub Pages. افتحي `/admin.html`، سجّلي الدخول بحساب المالك، ثم اختاري **استيراد المنيو الحالي** مرة واحدة.

بعدها تُحفَظ إضافة الأصناف وتعديلها وحذفها مباشرة في Supabase. الصور الجديدة تُرفع إلى bucket باسم `menu-images`، ويقرأ الموقع العام الأصناف المتاحة من قاعدة البيانات.