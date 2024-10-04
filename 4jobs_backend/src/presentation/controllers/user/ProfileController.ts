import { inject, injectable } from 'inversify';
import { IUserRepository } from '../../../domain/interfaces/repositories/user/IUserRepository';
import TYPES from '../../../types';
import { Request, Response } from 'express';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async getUserProfile(req: Request, res: Response) {
    const userId = req.params.userId;
    try {
      const user = await this.userRepository.findByUserId(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user profile' });
    }
  }

  async updateUserProfile(req: Request, res: Response) {
    const userId = req.params.userId;
    const updateData = req.body;

    try {
      const updatedUser = await this.userRepository.update(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user profile' });
    }
  }

  async updateUserProjects(req: Request, res: Response) {
    const userId = req.params.userId;
    const { projects } = req.body;

    try {
      const updatedUser = await this.userRepository.update(userId, { projects });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user projects' });
    }
  }

  async updateUserCertificates(req: Request, res: Response) {
    const userId = req.params.userId;
    const { certificateDetails, certificateImages } = req.body;

    try {
      const certificates = certificateDetails.map((cert: any, index: number) => ({
        ...cert,
        image: certificateImages[index] || null,
      }));

      const updatedUser = await this.userRepository.update(userId, { certificates });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user certificates:', error);
      res.status(500).json({ message: 'Error updating user certificates' });
    }
  }


  async updateUserExperiences(req: Request, res: Response) {
    const userId = req.params.userId;
    const { experiences } = req.body;

    try {
      const updatedUser = await this.userRepository.update(userId, { experiences });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user experiences' });
    }
  }

  async updateUserResume(req: Request, res: Response) {
    const userId = req.params.userId;
    const { resume } = req.body;

    try {
      const updatedUser = await this.userRepository.update(userId, { resume });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: 'Error updating user resume' });
    }
  }
}