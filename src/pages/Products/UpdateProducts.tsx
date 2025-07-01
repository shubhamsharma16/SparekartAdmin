import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { db, storage } from "../../firebase.ts";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UpdateProducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [formData, setFormData] = useState({
    category: "",
    description: "",
    model: "",
    modelYear: "",
    ownerId: "",
    price: "",
    productBrandName: "",
    subcategory: "",
    vehicleMaker: "",
  });

  // Each image is either a URL (string) or a File (if changed)
  const [images, setImages] = useState<(string | File)[]>([]);

  useEffect(() => {
    if (product) {
      setFormData({
        category: product.category || "",
        description: product.description || "",
        model: product.model || "",
        modelYear: product.modelYear || "",
        ownerId: product.ownerId || "",
        price: product.price || "",
        productBrandName: product.productBrandName || "",
        subcategory: product.subcategory || "",
        vehicleMaker: product.vehicleMaker || "",
      });
      setImages(product.productImages || []);
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Only update the image at the given index
  const handleImageChange = (idx: number, file: File) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[idx] = file;
      return updated;
    });
  };

  // Upload only changed images, keep unchanged URLs
  const uploadImages = async () => {
    const urls: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (typeof img === "string" && img.startsWith("http")) {
        urls.push(img); // unchanged
      } else if (img instanceof File) {
        // upload new image, replace old one
        const storageRef = ref(storage, `products/${product.productId}/${img.name}`);
        await uploadBytes(storageRef, img);
        const url = await getDownloadURL(storageRef);
        urls.push(url);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imageUrls = await uploadImages();
      const productRef = doc(db, "ECommerce", "Products", "Products", product.productId);
      await updateDoc(productRef, {
        ...formData,
        productImages: imageUrls,
      });
      alert("Product updated!");
      navigate(-1);
    } catch (error) {
      alert("Error updating product: " + error);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Update Product" />

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        {/* ...your other fields as before... */}
        <div>
          <label className="block font-medium mb-1">Category</label>
          <input
            name="category"
            type="text"
            value={formData.category}
            className="w-full border rounded px-3 py-2 "
            // readOnly
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Model</label>
          <input
            name="model"
            type="text"
            value={formData.model}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Model Year</label>
          <input
            name="modelYear"
            type="number"
            value={formData.modelYear}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        {/* <div>
          <label className="block font-medium mb-1">Owner ID</label>
          <input
            name="ownerId"
            type="text"
            value={formData.ownerId}
            readOnly
            className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
          />
        </div> */}
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input
            name="price"
            type="text"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Product Brand Name</label>
          <input
            name="productBrandName"
            type="text"
            value={formData.productBrandName}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Subcategory</label>
          <input
            name="subcategory"
            type="text"
            value={formData.subcategory}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Vehicle Maker</label>
          <input
            name="vehicleMaker"
            type="text"
            value={formData.vehicleMaker}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* --- Images --- */}
        <div className="md:col-span-2">
          <label className="block font-medium mb-1">Product Images</label>
          <div className="flex flex-wrap gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="mb-1">
                  {typeof img === "string" && (
                    <img src={img} alt={`Product ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  )}
                  {img instanceof File && (
                    <img src={URL.createObjectURL(img)} alt={`Selected ${idx + 1}`} className="w-24 h-24 object-cover rounded border" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) handleImageChange(idx, e.target.files[0]);
                  }}
            className="bg-blue-400 text-white font-semibold py-2 px-3 rounded hover:bg-blue-400 transition"
                />
                <span className="text-xs text-gray-500 mt-1"> Image {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="md:col-span-2 text-right">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold py-2 px-6 rounded hover:bg-blue-700 transition"
          >
            Update Product
          </button>
        </div>
      </form>
    </div>
  );
}
