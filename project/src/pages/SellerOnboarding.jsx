import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, FileText, Loader2, Trash2, Upload, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deleteSellerDocument, documentTypes, getSellerApplication, saveSellerApplication, SELLER_DOCUMENTS_BUCKET, uploadSellerDocument } from '../services/sellerOnboardingApi';
import { supabase } from '../lib/supabase';

const steps = ['Account', 'Business', 'Store', 'Bank', 'Documents', 'Review'];
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
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initialData);
  const [documents, setDocuments] = useState([]);
  const [applicationStatus, setApplicationStatus] = useState('draft');
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
  const next = async () => { const result = await persist(); if (result) setStep((current) => Math.min(current + 1, steps.length - 1)); };
  const upload = async (type, file) => {
    if (!file) return;
    const application = await persist();
    if (!application) return;
    setSaving(true); setError('');
    try {
      const previous = documentByType[type];
      const document = await uploadSellerDocument(user.id, application.id, type, file);
      // The database upsert retains the document record; only remove its old private object.
      if (previous) await supabase.storage.from(SELLER_DOCUMENTS_BUCKET).remove([previous.storage_path]);
      setDocuments((current) => [...current.filter((item) => item.document_type !== type), document]);
    } catch (err) { setError(err.message); } finally { setSaving(false); }
  };
  const remove = async (document) => { setSaving(true); try { await deleteSellerDocument(document); setDocuments((current) => current.filter((item) => item.id !== document.id)); } catch (err) { setError(err.message); } finally { setSaving(false); } };
  const submit = async () => { const missing = documentTypes.filter((item) => item.required && !documentByType[item.key]); if (missing.length) { setError(`Upload the required documents: ${missing.map((item) => item.label).join(', ')}.`); setStep(4); return; } const result = await persist('submitted'); if (result) { setApplicationStatus('submitted'); setNotice('Application submitted for verification.'); setStep(5); } };

  if (!authReady) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-green-700" /></div>;
  if (!user) return <Navigate to="/login?redirect=%2Fseller%2Fonboarding" replace />;
  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-green-700" /></div>;
  if (applicationStatus !== 'draft') return <main className="min-h-screen bg-[#f8f5eb] px-4 py-16"><section className="mx-auto max-w-xl rounded-2xl border border-green-100 bg-white p-8 text-center shadow-sm"><span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-green-100 text-green-700"><Check size={25} /></span><h1 className="text-2xl font-bold text-slate-900">You are already registered as a seller</h1><p className="mt-3 text-slate-600">Your seller application has already been submitted and is currently <b>{applicationStatus.replace('_', ' ')}</b>. We will contact you after verification.</p><button onClick={() => navigate('/seller')} className="mt-6 rounded-lg bg-[#167321] px-5 py-2.5 text-sm font-semibold text-white">Back to seller page</button></section></main>;

  return <main className={`min-h-screen bg-[#f8f5eb] px-4 py-10 sm:px-8 ${step === 5 ? 'sm:py-14' : ''}`}><section className={`mx-auto rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-8 ${step === 5 ? 'max-w-7xl' : 'max-w-4xl'}`}>
    <div className="mb-8 flex items-center justify-between gap-3"><div><p className="text-sm font-semibold text-green-700">Vedacraft Seller</p><h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Create your seller account</h1></div><button onClick={() => navigate('/seller')} className="text-sm text-slate-600 hover:text-green-700">Save & exit</button></div>
    <ol className="mb-9 grid grid-cols-3 gap-y-3 text-center text-xs sm:grid-cols-6">{steps.map((name, index) => <li key={name} className={index <= step ? 'font-semibold text-green-700' : 'text-slate-400'}><span className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full ${index < step ? 'bg-green-700 text-white' : index === step ? 'border-2 border-green-700' : 'bg-slate-100'}`}>{index < step ? <Check size={15} /> : index + 1}</span>{name}</li>)}</ol>
    {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}{notice && <p className="mb-5 rounded-lg bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {step === 0 && <div className="space-y-5"><h2 className="text-xl font-bold">Account information</h2><Field label="Full name" name="full_name" values={values} onChange={update} required /><p className="text-sm text-slate-500">Signed in as {user.email}. Your verified phone number is kept in your Supabase account.</p></div>}
    {step === 1 && <div className="space-y-5"><h2 className="text-xl font-bold">Business information</h2><Field label="Business name" name="business_name" values={values} onChange={update} required /><Field label="Business email" name="business_email" values={values} onChange={update} type="email" required /><div className="grid gap-5 sm:grid-cols-2"><Field label="PAN number" name="pan_number" values={values} onChange={update} required /><Field label="GST number (optional)" name="gst_number" values={values} onChange={update} /></div></div>}
    {step === 2 && <div className="space-y-5"><h2 className="text-xl font-bold">Store details</h2><div className="grid gap-5 sm:grid-cols-2"><Field label="Store name" name="store_name" values={values} onChange={update} required /><label className="block text-sm font-medium">Store type<select name="store_type" value={values.store_type} onChange={update} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">Select category</option><option>Handmade crafts</option><option>Eco products</option><option>Food</option><option>Fashion</option><option>Wellness</option></select></label><Field label="City" name="city" values={values} onChange={update} required /><Field label="Pincode" name="pincode" values={values} onChange={update} inputMode="numeric" required /></div><label className="block text-sm font-medium">Store description<textarea name="store_description" value={values.store_description || ''} onChange={update} rows="4" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5" /></label></div>}
    {step === 3 && <div className="space-y-5"><h2 className="text-xl font-bold">Bank details</h2><p className="text-sm text-slate-500">Only your authorized verification team can access these details.</p><div className="grid gap-5 sm:grid-cols-2"><Field label="Account holder name" name="account_holder_name" values={values} onChange={update} required /><Field label="Account number" name="account_number" values={values} onChange={update} inputMode="numeric" required /><Field label="IFSC code" name="ifsc_code" values={values} onChange={update} required /><Field label="Bank name" name="bank_name" values={values} onChange={update} required /><Field label="Branch name" name="branch_name" values={values} onChange={update} required /><label className="block text-sm font-medium">Account type<select name="account_type" value={values.account_type} onChange={update} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"><option value="">Select account type</option><option>Savings</option><option>Current</option></select></label></div></div>}
    {step === 4 && <div><h2 className="text-xl font-bold">Upload documents</h2><p className="mb-5 text-sm text-slate-500">PDF, JPG, or PNG only. Maximum 10 MB per file. Files are stored in a private Supabase bucket.</p><div className="grid gap-4 sm:grid-cols-2">{documentTypes.map((item) => { const document = documentByType[item.key]; return <div key={item.key} className="rounded-lg border border-slate-200 p-4"><p className="font-medium">{item.label}{item.required && ' *'}</p>{document ? <div className="mt-3 flex items-center justify-between gap-2 text-sm text-green-700"><span className="flex min-w-0 items-center gap-2 truncate"><FileText size={17} />{document.original_filename}</span><button onClick={() => remove(document)} aria-label={`Remove ${item.label}`} className="text-red-600"><Trash2 size={17} /></button></div> : <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-green-500 bg-green-50 px-3 py-3 text-sm text-green-800 hover:bg-green-100"><Upload size={17} />Upload<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(event) => upload(item.key, event.target.files?.[0])} /></label>}</div>; })}</div></div>}
    {step === 5 && <div className="space-y-7"><div><h2 className="text-3xl font-bold tracking-tight text-slate-950">Overall Review</h2><p className="mt-1 text-slate-600">Please review all your information before submitting for verification.</p></div><div className="grid gap-5 lg:grid-cols-2"><ReviewCard title="Account Information"><Detail label="Full Name" value={values.full_name} /><Detail label="Email" value={user.email} /><Detail label="Phone Number" value={user.phone_number || 'Not provided'} /></ReviewCard><ReviewCard title="Business Information"><Detail label="Business Name" value={values.business_name} /><Detail label="Business Type" value={values.store_type} /><Detail label="GST Number" value={values.gst_number || 'Not provided'} /><Detail label="PAN Number" value={values.pan_number} /></ReviewCard><ReviewCard title="Store Information"><Detail label="Store Name" value={values.store_name} /><Detail label="Store Category" value={values.store_type} /><Detail label="City / Pincode" value={[values.city, values.pincode].filter(Boolean).join(' - ')} /><Detail label="Description" value={values.store_description} /></ReviewCard><ReviewCard title="Bank Information"><Detail label="Account Holder" value={values.account_holder_name} /><Detail label="Account Number" value={values.account_number} /><Detail label="IFSC Code" value={values.ifsc_code} /><Detail label="Bank / Branch" value={[values.bank_name, values.branch_name].filter(Boolean).join(', ')} /></ReviewCard></div><section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-slate-800"><tr><th className="px-5 py-4 font-semibold">Document Name</th><th className="px-5 py-4 font-semibold">File Name</th><th className="px-5 py-4 text-center font-semibold">Priority</th><th className="px-5 py-4 text-center font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Action</th></tr></thead><tbody>{documentTypes.map((item) => { const document = documentByType[item.key]; return <tr key={item.key} className="border-b border-slate-100 last:border-0"><td className="px-5 py-3.5 font-medium text-slate-900">{item.label}</td><td className="max-w-[220px] truncate px-5 py-3.5 text-slate-600">{document?.original_filename || 'Not uploaded'}</td><td className="px-5 py-3.5 text-center">{item.required ? 'High' : 'Optional'}</td><td className="px-5 py-3.5 text-center">{document ? <span className="rounded-md bg-lime-100 px-3 py-1 text-xs font-medium text-green-800">Uploaded</span> : <span className="rounded-md bg-slate-100 px-3 py-1 text-xs text-slate-500">Missing</span>}</td><td className="px-5 py-3.5 text-right"><button onClick={() => setStep(4)} className="font-medium text-green-700 hover:text-green-900">Edit</button></td></tr>; })}</tbody></table></div></section></div>}
    <div className="mt-9 flex justify-end gap-3 border-t pt-5"><button disabled={step === 0 || saving} onClick={() => setStep((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-800 px-8 py-2.5 text-sm font-medium disabled:opacity-40"><ChevronLeft size={16} />Back</button>{step === 5 ? <button disabled={saving} onClick={submit} className="rounded-lg bg-[#ffc107] px-9 py-2.5 text-sm font-semibold text-slate-950 hover:bg-[#e9ae00] disabled:opacity-50">{saving ? 'Saving…' : 'Submit'}</button> : <button disabled={saving} onClick={next} className="rounded-lg bg-[#167321] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save & continue'}</button>}</div>
  </section></main>;
}
