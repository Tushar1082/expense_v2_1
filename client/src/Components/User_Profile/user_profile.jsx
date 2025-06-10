import Sidebar from "../Sidebar/sidebar";
import Navbar from "../Homepage/Navbar";
import {useNavigate } from "react-router-dom";
import Loader from "../Loader/loader";
import Toast from "../Toast/toast"; // Added missing import
import { useCallback, useEffect, useState } from "react";
import { imageDb } from '../../firebase-config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import Cookies from "js-cookie";

export default function UserProfile() {
    const navigate = useNavigate();
    const selectedTab = "userprofile";
    const [loading, set_loading] = useState(false);
    const [toast_data, show_toast] = useState({
        status: '',
        message: ''
    });
    const [user_data, set_user_data] = useState();
    const [profile_form, set_profile_form] = useState({
        name: '',
        email: '',
        profile_image: '',
        date_of_birth: '',
        gender: ''
    });
    const [password_form, set_password_form] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [is_editing, set_is_editing] = useState(false);
    const [is_changing_password, set_is_changing_password] = useState(false);
    const [file, setFile] = useState(null);
    const [change_email, set_change_email] = useState(false);
    const [otp, set_otp] = useState({ show: false, actual_otp: null, entered_otp: null });

    const user_id = Cookies.get('spending_smart_client');

    const fetch_user = useCallback(async () => {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                }
            });
            const result = await response.json();

            if (result.notFound) {
                console.warn("User not found");
            } else if (result.failed) {
                console.error("Server reported a failure");
            } else {
                set_user_data(result);
                // Initialize form with user data
                set_profile_form({
                    name: result.name || '',
                    email: result.email || '',
                    profile_image: result.profile_image || '',
                    date_of_birth: result.dob || '',
                    gender: result.gender || ''
                });
            }
        } catch (error) {
            console.error("Error while fetching user data:", error);
        } finally {
            set_loading(false);
        }
    }, [user_id]);

    const handle_form_change = (e) => {
        const { name, value } = e.target;
        set_profile_form(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handle_password_change = (e) => {
        const { name, value } = e.target;
        set_password_form(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handle_image_upload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                set_profile_form(prev => ({
                    ...prev,
                    profile_image: event.target.result
                }));
            };
            reader.readAsDataURL(file);
            setFile(file);
        }
    };
    // Generate Image URL
    async function generateImgUrl() {
        if (!file) return; // Don't proceed if no file is uploaded

        const imgRef = ref(imageDb, `SpendingSmart/Users/${profile_form.email}`);
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
            return false;
        }

        const imgRef = ref(imageDb, `SpendingSmart/Users/${email}`); // Path of the image

        try {
            // Delete the file
            await deleteObject(imgRef);
            console.log("Image deleted successfully!");
            return true;
        } catch (error) {
            console.error("Error deleting the image:", error.message);
            return false;
        }
    }

    const handle_save_profile = async () => {
        let originalImage = user_data?.profile_image || '';

        try {
            set_loading(true);
            let profileImg = originalImage;
            let newImageUploaded = false;

            // Check if the user uploaded an image before generating URL
            if (file) {
                const uploadedUrl = await generateImgUrl();
                if (uploadedUrl) {
                    profileImg = uploadedUrl;
                    newImageUploaded = true;
                } else {
                    // Image upload failed, don't proceed with profile update
                    show_toast({
                        status: 'Fail',
                        message: 'Failed to upload image. Please try again.'
                    });
                    return; // Exit early if image upload fails
                }
            }

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${user_id}`,
                },
                body: JSON.stringify({ ...profile_form, profile_image: profileImg })
            });

            const result = await response.json();

            if (result.failed) {
                console.log(result.failed);
                show_toast({
                    status: 'Fail',
                    message: 'Failed to update profile, Try again later!'
                });

                // Delete the newly uploaded image if database update failed
                if (newImageUploaded) {
                    await deleteImage(profile_form.email);
                }
            } else if (!result.updated) {
                show_toast({
                    status: 'Fail',
                    message: 'Failed to update profile, Try again!'
                });
                // Delete the newly uploaded image if database update failed
                if (newImageUploaded) {
                    await deleteImage(profile_form.email);
                }
            } else {
                show_toast({
                    status: 'Success',
                    message: 'Profile updated successfully!'
                });
                set_is_editing(false);
                set_user_data(prev => ({ ...prev, ...profile_form, profile_image: profileImg }));
                // Update the form state with the actual uploaded URL (not the preview)
                set_profile_form(prev => ({
                    ...prev,
                    profile_image: profileImg
                }));
                setFile(null); // Clear the file state
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            show_toast({
                status: 'Fail',
                message: 'An error occurred while updating profile'
            });

            // Delete the newly uploaded image if there was an error             
            if (newImageUploaded) {
                await deleteImage(profile_form.email);
            }
        } finally {
            set_loading(false);
        }
    };

    const handle_change_password = async () => {
        // Validation
        if (!password_form.old_password || !password_form.new_password || !password_form.confirm_password) {
            show_toast({
                status: 'Fail',
                message: 'Please fill in all password fields'
            });
            return;
        }

        if (password_form.new_password !== password_form.confirm_password) {
            show_toast({
                status: 'Fail',
                message: 'New passwords do not match'
            });
            return;
        }

        if (password_form.new_password.length < 6) {
            show_toast({
                status: 'Fail',
                message: 'New password must be at least 6 characters long'
            });
            return;
        }

        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user/change-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${user_id}`,
                },
                body: JSON.stringify({
                    old_password: password_form.old_password, //previous password that of user account. This is given by user.
                    new_password: password_form.new_password
                })
            });

            const result = await response.json();

            if (result.failed) {
                console.log(result);
                show_toast({ status: 'Fail', message: 'Failed to change password, Try again later!' });
            } else if (!result.isOldCorrect) {
                show_toast({ status: "Fail", message: result.message });
            } else if (!result.updated) {
                show_toast({
                    status: 'Fail',
                    message: 'Failed to change password, Try again'
                });
            } else {
                set_is_changing_password(false);
                set_password_form({
                    old_password: '',
                    new_password: '',
                    confirm_password: ''
                });

                show_toast({
                    status: 'Success',
                    message: 'Password changed successfully!'
                });

            }
        } catch (error) {
            console.error("Error changing password:", error);
            show_toast({
                status: 'Fail',
                message: 'An error occurred while changing password'
            });
        } finally {
            set_loading(false);
        }
    };

    const handle_cancel_edit = () => {
        // Reset form to original user data
        set_profile_form({
            name: user_data?.name || '',
            email: user_data?.email || '',
            profile_image: user_data?.profile_image || '',
            date_of_birth: user_data?.date_of_birth || '',
            gender: user_data?.gender || ''
        });
        setFile(null); // Clear any selected file
        set_is_editing(false);
    };

    const handle_cancel_password_change = () => {
        set_password_form({
            old_password: '',
            new_password: '',
            confirm_password: ''
        });
        set_is_changing_password(false);
    };

    const handle_forgot_password = () => {
        navigate('/forgot-password');
    };
    const handle_email_change = async () => {
        console.log(otp);
        if (!otp.entered_otp) {
            console.log("Missing Field: otp.entered_otp.");
            return;
        }
        const user_enter_otp = parseFloat(otp.entered_otp);
        const user_actual_otp = parseFloat(otp.actual_otp);

        if (user_enter_otp !== user_actual_otp) {
            show_toast({ status: "Fail", message: "Entered OTP is wrong..." });
            return;
        }
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/email/change-email`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                },
                body: JSON.stringify({ new_email: profile_form.email })
            });
            const result = await response.json();
            console.log(result);

            if (result.failed) {
                console.log(result);
                show_toast({ status: "Fail", message: "Fail to update due to server failure, Try again later!" });
            } else if (!result.updated) {
                show_toast({ status: "Fail", message: "Fail to update, Try again!" });
            } else {
                show_toast({ status: "Success", message: "Successfully Email Updated!" });
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }

        } catch (error) {
            show_toast({ status: "Fail", message: "Error while changing email address..., Try again later!" });
            console.log("Error while changing email address...");
            console.log(error);
        } finally {
            set_loading(false);
        }
    }
    const handle_send_otp = async () => {
        const { name, email } = profile_form;

        if (!name) {
            console.log("name field is missing.");
            return;
        }
        if (!email) {
            console.log("email field is missing.");
            return;
        }

        if (email.split('@')[0] === user_data.email.split('@')[0]) {
            show_toast({ status: "Fail", message: "Please provide new email id" });
            return;
        }
        try {
            set_loading(true);
            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/email/change-email/otp?name=${name}&&email=${email}`, {
                headers: {
                    "Authorization": `Bearer ${user_id}`, //user_id as token
                }
            });
            const result = await response.json();
            console.log(result);
            if(result.isEmailExits){
                show_toast({status:'Fail', message:result.message});
            }else if (result.failed) {
                console.log(result);
                show_toast({ status: "Fail", message: "Failed to send otp due to server failure, Try again later!" });
            } else if (!result.send) {
                show_toast({ status: "Fail", message: "Failed to send otp, Try again!" });
            }
            else {
                set_otp({ show: true, actual_otp: result.otp });
                show_toast({ status: "Success", message: "Successfully send otp, Please check your email!" });
            }

        } catch (error) {
            show_toast({ status: "Fail", message: "Error while sending otp through email for changing email address..., Try again later!" });
            console.log(error);
        } finally {
            set_loading(false);
        }
    }

    useEffect(() => {
        if (user_id) {
            fetch_user();
        }
    }, [fetch_user]);

    return (
        <div className="flex">
            <Sidebar selectedTab={selectedTab} user_profile_image={user_data?.profile_image} user_name={user_data?.name} />
            {toast_data.message && <Toast toast_data={toast_data} />}
            {loading && <Loader />}
            <div className="w-[100%]">
                <Navbar
                    user_id={user_data?._id}
                    user_name={user_data?.name}
                    user_profile_image={user_data?.profile_image}
                    set_loading={set_loading}
                    friend_request={user_data?.friendRequest_come}
                    money_request={user_data?.money_request}
                    notifications={user_data?.notifications}
                    show_toast={show_toast}
                />

                {/* Profile Content */}
                <div className="p-6 bg-gray-50 min-h-screen">
                    <div className="max-w-4xl mx-auto">
                        {/* Header */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-center">
                                <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
                                {!is_editing ? (
                                    <button
                                        onClick={() => set_is_editing(true)}
                                        className="px-6 py-2 bg-[#f15b42] text-yellow-200 rounded-lg hover:-translate-y-1  hover:opacity-90 transition-all duration-200 font-medium cursor-pointer"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handle_cancel_edit}
                                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handle_save_profile}
                                            className="px-6 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Profile Image Section */}
                                <div className="lg:col-span-1">
                                    <div className="text-center">
                                        <div className="relative inline-block">
                                            <img
                                                src={profile_form.profile_image || '/default-avatar.png'}
                                                alt="Profile"
                                                className="w-32 h-32 rounded-full object-cover border-4 border-[#f15b42] shadow-lg"
                                            />
                                            {is_editing && (
                                                <label className="absolute bottom-0 right-0 bg-[#4285F4] text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handle_image_upload}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                        <h2 className="mt-4 text-xl font-semibold text-gray-800">{profile_form.name || 'Your Name'}</h2>
                                        <p className="text-gray-600">{user_data?.email || profile_form.email}</p>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="lg:col-span-2">
                                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> */}
                                    <div className="flex flex-col gap-6">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={profile_form.name}
                                                onChange={handle_form_change}
                                                disabled={!is_editing}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                placeholder="Enter your full name"
                                            />
                                        </div>

                                        {/* Email */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profile_form.email}
                                                onChange={handle_form_change}
                                                disabled={!is_editing}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                placeholder="Enter your email"
                                            />
                                        </div> */}

                                        {/* Date of Birth */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={profile_form.date_of_birth ? profile_form.date_of_birth.slice(0, 10) : ''}
                                                onChange={handle_form_change}
                                                disabled={!is_editing}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            />
                                        </div>

                                        {/* Gender */}
                                        {/* <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <select
                                                name="gender"
                                                value={profile_form.gender}
                                                onChange={handle_form_change}
                                                disabled={!is_editing}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                                <option value="prefer-not-to-say">Prefer not to say</option>
                                            </select>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Change Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-gray-800">Change Password</h3>
                                {!is_changing_password ? (
                                    <button
                                        onClick={() => set_is_changing_password(true)}
                                        className="px-4 py-2 font-[500] bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg transition-all duration-200 text-white rounded-lg hover:-translate-y-1 cursor-pointer"
                                    // className="px-4 py-2 bg-[#4285F4] text-white rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium"
                                    >
                                        Change Password
                                    </button>
                                ) : (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handle_cancel_password_change}
                                            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handle_change_password}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                )}
                            </div>

                            {is_changing_password && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            name="old_password"
                                            value={password_form.old_password}
                                            onChange={handle_password_change}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                                            placeholder="Enter your current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            name="new_password"
                                            value={password_form.new_password}
                                            onChange={handle_password_change}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirm_password"
                                            value={password_form.confirm_password}
                                            onChange={handle_password_change}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <button
                                            onClick={handle_forgot_password}
                                            className="text-[#4285F4] hover:text-blue-600 text-sm font-medium underline"
                                        >
                                            Forgot your current password?
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Change Email Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Email</h3>
                            {!change_email &&
                                <button
                                    className="px-4 py-2 text-white rounded-lg hover:-translate-y-1 transition-all cursor-pointer duration-200 text-[12px] font-[500] bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg"
                                    onClick={() => set_change_email(true)}
                                >
                                    Change Email
                                </button>}
                            {change_email &&
                                <div class="mt-4">
                                    {!otp.show &&
                                        <>
                                            <div>
                                                <label class="block text-sm font-medium text-gray-700 mb-2">
                                                    New Email
                                                </label>
                                            </div>
                                            <div className="flex gap-4 items-center">
                                                <input class="w-[60%] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                                                    placeholder="Enter your new email" type="email" value={profile_form.email} onChange={(e) => set_profile_form((prev) => ({ ...prev, email: e.target.value }))} name="new_email" />
                                                <button className="bg-green-800 text-white px-4 py-1 rounded-md cursor-pointer hover:-translate-y-1 transition-all" onClick={handle_send_otp}>Verify</button>
                                            </div>
                                        </>
                                    }

                                    {otp.show && <div className="flex flex-col mt-4 items-center gap-4">
                                        <input
                                            className="w-[20%] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent text-center"
                                            placeholder="X.X.X.X.X.X"
                                            type="number"
                                            value={otp.entered_otp}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value.length > 6) {
                                                    show_toast({ status: "Info", message: 'Otp length is not more then 6' });
                                                    set_otp((prev) => ({ ...prev, entered_otp: '' })); // reset to empty string (null-like)
                                                } else {
                                                    set_otp((prev) => ({ ...prev, entered_otp: value }));
                                                }
                                            }}
                                        />
                                        <button className="bg-green-800 w-fit text-white px-4 py-1 rounded-md" onClick={handle_email_change}>Verify</button>
                                    </div>}
                                </div>
                            }
                        </div>
                        {/* Account Info Section */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-2">Member Since</h4>
                                    <p className="text-gray-600">{new Date(user_data?.created_at || Date.now()).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-gray-700 mb-2">User ID</h4>
                                    <p className="text-gray-600 font-mono text-sm">{user_data?._id || 'Loading...'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}