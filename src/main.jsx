import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import { createRoot } from "react-dom/client";
import {
  Heart,
  Home,
  MessageCircle,
  User,
  Users,
  Search,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  ChevronLeft,
  X,
  Check,
  Sparkles,
  Send,
  Bell,
  Settings,
  Camera,
  Lock,
  Globe2,
  CircleUserRound,
  Upload,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  CalendarDays,
  Mail,
  MapPinned
} from "lucide-react";

import "./styles.css";

/* =========================================================
   HELPERS
========================================================= */

function FlagWatermark() {
  return (
    <div className="flag-watermark" aria-hidden="true">
      <span />
      <i />
      <b />
    </div>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span className="logo-mark">L</span>
      <span>
        LIB<span className="blue">Date</span>
      </span>
    </div>
  );
}

function calculateAge(dateString) {
  if (!dateString) return 0;

  const today = new Date();
  const birthDate = new Date(dateString);

  if (Number.isNaN(birthDate.getTime())) return 0;

  let age =
    today.getFullYear() -
    birthDate.getFullYear();

  const monthDifference =
    today.getMonth() -
    birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (
      monthDifference === 0 &&
      today.getDate() < birthDate.getDate()
    )
  ) {
    age--;
  }

  return age;
}

function isValidEmail(email) {
  const cleanedEmail = email
    .replace(/\\/g, "")
    .trim()
    .toLowerCase();

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    cleanedEmail
  );
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = () =>
      reject(
        new Error(
          "Unable to save the profile photo."
        )
      );

    reader.readAsDataURL(file);
  });
}

function getDisplayName(profile) {
  return (
    profile?.display_name ||
    `${profile?.first_name || ""} ${
      profile?.last_name || ""
    }`.trim() ||
    "LIBDate User"
  );
}

function getProfileImage(profile) {
  return (
    profile?.profile_photo_path ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=85"
  );
}

function mapDatabaseProfile(profile) {
  const name = getDisplayName(profile);

  const image = getProfileImage(profile);

  return {
    id: `db-${profile.id}`,
    databaseId: profile.id,
    name,
    age: calculateAge(profile.dob) || 18,
    city: profile.location || "Liberia",
    distance: "Nearby",
    image,
    bio: "New to LIBDate.",
    interests: [],
    intention: "Dating",
    compatibility: 80,
    status: "New to LIBDate ✨",
    photos: [image]
  };
}

