import React, { useState } from "react";
import { useContext } from "react";
import { CONTEXT } from "../../context/context";
import { FaLock } from "react-icons/fa";

const ResetPassword = () => {
  const { RESET_PASSWORD, setOpenComponent, loader, notifyError, notifySuccess } = useContext(CONTEXT);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmpassword: "",
  });

  const handleChange = (name, e) => {
    setForm({ ...form, [name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.confirmpassword) {
      notifyError?.("Please fill all fields");
      return;
    }
    if (form.password !== form.confirmpassword) {
      notifyError?.("Passwords do not match");
      return;
    }

    try {
      await RESET_PASSWORD({
        username: form.username.trim(),
        password: form.password,
      });
      // context already toasts success & navigates to Home
      // if you want to route back to Login explicitly, uncomment:
      // setOpenComponent?.("Login");
    } catch (err) {
      console.error(err);
      notifyError?.("Failed to reset password. Try again.");
    }
  };

  return (
    <div className="content-page">
      <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <div className="card shadow" style={{ maxWidth: 480, width: "100%" }}>
          <div className="card-header bg-primary text-white d-flex align-items-center">
            <FaLock className="mr-2" />
            <h5 className="mb-0">Reset Password</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => handleChange("username", e)}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter new password"
                  value={form.password}
                  onChange={(e) => handleChange("password", e)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Confirm new password"
                  value={form.confirmpassword}
                  onChange={(e) => handleChange("confirmpassword", e)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" disabled={loader}>
                {loader ? "Updating..." : "Update Password"}
              </button>

              <button
                type="button"
                className="btn btn-outline-secondary btn-block mt-2"
                onClick={() => setOpenComponent?.("Login")}
              >
                Back to Login
              </button>
            </form>
            <small className="text-muted d-block mt-3">
              Tip: You must connect the same wallet used during Sign Up.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
