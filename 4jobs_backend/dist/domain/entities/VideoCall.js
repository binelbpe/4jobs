"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoCall = void 0;
class VideoCall {
    constructor(id, recruiterId, userId, status, startTime, endTime) {
        this.id = id;
        this.recruiterId = recruiterId;
        this.userId = userId;
        this.status = status;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}
exports.VideoCall = VideoCall;
