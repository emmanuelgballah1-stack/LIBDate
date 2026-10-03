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

/* =========================
   SAMPLE PEOPLE
========================= */

const people = [
  {
    id: 1,
    name: "Sarah K.",
    age: 24,
    city: "Sinkor, Monrovia",
    distance: "2 km away",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
    bio: "I love music, good conversations, family and discovering new places.",
    interests: ["Music", "Travel", "Movies"],
    intention: "Serious relationship",
    compatibility: 92,
    status: "Enjoying a beautiful day in Monrovia 🌴",
    photos: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85"
    ]
  },
  {
    id: 2,
    name: "Martha T.",
    age: 26,
    city: "Paynesville",
    distance: "5 km away",
    image:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85",
    bio: "Easy-going, ambitious and always ready for a good laugh.",
    interests: ["Food", "Business", "Beach"],
    intention: "Dating",
    compatibility: 86,
    status: "Good food, good music, good energy ✨",
    photos: [
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=900&q=85"
    ]
  },
  {
    id: 3,
    name: "Jessica P.",
    age: 23,
    city: "Congo Town, Monrovia",
    distance: "7 km away",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85",
    bio: "Creative soul. I enjoy art, books, music and meaningful conversations.",
    interests: ["Art", "Books", "Music"],
    intention: "Serious relationship",
    compatibility: 81,
    status: "Working on something creative today 🎨",
    photos: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=85"
    ]
  },
  {
    id: 4,
    name: "Rebecca W.",
    age: 27,
    city: "Buchanan",
    distance: "124 km away",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85",
    bio: "Family-oriented and curious about the world.",
    interests: ["Travel", "Family", "Cooking"],
    intention: "Marriage",
    compatibility: 78,
    status: "Family time ❤️",
    photos: [
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85"
    ]
  }
];

/* =========================
   HELPERS
========================= */

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
  const cleanedEmail = email.replace(/\\/g, "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanedEmail);
}

/* =========================
   FILE TO DATA URL
   Used so photos survive refresh.
========================= */

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error("Unable to save the profile photo.")
      );
    };

    reader.readAsDataURL(file);
  });
}

/* =========================
   AUTH SCREEN
========================= */

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

/* =========================
   LOGIN
========================= */

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
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const { data, error: authError } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });

      if (authError) {
        throw authError;
      }

      const savedProfile =
        localStorage.getItem("libdate_profile");

      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const savedEmail = (profile.email || "")
          .replace(/\\/g, "")
          .trim()
          .toLowerCase();

        if (
          savedEmail &&
          savedEmail !== normalizedEmail
        ) {
          setError(
            "The saved profile does not match this email address."
          );
          return;
        }

        onLogin(profile);
        return;
      }

      const metadata =
        data.user?.user_metadata || {};

      onLogin({
        id: data.user?.id || "",
        firstName: metadata.first_name || "",
        lastName: metadata.last_name || "",
        displayName: metadata.display_name || "",
        location: metadata.location || "",
        dob: metadata.dob || "",
        email: data.user?.email || normalizedEmail,
        profilePhoto: ""
      });
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
          {loading ? "Logging in..." : "Log In"}
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

