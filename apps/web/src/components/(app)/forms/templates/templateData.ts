import { FieldType } from '@/lib/hooks/useForms';

// ============================================
// Types
// ============================================

export type TemplateLanguage = 'ar' | 'en';

export interface TemplateField {
  id: string;
  type: FieldType;
  label: { ar: string; en: string };
  placeholder?: { ar: string; en: string };
  helpText?: { ar: string; en: string };
  required: boolean;
  options?: { value: string; label: { ar: string; en: string } }[];
}

export interface FormTemplate {
  id: string;
  name: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: string;
  color: string;
  fields: TemplateField[];
}

// ============================================
// Iraqi Governorates
// ============================================

const IRAQI_GOVERNORATES = [
  { value: 'baghdad', label: { ar: 'بغداد', en: 'Baghdad' } },
  { value: 'basra', label: { ar: 'البصرة', en: 'Basra' } },
  { value: 'nineveh', label: { ar: 'نينوى', en: 'Nineveh' } },
  { value: 'erbil', label: { ar: 'أربيل', en: 'Erbil' } },
  { value: 'sulaymaniyah', label: { ar: 'السليمانية', en: 'Sulaymaniyah' } },
  { value: 'duhok', label: { ar: 'دهوك', en: 'Duhok' } },
  { value: 'kirkuk', label: { ar: 'كركوك', en: 'Kirkuk' } },
  { value: 'diyala', label: { ar: 'ديالى', en: 'Diyala' } },
  { value: 'anbar', label: { ar: 'الأنبار', en: 'Anbar' } },
  { value: 'babylon', label: { ar: 'بابل', en: 'Babylon' } },
  { value: 'karbala', label: { ar: 'كربلاء', en: 'Karbala' } },
  { value: 'najaf', label: { ar: 'النجف', en: 'Najaf' } },
  { value: 'wasit', label: { ar: 'واسط', en: 'Wasit' } },
  { value: 'maysan', label: { ar: 'ميسان', en: 'Maysan' } },
  { value: 'dhi_qar', label: { ar: 'ذي قار', en: 'Dhi Qar' } },
  { value: 'muthanna', label: { ar: 'المثنى', en: 'Muthanna' } },
  { value: 'qadisiyyah', label: { ar: 'القادسية', en: 'Qadisiyyah' } },
  { value: 'saladin', label: { ar: 'صلاح الدين', en: 'Saladin' } },
];

// ============================================
// Template 1: Contact Form (اتصال سريع)
// ============================================

const contactFormTemplate: FormTemplate = {
  id: 'contact',
  name: { ar: 'نموذج اتصال سريع', en: 'Quick Contact Form' },
  description: { 
    ar: 'نموذج بسيط للتواصل مع العملاء - يتضمن الاسم، البريد، الهاتف، والرسالة', 
    en: 'Simple form to connect with customers - includes name, email, phone, and message' 
  },
  icon: 'mail',
  color: 'blue',
  fields: [
    {
      id: 'full_name',
      type: FieldType.TEXT,
      label: { ar: 'الاسم الكامل', en: 'Full Name' },
      placeholder: { ar: 'أدخل اسمك الكامل', en: 'Enter your full name' },
      required: true,
    },
    {
      id: 'email',
      type: FieldType.EMAIL,
      label: { ar: 'البريد الإلكتروني', en: 'Email Address' },
      placeholder: { ar: 'example@email.com', en: 'example@email.com' },
      required: true,
    },
    {
      id: 'governorate',
      type: FieldType.SELECT,
      label: { ar: 'المحافظة', en: 'Governorate' },
      placeholder: { ar: 'اختر المحافظة', en: 'Select governorate' },
      required: true,
      options: IRAQI_GOVERNORATES,
    },
    {
      id: 'phone',
      type: FieldType.PHONE,
      label: { ar: 'رقم الهاتف', en: 'Phone Number' },
      placeholder: { ar: '07XX XXX XXXX', en: '07XX XXX XXXX' },
      required: true,
    },
    {
      id: 'message',
      type: FieldType.TEXTAREA,
      label: { ar: 'اترك تعليقك', en: 'Leave a Comment' },
      placeholder: { ar: 'اكتب رسالتك هنا...', en: 'Write your message here...' },
      required: false,
    },
  ],
};

