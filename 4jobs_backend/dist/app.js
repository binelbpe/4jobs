"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = require("./infrastructure/webserver/express/routes/authRoutes");
const adminRoutes_1 = require("./infrastructure/webserver/express/routes/adminRoutes");
const RecruiterRoutes_1 = require("./infrastructure/webserver/express/routes/RecruiterRoutes");
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
// dotenv.config(); 
const app = (0, express_1.default)();
app.use(express_1.default.json());
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: 'Content-Type,Authorization',
};
app.use((0, cors_1.default)(corsOptions));
// Routes
app.use('/', authRoutes_1.authRouter);
app.use('/admin', adminRoutes_1.adminRouter);
app.use('/recruiter', RecruiterRoutes_1.recruiterRouter);
// Connect to MongoDB
mongoose_1.default.connect(process.env.DATABASE_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
