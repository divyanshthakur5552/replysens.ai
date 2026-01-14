import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthPage } from "@/components/ui/auth-page";

const API_URL = "http://localhost:8000";

export default function Login() {
  const navigate = useNavigate();

  const handleSignUp = async (name: string, email: string, password: string, businessType: string) => {
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        businessType,
      });

      // Return success - user will be switched to login mode
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      const { token } = response.data;
      
      // Save token locally
      localStorage.setItem("token", token);

      // Redirect to dashboard
      navigate("/dashboard");
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, error: message };
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    console.log("Forgot password clicked");
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    console.log("Google auth clicked");
  };

  return (
    <AuthPage
      onLogin={handleLogin}
      onSignUp={handleSignUp}
      onForgotPassword={handleForgotPassword}
      onGoogleAuth={handleGoogleAuth}
      brandName="ReplySense"
    />
  );
}
