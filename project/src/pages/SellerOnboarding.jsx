import { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, FileText, Headphones, Loader2, ShieldCheck, Trash2, Upload, UserRound, Users, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { deleteSellerDocument, documentTypes, getSellerApplication, saveSellerApplication, SELLER_DOCUMENTS_BUCKET, uploadSellerDocument, completeSellerRegistration } from '../services/sellerOnboardingApi';
import { supabase } from '../lib/supabase';
import sellerOnboardingBg from '../assets/seller-onboarding-bg.jpg';
import sellerOnboardingProps from '../assets/seller-onboarding-props.jpg';
import vedaCraftsLogo from '../assets/products/Vsoft Logo black cropped.png';

const stepKeys = ['account', 'otp_verify', 'business', 'store', 'bank', 'documents', 'review'];
const stepLabels = { account: 'Account', otp_verify: 'OTP Verify', business: 'Business Information', store: 'Store Setup', bank: 'Bank details', documents: 'Documents', review: 'Review & Complete' };
const initialData = { full_name: '', business_name: '', business_email: '', pan_number: '', gst_number: '', store_name: '', store_type: '', city: '', pincode: '', store_description: '', account_holder_name: '', account_number: '', ifsc_code: '', bank_name: '', branch_name: '', account_type: '' };

const otpFeatureItems = [
  {
    icon: ShieldCheck,
    title: 'Secure & Trusted',
    description: 'Your information is 100% encrypted and safe with us.',
  },
  {
    icon: Zap,
    title: 'Quick Verification',
    description: 'Take less than a minute to verify your number.',
  },
  {
    icon: Users,
    title: '10,000+ Seller',
    description: 'Trusted by thousands of seller across India.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'Our support team is always here to help you.',
  },
];

const businessFeatureItems = [
  {
    icon: ShieldCheck,
    title: 'Reach More Customers',
    description: 'Get access to a large community of buyers who love eco-friendly products.',
  },
  {
    icon: Zap,
    title: 'Safe & Secure',
    description: 'Your data and payments are protected with top-notch security.',
  },
  {
    icon: Users,
    title: 'Grow Your Business',
    description: 'Powerful tools and insights to help you increase sales and track performance.',
  },
  {
    icon: Headphones,
    title: 'Fair & Transparent',
    description: 'No hidden charges. We believe in fair fees and clear policies.',
  },
];

const storeFeatureItems = [
  {
    icon: ShieldCheck,
    title: 'Authentic Handmade',
    description: 'Showcase unique handmade and Eco-friendly products.',
  },
  {
    icon: Zap,
    title: 'Support Artisans',
    description: 'Empower local communities and preserve tradition.',
  },
  {
    icon: Users,
    title: 'Easy to Manage',
    description: 'Manage products, orders and earnings with ease.',
  },
  {
    icon: Headphones,
    title: 'Sustainable Marketplace',
    description: 'Promote responsible living and a greener Planet.',
  },
];

const bankFeatureItems = [
  {
    icon: ShieldCheck,
    title: 'Celebrate Craftsmanship',
    description: 'Showcase your unique handmade products to the right audience.',
  },
  {
    icon: Zap,
    title: 'Support Communities',
    description: 'Every order helps empower local artisans and preserve traditions.',
  },
  {
    icon: Users,
    title: 'Grow with Ease',
    description: 'Simple tools to manage your store, products and orders.',
  },
  {
    icon: Headphones,
    title: 'Sustainable Together',
    description: 'Promote eco-friendly living and build a better tomorrow.',
  },
];

function Field({ label, name, values, onChange, type = 'text', required = false, ...props }) {
  return (
    <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
      {label}{required && ' *'}
      <input
        type={type}
        name={name}
        value={values[name] || ''}
        onChange={onChange}
        required={required}
        className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
        {...props}
      />
    </label>
  );
}

function ReviewCard({ title, children }) {
  return <section className="rounded-xl border border-white/65 bg-white/15 p-4 shadow-sm sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900"><span className="grid h-6 w-6 place-items-center rounded-full border border-slate-500 text-slate-700"><UserRound size={14} /></span>{title}</h3><dl className="space-y-3 text-sm">{children}</dl></section>;
}

function Detail({ label, value }) {
  return <div className="grid grid-cols-[minmax(115px,36%)_1fr] gap-3"><dt className="font-medium text-slate-700">{label}</dt><dd className="break-words text-slate-950">{value || '—'}</dd></div>;
}

function Stepper({ step }) {
  return (
    <div className="relative mb-6">
      <div className="absolute left-[7%] right-[7%] top-3.5 h-[1.5px] bg-slate-300/70" aria-hidden="true" />
      <ol className="relative grid grid-cols-7 gap-1 text-center text-[9px] sm:text-[10px]">
        {stepKeys.map((key, index) => {
          const isCompleted = index < step;
          const isCurrent = index === step;
          return (
            <li key={key} className="flex flex-col items-center">
              <span
                className={`mb-1.5 grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors ${
                  isCompleted
                    ? 'bg-[#167321] text-white shadow-sm'
                    : isCurrent
                      ? 'border-2 border-[#167321] bg-[#e9f7df] text-[#167321] shadow-sm'
                      : 'border border-slate-200 bg-white/90 text-slate-400'
                }`}
              >
                {isCompleted ? <Check size={14} strokeWidth={2.5} /> : index + 1}
              </span>
              <span className={`leading-tight ${isCompleted || isCurrent ? 'font-semibold text-[#167321]' : 'text-slate-400'}`}>
                {stepLabels[key]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function SellerOnboarding() {
  const { t } = useTranslation();
  const { user, authReady, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialData);
  const [mobile, setMobile] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const [documents, setDocuments] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState('draft');
  const [credentialsInfo, setCredentialsInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    setError('');
    getSellerApplication(user.id).then((application) => {
      if (application) {
        const { seller_documents: savedDocuments = [], ...applicationValues } = application;
        setValues((current) => ({ ...current, ...applicationValues }));
        setConfirmAccountNumber(applicationValues.account_number || '');
        setDocuments(savedDocuments);
        setApplicationStatus(application.status);
        if (application.seller_code) {
          setCredentialsInfo({
            sellerCode: application.seller_code,
            email: application.business_email || user.email,
          });
        }
      } else setValues((current) => ({ ...current, full_name: user.name || '' }));
      setMobile(user.phone_number || '');
      setError('');
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [user]);

  const documentByType = useMemo(() => Object.fromEntries(documents.map((document) => [document.document_type, document])), [documents]);
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const persist = async (status = 'draft') => {
    setSaving(true); setError('');
    try {
      const trimmedMobile = mobile.trim();
      if (trimmedMobile && trimmedMobile !== (user.phone_number || '')) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone_number: trimmedMobile, updated_at: new Date().toISOString() })
          .eq('id', user.id);
        if (profileError) throw new Error(profileError.message);
        await refreshProfile?.();
      }
      return await saveSellerApplication(user.id, { ...values, status, current_step: step + 1 });
    }
    catch (err) { setError(err.message); return null; }
    finally { setSaving(false); }
  };
  const next = async () => {
    setNotice('');
    if (step === 4 && (values.account_number || confirmAccountNumber)) {
      if (confirmAccountNumber.trim() !== (values.account_number || '').trim()) {
        setError('Account Number and Confirm Account Number do not match.');
        return;
      }
    }
    const result = await persist();
    if (result) setStep((current) => Math.min(current + 1, stepKeys.length - 1));
  };

  const handleOtpChange = (index, rawValue) => {
    const digit = rawValue.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    if (error) setError('');
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const updated = ['', '', '', '', '', ''];
    pasted.split('').forEach((char, idx) => {
      updated[idx] = char;
    });
    setOtpDigits(updated);
    if (error) setError('');
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    if (otpDigits.join('').length !== 6) {
      setError('Please enter the 6-digit code to verify your mobile number.');
      return;
    }
    setError('');
    setNotice('');
    await next();
  };

  const handleResendOtp = () => {
    setError('');
    setOtpDigits(['', '', '', '', '', '']);
    setNotice('A new 6-digit verification code has been sent to your mobile number.');
    otpRefs.current[0]?.focus();
  };
  const upload = async (type, file) => {
    if (!file) return;
    const application = await persist();
    if (!application) return;
    setSaving(true); setError('');
    try {
      const previous = documentByType[type];
      const document = await uploadSellerDocument(user.id, application.id, type, file);
      if (previous) await supabase.storage.from(SELLER_DOCUMENTS_BUCKET).remove([previous.storage_path]);
      setDocuments((current) => [...current.filter((item) => item.document_type !== type), document]);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  const remove = async (document) => { setSaving(true); try { await deleteSellerDocument(document); setDocuments((current) => current.filter((item) => item.id !== document.id)); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const submit = async () => {
    const missing = documentTypes.filter((item) => item.required && !documentByType[item.key]);
    if (missing.length) {
      setError(`Upload the required documents: ${missing.map((item) => item.label).join(', ')}.`);
      setStep(5);
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await persist('submitted');
      if (result) {
        // Trigger automatic Seller ID & Temporary Password creation and email
        const targetEmail = values.business_email || user.email;
        const regResult = await completeSellerRegistration({
          userId: user.id,
          businessEmail: targetEmail,
          email: user.email,
          fullName: values.full_name || values.business_name,
          storeName: values.store_name,
        });

        if (regResult?.data?.sellerCode) {
          setCredentialsInfo(regResult.data);
        }

        setApplicationStatus('submitted');
        setNotice(regResult?.message || 'Application submitted successfully! Credentials sent to email.');
        setStep(6);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!authReady) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-green-700" /></div>;
  if (!user) return <Navigate to="/login?redirect=%2Fseller%2Fonboarding" replace />;
  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-green-700" /></div>;

  const pageBackgroundStyle = {
    backgroundImage: `url(${sellerOnboardingBg})`,
  };

  if (applicationStatus !== 'draft') {
    const targetEmail = values.business_email || user.email;
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#f5efe6] bg-cover bg-center bg-no-repeat px-4 py-16" style={pageBackgroundStyle}>
        <section className="mx-auto max-w-xl rounded-2xl border border-white/70 bg-white/10 p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-[3px]">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-green-100 text-[#167321]">
            <Check size={30} strokeWidth={2.5} />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            {credentialsInfo?.sellerCode ? 'Seller Registration Successful! 🎉' : t('sellerOnboarding.alreadyRegistered.title')}
          </h1>
          <p className="mt-3 text-slate-600">
            {t('sellerOnboarding.alreadyRegistered.desc', { status: applicationStatus.replace('_', ' ') })}
          </p>

          {credentialsInfo?.sellerCode && (
            <div className="my-6 rounded-xl border border-green-200 bg-[#f4f9f4] p-5 text-left">
              <div className="flex items-center justify-between border-b border-green-100 pb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-800">Your Seller ID</span>
                <span className="font-mono text-lg font-bold text-[#167321]">{credentialsInfo.sellerCode}</span>
              </div>
              <p className="mt-3 text-sm text-slate-700 leading-relaxed">
                We have automatically generated your <strong>Seller ID</strong> and <strong>Temporary Password</strong> and sent them to:
              </p>
              <p className="mt-1 font-semibold text-slate-900 text-sm">
                ✉️ {targetEmail}
              </p>
              <p className="mt-3 text-xs text-slate-500">
                Please check your inbox (or spam folder) for login instructions to access the Seller Portal.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => navigate('/seller')} className="rounded-lg bg-[#167321] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#125e1b] transition-colors">
              {t('sellerOnboarding.alreadyRegistered.backBtn')}
            </button>
            <button onClick={() => navigate('/')} className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Go to Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  const rawMobile = (mobile || user.phone_number || '').trim();
  const displayMobile = rawMobile
    ? (rawMobile.startsWith('+') ? rawMobile : `+91 ${rawMobile}`)
    : '+91 9875683654';

  const stepIcons = { 1: ShieldCheck, 2: Zap, 3: Users, 4: Headphones, 5: FileText, 6: Check };
const stepHeadings = {
    0: t('sellerOnboarding.heading'),
    1: 'Verify Your Mobile Number',
    2: 'Business Information',
    3: 'Store details',
    4: 'Bank Details',
    5: 'Upload Documents',
    6: 'Overall Review',
  };

  const formContent = (
    <>
      <Stepper step={step} />

      <div className={`mb-6 ${step >= 2 && step <= 6 ? 'text-left' : 'text-center'}`}>
        {step === 1 && (
          <div className="mx-auto mb-3.5 h-11 w-11 rounded-full bg-slate-300/75" aria-hidden="true" />
        )}
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          {stepHeadings[step] || stepLabels[stepKeys[step]]}
        </h2>
        <p className="mt-1 text-xs text-slate-600 sm:text-sm">
          {step === 1
            ? "We've sent a 6 - digit verification code to"
            : step === 2 || step === 3
              ? 'Tell Us about Your business'
              : step === 4
                ? 'Add your bank account to receive payments securely and directly'
                : step === 5
                  ? 'Upload the required documents to verify your identity and business'
                  : step === 6
                    ? 'Please review all your information before submitting for verification.'
                    : 'Fill in the details below to get started'}
        </p>
        {step === 1 && (
          <p className="mt-2 text-base font-semibold text-[#167321]">
            {displayMobile}
          </p>
        )}
      </div>

      {error && <p role="alert" className="mb-5 rounded-lg bg-red-50/95 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p className="mb-5 rounded-lg bg-green-50/95 p-3 text-sm text-green-800">{notice}</p>}

      {step === 0 && (
        <div className="space-y-4">
          <Field
            label={t('sellerOnboarding.step0.fullName')}
            name="full_name"
            values={values}
            onChange={update}
            placeholder="Full Name"
            required
          />
          <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
            Email Address
            <input
              type="email"
              value={user.email || ''}
              readOnly
              className="mt-1.5 w-full cursor-not-allowed rounded-lg border border-slate-200/80 bg-white/75 px-3.5 py-2.5 text-sm text-slate-600 outline-none"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
            Mobile *
            <input
              type="tel"
              inputMode="tel"
              name="mobile"
              value={mobile}
              onChange={(event) => setMobile(event.target.value)}
              placeholder="Enter mobile number"
              required
              className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </label>
          <p className="text-xs text-slate-600">
            {t('sellerOnboarding.step0.authNote', { email: user.email })}
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                placeholder="-"
                aria-label={`OTP digit ${index + 1}`}
                className="h-11 w-10 rounded-lg border border-slate-200/90 bg-white/95 text-center text-lg font-semibold text-slate-900 shadow-sm outline-none transition focus:border-[#167321] focus:ring-2 focus:ring-green-100 sm:h-12 sm:w-12"
              />
            ))}
          </div>
          <p className="text-center text-xs text-slate-700 sm:text-sm">
            Enter the 6-digit code to verify your mobile number
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field
            label="Business Name"
            name="business_name"
            values={values}
            onChange={update}
            placeholder="Enter business name"
            required
          />
          <Field
            label="Email ID"
            name="business_email"
            values={values}
            onChange={update}
            type="email"
            placeholder="Enter email ID"
            required
          />
          <div className="grid gap-6 sm:grid-cols-2 p-2">
            <Field
              label="PAN Number"
              name="pan_number"
              values={values}
              onChange={update}
              placeholder="Enter PAN number"
              required
            />
            <Field
              label="GST Number (Optional)"
              name="gst_number"
              values={values}
              onChange={update}
              placeholder="Enter GST Number"
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 p-2">
            <Field
              label="Store Name"
              name="store_name"
              values={values}
              onChange={update}
              placeholder="Enter store name"
              required
            />
            <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
              Store Type
              <select name="store_type" value={values.store_type} onChange={update} className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100">
                <option value="">Select category</option>
                <option value="Handmade crafts">{t('sellerOnboarding.step2.categories.crafts')}</option>
                <option value="Eco products">{t('sellerOnboarding.step2.categories.eco')}</option>
                <option value="Food">{t('sellerOnboarding.step2.categories.food')}</option>
                <option value="Fashion">{t('sellerOnboarding.step2.categories.fashion')}</option>
                <option value="Wellness">{t('sellerOnboarding.step2.categories.wellness')}</option>
              </select>
            </label>
            <Field
              label="City"
              name="city"
              values={values}
              onChange={update}
              placeholder="Enter City"
              required
            />
            <Field
              label="Pincode"
              name="pincode"
              values={values}
              onChange={update}
              placeholder="Enter Pin code"
              inputMode="numeric"
              required
            />
          </div>
          <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
            Store Description
            <textarea
              name="store_description"
              value={values.store_description || ''}
              onChange={update}
              rows="3"
              placeholder="Description"
              className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
            />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="grid gap-6 sm:grid-cols-2 p-2">
            <Field
              label="Account Holder Name"
              name="account_holder_name"
              values={values}
              onChange={update}
              placeholder="Enter account holder name"
              required
            />
            <Field
              label="Account Number"
              name="account_number"
              values={values}
              onChange={update}
              placeholder="Enter Account Number"
              inputMode="numeric"
              required
            />
            <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
              Confirm Account Number
              <input
                type="text"
                inputMode="numeric"
                name="confirm_account_number"
                value={confirmAccountNumber}
                onChange={(event) => {
                  setConfirmAccountNumber(event.target.value);
                  if (error) setError('');
                }}
                placeholder="Confirm Account Number"
                required
                className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
              />
            </label>
            <Field
              label="IFSC Code"
              name="ifsc_code"
              values={values}
              onChange={update}
              placeholder="Enter IFSC Code"
              required
            />
          </div>
          <Field
            label="Bank Name"
            name="bank_name"
            values={values}
            onChange={update}
            placeholder="Enter Bank Name"
            required
          />
          <div className="grid gap-6 sm:grid-cols-2 p-2">
            <Field
              label="Branch Name"
              name="branch_name"
              values={values}
              onChange={update}
              placeholder="Enter Branch Name"
              required
            />
            <label className="block text-xs font-semibold text-slate-700 sm:text-sm">
              Account Type
              <select
                name="account_type"
                value={values.account_type}
                onChange={update}
                className="mt-1.5 w-full rounded-lg border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
              >
                <option value="">Select account type</option>
                <option value="Savings">{t('sellerOnboarding.step3.savings')}</option>
                <option value="Current">{t('sellerOnboarding.step3.current')}</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="grid gap-6 sm:grid-cols-2 p-2">
          {documentTypes.map((item) => {
            const document = documentByType[item.key];
            return (
              <div key={item.key}>
                <p className="mb-1.5 text-xs font-semibold text-slate-800">
                  {item.label}{item.required && ' *'}
                </p>
                {document ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-green-300 bg-white/95 px-3 py-3 text-xs text-green-800 shadow-sm">
                    <span className="flex min-w-0 items-center gap-2 truncate font-medium">
                      <FileText size={16} className="shrink-0 text-[#167321]" />
                      <span className="truncate">{document.original_filename}</span>
                    </span>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => remove(document)}
                      aria-label={t('sellerOnboarding.step4.removeAria', { label: item.label })}
                      className="shrink-0 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-200/90 bg-white/95 px-3 py-2.5 text-center shadow-sm transition hover:border-[#167321] hover:bg-green-50/40">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800">
                      <Upload size={15} />
                      Upload Document or Image
                    </span>
                    <span className="mt-0.5 text-[10px] text-slate-400">
                      PDF, JPG, PNG up to 10 MB
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                      className="hidden"
                      onChange={(event) => upload(item.key, event.target.files?.[0])}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      )}

      {step === 6 && (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <ReviewCard title={t('sellerOnboarding.step5.accountInfo')}>
              <Detail label={t('sellerOnboarding.step5.fullName')} value={values.full_name} />
              <Detail label={t('sellerOnboarding.step5.email')} value={user.email} />
              <Detail label={t('sellerOnboarding.step5.phone')} value={mobile || user.phone_number || t('sellerOnboarding.step5.notProvided')} />
            </ReviewCard>
            <ReviewCard title={t('sellerOnboarding.step5.businessInfo')}>
              <Detail label={t('sellerOnboarding.step5.businessName')} value={values.business_name} />
              <Detail label={t('sellerOnboarding.step5.businessType')} value={values.store_type} />
              <Detail label={t('sellerOnboarding.step5.gstNumber')} value={values.gst_number || t('sellerOnboarding.step5.notProvided')} />
              <Detail label={t('sellerOnboarding.step5.panNumber')} value={values.pan_number} />
            </ReviewCard>
            <ReviewCard title={t('sellerOnboarding.step5.storeInfo')}>
              <Detail label={t('sellerOnboarding.step5.storeName')} value={values.store_name} />
              <Detail label={t('sellerOnboarding.step5.storeCategory')} value={values.store_type} />
              <Detail label={t('sellerOnboarding.step5.cityPincode')} value={[values.city, values.pincode].filter(Boolean).join(' - ')} />
              <Detail label={t('sellerOnboarding.step5.description')} value={values.store_description} />
            </ReviewCard>
            <ReviewCard title={t('sellerOnboarding.step5.bankInfo')}>
              <Detail label={t('sellerOnboarding.step5.accountHolder')} value={values.account_holder_name} />
              <Detail label={t('sellerOnboarding.step5.accountNumber')} value={values.account_number} />
              <Detail label={t('sellerOnboarding.step5.ifscCode')} value={values.ifsc_code} />
              <Detail label="Bank Name" value={values.bank_name} />
              <Detail label="Branch Name" value={values.branch_name} />
            </ReviewCard>
          </div>

          <section className="overflow-hidden rounded-xl border border-white/65 bg-white/15 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-white/60 bg-white/20 text-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-semibold">{t('sellerOnboarding.step5.table.docName')}</th>
                    <th className="px-5 py-4 font-semibold">{t('sellerOnboarding.step5.table.fileName')}</th>
                    <th className="px-5 py-4 text-center font-semibold">{t('sellerOnboarding.step5.table.priority')}</th>
                    <th className="px-5 py-4 text-center font-semibold">{t('sellerOnboarding.step5.table.status')}</th>
                    <th className="px-5 py-4 text-right font-semibold">{t('sellerOnboarding.step5.table.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypes.map((item) => {
                    const document = documentByType[item.key];
                    return (
                      <tr key={item.key} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-3.5 font-medium text-slate-900">{item.label}</td>
                        <td className="max-w-[220px] truncate px-5 py-3.5 text-slate-600">
                          {document?.original_filename || t('sellerOnboarding.step5.table.notUploaded')}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {item.required ? t('sellerOnboarding.step5.table.high') : t('sellerOnboarding.step5.table.optional')}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {document ? (
                            <span className="rounded-md bg-lime-100 px-3 py-1 text-xs font-medium text-green-800">
                              {t('sellerOnboarding.step5.table.uploaded')}
                            </span>
                          ) : (
                            <span className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500">
                              {t('sellerOnboarding.step5.table.missing')}
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button onClick={() => setStep(5)} className="font-medium text-green-700 hover:text-green-900">
                            {t('sellerOnboarding.step5.table.edit')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {step === 1 ? (
        <div className="mt-6">
          <button
            disabled={saving}
            onClick={handleVerifyOtp}
            className="w-full rounded-lg bg-[#ffc107] py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-[#e9ae00] disabled:opacity-50"
          >
            {saving ? t('sellerOnboarding.actions.saving') : 'Verify & Continue'}
          </button>
          <p className="mt-3.5 text-center text-xs text-slate-700">
            Didn&apos;t receive the code?{' '}
            <button
              type="button"
              disabled={saving}
              onClick={handleResendOtp}
              className="font-semibold text-[#167321] hover:underline disabled:opacity-50"
            >
              Resend OTP
            </button>
          </p>
        </div>
      ) : step === 2 || step === 3 || step === 4 || step === 5 ? (
        <div className="mt-7">
          <button
            disabled={saving}
            onClick={next}
            className="w-full rounded-lg bg-[#ffc107] py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-[#e9ae00] disabled:opacity-50"
          >
            {saving ? t('sellerOnboarding.actions.saving') : 'Continue'}
          </button>
        </div>
      ) : (
        <div className={`mt-7 flex gap-3 ${step === 0 ? '' : step === 6 ? 'justify-end pt-2' : 'justify-between border-t border-slate-200/70 pt-5'}`}>
          {step > 0 && step !== 6 && (
            <button
              disabled={saving}
              onClick={() => setStep((current) => current - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-400 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-white disabled:opacity-40"
            >
              <ChevronLeft size={16} />{t('sellerOnboarding.actions.back')}
            </button>
          )}
          {step === 6 ? (
            <button
              disabled={saving}
              onClick={submit}
              className="rounded-lg bg-[#ffc107] px-10 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-[#e9ae00] disabled:opacity-50"
            >
              {saving ? t('sellerOnboarding.actions.saving') : t('sellerOnboarding.actions.submit')}
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={next}
              className={`${step === 0 ? 'w-full py-3' : 'px-7 py-2.5'} rounded-lg bg-[#ffc107] text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-[#e9ae00] disabled:opacity-50`}
            >
              {saving ? t('sellerOnboarding.actions.saving') : step === 0 ? 'Continue' : t('sellerOnboarding.actions.saveAndContinue')}
            </button>
          )}
        </div>
      )}
    </>
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5efe6] bg-cover bg-center bg-no-repeat px-4 py-8 sm:px-8 lg:py-12" style={pageBackgroundStyle}>
      {step === 0 && (
        <img
          src={sellerOnboardingProps}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-0 w-[260px] select-none object-contain sm:w-[340px] lg:w-[430px] xl:w-[490px]"
          style={{
            WebkitMaskImage: 'linear-gradient(to top, black 74%, transparent 100%), linear-gradient(to right, black 80%, transparent 100%)',
            WebkitMaskComposite: 'source-in',
            maskImage: 'linear-gradient(to top, black 74%, transparent 100%), linear-gradient(to right, black 80%, transparent 100%)',
            maskComposite: 'intersect',
          }}
        />
      )}
      {step === 6 ? (
        <section className="relative z-10 mx-auto max-w-6xl rounded-2xl border border-white/70 bg-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-[3px] sm:p-8">
          <div className="mb-3 flex items-center justify-start">
            <div className="inline-flex rounded-lg bg-white/95 px-3 py-1.5 shadow-sm">
              <img src={vedaCraftsLogo} alt="VedaCrafts" className="h-11 w-auto object-contain" />
            </div>
          </div>
          <div className="mb-4 flex justify-start">
            <button
              type="button"
              disabled={saving}
              onClick={() => setStep((current) => current - 1)}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-green-800"
            >
              <ChevronLeft size={14} />{t('sellerOnboarding.actions.back')}
            </button>
          </div>
          {formContent}
        </section>
      ) : (
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-[1440px] items-center gap-8 px-2 sm:px-6 lg:grid-cols-[1fr_minmax(420px,540px)] lg:gap-12 lg:px-10">
          <div className="flex flex-col items-start justify-start self-start pt-2 lg:pt-6">
            <div className="mb-8 inline-flex rounded-lg bg-white/95 px-4 py-2 shadow-sm">
              <img src={vedaCraftsLogo} alt="VedaCrafts" className="h-12 w-auto object-contain" />
            </div>
            {step >= 1 && step <= 5 ? (
              <>
                <h1 className="max-w-lg text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-[48px]">
                  {step === 1 || step === 5
                    ? 'One Step Closer to'
                    : step === 2
                      ? 'Sell Your Creations.'
                      : step === 3
                        ? 'Craft Connect.'
                        : 'Empowering Artisans.'}
                  <span className="mt-1 block text-[#167321]">
                    {step === 1 || step === 5
                      ? 'Your Business Growth'
                      : step === 2
                        ? 'Grow Your Business'
                        : step === 3
                          ? 'Create Impact.'
                          : 'Enriching Lives.'}
                  </span>
                </h1>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-700 sm:text-base">
                  {step === 1
                    ? 'Enter the 6 - digit code sent to your registered mobile number to continue'
                    : step === 2
                      ? 'Join thousands of artisans and small businesses who are reaching more customers every day.'
                      : step === 3
                        ? 'From your workshop to homes across the country, Vedacraft helps your handmade creations reach people who truly value them.'
                        : step === 4
                          ? 'Set up your payout account to receive earnings safely and directly.'
                          : 'Upload your verification documents to complete your seller profile.'}
                </p>
                <div className="mt-8 w-full max-w-md space-y-5">
                  {(step === 1 || step === 5
                    ? otpFeatureItems
                    : step === 2
                      ? businessFeatureItems
                      : step === 3
                        ? storeFeatureItems
                        : bankFeatureItems
                  ).map(({ icon: Icon, title, description }) => (
                    <div key={title} className="flex items-start gap-4">
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#eef4e8] text-[#167321] shadow-sm">
                        <Icon size={20} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-slate-950">{title}</h3>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-700 sm:text-sm">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h1 className="max-w-md text-3xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                  Start Selling On Vedacraft
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-700 sm:text-base">
                  Grow your handmade business with India&apos;s trusted eco - friendly marketplace
                </p>
              </>
            )}
          </div>

          <section className="flex min-h-[555px] w-full flex-col rounded-2xl border border-white/70 bg-white/10 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-[3px] sm:p-8">
            {step >= 1 && step <= 5 && (
              <div className="mb-3 flex justify-start">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setStep((current) => current - 1)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-green-800"
                >
                  <ChevronLeft size={14} />{t('sellerOnboarding.actions.back')}
                </button>
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between">
              {formContent}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
