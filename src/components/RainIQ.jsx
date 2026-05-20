import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useFeatureFlags } from '@geejay/use-feature-flags';
import api from '../utility/api';
import { VITE_SOCKETLABS_FROM_EMAIL } from '../utility/constants';
import fetchByPage from '../utility/fetchByPage';

const timeRanges = [
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Year to date', value: 'ytd' },
  { label: 'Custom', value: 'custom' },
];

const formatDateForApi = (date) => date.toISOString().split('T')[0];

const formatDateForUi = (isoDate) => {
  const date = new Date(`${isoDate}T00:00:00`);

  return date.toLocaleDateString('en-US');
};

const formatMonthForUi = (yearMonth) => {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

const formatMonthShortForUi = (yearMonth) => {
  const [year, month] = yearMonth.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);

  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};


const buildMonthlyTotals = (dailyTotals = []) => {
  const monthTotals = {};

  dailyTotals.forEach((entry) => {
    const month = entry.date.slice(0, 7);
    monthTotals[month] = Number(((monthTotals[month] || 0) + Number(entry.daily_total || 0)).toFixed(2));
  });

  return Object.entries(monthTotals).sort(([monthA], [monthB]) => monthA.localeCompare(monthB));
};

const formatRainValue = (value, digits = 3) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return '0';
  }

  return numericValue.toFixed(digits).replace(/\.?0+$/, '');
};


