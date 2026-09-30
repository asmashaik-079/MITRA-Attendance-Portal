const fs = require('fs');
const path = require('path');
const { validateStudentImport } = require('../services/studentImportValidationService');
const { TEAM_NAMES } = require('../utils/constants');

const dataPath = path.resolve(__dirname, '../data/private/clubStudents.json');

console.log('--------------------------------------------------');
console.log('MITRA Attendance Portal - Student Import Validator');
console.log('--------------------------------------------------\n');

try {
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: clubStudents.json file not found at:', dataPath);
    process.exit(1);
  }

  const fileData = fs.readFileSync(dataPath, 'utf-8');
  const rawStudents = JSON.parse(fileData);

  console.log(`Analyzing file... Loaded ${rawStudents.length} records.\n`);

  const result = validateStudentImport(rawStudents);

  if (result.isValid) {
    console.log('✅ VALIDATION PASSED: All requirements met.\n');
  } else {
    console.log('❌ VALIDATION FAILED:\n');
    result.errors.forEach(err => console.error(`  - ${err}`));
    console.log('\n');
  }

  console.log('--- DATA PREVIEW ---');
  console.log(`Total Records: ${result.metrics.total}`);
  
  console.log('\nTeam Distribution:');
  Object.keys(result.metrics.teams).forEach(teamKey => {
    const teamName = TEAM_NAMES[teamKey] || teamKey;
    console.log(`  ${teamName}: ${result.metrics.teams[teamKey]}`);
  });

  console.log('\nBranch Distribution:');
  Object.keys(result.metrics.branches).forEach(branch => {
    console.log(`  ${branch}: ${result.metrics.branches[branch]}`);
  });

  console.log('\nPreview of Generated Emails (First 5):');
  result.parsedStudents.slice(0, 5).forEach(student => {
    console.log(`  ${student.name} (${student.rollNumber}) -> ${student.email}`);
  });
  
  console.log('\n--------------------------------------------------');

  if (!result.isValid) {
    process.exit(1);
  } else {
    process.exit(0);
  }

} catch (error) {
  console.error('\nSCRIPT ERROR: Failed to execute validation script.');
  console.error(error.message);
  process.exit(1);
}
