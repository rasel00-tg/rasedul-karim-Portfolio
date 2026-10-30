// ১. ডিভাইস ফিঙ্গারপ্রিন্ট/বায়োমেট্রিক সাপোর্ট চেক
export const isBiometricAvailable = async () => {
  try {
    return !!(
      window.PublicKeyCredential && 
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    );
  } catch (e) {
    return false;
  }
};

// ২. বায়োমেট্রিক আগে এনাবল করা আছে কিনা চেক
export const isBiometricEnrolled = () => {
  return (
    localStorage.getItem("admin_biometric_enabled") === "true" && 
    !!localStorage.getItem("admin_biometric_credId")
  );
};

// ৩. বায়োমেট্রিক ডিজেবল করা
export const disableBiometric = () => {
  localStorage.removeItem("admin_biometric_enabled");
  localStorage.removeItem("admin_biometric_credId");
  return true;
};

// ৪. ড্যাশবোর্ডে প্রথমবার ফিঙ্গারপ্রিন্ট এনাবল করা (Register Credential)
export const registerBiometric = async (adminId = "admin_master") => {
  if (!window.PublicKeyCredential) {
    throw new Error("আপনার ব্রাউজারে বায়োমেট্রিক সাপোর্ট নেই।");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const createCredentialOptions = {
    challenge,
    rp: { 
      name: "Rasedul Karim Admin Panel", 
      id: window.location.hostname 
    },
    user: {
      id: Uint8Array.from(adminId, c => c.charCodeAt(0)),
      name: "rasedulkarim.admin",
      displayName: "Rasedul Karim"
    },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // ডিভাইস সেন্সর (TouchID/Fingerprint)
      userVerification: "required"
    },
    timeout: 60000
  };

  const credential = await navigator.credentials.create({
    publicKey: createCredentialOptions
  });

  if (credential) {
    // ক্রেডেনশিয়াল আইডি লোকালি সেভ রাখা
    localStorage.setItem("admin_biometric_enabled", "true");
    localStorage.setItem("admin_biometric_credId", credential.id);
    return true;
  }
  return false;
};

// ৫. লগইন স্ক্রিনে ফিঙ্গারপ্রিন্ট দিয়ে যাচাই ও লগইন (Verify & Login)
export const verifyBiometricLogin = async () => {
  const isEnabled = localStorage.getItem("admin_biometric_enabled") === "true";
  const rawCredId = localStorage.getItem("admin_biometric_credId");

  if (!isEnabled || !rawCredId) {
    throw new Error("প্রথমে অ্যাডমিন ড্যাশবোর্ড থেকে ফিঙ্গারপ্রিন্ট এনাবল করুন।");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  const getCredentialOptions = {
    challenge,
    timeout: 60000,
    userVerification: "required",
    rpId: window.location.hostname
  };

  const assertion = await navigator.credentials.get({
    publicKey: getCredentialOptions
  });

  return !!assertion;
};

