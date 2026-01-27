# Provider Analytics Dashboard

A responsive web application for analyzing healthcare provider visit metrics with week-over-week data visualization and advanced filtering capabilities.

## Features

- **Excel File Upload**: Upload and parse Excel files containing provider visit data
- **Advanced Filtering**: 
  - Multi-select provider filter with search
  - Week range selector with quick select options
  - Metric selection
  - Threshold filtering (% Over 20 Min)
- **Data Visualizations**:
  - Week-over-week line chart with multiple providers
  - Provider comparison bar chart
  - Interactive charts with tooltips and legends
- **Summary Statistics**: Aggregate metrics with trend indicators
- **Data Table**: Sortable, paginated table with CSV export
- **Responsive Design**: Works on mobile, tablet, and desktop devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **SheetJS (xlsx)** for Excel file parsing

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. The default Excel file (`Doxy - Over 20 minutes (9).xlsx`) is already in the `public` folder and will be automatically loaded when the app starts.

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

The application will automatically load and parse the Excel file on startup. You can also upload a different file if needed.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Excel File Format

The application expects an Excel file with the following structure:

- **First Column**: Provider names
- **Subsequent Columns**: Week data grouped by week, with columns for:
  - Total Visits
  - Visits Over 20 Minutes
  - % Over 20 Minutes
  - Average Duration (minutes)
  - Hours on 20+ Min Visits (optional)

Example structure:
```
Provider | Week of 11/1 Total | Week of 11/1 Over 20 | Week of 11/1 % | Week of 11/1 Avg | Week of 11/8 Total | ...
---------+-------------------+---------------------+----------------+------------------+-------------------+---
Alexis   | 41                | 6                   | 14.6           | 18.5             | 57                | ...
```

The parser is flexible and will attempt to detect week patterns automatically.

## Usage

1. **Automatic Data Load**: The application automatically loads the default Excel file (`Doxy - Over 20 minutes (9).xlsx`) from the public folder when it starts
2. **Upload New Data** (optional): Click or drag-and-drop a different Excel file to upload and replace the default data
2. **Apply Filters**: Use the filter panel to narrow down the data:
   - Select specific providers or keep all selected
   - Choose a week range or use quick select options
   - Set a minimum threshold for % Over 20 Min
3. **View Charts**: 
   - Switch between metrics in the line chart
   - Compare providers in the bar chart
   - Hover over data points for detailed information
4. **Explore Data**: 
   - Sort the data table by clicking column headers
   - Navigate through pages
   - Export filtered data to CSV

## Project Structure

```
src/
├── components/
│   ├── Charts/
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   └── ChartControls.tsx
│   ├── Filters/
│   │   ├── ProviderFilter.tsx
│   │   ├── WeekRangeFilter.tsx
│   │   ├── MetricFilter.tsx
│   │   └── ThresholdFilter.tsx
│   ├── DataTable.tsx
│   ├── SummaryCards.tsx
│   ├── FileUpload.tsx
│   └── Header.tsx
├── hooks/
│   ├── useFilters.ts
│   └── useChartData.ts
├── utils/
│   ├── dataParser.ts
│   ├── dataTransformer.ts
│   ├── calculations.ts
│   └── exportHelpers.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## License

MIT

