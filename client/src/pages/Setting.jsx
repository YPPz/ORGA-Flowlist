import { useState, useContext } from "react";
import UserContext from "../contexts/UserContext";
import { updateUser, deleteUser } from "../api/user";
import defaultAvatar from "../assets/default-avatar.png";
import editIcon from "../assets/edit.png";
import hide_icon from "../assets/hide.png";
import view_icon from "../assets/view.png";

export default function Setting() {
  const { user, setUser } = useContext(UserContext);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarEdit, setAvatarEdit] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  const [displayName, setDisplayName] = useState(user.display_name || "");
  const [displayNameEdit, setDisplayNameEdit] = useState(false);
  const [displayNameLoading, setDisplayNameLoading] = useState(false);

  const [passwordEdit, setPasswordEdit] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [message, setMessage] = useState("");

  // Avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setAvatarLoading(true);
    setMessage("");
    try {
      const res = await updateUser(user.user_id, { avatarFile });
      setUser({ ...user, avatar: res.data.avatar || user.avatar });
      setMessage(res.message || "Avatar updated successfully");
      setAvatarFile(null);
      setAvatarEdit(false);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to update avatar");
    }
    setAvatarLoading(false);
  };

  // Display Name
  const saveDisplayName = async () => {
    setDisplayNameLoading(true);
    setMessage("");
    try {
      await updateUser(user.user_id, { display_name: displayName });
      setUser({ ...user, display_name: displayName });
      setMessage(res.message || "Display name updated successfully");
      setDisplayNameEdit(false);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to update display name");
    }
    setDisplayNameLoading(false);
  };

  // Password
  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match");
      return;
    }
    setPasswordLoading(true);
    setMessage("");
    try {
      await updateUser(user.user_id, { currentPassword, password: newPassword });
      setMessage(res.message || "Password updated successfully");
      setPasswordEdit(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to update password or Incorrect current password");
    }
    setPasswordLoading(false);
  };

  // Delete Account
  const handleDelete = async () => {
    try {
      let password = null;
      if (user.has_password) {
        password = window.prompt("Type your password to confirm account deletion:");
        if (!password) return;
      } else if (user.provider) {
        const confirmed = window.confirm(
          `Are you sure you want to delete your ${user.provider} account (${user.email})?`
        );
        if (!confirmed) return;
      }

      await deleteUser(user.user_id, password);
      window.location.href = "/login";
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Failed to delete account");
    }
  };

  return (
    <div className="container py-4 d-flex flex-column align-items-center">
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6">
          <h3 className="fw-bold mb-4 text-start">Settings</h3>

          {/* Avatar */}
          <div className="mb-4">
            <label className="fw-semibold mb-2">Profile picture</label>
            <div className="d-flex flex-column align-items-center">
              <div className="rounded-circle overflow-hidden ratio ratio-1x1" style={{ width: "120px" }}>
                <img
                  src={user.avatar || defaultAvatar}
                  alt="Avatar"
                  className="w-100 h-100"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="w-50 d-flex justify-content-end">
                <button
                  className="btn btn-light btn-sm mt-2"
                  onClick={() => setAvatarEdit((prev) => !prev)}
                >
                  <img src={editIcon} alt="edit" style={{ width: "1rem", height: "1rem" }} className="flex justify-content-end " />
                </button>

              </div>

              {avatarEdit && (
                <div className="mt-3 w-100">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="form-control mb-2"
                  />
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={saveAvatar}
                      disabled={avatarLoading || !avatarFile}
                    >
                      {avatarLoading ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarEdit(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="fw-semibold mb-2">Display Name</label>
            {!displayNameEdit ? (
              <div className="d-flex justify-content-between align-items-center">
                <span>{displayName}</span>
                <button
                  className="btn btn-light btn-sm"
                  onClick={() => setDisplayNameEdit(true)}
                >
                  <img src={editIcon} alt="edit" style={{ width: "1rem", height: "1rem" }} />
                </button>
              </div>
            ) : (
              <div className="d-flex flex-column flex-sm-row gap-2 mt-2">
                <input
                  type="text"
                  className="form-control"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
                <div className="d-flex gap-2 mt-2 mt-sm-0">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={saveDisplayName}
                    disabled={displayNameLoading}
                  >
                    {displayNameLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setDisplayNameEdit(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Password */}
          {!user.provider && (
            <div className="mb-4">
              <label className="fw-semibold mb-2 d-block">Password</label>
              {!passwordEdit ? (
                <button
                  className="btn btn-link btn-sm text-decoration-none text-muted p-0"
                  onClick={() => setPasswordEdit(true)}
                >
                  Change Password
                </button>
              ) : (
                <div className="d-flex flex-column gap-2 mt-2">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <div className="position-relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="btn btn-sm position-absolute top-50 end-0 translate-middle-y"
                    >
                      <img
                        src={showNewPassword ? hide_icon : view_icon}
                        alt="toggle"
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                  </div>
                  <div className="position-relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      className="form-control"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="btn btn-sm position-absolute top-50 end-0 translate-middle-y"
                    >
                      <img
                        src={showConfirm ? hide_icon : view_icon}
                        alt="toggle"
                        style={{ width: "20px", height: "20px" }}
                      />
                    </button>
                  </div>
                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={savePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? "Saving..." : "Save Password"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setPasswordEdit(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delete Account */}
          <div className="my-5">
            <button
              className="btn btn-danger w-100"
              onClick={handleDelete}
            >
              Delete Account
            </button>
          </div>

          {message && (
            <p className="text-success text-center small">{message}</p>
          )}

        </div>
      </div>
    </div>
  );
}
