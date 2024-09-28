import { IRecruiterRepository } from "../../../domain/interfaces/repositories/recruiter/IRecruiterRepository";
import { injectable, inject } from "inversify";
import TYPES from "../../../types";
import { IRecruiter } from "../../../domain/entities/Recruiter";

@injectable()
export class GetRecruiterProfileUseCase {
  constructor(
    @inject(TYPES.IRecruiterRepository)
    private recruiterRepository: IRecruiterRepository
  ) {}

  async execute(id: string): Promise<IRecruiter | null> {
    const recruiter = await this.recruiterRepository.findRecruiterById(id);
    return recruiter;
  }
}
