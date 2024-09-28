import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { GetUserProfileUseCase } from "../../../application/usecases/user/GetUserProfileUseCase";
import { UpdateUserProfileUseCase } from "../../../application/usecases/user/UpdateUserProfileUseCase";

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.GetUserProfileUseCase)
    private getUserProfileUseCase: GetUserProfileUseCase,
    @inject(TYPES.UpdateUserProfileUseCase)
    private updateUserProfileUseCase: UpdateUserProfileUseCase
  ) {}
  async getUserProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const profile = await this.getUserProfileUseCase.execute(userId);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      if (profile.isBlocked) {
        throw new Error("User is blocked");
      }
      res.status(200).json(profile);
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      res.status(500).json({ error: "Error retrieving user profile" });
    }
  }

  async updateUserProfile(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const profileData: any = req.body;

      if (req.files && "profileImage" in req.files) {
        const file = (req.files["profileImage"] as Express.Multer.File[])[0];
        profileData.profileImage = `/uploads/user/profile/${file.filename}`;
      }

      const updatedProfile = await this.updateUserProfileUseCase.execute(
        userId,
        profileData
      );
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ error: "Error updating user profile" });
    }
  }

  async updateUserProjects(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { projects } = req.body;

      const updatedProfile = await this.updateUserProfileUseCase.execute(
        userId,
        { projects }
      );
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating user projects:", error);
      res.status(500).json({ error: "Error updating user projects" });
    }
  }

  async updateUserCertificates(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const files =
        (req.files?.["certificateImage"] as Express.Multer.File[]) || [];

      let certificateDetails;
      try {
        certificateDetails = JSON.parse(req.body.certificateDetails || "[]");
        if (!Array.isArray(certificateDetails)) {
          throw new Error("certificateDetails must be an array");
        }
      } catch (error) {
        console.error("Error parsing certificateDetails:", error);
        return res
          .status(400)
          .json({ error: "Invalid certificateDetails format" });
      }

      const certificates = certificateDetails.map(
        (details: any, index: number) => {
          const file = files[index]; // Map the correct file for each certificate
          return {
            ...details,
            imageUrl: file
              ? `/uploads/user/certificates/${file.filename}`
              : details.imageUrl,
          };
        }
      );

      const updatedProfile = await this.updateUserProfileUseCase.execute(
        userId,
        { certificates }
      );
      res
        .status(200)
        .json({ message: "Certificates updated successfully", updatedProfile });
    } catch (error) {
      console.error("Error updating user certificates:", error);
      res.status(500).json({ error: "Error updating user certificates" });
    }
  }

  async updateUserExperiences(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const { experiences } = req.body;

      const updatedProfile = await this.updateUserProfileUseCase.execute(
        userId,
        { experiences }
      );
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating user experiences:", error);
      res.status(500).json({ error: "Error updating user experiences" });
    }
  }

  async updateUserResume(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      if (!req.file) {
        return res.status(400).json({ error: "No resume file uploaded" });
      }

      const resumePath = `/uploads/user/resume/${req.file.filename}`;
      const updatedProfile = await this.updateUserProfileUseCase.execute(
        userId,
        { resume: resumePath }
      );
      res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Error updating user resume:", error);
      res.status(500).json({ error: "Error updating user resume" });
    }
  }
}