function normalizeMatch(match, currentUserId) {
  if (!match) return null;

  const otherUserId =
    match.user_one_id === currentUserId
      ? match.user_two_id
      : match.user_one_id;

  return {
    id: match.id,
    otherUserId
  };
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

/*
  This creates the notification when somebody likes
  another user's profile.

  IMPORTANT:
  We are intentionally testing this against the database
  before making any database changes.
*/
async function createLikeNotification({
  receiverId,
  senderId,
  senderName
}) {
  if (!receiverId || !senderId) {
    return {
      success: false,
      error: new Error(
        "Notification users could not be identified."
      )
    };
  }

  try {
    const {
      data,
      error
    } = await supabase
      .from("notifications")
      .insert({
        user_id: receiverId,
        sender_id: senderId,
        type: "like",
        message: `${senderName} liked your profile ❤️`,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error(
        "Notification creation error:",
        error
      );

      return {
        success: false,
        error
      };
    }

    return {
      success: true,
      data
    };

  } catch (err) {
    console.error(
      "Unexpected notification creation error:",
      err
    );

    return {
      success: false,
      error: err
    };
  }
}

/* =========================================================
   NOTIFICATION PANEL
========================================================= */

function NotificationPanel({
  notifications,
  loading,
  onClose,
  onMarkRead,
  onMarkAllRead
}) {
  return (
    <div
      style={{
        position: "fixed",
        top: "68px",
        right: "16px",
        width: "min(360px, calc(100vw - 32px))",
        maxHeight: "min(520px, calc(100vh - 100px))",
        overflowY: "auto",
        background: "#fff",
        borderRadius: "18px",
        boxShadow:
          "0 18px 50px rgba(0,0,0,.18)",
        border:
          "1px solid rgba(0,0,0,.08)",
        zIndex: 1000
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 16px",
          borderBottom:
            "1px solid rgba(0,0,0,.07)"
        }}
      >

        <div>
          <strong
            style={{
              fontSize: "16px"
            }}
          >
            Notifications
          </strong>

          <div
            style={{
              color: "#6b7280",
              fontSize: "12px",
              marginTop: "2px"
            }}
          >
            Your latest activity
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >

          {notifications.some(
            (notification) =>
              !notification.read
          ) && (
            <button
              type="button"
              onClick={onMarkAllRead}
              style={{
                border: 0,
                background: "transparent",
                color: "#2563eb",
                fontSize: "11px",
                cursor: "pointer",
                padding: "6px"
              }}
            >
              Mark all read
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              border: 0,
              borderRadius: "50%",
              background:
                "rgba(0,0,0,.05)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <X size={17} />
          </button>

        </div>

      </div>

      {loading ? (
        <div
          style={{
            padding: "30px 18px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "13px"
          }}
        >
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div
          style={{
            padding: "35px 18px",
            textAlign: "center",
            color: "#6b7280"
          }}
        >
          <Bell
            size={30}
            style={{
              marginBottom: "8px"
            }}
          />

          <p
            style={{
              margin: 0,
              fontSize: "13px"
            }}
          >
            No notifications yet.
          </p>
        </div>
      ) : (
        notifications.map(
          (notification) => (
            <button
              type="button"
              key={notification.id}
              onClick={() =>
                onMarkRead(
                  notification.id
                )
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems: "flex-start",
                gap: "11px",
                padding: "13px 16px",
                border: 0,
                borderBottom:
                  "1px solid rgba(0,0,0,.06)",
                background:
                  notification.read
                    ? "#fff"
                    : "rgba(37,99,235,.06)",
                textAlign: "left",
                cursor: "pointer"
              }}
            >

              <div
                style={{
                  width: "38px",
                  height: "38px",
                  flex: "0 0 38px",
                  borderRadius: "50%",
                  background:
                    "rgba(37,99,235,.1)",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Heart
                  size={18}
                  fill="currentColor"
                />
              </div>

              <div
                style={{
                  minWidth: 0,
                  flex: 1
                }}
              >

                <div
                  style={{
                    color: "#111827",
                    fontSize: "13px",
                    lineHeight: 1.45,
                    fontWeight:
                      notification.read
                        ? 400
                        : 600
                  }}
                >
                  {notification.message ||
                    "Someone interacted with your profile."}
                </div>

                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "11px",
                    marginTop: "4px"
                  }}
                >
                  {notification.created_at
                    ? new Date(
                        notification.created_at
                      ).toLocaleString()
                    : "Just now"}
                </div>

              </div>

              {!notification.read && (
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#2563eb",
                    marginTop: "7px",
                    flex: "0 0 7px"
                  }}
                />
              )}

            </button>
          )
        )
      )}

    </div>
  );
}

/* =========================================================
   AUTH SCREEN
========================================================= */

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");

  return (
    <div className="auth-screen">
      <FlagWatermark />

      <div className="auth-card">
        <div className="auth-logo">
          <Logo />
        </div>

        {mode === "login" ? (
          <LoginForm
            onLogin={onAuthenticated}
            onSignUp={() => setMode("signup")}
          />
        ) : (
          <SignupFlow
            onComplete={onAuthenticated}
            onLogin={() => setMode("login")}
          />
        )}
      </div>
    </div>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginForm({ onLogin, onSignUp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setError("");

    const normalizedEmail = email
      .replace(/\\/g, "")
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error: authError
      } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

      if (authError) throw authError;

      if (!data?.user) {
        throw new Error(
          "Unable to identify your account."
        );
      }

      const user = data.user;

      const {
        data: profileData,
        error: profileError
      } =
        await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            display_name,
            location,
            dob,
            phone,
            profile_photo_path,
            live_selfie_path,
            created_at
          `)
          .eq("id", user.id)
          .maybeSingle();

      if (profileError) {
        console.error(
          "Profile loading error:",
          profileError
        );
      }

      const metadata =
        user.user_metadata || {};

      const profile = {
        id: user.id,

        firstName:
          profileData?.first_name ||
          metadata.first_name ||
          "",

        lastName:
          profileData?.last_name ||
          metadata.last_name ||
          "",

        displayName:
          profileData?.display_name ||
          metadata.display_name ||
          "",

        location:
          profileData?.location ||
          metadata.location ||
          "",

        dob:
          profileData?.dob ||
          metadata.dob ||
          "",

        age: calculateAge(
          profileData?.dob ||
          metadata.dob ||
          ""
        ),

        phone:
          profileData?.phone || "",

        email:
          user.email ||
          normalizedEmail,

        profilePhoto:
          profileData?.profile_photo_path ||
          "",

        liveSelfie:
          profileData?.live_selfie_path ||
          "",

        createdAt:
          profileData?.created_at ||
          new Date().toISOString()
      };

      localStorage.setItem(
        "libdate_profile",
        JSON.stringify(profile)
      );

      localStorage.setItem(
        "libdate_authenticated",
        "true"
      );

      onLogin(profile);

    } catch (err) {
      console.error(
        "Supabase login error:",
        err
      );

      setError(
        err?.message ||
        "Unable to log in. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-content">

      <div className="auth-heading">
        <p className="eyebrow">
          WELCOME BACK
        </p>

        <h1>
          Log in to LIBDate.
        </h1>

        <p>
          Connect with people and build meaningful
          relationships.
        </p>
      </div>

      <form
        className="auth-form"
        onSubmit={submit}
      >
        <label>
          Email address
        </label>

        <div className="input-wrap">
          <Mail size={18} />

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="you@example.com"
          />
        </div>

        <label>
          Password
        </label>

        <div className="input-wrap">
          <Lock size={18} />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          className="primary auth-submit"
          type="submit"
          disabled={loading}
        >
          <LogIn size={18} />

          {loading
            ? "Logging in..."
            : "Log In"}
        </button>
      </form>

      <div className="auth-divider">
        <span>
          New to LIBDate?
        </span>
      </div>

      <button
        className="secondary-auth"
        onClick={onSignUp}
      >
        <UserPlus size={18} />
        Create an account
      </button>

      <p className="auth-note">
        By continuing, you agree to use LIBDate
        responsibly and provide accurate information.
      </p>

    </div>
  );
}

/* =========================================================
   SIGNUP
========================================================= */

function SignupFlow({
  onComplete,
  onLogin
}) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    location: "",
    dob: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilePhoto: null,
    profilePhotoPreview: ""
  });

  const [error, setError] = useState("");

  const update = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const nextStep = () => {
    setError("");

    if (step === 1) {
      if (
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.displayName.trim() ||
        !form.location.trim()
      ) {
        setError(
          "Please complete all the required information."
        );
        return;
      }

      if (!form.dob) {
        setError(
          "Please enter your date of birth."
        );
        return;
      }

      const age =
        calculateAge(form.dob);

      if (age < 18) {
        setError(
          "You must be at least 18 years old to use LIBDate."
        );
        return;
      }

      if (age > 100) {
        setError(
          "Please enter a valid date of birth."
        );
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!isValidEmail(form.email)) {
        setError(
          "Please enter a valid email address."
        );
        return;
      }

      if (form.password.length < 8) {
        setError(
          "Password must contain at least 8 characters."
        );
        return;
      }

      if (
        form.password !==
        form.confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );
        return;
      }

      setStep(3);
      return;
    }

    if (step === 3) {
      if (!form.profilePhoto) {
        setError(
          "You must upload a profile photo."
        );
        return;
      }

      setStep(4);
    }
  };

  const goBack = () => {
    setError("");

    if (step === 1) {
      onLogin();
      return;
    }

    setStep(
      (current) => current - 1
    );
  };

  const handlePhoto = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file."
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(
        "Please select an image smaller than 10MB."
      );
      return;
    }

    const preview =
      URL.createObjectURL(file);

    setForm((current) => ({
      ...current,
      profilePhoto: file,
      profilePhotoPreview: preview
    }));

    setError("");
  };

  const finishSignup = async (
    liveSelfie
  ) => {
    try {
      setError("");

      const normalizedEmail =
        form.email
          .replace(/\\/g, "")
          .trim()
          .toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        setError(
          "Please enter a valid email address."
        );
        return;
      }

      const profilePhotoData =
        await fileToDataUrl(
          form.profilePhoto
        );

      const {
        data,
        error: signupError
      } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: form.password,
          options: {
            data: {
              first_name:
                form.firstName.trim(),

              last_name:
                form.lastName.trim(),

              display_name:
                form.displayName.trim(),

              location:
                form.location.trim(),

              dob:
                form.dob
            }
          }
        });

      if (signupError) {
        throw signupError;
      }

      if (!data.user) {
        throw new Error(
          "Unable to create your account."
        );
      }

      const profile = {
        id: data.user.id,

        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        displayName:
          form.displayName.trim(),

        location:
          form.location.trim(),

        dob:
          form.dob,

        age:
          calculateAge(form.dob),

        phone: "",

        email:
          normalizedEmail,

        profilePhoto:
          profilePhotoData ||
          form.profilePhotoPreview,

        liveSelfie:
          liveSelfie || "",

        createdAt:
          new Date().toISOString()
      };

      if (data.session) {
        const {
          error: profileError
        } =
          await supabase
            .from("profiles")
            .upsert(
              {
                id: data.user.id,

                first_name:
                  profile.firstName,

                last_name:
                  profile.lastName,

                display_name:
                  profile.displayName,

                location:
                  profile.location,

                dob:
                  profile.dob,

                phone: null,

                profile_photo_path:
                  profile.profilePhoto ||
                  null,

                live_selfie_path:
                  profile.liveSelfie ||
                  null
              },
              {
                onConflict: "id"
              }
            );

        if (profileError) {
          throw profileError;
        }

        localStorage.setItem(
          "libdate_profile",
          JSON.stringify(profile)
        );

        localStorage.setItem(
          "libdate_authenticated",
          "true"
        );

        onComplete(profile);
        return;
      }

      alert(
        "Account created. Please check your email to confirm your account, then log in."
      );

      onLogin();

    } catch (err) {
      console.error(
        "Supabase signup error:",
        err
      );

      setError(
        err?.message ||
        "We could not create your account. Please try again."
      );
    }
  };

  return (
    <div className="signup-flow">

      <div className="signup-top">

        <button
          className="icon-btn"
          onClick={goBack}
        >
          <ChevronLeft />
        </button>

        <span className="signup-step">
          {step}/4
        </span>

      </div>

      {step === 1 && (
        <PersonalInfoStep
          form={form}
          update={update}
          error={error}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <AccountSecurityStep
          form={form}
          update={update}
          error={error}
          onNext={nextStep}
        />
      )}

      {step === 3 && (
        <PhotoUploadStep
          form={form}
          handlePhoto={handlePhoto}
          error={error}
          onNext={nextStep}
        />
      )}

      {step === 4 && (
        <LiveVerificationStep
          profilePhoto={
            form.profilePhotoPreview
          }
          onVerified={finishSignup}
        />
      )}

    </div>
  );
}

/* =========================================================
   PERSONAL INFO
========================================================= */

function PersonalInfoStep({
  form,
  update,
  error,
  onNext
}) {
  return (
    <div className="signup-content">

      <div className="auth-heading">
        <p className="eyebrow">
          CREATE YOUR PROFILE
        </p>

        <h1>
          Tell us about you.
        </h1>

        <p>
          We need a few basic details to create
          your LIBDate account.
        </p>
      </div>

      <div className="signup-form">

        <div className="two-inputs">

          <div>
            <label>
              First name
            </label>

            <div className="input-wrap">
              <User size={18} />

              <input
                value={form.firstName}
                onChange={(e) =>
                  update(
                    "firstName",
                    e.target.value
                  )
                }
                placeholder="First name"
              />
            </div>
          </div>

          <div>
            <label>
              Last name
            </label>

            <div className="input-wrap">
              <User size={18} />

              <input
                value={form.lastName}
                onChange={(e) =>
                  update(
                    "lastName",
                    e.target.value
                  )
                }
                placeholder="Last name"
              />
            </div>
          </div>

        </div>

        <label>
          Display name
        </label>

        <div className="input-wrap">
          <CircleUserRound size={18} />

          <input
            value={form.displayName}
            onChange={(e) =>
              update(
                "displayName",
                e.target.value
              )
            }
            placeholder="What should people see?"
          />
        </div>

        <label>
          Location
        </label>

        <div className="input-wrap">
          <MapPinned size={18} />

          <input
            value={form.location}
            onChange={(e) =>
              update(
                "location",
                e.target.value
              )
            }
            placeholder="e.g. Sinkor, Monrovia"
          />
        </div>

        <label>
          Date of birth
        </label>

        <div className="input-wrap">
          <CalendarDays size={18} />

          <input
            type="date"
            value={form.dob}
            onChange={(e) =>
              update(
                "dob",
                e.target.value
              )
            }
          />
        </div>

        <p className="field-help">
          You must be 18 or older to create
          a LIBDate account.
        </p>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          className="primary"
          onClick={onNext}
        >
          Continue
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   ACCOUNT SECURITY
========================================================= */

function AccountSecurityStep({
  form,
  update,
  error,
  onNext
}) {
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  return (
    <div className="signup-content">

      <div className="auth-heading">

        <p className="eyebrow">
          ACCOUNT SECURITY
        </p>

        <h1>
          Secure your account.
        </h1>

        <p>
          Your email address and password will
          be used when you log in.
        </p>

      </div>

      <div className="signup-form">

        <label>
          Email address
        </label>

        <div className="input-wrap">
          <Mail size={18} />

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              update(
                "email",
                e.target.value
              )
            }
            placeholder="you@example.com"
          />
        </div>

        <label>
          Password
        </label>

        <div className="input-wrap">
          <Lock size={18} />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            value={form.password}
            onChange={(e) =>
              update(
                "password",
                e.target.value
              )
            }
            placeholder="At least 8 characters"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <label>
          Confirm password
        </label>

        <div className="input-wrap">
          <Lock size={18} />

          <input
            type={
              showConfirm
                ? "text"
                : "password"
            }
            value={form.confirmPassword}
            onChange={(e) =>
              update(
                "confirmPassword",
                e.target.value
              )
            }
            placeholder="Enter password again"
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowConfirm(
                !showConfirm
              )
            }
          >
            {showConfirm ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <button
          className="primary"
          onClick={onNext}
        >
          Continue
        </button>

      </div>
    </div>
  );
}

/* =========================================================
   PHOTO UPLOAD
========================================================= */

function PhotoUploadStep({
  form,
  handlePhoto,
  error,
  onNext
}) {
  const inputRef = useRef(null);

  return (
    <div className="signup-content photo-step">

      <div className="auth-heading">

        <p className="eyebrow">
          PROFILE PHOTO
        </p>

        <h1>
          Show people who you are.
        </h1>

        <p>
          Upload a clear photo of yourself.
          This photo will be used during
          the verification process.
        </p>

      </div>

      <div
        className="photo-upload-box"
        onClick={() =>
          inputRef.current?.click()
        }
      >

        {form.profilePhotoPreview ? (
          <img
            src={
              form.profilePhotoPreview
            }
            alt="Profile preview"
          />
        ) : (
          <>
            <div className="upload-icon">
              <Upload size={30} />
            </div>

            <strong>
              Upload your photo
            </strong>

            <span>
              Choose a clear photo of yourself
            </span>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) =>
            handlePhoto(
              e.target.files?.[0]
            )
          }
          hidden
        />

      </div>

      {form.profilePhotoPreview && (
        <button
          className="secondary-auth"
          onClick={() =>
            inputRef.current?.click()
          }
        >
          <Camera size={18} />
          Choose another photo
        </button>
      )}

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <div className="verification-notice">

        <ShieldCheck size={20} />

        <div>

          <strong>
            Photo verification required
          </strong>

          <span>
            After this step, we'll ask you
            to take a live camera selfie.
          </span>

        </div>

      </div>

      <button
        className="primary"
        onClick={onNext}
      >
        Continue to verification
      </button>

    </div>
  );
}

/* =========================================================
   LIVE VERIFICATION
========================================================= */

function LiveVerificationStep({
  profilePhoto,
  onVerified
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] =
    useState("starting");

  const [selfie, setSelfie] =
    useState("");

  const [error, setError] =
    useState("");

  const [verifying, setVerifying] =
    useState(false);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCamera = async () => {
    setError("");
    setCameraState("starting");

    try {
      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 720
            },
            height: {
              ideal: 720
            }
          },
          audio: false
        });

      streamRef.current = stream;

      const video =
        videoRef.current;

      if (!video) {
        throw new Error(
          "Camera video element is not ready."
        );
      }

      video.srcObject = stream;

      await new Promise(
        (resolve, reject) => {
          const timeout =
            setTimeout(() => {
              reject(
                new Error(
                  "The camera took too long to start."
                )
              );
            }, 10000);

          const ready = () => {
            clearTimeout(timeout);
            resolve();
          };

          if (video.readyState >= 2) {
            ready();
          } else {
            video.onloadedmetadata =
              ready;
          }
        }
      );

      await video.play();

      setCameraState("ready");

    } catch (err) {
      console.error(
        "Camera error:",
        err
      );

      stopCamera();

      setCameraState("error");

      if (
        err?.name ===
        "NotAllowedError"
      ) {
        setError(
          "Camera permission was denied. Please allow camera access and try again."
        );
      } else if (
        err?.name ===
        "NotFoundError"
      ) {
        setError(
          "No camera was found on this device."
        );
      } else if (
        err?.name ===
        "NotReadableError"
      ) {
        setError(
          "Your camera is being used by another application."
        );
      } else {
        setError(
          err?.message ||
          "Unable to start the camera."
        );
      }
    }
  };

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const takeSelfie = () => {
    const video =
      videoRef.current;

    if (
      !video ||
      video.readyState < 2 ||
      !video.videoWidth ||
      !video.videoHeight
    ) {
      setError(
        "Camera is still starting. Please wait a moment."
      );
      return;
    }

    const canvas =
      document.createElement(
        "canvas"
      );

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    const context =
      canvas.getContext("2d");

    if (!context) {
      setError(
        "Unable to capture the camera image."
      );
      return;
    }

    context.translate(
      canvas.width,
      0
    );

    context.scale(-1, 1);

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image =
      canvas.toDataURL(
        "image/jpeg",
        0.9
      );

    setSelfie(image);

    stopCamera();

    setCameraState("captured");

    setError("");
  };

  const retake = async () => {
    setSelfie("");
    setError("");

    await startCamera();
  };

  const verify = async () => {
    if (!selfie) {
      setError(
        "Please take a live selfie first."
      );
      return;
    }

    setVerifying(true);
    setError("");

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          1000
        )
    );

    setVerifying(false);

    onVerified(selfie);
  };

  return (
    <div className="signup-content verification-step">

      <div className="auth-heading">

        <p className="eyebrow">
          IDENTITY CHECK
        </p>

        <h1>
          Let's verify you.
        </h1>

        <p>
          Take a live selfie. Make sure
          your face is clearly visible.
        </p>

      </div>

      <div className="verification-comparison">

        <div className="verification-photo">

          <span>
            Uploaded photo
          </span>

          <img
            src={profilePhoto}
            alt="Uploaded profile"
          />

        </div>

        <div className="verification-arrow">
          <ShieldCheck size={22} />
        </div>

        <div className="verification-photo">

          <span>
            Live selfie
          </span>

          {selfie ? (
            <img
              src={selfie}
              alt="Live selfie"
            />
          ) : (
            <div className="camera-placeholder">
              <Camera size={28} />
            </div>
          )}

        </div>

      </div>

      <div className="camera-box">

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            display:
              cameraState === "starting" ||
              cameraState === "ready"
                ? "block"
                : "none"
          }}
        />

        {cameraState ===
          "starting" && (
          <div className="camera-message">
            <Camera size={32} />
            <span>
              Starting camera...
            </span>
          </div>
        )}

        {cameraState ===
          "error" && (
          <div className="camera-message">
            <Camera size={32} />
            <span>
              Camera unavailable
            </span>

            <button
              className="small-btn"
              onClick={startCamera}
            >
              Try again
            </button>
          </div>
        )}

        {cameraState ===
          "captured" && (
          <div className="camera-captured">
            <Check size={34} />

            <strong>
              Live selfie captured
            </strong>
          </div>
        )}

      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {cameraState === "ready" && (
        <button
          className="primary"
          onClick={takeSelfie}
        >
          <Camera size={18} />
          Take live selfie
        </button>
      )}

      {cameraState === "captured" && (
        <>
          <button
            className="secondary-auth"
            onClick={retake}
          >
            Retake selfie
          </button>

          <button
            className="primary"
            onClick={verify}
            disabled={verifying}
          >
            <ShieldCheck size={18} />

            {verifying
              ? "Checking..."
              : "Continue"}
          </button>
        </>
      )}

    </div>
  );
}

/* =========================================================
   NAVIGATION
========================================================= */

function BottomNav({
  page,
  setPage
}) {
  const items = [
    [
      "discover",
      "Discover",
      Home
    ],
    [
      "connections",
      "Connections",
      Users
    ],
    [
      "messages",
      "Messages",
      MessageCircle
    ],
    [
      "profile",
      "Profile",
      User
    ]
  ];

  return (
    <nav className="bottom-nav">

      {items.map(
        ([id, label, Icon]) => (
          <button
            key={id}
            className={
              page === id
                ? "active"
                : ""
            }
            onClick={() =>
              setPage(id)
            }
          >
            <Icon size={21} />

            <span>
              {label}
            </span>
          </button>
        )
      )}

    </nav>
  );
}

/* =========================================================
   HEADER
========================================================= */

function Header({
  title,
  back,
  onBack,
  right,
  onNotificationClick,
  unreadNotifications = 0
}) {
  return (
    <header className="topbar">

      {back ? (
        <button
          className="icon-btn"
          onClick={onBack}
        >
          <ChevronLeft />
        </button>
      ) : (
        <Logo />
      )}

      {back && (
        <h2>
          {title}
        </h2>
      )}

      {!back && (
        <div className="header-actions">

          <button
            className="icon-btn"
            type="button"
            onClick={
              onNotificationClick
            }
            style={{
              position: "relative"
            }}
          >
            <Bell />

            {unreadNotifications > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  minWidth: "16px",
                  height: "16px",
                  padding: "0 4px",
                  borderRadius: "999px",
                  background: "#dc2626",
                  color: "#fff",
                  fontSize: "9px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border:
                    "2px solid #fff"
                }}
              >
                {unreadNotifications > 99
                  ? "99+"
                  : unreadNotifications}
              </span>
            )}

          </button>

          <button
            className="icon-btn"
            type="button"
          >
            <Settings />
          </button>

        </div>
      )}

      {right && (
        <div className="header-right">
          {right}
        </div>
      )}

    </header>
  );
}

/* =========================================================
   PERSON CARD
========================================================= */

function PersonCard({
  person,
  liked,
  passed,
  onConnect,
  onPass,
  onOpen,
  onStatusOpen,
  liking
}) {
  return (
    <article
      className="person-card"
      onClick={onOpen}
    >

      <img
        src={person.image}
        alt={person.name}
      />

      <div className="photo-gradient" />

      <div className="card-top">

        <span className="online">
          <span />
          Online
        </span>

        <button
          type="button"
          className="status-avatar-button"
          onClick={(e) => {
            e.stopPropagation();
            onStatusOpen();
          }}
          aria-label={`View ${person.name}'s status`}
        >
          <img
            src={
              person.photos?.[0] ||
              person.image
            }
            alt=""
          />
        </button>

      </div>

      <div className="person-info">

        <div className="name-line">

          <h1>
            {person.name},{" "}
            {person.age}
          </h1>

          <ShieldCheck size={18} />

        </div>

        <div className="location">

          <MapPin size={14} />

          {person.city}

        </div>

        <div className="chips">

          {(person.interests || [])
            .map((x) => (
              <span key={x}>
                {x}
              </span>
            ))}

        </div>

        <div className="compat">

          <Sparkles size={14} />

          {person.compatibility}%
          connection

        </div>

      </div>

      <div
        className="card-actions"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className={`round pass ${
            passed
              ? "selected"
              : ""
          }`}
          onClick={onPass}
        >
          <X />
        </button>

        <button
          className={`round connect ${
            liked
              ? "selected"
              : ""
          }`}
          onClick={onConnect}
          disabled={liking}
        >
          <Heart
            fill={
              liked
                ? "currentColor"
                : "none"
            }
          />
        </button>

      </div>

    </article>
  );
}

/* =========================================================
   DISCOVER
========================================================= */

function Discover({
  setPage,
  setSelected,
  notify,
  unreadNotifications,
  onNotificationClick
}) {
  const [likes, setLikes] =
    useState({});

  const [passes, setPasses] =
    useState({});

  const [dbPeople, setDbPeople] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [loadingPeople, setLoadingPeople] =
    useState(true);

  const [profileError, setProfileError] =
    useState("");

  const [likingId, setLikingId] =
    useState("");

  const loadProfiles = async () => {
    try {
      setLoadingPeople(true);
      setProfileError("");

      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUserId =
        authData?.user?.id;

      if (!currentUserId) {
        setDbPeople([]);
        return;
      }

      const {
        data,
        error
      } =
        await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            display_name,
            location,
            dob,
            profile_photo_path,
            created_at
          `)
          .neq(
            "id",
            currentUserId
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (error) {
        console.error(
          "Supabase profiles loading error:",
          error
        );

        setProfileError(
          error.message ||
          "Unable to load registered users."
        );

        return;
      }

      const mapped =
        (data || []).map(
          mapDatabaseProfile
        );

      setDbPeople(mapped);

      const {
        data: myLikes,
        error: likesError
      } =
        await supabase
          .from("likes")
          .select(
            "liked_user_id"
          )
          .eq(
            "user_id",
            currentUserId
          );

      if (!likesError) {
        const likeState = {};

        (myLikes || []).forEach(
          (like) => {
            likeState[
              `db-${like.liked_user_id}`
            ] = true;
          }
        );

        setLikes(likeState);
      } else {
        console.error(
          "Likes loading error:",
          likesError
        );
      }

    } catch (err) {
      console.error(
        "Unexpected profile loading error:",
        err
      );

      setProfileError(
        "Unable to load registered users."
      );

    } finally {
      setLoadingPeople(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleLike = async (person) => {
    if (!person.databaseId) {
      notify(
        "This profile is not available."
      );
      return;
    }

    if (likes[person.id]) {
      notify(
        `You already liked ${person.name} ❤️`
      );
      return;
    }

    try {
      setLikingId(person.id);

      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUserId =
        authData?.user?.id;

      if (!currentUserId) {
        throw new Error(
          "Your account could not be identified."
        );
      }

      const {
        data,
        error
      } =
        await supabase.rpc(
          "like_user",
          {
            target_user_id:
              person.databaseId
          }
        );

      if (error) {
        throw error;
      }

      setLikes(
        (current) => ({
          ...current,
          [person.id]: true
        })
      );

      /*
        NEW:
        Send a notification to the person
        who received the like.
      */
      const notificationResult =
        await createLikeNotification({
          receiverId:
            person.databaseId,

          senderId:
            currentUserId,

          senderName:
            userProfileName()
        });

      if (!notificationResult.success) {
        console.error(
          "Like succeeded, but notification could not be created:",
          notificationResult.error
        );
      }

      if (data?.matched) {
        notify(
          `It's a match with ${person.name}! 💙`
        );
      } else {
        notify(
          `You liked ${person.name} ❤️`
        );
      }

    } catch (err) {
      console.error(
        "Like error:",
        err
      );

      notify(
        err?.message ||
        "Unable to send the connection request."
      );
    } finally {
      setLikingId("");
    }
  };

  /*
    This helper gets the currently logged-in
    user's display name for notifications.
  */
  const userProfileName = () => {
    try {
      const saved =
        localStorage.getItem(
          "libdate_profile"
        );

      if (saved) {
        const parsed =
          JSON.parse(saved);

        return (
          parsed.displayName ||
          `${parsed.firstName || ""} ${
            parsed.lastName || ""
          }`.trim() ||
          "Someone"
        );
      }
    } catch (err) {
      console.error(
        "Unable to read local profile:",
        err
      );
    }

    return "Someone";
  };

  const handlePass = (person) => {
    setPasses(
      (current) => ({
        ...current,
        [person.id]: true
      })
    );

    notify(
      `You passed on ${person.name}`
    );
  };

  const normalizedSearch =
    searchTerm
      .trim()
      .toLowerCase();

  const visiblePeople =
    dbPeople.filter(
      (person) => {

        if (!normalizedSearch) {
          return true;
        }

        return (
          person.name
            .toLowerCase()
            .includes(
              normalizedSearch
            ) ||
          person.city
            .toLowerCase()
            .includes(
              normalizedSearch
            )
        );
      }
    );

  return (
    <div className="screen">

      <Header
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          onNotificationClick
        }
      />

      <main className="content discover-page">

        <div className="discover-heading">

          <div>

            <p className="eyebrow">
              DISCOVER
            </p>

            <h2>
              Find your connection.
            </h2>

          </div>

          <button className="filter">
            <SlidersHorizontal
              size={18}
            />
          </button>

        </div>

        <div className="location-pill">

          <MapPin size={15} />

          Monrovia

          <ChevronLeft
            className="rotate90"
            size={14}
          />

        </div>

        <div
          className="search"
          style={{
            marginTop: "14px"
          }}
        >

          <Search size={18} />

          <input
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder="Search people..."
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() =>
                setSearchTerm("")
              }
              style={{
                border: 0,
                background:
                  "transparent",
                cursor: "pointer"
              }}
            >
              <X size={17} />
            </button>
          )}

        </div>

        {loadingPeople && (
          <p
            style={{
              margin: "14px 0",
              color: "#6b7280",
              fontSize: "13px"
            }}
          >
            Loading people...
          </p>
        )}

        {profileError && (
          <p
            style={{
              margin: "14px 0",
              color: "#b91c1c",
              fontSize: "13px"
            }}
          >
            {profileError}
          </p>
        )}

        <div className="discover-feed">

          {visiblePeople.map(
            (person) => (
              <PersonCard
                key={person.id}
                person={person}
                liked={
                  !!likes[
                    person.id
                  ]
                }
                passed={
                  !!passes[
                    person.id
                  ]
                }
                liking={
                  likingId ===
                  person.id
                }
                onConnect={() =>
                  handleLike(
                    person
                  )
                }
                onPass={() =>
                  handlePass(
                    person
                  )
                }
                onOpen={() => {
                  setSelected(
                    person
                  );

                  setPage(
                    "person"
                  );
                }}
                onStatusOpen={() => {
                  setSelected(
                    person
                  );

                  setPage(
                    "status"
                  );
                }}
              />
            )
          )}

        </div>

        {!loadingPeople &&
          visiblePeople.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6b7280"
              }}
            >
              <Search
                size={30}
                style={{
                  marginBottom: "10px"
                }}
              />

              <p>
                No registered people found.
              </p>
            </div>
          )}

      </main>

    </div>
  );
}

