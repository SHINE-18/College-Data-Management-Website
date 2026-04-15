const DEPARTMENT_NAMES = [
    'Chemical Engineering',
    'Computer Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Electronics & Communication Engineering',
    'Information Technology',
    'Instrumentation & Control Engineering',
    'Mechanical Engineering',
    'Power Electronics Engineering',
    'Computer Science and Engineering (Data Science)',
    'Electronics And Instrumentation Engineering',
    'Information and Communication Technology',
    'All'
];

const DEPARTMENT_CODE_MAP = {
    CH: 'Chemical Engineering',
    CHE: 'Chemical Engineering',
    CP: 'Computer Engineering',
    CE: 'Computer Engineering',
    CSE: 'Computer Engineering',
    CS: 'Computer Engineering',
    CL: 'Civil Engineering',
    CIVIL: 'Civil Engineering',
    EE: 'Electrical Engineering',
    ELECTRICAL: 'Electrical Engineering',
    EC: 'Electronics & Communication Engineering',
    ECE: 'Electronics & Communication Engineering',
    IT: 'Information Technology',
    IC: 'Instrumentation & Control Engineering',
    ME: 'Mechanical Engineering',
    PE: 'Power Electronics Engineering',
    EI: 'Electronics And Instrumentation Engineering',
    ICT: 'Information and Communication Technology',
    CSEDS: 'Computer Science and Engineering (Data Science)',
    'CSE-DS': 'Computer Science and Engineering (Data Science)',
    ALL: 'All'
};

const NAME_TO_CODES = Object.entries(DEPARTMENT_CODE_MAP).reduce((acc, [code, name]) => {
    if (!acc[name]) {
        acc[name] = [];
    }

    if (!acc[name].includes(code)) {
        acc[name].push(code);
    }

    return acc;
}, {});

const normalizeDepartment = (value) => {
    if (value === undefined || value === null) {
        return value;
    }

    const trimmed = String(value).trim();
    if (!trimmed) {
        return trimmed;
    }

    const exactName = DEPARTMENT_NAMES.find(name => name.toLowerCase() === trimmed.toLowerCase());
    if (exactName) {
        return exactName;
    }

    const mapped = DEPARTMENT_CODE_MAP[trimmed.toUpperCase()];
    return mapped || trimmed;
};

const getDepartmentAliases = (value) => {
    const normalized = normalizeDepartment(value);
    if (!normalized) {
        return [];
    }

    const aliases = new Set([String(value).trim(), normalized]);

    (NAME_TO_CODES[normalized] || []).forEach(code => aliases.add(code));

    return [...aliases].filter(Boolean);
};

const buildDepartmentMatch = (value, { includeAll = false } = {}) => {
    const aliases = getDepartmentAliases(value);

    if (includeAll) {
        aliases.push('All');
    }

    const uniqueAliases = [...new Set(aliases)];
    return uniqueAliases.length > 0 ? { $in: uniqueAliases } : undefined;
};

const departmentsMatch = (left, right) => {
    const leftAliases = new Set(getDepartmentAliases(left));
    return getDepartmentAliases(right).some(alias => leftAliases.has(alias));
};

const isKnownDepartment = (value, { allowAll = true } = {}) => {
    const normalized = normalizeDepartment(value);
    if (normalized === 'All' && !allowAll) {
        return false;
    }

    return DEPARTMENT_NAMES.includes(normalized);
};

module.exports = {
    DEPARTMENT_NAMES,
    normalizeDepartment,
    getDepartmentAliases,
    buildDepartmentMatch,
    departmentsMatch,
    isKnownDepartment,
};
