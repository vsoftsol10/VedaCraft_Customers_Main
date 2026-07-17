export default function VedhaLogo({ variant = 'default', className = '' }) {
    const textColor = variant === 'footer' ? '#ffffff' : '#166534';
    const craftColor = '#f59e0b';
    return (<div className={`flex items-center gap-2 ${className}`}>
      {/* Hexagonal icon */}
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Hexagon outline */}
        <path d="M22 3 L38 12 L38 32 L22 41 L6 32 L6 12 Z" stroke="url(#hexGrad)" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>
        {/* V checkmark shape */}
        <path d="M11 16 L16 25 L22 15" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        {/* Leaf */}
        <path d="M26 8 Q32 6 33 12 Q30 18 26 16 Q24 12 26 8Z" fill="#22c55e"/>
        <path d="M27 8 Q30 12 28 16" stroke="#16a34a" strokeWidth="0.8" fill="none"/>
        <defs>
          <linearGradient id="hexGrad" x1="6" y1="3" x2="38" y2="41" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b"/>
            <stop offset="1" stopColor="#22c55e"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className="font-bold text-lg" style={{ color: textColor, fontFamily: 'Inter, sans-serif' }}>
          <span style={{ color: '#f59e0b' }}>V</span>eda
        </span>
        <span className="font-semibold text-sm" style={{ color: craftColor }}>
          craft.
        </span>
      </div>
    </div>);
}