/* =========================================================
   STATUS PAGE
========================================================= */

function StatusPage({
  person,
  setPage,
  setSelected
}) {
  if (!person) return null;

  const photos =
    person.photos?.length
      ? person.photos
      : [person.image];

  return (
    <div
      className="screen"
      style={{
        background: "#000",
        minHeight: "100vh"
      }}
    >
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#000"
        }}
      >

        <div
          style={{
            position: "relative",
            height: "100vh",
            minHeight: "620px",
            overflow: "hidden"
          }}
        >

          <img
            src={photos[0]}
            alt={person.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover"
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(0,0,0,.58), transparent 28%, transparent 58%, rgba(0,0,0,.72))"
            }}
          />

          <button
            type="button"
            onClick={() =>
              setPage("discover")
            }
            style={{
              position: "absolute",
              left: "16px",
              top: "16px",
              zIndex: 3,
              width: "42px",
              height: "42px",
              border: 0,
              borderRadius: "50%",
              background:
                "rgba(0,0,0,.42)",
              color: "#fff",
              fontSize: "26px",
              cursor: "pointer"
            }}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => {
              setSelected(person);
              setPage("person");
            }}
            style={{
              position: "absolute",
              left: "18px",
              right: "18px",
              top: "38px",
              zIndex: 3,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: 0,
              border: 0,
              background: "transparent",
              color: "#fff",
              textAlign: "left"
            }}
          >

            <img
              src={person.image}
              alt={person.name}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #fff"
              }}
            />

            <div>
              <strong>
                {person.name},{" "}
                {person.age}
              </strong>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  opacity: .86
                }}
              >
                {person.city}
              </span>
            </div>

          </button>

          <div
            style={{
              position: "absolute",
              left: "20px",
              right: "20px",
              bottom: "30px",
              zIndex: 2,
              color: "#fff"
            }}
          >

            <span
              style={{
                display: "block",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: ".12em",
                opacity: .78
              }}
            >
              Recent status
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "21px",
                marginTop: "8px"
              }}
            >
              {person.status ||
                "No status added yet."}
            </strong>

          </div>

        </div>

      </main>
    </div>
  );
}

