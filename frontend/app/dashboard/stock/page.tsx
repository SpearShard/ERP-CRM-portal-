"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: string | number;
  currentStock: number;
  minimumStock: number;
  warehouse: string;
};

type ProductResponse = {
  success: boolean;
  data: {
    products: Product[];
  };
};

type Movement = {
  id: string;
  productId: string;
  quantity: number;
  type: "IN" | "OUT";
  reason: string;
  createdById: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

type MovementResponse = {
  success: boolean;
  data: {
    movements: Movement[];
  };
};

export default function StockPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [movementLoading, setMovementLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [movementError, setMovementError] = useState("");

  const [showForm, setShowForm] = useState(false);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api<ProductResponse>(
        "/products",
        {
          method: "GET",
          token,
        }
      );

      setProducts(response.data.products);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMovements(productId: string) {
    try {
      setMovementLoading(true);
      setMovementError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response =
  await api<MovementResponse>(
    `/products/${productId}/movements`,
    {
      method: "GET",
      token,
    }
  );

      setMovements(response.data.movements);
    } catch (error) {
      setMovementError(
        error instanceof Error
          ? error.message
          : "Failed to load stock movements"
      );
    } finally {
      setMovementLoading(false);
    }
  }

  function selectProduct(product: Product) {
    setSelectedProduct(product);
    loadMovements(product.id);
  }

  function handleMovementCreated() {
    setShowForm(false);

    loadProducts();

    if (selectedProduct) {
      loadMovements(selectedProduct.id);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-8">
          <h1 className="text-xl font-bold text-gray-900">
            ERP System
          </h1>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              router.push("/login");
            }}
            className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-[calc(100vh-64px)] w-64 border-r bg-white p-5">
          <nav className="space-y-2">
            <NavItem
              label="Dashboard"
              onClick={() =>
                router.push("/dashboard")
              }
            />

            <NavItem
              label="Customers"
              onClick={() =>
                router.push("/dashboard/customers")
              }
            />

            <NavItem
              label="Products"
              onClick={() =>
                router.push("/dashboard/products")
              }
            />

            <NavItem
              label="Stock"
              active
              onClick={() =>
                router.push("/dashboard/stock")
              }
            />

            <NavItem
              label="Challans"
              onClick={() =>
                router.push("/dashboard/challans")
              }
            />
          </nav>
        </aside>

        {/* Main Content */}
        <section className="flex-1 p-8">
          {/* Heading */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Stock
              </h2>

              <p className="mt-2 text-gray-600">
                Manage inventory and stock movements.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Stock Movement
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {/* Products */}
          {loading ? (
            <div className="rounded-xl border bg-white p-8 text-gray-700">
              Loading stock...
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Product
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        SKU
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Warehouse
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Current Stock
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Minimum
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => {
                      const isLowStock =
                        product.currentStock <=
                        product.minimumStock;

                      return (
                        <tr
                          key={product.id}
                          className={`border-b last:border-0 hover:bg-gray-50 ${
                            selectedProduct?.id === product.id
                              ? "bg-gray-50"
                              : ""
                          }`}
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-gray-900">
                              {product.name}
                            </p>

                            <p className="text-sm text-gray-700">
                              {product.category}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {product.sku}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {product.warehouse}
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-lg font-semibold text-gray-900">
                              {product.currentStock}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {product.minimumStock}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                isLowStock
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isLowStock
                                ? "LOW STOCK"
                                : "IN STOCK"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <button
                              onClick={() =>
                                selectProduct(product)
                              }
                              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
                            >
                              View History
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {products.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-700"
                        >
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Movement History */}
          {selectedProduct && (
            <div className="mt-8 rounded-xl border bg-white">
              <div className="border-b p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Stock History
                    </h3>

                    <p className="mt-1 text-sm text-gray-600">
                      {selectedProduct.name} •{" "}
                      {selectedProduct.sku}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setMovements([]);
                    }}
                    className="rounded-lg border px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>

              {movementError && (
                <div className="m-6 rounded-lg bg-red-50 p-4 text-red-700">
                  {movementError}
                </div>
              )}

              {movementLoading ? (
                <div className="p-8 text-gray-700">
                  Loading movements...
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                          Type
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                          Quantity
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                          Reason
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                          Created By
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {movements.map((movement) => (
                        <tr
                          key={movement.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                movement.type === "IN"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {movement.type}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {movement.quantity}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {movement.reason}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-700">
                            {movement.createdBy?.name ||
                              movement.createdById}
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(
                              movement.createdAt
                            ).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      ))}

                      {movements.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-gray-700"
                          >
                            No stock movements yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Stock Movement Modal */}
      {showForm && (
        <StockMovementForm
          products={products}
          onClose={() => setShowForm(false)}
          onCreated={handleMovementCreated}
        />
      )}
    </main>
  );
}

/* -------------------------------- */
/* Sidebar */
/* -------------------------------- */

function NavItem({
  label,
  active = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium ${
        active
          ? "bg-black text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

/* -------------------------------- */
/* Stock Movement Form */
/* -------------------------------- */

function StockMovementForm({
  products,
  onClose,
  onCreated,
}: {
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [productId, setProductId] = useState("");

  const [type, setType] = useState<"IN" | "OUT">("IN");

  const [quantity, setQuantity] = useState("");

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const selectedProduct = products.find(
    (product) => product.id === productId
  );

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in");
        return;
      }

      if (!productId) {
        setError("Please select a product");
        return;
      }

      if (!quantity || Number(quantity) <= 0) {
        setError("Quantity must be greater than 0");
        return;
      }

      if (!reason.trim()) {
        setError("Reason is required");
        return;
      }

      await api(
        `/products/${productId}/stock`,
        {
          method: "POST",
          token,
          body: JSON.stringify({
            quantity: Number(quantity),
            type,
            reason: reason.trim(),
          }),
        }
      );

      onCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create stock movement"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              Stock Movement
            </h3>

            <p className="mt-1 text-sm text-gray-700">
              Add or remove inventory.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Product */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Product
            </label>

            <select
              value={productId}
              onChange={(e) =>
                setProductId(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
              required
            >
              <option value="">
                Select product
              </option>

              {products.map((product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.name} ({product.sku}) — Stock:{" "}
                  {product.currentStock}
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock */}
          {selectedProduct && (
            <div className="rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Current stock
                </span>

                <span className="font-semibold text-gray-900">
                  {selectedProduct.currentStock}
                </span>
              </div>
            </div>
          )}

          {/* Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Movement Type
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("IN")}
                className={`rounded-lg border px-4 py-3 font-medium ${
                  type === "IN"
                    ? "border-green-600 bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                + Stock IN
              </button>

              <button
                type="button"
                onClick={() => setType("OUT")}
                className={`rounded-lg border px-4 py-3 font-medium ${
                  type === "OUT"
                    ? "border-red-600 bg-red-50 text-red-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                − Stock OUT
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value)
              }
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Reason
            </label>

            <textarea
              value={reason}
              onChange={(e) =>
                setReason(e.target.value)
              }
              placeholder="e.g. New stock received"
              rows={3}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : "Save Movement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}