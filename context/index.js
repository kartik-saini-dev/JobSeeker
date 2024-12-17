"use client";


import { createContext, useEffect, useState } from "react";
import axios from "axios";
export const GlobalContext = createContext(null);

import Cookies from 'js-cookie';

export default function GlobalState({ children }) {
  const [showNavModal, setShowNavModal] = useState(false);
  const [pageLevelLoader, setPageLevelLoader] = useState(false);
  const [unseenMessages, setUnseenMessages] = useState(0);
  const [componentLevelLoader, setComponentLevelLoader] = useState({
    loading: false,
    id: "",
  });
  const [isAuthUser, setIsAuthUser] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]); // State for applied jobs
  const [followers, setFollowers] = useState([]);
  const [filterData, setFilterData] = useState([]); 
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    tier: "",
    credits : 0,
    price : 0
  });

  useEffect(() => {
    if (Cookies.get("my-cookie")) {
    
      const userData = JSON.parse(localStorage.getItem("user")) || {};

      if (Object.keys(userData).length > 0) {
        setUser(userData);
        setIsAuthUser(true);
    }
  
      // Initialize appliedJobs and followers from userData
      setAppliedJobs(userData.appliedJobs || []);
      setFollowers(userData.followers || []);
    } else {
      localStorage.removeItem("user")
      setIsAuthUser(false);
      setUser({});
      setAppliedJobs([]);
      setFollowers([]);
    }
  }, []);

  const reduceUnseenMessages = (count) => {
    setUnseenMessages((prev) => Math.max(0, prev - count));
  };

  useEffect(()=>{
    const convId = sessionStorage.getItem("conversationId");
       if(convId){
          setConversationId(convId);

       }
  },[conversationId]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  const updateUserStatus = async (status) => {
    if (user?._id) {
     
      try {
        await axios.put(`/api/register/update?userId=${user?._id}&status=${status}`);
      
      } catch (error) {
        console.error("Error updating user status:", error);
      }
    }
  };

  useEffect(() => {

    if (user?._id) {
          updateUserStatus("true")
      // Set user status to "offline" when the tab/browser is closed
      const handleUnload = () => {
        updateUserStatus("false");

         setIsAuthUser("false")
      };

      window.addEventListener("beforeunload", handleUnload);

      return () => {
        window.removeEventListener("beforeunload", handleUnload);
      };
    }
  }, [user]);

  return (
    <GlobalContext.Provider
      value={{
        showNavModal,
        setShowNavModal,
        pageLevelLoader,
        setPageLevelLoader,
        isAuthUser,
        setIsAuthUser,
        user,
        setUser,
        componentLevelLoader,
        setComponentLevelLoader,
        appliedJobs,
        followers,
        isPaymentProcessing,
        setIsPaymentProcessing,
        checkoutData,
        setCheckoutData,
        conversationId,
        setConversationId,
        unseenMessages,
        setUnseenMessages,
        reduceUnseenMessages,
        selectedUser,
        setSelectedUser,
        filterData,
        setFilterData
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}