/* =========================================================
   PERSON PAGE
========================================================= */

function PersonPage({
  person,
  setPage,
  notify,
  unreadNotifications,
  onNotificationClick
}) {
  const [liked, setLiked] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    const checkLike = async () => {
      if (!person?.databaseId) return;

      const {
        data: userData
      } =
        await supabase.auth.getUser();

      const userId =
        userData?.user?.id;

      if (!userId) return;

      const {
        data
      } =
        await supabase
          .from("likes")
          .select("id")
          .eq(
            "user_id",
            userId
          )
          .eq(
            "liked_user_id",
            person.databaseId
          )
          .maybeSingle();

      setLiked(!!data);
    };

    checkLike();
  }, [person]);

  if (!person) return null;

  const sendConnection = async () => {
    if (!person.databaseId) {
      notify(
        "This profile is unavailable."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUserId =
        authData?.user?.id;

      if (!currentUserId) {
        throw new Error(
          "Your account could not be identified."
        );
      }

      const {
        data,
        error
      } =
        await supabase.rpc(
          "like_user",
          {
            target_user_id:
              person.databaseId
          }
        );

      if (error) throw error;

      setLiked(true);

      /*
        NEW:
        Create notification for the
        person who received the like.
      */
      let senderName = "Someone";

      try {
        const saved =
          localStorage.getItem(
            "libdate_profile"
          );

        if (saved) {
          const parsed =
            JSON.parse(saved);

          senderName =
            parsed.displayName ||
            `${parsed.firstName || ""} ${
              parsed.lastName || ""
            }`.trim() ||
            "Someone";
        }
      } catch (err) {
        console.error(
          "Unable to get sender name:",
          err
        );
      }

      const notificationResult =
        await createLikeNotification({
          receiverId:
            person.databaseId,

          senderId:
            currentUserId,

          senderName
        });

      if (!notificationResult.success) {
        console.error(
          "Like succeeded, but notification could not be created:",
          notificationResult.error
        );
      }

      notify(
        data?.matched
          ? `It's a match with ${person.name}! 💙`
          : `You liked ${person.name} ❤️`
      );

    } catch (err) {
      console.error(
        "Connection error:",
        err
      );

      notify(
        err?.message ||
        "Unable to send connection."
      );

    } finally {
      setLoading(false);
    }
  };

  const photos =
    person.photos?.length
      ? person.photos
      : [person.image];

  return (
    <div className="screen">

      <Header
        title="Profile"
        back
        onBack={() =>
          setPage("discover")
        }
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          onNotificationClick
        }
      />

      <main className="content profile-detail">

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "8px 0 20px"
          }}
        >

          <button
            type="button"
            onClick={() =>
              setPage("status")
            }
            style={{
              width: "92px",
              height: "92px",
              padding: "4px",
              border: 0,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)"
            }}
          >

            <span
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                padding: "3px",
                background: "#fff"
              }}
            >

              <img
                src={person.image}
                alt={person.name}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />

            </span>

          </button>

          <div
            style={{
              marginTop: "10px",
              textAlign: "center"
            }}
          >
            <strong
              style={{
                display: "block",
                fontSize: "20px"
              }}
            >
              {person.name},{" "}
              {person.age}
            </strong>

            <span
              style={{
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              {person.city}
            </span>
          </div>

        </div>

        <div className="detail-main">

          <div className="name-line">

            <h1>
              {person.name},{" "}
              {person.age}
            </h1>

            <ShieldCheck size={20} />

          </div>

          <div className="location">

            <MapPin size={15} />

            {person.city}

          </div>

          <div className="compat big">

            <Sparkles size={15} />

            {person.compatibility}%
            connection

          </div>

          <h3>
            About me
          </h3>

          <p>
            {person.bio}
          </p>

          <h3>
            Interests
          </h3>

          <div className="chips large">

            {(person.interests || [])
              .map((x) => (
                <span key={x}>
                  {x}
                </span>
              ))}

          </div>

          <h3>
            Looking for
          </h3>

          <div className="intent">

            <Heart size={16} />

            {person.intention}

          </div>

          <h3>
            Photos
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, 1fr)",
              gap: "7px",
              marginBottom: "22px"
            }}
          >

            {photos.map(
              (photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={photo}
                  alt={`${person.name} photo`}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    objectFit: "cover",
                    borderRadius: "10px"
                  }}
                />
              )
            )}

          </div>

          <button
            className="primary"
            onClick={sendConnection}
            disabled={loading}
          >
            <Heart
              size={18}
              fill={
                liked
                  ? "currentColor"
                  : "none"
              }
            />

            {loading
              ? "Connecting..."
              : liked
                ? "Connected / Liked"
                : "Send Connection"}
          </button>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   CONNECTIONS
