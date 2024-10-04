import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Card,
  CardContent,
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
  Chip,
  IconButton,
  CircularProgress,
  SelectChangeEvent,
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
        <Typography variant="h4" component="h1" gutterBottom>
          Job Listings
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                value={sortBy}
                label="Sort By"
                onChange={handleSortChange}
              >
                <MenuItem value="createdAt">Date Posted</MenuItem>
                <MenuItem value="title">Job Title</MenuItem>
                <MenuItem value="company.name">Company Name</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel id="limit-label">Per Page</InputLabel>
              <Select
                labelId="limit-label"
                value={limit}
                label="Per Page"
                onChange={handleLimitChange}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFilterChange}
              sx={{ height: '100%' }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {posts.map((job: BasicJobPost) => (
            <Grid item xs={12} key={job._id}>
              <Card>
                <CardContent>
                  <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Grid item xs={12} sm>
                      <Typography variant="h6" component="h2">
                        {job.title}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Chip label={job.wayOfWork} color="primary" />
                    </Grid>
                  </Grid>
                  <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <Business sx={{ mr: 1 }} /> {job.company?.name}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 1 }} /> {job.location}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <CalendarToday sx={{ mr: 1 }} /> Posted on {new Date(job.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary" onClick={() => handleViewDetails(job._id)}>
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => handleApply(job._id)}
                    disabled={appliedJobs?.includes(job._id)}
                  >
                    {appliedJobs?.includes(job._id) ? "Applied" : "Apply Now"}
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleReportClick(job._id)}
                    title="Report Job"
                  >
                    <Flag />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>

        <Typography align="center" color="textSecondary" sx={{ mt: 2 }}>
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
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleReport} color="primary">Submit Report</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobList;