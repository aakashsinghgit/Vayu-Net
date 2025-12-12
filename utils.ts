
import { AnalysisReport } from './types';
import { MOCK_CITIES } from './constants';

export const formatAnalysisTitle = (report: AnalysisReport): string => {
  try {
    // 1. Find Zone and City names from the ID
    let zoneName = 'UnknownZone';
    let cityName = 'UnknownCity';

    for (const city of MOCK_CITIES) {
      const foundZone = city.zones.find(z => z.id === report.zoneId);
      if (foundZone) {
        cityName = city.name;
        zoneName = foundZone.name;
        break;
      }
    }

    // 2. Format Date
    const date = new Date(report.timestamp);
    const year = date.getFullYear();
    const month = date.toLocaleString('default', { month: 'short' });
    const day = String(date.getDate()).padStart(2, '0');
    
    // Format Time (e.g. 0930am)
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strTime = `${String(hours).padStart(2, '0')}${minutes}${ampm}`;

    // 3. Construct Nomenclature: City_Zone_Year_MonthDay_Time
    // Remove spaces from names to match file naming conventions often used in data
    const safeCity = cityName.replace(/\s+/g, '');
    const safeZone = zoneName.replace(/\s+/g, '');
    
    return `${safeCity}_${safeZone}_${year}_${month}${day}_${strTime}`;
  } catch (e) {
    return `Analysis_${report.id}`;
  }
};

export const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
};
