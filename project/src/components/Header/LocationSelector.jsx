import { useState } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LocationSelectorModal from './LocationSelectorModal';
export default function LocationSelector() {
    const { selectedLocation } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const isDetecting = selectedLocation.text === 'Detecting...';
    return (<>
      <div onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 cursor-pointer group min-w-[150px] hover:bg-gray-50/50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
        <MapPin className="w-5 h-5 text-green-600 flex-shrink-0 group-hover:scale-105 transition-transform"/>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Deliver to</span>
          <div className="flex items-center gap-0.5">
            {isDetecting ? (<div className="flex items-center gap-1">
                <Loader2 className="w-3 h-3 text-green-600 animate-spin"/>
                <span className="text-xs text-green-600 font-bold">Detecting...</span>
              </div>) : (<>
                <span className="text-xs text-gray-800 font-bold truncate max-w-[120px]" title={selectedLocation.text}>
                  {selectedLocation.text}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 flex-shrink-0"/>
              </>)}
          </div>
        </div>
      </div>

      <LocationSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}/>
    </>);
}
