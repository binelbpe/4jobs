import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../../redux/store";
import { createJobPost } from "../../../redux/slices/jobPostSlice";
import JobPostForm from "./JobPostForm";
import { BasicJobPostFormData } from "../../../types/jobPostTypes";
import RecruiterHeader from "../RecruiterHeader";
import { toast } from "react-toastify";
import { PlusCircle } from "lucide-react";
import SubscriptionPlans from "../subscription/SubscriptionPlans";
import RazorpayPayment from "../subscription/RazorpayPayment";

const CreateJobPost: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { recruiter } = useSelector((state: RootState) => state.recruiter);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const checkSubscriptionStatus = useCallback(() => {
    if (recruiter) {
      const isSubscribed = recruiter.subscribed;
      const expiryDate = recruiter.expiryDate
        ? new Date(recruiter.expiryDate)
        : null;
      const isExpired = expiryDate ? expiryDate < new Date() : true;

      if (!isSubscribed || isExpired) {
        setShowSubscriptionPlans(true);
      } else {
        setShowSubscriptionPlans(false);
      }
    }
  }, [recruiter]);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  const handleSubmit = async (formData: BasicJobPostFormData) => {
    if (recruiter && recruiter.id) {
      if (
        !recruiter.subscribed ||
        (recruiter.expiryDate && new Date(recruiter.expiryDate) < new Date())
      ) {
        toast.error("Please subscribe to a plan to create job posts.");
        setShowSubscriptionPlans(true);
        return;
      }

      try {
        const jobPostData = {
          ...formData,
          recruiterId: recruiter.id,
        };
        await dispatch(
          createJobPost({ recruiterId: recruiter.id, postData: jobPostData })
        ).unwrap();
        toast.success("Job post created successfully");
        navigate("/recruiter/jobs");
      } catch (error) {
        console.error("Failed to create job post:", error);
        toast.error("Failed to create job post. Please try again.");
      }
    } else {
      toast.error("Recruiter ID is not available. Please log in.");
    }
  };

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = () => {
    setShowSubscriptionPlans(false);
    toast.success("Subscription successful! You can now create job posts.");
    checkSubscriptionStatus();
  };

  const handlePaymentFailure = (error: string) => {
    toast.error(`Payment failed: ${error}`);
  };

  if (!recruiter) {
    return (
      <div className="flex justify-center items-center h-screen text-purple-700">
        Please log in to create a job post.
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <RecruiterHeader />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {showSubscriptionPlans ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-700">
              Subscribe to Create Job Posts
            </h2>
            <SubscriptionPlans onSelectPlan={handleSelectPlan} />
            {selectedPlan && (
              <div className="mt-8 text-center">
                <RazorpayPayment
                  amount={selectedPlan.price}
                  planDuration={selectedPlan.duration}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-purple-700 flex items-center">
              <PlusCircle className="mr-2 w-6 h-6 sm:w-8 sm:h-8" /> Create New
              Job Post
            </h2>
            <JobPostForm
              recruiterId={recruiter.id}
              isEditing={false}
              onSubmit={handleSubmit}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateJobPost;
