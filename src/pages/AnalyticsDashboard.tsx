import { useEffect, useState } from "react";
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
import { subMonths, isAfter, format } from "date-fns";

export default function AnalyticsDashboard() {
  const [complaintData, setComplaintData] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [complaintChartType, setComplaintChartType] = useState<'line' | 'bar'>("line");
  const [orderChartType, setOrderChartType] = useState<'line' | 'bar'>("line");
  // const [productChartType, setProductChartType] = useState<'bar' | 'pie'>("bar");
  const [complaintRange, setComplaintRange] = useState<'date' | 'month'>('date');
  const [orderRange, setOrderRange] = useState<'date' | 'month'>('date');
  // const [productRange, setProductRange] = useState<'day' | 'week' | 'month'>('day');
console.log(productData);

  // Complaints per date/month
  useEffect(() => {
    const fetchComplaints = async () => {
      const colRef = collection(db, "Complaints", "ComplaintRequests", "ComplaintRequests");
      const snapshot = await getDocs(colRef);
      const now = new Date();
      let startDate = now;
      if (complaintRange === 'month') startDate = subMonths(now, 6); // last 6 months
      else startDate = subMonths(now, 1); // last 1 month for date-wise
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.createdAt && d.createdAt.toDate) {
          const dateObj = d.createdAt.toDate();
          if (isAfter(dateObj, startDate)) {
            const key = complaintRange === 'month' ? format(dateObj, 'MMM yyyy') : format(dateObj, 'yyyy-MM-dd');
            counts[key] = (counts[key] || 0) + 1;
          }
        }
      });
      const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }));
      setComplaintData(chartData);
    };
    fetchComplaints();
  }, [complaintRange]);

  // Orders per date/month
  useEffect(() => {
    const fetchOrders = async () => {
      const colRef = collection(db, "ECommerce", "PurchaseOrders", "PurchaseOrders");
      const snapshot = await getDocs(colRef);
      const now = new Date();
      let startDate = now;
      if (orderRange === 'month') startDate = subMonths(now, 6);
      else startDate = subMonths(now, 1);
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.orderPlacedAt && d.orderPlacedAt.toDate) {
          const dateObj = d.orderPlacedAt.toDate();
          if (isAfter(dateObj, startDate)) {
            const key = orderRange === 'month' ? format(dateObj, 'MMM yyyy') : format(dateObj, 'yyyy-MM-dd');
            counts[key] = (counts[key] || 0) + 1;
          }
        }
      });
      const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }));
      setOrderData(chartData);
    };
    fetchOrders();
  }, [orderRange]);

  // Products by date (date-wise, no time-interval selector)
  useEffect(() => {
    const fetchProducts = async () => {
      const colRef = collection(db, "ECommerce", "Products", "Products");
      const snapshot = await getDocs(colRef);
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d.createdAt && d.createdAt.toDate) {
          const dateStr = format(d.createdAt.toDate(), 'yyyy-MM-dd');
          counts[dateStr] = (counts[dateStr] || 0) + 1;
        }
      });
      const chartData = Object.entries(counts).map(([date, count]) => ({ date, count }));
      setProductData(chartData);
    };
    fetchProducts();
  }, []);

  // Products by category (bar/pie chart, no time-interval selector)
  const [productCategoryData, setProductCategoryData] = useState<any[]>([]);
  const [productCategoryChartType, setProductCategoryChartType] = useState<'bar' | 'pie'>("bar");
  useEffect(() => {
    const fetchProductsByCategory = async () => {
      const colRef = collection(db, "ECommerce", "Products", "Products");
      const snapshot = await getDocs(colRef);
      const counts: Record<string, number> = {};
      snapshot.forEach(doc => {
        const d = doc.data();
        const key = d.category || "Unknown";
        counts[key] = (counts[key] || 0) + 1;
      });
      const chartData = Object.entries(counts).map(([category, count]) => ({ category, count }));
      setProductCategoryData(chartData);
    };
    fetchProductsByCategory();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <div className="bg-white rounded shadow p-4 mb-8">
        <div className="flex items-center mb-2 gap-2">
          <h2 className="text-lg font-semibold">Complaints</h2>
          <select
            value={complaintChartType}
            onChange={e => setComplaintChartType(e.target.value as 'line' | 'bar')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
          <select
            value={complaintRange}
            onChange={e => setComplaintRange(e.target.value as 'date' | 'month')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="date">Date Wise</option>
            <option value="month">Month Wise</option>
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
          <h2 className="text-lg font-semibold">Purchase Orders</h2>
          <select
            value={orderChartType}
            onChange={e => setOrderChartType(e.target.value as 'line' | 'bar')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
          </select>
          <select
            value={orderRange}
            onChange={e => setOrderRange(e.target.value as 'date' | 'month')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="date">Date Wise</option>
            <option value="month">Month Wise</option>
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
            value={productCategoryChartType}
            onChange={e => setProductCategoryChartType(e.target.value as 'bar' | 'pie')}
            className="ml-2 border px-2 py-1 rounded"
          >
            <option value="bar">Bar Chart</option>
            <option value="pie">Pie Chart</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {productCategoryChartType === "bar" ? (
            <BarChart data={productCategoryData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
                data={productCategoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#ffc658"
                label
              >
                {productCategoryData.map(( index) => (
                  <Cell key={`cell-category-${index}`} fill={['#ffc658', '#8884d8', '#82ca9d', '#ff8042', '#8dd1e1', '#a4de6c', '#d0ed57'][index % 7]} />
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
