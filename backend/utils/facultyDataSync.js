const Faculty = require('../models/Faculty');
const Publication = require('../models/Publication');
const Qualification = require('../models/Qualification');
const Achievement = require('../models/Achievement');

const resolveFacultyProfileId = async (user) => {
    if (user?.facultyId) {
        return user.facultyId;
    }

    if (!user?.email) {
        return null;
    }

    const faculty = await Faculty.findOne({ email: user.email }).select('_id');
    return faculty?._id || null;
};

const syncPublicationSummary = async (facultyId) => {
    const publications = await Publication.find({ facultyId }).sort({ publicationDate: -1, createdAt: -1 });

    const publicationSummary = publications.map(publication => ({
        title: publication.title,
        journal: publication.journalName || publication.conferenceName || publication.publisher || publication.publicationType,
        year: publication.publicationDate
            ? String(new Date(publication.publicationDate).getFullYear())
            : '',
        link: publication.doi
            ? (publication.doi.startsWith('http') ? publication.doi : `https://doi.org/${publication.doi}`)
            : ''
    }));

    await Faculty.findByIdAndUpdate(facultyId, {
        publications: publicationSummary,
        publicationsCount: publicationSummary.length
    });
};

const syncQualificationSummary = async (facultyId) => {
    const qualifications = await Qualification.find({ facultyId }).sort({ endYear: -1, createdAt: -1 });

    const qualificationSummary = qualifications.map(qualification => ({
        degree: qualification.degree,
        institution: qualification.institution,
        year: qualification.endYear ? String(qualification.endYear) : ''
    }));

    await Faculty.findByIdAndUpdate(facultyId, {
        qualifications: qualificationSummary
    });
};

const syncAchievementSummary = async (facultyId) => {
    const achievements = await Achievement.find({ facultyId }).sort({ date: -1, createdAt: -1 });

    const achievementSummary = achievements.map(achievement => ({
        title: achievement.title,
        description: achievement.description,
        date: achievement.date
            ? new Date(achievement.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
            : ''
    }));

    await Faculty.findByIdAndUpdate(facultyId, {
        achievements: achievementSummary
    });
};

module.exports = {
    resolveFacultyProfileId,
    syncPublicationSummary,
    syncQualificationSummary,
    syncAchievementSummary,
};
