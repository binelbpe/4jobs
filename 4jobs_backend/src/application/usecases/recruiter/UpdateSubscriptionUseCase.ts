import { inject, injectable } from 'inversify';
import TYPES from '../../../types';
import { IRecruiterRepository } from '../../../domain/interfaces/repositories/recruiter/IRecruiterRepository';

@injectable()
export class UpdateSubscriptionUseCase {
  constructor(
    @inject(TYPES.IRecruiterRepository) private recruiterRepository: IRecruiterRepository,
  ) {}

  async execute(recruiterId: string, subscriptionData: any) {
    const subscriptionStartDate = new Date();
    const updatedSubscriptionData = {
      ...subscriptionData,
      subscriptionStartDate
    };
    const updatedRecruiter = await this.recruiterRepository.updateSubscription(recruiterId, updatedSubscriptionData);
    return updatedRecruiter;
  }
}
