import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Toast from '../Toast/toast';
import { Link,useNavigate } from 'react-router-dom';
import Loader from '../Loader/loader';
import Cookies from 'js-cookie';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase-config"; // adjust path

export default function Login() {
  const [show_password, set_show_password] = useState(false);
  const [user_data, set_user_data] = useState({
    email: '',
    password: '',
  });
  const [toast_data, show_toast]  = useState({
    status: '',
    message: ''
  });
  const [prof_img, set_prof_img] = useState(null);

  const [Loading, set_loading] = useState(false);

  const [isMatch, setMatch] = useState(false);

  const navigate =  useNavigate();

  const handleChange = (e) => {
    set_user_data({
      ...user_data,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };
  // Generate Image URL
  
  const handleSubmit = async () => {
    if (!user_data.email.trim()) {
      return show_toast({status:'Fail', message:'Email is required'});
    }
    if (!validateEmail(user_data.email)) {
      return show_toast({status:'Fail', message:'Invalid email format'});
    }
    if (!user_data.password) {
      return show_toast({status:'Fail', message:'Password is required'});
    }
    if (user_data.password.length < 8) {
      return show_toast({status:'Fail', message:'Password must be at least 8 characters'});
    }

    set_loading(true);

    try {
        set_loading(true);
    
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/login?email=${user_data.email}&&password=${user_data.password}`);
        const result = await response.json();
        
        if (result.notFound) {
            // Handle not found case
            show_toast({status:'Fail', message:'You are not Signup'});
        } else if (result.failed) {
            // Handle failure case
            show_toast({status: 'Fail', message: "Try again later, Server reported a failure"});
        } else {
            set_prof_img(result.profile_image);
            if(result.isMatch){
                setMatch(true);
                show_toast({status: 'Success', message: "Logined SuccessFully !"});
                Cookies.set('spending_smart_client', result.token, {expires: 31});
            }else{
                show_toast({status: 'Fail', message: "Password is invalid"});
            }
        }
    } catch (error) {
        console.error("Error while fetching user data:", error);
    } finally {
        setTimeout(()=>{
            set_loading(false); // Always turn off loading
        },1000)
    }
  };

  const handleGoogleLogin = async () => {
  try {
    const google_result = await signInWithPopup(auth, googleProvider);
    // Get user info
    const user = google_result.user;

    if(!user){
      show_toast({status:'Fail', message:'Something Went Wrong, Try again later!'});
      console.log("Failed to get user data from google.");
      return;
    }
    set_loading(true);
    const response = await fetch(`${import.meta.env.VITE_SERVER_API}/login/email?email=${user.email}`)
    const result = await response.json();

    if(result.failed){
      console.log(result);
      show_toast({status:'Fail', message:'Something Went Wrong, Try again later!'});
    }else if(!result.isExists){
      show_toast({status:'Info', message:result.message});
    }else{
      Cookies.set('spending_smart_client', result.token, {expires: 31});
      setMatch(true);
      show_toast({status:'Success', message:"You Login SuccessFully!"});
    }

  } catch (error) {
    console.error("❌ Google Sign-In error:", error.message);
    show_toast({status:'Fail', message:'Something Went Wrong, Try again later!'});
  }finally{
    set_loading(false);
  }
};

  useEffect(()=>{
    if(isMatch){
        setTimeout(()=>{
            navigate('/');
        },1000)
    }
  },[isMatch]);
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {toast_data.message && <Toast toast_data={toast_data}/>}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
            <div>
                <img src="./logo.png" alt="error" className='w-[60%] m-auto bg-white rounded-[50%] p-10 animate-bounce' />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Start tracking your finances in seconds
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div  className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100 overflow-hidden">
          {/* Form Fields */}
          <div className="flex flex-col gap-3 transition-all duration-500">
            <div>
                <img src={prof_img?prof_img:"./dummy_image.webp"} alt="error"  className='m-auto w-[10rem] rounded-[50%] object-cover aspect-square mb-2 p-[5px]' style={{border:'2px solid gainsboro'}}/>
            </div>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={user_data.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={show_password ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={user_data.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => set_show_password(!show_password)}
                >
                  {show_password ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters
              </p>
            </div>


            {/* Login Button */}
            <div>
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium transition-all duration-200"
              >
                Login
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login Button */}
            <div>
              <button
                type="button"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={handleGoogleLogin}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Login with Google
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center transition-all duration-500">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/sign-up" className="font-medium text-orange-500 hover:text-orange-600">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
      {Loading?<Loader/>:''}
    </div>
  );
}