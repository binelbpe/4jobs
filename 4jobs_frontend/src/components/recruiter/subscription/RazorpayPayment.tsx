import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import { updateSubscription } from "../../../redux/slices/recruiterSlice";
import { updateSubscriptionApi } from "../../../api/recruiterApi";

interface RazorpayPaymentProps {
  amount: number;
  planDuration: string;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  planDuration,
  onSuccess,
  onFailure,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const { recruiter } = useSelector((state: RootState) => state.recruiter);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!isScriptLoaded) {
      onFailure("Razorpay script not loaded yet. Please try again.");
      return;
    }

    if (typeof window.Razorpay !== "function") {
      onFailure(
        "Razorpay is not available. Please check your internet connection and try again."
      );
      return;
    }

    const options = {
      key: "rzp_test_mRydipg2bgDZmQ",
      amount: amount * 100,
      currency: "INR",
      name: "4JOBS",
      description: `${planDuration} Subscription`,
      handler: async function (response: any) {
        try {
          const expiryDate = calculateExpiryDate(planDuration);
          const subscriptionData = {
            subscribed: true,
            planDuration,
            expiryDate: expiryDate.toISOString(),
            subscriptionAmount: amount,
          };

          await updateSubscriptionApi(recruiter.id, subscriptionData);

          dispatch(updateSubscription(subscriptionData));

          onSuccess();
        } catch (error) {
          console.error("Error updating subscription:", error);
          onFailure(
            "Payment successful, but failed to update subscription. Please contact support."
          );
        }
      },
      prefill: {
        name: "Recruiter Name",
        email: "recruiter@example.com",
      },
      theme: {
        color: "#7C3AED",
      },
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error creating Razorpay instance:", error);
      onFailure("Failed to initialize payment. Please try again.");
    }
  };

  const calculateExpiryDate = (duration: string) => {
    const now = new Date();
    switch (duration) {
      case "1 month":
        return new Date(now.setMonth(now.getMonth() + 1));
      case "3 months":
        return new Date(now.setMonth(now.getMonth() + 3));
      case "1 year":
        return new Date(now.setFullYear(now.getFullYear() + 1));
      default:
        return now;
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition duration-300"
      disabled={!isScriptLoaded}
    >
      {isScriptLoaded ? "Pay Now" : "Loading..."}
    </button>
  );
};

export default RazorpayPayment;
