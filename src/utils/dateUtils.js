export const monthMap = {
  0: ['Jan', 'January', 'Januari'],
  1: ['Feb', 'February', 'Februari'],
  2: ['Mar', 'March', 'Maret'],
  3: ['Apr', 'April'],
  4: ['May', 'Mei'],
  5: ['Jun', 'June', 'Juni'],
  6: ['Jul', 'July', 'Juli'],
  7: ['Ags', 'Aug', 'August', 'Agustus'],
  8: ['Sep', 'Sept', 'September'],
  9: ['Okt', 'Oct', 'October', 'Oktober'],
  10: ['Nov', 'November'],
  11: ['Des', 'Dec', 'December', 'Desember']
};

export const getMonthStrings = (dateStr) => {
  const d = new Date(dateStr);
  const selectedMonthIdx = d.getMonth();
  return [...monthMap[selectedMonthIdx]];
};

export const getYear = (dateStr) => {
  return new Date(dateStr).getFullYear();
};
