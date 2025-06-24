import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table/index.tsx";
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
import Alert from "../../components/ui/alert/Alert.tsx";
import Badge from "../../components/ui/badge/Badge.tsx";
import { deleteDoc, doc } from "firebase/firestore";
import { TrashBinIcon } from "../../icons/index.ts";

const PAGE_SIZE = 15;

interface Location {
  address: string;
  latitude: number;
  longitude: number;
}

interface Mechanic {
  name: string;
  mobileNo: string;
  mechanicType: string;
  garageName: string;
  profilePicUrl: string;
  location: Location;
  garagePicUrl:string;
  documentUrl:string;

}

interface Shopkeeper {
  name: string;
  mail: string;
  gstNo: string;
  documentUrl: string;
  profilePicUrl: string;
  location: Location;
  shopPicUrl:string;
  shopName:string;
}

interface ShopkeeperRequest {
  complaintId: string;
  createdAt: any;
  invoice: string;
  invoiceUrl: string;
  isCompleted: boolean;
  mechanic: Mechanic;
  shopkeeper: Shopkeeper;
}

export default function ShopkeeperRequests() {
  const [requests, setRequests] = useState<ShopkeeperRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([null]);
  const [filter, setFilter] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ShopkeeperRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState<{
    variant: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
  } | null>(null);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    const fetchCount = async () => {
      const colRef = collection(db, "ShopkeeperRequests");
      const snapshot = await getCountFromServer(query(colRef));
      setTotalCount(snapshot.data().count);
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const colRef = collection(db, "ShopkeeperRequests");
      const constraints: any[] = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];
      if (page > 1 && pageCursors[page - 1]) {
        constraints.push(startAfter(pageCursors[page - 1]));
      }
      const q = query(colRef, ...constraints);
      const querySnapshot = await getDocs(q);

      let data: ShopkeeperRequest[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          complaintId: d.complaintId || doc.id,
          createdAt: d.createdAt,
          invoice: d.invoice || "",
          invoiceUrl: d.invoiceUrl || "",
          isCompleted: d.isCompleted || false,
          mechanic: d.mechanic || {},
          shopkeeper: d.shopkeeper || {},
        };
      });

      if (filter) {
        const filterLower = filter.toLowerCase();
        data = data.filter(
          (item) =>
            item.complaintId.toLowerCase().includes(filterLower) ||
            item.mechanic?.name?.toLowerCase().includes(filterLower) ||
            item.shopkeeper?.name?.toLowerCase().includes(filterLower)
        );
      }

      setRequests(data);

      if (querySnapshot.docs.length > 0) {
        const newCursors = [...pageCursors];
        newCursors[page] = querySnapshot.docs[querySnapshot.docs.length - 1];
        setPageCursors(newCursors);
      }
    };

    fetchData();
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


 const handleDelete = async (complaintId:string) => {
  if (!window.confirm("Are you sure you want to delete this request?")) return;
  try {
    console.log("Attempting to delete document with complaintId:", complaintId);
    const docRef = doc(db, "ShopkeeperRequests", complaintId);
    console.log("Firestore docRef:", docRef);

    await deleteDoc(docRef);
    console.log("Document deleted successfully:", complaintId);

    setRequests((prev) => prev.filter((req) => req.complaintId !== complaintId));
    setAlert({
      variant: "success",
      title: "Deleted",
      message: "Request deleted successfully.",
    });
    setTotalCount((prev) => prev - 1);
  } catch (err) {
    console.error("Error deleting document:", err);
    setAlert({
      variant: "error",
      title: "Error",
      message: "Failed to delete request.",
    });
  }
};


  return (
    <div>
      {alert && (
        <Alert
          variant={alert.variant}
          title={alert.title}
          message={alert.message}
        />
      )}

{isModalOpen && selectedRequest && (
  <div
    className="fixed inset-0 bg-black/10 flex items-center justify-center"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl max-w-md w-full max-h-[75vh] overflow-y-auto relative"
      onClick={e => e.stopPropagation()}
    >
      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 transition"
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-xl font-bold mb-3 text-center">Shopkeeper Request Details</h2>

      {/* Complaint Info */}
      <div className="mb-4">
        <div className="mb-1">
          <span className="font-semibold text-gray-700">Complaint ID:</span>
          <span className="ml-2">{selectedRequest.complaintId}</span>
        </div>
        <div className="mb-1">
          <span className="font-semibold text-gray-700">Created At:</span>
          <span className="ml-2">{selectedRequest.createdAt?.toDate?.().toLocaleString?.() || ""}</span>
        </div>
        <div className="mb-1">
          <span className="font-semibold text-gray-700">Status:</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-xs ${
            selectedRequest.isCompleted ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          }`}>
            {selectedRequest.isCompleted ? "Completed" : "Pending"}
          </span>
        </div>
        <div className="mb-1">
          <span className="font-semibold text-gray-700">Invoice:</span>
          <span className="ml-2">{selectedRequest.invoice}</span>
        </div>
        <div className="mb-1">
          <span className="font-semibold text-gray-700">Invoice URL:</span>
          <a
            href={selectedRequest.invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-600 underline break-all"
          >
            {selectedRequest.invoiceUrl}
          </a>
        </div>
      </div>

      {/* Mechanic */}
      <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
        <img
          src={selectedRequest.mechanic?.profilePicUrl}
          alt="Mechanic"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
        />
         <img
          src={selectedRequest.mechanic?.garagePicUrl}
          alt="Garrage"
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
        />
        <div>
          <div className="font-semibold">{selectedRequest.mechanic?.name}</div>
          <div className="text-gray-500 text-xs">{selectedRequest.mechanic?.mechanicType}</div>
          <div className="text-gray-500 text-xs">{selectedRequest.mechanic?.garageName}</div>
          <div className="text-gray-400 text-xs">{selectedRequest.mechanic?.mobileNo}</div>
          <div className="text-gray-400 text-xs">{selectedRequest.mechanic?.location?.address}</div>
             {selectedRequest.mechanic?.documentUrl && (
            <div className="text-xs">
              <span className="font-semibold text-gray-700">Doc:</span>
              <a
                href={selectedRequest.shopkeeper.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 underline break-all"
              >
                View
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Shopkeeper */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center gap-3">
        <img
          src={selectedRequest.shopkeeper?.profilePicUrl}
          alt="Shopkeeper"
          className="w-14 h-14 rounded-lg object-cover border-2 border-gray-300"
        />
        <img
          src={selectedRequest.shopkeeper?.shopPicUrl}
          alt="Shopkeeper shop"
          className="w-14 h-14 rounded-lg object-cover border-2 border-gray-300"
        />
        <div>
          <div className="font-semibold">{selectedRequest.shopkeeper?.name}</div>
                    <div className="text-gray-500 text-xs">{selectedRequest.shopkeeper?.shopName}</div>

          <div className="text-gray-500 text-xs">{selectedRequest.shopkeeper?.mail}</div>
          {selectedRequest.shopkeeper?.documentUrl && (
            <div className="text-xs">
              <span className="font-semibold text-gray-700">GST Doc:</span>
              <a
                href={selectedRequest.shopkeeper.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 underline break-all"
              >
                View
              </a>
            </div>
          )}
           
          <div className="text-gray-400 text-xs">{selectedRequest.shopkeeper?.location?.address}</div>
        </div>
      </div>
    </div>
  </div>
)}


      <h2 className="text-xl font-bold mb-4">Shopkeeper Requests</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Filter by Complaint ID, Mechanic or Shopkeeper"
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
      </div>
      {/* <h2 className="text-xl font-bold mb-4">Shopkeeper Requests</h2> */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Complaint ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Created At</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Mechanic</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Shopkeeper</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {requests.map((req) => (
                <TableRow key={req.complaintId}>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {req.complaintId}</TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {req.createdAt?.toDate?.().toLocaleString?.() || ""}</TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={req.isCompleted ? "success" : "warning"}
                    >
                      {req.isCompleted ? "Completed" : "Pending"}
                    </Badge></TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>{req.mechanic?.name}</div>
                    <div className="text-xs text-gray-400">{req.mechanic?.mobileNo}</div>
                  </TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div>{req.shopkeeper?.name}</div>
                    <div className="text-xs text-gray-400">{req.shopkeeper?.mail}</div>
                  </TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                      {/* <button
    onClick={() => handleDelete(req.complaintId)}
    className="text-red-600 hover:text-red-800 flex items-center gap-1"
    title="Delete"
  >
    <TrashBinIcon fontSize={20}/>
  </button> */}
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
