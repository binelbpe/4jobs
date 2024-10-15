"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const Conversation = ({ conversationId, userId }) => {
    const [newMessage, setNewMessage] = react_1.default.useState('');
    const [currentUser, setCurrentUser] = react_1.default.useState(null);
    const handleSendMessage = (0, react_1.useCallback)((e) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            const messageData = {
                conversationId: conversationId || `${currentUser.id}-${userId}`,
                content: newMessage,
                recipientId: userId,
            };
            sendSocketMessage(messageData);
            setNewMessage("");
        }
    }, [newMessage, currentUser, userId, conversationId, sendSocketMessage]);
    return (<div>
      <form onSubmit={handleSendMessage}>
        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..."/>
        <button type="submit">Send</button>
      </form>
    </div>);
};
exports.default = Conversation;
