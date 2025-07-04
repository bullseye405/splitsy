# 📊 Advanced Dashboard Analytics

**Status:** 📋 Planned  
**Priority:** ⭐ High-Impact  
**Estimated Time:** 5-6 days  
**Dependencies:** Categories, Chart library (Recharts)

## 📝 **Overview**

Create comprehensive dashboard analytics with interactive charts showing spending trends, category breakdowns, and participant contributions for better financial insights.

## 🎯 **Goals**

1. **Visual Analytics:** Interactive charts and graphs
2. **Multiple Views:** Monthly trends, category breakdown, participant analysis
3. **Export Capability:** Download charts as images
4. **Real-time Updates:** Dynamic chart updates with new data

## 🔧 **Technical Implementation**

### **Chart Library Setup**

```bash
# Install Recharts for React charts
npm install recharts
npm install @types/recharts --save-dev
```

### **Analytics Data Processing**

```typescript
// src/hooks/useAnalytics.ts
import { useMemo } from 'react';
import { Expense } from '@/types/expense';
import { Category } from '@/types/category';
import { Participant } from '@/types/participants';

export interface AnalyticsData {
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  participantContributions: ParticipantContribution[];
  totalSpending: number;
  averageExpense: number;
  expenseCount: number;
}

interface MonthlyTrend {
  month: string;
  spending: number;
  income: number;
  expenseCount: number;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

interface ParticipantContribution {
  participant: string;
  paid: number;
  owes: number;
  balance: number;
}

export function useAnalytics(
  expenses: Expense[], 
  categories: Category[], 
  participants: Participant[]
): AnalyticsData {
  return useMemo(() => {
    // Process monthly trends
    const monthlyData = processMonthlyTrends(expenses);
    
    // Process category breakdown
    const categoryData = processCategoryBreakdown(expenses, categories);
    
    // Process participant contributions
    const participantData = processParticipantContributions(expenses, participants);
    
    // Calculate summary statistics
    const totalSpending = expenses
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const averageExpense = totalSpending / expenses.filter(e => e.type === 'expense').length || 0;
    const expenseCount = expenses.filter(e => e.type === 'expense').length;

    return {
      monthlyTrends: monthlyData,
      categoryBreakdown: categoryData,
      participantContributions: participantData,
      totalSpending,
      averageExpense,
      expenseCount,
    };
  }, [expenses, categories, participants]);
}

function processMonthlyTrends(expenses: Expense[]): MonthlyTrend[] {
  const monthlyMap = new Map<string, MonthlyTrend>();
  
  expenses.forEach(expense => {
    const month = new Date(expense.created_at).toLocaleString('default', { 
      month: 'short', 
      year: 'numeric' 
    });
    
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { 
        month, 
        spending: 0, 
        income: 0, 
        expenseCount: 0 
      });
    }
    
    const trend = monthlyMap.get(month)!;
    if (expense.type === 'expense') {
      trend.spending += expense.amount;
      trend.expenseCount++;
    } else if (expense.type === 'income') {
      trend.income += expense.amount;
    }
  });
  
  return Array.from(monthlyMap.values()).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );
}
```

### **Dashboard Components**

```typescript
// src/components/analytics/SpendingTrendsChart.tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SpendingTrendsChartProps {
  data: MonthlyTrend[];
}

export function SpendingTrendsChart({ data }: SpendingTrendsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📈 Monthly Spending Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="spending" 
              stroke="#ef4444" 
              strokeWidth={2}
              name="Spending"
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Income"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

```typescript
// src/components/analytics/CategoryBreakdownChart.tsx
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🥧 Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percentage }) => `${category} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

```typescript
// src/components/analytics/ParticipantContributionsChart.tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ParticipantContributionsChartProps {
  data: ParticipantContribution[];
}

export function ParticipantContributionsChart({ data }: ParticipantContributionsChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          👥 Participant Contributions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="participant" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`$${value.toFixed(2)}`, name]}
            />
            <Legend />
            <Bar dataKey="paid" fill="#3b82f6" name="Paid" />
            <Bar dataKey="owes" fill="#f59e0b" name="Owes" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

