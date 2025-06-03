// pages/OrderDetail.tsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebase.ts";
import Badge from "../../components/ui/badge/Badge";

interface Product {
  category: string;
  description: string;
  model: string;
  modelYear: number;
  price: number;
  productBrandName: string;
  quantity: number;
  subcategory: string;
  vehicleMaker: string;
  productImages: string[];
}

interface ShippingAddress {
  fullName: string;
  mobileNumber: string;
  areaStreetSectorVillage: string;
  flatHouseBuilding: string;
  landmark: string;
  pincode: string;
  state: string;
  townCity: string;
}

interface BillingDetails {
  discount: number;
  paymentMethod: string;
  shippingCost: number;
  subtotal: number;
  tax: number;
  totalAmount: number;
  transactionId: string;
}

interface OrderDetailData {
  orderId: string;
  orderPlacedAt: Timestamp;
  orderDeliveredAt?: Timestamp;
  shippingAddress: ShippingAddress;
  billingDetails: BillingDetails;
  products: Product[];
}

export default function OrderDetail() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const colRef = collection(db, "ECommerce", "PurchaseOrders", "PurchaseOrders");
      const q = query(colRef, where("orderId", "==", orderId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setOrder({ ...doc.data(), orderId: doc.id } as OrderDetailData);
      } else {
        setOrder(null);
      }

      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (!order) return <div className="p-6 text-center text-red-500">Order not found.</div>;

  const { shippingAddress, billingDetails, products } = order;

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 max-w-5xl mx-auto space-y-8">
      <h2 className="text-2xl font-semibold border-b pb-2">Order Details</h2>

      {/* Order Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div><strong>Order ID:</strong> {order.orderId}</div>
        <div><strong>Placed At:</strong> {order.orderPlacedAt?.toDate().toLocaleString()}</div>
        <div><strong>Transaction ID:</strong> {billingDetails.transactionId}</div>
        <div>
          <strong>Status:</strong>{" "}
          <Badge size="sm" color={order.orderDeliveredAt ? "success" : "warning"}>
            {order.orderDeliveredAt ? "Delivered" : "Pending"}
          </Badge>
        </div>
      </div>

      {/* Shipping Address */}
      <div>
        <h3 className="text-lg font-semibold border-b pb-1 mb-2">Shipping Address</h3>
        <div className="text-sm text-gray-700 space-y-1 leading-relaxed">
          <div>{shippingAddress.fullName} - {shippingAddress.mobileNumber}</div>
          <div>{shippingAddress.flatHouseBuilding}, {shippingAddress.areaStreetSectorVillage}</div>
          <div>{shippingAddress.landmark}</div>
          <div>{shippingAddress.townCity}, {shippingAddress.state} - {shippingAddress.pincode}</div>
        </div>
      </div>

      {/* Billing Details */}
      <div>
        <h3 className="text-lg font-semibold border-b pb-1 mb-2">Billing Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div><strong>Subtotal:</strong> ₹{billingDetails.subtotal}</div>
          <div><strong>Shipping:</strong> ₹{billingDetails.shippingCost}</div>
          <div><strong>Tax:</strong> ₹{billingDetails.tax}</div>
          <div><strong>Discount:</strong> ₹{billingDetails.discount}</div>
          <div><strong>Total:</strong> ₹{billingDetails.totalAmount}</div>
          <div><strong>Payment Method:</strong> {billingDetails.paymentMethod}</div>
        </div>
      </div>

      {/* Products */}
      <div>
        <h3 className="text-lg font-semibold border-b pb-1 mb-4">Products</h3>
        <div className="space-y-6">
          {products.map((product, idx) => (
            <div key={idx} className="p-4 border rounded-lg shadow-sm bg-gray-50">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={product.productImages[0]}
                  alt={product.description}
                  className="w-28 h-28 object-cover rounded border"
                />
                <div className="text-sm text-gray-800 flex-1 space-y-1">
                  <div className="font-semibold">{product.productBrandName} - {product.subcategory}</div>
                  <div>{product.description}</div>
                  <div>Model: {product.model} ({product.modelYear})</div>
                  <div>Category: {product.category}</div>
                  <div>Vehicle Maker: {product.vehicleMaker}</div>
                  <div>Price: ₹{product.price} x {product.quantity}</div>
                </div>
              </div>
              {product.productImages.length > 1 && (
                <div className="flex gap-2 mt-3 flex-wrap">
                  {product.productImages.slice(1).map((img, i) => (
                    <img key={i} src={img} className="w-16 h-16 object-cover rounded border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
