import mongoose, { Schema, Document } from 'mongoose';



export interface IUserVideoCall extends Document {

  callerId: string;

  recipientId: string;

  status: 'pending' | 'accepted' | 'rejected' | 'ended' | 'initiating';

  mediaStatus: {

    audio: boolean;

    video: boolean;

  };

  createdAt: Date;

  updatedAt: Date;

  expiresAt: Date;

}



const UserVideoCallSchema: Schema = new Schema({

  callerId: { type: String, required: true },

  recipientId: { type: String, required: true },

  status: { 

    type: String, 

    enum: ['pending', 'accepted', 'rejected', 'ended', 'initiating'], 

    default: 'pending' 

  },

  mediaStatus: {

    audio: { type: Boolean, default: true },

    video: { type: Boolean, default: true }

  },

  createdAt: { type: Date, default: Date.now },

  updatedAt: { type: Date, default: Date.now },

  expiresAt: { type: Date, default: () => new Date(Date.now() + 30000) } // 30 seconds timeout

});

// Add index for active calls cleanup
UserVideoCallSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });





export const UserVideoCallModel = mongoose.model<IUserVideoCall>('UserVideoCall', UserVideoCallSchema);



