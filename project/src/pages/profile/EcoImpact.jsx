import React from 'react';
import { Leaf, Droplets, TreePine, Award, Zap, Package } from 'lucide-react';
// Mock data for the user's impact
const impactMetrics = {
    plasticSavedGrams: 2450, // 2.45 kg
    waterSavedLiters: 1200,
    co2ReducedKg: 15.5,
    level: 'Earth Champion',
    treesPlantedEquivalent: 2,
};
const recentEcoPurchases = [
    {
        id: '1',
        date: '2023-10-15',
        itemName: 'Bamboo Toothbrush Set',
        impact: 'Saved 150g of plastic',
        icon: Leaf,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    },
    {
        id: '2',
        date: '2023-09-28',
        itemName: 'Organic Cotton Kurta',
        impact: 'Saved 500 liters of water',
        icon: Droplets,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
    },
    {
        id: '3',
        date: '2023-09-10',
        itemName: 'Terracotta Water Dispenser',
        impact: 'Saved 2 kg of plastic bottles',
        icon: TreePine,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
    },
    {
        id: '4',
        date: '2023-08-22',
        itemName: 'Solar Powered Lantern',
        impact: 'Reduced 5 kg of CO2',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
    },
];
export default function EcoImpact() {
    return (<div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#e8f5e9] to-[#c8e6c9] rounded-2xl p-6 shadow-sm border border-[#a5d6a7]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md">
            <Award className="w-8 h-8 text-[#2e7d32]"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1b5e20]">My Eco-Impact</h1>
            <p className="text-[#388e3c] font-medium flex items-center gap-2 mt-1">
              Level: {impactMetrics.level} <Leaf className="w-4 h-4"/>
            </p>
          </div>
        </div>
        <p className="mt-4 text-[#2e7d32] text-sm md:text-base leading-relaxed">
          Thank you for choosing Veda Craft! Every eco-friendly purchase you make helps build a sustainable future. 
          Here is your positive footprint on the planet so far.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Plastic Saved */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-6 h-6 text-green-600"/>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{(impactMetrics.plasticSavedGrams / 1000).toFixed(2)} kg</h3>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Plastic Prevented</p>
          <p className="text-xs text-gray-400 mt-2">By choosing sustainable alternatives</p>
        </div>

        {/* CO2 Reduced */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
            <TreePine className="w-6 h-6 text-emerald-600"/>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{impactMetrics.co2ReducedKg} kg</h3>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">CO₂ Reduced</p>
          <p className="text-xs text-gray-400 mt-2">Equivalent to {impactMetrics.treesPlantedEquivalent} trees planted 🌳</p>
        </div>

        {/* Water Saved */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Droplets className="w-6 h-6 text-blue-600"/>
          </div>
          <h3 className="text-3xl font-bold text-gray-800">{impactMetrics.waterSavedLiters} L</h3>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-wider">Water Saved</p>
          <p className="text-xs text-gray-400 mt-2">Through organic materials & dyes</p>
        </div>
      </div>

      {/* Impact Timeline / Recent Purchases */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-green-600"/> Impact Timeline
          </h2>
          <p className="text-sm text-gray-500 mt-1">Your recent eco-conscious choices</p>
        </div>
        
        <div className="p-6">
          <div className="relative border-l-2 border-green-100 ml-4 space-y-8">
            {recentEcoPurchases.map((purchase) => {
            const Icon = purchase.icon;
            return (<div key={purchase.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border-2 border-white ${purchase.bgColor}`}>
                    <Icon className={`w-4 h-4 ${purchase.color}`}/>
                  </div>
                  
                  {/* Content */}
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{new Date(purchase.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <h4 className="text-md font-bold text-gray-800 mt-1">{purchase.itemName}</h4>
                    <p className={`text-sm font-medium mt-1 ${purchase.color}`}>{purchase.impact}</p>
                  </div>
                </div>);
        })}
          </div>
        </div>
      </div>

    </div>);
}
