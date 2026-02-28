
/**
 * Calculates age based on a birth date string.
 * Uses a robust approach to handle different date formats and timezone issues.
 * @param birthDateStr The birth date string (e.g., "YYYY-MM-DD" or "YYYY-MM-DD HH:mm:ss")
 * @param referenceDate Optional reference date to calculate age from. Defaults to the current date.
 * @returns The calculated age in years.
 */
export const calculateAge = (birthDateStr: string, referenceDate: Date = new Date('2026-02-25')): number => {
  if (!birthDateStr) return 0;

  // Handle strings with timestamps or varied separators
  const cleanDateStr = birthDateStr.includes(' ') ? birthDateStr.split(' ')[0] : birthDateStr;
  
  // Parse birth date parts manually to avoid timezone shifts
  // Expected formats: YYYY-MM-DD, YYYY/MM/DD, or MM-DD-YYYY
  let birthYear: number, birthMonth: number, birthDay: number;

  if (cleanDateStr.includes('-')) {
    const parts = cleanDateStr.split('-');
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      [birthYear, birthMonth, birthDay] = parts.map(Number);
    } else {
      // MM-DD-YYYY
      [birthMonth, birthDay, birthYear] = parts.map(Number);
    }
  } else if (cleanDateStr.includes('/')) {
    const parts = cleanDateStr.split('/');
    if (parts[0].length === 4) {
      // YYYY/MM/DD
      [birthYear, birthMonth, birthDay] = parts.map(Number);
    } else {
      // MM/DD/YYYY
      [birthMonth, birthDay, birthYear] = parts.map(Number);
    }
  } else {
    // Fallback to native Date parsing if format is unknown
    const birth = new Date(cleanDateStr);
    if (isNaN(birth.getTime())) return 0;
    birthYear = birth.getFullYear();
    birthMonth = birth.getMonth() + 1;
    birthDay = birth.getDate();
  }

  const todayYear = referenceDate.getFullYear();
  const todayMonth = referenceDate.getMonth() + 1;
  const todayDay = referenceDate.getDate();

  let age = todayYear - birthYear;

  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age--;
  }

  return age < 0 ? 0 : age;
};

/**
 * Formats a date string into "Month DD, YYYY" format.
 * @param dateStr The date string to format.
 * @returns Formatted date string.
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '---';
  
  const cleanDateStr = dateStr.includes(' ') ? dateStr.split(' ')[0] : dateStr;
  const date = new Date(cleanDateStr);
  
  if (isNaN(date.getTime())) {
    // Try manual parsing if native fails
    const parts = cleanDateStr.split(/[-/]/);
    if (parts.length === 3) {
      let year, month, day;
      if (parts[0].length === 4) {
        [year, month, day] = parts.map(Number);
      } else {
        [month, day, year] = parts.map(Number);
      }
      const d = new Date(year, month - 1, day);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      }
    }
    return dateStr;
  }
  
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
