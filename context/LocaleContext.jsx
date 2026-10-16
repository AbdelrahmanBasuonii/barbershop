import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const translations = {
  'الرئيسية': 'Home', 'المعرض': 'Gallery', 'الفيديوهات': 'Videos', 'احجز دورك': 'Book an appointment',
  'العنوان والمواعيد': 'Location & hours', 'حجوزاتي': 'My bookings', 'اسألنا': 'Chat with us',
  'لوحة الأدمن': 'Admin dashboard', 'أهلاً': 'Welcome', 'خروج': 'Log out', 'دخول / تسجيل': 'Log in / Sign up',
  'حلاّق': 'Barber', 'التنقل الرئيسي': 'Main navigation', 'حلاقة على مزاجك، وميعادك علينا.': 'A great haircut, right on time.',
  'محل الحلاقة': 'Barbershop', 'عرض الكل': 'View all', 'جنيه': 'EGP', 'تم الاختيار': 'Selected',
  'من': 'From', 'إلى': 'to', 'العميل': 'Customer', 'كل الفيديوهات': 'All videos',
  'خريطة موقع محل الحلاقة': 'Barbershop location map', 'اسأل عن الأسعار أو المواعيد أو أي حاجة تانية.': 'Ask us about prices, opening hours, or anything else.',
  'حلاقة شعر ولحية': 'Hair and beard cut', 'تفاصيل شغلنا': 'Our work in detail', 'قصة شعر كلاسيكية': 'Classic haircut',
  'تحديد تدريجي': 'Fade haircut', 'ستايل عصري': 'Modern style', 'عناية باللحية': 'Beard care',
  'من أجواء المحل': 'At the barbershop',
  'التبديل إلى العربية': 'Switch to Arabic', 'التبديل إلى الإنجليزية': 'Switch to English',
  'اختار الخدمة': 'Select service', 'المعرض قريباً.': 'Gallery coming soon.', 'الفيديوهات قريباً.': 'Videos coming soon.',
  'تكبير الصورة': 'Enlarge image', 'قصة شعر من المعرض': 'A style from the gallery',
  'عرض الصورة بحجم أكبر': 'View enlarged image', 'إغلاق الصورة': 'Close image',
  'فيديو محل الحلاقة': 'Barbershop video', 'جارٍ التحقق من تسجيل الدخول...': 'Checking your sign-in...',
  'الإدارة': 'Administration', 'حسابك': 'Your account', 'إنشاء حساب جديد': 'Create an account', 'دخول الأدمن': 'Admin log in',
  'أهلاً بيك': 'Welcome', 'الاسم بالكامل': 'Full name', 'اكتب الاسم الأول واسم العائلة': 'Enter your first and last name',
  'رقم التليفون': 'Phone number', 'اكتب رقم تليفون من 10 إلى 15 رقمًا': 'Enter a phone number with 10–15 digits',
  'الإيميل': 'Email', 'الباسورد': 'Password', 'لحظة واحدة...': 'Please wait...',
  'إنشاء الحساب': 'Create account', 'دخول': 'Log in', 'نسيت كلمة المرور؟': 'Forgot your password?',
  'عندك حساب؟': 'Already have an account?', 'لسه معندكش حساب؟': "Don't have an account yet?",
  'سجّل دخول': 'Log in', 'نظرة عامة': 'Overview', 'الحجوزات': 'Bookings', 'الإيرادات': 'Revenue',
  'العملاء': 'Customers', 'الرسائل': 'Messages', 'الإعدادات': 'Settings', 'لوحة التحكم': 'Dashboard',
  'إدارة المحل': 'Manage your shop', 'قائمة الإدارة': 'Admin navigation', 'عرض الموقع': 'View website',
  'تسجيل الخروج': 'Log out', 'الإيراد (جنيه)': 'Revenue (EGP)', 'عرض تفاصيل العملاء': 'View customer details',
  'كل الحجوزات': 'All bookings', 'عرض كل الحجوزات': 'View all bookings',
  'بانتظار التأكيد': 'Pending confirmation', 'عرض الحجوزات المنتظرة': 'View pending bookings',
  'عرض حجوزات اليوم': "View today's bookings", 'عرض تفاصيل الإيرادات': 'View revenue details',
  'اضغط لعرض التفاصيل': 'Click to view details', 'ملخص سريع لحركة المحل.': 'A quick summary of shop activity.',
  'حجوزات اليوم': "Today's bookings",
  'العملاء المسجلين في الموقع.': 'Customers registered on the website.',
  'حالة حجز': 'Booking status',
  'الإيرادات المحسوبة من الحجوزات المكتملة فقط.': 'Revenue is calculated from completed bookings only.',
  'عدد الحجوزات المعروضة:': 'Bookings shown:',
  'رابط خريطة (embed)': 'Map embed URL',
  'حذف خدمة': 'Delete service',
  'حصل خطأ أثناء معالجة الطلب.': 'Something went wrong while processing your request.',
  'الحساب ده مش حساب أدمن': 'This account is not an admin account.',
  'زورنا في المحل': 'Visit our shop',
  'اكتب عنوان المحل هنا': 'Add the shop address here',
  'مواعيد العمل والخدمات المعروضة للعميل.': 'Opening hours and services shown to customers.',
  'تابع استفسارات العملاء ورد عليهم مباشرة.': 'Follow up on customer questions and reply directly.',
  'الاسم': 'Name', 'التليفون': 'Phone', 'تاريخ التسجيل': 'Registration date',
  'لا يوجد عملاء حتى الآن.': 'No customers yet.', 'تفاصيل الإيرادات': 'Revenue details',
  'إجمالي الإيراد': 'Total revenue', 'حجز مكتمل': 'completed bookings', 'التاريخ': 'Date', 'الوقت': 'Time',
  'الخدمة': 'Service', 'المبلغ': 'Amount', 'الحالة': 'Status',
  'لا توجد إيرادات حتى الآن؛ تظهر الإيرادات عند تحويل الحجز إلى «تم».': 'No revenue yet. Revenue appears when a booking is marked complete.',
  'حجز سهل وسريع': 'Quick and easy booking', 'اختار الخدمة، وبعدها اليوم والوقت المناسبين ليك.': 'Choose a service, then select a date and time that work for you.',
  'كل خدمة بسعرها، اختار اللي يناسبك.': 'Every service has a clear price. Choose what suits you.',
  'اختار اليوم والميعاد': 'Choose a date and time', 'المواعيد المتاحة هتظهر بعد اختيار اليوم.': 'Available time slots appear after you select a date.',
  'اليوم': 'Date', 'اليوم ده إجازة أو مفيش مواعيد.': 'The shop is closed or has no available slots on this date.',
  'اختار اليوم الأول عشان نشوف المواعيد.': 'Select a date to see available slots.',
  'تأكيد الحجز': 'Confirm booking', 'دخول أو إنشاء حساب': 'Log in or create an account',
  'ملخص الحجز': 'Booking summary', 'اليوم لم يتحدد': 'Date not selected',
  'سجّل الدخول الأول عشان تقدر تحجز.': 'Please log in before booking.',
  'اختار الخدمة اللي تناسبك الأول.': 'Please choose a service first.',
  'اختار اليوم والوقت المناسبين.': 'Please choose a date and time.',
  'تم الحجز، وهنأكد معاك قريباً.': "Booking received. We'll confirm with you soon.",
  'تعذر الاتصال بالدردشة. جرّب تحديث الصفحة.': 'Could not connect to chat. Try refreshing the page.',
  'الاتصال بالدردشة غير متاح حالياً.': 'Chat is currently unavailable.',
  'أهلاً بيك! ابعتلنا سؤالك وهنرد عليك.': 'Welcome! Send us a question and we will get back to you.',
  'مساعد آلي': 'Assistant', 'فريق المحل': 'Shop team', 'اكتب رسالتك...': 'Write a message...',
  'إرسال': 'Send', 'تعذر الاتصال بالرسائل المباشرة.': 'Could not connect to live messages.',
  'الاتصال غير متاح حالياً.': 'Connection is currently unavailable.',
  'محادثة جديدة': 'New conversation', 'لا توجد محادثات حتى الآن.': 'No conversations yet.',
  'اختار محادثة للبدء.': 'Choose a conversation to get started.', 'اكتب ردك...': 'Write your reply...',
  'من معرض الستايلات': 'From the style gallery', 'كل الصور': 'All photos',
  'خدماتنا': 'Our services', 'خدمات على مزاجك': 'Services made for you',
  'اختار الخدمة المناسبة، وهتلاقي كل التفاصيل قبل تأكيد الحجز.': 'Choose a service and review all the details before confirming your booking.',
  'محلك في أيد أمينة': 'You are in good hands', 'قصّة تفرق،': 'A cut that stands out,',
  'وميعاد مظبوط.': 'right on time.', 'اختار الخدمة اللي تناسبك واحجز ميعادك في دقيقة، من غير زحمة ولا انتظار.': 'Choose your service and book in a minute, without queues or waiting.',
  'احجز ميعادك': 'Book your appointment', 'من أول': 'From the first', 'مقصّة': 'cut',
  'أحدث الفيديوهات': 'Latest videos', 'مستنيينك': 'We are waiting for you',
  'تعالى نضبطلك قصة تليق بيك.': 'Come in for a style that suits you.',
  'مستنيينك في أي وقت خلال مواعيد العمل.': 'We look forward to seeing you during opening hours.',
  'العنوان': 'Address', 'مواعيدنا': 'Opening hours',
  'الإجازة:': 'Closed:', 'لا يوجد': 'None',
  'من جوه المحل': 'Inside the shop', 'لقطات من شغلنا وأجواء المكان.': 'A look at our work and the shop.',
  'فيديوهات': 'Videos', 'إلهامك الجاي': 'Your next inspiration',
  'شوف اختيارات من شغلنا قبل ما تختار قصتك.': 'Browse our work before choosing your style.',
  'معرض الستايلات': 'Style gallery', 'حماية حسابك': 'Account security',
  'اكتب كلمة مرور جديدة': 'Create a new password', 'كلمتا المرور غير متطابقتين.': 'The passwords do not match.',
  'تم تحديث حسابك': 'Account updated', 'كلمة المرور اتغيرت بنجاح': 'Your password has been changed',
  'تقدر دلوقتي تدخل باستخدام كلمة المرور الجديدة.': 'You can now log in with your new password.',
  'تسجيل الدخول': 'Log in', 'رابط إعادة التعيين غير موجود. اطلب رسالة جديدة.': 'Reset link is missing. Request a new email.',
  'كلمة المرور الجديدة': 'New password', 'تأكيد كلمة المرور': 'Confirm password',
  'جارٍ الحفظ...': 'Saving...', 'حفظ كلمة المرور الجديدة': 'Save new password',
  'اطلب رابط إعادة تعيين جديد': 'Request a new reset link',
  'استعادة الحساب': 'Recover your account', 'هنبعتلك رابط آمن لإعادة تعيين كلمة المرور على بريدك الإلكتروني.': 'We will email you a secure link to reset your password.',
  'الإيميل المسجل في حسابك': 'Email address on your account', 'جارٍ الإرسال...': 'Sending...',
  'إرسال رابط إعادة التعيين': 'Send reset link', 'العودة لتسجيل الدخول': 'Back to log in',
  'كل مواعيدك في مكان واحد': 'All your appointments in one place',
  'إلغاء الحجز': 'Cancel booking', 'مفيش حجوزات لسه.': 'No bookings yet.',
  'إحنا هنا لمساعدتك': 'We are here to help',
  'رسالتك': 'Your message',
  'رسالة': 'Message',
  'راجع التفاصيل وحدّث حالة كل حجز.': 'Review details and update each booking status.',
  'لا توجد حجوزات تطابق هذا الاختيار.': 'No bookings match this filter.',
  'لا توجد حجوزات حتى الآن.': 'No bookings yet.',
  'كل يوم بنستناك': 'We look forward to seeing you',
  'أضف صور شغلك أو احذف الصور القديمة.': 'Add your work photos or remove old ones.',
  'أضف فيديوهات المحل أو احذف الموجود.': 'Add shop videos or remove existing ones.',
  'متأكد إنك عايز تحذف العنصر ده؟': 'Are you sure you want to delete this item?',
  'العنوان (اختياري)': 'Title (optional)', 'عنوان العنصر': 'Item title',
  'الرابط (اختياري)': 'URL (optional)', 'رابط الصورة': 'Image URL', 'رابط يوتيوب أو الفيديو': 'YouTube or video URL',
  'أو ارفع ملفاً': 'Or upload a file', 'جارٍ الإضافة...': 'Adding...', 'إضافة': 'Add',
  'صورة من المعرض': 'Gallery image', 'صورة بدون عنوان': 'Untitled image', 'فيديو بدون عنوان': 'Untitled video',
  'حذف': 'Delete', 'لسه مفيش محتوى هنا.': 'Nothing here yet.',
  'تم حفظ الإعدادات والخدمات.': 'Settings and services saved.',
  'بيانات المحل': 'Shop details', 'اسم المحل': 'Shop name',
  'بداية العمل': 'Opening time', 'نهاية العمل': 'Closing time', 'مدة الموعد بالدقائق': 'Appointment length (minutes)',
  'أيام الإجازة': 'Days off', 'خدمات الحلاقة': 'Barber services',
  'كل خدمة هتظهر للعميل كبطاقة مستقلة عند الحجز.': 'Each service appears as a separate card during booking.',
  'إضافة خدمة': 'Add service', 'اسم الخدمة': 'Service name', 'السعر بالجنيه': 'Price (EGP)',
  'أضف خدمة واحدة على الأقل.': 'Add at least one service.', 'حفظ التغييرات': 'Save changes',
  'إدارة الحجوزات': 'Manage bookings', 'طلبات كثيرة. حاول مرة أخرى بعد 15 دقيقة.': 'Too many requests. Try again in 15 minutes.',
  'مصدر الطلب غير مسموح.': 'Request origin is not allowed.',
  'سجّل الدخول أولاً': 'Please log in first', 'للأدمن فقط': 'Admins only',
  'ارفع ملف صورة صالح.': 'Please upload a valid image.', 'ارفع ملف فيديو صالح.': 'Please upload a valid video.',
  'اكتب الاسم بالكامل': 'Enter your full name', 'الإيميل غير صحيح': 'Invalid email address',
  'رقم التليفون غير صحيح': 'Invalid phone number', 'الباسورد 8 أحرف على الأقل': 'Password must be at least 8 characters.',
  'الإيميل مسجّل من قبل': 'This email is already registered', 'الإيميل أو الباسورد غلط': 'Incorrect email or password',
  'اكتب بريدًا إلكترونيًا صحيحًا.': 'Enter a valid email address.',
  'خدمة البريد غير مهيأة. أضف RESEND_API_KEY وEMAIL_FROM للخادم أولاً.': 'Email is not configured. Ask the site administrator to configure the email service.',
  'لو البريد مسجل عندنا، هيوصلك رابط إعادة تعيين كلمة المرور.': 'If that email is registered, you will receive a password reset link.',
  'تعذر إرسال رسالة إعادة التعيين الآن. حاول مرة أخرى لاحقًا.': 'Could not send the reset email right now. Please try again later.',
  'رابط إعادة التعيين غير صالح أو منتهي. اطلب رابطًا جديدًا.': 'This reset link is invalid or expired. Request a new one.',
  'تم تغيير كلمة المرور. سجل الدخول بكلمة المرور الجديدة.': 'Password changed. Log in with your new password.',
  'الميعاد غير متاح': 'That time slot is not available.',
  'تعذر حفظ الرسالة. حاول مرة أخرى.': 'Could not save your message. Please try again.',
  'حجم الملف أكبر من الحد المسموح (50 ميجابايت).': 'File is larger than the 50 MB limit.',
  'مؤكد': 'Confirmed', 'تم': 'Completed', 'ملغي': 'Cancelled',
  'قص شعر': 'Haircut', 'حلاقة دقن': 'Beard trim', 'قص + دقن': 'Haircut + beard trim',
  'الأحد': 'Sunday', 'الاثنين': 'Monday', 'الثلاثاء': 'Tuesday', 'الأربعاء': 'Wednesday',
  'الخميس': 'Thursday', 'الجمعة': 'Friday', 'السبت': 'Saturday'
};