const formatDateTimeFromSql = (sqlDateTime) => {
  if (!sqlDateTime) {
    return { date: 'N/A', time: 'N/A' };
  }

  const parsedDate = new Date(sqlDateTime.replace(' ', 'T'));
  if (Number.isNaN(parsedDate.getTime())) {
    return { date: 'N/A', time: 'N/A' };
  }

  return {
    date: parsedDate.toLocaleDateString('en-US'),
    time: parsedDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
};

const getRangeDates = (selectedRange) => {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  const startDate = new Date(endDate);

  if (selectedRange === '90d') {
    startDate.setDate(endDate.getDate() - 89);
  } else if (selectedRange === 'ytd') {
    startDate.setMonth(0, 1);
  } else if (selectedRange === 'custom') {
    startDate.setMonth(endDate.getMonth() - 1);
  } else {
    startDate.setDate(endDate.getDate() - 29);
  }

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};

const queries = [
  { group: 'Baseline Metrics', label: 'Average rainfall per day', value: 'avgDaily' },
  { group: 'Baseline Metrics', label: 'Average rainfall per month', value: 'avgMonthly' },
  { group: 'Baseline Metrics', label: 'Wettest month in selected period', value: 'wettestMonth' },
  { group: 'Compliance & Threshold Queries', label: 'Number of days with rainfall > X inches', value: 'qualifyingEvents' },
  { group: 'Compliance & Threshold Queries', label: 'Maximum 24-hour rainfall', value: 'largest24h' },
  { group: 'Compliance & Threshold Queries', label: 'Total rainfall for selected period', value: 'totalRain' },
  { group: 'Compliance & Threshold Queries', label: 'Maximum hourly rainfall', value: 'maxHourlyRainfall' },
  { group: 'Compliance & Threshold Queries', label: 'Maximum rolling 24-hour rainfall', value: 'maxRolling24hRainfall' },
  { group: 'Compliance & Threshold Queries', label: 'Compare rainfall to design storm (NOAA Atlas 14)', value: 'designStormComparison' },
  { group: 'Compliance & Threshold Queries', label: 'Total rainfall by storm event', value: 'stormEvents' },
 /* { group: 'Streak Analysis', label: 'Longest dry period', value: 'longestDry' },
  { group: 'Streak Analysis', label: 'Longest consecutive rainfall period', value: 'longestWet' },
  { group: 'Temporal Distribution', label: 'Most common rainfall time of day', value: 'commonTimeOfDay' },
  { group: 'Temporal Distribution', label: 'Rainfall by day of week', value: 'rainByDay' },
  { group: 'Limited Multi-Location', label: 'Location with highest rainfall in selected period', value: 'topLocation' },*/
];

const mockResponses = {
  avgDaily: {
    headline: 'Average daily rainfall for the selected period is 0.18 inches.',
    metrics: [
      { label: 'Average daily total', value: '0.18 in' },
      { label: 'Rain days', value: '14 of 30 days' },
      { label: 'Peak day', value: '0.97 in on 02/14/2026' },
    ],
    columns: ['Date', 'Rainfall (in)'],
    rows: [
      ['02/12/2026', '0.25'],
      ['02/13/2026', '0.11'],
      ['02/14/2026', '0.97'],
      ['02/15/2026', '0.04'],
    ],
    chart: [
      { label: 'Week 1', value: 0.56 },
      { label: 'Week 2', value: 1.12 },
      { label: 'Week 3', value: 0.73 },
      { label: 'Week 4', value: 0.48 },
    ],
  },
  avgMonthly: {
    headline: 'Average monthly rainfall is 3.84 inches across entitled monitoring data.',
    metrics: [
      { label: 'Monthly average', value: '3.84 in' },
      { label: 'Months analyzed', value: '14' },
      { label: 'Highest month', value: '5.12 in (Jan 2026)' },
    ],
    columns: ['Month', 'Total Rainfall (in)'],
    rows: [
      ['Nov 2025', '3.11'],
      ['Dec 2025', '3.44'],
      ['Jan 2026', '5.12'],
      ['Feb 2026', '3.67'],
    ],
    chart: [
      { label: 'Nov', value: 3.11 },
      { label: 'Dec', value: 3.44 },
      { label: 'Jan', value: 5.12 },
      { label: 'Feb', value: 3.67 },
    ],
  },
  wettestMonth: {
    headline: 'The wettest month on record is January 2026 with 5.12 inches of rain.',
    metrics: [
      { label: 'Wettest month', value: 'January 2026' },
      { label: 'Rainfall total', value: '5.12 in' },
      { label: 'Next closest', value: 'April 2025 (4.91 in)' },
    ],
    columns: ['Month', 'Total Rainfall (in)', 'Rank'],
    rows: [
      ['Jan 2026', '5.12', '1'],
      ['Apr 2025', '4.91', '2'],
      ['Dec 2025', '3.44', '3'],
    ],
    chart: [
      { label: 'Jan 2026', value: 5.12 },
      { label: 'Apr 2025', value: 4.91 },
      { label: 'Dec 2025', value: 3.44 },
    ],
  },
  qualifyingEvents: {
    headline: 'There were 8 qualifying rain events above 0.5 inches in the selected window.',
    metrics: [
      { label: 'Threshold', value: '0.5 in' },
      { label: 'Qualifying events', value: '8' },
      { label: 'Maximum event', value: '1.22 in on 01/23/2026' },
    ],
    columns: ['Date', '24-hour Rainfall (in)', 'Qualified'],
    rows: [
      ['01/04/2026', '0.67', 'Yes'],
      ['01/14/2026', '0.58', 'Yes'],
      ['01/23/2026', '1.22', 'Yes'],
      ['02/14/2026', '0.97', 'Yes'],
    ],
    chart: [
      { label: 'Jan', value: 5 },
      { label: 'Feb', value: 3 },
    ],
  },
  largest24h: {
    headline: 'The largest 24-hour rainfall total was 1.22 inches on 01/23/2026.',
    metrics: [
      { label: 'Largest 24-hour total', value: '1.22 in' },
      { label: 'Date', value: '01/23/2026' },
      { label: 'Location', value: 'North Pump Station' },
    ],
    columns: ['Date', 'Location', '24-hour Total (in)'],
    rows: [
      ['01/23/2026', 'North Pump Station', '1.22'],
      ['02/14/2026', 'North Pump Station', '0.97'],
      ['01/14/2026', 'North Pump Station', '0.58'],
    ],
    chart: [
      { label: 'Top Event', value: 1.22 },
      { label: '2nd', value: 0.97 },
      { label: '3rd', value: 0.58 },
    ],
  },
  totalRain: {
    headline: 'Total rainfall in the selected period is 5.38 inches.',
    metrics: [
      { label: 'Total rainfall', value: '5.38 in' },
      { label: 'Average per rain day', value: '0.38 in' },
      { label: 'Days with rain', value: '14' },
    ],
    columns: ['Period', 'Total Rainfall (in)'],
    rows: [
      ['First half of period', '2.91'],
      ['Second half of period', '2.47'],
    ],
    chart: [
      { label: 'First Half', value: 2.91 },
      { label: 'Second Half', value: 2.47 },
    ],
  },
  longestDry: {
    headline: 'The longest dry stretch lasted 11 consecutive days.',
    metrics: [
      { label: 'Longest dry streak', value: '11 days' },
      { label: 'Start date', value: '12/08/2025' },
      { label: 'End date', value: '12/18/2025' },
    ],
    columns: ['Start Date', 'End Date', 'Length (days)'],
    rows: [
      ['12/08/2025', '12/18/2025', '11'],
      ['01/28/2026', '02/05/2026', '9'],
    ],
    chart: [
      { label: 'Longest', value: 11 },
      { label: 'Second', value: 9 },
    ],
  },
  longestWet: {
    headline: 'The longest consecutive rainfall period was 4 days.',
    metrics: [
      { label: 'Longest wet streak', value: '4 days' },
      { label: 'Dates', value: '02/11/2026 to 02/14/2026' },
      { label: 'Total during streak', value: '1.64 in' },
    ],
    columns: ['Start Date', 'End Date', 'Length (days)', 'Total (in)'],
    rows: [['02/11/2026', '02/14/2026', '4', '1.64']],
    chart: [{ label: 'Wet Streak', value: 4 }],
  },
  commonTimeOfDay: {
    headline: 'Rainfall most often occurs overnight (12:00 AM to 6:00 AM).',
    metrics: [
      { label: 'Most common bucket', value: 'Overnight' },
      { label: 'Event share', value: '41%' },
      { label: 'Least common bucket', value: 'Afternoon' },
    ],
    columns: ['Time Bucket', 'Event Count', 'Share'],
    rows: [
      ['Overnight', '32', '41%'],
      ['Morning', '19', '24%'],
      ['Afternoon', '10', '13%'],
      ['Evening', '17', '22%'],
    ],
    chart: [
      { label: 'Overnight', value: 32 },
      { label: 'Morning', value: 19 },
      { label: 'Afternoon', value: 10 },
      { label: 'Evening', value: 17 },
    ],
  },
  rainByDay: {
    headline: 'Tuesday has the highest average rainfall among days of the week.',
    metrics: [
      { label: 'Highest day', value: 'Tuesday' },
      { label: 'Average Tuesday rainfall', value: '0.24 in' },
      { label: 'Lowest day', value: 'Sunday (0.08 in)' },
    ],
    columns: ['Day', 'Average Rainfall (in)'],
    rows: [
      ['Monday', '0.19'],
      ['Tuesday', '0.24'],
      ['Wednesday', '0.18'],
      ['Thursday', '0.21'],
      ['Friday', '0.12'],
      ['Saturday', '0.10'],
      ['Sunday', '0.08'],
    ],
    chart: [
      { label: 'Mon', value: 0.19 },
      { label: 'Tue', value: 0.24 },
      { label: 'Wed', value: 0.18 },
      { label: 'Thu', value: 0.21 },
      { label: 'Fri', value: 0.12 },
      { label: 'Sat', value: 0.1 },
      { label: 'Sun', value: 0.08 },
    ],
  },
  topLocation: {
    headline: 'North Pump Station received the highest rainfall in the selected period.',
    metrics: [
      { label: 'Top location', value: 'North Pump Station' },
      { label: 'Total rainfall', value: '5.38 in' },
      { label: 'Runner up', value: 'West Yard (4.11 in)' },
    ],
    columns: ['Location', 'Total Rainfall (in)', 'Qualifying Events'],
    rows: [
      ['North Pump Station', '5.38', '8'],
      ['West Yard', '4.11', '6'],
      ['East Basin', '3.72', '5'],
    ],
    chart: [
      { label: 'North', value: 5.38 },
      { label: 'West', value: 4.11 },
      { label: 'East', value: 3.72 },
    ],
  },
};

const last4ReportQueryValues = ['maxHourlyRainfall', 'maxRolling24hRainfall', 'designStormComparison', 'stormEvents'];

const groupedQueries = queries.reduce((acc, query) => {
  if (!acc[query.group]) {
    acc[query.group] = [];
  }
  acc[query.group].push(query);
  return acc;
}, {});

const apiBackedQueries = ['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents', 'largest24h', 'totalRain', 'maxHourlyRainfall', 'maxRolling24hRainfall', 'designStormComparison', 'stormEvents'];
const calculationMethodSupportedQueries = ['avgDaily', 'avgMonthly'];

export default function RainIQ() {
  const user = useSelector((state) => state.userInfo.user);
  const { isActive } = useFeatureFlags();

  const [selectedRange, setSelectedRange] = useState('30d');
  const [customStartDate, setCustomStartDate] = useState(() => getRangeDates('custom').startDate);
  const [customEndDate, setCustomEndDate] = useState(() => getRangeDates('custom').endDate);
  const [selectedQuery, setSelectedQuery] = useState('avgDaily');
  const [threshold, setThreshold] = useState('1.0');
  const [calculationMethod, setCalculationMethod] = useState('allDays');
  const [requestText, setRequestText] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [requestMessageType, setRequestMessageType] = useState('success');
  const [wettestMonthResponse, setWettestMonthResponse] = useState(null);
  const [wettestMonthLoading, setWettestMonthLoading] = useState(false);
  const [wettestMonthError, setWettestMonthError] = useState('');
  const [avgMonthlyResponse, setAvgMonthlyResponse] = useState(null);
  const [avgMonthlyLoading, setAvgMonthlyLoading] = useState(false);
  const [avgMonthlyError, setAvgMonthlyError] = useState('');
  const [avgDailyResponse, setAvgDailyResponse] = useState(null);
  const [avgDailyLoading, setAvgDailyLoading] = useState(false);
  const [avgDailyError, setAvgDailyError] = useState('');
  const [qualifyingEventsResponse, setQualifyingEventsResponse] = useState(null);
  const [qualifyingEventsLoading, setQualifyingEventsLoading] = useState(false);
  const [qualifyingEventsError, setQualifyingEventsError] = useState('');
  const [largest24hResponse, setLargest24hResponse] = useState(null);
  const [largest24hLoading, setLargest24hLoading] = useState(false);
  const [largest24hError, setLargest24hError] = useState('');
  const [totalRainResponse, setTotalRainResponse] = useState(null);
  const [totalRainLoading, setTotalRainLoading] = useState(false);
  const [totalRainError, setTotalRainError] = useState('');
  const [maxHourlyRainfallResponse, setMaxHourlyRainfallResponse] = useState(null);
  const [maxHourlyRainfallLoading, setMaxHourlyRainfallLoading] = useState(false);
  const [maxHourlyRainfallError, setMaxHourlyRainfallError] = useState('');
  const [maxRolling24hRainfallResponse, setMaxRolling24hRainfallResponse] = useState(null);
  const [maxRolling24hRainfallLoading, setMaxRolling24hRainfallLoading] = useState(false);
  const [maxRolling24hRainfallError, setMaxRolling24hRainfallError] = useState('');
  const [designStormComparisonResponse, setDesignStormComparisonResponse] = useState(null);
  const [designStormComparisonLoading, setDesignStormComparisonLoading] = useState(false);
  const [designStormComparisonError, setDesignStormComparisonError] = useState('');
  const [stormEventsResponse, setStormEventsResponse] = useState(null);
  const [stormEventsLoading, setStormEventsLoading] = useState(false);
  const [stormEventsError, setStormEventsError] = useState('');
  const [hourlyDataSource, setHourlyDataSource] = useState('hourly');
  const [eventGapHours, setEventGapHours] = useState('6');
  const [designStormDuration, setDesignStormDuration] = useState('24h');
  const [designStormReturnPeriod, setDesignStormReturnPeriod] = useState('2');
  const [locationOptions, setLocationOptions] = useState([]);
  const [hasExecutedQuery, setHasExecutedQuery] = useState(false);
  



  useEffect(() => {
    fetchLocations(1);
  }, []);

  useEffect(() => {
    if (!calculationMethodSupportedQueries.includes(selectedQuery) && calculationMethod !== 'allDays') {
      setCalculationMethod('allDays');
    }
  }, [selectedQuery, calculationMethod]);

  const fetchLocations = async () => {
    try {

      
      let rows = await fetchByPage(`/api/locations/?client_id=${user.clients[0].id}`)

      setLocationOptions(rows); // Ensure `results` is always an array
      //setTotalPages(Math.ceil(response.data.total / pageSize));
    } catch (error) {
      console.error('Error fetching locations:', error.message);
      setLocationOptions([]); // Fallback to an empty array in case of an error
    }
  };

  const canAccessRainIQ = useMemo(() => {
    const userTier = user?.clients?.[0]?.tier?.toLowerCase();
    return userTier === 'platinum' || user.is_superuser || isActive('rainIQ');
  }, [user, isActive]);

  const reportOptions = useMemo(() => {
    const showAllOptions = isActive('last4Reports');
    if (showAllOptions) {
      return groupedQueries;
    }

    return Object.entries(groupedQueries).reduce((acc, [group, groupQueries]) => {
      const filtered = groupQueries.filter((query) => !last4ReportQueryValues.includes(query.value));
      if (filtered.length) {
        acc[group] = filtered;
      }
      return acc;
    }, {});
  }, [isActive]);

  useEffect(() => {
    if (isActive('last4Reports')) {
      return;
    }

    if (last4ReportQueryValues.includes(selectedQuery)) {
      setSelectedQuery('avgDaily');
    }
  }, [isActive, selectedQuery]);

  const customRangeError = useMemo(() => {
    if (selectedRange !== 'custom') {
      return '';
    }
    if (!customStartDate || !customEndDate) {
      return 'Please provide both custom start and end dates.';
    }
    if (customStartDate > customEndDate) {
      return 'Custom start date must be on or before end date.';
    }
    return '';
  }, [selectedRange, customStartDate, customEndDate]);

  const selectedDateRange = useMemo(() => {
    if (selectedRange === 'custom') {
      return {
        startDate: customStartDate,
        endDate: customEndDate,
      };
    }

    return getRangeDates(selectedRange);
  }, [selectedRange, customStartDate, customEndDate]);
  const parsedThreshold = useMemo(() => {
    const trimmedThreshold = threshold.trim();
    if (!trimmedThreshold) {
      return null;
    }

    const thresholdValue = Number(trimmedThreshold);
    if (!Number.isFinite(thresholdValue)) {
      return null;
    }

    return thresholdValue;
  }, [threshold]);
  const includeZeroDays = calculationMethod === 'allDays';
  const showCalculationMethod = calculationMethodSupportedQueries.includes(selectedQuery);
  const showThresholdInput = selectedQuery === 'qualifyingEvents';
  const queryHasError = useMemo(
    () => ({
      wettestMonth: wettestMonthError,
      avgMonthly: avgMonthlyError,
      avgDaily: avgDailyError,
      qualifyingEvents: qualifyingEventsError,
      largest24h: largest24hError,
      totalRain: totalRainError,
      maxHourlyRainfall: maxHourlyRainfallError,
      maxRolling24hRainfall: maxRolling24hRainfallError,
      designStormComparison: designStormComparisonError,
      stormEvents: stormEventsError,
    }[selectedQuery] || ''),
    [
      selectedQuery,
      wettestMonthError,
      avgMonthlyError,
      avgDailyError,
      qualifyingEventsError,
      largest24hError,
      totalRainError,
      maxHourlyRainfallError,
      maxRolling24hRainfallError,
      designStormComparisonError,
      stormEventsError,
    ],
  );
  const selectedResponse = mockResponses[selectedQuery] ?? mockResponses.avgDaily;
  const apiBackedResponse = selectedQuery === 'wettestMonth'
    ? wettestMonthResponse
    : selectedQuery === 'avgMonthly'
      ? avgMonthlyResponse
      : selectedQuery === 'avgDaily'
        ? avgDailyResponse
        : selectedQuery === 'qualifyingEvents'
          ? qualifyingEventsResponse
          : selectedQuery === 'largest24h'
            ? largest24hResponse
            : selectedQuery === 'totalRain'
              ? totalRainResponse
              : selectedQuery === 'maxHourlyRainfall'
                ? maxHourlyRainfallResponse
                : selectedQuery === 'maxRolling24hRainfall'
                  ? maxRolling24hRainfallResponse
                  : selectedQuery === 'designStormComparison'
                    ? designStormComparisonResponse
                    : selectedQuery === 'stormEvents'
                      ? stormEventsResponse
      : null;

  




  const availableLocations = locationOptions;

  const [selectedLocations, setSelectedLocations] = useState([]);
  const [analyzedLocations, setAnalyzedLocations] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [chartDisplayType, setChartDisplayType] = useState('bar');

  const selectedLocationResults = useMemo(() => {
    const reportDataByLocation = new Map(
      (apiBackedResponse?.data || []).map((locationData) => [String(locationData.location_id), locationData]),
    );

    const activeLocations = analyzedLocations;

    return activeLocations.map((locationId, index) => {
      const locationName = availableLocations.find((location) => String(location.id) === String(locationId))?.name || 'Selected location';
      const valueOffset = index * 0.09;
      const reportLocationData = reportDataByLocation.get(locationId);

      if (selectedQuery === 'wettestMonth' && reportLocationData?.wettest_month_on_record) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const monthTotals = buildMonthlyTotals(dailyTotals);
        const rankedMonths = [...monthTotals].sort(([, a], [, b]) => b - a);

        const rankByMonth = new Map(rankedMonths.map(([month], rankIndex) => [month, rankIndex + 1]));
        const topMonth = rankedMonths[0];
        const monthLabel = topMonth ? formatMonthForUi(topMonth[0]) : 'N/A';
        const topMonthTotal = Number(topMonth?.[1] || 0).toFixed(2);
        const nextClosest = rankedMonths[1];
        const summaryRows = monthTotals.map(([month, total]) => [
          formatMonthShortForUi(month),
          Number(total || 0).toFixed(2),
          String(rankByMonth.get(month) || 0),
        ]);

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `The wettest month on record is ${monthLabel} with ${topMonthTotal} inches of rain.`,
          metrics: [
            { label: 'Wettest month', value: monthLabel },
            { label: 'Rainfall total', value: `${topMonthTotal} in` },
            {
              label: 'Next closest',
              value: nextClosest?.[0]
                ? `${formatMonthForUi(nextClosest[0])} (${Number(nextClosest[1] || 0).toFixed(2)} in)`
                : 'N/A',
            },
          ],
          columns: ['Month', 'Total Rainfall (in)', 'Rank'],
          rows: summaryRows.length ? summaryRows : [['N/A', '0.00', '1']],
          chart: monthTotals.map(([month, total]) => ({
            label: formatMonthShortForUi(month),
            value: Number(total || 0),
          })),
        };
      }

      if (selectedQuery === 'avgMonthly' && reportLocationData) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const monthTotals = buildMonthlyTotals(dailyTotals);
        const rankedMonths = [...monthTotals].sort(([, a], [, b]) => b - a);

        const analyzedMonthCount = monthTotals.length;
        const monthlyAverage = Number(reportLocationData.average_monthly_rainfall || 0);
        const highestMonth = rankedMonths[0];

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `Average rainfall per month is ${monthlyAverage.toFixed(2)} inches.`,
          metrics: [
            { label: 'Average rainfall per month', value: `${monthlyAverage.toFixed(2)} in` },
            { label: 'Months analyzed', value: String(analyzedMonthCount || 0) },
            {
              label: 'Highest month',
              value: highestMonth?.[0]
                ? `${formatMonthForUi(highestMonth[0])} (${Number(highestMonth[1] || 0).toFixed(2)} in)`
                : 'N/A',
            },
          ],
          columns: ['Month', 'Total Rainfall (in)', 'Rank'],
          rows: monthTotals.map(([month, total]) => [
            formatMonthShortForUi(month),
            Number(total || 0).toFixed(2),
            String((rankedMonths.findIndex(([rankedMonth]) => rankedMonth === month) || 0) + 1),
          ]),
          chart: monthTotals.map(([month, total]) => ({
            label: formatMonthShortForUi(month),
            value: Number(total || 0),
          })),
        };
      }

      if (selectedQuery === 'avgDaily' && reportLocationData) {
        const dailyTotals = reportLocationData.daily_totals || [];

        const dayCount = dailyTotals.length;
        const averageDaily = Number(reportLocationData.average_daily_rainfall || 0);
        const rainDaysCount = dailyTotals.filter((entry) => Number(entry.daily_total || 0) > 0).length;
        const peakDay = dailyTotals.reduce(
          (maxEntry, entry) => (Number(entry.daily_total || 0) > Number(maxEntry.daily_total || 0) ? entry : maxEntry),
          { date: '', daily_total: 0 },
        );

        const topDailyRows = [...dailyTotals]
          .sort((a, b) => Number(b.daily_total || 0) - Number(a.daily_total || 0))
          .slice(0, 10)
          .map((entry, rankIndex) => [
            String(rankIndex + 1),
            formatDateForUi(entry.date),
            Number(entry.daily_total || 0).toFixed(2),
          ]);

        const monthBuckets = {};
        dailyTotals.forEach((entry) => {
          const month = entry.date.slice(0, 7);
          monthBuckets[month] = Number(((monthBuckets[month] || 0) + Number(entry.daily_total || 0)).toFixed(2));
        });

        const chartRows = Object.entries(monthBuckets)
          .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
          .map(([month, total]) => ({
            label: formatMonthShortForUi(month),
            value: Number(total || 0),
          }));

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `Average rainfall per day is ${averageDaily.toFixed(2)} inches for the selected period.`,
          metrics: [
            { label: 'Average per day', value: `${averageDaily.toFixed(2)} in` },
            { label: 'Rain days', value: `${rainDaysCount} of ${dayCount || 0} days` },
            {
              label: 'Wettest day',
              value: peakDay?.date
                ? `${Number(peakDay.daily_total || 0).toFixed(2)} in on ${formatDateForUi(peakDay.date)}`
                : 'N/A',
            },
          ],
          columns: ['Rank', 'Date', 'Rainfall (in)'],
          rows: topDailyRows.length ? topDailyRows : [['1', 'N/A', '0.00']],
          chart: chartRows.length ? chartRows : [{ label: 'N/A', value: 0 }],
        };
      }

      if (selectedQuery === 'qualifyingEvents' && reportLocationData) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const effectiveThreshold = Number(apiBackedResponse?.threshold_inches ?? parsedThreshold ?? 0);
        const qualifyingEvents = dailyTotals.filter((entry) => Number(entry.daily_total || 0) >= effectiveThreshold);
        const mostIntenseEvent = qualifyingEvents.reduce(
          (maxEntry, entry) => (Number(entry.daily_total || 0) > Number(maxEntry.daily_total || 0) ? entry : maxEntry),
          { date: '', daily_total: 0 },
        );

        const qualifyingRows = qualifyingEvents
          .sort((a, b) => Number(b.daily_total || 0) - Number(a.daily_total || 0))
          .slice(0, 10)
          .map((entry) => [
            formatDateForUi(entry.date),
            Number(entry.daily_total || 0).toFixed(2),
            'Yes',
          ]);

        const monthBucket = {};
        qualifyingEvents.forEach((entry) => {
          const month = entry.date.slice(0, 7);
          monthBucket[month] = (monthBucket[month] || 0) + 1;
        });

        const chartRows = Object.entries(monthBucket)
          .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
          .map(([month, count]) => ({
            label: formatMonthShortForUi(month),
            value: Number(count || 0),
          }));

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `There were ${Number(reportLocationData.qualifying_rain_events_count || 0)} days with rainfall above ${effectiveThreshold.toFixed(2)} inches in the selected window.`,
          metrics: [
            { label: 'Threshold', value: `${effectiveThreshold.toFixed(2)} in` },
            { label: 'Qualifying events', value: String(qualifyingRows.length) },
            {
              label: 'Maximum event',
              value: mostIntenseEvent?.date
                ? `${Number(mostIntenseEvent.daily_total || 0).toFixed(2)} in on ${formatDateForUi(mostIntenseEvent.date)}`
                : 'N/A',
            },
          ],
          columns: ['Date', '24-hour Rainfall (in)', 'Qualified'],
          rows: qualifyingRows.length ? qualifyingRows : [['N/A', '0.00', 'No']],
          chart: chartRows.length ? chartRows : [{ label: 'N/A', value: 0 }],
        };
      }

      if (selectedQuery === 'largest24h' && reportLocationData) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const sortedDailyTotals = [...dailyTotals].sort((a, b) => Number(b.daily_total || 0) - Number(a.daily_total || 0));
        const peakEvent = sortedDailyTotals[0] || { date: '', daily_total: 0 };
        const largest24hFromService = Number(reportLocationData.largest_24h_rainfall_total);
        const largest24hValue = Number.isFinite(largest24hFromService)
          ? largest24hFromService
          : Number(peakEvent.daily_total || 0);

        const topRows = sortedDailyTotals.slice(0, 10).map((entry) => [
          formatDateForUi(entry.date),
          reportLocationData.location_name || locationName,
          Number(entry.daily_total || 0).toFixed(2),
        ]);

        const chartRows = sortedDailyTotals.slice(0, 3).map((entry) => ({
          label: formatDateForUi(entry.date),
          value: Number(entry.daily_total || 0),
        }));

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: peakEvent?.date
            ? `The largest 24-hour rainfall total was ${formatRainValue(largest24hValue)} inches on ${formatDateForUi(peakEvent.date)}.`
            : `The largest 24-hour rainfall total was ${formatRainValue(largest24hValue)} inches.`,
          metrics: [
            { label: 'Largest 24-hour total', value: `${formatRainValue(largest24hValue)} in` },
            { label: 'Date', value: peakEvent?.date ? formatDateForUi(peakEvent.date) : 'N/A' },
            { label: 'Location', value: reportLocationData.location_name || locationName },
          ],
          columns: ['Date', 'Location', '24-hour Total (in)'],
          rows: topRows.length ? topRows : [['N/A', reportLocationData.location_name || locationName, '0.00']],
          chart: chartRows.length ? chartRows : [{ label: 'N/A', value: 0 }],
        };
      }

      if (selectedQuery === 'totalRain' && reportLocationData) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const totalRainfall = Number(reportLocationData.total_rainfall_selected_period || 0);
        const rainDays = dailyTotals.filter((entry) => Number(entry.daily_total || 0) > 0).length;
        const averagePerRainDay = rainDays ? totalRainfall / rainDays : 0;

        const midpoint = Math.floor(dailyTotals.length / 2);
        const firstHalfTotal = dailyTotals
          .slice(0, midpoint)
          .reduce((acc, entry) => acc + Number(entry.daily_total || 0), 0);
        const secondHalfTotal = dailyTotals
          .slice(midpoint)
          .reduce((acc, entry) => acc + Number(entry.daily_total || 0), 0);

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `Total rainfall in the selected period is ${formatRainValue(totalRainfall)} inches.`,
          metrics: [
            { label: 'Total rainfall', value: `${formatRainValue(totalRainfall)} in` },
            { label: 'Average per rain day', value: `${formatRainValue(averagePerRainDay)} in` },
            { label: 'Days with rain', value: String(rainDays) },
          ],
          columns: ['Period', 'Total Rainfall (in)'],
          rows: [
            ['First half of period', formatRainValue(firstHalfTotal)],
            ['Second half of period', formatRainValue(secondHalfTotal)],
          ],
          chart: [
            { label: 'First Half', value: Number(firstHalfTotal.toFixed(3)) },
            { label: 'Second Half', value: Number(secondHalfTotal.toFixed(3)) },
          ],
        };
      }


      if (selectedQuery === 'maxHourlyRainfall' && reportLocationData) {
        const maxRainfall = Number(reportLocationData.max_rainfall_inches || 0);
        const maxWindow = formatDateTimeFromSql(reportLocationData.max_window_start);
        const topPeriods = (reportLocationData.top_periods || []).slice(0, 10);
        const isRapidRain = (apiBackedResponse?.data_source || '').toLowerCase() === 'rapidrain';
        const intensitySeries = isRapidRain
          ? (reportLocationData.fifteen_min_series || []).map((point) => ({
            timestamp: point.bucket,
            rainfall_inches: point.rainfall_inches,
          }))
          : (reportLocationData.hourly_series || []).map((point) => ({
            timestamp: point.hour,
            rainfall_inches: point.rainfall_inches,
          }));

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `The highest hourly rainfall at ${reportLocationData.location_name || locationName} was ${formatRainValue(maxRainfall)} inches, occurring at ${maxWindow.time} on ${maxWindow.date}.`,
          metrics: [
            { label: 'Maximum hourly rainfall', value: `${formatRainValue(maxRainfall)} in` },
            { label: 'Date', value: maxWindow.date },
            { label: 'Time', value: maxWindow.time },
          ],
          columns: ['Date', 'Time', 'Rainfall (in)'],
          rows: topPeriods.length
            ? topPeriods.map((period) => {
              const start = formatDateTimeFromSql(period.window_start || period.hour_start);
              return [start.date, start.time, formatRainValue(period.rainfall_inches)];
            })
            : [['N/A', 'N/A', '0']],
          chart: intensitySeries.map((point) => {
            const ts = formatDateTimeFromSql(point.timestamp);
            return {
              label: `${ts.date} ${ts.time}`,
              value: Number(point.rainfall_inches || 0),
            };
          }),
        };
      }


      if (selectedQuery === 'maxRolling24hRainfall' && reportLocationData) {
        const rollingTotal = Number(reportLocationData.total_rainfall || 0);
        const begin = formatDateTimeFromSql(reportLocationData.begin_local_datetime);
        const end = formatDateTimeFromSql(reportLocationData.end_local_datetime);
        const topWindows = (reportLocationData.top_windows || []).slice(0, 10);
        const hourlySeries = reportLocationData.hourly_series || [];

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `The highest rolling 24-hour rainfall at ${reportLocationData.location_name || locationName} was ${formatRainValue(rollingTotal)} inches, occurring between ${begin.time} on ${begin.date} and ${end.time} on ${end.date}.`,
          metrics: [
            { label: 'Maximum rolling 24-hour rainfall', value: `${formatRainValue(rollingTotal)} in` },
            { label: 'Window start', value: `${begin.time} on ${begin.date}` },
            { label: 'Window end', value: `${end.time} on ${end.date}` },
          ],
          columns: ['Start', 'End', 'Rainfall (in)'],
          rows: topWindows.length
            ? topWindows.map((window) => {
              const wStart = formatDateTimeFromSql(window.begin_local_datetime);
              const wEnd = formatDateTimeFromSql(window.end_local_datetime);
              return [`${wStart.date} ${wStart.time}`, `${wEnd.date} ${wEnd.time}`, formatRainValue(window.rainfall_inches)];
            })
            : [['N/A', 'N/A', '0']],
          chart: hourlySeries.map((point) => {
            const ts = formatDateTimeFromSql(point.hour);
            return { label: `${ts.date} ${ts.time}`, value: Number(point.rainfall_inches || 0) };
          }),
        };
      }


      if (selectedQuery === 'designStormComparison' && reportLocationData) {
        const observed = Number(reportLocationData.observed_max_inches || reportLocationData.atlas14_comparison?.observed_inches || 0);
        const observedTs = formatDateTimeFromSql(reportLocationData.observed_max_datetime);
        const duration = reportLocationData.duration || designStormDuration;
        const comparisons = reportLocationData.atlas14_comparison?.comparisons || [];
        const highestExceeded = reportLocationData.atlas14_comparison?.highest_exceeded_return_period_years;
        const selectedReturn = Number(designStormReturnPeriod);
        const selectedExceeded = comparisons.find((c) => Number(c.return_period_years) === selectedReturn)?.exceeded;

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: selectedExceeded
            ? `The observed rainfall at ${reportLocationData.location_name || locationName} exceeded the ${selectedReturn}-year ${duration} design storm on ${observedTs.date} at ${observedTs.time} with ${formatRainValue(observed)} inches.`
            : `The observed rainfall at ${reportLocationData.location_name || locationName} did not exceed the ${selectedReturn}-year ${duration} design storm.`,
          metrics: [
            { label: 'Observed maximum', value: `${formatRainValue(observed)} in` },
            { label: 'Observed date/time', value: `${observedTs.date} ${observedTs.time}` },
            { label: 'Exceedance summary', value: reportLocationData.exceedance_summary || (highestExceeded ? `Exceeded ${highestExceeded}-year level` : 'This event remained below the 1-year level.') },
          ],
          columns: ['Return period (years)', 'Threshold (in)', 'Exceeded'],
          rows: comparisons.map((c) => [String(c.return_period_years), formatRainValue(c.threshold_inches), c.exceeded ? 'Yes' : 'No']),
          chart: comparisons.map((c) => ({ label: `${c.return_period_years}-yr`, value: Number(c.threshold_inches || 0) })),
        };
      }


      if (selectedQuery === 'stormEvents' && reportLocationData) {
        const events = reportLocationData.events || [];
        const largestEvent = [...events].sort((a, b) => Number(b.total_inches || 0) - Number(a.total_inches || 0))[0];
        const largestTotal = Number(largestEvent?.total_inches || 0);
        const largestDuration = Number(largestEvent?.duration_hours || 0);

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `The largest rainfall event at ${reportLocationData.location_name || locationName} produced ${formatRainValue(largestTotal)} inches over ${formatRainValue(largestDuration, 0)} hours.`,
          metrics: [
            { label: 'Event count', value: String(reportLocationData.event_count || events.length || 0) },
            { label: 'Largest event total', value: `${formatRainValue(largestTotal)} in` },
            { label: 'Gap boundary', value: `${reportLocationData.gap_hours || eventGapHours} hours` },
          ],
          columns: ['Start', 'End', 'Total (in)', 'Duration (hours)'],
          rows: events.map((event) => {
            const start = formatDateTimeFromSql(event.start_local_datetime);
            const end = formatDateTimeFromSql(event.end_local_datetime);
            return [`${start.date} ${start.time}`, `${end.date} ${end.time}`, formatRainValue(event.total_inches), formatRainValue(event.duration_hours, 0)];
          }),
          chart: events.map((event, idx) => ({
            label: `Event ${idx + 1}`,
            value: Number(event.total_inches || 0),
          })),
        };
      }

      if (apiBackedQueries.includes(selectedQuery)) {
        const isUnmappedLocation = Boolean(reportLocationData?.error?.toLowerCase?.().includes('mapped'));
        const noRainfallInPeriod = !isUnmappedLocation && ['avgDaily', 'avgMonthly'].includes(selectedQuery);
        const fallbackMessage = isUnmappedLocation
          ? 'This location is not currently mapped to rainfall data. Try selecting a different location.'
          : noRainfallInPeriod
            ? 'No measurable rainfall recorded during this period.'
            : 'No data returned for this query and selection.';
        return {
          id: locationId,
          locationName,
          headline: fallbackMessage,
          metrics: [
            { label: 'Status', value: 'No data' },
            { label: 'Date range', value: `${formatDateForUi(selectedDateRange.startDate)} - ${formatDateForUi(selectedDateRange.endDate)}` },
            ...(showThresholdInput ? [{ label: 'Threshold', value: threshold || 'N/A' }] : []),
          ],
          columns: ['Info', 'Value'],
          rows: [['Location', locationName], ['Result', 'No report data returned']],
          chart: [{ label: 'No Data', value: 0 }],
        };
      }

      return {
        id: locationId,
        locationName,
        headline: selectedResponse.headline.replace(/North Pump Station/g, locationName),
        metrics: selectedResponse.metrics.map((metric) => ({
          ...metric,
          value: metric.value.replace(/North Pump Station/g, locationName),
        })),
        columns: selectedResponse.columns,
        rows: selectedResponse.rows,
        chart: selectedResponse.chart.map((item) => ({
          ...item,
          value: Number((item.value + valueOffset).toFixed(2)),
        })),
      };
    });
  }, [availableLocations, analyzedLocations, selectedResponse, selectedQuery, apiBackedResponse, parsedThreshold, selectedDateRange, threshold, showThresholdInput, designStormDuration, designStormReturnPeriod, eventGapHours]);

  const handleLocationToggle = (locationId) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId],
    );
  };

  const handleLocationMultiSelectChange = (event) => {
    const selectedIds = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedLocations(selectedIds);
  };

  const handleExportCsv = () => {
    if (!['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents', 'largest24h', 'totalRain', 'maxHourlyRainfall', 'maxRolling24hRainfall', 'designStormComparison', 'stormEvents'].includes(selectedQuery) || !apiBackedResponse?.data?.length) {
      return;
    }

    const rows = [[
      'Location ID',
      'Location Name',
      'Date',
      'Daily Total (in)',
      selectedQuery === 'wettestMonth'
        ? 'Wettest Month'
        : selectedQuery === 'avgMonthly'
          ? 'Average Monthly Rainfall'
          : selectedQuery === 'avgDaily'
            ? 'Average Daily Rainfall'
            : selectedQuery === 'qualifyingEvents'
              ? 'Qualifying Rain Events'
              : selectedQuery === 'largest24h'
                ? 'Largest 24-hour Rainfall Total'
                : selectedQuery === 'maxRolling24hRainfall'
                  ? 'Maximum Rolling 24-hour Rainfall'
                  : selectedQuery === 'designStormComparison'
                    ? 'Design storm duration'
                  : selectedQuery === 'stormEvents'
                    ? 'Storm event segmentation'
                  : 'Total Rainfall Selected Period',
      selectedQuery === 'wettestMonth'
        ? 'Wettest Month Total (in)'
        : selectedQuery === 'avgMonthly'
          ? 'Average Monthly Rainfall (in)'
          : selectedQuery === 'avgDaily'
            ? 'Average Daily Rainfall (in)'
            : selectedQuery === 'qualifyingEvents'
              ? 'Qualifying Rain Events Count'
              : selectedQuery === 'largest24h'
                ? 'Largest 24-hour Rainfall Total (in)'
                : selectedQuery === 'maxRolling24hRainfall'
                  ? 'Maximum Rolling 24-hour Rainfall (in)'
                : selectedQuery === 'designStormComparison'
                  ? 'Observed Maximum (in)'
                : selectedQuery === 'stormEvents'
                  ? 'Storm Event Total (in)'
                : selectedQuery === 'maxHourlyRainfall'
                  ? 'Maximum Hourly Rainfall (in)'
                  : 'Total Rainfall Selected Period (in)',
    ]];

    apiBackedResponse.data.forEach((locationData) => {
      const reportMetricLabel = selectedQuery === 'wettestMonth'
        ? locationData.wettest_month_on_record?.month || ''
        : 'N/A';
      const reportMetricValue = selectedQuery === 'wettestMonth'
        ? (locationData.wettest_month_on_record?.total_rainfall ?? '')
        : selectedQuery === 'avgMonthly'
          ? (locationData.average_monthly_rainfall ?? '')
          : selectedQuery === 'avgDaily'
            ? (locationData.average_daily_rainfall ?? '')
            : selectedQuery === 'qualifyingEvents'
              ? (locationData.qualifying_rain_events_count ?? '')
              : selectedQuery === 'largest24h'
                ? (locationData.largest_24h_rainfall_total ?? '')
                : selectedQuery === 'maxRolling24hRainfall'
                  ? (locationData.total_rainfall ?? '')
                : selectedQuery === 'designStormComparison'
                  ? (locationData.observed_max_inches ?? '')
                : selectedQuery === 'stormEvents'
                  ? ((locationData.events || [])[0]?.total_inches ?? '')
                : selectedQuery === 'maxHourlyRainfall'
                  ? (locationData.max_rainfall_inches ?? '')
                  : (locationData.total_rainfall_selected_period ?? '');

      const rowSeries = selectedQuery === 'maxHourlyRainfall'
        ? (locationData.top_periods || []).map((period) => ({
          date: period.window_start || period.hour_start || '',
          value: period.rainfall_inches ?? '',
        }))
        : selectedQuery === 'maxRolling24hRainfall'
          ? (locationData.top_windows || []).map((window) => ({
            date: window.begin_local_datetime || '',
            value: window.rainfall_inches ?? '',
          }))
        : selectedQuery === 'designStormComparison'
          ? ((locationData.atlas14_comparison?.comparisons || []).map((cmp) => ({
            date: `${cmp.return_period_years}-year`,
            value: cmp.threshold_inches ?? '',
          })))
        : selectedQuery === 'stormEvents'
          ? ((locationData.events || []).map((event) => ({
            date: event.start_local_datetime || '',
            value: event.total_inches ?? '',
          })))
        : (locationData.daily_totals || []).map((dailyTotal) => ({
          date: dailyTotal.date || '',
          value: dailyTotal.daily_total ?? '',
        }));

      rowSeries.forEach((entry) => {
        rows.push([
          String(locationData.location_id ?? ''),
          locationData.location_name || '',
          entry.date || '',
          String(entry.value ?? ''),
          String(reportMetricLabel),
          String(reportMetricValue),
        ]);
      });
    });

    const escapeCsvValue = (value) => {
      const stringValue = String(value ?? '');
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replaceAll('"', '""')}"`;
      }
      return stringValue;
    };

    const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    const filenamePrefix = selectedQuery === 'wettestMonth'
      ? 'wettest-month-on-record'
      : selectedQuery === 'avgMonthly'
        ? 'average-monthly-rainfall'
        : selectedQuery === 'avgDaily'
          ? 'average-daily-rainfall'
          : selectedQuery === 'qualifyingEvents'
            ? 'qualifying-rain-events-count'
            : selectedQuery === 'largest24h'
              ? 'largest-24h-rainfall-total'
              : selectedQuery === 'maxHourlyRainfall'
                ? 'maximum-hourly-rainfall'
                : selectedQuery === 'maxRolling24hRainfall'
                  ? 'maximum-rolling-24h-rainfall'
                : selectedQuery === 'designStormComparison'
                  ? 'design-storm-comparison'
                : selectedQuery === 'stormEvents'
                  ? 'storm-events'
                : 'total-rainfall-selected-period';
    link.setAttribute('download', `${filenamePrefix}-${selectedDateRange.startDate}-to-${selectedDateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents', 'largest24h', 'totalRain', 'maxHourlyRainfall', 'maxRolling24hRainfall', 'designStormComparison', 'stormEvents'].includes(selectedQuery) || !apiBackedResponse?.data?.length) {
      return;
    }

    const escapeHtml = (value) =>
      String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');

    const selectedQueryLabel = queries.find((query) => query.value === selectedQuery)?.label || selectedQuery;
    const selectedLocationNames = selectedLocations
      .map((locationId) => availableLocations.find((location) => String(location.id) === String(locationId))?.name)
      .filter(Boolean);
    const selectedRangeLabel = timeRanges.find((range) => range.value === selectedRange)?.label || selectedRange;

    const querySpecificDailyTotalsLabel = {
      wettestMonth: 'Daily totals',
      avgMonthly: 'Daily detail',
      avgDaily: 'Daily totals',
      qualifyingEvents: 'Daily totals',
      largest24h: 'Daily totals',
      totalRain: 'Daily totals',
      maxHourlyRainfall: 'Top hourly periods',
      maxRolling24hRainfall: 'Top rolling 24-hour windows',
      designStormComparison: 'NOAA Atlas 14 comparison table',
      stormEvents: 'Storm events table',
    }[selectedQuery] || 'Daily totals';

    const reportSectionsHtml = selectedLocationResults.map((locationResult) => {
      const sourceData = apiBackedResponse.data.find(
        (item) => String(item.location_id) === String(locationResult.id),
      );

      const metricsHtml = locationResult.metrics
        .map(
          (metric) => `
            <div class="metric-card">
              <div class="metric-label">${escapeHtml(metric.label)}</div>
              <div class="metric-value">${escapeHtml(metric.value)}</div>
            </div>
          `,
        )
        .join('');

      const summaryRowsHtml = locationResult.rows
        .map(
          (row) => `
            <tr>
              ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
            </tr>
          `,
        )
        .join('');

      const fullJsonRowsHtml = (selectedQuery === 'maxHourlyRainfall' ? (sourceData?.top_periods || []).map((entry) => ({ date: entry.window_start || entry.hour_start, daily_total: entry.rainfall_inches })) : selectedQuery === 'maxRolling24hRainfall' ? (sourceData?.top_windows || []).map((entry) => ({ date: entry.begin_local_datetime, daily_total: entry.rainfall_inches })) : selectedQuery === 'designStormComparison' ? (sourceData?.atlas14_comparison?.comparisons || []).map((entry) => ({ date: `${entry.return_period_years}-year`, daily_total: entry.threshold_inches })) : selectedQuery === 'stormEvents' ? (sourceData?.events || []).map((entry) => ({ date: entry.start_local_datetime, daily_total: entry.total_inches })) : (sourceData?.daily_totals || []))
        .map(
          (entry) => `
            <tr>
              <td>${escapeHtml(entry.date)}</td>
              <td>${escapeHtml(Number(entry.daily_total || 0).toFixed(2))}</td>
            </tr>
          `,
        )
        .join('');

      return `
        <section class="location-section">
          <h2>${escapeHtml(locationResult.locationName)}</h2>
          <p class="headline">${escapeHtml(locationResult.headline)}</p>

          <div class="metrics-grid">${metricsHtml}</div>

          <h3>${escapeHtml(selectedQueryLabel)}</h3>
          <table>
            <thead>
              <tr>${locationResult.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>${summaryRowsHtml}</tbody>
          </table>

          <h3>${escapeHtml(querySpecificDailyTotalsLabel)}</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Daily Total (in)</th></tr>
            </thead>
            <tbody>${fullJsonRowsHtml || '<tr><td colspan="2">No daily totals returned.</td></tr>'}</tbody>
          </table>
        </section>
      `;
    }).join('');

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>RainIQ ${escapeHtml(selectedQueryLabel)} Report</title>
          <style>
            @page { margin: 24px 24px 56px; }
            body { font-family: Arial, sans-serif; color: #1e293b; margin: 24px; }
            h1 { color: #1f4f7a; margin-bottom: 8px; }
            h2 { color: #1f4f7a; margin: 0 0 8px; }
            h3 { margin: 18px 0 8px; color: #1f4f7a; }
            p { margin: 0 0 12px; }
            .subhead { color: #475569; font-size: 12px; margin-bottom: 20px; }
            .criteria-box { border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; margin-bottom: 20px; background: #f8fafc; }
            .criteria-title { margin: 0 0 8px; font-size: 14px; color: #1f4f7a; font-weight: 700; }
            .criteria-list { margin: 0; padding-left: 18px; }
            .criteria-list li { margin: 4px 0; font-size: 12px; }
            .location-section { border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px; margin-bottom: 24px; page-break-inside: avoid; }
            .headline { margin-bottom: 12px; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
            .metric-card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; }
            .metric-label { font-size: 11px; text-transform: uppercase; color: #64748b; }
            .metric-value { margin-top: 4px; font-weight: 700; color: #1f4f7a; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
            th, td { border-bottom: 1px solid #d1d5db; text-align: left; padding: 8px; font-size: 12px; }
            th { background: #f8fafc; font-weight: 700; }
            .bar-chart { margin: 6px 0 14px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; }
            .bar-row { display: grid; grid-template-columns: minmax(90px, 180px) 1fr 56px; gap: 8px; align-items: center; margin: 6px 0; }
            .bar-label { font-size: 11px; color: #334155; }
            .bar-wrap { background: #e2e8f0; height: 12px; border-radius: 999px; overflow: hidden; }
            .bar-fill { background: #1f4f7a; height: 100%; border-radius: 999px; }
            .bar-value { font-size: 11px; color: #1f4f7a; text-align: right; font-weight: 600; }
            .pdf-footer {
              position: fixed;
              bottom: 12px;
              left: 24px;
              right: 24px;
              font-size: 10px;
              color: #64748b;
              text-align: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
              background: #ffffff;
            }
          </style>
        </head>
        <body>
          <h1>RainIQ - ${escapeHtml(selectedQueryLabel)}</h1>
          <p class="subhead">
            Range: ${escapeHtml(formatDateForUi(selectedDateRange.startDate))} to ${escapeHtml(formatDateForUi(selectedDateRange.endDate))}
            &nbsp;|&nbsp; Calculation method: ${includeZeroDays ? 'All days (including dry days)' : 'Rain days only (>= 0.01 inches)'}
          </p>
          <div class="criteria-box">
            <p class="criteria-title">Search criteria</p>
            <ul class="criteria-list">
              <li><strong>Query:</strong> ${escapeHtml(selectedQueryLabel)}</li>
              <li><strong>Locations:</strong> ${escapeHtml(selectedLocationNames.join(', ') || 'None selected')}</li>
              <li><strong>Time range preset:</strong> ${escapeHtml(selectedRangeLabel)}</li>
              <li><strong>Date range:</strong> ${escapeHtml(selectedDateRange.startDate)} to ${escapeHtml(selectedDateRange.endDate)}</li>
              <li><strong>Calculation method:</strong> ${includeZeroDays ? 'All days (including dry days)' : 'Rain days only (>= 0.01 inches)'}</li>
              ${showThresholdInput ? `<li><strong>Threshold input:</strong> ${escapeHtml(threshold || 'N/A')} inches</li>` : ''}
            </ul>
          </div>
          ${reportSectionsHtml}
          <div class="pdf-footer">Based on National Weather Service 1-km gridded rainfall data, updated hourly.</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const runAnalysis = async () => {
    const queryConfig = {
      wettestMonth: {
        endpoint: '/api/reports/historical/metrics/wettest-month-on-record',
        setResponse: setWettestMonthResponse,
        setLoading: setWettestMonthLoading,
        setError: setWettestMonthError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      avgMonthly: {
        endpoint: '/api/reports/historical/metrics/average-monthly-rainfall',
        setResponse: setAvgMonthlyResponse,
        setLoading: setAvgMonthlyLoading,
        setError: setAvgMonthlyError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      avgDaily: {
        endpoint: '/api/reports/historical/metrics/average-daily-rainfall',
        setResponse: setAvgDailyResponse,
        setLoading: setAvgDailyLoading,
        setError: setAvgDailyError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      qualifyingEvents: {
        endpoint: '/api/reports/historical/metrics/qualifying-rain-events-count',
        setResponse: setQualifyingEventsResponse,
        setLoading: setQualifyingEventsLoading,
        setError: setQualifyingEventsError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      largest24h: {
        endpoint: '/api/reports/historical/metrics/largest-24h-rainfall-total',
        setResponse: setLargest24hResponse,
        setLoading: setLargest24hLoading,
        setError: setLargest24hError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      totalRain: {
        endpoint: '/api/reports/historical/metrics/total-rainfall-selected-period',
        setResponse: setTotalRainResponse,
        setLoading: setTotalRainLoading,
        setError: setTotalRainError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      maxHourlyRainfall: {
        endpoint: '/api/reports/historical/metrics/max-hourly-rainfall',
        setResponse: setMaxHourlyRainfallResponse,
        setLoading: setMaxHourlyRainfallLoading,
        setError: setMaxHourlyRainfallError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      maxRolling24hRainfall: {
        endpoint: '/api/reports/historical/metrics/max-rolling-24h-rainfall',
        setResponse: setMaxRolling24hRainfallResponse,
        setLoading: setMaxRolling24hRainfallLoading,
        setError: setMaxRolling24hRainfallError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      designStormComparison: {
        endpoint: '/api/reports/historical/metrics/design-storm-comparison',
        setResponse: setDesignStormComparisonResponse,
        setLoading: setDesignStormComparisonLoading,
        setError: setDesignStormComparisonError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
      stormEvents: {
        endpoint: '/api/reports/historical/metrics/storm-events',
        setResponse: setStormEventsResponse,
        setLoading: setStormEventsLoading,
        setError: setStormEventsError,
        invalidLocationMessage: 'This location is not currently mapped to rainfall data. Try selecting a different location.',
      },
    };

    const activeQueryConfig = queryConfig[selectedQuery];
    if (!activeQueryConfig) {
      return;
    }

    if (customRangeError) {
      activeQueryConfig.setError(customRangeError);
      activeQueryConfig.setResponse(null);
      setHasExecutedQuery(true);
      return;
    }

    const locationIds = selectedLocations
      .map((locationId) => Number(locationId))
      .filter((locationId) => Number.isInteger(locationId));

    if (!locationIds.length) {
      activeQueryConfig.setError('');
      activeQueryConfig.setResponse(null);
      setHasExecutedQuery(false);
      return;
    }

    setIsAnalyzing(true);
    activeQueryConfig.setLoading(true);
    activeQueryConfig.setError('');

    try {
      const { data } = await api.post(activeQueryConfig.endpoint, {
        start_date: selectedDateRange.startDate,
        end_date: selectedDateRange.endDate,
        location_ids: locationIds,
        include_zero_days: includeZeroDays,
        ...(showThresholdInput && parsedThreshold !== null ? { threshold_inches: parsedThreshold } : {}),
        ...(['maxHourlyRainfall', 'maxRolling24hRainfall', 'designStormComparison', 'stormEvents'].includes(selectedQuery) ? { data_source: 'hourly' } : {}),
      });

      activeQueryConfig.setResponse(data);
      setAnalyzedLocations(locationIds.map(String));
      setHasExecutedQuery(true);
    } catch (error) {
      activeQueryConfig.setResponse(null);
      activeQueryConfig.setError(error.message || 'Unable to load report data.');
      setHasExecutedQuery(true);
    } finally {
      activeQueryConfig.setLoading(false);
      setIsAnalyzing(false);
    }
  };

  const handleRequestSubmit = async (event) => {
    event.preventDefault();

    if (!requestText.trim()) {
      return;
    }

    try {
      const meResponse = await api.get('/users/me');
      const submitter = meResponse?.data || user || {};
      const submitterNameFromParts = `${submitter.first_name || ''} ${submitter.last_name || ''}`.trim();
      const submitterName = submitterNameFromParts || submitter.name || submitter.account_name || 'Unknown';
      const submitterEmail = submitter.email || submitter.invoice_email || 'Unknown';
      const queryLabel = queries.find((query) => query.value === selectedQuery)?.label || selectedQuery;
      const rangeLabel = timeRanges.find((range) => range.value === selectedRange)?.label || selectedRange;
      const selectedLocationNames = selectedLocations
        .map((locationId) => availableLocations.find((location) => String(location.id) === String(locationId))?.name)
        .filter(Boolean);

      const toEmail = VITE_SOCKETLABS_FROM_EMAIL;
      if (!toEmail) {
        throw new Error('SOCKETLABS_FROM_EMAIL is not configured.');
      }

      const emailSubject = `RainIQ new query request from ${submitterName}`;
      const emailTextBody = [
        'A new RainIQ query request was submitted.',
        '',
        `Submitted by: ${submitterName}`,
        `Submitter email: ${submitterEmail}`,
        '',
        'Report context:',
        `- Query type: ${queryLabel}`,
        `- Time range preset: ${rangeLabel}`,
        `- Date range: ${selectedDateRange.startDate} to ${selectedDateRange.endDate}`,
        `- Locations: ${selectedLocationNames.join(', ') || 'None selected'}`,
        `- Calculation method: ${includeZeroDays ? 'All days (including dry days)' : 'Rain days only (>= 0.01 inches)'}`,
        ...(showThresholdInput ? [`- Threshold input: ${threshold || 'N/A'} inches`] : []),
        '',
        'Requested new report details:',
        requestText.trim(),
      ].join('\n');

      const emailHtmlBody = `
        <h2>RainIQ New Query Request</h2>
        <p><strong>Submitted by:</strong> ${submitterName}</p>
        <p><strong>Submitter email:</strong> ${submitterEmail}</p>
        <h3>Report context</h3>
        <ul>
          <li><strong>Query type:</strong> ${queryLabel}</li>
          <li><strong>Time range preset:</strong> ${rangeLabel}</li>
          <li><strong>Date range:</strong> ${selectedDateRange.startDate} to ${selectedDateRange.endDate}</li>
          <li><strong>Locations:</strong> ${selectedLocationNames.join(', ') || 'None selected'}</li>
          <li><strong>Calculation method:</strong> ${includeZeroDays ? 'All days (including dry days)' : 'Rain days only (>= 0.01 inches)'}</li>
          ${showThresholdInput ? `<li><strong>Threshold input:</strong> ${threshold || 'N/A'} inches</li>` : ''}
        </ul>
        <h3>Requested new report details</h3>
        <p>${requestText.trim().replaceAll('\n', '<br />')}</p>
      `;

      const response = await fetch('/.netlify/functions/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail,
          subject: emailSubject,
          textBody: emailTextBody,
          htmlBody: emailHtmlBody,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to send request email.');
      }

      setRequestMessageType('success');
      setRequestMessage('Thanks — we’ve captured this request and emailed the RainIQ team.');
      setRequestText('');
    } catch (error) {
      setRequestMessageType('error');
      setRequestMessage(error.message || 'Unable to submit your request right now.');
    }
  };

  const periodLine = `Period: ${formatDateForUi(selectedDateRange.startDate)} to ${formatDateForUi(selectedDateRange.endDate)}`;
  const calculationLine = showCalculationMethod
    ? (includeZeroDays
      ? 'Calculated across all days in the selected period (including days with no rainfall).'
      : 'Calculated using only days with measurable rainfall (>= 0.01 inches; defined as a “rain day”), excluding dry days.')
    : 'Based on observed rainfall totals for the selected period.';
  const primaryHeadline = !hasExecutedQuery
    ? 'Select criteria and click Analyze to view rainfall trends.'
    : (selectedLocationResults[0]?.headline || 'Run a query to view rainfall insights for this location.');

  if (!canAccessRainIQ) {
    return (
      <div className="mt-40 px-6 pb-12">
        <div className="mx-auto max-w-4xl rounded-2xl border-2 border-[#ecbf1d] bg-white p-8 text-center shadow-lg dark:bg-slate-900">
          <h1 className="text-3xl font-bold text-[--main-2]">RainIQ</h1>
          <p className="mt-4 text-lg font-semibold">Unlock RainIQ insights</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            RainIQ is a premium analytics layer that turns your monitoring data into deterministic, location-specific insights.
          </p>
          <a
            href="/upgrade"
            className="mt-6 inline-block rounded-md bg-[--main-2] px-6 py-3 font-semibold text-white"
          >
            Upgrade to Access RainIQ
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-32 px-4 pb-12 md:mt-36 md:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-4 shadow-lg md:p-8 dark:bg-slate-900 dark:text-white">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-[--main-2]">RainIQ</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Verified rainfall analysis based on National Weather Service data for indicated locations
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4 md:col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">What do you want to analyze?</label>
            <select
              value={selectedQuery}
              onChange={(event) => setSelectedQuery(event.target.value)}
              className="w-full rounded border p-2 text-sm text-slate-800"
            >
              {Object.entries(reportOptions).map(([group, groupQueries]) => (
                <optgroup key={group} label={group}>
                  {groupQueries.map((query) => (
                    <option key={query.value} value={query.value}>
                      {query.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            {showThresholdInput && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-bold uppercase text-slate-500">Threshold (optional)</label>
                <input
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                  className="w-24 rounded border px-2 py-1 text-sm text-slate-800"
                />
                <span className="text-xs text-slate-500">inches</span>
              </div>
            )}

            {['maxHourlyRainfall', 'maxRolling24hRainfall', 'designStormComparison', 'stormEvents'].includes(selectedQuery) && (
              <div className="mt-3">
                <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Rainfall source</label>
                <select
                  value={hourlyDataSource}
                  onChange={(event) => setHourlyDataSource(event.target.value)}
                  className="w-full rounded border p-2 text-sm text-slate-800"
                >
                  {selectedQuery === 'maxHourlyRainfall' && <option value="rapidrain">RapidRain (15-minute rolling hour)</option>}
                  <option value="hourly">Hourly</option>
                </select>
              </div>
            )}


            {selectedQuery === 'designStormComparison' && (
              <div className="mt-3 grid gap-3">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Duration</p>
                  <label className="mt-1 mr-4 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="design-duration" checked={designStormDuration === '24h'} onChange={() => setDesignStormDuration('24h')} />24-hour
                  </label>
                  <label className="mt-1 inline-flex items-center gap-2 text-sm text-slate-700">
                    <input type="radio" name="design-duration" checked={designStormDuration === '1h'} onChange={() => setDesignStormDuration('1h')} />1-hour
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Return period</label>
                  <select value={designStormReturnPeriod} onChange={(event) => setDesignStormReturnPeriod(event.target.value)} className="w-full rounded border p-2 text-sm text-slate-800">
                    {[1,2,5,10,25,100].map((year) => <option key={year} value={String(year)}>{year}-year</option>)}
                  </select>
                </div>
              </div>
            )}

            {selectedQuery === 'stormEvents' && (
              <div className="mt-3">
                <label className="mb-1 block text-xs font-bold uppercase text-slate-500">Event gap boundary (hours)</label>
                <input
                  type="number"
                  min="1"
                  value={eventGapHours}
                  onChange={(event) => setEventGapHours(event.target.value)}
                  className="w-24 rounded border p-2 text-sm text-slate-800"
                />
              </div>
            )}

            {showCalculationMethod && (
              <div className="mt-3">
                <p className="text-xs font-bold uppercase text-slate-500">Calculation method</p>
                <label className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="calculation-method"
                    checked={calculationMethod === 'allDays'}
                    onChange={() => setCalculationMethod('allDays')}
                  />
                  All days (including dry days)
                </label>
                <label className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="calculation-method"
                    checked={calculationMethod === 'rainDaysOnly'}
                    onChange={() => setCalculationMethod('rainDaysOnly')}
                  />
                  Rain days only (&gt;= 0.01 inches)
                </label>
              </div>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Location(s)</label>
            {availableLocations.length > 5 ? (
              <select
                multiple
                value={selectedLocations}
                onChange={handleLocationMultiSelectChange}
                className="w-full rounded border p-2 text-sm text-slate-800"
                size={Math.min(availableLocations.length, 8)}
              >
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2">
                {availableLocations.map((location) => (
                  <label key={location.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location.id)}
                      onChange={() => handleLocationToggle(location.id)}
                    />
                    {location.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Time range</label>
            <select
              value={selectedRange}
              onChange={(event) => setSelectedRange(event.target.value)}
              className="w-full rounded border p-2 text-sm text-slate-800"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Data scope preview: {formatDateForUi(selectedDateRange.startDate)} to {formatDateForUi(selectedDateRange.endDate)}
            </p>
            {selectedRange === 'custom' && (
              <div className="mt-3 grid gap-2">
                <label className="text-xs font-bold uppercase text-slate-500">Custom start date</label>
                <input
                  type="date"
                  value={customStartDate}
                  max={customEndDate || undefined}
                  onChange={(event) => setCustomStartDate(event.target.value)}
                  className="rounded border p-2 text-sm text-slate-800"
                />
                <label className="text-xs font-bold uppercase text-slate-500">Custom end date</label>
                <input
                  type="date"
                  value={customEndDate}
                  min={customStartDate || undefined}
                  onChange={(event) => setCustomEndDate(event.target.value)}
                  className="rounded border p-2 text-sm text-slate-800"
                />
                {customRangeError && <p className="text-xs font-semibold text-red-600">{customRangeError}</p>}
              </div>
            )}
          </div>

        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="rounded-md bg-[--main-2] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Analyzing...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-[--main-2] bg-slate-50 p-4 dark:bg-slate-800">
          <h2 className="text-xl font-semibold">Headline Insight</h2>
          <p className="mt-2 text-base font-semibold">{primaryHeadline}</p>
          <p className="mt-2 text-sm">
            {periodLine}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            {calculationLine}
          </p>
        </div>

        {showDetailedView && (
          <div className="mt-3 flex items-center gap-3">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chart type</label>
            <select
              value={chartDisplayType}
              onChange={(event) => setChartDisplayType(event.target.value)}
              className="rounded border p-2 text-sm text-slate-800"
            >
              <option value="bar">Bar chart</option>
              <option value="line">Line chart</option>
            </select>
          </div>
        )}

        <div className="mt-4 flex items-center gap-3">
          <input
            id="detailed-view-toggle"
            type="checkbox"
            checked={showDetailedView}
            onChange={(event) => setShowDetailedView(event.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-xl font-semibold text-slate-700 dark:text-slate-200">
            Show specific dates and detail.
          </span>
        </div>

        {hasExecutedQuery && selectedQuery === 'wettestMonth' && wettestMonthLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading wettest month report data...</p>
        )}
        {selectedQuery === 'wettestMonth' && wettestMonthError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{wettestMonthError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'avgMonthly' && avgMonthlyLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading average monthly rainfall report data...</p>
        )}
        {selectedQuery === 'avgMonthly' && avgMonthlyError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{avgMonthlyError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'avgDaily' && avgDailyLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading average daily rainfall report data...</p>
        )}
        {selectedQuery === 'avgDaily' && avgDailyError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{avgDailyError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'qualifyingEvents' && qualifyingEventsLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading qualifying rain events report data...</p>
        )}
        {selectedQuery === 'qualifyingEvents' && qualifyingEventsError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{qualifyingEventsError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'largest24h' && largest24hLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading largest 24-hour rainfall total report data...</p>
        )}
        {selectedQuery === 'largest24h' && largest24hError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{largest24hError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'totalRain' && totalRainLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading total rainfall report data...</p>
        )}
        {selectedQuery === 'totalRain' && totalRainError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{totalRainError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'maxHourlyRainfall' && maxHourlyRainfallLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading maximum hourly rainfall report data...</p>
        )}
        {selectedQuery === 'maxHourlyRainfall' && maxHourlyRainfallError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{maxHourlyRainfallError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'maxRolling24hRainfall' && maxRolling24hRainfallLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading maximum rolling 24-hour rainfall report data...</p>
        )}
        {selectedQuery === 'maxRolling24hRainfall' && maxRolling24hRainfallError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{maxRolling24hRainfallError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'designStormComparison' && designStormComparisonLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading design storm comparison report data...</p>
        )}
        {selectedQuery === 'designStormComparison' && designStormComparisonError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{designStormComparisonError}</p>
        )}
        {hasExecutedQuery && selectedQuery === 'stormEvents' && stormEventsLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading storm events report data...</p>
        )}
        {selectedQuery === 'stormEvents' && stormEventsError && hasExecutedQuery && (
          <p className="mt-4 text-sm font-semibold text-red-600">{stormEventsError}</p>
        )}

        {hasExecutedQuery && !queryHasError && (
        <div className="mt-6 space-y-8">
          {selectedLocationResults.map((locationResult) => {
            const locationChartMax = Math.max(...locationResult.chart.map((item) => item.value), 1);

            return (
              <section key={locationResult.id} className="rounded-xl border p-4 md:p-5">
                <h3 className="text-lg font-semibold text-[--main-2]">{locationResult.locationName}</h3>
                <p className="mt-2 text-sm">{locationResult.headline}</p>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {locationResult.metrics.map((metric) => (
                    <div key={`${locationResult.id}-${metric.label}`} className="rounded-lg border p-4">
                      <div className="text-xs uppercase text-slate-500">{metric.label}</div>
                      <div className="mt-1 text-2xl font-bold text-[--main-2]">{metric.value}</div>
                    </div>
                  ))}
                </div>

                {showDetailedView && selectedQuery !== 'totalRain' && (
                  <div className="mt-6 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 text-lg font-semibold">{selectedQuery === 'maxHourlyRainfall' ? 'Top hourly rainfall periods' : selectedQuery === 'maxRolling24hRainfall' ? 'Top rolling 24-hour windows' : selectedQuery === 'designStormComparison' ? 'NOAA Atlas 14 comparisons' : selectedQuery === 'stormEvents' ? 'Storm event timelines' : 'Top rainfall days'}</h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                          <thead>
                            <tr className="border-b">
                              {locationResult.columns.map((column) => (
                                <th key={`${locationResult.id}-${column}`} className="px-2 py-2 font-semibold">{column}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {locationResult.rows.map((row, index) => (
                              <tr key={`${locationResult.id}-${row[0]}-${index}`} className="border-b last:border-0">
                                {row.map((cell, cellIndex) => (
                                  <td key={`${locationResult.id}-${cell}-${cellIndex}`} className="px-2 py-2">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h4 className="mb-3 text-lg font-semibold">{selectedQuery === 'maxHourlyRainfall' ? 'Hourly rainfall intensity over time' : selectedQuery === 'maxRolling24hRainfall' ? 'Rolling accumulation curve' : selectedQuery === 'designStormComparison' ? 'Design storm thresholds curve' : selectedQuery === 'stormEvents' ? 'Storm event totals' : 'Rainfall totals'}</h4>
                      {chartDisplayType === 'line' ? (
                        <div>
                          <svg viewBox="0 0 600 220" className="h-56 w-full rounded border bg-white" preserveAspectRatio="none">
                            {locationResult.chart.length > 1 && (
                              <polyline
                                fill="none"
                                stroke="#1f4f7a"
                                strokeWidth="3"
                                points={locationResult.chart
                                  .map((item, index) => {
                                    const x = (index / (locationResult.chart.length - 1)) * 560 + 20;
                                    const y = 200 - ((Number(item.value || 0) / locationChartMax) * 160 + 20);
                                    return `${x},${y}`;
                                  })
                                  .join(' ')}
                              />
                            )}
                            {locationResult.chart.map((item, index) => {
                              const x = locationResult.chart.length > 1
                                ? (index / (locationResult.chart.length - 1)) * 560 + 20
                                : 300;
                              const y = 200 - ((Number(item.value || 0) / locationChartMax) * 160 + 20);
                              return (
                                <circle key={`${locationResult.id}-pt-${item.label}-${index}`} cx={x} cy={y} r="5" fill="#1f4f7a">
                                  <title>{`${item.label}: ${item.value}`}</title>
                                </circle>
                              );
                            })}
                          </svg>
                          <div className="mt-2 max-h-20 overflow-auto text-xs text-slate-500">
                            {locationResult.chart.map((item) => `${item.label}: ${item.value}`).join(' • ')}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {locationResult.chart.map((item) => (
                            <div key={`${locationResult.id}-${item.label}`}>
                              <div className="mb-1 flex justify-between text-xs">
                                <span>{item.label}</span>
                                <span>{item.value}</span>
                              </div>
                              <div className="h-3 rounded bg-slate-200 dark:bg-slate-700">
                                <div
                                  className="h-3 rounded bg-[--main-2]"
                                  style={{ width: `${(item.value / locationChartMax) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            );
          })}
        </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-[--main-2] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleExportCsv}
            disabled={['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents', 'largest24h', 'totalRain', 'maxHourlyRainfall'].includes(selectedQuery) && !apiBackedResponse?.data?.length}
          >
            Export CSV
          </button>
          <button
            className="rounded-md border border-[--main-2] px-4 py-2 text-sm font-semibold text-[--main-2] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleExportPdf}
            disabled={['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents', 'largest24h', 'totalRain', 'maxHourlyRainfall'].includes(selectedQuery) && !apiBackedResponse?.data?.length}
          >
            Export PDF
          </button>
        </div>

        <div className="mt-8 rounded-lg border p-4">
          <h3 className="text-lg font-semibold">Request a new query</h3>
          <p className="mt-1 text-sm text-slate-500">
            Suggest an insight we should add to the structured catalog. We log account context, location count, date range, and query text.
          </p>
          <form onSubmit={handleRequestSubmit} className="mt-3 space-y-3">
            <textarea
              value={requestText}
              onChange={(event) => setRequestText(event.target.value)}
              placeholder="Example: Compare overnight qualifying events by location over the last 12 months."
              className="w-full rounded border p-3 text-sm text-slate-800"
              rows={3}
            />
            <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-slate-700">
              Submit request
            </button>
          </form>
          {requestMessage && (
            <p className={`mt-3 text-sm font-semibold ${requestMessageType === 'error' ? 'text-red-600' : 'text-green-600'}`}>
              {requestMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
