"use client";

import { useState } from "react";
import { useTripDataStore } from "@/store/trip-data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BudgetCategory, BudgetItem } from "@/types";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Hotel,
  Plane,
  Car,
  UtensilsCrossed,
  Ticket,
  ShoppingBag,
  MoreHorizontal,
  Receipt,
  Users,
  ArrowRight,
} from "lucide-react";

const categoryIcons: Record<BudgetCategory, React.ElementType> = {
  lodging: Hotel,
  flights: Plane,
  transport: Car,
  food: UtensilsCrossed,
  activities: Ticket,
  shopping: ShoppingBag,
  other: MoreHorizontal,
};

const categoryColors: Record<BudgetCategory, string> = {
  lodging: "bg-purple-500",
  flights: "bg-blue-500",
  transport: "bg-green-500",
  food: "bg-orange-500",
  activities: "bg-pink-500",
  shopping: "bg-cyan-500",
  other: "bg-gray-500",
};

function CategoryBreakdown() {
  const { trip, budgetItems } = useTripDataStore();

  if (!trip) return null;

  const categories = Object.entries(trip.budget.byCategory) as [
    BudgetCategory,
    { amount: number; currency: string }
  ][];

  const actualByCategory = budgetItems.reduce(
    (acc, item) => {
      if (!item.isEstimate) {
        acc[item.category] = (acc[item.category] || 0) + item.amount.amount;
      }
      return acc;
    },
    {} as Record<BudgetCategory, number>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Budget by Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map(([category, budget]) => {
          const actual = actualByCategory[category] || 0;
          const percent = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
          const Icon = categoryIcons[category];
          const isOverBudget = actual > budget.amount;

          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded ${categoryColors[category]} bg-opacity-20`}
                  >
                    <Icon
                      className={`h-4 w-4 ${categoryColors[category].replace("bg-", "text-")}`}
                    />
                  </div>
                  <span className="font-medium capitalize">{category}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`font-medium ${isOverBudget ? "text-red-500" : ""}`}
                  >
                    {formatCurrency(actual, budget.currency)}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    / {formatCurrency(budget.amount, budget.currency)}
                  </span>
                </div>
              </div>
              <Progress
                value={Math.min(percent, 100)}
                className={`h-2 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ExpenseList({ onAddExpense }: { onAddExpense: () => void }) {
  const { budgetItems, getTraveler, days, getDay } = useTripDataStore();

  const sortedItems = [...budgetItems]
    .filter((item) => !item.isEstimate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Expenses</CardTitle>
        <Button size="sm" onClick={onAddExpense}>
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </CardHeader>
      <CardContent>
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No expenses recorded yet</p>
            <p className="text-sm">Add your first expense to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedItems.map((item) => {
              const Icon = categoryIcons[item.category];
              const paidByTraveler = item.paidBy
                ? getTraveler(item.paidBy)
                : null;
              const day = item.dayId ? getDay(item.dayId) : null;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-lg ${categoryColors[item.category]} bg-opacity-20`}
                  >
                    <Icon
                      className={`h-4 w-4 ${categoryColors[item.category].replace("bg-", "text-")}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(item.date)}</span>
                      {day && (
                        <>
                          <span>•</span>
                          <span>Day {day.dayNumber}</span>
                        </>
                      )}
                      {paidByTraveler && (
                        <>
                          <span>•</span>
                          <span>Paid by {paidByTraveler.name.split(" ")[0]}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(item.amount.amount, item.amount.currency)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.splitType === "all"
                        ? "Split equally"
                        : item.splitType === "per_person"
                          ? "Per person"
                          : "Custom split"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SplitSummary() {
  const { travelers, budgetItems } = useTripDataStore();

  const paidByTraveler = travelers.reduce(
    (acc, traveler) => {
      const paid = budgetItems
        .filter((item) => !item.isEstimate && item.paidBy === traveler.id)
        .reduce((sum, item) => sum + item.amount.amount, 0);
      acc[traveler.id] = paid;
      return acc;
    },
    {} as Record<string, number>
  );

  const totalSpent = Object.values(paidByTraveler).reduce((a, b) => a + b, 0);
  const fairShare = totalSpent / travelers.length;

  const balances = travelers.map((traveler) => ({
    traveler,
    paid: paidByTraveler[traveler.id] || 0,
    owes: fairShare - (paidByTraveler[traveler.id] || 0),
  }));

  const debtors = balances.filter((b) => b.owes > 0).sort((a, b) => b.owes - a.owes);
  const creditors = balances
    .filter((b) => b.owes < 0)
    .sort((a, b) => a.owes - b.owes);

  const settlements: { from: string; to: string; amount: number }[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.owes, -creditor.owes);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.traveler.name,
        to: creditor.traveler.name,
        amount,
      });
    }

    debtor.owes -= amount;
    creditor.owes += amount;

    if (debtor.owes < 0.01) i++;
    if (creditor.owes > -0.01) j++;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          Split Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {balances.map(({ traveler, paid }) => (
            <div
              key={traveler.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
            >
              <span className="font-medium">{traveler.name.split(" ")[0]}</span>
              <span className="text-muted-foreground">
                paid {formatCurrency(paid, "EUR")}
              </span>
            </div>
          ))}
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-3">Settle Up</h4>
          {settlements.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              All settled! No payments needed.
            </p>
          ) : (
            <div className="space-y-2">
              {settlements.map((settlement, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {settlement.from.split(" ")[0]}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {settlement.to.split(" ")[0]}
                    </span>
                  </div>
                  <span className="font-semibold text-primary">
                    {formatCurrency(settlement.amount, "EUR")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function DailyBurnRate() {
  const { trip, days, budgetItems } = useTripDataStore();

  if (!trip) return null;

  const dailySpend = days.map((day) => {
    const dayExpenses = budgetItems
      .filter((item) => !item.isEstimate && item.dayId === day.id)
      .reduce((sum, item) => sum + item.amount.amount, 0);
    return {
      day: day.dayNumber,
      date: day.date,
      amount: dayExpenses,
    };
  });

  const totalActual = budgetItems
    .filter((item) => !item.isEstimate)
    .reduce((sum, item) => sum + item.amount.amount, 0);

  const daysWithSpend = dailySpend.filter((d) => d.amount > 0).length;
  const avgDaily = daysWithSpend > 0 ? totalActual / daysWithSpend : 0;
  const targetDaily = trip.budget.total.amount / days.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Burn Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Target</p>
            <p className="text-2xl font-bold">
              {formatCurrency(targetDaily, trip.budget.total.currency)}
            </p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Actual Average</p>
            <p
              className={`text-2xl font-bold ${avgDaily > targetDaily ? "text-red-500" : "text-green-500"}`}
            >
              {formatCurrency(avgDaily, trip.budget.total.currency)}
            </p>
            <p className="text-xs text-muted-foreground">per day</p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Daily Spending</p>
          <div className="flex items-end gap-1 h-24">
            {dailySpend.slice(0, 14).map((day) => {
              const height =
                day.amount > 0
                  ? Math.max((day.amount / (targetDaily * 2)) * 100, 10)
                  : 5;
              const isOverTarget = day.amount > targetDaily;

              return (
                <div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-full rounded-t ${isOverTarget ? "bg-red-400" : "bg-primary"}`}
                    style={{ height: `${Math.min(height, 100)}%` }}
                    title={`Day ${day.day}: ${formatCurrency(day.amount, "EUR")}`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Day 1</span>
            <span>Day {Math.min(days.length, 14)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BudgetView() {
  const { trip, travelers, getTripSummary, addBudgetItem } = useTripDataStore();
  const summary = getTripSummary();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<BudgetCategory>("food");
  const [expensePaidBy, setExpensePaidBy] = useState("");

  if (!trip) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No trip loaded</p>
      </div>
    );
  }

  const handleAddExpense = () => {
    if (!expenseDescription || !expenseAmount) return;
    
    addBudgetItem({
      tripId: trip.id,
      description: expenseDescription,
      category: expenseCategory,
      amount: {
        amount: parseFloat(expenseAmount),
        currency: trip.budget.total.currency,
      },
      isEstimate: false,
      splitType: "all",
      paidBy: expensePaidBy || undefined,
      date: new Date().toISOString().split("T")[0],
    });
    
    setExpenseDescription("");
    setExpenseAmount("");
    setExpenseCategory("food");
    setExpensePaidBy("");
    setIsAddExpenseOpen(false);
  };

  const { budgetStats } = summary;
  const isOverBudget = budgetStats.actual > budgetStats.planned;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Budget Tracker</h1>
          <p className="text-muted-foreground">
            Track expenses and manage your travel budget
          </p>
        </div>
        <Button onClick={() => setIsAddExpenseOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Budget</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(
                    budgetStats.planned,
                    trip.budget.total.currency
                  )}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spent</p>
                <p
                  className={`text-3xl font-bold ${isOverBudget ? "text-red-500" : ""}`}
                >
                  {formatCurrency(budgetStats.actual, trip.budget.total.currency)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {budgetStats.percentUsed}% of budget
                </p>
              </div>
              {isOverBudget ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-green-500" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Remaining</p>
                <p
                  className={`text-3xl font-bold ${budgetStats.remaining < 0 ? "text-red-500" : "text-green-500"}`}
                >
                  {formatCurrency(
                    Math.abs(budgetStats.remaining),
                    trip.budget.total.currency
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {budgetStats.remaining < 0 ? "over budget" : "left to spend"}
                </p>
              </div>
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${budgetStats.remaining < 0 ? "bg-red-100" : "bg-green-100"}`}
              >
                <span className="text-lg">
                  {budgetStats.remaining < 0 ? "⚠️" : "✓"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Progress
          value={Math.min(budgetStats.percentUsed, 100)}
          className={`h-4 ${isOverBudget ? "[&>div]:bg-red-500" : ""}`}
        />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="split">Split</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryBreakdown />
            <DailyBurnRate />
          </div>
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseList onAddExpense={() => setIsAddExpenseOpen(true)} />
        </TabsContent>

        <TabsContent value="split">
          <SplitSummary />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
        <DialogContent>
          <DialogClose onClose={() => setIsAddExpenseOpen(false)} />
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expenseDescription">Description</Label>
              <Input
                id="expenseDescription"
                placeholder="e.g., Dinner at La Barraca"
                value={expenseDescription}
                onChange={(e) => setExpenseDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expenseAmount">Amount ({trip.budget.total.currency})</Label>
                <Input
                  id="expenseAmount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expenseCategory">Category</Label>
                <Select
                  id="expenseCategory"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as BudgetCategory)}
                >
                  <option value="food">Food</option>
                  <option value="lodging">Lodging</option>
                  <option value="flights">Flights</option>
                  <option value="transport">Transport</option>
                  <option value="activities">Activities</option>
                  <option value="shopping">Shopping</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Select
                id="paidBy"
                value={expensePaidBy}
                onChange={(e) => setExpensePaidBy(e.target.value)}
              >
                <option value="">Select traveler...</option>
                {travelers.map((traveler) => (
                  <option key={traveler.id} value={traveler.id}>
                    {traveler.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Add Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
