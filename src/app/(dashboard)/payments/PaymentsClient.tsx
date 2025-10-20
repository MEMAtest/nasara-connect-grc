"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  CreditCard, Building2, Plus, Search, AlertTriangle, CheckCircle,
  Clock, Eye, Send, Download, TrendingUp,
  FileText, Globe, Wallet, RefreshCw, Settings,
  PoundSterling, DollarSign, Euro, Calendar, BarChart3,
  Shield, ExternalLink, Copy, Filter, MoreHorizontal,
  ArrowUpRight, Target, Zap, MapPin,
  Receipt, Bell
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

// Initial account data - transactions will be stored in state
const initialAccountData = {
  accountBalance: {
    gbp: 245650.75,
    eur: 12500.30,
    usd: 18750.45,
    reserved: 15500.00,
    frozen: 0.00
  },
  beneficiaries: [
    {
      id: 'ben_001',
      name: 'ABC Manufacturing Ltd',
      type: 'corporate',
      country: 'GB',
      currency: 'GBP',
      accountNumber: '****1234',
      iban: 'GB29 NWBK 6016 1331 9268 19',
      swiftCode: 'NWBKGB2L',
      verified: true,
      lastUsed: new Date('2024-01-20'),
      totalPaid: 0,
      transactionCount: 0,
      averageAmount: 0,
      riskRating: 'low',
      kycStatus: 'approved',
      companyNumber: '08765432',
      address: '123 Industrial Estate, Manchester, M1 1AA'
    },
    {
      id: 'ben_002',
      name: 'European Partners GmbH',
      type: 'corporate',
      country: 'DE',
      currency: 'EUR',
      iban: 'DE89 3704 0044 0532 0130 00',
      swiftCode: 'COBADEFF',
      verified: true,
      lastUsed: new Date('2024-01-19'),
      totalPaid: 0,
      transactionCount: 0,
      averageAmount: 0,
      riskRating: 'low',
      kycStatus: 'approved',
      companyNumber: 'HRB 123456',
      address: 'Unter den Linden 1, 10117 Berlin, Germany'
    },
    {
      id: 'ben_003',
      name: 'Global Tech Solutions Inc',
      type: 'corporate',
      country: 'US',
      currency: 'USD',
      accountNumber: '****5678',
      routingNumber: '021000021',
      verified: false,
      lastUsed: new Date('2024-01-10'),
      totalPaid: 0,
      transactionCount: 0,
      averageAmount: 0,
      riskRating: 'medium',
      kycStatus: 'pending',
      ein: '12-3456789',
      address: '456 Tech Blvd, San Francisco, CA 94105'
    },
    {
      id: 'ben_004',
      name: 'Nordic Supplies AS',
      type: 'corporate',
      country: 'NO',
      currency: 'NOK',
      iban: 'NO93 8601 1117 947',
      swiftCode: 'DNBANOKK',
      verified: true,
      lastUsed: new Date('2024-01-15'),
      totalPaid: 0,
      transactionCount: 0,
      averageAmount: 0,
      riskRating: 'low',
      kycStatus: 'approved',
      companyNumber: '987654321',
      address: 'Storgata 15, 0155 Oslo, Norway'
    }
  ],
  kycStatus: 'approved',
  complianceScore: 94.5,
  alerts: []
};

// Enhanced exchange rates with real-time simulation
const baseExchangeRates = {
  'GBP_EUR': 1.1650,
  'GBP_USD': 1.2680,
  'GBP_JPY': 188.45,
  'GBP_AUD': 1.8920,
  'GBP_NOK': 13.45,
  'EUR_USD': 1.0884,
  'EUR_GBP': 0.8583,
  'USD_EUR': 0.9188,
  'USD_GBP': 0.7886
};

