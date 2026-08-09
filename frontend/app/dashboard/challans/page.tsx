"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  businessName: string;
  mobile: string;
  type: string;
  status: string;
};

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

type ChallanItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: string | number;
  quantity: number;
};

type Challan = {
  id: string;
  challanNumber: string;
  customerId: string;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
  totalQuantity: number;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  items?: ChallanItem[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

type CustomersResponse = {
  success: boolean;
  data: {
    customers: Customer[];
  };
};

type ProductsResponse = {
  success: boolean;
  data: {
    products: Product[];
  };
};

type ChallansResponse = {
  success: boolean;
  data: {
    challans: Challan[];
  };
};

type CreateChallanItem = {
  productId: string;
  quantity: number;
};

export default function ChallansPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<Challan[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const [customerResponse, productResponse, challanResponse] =
        await Promise.all([
          api<CustomersResponse>("/customers", {
            method: "GET",
            token,
          }),

          api<ProductsResponse>("/products", {
            method: "GET",
            token,
          }),

          api<ChallansResponse>("/challans", {
            method: "GET",
            token,
          }),
        ]);

      setCustomers(customerResponse.data.customers);
      setProducts(productResponse.data.products);
      setChallans(challanResponse.data.challans);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load challans"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function confirmChallan(id: string) {
    const confirmed = window.confirm(
      "Confirm this challan? Stock will be reduced."
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await api(`/challans/${id}/confirm`, {
  method: "PUT",
  token,
});

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to confirm challan"
      );
    }
  }

  async function cancelChallan(id: string) {
    const confirmed = window.confirm(
      "Cancel this challan?"
    );

    if (!confirmed) return;

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      await api(`/challans/${id}/cancel`, {
  method: "PUT",
  token,
});

      await loadData();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to cancel challan"
      );
    }
  }

  function handleCreated() {
    setShowForm(false);
    loadData();
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}
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

        {/* SIDEBAR */}
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
              onClick={() =>
                router.push("/dashboard/stock")
              }
            />

            <NavItem
              label="Challans"
              active
              onClick={() =>
                router.push("/dashboard/challans")
              }
            />

          </nav>
        </aside>

        {/* CONTENT */}
        <section className="flex-1 p-8">

          {/* HEADING */}
          <div className="mb-8 flex items-center justify-between">

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Challans
              </h2>

              <p className="mt-2 text-gray-600">
                Create and manage sales challans.
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
            >
              + New Challan
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* TABLE */}
          {loading ? (
            <div className="rounded-xl border bg-white p-8 text-gray-700">
              Loading challans...
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-white">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b bg-gray-50">
                    <tr>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Challan
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Items
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Quantity
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Created
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {challans.map((challan) => (

                      <tr
                        key={challan.id}
                        className="border-b last:border-0"
                      >

                        {/* CHALLAN */}
                        <td className="px-6 py-5">
                          <p className="font-semibold text-gray-900">
                            {challan.challanNumber}
                          </p>

                          <p className="mt-1 text-xs text-gray-700">
                            {challan.id}
                          </p>
                        </td>

                        {/* CUSTOMER */}
                        <td className="px-6 py-5">

                          <p className="font-medium text-gray-900">
                            {challan.customer?.name ||
                              challan.customerId}
                          </p>

                          {challan.customer?.businessName && (
                            <p className="text-sm text-gray-700">
                              {challan.customer.businessName}
                            </p>
                          )}

                        </td>

                        {/* ITEMS */}
                        <td className="px-6 py-5">

                          {challan.items?.length ? (
                            <div className="space-y-1">

                              {challan.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="text-sm text-gray-700"
                                >
                                  {item.productName} ×{" "}
                                  {item.quantity}
                                </div>
                              ))}

                            </div>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}

                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-5">

                          <span className="font-semibold text-gray-900">
                            {challan.totalQuantity}
                          </span>

                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">
                          <StatusBadge
                            status={challan.status}
                          />
                        </td>

                        {/* DATE */}
                        <td className="px-6 py-5 text-sm text-gray-600">
                          {new Date(
                            challan.createdAt
                          ).toLocaleDateString("en-IN")}
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-5">

                          {challan.status === "DRAFT" && (
                            <div className="flex gap-2">

                              <button
                                onClick={() =>
                                  confirmChallan(
                                    challan.id
                                  )
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                              >
                                Confirm
                              </button>

                              <button
                                onClick={() =>
                                  cancelChallan(
                                    challan.id
                                  )
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white hover:bg-red-700"
                              >
                                Cancel
                              </button>

                            </div>
                          )}

                          {challan.status === "CONFIRMED" && (
                            <span className="text-sm text-gray-700">
                              Completed
                            </span>
                          )}

                          {challan.status === "CANCELLED" && (
                            <span className="text-sm text-gray-700">
                              Cancelled
                            </span>
                          )}

                        </td>

                      </tr>

                    ))}

                    {challans.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-700"
                        >
                          No challans found.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        </section>
      </div>

      {/* CREATE CHALLAN MODAL */}
      {showForm && (
        <CreateChallanForm
          customers={customers}
          products={products}
          onClose={() => setShowForm(false)}
          onCreated={handleCreated}
        />
      )}

    </main>
  );
}

/* ================================= */
/* NAVIGATION */
/* ================================= */

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

/* ================================= */
/* STATUS BADGE */
/* ================================= */

function StatusBadge({
  status,
}: {
  status: Challan["status"];
}) {
  const styles = {
    DRAFT: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ================================= */
/* CREATE CHALLAN FORM */
/* ================================= */

function CreateChallanForm({
  customers,
  products,
  onClose,
  onCreated,
}: {
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [customerId, setCustomerId] = useState("");

  const [selectedProductId, setSelectedProductId] =
    useState("");

  const [quantity, setQuantity] = useState("");

  const [items, setItems] = useState<CreateChallanItem[]>(
    []
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const selectedProduct = products.find(
    (product) =>
      product.id === selectedProductId
  );

  function addProduct() {
    setError("");

    if (!selectedProductId) {
      setError("Please select a product.");
      return;
    }

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      setError(
        "Quantity must be greater than 0."
      );
      return;
    }

    if (
      selectedProduct &&
      qty > selectedProduct.currentStock
    ) {
      setError(
        `Only ${selectedProduct.currentStock} units are available.`
      );
      return;
    }

    const existingItem = items.find(
      (item) =>
        item.productId === selectedProductId
    );

    if (existingItem) {
      const newQuantity =
        existingItem.quantity + qty;

      if (
        selectedProduct &&
        newQuantity > selectedProduct.currentStock
      ) {
        setError(
          `Only ${selectedProduct.currentStock} units are available.`
        );
        return;
      }

      setItems(
        items.map((item) =>
          item.productId === selectedProductId
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: selectedProductId,
          quantity: qty,
        },
      ]);
    }

    setSelectedProductId("");
    setQuantity("");
  }

  function removeProduct(productId: string) {
    setItems(
      items.filter(
        (item) => item.productId !== productId
      )
    );
  }

  function getProduct(productId: string) {
    return products.find(
      (product) => product.id === productId
    );
  }

  const totalQuantity = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    try {
      setError("");

      if (!customerId) {
        setError("Please select a customer.");
        return;
      }

      if (items.length === 0) {
        setError(
          "Please add at least one product."
        );
        return;
      }

      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("You are not logged in.");
        return;
      }

      await api("/challans", {
        method: "POST",
        token,
        body: JSON.stringify({
          customerId,
          items,
        }),
      });

      onCreated();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create challan"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">

      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8">

        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              New Sales Challan
            </h3>

            <p className="mt-1 text-sm text-gray-700">
              Create a draft challan for a customer.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            ✕
          </button>

        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* CUSTOMER */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-800">
              Customer
            </label>

            <select
              value={customerId}
              onChange={(e) =>
                setCustomerId(e.target.value)
              }
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-black"
              required
            >

              <option value="">
                Select customer
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name} —{" "}
                  {customer.businessName}
                </option>
              ))}

            </select>
          </div>

          {/* ADD PRODUCT */}
          <div className="rounded-xl border bg-gray-50 p-5">

            <h4 className="mb-4 font-semibold text-gray-900">
              Add Products
            </h4>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_140px_auto]">

              <select
                value={selectedProductId}
                onChange={(e) =>
                  setSelectedProductId(
                    e.target.value
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
              >

                <option value="">
                  Select product
                </option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                    disabled={
                      product.currentStock <= 0
                    }
                  >
                    {product.name} ({product.sku}) — Stock:{" "}
                    {product.currentStock}
                  </option>
                ))}

              </select>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                placeholder="Quantity"
                className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-black"
              />

              <button
                type="button"
                onClick={addProduct}
                className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add
              </button>

            </div>

            {selectedProduct && (
              <p className="mt-3 text-sm text-gray-600">
                Available stock:{" "}
                <strong>
                  {selectedProduct.currentStock}
                </strong>
              </p>
            )}

          </div>

          {/* ITEMS */}
          <div>

            <div className="mb-3 flex items-center justify-between">

              <h4 className="font-semibold text-gray-900">
                Challan Items
              </h4>

              <span className="text-sm text-gray-600">
                Total quantity:{" "}
                <strong>{totalQuantity}</strong>
              </span>

            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed p-8 text-center text-gray-700">
                No products added yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border">

                <table className="w-full">

                  <thead className="bg-gray-50">
                    <tr>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                        Product
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800">
                        Quantity
                      </th>

                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800">
                        Action
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {items.map((item) => {

                      const product =
                        getProduct(item.productId);

                      return (
                        <tr
                          key={item.productId}
                          className="border-t"
                        >

                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            {product?.name ||
                              "Unknown product"}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-600">
                            {product?.sku || "-"}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            {item.quantity}
                          </td>

                          <td className="px-4 py-4 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                removeProduct(
                                  item.productId
                                )
                              }
                              className="text-sm font-medium text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* BUTTONS */}
          <div className="flex justify-end gap-3 border-t pt-6">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                loading ||
                !customerId ||
                items.length === 0
              }
              className="rounded-lg bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating..."
                : "Create Draft"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}