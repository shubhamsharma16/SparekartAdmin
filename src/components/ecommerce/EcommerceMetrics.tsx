import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  DollarLineIcon,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { collection, getCountFromServer } from "firebase/firestore";
import { db } from "../../firebase.ts";

export default function EcommerceMetrics() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
    const [complaintCount, setComplaintCount] = useState<number | null>(null);


  useEffect(() => {
    async function fetchCounts() {
      try {
        // Fetch user count
        const usersCollection = collection(db, "Users");
        const userSnapshot = await getCountFromServer(usersCollection);
        setUserCount(userSnapshot.data().count);

        // Fetch order count from subcollection
        const ordersSubcollection = collection(
          db,
          "ECommerce",
          "PurchaseOrders",
          "PurchaseOrders"
        );
        const orderSnapshot = await getCountFromServer(ordersSubcollection);
        setOrderCount(orderSnapshot.data().count);

          // Fetch order count from subcollection
        const complaintsSubcollection = collection(
          db,
          "Complaints",
          "ComplaintRequests",
          "ComplaintRequests"
        );
        const complaintSnapshot = await getCountFromServer(complaintsSubcollection);
        setComplaintCount(complaintSnapshot.data().count);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      {/* Users */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-green-800 size-6 dark:text-green/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Users
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {userCount !== null ? userCount.toLocaleString() :   <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
}
            </h4>
          </div>
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <DollarLineIcon className="text-blue-800 size-6 dark:text-blue/90" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Orders
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {orderCount !== null ? orderCount.toLocaleString() :   <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
}
            </h4>
          </div>
          {/* <Badge color="error">
            <ArrowDownIcon />
            9.05%
          </Badge> */}
        </div>
      </div>

         {/* Complaints */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
<BoxIconLine className="text-red-500 size-6 dark:text-red-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Complaints
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {complaintCount !== null ? complaintCount.toLocaleString() :   <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
}
            </h4>
          </div>
          {/* <Badge color="error">
            <ArrowDownIcon />
            9.05%
          </Badge> */}
        </div>
      </div>
    </div>
  );
}
