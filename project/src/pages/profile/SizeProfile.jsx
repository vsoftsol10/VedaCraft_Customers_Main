import React, { useState, useEffect } from 'react';
import { Ruler, Shirt, Scissors, Save, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
export default function SizeProfile() {
    const { t } = useTranslation();
    const [unit, setUnit] = useState('in');
    
    const [saved, setSaved] = useState(false);
    const [sizes, setSizes] = useState({
        gender: 'Men',
        topSize: 'M',
        bottomSize: '32',
    });
    const [measurements, setMeasurements] = useState({
        shoulder: '17',
        chest: '38',
        waist: '32',
        hips: '39',
    });
    const { user, refreshProfile } = useAuth();


useEffect(() => {
    if (!user) return;

    setUnit(user.measurement_unit || "in");

    setSizes({
        gender: user.gender || "Men",
        topSize: user.top_size || "M",
        bottomSize: user.bottom_size || "32",
    });

    setMeasurements({
        shoulder: user.shoulder || "",
        chest: user.chest || "",
        waist: user.waist || "",
        hips: user.hips || "",
    });
}, [user]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!user) return;

    const { error } = await supabase
        .from("profiles")
        .update({
            gender: sizes.gender,
            top_size: sizes.topSize,
            bottom_size: sizes.bottomSize,
            measurement_unit: unit,
            shoulder: Number(measurements.shoulder),
            chest: Number(measurements.chest),
            waist: Number(measurements.waist),
            hips: Number(measurements.hips),
            updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

    if (error) {
        console.error(error);
        return;
    }

    // Refresh the user data in AuthContext
    if (refreshProfile) {
        await refreshProfile();
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
};
    return (<div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-green-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
            <Ruler className="w-8 h-8 text-green-600"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{t('sizeProfile.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('sizeProfile.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Standard Sizes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Shirt className="w-5 h-5 text-green-600"/> {t('sizeProfile.standardSizes')}
            </h2>
            
            {/* Gender Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button type="button" onClick={() => setSizes({ ...sizes, gender: 'Men' })} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sizes.gender === 'Men' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {t('sizeProfile.men')}
              </button>
              <button type="button" onClick={() => setSizes({ ...sizes, gender: 'Women' })} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${sizes.gender === 'Women' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {t('sizeProfile.women')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sizeProfile.standardTopSize')}</label>
              <select value={sizes.topSize} onChange={(e) => setSizes({ ...sizes, topSize: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                <option value="XS">XS (Extra Small)</option>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
                <option value="XL">XL (Extra Large)</option>
                <option value="XXL">XXL (Double XL)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sizeProfile.standardBottomSize')}</label>
              <select value={sizes.bottomSize} onChange={(e) => setSizes({ ...sizes, bottomSize: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all">
                <option value="28">28</option>
                <option value="30">30</option>
                <option value="32">32</option>
                <option value="34">34</option>
                <option value="36">36</option>
                <option value="38">38</option>
                <option value="40">40</option>
              </select>
            </div>
          </div>
        </div>

        {/* Exact Measurements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-green-600"/> {t('sizeProfile.exactMeasurements')}
            </h2>
            
            {/* Unit Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-lg">
              <button type="button" onClick={() => setUnit('in')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${unit === 'in' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {t('sizeProfile.inches')}
              </button>
              <button type="button" onClick={() => setUnit('cm')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${unit === 'cm' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>
                {t('sizeProfile.centimeters')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Shoulder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sizeProfile.shoulder')}</label>
              <div className="relative">
                <input type="number" step="0.1" value={measurements.shoulder} onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all pr-12" placeholder="e.g. 17"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{unit}</span>
              </div>
            </div>

            {/* Chest */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sizeProfile.chestBust')}</label>
              <div className="relative">
                <input type="number" step="0.1" value={measurements.chest} onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all pr-12" placeholder="e.g. 38"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{unit}</span>
              </div>
            </div>

            {/* Waist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sizeProfile.waist')}</label>
              <div className="relative">
                <input type="number" step="0.1" value={measurements.waist} onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all pr-12" placeholder="e.g. 32"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{unit}</span>
              </div>
            </div>

            {/* Hips */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('sizeProfile.hips')}</label>
              <div className="relative">
                <input type="number" step="0.1" value={measurements.hips} onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all pr-12" placeholder="e.g. 39"/>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">{unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {saved && (<span className="text-green-600 font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-5 h-5"/> {t('sizeProfile.savedSuccessfully')}
            </span>)}
          <button type="submit" className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
            <Save className="w-5 h-5"/> {t('sizeProfile.saveProfile')}
          </button>
        </div>
      </form>

    </div>);
}
