const { TEAMS } = require('../utils/constants');

/**
 * Validates a batch of student records for import.
 * @param {Array} rawStudents - Array of student objects
 * @returns {Object} { isValid, errors, parsedStudents, metrics }
 */
const validateStudentImport = (rawStudents) => {
  const errors = [];
  const parsedStudents = [];
  const metrics = {
    total: rawStudents.length,
    teams: {
      [TEAMS.VC]: 0,
      [TEAMS.IC]: 0,
      [TEAMS.AI]: 0,
      [TEAMS.MK]: 0,
      [TEAMS.UNASSIGNED]: 0
    },
    branches: {}
  };

  const rollNumberSet = new Set();
  const emailSet = new Set();

  if (!Array.isArray(rawStudents)) {
    return { isValid: false, errors: ['Input must be an array of students.'] };
  }

  if (rawStudents.length !== 68) {
    errors.push(`Expected exactly 68 records, but found ${rawStudents.length}.`);
  }

  rawStudents.forEach((student, index) => {
    const { rollNumber, name, branch, team } = student;
    const rowIndex = index + 1;

    // Validate Roll Number
    if (!rollNumber || typeof rollNumber !== 'string') {
      errors.push(`Row ${rowIndex}: Missing or invalid rollNumber.`);
      return; // Skip rest of validation for this row if critical data is missing
    }

    if (rollNumberSet.has(rollNumber)) {
      errors.push(`Row ${rowIndex}: Duplicate rollNumber found '${rollNumber}'.`);
    } else {
      rollNumberSet.add(rollNumber);
    }

    // Validate Email uniqueness
    const generatedEmail = `${rollNumber}@vishnu.edu.in`;
    if (emailSet.has(generatedEmail)) {
      errors.push(`Row ${rowIndex}: Duplicate generated email found '${generatedEmail}'.`);
    } else {
      emailSet.add(generatedEmail);
    }

    // Validate Name
    if (!name || typeof name !== 'string') {
      errors.push(`Row ${rowIndex}: Missing or invalid name for rollNumber '${rollNumber}'.`);
    }

    // Validate Branch
    if (!branch || typeof branch !== 'string') {
      errors.push(`Row ${rowIndex}: Missing or invalid branch for rollNumber '${rollNumber}'.`);
    } else {
      metrics.branches[branch] = (metrics.branches[branch] || 0) + 1;
    }

    // Validate and Map Team
    let mappedTeam;
    if (team === 'vc') mappedTeam = TEAMS.VC;
    else if (team === 'ic') mappedTeam = TEAMS.IC;
    else if (team === 'ai') mappedTeam = TEAMS.AI;
    else if (team === 'mk') mappedTeam = TEAMS.MK;
    else if (team === '' || team === undefined || team === null) mappedTeam = TEAMS.UNASSIGNED;
    else {
      errors.push(`Row ${rowIndex}: Invalid team '${team}' for rollNumber '${rollNumber}'. Allowed: vc, ic, ai, mk, or empty.`);
      mappedTeam = TEAMS.UNASSIGNED; // Fallback for counting if we were to continue
    }

    if (metrics.teams[mappedTeam] !== undefined) {
      metrics.teams[mappedTeam]++;
    }

    parsedStudents.push({
      rollNumber,
      name,
      branch,
      currentTeam: mappedTeam,
      email: generatedEmail
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    parsedStudents,
    metrics
  };
};

module.exports = {
  validateStudentImport
};