/* =========================
   SIGNUP FLOW
========================= */

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

      const age = calculateAge(form.dob);

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

    if (
      file.size >
      10 * 1024 * 1024
    ) {
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

  /*
    This runs after the live selfie has been captured.

    We convert the uploaded photo into a permanent
    data URL because blob URLs disappear after refresh.
  */

  const finishSignup = async (liveSelfie) => {
    try {
      setError("");

      const normalizedEmail = form.email
        .replace(/\\/g, "")
        .trim()
        .toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        setError("Please enter a valid email address.");
        return;
      }

      const profilePhotoData =
        await fileToDataUrl(
          form.profilePhoto
        );

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password: form.password,
          options: {
            data: {
              first_name: form.firstName.trim(),
              last_name: form.lastName.trim(),
              display_name: form.displayName.trim(),
              location: form.location.trim(),
              dob: form.dob
            }
          }
        });

      if (signupError) {
        throw signupError;
      }

      if (!data.user) {
        throw new Error("Unable to create your account.");
      }

      const profile = {
        id: data.user.id,
        firstName: form.firstName,
        lastName: form.lastName,
        displayName: form.displayName,
        location: form.location,
        dob: form.dob,
        age: calculateAge(form.dob),
        email: normalizedEmail,

        profilePhoto:
          profilePhotoData ||
          form.profilePhotoPreview,

        liveSelfie: liveSelfie || "",

        createdAt:
          new Date().toISOString()
      };

      localStorage.setItem(
        "libdate_profile",
        JSON.stringify(profile)
      );

      if (data.session) {
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

/* =========================
   PERSONAL INFORMATION
========================= */

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

/* =========================
   ACCOUNT SECURITY
========================= */

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

/* =========================
   PROFILE PHOTO
========================= */

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

/* =========================
   LIVE CAMERA VERIFICATION
========================= */

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
        .forEach((track) => {
          track.stop();
        });

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
          "Your camera is being used by another application. Close other apps using the camera and try again."
        );

      } else {

        setError(
          err?.message ||
          "Unable to start the camera. Please try again."
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
        "Camera is still starting. Please wait a moment and try again."
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

    setCameraState(
      "captured"
    );

    setError("");
  };

  const retake = async () => {

    setSelfie("");
    setError("");

    await startCamera();
  };

  const verify = async () => {

    setVerifying(true);
    setError("");

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 1500)
    );

    setVerifying(false);

    /*
      IMPORTANT:
      We pass the captured selfie back
      to SignupFlow so it can be saved.
    */

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
          your face is clearly visible and
          look directly at the camera.
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

      {cameraState ===
        "ready" && (
        <button
          className="primary"
          onClick={takeSelfie}
        >
          <Camera size={18} />
          Take live selfie
        </button>
      )}

      {cameraState ===
        "captured" && (
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

      <p className="verification-footnote">
        Your live selfie should show your
        actual face. The production version
        will use secure liveness and
        face-match verification before
        approval.
      </p>

    </div>
  );
}

/* =========================
   BOTTOM NAVIGATION
========================= */

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

/* =========================
   HEADER
========================= */

function Header({
  title,
  back,
  onBack,
  right
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

          <button className="icon-btn">
            <Bell />
          </button>

          <button className="icon-btn">
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

/* =========================
   STATUS / PROFILE VIEWER
========================= */

function StatusPage({
  person,
  setPage,
  setSelected
}) {
  if (!person) {
    return null;
  }

  const photos =
    person.photos?.length
      ? person.photos
      : [person.image];

  const statusImage =
    photos[0] || person.image;

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
            overflow: "hidden",
            background: "#111"
          }}
        >
          <img
            src={statusImage}
            alt={`${person.name} status`}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block"
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
            onClick={() => setPage("discover")}
            aria-label="Back to discover"
            style={{
              position: "absolute",
              left: "16px",
              top: "16px",
              zIndex: 3,
              width: "42px",
              height: "42px",
              border: 0,
              borderRadius: "50%",
              background: "rgba(0,0,0,.42)",
              color: "#fff",
              fontSize: "26px",
              lineHeight: 1,
              cursor: "pointer"
            }}
          >
            ‹
          </button>

          <div
            style={{
              position: "absolute",
              left: "18px",
              right: "18px",
              top: "18px",
              zIndex: 2,
              paddingLeft: "52px",
              paddingRight: "6px"
            }}
          >
            <div
              style={{
                height: "3px",
                width: "100%",
                background: "rgba(255,255,255,.35)",
                borderRadius: "999px",
                overflow: "hidden"
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: "#fff",
                  borderRadius: "999px"
                }}
              />
            </div>
          </div>

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
              textAlign: "left",
              cursor: "pointer"
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
                border: "2px solid #fff",
                flexShrink: 0
              }}
            />

            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "16px",
                  lineHeight: 1.2
                }}
              >
                {person.name}, {person.age}
              </strong>
              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  opacity: .86,
                  marginTop: "3px"
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
                opacity: .78,
                marginBottom: "8px"
              }}
            >
              Recent status
            </span>

            <strong
              style={{
                display: "block",
                fontSize: "21px",
                lineHeight: 1.35,
                textShadow: "0 2px 12px rgba(0,0,0,.4)"
              }}
            >
              {person.status || "No status added yet."}
            </strong>

            <button
              type="button"
              onClick={() => {
                setSelected(person);
                setPage("person");
              }}
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                borderRadius: "999px",
                border: "1px solid rgba(255,255,255,.55)",
                background: "rgba(255,255,255,.14)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                backdropFilter: "blur(8px)"
              }}
            >
              View {person.name}'s profile
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================
   PERSON CARD
