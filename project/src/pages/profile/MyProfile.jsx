import { useState, useRef, useEffect } from 'react';
import { Pencil, Save, X, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';
// Empty initial profile data
const initialProfileData = {
    fullName: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    location: '',
};
function FormField({ label, value, onChange, disabled, type = 'text', placeholder, }) {
    return (<div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder={placeholder ?? label} className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors outline-none
          ${disabled
            ? 'bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed'
            : 'bg-white border-[#c8b97a] text-gray-900 focus:ring-2 focus:ring-[#2d6a2d]/30 focus:border-[#2d6a2d]'}`}/>
    </div>);
}
export default function MyProfile() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const isEmail = user?.email?.includes('@');
    const [formData, setFormData] = useState({
        ...initialProfileData,
        fullName: user?.name && user.name !== user?.email && !user.name.includes('@') ? user.name : '',
        email: isEmail ? user?.email || '' : '',
        phone: user?.phone_number || (!isEmail ? user?.email || '' : ''),
        gender: user?.gender || '',
        dateOfBirth: user?.dob || '',
    });
    const [draft, setDraft] = useState(formData);
    const [isEditing, setIsEditing] = useState(false);
    const [profilePhoto, setProfilePhoto] = useState(user?.avatar_url || null);
    const fileInputRef = useRef(null);
    // Sync state if user context updates after component mount
    useEffect(() => {
        if (user) {
            const isEmail = user?.email?.includes('@');
            const newFormData = {
                fullName: user?.name && user.name !== user?.email && !user.name.includes('@') ? user.name : '',
                email: isEmail ? user?.email || '' : '',
                phone: user?.phone_number || (!isEmail ? user?.email || '' : ''),
                gender: user?.gender || '',
                dateOfBirth: user?.dob || '',
                location: formData.location || '',
            };
            setFormData(newFormData);
            setDraft(newFormData);
            setProfilePhoto(user?.avatar_url || null);
        }
    }, [user]);
    const handleEdit = () => {
        setDraft({ ...formData });
        setIsEditing(true);
    };
    const handleSave = async () => {
        if (!user) {
            setFormData({ ...draft });
            setIsEditing(false);
            return;
        }
        try {
            const { error } = await supabase.from('profiles').upsert({
                id: user.id,
                full_name: draft.fullName,
                phone_number: draft.phone,
                gender: draft.gender,
                dob: draft.dateOfBirth,
                avatar_url: profilePhoto,
                updated_at: new Date().toISOString(),
            });
            if (error)
                throw error;
            const updatedUser = {
                ...user,
                name: draft.fullName,
                phone_number: draft.phone,
                gender: draft.gender,
                dob: draft.dateOfBirth,
                avatar_url: profilePhoto || user.avatar_url || '',
            };
            localStorage.setItem('vc_user', JSON.stringify(updatedUser));
            setFormData({ ...draft });
            setIsEditing(false);
        }
        catch (err) {
            console.error('Error updating profile', err);
            setIsEditing(false);
        }
    };
    const handleAvatarUpload = async (file) => {
        if (!user)
            return;
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}-${Math.random()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file, { upsert: true });
            if (uploadError) {
                alert(t('profile.uploadFailed'));
                throw uploadError;
            }
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName);
            // Save to database
            const { error: dbError } = await supabase.from('profiles').upsert({
                id: user.id,
                avatar_url: publicUrl,
                updated_at: new Date().toISOString()
            });
            if (dbError)
                throw dbError;
            setProfilePhoto(publicUrl);
            // Update local storage
            const saved = localStorage.getItem('vc_user');
            if (saved) {
                const parsed = JSON.parse(saved);
                parsed.avatar_url = publicUrl;
                localStorage.setItem('vc_user', JSON.stringify(parsed));
            }
            alert(t('profile.photoUpdated'));
        }
        catch (err) {
            console.error("Error uploading avatar", err);
        }
    };
    const handleCancel = () => {
        setDraft({ ...formData });
        setIsEditing(false);
    };
    const update = (field) => (val) => setDraft((prev) => ({ ...prev, [field]: val }));
    return (<div className="flex flex-col gap-4">
      {/* ── Profile Header Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a8c57a] to-[#2d6a2d]
                          flex items-center justify-center text-white text-3xl font-bold
                          shadow-md select-none overflow-hidden">
              {profilePhoto ? (<img src={profilePhoto} alt="Profile" className="w-full h-full object-cover"/>) : (formData.fullName
            ? formData.fullName.charAt(0).toUpperCase()
            : (formData.email || formData.phone || 'U').charAt(0).toUpperCase())}
            </div>
            {/* Hidden file input */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
                // Show preview immediately
                const reader = new FileReader();
                reader.onload = (ev) => {
                    setProfilePhoto(ev.target?.result);
                };
                reader.readAsDataURL(file);
                // Trigger upload
                handleAvatarUpload(file);
            }
            // Reset so same file can be re-selected
            e.target.value = '';
        }}/>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 w-6 h-6 bg-white border border-gray-200
                         rounded-full flex items-center justify-center shadow-sm
                         hover:bg-gray-50 transition-colors" title={t('profile.changePhoto')}>
              <Camera className="w-3.5 h-3.5 text-gray-500"/>
            </button>
          </div>


          {/* Info */}
          <div>
            <h2 className="text-xl font-bold text-gray-900">{formData.fullName}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{formData.email}</p>
            <p className="text-sm text-gray-500">{formData.phone}</p>
          </div>
        </div>
      </div>

      {/* ── Personal Information Card ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-gray-900">{t('profile.personalInfo')}</h3>

          {!isEditing ? (<button onClick={handleEdit} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-[#c8b97a]
                         bg-[#fdf8ec] text-[#8a6a00] text-sm font-medium
                         hover:bg-[#f5efd5] transition-colors">
              <Pencil className="w-3.5 h-3.5"/>
              {t('profile.edit')}
            </button>) : (<div className="flex gap-2">
              <button onClick={handleCancel} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md border border-gray-300
                           bg-white text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                <X className="w-3.5 h-3.5"/>
                {t('profile.cancel')}
              </button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-1.5 rounded-md
                           bg-[#2d6a2d] text-white text-sm font-medium
                           hover:bg-[#1e5a1e] transition-colors">
                <Save className="w-3.5 h-3.5"/>
                {t('profile.save')}
              </button>
            </div>)}
        </div>

        {/* Fields grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label={t('profile.fullName')} value={draft.fullName} onChange={update('fullName')} disabled={!isEditing}/>
          <FormField label={t('profile.email')} value={draft.email} onChange={update('email')} disabled={!isEditing} type="email"/>
          <FormField label={t('profile.phone')} value={draft.phone} onChange={update('phone')} disabled={!isEditing} type="tel"/>
          <FormField label={t('profile.gender')} value={draft.gender} onChange={update('gender')} disabled={!isEditing}/>
          <FormField label={t('profile.dateOfBirth')} value={draft.dateOfBirth} onChange={update('dateOfBirth')} disabled={!isEditing} type="date"/>
          
        </div>
      </div>
    </div>);
}
