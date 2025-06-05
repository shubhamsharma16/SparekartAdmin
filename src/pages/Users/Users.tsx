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

// Replace with your custom components or UI library if required
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table/index.tsx";
interface User {
  id: string;
  app1UserType: string;
  app2UserType: string;
  documentUrl: string;
  garageName: string;
  garagePicUrl: string;
  garageType: string;
  location: {
    address: string;
  };
  mail: string;
  mechanicType: string;
  mobileNo: string;
  name: string;
  profilePicUrl: string;
}

const PAGE_SIZE = 10;

export default function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCursors, setPageCursors] = useState<any[]>([null]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchTotalCount = async () => {
      const snap = await getCountFromServer(collection(db, "Users"));
      setTotalCount(snap.data().count);
    };
    fetchTotalCount();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const constraints: any[] = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];
      if (page > 1 && pageCursors[page - 1]) {
        constraints.push(startAfter(pageCursors[page - 1]));
      }

      const q = query(collection(db, "Users"), ...constraints);
      const snapshot = await getDocs(q);

      let data: User[] = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          app1UserType: d.app1UserType || "",
          app2UserType: d.app2UserType || "",
          documentUrl: d.documentUrl || "",
          garageName: d.garageName || "",
          garagePicUrl: d.garagePicUrl || "",
          garageType: d.garageType || "",
          location: {
            address: d.location?.address || "",
          },
          mail: d.mail || "",
          mechanicType: d.mechanicType || "",
          mobileNo: d.mobileNo || "",
          name: d.name || "",
          profilePicUrl: d.profilePicUrl || "",
        };
      });

  if (filter) {
        const filterLower = filter.toLowerCase();
        data = data.filter(
          (item) =>
            item.name.toLowerCase().includes(filterLower) ||
            item.mail.includes(filter)
        );
      }
      setUsers(data);

      if (snapshot.docs.length > 0) {
        const newCursors = [...pageCursors];
        newCursors[page] = snapshot.docs[snapshot.docs.length - 1];
        setPageCursors(newCursors);
      }
    };

    fetchUsers();
  }, [page,totalCount,filter]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderPagination = () => {
    const buttons = [];
    const max = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) {
      start = Math.max(1, end - max + 1);
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
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={page === 1}
          className="mx-1 px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
        >
          {"<"}
        </button>
        {buttons}
        <button
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
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
      <h2 className="text-xl font-bold mb-4">Users</h2>
        <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Filter by Name or mail"
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
        {/* <span className="ml-4 text-gray-500 text-sm">Total: {totalCount}</span> */}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                {/* <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Profile</TableCell> */}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mobile</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">App1 Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">App2 Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Mechanic Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Garage Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Garage Pic</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Address</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {users.map((u) => (
                <TableRow key={u.id}>
                  {/* <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.profilePicUrl ? (
                      <img src={u.profilePicUrl} alt="profile" className="w-10 h-10 rounded-full border" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </TableCell> */}
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.name}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.mail}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.mobileNo}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.app1UserType}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.app2UserType}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.mechanicType}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.garageName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.garagePicUrl ? (
                      <img src={u.garagePicUrl} alt="garage" className="w-10 h-10 rounded border" />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Image</div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {u.location.address}</TableCell>
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
