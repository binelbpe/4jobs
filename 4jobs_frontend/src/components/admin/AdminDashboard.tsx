import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import { fetchDashboardData } from "../../redux/slices/adminSlice";
import Sidebar from "./AdminSidebar";
import Header from "./AdminHeader";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticatedAdmin, dashboardData } = useSelector(
    (state: RootState) => state.admin
  );

  useEffect(() => {
    if (!isAuthenticatedAdmin) {
      navigate("/admin/login");
    } else {
      dispatch(fetchDashboardData());
    }
  }, [isAuthenticatedAdmin, navigate, dispatch]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen">
        Error: {error}
      </div>
    );

  const {
    userCount = 0,
    recruiterCount = 0,
    companyCount = 0,
    totalRevenue = 0,
    jobPostCount = 0,
    userPostCount = 0,
    revenueData = [],
  } = dashboardData || {};

  const chartData = {
    labels: revenueData.map((data: any) => data.month),
    datasets: [
      {
        label: "Revenue",
        data: revenueData.map((data: any) => data.amount),
        borderColor: "rgb(147, 51, 234)",
        backgroundColor: "rgba(147, 51, 234, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Revenue",
      },
    },
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100 md:ml-0">
        <Header />
        <div className="p-6 bg-white rounded-lg shadow-md m-4">
          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            <DashboardCard title="Total Users" value={userCount} />
            <DashboardCard title="Total Recruiters" value={recruiterCount} />
            <DashboardCard title="Total Companies" value={companyCount} />
            <DashboardCard
              title="Total Revenue"
              value={`₹${totalRevenue.toFixed(2)}`}
            />
            <DashboardCard title="Total Job Posts" value={jobPostCount} />
            <DashboardCard title="Total User Posts" value={userPostCount} />
          </div>
          <div className="mt-8">
            <Line options={chartOptions} data={chartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ title: string; value: string | number }> = ({
  title,
  value,
}) => (
  <div className="bg-purple-100 p-4 rounded-lg">
    <h3 className="text-lg font-semibold text-purple-800">{title}</h3>
    <p className="text-3xl font-bold text-purple-600">{value}</p>
  </div>
);

export default AdminDashboard;
