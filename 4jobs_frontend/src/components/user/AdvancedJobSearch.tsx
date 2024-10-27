import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../redux/store';
import { 
  performAdvancedJobSearch, 
  setAdvancedFilters, 
  clearAdvancedFilters 
} from '../../redux/slices/advancedJobSearchSlice';
import Header from './Header';
import {
  Container,
  TextField,
  Button,
  Grid,
  Typography,
  Chip,
  Box,
  Card,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Business,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';
import { BasicJobPost } from '../../types/jobPostTypes';
import { WORK_TYPES } from '../../constants/jobConstants';
import { WorkType } from '../../constants/jobConstants';
import { JobSearchFilters } from '../../types/jobSearchTypes';
import { fetchJobPost } from '../../redux/slices/authSlice';
import { toast } from 'react-toastify';

const AdvancedJobSearch: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  
  // Update the destructuring to match JobSearchState interface
  const { 
    exactMatches, 
    similarMatches, 
    loading, 
    error, 
    totalExactCount, 
    totalSimilarCount 
  } = useSelector((state: RootState) => state.advancedJobSearch);

  const [searchParams, setSearchParams] = useState({
    title: '',
    company: '',
    location: '',
    skills: [] as string[],
    salaryMin: 0,
    salaryMax: 1000000,
    wayOfWork: '' as WorkType | '' // Allow empty string or WorkType
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [page] = useState(1);

  // Add validation state
  const [errors, setErrors] = useState({
    salaryMin: '',
    salaryMax: '',
  });

  const handleSearch = () => {
    if (searchParams.salaryMin > searchParams.salaryMax) {
      setErrors({
        salaryMin: 'Minimum salary cannot be greater than maximum salary',
        salaryMax: ''
      });
      return;
    }

    const filters: JobSearchFilters = {
      ...searchParams,
      wayOfWork: searchParams.wayOfWork || undefined // Convert empty string to undefined
    };

    dispatch(setAdvancedFilters(filters));
    dispatch(performAdvancedJobSearch({ filters, page }));
  };

  const handleClear = () => {
    setSearchParams({
      title: '',
      company: '',
      location: '',
      skills: [],
      salaryMin: 0,
      salaryMax: 1000000,
      wayOfWork: '' // Empty string as initial state
    });
    dispatch(clearAdvancedFilters());
  };

  const handleSkillAdd = (inputValue: string) => {
    // Split the input by commas and clean up each skill
    const newSkills = inputValue
      .split(',')
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0 && !searchParams.skills.includes(skill));

    if (newSkills.length > 0) {
      setSearchParams(prev => ({
        ...prev,
        skills: [...prev.skills, ...newSkills]
      }));
      setCurrentSkill('');
    }
  };

  const handleSkillDelete = (skillToDelete: string) => {
    setSearchParams(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToDelete)
    }));
  };

  const handleSalaryChange = (field: 'salaryMin' | 'salaryMax', value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    
    // Validate input
    if (isNaN(numValue)) {
      setErrors(prev => ({
        ...prev,
        [field]: 'Please enter a valid number'
      }));
      return;
    }

    if (numValue < 0) {
      setErrors(prev => ({
        ...prev,
        [field]: 'Salary cannot be negative'
      }));
      return;
    }

    if (field === 'salaryMin' && numValue > searchParams.salaryMax) {
      setErrors(prev => ({
        ...prev,
        salaryMin: 'Minimum salary cannot be greater than maximum salary'
      }));
      return;
    }

    if (field === 'salaryMax' && numValue < searchParams.salaryMin) {
      setErrors(prev => ({
        ...prev,
        salaryMax: 'Maximum salary cannot be less than minimum salary'
      }));
      return;
    }

    // Clear error if validation passes
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));

    setSearchParams(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleViewDetails = async (jobId: string) => {
    try {
      // Find the job from either exact or similar matches
      const job = [...exactMatches, ...similarMatches].find(j => j._id === jobId);
      
      if (job) {
        // Store the job details in the auth slice before navigating
        await dispatch(fetchJobPost(jobId)).unwrap();
        navigate(`/jobs/${jobId}`, { 
          state: { jobDetails: job } // Pass job details through navigation state
        });
      } else {
        toast.error("Job details not found");
      }
    } catch (error) {
      console.error('Error handling job details:', error);
      toast.error("Error loading job details. Please try again.");
    }
  };

  const handleWorkTypeChange = (e: SelectChangeEvent<string>) => {
    setSearchParams(prev => ({
      ...prev,
      wayOfWork: e.target.value as WorkType | ''
    }));
  };

  const ResultsSection: React.FC<{
    title: string;
    jobs: BasicJobPost[];
    count: number;
    onViewDetails: (id: string) => void;
    isSmallScreen: boolean;
  }> = ({ title, jobs, count, onViewDetails, isSmallScreen }) => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`${isSmallScreen ? 'text-lg' : 'text-xl'} font-semibold text-purple-700`}>
          {title} ({count})
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-purple-100"
          >
            <div className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="flex-grow">
                  <h3 className={`${isSmallScreen ? 'text-lg' : 'text-xl'} font-semibold text-purple-800 mb-2`}>
                    {job.title}
                  </h3>
                  <div className="space-y-2">
                    <p className="flex items-center text-gray-600 text-sm md:text-base">
                      <Business className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" />
                      {job.company?.name}
                    </p>
                    <p className="flex items-center text-gray-600 text-sm md:text-base">
                      <LocationOn className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" />
                      {job.location}
                    </p>
                    <p className="flex items-center text-gray-600 text-sm md:text-base">
                      <CalendarToday className="w-4 h-4 md:w-5 md:h-5 mr-2 text-purple-600" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.skillsRequired.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs md:text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 3 && (
                      <span className="text-purple-600 text-xs md:text-sm">
                        +{job.skillsRequired.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-purple-700 font-semibold text-sm md:text-base">
                    ₹{job.salaryRange.min.toLocaleString()} - ₹{job.salaryRange.max.toLocaleString()}
                  </span>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs md:text-sm text-center">
                    {job.wayOfWork}
                  </span>
                  <button
                    onClick={() => onViewDetails(job._id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm md:text-base transition-colors duration-300 flex items-center justify-center"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Header />
      <Container maxWidth="lg" sx={{ py: isSmallScreen ? 2 : 4 }}>
        <Typography 
          variant={isSmallScreen ? "h5" : "h4"} 
          component="h1" 
          gutterBottom 
          className="text-purple-700 font-bold mb-6"
        >
          Advanced Job Search
        </Typography>

        <Card elevation={3} sx={{ mb: 4, p: isSmallScreen ? 2 : 3 }}>
          <Grid container spacing={isSmallScreen ? 2 : 3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Job Title"
                value={searchParams.title}
                onChange={(e) => setSearchParams(prev => ({ ...prev, title: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Company"
                value={searchParams.company}
                onChange={(e) => setSearchParams(prev => ({ ...prev, company: e.target.value }))}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Location"
                value={searchParams.location}
                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Salary (₹)"
                type="number"
                value={searchParams.salaryMin || ''}
                onChange={(e) => handleSalaryChange('salaryMin', e.target.value)}
                error={!!errors.salaryMin}
                helperText={errors.salaryMin}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Salary (₹)"
                type="number"
                value={searchParams.salaryMax || ''}
                onChange={(e) => handleSalaryChange('salaryMax', e.target.value)}
                error={!!errors.salaryMax}
                helperText={errors.salaryMax}
                InputProps={{
                  inputProps: { min: 0 }
                }}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Skills Required"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleSkillAdd(currentSkill);
                  }
                }}
                onBlur={() => {
                  if (currentSkill) {
                    handleSkillAdd(currentSkill);
                  }
                }}
                variant="outlined"
                placeholder="Enter skills separated by commas (e.g., React, TypeScript, Node.js)"
                helperText="Press Enter, comma, or blur to add skills"
              />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {searchParams.skills.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    onDelete={() => handleSkillDelete(skill)}
                    color="primary"
                    sx={{
                      bgcolor: '#9333EA',
                      '&:hover': {
                        bgcolor: '#7E22CE'
                      }
                    }}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Work Type</InputLabel>
                <Select
                  value={searchParams.wayOfWork}
                  onChange={handleWorkTypeChange}
                  label="Work Type"
                >
                  <MenuItem value="">
                    <em>Any</em>
                  </MenuItem>
                  {WORK_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select the type of work arrangement</FormHelperText>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  startIcon={<SearchIcon />}
                  sx={{
                    bgcolor: '#9333EA',
                    '&:hover': {
                      bgcolor: '#7E22CE'
                    }
                  }}
                >
                  Search
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <ErrorDisplay message={error} />
        ) : (
          <div className="space-y-8">
            {exactMatches.length > 0 && (
              <ResultsSection
                title="Exact Matches"
                jobs={exactMatches}
                count={totalExactCount}
                onViewDetails={handleViewDetails}
                isSmallScreen={isSmallScreen}
              />
            )}
            {similarMatches.length > 0 && (
              <ResultsSection
                title="Similar Matches"
                jobs={similarMatches}
                count={totalSimilarCount}
                onViewDetails={handleViewDetails}
                isSmallScreen={isSmallScreen}
              />
            )}
            {exactMatches.length === 0 && similarMatches.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">No jobs found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </Container>
    </Box>
  );
};

export default AdvancedJobSearch;
