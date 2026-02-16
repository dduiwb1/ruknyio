#!/bin/bash

# 🧪 اختبار نظام تسجيل الخروج والجلسات
# 
# هذا السكريبت يختبر:
# 1. تسجيل الدخول
# 2. الحصول على الجلسات
# 3. حذف جلسة محددة
# 4. تسجيل الخروج

API_URL="http://localhost:3000/api/v1"
EMAIL="test@example.com"
PASSWORD="Test123456"

echo "🚀 بدء الاختبار..."
echo ""

# 1. تسجيل الدخول
echo "1️⃣ تسجيل الدخول..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/quicksign/email" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c cookies.txt \
  -b cookies.txt)

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "✅ Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# 2. الحصول على الجلسات
echo "2️⃣ الحصول على الجلسات النشطة..."
SESSIONS=$(curl -s -X GET "$API_URL/user/sessions" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt)

echo "الجلسات:"
echo $SESSIONS | jq '.[] | {id: .id, deviceType: .deviceType, isCurrent: .isCurrent}'
echo ""

# 3. محاولة حذف جلسة (اختر جلسة غير حالية)
SESSION_ID=$(echo $SESSIONS | jq -r '.[1].id // empty')
if [ -n "$SESSION_ID" ]; then
  echo "3️⃣ محاولة حذف الجلسة: $SESSION_ID"
  DELETE_RESPONSE=$(curl -s -X DELETE "$API_URL/user/sessions/$SESSION_ID" \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -b cookies.txt)
  
  echo "النتيجة: $DELETE_RESPONSE"
  echo ""
else
  echo "⚠️ لا توجد جلسات أخرى لحذفها"
  echo ""
fi

# 4. محاولة الوصول بعد الحذف (يجب أن يعمل لأننا حذفنا جلسة أخرى)
echo "4️⃣ التحقق من الجلسة الحالية..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt)

echo "المستخدم الحالي:"
echo $ME_RESPONSE | jq '{email: .email, name: .name}'
echo ""

# 5. تسجيل الخروج
echo "5️⃣ تسجيل الخروج..."
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt \
  -c cookies.txt)

echo "النتيجة: $LOGOUT_RESPONSE"
echo ""

# 6. محاولة الوصول بعد تسجيل الخروج (يجب أن يفشل)
echo "6️⃣ محاولة الوصول بعد Logout (يجب أن يفشل)..."
AFTER_LOGOUT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -b cookies.txt)

echo "$AFTER_LOGOUT"
echo ""

# نظافة
rm -f cookies.txt

echo "✅ انتهى الاختبار!"
