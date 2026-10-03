import { CsvValidationResult, CsvValidationError } from '../types/campaign';

export const REQUIRED_CSV_COLUMNS = [
  'campaign_name',
  'date',
  'platform',
  'audience',
  'reach',
  'impressions',
  'engagement',
  'clicks',
  'conversions',
  'spend',
];

export function parseCsvText(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  return lines.map((line) => {
    // Handle simple CSV splitting with potential quotes
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^["']|["']$/g, ''));
    return values;
  });
}

export function validateCsvData(csvText: string): CsvValidationResult {
  const rows = parseCsvText(csvText);

  if (rows.length === 0) {
    return {
      valid: false,
      total_rows: 0,
      errors: [
        {
          row: 0,
          column: 'File',
          problem: 'CSV file is empty.',
          suggested_fix: 'Please select a valid CSV file with header and data rows.',
        },
      ],
      warnings: [],
    };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().trim().replace(/[\s_-]+/g, '_'));
  const headerMap = new Map<string, number>();
  rawHeaders.forEach((h, idx) => headerMap.set(h, idx));

  const missingColumns = REQUIRED_CSV_COLUMNS.filter((col) => !headerMap.has(col));
  if (missingColumns.length > 0) {
    return {
      valid: false,
      total_rows: rows.length - 1,
      errors: [
        {
          row: 1,
          column: 'Header',
          problem: `Missing required column(s): ${missingColumns.join(', ')}`,
          suggested_fix: `Include all mandatory headers: ${REQUIRED_CSV_COLUMNS.join(', ')}`,
        },
      ],
      warnings: [],
    };
  }

  const errors: CsvValidationError[] = [];
  const warnings: string[] = [];
  const parsedRecords: Array<Record<string, any>> = [];

  let detectedCampaign = '';
  const detectedDates: string[] = [];

  // Validate data rows (1-indexed for human readability, row 2 is first data row)
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const rowNum = r + 1; // Row in sheet

    if (row.length === 0 || (row.length === 1 && !row[0])) {
      continue; // Skip blank line
    }

    const campaign_name = (row[headerMap.get('campaign_name')!] || '').trim();
    const dateStr = (row[headerMap.get('date')!] || '').trim();
    const platform = (row[headerMap.get('platform')!] || '').trim();
    const audience = (row[headerMap.get('audience')!] || '').trim();

    if (!campaign_name) {
      errors.push({
        row: rowNum,
        column: 'campaign_name',
        problem: 'Campaign name is blank.',
        suggested_fix: 'Provide a non-empty campaign title string.',
      });
    } else if (!detectedCampaign) {
      detectedCampaign = campaign_name;
    }

    if (!dateStr || isNaN(Date.parse(dateStr))) {
      errors.push({
        row: rowNum,
        column: 'date',
        problem: `Invalid date format '${dateStr}'.`,
        suggested_fix: 'Use ISO format (YYYY-MM-DD) or standard date (YYYY/MM/DD).',
      });
    } else {
      detectedDates.push(dateStr);
    }

    const parseNum = (colName: string): number => {
      const valStr = row[headerMap.get(colName)!] || '0';
      const clean = valStr.replace(/[^0-9.-]/g, '');
      const num = Number(clean);
      if (isNaN(num)) {
        errors.push({
          row: rowNum,
          column: colName,
          problem: `Non-numeric value '${valStr}' found.`,
          suggested_fix: 'Provide a valid positive number.',
        });
        return 0;
      }
      return num;
    };

    const reach = parseNum('reach');
    const impressions = parseNum('impressions');
    const engagement = parseNum('engagement');
    const clicks = parseNum('clicks');
    const conversions = parseNum('conversions');
    const spend = parseNum('spend');

    // Rule: No negative values
    if (reach < 0) {
      errors.push({ row: rowNum, column: 'reach', problem: `Negative reach (${reach})`, suggested_fix: 'Reach must be >= 0' });
    }
    if (impressions < 0) {
      errors.push({ row: rowNum, column: 'impressions', problem: `Negative impressions (${impressions})`, suggested_fix: 'Impressions must be >= 0' });
    }
    if (engagement < 0) {
      errors.push({ row: rowNum, column: 'engagement', problem: `Negative engagement (${engagement})`, suggested_fix: 'Engagement must be >= 0' });
    }
    if (clicks < 0) {
      errors.push({ row: rowNum, column: 'clicks', problem: `Negative clicks (${clicks})`, suggested_fix: 'Clicks must be >= 0' });
    }
    if (conversions < 0) {
      errors.push({ row: rowNum, column: 'conversions', problem: `Negative conversions (${conversions})`, suggested_fix: 'Conversions must be >= 0' });
    }
    if (spend < 0) {
      errors.push({ row: rowNum, column: 'spend', problem: `Negative spend (${spend})`, suggested_fix: 'Spend must be >= 0' });
    }

    // Logic constraints:
    // Clicks cannot exceed impressions
    if (clicks > impressions && impressions > 0) {
      errors.push({
        row: rowNum,
        column: 'clicks',
        problem: `Clicks (${clicks}) exceeds impressions (${impressions}).`,
        suggested_fix: 'Clicks cannot be greater than total impressions.',
      });
    }

    // Conversions cannot exceed clicks
    if (conversions > clicks && clicks > 0) {
      errors.push({
        row: rowNum,
        column: 'conversions',
        problem: `Conversions (${conversions}) exceeds clicks (${clicks}).`,
        suggested_fix: 'Conversions cannot exceed clicks for the same row.',
      });
    }

    // Engagement cannot exceed impressions
    if (engagement > impressions && impressions > 0) {
      errors.push({
        row: rowNum,
        column: 'engagement',
        problem: `Engagement (${engagement}) exceeds impressions (${impressions}).`,
        suggested_fix: 'Engagement events should not exceed total impressions.',
      });
    }

    parsedRecords.push({
      campaign_name,
      date: dateStr,
      platform,
      audience,
      reach,
      impressions,
      engagement,
      clicks,
      conversions,
      spend,
    });
  }

  let dateRangeStr = '';
  if (detectedDates.length > 0) {
    const sorted = [...detectedDates].sort();
    dateRangeStr = `${sorted[0]} to ${sorted[sorted.length - 1]}`;
  }

  return {
    valid: errors.length === 0,
    total_rows: parsedRecords.length,
    errors,
    warnings,
    campaign_name_detected: detectedCampaign || 'Uploaded Campaign',
    date_range_detected: dateRangeStr,
    parsed_records: parsedRecords,
  };
}

