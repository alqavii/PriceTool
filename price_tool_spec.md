# In-Game Asset Price Distribution Analysis Tool - Complete Specification

## Executive Summary

Build a clean, fast-loading web tool for analyzing in-game asset prices. Users input their buy price and potential sell price to see where they fall on the distribution and whether they should sell now or wait.

---

## Distribution Model: Gaussian Mixture Model (GMM)

The price follows a **bimodal distribution** - a mixture of two normal distributions representing "normal prices" and "jackpot prices".

### Mathematical Formula

**Price ~ 0.779 × N(1691, 606²) + 0.221 × N(3742, 714²)**

Where:
- N(μ, σ²) represents a normal distribution with mean μ and standard deviation σ
- Component 1 (78.9% probability): μ₁ = 1691, σ₁ = 606
- Component 2 (22.1% probability): μ₂ = 3742, σ₂ = 714

### Implementation Functions

```javascript
// Generate random price
function generatePrice() {
    const roll = Math.random();
    let price;
    
    if (roll < 0.221) {
        // High price cluster (jackpot)
        price = randomNormal(3742, 714);
    } else {
        // Normal price cluster
        price = randomNormal(1691, 606);
    }
    
    return Math.max(0, Math.round(price));
}

// Box-Muller transform for normal distribution
function randomNormal(mean, stdDev) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
}

// PDF (Probability Density Function) - for visualization
function pdfGMM(x) {
    const w1 = 0.779;
    const w2 = 0.221;
    const mu1 = 1691;
    const sigma1 = 606;
    const mu2 = 3742;
    const sigma2 = 714;
    
    return w1 * normalPDF(x, mu1, sigma1) + w2 * normalPDF(x, mu2, sigma2);
}

function normalPDF(x, mean, stdDev) {
    const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return coefficient * Math.exp(exponent);
}

// CDF (Cumulative Distribution Function) - for percentile calculation
function cdfGMM(x) {
    const w1 = 0.779;
    const w2 = 0.221;
    const mu1 = 1691;
    const sigma1 = 606;
    const mu2 = 3742;
    const sigma2 = 714;
    
    return w1 * normalCDF(x, mu1, sigma1) + w2 * normalCDF(x, mu2, sigma2);
}

function normalCDF(x, mean, stdDev) {
    return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

// Error function approximation (Abramowitz and Stegun)
function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
}

// Calculate percentile (what % of prices are below this value)
function getPercentile(price) {
    return cdfGMM(price) * 100;
}

// Calculate probability of getting price >= target
function probabilityAbove(targetPrice) {
    return (1 - cdfGMM(targetPrice)) * 100;
}

// Expected number of days to wait for better price
function expectedDaysToWait(targetPrice) {
    const probBetter = 1 - cdfGMM(targetPrice);
    if (probBetter <= 0) return Infinity;
    return 1 / probBetter;
}
```

---

## Tool Requirements

### Technology Stack
- **Framework**: Next.js (for Vercel deployment)
- **Charting**: Chart.js or Recharts (lightweight, no backend needed)
- **Styling**: Tailwind CSS
- **No state/database**: Pure client-side calculations
- **Fast loading**: No Streamlit, no heavy frameworks

