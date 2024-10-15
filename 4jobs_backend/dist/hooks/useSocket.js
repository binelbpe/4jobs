"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const messageSlice_1 = require("./messageSlice");
const useSocket = (recipientId) => {
    const dispatch = (0, react_redux_1.useDispatch)();
    (0, react_1.useEffect)(() => {
        if (currentUser === null || currentUser === void 0 ? void 0 : currentUser.id) {
            // ... (previous code)
            const handleNewMessage = (message) => {
                console.log("Received new message:", message);
                dispatch((0, messageSlice_1.addMessage)(message));
            };
            const handleMessageSent = (message) => {
                console.log("Message sent confirmation:", message);
                dispatch((0, messageSlice_1.addMessage)(message));
            };
            socketService.on("newMessage", handleNewMessage);
            socketService.on("messageSent", handleMessageSent);
            return () => {
                socketService.off("newMessage", handleNewMessage);
                socketService.off("messageSent", handleMessageSent);
            };
        }
    }, [currentUser === null || currentUser === void 0 ? void 0 : currentUser.id, dispatch]);
    const sendMessage = (0, react_1.useCallback)((message) => {
        console.log("Sending message:", message);
        socketService.sendMessage(message);
    }, []);
    // ... (rest of the hook)
};
exports.default = useSocket;
