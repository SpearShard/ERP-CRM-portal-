"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Customer = {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  type: string;
  address: string;
  status: string;
  followUpDate?: string;
  notes?: string;
};

type CustomerResponse = {
  success: boolean;
  data: {
    customers: Customer[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export default function CustomersPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function loadCustomers() {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await api<CustomerResponse>(
        "/customers",
        {
          method: "GET",
          token,
        }
      );

      setCustomers(response.data.customers);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCustomers();
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
              active
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
              onClick={() =>
                router.push("/dashboard/challans")
              }
            />

          </nav>

        </aside>

        {/* Content */}
        <section className="flex-1 p-8">

          <div className="mb-8 flex items-center justify-between">

            <div>

              <h2 className="text-3xl font-bold text-gray-900">
                Customers
              </h2>

              <p className="mt-2 text-gray-700">
                Manage your customers and follow-ups.
              </p>

            </div>

            <button
              className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
              onClick={() => setShowForm(true)}
            >
              + Add Customer
            </button>

          </div>

          {/* Loading */}
          {loading && (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-700">
              Loading customers...
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {/* Customer table */}
          {!loading && !error && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

              <div className="overflow-x-auto">

                <table className="w-full">

                  <thead className="border-b border-gray-200 bg-gray-50">

                    <tr>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Customer
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Business
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Mobile
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Type
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-800">
                        Status
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {customers.map((customer) => (

                      <tr
                        key={customer.id}
                        className="border-b border-gray-200 last:border-0 hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <div>

                            <p className="font-semibold text-gray-900">
                              {customer.name}
                            </p>

                            <p className="mt-1 text-sm text-gray-600">
                              {customer.email || "No email"}
                            </p>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {customer.businessName}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-800">
                          {customer.mobile}
                        </td>

                        <td className="px-6 py-4 text-sm font-medium text-gray-800">
                          {customer.type}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge
                            status={customer.status}
                          />
                        </td>

                      </tr>

                    ))}

                    {customers.length === 0 && (

                      <tr>

                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-600"
                        >
                          No customers found.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

          {/* Add Customer Modal */}
          {showForm && (
            <AddCustomerForm
              onClose={() => setShowForm(false)}
              onCreated={() => {
                setShowForm(false);
                loadCustomers();
              }}
            />
          )}

        </section>

      </div>

    </main>
  );
}

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

function StatusBadge({
  status,
}: {
  status: string;
}) {
  return (
    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
      {status}
    </span>
  );
}

function AddCustomerForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    businessName: "",
    gstNumber: "",
    type: "RETAIL",
    address: "",
    status: "LEAD",
    followUpDate: "",
    notes: "",
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

      await api("/customers", {
        method: "POST",
        token,
        body: JSON.stringify({
          ...form,
          email: form.email || undefined,
          gstNumber: form.gstNumber || undefined,
          followUpDate:
            form.followUpDate || undefined,
          notes: form.notes || undefined,
        }),
      });

      onCreated();

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create customer"
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
              Add Customer
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              Create a new customer record.
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-100"
          >
            ✕
          </button>

        </div>

        {/* Form Error */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 md:grid-cols-2"
        >

          <Input
            label="Name"
            value={form.name}
            onChange={(value) =>
              updateField("name", value)
            }
            required
          />

          <Input
            label="Mobile"
            value={form.mobile}
            onChange={(value) =>
              updateField("mobile", value)
            }
            required
          />

          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(value) =>
              updateField("email", value)
            }
          />

          <Input
            label="Business Name"
            value={form.businessName}
            onChange={(value) =>
              updateField("businessName", value)
            }
            required
          />

          <Input
            label="GST Number"
            value={form.gstNumber}
            onChange={(value) =>
              updateField("gstNumber", value)
            }
          />

          <Select
            label="Customer Type"
            value={form.type}
            onChange={(value) =>
              updateField("type", value)
            }
            options={[
              "RETAIL",
              "WHOLESALE",
              "DISTRIBUTOR",
            ]}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(value) =>
              updateField("status", value)
            }
            options={[
              "LEAD",
              "ACTIVE",
              "INACTIVE",
            ]}
          />

          <Input
            label="Follow-up Date"
            type="date"
            value={form.followUpDate}
            onChange={(value) =>
              updateField("followUpDate", value)
            }
          />

          <div className="md:col-span-2">

            <Input
              label="Address"
              value={form.address}
              onChange={(value) =>
                updateField("address", value)
              }
              required
            />

          </div>

          <div className="md:col-span-2">

            <label className="mb-2 block text-sm font-semibold text-gray-800">
              Notes
            </label>

            <textarea
              value={form.notes}
              onChange={(e) =>
                updateField("notes", e.target.value)
              }
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500"
              placeholder="Additional notes..."
            />

          </div>

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
                : "Create Customer"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

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
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500 focus:border-gray-500"
      />

    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-gray-800">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-gray-500"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

    </div>
  );
}