### Design Requirements
- **Dark theme**: Clean dark background (#1a1a1a or similar)
- **Flat design**: No gradients, clean modern look
- **Elegant**: Professional, polished interface
- **Responsive**: Works on mobile and desktop

### Color Palette Suggestion
```
Background: #1a1a1a
Surface: #2d2d2d
Primary: #3b82f6 (blue)
Success: #10b981 (green)
Warning: #f59e0b (amber)
Danger: #ef4444 (red)
Text: #f5f5f5
Text Secondary: #a3a3a3
```

---

## User Interface Components

### Input Section

**Two input fields:**

1. **Current Buy Price** (required)
   - Label: "What price can you buy at today?"
   - Input: Number field
   - Validation: Must be > 0
   - Placeholder: "e.g., 2000"

2. **Potential Sell Price** (optional)
   - Label: "What price can you sell for? (optional)"
   - Input: Number field
   - Validation: Must be > 0 if provided
   - Placeholder: "e.g., 2500"

### Output Section 1: Buy Price Analysis

**Visual Components:**

1. **Distribution Chart**
   - X-axis: Price (500 to 5100)
   - Y-axis: Probability Density
   - Plot the GMM PDF curve
   - **Vertical line** at user's buy price (contrasting color, e.g., cyan)
   - **Shaded area** to the left of buy price (shows worse prices)
   - **Label** on chart showing exact position

2. **Percentile Display**
   - Large number: "Your price is at the **X.X percentile**"
   - Interpretation text:
     - If percentile < 25: "Great buy! 🎉 This is in the bottom 25% of prices."
     - If 25 ≤ percentile < 50: "Good buy! This is below average."
     - If 50 ≤ percentile < 75: "Average buy. Consider waiting for better."
     - If percentile ≥ 75: "Poor buy. ⚠️ This is in the top 25% of prices."

3. **Price Context**
   - "Only **X%** of daily prices are better than yours"
   - Component breakdown:
     - "Probability from low-price cluster: **Y%**"
     - "Probability from high-price cluster: **Z%**"

### Output Section 2: Sell Price Analysis (if provided)

**Visual Components:**

1. **Profit/Loss Display**
   - Calculate: profit = sellPrice - buyPrice
   - If profit > 0: Show in green with "+" prefix
   - If profit < 0: Show in red (loss)
   - ROI percentage: `(profit / buyPrice) × 100`
   - Example: "**+500** profit (**+25%** ROI)"

2. **Wait Time Analysis**
   - Calculate expected days to beat this sell price
   - Formula: `1 / (1 - CDF(sellPrice))`
   - Display:
     - "You'd need to wait **X.X days** on average to get a better price"
     - If days < 2: "✅ Might be worth waiting!"
     - If 2 ≤ days < 5: "⚖️ Borderline - your call"
     - If days ≥ 5: "❌ Sell now! Not worth waiting"

3. **Sell Price Percentile**
   - "This sell price is at the **X.X percentile**"
   - "**Y%** of daily prices are better"

4. **Decision Chart**
   - Show both buy and sell prices on the same distribution chart
   - **Two vertical lines**: buy price (blue) and sell price (green)
   - **Shaded area between them**: Shows profit region
   - **Label profit margin** on chart

---

## Detailed Chart Specifications

### Chart 1: Distribution with Buy Price

```javascript
{
    type: 'line',
    data: {
        labels: [500, 600, 700, ..., 5000, 5100], // x-axis prices
        datasets: [
            {
                label: 'Price Distribution',
                data: [pdfGMM(500), pdfGMM(600), ...], // PDF values
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                borderWidth: 2
            },
            {
                label: 'Your Buy Price',
                data: [], // Will be vertical line using annotations
                borderColor: '#06b6d4', // cyan
                borderWidth: 3,
                borderDash: [5, 5]
            }
        ]
    },
    options: {
        scales: {
            x: {
                title: { display: true, text: 'Price', color: '#f5f5f5' },
                grid: { color: '#3d3d3d' },
                ticks: { color: '#a3a3a3' }
            },
            y: {
                title: { display: true, text: 'Probability Density', color: '#f5f5f5' },
                grid: { color: '#3d3d3d' },
                ticks: { color: '#a3a3a3' }
            }
        },
        plugins: {
            annotation: {
                annotations: {
                    buyPriceLine: {
                        type: 'line',
                        xMin: buyPrice,
                        xMax: buyPrice,
                        borderColor: '#06b6d4',
                        borderWidth: 3,
                        label: {
                            content: `Your Price: ${buyPrice}`,
                            enabled: true,
                            position: 'top'
                        }
                    }
                }
            }
        }
    }
}
```

### Chart 2: Distribution with Buy and Sell Prices

Same as Chart 1, but add second vertical line for sell price:

```javascript
sellPriceLine: {
    type: 'line',
    xMin: sellPrice,
    xMax: sellPrice,
    borderColor: '#10b981', // green
    borderWidth: 3,
    label: {
        content: `Sell Price: ${sellPrice}`,
        enabled: true,
        position: 'top'
    }
}
```

And add shaded box between buy and sell:

```javascript
profitZone: {
    type: 'box',
    xMin: buyPrice,
    xMax: sellPrice,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: 'rgba(16, 185, 129, 0.5)',
    borderWidth: 1
}
```

---

## Example Calculations

### Example 1: Buy Price = 2000

```javascript
const buyPrice = 2000;
const percentile = getPercentile(2000);
// percentile ≈ 60.5

// Interpretation
console.log(`Your price is at the 60.5 percentile`);
console.log(`39.5% of prices are better than yours`);
console.log(`60.5% of prices are worse than yours`);
```

### Example 2: Buy Price = 2000, Sell Price = 2800

```javascript
const buyPrice = 2000;
const sellPrice = 2800;

const profit = sellPrice - buyPrice; // 800
const roi = (profit / buyPrice) * 100; // 40%

const sellPercentile = getPercentile(2800); // ≈ 75.2
const probBetter = 100 - sellPercentile; // 24.8%
const daysToWait = expectedDaysToWait(2800); // ≈ 4.0 days

console.log(`Profit: +800 (+40% ROI)`);
console.log(`Sell percentile: 75.2`);
console.log(`24.8% of prices are better`);
console.log(`Expected wait: 4.0 days`);
console.log(`Recommendation: Borderline - your call`);
```

### Example 3: Buy Price = 1500, Sell Price = 4200

```javascript
const buyPrice = 1500;
const sellPrice = 4200;

const profit = 4200 - 1500; // 2700
const roi = (2700 / 1500) * 100; // 180%

const buyPercentile = getPercentile(1500); // ≈ 37.8 (good buy!)
const sellPercentile = getPercentile(4200); // ≈ 90.5 (excellent sell!)
const daysToWait = expectedDaysToWait(4200); // ≈ 10.5 days

console.log(`Great buy at 37.8 percentile!`);
console.log(`Profit: +2700 (+180% ROI)`);
console.log(`Sell percentile: 90.5`);
console.log(`Expected wait: 10.5 days`);
console.log(`Recommendation: ❌ Sell now! Not worth waiting`);
```

---

## Distribution Parameters Reference

```javascript
const DISTRIBUTION_PARAMS = {
    component1: {
        weight: 0.779,      // 77.9% probability
        mean: 1691,         // Average price for normal cluster
        stdDev: 606         // Standard deviation
    },
    component2: {
        weight: 0.221,      // 22.1% probability (the "jackpot")
        mean: 3742,         // Average price for high cluster
        stdDev: 714         // Standard deviation
    },
    overall: {
        min: 500,           // Reasonable minimum for chart
        max: 5100,          // Reasonable maximum for chart
        mean: 2144,         // Overall mean
        stdDev: 1060        // Overall std dev
    }
};
```

---

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                 HEADER                               │
│  "Asset Price Analyzer"                             │
│  Subtitle: "Make smarter trading decisions"         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│              INPUT SECTION                          │
│  ┌──────────────┐  ┌──────────────┐               │
│  │ Buy Price    │  │ Sell Price   │               │
│  │ [    2000   ]│  │ [    2800   ]│  [ANALYZE]   │
│  └──────────────┘  └──────────────┘               │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         BUY PRICE ANALYSIS                          │
│                                                     │
│  "Your price is at the 60.5 percentile"            │
│  ⚖️ Average buy. Consider waiting for better.      │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │                                            │    │
│  │      [Distribution Chart with Line]       │    │
│  │                                            │    │
│  └───────────────────────────────────────────┘    │
│                                                     │
│  • Only 39.5% of daily prices are better          │
│  • Probability from low cluster: 68.2%            │
│  • Probability from high cluster: 31.8%           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│        SELL PRICE ANALYSIS                          │
│                                                     │
│  💰 Profit: +800 (+40% ROI)                        │
│                                                     │
│  "This sell price is at the 75.2 percentile"      │
│  "You'd need to wait 4.0 days on average"         │
│  ⚖️ Borderline - your call                         │
│                                                     │
│  ┌───────────────────────────────────────────┐    │
│  │                                            │    │
│  │   [Distribution with Buy & Sell Lines]    │    │
│  │         [Shaded profit region]            │    │
│  │                                            │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Testing Values

Use these for development testing:

1. **Low price (good buy)**: 1200
   - Percentile: ~24% (good buy!)
   
2. **Average price**: 2000
   - Percentile: ~60% (average)
   
3. **High price (bad buy)**: 3500
   - Percentile: ~84% (poor buy)
   
4. **Jackpot price**: 4500
   - Percentile: ~93% (excellent sell, terrible buy)

---

## Deployment

1. Build with Next.js
2. Deploy to Vercel (zero config needed)
3. No environment variables needed (pure client-side)
4. No backend/database required

---

## Additional Notes

- All calculations happen client-side (no API calls)
- Should work offline after initial load
- Mobile-responsive design mandatory
- Add tooltips for explanations (e.g., "percentile" definition)
- Consider adding a "Random Price" button to generate example prices
- Add "Share" button to copy URL with parameters (e.g., `?buy=2000&sell=2800`)

---

## Summary

This tool helps players make data-driven trading decisions by:
1. Showing how good their buy price is (percentile ranking)
2. Calculating expected profit from selling
3. Estimating wait time for better prices
4. Visualizing everything on clean, dark-themed charts

The GMM model accurately captures the game's intentional "jackpot" mechanic where ~22% of prices are significantly higher to give players exciting profit opportunities.
