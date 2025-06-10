import { useState, useEffect, useCallback } from "react";
import Cookies from 'js-cookie';

import Navbar from "../Homepage/Navbar";
import Sidebar from "../Sidebar/sidebar";
import Loader from "../Loader/loader";
import Toast from "../Toast/toast";
import ConfirmBox from "../Confirm_Box/confirm_box";

import { Search, UserPlus, X, UserCheck, Mail, Globe, Users, XCircle, XOctagon, User, User2 } from "lucide-react";

export default function Friends() {
  const selectedTab = "friends";
  const [loading, set_loading] = useState(false);
  const [user_data, set_user_data] = useState();
  const [toast_data, show_toast] = useState({
    status: '',
    message: ''
  });

  const [activeTab, setActiveTab] = useState("friends");
  const [searchTerm, setSearchTerm] = useState("");
  const [search_result, set_search_result] = useState([]);
  const [user_friends, set_user_friends] = useState([]);
  const [user_not_found, set_user_not_found] = useState(false);
  const [already_sent_req, set_already_sent_req] = useState([]);
  const [confirmModal, show_confirm_modal] = useState({
    show: false,
    type: '',
    message: '',
    onConfirm: null
  });

  const user_id = Cookies.get('spending_smart_client');

  const fetch_user = async (user_id) => {
    try {
      set_loading(true);

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/user`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${user_id}`, //user_id as token
        }
      });
      const result = await response.json();

      if (result.notFound) {
        // Handle not found case
        console.warn("User not found");
      } else if (result.failed) {
        // Handle failure case
        console.log(result);
        console.error("Server reported a failure");
      } else {
        set_user_data(result); // Set fetched user data
        let arr = [];

        result.friendRequest_send.forEach((elm) => {
          arr.push(elm.receiver_id);
        })
        set_user_friends(result.friendList);
        set_already_sent_req(arr);
      }
    } catch (error) {
      console.error("Error while fetching user data:", error);
    } finally {
      set_loading(false); // Always turn off loading
    }

  }

  const handle_search_users = async () => {
    try {
      set_loading(true);
      if (!searchTerm || searchTerm == "") {
        return;
      }
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/search-friends?name=${searchTerm}`);
      const result = await response.json();

      if (result.failed) {
        set_user_not_found(true);
        show_toast({ status: "Fail", message: "Something went wrong while searching. Please try again." });
      } else if (result.notFound) {
        set_user_not_found(true);
        show_toast({ status: "Fail", message: "No users found matching your search." });
      } else {
        set_user_not_found(false);
        show_toast({ status: "Success", message: "Users found successfully." });
        set_search_result(result);
      }
    } catch (error) {
      console.log(error);
      show_toast({ status: "Fail", message: "An unexpected error occurred. Please check your network and try again." });
    } finally {
      set_loading(false);
    }
  }

  async function send_friend_req(receiver_data) {
    try {
      set_loading(true);
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/friend-request/send`, {
        method: 'PATCH',
        headers: {
          "Authorization": `Bearer ${user_id}`, //user_id as token
          'content-type': "application/json"
        },
        body: JSON.stringify({ ...receiver_data, sender_id: user_data._id, sender_profile_image: user_data.profile_image, sender_name: user_data.name })
      });
      const result = await response.json();

      if (result.failed) {
        console.log(result);
        show_toast({
          status: 'Fail',
          message: 'Failed to send friend request. Please try again later.'
        });
      } else if (!result.updated) {
        show_toast({
          status: 'Fail',
          message: 'Friend request could not be updated. It may have already been sent.'
        });
      } else {
        show_toast({
          status: 'Success',
          message: 'Friend request sent successfully!'
        });
        set_already_sent_req((prev) => [...prev, receiver_data.receiver_id]);
      }
    } catch (error) {
      console.log(error);
      show_toast({
        status: 'Fail',
        message: 'An error occurred while sending the request.'
      });
    } finally {
      set_loading(false);
    }
  }
  async function cancel_friend_req(user) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/friend-request/cancel`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${user_id}`, // assuming user_id is your token
        },
        body: JSON.stringify({ receiver_id: user._id })
      });

      const result = await response.json();

      if (result.failed) {
        show_toast({
          status: 'Fail',
          message: "Failed to cancel friend request. Please try again."
        });
      } else if (result.expire) {
        show_toast({
          status: 'Fail',
          message: result.message
        })
        // now btn become 'remove btn'
        const friend = {
          user_id: user._id,
          profile_image: user.profile_image,
          name: user.name
        };
        set_user_friends((prev) => ([...prev, friend]));
        set_already_sent_req((prev) => (prev.filter(elm => elm !== user._id)));

      } else if (!result.updated) {
        show_toast({
          status: 'Info',
          message: "Friend request might have already been cancelled."
        });
      } else {
        show_toast({
          status: 'Success',
          message: "Friend request cancelled successfully."
        });

        set_already_sent_req((prev) =>
          prev.filter((elm) => elm !== user._id)
        );
      }
    } catch (error) {
      console.log("Error while cancel friend request: " + error);
      show_toast({
        status: 'Fail',
        message: "Something went wrong. Try again later!"
      });
    }
  }
  async function remove_friend(friend_id, friend_name) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/friend-request/remove`, {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "Authorization": `Bearer ${user_id}`, // assuming user_id is your token
        },
        body: JSON.stringify({ friend_id: friend_id, friend_name: friend_name })
      });

      const result = await response.json();

      if (result.failed) {
        show_toast({
          status: 'Fail',
          message: "Failed to remove friend. Please try again."
        });
      } else if (result.expire) {
        show_toast({
          status: 'Fail',
          message: result.message
        })
        set_user_friends((prev) => (
          prev.filter((elm) => elm.user_id !== friend_id)
        ));
      } else if (!result.updated) {
        show_toast({
          status: 'Info',
          message: "Friend might have already been removed."
        });
      } else {
        show_toast({
          status: 'Success',
          message: "Friend successfully removed."
        });

        set_already_sent_req((prev) =>
          prev.filter((elm) => elm !== friend_id)
        );
        set_user_friends((prev) =>
          prev.filter((elm) => elm.user_id !== friend_id)
        );
      }
    } catch (error) {
      console.log("Error while remove friend: " + error);
      show_toast({
        status: 'Fail',
        message: "Something went wrong. Try again later!"
      });
    }finally{
      show_confirm_modal({ show: false, type: "", message: "", onConfirm: null });
    }
  }
  useEffect(() => {
    if (user_id) {
      fetch_user(user_id);
    }
  }, []);
  return (
    <div className="flex">
      <Sidebar selectedTab={selectedTab} user_profile_image={user_data?.profile_image} user_name={user_data?.name} />
      {toast_data.message && <Toast toast_data={toast_data} />}
      {loading ? <Loader /> : ''}
      <div className="w-[100%]">
        <Navbar
          user_id={user_data?._id}
          user_name={user_data?.name}
          user_profile_image={user_data?.profile_image}
          friend_request={user_data?.friendRequest_come}
          money_request={user_data?.money_request}
          notifications={user_data?.notifications}
          show_toast={show_toast}
          set_loading={set_loading}
        />
        {confirmModal.show && <ConfirmBox
          show={confirmModal.show}
          type={confirmModal.type}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          show_confirm_modal={show_confirm_modal}
        />}
        <div className="flex flex-col h-screen mx-auto bg-white shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-[#EBF3FB] p-6 border-b border-orange-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-orange-500 flex items-center">
                <Users className="mr-2" size={24} />
                Friend Connect
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex mt-6">
              <button
                className={`px-6 py-3 font-medium flex items-center rounded-t-lg transition-all cursor-pointer ${activeTab === "friends"
                  ? "bg-white text-orange-500 shadow-sm"
                  : "bg-orange-200 text-orange-700 hover:bg-orange-100"
                  }`}
                onClick={() => setActiveTab("friends")}
              >
                <Users size={20} className="mr-2" />
                My Friends ({user_friends.length})
              </button>
              <button
                className={`px-6 py-3 font-medium flex items-center rounded-t-lg ml-2 transition-all cursor-pointer ${activeTab === "discover"
                  ? "bg-white text-orange-500 shadow-sm"
                  : "bg-orange-200 text-orange-700 hover:bg-orange-100"
                  }`}
                onClick={() => setActiveTab("discover")}
              >
                <Globe size={20} className="mr-2" />
                Discover People
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === "friends" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user_friends && user_friends.length > 0 ? (
                  user_friends.map((friend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={friend.profile_image}
                            alt={friend.name}
                            className="w-20 aspect-square rounded-full object-cover border-2 border-orange-200"
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-800">{friend.name}</h3>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-gray-600 hover:text-red-500 rounded-full hover:bg-red-50 cursor-pointer"
                          onClick={() => show_confirm_modal({ show: true, type: "remove", message: "Are your sure to remove?", onConfirm: () => remove_friend(friend.user_id, friend.name) })}
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center p-8 text-center">
                    <div>
                      <img className="w-[50%] m-auto" src="./emptyFriendList.png" alt="error" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-800 mb-2">No friends found</h3>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {/* Search bar in discover section */}
                <div className="mb-6 flex">
                  <div className="relative flex items-center w-full max-w-md">
                    <Search className="absolute left-3 text-gray-400" size={18} />
                    <input
                      style={{ borderRadius: "15px 0px 0px 15px" }}
                      type="text"
                      placeholder="Search users globally..."
                      className="w-full pl-10 pr-4 py-3 border border-orange-200 rounded-lg outline-none shadow-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key == "Enter" ? handle_search_users() : ""}
                    />
                  </div>
                  <div className="flex">
                    <button onClick={handle_search_users} style={{ borderRadius: "0px 15px 15px 0px" }} className="cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-yellow-200 rounded-xl px-8 py-2 font-[500]">Search</button>
                  </div>
                </div>

                {/* Search results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {search_result && search_result.length > 0 ? (
                    search_result.map((user, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center">
                          <img
                            src={user.profile_image || './dummy_image.webp'}
                            alt={user.name}
                            style={{ width: "20%", aspectRatio: 1 }}
                            className="rounded-full object-cover border-2 border-orange-200"
                          />
                          <div className="ml-4">
                            <h3 className="font-medium text-gray-800">{user.name}</h3>
                          </div>
                        </div>

                        {user_friends.some(elm => elm.user_id == user._id) ?
                          (
                            <button onClick={() => remove_friend(user._id, user.name)} className="px-3 cursor-pointer py-2 rounded-lg flex items-center bg-gradient-to-r from-red-500 to-red-700 shadow-lg text-white font-[400]" style={{ whiteSpace: 'nowrap' }}>
                              <User2 />
                              Remove
                            </button>
                          )
                          :
                          (already_sent_req.includes(user._id) ?
                            <button onClick={() => cancel_friend_req(user)} className="px-3 py-2 rounded-lg flex items-center bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg text-white font-[400]" style={{ whiteSpace: 'nowrap' }}>
                              <UserCheck />
                              Cancel Request
                            </button>
                            :
                            <button
                              className={`px-3 py-2 rounded-lg flex items-center ${(user._id === user_data._id)
                                ? "bg-gray-100 text-gray-500"
                                : "bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:shadow-md"
                                }`}
                              style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                              onClick={() => send_friend_req({ receiver_id: user._id, receiver_profile_img: user.profile_image, receiver_name: user.name })}
                              // disabled={friends.some(friend => friend.id === user._id)}
                              disabled={user._id === user_data._id ? true : false}
                            >
                              {user._id !== user_data._id ? <UserPlus size={18} className="mr-1" /> : <User size={18} className="mr-1" />}
                              Add Friend
                            </button>)}
                      </div>
                    ))
                  ) : user_not_found ? (
                    <div className="col-span-2 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 shadow-md">
                        <Globe size={32} className="text-orange-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No users found</h3>
                      <p className="text-gray-500 mb-4">Try different search terms</p>
                    </div>
                  ) : (
                    <div className="col-span-2 flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 shadow-md">
                        <Search size={32} className="text-orange-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Search for new friends</h3>
                      <p className="text-gray-500">Enter a name in the search field above to find users</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}