const searchPath = 'https://www.sec.gov/cgi-bin/browse-edgar';

const getCompany = ({ cik, type = '10-K', count = 40 }) => {
  return `${searchPath}?action=getcompany&CIK=${cik}&type=${type}&dateb=&owner=include&count=${count}`;
};

module.exports = {
  getCompany,
};
