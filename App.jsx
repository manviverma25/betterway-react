import React, { useEffect, useMemo, useState } from "react";
import ProductList from "./components/ProductList";
import Filters from "./components/Filters";
import Cart from "./components/Cart";
import useDebounce from "./hooks/useDebounce";

const PRODUCTS_URL = "https://fakestoreapi.com/products";

export default function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(() =>
    JSON.parse(localStorage.getItem("cart")) || {}
  );

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("");

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetch(PRODUCTS_URL)
      .then(res => res.json())
      .then(data =>
        setProducts(
          data.slice(0, 20).map(p => ({
            ...p,
            stock: Math.floor(Math.random() * 5) + 1
          }))
        )
      );
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (debouncedSearch) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    if (category !== "all") {
      list = list.filter(p => p.category === category);
    }

    if (sort === "low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "high") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [products, debouncedSearch, category, sort]);

  const addToCart = product => {
    setCart(prev => {
      const qty = prev[product.id]?.qty || 0;
      if (qty >= product.stock) return prev;
      return {
        ...prev,
        [product.id]: { ...product, qty: qty + 1 }
      };
    });
  };

  const updateQty = (id, qty, stock) => {
    if (qty < 1 || qty > stock) return;
    setCart(prev => ({ ...prev, [id]: { ...prev[id], qty } }));
  };

  const removeFromCart = id => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setSort("");
  };

  return (
    <div className="app">
      <h1>Mini E-Commerce</h1>

      <Filters
        products={products}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
        sort={sort}
        setSort={setSort}
        clearFilters={clearFilters}
      />

      <div className="layout">
        <ProductList products={filteredProducts} addToCart={addToCart} />
        <Cart
          cart={cart}
          updateQty={updateQty}
          removeFromCart={removeFromCart}
        />
      </div>
    </div>
  );
}
