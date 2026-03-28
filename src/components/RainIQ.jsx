import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { convertTier } from '../utility/loginUser';
import { useFeatureFlags } from '@geejay/use-feature-flags';
import api from '../utility/api';
import { VITE_SOCKETLABS_FROM_EMAIL } from '../utility/constants';

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
  { group: 'Baseline Metrics', label: 'Average daily rainfall', value: 'avgDaily' },
  { group: 'Baseline Metrics', label: 'Average monthly rainfall', value: 'avgMonthly' },
  { group: 'Baseline Metrics', label: 'Wettest month on record', value: 'wettestMonth' },
  { group: 'Compliance & Threshold Queries', label: 'Count of qualifying rain events (> X inches)', value: 'qualifyingEvents' },
  { group: 'Compliance & Threshold Queries', label: 'Largest 24-hour rainfall total', value: 'largest24h' },
  { group: 'Compliance & Threshold Queries', label: 'Total rainfall for selected period', value: 'totalRain' },
  { group: 'Streak Analysis', label: 'Longest dry period', value: 'longestDry' },
  { group: 'Streak Analysis', label: 'Longest consecutive rainfall period', value: 'longestWet' },
  { group: 'Temporal Distribution', label: 'Most common rainfall time of day', value: 'commonTimeOfDay' },
  { group: 'Temporal Distribution', label: 'Rainfall by day of week', value: 'rainByDay' },
  { group: 'Limited Multi-Location', label: 'Location with highest rainfall in selected period', value: 'topLocation' },
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
      { label: 'Most intense event', value: '1.22 in on 01/23/2026' },
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

const groupedQueries = queries.reduce((acc, query) => {
  if (!acc[query.group]) {
    acc[query.group] = [];
  }
  acc[query.group].push(query);
  return acc;
}, {});

