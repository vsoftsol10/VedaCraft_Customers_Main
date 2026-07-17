import { useState } from 'react';
export default function ProductTabs({ description, howToUse, coreInstructions, }) {
    const [activeTab, setActiveTab] = useState('Description');
    const tabs = ['Description', 'How to Use', 'Core instructions'];
    return (<div className="mt-8">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (<button key={tab} onClick={() => setActiveTab(tab)} className={`py-3 px-6 text-sm font-medium transition-colors relative ${activeTab === tab
                ? 'text-green-700'
                : 'text-gray-500 hover:text-gray-700'}`}>
            {tab}
            {activeTab === tab && (<span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-green-700"/>)}
          </button>))}
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'Description' && (<div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </div>)}
        {activeTab === 'How to Use' && (<div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {howToUse}
          </div>)}
        {activeTab === 'Core instructions' && (<div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {coreInstructions}
          </div>)}
      </div>
    </div>);
}
