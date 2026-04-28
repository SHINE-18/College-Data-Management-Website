const WorkloadSheet = () => (
    <div className="animate-fade-in space-y-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Workload Sheet</h1>
            <p className="text-gray-500 text-sm mt-1">Your current teaching workload and syllabus coverage.</p>
        </div>

        <div className="bg-white rounded-2xl border border-dashed border-gray-200 shadow-sm p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-primary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Workload Tracking Coming Soon</h2>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
                Automated workload tracking with subject-wise syllabus coverage and lecture counts
                will be available in a future update. Contact your HOD for manual workload sheets.
            </p>
            <span className="mt-6 inline-block bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                In Development
            </span>
        </div>
    </div>
);

export default WorkloadSheet;