export function PaymentsClient() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showBeneficiaryDialog, setShowBeneficiaryDialog] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [exchangeRates, setExchangeRates] = useState(baseExchangeRates);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  // Persistent state for transactions and beneficiaries
  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState(initialAccountData.beneficiaries);
  const [accountBalance, setAccountBalance] = useState(initialAccountData.accountBalance);
  const [alerts, setAlerts] = useState(initialAccountData.alerts);

  const [paymentForm, setPaymentForm] = useState({
    beneficiaryId: '',
    amount: '',
    currency: 'GBP',
    targetCurrency: 'GBP',
    reference: '',
    purpose: '',
    priority: 'standard',
    scheduledDate: '',
    notifyBeneficiary: false
  });

  const [beneficiaryForm, setBeneficiaryForm] = useState({
    name: '',
    type: 'corporate',
    country: 'GB',
    currency: 'GBP',
    accountDetails: '',
    swiftCode: '',
    iban: '',
    address: '',
    companyNumber: ''
  });

  // Set isClient to true after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulate real-time exchange rate updates
  useEffect(() => {
    if (!autoRefresh || !isClient) return;

    const interval = setInterval(() => {
      setExchangeRates(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(key => {
          // Simulate small fluctuations (±0.5%)
          const variance = (Math.random() - 0.5) * 0.01;
          updated[key] = baseExchangeRates[key] * (1 + variance);
        });
        return updated;
      });
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, isClient]);

  // Calculate conversion with live rates
  const conversionRate = useMemo(() => {
    if (paymentForm.currency === paymentForm.targetCurrency) return 1;
    const rateKey = `${paymentForm.currency}_${paymentForm.targetCurrency}`;
    return exchangeRates[rateKey] || 1;
  }, [paymentForm.currency, paymentForm.targetCurrency, exchangeRates]);

  const convertedAmount = useMemo(() => {
    const amount = parseFloat(paymentForm.amount) || 0;
    return amount * conversionRate;
  }, [paymentForm.amount, conversionRate]);

  // Calculate estimated fees
  const estimatedFees = useMemo(() => {
    const amount = parseFloat(paymentForm.amount) || 0;
    if (amount === 0) return 0;

    let baseFee = 5.00; // Base processing fee
    if (paymentForm.currency !== paymentForm.targetCurrency) {
      baseFee += amount * 0.002; // 0.2% for currency conversion
    }
    if (paymentForm.priority === 'urgent') {
      baseFee *= 1.5; // 50% surcharge for urgent payments
    }

    return Math.min(baseFee, 100); // Cap at £100
  }, [paymentForm.amount, paymentForm.currency, paymentForm.targetCurrency, paymentForm.priority]);

  // Calculate dynamic monthly stats
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    });

    const totalSent = monthlyTransactions.reduce((sum, tx) => {
      if (tx.status === 'completed') {
        return sum + (tx.convertedAmount || tx.amount);
      }
      return sum;
    }, 0);

    const totalFees = monthlyTransactions.reduce((sum, tx) => sum + (tx.fees || 0), 0);

    const completedPayments = monthlyTransactions.filter(tx => tx.status === 'completed').length;
    const failedPayments = monthlyTransactions.filter(tx => tx.status === 'failed').length;
    const pendingReviews = monthlyTransactions.filter(tx => tx.status === 'pending_review').length;
    const scheduledPayments = monthlyTransactions.filter(tx => tx.status === 'scheduled').length;

    const averageAmount = monthlyTransactions.length > 0 ? totalSent / monthlyTransactions.length : 0;

    // Calculate currency exposure
    const currencyTotals = monthlyTransactions.reduce((acc, tx) => {
      const currency = tx.originalCurrency || tx.currency;
      const amount = tx.convertedAmount || tx.amount;
      acc[currency] = (acc[currency] || 0) + amount;
      return acc;
    }, {});

    const totalVolume = Object.values(currencyTotals).reduce((sum, amount) => sum + amount, 0);
    const currencyExposure = Object.keys(currencyTotals).reduce((acc, currency) => {
      acc[currency] = totalVolume > 0 ? ((currencyTotals[currency] / totalVolume) * 100) : 0;
      return acc;
    }, {});

    // Default exposure if no transactions
    if (Object.keys(currencyExposure).length === 0) {
      currencyExposure.GBP = 100;
      currencyExposure.EUR = 0;
      currencyExposure.USD = 0;
    }

    return {
      totalSent,
      transactionCount: monthlyTransactions.length,
      averageAmount,
      pendingReviews,
      completedPayments,
      failedPayments,
      scheduledPayments,
      totalFees,
      topCurrency: Object.keys(currencyTotals).reduce((a, b) => currencyTotals[a] > currencyTotals[b] ? a : b, 'GBP'),
      topDestination: 'Europe',
      currencyExposure
    };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter(tx => {
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (searchTerm && !tx.beneficiary.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !tx.reference.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Date range filter
      const days = parseInt(dateRange.replace('d', ''));
      const cutoff = subDays(new Date(), days);
      if (tx.date < cutoff) return false;

      return true;
    });

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, searchTerm, statusFilter, dateRange]);

  // Filter beneficiaries
  const filteredBeneficiaries = useMemo(() => {
    return beneficiaries.filter(ben =>
      ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ben.country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [beneficiaries, searchTerm]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending_review': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-purple-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'standard': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const handlePaymentSubmit = useCallback((e) => {
    e.preventDefault();
    const amount = parseFloat(paymentForm.amount);
    const beneficiary = beneficiaries.find(b => b.id === paymentForm.beneficiaryId);

    if (!beneficiary) {
      alert('Please select a beneficiary');
      return;
    }

    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!paymentForm.reference.trim()) {
      alert('Please enter a payment reference');
      return;
    }

    if (!paymentForm.purpose.trim()) {
      alert('Please enter the purpose of payment');
      return;
    }

    // Generate transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const confirmationNumber = `CNF-${format(new Date(), 'yyyyMMdd')}-${transactionId.slice(-6).toUpperCase()}`;

    // Determine status based on amount and beneficiary verification
    let status = 'processing';
    let flagged = false;
    let reviewReason = '';

    if (amount > 50000) {
      status = 'pending_review';
      flagged = true;
      reviewReason = 'Amount exceeds £50k threshold - AML review required';
    } else if (!beneficiary.verified) {
      status = 'pending_review';
      flagged = true;
      reviewReason = 'Beneficiary requires KYC verification';
    } else if (paymentForm.scheduledDate) {
      status = 'scheduled';
    }

    // Create new transaction
    const newTransaction = {
      id: transactionId,
      beneficiary: beneficiary.name,
      beneficiaryId: beneficiary.id,
      amount: paymentForm.currency !== paymentForm.targetCurrency ? convertedAmount : amount,
      currency: paymentForm.targetCurrency,
      convertedAmount: paymentForm.currency !== paymentForm.targetCurrency ? amount : undefined,
      originalCurrency: paymentForm.currency !== paymentForm.targetCurrency ? paymentForm.currency : undefined,
      status,
      date: paymentForm.scheduledDate ? new Date(paymentForm.scheduledDate) : new Date(),
      reference: paymentForm.reference,
      purpose: paymentForm.purpose,
      fees: estimatedFees,
      exchangeRate: conversionRate,
      processingTime: status === 'scheduled' ? `Scheduled for ${format(new Date(paymentForm.scheduledDate), 'MMM dd')}` :
                     status === 'pending_review' ? 'Under review' :
                     paymentForm.priority === 'urgent' ? '15-30 mins' : '1-2 hours',
      confirmationNumber,
      flagged,
      priority: paymentForm.priority,
      reviewReason: reviewReason || undefined,
      notifyBeneficiary: paymentForm.notifyBeneficiary
    };

    // Add transaction to state
    setTransactions(prev => [newTransaction, ...prev]);

    // Update beneficiary stats
    setBeneficiaries(prev => prev.map(ben => {
      if (ben.id === beneficiary.id) {
        const newTotalPaid = ben.totalPaid + (newTransaction.convertedAmount || newTransaction.amount);
        const newTransactionCount = ben.transactionCount + 1;
        return {
          ...ben,
          totalPaid: newTotalPaid,
          transactionCount: newTransactionCount,
          averageAmount: newTotalPaid / newTransactionCount,
          lastUsed: new Date()
        };
      }
      return ben;
    }));

    // Update account balance (deduct amount + fees)
    const totalDebit = amount + estimatedFees;
    setAccountBalance(prev => ({
      ...prev,
      [paymentForm.currency.toLowerCase()]: prev[paymentForm.currency.toLowerCase()] - totalDebit
    }));

    // Add alert if payment was flagged
    if (flagged) {
      const newAlert = {
        id: `alert_${Date.now()}`,
        type: amount > 50000 ? 'aml_review' : 'beneficiary_verification',
        title: amount > 50000 ? 'AML Review Required' : 'Beneficiary Verification Required',
        description: reviewReason,
        severity: amount > 50000 ? 'medium' : 'low',
        created: new Date(),
        actionRequired: true,
        transactionId
      };
      setAlerts(prev => [newAlert, ...prev]);
    }

    // Show success message
    if (flagged) {
      alert(`Payment flagged for review: ${reviewReason}\n\nTransaction ID: ${transactionId}\nConfirmation: ${confirmationNumber}`);
    } else {
      alert(`Payment submitted successfully!\n\nTransaction ID: ${transactionId}\nConfirmation: ${confirmationNumber}\nFees: £${estimatedFees.toFixed(2)}\nProcessing time: ${newTransaction.processingTime}`);
    }

    // Reset form
    setShowPaymentDialog(false);
    setPaymentForm({
      beneficiaryId: '',
      amount: '',
      currency: 'GBP',
      targetCurrency: 'GBP',
      reference: '',
      purpose: '',
      priority: 'standard',
      scheduledDate: '',
      notifyBeneficiary: false
    });

    // Auto-complete small payments after 2 seconds (simulate processing)
    if (!flagged && status === 'processing' && amount < 10000) {
      setTimeout(() => {
        setTransactions(prev => prev.map(tx =>
          tx.id === transactionId
            ? { ...tx, status: 'completed', processingTime: 'Completed' }
            : tx
        ));
      }, 2000);
    }
  }, [paymentForm, estimatedFees, conversionRate, convertedAmount, beneficiaries]);

  const handleBeneficiarySubmit = useCallback((e) => {
    e.preventDefault();

    if (!beneficiaryForm.name.trim()) {
      alert('Please enter company name');
      return;
    }

    if (!beneficiaryForm.iban.trim()) {
      alert('Please enter IBAN or account number');
      return;
    }

    if (!beneficiaryForm.address.trim()) {
      alert('Please enter registered address');
      return;
    }

    // Generate beneficiary ID
    const beneficiaryId = `ben_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

    const newBeneficiary = {
      id: beneficiaryId,
      name: beneficiaryForm.name,
      type: beneficiaryForm.type,
      country: beneficiaryForm.country,
      currency: beneficiaryForm.currency,
      iban: beneficiaryForm.iban,
      swiftCode: beneficiaryForm.swiftCode,
      verified: false, // New beneficiaries start unverified
      lastUsed: new Date(),
      totalPaid: 0,
      transactionCount: 0,
      averageAmount: 0,
      riskRating: 'medium', // Default risk rating for new beneficiaries
      kycStatus: 'pending',
      companyNumber: beneficiaryForm.companyNumber,
      address: beneficiaryForm.address
    };

    setBeneficiaries(prev => [newBeneficiary, ...prev]);

    // Add alert for new beneficiary verification
    const newAlert = {
      id: `alert_${Date.now()}`,
      type: 'beneficiary_verification',
      title: 'New Beneficiary Added',
      description: `${beneficiaryForm.name} requires KYC verification before payments can be processed`,
      severity: 'low',
      created: new Date(),
      actionRequired: true,
      beneficiaryId
    };
    setAlerts(prev => [newAlert, ...prev]);

    alert(`Beneficiary "${beneficiaryForm.name}" added successfully!\n\nKYC verification will be initiated automatically.\nPayments will be held for review until verification is complete.`);

    setShowBeneficiaryDialog(false);
    setBeneficiaryForm({
      name: '',
      type: 'corporate',
      country: 'GB',
      currency: 'GBP',
      accountDetails: '',
      swiftCode: '',
      iban: '',
      address: '',
      companyNumber: ''
    });
  }, [beneficiaryForm]);

  const formatCurrency = useCallback((amount, currency) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }, []);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text);
    // In a real app, you'd show a toast notification here
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments Dashboard</h1>
          <p className="text-gray-600 mt-1">Advanced B2B payment processing with real-time compliance monitoring</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                Compliance Score: {initialAccountData.complianceScore}%
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Globe className="h-3 w-3 mr-1" />
                Multi-Currency
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Zap className="h-3 w-3 mr-1" />
                Real-time Rates
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2" />
                New Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  New B2B Payment
                </DialogTitle>
                <DialogDescription>
                  Send secure payments to business suppliers with real-time currency conversion and compliance checks
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="beneficiary">Select Beneficiary</Label>
                    <Select
                      value={paymentForm.beneficiaryId}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, beneficiaryId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose verified beneficiary" />
                      </SelectTrigger>
                      <SelectContent>
                        {beneficiaries.map(ben => (
                          <SelectItem key={ben.id} value={ben.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{ben.name}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant={ben.verified ? "default" : "secondary"} className="text-xs">
                                  {ben.verified ? 'Verified' : 'Pending'}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {ben.country} • {ben.currency}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Payment Amount</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Send Currency</Label>
                    <Select
                      value={paymentForm.currency}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">
                          <div className="flex items-center gap-2">
                            <PoundSterling className="h-4 w-4" />
                            GBP (British Pound)
                          </div>
                        </SelectItem>
                        <SelectItem value="EUR">
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4" />
                            EUR (Euro)
                          </div>
                        </SelectItem>
                        <SelectItem value="USD">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            USD (US Dollar)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetCurrency">Receive Currency</Label>
                    <Select
                      value={paymentForm.targetCurrency}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, targetCurrency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">
                          <div className="flex items-center gap-2">
                            <PoundSterling className="h-4 w-4" />
                            GBP (British Pound)
                          </div>
                        </SelectItem>
                        <SelectItem value="EUR">
                          <div className="flex items-center gap-2">
                            <Euro className="h-4 w-4" />
                            EUR (Euro)
                          </div>
                        </SelectItem>
                        <SelectItem value="USD">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            USD (US Dollar)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Converted Amount</Label>
                    <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="text-lg font-bold text-blue-900">
                        {formatCurrency(convertedAmount, paymentForm.targetCurrency)}
                      </div>
                      {paymentForm.currency !== paymentForm.targetCurrency && (
                        <div className="text-xs text-blue-600 flex items-center justify-between">
                          <span>Rate: {conversionRate.toFixed(4)}</span>
                          <span className="flex items-center gap-1">
                            <RefreshCw className={cn("h-3 w-3", autoRefresh && "animate-spin")} />
                            Live
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="priority">Payment Priority</Label>
                    <Select
                      value={paymentForm.priority}
                      onValueChange={(value) => setPaymentForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">
                          <div className="flex items-center justify-between w-full">
                            <span>Standard (1-2 hours)</span>
                            <span className="text-xs text-gray-500 ml-4">+£0</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center justify-between w-full">
                            <span>Urgent (15-30 mins)</span>
                            <span className="text-xs text-orange-600 ml-4">+50%</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Estimated Fees</Label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                      <div className="text-lg font-semibold">
                        {formatCurrency(estimatedFees, 'GBP')}
                      </div>
                      <div className="text-xs text-gray-600">
                        Includes processing & FX fees
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="reference">Payment Reference</Label>
                    <Input
                      placeholder="Invoice number, PO reference, contract ID..."
                      value={paymentForm.reference}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="purpose">Purpose of Payment</Label>
                    <Textarea
                      placeholder="Detailed business purpose for this payment (required for compliance)..."
                      value={paymentForm.purpose}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, purpose: e.target.value }))}
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={paymentForm.scheduledDate}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <Switch
                      id="notify-beneficiary"
                      checked={paymentForm.notifyBeneficiary}
                      onCheckedChange={(checked) => setPaymentForm(prev => ({ ...prev, notifyBeneficiary: checked }))}
                    />
                    <Label htmlFor="notify-beneficiary">Notify beneficiary</Label>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-semibold">Payment Summary</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Amount to send:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(paymentForm.amount) || 0, paymentForm.currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount to receive:</span>
                      <span className="font-medium">{formatCurrency(convertedAmount, paymentForm.targetCurrency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fees:</span>
                      <span className="font-medium">{formatCurrency(estimatedFees, 'GBP')}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total debit:</span>
                      <span>{formatCurrency((parseFloat(paymentForm.amount) || 0) + estimatedFees, paymentForm.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Compliance Alerts */}
                {parseFloat(paymentForm.amount) > 50000 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">AML Review Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Payments over £50,000 require enhanced due diligence review. This may delay processing by 2-4 hours.
                        </p>
                        <ul className="text-xs text-yellow-700 mt-2 list-disc list-inside">
                          <li>Source of funds verification</li>
                          <li>Beneficiary enhanced screening</li>
                          <li>Transaction purpose validation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowPaymentDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4 mr-2" />
                    Send Payment
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Real-time Exchange Rates Bar */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Live Exchange Rates</span>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                <RefreshCw className={cn("h-3 w-3 mr-1", autoRefresh && "animate-spin")} />
                Live
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-gray-600">GBP/EUR:</span>
                <span className="font-bold">{exchangeRates.GBP_EUR?.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">GBP/USD:</span>
                <span className="font-bold">{exchangeRates.GBP_USD?.toFixed(4)}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-600">EUR/USD:</span>
                <span className="font-bold">{exchangeRates.EUR_USD?.toFixed(4)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Updated: {isClient ? format(lastUpdated, 'HH:mm:ss') : '--:--:--'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Status Banner */}
      {initialAccountData.kycStatus !== 'approved' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800">Business Verification Required</p>
                  <p className="text-sm text-amber-700">
                    Complete KYC verification to unlock higher payment limits and faster processing
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                <Shield className="h-4 w-4 mr-2" />
                Start Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Notifications */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-orange-800 mb-2">Active Alerts ({alerts.length})</h4>
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-orange-800">{alert.title}</span>
                        <span className="text-orange-700 ml-2">{alert.description}</span>
                      </div>
                      <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                        {alert.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                View All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Available Balance</p>
                <p className="text-3xl font-bold text-green-800 mt-1">
                  {formatCurrency(accountBalance.gbp, 'GBP')}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Reserved: {formatCurrency(accountBalance.reserved, 'GBP')}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Wallet className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Progress value={75} className="flex-1 h-2 bg-green-100" />
              <span className="text-xs text-green-600">75% utilization</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Monthly Payments</p>
                <p className="text-3xl font-bold text-blue-800 mt-1">
                  {formatCurrency(monthlyStats.totalSent, 'GBP')}
                </p>
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% vs last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <ArrowUpRight className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-blue-600">
              {monthlyStats.transactionCount} transactions • Avg: {formatCurrency(monthlyStats.averageAmount, 'GBP')}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium">Processing Status</p>
                <div className="text-3xl font-bold text-purple-800 mt-1 flex items-baseline gap-2">
                  <span>{monthlyStats.completedPayments}</span>
                  <span className="text-lg">/ {monthlyStats.transactionCount}</span>
                </div>
                <p className="text-xs text-purple-600 mt-1">
                  {monthlyStats.transactionCount > 0 ? Math.round((monthlyStats.completedPayments / monthlyStats.transactionCount) * 100) : 0}% success rate
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex gap-2 text-xs">
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                {monthlyStats.completedPayments} completed
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                {monthlyStats.pendingReviews} pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Compliance Score</p>
                <p className="text-3xl font-bold text-amber-800 mt-1">
                  {initialAccountData.complianceScore}%
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Excellent standing
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Shield className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <Progress value={initialAccountData.complianceScore} className="h-2 bg-amber-100" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Beneficiaries
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Currency Exposure Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Currency Exposure
                </CardTitle>
                <CardDescription>Your payment distribution across currencies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <PoundSterling className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">GBP</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={monthlyStats.currencyExposure.GBP || 0} className="w-32 h-2" />
                      <span className="text-sm font-medium w-12">{(monthlyStats.currencyExposure.GBP || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Euro className="h-4 w-4 text-green-600" />
                      <span className="font-medium">EUR</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={monthlyStats.currencyExposure.EUR || 0} className="w-32 h-2" />
                      <span className="text-sm font-medium w-12">{(monthlyStats.currencyExposure.EUR || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">USD</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={monthlyStats.currencyExposure.USD || 0} className="w-32 h-2" />
                      <span className="text-sm font-medium w-12">{(monthlyStats.currencyExposure.USD || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">{monthlyStats.transactionCount}</div>
                  <div className="text-sm text-blue-600">Total Transactions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">{formatCurrency(monthlyStats.totalFees, 'GBP')}</div>
                  <div className="text-sm text-green-600">Total Fees Paid</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-700">{monthlyStats.topDestination}</div>
                  <div className="text-sm text-purple-600">Top Destination</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest payment transactions and status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No recent transactions</p>
                    <p className="text-sm">Your recent payments will appear here</p>
                  </div>
                ) : (
                  transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <div>
                          <p className="font-medium">{tx.beneficiary}</p>
                          <p className="text-sm text-gray-600">{tx.reference}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(tx.convertedAmount || tx.amount, tx.originalCurrency || tx.currency)}
                          </p>
                          {tx.convertedAmount && (
                            <p className="text-xs text-gray-500">
                              → {formatCurrency(tx.amount, tx.currency)}
                            </p>
                          )}
                        </div>
                        <Badge className={cn("text-xs border", getStatusColor(tx.status))}>
                          {tx.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(tx.date, 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => {
                      setSelectedTransaction(tx);
                      setShowTransactionDetails(true);
                    }}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="pending_review">Pending Review</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History ({filteredTransactions.length})</CardTitle>
              <CardDescription>Detailed view of all payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{tx.beneficiary}</p>
                            {tx.flagged && (
                              <Badge variant="destructive" className="text-xs">
                                AML Review
                              </Badge>
                            )}
                            {tx.priority !== 'standard' && (
                              <Badge variant="outline" className={cn("text-xs", getPriorityColor(tx.priority))}>
                                {tx.priority}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{tx.reference}</span>
                            <span>•</span>
                            <span>{format(tx.date, 'MMM dd, yyyy HH:mm')}</span>
                            <span>•</span>
                            <span>{tx.processingTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-medium text-lg">
                              {formatCurrency(tx.convertedAmount || tx.amount, tx.originalCurrency || tx.currency)}
                            </p>
                            {tx.convertedAmount && (
                              <p className="text-sm text-gray-500">
                                → {formatCurrency(tx.amount, tx.currency)} @ {tx.exchangeRate?.toFixed(4)}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              Fees: {formatCurrency(tx.fees, 'GBP')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Badge className={cn("text-xs border", getStatusColor(tx.status))}>
                        {tx.status.replace('_', ' ')}
                      </Badge>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(tx.confirmationNumber || tx.id)}
                          title="Copy confirmation number"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedTransaction(tx);
                            setShowTransactionDetails(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficiaries" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Beneficiary Management
                </CardTitle>
                <CardDescription>Manage approved business payment recipients</CardDescription>
              </div>
              <Dialog open={showBeneficiaryDialog} onOpenChange={setShowBeneficiaryDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Beneficiary
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Business Beneficiary</DialogTitle>
                    <DialogDescription>
                      Add a new corporate beneficiary for B2B payments. KYC verification will be required.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleBeneficiarySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="companyName">Company Name *</Label>
                        <Input
                          placeholder="ABC Manufacturing Ltd"
                          value={beneficiaryForm.name}
                          onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="type">Beneficiary Type</Label>
                        <Select
                          value={beneficiaryForm.type}
                          onValueChange={(value) => setBeneficiaryForm(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="corporate">Corporate Entity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="country">Country *</Label>
                        <Select
                          value={beneficiaryForm.country}
                          onValueChange={(value) => setBeneficiaryForm(prev => ({ ...prev, country: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                            <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                            <SelectItem value="US">🇺🇸 United States</SelectItem>
                            <SelectItem value="FR">🇫🇷 France</SelectItem>
                            <SelectItem value="NO">🇳🇴 Norway</SelectItem>
                            <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="currency">Default Currency</Label>
                        <Select
                          value={beneficiaryForm.currency}
                          onValueChange={(value) => setBeneficiaryForm(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="NOK">NOK (kr)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                        <Input
                          placeholder="ABCDGB2L"
                          value={beneficiaryForm.swiftCode}
                          onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, swiftCode: e.target.value.toUpperCase() }))}
                        />
                      </div>

                      <div>
                        <Label htmlFor="iban">IBAN / Account Number *</Label>
                        <Input
                          placeholder="GB29 NWBK 6016 1331 9268 19"
                          value={beneficiaryForm.iban}
                          onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, iban: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="companyNumber">Company Registration Number</Label>
                        <Input
                          placeholder="08765432"
                          value={beneficiaryForm.companyNumber}
                          onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, companyNumber: e.target.value }))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label htmlFor="address">Registered Address *</Label>
                        <Textarea
                          placeholder="Complete registered business address..."
                          value={beneficiaryForm.address}
                          onChange={(e) => setBeneficiaryForm(prev => ({ ...prev, address: e.target.value }))}
                          className="h-20"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-800">Verification Process</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            New beneficiaries require KYC verification before payments can be processed. This typically takes 1-2 business days.
                          </p>
                        </div>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowBeneficiaryDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Beneficiary</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search beneficiaries by name, country, or currency..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredBeneficiaries.map((beneficiary) => (
                  <Card key={beneficiary.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Building2 className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{beneficiary.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={beneficiary.verified ? "default" : "secondary"}>
                                {beneficiary.verified ? 'Verified' : 'Pending'}
                              </Badge>
                              <Badge variant="outline" className={getRiskBadgeColor(beneficiary.riskRating)}>
                                {beneficiary.riskRating} risk
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{beneficiary.country} • {beneficiary.currency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-gray-400" />
                          <span className="font-mono">{beneficiary.iban || beneficiary.accountNumber}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(beneficiary.iban || beneficiary.accountNumber)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {beneficiary.swiftCode && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="font-mono">{beneficiary.swiftCode}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Last used: {format(beneficiary.lastUsed, 'MMM dd, yyyy')}</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="font-semibold text-lg">{beneficiary.transactionCount}</div>
                          <div className="text-xs text-gray-600">Transactions</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{formatCurrency(beneficiary.totalPaid, 'GBP')}</div>
                          <div className="text-xs text-gray-600">Total Paid</div>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{formatCurrency(beneficiary.averageAmount, 'GBP')}</div>
                          <div className="text-xs text-gray-600">Average</div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1">
                          <Send className="h-3 w-3 mr-1" />
                          Send Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payment Reports & Analytics
              </CardTitle>
              <CardDescription>Comprehensive reporting for compliance and business insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Monthly Summary</h3>
                      <p className="text-sm text-gray-600">Transaction volume & statistics</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Receipt className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Compliance Report</h3>
                      <p className="text-sm text-gray-600">AML & regulatory compliance</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-full">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">FX Analysis</h3>
                      <p className="text-sm text-gray-600">Currency exposure & costs</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Building2 className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Beneficiary Analysis</h3>
                      <p className="text-sm text-gray-600">Payment patterns & risks</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Risk Assessment</h3>
                      <p className="text-sm text-gray-600">Fraud & compliance alerts</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Processing Times</h3>
                      <p className="text-sm text-gray-600">Performance analytics</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-6 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a report type to generate detailed analytics</p>
                <p className="text-sm">All reports are automatically formatted for regulatory compliance</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Details Modal */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold text-lg">{selectedTransaction.beneficiary}</h3>
                  <p className="text-gray-600">{selectedTransaction.reference}</p>
                </div>
                <Badge className={cn("border", getStatusColor(selectedTransaction.status))}>
                  {selectedTransaction.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Payment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-medium">{formatCurrency(selectedTransaction.convertedAmount || selectedTransaction.amount, selectedTransaction.originalCurrency || selectedTransaction.currency)}</span>
                    </div>
                    {selectedTransaction.convertedAmount && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Received:</span>
                          <span className="font-medium">{formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Exchange Rate:</span>
                          <span className="font-medium">{selectedTransaction.exchangeRate?.toFixed(4)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fees:</span>
                      <span className="font-medium">{formatCurrency(selectedTransaction.fees, 'GBP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Time:</span>
                      <span className="font-medium">{selectedTransaction.processingTime}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Transaction Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{format(selectedTransaction.date, 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={cn("font-medium", getPriorityColor(selectedTransaction.priority))}>{selectedTransaction.priority}</span>
                    </div>
                    {selectedTransaction.confirmationNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Confirmation:</span>
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs">{selectedTransaction.confirmationNumber}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyToClipboard(selectedTransaction.confirmationNumber)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Purpose</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedTransaction.purpose}</p>
              </div>

              {selectedTransaction.flagged && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Compliance Review</h4>
                      <p className="text-sm text-yellow-700 mt-1">{selectedTransaction.reviewReason}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
                <Button variant="outline" className="flex-1">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Track Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
