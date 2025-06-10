import { useEffect, useState } from "react";
import { Body } from "./body";
import Navbar from "./Navbar";
import Loader from "../Loader/loader";
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import Toast from "../Toast/toast";

export default function Homepage() {
    const [data, set_data] = useState();
    const [loading, set_loading] = useState(false);
    const navigate = useNavigate();
    const [toast_data, show_toast] = useState({
        status: '',
        message: ''
    });

    const fetch_user = async (token) => {
        try {
            set_loading(true);

            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const result = await response.json();


            if (result.notFound) {
                // Handle not found case
                show_toast({status:"Fail", message:"User not found"});
                navigate("/login");
            } else if (result.failed) {
                // Handle failure case
                show_toast({status:"Info", message:"Server reported a failure"});
                navigate("/login");
            } else {
                set_data(result); // Set fetched user data
            }
        } catch (error) {
            console.error("Error while fetching user data:", error);
        } finally {
            set_loading(false); // Always turn off loading
        }

    }
    useEffect(() => {
        const token = Cookies.get('spending_smart_client');

        if (token)
            fetch_user(token);
        else
            navigate('/login');
    }, []);

    return (
        <div id="main-homepage">
            {data &&
                <>
                    {toast_data.message && <Toast toast_data={toast_data} />}

                    <Navbar
                        user_id={data?._id}
                        user_name={data?.name}
                        user_profile_image={data?.profile_image}
                        isHomePage={true}
                        set_loading={set_loading}
                        friend_request={data?.friendRequest_come}
                        money_request={data?.money_request}
                        notifications={data?.notifications}
                        show_toast={show_toast}
                    />
                    <Body />
                    {loading ? <Loader /> : ''}
                </>
            }
        </div>
    );
};