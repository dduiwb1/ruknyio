import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const callbackUrl = request.query?.callback_url;

    // Pass the originating app URL through OAuth state parameter
    // so the callback handler can redirect back to the correct frontend
    if (callbackUrl) {
      return {
        state: Buffer.from(JSON.stringify({ callback_url: callbackUrl })).toString('base64'),
      };
    }
    return {};
  }
}