// ============================================
// Template 2: Maintenance Request (طلب صيانة)
// ============================================

const maintenanceFormTemplate: FormTemplate = {
  id: 'maintenance',
  name: { ar: 'طلب صيانة / بلاغ عطل', en: 'Maintenance Request / Fault Report' },
  description: { 
    ar: 'نموذج لاستقبال طلبات الصيانة والإبلاغ عن الأعطال مع إمكانية رفع صور', 
    en: 'Form to receive maintenance requests and fault reports with image upload' 
  },
  icon: 'wrench',
  color: 'orange',
  fields: [
    {
      id: 'customer_name',
      type: FieldType.TEXT,
      label: { ar: 'اسم العميل', en: 'Customer Name' },
      placeholder: { ar: 'أدخل اسمك', en: 'Enter your name' },
      required: true,
    },
    {
      id: 'phone',
      type: FieldType.PHONE,
      label: { ar: 'رقم الهاتف', en: 'Phone Number' },
      placeholder: { ar: '07XX XXX XXXX', en: '07XX XXX XXXX' },
      required: true,
    },
    {
      id: 'governorate',
      type: FieldType.SELECT,
      label: { ar: 'المحافظة', en: 'Governorate' },
      placeholder: { ar: 'اختر المحافظة', en: 'Select governorate' },
      required: true,
      options: IRAQI_GOVERNORATES,
    },
    {
      id: 'address',
      type: FieldType.TEXTAREA,
      label: { ar: 'العنوان التفصيلي', en: 'Detailed Address' },
      placeholder: { ar: 'المنطقة، الشارع، أقرب نقطة دالة', en: 'Area, street, nearest landmark' },
      required: true,
    },
    {
      id: 'fault_type',
      type: FieldType.SELECT,
      label: { ar: 'نوع العطل', en: 'Fault Type' },
      placeholder: { ar: 'اختر نوع العطل', en: 'Select fault type' },
      required: true,
      options: [
        { value: 'electrical', label: { ar: 'كهربائي', en: 'Electrical' } },
        { value: 'plumbing', label: { ar: 'سباكة', en: 'Plumbing' } },
        { value: 'ac', label: { ar: 'تكييف وتبريد', en: 'AC & Cooling' } },
        { value: 'appliances', label: { ar: 'أجهزة منزلية', en: 'Home Appliances' } },
        { value: 'carpentry', label: { ar: 'نجارة', en: 'Carpentry' } },
        { value: 'painting', label: { ar: 'دهان وطلاء', en: 'Painting' } },
        { value: 'other', label: { ar: 'أخرى', en: 'Other' } },
      ],
    },
    {
      id: 'urgency',
      type: FieldType.RADIO,
      label: { ar: 'درجة الاستعجال', en: 'Urgency Level' },
      required: true,
      options: [
        { value: 'low', label: { ar: 'عادي', en: 'Normal' } },
        { value: 'medium', label: { ar: 'متوسط', en: 'Medium' } },
        { value: 'high', label: { ar: 'عاجل', en: 'Urgent' } },
        { value: 'critical', label: { ar: 'طارئ جداً', en: 'Critical' } },
      ],
    },
    {
      id: 'preferred_time',
      type: FieldType.DATE,
      label: { ar: 'الوقت المناسب للزيارة', en: 'Preferred Visit Time' },
      helpText: { ar: 'اختر التاريخ والوقت المناسب', en: 'Select preferred date and time' },
      required: false,
    },
    {
      id: 'problem_description',
      type: FieldType.TEXTAREA,
      label: { ar: 'وصف المشكلة', en: 'Problem Description' },
      placeholder: { ar: 'اشرح المشكلة بالتفصيل...', en: 'Describe the problem in detail...' },
      required: true,
    },
    {
      id: 'photos',
      type: FieldType.FILE,
      label: { ar: 'صور العطل', en: 'Fault Photos' },
      helpText: { ar: 'ارفق صور توضيحية للمشكلة (اختياري)', en: 'Attach photos of the problem (optional)' },
      required: false,
    },
  ],
};

