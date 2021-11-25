import { Global, Module } from '@nestjs/common';

import { ApiConfigService } from './services/api-config.service';
import { EmailService } from './services/email.service';

@Global()
@Module({
  providers: [EmailService, ApiConfigService],
  imports: [],
  exports: [EmailService, ApiConfigService],
})
export class SharedModule {}
