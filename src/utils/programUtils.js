export const getFuzzyKeyword = (globalProgram) => {
  if (!globalProgram) return '%';
  let fuzzyKeyword = `%${globalProgram}%`;
  const pLow = globalProgram.toLowerCase();
  
  if (pLow.includes('maggot')) fuzzyKeyword = '%maggot%';
  else if (pLow.includes('plts')) fuzzyKeyword = '%plts%';
  else if (pLow.includes('ikan')) fuzzyKeyword = '%ikan%';
  else if (pLow.includes('siba')) fuzzyKeyword = '%siba%';
  else if (pLow.includes('puyuh')) {
    if (pLow.includes('seleman')) fuzzyKeyword = '%puyuh%seleman%';
    else if (pLow.includes('darmo')) fuzzyKeyword = '%puyuh%darmo%';
    else fuzzyKeyword = '%puyuh%';
  }
  else if (pLow.includes('prabumenang')) fuzzyKeyword = '%prabumenang%';
  
  return fuzzyKeyword;
};
