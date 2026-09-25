import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilesService } from 'src/files/files.service';

type User = {
  id: number;
  username: string;
};

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private fileService: FilesService) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check file ownership for routes like /GET /files/:id
    // TODO: implement
    const request = context
      .switchToHttp()
      .getRequest<{ user: User; params: { id: number } }>();

    const fileId = request.params.id;
    const { ownerId } = await this.fileService.getOwner(fileId);

    console.log(ownerId);
    if (!ownerId) {
      throw new NotFoundException();
    }
    // const owner = file.ownerId;

    return request.user.id == ownerId;
  }
}
