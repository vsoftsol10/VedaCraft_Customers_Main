import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const toPoints = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value !== 'string' || !value.trim()) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [String(parsed)];
    }
    catch {
        return [value.trim()];
    }
};

export default function ProductTabs({ description, howToUse, coreInstructions, }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('Description');
    const tabs = [
        { id: 'Description', label: t('productTabs.description', 'Description') },
        { id: 'How to Use', label: t('productTabs.howToUse', 'How to Use') },
        { id: 'Core instructions', label: t('productTabs.coreInstructions', 'Core instructions') },
    ];
    return (<div className="mt-8">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`py-3 px-6 text-sm font-medium transition-colors relative ${activeTab === tab.id
                ? 'text-green-700'
                : 'text-gray-500 hover:text-gray-700'}`}>
            {tab.label}
            {activeTab === tab.id && (<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-green-700"/>)}
          </button>))}
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'Description' && (<div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </div>)}
        {activeTab === 'How to Use' && (<Points items={toPoints(howToUse)} />)}
        {activeTab === 'Core instructions' && (<Points items={toPoints(coreInstructions)} />)}
      </div>
    </div>);
}

function Points({ items }) {
    const { t } = useTranslation();
    if (items.length === 0) return <p className="text-sm text-gray-500">{t('productTabs.noInstructions', 'No instructions available.')}</p>;
    return <ul className="space-y-3 text-sm leading-relaxed text-gray-700">
      {items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />{item}</li>)}
    </ul>;
}
