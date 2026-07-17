import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const steps = [
    { key: 'checkout.stepAddress', number: 1 },
    { key: 'checkout.stepOrderSummary', number: 2 },
    { key: 'checkout.stepPayment', number: 3 },
];
export default function CheckoutStepper({ currentStep, onStepClick }) {
    const { t } = useTranslation();
    return (<div className="bg-white border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (<div key={step.number} className="flex items-center">
            {/* Step circle + label */}
            <button onClick={() => {
                // Only allow clicking completed steps (going backward)
                if (step.number < currentStep) {
                    onStepClick(step.number);
                }
            }} className={`flex flex-col items-center gap-2 group ${step.number < currentStep ? 'cursor-pointer' : 'cursor-default'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${step.number < currentStep
                ? 'bg-green-600 text-white shadow-md shadow-green-200'
                : step.number === currentStep
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200 ring-4 ring-green-100'
                    : 'bg-gray-200 text-gray-500'}`}>
                {step.number < currentStep ? (<Check className="w-5 h-5"/>) : (step.number)}
              </div>
              <span className={`text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${step.number <= currentStep
                ? 'text-green-700'
                : 'text-gray-400'} ${step.number < currentStep ? 'group-hover:text-green-500' : ''}`}>
                {t(step.key)}
              </span>
            </button>

            {/* Connector line */}
            {index < steps.length - 1 && (<div className="w-16 sm:w-24 md:w-32 h-[2px] mx-2 sm:mx-4 mb-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-200 rounded-full"/>
                <div className={`absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all duration-500 ease-out ${step.number < currentStep ? 'w-full' : 'w-0'}`}/>
              </div>)}
          </div>))}
      </div>
    </div>);
}
