import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import {
  LineChart,
  BarChart,
  PieChart,
  Pie,
  Cell,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AnalyticsDashboard() {
  const [complaintData, setComplaintData] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [complaintChartType, setComplaintChartType] = useState<'line' | 'bar'>("line");
  const [orderChartType, setOrderChartType] = useState<'line' | 'bar'>("line");
  const [productChartType, setProductChartType] = useState<'bar' | 'pie'>("bar");

  // Complaints per day
  useEffect(() => {
    const fetchComplaints = async () => {
      const colRef = collection(db, "Complaints", "ComplaintRequests", "ComplaintRequests");
      const snapshot = await getDocs(colRef);
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.createdAt && d.createdAt.toDate) {
          const dateStr = d.createdAt.toDate().toISOString().slice(0, 10);
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      });
      const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }));
      setComplaintData(chartData);
    };
    fetchComplaints();
  }, []);

  // Purchase orders per day (correct collection reference)
  useEffect(() => {
    const fetchOrders = async () => {
      const colRef = collection(db, "ECommerce", "PurchaseOrders", "PurchaseOrders");
      const snapshot = await getDocs(colRef);
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.orderPlacedAt && d.orderPlacedAt.toDate) {
          const dateStr = d.orderPlacedAt.toDate().toISOString().slice(0, 10);
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      });
      const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }));
      setOrderData(chartData);
    };
    fetchOrders();
  }, []);

  // Products by category
  useEffect(() => {
    const fetchProducts = async () => {
      const colRef = collection(db, "ECommerce", "Products", "Products");
      const snapshot = await getDocs(colRef);
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        // Group by category (or use ownerName for owner-wise)
        const key = d.category || "Unknown";
        counts[key] = (counts[key] || 0) + 1;
      });
      const chartData = Object.entries(counts).map(([category, count]) => ({ category, count }));
      setProductData(chartData);
    };
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex items-center mb-2 gap-2">
          <h2 className="text-lg font-semibold">Complaints per Day</h2>
          <select
            value={complaintChartType}
            onChange={e => setComplaintChartType(e.target.value as 'line' | 'bar')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {complaintChartType === "line" ? (
            <LineChart data={complaintData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#8884d8" name="Complaints" />
            </LineChart>
          ) : (
            <BarChart data={complaintData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Complaints" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex items-center mb-2 gap-2">
          <h2 className="text-lg font-semibold">Purchase Orders per Day</h2>
          <select
            value={orderChartType}
            onChange={e => setOrderChartType(e.target.value as 'line' | 'bar')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {orderChartType === "line" ? (
            <LineChart data={orderData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Orders" />
            </LineChart>
          ) : (
            <BarChart data={orderData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" name="Orders" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded shadow p-4 mt-8">
        <div className="flex items-center mb-2 gap-2">
          <h2 className="text-lg font-semibold">Products by Category</h2>
          <select
            value={productChartType}
            onChange={e => setProductChartType(e.target.value as 'bar' | 'pie')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {productChartType === "bar" ? (
            <BarChart data={productData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-30} textAnchor="end" interval={0} height={70} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#ffc658" name="Products" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={productData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#ffc658"
                label
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ffc658', '#8884d8', '#82ca9d', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57'][index % 7]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