### **Analytics Dashboard**

```typescript
// src/components/analytics/AnalyticsDashboard.tsx
import { useState } from 'react';
import { Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpendingTrendsChart } from './SpendingTrendsChart';
import { CategoryBreakdownChart } from './CategoryBreakdownChart';
import { ParticipantContributionsChart } from './ParticipantContributionsChart';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsDashboardProps {
  expenses: Expense[];
  categories: Category[];
  participants: Participant[];
}

export function AnalyticsDashboard({ 
  expenses, 
  categories, 
  participants 
}: AnalyticsDashboardProps) {
  const analytics = useAnalytics(expenses, categories, participants);

  const exportChart = (chartName: string) => {
    // Implementation for exporting charts as images
    console.log(`Exporting ${chartName}...`);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <span className="text-2xl">💰</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalSpending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.expenseCount} expenses
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.averageExpense.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per expense
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Participants</CardTitle>
            <span className="text-2xl">👥</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{participants.length}</div>
            <p className="text-xs text-muted-foreground">
              In this group
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <TabsContent value="trends" className="space-y-4">
          <SpendingTrendsChart data={analytics.monthlyTrends} />
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryBreakdownChart data={analytics.categoryBreakdown} />
        </TabsContent>

        <TabsContent value="participants" className="space-y-4">
          <ParticipantContributionsChart data={analytics.participantContributions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 🎨 **UI/UX Design**

### **Dashboard Layout**

- **Summary Cards:** Key metrics at the top
- **Tabbed Charts:** Organized chart views
- **Export Controls:** Download functionality
- **Responsive Design:** Mobile-friendly charts

### **Chart Styling**

- **Color Scheme:** Consistent with app branding
- **Animations:** Smooth chart transitions
- **Tooltips:** Informative hover details
- **Loading States:** Skeleton charts while loading

## 📱 **Implementation Steps**

1. **Setup Chart Library**
   - [ ] Install Recharts dependency
   - [ ] Configure chart theme
   - [ ] Setup responsive containers

2. **Data Processing**
   - [ ] Create analytics hook
   - [ ] Implement data aggregation functions
   - [ ] Add data transformation utilities

3. **Chart Components**
   - [ ] Build SpendingTrendsChart
   - [ ] Create CategoryBreakdownChart
   - [ ] Implement ParticipantContributionsChart
   - [ ] Add summary cards

4. **Dashboard Integration**
   - [ ] Create AnalyticsDashboard component
   - [ ] Add tabbed navigation
   - [ ] Implement export functionality
   - [ ] Add filtering options

5. **Performance Optimization**
   - [ ] Memoize chart data
   - [ ] Implement chart lazy loading
   - [ ] Add loading states

## ✅ **Testing Checklist**

- [ ] Charts render correctly with sample data
- [ ] Charts are responsive on mobile devices
- [ ] Data updates reflect in real-time
- [ ] Export functionality works
- [ ] Charts handle edge cases (no data, single data point)
- [ ] Performance is acceptable with large datasets
- [ ] Accessibility features work properly

## 🔗 **Resources**

- [Recharts Documentation](https://recharts.org/en-US/)
- [Chart.js Alternatives](https://www.chartjs.org/)
- [D3.js for Advanced Charts](https://d3js.org/)
- [Chart Export Libraries](https://github.com/tsayen/dom-to-image)

## 💡 **Future Enhancements**

- Interactive chart drilling (click for details)
- Custom date range selection
- Comparison views (month-over-month)
- Advanced filters (participant, date, amount)
- Chart themes matching app theme
- Real-time chart updates
- Animated chart transitions
- Chart sharing functionality

---

**Files to Create/Modify:**
- `src/hooks/useAnalytics.ts` (new)
- `src/components/analytics/AnalyticsDashboard.tsx` (new)
- `src/components/analytics/SpendingTrendsChart.tsx` (new)
- `src/components/analytics/CategoryBreakdownChart.tsx` (new)
- `src/components/analytics/ParticipantContributionsChart.tsx` (new)
- `src/pages/Group.tsx` (add analytics tab)
- `package.json` (add recharts dependency)
