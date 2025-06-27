import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { db, storage } from "../../firebase.ts";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

export default function UpdateUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [formData, setFormData] = useState({
    name: "",
    mail: "",
    mobileNo: "",
    app1UserType: "",
    app2UserType: "",
    mechanicType: "",
    garageName: "",
    garageType: "",
    address: "",
  });

  const [profilePic, setProfilePic] = useState<string | File>("");
  const [garagePic, setGaragePic] = useState<string | File>("");
const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        mail: user.mail || "",
        mobileNo: user.mobileNo || "",
        app1UserType: user.app1UserType || "",
        app2UserType: user.app2UserType || "",
        mechanicType: user.mechanicType || "",
        garageName: user.garageName || "",
        garageType: user.garageType || "",
        address: user.location?.address || "",
      });
      setProfilePic(user.profilePicUrl || "");
      setGaragePic(user.garagePicUrl || "");
    }
  }, [user]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};

const handleImageUpload = async (img: File | string, path: string): Promise<string> => {
  if (typeof img === "string") return img;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, img);
  return await getDownloadURL(storageRef);
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  try {
    const profileUrl = await handleImageUpload(
      profilePic,
      `profile_images/${Date.now()}`
    );
    const garageUrl = await handleImageUpload(
      garagePic,
      `garage_images/${Date.now()}`
    );

    const userRef = doc(db, "Users", user.id);
    await updateDoc(userRef, {
      ...formData,
      profilePicUrl: profileUrl,
      garagePicUrl: garageUrl,
      location: { address: formData.address },
      modifiedAt: new Date(),
    });

    alert("User updated successfully");
    navigate(-1);
  } catch (err) {
    alert("Error updating user: " + err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <PageBreadcrumb pageTitle="Update User" />
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {Object.entries(formData).map(([key, value]) => (
          <div key={key}>
            <label className="block font-medium mb-1 capitalize">{key}</label>
            <input
              name={key}
              value={value}
              onChange={handleChange}
              readOnly={[
                "app1UserType",
                "app2UserType",
                "mechanicType",
              ].includes(key)}
              className={`w-full border rounded px-3 py-2 ${
                ["app1UserType", "app2UserType", "mechanicType"].includes(key)
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        ))}

        {/* Profile Pic */}
        <div>
          <label className="block font-medium mb-1">Profile Picture</label>
          {typeof profilePic === "string" ? (
            <img
              src={profilePic}
              alt="profile"
              className="w-24 h-24 object-cover rounded mb-2"
            />
          ) : (
            <img
              src={URL.createObjectURL(profilePic)}
              alt="profile"
              className="w-24 h-24 object-cover rounded mb-2"
            />
          )}
         <input
  type="file"
  accept="image/*"
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePic(file);
    }
  }}
/>

        </div>

        {/* Garage Pic */}
        <div>
          <label className="block font-medium mb-1">Garage Picture</label>
          {typeof garagePic === "string" ? (
            <img
              src={garagePic}
              alt="garage"
              className="w-24 h-24 object-cover rounded mb-2"
            />
          ) : (
            <img
              src={URL.createObjectURL(garagePic)}
              alt="garage"
              className="w-24 h-24 object-cover rounded mb-2"
            />
          )}
        <input
  type="file"
  accept="image/*"
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGaragePic(file);
    }
  }}
/>
</div>


        <div className="md:col-span-2 text-right">
       <button
  type="submit"
  disabled={loading}
  className={`bg-blue-600 text-white font-semibold py-2 px-6 rounded transition ${
    loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
  }`}
>
  {loading ? "Updating..." : "Update User"}
</button>

        </div>
      </form>
    </div>
  );
}
