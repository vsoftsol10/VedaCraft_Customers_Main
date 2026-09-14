import { supabase } from '../lib/supabase';

export const SELLER_DOCUMENTS_BUCKET = 'seller-verification-documents';

export const documentTypes = [
  { key: 'pan_card', label: 'PAN Card', required: true },
  { key: 'business_registration', label: 'Business registration / proof', required: true },
  { key: 'gst_certificate', label: 'GST certificate', required: false },
  { key: 'mfc_certificate', label: 'MFC / certification document', required: true },
  { key: 'bank_account_proof', label: 'Bank account proof', required: true },
  { key: 'supporting_document', label: 'Other supporting document', required: false },
];

export async function getSellerApplication(userId) {
  const { data: application, error } = await supabase
    .from('seller_applications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!application) return null;

  // Query documents explicitly instead of embedding the relationship. This avoids
  // PostgREST schema-cache errors immediately after a migration is run.
  const { data: documents, error: documentsError } = await supabase
    .from('seller_documents')
    .select('*')
    .eq('seller_application_id', application.id)
    .order('created_at');
  if (documentsError) throw new Error(documentsError.message);
  return { ...application, seller_documents: documents || [] };
}

export async function saveSellerApplication(userId, values) {
  // Documents are stored in their own table. Never send a UI-only document list
  // to seller_applications, otherwise PostgREST treats it as a missing column.
  const { seller_documents: _sellerDocuments, id: _id, user_id: _userId, created_at: _createdAt, ...applicationValues } = values;
  const { data, error } = await supabase
    .from('seller_applications')
    .upsert({ user_id: userId, ...applicationValues, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadSellerDocument(userId, applicationId, type, file) {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) throw new Error('Only PDF, JPG, and PNG files are allowed.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Each document must be 10 MB or smaller.');

  const extension = file.name.split('.').pop()?.toLowerCase() || 'file';
  const path = `${userId}/${type}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(SELLER_DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await supabase
    .from('seller_documents')
    .upsert({
      seller_application_id: applicationId,
      user_id: userId,
      document_type: type,
      storage_path: path,
      original_filename: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    }, { onConflict: 'seller_application_id,document_type' })
    .select()
    .single();
  if (error) {
    await supabase.storage.from(SELLER_DOCUMENTS_BUCKET).remove([path]);
    throw new Error(error.message);
  }
  return data;
}

export async function deleteSellerDocument(document) {
  const { error } = await supabase.storage.from(SELLER_DOCUMENTS_BUCKET).remove([document.storage_path]);
  if (error) throw new Error(error.message);
  const { error: recordError } = await supabase.from('seller_documents').delete().eq('id', document.id);
  if (recordError) throw new Error(recordError.message);
}
