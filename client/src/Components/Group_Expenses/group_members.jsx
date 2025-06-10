import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Users, X, LogOut, Crown, AlertTriangle, UserPlus2, Search, Plus } from 'lucide-react';
import Cookies from 'js-cookie';

const GroupMembersDropdown = ({
  set_show_selected_exp_prof,
  group_members = [],
  actual_user_id,
  admin_id = null,
  admin_name,
  group_name,
  is_current_user_admin = false,
  show_confirm_modal,
  group_id,
  show_toast,
  set_loading,
  friends_list = [] // Add this prop to pass the friends list
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [members, set_members] = useState(group_members.length > 0 ? group_members : []);
  const [currentAdminId, setCurrentAdminId] = useState(admin_id);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(is_current_user_admin);

  // Add Member Modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  const user_id = Cookies.get("spending_smart_client");

  // Filter friends that are not already members and match search query
  const availableFriends = friends_list.filter(friend => {
    const isNotMember = !members.some(member => member.user_id === friend.user_id);
    const matchesSearch = friend.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isNotMember && matchesSearch;
  });

  const dropdownRef = useRef();
  const dropDownTriggerRef = useRef();

  const handleRemoveMember = (member) => {
    show_confirm_modal({
      show: true,
      type: 'remove',
      message: `Are you sure you want to remove ${member.name} from the group?`,
      onConfirm: async () => {
        try {
          set_loading(true);
          const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group`, {
            method: "PATCH",
            headers: {
              'content-type': "application/json",
              "Authorization": `Bearer ${user_id}`,
            },
            body: JSON.stringify({ deleteMember: true, group_id: group_id, member_id: member.user_id, group_name })
          });
          const result = await response.json();

          if (result.failed) {
            show_toast({ status: "Fail", message: "Failed to remove member, Try again!" });
            console.log(result);
          } else if (!result.updated) {
            show_toast({ status: "Info", message: "May be member already removed..." });
          } else {
            show_toast({ status: "Success", message: "Member removed successfully!" });
            set_members((prev) => (
              prev.filter((elm) => elm.user_id != member.user_id)
            ));
            set_show_selected_exp_prof((prev) => ({
              ...prev,
              expense_prof: {
                ...prev.expense_prof,
                group_members: prev.expense_prof.group_members.filter(
                  (elm) => elm.user_id !== member.user_id
                ),
              },
            }));

          }
        } catch (error) {
          console.log(error);
          show_toast({ status: "Fail", message: "Failed to remove member, Try again later!" });
        } finally {
          set_loading(false);
          show_confirm_modal({
            show: false,
            type: '',
            message: ''
          });
        }
      }
    });
  };

  const handleLeaveGroup = () => {
    show_confirm_modal({
      show: true,
      type: 'leave',
      message: isCurrentUserAdmin
        ? "You are the admin of this group. If you leave, the group will be deleted unless you assign another member as the new admin. Are you sure you want to leave?"
        : "Are you sure you want to leave this group? You won't be able to access group content anymore.",
      onConfirm: async () => {
        try {
          set_loading(true);

          if (isCurrentUserAdmin) {
            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group`, {
              method: "DELETE",
              headers: {
                'content-type': "application/json",
                "Authorization": `Bearer ${user_id}`,
              },
              body: JSON.stringify({ groupMembers: members, group_id })
            });

            const result = await response.json();

            if (result.failed) {
              show_toast({ status: "Fail", message: "Something went wrong, Try again!" });
              console.log(result);
            } else if (!result.updated) {
              show_toast({ status: "Fail", message: "Something went wrong!" });
            } else {
              show_toast({ status: "Success", message: "Successfully Leaved Group!" });
              setTimeout(() => {
                window.location.reload();
              }, 400);
            }
          } else {
            const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group/leave`, {
              method: "PATCH",
              headers: {
                'content-type': "application/json",
                "Authorization": `Bearer ${user_id}`,
              },
              body: JSON.stringify({ deleteMember: true, group_id: group_id, member_id: actual_user_id })
            });

            const result = await response.json();

            if (result.failed) {
              show_toast({ status: "Fail", message: "Failed to leave group, Try again!" });
              console.log(result);
            } else if (!result.updated) {
              show_toast({ status: "Info", message: "May be already leaved group..." });
            } else {
              show_toast({ status: "Success", message: "Successfully Leaved Group!" });
              setTimeout(() => {
                window.location.reload();
              }, 400);
            }
          }

        } catch (error) {
          console.log(error);
          show_toast({ status: "Fail", message: "Failed to remove member, Try again later!" });
        } finally {
          set_loading(false);
          show_confirm_modal({
            show: false,
            type: '',
            message: ''
          });
        }
      }
    });
  };

  const handleMakeAdmin = (member) => {
    show_confirm_modal({
      show: true,
      type: 'makeAdmin',
      message: `Are you sure you want to make ${member.name} an admin? They will have full control over the group.`,
      onConfirm: async () => {
        try {
          set_loading(true);
          const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group`, {
            method: "PATCH",
            headers: {
              'content-type': "application/json",
              "Authorization": `Bearer ${user_id}`,
            },
            body: JSON.stringify({ makeAdmin: true, group_id: group_id, member_id: member.user_id, prevAdmin_id: admin_id, admin_name, group_name })
          });
          const result = await response.json();

          if (result.failed) {
            show_toast({ status: "Fail", message: "Failed to make member admin, Try again!" });
            console.log(result);
          } else if (!result.updated) {
            show_toast({ status: "Info", message: "May be member already admin..." });
          } else {
            show_toast({ status: "Success", message: "Member become new admin successfully!" });
            setCurrentAdminId(member.user_id);
            setIsCurrentUserAdmin(false);
            set_show_selected_exp_prof((prev) => ({ ...prev, expense_prof: { ...prev.expense_prof, admin_id: member.user_id } }));
          }
        } catch (error) {
          console.log(error);
          show_toast({ status: "Fail", message: "Failed to make member admin, Try again later!" });
        } finally {
          set_loading(false);
          show_confirm_modal({
            show: false,
            type: '',
            message: ''
          });
        }
      }
    });
  };

  const handleAddMember = () => {
    setShowAddMemberModal(true);
    setSearchQuery('');
    setSelectedFriends([]);
  };

  const closeAddMemberModal = () => {
    setShowAddMemberModal(false);
    setSearchQuery('');
    setSelectedFriends([]);
  };

  const toggleFriendSelection = (friend) => {
    setSelectedFriends(prev => {
      const isSelected = prev.some(f => f.user_id === friend.user_id);
      if (isSelected) {
        return prev.filter(f => f.user_id !== friend.user_id);
      } else {
        return [...prev, friend];
      }
    });
  };

  const handleAddSelectedMembers = async () => {
    if (selectedFriends.length === 0) return;

    try {
      set_loading(true);
      setIsAddingMembers(true);

      const response = await fetch(`${import.meta.env.VITE_SERVER_API}/group`, {
        method: "PATCH",
        headers: {
          'content-type': "application/json",
          "Authorization": `Bearer ${user_id}`,
        },
        body: JSON.stringify({
          addMembers: true,
          group_id: group_id,
          group_name,
          newMembers: selectedFriends,
          admin_name: admin_name
        })
      });
      const result = await response.json();
      console.log(result);

      if (result.failed) {
        show_toast({ status: "Fail", message: "Failed to add members, Try again later!" });
        console.log(result);
      } else if (!result.updated) {
        show_toast({ status: "Fail", message: "Failed to add members, Try again!" });
      }
      else {
        show_toast({ status: "Success", message: `${selectedFriends.length} member(s) added successfully!` });
        // Add the new members to the local state
        set_members(prev => [...prev, ...selectedFriends]);
        set_show_selected_exp_prof((prev) => ({ ...prev, expense_prof: { ...prev.expense_prof, group_members: [...prev.expense_prof.group_members, ...selectedFriends] } }));
      }
    } catch (error) {
      console.log(error);
      show_toast({ status: "Fail", message: "Failed to add members, Try again later!" });
    } finally {
      setIsAddingMembers(false);
      closeAddMemberModal();
      set_loading(false);
    }
  };

  useEffect(() => {
    if (!dropdownRef.current || !dropDownTriggerRef.current) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !dropDownTriggerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <div ref={dropDownTriggerRef} className="m-2.5 w-fit">
        <div className="relative">
          {/* Dropdown Trigger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white border-2 border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between hover:border-orange-300 focus:outline-none focus:ring-orange-100 focus:border-orange-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-[#f15b42] p-2 rounded-full">
                <Users className="w-5 h-5 text-yellow-200" />
              </div>
              <span className="text-gray-700 font-medium">
                Group Members ({members ? members.length : 0})
              </span>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          {/* Dropdown Menu */}
          <div ref={dropdownRef} className={`
            absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10
            transition-all duration-300 origin-top
            ${isOpen
              ? 'opacity-100 scale-y-100 translate-y-0'
              : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
            }
          `}>
            <div className="py-2 max-h-80 overflow-y-auto">
              {members && members.map((member, index) => {
                const isAdmin = member.user_id === currentAdminId;

                return (
                  <div
                    key={member.user_id}
                    className={`
                      px-4 py-3 flex items-center space-x-3 hover:bg-gray-50
                      transition-all duration-200
                      ${index !== members.length - 1 ? 'border-b border-gray-100' : ''}
                    `}
                    style={{
                      animationDelay: isOpen ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    {/* Profile Image */}
                    <div className="relative">
                      <img
                        src={member.profile_image}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
                              <circle cx="20" cy="16" r="6" fill="#9CA3AF"/>
                              <path d="M20 24c-8 0-12 4-12 8v8h24v-8c0-4-4-8-12-8z" fill="#9CA3AF"/>
                            </svg>
                          `)}`;
                        }}
                      />
                      {isAdmin && (
                        <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                          <Crown className="w-3 h-3 text-yellow-800" />
                        </div>
                      )}
                    </div>

                    {/* Member Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-semibold text-gray-800">
                          {member.name}
                        </h3>
                        {isAdmin && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Only show to current admin for non-admin members */}
                    {isCurrentUserAdmin && !isAdmin && (
                      <div className="flex items-center space-x-1">
                        {/* Make Admin Button */}
                        <button
                          onClick={() => handleMakeAdmin(member)}
                          className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-full transition-colors duration-200"
                          title="Make Admin"
                        >
                          <Crown className="w-4 h-4" />
                        </button>

                        {/* Remove Button */}
                        <button
                          onClick={() => handleRemoveMember(member)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                          title="Remove Member"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer with Leave Button */}
            <div className="px-4 py-3 pt-2 bg-gray-50 border-t border-gray-100 rounded-b-lg flex items-center justify-between">
              <button
                onClick={handleAddMember}
                className="font-bold flex items-center space-x-2 text-xs cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-full transition-all duration-200"
              >
                <UserPlus2 className="w-6 h-6 cursor-pointer" />
                <span>Add Member</span>
              </button>
              <button
                onClick={handleLeaveGroup}
                className="font-bold flex items-center space-x-2 mt-1 text-xs cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-full transition-all duration-200"
              >
                <LogOut className="w-6 h-6 cursor-pointer" />
                <span>Leave Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-[#000000a6] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Add Members</h2>
              <button
                onClick={closeAddMemberModal}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="px-6 py-4 max-h-80 overflow-y-auto">
              {availableFriends.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No friends found matching your search' : 'No friends available to add'}
                </div>
              ) : (
                <div className="space-y-2">
                  {availableFriends.map((friend) => {
                    const isSelected = selectedFriends.some(f => f.user_id === friend.user_id);
                    return (
                      <div
                        key={friend.user_id}
                        onClick={() => toggleFriendSelection(friend)}
                        className={`
                          flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                          ${isSelected
                            ? 'bg-blue-50 border-2 border-blue-200'
                            : 'hover:bg-gray-50 border-2 border-transparent'
                          }
                        `}
                      >
                        <img
                          src={friend.profile_image}
                          alt={friend.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = `data:image/svg+xml;base64,${btoa(`
                              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="20" cy="20" r="20" fill="#E5E7EB"/>
                                <circle cx="20" cy="16" r="6" fill="#9CA3AF"/>
                                <path d="M20 24c-8 0-12 4-12 8v8h24v-8c0-4-4-8-12-8z" fill="#9CA3AF"/>
                              </svg>
                            `)}`;
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-gray-800">{friend.name}</h3>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <Plus className="w-3 h-3 text-white rotate-45" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={closeAddMemberModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelectedMembers}
                  disabled={selectedFriends.length === 0 || isAddingMembers}
                  className="px-4 py-2 text-white rounded-lg bg-gradient-to-br from-gray-900 to-gray-800 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isAddingMembers ? 'Adding...' : `Add ${selectedFriends.length > 0 ? selectedFriends.length : ''} Member${selectedFriends.length !== 1 ? 's' : ''}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GroupMembersDropdown;