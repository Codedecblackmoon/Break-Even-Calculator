import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, DollarSign, Package, Plus, Trash2, Download, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';

// TypeScript interfaces
interface Expense {
  id: string;
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
  category: string;
}

interface ProductClass {
  id: string;
  name: string;
  price: number;
  variableCostPerUnit: number;
  estimatedMonthlyVolume: number;
}

interface BreakEvenResult {
  productId: string;
  productName: string;
  breakEvenUnits: number;
  revenueToBreakEven: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  profitAtEstimatedVolume: number;
}

interface ScenarioAnalysis {
  volume: number;
  revenue: number;
  totalCosts: number;
  profit: number;
  profitMargin: number;
}

const BreakEvenCalculator: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<ProductClass[]>([]);
  const [results, setResults] = useState<BreakEvenResult[]>([]);
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'products' | 'results' | 'scenarios'>('expenses');

  // Form states
  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    type: 'fixed' as 'fixed' | 'variable',
    category: 'Operations'
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    variableCostPerUnit: '',
    estimatedMonthlyVolume: ''
  });

  const expenseCategories = [
    'Operations', 'Marketing', 'Sales', 'Technology', 'HR', 'Legal', 'Finance', 'Other'
  ];

  // Calculate totals
  const totalFixedCosts = expenses
    .filter(e => e.type === 'fixed')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalVariableCosts = expenses
    .filter(e => e.type === 'variable')
    .reduce((sum, e) => sum + e.amount, 0);

  // Add expense
  const addExpense = () => {
    if (newExpense.name && newExpense.amount) {
      const expense: Expense = {
        id: Date.now().toString(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount),
        type: newExpense.type,
        category: newExpense.category
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ name: '', amount: '', type: 'fixed', category: 'Operations' });
    }
  };

  // Add product
  const addProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.variableCostPerUnit) {
      const product: ProductClass = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        variableCostPerUnit: parseFloat(newProduct.variableCostPerUnit),
        estimatedMonthlyVolume: parseFloat(newProduct.estimatedMonthlyVolume) || 0
      };
      setProducts([...products, product]);
      setNewProduct({ name: '', price: '', variableCostPerUnit: '', estimatedMonthlyVolume: '' });
    }
  };

  // Calculate break-even analysis
  useEffect(() => {
    if (products.length === 0) {
      setResults([]);
      setScenarioAnalysis([]);
      return;
    }

    const newResults: BreakEvenResult[] = products.map(product => {
      // Contribution Margin = Price - Variable Cost per Unit (product-specific only)
      const contributionMargin = product.price - product.variableCostPerUnit;
      
      // Contribution Margin Ratio = Contribution Margin / Price
      const contributionMarginRatio = product.price > 0 ? contributionMargin / product.price : 0;
      
      // Break-even Units = Total Fixed Costs / Contribution Margin
      const breakEvenUnits = contributionMargin > 0 ? totalFixedCosts / contributionMargin : 0;
      
      // Revenue to Break Even = Break-even Units × Price
      const revenueToBreakEven = breakEvenUnits * product.price;
      
      // Profit at Estimated Volume = (Estimated Volume × Contribution Margin) - Fixed Costs
      const profitAtEstimatedVolume = (product.estimatedMonthlyVolume * contributionMargin) - totalFixedCosts;

      return {
        productId: product.id,
        productName: product.name,
        breakEvenUnits: Math.ceil(breakEvenUnits),
        revenueToBreakEven,
        contributionMargin,
        contributionMarginRatio,
        profitAtEstimatedVolume
      };
    });

    setResults(newResults);

    // Generate scenario analysis - Mixed product portfolio
    const scenarios: ScenarioAnalysis[] = [];
    
    // Calculate total estimated volume and weighted average contribution margin
    const totalEstimatedVolume = products.reduce((sum, product) => sum + product.estimatedMonthlyVolume, 0);
    const weightedAvgContributionMargin = totalEstimatedVolume > 0 
      // ? products.reduce((sum, product) => 
      //     sum + (product.contributionMargin * product.estimatedMonthlyVolume), 0) / totalEstimatedVolume
      // : 0;
      ? products.reduce((sum, product) => {
          const result = newResults.find(r => r.productId === product.id);
          return sum + ((result?.contributionMargin || 0) * product.estimatedMonthlyVolume);
        }, 0) / totalEstimatedVolume
      : 0;

    // Use the product mix to calculate realistic scenarios
    const baseVolumes = totalEstimatedVolume > 0 
      ? [
          Math.floor(totalEstimatedVolume * 0.5),
          Math.floor(totalEstimatedVolume * 0.75),
          totalEstimatedVolume,
          Math.floor(totalEstimatedVolume * 1.25),
          Math.floor(totalEstimatedVolume * 1.5),
          Math.floor(totalEstimatedVolume * 2)
        ]
      : [50, 100, 200, 300, 400, 500]; // Default volumes if no estimates

    baseVolumes.forEach(totalVolume => {
      if (totalVolume > 0) {
        let totalRevenue = 0;
        let totalVariableCostsForVolume = 0;

        // Calculate revenue and variable costs based on product mix
        products.forEach(product => {
          // Distribute volume proportionally based on estimated volumes
          const productVolume = totalEstimatedVolume > 0 
            ? Math.floor((product.estimatedMonthlyVolume / totalEstimatedVolume) * totalVolume)
            : Math.floor(totalVolume / products.length); // Equal distribution if no estimates

          totalRevenue += product.price * productVolume;
          totalVariableCostsForVolume += product.variableCostPerUnit * productVolume;
        });

        // Add shared variable costs
        totalVariableCostsForVolume += totalVariableCosts;

        const totalCosts = totalFixedCosts + totalVariableCostsForVolume;
        const profit = totalRevenue - totalCosts;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        scenarios.push({
          volume: totalVolume,
          revenue: totalRevenue,
          totalCosts,
          profit,
          profitMargin
        });
      }
    });

    setScenarioAnalysis(scenarios);
  }, [expenses, products, totalFixedCosts, totalVariableCosts]);

  // Export data
  const exportData = () => {
    const data = {
      expenses,
      products,
      results,
      totals: {
        totalFixedCosts,
        totalVariableCosts,
        totalCosts: totalFixedCosts + totalVariableCosts
      },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `break-even-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

    // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setExpenses([]);
      setProducts([]);
      setResults([]);
      setScenarioAnalysis([]);
      setNewExpense({ name: '', amount: '', type: 'fixed', category: 'Operations' });
      setNewProduct({ name: '', price: '', variableCostPerUnit: '', estimatedMonthlyVolume: '' });
      setActiveTab('expenses');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Break-Even Calculator</h1>
                <p className="text-gray-600">BulaBooks Financial analysis tool</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear All</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'expenses', label: 'Expenses', icon: DollarSign },
              { id: 'products', label: 'Products', icon: Package },
              { id: 'results', label: 'Results', icon: TrendingUp },
              { id: 'scenarios', label: 'Scenarios', icon: BarChart3 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Expense</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Expense name"
                  value={newExpense.name}
                  onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Amount (R)"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({...newExpense, type: e.target.value as 'fixed' | 'variable'})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fixed">Fixed Cost</option>
                  <option value="variable">Variable Cost</option>
                </select>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={addExpense}
                className="mt-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Expense</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Fixed Costs */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Costs</h3>
                <div className="space-y-3">
                  {expenses.filter(e => e.type === 'fixed').map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium text-gray-900">{expense.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({expense.category})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                        <button
                          onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Fixed Costs:</span>
                    <span className="text-lg font-bold text-red-600">{formatCurrency(totalFixedCosts)}</span>
                  </div>
                </div>
              </div>

              {/* Variable Costs */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Variable Costs</h3>
                <div className="space-y-3">
                  {expenses.filter(e => e.type === 'variable').map(expense => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div>
                        <span className="font-medium text-gray-900">{expense.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({expense.category})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</span>
                        <button
                          onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Variable Costs:</span>
                    <span className="text-lg font-bold text-orange-600">{formatCurrency(totalVariableCosts)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Product name (e.g., Basic, Pro)"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Price per unit (R)"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Variable cost per unit (R)"
                  value={newProduct.variableCostPerUnit}
                  onChange={(e) => setNewProduct({...newProduct, variableCostPerUnit: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Estimated monthly volume"
                  value={newProduct.estimatedMonthlyVolume}
                  onChange={(e) => setNewProduct({...newProduct, estimatedMonthlyVolume: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addProduct}
                className="mt-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Classes</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Monthly Volume</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map(product => (
                      <tr key={product.id}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.variableCostPerUnit)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatNumber(product.estimatedMonthlyVolume)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <button
                            onClick={() => setProducts(products.filter(p => p.id !== product.id))}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-8">
            {results.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Add expenses and products to see break-even analysis</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Fixed Costs</h3>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(totalFixedCosts)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Variable Costs</h3>
                    <p className="text-3xl font-bold text-orange-600">{formatCurrency(totalVariableCosts)}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Products</h3>
                    <p className="text-3xl font-bold text-blue-600">{products.length}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Break-Even Analysis by Product</h3>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
                      <p><strong>Formula:</strong> Break-even Units = Total Fixed Costs ÷ Contribution Margin</p>
                      <p><strong>Where:</strong> Contribution Margin = Price - Variable Cost per Unit</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variable Cost</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contribution Margin</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin %</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Break-Even Units</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue to Break-Even</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit at Est. Volume</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.map(result => {
                          const product = products.find(p => p.id === result.productId);
                          return (
                            <tr key={result.productId}>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.productName}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product?.price || 0)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product?.variableCostPerUnit || 0)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{formatCurrency(result.contributionMargin)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{(result.contributionMarginRatio * 100).toFixed(1)}%</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{formatNumber(result.breakEvenUnits)}</td>
                              <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(result.revenueToBreakEven)}</td>
                              <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${result.profitAtEstimatedVolume >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(result.profitAtEstimatedVolume)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-8">
            {scenarioAnalysis.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Add expenses and products to see scenario analysis</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Analysis</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Costs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit/Loss</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {scenarioAnalysis.map((scenario, index) => (
                        <tr key={index}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatNumber(scenario.volume)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(scenario.revenue)}</td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(scenario.totalCosts)}</td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${scenario.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(scenario.profit)}
                          </td>
                          <td className={`px-4 py-4 whitespace-nowrap text-sm font-medium ${scenario.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {scenario.profitMargin.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BreakEvenCalculator;