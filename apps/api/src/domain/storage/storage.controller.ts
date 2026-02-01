import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  Headers,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiHeader,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/common/guards/auth/jwt-auth.guard';
import { StorageService } from './storage.service';
import { FileCategory } from '@prisma/client';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Get('usage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get storage usage statistics' })
  @ApiResponse({
    status: 200,
    description: 'Storage usage retrieved successfully',
  })
  async getStorageUsage(@Request() req) {
    return this.storageService.getStorageUsage(req.user.id);
  }

  @Get('files')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list of user files (or deleted-only for trash)' })
  @ApiQuery({ name: 'category', required: false, enum: FileCategory })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'deletedOnly', required: false, type: Boolean, description: 'سلة المهملات' })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async getUserFiles(
    @Request() req,
    @Query('category') category?: FileCategory,
    @Query('entityId') entityId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('deletedOnly') deletedOnly?: string,
  ) {
    return this.storageService.getUserFiles(req.user.id, {
      category,
      entityId,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      deletedOnly: deletedOnly === 'true' || deletedOnly === '1',
    });
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile avatar to S3' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  async uploadAvatar(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const key = await this.storageService.uploadAvatar(req.user.id, file);
    const url = await this.storageService.getPresignedUrl(key);
    return { key, url };
  }

  @Post('cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload cover image to S3' })
  @ApiResponse({ status: 200, description: 'Cover uploaded successfully' })
  async uploadCover(@Request() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const key = await this.storageService.uploadCover(req.user.id, file);
    const url = await this.storageService.getPresignedUrl(key);
    return { key, url };
  }

  @Post('forms/:formId/cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload form cover image' })
  @ApiParam({ name: 'formId', description: 'Form ID' })
  @ApiResponse({ status: 200, description: 'Form cover uploaded successfully' })
  async uploadFormCover(
    @Request() req,
    @Param('formId') formId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const key = await this.storageService.uploadFormCover(
      req.user.id,
      formId,
      file,
    );
    const url = await this.storageService.getPresignedUrl(key);
    return { key, url };
  }

  @Post('events/:eventId/cover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload event cover image' })
  @ApiParam({ name: 'eventId', description: 'Event ID' })
  @ApiResponse({
    status: 200,
    description: 'Event cover uploaded successfully',
  })
  async uploadEventCover(
    @Request() req,
    @Param('eventId') eventId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const key = await this.storageService.uploadEventCover(
      req.user.id,
      eventId,
      file,
    );
    const url = await this.storageService.getPresignedUrl(key);
    return { key, url };
  }

  @Post('products/:productId/image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product image uploaded successfully',
  })
  async uploadProductImage(
    @Request() req,
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const key = await this.storageService.uploadProductImage(
      req.user.id,
      productId,
      file,
    );
    const url = await this.storageService.getPresignedUrl(key);
    return { key, url };
  }

  @Delete('files/:fileId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف ناعم: الملف يبقى 30 يوم ثم يُحذف نهائياً' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Request() req, @Param('fileId') fileId: string) {
    await this.storageService.deleteFile(req.user.id, fileId);
    return { message: 'تم نقل الملف إلى سلة المهملات (يُحذف نهائياً بعد 30 يوم)' };
  }

  @Post('files/:fileId/restore')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'استرداد ملف من سلة المهملات' })
  @ApiParam({ name: 'fileId', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File restored successfully' })
  async restoreFile(@Request() req, @Param('fileId') fileId: string) {
    await this.storageService.restoreFile(req.user.id, fileId);
    return { message: 'تم استرداد الملف بنجاح' };
  }

  @Delete('entities/:entityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete all files for an entity (form, event, product)',
  })
  @ApiParam({ name: 'entityId', description: 'Entity ID' })
  @ApiResponse({ status: 200, description: 'Files deleted successfully' })
  async deleteEntityFiles(@Request() req, @Param('entityId') entityId: string) {
    await this.storageService.deleteFilesByEntity(req.user.id, entityId);
    return { message: 'Files deleted successfully' };
  }

  /**
   * استدعاء من Cron خارجي (مزود الاستضافة) إذا Nest Cron لا يعمل (مثلاً حاويات تنام).
   * يتطلب رأس X-Cron-Secret مطابقاً لـ CRON_SECRET في البيئة.
   */
  @Post('cron/purge-expired')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Purge expired deleted files (for external cron)',
    description: 'Requires X-Cron-Secret header. Use when in-process cron is unreliable.',
  })
  @ApiHeader({ name: 'X-Cron-Secret', required: true })
  @ApiResponse({ status: 200, description: 'Purge completed' })
  @ApiResponse({ status: 401, description: 'Invalid or missing X-Cron-Secret' })
  async cronPurgeExpired(@Headers('x-cron-secret') secret: string) {
    const expected = this.configService.get<string>('CRON_SECRET');
    if (!expected || secret !== expected) {
      throw new UnauthorizedException('Invalid or missing X-Cron-Secret');
    }
    return this.storageService.purgeExpiredDeletedFiles();
  }
}
