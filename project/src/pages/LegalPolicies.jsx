// import { useEffect, useState } from 'react';
// import { Box, Bell, HelpCircle, MapPin } from 'lucide-react';
// import { useSearchParams } from 'react-router-dom';
// import { supabase } from '../lib/supabase';

// const POLICY_TABS = [
//   { type: 'terms_conditions', label: 'Terms & Conditions', icon: Box },
//   { type: 'privacy_policy', label: 'Privacy & Policy', icon: MapPin },
//   { type: 'cancellation_refund', label: 'Cancellation & Refund', icon: Bell },
//   { type: 'shipping_policy', label: 'Shipping Policy', icon: HelpCircle },
// ];

// const PAGE_TITLES = {
//   terms_conditions: 'Terms & Conditions',
//   privacy_policy: 'Privacy Policy',
//   shipping_policy: 'Shipping Policy',
//   cancellation_refund: 'Cancellation & Refund',
// };

// export default function LegalPolicies() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const requestedPolicy = searchParams.get('policy');
//   const initialPolicy = POLICY_TABS.some((tab) => tab.type === requestedPolicy)
//     ? requestedPolicy
//     : 'terms_conditions';
//   const [activeType, setActiveType] = useState(initialPolicy);
//   const [sections, setSections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (POLICY_TABS.some((tab) => tab.type === requestedPolicy)) {
//       setActiveType(requestedPolicy);
//     }
//   }, [requestedPolicy]);

//   const handleSelectPolicy = (type) => {
//     setActiveType(type);
//     setSearchParams({ policy: type });
//   };

//   useEffect(() => {
//     let cancelled = false;

//     const fetchPolicy = async () => {
//       setLoading(true);
//       const { data, error } = await supabase
//         .from('legal_policies')
//         .select('id, section_order, section_title, section_body')
//         .eq('policy_type', activeType)
//         .order('section_order', { ascending: true });

//       if (!cancelled) {
//         if (error) {
//           console.error('Failed to load policy:', error);
//           setSections([]);
//         } else {
//           setSections(data || []);
//         }
//         setLoading(false);
//       }
//     };

//     fetchPolicy();
//     return () => {
//       cancelled = true;
//     };
//   }, [activeType]);

//   return (
//     <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
//       <div className="flex flex-col gap-5 md:flex-row md:items-start">
//       {/* Sidebar */}
//       <aside className="w-full md:w-[292px] flex-shrink-0">
//         <h2 className="mb-4 text-xl font-bold text-gray-950">Legal &amp; Policies</h2>
//         <div className="bg-white rounded border border-gray-200 px-2 py-3">
//           {POLICY_TABS.map((tab) => {
//             const Icon = tab.icon;
//             const isActive = tab.type === activeType;
//             return (
//               <button
//                 key={tab.type}
//                 onClick={() => handleSelectPolicy(tab.type)}
//                 className={`w-full flex items-center gap-3 rounded px-3 py-3.5 text-left text-base transition-colors
//                   ${isActive
//                     ? 'bg-green-50 text-gray-950 ring-2 ring-green-500'
//                     : 'text-gray-950 hover:bg-gray-50'}`}
//               >
//                 <Icon className="h-4 w-4 flex-shrink-0 stroke-[1.8]" />
//                 <span>{tab.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       </aside>

//       {/* Content */}
//       <main className="min-h-[620px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-4 md:min-h-[680px]">
//         <h1 className="mb-6 text-xl font-bold text-gray-950">{PAGE_TITLES[activeType]}</h1>

//         {loading ? (
//           <p className="text-sm text-gray-400">Loading...</p>
//         ) : sections.length === 0 ? (
//           <p className="text-sm text-gray-400">No content available yet.</p>
//         ) : (
//           <div className="divide-y divide-gray-300">
//             {sections.map((s) => (
//               <section key={s.id} className="py-4 first:pt-0">
//                 <h2 className="mb-5 text-xl font-bold text-gray-950">
//                   {s.section_order}. {s.section_title}
//                 </h2>
//                 <p className="text-[14px] leading-snug text-gray-950">{s.section_body}</p>
//               </section>
//             ))}
//           </div>
//         )}
//       </main>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Box, Bell, HelpCircle, MapPin } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const POLICY_TABS = [
  { type: 'terms_conditions', label: 'Terms & Conditions', icon: Box },
  { type: 'privacy_policy', label: 'Privacy & Policy', icon: MapPin },
  { type: 'cancellation_refund', label: 'Cancellation & Refund', icon: Bell },
  { type: 'shipping_policy', label: 'Shipping Policy', icon: HelpCircle },
];

const PAGE_TITLES = {
  terms_conditions: 'Terms & Conditions',
  privacy_policy: 'Privacy Policy',
  shipping_policy: 'Shipping Policy',
  cancellation_refund: 'Cancellation & Refund',
};

export default function LegalPolicies() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedPolicy = searchParams.get('policy');
  const initialPolicy = POLICY_TABS.some((tab) => tab.type === requestedPolicy)
    ? requestedPolicy
    : 'terms_conditions';
  const [activeType, setActiveType] = useState(initialPolicy);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (POLICY_TABS.some((tab) => tab.type === requestedPolicy)) {
      setActiveType(requestedPolicy);
    }
  }, [requestedPolicy]);

  const handleSelectPolicy = (type) => {
    setActiveType(type);
    setSearchParams({ policy: type });
  };

  useEffect(() => {
    let cancelled = false;

    const fetchPolicy = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('legal_policies')
        .select('id, section_order, section_title, section_body')
        .eq('policy_type', activeType)
        .order('section_order', { ascending: true });

      if (!cancelled) {
        if (error) {
          console.error('Failed to load policy:', error);
          setSections([]);
        } else {
          setSections(data || []);
        }
        setLoading(false);
      }
    };

    fetchPolicy();
    return () => {
      cancelled = true;
    };
  }, [activeType]);

  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-5 md:flex-row md:items-start">
      {/* Sidebar */}
      <aside className="w-full md:w-[292px] flex-shrink-0">
        <h2 className="mb-3 text-lg font-bold text-gray-950">Legal &amp; Policies</h2>
        <div className="bg-white rounded border border-gray-200 px-2 py-2">
          {POLICY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.type === activeType;
            return (
              <button
                key={tab.type}
                onClick={() => handleSelectPolicy(tab.type)}
                className={`w-full flex items-center gap-2.5 rounded px-3 py-2.5 text-left text-sm transition-colors
                  ${isActive
                    ? 'bg-green-50 text-gray-950 ring-2 ring-green-500'
                    : 'text-gray-950 hover:bg-gray-50'}`}
              >
                <Icon className="h-3.5 w-3.5 flex-shrink-0 stroke-[1.8]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Content */}
      <main className="min-h-[320px] flex-1 rounded-lg border border-gray-300 bg-white px-4 py-4">
        <h1 className="mb-4 text-lg font-bold text-gray-950">{PAGE_TITLES[activeType]}</h1>

        {loading ? (
          <p className="text-xs text-gray-400">Loading...</p>
        ) : sections.length === 0 ? (
          <p className="text-xs text-gray-400">No content available yet.</p>
        ) : (
          <div className="divide-y divide-gray-200">
            {sections.map((s) => (
              <section key={s.id} className="py-3.5 first:pt-0">
                <h2 className="mb-1.5 text-sm font-bold text-gray-950">
                  {s.section_order}. {s.section_title}
                </h2>
                <p className="text-xs leading-relaxed text-gray-600">{s.section_body}</p>
              </section>
            ))}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}