export default function RainIQ() {
  const user = useSelector((state) => state.userInfo.user);
  const { isActive } = useFeatureFlags();

  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedQuery, setSelectedQuery] = useState('avgDaily');
  const [threshold, setThreshold] = useState('');
  const [includeZeroDays, setIncludeZeroDays] = useState(true);
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

  const canAccessRainIQ = useMemo(() => {
    return convertTier(user) >= 3 || user.is_superuser || isActive('rainIQ');
  }, [user, isActive]);

  const selectedDateRange = useMemo(() => getRangeDates(selectedRange), [selectedRange]);
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
  const selectedResponse = mockResponses[selectedQuery] ?? mockResponses.avgDaily;
  const apiBackedResponse = selectedQuery === 'wettestMonth'
    ? wettestMonthResponse
    : selectedQuery === 'avgMonthly'
      ? avgMonthlyResponse
      : selectedQuery === 'avgDaily'
        ? avgDailyResponse
        : selectedQuery === 'qualifyingEvents'
          ? qualifyingEventsResponse
      : null;

  const locationOptions = [
    ...(user.locations || []).slice(0, 5).map((loc) => ({ id: String(loc.id), name: loc.name })),
  ];

  const fallbackLocations = [
    { id: 'north-pump', name: 'North Pump Station' },
    { id: 'west-yard', name: 'West Yard' },
    { id: 'east-basin', name: 'East Basin' },
  ];

  const availableLocations = locationOptions.length ? locationOptions : fallbackLocations;

  const [selectedLocations, setSelectedLocations] = useState(
    locationOptions.length ? [locationOptions[0].id] : ['north-pump'],
  );

  const selectedLocationResults = useMemo(() => {
    const reportDataByLocation = new Map(
      (apiBackedResponse?.data || []).map((locationData) => [String(locationData.location_id), locationData]),
    );

    const activeLocations = selectedLocations.length
      ? selectedLocations
      : availableLocations.slice(0, 1).map((location) => location.id);

    return activeLocations.map((locationId, index) => {
      const locationName = availableLocations.find((location) => location.id === locationId)?.name || 'Selected location';
      const valueOffset = index * 0.09;
      const reportLocationData = reportDataByLocation.get(locationId);

      if (selectedQuery === 'wettestMonth' && reportLocationData?.wettest_month_on_record) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const sortedMonthTotals = {};

        dailyTotals.forEach((entry) => {
          const month = entry.date.slice(0, 7);
          sortedMonthTotals[month] = Number(((sortedMonthTotals[month] || 0) + (entry.daily_total || 0)).toFixed(2));
        });

        const rankedMonths = Object.entries(sortedMonthTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        const topMonth = rankedMonths[0];
        const monthLabel = topMonth ? formatMonthForUi(topMonth[0]) : 'N/A';
        const topMonthTotal = Number(topMonth?.[1] || 0).toFixed(2);
        const nextClosest = rankedMonths[1];
        const summaryRows = rankedMonths.map(([month, total], rankIndex) => [
          formatMonthShortForUi(month),
          Number(total || 0).toFixed(2),
          String(rankIndex + 1),
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
          chart: rankedMonths.map(([month, total]) => ({
            label: formatMonthShortForUi(month),
            value: Number(total || 0),
          })),
        };
      }

      if (selectedQuery === 'avgMonthly' && reportLocationData) {
        const dailyTotals = reportLocationData.daily_totals || [];
        const sortedMonthTotals = {};

        dailyTotals.forEach((entry) => {
          const month = entry.date.slice(0, 7);
          sortedMonthTotals[month] = Number(((sortedMonthTotals[month] || 0) + (entry.daily_total || 0)).toFixed(2));
        });

        const rankedMonths = Object.entries(sortedMonthTotals)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3);

        const analyzedMonthCount = Object.keys(sortedMonthTotals).length;
        const monthlyAverage = Number(reportLocationData.average_monthly_rainfall || 0);
        const highestMonth = rankedMonths[0];

        return {
          id: locationId,
          locationName: reportLocationData.location_name || locationName,
          headline: `Average monthly rainfall is ${monthlyAverage.toFixed(2)} inches.`,
          metrics: [
            { label: 'Monthly average', value: `${monthlyAverage.toFixed(2)} in` },
            { label: 'Months analyzed', value: String(analyzedMonthCount || 0) },
            {
              label: 'Highest month',
              value: highestMonth?.[0]
                ? `${formatMonthForUi(highestMonth[0])} (${Number(highestMonth[1] || 0).toFixed(2)} in)`
                : 'N/A',
            },
          ],
          columns: ['Month', 'Total Rainfall (in)', 'Rank'],
          rows: rankedMonths.map(([month, total], rankIndex) => [
            formatMonthShortForUi(month),
            Number(total || 0).toFixed(2),
            String(rankIndex + 1),
          ]),
          chart: rankedMonths.map(([month, total]) => ({
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
          headline: `Average daily rainfall for the selected period is ${averageDaily.toFixed(2)} inches.`,
          metrics: [
            { label: 'Average daily total', value: `${averageDaily.toFixed(2)} in` },
            { label: 'Rain days', value: `${rainDaysCount} of ${dayCount || 0} days` },
            {
              label: 'Peak day',
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
          headline: `There were ${Number(reportLocationData.qualifying_rain_events_count || 0)} qualifying rain events above ${effectiveThreshold.toFixed(2)} inches in the selected window.`,
          metrics: [
            { label: 'Threshold', value: `${effectiveThreshold.toFixed(2)} in` },
            { label: 'Qualifying events', value: String(reportLocationData.qualifying_rain_events_count || 0) },
            {
              label: 'Most intense event',
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
  }, [availableLocations, selectedLocations, selectedResponse, selectedQuery, apiBackedResponse, parsedThreshold]);

  const handleLocationToggle = (locationId) => {
    setSelectedLocations((prev) =>
      prev.includes(locationId)
        ? prev.filter((id) => id !== locationId)
        : [...prev, locationId],
    );
  };

  const handleExportCsv = () => {
    if (!['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents'].includes(selectedQuery) || !apiBackedResponse?.data?.length) {
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
            : 'Qualifying Rain Events',
      selectedQuery === 'wettestMonth'
        ? 'Wettest Month Total (in)'
        : selectedQuery === 'avgMonthly'
          ? 'Average Monthly Rainfall (in)'
          : selectedQuery === 'avgDaily'
            ? 'Average Daily Rainfall (in)'
            : 'Qualifying Rain Events Count',
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
            : (locationData.qualifying_rain_events_count ?? '');

      (locationData.daily_totals || []).forEach((dailyTotal) => {
        rows.push([
          String(locationData.location_id ?? ''),
          locationData.location_name || '',
          dailyTotal.date || '',
          String(dailyTotal.daily_total ?? ''),
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
          : 'qualifying-rain-events-count';
    link.setAttribute('download', `${filenamePrefix}-${selectedDateRange.startDate}-to-${selectedDateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents'].includes(selectedQuery) || !apiBackedResponse?.data?.length) {
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

      const chartRowsHtml = locationResult.chart
        .map(
          (item) => `
            <tr>
              <td>${escapeHtml(item.label)}</td>
              <td>${escapeHtml(Number(item.value || 0).toFixed(2))}</td>
            </tr>
          `,
        )
        .join('');

      const fullJsonRowsHtml = (sourceData?.daily_totals || [])
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

          <h3>Supporting table</h3>
          <table>
            <thead>
              <tr>${locationResult.columns.map((column) => `<th>${escapeHtml(column)}</th>`).join('')}</tr>
            </thead>
            <tbody>${summaryRowsHtml}</tbody>
          </table>

          <h3>Supporting chart values</h3>
          <table>
            <thead>
              <tr><th>Label</th><th>Value</th></tr>
            </thead>
            <tbody>${chartRowsHtml}</tbody>
          </table>

          <h3>Full JSON values</h3>
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
          </style>
        </head>
        <body>
          <h1>RainIQ - ${escapeHtml(selectedQueryLabel)}</h1>
          <p class="subhead">
            Range: ${escapeHtml(formatDateForUi(selectedDateRange.startDate))} to ${escapeHtml(formatDateForUi(selectedDateRange.endDate))}
            &nbsp;|&nbsp; Include zero-rain days: ${includeZeroDays ? 'Yes' : 'No'}
          </p>
          <div class="criteria-box">
            <p class="criteria-title">Search criteria</p>
            <ul class="criteria-list">
              <li><strong>Query:</strong> ${escapeHtml(selectedQueryLabel)}</li>
              <li><strong>Locations:</strong> ${escapeHtml(selectedLocationNames.join(', ') || 'None selected')}</li>
              <li><strong>Time range preset:</strong> ${escapeHtml(selectedRangeLabel)}</li>
              <li><strong>Date range:</strong> ${escapeHtml(selectedDateRange.startDate)} to ${escapeHtml(selectedDateRange.endDate)}</li>
              <li><strong>Include zero-rain days:</strong> ${includeZeroDays ? 'Yes' : 'No'}</li>
              <li><strong>Threshold input:</strong> ${escapeHtml(threshold || 'N/A')} inches</li>
            </ul>
          </div>
          ${reportSectionsHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    const queryConfig = {
      wettestMonth: {
        endpoint: '/api/reports/historical/metrics/wettest-month-on-record',
        setResponse: setWettestMonthResponse,
        setLoading: setWettestMonthLoading,
        setError: setWettestMonthError,
        invalidLocationMessage: 'Wettest Month on Record requires mapped account locations.',
      },
      avgMonthly: {
        endpoint: '/api/reports/historical/metrics/average-monthly-rainfall',
        setResponse: setAvgMonthlyResponse,
        setLoading: setAvgMonthlyLoading,
        setError: setAvgMonthlyError,
        invalidLocationMessage: 'Average Monthly Rainfall requires mapped account locations.',
      },
      avgDaily: {
        endpoint: '/api/reports/historical/metrics/average-daily-rainfall',
        setResponse: setAvgDailyResponse,
        setLoading: setAvgDailyLoading,
        setError: setAvgDailyError,
        invalidLocationMessage: 'Average Daily Rainfall requires mapped account locations.',
      },
      qualifyingEvents: {
        endpoint: '/api/reports/historical/metrics/qualifying-rain-events-count',
        setResponse: setQualifyingEventsResponse,
        setLoading: setQualifyingEventsLoading,
        setError: setQualifyingEventsError,
        invalidLocationMessage: 'Qualifying Rain Events requires mapped account locations.',
      },
    };

    const activeQueryConfig = queryConfig[selectedQuery];
    const fetchReportData = async () => {
      if (!activeQueryConfig) {
        return;
      }

      const locationIds = selectedLocations
        .map((locationId) => Number(locationId))
        .filter((locationId) => Number.isInteger(locationId));

      if (!locationIds.length) {
        activeQueryConfig.setError(activeQueryConfig.invalidLocationMessage);
        activeQueryConfig.setResponse(null);
        return;
      }

      activeQueryConfig.setLoading(true);
      activeQueryConfig.setError('');

      try {
        const { data } = await api.post(activeQueryConfig.endpoint, {
          start_date: selectedDateRange.startDate,
          end_date: selectedDateRange.endDate,
          location_ids: locationIds,
          include_zero_days: includeZeroDays,
          ...(parsedThreshold !== null ? { threshold_inches: parsedThreshold } : {}),
        });

        activeQueryConfig.setResponse(data);
      } catch (error) {
        activeQueryConfig.setResponse(null);
        activeQueryConfig.setError(error.message || 'Unable to load report data.');
      } finally {
        activeQueryConfig.setLoading(false);
      }
    };

    fetchReportData();
  }, [selectedQuery, selectedLocations, selectedDateRange, includeZeroDays, parsedThreshold]);

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
        `- Include zero-rain days: ${includeZeroDays ? 'Yes' : 'No'}`,
        `- Threshold input: ${threshold || 'N/A'} inches`,
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
          <li><strong>Include zero-rain days:</strong> ${includeZeroDays ? 'Yes' : 'No'}</li>
          <li><strong>Threshold input:</strong> ${threshold || 'N/A'} inches</li>
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
            Deterministic rainfall analytics with structured intents and evidence-backed outputs.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-4">
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Location(s)</label>
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
          </div>

          <div className="rounded-lg border p-4 md:col-span-2">
            <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Structured query catalog</label>
            <select
              value={selectedQuery}
              onChange={(event) => setSelectedQuery(event.target.value)}
              className="w-full rounded border p-2 text-sm text-slate-800"
            >
              {Object.entries(groupedQueries).map(([group, groupQueries]) => (
                <optgroup key={group} label={group}>
                  {groupQueries.map((query) => (
                    <option key={query.value} value={query.value}>
                      {query.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>

            <div className="mt-3 flex items-center gap-3">
              <label className="text-xs font-bold uppercase text-slate-500">Threshold (optional)</label>
              <input
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className="w-24 rounded border px-2 py-1 text-sm text-slate-800"
              />
              <span className="text-xs text-slate-500">inches</span>
            </div>

            <label className="mt-3 inline-flex items-center gap-2 text-xs font-bold uppercase text-slate-500">
              <input
                type="checkbox"
                checked={includeZeroDays}
                onChange={(event) => setIncludeZeroDays(event.target.checked)}
              />
              Include zero-rain days
            </label>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-[--main-2] bg-slate-50 p-4 dark:bg-slate-800">
          <h2 className="text-xl font-semibold">Headline Insight</h2>
          <p className="mt-2 text-base">
            Showing deterministic analytics for {selectedLocationResults.length} selected location{selectedLocationResults.length === 1 ? '' : 's'}.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            Based on monitoring data from {formatDateForUi(selectedDateRange.startDate)} to {formatDateForUi(selectedDateRange.endDate)}. RainIQ runs deterministic analytics and does not use third-party AI.
          </p>
        </div>

        {selectedQuery === 'wettestMonth' && wettestMonthLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading wettest month report data...</p>
        )}
        {selectedQuery === 'wettestMonth' && wettestMonthError && (
          <p className="mt-4 text-sm font-semibold text-red-600">{wettestMonthError}</p>
        )}
        {selectedQuery === 'avgMonthly' && avgMonthlyLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading average monthly rainfall report data...</p>
        )}
        {selectedQuery === 'avgMonthly' && avgMonthlyError && (
          <p className="mt-4 text-sm font-semibold text-red-600">{avgMonthlyError}</p>
        )}
        {selectedQuery === 'avgDaily' && avgDailyLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading average daily rainfall report data...</p>
        )}
        {selectedQuery === 'avgDaily' && avgDailyError && (
          <p className="mt-4 text-sm font-semibold text-red-600">{avgDailyError}</p>
        )}
        {selectedQuery === 'qualifyingEvents' && qualifyingEventsLoading && (
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading qualifying rain events report data...</p>
        )}
        {selectedQuery === 'qualifyingEvents' && qualifyingEventsError && (
          <p className="mt-4 text-sm font-semibold text-red-600">{qualifyingEventsError}</p>
        )}

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

                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <h4 className="mb-3 text-lg font-semibold">Supporting table</h4>
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
                    <h4 className="mb-3 text-lg font-semibold">Supporting chart</h4>
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
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-md bg-[--main-2] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleExportCsv}
            disabled={['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents'].includes(selectedQuery) && !apiBackedResponse?.data?.length}
          >
            Export CSV
          </button>
          <button
            className="rounded-md border border-[--main-2] px-4 py-2 text-sm font-semibold text-[--main-2] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleExportPdf}
            disabled={['wettestMonth', 'avgMonthly', 'avgDaily', 'qualifyingEvents'].includes(selectedQuery) && !apiBackedResponse?.data?.length}
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
