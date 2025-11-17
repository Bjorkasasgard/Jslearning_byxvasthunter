import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import ProductList from "./components/ProductList";
import AddProduct from "./components/AddProduct";
import EditProduct from "./components/EditProduct";
import UserList from "./components/UserList";
import UserForm from "./components/UserForm";
import OrderList from "./components/OrderList";
import OrderForm from "./components/OrderForm";

function App() {
  return (
    <div>
      <Header />
      <div className="container mt-5">
        <Routes>
          {/* Product Routes */}
          <Route path="/" element={<ProductList />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/edit/:id" element={<EditProduct />} />

          {/* User Routes */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/add" element={<UserForm />} />
          <Route path="/users/edit/:id" element={<UserForm />} />

          {/* Order Routes */}
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/add" element={<OrderForm />} />
          {/* Edit dan Delete Order akan kita handle langsung di list */}

        </Routes>
      </div>
    </div>
  );
}

export default App;
