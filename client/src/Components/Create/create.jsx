import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { X, Save, User, Search, XCircle, IndianRupee, Calendar, Tag, SquarePen, Info, Layers, CheckCircle, BadgeCheck } from 'lucide-react';
import Cookies from 'js-cookie';
import dummy_img from "../../../public/dummy_image.webp";

function SelectedUserCard({ user, onRemove, animationDelay }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation with staggered delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50 + (animationDelay * 50));

    return () => clearTimeout(timer);
  }, [animationDelay]);

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-4 border border-gray-200 
      transition-all duration-500 ease-in-out transform flex items-center relative
      ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}
    >
      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-blue-500 flex-shrink-0">
        <img
          src={user.profile_image}
          alt={user.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="ml-4">
        <h3 className="text-md font-semibold text-gray-800">{user.name}</h3>
      </div>
      <button
        onClick={() => onRemove(user.user_id)}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Remove user"
      >
        <XCircle size={18} />
      </button>
    </div>
  );
}

function UserSearch({ selectedUsers, setSelectedUsers, friend_list }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(friend_list || []);
  const searchRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter users based on search term
  useEffect(() => {
    const filtered = (friend_list ?? []).filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm]);

  // Handle user selection
  const handleSelectUser = (user) => {
    // Check if user is already selected
    if (!selectedUsers.some(selectedUser => selectedUser.user_id === user.user_id)) {
      setSelectedUsers(prev => [...prev, user]);
    }

    // Just clear the search term without closing the dropdown
    setSearchTerm('');
  };

  // Handle removing user from selection
  const handleRemoveUser = (userId) => {
    setSelectedUsers(prev => prev.filter(user => user.user_id !== userId));
  };

  // Check if a user is already selected
  const isUserSelected = (userId) => {
    return selectedUsers.some(user => user.user_id === userId);
  };
  useEffect(() => {
    if (friend_list) {
      setFilteredUsers(friend_list);
    }
  }, [friend_list]);
  return (
    <div className="w-full max-w-md mx-auto mt-2">
      <div className="relative" ref={searchRef}>
        {/* Search input */}
        <div
          className={`flex items-center border rounded-lg shadow-sm bg-white overflow-hidden
            ${isOpen ? 'border-amber-500 ring-2 ring-red-200' : 'border-gray-300'}`}
        >
          <div className="pl-3 text-gray-400">
            <Search size={20} />
          </div>

          <input
            type="text"
            placeholder="Search members..."
            className="w-full py-3 px-3 text-gray-700 leading-tight focus:outline-none"
            onClick={() => setIsOpen(true)}
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* User list dropdown */}
        <div
          className={`absolute mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 ease-in-out z-10
            ${isOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0 invisible'}`}
        >
          <div className="overflow-y-auto max-h-80">
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 p-2">
                {filteredUsers.map(user => {
                  const isSelected = isUserSelected(user.user_id);
                  return (
                    <div
                      key={user.user_id}
                      className={`flex items-center p-2 rounded-lg transition-colors cursor-pointer
                        ${isSelected
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'}`
                      }
                      onClick={() => handleSelectUser(user)}
                    >
                      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0">
                        <img
                          src={user.profile_image}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="ml-3 font-medium text-gray-700">{user.name}</div>
                      {isSelected && (
                        <div className="ml-auto mr-2">
                          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Selected
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">No users found</div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Users Container */}
      <div className="mt-8 max-h-[24rem] overflow-auto">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Selected Members</h3>

        {selectedUsers.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {selectedUsers.map((user, index) => (
              <SelectedUserCard
                key={user.user_id}
                user={user}
                onRemove={handleRemoveUser}
                animationDelay={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <div className="text-center text-gray-500">
              <User size={40} className="mx-auto mb-2 text-gray-400" />
              <p>No members selected</p>
              <p className="text-sm mt-1">Click on members in the search to select them</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const x = () => {

}
export const ExpenseProfilePopup = forwardRef((props, ref) => {
  const {
    server_url,
    isGroupPage,
    show_create_expense_prof,
    set_show_create_expense_prof,
    set_loading,
    show_toast,
    fetch_expense_prof_data,
    user_id,
    friend_list,
    actual_user_id,
    user_profile_image,
    user_name
  } = props;

  const [form_data, set_form_data] = useState({
    exp_profile_img: '',
    profile_name: '',
    category: '',
    budget: '',
    description: '',
    period: 'monthly',
    members: []
  });
  const [show_next_btn, set_show_next_btn] = useState(isGroupPage);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [profile_img, set_profile_img] = useState("../../../public/expense_profile_pic/travel_2.webp");
  const prof_img_ref = useRef();

  const compRef = useRef(null);
  const form_ref = useRef(null);
  const member_list_ref = useRef(null);
  const profile_selection_ref = useRef();
  const profile_form_ref = useRef();

  const handle_change = (e) => {
    set_form_data({
      ...form_data,
      [e.target.name]: e.target.value
    });
  };

  const handle_validation = () => {
    if (!form_data.profile_name) {
      show_toast({ status: "Fail", message: "Please enter a profile name." });
      return false;
    } else if (!form_data.budget) {
      show_toast({ status: "Fail", message: "Please enter a budget amount." });
      return false;
    } else if (!form_data.category) {
      show_toast({ status: "Fail", message: "Please select a category." });
      return false;
    } else if (!form_data.description) {
      show_toast({ status: "Fail", message: "Please enter a description." });
      return false;
    } else if (!form_data.period) {
      show_toast({ status: "Fail", message: "Please select an expense period (daily, monthly, yearly)." });
      return false;
    } else
      return true;
  }

  const handle_create_exp_prof = async () => {
    set_loading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/${server_url}`, {
        method: 'POST',
        headers: {
          'content-type': "application/json",
          "Authorization": `Bearer ${user_id}`, //user_id as token
        },
        body: JSON.stringify({ ...form_data, members: [...form_data.members, { user_id: actual_user_id, profile_image: user_profile_image, name: user_name }] })
      });

      const result = await response.json();

      if (result.failed) {
        console.log(result);
        show_toast({
          status: "Fail",
          message: "Something went wrong while processing your request. Please try again."
        });

      } else if (!result.created) {
        show_toast({
          status: "Info",
          message: "No new profile created. Please check your data and try again."
        });
      } else {
        show_toast({
          status: "Success",
          message: "Expense profile created successfully!"
        });

        set_show_create_expense_prof(false);
        // fetch_expense_prof_data(user_id);
      }

    } catch (error) {
      console.log(error);
      show_toast({
        status: "Fail",
        message: "Network error. Please check your connection and try again."
      });
    }
    finally {
      set_loading(false);
      set_form_data({
        profile_name: '',
        category: '',
        budget: '',
        description: '',
        period: 'monthly',
      });
      setTimeout(()=>{
        window.location.reload();
      },2000);
    }

  };

  const categories = [
    'Personal', 'Travel',
    'Vacation', 'Work/Business', 'Education', 'Household',
    'Events/Parties', 'Health & Fitness', 'Investment',
    'Shopping', 'Debt Repayment', 'Charity/Donation'
  ];
  const profile_img_collection = [
    "../../../public/expense_profile_pic/travel_2.webp",
    "../../../public/expense_profile_pic/travel_1.webp",
    "../../../public/expense_profile_pic/bills_1.webp",
    "../../../public/expense_profile_pic/bills_2.webp",
    "../../../public/expense_profile_pic/education_1.webp",
    "../../../public/expense_profile_pic/education_2.webp",
    "../../../public/expense_profile_pic/entertainment_1.webp",
    "../../../public/expense_profile_pic/entertainment_2.webp",
    "../../../public/expense_profile_pic/food_1.webp",
    "../../../public/expense_profile_pic/food_2.webp",
    "../../../public/expense_profile_pic/groceries_1.webp",
    "../../../public/expense_profile_pic/groceries_2.webp",
    "../../../public/expense_profile_pic/medical_1.webp",
    "../../../public/expense_profile_pic/medical_2.webp",
    "../../../public/expense_profile_pic/shopping_1.webp",
    "../../../public/expense_profile_pic/shopping_2.webp"
  ];

  useEffect(() => {
    const comp = compRef.current;

    if (!comp) return;

    if (!show_create_expense_prof) {
      setTimeout(() => {
        comp.style.display = 'none';
      }, 450);
    } else {
      comp.style.display = 'flex';
    }
    if (isGroupPage) {
      set_show_next_btn(true);
    }
  }, [show_create_expense_prof]);

  useEffect(() => {
    set_form_data((prev) => ({ ...prev, members: selectedUsers }));
  }, [selectedUsers]);

  useEffect(() => {
    if (isGroupPage) {
      if (form_ref) {
        const form = form_ref.current;
        const form_main = form.closest(".form_content_main");

        if (form_main) {
          form_main.style.marginBottom = "-16rem";
        }
      }
    }
  }, [isGroupPage]);

  const showProfComp = () => {
    const form = form_ref.current;
    const form_main = form.closest(".form_content_main");
    const member_list = member_list_ref.current;

    if (form && member_list) {
      form.style.transform = 'translate(-150%)';
      member_list.style.transition = 'all 0.5s';
      member_list.style.transform = 'translateX(0%)';

      set_show_next_btn(false);
      setTimeout(() => {
        form.style.display = "none";
        form_main.style.marginBottom = "unset";
      }, 500);
    }
  };

  const hideProfComp = () => {
    const form = form_ref.current;
    const member_list = member_list_ref.current;
    const form_main = form.closest(".form_content_main");
    const prof_form = profile_form_ref.current;
    const profile_selection = profile_selection_ref.current;

    if (form && member_list) {
      form.style.transform = 'translate(0%)';
      member_list.style.transition = 'all 0.5s';
      member_list.style.transform = 'translateX(-150%)';
      form_main.style.marginBottom = "-15rem";

      set_show_next_btn(false);
      form.style.display = "block";
      setSelectedUsers([]);
    }

    if (prof_form && profile_selection) {
      prof_form.style.transform = "unset";
      prof_form.style.transition = "unset";
      prof_form.classList.remove("hidden");
      profile_selection.classList.add("hidden");
    }
  }

  // Expose the function to the parent
  useImperativeHandle(ref, () => ({
    showProfComp: showProfComp
  }));

  function handleClassToggle() {
    const prof_img = prof_img_ref.current;
    if (!prof_img) return;

    prof_img.classList.remove('blurEffect');
    setTimeout(() => {
      prof_img.classList.add('blurEffect');
    }, 100);

  }
  return (
    <div ref={compRef} className="fixed inset-0 bg-[#000000bf] bg-opacity-60 hidden items-center justify-center z-1000 overflow-hidden">
      <div style={{ animation: show_create_expense_prof ? 'scaleUp 0.5s ease-out' : 'scaleDown 0.5s ease-out' }} className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 overflow-hidden relative transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-xl font-semibold flex items-center">
            <Layers className="mr-2" /> Create Expense Profile
          </h2>
          <button className="text-white hover:text-gray-100 focus:outline-none"
            onClick={() => { set_show_create_expense_prof(false), hideProfComp() }}>

            <X className="h-6 w-6 cursor-pointer" />
          </button>
        </div>

        {/* Form Content */}
        <div ref={profile_form_ref} className="p-6 form_content_main">
          <div className="space-y-5" ref={form_ref}>
            {/* Profile Name */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Profile Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="profile_name"
                  value={form_data.profile_name}
                  onChange={handle_change}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="e.g., Home Renovation, Wedding Trip"
                />
                <Info className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Category & Budget Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={form_data.category}
                    onChange={handle_change}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Budget</label>
                <div className="relative">
                  <input
                    type="number"
                    name="budget"
                    value={form_data.budget}
                    onChange={handle_change}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    placeholder="Amount"
                  />
                  <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Budget Period */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Budget Period</label>
              <div className="relative">
                <select
                  name="period"
                  value={form_data.period}
                  onChange={handle_change}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one-time">One-time</option>
                </select>
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={form_data.description}
                onChange={handle_change}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                rows="3"
                placeholder="Brief description of this expense profile"
              ></textarea>
            </div>

          </div>
          {/* Team Members */}
          {isGroupPage && <div ref={member_list_ref} className='' style={{ transform: "translateX(120%)" }}>
            <UserSearch selectedUsers={selectedUsers} setSelectedUsers={setSelectedUsers} friend_list={friend_list} />
          </div>}
          {/* set_show_member */}
          {show_next_btn && <div style={{ border: "1px solid lightgrey" }} onClick={() => {
            const bool = handle_validation();

            if (!bool) return;

            showProfComp();
          }} className="mt-8 absolute bottom-4 right-8 py-2 px-5 rounded-xl cursor-pointer font-[500] hover:bg-gray-50">
            <button className='cursor-pointer'>Next</button>
          </div>}
          {/* Footer Actions */}
          {!show_next_btn && <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              onClick={() => { set_show_create_expense_prof(false), hideProfComp() }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition flex items-center"
              onClick={() => {
                const bool = handle_validation();
                if (!bool) {
                  return;
                }
                if (isGroupPage && form_data.members.length === 0) {
                  show_toast({ status: "Fail", message: "Please select members for group." });
                  return;
                }

                const form = profile_form_ref.current;
                const profile_selection = profile_selection_ref.current;

                if (form && profile_selection) {
                  form.style.transform = 'translate(-150%)';
                  form.style.transition = "transform 0.5s";

                  setTimeout(() => {
                    profile_selection.classList.remove("hidden");
                    profile_selection.classList.add("blurEffect");
                    form.classList.add("hidden");
                  }, 500);
                }

              }}
            >
              <Save className="h-5 w-5 mr-2" />
              Next
            </button>
          </div>}
        </div>

        {/* profile selection div */}
        <div ref={profile_selection_ref} className='hidden bg-white max-h-[70vh] overflow-auto my-8 mb-15'>
          <div ref={prof_img_ref} className='w-[40%] p-1 border-2 rounded-[50%] border-gray-200 m-auto mb-4 blurEffect'>
            <img src={profile_img} className='w-[100%] rounded-[50%] aspect-square object-cover' alt="error" />
          </div>

          <div className='flex flex-wrap gap-4 justify-center'>
            {profile_img_collection.map((elm, idx) => (
              <div key={idx} className='w-[20%] p-0.5 rounded-[50%] relative' style={{ border: profile_img === elm ? "1px solid #f15b42" : "" }}>
                <img src={elm} onClick={() => { set_profile_img(elm), set_form_data((prev) => ({ ...prev, exp_profile_img: elm })), handleClassToggle() }} className='w-[100%] rounded-[50%] aspect-square object-cover cursor-pointer' alt="error" />
                {profile_img === elm ? <BadgeCheck className='absolute top-2.5 right-0 text-yellow-200' style={{ fill: "#f15b42" }} /> : null}
              </div>
            ))}
          </div>

          <div className='absolute bottom-2.5 left-[50%] transform translate-x-[-50%] translate-y-0'>
            <button
              type="button"
              onClick={handle_create_exp_prof}
              className="px-6 py-2 cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              Create Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export function ExpensePopup({ server_url, profile_calulation, total_amount, total_budget, edit_expense, set_edit_expense, show_create_exp_list, set_show_create_exp_list, set_loading, show_toast, set_exp_data, user_id, profile_id }) {
  const [form_data, set_form_data] = useState({
    expense_id: '',
    expense_name: '',
    category: '',
    subCategory: '',
    amount: '',
    description: '',
    created_at: new Date(),
    updated_at: new Date()
  });

  const compRef = useRef(null);

  const handle_change = (e) => {
    const { name, value } = e.target;
    set_form_data((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { subCategory: "" } : {}), // reset subCategory when category changes
    }));
  }


  const handle_create_exp = async () => {

    if (!form_data.expense_name) {
      show_toast({ status: "Info", message: "Please enter a expense name." });
    } else if (!form_data.amount) {
      show_toast({ status: "Info", message: "Please enter a amount amount." });
    } else if (!total_amount + parseFloat(form_data.amount) >= total_budget) {
      show_toast({ status: "Info", message: "You given amount exceeds total budget" });
    }
    else if (!form_data.category) {
      show_toast({ status: "Info", message: "Please select a category." });
    } else if (!form_data.description) {
      show_toast({ status: "Info", message: "Please enter a description." });
    } else {
      set_loading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/${server_url}`, {
          method: 'POST',
          headers: {
            'content-type': "application/json",
            "Authorization": `Bearer ${user_id}`, //user_id as token
          },
          body: JSON.stringify({ ...form_data, user_id, profile_id })
        });

        const result = await response.json();

        if (result.failed) {
          console.log(result);
          show_toast({
            status: "Fail",
            message: "Something went wrong while processing your request. Please try again."
          });

        } else if (!result.updated) {
          show_toast({
            status: "Info",
            message: "No new expense created. Please check your data and try again."
          });
        } else {
          show_toast({
            status: "Success",
            message: "Expense saved successfully!"
          });

          set_show_create_exp_list(false);
          const newExp = {
            expense_id: result.expense_id,
            name: form_data.expense_name,
            category: form_data.category,
            subCategory: form_data.subCategory,
            amount: form_data.amount,
            created_at: form_data.created_at,
            updated_at: form_data.created_at,
            exp_description: form_data.description
          };

          set_exp_data((prev) => [...prev, newExp])

          // fetch_expense_list_data(user_id);
        }

      } catch (error) {
        console.log(error);
        show_toast({
          status: "Fail",
          message: "Network error. Please check your connection and try again."
        });
      }
      finally {
        set_loading(false);
        set_form_data({
          expense_name: '',
          category: '',
          subCategory: '',
          amount: '',
          description: '',
          created_at: new Date(),
          updated_at: new Date()
        });
        profile_calulation();
      }
    }
  };

  const handle_edit_exp = async () => {
    if (!form_data.expense_name) {
      show_toast({ status: "Fail", message: "Please enter a expense name." });
    } else if (!form_data.amount) {
      show_toast({ status: "Fail", message: "Please enter a amount amount." });
    } else if (!form_data.category) {
      show_toast({ status: "Fail", message: "Please select a category." });
    } else if (!form_data.description) {
      show_toast({ status: "Fail", message: "Please enter a description." });
    } else {
      set_loading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_API}/${server_url}`, {
          method: 'PUT', //Use here put because we change whole an expense data obj
          headers: {
            'content-type': "application/json",
            "Authorization": `Bearer ${user_id}`, //user_id as token
          },
          body: JSON.stringify({ ...form_data, user_id, profile_id })
        });

        const result = await response.json();

        if (result.failed) {
          console.log(result);
          show_toast({
            status: "Fail",
            message: "Something went wrong while processing your request. Please try again."
          });

        } else if (!result.updated) {
          show_toast({
            status: "Info",
            message: "Expense is not updated. Please check your data and try again."
          });
        } else {
          show_toast({
            status: "Success",
            message: "Expense Updated successfully!"
          });

          set_show_create_exp_list(false);
          const newExp = {
            expense_id: form_data.expense_id,
            name: form_data.expense_name,
            category: form_data.category,
            subCategory: form_data.subCategory,
            amount: form_data.amount,
            created_at: form_data.created_at,
            updated_at: form_data.updated_at,
            exp_description: form_data.description
          };

          set_exp_data((prev) => {
            return prev.map((elm) => elm.expense_id === newExp.expense_id ? newExp : elm)
          })
          // fetch_expense_list_data(user_id);
        }

      } catch (error) {
        console.log(error);
        show_toast({
          status: "Fail",
          message: "Network error. Please check your connection and try again."
        });
      }
      finally {
        set_loading(false);
        set_form_data({
          expense_name: '',
          category: '',
          subCategory: '',
          amount: '',
          description: '',
          created_at: new Date(),
          updated_at: new Date()
        });
        profile_calulation();
      }
    }
  };

  const category_data = {
    Housing: ["Rent", "Home Loan EMI", "Property Tax", "Maintenance", "Repairs"],
    "Food & Dining": ["Groceries", "Restaurants", "Takeout", "Snacks", "Beverages"],
    Transportation: ["Fuel", "Cab/Rideshare", "Public Transport", "Vehicle Maintenance", "Parking"],
    Utilities: ["Electricity", "Water", "Gas", "Internet", "Mobile Recharge/Bill", "DTH/Cable"],
    Shopping: ["Clothes", "Footwear", "Accessories", "Gadgets & Electronics", "Home Appliances"],
    Healthcare: ["Doctor Visits", "Medicines", "Tests & Diagnostics", "Health Insurance", "Gym/Yoga"],
    Education: ["Tuition Fees", "Books & Stationery", "Online Courses", "Coaching Classes"],
    Travel: ["Train/Flight Tickets", "Hotels", "Tour Packages", "Local Transport", "Travel Insurance"],
    Entertainment: ["Movies/Shows", "Subscriptions", "Events & Outings", "Games"],
    Finance: ["Loan Repayment", "Credit Card Bill", "Investment", "Savings/Deposits", "Mutual Funds"],
    "Gifts & Donations": ["Gifting", "Charity/Donations", "Religious Offerings"],
    "Family & Kids": ["School Fees", "Baby Products", "Toys", "Daycare/Nanny"],
    Pets: ["Pet Food", "Vet Visits", "Pet Grooming"],
    "Personal Care": ["Salon/Beauty", "Toiletries", "Wellness"],
    Services: ["Repairs", "Cleaning", "Laundry", "Professional Services"],
    Emergency: ["Medical Emergency", "Family Emergency", "Urgent Travel"],
    Miscellaneous: ["Unplanned Expense", "Unknown", "Other"],
  };


  useEffect(() => {
    const comp = compRef.current;

    if (!comp) return;

    if (!show_create_exp_list) {
      setTimeout(() => {
        comp.style.display = 'none';
      }, 450);
    } else {
      comp.style.display = 'flex';
      // console.log(edit_expense.edit_exp);

      if (edit_expense.edit_exp) {
        set_form_data({
          expense_id: edit_expense.expense.expense_id,
          expense_name: edit_expense.expense.name,
          category: edit_expense.expense.category,
          subCategory: edit_expense.expense.subCategory,
          created_at: new Date(edit_expense.expense.created_at), //Date when expense created, i used this date to store as creation date of expense
          updated_at: new Date(edit_expense.expense.updated_at),
          amount: edit_expense.expense.amount,
          description: edit_expense.expense.exp_description,
        });
      }
      else {
        set_form_data({
          expense_name: '',
          category: '',
          subCategory: '',
          amount: '',
          description: '',
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }
  }, [show_create_exp_list]);

  return (
    <div ref={compRef} className="fixed inset-0 bg-[#000000bf] bg-opacity-60 hidden items-center justify-center z-1000">
      <div style={{ animation: show_create_exp_list ? 'scaleUp 0.5s ease-out' : 'scaleDown 0.5s ease-out' }} className="bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 overflow-hidden relative transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 flex justify-between items-center">
          {edit_expense.edit_exp ?
            <h2 className="text-white text-xl font-semibold flex items-center">
              <SquarePen className="mr-2" /> Edit Expense
            </h2>
            :
            <h2 className="text-white text-xl font-semibold flex items-center">
              <Layers className="mr-2" /> Create Expense
            </h2>}
          <button className="text-white hover:text-gray-100 focus:outline-none" onClick={() => set_show_create_exp_list(false)}>
            <X className="h-6 w-6 cursor-pointer" />
          </button>
        </div>


        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Profile Name */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Expense Name</label>
              <div className="relative">
                <input
                  type="text"
                  name="expense_name"
                  value={form_data.expense_name}
                  onChange={handle_change}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                  placeholder="e.g., Home Rent, Groceries"
                />
                <Info className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Category & Sub category Row */}
            <div className='flex items-center gap-4'>
              {/* Category */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    value={form_data.category}
                    onChange={handle_change}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none"
                  >
                    <option value="">Select Category</option>
                    {Object.keys(category_data).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* subCategory Select */}
              {form_data.category && (
                <div>
                  <label className="block text-gray-700 mb-1 font-medium">Sub Category</label>
                  <div className="relative">
                    <select
                      name="subCategory"
                      value={form_data.subCategory || ""}
                      onChange={handle_change}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none"
                    >
                      <option value="">Select sub category</option>
                      {category_data[form_data.category].map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                    <Tag className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
            {/* Amount and Date*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/*  Date */}
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Expense Date:</label>
                {edit_expense.edit_exp ? <div className="relative">
                  <input
                    type='date'
                    name="updated_at"
                    value={form_data.updated_at instanceof Date ? form_data.updated_at.toISOString().split('T')[0] : form_data.updated_at}
                    onChange={handle_change}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                  :
                  <div className="relative">
                    <input
                      type='date'
                      name="created_at"
                      value={form_data.created_at instanceof Date ? form_data.created_at.toISOString().split('T')[0] : form_data.created_at}
                      onChange={handle_change}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition appearance-none"
                    />
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>}
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-medium">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    name="amount"
                    value={form_data.amount}
                    onChange={handle_change}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                    placeholder="Amount"
                  />
                  <IndianRupee className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>



            {/* Description */}
            <div>
              <label className="block text-gray-700 mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={form_data.description}
                onChange={handle_change}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                rows="3"
                placeholder="Brief description of this expense..."
              ></textarea>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              onClick={() => set_show_create_exp_list(false)}
            >
              Cancel
            </button>
            {edit_expense.edit_exp ?
              <button
                type="button"
                onClick={handle_edit_exp}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition flex items-center"
              >
                <SquarePen className="mr-2" /> <p></p>Edit Expense
              </button>
              :
              <button
                type="button"
                onClick={handle_create_exp}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition flex items-center"
              >
                <Save className="h-5 w-5 mr-2" />
                Create Expense
              </button>
            }

          </div>
        </div>
      </div>
    </div>
  );
}