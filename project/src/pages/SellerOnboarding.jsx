import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, FileText, Loader2, Trash2, Upload, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { deleteSellerDocument, documentTypes, getSellerApplication, saveSellerApplication, SELLER_DOCUMENTS_BUCKET, uploadSellerDocument, completeSellerRegistration } from '../services/sellerOnboardingApi';
import { supabase } from '../lib/supabase';

const stepKeys = ['account', 'business', 'store', 'bank', 'documents', 'review'];
const initialData = { full_name: '', business_name: '', business_email: '', pan_number: '', gst_number: '', store_name: '', store_type: '', city: '', pincode: '', store_description: '', account_holder_name: '', account_number: '', ifsc_code: '', bank_name: '', branch_name: '', account_type: '' };

function Field({ label, name, values, onChange, type = 'text', required = false, ...props }) {
  return <label className="block text-sm font-medium text-slate-800">{label}{required && ' *'}<input type={type} name={name} value={values[name] || ''} onChange={onChange} required={required} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" {...props} /></label>;
}

function ReviewCard({ title, children }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"><h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900"><span className="grid h-6 w-6 place-items-center rounded-full border border-slate-400"><UserRound size={14} /></span>{title}</h3><dl className="space-y-3 text-sm">{children}</dl></section>;
}

function Detail({ label, value }) {
  return <div className="grid grid-cols-[minmax(115px,36%)_1fr] gap-3"><dt className="font-medium text-slate-700">{label}</dt><dd className="break-words text-slate-950">{value || '—'}</dd></div>;
}

