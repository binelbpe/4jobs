import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  fetchJobPostsAsync,
  applyForJobAsync,
  fetchJobPost,
  reportJobAsync,
} from "../../redux/slices/authSlice";
import { BasicJobPost } from "../../types/jobPostTypes";
import Header from "../user/Header";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Container,
  Typography,
  CardActions,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  Box,
  IconButton,
  CircularProgress,
  SelectChangeEvent,
  useMediaQuery,
} from "@mui/material";
import { Business, LocationOn, CalendarToday, Flag } from "@mui/icons-material";

const JobList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { jobPosts, user } = useSelector((state: RootState) => state.auth);
  const { posts, loading, error, totalPages, totalCount, currentPage } = jobPosts;
  const appliedJobs = user?.appliedJobs || [];

  const [page, setPage] = useState(currentPage);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filter, setFilter] = useState({});
  const [reportDialog, setReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const isSmallScreen = useMediaQuery('(max-width:400px)'); // Check if screen is below 400px

  useEffect(() => {
    dispatch(fetchJobPostsAsync({ page, limit, sortBy, sortOrder, filter }));
  }, [dispatch, page, limit, sortBy, sortOrder, filter]);

  const handleApply = async (jobId: string) => {
    if (user?.id) {
      try {
        const resultAction = await dispatch(
          applyForJobAsync({ userId: user.id, jobId })
        );

        if (applyForJobAsync.fulfilled.match(resultAction)) {
          toast.success("Successfully applied for the job!");
          dispatch(fetchJobPostsAsync({ page, limit, sortBy, sortOrder, filter }));
        } else if (applyForJobAsync.rejected.match(resultAction)) {
          toast.error(resultAction.payload as string);
        }
      } catch (err) {
        toast.error("Error occurred while applying.");
      }
    } else {
      toast.error("User ID not found. Please log in.");
    }
  };

  const handleReportClick = (jobId: string) => {
    setSelectedJobId(jobId);
    setReportDialog(true);
  };

  const handleReport = async () => {
    if (user?.id && selectedJobId) {
      try {
        const resultAction = await dispatch(
          reportJobAsync({ userId: user.id, jobId: selectedJobId, reason: reportReason })
        );

        if (reportJobAsync.fulfilled.match(resultAction)) {
          toast.success('Job reported successfully');
          setReportDialog(false);
          setReportReason("");
          setSelectedJobId(null);
        } else if (reportJobAsync.rejected.match(resultAction)) {
          toast.error(resultAction.payload as string);
        }
      } catch (err) {
        toast.error('Error occurred while reporting the job.');
      }
    } else {
      toast.error('User ID not found. Please log in.');
    }
  };

  const handleViewDetails = async (jobId: string) => {
    try {
      await dispatch(fetchJobPost(jobId));
      navigate(`/jobs/${jobId}`);
    } catch (error) {
      toast.error("Error fetching job details. Please try again.");
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value as string);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setLimit(event.target.value as number);
    setPage(1);
  };

  const handleFilterChange = () => {
    setFilter({});
    setPage(1);
  };

  const renderApplyButton = (jobId: string) => {
    if (!user?.id) {
      return (
        <Link
          to="/login"
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-bold rounded-full shadow-md hover:shadow-lg text-sm"
        >
          Login to Apply
        </Link>
      );
    }

    if (!user.resume) {
      return (
        <Button
          size="small"
          variant="contained"
          onClick={() => navigate(`/profile/${user.id}`)}
          className="text-sm"
          sx={{
            bgcolor: '#EAB308', // yellow-500
            '&:hover': {
              bgcolor: '#CA8A04' // yellow-600
            }
          }}
        >
          Update Profile
        </Button>
      );
    }

    return (
      <Button
        size="small"
        variant="contained"
        onClick={() => handleApply(jobId)}
        disabled={appliedJobs?.includes(jobId)}
        sx={{
          bgcolor: '#9333EA', // purple-600
          '&:hover': {
            bgcolor: '#7E22CE' // purple-700
          },
          '&.Mui-disabled': {
            bgcolor: '#E9D5FF', // purple-200
            color: '#6B7280' // gray-500
          }
        }}
      >
        {appliedJobs?.includes(jobId) ? "Applied" : "Apply Now"}
      </Button>
    );
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  if (error) return <Typography color="error" align="center" p={4}>{error}</Typography>;

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <ToastContainer />

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom className={`text-purple-700 font-bold ${isSmallScreen ? 'text-xl' : 'text-2xl sm:text-3xl'}`}>
          Job Listings
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel id="sort-by-label" className="text-purple-700">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
                className="text-purple-700"
                size="small"
              >
                <MenuItem value="createdAt">Date Posted</MenuItem>
                <MenuItem value="title">Job Title</MenuItem>
                <MenuItem value="company.name">Company Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <FormControl fullWidth sx={{ minWidth: 120 }}>
              <InputLabel id="limit-label" className="text-purple-700">Per Page</InputLabel>
              <Select
                labelId="limit-label"
                value={limit}
                label="Per Page"
                onChange={handleLimitChange}
                className="text-purple-700"
                size="small"
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFilterChange}
              sx={{
                height: '100%',
                bgcolor: '#9333EA', // purple-600
                '&:hover': {
                  bgcolor: '#7E22CE' // purple-700
                }
              }}
              size="small"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {posts.map((job: BasicJobPost) => (
            <Grid item xs={12} key={job._id} md={12} lg={12}>
              <Box sx={{
                boxShadow: 2,
                border: '1px solid',
                borderColor: 'purple.300',
                borderRadius: 2,
                p: isSmallScreen ? 1 : 2, // Adjust padding for small screens
                mb: 2,
                bgcolor: 'white'
              }}>
                <Typography variant="h6" component="h2" className={`text-purple-700 ${isSmallScreen ? 'text-lg' : 'text-lg sm:text-xl'}`}>
                  {job.title}
                </Typography>
                <Typography color="text.secondary" gutterBottom className={`flex items-center text-sm ${isSmallScreen ? 'text-xs' : 'sm:text-base'}`}>
                  <Business className="mr-1 text-purple-600" /> {job.company?.name}
                </Typography>
                <Typography color="text.secondary" gutterBottom className={`flex items-center text-sm ${isSmallScreen ? 'text-xs' : 'sm:text-base'}`}>
                  <LocationOn className="mr-1 text-purple-600" /> {job.location}
                </Typography>
                <Typography color="text.secondary" gutterBottom className={`flex items-center text-sm ${isSmallScreen ? 'text-xs' : 'sm:text-base'}`}>
                  <CalendarToday className="mr-1 text-purple-600" /> Posted on {new Date(job.createdAt).toLocaleDateString()}
                </Typography>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleViewDetails(job._id)}
                    sx={{
                      bgcolor: '#9333EA', // purple-600
                      '&:hover': {
                        bgcolor: '#7E22CE' // purple-700
                      }
                    }}
                    className={`text-sm ${isSmallScreen ? 'text-xs' : 'sm:text-base'}`}
                  >
                    View Details
                  </Button>
                  {renderApplyButton(job._id)}
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleReportClick(job._id)}
                    title="Report Job"
                    className={`text-sm ${isSmallScreen ? 'text-xs' : 'sm:text-base'}`}
                  >
                    <Flag className={`text-sm ${isSmallScreen ? 'text-xs' : 'sm:text-base'}`} />
                  </IconButton>
                </CardActions>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="secondary"
          />
        </Box>

        <Typography align="center" color="textSecondary" className="mt-2">
          Total Jobs: {totalCount}
        </Typography>
      </Container>

      <Dialog open={reportDialog} onClose={() => setReportDialog(false)}>
        <DialogTitle>Report Job</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason"
            type="text"
            fullWidth
            variant="outlined"
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setReportDialog(false)}
            sx={{
              bgcolor: '#9333EA', // purple-600
              color: 'white',
              '&:hover': {
                bgcolor: '#7E22CE' // purple-700
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReport}
            sx={{
              bgcolor: '#9333EA', // purple-600
              color: 'white',
              '&:hover': {
                bgcolor: '#7E22CE' // purple-700
              }
            }}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobList;
