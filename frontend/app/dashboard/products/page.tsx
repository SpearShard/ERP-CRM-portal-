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
  createdAt: string;
  updatedAt: string;
};

type ProductResponse = {
  success: boolean;
  data: {
    products: Product[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
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
              active
              onClick={() =>
                router.push("/dashboard/products")
              }
            />

            <NavItem
              label="Stock"
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
                Products
              </h2>

              <p className="mt-2 text-gray-700">
                Manage your products and inventory.
              </p>

            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              + Add Product
            </button>

          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-700">
              Loading products...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {/* Products Table */}
          {!loading && !error && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Product
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        SKU
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Price
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Stock
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Warehouse
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
                          className="border-b border-gray-200 last:border-0 hover:bg-gray-50"
                        >

                          {/* Product */}
                          <td className="px-6 py-4">

                            <div>

                              <p className="font-semibold text-gray-900">
                                {product.name}
                              </p>

                              <p className="mt-1 text-sm text-gray-600">
                                Minimum:{" "}
                                {product.minimumStock}
                              </p>

                            </div>

                          </td>

                          {/* SKU */}
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            {product.sku}
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {product.category}
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 text-sm font-medium text-gray-800">
                            ₹
                            {Number(
                              product.unitPrice
                            ).toLocaleString("en-IN")}
                          </td>

                          {/* Stock */}
                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                isLowStock
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {product.currentStock}

                              {isLowStock && " • Low"}
                            </span>

                          </td>

                          {/* Warehouse */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {product.warehouse}
                          </td>

                        </tr>
                      );
                    })}

                    {products.length === 0 && (
                      <tr>

                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-600"
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

          {/* Add Product Form */}
          {showForm && (
            <AddProductForm
              onClose={() => setShowForm(false)}
              onCreated={() => {
                setShowForm(false);
                loadProducts();
              }}
            />
          )}

        </section>

      </div>

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
      className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
        active
          ? "bg-black text-white"
          : "text-gray-800 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}


/* -------------------------------- */
/* Add Product Form */
/* -------------------------------- */

function AddProductForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    unitPrice: "",
    currentStock: "0",
    minimumStock: "0",
    warehouse: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

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

      await api("/products", {
        method: "POST",
        token,

        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          category: form.category,
          unitPrice: Number(form.unitPrice),
          currentStock: Number(
            form.currentStock
          ),
          minimumStock: Number(
            form.minimumStock
          ),
          warehouse: form.warehouse,
        }),
      });

      onCreated();

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create product"
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8">

        {/* Modal Header */}
        <div className="mb-6 flex items-center justify-between">

          <div>

            <h3 className="text-2xl font-bold text-gray-900">
              Add Product
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Create a new product record.
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
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-5 md:grid-cols-2"
        >

          <Input
            label="Product Name"
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
            required
          />

          <Input
            label="SKU"
            value={form.sku}
            onChange={(value) =>
              updateField("sku", value)
            }
            required
          />

          <Input
            label="Category"
            value={form.category}
            onChange={(value) =>
              updateField("category", value)
            }
            required
          />

          <Input
            label="Unit Price"
            type="number"
            value={form.unitPrice}
            onChange={(value) =>
              updateField("unitPrice", value)
            }
            required
          />

          <Input
            label="Current Stock"
            type="number"
            value={form.currentStock}
            onChange={(value) =>
              updateField(
                "currentStock",
                value
              )
            }
          />

          <Input
            label="Minimum Stock"
            type="number"
            value={form.minimumStock}
            onChange={(value) =>
              updateField(
                "minimumStock",
                value
              )
            }
          />

          <div className="md:col-span-2">

            <Input
              label="Warehouse"
              value={form.warehouse}
              onChange={(value) =>
                updateField(
                  "warehouse",
                  value
                )
              }
              required
            />

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 md:col-span-2">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-800 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Product"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}


/* -------------------------------- */
/* Input */
/* -------------------------------- */

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-800">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        min={
          type === "number"
            ? "0"
            : undefined
        }
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
      />

    </div>
  );
}