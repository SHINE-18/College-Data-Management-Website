// Real GTU Circulars — Scraped from gtu.ac.in on 09-Mar-2026
const gtuCirculars = [
    { text: 'GTU — Result Declaration: BE Sem-1 Regular (Winter 2025)', date: '07-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/BE%20Sem%20-%201%20Reg._103971.pdf' },
    { text: 'GTU — Result Declaration: BE Sem-1 Remedial (Winter 2025)', date: '07-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/BE%20Sem%20-%201%20Rem._270688.pdf' },
    { text: 'GTU — Result Declaration: BE Sem-2 Remedial (Winter 2025)', date: '07-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/BE%20Sem%20-%202%20Rem._981386.pdf' },
    { text: 'GTU — International Experience Program (IEP) 2026 for CSE/IT/MCA Students — Last Date: 07-Apr-2026', date: '07-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/Announcement%20of%20International%20Experience%20Program%20(IEP)%202026%20at%20Australian%20Institute%20of%20Advanced%20Technologies%20for%20the%20Students%20of%20sem%206%20Computer,IT,ICT%20and%20sem%202%20MCA_772342.pdf' },
    { text: 'GTU — Result: Diploma Engineering Sem-5 Recheck/Reassessment (Winter 2025)', date: '07-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/20260307204307_619559.pdf' },
    { text: 'GTU — Summer 2026 Exam Forms: M.Pharm Sem-4 (Regular Students)', date: '06-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/MP4-REG-EF-S26_185841.pdf' },
    { text: 'GTU — Online Marks Entry Guidelines: ME Sem-3 & 4 Internal Review I & II (Summer 2026)', date: '06-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/20260306_14175163_208034.pdf' },
    { text: 'GTU — Result: Diploma in Vocation Sem-1 Remedial Recheck (Winter 2025)', date: '06-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/20260306155135_751996.pdf' },
    { text: 'GTU — Result: BE NCC Sem-3 Regular (Winter 2025)', date: '03-Mar-2026', pdf: 'https://s3-ap-southeast-1.amazonaws.com/gtusitecirculars/uploads/BE%20NCC%20Sem%20-%203%20Reg._673544.pdf' },
];

const AnnouncementTicker = () => (
    <div className="bg-primary-700 text-white overflow-hidden">
        <div className="max-w-9xl sm:px-6 lg:px-8 flex items-center h-9">
            <a
                href="https://www.gtu.ac.in/Circular.aspx"
                target="_blank"
                rel="noreferrer"
                className="font-heading font-bold text-sm uppercase tracking-wider mr-4 whitespace-nowrap bg-primary-900 px-3 py-1 rounded shrink-0 hover:bg-primary-800 transition"
            >
                GTU Circulars
            </a>
            <div className="overflow-hidden flex-1">
                <div className="animate-marquee whitespace-nowrap">
                    {gtuCirculars.map((c, i) => (
                        <a
                            key={i}
                            href={c.pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm mx-8 hover:text-primary-200 transition inline-block"
                        >
                            <span className="text-primary-300 mr-2">▸</span>
                            {c.text}
                            <span className="text-primary-400 ml-2 text-xs">({c.date})</span>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export default AnnouncementTicker;
