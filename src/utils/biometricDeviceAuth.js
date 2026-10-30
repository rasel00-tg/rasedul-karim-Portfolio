import { initFirebase } from '../firebase/config';

// ১. ডিভাইস হার্ডওয়্যার বায়োমেট্রিক সাপোর্ট চেক (Touch ID / Face ID / Windows Hello)
export const isDeviceBiometricAvailable = async () => {
  try {
    return !!(
      window.PublicKeyCredential && 
      await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    );
  } catch (e) {
    return false;
  }
};

// ২. বর্তমান ডিভাইসে বায়োমেট্রিক রেজিস্টার্ড আছে কিনা চেক
export const isDeviceBiometricEnrolled = () => {
  return !!localStorage.getItem("local_device_biometric_id");
};

// Firestore helper (handles both modular and compat syntax)
const saveToAdminBiometrics = async (firestoreInstance, docId, data) => {
  let db = firestoreInstance;
  if (!db) {
    const initialized = await initFirebase();
    db = initialized.db;
  }
  if (!db) return;

  if (typeof db.collection === 'function') {
    await db.collection('admin_biometrics').doc(docId).set(data, { merge: true });
  } else {
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'admin_biometrics', docId), data, { merge: true });
  }
};

// ৩. ডিভাইস হার্ডওয়্যার বায়োমেট্রিক রেজিস্ট্রেশন (অ্যাডমিন প্যানেল থেকে সেট করার জন্য)
export const registerDeviceBiometric = async (adminUid = "admin_master", firestoreInstance) => {
  if (!window.PublicKeyCredential) {
    throw new Error("আপনার ব্রাউজারে বায়োমেট্রিক সেন্সর সাপোর্ট নেই।");
  }

  const isPlatformAvailable = await isDeviceBiometricAvailable();
  if (!isPlatformAvailable) {
    throw new Error("আপনার ডিভাইসে কোনো প্ল্যাটফর্ম বায়োমেট্রিক সেন্সর (Fingerprint / Touch ID) সক্রিয় নেই।");
  }

  // র্যান্ডম অথোরিজেশন চ্যালেঞ্জ
  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  // লোকাল হার্ডওয়্যার অথেন্টিকেটর বাধ্যতামূলক করা (কোনো পাসকি/ক্লাউড নয়)
  const publicKeyCredentialCreationOptions = {
    challenge,
    rp: {
      name: "Rasedul Karim Admin Security",
      id: window.location.hostname
    },
    user: {
      id: Uint8Array.from(adminUid, c => c.charCodeAt(0)),
      name: "admin@rasedulkarim.dev",
      displayName: "Admin Master"
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // কঠোরভাবে শুধুমাত্র ডিভাইসের ইন-বিল্ট ফিঙ্গারপ্রিন্ট সেন্সর
      userVerification: "required",        // ফিঙ্গারপ্রিন্ট দেওয়া বাধ্যতামূলক
      residentKey: "preferred"
    },
    timeout: 60000,
    attestation: "none"
  };

  const credential = await navigator.credentials.create({
    publicKey: publicKeyCredentialCreationOptions
  });

  if (!credential) {
    throw new Error("বায়োমেট্রিক রেজিস্ট্রেশন বাতিল করা হয়েছে।");
  }

  // বাইনারি ক্রেডেনশিয়াল আইডিকে সেফ Base64 স্ট্রিংয়ে কনভার্ট করা
  const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  const deviceFingerprint = window.navigator.userAgent.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'default_device';

  // ফায়ারবেসের নতুন 'admin_biometrics' কালেকশনে সংরক্ষণ
  try {
    await saveToAdminBiometrics(firestoreInstance, `device_${deviceFingerprint}`, {
      adminUid,
      credentialId: rawId,
      deviceName: navigator.userAgent,
      registeredAt: new Date().toISOString(),
      status: "active"
    });
  } catch (err) {
    console.warn("Firestore admin_biometrics sync warning:", err.message);
  }

  // এই নির্দিষ্ট ডিভাইসের লোকাল স্টোরেজেও ফ্ল্যাগ সেভ রাখো
  localStorage.setItem("local_device_biometric_id", rawId);
  localStorage.setItem("admin_biometric_enabled", "true");
  localStorage.setItem("admin_biometric_credId", rawId);

  return true;
};

// ৪. লগইন করার সময় শুধুমাত্র এই ডিভাইসের হার্ডওয়্যার ফিঙ্গারপ্রিন্ট দিয়ে যাচাই
export const verifyDeviceBiometricLogin = async (firestoreInstance) => {
  const localCredId = localStorage.getItem("local_device_biometric_id") || localStorage.getItem("admin_biometric_credId");
  if (!localCredId) {
    throw new Error("এই ডিভাইসে বায়োমেট্রিক সেট করা নেই! প্রথমে লগইন করে সেট করুন।");
  }

  const challenge = new Uint8Array(32);
  window.crypto.getRandomValues(challenge);

  // Base64 থেকে Uint8Array তৈরি
  const binaryId = Uint8Array.from(atob(localCredId), c => c.charCodeAt(0));

  const publicKeyCredentialRequestOptions = {
    challenge,
    allowCredentials: [{
      id: binaryId,
      type: "public-key",
      transports: ["internal"] // কঠোরভাবে ইন্টারনাল ডিভাইস সেন্সর (Touch ID / Android Fingerprint)
    }],
    userVerification: "required",
    timeout: 60000,
    rpId: window.location.hostname
  };

  const assertion = await navigator.credentials.get({
    publicKey: publicKeyCredentialRequestOptions
  });

  if (assertion) {
    // লগইন সফল হলে লাস্ট অথেন্টিকেশন টাইম আপডেট
    try {
      const deviceFingerprint = window.navigator.userAgent.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'default_device';
      await saveToAdminBiometrics(firestoreInstance, `device_${deviceFingerprint}`, {
        lastLoginAt: new Date().toISOString()
      });
    } catch (e) {
      // Non-blocking
    }
  }

  return !!assertion;
};

// ৫. বায়োমেট্রিক ডিজেবল করা
export const disableDeviceBiometric = async (firestoreInstance) => {
  localStorage.removeItem("local_device_biometric_id");
  localStorage.removeItem("admin_biometric_enabled");
  localStorage.removeItem("admin_biometric_credId");

  try {
    const deviceFingerprint = window.navigator.userAgent.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'default_device';
    await saveToAdminBiometrics(firestoreInstance, `device_${deviceFingerprint}`, {
      status: "disabled",
      disabledAt: new Date().toISOString()
    });
  } catch (e) {
    // Non-blocking
  }

  return true;
};

