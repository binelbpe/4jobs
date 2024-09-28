import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IRecruiter } from "../../../domain/entities/Recruiter";

@injectable()
export class UpdateRecruiterUseCase {
  constructor(
    @inject(TYPES.IRecruiterRepository)
    private recruiterRepository: IRecruiterRepository
  ) {}

  async execute(id: string, updates: Partial<IRecruiter>): Promise<IRecruiter | null> {
    const updatedRecruiter = await this.recruiterRepository.updateRecruiter(id, updates);
    return updatedRecruiter;
  }
}
