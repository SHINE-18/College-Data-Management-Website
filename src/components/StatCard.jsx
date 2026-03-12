const StatCard = ({ icon, label, value, color = 'bg-accent' }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 group relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full"></div>
        <div className="flex items-center space-x-4 relative z-10">
            <div className={`${color} w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                </svg>
            </div>
            <div>
                <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
            </div>
        </div>
    </div>
);

export default StatCard;
