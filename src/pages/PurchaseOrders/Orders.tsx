import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table/index.tsx";
import Badge from "../../components/ui/badge/Badge.tsx";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from "firebase/firestore";
import { db } from "../../firebase.ts";
import { Link } from "react-router";

interface Order {
  orderId: string;
  orderPlacedAt: any;
  customerName: string;
  customerMobileNo: string;
  isDelivered: boolean;
}

const PAGE_SIZE = 10;

export default function Orders() {
  const [tableData, setTableData] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([null]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const fetchCount = async () => {
      const colRef = collection(db, "ECommerce", "PurchaseOrders", "PurchaseOrders");
      const snapshot = await getCountFromServer(query(colRef));
      setTotalCount(snapshot.data().count);
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const colRef = collection(db, "ECommerce", "PurchaseOrders", "PurchaseOrders");
      const constraints: any[] = [
        orderBy("orderPlacedAt", "desc"),
        limit(PAGE_SIZE),
      ];

      if (page > 1 && pageCursors[page - 1]) {
        constraints.push(startAfter(pageCursors[page - 1]));
      }

      const q = query(colRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let data: Order[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          orderId: d.orderId || doc.id,
          orderPlacedAt: d.orderPlacedAt,
          customerName: d.shippingAddress?.fullName || "",
          customerMobileNo: d.shippingAddress?.mobileNumber || "",
          isDelivered: d.orderDeliveredAt != null,
        };
      });

      if (filter) {
        const filterLower = filter.toLowerCase();
        data = data.filter(
          (item) =>
            item.customerName.toLowerCase().includes(filterLower) ||
            item.customerMobileNo.includes(filter)
        );
      }

      setTableData(data);

      if (querySnapshot.docs.length > 0) {
        const newCursors = [...pageCursors];
        newCursors[page] = querySnapshot.docs[querySnapshot.docs.length - 1];
        setPageCursors(newCursors);
      }

      setLoading(false);
    };

    fetchData();
    // eslint-disable-next-line
  }, [page, totalCount, filter]);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const buttons = [];
    const maxButtons = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxButtons - 1);

    if (end - start < maxButtons - 1) {
      start = Math.max(1, end - maxButtons + 1);
    }

    if (start > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className={`mx-1 px-2 py-1 rounded ${
            page === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          1
        </button>
      );
      if (start > 2) {
        buttons.push(
          <span key="start-ellipsis" className="mx-1">
            ...
          </span>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`mx-1 px-2 py-1 rounded ${
            page === i ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        buttons.push(
          <span key="end-ellipsis" className="mx-1">
            ...
          </span>
        );
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className={`mx-1 px-2 py-1 rounded ${
            page === totalPages ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex justify-center py-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="mx-1 px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          {"<"}
        </button>
        {buttons}
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="mx-1 px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          {">"}
        </button>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Filter by Name or Mobile"
          value={filter}
          onChange={(e) => {
            setPage(1);
            setFilter(e.target.value);
          }}
          className="border px-2 py-1 rounded"
        />
        <button
          onClick={() => {
            setFilter("");
            setPage(1);
          }}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          Clear
        </button>
        <span className="ml-4 text-gray-500 text-sm">Total: {totalCount}</span>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Order ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Placed At</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Customer</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Mobile</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {tableData.map((item) => (
                <TableRow key={item.orderId}>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Link to={`/order-detail/${item.orderId}`} className="text-blue-600 hover:underline">{item.orderId}</Link>
                    </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.orderPlacedAt?.toDate
                      ? item.orderPlacedAt.toDate().toLocaleString()
                      : ""}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.customerName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {item.customerMobileNo}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={item.isDelivered ? "success" : "warning"}
                    >
                      {item.isDelivered ? "Delivered" : "Pending"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {renderPagination()}
        </div>
      </div>
    </div>
  );
}
