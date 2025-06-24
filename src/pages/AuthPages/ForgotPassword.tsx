import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent. Please check your inbox.");
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md p-6 bg-white rounded-xl shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-800">Forgot Password</h1>
          <p className="text-sm text-gray-500 mt-1">
            Enter your email to receive a password reset link.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="info@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button className="w-full" size="sm" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </Button>

          {message && (
            <div
              className={`text-sm ${
                message.startsWith("✅") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </div>
          )}

          <div className="text-center mt-2">
            <button
              type="button"
              onClick={() => navigate("/signin")}
              className="text-sm text-primary-600 hover:underline"
            >
              ← Back to Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
