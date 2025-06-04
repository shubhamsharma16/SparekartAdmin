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

interface Product {
  productId: string;
  productBrandName: string;
  description: string;
  model: string;
  subcategory:string;
  modelYear: number;
  vehicleMaker:string;
  price: number;
  productImages: string[];
  createdAt: any;
}

const PAGE_SIZE = 10;

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageCursors, setPageCursors] = useState<any[]>([null]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  useEffect(() => {
    const fetchCount = async () => {
      const colRef = collection(db, "ECommerce", "Products", "Products");
      const snapshot = await getCountFromServer(query(colRef));
      setTotalCount(snapshot.data().count);
    };
    fetchCount();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const colRef = collection(db, "ECommerce", "Products", "Products");
      const constraints: any[] = [orderBy("createdAt", "desc"), limit(PAGE_SIZE)];

      if (page > 1 && pageCursors[page - 1]) {
        constraints.push(startAfter(pageCursors[page - 1]));
      }

      const q = query(colRef, ...constraints);
      const querySnapshot = await getDocs(q);

      const data: Product[] = querySnapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          productId: d.productId || doc.id,
          productBrandName: d.productBrandName || "",
          description: d.description || "",
          model: d.model || "",
         subcategory: d.subcategory || "",
          modelYear: d.modelYear || 0,
          vehicleMaker:d.vehicleMaker || 0,
          price: d.price || 0,
          productImages: d.productImages || [],
          createdAt: d.createdAt,
        };
      });

      setProducts(data);

      if (querySnapshot.docs.length > 0) {
        const newCursors = [...pageCursors];
        newCursors[page] = querySnapshot.docs[querySnapshot.docs.length - 1];
        setPageCursors(newCursors);
      }
    };

    fetchData();
  }, [page, totalCount]);

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

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell>
                    {p.productImages.length > 0 ? (
                      <img
                        src={p.productImages[0]}
                        alt="product"
                        className="w-16 h-16 object-cover rounded border"
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
