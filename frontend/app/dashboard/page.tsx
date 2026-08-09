"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type DashboardStats = {
  customers: number;
  products: number;
  lowStock: number;
  challans: number;
};

const API_URL = "http://localhost:5000/api";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    customers: 0,
    products: 0,
    lowStock: 0,
    challans: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    async function fetchStats() {
      try {
        const response = await fetch(
          `${API_URL}/dashboard/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    }

    fetchStats();
  }, [router]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="h-16 border-b bg-white">
        <div className="flex h-full items-center justify-between px-8">
          <h1 className="text-xl font-bold">
            ERP System
          </h1>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || "Loading..."}
              </p>

              <p className="text-xs text-gray-500">
                {user?.role || ""}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-[calc(100vh-64px)] w-64 border-r bg-white p-5">
          <nav className="space-y-2">
            <NavItem
              label="Dashboard"
              active
              onClick={() => router.push("/dashboard")}
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
              onClick={() =>
                router.push("/dashboard/challans")
              }
            />
          </nav>
        </aside>

        {/* Main */}
        <section className="flex-1 p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h2>

            <p className="mt-2 text-gray-500">
              Welcome back, {user?.name || "User"}.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Customers"
              value={stats.customers.toString()}
              description="Total customers"
            />

            <StatCard
              title="Products"
              value={stats.products.toString()}
              description="Total products"
            />

            <StatCard
              title="Low Stock"
              value={stats.lowStock.toString()}
              description="Products below minimum"
            />

            <StatCard
              title="Challans"
              value={stats.challans.toString()}
              description="Total challans"
            />
          </div>

          {/* Quick Actions */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <button
                onClick={() =>
                  router.push("/dashboard/customers")
                }
                className="rounded-xl border border-gray-200 p-5 text-left transition hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-900">
                  Customers
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Manage customers and follow-ups
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard/products")
                }
                className="rounded-xl border border-gray-200 p-5 text-left transition hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-900">
                  Products
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Manage inventory and products
                </p>
              </button>

              <button
                onClick={() =>
                  router.push("/dashboard/challans")
                }
                className="rounded-xl border border-gray-200 p-5 text-left transition hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-900">
                  New Challan
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Create a sales challan
                </p>
              </button>
            </div>
          </div>
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
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </p>

      <p className="mt-2 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}