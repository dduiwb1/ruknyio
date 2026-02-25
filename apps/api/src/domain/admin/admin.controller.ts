import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../core/common/guards/auth/jwt-auth.guard';
import { RolesGuard } from '../../core/common/guards/roles.guard';
import { Roles } from '../../infrastructure/security/decorators';
import { Role } from '@prisma/client';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/stats
   * Platform-wide statistics
   */
  @Get('stats')
  @ApiOperation({ summary: 'Get platform-wide statistics (Admin only)' })
  async getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  /**
   * GET /admin/recent-activity
   * Recent platform activity feed
   */
  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent platform activity (Admin only)' })
  async getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(limit ? parseInt(limit, 10) : 15);
  }

  /**
   * GET /admin/health
   * System health overview
   */
  @Get('health')
  @ApiOperation({ summary: 'Get system health status (Admin only)' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  /**
   * GET /admin/users
   * Paginated user list
   */
  @Get('users')
  @ApiOperation({ summary: 'Get paginated user list (Admin only)' })
  async getUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getRecentUsers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}
