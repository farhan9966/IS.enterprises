import { Switch, Route } from "wouter";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProductForm from "./pages/admin/ProductForm";
import AdminOrders from "./pages/admin/Orders";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/checkout" component={Checkout} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/account" component={Account} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/products/new" component={AdminProductForm} />
          <Route path="/admin/products/:id" component={AdminProductForm} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}
