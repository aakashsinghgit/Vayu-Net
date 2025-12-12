import { AqiRecommendation } from './types';

export const HEALTH_ADVISORIES: AqiRecommendation[] = [
  {
    minAqi: 0,
    maxAqi: 50,
    title: "Air Quality is Good",
    advice: "Air quality is satisfactory, and air pollution poses little or no risk.",
    action: "Enjoy outdoor activities and ventilate your home.",
    color: "green"
  },
  {
    minAqi: 51,
    maxAqi: 100,
    title: "Moderate Air Quality",
    advice: "Air quality is acceptable. However, there may be a risk for some people.",
    action: "Sensitive individuals should limit prolonged outdoor exertion.",
    color: "yellow"
  },
  {
    minAqi: 101,
    maxAqi: 200,
    title: "Unhealthy for Sensitive Groups",
    advice: "Members of sensitive groups may experience health effects. The general public is less likely to be affected.",
    action: "Wear a mask if you have respiratory issues. Limit outdoor time.",
    color: "orange"
  },
  {
    minAqi: 201,
    maxAqi: 300,
    title: "Very Unhealthy",
    advice: "Health alert: The risk of health effects is increased for everyone.",
    action: "Ensure to wear an N95 mask if outside for >1 hour. Avoid outdoor exercise.",
    color: "red"
  },
  {
    minAqi: 301,
    maxAqi: 1000,
    title: "Hazardous",
    advice: "Health warning of emergency conditions. The entire population is more likely to be affected.",
    action: "Stay indoors. Run air purifiers on high. Seal windows and doors.",
    color: "purple"
  }
];