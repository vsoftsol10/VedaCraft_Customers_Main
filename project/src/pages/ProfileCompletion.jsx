import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Phone, Calendar, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import bgImg from '../assets/products/login_eco_bg.png';
import logoImg from '../assets/products/WhatsApp_Image_2026-06-19_at_11.31.57_AM.jpeg';
import { useTranslation } from 'react-i18next';
export default function ProfileCompletion() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';
    const [formData, setFormData] = useState({
        fullName: user?.name || '',
        phoneNumber: user?.phone_number || '',
        gender: user?.gender || '',
        dob: user?.dob || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // If already complete, redirect to home
    useEffect(() => {
        if (user && user.is_profile_complete) {
            navigate(redirect, { replace: true });
        }
    }, [user, navigate, redirect]);
    // Sync user data if context updates
    useEffect(() => {
        if (user && !formData.fullName) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name,
                phoneNumber: user.phone_number || prev.phoneNumber,
            }));
        }
    }, [user]);
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError(t('profileCompletion.noSession'));
            return;
        }
        if (!formData.fullName || !formData.phoneNumber) {
            setError(t('profileCompletion.requiredFields'));
            return;
        }
        const isNum = /^\d{10}$/.test(formData.phoneNumber);
        if (!isNum) {
            setError(t('profileCompletion.invalidPhone'));
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .upsert({
                id: user.id,
                full_name: formData.fullName,
                phone_number: formData.phoneNumber,
                gender: formData.gender,
                dob: formData.dob,
                is_profile_complete: true,
                updated_at: new Date().toISOString()
            });
            if (updateError)
                throw updateError;
            // The AuthContext onAuthStateChange doesn't fire on custom table updates,
            // so we manually refresh the session to trigger AuthContext or just let it reload.
            // Easiest is to force a reload so AuthContext fetches the new profile.
            window.location.href = redirect;
        }
        catch (err) {
            console.error(err);
            setError(err.message || t('profileCompletion.saveError'));
            setLoading(false);
        }
    };
    if (!user) {
        return null; // Will be handled by the ProfileGuard or redirect to login
    }
    return (<div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row relative overflow-hidden">
      
      {/* Desktop Left Section */}
      <div className="hidden lg:block w-1/2 relative bg-gray-50 overflow-hidden">
        <img src={bgImg} alt="Eco Friendly" className="w-full h-full object-cover"/>
      </div>

      {/* Mobile Top Banner */}
      <div className="lg:hidden w-full relative overflow-hidden" style={{ height: '150px' }}>
        <img src={bgImg} alt="Eco Friendly" className="w-full h-full object-cover object-center"/>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative z-10">
        
        <div className="w-full max-w-[420px] bg-white p-2 relative z-10">
          
          <div className="flex justify-center mb-6">
            <img src={logoImg} alt="Veda Craft" className="h-20 object-contain"/>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-[22px] font-bold text-gray-900 mb-1.5">{t('profileCompletion.title')}</h2>
            <p className="text-[13px] text-gray-500">{t('profileCompletion.subtitle')}</p>
          </div>

          {error && (<div className="mb-6 p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100">
              {error}
            </div>)}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">{t('profile.fullName')} *</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-[#346b3f] focus-within:ring-1 focus-within:ring-[#346b3f] transition-all">
                <div className="pl-4 pr-2 text-gray-400">
                  <User className="w-4 h-4"/>
                </div>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" className="w-full py-3 pr-4 text-[13px] focus:outline-none text-gray-800" required/>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">{t('address.phoneNumber')} *</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-[#346b3f] focus-within:ring-1 focus-within:ring-[#346b3f] transition-all">
                <div className="pl-4 pr-2 text-gray-400">
                  <Phone className="w-4 h-4"/>
                </div>
                <div className="px-2 border-r border-gray-200 text-gray-800 text-[13px] font-bold">
                  +91
                </div>
                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="9876543210" className="w-full py-3 px-3 text-[13px] focus:outline-none text-gray-800" required/>
              </div>
            </div>

            {/* Gender (Optional) */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">{t('profileCompletion.genderOptional')}</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-[#346b3f] focus-within:ring-1 focus-within:ring-[#346b3f] transition-all">
                <div className="pl-4 pr-2 text-gray-400">
                  <Users className="w-4 h-4"/>
                </div>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full py-3 pr-4 text-[13px] focus:outline-none text-gray-800 bg-transparent">
                  <option value="">{t('profileCompletion.selectGender')}</option>
                  <option value="Male">{t('profileCompletion.genderMale')}</option>
                  <option value="Female">{t('profileCompletion.genderFemale')}</option>
                  <option value="Other">{t('profileCompletion.genderOther')}</option>
                </select>
              </div>
            </div>

            {/* Date of Birth (Optional) */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-2">{t('profileCompletion.dobOptional')}</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white focus-within:border-[#346b3f] focus-within:ring-1 focus-within:ring-[#346b3f] transition-all">
                <div className="pl-4 pr-2 text-gray-400">
                  <Calendar className="w-4 h-4"/>
                </div>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full py-3 pr-4 text-[13px] focus:outline-none text-gray-800"/>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full bg-[#346b3f] hover:bg-[#285331] text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm text-sm mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading ? t('profileCompletion.saving') : t('profileCompletion.completeProfile')} <ChevronRight className="w-4 h-4"/>
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-4 text-[12px] text-gray-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#346b3f]"/> {t('profileCompletion.securePrivate')}
            </span>
          </div>

        </div>
      </div>
    </div>);
}