// ============================================
// Template 3: Complaint/Suggestion (شكوى/اقتراح)
// ============================================

const complaintFormTemplate: FormTemplate = {
  id: 'complaint',
  name: { ar: 'شكوى / اقتراح', en: 'Complaint / Suggestion' },
  description: { 
    ar: 'نموذج لخدمة العملاء - استقبال الشكاوى والاقتراحات والاستفسارات', 
    en: 'Customer service form - receive complaints, suggestions, and inquiries' 
  },
  icon: 'message-square',
  color: 'purple',
  fields: [
    {
      id: 'name',
      type: FieldType.TEXT,
      label: { ar: 'الاسم', en: 'Name' },
      placeholder: { ar: 'أدخل اسمك (اختياري)', en: 'Enter your name (optional)' },
      helpText: { ar: 'يمكنك إرسال الشكوى بشكل مجهول', en: 'You can submit anonymously' },
      required: false,
    },
    {
      id: 'contact',
      type: FieldType.TEXT,
      label: { ar: 'رقم الهاتف أو البريد الإلكتروني', en: 'Phone or Email' },
      placeholder: { ar: 'للتواصل معك بخصوص الشكوى', en: 'To contact you regarding the complaint' },
      required: false,
    },
    {
      id: 'message_type',
      type: FieldType.RADIO,
      label: { ar: 'نوع الرسالة', en: 'Message Type' },
      required: true,
      options: [
        { value: 'complaint', label: { ar: 'شكوى', en: 'Complaint' } },
        { value: 'suggestion', label: { ar: 'اقتراح', en: 'Suggestion' } },
        { value: 'inquiry', label: { ar: 'استفسار', en: 'Inquiry' } },
        { value: 'praise', label: { ar: 'شكر وإشادة', en: 'Praise' } },
      ],
    },
    {
      id: 'order_number',
      type: FieldType.TEXT,
      label: { ar: 'رقم الطلب', en: 'Order Number' },
      placeholder: { ar: 'إذا كانت الشكوى متعلقة بطلب معين', en: 'If complaint is related to a specific order' },
      required: false,
    },
    {
      id: 'details',
      type: FieldType.TEXTAREA,
      label: { ar: 'التفاصيل', en: 'Details' },
      placeholder: { ar: 'اكتب تفاصيل الشكوى أو الاقتراح...', en: 'Write the details of your complaint or suggestion...' },
      required: true,
    },
    {
      id: 'attachments',
      type: FieldType.FILE,
      label: { ar: 'مرفقات', en: 'Attachments' },
      helpText: { ar: 'يمكنك إرفاق صور أو مستندات داعمة', en: 'You can attach supporting images or documents' },
      required: false,
    },
  ],
};

// ============================================
// Export All Templates
// ============================================

export const FORM_TEMPLATES: FormTemplate[] = [
  contactFormTemplate,
  maintenanceFormTemplate,
  complaintFormTemplate,
];

// Helper function to get template by ID
export const getTemplateById = (id: string): FormTemplate | undefined => {
  return FORM_TEMPLATES.find(t => t.id === id);
};

// Helper function to convert template fields to form fields
export const convertTemplateToFields = (
  template: FormTemplate, 
  language: TemplateLanguage
) => {
  return template.fields.map((field, index) => ({
    id: `field_${Date.now()}_${index}`,
    type: field.type,
    label: field.label[language],
    placeholder: field.placeholder?.[language] || '',
    helpText: field.helpText?.[language] || '',
    required: field.required,
    // Convert options to string[] (just labels)
    options: field.options?.map(opt => opt.label[language]) || [],
    order: index,
  }));
};
