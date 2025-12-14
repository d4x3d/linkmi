'use client';

import { useState, useEffect } from 'react';
import { useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { maskEmail, formatNaira, formatDate } from '@/lib/format';
import { Receipt, TrendingUp, Wallet, Landmark, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TransactionsPage() {
  const purchases = useQuery(api.purchases.listByUser);
  const balance = useQuery(api.finance.getBalance);
  const bankAccount = useQuery(api.finance.getBankAccount);

  // Actions
  const listBanksAction = useAction(api.paystack.listBanks);
  const resolveAccountAction = useAction(api.paystack.resolveAccount);
  const setupBankAccountAction = useAction(api.payouts.setupBankAccount);
  const requestWithdrawalAction = useAction(api.payouts.requestWithdrawal);

  // State
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Bank Setup State
  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBankCode, setSelectedBankCode] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [setupError, setSetupError] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  // Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState('');

  // Load Banks when dialog opens
  useEffect(() => {
    if (isWithdrawOpen && !bankAccount && banks.length === 0) {
      setLoadingBanks(true);
      listBanksAction({})
        .then((data) => setBanks(data))
        .catch((err) => console.error('Failed to load banks', err))
        .finally(() => setLoadingBanks(false));
    }
  }, [isWithdrawOpen, bankAccount, banks.length, listBanksAction]);

  // Resolve Account Name
  const handleResolveAccount = async () => {
    if (accountNumber.length < 10 || !selectedBankCode) return;

    setIsResolving(true);
    setSetupError('');
    try {
      const data = await resolveAccountAction({
        accountNumber,
        bankCode: selectedBankCode,
      });
      setResolvedAccountName(data.account_name);
    } catch (error: any) {
      setResolvedAccountName('');
      setSetupError(error.message || 'Could not resolve account');
    } finally {
      setIsResolving(false);
    }
  };

  // Save Bank Account
  const handleSaveBank = async () => {
    if (!resolvedAccountName || !selectedBankCode) return;

    setIsSettingUp(true);
    setSetupError('');
    try {
      const bank = banks.find((b) => b.code === selectedBankCode);
      await setupBankAccountAction({
        accountNumber,
        accountName: resolvedAccountName,
        bankCode: selectedBankCode,
        bankName: bank?.name || 'Unknown Bank',
      });
      // Success - view will switch to withdraw form automatically due to bankAccount query update
    } catch (error: any) {
      setSetupError(error.message || 'Failed to save bank details');
    } finally {
      setIsSettingUp(false);
    }
  };

  // Process Withdrawal
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount) * 100; // Convert to kobo
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Invalid amount');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError('');
    setWithdrawSuccess('');

    try {
      await requestWithdrawalAction({ amount });
      setWithdrawSuccess('Withdrawal processed successfully!');
      setWithdrawAmount('');
      setTimeout(() => {
        setIsWithdrawOpen(false);
        setWithdrawSuccess('');
      }, 2000);
    } catch (error: any) {
      setWithdrawError(error.message || 'Withdrawal failed');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (purchases === undefined || balance === undefined) {
    return <TransactionsSkeleton />;
  }

  const totalRevenue = purchases.reduce((sum: number, p: any) => sum + p.amount, 0);
  const successfulTransactions = purchases.filter((p: any) => p.status === 'success').length;

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Transaction History
            </h2>
            <p className="text-neutral-500">View all your sales, withdrawals, and payouts.</p>
          </div>

        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white gap-2">
              <Wallet className="w-4 h-4" />
              Withdraw Funds
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Withdraw Funds</DialogTitle>
              <DialogDescription>Transfer your earnings to your local bank account.</DialogDescription>
            </DialogHeader>

            {!bankAccount ? (
              // Link Bank Account Form
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select Bank</Label>
                  <Select
                    value={selectedBankCode}
                    onValueChange={(val) => {
                      setSelectedBankCode(val ?? '');
                      setResolvedAccountName('');
                    }}
                    disabled={loadingBanks}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {banks.map((bank: any) => (
                        <SelectItem key={bank.id} value={String(bank.code)}>
                          {bank.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="0123456789"
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        setResolvedAccountName('');
                      }}
                      maxLength={10}
                    />
                    <Button
                      variant="outline"
                      onClick={handleResolveAccount}
                      disabled={accountNumber.length < 10 || !selectedBankCode || isResolving}
                    >
                      {isResolving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                    </Button>
                  </div>
                </div>
                {resolvedAccountName && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center gap-2 text-green-700 dark:text-green-400">
                    <div className="h-5 w-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-sm font-medium">{resolvedAccountName}</span>
                  </div>
                )}
                {setupError && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {setupError}
                  </div>
                )}
                <Button
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  onClick={handleSaveBank}
                  disabled={!resolvedAccountName || isSettingUp}
                >
                  {isSettingUp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Save Bank Account'}
                </Button>
              </div>
            ) : (
              // Withdraw Form
              <div className="space-y-4 py-4">
                <div className="bg-neutral-50 dark:bg-neutral-900 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="text-sm text-neutral-500">Available Balance</p>
                    <p className="text-2xl font-bold">{formatNaira(balance)}</p>
                  </div>
                  <Wallet className="text-neutral-300 w-8 h-8" />
                </div>
                <div className="border rounded-md p-3">
                  <p className="text-xs text-neutral-500 mb-1">Transfer to:</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-sm">{bankAccount.bankName}</p>
                      <p className="text-xs text-neutral-500">
                        {bankAccount.accountNumber} • {bankAccount.accountName}
                      </p>
                    </div>
                    <Landmark className="w-4 h-4 text-neutral-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₦)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    max={balance / 100}
                  />
                  <p className="text-xs text-neutral-500 text-right">Max: {formatNaira(balance)}</p>
                </div>
                {withdrawError && (
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {withdrawError}
                  </div>
                )}
                {withdrawSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-md flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
                    <div className="h-5 w-5 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                    {withdrawSuccess}
                  </div>
                )}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                >
                  {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirm Withdrawal'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              Available Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(balance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNaira(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Total Sales</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulTransactions}</div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {purchases.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {purchases.map((purchase: any) => (
                <div
                  key={purchase._id}
                  className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{purchase.productName}</h3>
                    <p className="text-sm text-neutral-500">Customer: {maskEmail(purchase.customerEmail)}</p>
                    <p className="text-xs text-neutral-400 mt-1">{formatDate(purchase._creationTime)}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-neutral-900 dark:text-neutral-100">
                      {formatNaira(purchase.amount)}
                    </div>
                    <div className="text-xs">
                      <span
                        className={`inline-block px-2 py-1 rounded-full ${
                          purchase.status === 'success'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {purchase.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-1/3" />
      <div className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