// Generate sample CSV text for user download
export function generateSampleCsv(): string {
  const header = REQUIRED_CSV_COLUMNS.join(',');
  const sampleRows = [
    'Summer Sale Campaign,2026-09-01,Instagram,18–24,42000,75000,6800,4100,240,38000',
    'Summer Sale Campaign,2026-09-01,Instagram,25–34,48000,89000,7400,5200,410,46000',
    'Summer Sale Campaign,2026-09-01,Facebook,35–44,22000,41000,2800,2100,125,23000',
    'Summer Sale Campaign,2026-09-01,Google Ads,45+,13000,25000,1500,1000,55,13000',
    'Summer Sale Campaign,2026-09-08,Instagram,18–24,41000,74000,6500,4050,235,37500',
    'Summer Sale Campaign,2026-09-08,Instagram,25–34,49000,91000,7600,5300,420,47000',
    'Summer Sale Campaign,2026-09-15,Facebook,35–44,23000,42000,2900,2150,130,23500',
    'Summer Sale Campaign,2026-09-22,Google Ads,45+,13500,26000,1600,1050,60,13500',
  ];
  return [header, ...sampleRows].join('\n');
}

export function downloadSampleCsvFile(): void {
  const csvContent = generateSampleCsv();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'sample_marketing_campaign_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