const LocaleContext = createContext(null);
const arabicTranslations = Object.fromEntries(Object.entries(translations).map(([arabic, english]) => [english, arabic]));

export function translateText(value, language = localStorage.getItem('language') || 'ar') {
  if (typeof value !== 'string') return value;
  if (language === 'ar') {
    if (arabicTranslations[value]) return arabicTranslations[value];
    const requestFailure = value.match(/^Request failed \((\d+)\)$/);
    return requestFailure ? `فشل الطلب (HTTP ${requestFailure[1]})` : value;
  }
  if (translations[value]) return translations[value];
  const registrationCount = value.match(/^عدد الحجوزات المعروضة: (\d+)\. راجع التفاصيل وحدّث حالة كل حجز\.$/);
  if (registrationCount) return `Bookings shown: ${registrationCount[1]}. Review details and update each booking status.`;
  const emailServiceError = value.match(/^خدمة البريد غير مهيأة/);
  if (emailServiceError) return 'Email is not configured on the server. Contact the site administrator.';
  return value;
}

export function LocaleProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') === 'en' ? 'en' : 'ar');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = language === 'ar' ? 'محل الحلاقة' : 'Barbershop';
    localStorage.setItem('language', language);
  }, [language]);

  const value = useMemo(() => ({
    language,
    isEnglish: language === 'en',
    t: text => translateText(text, language),
    toggleLanguage: () => setLanguage(current => current === 'ar' ? 'en' : 'ar')
  }), [language]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error('useLocale must be used inside LocaleProvider');
  return value;
}