========================= */

function PersonCard({
  person,
  liked,
  passed,
  onConnect,
  onPass,
  onOpen,
  onStatusOpen
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
          aria-label={`View ${person.name}'s status and profile`}
          style={{
            width: "42px",
            height: "42px",
            padding: "2px",
            borderRadius: "50%",
            border: "2px solid #fff",
            background:
              "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,.22)"
          }}
        >
          <img
            src={person.photos?.[0] || person.image}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #fff",
              display: "block"
            }}
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
          {person.interests.map((x) => (
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
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={`round pass ${
            passed ? "selected" : ""
          }`}
          onClick={onPass}
          aria-label={`Dislike ${person.name}`}
        >
          <X />
        </button>

        <button
          className={`round connect ${
            liked ? "selected" : ""
          }`}
          onClick={onConnect}
          aria-label={`Like ${person.name}`}
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
/* =========================
   DISCOVER
========================= */

function Discover({
  setPage,
  setSelected,
  notify
}) {
  const [likes, setLikes] = useState({});
  const [passes, setPasses] = useState({});
  

  const handleLike = (person) => {
    setLikes((current) => ({
      ...current,
      [person.id]: true
    }));

    // The person stays in the feed.
    // Real Supabase notification will be added next.
    notify(
      `You liked ${person.name} ❤️`
    );
  };

  const handlePass = (person) => {
    setPasses((current) => ({
      ...current,
      [person.id]: true
    }));

    // The person stays in the feed.
    notify(
      `You passed on ${person.name}`
    );
  };

  return (
    <div className="screen">
      <Header />

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

        <div className="discover-feed">
          {people.map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              liked={!!likes[person.id]}
              passed={!!passes[person.id]}

              onConnect={() =>
                handleLike(person)
              }

              onPass={() =>
                handlePass(person)
              }

              onOpen={() => {
                setSelected(person);
                setPage("person");
              }}
              onStatusOpen={() => {
                setSelected(person);
                setPage("status");
              }}
            />
          ))}
        </div>

        <div className="feed-end">
          <Sparkles size={17} />

          <span>
            You've reached the end of
            the people currently available.
          </span>
        </div>


      </main>
    </div>
  );
} 

/* =========================
   PERSON PAGE
========================= */

function PersonPage({
  person,
  setPage,
  notify
}) {
  const photos =
    person?.photos?.length
      ? person.photos
      : [person?.image];

  return (
    <div className="screen">
      <Header
        title="Profile"
        back
        onBack={() =>
          setPage("discover")
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
            onClick={() => setPage("status")}
            aria-label={`View ${person.name}'s status`}
            style={{
              width: "92px",
              height: "92px",
              padding: "4px",
              border: 0,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
              cursor: "pointer",
              boxSizing: "border-box"
            }}
          >
            <span
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                padding: "3px",
                background: "#fff",
                boxSizing: "border-box"
              }}
            >
              <img
                src={person.photos?.[0] || person.image}
                alt={`${person.name} status`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  display: "block"
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
              {person.name}, {person.age}
            </strong>
            <span
              style={{
                color: "#6b7280",
                fontSize: "13px"
              }}
            >
              Tap the status circle to view recent status
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
            {person.city} ·{" "}
            {person.distance}
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
            {person.interests.map(
              (x) => (
                <span key={x}>
                  {x}
                </span>
              )
            )}
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
            {photos.map((photo, index) => (
              <img
                key={`${photo}-${index}`}
                src={photo}
                alt={`${person.name} photo ${index + 1}`}
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  objectFit: "cover",
                  borderRadius: "10px",
                  display: "block"
                }}
              />
            ))}
          </div>

          <button
            className="primary"
            onClick={() =>
              notify(
                "Connection request sent 💙"
              )
            }
          >
            💙 Send Connection
          </button>
        </div>
      </main>
    </div>
  );
}