========================================================= */

function Connections({
  setPage,
  setSelected,
  notify,
  unreadNotifications,
  onNotificationClick
}) {
  const [connections, setConnections] =
    useState([]);

  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadConnections = async () => {
    try {
      setLoading(true);

      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUserId =
        authData?.user?.id;

      if (!currentUserId) return;

      const {
        data: matchData,
        error: matchError
      } =
        await supabase
          .from("matches")
          .select(
            "id, user_one_id, user_two_id, created_at"
          )
          .or(
            `user_one_id.eq.${currentUserId},user_two_id.eq.${currentUserId}`
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (matchError) {
        throw matchError;
      }

      const normalized =
        (matchData || [])
          .map((match) =>
            normalizeMatch(
              match,
              currentUserId
            )
          )
          .filter(Boolean);

      const otherIds =
        normalized.map(
          (x) => x.otherUserId
        );

      let profiles = [];

      if (otherIds.length) {
        const {
          data: profileData,
          error: profileError
        } =
          await supabase
            .from("profiles")
            .select(`
              id,
              first_name,
              last_name,
              display_name,
              location,
              dob,
              profile_photo_path
            `)
            .in(
              "id",
              otherIds
            );

        if (profileError) {
          throw profileError;
        }

        profiles =
          profileData || [];
      }

      const profileMap = {};

      profiles.forEach(
        (profile) => {
          profileMap[
            profile.id
          ] = mapDatabaseProfile(
            profile
          );
        }
      );

      setConnections(
        normalized
          .map((match) => ({
            ...match,
            person:
              profileMap[
                match.otherUserId
              ]
          }))
          .filter(
            (match) => match.person
          )
      );

      /* -----------------------------------------
         INCOMING LIKES
      ----------------------------------------- */

      const {
        data: incoming,
        error: incomingError
      } =
        await supabase
          .from("likes")
          .select(
            "id, user_id, liked_user_id, created_at"
          )
          .eq(
            "liked_user_id",
            currentUserId
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (incomingError) {
        console.error(
          "Incoming likes error:",
          incomingError
        );
        setRequests([]);
        return;
      }

      const incomingIds =
        (incoming || [])
          .map(
            (like) =>
              like.user_id
          )
          .filter(
            (id) =>
              !otherIds.includes(id)
          );

      if (incomingIds.length) {
        const {
          data: incomingProfiles
        } =
          await supabase
            .from("profiles")
            .select(`
              id,
              first_name,
              last_name,
              display_name,
              location,
              dob,
              profile_photo_path
            `)
            .in(
              "id",
              incomingIds
            );

        const requestProfiles =
          incomingProfiles || [];

        setRequests(
          requestProfiles.map(
            mapDatabaseProfile
          )
        );

      } else {
        setRequests([]);
      }

    } catch (err) {
      console.error(
        "Connections loading error:",
        err
      );

      notify(
        err?.message ||
        "Unable to load connections."
      );

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConnections();
  }, []);

  return (
    <div className="screen">

      <Header
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          onNotificationClick
        }
      />

      <main className="content">

        <div className="page-title">

          <p className="eyebrow">
            YOUR PEOPLE
          </p>

          <h2>
            Connections
          </h2>

          <p>
            People who chose to connect
            with you.
          </p>

        </div>

        <div className="connection-hero">

          <div className="hero-icon">
            <Heart fill="currentColor" />
          </div>

          <div>

            <strong>
              Mutual connection
            </strong>

            <span>
              When you both choose Connect,
              a conversation opens.
            </span>

          </div>

        </div>

        {loading && (
          <p
            style={{
              color: "#6b7280",
              fontSize: "13px"
            }}
          >
            Loading connections...
          </p>
        )}

        <div className="section-title">

          <h3>
            Confirmed
          </h3>

          <span>
            {connections.length}
          </span>

        </div>

        <div className="connection-list">

          {connections.map(
            (match) => (
              <button
                className="connection-row"
                key={match.id}
                onClick={() => {
                  setSelected(
                    match.person
                  );

                  setPage(
                    "chat"
                  );
                }}
              >

                <img
                  src={
                    match.person.image
                  }
                  alt={
                    match.person.name
                  }
                />

                <div>

                  <strong>
                    {match.person.name},{" "}
                    {match.person.age}
                  </strong>

                  <span>

                    <Sparkles
                      size={13}
                    />

                    {match.person.compatibility}%
                    connection

                  </span>

                </div>

                <MessageCircle />

              </button>
            )
          )}

        </div>

        {!loading &&
          connections.length === 0 && (
            <p
              style={{
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              No mutual connections yet.
            </p>
          )}

        <div className="section-title">

          <h3>
            New requests
          </h3>

          <span>
            {requests.length}
          </span>

        </div>

        <div className="connection-list">

          {requests.map(
            (person) => (
              <button
                className="connection-row"
                key={person.databaseId}
                onClick={() => {
                  setSelected(person);
                  setPage("person");
                }}
              >

                <img
                  src={person.image}
                  alt={person.name}
                />

                <div>

                  <strong>
                    {person.name},{" "}
                    {person.age}
                  </strong>

                  <span>
                    Wants to connect with you
                  </span>

                </div>

                <ChevronLeft
                  className="chevron-right"
                />

              </button>
            )
          )}

        </div>

        {!loading &&
          requests.length === 0 && (
            <p
              style={{
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              No new requests.
            </p>
          )}

      </main>

    </div>
  );
}

/* =========================================================
   MESSAGES
========================================================= */

function Messages({
  setPage,
  setSelected,
  unreadNotifications,
  onNotificationClick
}) {
  const [chats, setChats] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const loadChats = async () => {
    try {
      setLoading(true);

      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUserId =
        authData?.user?.id;

      if (!currentUserId) return;

      const {
        data: matches,
        error
      } =
        await supabase
          .from("matches")
          .select(
            "id, user_one_id, user_two_id, created_at"
          )
          .or(
            `user_one_id.eq.${currentUserId},user_two_id.eq.${currentUserId}`
          )
          .order(
            "created_at",
            {
              ascending: false
            }
          );

      if (error) throw error;

      const otherIds =
        (matches || []).map(
          (match) =>
            match.user_one_id ===
            currentUserId
              ? match.user_two_id
              : match.user_one_id
        );

      let profiles = [];

      if (otherIds.length) {
        const {
          data
        } =
          await supabase
            .from("profiles")
            .select(`
              id,
              first_name,
              last_name,
              display_name,
              location,
              dob,
              profile_photo_path
            `)
            .in(
              "id",
              otherIds
            );

        profiles = data || [];
      }

      const profileMap = {};

      profiles.forEach(
        (profile) => {
          profileMap[
            profile.id
          ] =
            mapDatabaseProfile(
              profile
            );
        }
      );

      const results = [];

      for (
        const match of matches || []
      ) {
        const otherUserId =
          match.user_one_id ===
          currentUserId
            ? match.user_two_id
            : match.user_one_id;

        const person =
          profileMap[
            otherUserId
          ];

        if (!person) continue;

        const {
          data: lastMessages
        } =
          await supabase
            .from("messages")
            .select(
              "content, created_at, sender_id"
            )
            .eq(
              "match_id",
              match.id
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            )
            .limit(1);

        results.push({
          matchId:
            match.id,

          person,

          lastMessage:
            lastMessages?.[0] ||
            null
        });
      }

      setChats(results);

    } catch (err) {
      console.error(
        "Messages loading error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  return (
    <div className="screen">

      <Header
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          onNotificationClick
        }
      />

      <main className="content">

        <div className="page-title">

          <p className="eyebrow">
            YOUR CONVERSATIONS
          </p>

          <h2>
            Messages
          </h2>

        </div>

        <div className="search">

          <Search size={18} />

          <input
            placeholder="Search conversations"
          />

        </div>

        {loading && (
          <p
            style={{
              color: "#6b7280",
              fontSize: "13px"
            }}
          >
            Loading conversations...
          </p>
        )}

        <div className="chat-list">

          {chats.map(
            (chat) => (
              <button
                className="chat-row"
                key={chat.matchId}
                onClick={() => {
                  setSelected(
                    chat.person
                  );

                  setPage(
                    "chat"
                  );
                }}
              >

                <div className="avatar-wrap">

                  <img
                    src={
                      chat.person.image
                    }
                    alt={
                      chat.person.name
                    }
                  />

                </div>

                <div className="chat-copy">

                  <div>

                    <strong>
                      {chat.person.name}
                    </strong>

                    <time>
                      {chat.lastMessage
                        ? new Date(
                            chat.lastMessage.created_at
                          ).toLocaleTimeString(
                            [],
                            {
                              hour: "numeric",
                              minute: "2-digit"
                            }
                          )
                        : ""}
                    </time>

                  </div>

                  <span>
                    {chat.lastMessage
                      ?.content ||
                      "You both chose to connect."}
                  </span>

                </div>

              </button>
            )
          )}

        </div>

        {!loading &&
          chats.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 20px",
                color: "#6b7280"
              }}
            >
              <MessageCircle
                size={32}
              />

              <p>
                No conversations yet.
              </p>
            </div>
          )}

      </main>

    </div>
  );
}

/* =========================================================
   CHAT
========================================================= */

function Chat({
  person,
  setPage
}) {
  const [text, setText] =
    useState("");

  const [msgs, setMsgs] =
    useState([]);

  const [matchId, setMatchId] =
    useState(null);

  const [currentUserId, setCurrentUserId] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const bottomRef = useRef(null);

  const loadChat = async () => {
    try {
      setLoading(true);

      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUser =
        authData?.user;

      if (!currentUser || !person?.databaseId) {
        return;
      }

      setCurrentUserId(
        currentUser.id
      );

      const {
        data: match,
        error: matchError
      } =
        await supabase
          .from("matches")
          .select(
            "id, user_one_id, user_two_id"
          )
          .or(
            `and(user_one_id.eq.${currentUser.id},user_two_id.eq.${person.databaseId}),and(user_one_id.eq.${person.databaseId},user_two_id.eq.${currentUser.id})`
          )
          .maybeSingle();

      if (matchError) {
        throw matchError;
      }

      if (!match) {
        throw new Error(
          "This conversation is not available yet."
        );
      }

      setMatchId(match.id);

      const {
        data: messages,
        error: messageError
      } =
        await supabase
          .from("messages")
          .select(
            "id, match_id, sender_id, content, created_at"
          )
          .eq(
            "match_id",
            match.id
          )
          .order(
            "created_at",
            {
              ascending: true
            }
          );

      if (messageError) {
        throw messageError;
      }

      setMsgs(
        messages || []
      );

    } catch (err) {
      console.error(
        "Chat loading error:",
        err
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
  }, [person]);

  useEffect(() => {
    if (!matchId) return;

    const channel =
      supabase
        .channel(
          `chat-${matchId}`
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter:
              `match_id=eq.${matchId}`
          },
          (payload) => {
            const newMessage =
              payload.new;

            setMsgs(
              (current) => {
                if (
                  current.some(
                    (message) =>
                      message.id ===
                      newMessage.id
                  )
                ) {
                  return current;
                }

                return [
                  ...current,
                  newMessage
                ];
              }
            );
          }
        )
        .subscribe();

    return () => {
      supabase.removeChannel(
        channel
      );
    };
  }, [matchId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [msgs]);

  const send = async () => {
    const cleanText =
      text.trim();

    if (
      !cleanText ||
      !matchId ||
      !currentUserId ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);

      const {
        data,
        error
      } =
        await supabase
          .from("messages")
          .insert({
            match_id:
              matchId,

            sender_id:
              currentUserId,

            message:
              cleanText
          })
          .select()
          .single();

      if (error) {
        throw error;
      }

      setMsgs(
        (current) => {
          if (
            current.some(
              (message) =>
                message.id ===
                data.id
            )
          ) {
            return current;
          }

          return [
            ...current,
            data
          ];
        }
      );

      setText("");

    } catch (err) {
      console.error(
        "Message sending error:",
        err
      );

      alert(
        err?.message ||
        "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  };

  if (!person) {
    return null;
  }

  return (
    <div className="screen">

      <Header
        title={
          person.name
        }
        back
        onBack={() =>
          setPage(
            "messages"
          )
        }
        right={
          <span className="chat-status">
            <span />
            Online
          </span>
        }
      />

      <main className="chat-screen">

        <div className="chat-profile">

          <img
            src={person.image}
            alt={person.name}
          />

          <strong>
            {person.name}
          </strong>

          <span>
            {person.city}
          </span>

          <b>

            <Sparkles size={13} />

            {person.compatibility}%
            connection

          </b>

        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "30px",
              color: "#6b7280"
            }}
          >
            Loading messages...
          </div>
        ) : (
          <div className="messages">

            {msgs.map(
              (message) => (
                <div
                  className={
                    "bubble " +
                    (
                      message.sender_id ===
                      currentUserId
                        ? "mine"
                        : "theirs"
                    )
                  }
                  key={message.id}
                >
                  {message.content}
                </div>
              )
            )}

            <div
              ref={bottomRef}
            />

          </div>
        )}

        <div className="starter">

          <span>
            Try a conversation starter
          </span>

          <button
            onClick={() =>
              setText(
                "What's one place in Liberia you'd love to visit? 🇱🇷"
              )
            }
          >
            What's one place in Liberia
            you'd love to visit? 🇱🇷
          </button>

        </div>

        <div className="composer">

          <input
            value={text}
            onChange={(e) =>
              setText(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key ===
                "Enter"
              ) {
                send();
              }
            }}
            placeholder="Write a message..."
          />

          <button
            onClick={send}
            disabled={sending}
          >
            <Send size={18} />
          </button>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function Profile({
  userProfile,
  setUserProfile,
  onLogout,
  notify,
  unreadNotifications,
  onNotificationClick
}) {
  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState({
      firstName:
        userProfile?.firstName || "",

      lastName:
        userProfile?.lastName || "",

      displayName:
        userProfile?.displayName || "",

      location:
        userProfile?.location || "",

      dob:
        userProfile?.dob || "",

      phone:
        userProfile?.phone || "",

      profilePhoto:
        userProfile?.profilePhoto || ""
    });

  useEffect(() => {
    setForm({
      firstName:
        userProfile?.firstName || "",

      lastName:
        userProfile?.lastName || "",

      displayName:
        userProfile?.displayName || "",

      location:
        userProfile?.location || "",

      dob:
        userProfile?.dob || "",

      phone:
        userProfile?.phone || "",

      profilePhoto:
        userProfile?.profilePhoto || ""
    });
  }, [userProfile]);

  const fullName =
    userProfile?.displayName ||
    `${userProfile?.firstName || ""} ${
      userProfile?.lastName || ""
    }`.trim() ||
    "Your Profile";

  const age =
    userProfile?.age ||
    calculateAge(
      userProfile?.dob
    );

  const location =
    userProfile?.location ||
    "Location not added";

  const profileImage =
    userProfile?.profilePhoto ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=85";

  const updateField = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value
      })
    );
  };

  const openEdit = () => {
    setError("");

    setForm({
      firstName:
        userProfile?.firstName || "",

      lastName:
        userProfile?.lastName || "",

      displayName:
        userProfile?.displayName || "",

      location:
        userProfile?.location || "",

      dob:
        userProfile?.dob || "",

      phone:
        userProfile?.phone || "",

      profilePhoto:
        userProfile?.profilePhoto || ""
    });

    setEditing(true);
  };

  const handleProfilePhoto =
    async (file) => {
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError(
          "Please select an image file."
        );
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setError(
          "Please select an image smaller than 10MB."
        );
        return;
      }

      try {
        const dataUrl =
          await fileToDataUrl(
            file
          );

        setForm(
          (current) => ({
            ...current,
            profilePhoto:
              dataUrl
          })
        );

        setError("");

      } catch {
        setError(
          "Unable to prepare the new profile photo."
        );
      }
    };

  const saveProfile =
    async () => {
      setError("");

      if (!form.firstName.trim()) {
        setError(
          "First name is required."
        );
        return;
      }

      if (!form.lastName.trim()) {
        setError(
          "Last name is required."
        );
        return;
      }

      if (!form.displayName.trim()) {
        setError(
          "Display name is required."
        );
        return;
      }

      if (!form.location.trim()) {
        setError(
          "Location is required."
        );
        return;
      }

      if (!form.dob) {
        setError(
          "Date of birth is required."
        );
        return;
      }

      const newAge =
        calculateAge(
          form.dob
        );

      if (newAge < 18) {
        setError(
          "You must be at least 18 years old."
        );
        return;
      }

      try {
        setSaving(true);

        const {
          data: authData,
          error: authError
        } =
          await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        const userId =
          authData?.user?.id;

        if (!userId) {
          throw new Error(
            "Your account could not be identified."
          );
        }

        const {
          data,
          error: saveError
        } =
          await supabase
            .from("profiles")
            .upsert(
              {
                id: userId,

                first_name:
                  form.firstName.trim(),

                last_name:
                  form.lastName.trim(),

                display_name:
                  form.displayName.trim(),

                location:
                  form.location.trim(),

                dob:
                  form.dob,

                phone:
                  form.phone.trim() ||
                  null,

                profile_photo_path:
                  form.profilePhoto ||
                  null
              },
              {
                onConflict: "id"
              }
            )
            .select(`
              id,
              first_name,
              last_name,
              display_name,
              location,
              dob,
              phone,
              profile_photo_path,
              live_selfie_path,
              created_at
            `)
            .single();

        if (saveError) {
          throw saveError;
        }

        const updatedProfile = {
          id: userId,

          firstName:
            data.first_name,

          lastName:
            data.last_name,

          displayName:
            data.display_name,

          location:
            data.location,

          dob:
            data.dob,

          age:
            calculateAge(
              data.dob
            ),

          phone:
            data.phone || "",

          email:
            userProfile?.email ||
            authData.user.email ||
            "",

          profilePhoto:
            data.profile_photo_path ||
            "",

          liveSelfie:
            data.live_selfie_path ||
            userProfile?.liveSelfie ||
            "",

          createdAt:
            data.created_at
        };

        setUserProfile(
          updatedProfile
        );

        localStorage.setItem(
          "libdate_profile",
          JSON.stringify(
            updatedProfile
          )
        );

        setEditing(false);

        notify(
          "Profile updated successfully ✓"
        );

      } catch (err) {
        console.error(
          "Profile save error:",
          err
        );

        setError(
          err?.message ||
          "Unable to save your profile."
        );

      } finally {
        setSaving(false);
      }
    };

  if (editing) {
    return (
      <div className="screen">

        <Header
          title="Edit Profile"
          back
          onBack={() =>
            setEditing(false)
          }
        />

        <main className="content profile-page">

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "22px"
            }}
          >

            <div
              style={{
                position: "relative"
              }}
            >

              <img
                src={
                  form.profilePhoto ||
                  profileImage
                }
                alt="Profile"
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover"
                }}
              />

              <label
                className="edit-photo"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >

                <Camera size={16} />

                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) =>
                    handleProfilePhoto(
                      e.target.files?.[0]
                    )
                  }
                />

              </label>

            </div>

          </div>

          <div
            className="signup-form"
            style={{
              width: "100%"
            }}
          >

            <div className="two-inputs">

              <div>

                <label>
                  First name
                </label>

                <div className="input-wrap">

                  <User size={18} />

                  <input
                    value={
                      form.firstName
                    }
                    onChange={(e) =>
                      updateField(
                        "firstName",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

              <div>

                <label>
                  Last name
                </label>

                <div className="input-wrap">

                  <User size={18} />

                  <input
                    value={
                      form.lastName
                    }
                    onChange={(e) =>
                      updateField(
                        "lastName",
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>

            <label>
              Display name
            </label>

            <div className="input-wrap">

              <CircleUserRound
                size={18}
              />

              <input
                value={
                  form.displayName
                }
                onChange={(e) =>
                  updateField(
                    "displayName",
                    e.target.value
                  )
                }
              />

            </div>

            <label>
              Location
            </label>

            <div className="input-wrap">

              <MapPinned
                size={18}
              />

              <input
                value={
                  form.location
                }
                onChange={(e) =>
                  updateField(
                    "location",
                    e.target.value
                  )
                }
              />

            </div>

            <label>
              Date of birth
            </label>

            <div className="input-wrap">

              <CalendarDays
                size={18}
              />

              <input
                type="date"
                value={
                  form.dob
                }
                onChange={(e) =>
                  updateField(
                    "dob",
                    e.target.value
                  )
                }
              />

            </div>

            <label>
              Phone number
            </label>

            <div className="input-wrap">

              <MessageCircle
                size={18}
              />

              <input
                type="tel"
                value={
                  form.phone
                }
                onChange={(e) =>
                  updateField(
                    "phone",
                    e.target.value
                  )
                }
              />

            </div>

            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <button
              className="primary"
              onClick={saveProfile}
              disabled={saving}
            >
              <Check size={18} />

              {saving
                ? "Saving..."
                : "Save changes"}
            </button>

            <button
              className="secondary-auth"
              onClick={() =>
                setEditing(false)
              }
            >
              Cancel
            </button>

          </div>

        </main>

      </div>
    );
  }

  return (
    <div className="screen">

      <Header
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          onNotificationClick
        }
      />

      <main className="content profile-page">

        <div className="profile-cover">

          <FlagWatermark />

          <img
            src={profileImage}
            alt={fullName}
          />

          <button
            className="edit-photo"
            onClick={openEdit}
          >
            <Camera size={16} />
          </button>

        </div>

        <div className="own-profile">

          <h2>

            {fullName}

            {age > 0 && (
              <>
                , {age}
              </>
            )}

            <ShieldCheck size={18} />

          </h2>

          <div className="location">

            <MapPin size={14} />

            {location}

          </div>

          <div className="verified-line">

            <ShieldCheck size={14} />

            Photo submitted

          </div>

          {userProfile?.email && (
            <div
              style={{
                marginTop: "7px",
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              <Mail
                size={13}
                style={{
                  verticalAlign:
                    "middle",
                  marginRight:
                    "5px"
                }}
              />

              {userProfile.email}

            </div>
          )}

        </div>

        <div className="profile-menu">

          <button
            onClick={openEdit}
          >
            <CircleUserRound
              size={19}
            />

            <span>
              Profile details
            </span>

            <ChevronLeft
              className="chevron-right"
            />
          </button>

          <button
            onClick={() =>
              notify(
                "Dating preferences are coming soon."
              )
            }
          >
            <Heart size={19} />

            <span>
              Dating preferences
            </span>

            <ChevronLeft
              className="chevron-right"
            />
          </button>

          <button
            onClick={() =>
              notify(
                "Privacy & safety settings are coming soon."
              )
            }
          >
            <Lock size={19} />

            <span>
              Privacy & safety
            </span>

            <ChevronLeft
              className="chevron-right"
            />
          </button>

          <button
            onClick={() =>
              notify(
                "Location & discovery settings are coming soon."
              )
            }
          >
            <Globe2 size={19} />

            <span>
              Location & discovery
            </span>

            <ChevronLeft
              className="chevron-right"
            />
          </button>

        </div>

        <button
          className="outline"
          onClick={openEdit}
        >
          Edit profile
        </button>

        <button
          className="outline"
          onClick={onLogout}
          style={{
            marginTop: "10px",
            color: "#b91c1c",
            borderColor:
              "rgba(185,28,28,.25)"
          }}
        >
          Log out
        </button>

      </main>

    </div>
  );
}

/* =========================================================
   TOAST
========================================================= */

function Toast({
  message
}) {
  return message ? (
    <div className="toast">

      <Check size={17} />

      {message}

    </div>
  ) : null;
}

/* =========================================================
   MAIN APP
========================================================= */

function App() {
  const [authChecking, setAuthChecking] =
    useState(true);

  const [authenticated, setAuthenticated] =
    useState(false);

  const [userProfile, setUserProfile] =
    useState(null);

  const [page, setPage] =
    useState("discover");

  const [selected, setSelected] =
    useState(null);

  const [toast, setToast] =
    useState("");

  /* =======================================================
     NOTIFICATION STATE
  ======================================================= */

  const [
    notifications,
    setNotifications
  ] = useState([]);

  const [
    notificationLoading,
    setNotificationLoading
  ] = useState(false);

  const [
    notificationsOpen,
    setNotificationsOpen
  ] = useState(false);

  const notify = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  /* =======================================================
     LOAD NOTIFICATIONS
  ======================================================= */

  const loadNotifications =
    async () => {
      try {
        setNotificationLoading(true);

        const {
          data: authData
        } =
          await supabase.auth.getUser();

        const currentUserId =
          authData?.user?.id;

        if (!currentUserId) {
          setNotifications([]);
          return;
        }

        const {
          data,
          error
        } =
          await supabase
            .from("notifications")
            .select(`
              id,
              user_id,
              sender_id,
              type,
              message,
              read,
              created_at
            `)
            .eq(
              "user_id",
              currentUserId
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            )
            .limit(50);

        if (error) {
          console.error(
            "Notifications loading error:",
            error
          );

          /*
            We don't crash the application if the
            notifications table has not been created yet.
          */
          return;
        }

        setNotifications(
          data || []
        );

      } catch (err) {
        console.error(
          "Unexpected notifications loading error:",
          err
        );
      } finally {
        setNotificationLoading(false);
      }
    };

  /* =======================================================
     MARK ONE NOTIFICATION AS READ
  ======================================================= */

  const markNotificationRead =
    async (notificationId) => {
      if (!notificationId) return;

      setNotifications(
        (current) =>
          current.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    read: true
                  }
                : notification
          )
      );

      const {
        error
      } =
        await supabase
          .from("notifications")
          .update({
            read: true
          })
          .eq(
            "id",
            notificationId
          );

      if (error) {
        console.error(
          "Mark notification read error:",
          error
        );

        loadNotifications();
      }
    };

  /* =======================================================
     MARK ALL NOTIFICATIONS AS READ
  ======================================================= */

  const markAllNotificationsRead =
    async () => {
      const {
        data: authData
      } =
        await supabase.auth.getUser();

      const currentUserId =
        authData?.user?.id;

      if (!currentUserId) return;

      setNotifications(
        (current) =>
          current.map(
            (notification) => ({
              ...notification,
              read: true
            })
          )
      );

      const {
        error
      } =
        await supabase
          .from("notifications")
          .update({
            read: true
          })
          .eq(
            "user_id",
            currentUserId
          )
          .eq(
            "read",
            false
          );

      if (error) {
        console.error(
          "Mark all notifications read error:",
          error
        );

        loadNotifications();
      }
    };

  /* =======================================================
     OPEN NOTIFICATIONS
  ======================================================= */

  const openNotifications =
    async () => {
      setNotificationsOpen(
        (current) => !current
      );

      if (!notificationsOpen) {
        await loadNotifications();
      }
    };

  /* =======================================================
     CURRENT USER PROFILE
  ======================================================= */

  const buildCurrentProfile =
    async (user) => {
      if (!user) return null;

      const metadata =
        user.user_metadata || {};

      const {
        data,
        error
      } =
        await supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            display_name,
            location,
            dob,
            phone,
            profile_photo_path,
            live_selfie_path,
            created_at
          `)
          .eq(
            "id",
            user.id
          )
          .maybeSingle();

      if (error) {
        console.error(
          "Unable to load current profile:",
          error
        );
      }

      const databaseProfile =
        data || null;

      const profile = {
        id: user.id,

        firstName:
          databaseProfile?.first_name ||
          metadata.first_name ||
          "",

        lastName:
          databaseProfile?.last_name ||
          metadata.last_name ||
          "",

        displayName:
          databaseProfile?.display_name ||
          metadata.display_name ||
          "",

        location:
          databaseProfile?.location ||
          metadata.location ||
          "",

        dob:
          databaseProfile?.dob ||
          metadata.dob ||
          "",

        age:
          calculateAge(
            databaseProfile?.dob ||
            metadata.dob ||
            ""
          ),

        phone:
          databaseProfile?.phone ||
          "",

        email:
          user.email || "",

        profilePhoto:
          databaseProfile?.profile_photo_path ||
          "",

        liveSelfie:
          databaseProfile?.live_selfie_path ||
          "",

        createdAt:
          databaseProfile?.created_at ||
          new Date().toISOString()
      };

      if (!databaseProfile) {
        const {
          error: createError
        } =
          await supabase
            .from("profiles")
            .upsert(
              {
                id: user.id,

                first_name:
                  profile.firstName,

                last_name:
                  profile.lastName,

                display_name:
                  profile.displayName,

                location:
                  profile.location,

                dob:
                  profile.dob ||
                  null,

                phone:
                  profile.phone ||
                  null,

                profile_photo_path:
                  profile.profilePhoto ||
                  null,

                live_selfie_path:
                  profile.liveSelfie ||
                  null
              },
              {
                onConflict: "id"
              }
            );

        if (createError) {
          console.error(
            "Profile creation error:",
            createError
          );
        }
      }

      localStorage.setItem(
        "libdate_profile",
        JSON.stringify(profile)
      );

      return profile;
    };

  /* =======================================================
     AUTH INITIALIZATION
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const initializeAuth =
      async () => {
        try {
          const {
            data,
            error
          } =
            await supabase.auth.getUser();

          if (!mounted) return;

          if (
            error ||
            !data?.user
          ) {
            setAuthenticated(false);
            setUserProfile(null);
            return;
          }

          const profile =
            await buildCurrentProfile(
              data.user
            );

          if (!mounted) return;

          setUserProfile(profile);
          setAuthenticated(true);

          /*
            NEW:
            Load notifications after login.
          */
          await loadNotifications();

        } catch (err) {
          console.error(
            "Authentication initialization error:",
            err
          );

          if (mounted) {
            setAuthenticated(false);
            setUserProfile(null);
          }

        } finally {
          if (mounted) {
            setAuthChecking(false);
          }
        }
      };

    initializeAuth();

    const {
      data: authListener
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {
          if (!mounted) return;

          if (
            event ===
            "SIGNED_OUT"
          ) {
            setAuthenticated(false);
            setUserProfile(null);
            setNotifications([]);
            setNotificationsOpen(false);
            setPage("discover");
            setSelected(null);
            return;
          }

          if (session?.user) {
            setAuthenticated(true);

            if (
              event === "SIGNED_IN" ||
              event === "INITIAL_SESSION" ||
              event === "USER_UPDATED"
            ) {
              const profile =
                await buildCurrentProfile(
                  session.user
                );

              if (!mounted) return;

              setUserProfile(
                profile
              );

              await loadNotifications();
            }
          }
        }
      );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /* =======================================================
     REAL-TIME NOTIFICATIONS
  ======================================================= */

  useEffect(() => {
    if (!authenticated) return;

    let channel = null;

    const setupNotificationRealtime =
      async () => {
        const {
          data: authData
        } =
          await supabase.auth.getUser();

        const currentUserId =
          authData?.user?.id;

        if (!currentUserId) return;

        channel =
          supabase
            .channel(
              `notifications-${currentUserId}`
            )
            .on(
              "postgres_changes",
              {
                event: "INSERT",
                schema: "public",
                table: "notifications",
                filter:
                  `user_id=eq.${currentUserId}`
              },
              (payload) => {
                const newNotification =
                  payload.new;

                setNotifications(
                  (current) => {
                    if (
                      current.some(
                        (notification) =>
                          notification.id ===
                          newNotification.id
                      )
                    ) {
                      return current;
                    }

                    return [
                      newNotification,
                      ...current
                    ].slice(0, 50);
                  }
                );

                /*
                  Show a toast immediately when
                  a new notification arrives.
                */
                if (
                  newNotification?.message
                ) {
                  notify(
                    newNotification.message
                  );
                }
              }
            )
            .subscribe();
      };

    setupNotificationRealtime();

    return () => {
      if (channel) {
        supabase.removeChannel(
          channel
        );
      }
    };
  }, [authenticated]);

  const handleAuthenticated =
    (profile) => {
      setUserProfile(profile);
      setAuthenticated(true);
      setPage("discover");

      localStorage.setItem(
        "libdate_authenticated",
        "true"
      );

      loadNotifications();
    };

  const handleLogout =
    async () => {
      try {
        const {
          error
        } =
          await supabase.auth.signOut();

        if (error) {
          throw error;
        }

      } catch (err) {
        console.error(
          "Logout error:",
          err
        );
      } finally {
        setAuthenticated(false);
        setUserProfile(null);
        setNotifications([]);
        setNotificationsOpen(false);
        setSelected(null);

        localStorage.removeItem(
          "libdate_authenticated"
        );

        localStorage.removeItem(
          "libdate_profile"
        );
      }
    };

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  if (authChecking) {
    return (
      <div
        className="auth-screen"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        <FlagWatermark />

        <div
          className="auth-card"
          style={{
            textAlign: "center"
          }}
        >

          <div className="auth-logo">
            <Logo />
          </div>

          <p>
            Checking your LIBDate session...
          </p>

        </div>

      </div>
    );
  }

  if (!authenticated) {
    return (
      <AuthScreen
        onAuthenticated={
          handleAuthenticated
        }
      />
    );
  }

  const body =
    page === "discover" ? (
      <Discover
        setPage={setPage}
        setSelected={setSelected}
        notify={notify}
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          openNotifications
        }
      />
    ) : page === "person" ? (
      <PersonPage
        person={selected}
        setPage={setPage}
        notify={notify}
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          openNotifications
        }
      />
    ) : page === "status" ? (
      <StatusPage
        person={selected}
        setPage={setPage}
        setSelected={setSelected}
      />
    ) : page === "connections" ? (
      <Connections
        setPage={setPage}
        setSelected={setSelected}
        notify={notify}
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          openNotifications
        }
      />
    ) : page === "messages" ? (
      <Messages
        setPage={setPage}
        setSelected={setSelected}
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          openNotifications
        }
      />
    ) : page === "chat" ? (
      <Chat
        person={selected}
        setPage={setPage}
      />
    ) : (
      <Profile
        userProfile={
          userProfile
        }
        setUserProfile={
          setUserProfile
        }
        onLogout={
          handleLogout
        }
        notify={
          notify
        }
        unreadNotifications={
          unreadNotifications
        }
        onNotificationClick={
          openNotifications
        }
      />
    );

  return (
    <div className="app-shell">

      {body}

      {![ 
        "person",
        "status",
        "chat"
      ].includes(page) && (
        <BottomNav
          page={page}
          setPage={setPage}
        />
      )}

      <Toast
        message={toast}
      />

      {notificationsOpen && (
        <NotificationPanel
          notifications={
            notifications
          }
          loading={
            notificationLoading
          }
          onClose={() =>
            setNotificationsOpen(
              false
            )
          }
          onMarkRead={
            markNotificationRead
          }
          onMarkAllRead={
            markAllNotificationsRead
          }
        />
      )}

    </div>
  );
}

/* =========================================================
   START REACT
========================================================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);