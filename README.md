# Asset Price Analyzer

A web tool for analyzing in-game asset prices using statistical modeling. Users can input their buy and sell prices to see where they fall on the price distribution and make data-driven trading decisions.

## Features

- **Statistical Analysis**: Uses a Gaussian Mixture Model (GMM) to accurately model price distributions
- **Buy Price Analysis**: See your price percentile and how it compares to the market
- **Sell Price Analysis**: Calculate profit, ROI, and expected wait time for better prices
- **Interactive Charts**: Visualize price distributions with your buy/sell positions
- **Dark Theme**: Clean, modern dark interface
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Fast & Lightweight**: Pure client-side calculations, no backend needed

## Technology Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Chart.js** - Interactive charts
- **Vercel** - Deployment platform

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Enter your **buy price** (required)
2. Optionally enter your **sell price**
3. Click **Analyze** to see:
   - Your price percentile
   - How good your buy/sell is
   - Expected profit and ROI
   - Wait time for better prices
   - Visual price distribution

### Example Test Values

- **1200**: Good buy (≈24th percentile)
- **2000**: Average buy (≈60th percentile)
- **3500**: Poor buy (≈84th percentile)
- **4500**: Jackpot price (≈93rd percentile)

## Distribution Model

The tool uses a bimodal Gaussian Mixture Model:

**Price ~ 0.779 × N(1691, 606²) + 0.221 × N(3742, 714²)**

Where:
- 77.9% of prices fall in the "normal" cluster (mean: 1691)
- 22.1% of prices fall in the "jackpot" cluster (mean: 3742)

## Deployment

### Deploy to Vercel

The easiest way to deploy is using Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or manually:

```bash
npm run build
```

The app is optimized for Vercel deployment with zero configuration needed.

## License

MIT
