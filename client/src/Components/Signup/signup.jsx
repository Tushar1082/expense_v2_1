import { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Toast from '../Toast/toast';
import { imageDb, auth, googleProvider } from '../../firebase-config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../Loader/loader';
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import dummy_image from "../../../public/dummy_image.webp";

export default function Signup() {
  const [show_Password, set_show_Password] = useState(false);
  const [form_data, set_form_data] = useState({
    name: '',
    dob: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [toast_data, show_toast] = useState({
    status: '',
    message: ''
  });
  const [prof_img, set_prof_Img] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, set_loading] = useState(false);

  const navigate = useNavigate();
  const signup_first_div_ref = useRef();
  const signup_second_div_ref = useRef();
  const profileRef = useRef();

  const handleChange = (e) => {
    set_form_data({
      ...form_data,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const showProfComp = () => {
    const firstDiv = signup_first_div_ref.current;
    const secondDiv = signup_second_div_ref.current;
    const profileDiv = profileRef.current;

    if (firstDiv && secondDiv) {
      firstDiv.style.transform = 'translate(-150%)';
      secondDiv.style.transform = 'translate(-150%)';

      setTimeout(() => {
        firstDiv.style.display = "none";
        secondDiv.style.display = "none";
        profileDiv.classList.remove('hidden');
        profileDiv.classList.add('flex');
      }, 500);
    }
  };

  // Generate Image URL
  async function generateImgUrl() {
    if (!file) return; // Don't proceed if no file is uploaded

    const imgRef = ref(imageDb, `SpendingSmart/Users/${form_data.email}`);
    try {
      // Upload the image
      const snapshot = await uploadBytes(imgRef, file);
      console.log("File uploaded successfully!");

      // Get the download URL
      const imgUrl = await getDownloadURL(snapshot.ref);
      return imgUrl;
    } catch (error) {
      console.error("Error uploading file or fetching URL:", error);
      return null;
    }
  }

  // Function to delete image from Firebase Storage
  async function deleteImage(email) {
    if (!email) {
      console.error("Email id is required to identify which image to delete.");
      return;
    }

    const imgRef = ref(imageDb, `SpendingSmart/Users/${email}`); // Path of the image

    try {
      // Delete the file
      await deleteObject(imgRef);
      console.log("Image deleted successfully!");
    } catch (error) {
      console.error("Error deleting the image:", error.message);
    }
  }

  function handleProfPic(e) {
    const file = e.target.files[0];
    const img = URL.createObjectURL(file);

    set_prof_Img(img);
    setFile(file);
  }

  const handleSubmit = async () => {

    if (!form_data.name.trim()) {
      return show_toast({ status: 'Fail', message: 'Name is required' });
    }
    if (!form_data.dob.trim()) {
      return show_toast({ status: 'Fail', message: 'Date of birth is required' });
    }
    if (!form_data.email.trim()) {
      return show_toast({ status: 'Fail', message: 'Email is required' });
    }
    if (!validateEmail(form_data.email)) {
      return show_toast({ status: 'Fail', message: 'Invalid email format' });
    }
    if (!form_data.password) {
      return show_toast({ status: 'Fail', message: 'Password is required' });
    }
    if (form_data.password.length < 8) {
      return show_toast({ status: 'Fail', message: 'Password must be at least 8 characters' });
    }
    if (form_data.password !== form_data.confirmPassword) {
      return show_toast({ status: 'Fail', message: 'Passwords do not match' });
    }

    set_loading(true);
    let profileImg = null;
    // Check if the user uploaded an image before generating URL
    if (file) {
      profileImg = await generateImgUrl();
    } else {
      console.log("No image uploaded, skipping image upload.");
    }
    if (profileImg == null) {
      profileImg = 'dummy_image.webp';
    }

    try {

      const result = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ ...form_data, profileImg })
      });
      const fRes = await result.json();

      if (fRes.created) {
        show_toast({ status: 'Success', message: 'Form submitted successfully!' });
        setTimeout(() => {
          navigate('/login');
        }, 500);
      } else if (fRes.failed) {
        show_toast({ status: 'Fail', message: 'Try again later! Error from server' });
        console.log(fRes.error);
        deleteImage(form_data.email);
      } else {
        show_toast({ status: 'Fail', message: 'Try again!' });
        deleteImage(form_data.email);
      }
    } catch (error) {
      show_toast({ status: 'Fail', message: 'Try again later!' });
      console.log('Error While Saving User Data');
      console.log(error);
      deleteImage(form_data.email);
    } finally {
      set_loading(false);
    }

  };
  async function fetchImageAsBlob(url) {
    // Remove existing "sXXX-c" pattern from URL if present
    // "sXXX-c" means 's' followed by digits and '-c' at the end of the URL
    const cleanedUrl = url.replace(/s\d+-c$/, '');

    // Add "s400-c" at the end
    const modifiedUrl = cleanedUrl + 's400-c';

    const response = await fetch(modifiedUrl);
    const blob = await response.blob();
    return blob;
  }

  async function uploadProfileImage(blob, email) {
    try {
      const imageRef = ref(imageDb, `SpendingSmart/Users/${email}`);
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.log("Error while uploading image: ");
      console.log(error);
      return null;
    }
  }

  async function storeUserProfileImage(photoURL, email) {
    console.log(photoURL);
    console.log(email);
    if (!photoURL || !email) {
      return null;
    }

    const blob = await fetchImageAsBlob(photoURL);
    const downloadURL = await uploadProfileImage(blob, email);

    return downloadURL;
  }

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const length = 8;

    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };


  const handleGoogleSignIn = async () => {
    let isImgUploaded = false;
    let user = null;

    try {
      const result = await signInWithPopup(auth, googleProvider);
      user = result.user; // The signed-in user info
      set_loading(true);
      const password = generateRandomPassword();
      const profImg = await storeUserProfileImage(user.photoURL, user.email);

      if (profImg) {
        isImgUploaded = true;
      }

      const userData = {
        profileImg: profImg ? profImg : dummy_image,
        name: user.displayName,
        dob: new Date(),
        email: user.email,
        password: password,
        isGoogleSignUp: true
        // gender: 'male'
      }

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      const fRes = await response.json();

      if (fRes.created) {
        show_toast({ status: 'Success', message: 'You Registered successfully!' });
        setTimeout(() => {
          navigate('/login');
        }, 500);
        return;
      } else if (fRes.failed) {
        show_toast({ status: 'Fail', message: 'Try again later! Error from server' });
        console.log(fRes.error);
      } else {
        show_toast({ status: 'Fail', message: 'Try again!' });
      }
      if (isImgUploaded && user) {
        await deleteImage(user.email);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Google sign-in failed: " + error.message);
      show_toast({ status: 'Fail', message: 'Try again later!' });

      if (isImgUploaded && user) {
        await deleteImage(user.email);
      }
    } finally {
      set_loading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      {toast_data.message && <Toast toast_data={toast_data} />}
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
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-100 overflow-hidden">
          {/* Form Fields */}
          <div ref={signup_first_div_ref} className="flex flex-col gap-3 transition-all duration-500">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={form_data.name}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* DOB Field */}
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  autoComplete="bday"
                  required
                  value={form_data.dob || ''}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
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
                  value={form_data.email}
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
                  type={show_Password ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={form_data.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => set_show_Password(!show_Password)}
                >
                  {show_Password ? (
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={"password"}
                  required
                  value={form_data.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Sign Up Button */}
            <div>
              <button
                type="button"
                onClick={showProfComp}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-md text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 font-medium transition-all duration-200"
              >
                Create Account
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

            {/* Google Sign Up Button */}
            <div>
              <button
                type="button"
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={handleGoogleSignIn}
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
                Sign up with Google
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div ref={signup_second_div_ref} className="mt-6 text-center transition-all duration-500">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-orange-500 hover:text-orange-600">
                Log in
              </Link>
            </p>
          </div>

          <div className='hidden flex-col items-center gap-4' ref={profileRef}>
            <div>
              <label htmlFor="profile-img">
                <img src={prof_img ? prof_img : "./dummy_image.webp"} alt="error" className='w-[10rem] rounded-[50%] object-cover aspect-square mb-2 p-[5px] cursor-pointer' style={{ border: '2px solid gainsboro' }} />
                <span className='font-bold text-[#0000ffb0]'>Upload Profile Picture</span>
              </label>
              <input type="file" hidden id='profile-img' onChange={handleProfPic} accept='image/*' />
            </div>
            <div>
              <button className='bg-[#f15b42] border-none text-white px-[3rem] py-[0.5rem] rounded-[30px] font-[500] cursor-pointer' onClick={handleSubmit}>Next</button>
            </div>
          </div>
        </div>
      </div>
      {loading ? <Loader /> : ''}
    </div>
  );
}