/* =========================
   CONNECTIONS
========================= */

function Connections({
  setPage
}) {
  const connections = [
    people[1],
    people[2]
  ];

  return (
    <div className="screen">

      <Header />

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
            (p) => (
              <button
                className="connection-row"
                key={p.id}
                onClick={() =>
                  setPage("messages")
                }
              >

                <img
                  src={p.image}
                  alt={p.name}
                />

                <div>

                  <strong>
                    {p.name},{" "}
                    {p.age}
                  </strong>

                  <span>

                    <Sparkles
                      size={13}
                    />

                    {p.compatibility}%
                    connection

                  </span>

                </div>

                <MessageCircle />

              </button>
            )
          )}

        </div>

        <div className="section-title">

          <h3>
            New requests
          </h3>

          <span>
            2
          </span>

        </div>

        <div className="request-box">

          <div className="mini-avatars">

            <img
              src={people[0].image}
              alt=""
            />

            <img
              src={people[3].image}
              alt=""
            />

          </div>

          <div>

            <strong>
              2 people want to connect
            </strong>

            <span>
              Review their profiles
              and decide.
            </span>

          </div>

          <button className="small-btn">
            View
          </button>

        </div>

      </main>

    </div>
  );
}

/* =========================
   MESSAGES
========================= */

function Messages({
  setPage
}) {
  const chats = [
    people[1],
    people[0],
    people[2]
  ];

  return (
    <div className="screen">

      <Header />

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

        <div className="chat-list">

          {chats.map(
            (p, i) => (
              <button
                className="chat-row"
                key={p.id}
                onClick={() =>
                  setPage("chat")
                }
              >

                <div className="avatar-wrap">

                  <img
                    src={p.image}
                    alt={p.name}
                  />

                  {i === 0 && (
                    <span className="dot" />
                  )}

                </div>

                <div className="chat-copy">

                  <div>

                    <strong>
                      {p.name}
                    </strong>

                    <time>
                      {i === 0
                        ? "2m"
                        : "Yesterday"}
                    </time>

                  </div>

                  <span>
                    {i === 0
                      ? "That sounds good 😊"
                      : "You both chose to connect."}
                  </span>

                </div>

                {i === 0 && (
                  <b className="unread">
                    1
                  </b>
                )}

              </button>
            )
          )}

        </div>

      </main>

    </div>
  );
}

/* =========================
   CHAT
========================= */

function Chat({
  setPage
}) {
  const [text, setText] =
    useState("");

  const [msgs, setMsgs] =
    useState([
      "Hey! 👋",
      "Hi Sarah! Nice to connect with you.",
      "What's your favorite Liberian food?"
    ]);

  const send = () => {

    if (!text.trim()) return;

    setMsgs(
      (m) => [
        ...m,
        text
      ]
    );

    setText("");
  };

  return (
    <div className="screen">

      <Header
        title="Sarah K."
        back
        onBack={() =>
          setPage("messages")
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
            src={people[0].image}
            alt="Sarah K."
          />

          <strong>
            Sarah K.
          </strong>

          <span>
            Sinkor, Monrovia
          </span>

          <b>

            <Sparkles size={13} />

            92% connection

          </b>

        </div>

        <div className="messages">

          {msgs.map(
            (m, i) => (
              <div
                className={
                  "bubble " +
                  (
                    i % 2
                      ? "mine"
                      : "theirs"
                  )
                }
                key={i}
              >
                {m}
              </div>
            )
          )}

        </div>

        <div className="starter">

          <span>
            Try a conversation starter
          </span>

          <button
            onClick={() =>
              setMsgs(
                (m) => [
                  ...m,
                  "What's one place in Liberia you'd love to visit? 🇱🇷"
                ]
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
              setText(e.target.value)
            }
            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {
                send();
              }

            }}
            placeholder="Write a message..."
          />

          <button onClick={send}>
            <Send size={18} />
          </button>

        </div>

      </main>

    </div>
  );
}

