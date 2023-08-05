import React, { createContext, useState, useEffect } from "react";
import { Magic } from "magic-sdk";
import { useRouter } from "next/router";
import { createUser, getUser } from "../lib/UserManager";

export const MagicContext = createContext();

export function MagicProvider({ children }) {
  const router = useRouter();
  const [magic, setMagic] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [publicAddress, setPublicAddress] = useState("");
  const [email, setEmailAddress] = useState("");

  useEffect(() => {
    async function createUserOnLogin() {
      if (!publicAddress || !email) {
        return;
      }
      const existingUser = await getUser(publicAddress);
      if (!existingUser.id) {
        await createUser(email, publicAddress);
      }
    }
    createUserOnLogin();
  }, [publicAddress, email]);

  async function handleLogin(_email) {
    if (!magic) {
      console.error("Magic context not yet loaded.");
    }
    await magic.auth.loginWithMagicLink({ email: _email });
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      // localStorage is available
      try {
        const metadata = await magic.user.getMetadata();
        setPublicAddress(metadata.publicAddress);
        setEmailAddress(_email);
        localStorage.setItem("isLoggedIn", true.toString());
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Magic context error: ", error);
      }
    }

    router.push("/");
  }

  async function handleLogout() {
    if (!magic) {
      console.error("Magic context not yet loaded.");
    }
    await magic.user.logout();
    setIsLoggedIn(false);
    setPublicAddress("");
    if (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    ) {
      // localStorage is available
      try {
        localStorage.setItem("isLoggedIn", false.toString());
      } catch (error) {
        console.error("localStorage error:", error);
      }
    }
    router.push("/");
  }

  async function initMagic() {
    const m = new Magic(process.env.REACT_APP_MAGIC_LINK_PK, {
      network: {
        rpcUrl: process.env.REACT_APP_RPC_URL,
        chainId: process.env.REACT_APP_RPC_CHAIN_ID,
      },
    });
    setMagic(m);
  }

  // Initialize magic when component mounts (once)
  // Retrieve authentication state from localStorage on mount
  useEffect(() => {
    initMagic();
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    //console.log("LOGGED IN: ", localStorage.getItem("isLoggedIn"));
    if (isLoggedIn) {
      setIsLoggedIn(JSON.parse(isLoggedIn));
    }
  }, []);

  // Monitor changes to Magic SDK state and update isLoggedIn and publicAddress accordingly
  useEffect(() => {
    if (!magic) {
      return;
    }

    async function checkLoggedIn() {
      const isLoggedIn = await magic.user.isLoggedIn();
      setIsLoggedIn(isLoggedIn);

      if (isLoggedIn) {
        const metadata = await magic.user.getMetadata();
        setPublicAddress(metadata.publicAddress);
      } else {
        setPublicAddress(""); // clear the publicAddress when the user logs out
      }
    }

    checkLoggedIn();
  }, [magic, isLoggedIn]); // include isLoggedIn in the dependency array to ensure publicAddress updates when the user logs in or out

  const contextValue = {
    magic,
    isLoggedIn,
    login: handleLogin,
    logout: handleLogout,
    publicAddress,
    email,
  };

  return (
    <MagicContext.Provider value={contextValue}>
      {children}
    </MagicContext.Provider>
  );
}
