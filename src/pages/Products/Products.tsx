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
import { deleteDoc } from "firebase/firestore";
import { PencilIcon, TrashBinIcon } from "../../icons/index.ts";
import Alert from "../../components/ui/alert/Alert.tsx";
import { useNavigate } from "react-router";

interface Product {
  productId: string;
  productBrandName: string;
  description: string;
  model: string;
  category:string;
  subcategory:string;
  modelYear: number;
  vehicleMaker:string;
  price: number;
  productImages: string[];
  createdAt: any;
    ownerId: string;
  ownerName?: string; // <-- add this
}

const PAGE_SIZE = 15;

export default function Products() {
    const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([null]);
  const [filter, setFilter] = useState("");
const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
      const colRef = collection(db, "ECommerce", "Products", "Products");
      const snapshot = await getCountFromServer(query(colRef));
      setTotalCount(snapshot.data().count);
    };
    fetchCount();
  }, []);

const fetchUsersMapByDocId = async () => {
  const userColRef = collection(db, "Users");
  const snapshot = await getDocs(userColRef);
  const userMap: Record<string, string> = {};
  snapshot.forEach(doc => {
    const userData = doc.data();
    userMap[doc.id] = userData.name; // 🔥 doc.id is used
  });
  return userMap;
};


  useEffect(() => {
   const fetchData = async () => {
  const colRef = collection(db, "ECommerce", "Products", "Products");
  const constraints: any[] = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];

  if (page > 1 && pageCursors[page - 1]) {
    constraints.push(startAfter(pageCursors[page - 1]));
  }

  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);

  // Get user map first
  const userMap = await fetchUsersMapByDocId();

  let data: Product[] = querySnapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      productId: d.productId || doc.id,
      productBrandName: d.productBrandName || "",
      description: d.description || "",
      model: d.model || "",
      category:d.category || "",
      subcategory: d.subcategory || "",
      modelYear: d.modelYear || 0,
      vehicleMaker: d.vehicleMaker || "",
      price: d.price || 0,
      productImages: d.productImages || [],
      createdAt: d.createdAt,
      ownerId: d.ownerId || "",
      ownerName: userMap[d.ownerId] || "Unknown",
    };
  });

  if (filter) {
    const filterLower = filter.toLowerCase();
    data = data.filter(
      (item) =>
        item.productBrandName.toLowerCase().includes(filterLower) ||
        item.model.toLowerCase().includes(filterLower) || 
                item.ownerName?.toLowerCase().includes(filterLower)

    );
  }

  setProducts(data);

  if (querySnapshot.docs.length > 0) {
    const newCursors = [...pageCursors];
    newCursors[page] = querySnapshot.docs[querySnapshot.docs.length - 1];
    setPageCursors(newCursors);
  }
};

    fetchData();
  }, [page, totalCount,filter]);

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

  const handleEdit = (product: Product) => {
  console.log("Edit product:", product);
    navigate(`/update-products`, { state: { product } });
};

const handleDelete = async (productId: string) => {
  const confirm = window.confirm("Are you sure you want to delete this product?");
  if (!confirm) return;

  try {
    const productRef = collection(db, "ECommerce", "Products", "Products");
    const snapshot = await getDocs(query(productRef));
    const docToDelete = snapshot.docs.find((doc) => doc.data().productId === productId);

    if (docToDelete) {
      await deleteDoc(docToDelete.ref);   
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
      setAlert({
        variant: "success",
        title: "Deleted!",
        message: "The product has been successfully deleted.",
      });
    } else {
 setAlert({
        variant: "error",
        title: "Not Found",
        message: "The product you are trying to delete was not found.",
      });
        }
  } catch (error) {
    console.error("Error deleting product:", error);
 setAlert({
      variant: "error",
      title: "Error",
      message: "An error occurred while deleting the product.",
    })  }
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


      {isModalOpen && (
  <div
    className="fixed inset-0 bg-black/10 flex items-center justify-center"
    onClick={() => setIsModalOpen(false)} // close on clicking outside modal
  >
    <div
      className="bg-white p-6 rounded shadow-lg max-w-3xl max-h-[80vh] overflow-auto"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
    >
      <button
        onClick={() => setIsModalOpen(false)}
        className="mb-4 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Close
      </button>
      <div className="flex flex-wrap gap-4">
        {selectedImages.map((imgUrl, idx) => (
          <img
            key={idx}
            src={imgUrl}
            alt={`Product Image ${idx + 1}`}
            className="w-48 h-48 object-cover rounded border"
          />
        ))}
      </div>
    </div>
  </div>
)}
      <h2 className="text-xl font-bold mb-4">Products</h2>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Filter by Brand or Model"
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
      {/* <h2 className="text-xl font-bold mb-4">Products</h2> */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                      Owner</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Image</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Brand</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Description</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Model</TableCell>
                     <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Category</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Year</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Price</TableCell>
                      <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    vehicleMaker</TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
  Action
</TableCell>
              </TableRow>
    

            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {products.map((p) => (
                <TableRow key={p.productId}>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.ownerName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.productImages.length > 0 ? (
                      <img
                        src={p.productImages[0]}
                        alt="product"
                        className="w-16 h-16 object-cover rounded border"
                          onClick={() => {
        setSelectedImages(p.productImages);
        setIsModalOpen(true);
      }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.productBrandName}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.description}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.model}</TableCell>

                    <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.subcategory}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.modelYear}</TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    ₹{p.price}</TableCell>

                      <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {p.vehicleMaker}</TableCell>
                     <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
  <div className="flex items-center gap-3">
    <button
      onClick={() => handleEdit(p)}
      className="text-blue-600 hover:text-blue-800"
      title="Edit"
    >
      <PencilIcon fontSize={25}/>
    </button>
    <button
      onClick={() => handleDelete(p.productId)}
      className="text-red-600 hover:text-red-800"
      title="Delete"
    >
<TrashBinIcon fontSize={20}/>
    </button>
  </div>
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
