# 📊 Break-Even Calculator

A modern, interactive React + TypeScript web app designed to help finance teams in SaaS businesses calculate break-even points, model profitability, and analyze cost structures with ease.

## 🚀 Features

- ✅ **Add Fixed & Variable Expenses**
- ✅ **Create and Manage Product Classes**
- ✅ **Automatic Break-Even Analysis**
- ✅ **Scenario Planning Based on Sales Volume**
- ✅ **Dynamic Charts & Tables (Coming Soon)**
- ✅ **Export Data as JSON**

## 📐 How It Works

Break-even units are calculated per product using:

Break-even Units = Total Fixed Costs / Contribution Margin

markdown
Copy
Edit

Where:

- `Contribution Margin = Price - Variable Cost per Unit`
- Revenue to break-even and estimated monthly profits are also calculated.

Scenario planning uses different sales volumes to show:
- Revenue
- Total cost (including shared variable expenses)
- Profit/Loss
- Profit Margin

## 📷 Screenshots

> Add screenshots or GIFs here to showcase the UI

## 🛠️ Tech Stack

- **React** + **TypeScript**
- **TailwindCSS** + **ShadCN-style UI**
- **Lucide Icons**
- (Optional: Chart.js or Recharts for future data visualization)

## 📦 Installation

```bash
git clone https://github.com/your-username/break-even-calculator.git
cd break-even-calculator
npm install
npm run dev
Then open http://localhost:5173 (or whatever port Vite/React uses).

📁 File Structure
plaintext
Copy
Edit
src/
├── components/
├── BreakEvenCalculator.tsx
├── App.tsx
├── index.tsx
public/
README.md
package.json
✨ Coming Soon
📈 Visual charts for break-even analysis and profit simulation

📄 PDF report export

🔁 Save/load multiple product scenarios

🔐 Auth and user dashboard

🤝 Contributing
Pull requests are welcome! To contribute:

Fork the repo

Create a feature branch

Submit a pull request describing your changes

🧠 Inspiration
Inspired by real-world needs of SaaS founders, CFOs, and analysts to visualize when their product turns profitable — and how pricing, cost control, or sales volume impacts that journey.
