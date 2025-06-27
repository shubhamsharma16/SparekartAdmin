import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter, getCountFromServer,doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "../../firebase.ts";
import { Dialog } from "@headlessui/react";

// UI

interface TrackRecord {
createdAt: any;
description: string;
isDone: boolean;
title: string;
}

interface ComplaintRequest {
complaintId: string;
createdAt: any;
driverMobileNo: string;
driverName: string;
isCompleted: boolean;
trackRecord?: TrackRecord[];
}

const PAGE_SIZE = 10;

export default function AllComplants() {
const [tableData, setTableData] = useState<ComplaintRequest[]>([]);
const [filter, setFilter] = useState(""); // Filter by driverName or mobile
// const [loading, setLoading] = useState(false);
const [totalCount, setTotalCount] = useState(0);
const [page, setPage] = useState(1);
const [pageCursors, setPageCursors] = useState<any[]>([null]); // Store the lastDoc for each page

// Dialog state
const [openDialog, setOpenDialog] = useState(false);
const [selectedComplaint, setSelectedComplaint] = useState<ComplaintRequest | null>(null);
const [trackRecords, setTrackRecords] = useState<TrackRecord[]>([]);
const [newTrack, setNewTrack] = useState<{ title: string; description: string; isDone: boolean }>({
  title: "",
  description: "",
  isDone: false,
});
const [trackLoading, setTrackLoading] = useState(false);

const totalPages = Math.ceil(totalCount / PAGE_SIZE);

// Fetch total count on mount
useEffect(() => {
  const fetchCount = async () => {
    let colRef = collection(db, "Complaints", "ComplaintRequests", "ComplaintRequests");
    const snapshot = await getCountFromServer(query(colRef));
    setTotalCount(snapshot.data().count);
  };
  fetchCount();
}, []);

// Fetch data for current page (no filter)
useEffect(() => {
  const fetchData = async () => {
    // setLoading(true);
    let colRef = collection(db, "Complaints", "ComplaintRequests", "ComplaintRequests");
    let constraints: any[] = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];
    // Use startAfter for pagination if not on first page
    if (page > 1 && pageCursors[page - 1]) {
      constraints.push(startAfter(pageCursors[page - 1]));
    }
    const q = query(colRef, ...constraints);

    const querySnapshot = await getDocs(q);
    let data: ComplaintRequest[] = querySnapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        complaintId: docData.complaintId || doc.id,
        createdAt: docData.createdAt,
        driverMobileNo: docData.driverMobileNo || "",
        driverName: docData.driverName || "",
        isCompleted: docData.isCompleted || false,
        trackRecord: docData.trackRecord || [],
      };
    });

    // Apply filter on fetched data (client-side)
    if (filter) {
      const filterLower = filter.toLowerCase();
      data = data.filter(
        (item) =>
          item.driverName.toLowerCase().includes(filterLower) ||
          item.driverMobileNo.includes(filter)
      );
    }

    setTableData(data);

    // Store the lastDoc for this page if not already stored
    if (querySnapshot.docs.length > 0) {
      const newCursors = [...pageCursors];
      newCursors[page] = querySnapshot.docs[querySnapshot.docs.length - 1];
      setPageCursors(newCursors);
    }
    // setLoading(false);
  };
  fetchData();
  // eslint-disable-next-line
}, [page, totalCount, filter]);

// Open dialog and fetch track records
const handleOpenDialog = async (complaint: ComplaintRequest) => {
  setSelectedComplaint(complaint);
  setTrackLoading(true);
  // Fetch latest from Firestore
  const docRef = doc(
    db,
    "Complaints",
    "ComplaintRequests",
    "ComplaintRequests",
    complaint.complaintId
  );
  const docSnap = await getDoc(docRef);
  let track: TrackRecord[] = [];
  if (docSnap.exists()) {
    const data = docSnap.data();
    track = data.trackRecord || [];
  }
  setTrackRecords(track);
  setTrackLoading(false);
  setOpenDialog(true);
};

// Add new track record
const handleAddTrack = async () => {
  if (!selectedComplaint) return;
  setTrackLoading(true);
  const docRef = doc(
    db,
    "Complaints",
    "ComplaintRequests",
    "ComplaintRequests",
    selectedComplaint.complaintId
  );
  const newRecord: TrackRecord = {
    ...newTrack,
    createdAt: Timestamp.now(),
  };
  const updatedTrack = [...trackRecords, newRecord];
  await updateDoc(docRef, {
    trackRecord: updatedTrack,
    isCompleted: newTrack.isDone,
  });
  setTrackRecords(updatedTrack);
  setNewTrack({ title: "", description: "", isDone: false });
  setTrackLoading(false);
  // Optionally update tableData for instant UI update
  setTableData((prev) =>
    prev.map((item) =>
      item.complaintId === selectedComplaint.complaintId
        ? { ...item, isCompleted: newTrack.isDone, trackRecord: updatedTrack }
        : item
    )
  );
};

