
import React, { useState, useMemo } from 'react';
import { UserRole, Order } from './types';
import { useNexusStore } from './store';
import { CATEGORIES } from './constants';
import Layout from './components/Layout';
import ShopGenie from './components/ShopGenie';

const App: React.FC = () => {
  const store = useNexusStore();
  const [view, setView] = useState('home');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.BUYER);
  const [authError, setAuthError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState<number>(2000);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return store.products.filter(p => {
      const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesPrice = p.price <= priceFilter;
      const matchesSearch = searchQuery === '' || 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesPrice && matchesSearch;
    });
  }, [store.products, categoryFilter, priceFilter, searchQuery]);

  const resetAuthFields = () => {
    setAuthEmail('');
    setAuthPassword('');
    setAuthConfirmPassword('');
    setAuthName('');
    setAuthError('');
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSignUp) {
      if (!authEmail || !authPassword || !authName || !authConfirmPassword) {
        setAuthError('All fields are required.');
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
      const result = store.signup(authName, authEmail, authPassword, authRole);
      if (result.success) {
        setView('home');
        resetAuthFields();
      } else {
        setAuthError(result.message);
      }
    } else {
      const result = store.login(authEmail, authPassword);
      if (result.success) {
        setView('home');
        resetAuthFields();
      } else {
        setAuthError(result.message);
      }
    }
  };

  const handleCheckout = () => {
    if (!store.currentUser) {
      // Improved feedback: explain why and redirect
      if (confirm("You must be logged in to place an order. Would you like to sign in now?")) {
        setView('auth');
      }
      return;
    }
    
    if (store.cart.length === 0) {
      alert("Your cart is empty. Add some premium items before checking out!");
      setView('home');
      return;
    }

    // Direct checkout simulation with a default address for smoother demo experience
    const defaultAddress = "742 Evergreen Terrace, Springfield, US";
    const order = store.placeOrder(defaultAddress);
    
    if (order) {
      setLastOrder(order);
      setView('checkout-success');
    } else {
      alert("There was an error processing your transaction. Please verify your details.");
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'auth':
        return (
          <div className="max-w-md mx-auto mt-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900">{isSignUp ? 'Join NexusMarket' : 'Welcome Back'}</h2>
                <p className="text-gray-500 mt-1">{isSignUp ? 'Create your professional account' : 'Sign in to access your dashboard'}</p>
              </div>
              
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authError && (
                  <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {authError}
                  </div>
                )}

                {isSignUp && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1 pl-1 tracking-widest">Full Name</label>
                    <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500" placeholder="Alex J." />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 pl-1 tracking-widest">Email</label>
                  <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500" placeholder="alex@nexus.com" />
                </div>

                <div className="relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 pl-1 tracking-widest">Password</label>
                  <input type={showPassword ? "text" : "password"} value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50 focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[38px] text-gray-400 hover:text-indigo-600">
                    {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                  </button>
                </div>

                {isSignUp && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-1 pl-1 tracking-widest">Confirm Password</label>
                      <input type={showPassword ? "text" : "password"} value={authConfirmPassword} onChange={(e) => setAuthConfirmPassword(e.target.value)} className="w-full border-gray-200 rounded-xl px-4 py-3 bg-gray-50" placeholder="••••••••" />
                    </div>
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-gray-400 uppercase mb-3 pl-1 tracking-widest">Account Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN].map(role => (
                          <button key={role} type="button" onClick={() => setAuthRole(role)} className={`py-2 px-1 text-[9px] font-black rounded-xl border-2 uppercase transition-all ${authRole === role ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'}`}>{role}</button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition shadow-xl mt-4 active:scale-95">{isSignUp ? 'Create Account' : 'Sign In'}</button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-gray-50">
                <p className="text-sm text-gray-500">
                  {isSignUp ? 'Already registered?' : 'New here?'}
                  <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} className="ml-2 text-indigo-600 font-bold hover:underline">{isSignUp ? 'Sign In' : 'Create Account'}</button>
                </p>
              </div>
            </div>
          </div>
        );

      case 'cart':
        return (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              My Shopping Basket
            </h2>
            {store.cart.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm animate-in fade-in zoom-in-95">
                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                   <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <p className="text-gray-500 font-medium mb-6">Your basket is currently empty.</p>
                <button onClick={() => setView('home')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-700 transition active:scale-95">Start Shopping</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {store.cart.map(item => (
                    <div key={item.id} className="flex gap-6 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 items-center hover:border-indigo-100 transition">
                      <img src={item.imageUrl} className="w-24 h-24 rounded-xl object-cover shadow-sm" alt={item.title} />
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{item.category}</p>
                            <h4 className="font-bold text-gray-800 text-lg">{item.title}</h4>
                          </div>
                          <p className="text-indigo-600 font-black text-xl">${item.price}</p>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-sm font-bold bg-gray-50 px-3 py-1 rounded-full border border-gray-100 text-gray-600">Qty: {item.quantity}</span>
                          <button onClick={() => store.removeFromCart(item.id)} className="text-red-400 hover:text-red-600 text-xs font-bold flex items-center gap-1 transition-colors">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 h-fit sticky top-24 shadow-sm">
                   <h3 className="font-extrabold text-xl mb-6 text-gray-900">Order Summary</h3>
                   <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-gray-500 font-medium"><span>Subtotal</span><span className="font-bold text-gray-900">${store.cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span></div>
                      <div className="flex justify-between text-gray-500 font-medium"><span>Shipping</span><span className="text-green-500 font-black text-xs uppercase tracking-widest">FREE</span></div>
                      <div className="pt-4 border-t border-gray-100 flex justify-between items-center"><span className="font-black text-gray-900 text-lg">Total</span><span className="text-indigo-600 font-black text-3xl">${store.cart.reduce((a, b) => a + (b.price * b.quantity), 0)}</span></div>
                   </div>
                   <button 
                    onClick={handleCheckout} 
                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition shadow-xl active:scale-95 transform flex items-center justify-center gap-2"
                   >
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                     Confirm Order
                   </button>
                   <p className="mt-4 text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">Secure 256-bit encrypted checkout</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'checkout-success':
        return (
          <div className="max-w-xl mx-auto py-16 text-center animate-in zoom-in-95 fade-in duration-500">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-50">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Purchased Successfully!</h2>
             <p className="text-gray-500 text-lg mb-8 leading-relaxed">
               Your order <span className="font-bold text-indigo-600">#{lastOrder?.id.split('-')[1]}</span> has been placed.
               A confirmation has been sent to <span className="font-bold text-gray-900">{store.currentUser?.email}</span>.
             </p>
             <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-10 text-left">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Transaction Details</h4>
                <div className="space-y-3 mb-6">
                   {lastOrder?.items.map(item => (
                     <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{item.title} <span className="text-gray-400 text-xs">x{item.quantity}</span></span>
                        <span className="font-bold text-gray-900">${item.price * item.quantity}</span>
                     </div>
                   ))}
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-50">
                   <span className="text-gray-900 font-bold">Total Paid</span>
                   <span className="font-black text-indigo-600 text-2xl">${lastOrder?.total}</span>
                </div>
             </div>
             <button 
               onClick={() => setView('home')}
               className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-2xl hover:bg-indigo-700 transition active:scale-95 transform hover:-translate-y-1"
             >
               Explore More Products
             </button>
          </div>
        );

      case 'seller-dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Seller Inventory</h2>
                <p className="text-gray-500">Control your catalog and stock levels.</p>
              </div>
              <button className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-indigo-700 transition active:scale-95">Add Product</button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-400 tracking-widest">
                  <tr><th className="px-8 py-5 text-left">Product</th><th className="px-8 py-5 text-left">Category</th><th className="px-8 py-5 text-left">Stock</th><th className="px-8 py-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {store.products.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-8 py-5"><div className="flex items-center gap-3"><img src={p.imageUrl} className="w-10 h-10 rounded-lg object-cover shadow-sm" alt={p.title} /><span className="font-bold text-gray-900">{p.title}</span></div></td>
                      <td className="px-8 py-5 text-gray-500">{p.category}</td>
                      <td className="px-8 py-5 font-bold text-indigo-600">{p.stock} units</td>
                      <td className="px-8 py-5 text-right"><button onClick={() => store.deleteProduct(p.id)} className="text-red-500 font-bold hover:underline">Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'admin-dashboard':
        return (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Marketplace Operations</h2>
                <p className="text-gray-500">Real-time auditing and transaction oversight.</p>
              </div>
              <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">System Live</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: 'Revenue', val: `$${store.orders.reduce((a, b) => a + b.total, 0)}`, c: 'text-green-600 bg-green-50' },
                 { label: 'Orders', val: store.orders.length, c: 'text-indigo-600 bg-indigo-50' },
                 { label: 'Users', val: store.users.length, c: 'text-blue-600 bg-blue-50' },
                 { label: 'Items', val: store.products.length, c: 'text-orange-600 bg-orange-50' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center group hover:border-indigo-200 transition">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 group-hover:text-indigo-400 transition">{stat.label}</span>
                    <span className={`text-4xl font-black ${stat.c.split(' ')[0]}`}>{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <h3 className="font-extrabold text-xl mb-6 text-gray-900">Registered Accounts</h3>
                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {store.users.map(u => (
                      <div key={u.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center hover:bg-white border border-transparent hover:border-gray-100 transition">
                        <div><p className="font-bold text-gray-800 text-sm">{u.name}</p><p className="text-[10px] text-gray-400 font-medium">{u.email}</p></div>
                        <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${u.role === UserRole.ADMIN ? 'bg-red-500 text-white' : u.role === UserRole.SELLER ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'}`}>{u.role}</span>
                      </div>
                    ))}
                 </div>
               </div>
               <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <h3 className="font-extrabold text-xl mb-6 text-gray-900">Master Transaction Logs</h3>
                 <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {store.orders.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 font-medium italic">Waiting for market activity...</p>
                      </div>
                    ) : store.orders.map(o => {
                      const buyer = store.users.find(u => u.id === o.buyerId);
                      return (
                        <div key={o.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg">ORDER</div>
                                 <div>
                                    <p className="font-black text-gray-900 text-lg leading-tight">#{o.id.split('-')[1]}</p>
                                    <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-1">Purchased By: {buyer?.name || 'Anonymous User'}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-2xl font-black text-gray-900">${o.total}</p>
                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(o.createdAt).toLocaleString()}</p>
                              </div>
                           </div>
                           <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-inner">
                              <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-4">Detailed Line Items</p>
                              <div className="space-y-5">
                                 {o.items.map(item => (
                                   <div key={item.id} className="flex gap-5 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                      <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm ring-2 ring-gray-50" alt={item.title} />
                                      <div className="flex-1">
                                         <div className="flex justify-between items-start">
                                            <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.title} <span className="text-indigo-600 lowercase font-medium">x{item.quantity}</span></p>
                                            <p className="text-sm font-black text-gray-900">${item.price * item.quantity}</p>
                                         </div>
                                         <p className="text-xs text-gray-400 leading-relaxed italic line-clamp-2 mt-1">{item.description}</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                           <div className="mt-5 flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Delivery: {o.address}
                              </div>
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[9px]">Status: {o.status}</span>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>
          </div>
        );

      case 'home':
      default:
        return (
          <div className="flex flex-col md:flex-row gap-10">
            <aside className="w-full md:w-72 space-y-10 bg-white p-8 rounded-3xl border border-gray-100 h-fit sticky top-24 shadow-sm">
              <div>
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Market Sectors</h3>
                <div className="space-y-1">
                  <button onClick={() => setCategoryFilter('All')} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${categoryFilter === 'All' ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>All Collections</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'}`}>{cat}</button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Price Cap</h3>
                  <span className="text-indigo-600 font-black text-sm">${priceFilter}</span>
                </div>
                <input type="range" min="0" max="2000" step="50" value={priceFilter} onChange={(e) => setPriceFilter(parseInt(e.target.value))} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                 <p className="text-[10px] font-black uppercase text-indigo-400 tracking-widest mb-2">Nexus Rewards</p>
                 <p className="text-sm font-bold text-indigo-900 leading-snug">Sign in to unlock free shipping on all orders.</p>
              </div>
            </aside>

            <div className="flex-grow">
              <div className="mb-10 flex flex-col md:flex-row justify-between items-end gap-4">
                 <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                       {searchQuery ? 'Search Results' : (categoryFilter === 'All' ? 'Nexus Selects' : categoryFilter)}
                    </h2>
                    <p className="text-gray-400 font-medium">Found {filteredProducts.length} premium listings available today.</p>
                 </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   </div>
                   <p className="text-gray-400 font-medium">No products match your current search.</p>
                   <button onClick={() => { setSearchQuery(''); setCategoryFilter('All'); setPriceFilter(2000); }} className="text-indigo-600 font-black mt-4 hover:underline uppercase tracking-widest text-xs">Clear Filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                        <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.title} />
                        <div className="absolute top-4 right-4"><span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100">{product.brand}</span></div>
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between mb-2"><p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{product.category}</p><p className="font-black text-gray-900">${product.price}</p></div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{product.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-grow leading-relaxed">{product.description}</p>
                        <button 
                          onClick={() => store.addToCart(product)} 
                          className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
                           <svg className="w-5 h-5 group-hover/btn:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                           Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      user={store.currentUser} cartCount={store.cart.reduce((a, b) => a + b.quantity, 0)}
      onLogout={store.logout} onNavigate={setView} activeView={view} searchQuery={searchQuery} onSearch={setSearchQuery}
    >
      {renderContent()}
      <ShopGenie products={store.products} />
    </Layout>
  );
};

export default App;
