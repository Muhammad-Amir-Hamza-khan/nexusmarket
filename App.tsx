
import React, { useState, useMemo } from 'react';
import { UserRole, Order, Product } from './types';
import { useNexusStore } from './store';
import { CATEGORIES, BRANDS } from './constants';
import Layout from './components/Layout';
import ShopGenie from './components/ShopGenie';

const App: React.FC = () => {
  const store = useNexusStore();
  const [view, setView] = useState('home');
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  
  // Auth state
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authRole, setAuthRole] = useState<UserRole>(UserRole.BUYER);
  const [authError, setAuthError] = useState('');

  // Shop filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState<number>(2000);
  const [searchQuery, setSearchQuery] = useState('');

  // Seller form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'sellerId'>>({
    title: '',
    description: '',
    price: 0,
    category: CATEGORIES[0],
    brand: BRANDS[0],
    stock: 10,
    imageUrl: 'https://picsum.photos/seed/newproduct/600/400'
  });

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

  // Scoped products for the logged-in seller
  const sellerProducts = useMemo(() => {
    if (!store.currentUser) return [];
    return store.products.filter(p => p.sellerId === store.currentUser?.id);
  }, [store.products, store.currentUser]);

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
      } else {
        setAuthError(result.message);
      }
    } else {
      const result = store.login(authEmail, authPassword);
      if (result.success) {
        setView('home');
      } else {
        setAuthError(result.message);
      }
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    store.addProduct(newProduct);
    setShowAddForm(false);
    setNewProduct({
      title: '',
      description: '',
      price: 0,
      category: CATEGORIES[0],
      brand: BRANDS[0],
      stock: 10,
      imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`
    });
  };

  const handleCheckout = () => {
    if (!store.currentUser) {
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

    const defaultAddress = "742 Evergreen Terrace, Springfield, US";
    const order = store.placeOrder(defaultAddress);
    
    if (order) {
      setLastOrder(order);
      setView('checkout-success');
    } else {
      alert("There was an error processing your transaction.");
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
                    {showPassword ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
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
                   <button onClick={handleCheckout} className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition shadow-xl active:scale-95">Confirm Order</button>
                </div>
              </div>
            )}
          </div>
        );

      case 'checkout-success':
        return (
          <div className="max-w-xl mx-auto py-16 text-center animate-in zoom-in-95 fade-in duration-500">
             <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner ring-8 ring-green-50">
                <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
             </div>
             <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter">Purchased Successfully!</h2>
             <p className="text-gray-500 text-lg mb-8 leading-relaxed">Your order <span className="font-bold text-indigo-600">#{lastOrder?.id.split('-')[1]}</span> has been placed.</p>
             <button onClick={() => setView('home')} className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black shadow-2xl hover:bg-indigo-700 transition active:scale-95">Explore More Products</button>
          </div>
        );

      case 'seller-dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Vendor Workspace</h2>
                <p className="text-gray-500">Manage your exclusive inventory and sales.</p>
              </div>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-bold shadow-md hover:bg-indigo-700 transition active:scale-95 flex items-center gap-2"
              >
                {showAddForm ? 'Cancel' : 'Add New Product'}
              </button>
            </div>

            {showAddForm && (
              <div className="bg-white p-8 rounded-3xl border border-indigo-100 shadow-xl animate-in slide-in-from-top-4 duration-300 mb-8">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Create New Listing</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Product Title</label>
                      <input 
                        type="text" required
                        value={newProduct.title} 
                        onChange={e => setNewProduct({...newProduct, title: e.target.value})}
                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3" 
                        placeholder="Nexus Pro Headphones"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Description</label>
                      <textarea 
                        required
                        value={newProduct.description} 
                        onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3 h-24" 
                        placeholder="Briefly describe your product..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Category</label>
                        <select 
                          value={newProduct.category} 
                          onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Brand</label>
                        <input 
                          type="text" required
                          value={newProduct.brand} 
                          onChange={e => setNewProduct({...newProduct, brand: e.target.value})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3" 
                          placeholder="Brand Name"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Price ($)</label>
                        <input 
                          type="number" required min="0"
                          value={newProduct.price} 
                          onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock</label>
                        <input 
                          type="number" required min="1"
                          value={newProduct.stock} 
                          onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                          className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Image URL</label>
                      <input 
                        type="url" required
                        value={newProduct.imageUrl} 
                        onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        className="w-full bg-gray-50 border-gray-100 rounded-xl px-4 py-3" 
                        placeholder="https://..."
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Use a direct image link from Unsplash or similar.</p>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-lg hover:bg-indigo-700 transition active:scale-95">Publish Listing</button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sellerProducts.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <p className="text-gray-400">You haven't listed any products yet.</p>
                </div>
              ) : sellerProducts.map(p => (
                <div key={p.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col group">
                  <div className="aspect-video mb-4 overflow-hidden rounded-2xl bg-gray-50 relative">
                    <img src={p.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={p.title} />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${p.stock < 5 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        {p.stock} in stock
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{p.category}</p>
                    <h4 className="font-bold text-gray-900 mb-2">{p.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 italic">{p.description}</p>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-auto">
                    <span className="font-black text-gray-900">${p.price}</span>
                    <button 
                      onClick={() => { if(confirm('Delete this listing?')) store.deleteProduct(p.id); }}
                      className="text-red-400 hover:text-red-600 font-bold text-xs uppercase transition-colors"
                    >
                      Delete Listing
                    </button>
                  </div>
                </div>
              ))}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               {[
                 { label: 'Revenue', val: `$${store.orders.reduce((a, b) => a + b.total, 0)}`, c: 'text-green-600 bg-green-50' },
                 { label: 'Orders', val: store.orders.length, c: 'text-indigo-600 bg-indigo-50' },
                 { label: 'Users', val: store.users.length, c: 'text-blue-600 bg-blue-50' },
                 { label: 'Items', val: store.products.length, c: 'text-orange-600 bg-orange-50' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center group">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 group-hover:text-indigo-400 transition">{stat.label}</span>
                    <span className={`text-4xl font-black ${stat.c.split(' ')[0]}`}>{stat.val}</span>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
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

               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <h3 className="font-extrabold text-xl mb-6 text-gray-900">Market Inventory Audit</h3>
                 <p className="text-xs text-gray-400 mb-4 uppercase font-bold tracking-widest">Tracking who adds what to the Home Page</p>
                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {store.products.map(p => {
                      const seller = store.users.find(u => u.id === p.sellerId);
                      return (
                        <div key={p.id} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-indigo-200 transition group">
                           <div className="flex justify-between items-start">
                              <div className="flex gap-4">
                                 <img src={p.imageUrl} className="w-12 h-12 rounded-xl object-cover shadow-sm" alt={p.title} />
                                 <div>
                                    <p className="font-bold text-gray-900 text-sm">{p.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Seller: {seller?.name || 'System / Initial'}</span>
                                       <span className="text-[9px] font-bold text-gray-400 uppercase">{p.category}</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="font-black text-gray-900 text-sm">${p.price}</p>
                                 <p className={`text-[9px] font-black uppercase ${p.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>Stock: {p.stock}</p>
                              </div>
                           </div>
                        </div>
                      );
                    })}
                 </div>
               </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
               <h3 className="font-extrabold text-xl mb-6 text-gray-900">Master Transaction Logs</h3>
               <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  {store.orders.map(o => {
                    const buyer = store.users.find(u => u.id === o.buyerId);
                    return (
                      <div key={o.id} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 hover:border-indigo-300 transition-all">
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xs shadow-lg">ORDER</div>
                               <div>
                                  <p className="font-black text-gray-900 text-lg leading-tight">#{o.id.split('-')[1]}</p>
                                  <p className="text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-1">Buyer: {buyer?.name || 'Anonymous'}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-2xl font-black text-gray-900">${o.total}</p>
                               <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{new Date(o.createdAt).toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="bg-white p-5 rounded-2xl border border-gray-100">
                            <div className="space-y-5">
                               {o.items.map(item => (
                                 <div key={item.id} className="flex gap-5 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                    <img src={item.imageUrl} className="w-12 h-12 rounded-xl object-cover" alt={item.title} />
                                    <div className="flex-1">
                                       <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{item.title} x{item.quantity}</p>
                                       <p className="text-xs text-gray-400 italic mt-1 line-clamp-1">{item.description}</p>
                                    </div>
                                 </div>
                               ))}
                            </div>
                         </div>
                      </div>
                    );
                  })}
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
                  <button onClick={() => setCategoryFilter('All')} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${categoryFilter === 'All' ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}>All Collections</button>
                  {CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${categoryFilter === cat ? 'bg-indigo-600 text-white shadow-lg scale-[1.02]' : 'text-gray-500 hover:bg-gray-50'}`}>{cat}</button>
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
            </aside>

            <div className="flex-grow">
              <div className="mb-10">
                <h2 className="text-4xl font-black text-gray-900 tracking-tighter">
                   {searchQuery ? 'Search Results' : (categoryFilter === 'All' ? 'Nexus Selects' : categoryFilter)}
                </h2>
                <p className="text-gray-400 font-medium">Found {filteredProducts.length} premium listings available today.</p>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                   <p className="text-gray-400 font-medium">No products match your current search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                        <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.title} />
                        <div className="absolute top-4 right-4"><span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100">{product.brand}</span></div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between mb-2"><p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{product.category}</p><p className="font-black text-gray-900">${product.price}</p></div>
                        <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">{product.title}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-grow">{product.description}</p>
                        <button 
                          onClick={() => store.addToCart(product)} 
                          className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn"
                        >
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