// Pagination button rendering
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
      <button key={1} onClick={() => setPage(1)} className={`mx-1 px-2 py-1 rounded ${page === 1 ? "bg-blue-500 text-white" : "bg-gray-200"}`}>1</button>
    );
    if (start > 2) {
      buttons.push(<span key="start-ellipsis" className="mx-1">...</span>);
    }
  }

  for (let i = start; i <= end; i++) {
    buttons.push(
      <button
        key={i}
        onClick={() => setPage(i)}
        className={`mx-1 px-2 py-1 rounded ${page === i ? "bg-blue-500 text-white" : "bg-gray-200"}`}
      >
        {i}
      </button>
    );
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      buttons.push(<span key="end-ellipsis" className="mx-1">...</span>);
    }
    buttons.push(
      <button key={totalPages} onClick={() => setPage(totalPages)} className={`mx-1 px-2 py-1 rounded ${page === totalPages ? "bg-blue-500 text-white" : "bg-gray-200"}`}>{totalPages}</button>
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
    {/* Filter input */}
          <h2 className="text-xl font-bold mb-4">Complaints</h2>

    <div className="mb-4 flex gap-2">
      <input
        type="text"
        placeholder="Filter by Driver Name or Mobile"
        value={filter}
        onChange={(e) => { setPage(1); setFilter(e.target.value); }}
        className="border px-2 py-1 rounded"
      />
      <button
        onClick={() => { setFilter(""); setPage(1); }}
        className="px-2 py-1 bg-gray-200 rounded"
      >
        Clear
      </button>
      {/* <span className="ml-4 text-gray-500 text-sm">
        Total: {totalCount}
      </span> */}
    </div>

    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Complaint ID
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Created At
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Driver Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Driver Mobile No
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Completed
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          
            {tableData.map((item) => (
              <TableRow key={item.complaintId}>
                <TableCell className="px-5 py-4 sm:px-6 text-start">
                  {item.complaintId}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.createdAt?.toDate
                    ? item.createdAt.toDate().toLocaleString()
                    : ""}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.driverName}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {item.driverMobileNo}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={item.isCompleted ? "success" : "warning"}
                  >
                    {item.isCompleted ? "Completed" : "Pending"}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3 text-start">
                  <button
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={() => handleOpenDialog(item)}
                  >
                    Update Status
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>

    {/* Dialog for Track Records */}
    <Dialog open={openDialog} onClose={() => setOpenDialog(false)} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 mt-10">
        <div className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white rounded-lg max-w-lg w-full mx-auto p-6 z-10">
          <Dialog.Title className="text-lg font-bold mb-2">Track Records</Dialog.Title>
          {trackLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <>
              <div className="max-h-60 overflow-y-auto mb-4">
                {trackRecords.length === 0 && (
                  <div className="text-gray-400 text-sm">No track records yet.</div>
                )}
                {trackRecords.map((rec, idx) => (
                  <div key={idx} className="mb-3 border-b pb-2">
                    <div className="font-semibold">{rec.title}</div>
                    <div className="text-xs text-gray-500">
                      {rec.createdAt?.toDate
                        ? rec.createdAt.toDate().toLocaleString()
                        : ""}
                    </div>
                    <div className="text-sm">{rec.description}</div>
                    <div className="text-xs">
                      <Badge size="sm" color={rec.isDone ? "success" : "warning"}>
                        {rec.isDone ? "Done" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <div className="font-semibold mb-2">Add New Track Record</div>
                <input
                  className="w-full border px-2 py-1 rounded mb-2"
                  placeholder="Title"
                  value={newTrack.title}
                  onChange={(e) => setNewTrack((prev) => ({ ...prev, title: e.target.value }))}
                />
                <textarea
                  className="w-full border px-2 py-1 rounded mb-2"
                  placeholder="Description"
                  value={newTrack.description}
                  onChange={(e) => setNewTrack((prev) => ({ ...prev, description: e.target.value }))}
                />
                <label className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={newTrack.isDone}
                    onChange={(e) => setNewTrack((prev) => ({ ...prev, isDone: e.target.checked }))}
                    className="mr-2"
                  />
                  Mark as Done (Completed)
                </label>
                <button
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleAddTrack}
                  disabled={trackLoading || !newTrack.title || !newTrack.description}
                >
                  {trackLoading ? "Saving..." : "Add Record"}
                </button>
              </div>
            </>
          )}
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={() => setOpenDialog(false)}
          >
            ×
          </button>
        </div>
      </div>
    </Dialog>
  </div>
);
}