/* =========================
   PROFILE
========================= */

function Profile({ userProfile }) {

  const fullName =
    userProfile?.displayName ||
    `${userProfile?.firstName || ""} ${userProfile?.lastName || ""}`.trim() ||
    "Your Profile";

  const age =
    userProfile?.age ||
    calculateAge(userProfile?.dob);

  const location =
    userProfile?.location ||
    "Location not added";

  const profileImage =
    userProfile?.profilePhoto ||
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=85";

  return (
    <div className="screen">

      <Header />

      <main className="content profile-page">

        <div className="profile-cover">

          <FlagWatermark />

          <img
            src={profileImage}
            alt={fullName}
          />

          <button className="edit-photo">
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

        </div>

        <div className="profile-menu">

          {[
            [
              "Profile details",
              CircleUserRound
            ],
            [
              "Dating preferences",
              Heart
            ],
            [
              "Privacy & safety",
              Lock
            ],
            [
              "Location & discovery",
              Globe2
            ]
          ].map(
            ([x, I]) => (
              <button key={x}>

                <I size={19} />

                <span>
                  {x}
                </span>

                <ChevronLeft
                  className="chevron-right"
                />

              </button>
            )
          )}

        </div>

        <button className="outline">
          Edit profile
        </button>

      </main>

    </div>
  );
}

/* =========================
   TOAST
========================= */

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

/* =========================
   MAIN APP
========================= */

function App() {

  /*
    Restore the login state when the app starts.
  */

  const [authenticated, setAuthenticated] =
    useState(() => {
      return (
        localStorage.getItem(
          "libdate_authenticated"
        ) === "true"
      );
    });

  /*
    Restore the user's profile when the app starts.
  */

  const [userProfile, setUserProfile] =
    useState(() => {

      const savedProfile =
        localStorage.getItem(
          "libdate_profile"
        );

      if (!savedProfile) {
        return null;
      }

      try {
        return JSON.parse(
          savedProfile
        );
      } catch {
        return null;
      }
    });

  const [page, setPage] =
    useState("discover");

  const [selected, setSelected] =
    useState(people[0]);

  const [toast, setToast] =
    useState("");

  const notify = (message) => {

    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2200);
  };

  /*
    Save profile and authentication state.
  */

  const handleAuthenticated =
    (profile) => {

      if (profile) {
        setUserProfile(profile);

        localStorage.setItem(
          "libdate_profile",
          JSON.stringify(profile)
        );
      }

      setAuthenticated(true);

      localStorage.setItem(
        "libdate_authenticated",
        "true"
      );
    };

  /* =========================
     AUTHENTICATION FIRST
  ========================= */

  if (!authenticated) {

    return (
      <AuthScreen
        onAuthenticated={
          handleAuthenticated
        }
      />
    );
  }

  /* =========================
     MAIN PAGE ROUTING
  ========================= */

  const body =
    page === "discover" ? (
      <Discover
        setPage={setPage}
        setSelected={setSelected}
        notify={notify}
      />
    ) : page === "person" ? (
      <PersonPage
        person={selected}
        setPage={setPage}
        notify={notify}
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
      />
    ) : page === "messages" ? (
      <Messages
        setPage={setPage}
      />
    ) : page === "chat" ? (
      <Chat
        setPage={setPage}
      />
    ) : (
      <Profile
        userProfile={userProfile}
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

    </div>
  );
}

/* =========================
   START REACT
========================= */

createRoot(
  document.getElementById("root")
).render(
  <App />
);