export default function SellerOnboarding() {
  const { t } = useTranslation();
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialData);
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
        setDocuments(savedDocuments);
        setApplicationStatus(application.status);
        if (application.seller_code) {
          setCredentialsInfo({
            sellerCode: application.seller_code,
            email: application.business_email || user.email,
          });
        }
      } else setValues((current) => ({ ...current, full_name: user.name || '' }));
      setError('');
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  }, [user]);

  const documentByType = useMemo(() => Object.fromEntries(documents.map((document) => [document.document_type, document])), [documents]);
  const update = (event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
  const persist = async (status = 'draft') => {
    setSaving(true); setError('');
    try { return await saveSellerApplication(user.id, { ...values, status, current_step: step + 1 }); }
    catch (err) { setError(err.message); return null; }
    finally { setSaving(false); }
  };
  const next = async () => { const result = await persist(); if (result) setStep((current) => Math.min(current + 1, stepKeys.length - 1)); };
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
      setStep(4);
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
        setStep(5);
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
  if (applicationStatus !== 'draft') {
    const targetEmail = values.business_email || user.email;
    return (
      <main className="min-h-screen bg-[#f8f5eb] px-4 py-16">
        <section className="mx-auto max-w-xl rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm">
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

  return (
    <main className={`min-h-screen bg-[#f8f5eb] px-4 py-10 sm:px-8 ${step === 5 ? 'sm:py-14' : ''}`}>
      <section className={`mx-auto rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-8 ${step === 5 ? 'max-w-7xl' : 'max-w-4xl'}`}>
        <div className="mb-8 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-green-700">{t('sellerOnboarding.badge')}</p>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t('sellerOnboarding.heading')}</h1>
          </div>
          <button onClick={() => navigate('/seller')} className="text-sm text-slate-600 hover:text-green-700">
            {t('sellerOnboarding.saveAndExit')}
          </button>
        </div>

        <ol className="mb-9 grid grid-cols-3 gap-y-3 text-center text-xs sm:grid-cols-6">
          {stepKeys.map((key, index) => (
            <li key={key} className={index <= step ? 'font-semibold text-green-700' : 'text-slate-400'}>
              <span className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full ${index < step ? 'bg-green-700 text-white' : index === step ? 'border-2 border-green-700' : 'bg-slate-100'}`}>
                {index < step ? <Check size={15} /> : index + 1}
              </span>
              {t(`sellerOnboarding.steps.${key}`)}
            </li>
          ))}
        </ol>

        {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}

        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">{t('sellerOnboarding.step0.title')}</h2>
            <Field label={t('sellerOnboarding.step0.fullName')} name="full_name" values={values} onChange={update} required />
            <p className="text-sm text-slate-500">
              {t('sellerOnboarding.step0.authNote', { email: user.email })}
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">{t('sellerOnboarding.step1.title')}</h2>
            <Field label={t('sellerOnboarding.step1.businessName')} name="business_name" values={values} onChange={update} required />
            <Field label={t('sellerOnboarding.step1.businessEmail')} name="business_email" values={values} onChange={update} type="email" required />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('sellerOnboarding.step1.panNumber')} name="pan_number" values={values} onChange={update} required />
              <Field label={t('sellerOnboarding.step1.gstNumber')} name="gst_number" values={values} onChange={update} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">{t('sellerOnboarding.step2.title')}</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('sellerOnboarding.step2.storeName')} name="store_name" values={values} onChange={update} required />
              <label className="block text-sm font-medium">
                {t('sellerOnboarding.step2.storeType')}
                <select name="store_type" value={values.store_type} onChange={update} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                  <option value="">{t('sellerOnboarding.step2.selectCategory')}</option>
                  <option value="Handmade crafts">{t('sellerOnboarding.step2.categories.crafts')}</option>
                  <option value="Eco products">{t('sellerOnboarding.step2.categories.eco')}</option>
                  <option value="Food">{t('sellerOnboarding.step2.categories.food')}</option>
                  <option value="Fashion">{t('sellerOnboarding.step2.categories.fashion')}</option>
                  <option value="Wellness">{t('sellerOnboarding.step2.categories.wellness')}</option>
                </select>
              </label>
              <Field label={t('sellerOnboarding.step2.city')} name="city" values={values} onChange={update} required />
              <Field label={t('sellerOnboarding.step2.pincode')} name="pincode" values={values} onChange={update} inputMode="numeric" required />
            </div>
            <label className="block text-sm font-medium">
              {t('sellerOnboarding.step2.storeDescription')}
              <textarea name="store_description" value={values.store_description || ''} onChange={update} rows="4" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold">{t('sellerOnboarding.step3.title')}</h2>
            <p className="text-sm text-slate-500">{t('sellerOnboarding.step3.privacyNote')}</p>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label={t('sellerOnboarding.step3.accountHolderName')} name="account_holder_name" values={values} onChange={update} required />
              <Field label={t('sellerOnboarding.step3.accountNumber')} name="account_number" values={values} onChange={update} inputMode="numeric" required />
              <Field label={t('sellerOnboarding.step3.ifscCode')} name="ifsc_code" values={values} onChange={update} required />
              <Field label={t('sellerOnboarding.step3.bankName')} name="bank_name" values={values} onChange={update} required />
              <Field label={t('sellerOnboarding.step3.branchName')} name="branch_name" values={values} onChange={update} required />
              <label className="block text-sm font-medium">
                {t('sellerOnboarding.step3.accountType')}
                <select name="account_type" value={values.account_type} onChange={update} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
                  <option value="">{t('sellerOnboarding.step3.selectAccountType')}</option>
                  <option value="Savings">{t('sellerOnboarding.step3.savings')}</option>
                  <option value="Current">{t('sellerOnboarding.step3.current')}</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold">{t('sellerOnboarding.step4.title')}</h2>
            <p className="mb-5 text-sm text-slate-500">{t('sellerOnboarding.step4.formatNote')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {documentTypes.map((item) => {
                const document = documentByType[item.key];
                return (
                  <div key={item.key} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-medium">{item.label}{item.required && ' *'}</p>
                    {document ? (
                      <div className="mt-3 flex items-center justify-between gap-2 text-sm text-green-700">
                        <span className="flex min-w-0 items-center gap-2 truncate">
                          <FileText size={17} />{document.original_filename}
                        </span>
                        <button onClick={() => remove(document)} aria-label={t('sellerOnboarding.step4.removeAria', { label: item.label })} className="text-red-600">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    ) : (
                      <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-green-500 bg-green-50 px-3 py-3 text-sm text-green-800 hover:bg-green-100">
                        <Upload size={17} />{t('sellerOnboarding.step4.uploadBtn')}
                        <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(event) => upload(item.key, event.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-7">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">{t('sellerOnboarding.step5.title')}</h2>
              <p className="mt-1 text-slate-600">{t('sellerOnboarding.step5.sub')}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <ReviewCard title={t('sellerOnboarding.step5.accountInfo')}>
                <Detail label={t('sellerOnboarding.step5.fullName')} value={values.full_name} />
                <Detail label={t('sellerOnboarding.step5.email')} value={user.email} />
                <Detail label={t('sellerOnboarding.step5.phone')} value={user.phone_number || t('sellerOnboarding.step5.notProvided')} />
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
                <Detail label={t('sellerOnboarding.step5.bankBranch')} value={[values.bank_name, values.branch_name].filter(Boolean).join(', ')} />
              </ReviewCard>
            </div>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-800">
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
                            <button onClick={() => setStep(4)} className="font-medium text-green-700 hover:text-green-900">
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

        <div className="mt-9 flex justify-end gap-3 border-t pt-5">
          <button
            disabled={step === 0 || saving}
            onClick={() => setStep((current) => current - 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-800 px-8 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            <ChevronLeft size={16} />{t('sellerOnboarding.actions.back')}
          </button>
          {step === 5 ? (
            <button
              disabled={saving}
              onClick={submit}
              className="rounded-lg bg-[#ffc107] px-9 py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#e9ae00] disabled:opacity-50"
            >
              {saving ? t('sellerOnboarding.actions.saving') : t('sellerOnboarding.actions.submit')}
            </button>
          ) : (
            <button
              disabled={saving}
              onClick={next}
              className="rounded-lg bg-[#167321] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? t('sellerOnboarding.actions.saving') : t('sellerOnboarding.actions.saveAndContinue')}
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
