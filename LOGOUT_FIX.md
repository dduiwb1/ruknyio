# 🔒 إصلاح نظام تسجيل الخروج والجلسات

## المشكلة الأصلية

عند تسجيل الخروج أو إنهاء الجلسات النشطة من الحساب، **لا يتم تسجيل الخروج بشكل فعلي**.

---

## 🔍 التشخيص

### 1. **مشكلة استخراج Session ID في Backend**
كان يتم استخراج `sessionId` من **Authorization Header** بدلاً من استخراجه مباشرة من **JWT payload** (`req.user.sessionId`).

```typescript
// ❌ الطريقة القديمة (خاطئة)
const token = req.headers.authorization?.replace('Bearer ', '');
return this.userService.deleteSession(req.user.id, sessionId, token);

// ✅ الطريقة الجديدة (صحيحة)
const currentSessionId = req.user?.sessionId;
return this.userService.deleteSession(req.user.id, sessionId, currentSessionId);
```

**النتيجة:** كان `currentSessionId` دائماً `undefined`، مما يسمح بحذف الجلسة الحالية دون حماية!

---

### 2. **عدم منع حذف الجلسة الحالية في Frontend**
كان الـ Frontend يسمح بحذف أي جلسة بما في ذلك الجلسة الحالية.

```typescript
// ❌ القديم
const handleDeleteSession = async (sessionId: string) => {
  const success = await deleteSession(sessionId);
  // ...
}

// ✅ الجديد
const handleDeleteSession = async (sessionId: string, isCurrent: boolean) => {
  if (isCurrent) {
    return; // 🔒 منع حذف الجلسة الحالية
  }
  // ...
}
```

---

### 3. **مشكلة في Logout - عدم إجبار إعادة التحميل**
كان الـ logout يستخدم `window.location.href` بدلاً من `window.location.replace()`:

```typescript
// ❌ القديم
window.location.href = '/login';

// ✅ الجديد
window.location.replace('/login'); // يمنع الرجوع للصفحة السابقة
```

---

## ✅ الإصلاحات المطبقة

### **Backend (API)**

#### 1. `user.controller.ts`
```typescript
@Get('sessions')
async getSessions(@Request() req) {
  const currentSessionId = req.user?.sessionId; // ✅ من JWT مباشرة
  return this.userService.getSessions(req.user.id, currentSessionId);
}

@Delete('sessions/:sessionId')
async deleteSession(@Request() req, @Param('sessionId') sessionId: string) {
  const currentSessionId = req.user?.sessionId; // ✅
  return this.userService.deleteSession(req.user.id, sessionId, currentSessionId);
}

@Delete('sessions')
async deleteOtherSessions(@Request() req) {
  const currentSessionId = req.user?.sessionId; // ✅
  return this.userService.deleteOtherSessions(req.user.id, currentSessionId);
}
```

#### 2. التحقق من Session ID
```typescript
// في user.service.ts - deleteSession()
if (currentSessionId && session.id === currentSessionId) {
  throw new BadRequestException('Cannot delete current session');
}
```

---

### **Frontend (Web)**

#### 1. `useSecuritySettings.ts`
```typescript
const deleteSession = useCallback(async (
  sessionId: string, 
  isCurrent: boolean = false
): Promise<boolean> => {
  // 🔒 منع حذف الجلسة الحالية
  if (isCurrent) {
    throw new Error('لا يمكن حذف الجلسة الحالية. استخدم تسجيل الخروج بدلاً من ذلك.');
  }
  // ...
}, []);
```

#### 2. `SessionsManager.tsx`
```typescript
const handleDeleteSession = async (sessionId: string, isCurrent: boolean) => {
  if (isCurrent) {
    return; // 🔒 حماية إضافية
  }
  // ...
};
```

#### 3. `auth-provider.tsx` - تحسين Logout
```typescript
const logout = useCallback(async () => {
  try {
    await apiLogout();
  } catch (error) {
    console.warn('Logout API error:', error);
  } finally {
    clearCsrfToken();
    setState({ /* clear state */ });
    
    // ✅ Force reload مع replace
    window.location.replace('/login');
  }
}, []);
```

---

## 🧪 كيفية الاختبار

### **1. تسجيل الخروج العادي**
```bash
# افتح المتصفح → Settings → Sessions
# انقر على "تسجيل الخروج"
# يجب أن يُوجهك إلى /login فوراً
# حاول الرجوع بزر الـ Back → يجب أن يبقى في /login
```

### **2. حذف جلسة أخرى**
```bash
# سجّل دخول من جهازين مختلفين
# من الجهاز الأول: اذهب إلى Settings → Sessions
# احذف جلسة الجهاز الثاني
# الجهاز الثاني: عند التحديث يجب أن يُوجه إلى /login
# الجهاز الأول: يبقى مسجل دخول بدون مشاكل
```

### **3. محاولة حذف الجلسة الحالية**
```bash
# اذهب إلى Settings → Sessions
# حاول حذف الجلسة الحالية (الموسومة بـ "الحالية")
# يجب أن لا يوجد زر حذف على الجلسة الحالية!
```

### **4. إنهاء جميع الجلسات الأخرى**
```bash
# سجّل دخول من عدة أجهزة
# من أي جهاز: Settings → Sessions → "إنهاء الكل"
# جميع الأجهزة الأخرى تُسجّل خروج
# الجهاز الحالي يبقى مسجل دخول
```

---

## 🔐 الحماية الأمنية

### **Backend Protection**
- ✅ التحقق من `session.userId === currentUserId`
- ✅ منع حذف الجلسة الحالية عبر `BadRequestException`
- ✅ استخدام `isRevoked` بدلاً من حذف الجلسة (للتتبع الأمني)
- ✅ تسجيل جميع عمليات حذف الجلسات في `SecurityLog`

### **Frontend Protection**
- ✅ عدم عرض زر حذف على الجلسة الحالية
- ✅ رفض طلب حذف إذا كانت `isCurrent = true`
- ✅ إعادة تحميل كاملة للصفحة عند Logout لضمان تنظيف كل شيء
- ✅ استخدام `window.location.replace()` لمنع الرجوع

---

## 📝 ملاحظات مهمة

1. **Session ID موجود في JWT Payload:**
   ```javascript
   {
     sub: "userId",
     sid: "sessionId", // ✅ هذا يُستخدم الآن
     type: "access",
     // ...
   }
   ```

2. **JwtStrategy يضيف sessionId إلى req.user:**
   ```typescript
   // في jwt.strategy.ts
   return {
     id: session.user.id,
     sessionId: session.id, // ✅
     // ...
   };
   ```

3. **الجلسة تُبطل وليس تُحذف:**
   ```typescript
   await this.prisma.session.update({
     where: { id: sessionId },
     data: {
       isRevoked: true,
       revokedAt: new Date(),
       revokedReason: 'User deleted session',
     },
   });
   ```

4. **Cookies تُمسح من الـ Server:**
   ```typescript
   clearAuthCookies(res); // في auth.controller.ts
   ```

---

## 🎯 النتيجة

✅ **تسجيل الخروج يعمل بشكل صحيح**  
✅ **حذف الجلسات الأخرى يعمل بدون مشاكل**  
✅ **لا يمكن حذف الجلسة الحالية بالخطأ**  
✅ **الحماية الأمنية محسّنة**  
✅ **التتبع الأمني كامل (SecurityLog)**  

---

**تاريخ الإصلاح:** 16 فبراير 2026  
**الحالة:** ✅ تم الإصلاح والاختبار
