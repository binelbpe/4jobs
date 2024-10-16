import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchSubscriptions,
  cancelSubscription,
} from "../../redux/slices/adminSubscriptionSlice";
import Sidebar from "./AdminSidebar";
import Header from "./AdminHeader";
import { Subscription } from "../../types/subscription";
import ConfirmationModal from "../common/ConfirmationModal";
import { FaChevronLeft, FaChevronRight, FaBan } from "react-icons/fa";

const ITEMS_PER_PAGE = 15;

const AdminSubscriptionManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { subscriptions, loading, error, totalPages, currentPage } =
    useSelector((state: RootState) => state.subscriptions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);

  useEffect(() => {
    dispatch(fetchSubscriptions({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  const handleCancelSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsModalOpen(true);
  };

  const confirmCancelSubscription = () => {
    if (selectedSubscription) {
      dispatch(cancelSubscription(selectedSubscription.id));
      setIsModalOpen(false);
      setSelectedSubscription(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(fetchSubscriptions({ page: newPage, limit: ITEMS_PER_PAGE }));
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 flex-grow overflow-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold text-purple-800 mb-6">
              Subscription Management
            </h1>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : !subscriptions || subscriptions.length === 0 ? (
              <div className="text-center py-4 text-purple-600">No subscriptions found.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-purple-100">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Recruiter</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Company</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Plan</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Amount</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Start Date</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">End Date</th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-purple-800 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-200">
                      {subscriptions.map((subscription: Subscription) => (
                        <tr key={subscription.id} className="hover:bg-purple-50">
                          <td className="py-4 px-6 text-sm">{subscription.name}</td>
                          <td className="py-4 px-6 text-sm">{subscription.companyName}</td>
                          <td className="py-4 px-6 text-sm">{subscription.planDuration}</td>
                          <td className="py-4 px-6 text-sm">₹{subscription.subscriptionAmount}</td>
                          <td className="py-4 px-6 text-sm">{new Date(subscription.subscriptionStartDate).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-sm">{new Date(subscription.expiryDate).toLocaleDateString()}</td>
                          <td className="py-4 px-6 text-sm">
                            <button
                              onClick={() => handleCancelSubscription(subscription)}
                              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                            >
                              <FaBan className="mr-2" /> Cancel subscription
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                  <div className="mb-4 sm:mb-0">
                    <span className="text-sm text-purple-600">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-purple-300 hover:bg-purple-600 transition-colors duration-200 flex items-center"
                    >
                      <FaChevronLeft className="mr-2" /> Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-purple-500 text-white rounded disabled:bg-purple-300 hover:bg-purple-600 transition-colors duration-200 flex items-center"
                    >
                      Next <FaChevronRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancel Subscription"
        message={`Are you sure you want to cancel the subscription for ${selectedSubscription?.name}?`}
      />
    </div>
  );
};

export default AdminSubscriptionManagement;
