import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  Minus, 
  DollarSign, 
  Coins, 
  Package, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  MessageSquare, 
  FileText, 
  Download,
  Calendar,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { StorageEngine } from '../db/storage';
import { BusinessTransaction, InventoryItem, CustomerCredit, CurrencyType } from '../types';

export const BusinessView: React.FC = () => {
  const { currency, toggleCurrency, showToast } = useApp();

  const transactions = StorageEngine.getTransactions();
  const inventory = StorageEngine.getInventory();
  const customerCredits = StorageEngine.getCustomerCredits();

  // Active Tab within Business
  const [bizTab, setBizTab] = useState<'cashbook' | 'inventory' | 'debtors' | 'reports'>('cashbook');

  // Modals
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txType, setTxType] = useState<'sale' | 'expense' | 'gig_payment'>('sale');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState('Phone Repair');
  const [txDesc, setTxDesc] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState<'cash' | 'ecocash' | 'innbucks' | 'bank_transfer'>('cash');
  const [txCustomer, setTxCustomer] = useState('');
  const [selectedInventoryForSale, setSelectedInventoryForSale] = useState<string>('');

  // Inventory Modal
  const [showAddInvModal, setShowAddInvModal] = useState(false);
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('Spares & Parts');
  const [invQty, setInvQty] = useState('5');
  const [invCost, setInvCost] = useState('10');
  const [invPrice, setInvPrice] = useState('20');
  const [invAlert, setInvAlert] = useState('2');

  // Debtor Modal
  const [showAddCreditModal, setShowAddCreditModal] = useState(false);
  const [debtorName, setDebtorName] = useState('');
  const [debtorPhone, setDebtorPhone] = useState('+263 7');
  const [debtorAmount, setDebtorAmount] = useState('15');
  const [debtorNotes, setDebtorNotes] = useState('Promised to pay on Friday');

  // Financial calculations
  const totalSales = transactions
    .filter((t) => t.type === 'sale' || t.type === 'gig_payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalSales - totalExpenses;
  const totalCreditOwed = customerCredits.reduce((sum, c) => sum + c.amountOwed, 0);
  const lowStockCount = inventory.filter((item) => item.quantity <= item.lowStockAlert).length;

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(txAmount);
    if (isNaN(amt) || amt <= 0) return;

    StorageEngine.addTransaction({
      type: txType,
      amount: amt,
      currency: currency,
      category: txCategory,
      description: txDesc || (txType === 'sale' ? 'Everyday sales income' : 'Operational expense'),
      date: new Date().toISOString().split('T')[0],
      paymentMethod: txPaymentMethod,
      customerOrSupplier: txCustomer || undefined,
      relatedInventoryId: selectedInventoryForSale || undefined
    });

    setShowAddTxModal(false);
    setTxAmount('');
    setTxDesc('');
    setTxCustomer('');
    setSelectedInventoryForSale('');
    showToast(`${txType === 'expense' ? 'Expense' : 'Sale'} logged to phone cashbook!`);
  };

  const handleCreateInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invName.trim()) return;

    StorageEngine.saveInventoryItem({
      name: invName,
      category: invCategory,
      quantity: parseInt(invQty) || 1,
      unitCost: parseFloat(invCost) || 0,
      sellingPrice: parseFloat(invPrice) || 0,
      currency: currency,
      lowStockAlert: parseInt(invAlert) || 2
    });

    setShowAddInvModal(false);
    setInvName('');
    showToast('Inventory item added successfully.');
  };

  const handleCreateCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtorName.trim()) return;

    StorageEngine.saveCustomerCredit({
      customerName: debtorName,
      phone: debtorPhone,
      amountOwed: parseFloat(debtorAmount) || 0,
      currency: currency,
      notes: debtorNotes
    });

    setShowAddCreditModal(false);
    setDebtorName('');
    showToast('Customer credit recorded.');
  };

  const handleQuickSellItem = (item: InventoryItem) => {
    if (item.quantity <= 0) {
      showToast('Item is out of stock! Restock before recording sale.');
      return;
    }

    StorageEngine.addTransaction({
      type: 'sale',
      amount: item.sellingPrice,
      currency: item.currency,
      category: item.category,
      description: `Sale of 1x ${item.name}`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      relatedInventoryId: item.id
    });

    showToast(`Sold 1x ${item.name}! $${item.sellingPrice} logged, stock reduced to ${item.quantity - 1}.`);
  };

  const handleWhatsAppReminder = (credit: CustomerCredit) => {
    const text = `Salibonani / Mhoro ${credit.customerName}. This is a friendly reminder regarding your outstanding balance of $${credit.amountOwed} at our shop in Bulawayo. Please arrange payment via EcoCash or cash when convenient. Thank you!`;
    navigator.clipboard?.writeText(text);
    showToast('Reminder copied to clipboard! Paste into WhatsApp or SMS.');
  };

  const exportCSV = () => {
    const header = 'Date,Type,Amount,Currency,Category,Description,PaymentMethod,CustomerOrSupplier\n';
    const rows = transactions.map((t) => 
      `"${t.date}","${t.type}","${t.amount}","${t.currency}","${t.category}","${t.description.replace(/"/g, '""')}","${t.paymentMethod}","${t.customerOrSupplier || ''}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cashbook_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('CSV Cashbook report exported.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 pb-24 space-y-6">
      {/* Small Business Header with trader photo */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-600">
              Module Four · Small Business Tools
            </span>
            <button
              onClick={toggleCurrency}
              className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1"
            >
              <Coins className="w-3 h-3" />
              Currency: {currency} (Switch)
            </button>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Tuckshop &amp; Artisan Cashbook
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Record sales in seconds, monitor profits, track inventory levels, and manage customer credit (zvikwereti) without internet.
          </p>
        </div>

        <div className="w-full md:w-64 h-36 rounded-2xl overflow-hidden shrink-0 border border-slate-200">
          <img
            src="/src/assets/images/business_tuckshop_trader_1791981121618.jpg"
            alt="Bulawayo tuckshop owner recording cash ledger"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Total Sales / Income
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-emerald-600 tabular-nums">
              ${totalSales.toFixed(2)}
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            From {transactions.filter(t => t.type === 'sale' || t.type === 'gig_payment').length} entries
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Recorded Expenses
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-rose-600 tabular-nums">
              ${totalExpenses.toFixed(2)}
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Stock, airtime &amp; transport
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Estimated Net Profit
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-teal-700 tabular-nums">
              ${netProfit.toFixed(2)}
            </span>
            <Coins className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {netProfit >= 0 ? 'Healthy operating margin' : 'Review expenses'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            Customer Credit (Owed)
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xl font-black text-amber-600 tabular-nums">
              ${totalCreditOwed.toFixed(2)}
            </span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {customerCredits.length} customers with balance
          </span>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'cashbook', label: 'Cashbook Ledger', count: transactions.length },
            { id: 'inventory', label: 'Stock & Spares', count: inventory.length },
            { id: 'debtors', label: 'Customer Debts', count: customerCredits.length },
            { id: 'reports', label: 'Profit & Reports' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setBizTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                bizTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Quick Add Action based on active tab */}
        {bizTab === 'cashbook' && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setTxType('sale');
                setShowAddTxModal(true);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Sale</span>
            </button>
            <button
              onClick={() => {
                setTxType('expense');
                setShowAddTxModal(true);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs font-bold hover:bg-rose-100 transition"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
          </div>
        )}

        {bizTab === 'inventory' && (
          <button
            onClick={() => setShowAddInvModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Stock Item</span>
          </button>
        )}

        {bizTab === 'debtors' && (
          <button
            onClick={() => setShowAddCreditModal(true)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Debtor</span>
          </button>
        )}
      </div>

      {/* ================= TAB 1: CASHBOOK ================= */}
      {bizTab === 'cashbook' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Date &amp; Details</span>
              <span>Amount &amp; Method</span>
            </div>

            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tx.type === 'expense'
                          ? 'bg-rose-100 text-rose-800'
                          : tx.type === 'gig_payment'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {tx.type === 'expense' ? 'Expense' : tx.type === 'gig_payment' ? 'Gig Payment' : 'Sale'}
                      </span>
                      <span className="font-bold text-slate-900">{tx.category}</span>
                      <span className="text-slate-400">· {tx.date}</span>
                    </div>
                    <p className="text-slate-600 font-medium">{tx.description}</p>
                    {tx.customerOrSupplier && (
                      <p className="text-[11px] text-slate-400">
                        Entity: {tx.customerOrSupplier}
                      </p>
                    )}
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className={`text-sm font-black tabular-nums ${
                        tx.type === 'expense' ? 'text-rose-600' : 'text-emerald-700'
                      }`}>
                        {tx.type === 'expense' ? '-' : '+'}${tx.amount.toFixed(2)}
                      </span>
                      <span className="block text-[10px] text-slate-400 uppercase font-semibold">
                        {tx.paymentMethod}
                      </span>
                    </div>

                    <button
                      onClick={() => StorageEngine.deleteTransaction(tx.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded transition"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: INVENTORY ================= */}
      {bizTab === 'inventory' && (
        <div className="space-y-4">
          {lowStockCount > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{lowStockCount} item(s) are at or below low stock threshold. Consider restocking soon.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {inventory.map((item) => {
              const isLow = item.quantity <= item.lowStockAlert;
              return (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {item.category}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isLow ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.quantity} in stock
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                      <span>Cost: ${item.unitCost.toFixed(2)}</span>
                      <span>·</span>
                      <span className="font-bold text-teal-700">Price: ${item.sellingPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Profit: +${(item.sellingPrice - item.unitCost).toFixed(2)}/unit
                    </span>
                    <button
                      onClick={() => handleQuickSellItem(item)}
                      disabled={item.quantity <= 0}
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-2xs"
                    >
                      Sell 1 Unit
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CUSTOMER DEBTORS (ZVIKWERETI) ================= */}
      {bizTab === 'debtors' && (
        <div className="space-y-4">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-xs text-teal-900 leading-relaxed">
            <strong>Bulawayo Neighborhood Credit Guide: </strong>
            Keeping customer relationships strong while collecting debts requires polite, regular reminders. Tap &apos;WhatsApp Reminder&apos; to generate a polite message template!
          </div>

          <div className="space-y-3">
            {customerCredits.map((cred) => (
              <div key={cred.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{cred.customerName}</span>
                    <span className="text-slate-400 font-mono">({cred.phone})</span>
                  </div>
                  <p className="text-slate-600 italic">&ldquo;{cred.notes}&rdquo;</p>
                  <p className="text-[11px] text-slate-400">Date recorded: {cred.lastPurchaseDate}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <span className="text-xs text-slate-400 block font-medium">Balance</span>
                    <span className="text-base font-black text-amber-600 tabular-nums">
                      ${cred.amountOwed.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleWhatsAppReminder(cred)}
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                    title="Copy polite WhatsApp debt reminder"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                  </button>

                  <button
                    onClick={() => {
                      const pay = prompt(`Record payment from ${cred.customerName} ($):`, cred.amountOwed.toString());
                      if (pay) {
                        const parsed = parseFloat(pay);
                        if (!isNaN(parsed) && parsed > 0) {
                          StorageEngine.recordCustomerPayment(cred.id, parsed);
                          showToast(`Recorded $${parsed} settlement from ${cred.customerName}.`);
                        }
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs hover:bg-teal-700 transition"
                  >
                    Clear / Pay
                  </button>

                  <button
                    onClick={() => StorageEngine.deleteCustomerCredit(cred.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: REPORTS ================= */}
      {bizTab === 'reports' && (
        <div className="space-y-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Profit &amp; Loss Statement</h3>
                <p className="text-xs text-slate-500">Calculated directly from local transactions</p>
              </div>
              <button
                onClick={exportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Gross Sales Revenue</span>
                <span className="font-bold text-emerald-700 text-sm tabular-nums">+${totalSales.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="font-semibold text-slate-700">Operational &amp; Stock Expenses</span>
                <span className="font-bold text-rose-600 text-sm tabular-nums">-${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-3 bg-slate-50 px-4 rounded-xl">
                <span className="font-extrabold text-slate-900 text-sm">Estimated Net Profit</span>
                <span className={`text-base font-black tabular-nums ${netProfit >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                  ${netProfit.toFixed(2)}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Business Health Summary
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Operating with ${totalSales.toFixed(2)} in total revenue across {transactions.length} recorded entries. 
                Keep business funds separate from domestic expenses to maintain sufficient working capital for inventory restocking.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: RECORD TRANSACTION ================= */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateTransaction} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {txType === 'expense' ? 'Record Expense' : 'Record Sale / Income'}
                </h3>
                <p className="text-xs text-slate-500">Fast offline data entry</p>
              </div>
              <button type="button" onClick={() => setShowAddTxModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('sale')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${txType === 'sale' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Sale
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('gig_payment')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${txType === 'gig_payment' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Gig Payment
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition ${txType === 'expense' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'}`}
                >
                  Expense
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-lg font-black text-slate-900 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  placeholder="e.g. Phone Repair, Tailoring, Spares, Airtime"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={txPaymentMethod}
                  onChange={(e) => setTxPaymentMethod(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="cash">Cash (USD / ZiG)</option>
                  <option value="ecocash">EcoCash</option>
                  <option value="innbucks">InnBucks</option>
                  <option value="bank_transfer">Bank Transfer / Zipit</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  placeholder="e.g. Screen replacement for customer"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTxModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD INVENTORY ================= */}
      {showAddInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateInventory} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Inventory / Spares</h3>
                <p className="text-xs text-slate-500">Track stock and cost prices</p>
              </div>
              <button type="button" onClick={() => setShowAddInvModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={invName}
                  onChange={(e) => setInvName(e.target.value)}
                  placeholder="e.g. Samsung Screen, Sewing Thread, Solar MC4"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qty</label>
                  <input
                    type="number"
                    value={invQty}
                    onChange={(e) => setInvQty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cost ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={invCost}
                    onChange={(e) => setInvCost(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sell ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={invPrice}
                    onChange={(e) => setInvPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddInvModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Save Stock Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= MODAL: ADD DEBTOR ================= */}
      {showAddCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateCredit} className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Customer Credit</h3>
                <p className="text-xs text-slate-500">Track outstanding balances (zvikwereti)</p>
              </div>
              <button type="button" onClick={() => setShowAddCreditModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={debtorName}
                  onChange={(e) => setDebtorName(e.target.value)}
                  placeholder="e.g. Mr. Moyo, Amai Tinashe"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={debtorPhone}
                    onChange={(e) => setDebtorPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount Owed ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={debtorAmount}
                    onChange={(e) => setDebtorAmount(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notes / Promise Date</label>
                <input
                  type="text"
                  value={debtorNotes}
                  onChange={(e) => setDebtorNotes(e.target.value)}
                  placeholder="e.g. Will pay after salary on the 20th"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCreditModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700"
              >
                Save Debtor Entry
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
